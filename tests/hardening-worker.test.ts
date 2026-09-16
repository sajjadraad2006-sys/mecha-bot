import { describe, it, expect, vi } from 'vitest';
import worker, {
  createWorkerDatabaseConnection,
  type WorkerEnv,
} from '../apps/worker/src/index.js';
import {
  SlidingWindowRateLimiter,
  createRateLimitMiddleware,
} from '../packages/telegram/src/middleware/rate-limit.js';
import { JsonLogger } from '../packages/shared/src/logger.js';
import type { Context } from 'grammy';

describe('M15 Hardening: Sliding Window Rate Limiter', () => {
  it('allows requests within threshold and blocks excess spam requests', () => {
    const limiter = new SlidingWindowRateLimiter({ limit: 3, windowMs: 5000 });
    const userKey = 'user:12345';
    const baseTime = 10000;

    // First 3 requests allowed
    expect(limiter.check(userKey, baseTime).limited).toBe(false);
    expect(limiter.check(userKey, baseTime + 100).limited).toBe(false);
    expect(limiter.check(userKey, baseTime + 200).limited).toBe(false);

    // 4th request exceeds limit
    const fourth = limiter.check(userKey, baseTime + 300);
    expect(fourth.limited).toBe(true);
    expect(fourth.retryAfterSeconds).toBeGreaterThan(0);

    // Request from another user is unaffected
    expect(limiter.check('user:99999', baseTime + 400).limited).toBe(false);

    // After window slides past 5000ms, first user is allowed again
    expect(limiter.check(userKey, baseTime + 5100).limited).toBe(false);
  });

  it('resets user window cleanly on reset()', () => {
    const limiter = new SlidingWindowRateLimiter({ limit: 2, windowMs: 5000 });
    const userKey = 'user:reset_test';

    limiter.check(userKey, 1000);
    limiter.check(userKey, 1100);
    expect(limiter.check(userKey, 1200).limited).toBe(true);

    limiter.reset(userKey);
    expect(limiter.check(userKey, 1300).limited).toBe(false);
  });

  it('middleware blocks spam and sends polite warning without invoking next()', async () => {
    const limiter = new SlidingWindowRateLimiter({ limit: 1, windowMs: 5000 });
    const logger = new JsonLogger('error');
    const middleware = createRateLimitMiddleware(limiter, logger);

    const replyMock = vi.fn().mockResolvedValue(undefined);
    const nextMock = vi.fn().mockResolvedValue(undefined);

    const mockCtx = {
      from: { id: 777 },
      reply: replyMock,
    } as unknown as Context;

    // 1st request passes to next()
    await middleware(mockCtx, nextMock);
    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(replyMock).not.toHaveBeenCalled();

    // 2nd request is blocked, replies with warning, does not call next()
    await middleware(mockCtx, nextMock);
    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledTimes(1);
    expect(replyMock).toHaveBeenCalledWith(expect.stringContaining('عيني على كيفك'));
  });
});

describe('M15 Hardening: Cloudflare Workers Webhook & Edge Endpoints', () => {
  const baseEnv: WorkerEnv = {
    TELEGRAM_BOT_TOKEN: '123456:mock-token-for-testing',
    TELEGRAM_SECRET_TOKEN: 'super-secret-token-123',
    NODE_ENV: 'test',
    MINI_APP_URL: 'https://mecha-bot.pages.dev',
  };

  it('GET /health returns 200 with service diagnostic info', async () => {
    const req = new Request('https://worker.mecha-bot.workers.dev/health', {
      method: 'GET',
    });

    const res = await worker.fetch(req, baseEnv);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');

    const json = (await res.json()) as Record<string, unknown>;
    expect(json['status']).toBe('healthy');
    expect(json['service']).toBe('mecha-bot-cloudflare-worker');
    expect(json['environment']).toBe('test');
    expect(json['hasSecretToken']).toBe(true);
    expect(json['hasMiniAppUrl']).toBe(true);
  });

  it('GET / returns 200 with service overview and endpoint list', async () => {
    const req = new Request('https://worker.mecha-bot.workers.dev/', {
      method: 'GET',
    });

    const res = await worker.fetch(req, baseEnv);
    expect(res.status).toBe(200);
    const json = (await res.json()) as Record<string, unknown>;
    expect(json['name']).toContain('Mecha Bot');
    expect(json['webhookEndpoint']).toBe('/webhook');
  });

  it('POST /webhook rejects requests with invalid secret token (HTTP 403)', async () => {
    const req = new Request('https://worker.mecha-bot.workers.dev/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Bot-Api-Secret-Token': 'wrong-token',
      },
      body: JSON.stringify({ update_id: 1 }),
    });

    const res = await worker.fetch(req, baseEnv);
    expect(res.status).toBe(403);
    const text = await res.text();
    expect(text).toContain('Unauthorized: Invalid Telegram Secret Token');
  });

  it('GET /webhook returns 405 Method Not Allowed', async () => {
    const req = new Request('https://worker.mecha-bot.workers.dev/webhook', {
      method: 'GET',
    });

    const res = await worker.fetch(req, baseEnv);
    expect(res.status).toBe(405);
  });

  it('GET /unknown-path returns 404 Not Found', async () => {
    const req = new Request('https://worker.mecha-bot.workers.dev/unknown-path', {
      method: 'GET',
    });

    const res = await worker.fetch(req, baseEnv);
    expect(res.status).toBe(404);
  });

  it('creates safe worker database connection that handles queries gracefully', () => {
    const db = createWorkerDatabaseConnection();
    expect(db.query('SELECT 1')).toEqual([]);
    expect(db.queryOne('SELECT 1')).toBeNull();
    expect(db.run('INSERT INTO t VALUES (1)')).toEqual({ changes: 0, lastInsertRowid: 0 });
    db.exec('CREATE TABLE t (id INT)');
    db.close();
  });
});
