import { z } from 'zod';
import {
  AIModelCapabilities,
  AIProvider,
  AIRequestOptions,
  WorkersAiErrorCode,
} from './interfaces.js';
import { ProviderError } from '@mecha-bot/shared';

export interface WorkersAiConfig {
  accountId: string;
  apiToken: string;
  baseUrl?: string;
}

export class WorkersAiProvider implements AIProvider {
  public readonly id: string;
  public readonly capabilities: AIModelCapabilities;

  private accountId: string;
  private apiToken: string;
  private baseUrl: string;

  constructor(config: WorkersAiConfig, id = 'workers-ai-primary') {
    this.id = id;
    this.accountId = config.accountId;
    this.apiToken = config.apiToken;
    this.baseUrl =
      config.baseUrl || `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/ai/run`;
    this.capabilities = {
      supportsStructuredOutput: true,
      maxContextTokens: 8192,
      isFreeTier: true,
    };
  }

  public async healthCheck(): Promise<boolean> {
    return Boolean(this.accountId && this.apiToken);
  }

  public async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    options?: AIRequestOptions,
  ): Promise<T> {
    const modelId = options?.modelId || '@cf/meta/llama-3.1-8b-instruct';
    const url = `${this.baseUrl}/${modelId}`;
    const timeoutMs = options?.timeoutMs ?? 15000;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          temperature: options?.temperature ?? 0.2,
          max_tokens: options?.maxTokens ?? 1024,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        const status = response.status;

        // Parse Cloudflare error codes
        if (status === 429) {
          if (errorText.includes('3036') || errorText.toLowerCase().includes('daily allocation')) {
            const err = new ProviderError(
              this.id,
              'Cloudflare daily quota exhausted (3036)',
              false,
            );
            (err as unknown as { code: number }).code = WorkersAiErrorCode.QUOTA_EXHAUSTED;
            throw err;
          }
          if (errorText.includes('3040') || errorText.toLowerCase().includes('capacity')) {
            const err = new ProviderError(this.id, 'Cloudflare model out of capacity (3040)', true);
            (err as unknown as { code: number }).code = WorkersAiErrorCode.OUT_OF_CAPACITY;
            throw err;
          }
        }

        if (
          status === 403 &&
          (errorText.includes('5035') || errorText.toLowerCase().includes('paid'))
        ) {
          const err = new ProviderError(
            this.id,
            'Cloudflare model requires paid plan (5035)',
            false,
          );
          (err as unknown as { code: number }).code = WorkersAiErrorCode.PAID_REQUIRED;
          throw err;
        }

        const err = new ProviderError(
          this.id,
          `Cloudflare Workers AI HTTP ${status}: ${errorText}`,
          status >= 500,
        );
        throw err;
      }

      const json = (await response.json()) as {
        result?: { response?: string | object } | string | object;
        success?: boolean;
        errors?: unknown[];
      };

      // Extract generated content
      let contentString = '';
      if (typeof json.result === 'string') {
        contentString = json.result;
      } else if (json.result && typeof json.result === 'object' && 'response' in json.result) {
        contentString =
          typeof json.result.response === 'string'
            ? json.result.response
            : JSON.stringify(json.result.response);
      } else {
        contentString = JSON.stringify(json.result ?? json);
      }

      // Parse and validate with Zod
      let parsedJson: unknown;
      try {
        // Strip markdown code fences if model returned them
        const cleaned = contentString
          .replace(/^```json\s*/i, '')
          .replace(/\s*```$/, '')
          .trim();
        parsedJson = JSON.parse(cleaned);
      } catch (parseErr) {
        throw new ProviderError(
          this.id,
          `Failed to parse JSON response from ${modelId}: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`,
          false,
        );
      }

      const validation = schema.safeParse(parsedJson);
      if (!validation.success) {
        throw new ProviderError(
          this.id,
          `Structured response schema validation failed: ${validation.error.message}`,
          false,
          validation.error.issues,
        );
      }

      return validation.data;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof Error && err.name === 'AbortError') {
        const timeoutErr = new ProviderError(
          this.id,
          `Inference timed out after ${timeoutMs}ms`,
          true,
        );
        (timeoutErr as unknown as { code: number }).code = WorkersAiErrorCode.TIMEOUT;
        throw timeoutErr;
      }

      throw err;
    }
  }
}
