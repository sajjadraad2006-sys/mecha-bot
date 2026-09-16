import { AIProvider } from './interfaces.js';
import { GeminiProvider } from './gemini-provider.js';
import { OpenAiCompatibleProvider } from './openai-compatible-provider.js';
import { WorkersAiProvider } from './workers-ai-provider.js';

export interface ProviderFactoryEnv {
  AI_PROVIDER?: string | undefined;
  GEMINI_API_KEY?: string | undefined;
  GEMINI_MODEL?: string | undefined;
  GROQ_API_KEY?: string | undefined;
  GROQ_MODEL?: string | undefined;
  OPENROUTER_API_KEY?: string | undefined;
  OPENROUTER_MODEL?: string | undefined;
  CLOUDFLARE_ACCOUNT_ID?: string | undefined;
  CLOUDFLARE_API_TOKEN?: string | undefined;
  [key: string]: string | undefined;
}

/**
 * Creates the appropriate AIProvider based on environment configuration.
 *
 * Evaluation priority:
 * 1. Explicit AI_PROVIDER = 'gemini' (or presence of GEMINI_API_KEY when unset)
 * 2. Explicit AI_PROVIDER = 'groq' (or presence of GROQ_API_KEY when unset)
 * 3. Explicit AI_PROVIDER = 'openrouter' (or presence of OPENROUTER_API_KEY when unset)
 * 4. Fallback: WorkersAiProvider
 */
export function createAiProviderFromEnv(env: ProviderFactoryEnv = process.env): AIProvider {
  const providerType = (env.AI_PROVIDER || '').toLowerCase().trim();

  // 1. Google Gemini
  if (providerType === 'gemini' || (!providerType && env.GEMINI_API_KEY)) {
    if (!env.GEMINI_API_KEY) {
      throw new Error(
        "AI_PROVIDER is set to 'gemini' but GEMINI_API_KEY is missing in environment",
      );
    }
    return new GeminiProvider({
      apiKey: env.GEMINI_API_KEY,
      model: env.GEMINI_MODEL || 'gemini-2.0-flash',
    });
  }

  // 2. Groq Cloud
  if (providerType === 'groq' || (!providerType && env.GROQ_API_KEY)) {
    if (!env.GROQ_API_KEY) {
      throw new Error("AI_PROVIDER is set to 'groq' but GROQ_API_KEY is missing in environment");
    }
    return new OpenAiCompatibleProvider({
      id: 'groq-provider',
      apiKey: env.GROQ_API_KEY,
      baseUrl: 'https://api.groq.com/openai/v1',
      defaultModel: env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    });
  }

  // 3. OpenRouter
  if (providerType === 'openrouter' || (!providerType && env.OPENROUTER_API_KEY)) {
    if (!env.OPENROUTER_API_KEY) {
      throw new Error(
        "AI_PROVIDER is set to 'openrouter' but OPENROUTER_API_KEY is missing in environment",
      );
    }
    return new OpenAiCompatibleProvider({
      id: 'openrouter-provider',
      apiKey: env.OPENROUTER_API_KEY,
      baseUrl: 'https://openrouter.ai/api/v1',
      defaultModel: env.OPENROUTER_MODEL || 'openrouter/free',
      customHeaders: {
        'HTTP-Referer': 'https://mecha-bot.local',
        'X-Title': 'Mecha Bot',
      },
    });
  }

  // 4. Default / Fallback: Cloudflare Workers AI
  return new WorkersAiProvider({
    accountId: env.CLOUDFLARE_ACCOUNT_ID || '',
    apiToken: env.CLOUDFLARE_API_TOKEN || '',
  });
}
