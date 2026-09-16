import { z } from 'zod';
import { AIProvider, AIRequestOptions, TaskType, WorkersAiErrorCode } from './interfaces.js';
import { ProviderError } from '@mecha-bot/shared';
import { ModelHealthRegistry } from './model-registry.js';
import { BudgetManager } from './budget.js';

export class AIRouter {
  private providers: AIProvider[];
  private healthRegistry: ModelHealthRegistry;
  private budgetManager: BudgetManager;

  constructor(
    primary: AIProvider,
    fallbacks: AIProvider[] = [],
    healthRegistry?: ModelHealthRegistry | undefined,
    budgetManager?: BudgetManager | undefined,
  ) {
    this.providers = [primary, ...fallbacks];
    this.healthRegistry = healthRegistry ?? new ModelHealthRegistry();
    this.budgetManager = budgetManager ?? new BudgetManager();
  }

  public getHealthRegistry(): ModelHealthRegistry {
    return this.healthRegistry;
  }

  public getBudgetManager(): BudgetManager {
    return this.budgetManager;
  }

  public getPrimaryProvider(): AIProvider {
    const primary = this.providers[0];
    if (!primary) {
      throw new Error('AIRouter has no registered providers');
    }
    return primary;
  }

  /**
   * Executes structured output generation with task routing, model health checking,
   * quota enforcement, bounded retries, and failover.
   */
  public async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    options?: AIRequestOptions | undefined,
  ): Promise<{ result: T; providerId: string; modelId?: string | undefined }> {
    // 1. Hard zero-cost check
    if (!this.budgetManager.canInvokeAi() || this.healthRegistry.isGlobalQuotaExhausted()) {
      throw new ProviderError(
        'AIRouter',
        'AI daily neuron quota is exhausted (Error 3036). Zero-cost policy enforces fail-closed mode.',
        false,
        { code: WorkersAiErrorCode.QUOTA_EXHAUSTED },
      );
    }

    const taskType: TaskType = options?.taskType ?? 'CONCEPT_EXPLANATION';
    let chosenModelId = this.healthRegistry.selectModel(taskType);

    let lastError: unknown = null;

    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i]!;

      // On failover (i > 0), select failover model
      if (i > 0) {
        chosenModelId =
          this.healthRegistry.selectModel('FAILOVER') ?? ModelHealthRegistry.AI_MODEL_SECONDARY;
      }

      try {
        const isHealthy = await provider.healthCheck();
        if (!isHealthy) continue;

        // Record request budget
        this.budgetManager.recordRequest();

        const requestOptions: AIRequestOptions = {
          ...options,
          modelId: chosenModelId ?? options?.modelId,
        };

        const result = await provider.generateStructured(prompt, schema, requestOptions);

        // Record success only for the provider/model that actually succeeded
        if (chosenModelId) {
          this.healthRegistry.recordSuccess(chosenModelId);
        }

        return {
          result,
          providerId: provider.id,
          modelId: chosenModelId ?? undefined,
        };
      } catch (error: unknown) {
        lastError = error;

        // Parse potential error codes
        const errObj = error as {
          code?: number | string;
          details?: { code?: number | string };
          message?: string;
        };
        const rawCode = errObj.code ?? errObj.details?.code;
        const codeNum = typeof rawCode === 'number' ? rawCode : parseInt(String(rawCode), 10);
        const errorMsg = error instanceof Error ? error.message : String(error);

        if (chosenModelId && !isNaN(codeNum)) {
          this.healthRegistry.recordError(chosenModelId, codeNum, errorMsg);
          this.budgetManager.recordError(codeNum);
        }

        // Error 3036: Global quota exhausted. Stop failover immediately!
        if (codeNum === WorkersAiErrorCode.QUOTA_EXHAUSTED) {
          this.budgetManager.markQuotaExhausted();
          this.healthRegistry.setGlobalQuotaExhausted(true);
          throw new ProviderError(
            provider.id,
            'Daily Cloudflare Workers AI quota exhausted (3036). Global fail-closed mode engaged.',
            false,
            { code: 3036 },
          );
        }

        // Error 5035: Paid required. Never retry on paid!
        if (codeNum === WorkersAiErrorCode.PAID_REQUIRED) {
          if (chosenModelId) {
            this.healthRegistry.recordError(chosenModelId, 5035, 'Requires paid plan');
          }
          // Continue to next free fallback
          continue;
        }

        // If error is a non-retryable validation or programming error, don't cascade needlessly
        if (error instanceof ProviderError && !error.isRetryable) {
          throw error;
        }

        // Otherwise continue loop to try fallback provider
      }
    }

    throw new ProviderError(
      'AIRouter',
      `All AI providers or models failed: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
      false,
    );
  }
}
