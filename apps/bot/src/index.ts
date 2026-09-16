import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadConfig, SystemClock, JsonLogger } from '@mecha-bot/shared';
import {
  SqliteDatabaseConnection,
  MigrationRunner,
  IdempotencyRepository,
  AcademicRepository,
} from '@mecha-bot/database';
import { AcademicCalendarService } from '@mecha-bot/academic';
import { createMechaBot } from '@mecha-bot/telegram';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find workspace root
const projectRoot = path.resolve(__dirname, '../../../');
const envPath = path.join(projectRoot, '.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

async function main() {
  const config = loadConfig();
  const logger = new JsonLogger(config.LOG_LEVEL, { service: 'mecha-bot' });
  const clock = new SystemClock();
  const uptimeStartMs = clock.nowEpochMs();

  logger.info('Initializing Mecha Bot foundation runtime...', {
    env: config.NODE_ENV,
    dbPath: config.DATABASE_PATH,
    timezone: config.DEFAULT_TIMEZONE,
  });

  // Ensure DB folder exists
  const dbDir = path.dirname(path.resolve(projectRoot, config.DATABASE_PATH));
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Connect to database
  const db = new SqliteDatabaseConnection(path.resolve(projectRoot, config.DATABASE_PATH));

  // Run database migrations
  const migrationsDir = path.resolve(projectRoot, 'migrations');
  const migrationRunner = new MigrationRunner(db, migrationsDir);
  const applied = migrationRunner.migrate();
  if (applied.length > 0) {
    logger.info('Applied database migrations', { migrations: applied });
  } else {
    logger.info('Database schema is up to date.');
  }

  const idempotencyStore = new IdempotencyRepository(db);
  const academicRepo = new AcademicRepository(db);
  const currentYear = academicRepo.getCurrentAcademicYear();
  const periods = currentYear ? academicRepo.getCalendarPeriods(currentYear.id) : [];
  const calendarService = new AcademicCalendarService(periods);

  // Initialize grammY bot
  const bot = createMechaBot(config.TELEGRAM_BOT_TOKEN, {
    db,
    clock,
    logger,
    idempotencyStore,
    env: config.NODE_ENV,
    uptimeStartMs,
    calendarService,
    miniAppUrl: config.MINI_APP_URL,
  });

  // Handle graceful shutdown
  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    bot
      .stop()
      .then(() => {
        db.close();
        logger.info('Mecha Bot stopped successfully.');
        process.exit(0);
      })
      .catch((err: unknown) => {
        logger.error('Error during bot shutdown', err);
        process.exit(1);
      });
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));

  logger.info('Starting Telegram long-polling bot runner...');
  await bot.start({
    onStart: (botInfo: { username?: string }) => {
      logger.info(`Mecha Bot started successfully as @${botInfo.username}`);
    },
  });
}

main().catch((err: unknown) => {
  console.error('Fatal startup error in Mecha Bot:', err);
  process.exit(1);
});
