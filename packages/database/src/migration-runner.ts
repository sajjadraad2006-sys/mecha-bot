import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseConnection } from './connection.js';

export interface AppliedMigration {
  id: number;
  name: string;
  applied_at: string;
  checksum: string;
}

export class MigrationRunner {
  constructor(
    private db: DatabaseConnection,
    private migrationsDir: string,
  ) {}

  private initMigrationsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        applied_at TEXT NOT NULL,
        checksum TEXT NOT NULL
      );
    `);
  }

  private calculateChecksum(content: string): string {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
  }

  getAppliedMigrations(): AppliedMigration[] {
    this.initMigrationsTable();
    return this.db.query<AppliedMigration>(
      'SELECT id, name, applied_at, checksum FROM _migrations ORDER BY id ASC;',
    );
  }

  getPendingMigrations(): { name: string; filePath: string; sql: string; checksum: string }[] {
    this.initMigrationsTable();
    const applied = this.getAppliedMigrations();
    const appliedMap = new Map(applied.map((m) => [m.name, m]));

    if (!fs.existsSync(this.migrationsDir)) {
      throw new Error(`Migrations directory not found: ${this.migrationsDir}`);
    }

    const files = fs
      .readdirSync(this.migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const pending: { name: string; filePath: string; sql: string; checksum: string }[] = [];

    for (const file of files) {
      const filePath = path.join(this.migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      const checksum = this.calculateChecksum(sql);

      const existing = appliedMap.get(file);
      if (existing) {
        if (existing.checksum !== checksum) {
          throw new Error(
            `Migration checksum mismatch for '${file}'. Previously applied with ${existing.checksum}, now has ${checksum}.`,
          );
        }
      } else {
        pending.push({ name: file, filePath, sql, checksum });
      }
    }

    return pending;
  }

  migrate(): string[] {
    this.initMigrationsTable();
    const pending = this.getPendingMigrations();
    const newlyApplied: string[] = [];

    for (const migration of pending) {
      this.db.transaction((tx) => {
        // Execute the migration SQL
        tx.exec(migration.sql);

        // Record the migration in _migrations
        const nowIso = new Date().toISOString();
        tx.run('INSERT INTO _migrations (name, applied_at, checksum) VALUES (?, ?, ?);', [
          migration.name,
          nowIso,
          migration.checksum,
        ]);
      });

      newlyApplied.push(migration.name);
    }

    return newlyApplied;
  }

  reset(): void {
    // Disable foreign keys temporarily to drop all tables cleanly
    this.db.exec('PRAGMA foreign_keys = OFF;');
    const tables = this.db
      .query<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
      )
      .map((row) => row.name);

    for (const table of tables) {
      this.db.exec(`DROP TABLE IF EXISTS "${table}";`);
    }
    this.db.exec('PRAGMA foreign_keys = ON;');
  }
}
