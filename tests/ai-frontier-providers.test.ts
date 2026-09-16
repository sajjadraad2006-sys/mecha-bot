import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import {
  GeminiProvider,
  OpenAiCompatibleProvider,
  createAiProviderFromEnv,
  WorkersAiErrorCode,
} from '@mecha-bot/ai';

describe('Frontier AI Providers (@mecha-bot/ai)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const TestSchema = z.object({
    explanation: z.string(),
    confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  });

  describe('GeminiProvider', () => {
    it('returns true on healthCheck when apiKey is provided', async () => {
      const provider = new GeminiProvider({ apiKey: 'fake-gemini-key' });
      expect(await provider.healthCheck()).toBe(true);

      const emptyProvider = new GeminiProvider({ apiKey: '' });
      expect(await emptyProvider.healthCheck()).toBe(false);
    });

    it('generates valid structured JSON and validates with schema', async () => {
      const mockResponseBody = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    explanation: 'شرح مبسط لمسار الجذور Root Locus',
                    confidence: 'HIGH',
                  }),
                },
              ],
            },
          },
        ],
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponseBody,
      });

      const provider = new GeminiProvider({ apiKey: 'fake-key' });
      const result = await provider.generateStructured('اشرح الـ Root Locus', TestSchema);

      expect(result.explanation).toBe('شرح مبسط لمسار الجذور Root Locus');
      expect(result.confidence).toBe('HIGH');
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);

      const [calledUrl, calledInit] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
        .calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('gemini-2.0-flash:generateContent');
      expect(calledUrl).toContain('key=fake-key');

      const requestPayload = JSON.parse(calledInit.body as string);
      expect(requestPayload.generationConfig.responseMimeType).toBe('application/json');
    });

    it('strips markdown code fences from Gemini JSON response', async () => {
      const mockResponseBody = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: '```json\n{"explanation": "معادلة تحكمية", "confidence": "MEDIUM"}\n```',
                },
              ],
            },
          },
        ],
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponseBody,
      });

      const provider = new GeminiProvider({ apiKey: 'fake-key' });
      const result = await provider.generateStructured('test prompt', TestSchema);

      expect(result.explanation).toBe('معادلة تحكمية');
      expect(result.confidence).toBe('MEDIUM');
    });

    it('maps HTTP 429 quota exhaustion to WorkersAiErrorCode.QUOTA_EXHAUSTED', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => 'Resource has been exhausted (e.g. check quota)',
      });

      const provider = new GeminiProvider({ apiKey: 'fake-key' });

      await expect(provider.generateStructured('test prompt', TestSchema)).rejects.toMatchObject({
        code: WorkersAiErrorCode.QUOTA_EXHAUSTED,
        isRetryable: false,
      });
    });

    it('bypasses incompatible Cloudflare @cf/ model IDs and uses default Gemini model', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify({ explanation: 'ok', confidence: 'LOW' }) }],
              },
            },
          ],
        }),
      });

      const provider = new GeminiProvider({ apiKey: 'fake-key' });
      // Pass a Cloudflare model ID from AIRouter
      await provider.generateStructured('test prompt', TestSchema, {
        modelId: '@cf/meta/llama-3.1-8b-instruct',
      });

      const [calledUrl] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
        string,
        RequestInit,
      ];
      // Must NOT contain @cf/, must fall back to gemini-2.0-flash
      expect(calledUrl).toContain('gemini-2.0-flash:generateContent');
      expect(calledUrl).not.toContain('@cf/');
    });
  });

  describe('OpenAiCompatibleProvider', () => {
    it('generates valid structured JSON for Groq endpoint', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                explanation: 'استجابة فائقة السرعة عبر Groq',
                confidence: 'HIGH',
              }),
            },
          },
        ],
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const provider = new OpenAiCompatibleProvider({
        id: 'groq-provider',
        apiKey: 'gsk-fake-key',
        baseUrl: 'https://api.groq.com/openai/v1',
        defaultModel: 'llama-3.3-70b-versatile',
      });

      const result = await provider.generateStructured('test prompt', TestSchema);
      expect(result.explanation).toBe('استجابة فائقة السرعة عبر Groq');
      expect(result.confidence).toBe('HIGH');

      const [calledUrl, calledInit] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
        .calls[0] as [string, RequestInit];
      expect(calledUrl).toBe('https://api.groq.com/openai/v1/chat/completions');

      const body = JSON.parse(calledInit.body as string);
      expect(body.model).toBe('llama-3.3-70b-versatile');
      expect(body.response_format).toEqual({ type: 'json_object' });
    });

    it('attaches OpenRouter custom headers when configured', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                explanation: 'استجابة عبر OpenRouter',
                confidence: 'MEDIUM',
              }),
            },
          },
        ],
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const provider = new OpenAiCompatibleProvider({
        id: 'openrouter-provider',
        apiKey: 'sk-or-fake-key',
        baseUrl: 'https://openrouter.ai/api/v1',
        defaultModel: 'openrouter/free',
        customHeaders: {
          'HTTP-Referer': 'https://mecha-bot.local',
          'X-Title': 'Mecha Bot',
        },
      });

      await provider.generateStructured('test prompt', TestSchema);

      const [, calledInit] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
        string,
        RequestInit,
      ];
      const headers = calledInit.headers as Record<string, string>;
      expect(headers['HTTP-Referer']).toBe('https://mecha-bot.local');
      expect(headers['X-Title']).toBe('Mecha Bot');
      expect(headers['Authorization']).toBe('Bearer sk-or-fake-key');
    });

    it('maps HTTP 429 to WorkersAiErrorCode.QUOTA_EXHAUSTED', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded',
      });

      const provider = new OpenAiCompatibleProvider({
        id: 'groq-provider',
        apiKey: 'gsk-fake-key',
        baseUrl: 'https://api.groq.com/openai/v1',
        defaultModel: 'llama-3.3-70b-versatile',
      });

      await expect(provider.generateStructured('test', TestSchema)).rejects.toMatchObject({
        code: WorkersAiErrorCode.QUOTA_EXHAUSTED,
        isRetryable: false,
      });
    });

    it('bypasses incompatible Cloudflare @cf/ model IDs and uses default model', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({ explanation: 'fallback-ok', confidence: 'LOW' }),
              },
            },
          ],
        }),
      });

      const provider = new OpenAiCompatibleProvider({
        id: 'groq-provider',
        apiKey: 'gsk-fake-key',
        baseUrl: 'https://api.groq.com/openai/v1',
        defaultModel: 'llama-3.3-70b-versatile',
      });

      await provider.generateStructured('test', TestSchema, {
        modelId: '@cf/meta/llama-3.1-8b-instruct',
      });

      const [, calledInit] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
        string,
        RequestInit,
      ];
      const body = JSON.parse(calledInit.body as string);
      expect(body.model).toBe('llama-3.3-70b-versatile');
      expect(body.model).not.toContain('@cf/');
    });
  });

  describe('createAiProviderFromEnv (Provider Factory)', () => {
    it('instantiates GeminiProvider when AI_PROVIDER is gemini', () => {
      const provider = createAiProviderFromEnv({
        AI_PROVIDER: 'gemini',
        GEMINI_API_KEY: 'test-key',
      });
      expect(provider.id).toBe('gemini-provider');
    });

    it('instantiates GeminiProvider when GEMINI_API_KEY is present without explicit AI_PROVIDER', () => {
      const provider = createAiProviderFromEnv({
        GEMINI_API_KEY: 'test-key',
      });
      expect(provider.id).toBe('gemini-provider');
    });

    it('throws error when AI_PROVIDER=gemini but GEMINI_API_KEY is missing', () => {
      expect(() =>
        createAiProviderFromEnv({
          AI_PROVIDER: 'gemini',
        }),
      ).toThrow(/GEMINI_API_KEY is missing/);
    });

    it('instantiates OpenAiCompatibleProvider for Groq', () => {
      const provider = createAiProviderFromEnv({
        AI_PROVIDER: 'groq',
        GROQ_API_KEY: 'groq-test-key',
      });
      expect(provider.id).toBe('groq-provider');
    });

    it('instantiates OpenAiCompatibleProvider for OpenRouter', () => {
      const provider = createAiProviderFromEnv({
        AI_PROVIDER: 'openrouter',
        OPENROUTER_API_KEY: 'or-test-key',
      });
      expect(provider.id).toBe('openrouter-provider');
    });

    it('falls back to WorkersAiProvider when no external provider is configured', () => {
      const provider = createAiProviderFromEnv({
        CLOUDFLARE_ACCOUNT_ID: 'fake-account',
        CLOUDFLARE_API_TOKEN: 'fake-token',
      });
      expect(provider.id).toBe('workers-ai-primary');
    });
  });
});
