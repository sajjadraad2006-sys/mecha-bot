/**
 * Mecha Bot — Cloudflare Workers Webhook & Edge Runtime (@mecha-bot/worker)
 *
 * Implements serverless edge execution for Mecha Bot using grammY's native
 * cloudflare-mod webhook callback, secret token verification, and health diagnostics.
 */

import { webhookCallback } from 'grammy';
import { createMechaBot, SlidingWindowRateLimiter } from '@mecha-bot/telegram';
import { JsonLogger, SystemClock } from '@mecha-bot/shared';
import type { DatabaseConnection } from '@mecha-bot/database';

export interface WorkerEnv {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_SECRET_TOKEN?: string | undefined;
  NODE_ENV?: string | undefined;
  DEFAULT_TIMEZONE?: string | undefined;
  MINI_APP_URL?: string | undefined;
  DB?: unknown;
  AI_PROVIDER?: string | undefined;
  GEMINI_API_KEY?: string | undefined;
  GROQ_API_KEY?: string | undefined;
  OPENROUTER_API_KEY?: string | undefined;
  ADMIN_USER_IDS?: string | undefined;
}

import { WorkerDatabaseConnection } from './database.js';

// In-memory singletons across worker execution lifecycle
const workerDb = new WorkerDatabaseConnection();
let cachedBot: ReturnType<typeof createMechaBot> | null = null;
let cachedHandler: ((req: Request) => Promise<Response>) | null = null;
const rateLimiter = new SlidingWindowRateLimiter({ limit: 20, windowMs: 10_000 });
const clock = new SystemClock();
const workerStartTimeMs = clock.nowEpochMs();

/**
 * Worker database connection instance with in-memory store and D1 synchronization
 */
export function createWorkerDatabaseConnection(): DatabaseConnection {
  return workerDb;
}

/**
 * Lazy-initializes the grammY bot and webhook callback handler
 */
export function getOrCreateBotHandler(
  env: WorkerEnv,
  ctx?: unknown,
): (req: Request) => Promise<Response> {
  workerDb.setD1(env.DB, ctx);

  if (cachedHandler && cachedBot) {
    return cachedHandler;
  }

  const logger = new JsonLogger('info', { service: 'mecha-bot-worker' });

  const idempotencyStore = {
    isProcessed: async () => false,
    markProcessed: async () => {},
  };

  cachedBot = createMechaBot(env.TELEGRAM_BOT_TOKEN, {
    db: workerDb,
    clock,
    logger,
    idempotencyStore,
    env: env.NODE_ENV || 'production',
    uptimeStartMs: workerStartTimeMs,
    miniAppUrl: env.MINI_APP_URL,
    rateLimiter,
  });

  cachedHandler = webhookCallback(cachedBot, 'cloudflare-mod');
  return cachedHandler;
}

export default {
  async fetch(request: Request, env: WorkerEnv, _ctx?: unknown): Promise<Response> {
    const url = new URL(request.url);

    // 1. Health Check Endpoint
    if (request.method === 'GET' && url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          service: 'mecha-bot-cloudflare-worker',
          uptimeSeconds: Math.floor((clock.nowEpochMs() - workerStartTimeMs) / 1000),
          environment: env.NODE_ENV || 'production',
          hasD1Binding: Boolean(env.DB),
          hasMiniAppUrl: Boolean(env.MINI_APP_URL),
          hasSecretToken: Boolean(env.TELEGRAM_SECRET_TOKEN),
          timezone: env.DEFAULT_TIMEZONE || 'Asia/Baghdad',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        },
      );
    }

    // 2. Service Root Endpoint
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '')) {
      return new Response(
        JSON.stringify({
          name: 'Mecha Bot Cloudflare Edge Runtime',
          department: 'Mechatronics Engineering, University of Basrah',
          healthEndpoint: '/health',
          webhookEndpoint: '/webhook',
          miniAppUrl: env.MINI_APP_URL || null,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        },
      );
    }

    // 3. Telegram Webhook Endpoint
    if (url.pathname === '/webhook') {
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }

      // Security check: Validate Telegram Secret Token if configured
      if (env.TELEGRAM_SECRET_TOKEN) {
        const receivedToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
        if (receivedToken !== env.TELEGRAM_SECRET_TOKEN) {
          return new Response('Unauthorized: Invalid Telegram Secret Token', { status: 403 });
        }
      }

      // Preload student profile from Cloudflare D1 if available
      try {
        const body = (await request.clone().json()) as {
          message?: { from?: { id?: number } };
          callback_query?: { from?: { id?: number } };
        };
        const tgUserId = body?.message?.from?.id || body?.callback_query?.from?.id;
        if (tgUserId) {
          workerDb.setD1(env.DB, _ctx);
          await workerDb.preloadStudentFromD1(tgUserId);
        }
      } catch {
        // Safe fallback if request body is not JSON
      }

      const handler = getOrCreateBotHandler(env, _ctx);
      return handler(request);
    }

    return new Response('404 Not Found', { status: 404 });
  },
};
