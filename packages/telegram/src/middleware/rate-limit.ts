import { Context, MiddlewareFn } from 'grammy';
import { Logger } from '@mecha-bot/shared';

export interface RateLimiterOptions {
  limit?: number; // max requests per window
  windowMs?: number; // window duration in ms
  replyMessage?: string;
}

export interface RateLimitResult {
  limited: boolean;
  retryAfterSeconds: number;
}

export class SlidingWindowRateLimiter {
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly windows = new Map<string, number[]>();

  constructor(options: RateLimiterOptions = {}) {
    this.limit = options.limit ?? 15;
    this.windowMs = options.windowMs ?? 10_000;
  }

  public check(key: string, now: number = Date.now()): RateLimitResult {
    const timestamps = this.windows.get(key) || [];
    const windowStart = now - this.windowMs;

    // Filter out timestamps outside the active window
    const activeTimestamps = timestamps.filter((t) => t > windowStart);

    if (activeTimestamps.length >= this.limit) {
      const oldestInWindow = activeTimestamps[0]!;
      const retryAfterMs = oldestInWindow + this.windowMs - now;
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
      return { limited: true, retryAfterSeconds };
    }

    activeTimestamps.push(now);
    this.windows.set(key, activeTimestamps);

    // Periodically clean up old entries if map grows large
    if (this.windows.size > 2000) {
      this.cleanup(now);
    }

    return { limited: false, retryAfterSeconds: 0 };
  }

  public reset(key: string): void {
    this.windows.delete(key);
  }

  public clear(): void {
    this.windows.clear();
  }

  private cleanup(now: number): void {
    const windowStart = now - this.windowMs;
    for (const [key, timestamps] of this.windows.entries()) {
      const remaining = timestamps.filter((t) => t > windowStart);
      if (remaining.length === 0) {
        this.windows.delete(key);
      } else {
        this.windows.set(key, remaining);
      }
    }
  }
}

export function createRateLimitMiddleware(
  limiter: SlidingWindowRateLimiter,
  logger: Logger,
  replyMessage: string = '⚠️ عيني على كيفك شوية! أرسلت رسائل كثيرة بوقت قصير. انتظر لحظات وارجع راسلني.',
): MiddlewareFn<Context> {
  return async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId) {
      await next();
      return;
    }

    const key = `user:${userId}`;
    const result = limiter.check(key);

    if (result.limited) {
      logger.warn('Rate limit exceeded for Telegram user', {
        userId,
        retryAfterSeconds: result.retryAfterSeconds,
      });

      try {
        await ctx.reply(replyMessage);
      } catch (replyError) {
        logger.error('Failed to send rate limit message', replyError);
      }
      return;
    }

    await next();
  };
}
