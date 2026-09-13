import { Context, MiddlewareFn } from 'grammy';
import { IdempotencyStore, Logger } from '@mecha-bot/shared';

export function createIdempotencyMiddleware(
  idempotencyStore: IdempotencyStore,
  logger: Logger,
): MiddlewareFn<Context> {
  return async (ctx, next) => {
    const updateId = ctx.update?.update_id;
    if (updateId === undefined) {
      await next();
      return;
    }

    const alreadyProcessed = await idempotencyStore.isProcessed(updateId);
    if (alreadyProcessed) {
      logger.warn('Skipping duplicate Telegram update', { updateId });
      return;
    }

    await next();

    // Mark as processed upon successful completion of middleware chain
    const handlerName = ctx.message?.text?.split(' ')[0] || 'unknown';
    await idempotencyStore.markProcessed(updateId, handlerName);
  };
}
