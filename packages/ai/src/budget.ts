import { WorkersAiErrorCode } from './interfaces.js';
import type { BudgetStats } from './schemas.js';

export type BudgetState = 'HEALTHY' | 'CONSERVATIVE' | 'EXHAUSTED';

export class BudgetManager {
  // Hard zero-cost invariants
  public readonly ALLOW_PAID_AI = false as const;
  public readonly ALLOW_PAID_STORAGE = false as const;
  public readonly ALLOW_BILLING_FALLBACK = false as const;

  // Cloudflare Free daily neuron allocation
  public static readonly DAILY_NEURON_LIMIT = 10000;
  public static readonly CONSERVATIVE_NEURON_THRESHOLD = 7000;

  private currentDate: string;
  private requestsToday = 0;
  private estimatedNeuronsToday = 0;
  private quotaExhausted = false;

  constructor(initialDate?: string) {
    this.currentDate = initialDate ?? this.getTodayDateString();
  }

  private getTodayDateString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private maybeResetDaily(): void {
    const today = this.getTodayDateString();
    if (today !== this.currentDate) {
      this.currentDate = today;
      this.requestsToday = 0;
      this.estimatedNeuronsToday = 0;
      this.quotaExhausted = false;
    }
  }

  public getBudgetState(): BudgetState {
    this.maybeResetDaily();

    if (this.quotaExhausted || this.estimatedNeuronsToday >= BudgetManager.DAILY_NEURON_LIMIT) {
      return 'EXHAUSTED';
    }

    if (this.estimatedNeuronsToday >= BudgetManager.CONSERVATIVE_NEURON_THRESHOLD) {
      return 'CONSERVATIVE';
    }

    return 'HEALTHY';
  }

  public canInvokeAi(): boolean {
    return this.getBudgetState() !== 'EXHAUSTED';
  }

  public recordRequest(estimatedNeurons = 50): void {
    this.maybeResetDaily();
    this.requestsToday += 1;
    this.estimatedNeuronsToday += estimatedNeurons;

    if (this.estimatedNeuronsToday >= BudgetManager.DAILY_NEURON_LIMIT) {
      this.quotaExhausted = true;
    }
  }

  public recordError(errorCode: number): void {
    this.maybeResetDaily();
    if (errorCode === WorkersAiErrorCode.QUOTA_EXHAUSTED) {
      // Cloudflare 3036: Daily quota exhausted. Fail-closed immediately for the rest of the day.
      this.quotaExhausted = true;
      this.estimatedNeuronsToday = BudgetManager.DAILY_NEURON_LIMIT;
    }
  }

  public markQuotaExhausted(): void {
    this.maybeResetDaily();
    this.quotaExhausted = true;
  }

  public resetForTesting(): void {
    this.currentDate = this.getTodayDateString();
    this.requestsToday = 0;
    this.estimatedNeuronsToday = 0;
    this.quotaExhausted = false;
  }

  public getStats(): BudgetStats {
    this.maybeResetDaily();
    return {
      date: this.currentDate,
      requestsToday: this.requestsToday,
      estimatedNeuronsToday: this.estimatedNeuronsToday,
      isExhausted: this.quotaExhausted,
      allowPaidAi: false,
      allowPaidStorage: false,
      allowBillingFallback: false,
    };
  }
}
