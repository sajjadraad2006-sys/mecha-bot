import { DatabaseConnection } from '../connection.js';
import { IdempotencyStore } from '@mecha-bot/shared';

export class IdempotencyRepository implements IdempotencyStore {
  constructor(private db: DatabaseConnection) {}

  async isProcessed(updateId: number): Promise<boolean> {
    const row = this.db.queryOne<{ update_id: number }>(
      'SELECT update_id FROM idempotent_updates WHERE update_id = ?;',
      [updateId],
    );
    return Boolean(row);
  }

  async markProcessed(updateId: number, handler: string): Promise<void> {
    const nowIso = new Date().toISOString();
    this.db.run(
      'INSERT INTO idempotent_updates (update_id, handler, processed_at) VALUES (?, ?, ?);',
      [updateId, handler, nowIso],
    );
  }
}
