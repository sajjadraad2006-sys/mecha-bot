import { Bot, Context } from 'grammy';
import { DatabaseConnection, StudentRepository } from '@mecha-bot/database';
import { Clock, Logger, IdempotencyStore } from '@mecha-bot/shared';
import { AcademicCalendarService } from '@mecha-bot/academic';
import { MechaBotApp } from '@mecha-bot/wiring';
import { TelegramAppBridge } from './application-bridge.js';
import { handleHelp } from './handlers/help.js';
import { createHealthHandler } from './handlers/health.js';
import { createErrorBoundaryMiddleware } from './middleware/error-boundary.js';
import { createLoggingMiddleware } from './middleware/logging.js';
import { createIdempotencyMiddleware } from './middleware/idempotency.js';
import { createRateLimitMiddleware, SlidingWindowRateLimiter } from './middleware/rate-limit.js';
import { OnboardingRouter } from './navigation/router.js';

export interface BotDependencies {
  db: DatabaseConnection;
  clock: Clock;
  logger: Logger;
  idempotencyStore: IdempotencyStore;
  env: string;
  uptimeStartMs: number;
  calendarService?: AcademicCalendarService;
  app?: MechaBotApp;
  bridge?: TelegramAppBridge;
  miniAppUrl?: string | undefined;
  rateLimiter?: SlidingWindowRateLimiter | undefined;
}

export function createMechaBot(token: string, deps: BotDependencies): Bot<Context> {
  const bot = new Bot<Context>(token);

  // Attach middleware in proper lifecycle order
  bot.use(createErrorBoundaryMiddleware(deps.logger));
  bot.use(createLoggingMiddleware(deps.logger));
  bot.use(createIdempotencyMiddleware(deps.idempotencyStore, deps.logger));
  if (deps.rateLimiter) {
    bot.use(createRateLimitMiddleware(deps.rateLimiter, deps.logger));
  }

  const studentRepo = new StudentRepository(deps.db);
  const bridge =
    deps.bridge ?? (deps.app ? new TelegramAppBridge({ app: deps.app, studentRepo }) : undefined);

  const onboardingRouter = new OnboardingRouter({
    db: deps.db,
    clock: deps.clock,
    logger: deps.logger,
    calendarService: deps.calendarService,
    app: deps.app,
    bridge,
    miniAppUrl: deps.miniAppUrl,
  });

  // Register command handlers
  bot.command('start', (ctx) => onboardingRouter.handleStartOrMenu(ctx));
  bot.command('menu', (ctx) => onboardingRouter.handleStartOrMenu(ctx));
  bot.command('app', (ctx) => onboardingRouter.handleAppCommand(ctx));
  bot.command('dashboard', (ctx) => onboardingRouter.handleDashboardCommand(ctx));
  bot.command('courses', (ctx) => onboardingRouter.handleCourses(ctx));
  bot.command('where', (ctx) => onboardingRouter.handleWhereAreWeCommand(ctx));
  bot.command('lost', (ctx) => onboardingRouter.handleImLostCommand(ctx));
  bot.command('timetable', (ctx) => onboardingRouter.handleTimetableCommand(ctx));
  bot.command('reminders', (ctx) => onboardingRouter.handleRemindersCommand(ctx));
  bot.command('search', async (ctx) => {
    const text = ctx.message?.text?.replace(/^\/search\s*/, '').trim();
    if (text) {
      await onboardingRouter.handleSearchQuery(ctx, text);
    } else {
      await onboardingRouter.handleSearchPrompt(ctx);
    }
  });
  bot.command('help', handleHelp);
  bot.command(
    'health',
    createHealthHandler({
      db: deps.db,
      clock: deps.clock,
      env: deps.env,
      uptimeStartMs: deps.uptimeStartMs,
    }),
  );
  bot.command('admin', (ctx) => onboardingRouter.handleAdminCommand(ctx));

  // Register text messages for interactive queries (e.g. search, admin upload)
  bot.on('message:text', (ctx) => onboardingRouter.handleTextMessage(ctx));

  // Register document uploads (e.g. lecture notes and summaries uploaded by admin)
  bot.on('message:document', (ctx) => onboardingRouter.handleDocumentMessage(ctx));

  // Register callback queries for navigation
  bot.on('callback_query:data', (ctx) => onboardingRouter.handleCallback(ctx));

  return bot;
}
