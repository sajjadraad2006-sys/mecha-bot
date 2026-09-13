import { DatabaseSync, StatementSync } from 'node:sqlite';
import { DatabaseConnection, QueryResultInfo } from './connection.js';

type SqlParam = string | number | bigint | null | Uint8Array;

export class SqliteDatabaseConnection implements DatabaseConnection {
  private db: DatabaseSync;
  private isClosed = false;

  constructor(filePath = ':memory:') {
    this.db = new DatabaseSync(filePath);
    // Enforce foreign key constraints and WAL journal mode
    this.db.exec('PRAGMA foreign_keys = ON;');
    if (filePath !== ':memory:') {
      this.db.exec('PRAGMA journal_mode = WAL;');
    }
  }

  exec(sql: string): void {
    this.assertOpen();
    this.db.exec(sql);
  }

  query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
    this.assertOpen();
    const stmt: StatementSync = this.db.prepare(sql);
    return stmt.all(...(params as SqlParam[])) as T[];
  }

  queryOne<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | null {
    this.assertOpen();
    const stmt: StatementSync = this.db.prepare(sql);
    const result = stmt.get(...(params as SqlParam[]));
    return (result as T) || null;
  }

  run(sql: string, params: unknown[] = []): QueryResultInfo {
    this.assertOpen();
    const stmt: StatementSync = this.db.prepare(sql);
    const result = stmt.run(...(params as SqlParam[]));
    return {
      changes: Number(result.changes),
      lastInsertRowid: result.lastInsertRowid,
    };
  }

  transaction<T>(fn: (tx: DatabaseConnection) => T): T {
    this.assertOpen();
    this.exec('BEGIN TRANSACTION;');
    try {
      const result = fn(this);
      this.exec('COMMIT;');
      return result;
    } catch (error) {
      this.exec('ROLLBACK;');
      throw error;
    }
  }

  close(): void {
    if (!this.isClosed) {
      this.db.close();
      this.isClosed = true;
    }
  }

  private assertOpen(): void {
    if (this.isClosed) {
      throw new Error('Cannot execute query on closed database connection');
    }
  }
}
