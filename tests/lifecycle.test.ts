import { describe, it, expect } from 'vitest';
import { createMechaBot } from '@mecha-bot/telegram';
import { SqliteDatabaseConnection, IdempotencyRepository } from '@mecha-bot/database';
import { FakeClock, JsonLogger } from '@mecha-bot/shared';

describe('Application Lifecycle & Bot Wiring', () => {
  it('initializes the bot with all required dependencies and middleware', () => {
    const db = new SqliteDatabaseConnection(':memory:');
    const clock = new FakeClock();
    const logger = new JsonLogger('debug');
    const idempotencyStore = new IdempotencyRepository(db);

    const bot = createMechaBot('123456789:AAFakeDevTokenForTestingPurpose12345', {
      db,
      clock,
      logger,
      idempotencyStore,
      env: 'test',
      uptimeStartMs: clock.nowEpochMs(),
    });

    expect(bot).toBeDefined();
    expect(typeof bot.start).toBe('function');
    expect(typeof bot.stop).toBe('function');
    db.close();
  });
});
