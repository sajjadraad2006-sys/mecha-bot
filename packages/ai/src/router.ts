import { z } from 'zod';
import { AIProvider, AIRequestOptions } from './interfaces.js';
import { ProviderError } from '@mecha-bot/shared';

export class AIRouter {
  private providers: AIProvider[];

  constructor(primary: AIProvider, fallbacks: AIProvider[] = []) {
    this.providers = [primary, ...fallbacks];
  }

  getPrimaryProvider(): AIProvider {
    const primary = this.providers[0];
    if (!primary) {
      throw new Error('AIRouter has no registered providers');
    }
    return primary;
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    options?: AIRequestOptions,
  ): Promise<{ result: T; providerId: string }> {
    let lastError: unknown = null;

    for (const provider of this.providers) {
      try {
        const isHealthy = await provider.healthCheck();
        if (!isHealthy) continue;

        const result = await provider.generateStructured(prompt, schema, options);
        return { result, providerId: provider.id };
      } catch (error) {
        lastError = error;
        // If error is non-retryable programming/schema error, don't cascade needlessly
        if (error instanceof ProviderError && !error.isRetryable) {
          throw error;
        }
        // Otherwise attempt next fallback
      }
    }

    throw new ProviderError(
      'AIRouter',
      `All AI providers failed: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
      false,
    );
  }
}
