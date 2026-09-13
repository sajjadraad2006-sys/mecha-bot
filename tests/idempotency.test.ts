import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SqliteDatabaseConnection,
  MigrationRunner,
  IdempotencyRepository,
} from '@mecha-bot/database';
import { createIdempotencyMiddleware } from '@mecha-bot/telegram';
import { JsonLogger } from '@mecha-bot/shared';

import { Context } from 'grammy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../migrations');

describe('Telegram Update Idempotency & Deduplication Primitive', () => {
  let db: SqliteDatabaseConnection;
  let idempotencyRepo: IdempotencyRepository;
  const logger = new JsonLogger('error');

  beforeEach(() => {
    db = new SqliteDatabaseConnection(':memory:');
    const runner = new MigrationRunner(db, migrationsDir);
    runner.migrate();
    idempotencyRepo = new IdempotencyRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it('detects and records processed update IDs in the database', async () => {
    const updateId = 554433;
    expect(await idempotencyRepo.isProcessed(updateId)).toBe(false);

    await idempotencyRepo.markProcessed(updateId, '/start');
    expect(await idempotencyRepo.isProcessed(updateId)).toBe(true);
  });

  it('skips duplicate update handling in idempotency middleware', async () => {
    const middleware = createIdempotencyMiddleware(idempotencyRepo, logger);
    let handlerExecutions = 0;
    const nextFn = async () => {
      handlerExecutions++;
    };

    const ctx = {
      update: { update_id: 888123 },
      message: { text: '/start' },
    } as unknown as Context;

    // First delivery of update 888123
    await middleware(ctx, nextFn);
    expect(handlerExecutions).toBe(1);

    // Second (duplicate) delivery of the same update 888123
    await middleware(ctx, nextFn);
    // Handler must NOT be executed a second time
    expect(handlerExecutions).toBe(1);
  });
});
