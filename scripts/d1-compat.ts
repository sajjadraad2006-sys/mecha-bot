import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('=== Running Local Cloudflare D1 Compatibility Check ===');
console.log('Mode: STRICT LOCAL-ONLY (--local, ZERO remote connection, NO account required)');

const wranglerDir = path.join(rootDir, '.wrangler');
const tempSmokeSql = path.join(rootDir, 'smoke_temp.sql');

// Clean up any previous test state
if (fs.existsSync(wranglerDir)) {
  fs.rmSync(wranglerDir, { recursive: true, force: true });
}

try {
  const migrationsDir = path.join(rootDir, 'migrations');
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    const migrationPath = path.join(migrationsDir, file);
    console.log(`[d1-compat] Executing schema migration on local D1: ${file}`);
    const migrateCmd = `npx wrangler d1 execute DB --local --file="${migrationPath}" --yes`;
    execSync(migrateCmd, {
      cwd: rootDir,
      stdio: 'pipe',
      encoding: 'utf8',
    });
    console.log(`[d1-compat] Migration ${file} applied cleanly.`);
  }

  // 2. Perform minimal schema smoke query via file to avoid shell quotation issues
  fs.writeFileSync(
    tempSmokeSql,
    "SELECT count(*) as total_tables FROM sqlite_master WHERE type='table' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'sqlite_%';",
    'utf8',
  );

  const smokeCmd = `npx wrangler d1 execute DB --local --file="${tempSmokeSql}" --yes`;
  console.log(`[d1-compat] Running smoke query: ${smokeCmd}`);
  const smokeOutput = execSync(smokeCmd, {
    cwd: rootDir,
    stdio: 'pipe',
    encoding: 'utf8',
  });
  console.log('[d1-compat] Smoke query output:');
  console.log(smokeOutput);

  console.log('✅ Local Cloudflare D1 compatibility test PASSED with 0 errors.');
} catch (error: unknown) {
  console.error('❌ Cloudflare D1 compatibility check failed!');
  const err = error as Error & { stdout?: string; stderr?: string };
  if (err.stdout) console.error('Stdout:', err.stdout);
  if (err.stderr) console.error('Stderr:', err.stderr);
  process.exit(1);
} finally {
  // Clean up temporary files and disposable local D1 state
  if (fs.existsSync(tempSmokeSql)) {
    fs.unlinkSync(tempSmokeSql);
  }
  if (fs.existsSync(wranglerDir)) {
    fs.rmSync(wranglerDir, { recursive: true, force: true });
    console.log('[d1-compat] Cleaned up temporary local .wrangler state.');
  }
}
