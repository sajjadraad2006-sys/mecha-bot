import { describe, it, expect, vi } from 'vitest';
import { Context } from 'grammy';
import {
  handleStart,
  handleHelp,
  createHealthHandler,
  createErrorBoundaryMiddleware,
} from '@mecha-bot/telegram';
import { FakeClock, JsonLogger } from '@mecha-bot/shared';
import { SqliteDatabaseConnection } from '@mecha-bot/database';

function createMockContext(text = '/start', updateId = 1001) {
  const replies: string[] = [];
  return {
    ctx: {
      update: { update_id: updateId },
      message: { text },
      reply: vi.fn(async (msg: string) => {
        replies.push(msg);
      }),
    } as unknown as Context,
    replies,
  };
}

describe('Telegram Transport & Handlers', () => {
  it('handles /start with academic assistant introductory message', async () => {
    const { ctx, replies } = createMockContext('/start');
    await handleStart(ctx);

    expect(ctx.reply).toHaveBeenCalledOnce();
    expect(replies[0]).toContain('هندسة الميكاترونكس - جامعة البصرة');
    expect(replies[0]).toContain('Mechatronics Academic Assistant');
    expect(replies[0]).toContain('Milestone M0 - Foundation');
  });

  it('handles /help with command guide and roadmap note', async () => {
    const { ctx, replies } = createMockContext('/help');
    await handleHelp(ctx);

    expect(ctx.reply).toHaveBeenCalledOnce();
    expect(replies[0]).toContain('/start');
    expect(replies[0]).toContain('/help');
    expect(replies[0]).toContain('/health');
    expect(replies[0]).toContain('M1 Onboarding');
  });

  it('handles /health with diagnostic indicators and academic time', async () => {
    const clock = new FakeClock('2026-09-14T08:30:00.000Z');
    const db = new SqliteDatabaseConnection(':memory:');
    const handler = createHealthHandler({
      db,
      clock,
      env: 'test',
      uptimeStartMs: clock.nowEpochMs() - 60000,
    });

    const { ctx, replies } = createMockContext('/health');
    await handler(ctx);

    expect(ctx.reply).toHaveBeenCalledOnce();
    expect(replies[0]).toContain('تقرير حالة النظام');
    expect(replies[0]).toContain('جاهز (READY)');
    expect(replies[0]).toContain('ONLINE');
    expect(replies[0]).toContain('2026-09-14'); // Academic date in Basrah
    expect(replies[0]).toContain('60s'); // Uptime
    db.close();
  });

  it('catches unhandled handler errors in error boundary without crashing', async () => {
    const logger = new JsonLogger('error');
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});
    const middleware = createErrorBoundaryMiddleware(logger);

    const { ctx, replies } = createMockContext('/crash');
    const throwingHandler = async () => {
      throw new Error('Simulated internal failure');
    };

    await middleware(ctx, throwingHandler);

    expect(errorSpy).toHaveBeenCalled();
    expect(ctx.reply).toHaveBeenCalledOnce();
    expect(replies[0]).toContain('حدث خطأ غير متوقع');
    // Does NOT leak error stack trace to the user
    expect(replies[0]).not.toContain('Simulated internal failure');
  });
});
