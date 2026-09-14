import { Bot, Context } from 'grammy';
import { DatabaseConnection } from '@mecha-bot/database';
import { Clock, Logger, IdempotencyStore } from '@mecha-bot/shared';
import { AcademicCalendarService } from '@mecha-bot/academic';
import { handleHelp } from './handlers/help.js';
import { createHealthHandler } from './handlers/health.js';
import { createErrorBoundaryMiddleware } from './middleware/error-boundary.js';
import { createLoggingMiddleware } from './middleware/logging.js';
import { createIdempotencyMiddleware } from './middleware/idempotency.js';
import { OnboardingRouter } from './navigation/router.js';

export interface BotDependencies {
  db: DatabaseConnection;
  clock: Clock;
  logger: Logger;
  idempotencyStore: IdempotencyStore;
  env: string;
  uptimeStartMs: number;
  calendarService?: AcademicCalendarService;
}

export function createMechaBot(token: string, deps: BotDependencies): Bot<Context> {
  const bot = new Bot<Context>(token);

  // Attach middleware in proper lifecycle order
  bot.use(createErrorBoundaryMiddleware(deps.logger));
  bot.use(createLoggingMiddleware(deps.logger));
  bot.use(createIdempotencyMiddleware(deps.idempotencyStore, deps.logger));

  const onboardingRouter = new OnboardingRouter({
    db: deps.db,
    clock: deps.clock,
    logger: deps.logger,
    calendarService: deps.calendarService,
  });

  // Register command handlers
  bot.command('start', (ctx) => onboardingRouter.handleStartOrMenu(ctx));
  bot.command('menu', (ctx) => onboardingRouter.handleStartOrMenu(ctx));
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

  // Register callback queries for navigation
  bot.on('callback_query:data', (ctx) => onboardingRouter.handleCallback(ctx));

  return bot;
}
