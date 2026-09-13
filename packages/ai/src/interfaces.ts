import { z } from 'zod';

export interface AIModelCapabilities {
  supportsStructuredOutput: boolean;
  maxContextTokens: number;
  isFreeTier: boolean;
}

export interface AIRequestOptions {
  temperature?: number;
  maxTokens?: number;
  context?: Record<string, unknown>;
}

export interface AIProvider {
  readonly id: string;
  readonly capabilities: AIModelCapabilities;
  healthCheck(): Promise<boolean>;
  generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    options?: AIRequestOptions,
  ): Promise<T>;
}
