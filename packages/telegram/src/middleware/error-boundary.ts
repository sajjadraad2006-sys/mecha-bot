import { Context, MiddlewareFn } from 'grammy';
import { Logger } from '@mecha-bot/shared';

export function createErrorBoundaryMiddleware(logger: Logger): MiddlewareFn<Context> {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      logger.error('Unhandled exception caught in Telegram update handler', error, {
        updateId: ctx.update?.update_id,
      });

      try {
        await ctx.reply(
          '⚠️ حدث خطأ غير متوقع أثناء معالجة الطلب. يرجى المحاولة مرة أخرى لاحقاً.\n' +
            'An unexpected error occurred. Please try again later.',
        );
      } catch (replyError) {
        logger.error('Failed to send error notification message to user', replyError);
      }
    }
  };
}
