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

  // Optional future free-tier provider keys
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
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
