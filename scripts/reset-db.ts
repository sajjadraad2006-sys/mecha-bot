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

console.log(`[reset-db] Resetting database at: ${resolvedDbPath}`);
if (fs.existsSync(resolvedDbPath)) {
  fs.unlinkSync(resolvedDbPath);
  console.log('[reset-db] Deleted existing database file.');
}

const db = new SqliteDatabaseConnection(resolvedDbPath);
const migrationsDir = path.join(rootDir, 'migrations');

try {
  const runner = new MigrationRunner(db, migrationsDir);
  const applied = runner.migrate();
  console.log(`[reset-db] Re-applied migrations from scratch: ${applied.join(', ')}`);
} finally {
  db.close();
}
