import { z } from 'zod';

export const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  TELEGRAM_BOT_TOKEN: z
    .string({ required_error: 'TELEGRAM_BOT_TOKEN is required' })
    .min(1, 'TELEGRAM_BOT_TOKEN is required'),
  DATABASE_PATH: z.string().default('./data/mecha_bot.sqlite'),
  DEFAULT_TIMEZONE: z.string().default('Asia/Baghdad'),

  // Non-negotiable Zero-Cost safeguards
  ALLOW_PAID_AI: z
    .string()
    .default('false')
    .transform((v) => v.toLowerCase() === 'true')
    .refine((v) => v === false, {
      message: 'ALLOW_PAID_AI must remain false under the Zero-Cost project rule',
    }),
  ALLOW_PAID_STORAGE: z
    .string()
    .default('false')
    .transform((v) => v.toLowerCase() === 'true')
    .refine((v) => v === false, {
      message: 'ALLOW_PAID_STORAGE must remain false under the Zero-Cost project rule',
    }),
  ALLOW_BILLING_FALLBACK: z
    .string()
    .default('false')
    .transform((v) => v.toLowerCase() === 'true')
    .refine((v) => v === false, {
      message: 'ALLOW_BILLING_FALLBACK must remain false under the Zero-Cost project rule',
    }),

  // Optional AI Provider Configuration
  AI_PROVIDER: z.enum(['gemini', 'groq', 'openrouter', 'workers-ai']).optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().optional(),
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_API_TOKEN: z.string().optional(),

  // Optional Telegram Mini App (Web App) URL
  MINI_APP_URL: z.string().optional(),
});

export type AppConfig = z.infer<typeof ConfigSchema>;

export function loadConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  const result = ConfigSchema.safeParse(env);
  if (!result.success) {
    const errorDetails = result.error.errors
      .map((e) => `[${e.path.join('.')}] ${e.message}`)
      .join(', ');
    throw new Error(`Configuration validation failed: ${errorDetails}`);
  }
  return result.data;
}
