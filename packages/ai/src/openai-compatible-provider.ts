import { z } from 'zod';
import {
  AIModelCapabilities,
  AIProvider,
  AIRequestOptions,
  WorkersAiErrorCode,
} from './interfaces.js';
import { ProviderError } from '@mecha-bot/shared';

export interface OpenAiCompatibleConfig {
  id?: string | undefined;
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
  customHeaders?: Record<string, string> | undefined;
}

export class OpenAiCompatibleProvider implements AIProvider {
  public readonly id: string;
  public readonly capabilities: AIModelCapabilities;

  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;
  private customHeaders?: Record<string, string> | undefined;

  constructor(config: OpenAiCompatibleConfig) {
    this.id = config.id || 'openai-compatible-provider';
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.defaultModel = config.defaultModel;
    this.customHeaders = config.customHeaders;
    this.capabilities = {
      supportsStructuredOutput: true,
      maxContextTokens: 131072,
      isFreeTier: true,
    };
  }

  public async healthCheck(): Promise<boolean> {
    return Boolean(
      this.apiKey &&
      this.apiKey.trim().length > 0 &&
      this.baseUrl &&
      this.baseUrl.trim().length > 0,
    );
  }

  public async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    options?: AIRequestOptions,
  ): Promise<T> {
    // Model ID compatibility: if a Cloudflare model ID (e.g. starting with @cf/) is passed,
    // bypass it and use this provider's default model.
    let model = this.defaultModel;
    if (options?.modelId && !options.modelId.startsWith('@cf/')) {
      model = options.modelId;
    }

    const url = `${this.baseUrl}/chat/completions`;
    const timeoutMs = options?.timeoutMs ?? 15000;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...this.customHeaders,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: options?.temperature ?? 0.2,
          max_tokens: options?.maxTokens ?? 2048,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        const status = response.status;

        // Rate limit / Quota reached
        if (status === 429) {
          const err = new ProviderError(
            this.id,
            `${this.id} rate limit or daily quota reached (HTTP 429): ${errorText}`,
            false,
          );
          (err as unknown as { code: number }).code = WorkersAiErrorCode.QUOTA_EXHAUSTED;
          throw err;
        }

        const err = new ProviderError(
          this.id,
          `${this.id} HTTP ${status}: ${errorText}`,
          status >= 500,
        );
        throw err;
      }

      const json = (await response.json()) as {
        choices?: Array<{
          message?: {
            content?: string | null;
          };
          finish_reason?: string;
        }>;
      };

      const content = json.choices?.[0]?.message?.content;
      if (!content) {
        throw new ProviderError(this.id, `${this.id} returned an empty completion response`, false);
      }

      // Strip markdown code fences if model returned them
      const cleaned = content
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(cleaned);
      } catch (parseErr) {
        throw new ProviderError(
          this.id,
          `Failed to parse JSON response from ${this.id} (${model}): ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`,
          false,
        );
      }

      const validationResult = schema.safeParse(parsedJson);
      if (!validationResult.success) {
        throw new ProviderError(
          this.id,
          `${this.id} structured output failed schema validation: ${validationResult.error.message}`,
          false,
        );
      }

      return validationResult.data;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof ProviderError) {
        throw err;
      }

      if (err instanceof Error && err.name === 'AbortError') {
        const timeoutErr = new ProviderError(
          this.id,
          `${this.id} request timed out after ${timeoutMs}ms`,
          true,
        );
        (timeoutErr as unknown as { code: number }).code = WorkersAiErrorCode.TIMEOUT;
        throw timeoutErr;
      }

      throw new ProviderError(
        this.id,
        `Unexpected error in ${this.id}: ${err instanceof Error ? err.message : String(err)}`,
        true,
      );
    }
  }
}
