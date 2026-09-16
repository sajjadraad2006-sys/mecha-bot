import { ModelHealthState, TaskType, WorkersAiErrorCode } from './interfaces.js';

export interface ModelEntry {
  modelId: string;
  isFreeTier: boolean;
  state: ModelHealthState;
  cooldownUntilMs?: number | undefined;
  lastError?: string | undefined;
  consecutiveFailures: number;
}

export class ModelHealthRegistry {
  public static readonly AI_MODEL_PRIMARY =
    process.env.AI_MODEL_PRIMARY || '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b';
  public static readonly AI_MODEL_SECONDARY =
    process.env.AI_MODEL_SECONDARY || '@cf/qwen/qwen2.5-7b-instruct';
  public static readonly AI_MODEL_FALLBACK =
    process.env.AI_MODEL_FALLBACK || '@cf/meta/llama-3.1-8b-instruct';

  private models = new Map<string, ModelEntry>();
  private globalQuotaExhausted = false;

  constructor() {
    this.registerModel(ModelHealthRegistry.AI_MODEL_PRIMARY);
    this.registerModel(ModelHealthRegistry.AI_MODEL_SECONDARY);
    this.registerModel(ModelHealthRegistry.AI_MODEL_FALLBACK);
  }

  public registerModel(modelId: string, isFreeTier = true): void {
    if (!this.models.has(modelId)) {
      this.models.set(modelId, {
        modelId,
        isFreeTier,
        state: 'HEALTHY',
        consecutiveFailures: 0,
      });
    }
  }

  public getModel(modelId: string): ModelEntry | undefined {
    const entry = this.models.get(modelId);
    if (!entry) return undefined;

    // Check if cooldown has expired
    if (
      entry.state === 'COOLDOWN' &&
      entry.cooldownUntilMs &&
      Date.now() >= entry.cooldownUntilMs
    ) {
      entry.state = 'HEALTHY';
      entry.cooldownUntilMs = undefined;
      entry.consecutiveFailures = 0;
    }

    return entry;
  }

  public isGlobalQuotaExhausted(): boolean {
    return this.globalQuotaExhausted;
  }

  public setGlobalQuotaExhausted(exhausted: boolean): void {
    this.globalQuotaExhausted = exhausted;
  }

  /**
   * Records provider/API error and updates model health state machine.
   */
  public recordError(modelId: string, errorCode: number | string, errorMsg: string): void {
    const entry = this.models.get(modelId);
    if (!entry) return;

    entry.lastError = errorMsg;
    entry.consecutiveFailures += 1;

    const numericCode = typeof errorCode === 'number' ? errorCode : parseInt(errorCode, 10);

    switch (numericCode) {
      case WorkersAiErrorCode.QUOTA_EXHAUSTED:
        // Cloudflare 3036: Quota exhausted for the entire account for today.
        this.globalQuotaExhausted = true;
        entry.state = 'QUOTA_EXHAUSTED';
        break;

      case WorkersAiErrorCode.OUT_OF_CAPACITY:
        // Cloudflare 3040: Out of capacity at current data center.
        // Put model in cooldown for 5 minutes.
        entry.state = 'COOLDOWN';
        entry.cooldownUntilMs = Date.now() + 5 * 60 * 1000;
        break;

      case WorkersAiErrorCode.PAID_REQUIRED:
        // Cloudflare 5035: Requires paid subscription.
        // Under zero-cost mode, permanently lock this model out.
        entry.state = 'PAID_ONLY';
        break;

      case WorkersAiErrorCode.INVALID_MODEL:
      case WorkersAiErrorCode.INVALID_MODEL_ALT:
        // Model invalid / retired
        entry.state = 'DEGRADED';
        break;

      case WorkersAiErrorCode.TIMEOUT:
        if (entry.consecutiveFailures >= 2) {
          entry.state = 'COOLDOWN';
          entry.cooldownUntilMs = Date.now() + 2 * 60 * 1000;
        } else {
          entry.state = 'DEGRADED';
        }
        break;

      default:
        if (entry.consecutiveFailures >= 3) {
          entry.state = 'COOLDOWN';
          entry.cooldownUntilMs = Date.now() + 5 * 60 * 1000;
        } else {
          entry.state = 'DEGRADED';
        }
    }
  }

  public recordSuccess(modelId: string): void {
    const entry = this.models.get(modelId);
    if (entry) {
      entry.state = 'HEALTHY';
      entry.consecutiveFailures = 0;
      entry.lastError = undefined;
    }
  }

  /**
   * Selects an eligible healthy model based on task requirements and current health.
   */
  public selectModel(taskType: TaskType = 'CONCEPT_EXPLANATION'): string | null {
    if (this.globalQuotaExhausted) {
      return null;
    }

    const primary = this.getModel(ModelHealthRegistry.AI_MODEL_PRIMARY);
    const secondary = this.getModel(ModelHealthRegistry.AI_MODEL_SECONDARY);
    const fallback = this.getModel(ModelHealthRegistry.AI_MODEL_FALLBACK);

    // Prefer lighter model for simple tasks
    if (taskType === 'SIMPLE_EXPLANATION') {
      if (secondary && secondary.state === 'HEALTHY') return secondary.modelId;
      if (primary && primary.state === 'HEALTHY') return primary.modelId;
      if (fallback && fallback.state === 'HEALTHY') return fallback.modelId;
    }

    // Default: prioritize primary, then secondary, then fallback
    if (primary && primary.state === 'HEALTHY') return primary.modelId;
    if (secondary && secondary.state === 'HEALTHY') return secondary.modelId;
    if (fallback && fallback.state === 'HEALTHY') return fallback.modelId;

    // Try degraded (still possible to retry)
    if (primary && primary.state === 'DEGRADED') return primary.modelId;
    if (secondary && secondary.state === 'DEGRADED') return secondary.modelId;
    if (fallback && fallback.state === 'DEGRADED') return fallback.modelId;

    return null; // All models in cooldown, paid-only, or quota exhausted
  }
}
