import { Context, MiddlewareFn } from 'grammy';
import { Logger } from '@mecha-bot/shared';

export function createLoggingMiddleware(logger: Logger): MiddlewareFn<Context> {
  return async (ctx, next) => {
    const startMs = Date.now();
    const updateId = ctx.update?.update_id;
    const fromUser = ctx.from?.id ? '[USER_PRESENT]' : '[NO_USER]';
    const messageText = ctx.message?.text ? ctx.message.text.substring(0, 30) : undefined;

    logger.debug('Received Telegram update', {
      updateId,
      userState: fromUser,
      snippet: messageText,
    });

    await next();

    const durationMs = Date.now() - startMs;
    logger.info('Processed Telegram update', {
      updateId,
      durationMs,
    });
  };
}
