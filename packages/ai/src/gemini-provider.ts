import { z } from 'zod';
import {
  AIModelCapabilities,
  AIProvider,
  AIRequestOptions,
  WorkersAiErrorCode,
} from './interfaces.js';
import { ProviderError } from '@mecha-bot/shared';

export interface GeminiProviderConfig {
  apiKey: string;
  model?: string | undefined;
  baseUrl?: string | undefined;
}

export class GeminiProvider implements AIProvider {
  public readonly id = 'gemini-provider';
  public readonly capabilities: AIModelCapabilities;

  private apiKey: string;
  private defaultModel: string;
  private baseUrl: string;

  constructor(config: GeminiProviderConfig) {
    this.apiKey = config.apiKey;
    this.defaultModel = config.model || 'gemini-2.0-flash';
    this.baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta/models';
    this.capabilities = {
      supportsStructuredOutput: true,
      maxContextTokens: 1048576,
      isFreeTier: true,
    };
  }

  public async healthCheck(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    options?: AIRequestOptions,
  ): Promise<T> {
    // Model ID compatibility: if an incompatible model ID (e.g. Cloudflare @cf/ or slash-based ID)
    // is passed by AIRouter, gracefully bypass it and use this provider's default model.
    let model = this.defaultModel;
    if (options?.modelId && !options.modelId.startsWith('@cf/') && !options.modelId.includes('/')) {
      model = options.modelId;
    }

    const url = `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`;
    const timeoutMs = options?.timeoutMs ?? 15000;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: options?.temperature ?? 0.2,
            maxOutputTokens: options?.maxTokens ?? 2048,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        const status = response.status;

        // Quota / Rate limit (429 Resource Exhausted)
        if (status === 429) {
          const err = new ProviderError(
            this.id,
            `Gemini daily quota or rate limit reached (HTTP 429): ${errorText}`,
            false,
          );
          (err as unknown as { code: number }).code = WorkersAiErrorCode.QUOTA_EXHAUSTED;
          throw err;
        }

        const err = new ProviderError(
          this.id,
          `Gemini API HTTP ${status}: ${errorText}`,
          status >= 500,
        );
        throw err;
      }

      const json = (await response.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
          finishReason?: string;
        }>;
      };

      const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText) {
        throw new ProviderError(
          this.id,
          'Gemini returned an empty candidate content response',
          false,
        );
      }

      // Strip markdown code fences if model returned them
      const cleaned = candidateText
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(cleaned);
      } catch (parseErr) {
        throw new ProviderError(
          this.id,
          `Failed to parse JSON response from Gemini (${model}): ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`,
          false,
        );
      }

      const validationResult = schema.safeParse(parsedJson);
      if (!validationResult.success) {
        throw new ProviderError(
          this.id,
          `Gemini structured output failed schema validation: ${validationResult.error.message}`,
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
          `Gemini request timed out after ${timeoutMs}ms`,
          true,
        );
        (timeoutErr as unknown as { code: number }).code = WorkersAiErrorCode.TIMEOUT;
        throw timeoutErr;
      }

      throw new ProviderError(
        this.id,
        `Unexpected Gemini provider error: ${err instanceof Error ? err.message : String(err)}`,
        true,
      );
    }
  }
}
