import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { SqliteDatabaseConnection, MigrationRunner } from '@mecha-bot/database';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env') });

const dbPath = process.env.DATABASE_PATH || './data/mecha_bot.sqlite';
const resolvedDbPath = path.resolve(rootDir, dbPath);
const dbDir = path.dirname(resolvedDbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log(`[migrate] Connecting to database: ${resolvedDbPath}`);
const db = new SqliteDatabaseConnection(resolvedDbPath);
const migrationsDir = path.join(rootDir, 'migrations');

try {
  const runner = new MigrationRunner(db, migrationsDir);
  const applied = runner.migrate();
  if (applied.length > 0) {
    console.log(`[migrate] Successfully applied migrations: ${applied.join(', ')}`);
  } else {
    console.log('[migrate] No pending migrations. Schema is up to date.');
  }
} finally {
  db.close();
}
