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

// In-memory singletons across worker execution lifecycle
let cachedBot: ReturnType<typeof createMechaBot> | null = null;
let cachedHandler: ((req: Request) => Promise<Response>) | null = null;
const rateLimiter = new SlidingWindowRateLimiter({ limit: 20, windowMs: 10_000 });
const clock = new SystemClock();
const workerStartTimeMs = clock.nowEpochMs();

/**
 * In-memory fallback database connection for stateless worker environments
 */
export function createWorkerDatabaseConnection(): DatabaseConnection {
  const dummyResult = { changes: 0, lastInsertRowid: 0 };
  return {
    exec: () => {},
    query: <T>() => [] as T[],
    queryOne: <T>() => null as T | null,
    run: () => dummyResult,
    transaction: <T>(fn: (tx: DatabaseConnection) => T) => fn(createWorkerDatabaseConnection()),
    close: () => {},
  };
}

/**
 * Lazy-initializes the grammY bot and webhook callback handler
 */
export function getOrCreateBotHandler(env: WorkerEnv): (req: Request) => Promise<Response> {
  if (cachedHandler && cachedBot) {
    return cachedHandler;
  }

  const logger = new JsonLogger('info', { service: 'mecha-bot-worker' });
  const db = createWorkerDatabaseConnection();

  const idempotencyStore = {
    isProcessed: async () => false,
    markProcessed: async () => {},
  };

  cachedBot = createMechaBot(env.TELEGRAM_BOT_TOKEN, {
    db,
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

      const handler = getOrCreateBotHandler(env);
      return handler(request);
    }

    return new Response('404 Not Found', { status: 404 });
  },
};
