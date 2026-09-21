import { z } from 'zod';
import {
  AIModelCapabilities,
  AIProvider,
  AIRequestOptions,
  WorkersAiErrorCode,
} from './interfaces.js';
import { ProviderError } from '@mecha-bot/shared';

export class FakeAIProvider implements AIProvider {
  public readonly id: string;
  public readonly capabilities: AIModelCapabilities;
  private isHealthy = true;
  private mockResponse: unknown = null;
  private simulatedErrorCode: WorkersAiErrorCode | null = null;
  private simulatedErrorMessage: string | null = null;
  private shouldReturnMalformedJson = false;

  constructor(id = 'fake-ai-provider', isFreeTier = true) {
    this.id = id;
    this.capabilities = {
      supportsStructuredOutput: true,
      maxContextTokens: 8192,
      isFreeTier,
    };
  }

  public setHealthy(healthy: boolean): void {
    this.isHealthy = healthy;
  }

  public setShouldFail(fail: boolean, code?: WorkersAiErrorCode, message?: string): void {
    if (fail) {
      this.simulatedErrorCode = code ?? WorkersAiErrorCode.TIMEOUT;
      this.simulatedErrorMessage = message ?? 'Simulated provider error';
    } else {
      this.simulatedErrorCode = null;
      this.simulatedErrorMessage = null;
    }
  }

  public setSimulateQuotaExhausted(message?: string): void {
    this.simulatedErrorCode = WorkersAiErrorCode.QUOTA_EXHAUSTED;
    this.simulatedErrorMessage = message ?? 'Cloudflare daily quota exhausted (3036)';
  }

  public setSimulateOutOfCapacity(message?: string): void {
    this.simulatedErrorCode = WorkersAiErrorCode.OUT_OF_CAPACITY;
    this.simulatedErrorMessage = message ?? 'Cloudflare out of capacity (3040)';
  }

  public setSimulatePaidRequired(message?: string): void {
    this.simulatedErrorCode = WorkersAiErrorCode.PAID_REQUIRED;
    this.simulatedErrorMessage = message ?? 'Cloudflare requires paid plan (5035)';
  }

  public setSimulateTimeout(message?: string): void {
    this.simulatedErrorCode = WorkersAiErrorCode.TIMEOUT;
    this.simulatedErrorMessage = message ?? 'Inference timed out (3007)';
  }

  public setMalformedJson(malformed: boolean): void {
    this.shouldReturnMalformedJson = malformed;
  }

  public setMockResponse(response: unknown): void {
    this.mockResponse = response;
  }

  public async healthCheck(): Promise<boolean> {
    return this.isHealthy;
  }

  public async generateStructured<T>(
    _prompt: string,
    schema: z.ZodType<T>,
    _options?: AIRequestOptions,
  ): Promise<T> {
    if (!this.isHealthy) {
      throw new ProviderError(this.id, 'Provider reported unhealthy status', false);
    }

    if (this.simulatedErrorCode !== null) {
      const isRetryable =
        this.simulatedErrorCode === WorkersAiErrorCode.OUT_OF_CAPACITY ||
        this.simulatedErrorCode === WorkersAiErrorCode.TIMEOUT;

      const err = new ProviderError(
        this.id,
        this.simulatedErrorMessage || `Simulated error ${this.simulatedErrorCode}`,
        isRetryable,
      );
      (err as unknown as { code: number }).code = this.simulatedErrorCode;
      throw err;
    }

    if (this.shouldReturnMalformedJson) {
      throw new ProviderError(
        this.id,
        'Failed to parse JSON response: Unexpected token < in JSON at position 0',
        false,
      );
    }

    const payload = this.mockResponse ?? {
      intent: 'GENERAL',
      courseCode: 'TEST101',
      topic: 'هندسة الميكاترونكس — المفاهيم والأسس',
      answer:
        'الميكاترونكس هو تكامل متقدم يجمع بين الهندسة الميكانيكية، الإلكترونيات، وأنظمة التحكم الذكية والبرمجة. لدراسة أي مسألة هندسية، نقوم بتحليل مخطط الجسم الحر وتطبيق معادلات الاتزان والحركة وقوانين الدوائر الكهربائية بدقة.',
      equations: ['tau = mu * (du/dy)', 'Sigma F = m * a', 'V = I * R'],
      sourceRefs: [
        {
          sourceId: 'src_uob_mct_guide',
          page: 1,
          title: 'دليل منهاج هندسة الميكاترونكس — جامعة البصرة',
          authority: 'OFFICIAL_DEPARTMENT',
        },
      ],
      confidence: 'HIGH',
      assumptions: ['تطبيق القوانين المنهجية المعتمدة في جامعة البصرة'],
      needsClarification: false,
      suggestedClarifications: [],
    };

    const parseResult = schema.safeParse(payload);
    if (!parseResult.success) {
      throw new ProviderError(
        this.id,
        `Structured output validation failed: ${parseResult.error.message}`,
        false,
        parseResult.error.issues,
      );
    }

    return parseResult.data;
  }
}
