import { z } from 'zod';
import { AIProvider, AIModelCapabilities, AIRequestOptions } from './interfaces.js';
import { ProviderError } from '@mecha-bot/shared';

export class FakeAIProvider implements AIProvider {
  readonly id: string;
  readonly capabilities: AIModelCapabilities;
  private isHealthy = true;
  private mockResponse: unknown = null;
  private shouldFail = false;

  constructor(id = 'fake-ai-provider') {
    this.id = id;
    this.capabilities = {
      supportsStructuredOutput: true,
      maxContextTokens: 8192,
      isFreeTier: true,
    };
  }

  setHealthy(healthy: boolean): void {
    this.isHealthy = healthy;
  }

  setShouldFail(fail: boolean): void {
    this.shouldFail = fail;
  }

  setMockResponse(response: unknown): void {
    this.mockResponse = response;
  }

  async healthCheck(): Promise<boolean> {
    return this.isHealthy;
  }

  async generateStructured<T>(
    _prompt: string,
    schema: z.ZodType<T>,
    _options?: AIRequestOptions,
  ): Promise<T> {
    if (this.shouldFail) {
      throw new ProviderError(this.id, 'Simulated provider outage or rate limit', true);
    }

    if (!this.isHealthy) {
      throw new ProviderError(this.id, 'Provider reported unhealthy status', false);
    }

    const payload = this.mockResponse ?? {
      intent: 'GENERAL',
      courseCode: 'TEST101',
      topic: 'Introduction',
      answer: 'Synthetic test explanation for academic foundation.',
      equations: ['E = mc^2'],
      sourceRefs: [
        {
          sourceId: 'src_test101_guide',
          page: 12,
          title: 'Synthetic Test Guide',
        },
      ],
      confidence: 'HIGH',
      assumptions: ['Assuming test context'],
      needsClarification: false,
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
