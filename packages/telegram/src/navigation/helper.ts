import { Context, InlineKeyboard } from 'grammy';
import { Logger } from '@mecha-bot/shared';

export interface SafeEditOptions {
  text: string;
  replyMarkup: InlineKeyboard;
  logger?: Logger;
}

/**
 * Safely edits the navigation message in place.
 *
 * Rules:
 * 1. Always answers the callback query to clear Telegram's loading spinner.
 * 2. If Telegram returns "message is not modified", quietly ignores it without crashing.
 * 3. If the message cannot be edited (e.g. stale/deleted or command message), gracefully falls back to ctx.reply.
 */
export async function safeEditMenu(ctx: Context, options: SafeEditOptions): Promise<void> {
  const { text, replyMarkup, logger } = options;

  // 1. Always answer callback query if present
  if (ctx.callbackQuery) {
    try {
      await ctx.answerCallbackQuery();
    } catch (err: unknown) {
      const msg = String(err);
      if (!msg.includes('query is already answered')) {
        logger?.warn('Failed to answer callback query', { error: String(err) });
      }
    }
  }

  // 2. Attempt in-place message edit
  if (ctx.callbackQuery?.message) {
    try {
      await ctx.editMessageText(text, {
        reply_markup: replyMarkup,
      });
      return;
    } catch (err: unknown) {
      const errorMsg = String(err);
      if (errorMsg.includes('message is not modified')) {
        // Expected Telegram behavior when pressing the same button or identical state
        return;
      }
      logger?.warn('In-place edit failed, falling back to fresh message reply', {
        error: String(err),
      });
    }
  }

  // 3. Fallback: send replacement message card
  try {
    await ctx.reply(text, {
      reply_markup: replyMarkup,
    });
  } catch (err: unknown) {
    logger?.error('Failed to send replacement navigation menu', { error: String(err) });
  }
}
