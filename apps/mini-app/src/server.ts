/**
 * Mecha Bot Mini App — Local Preview HTTP Server (@mecha-bot/mini-app)
 *
 * Fast, lightweight server using Node.js native http and esbuild
 * to deliver the Mini App to Telegram desktop and mobile clients.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, '..');

const PORT = parseInt(process.env.PORT || '5173', 10);
const HOST = process.env.HOST || '0.0.0.0';

export async function buildClientBundle(): Promise<string> {
  const result = await esbuild.build({
    entryPoints: [path.join(appRoot, 'src', 'app.ts')],
    bundle: true,
    format: 'esm',
    target: 'es2022',
    write: false,
    sourcemap: 'inline',
  });

  if (result.outputFiles && result.outputFiles.length > 0) {
    return result.outputFiles[0]!.text;
  }
  throw new Error('Failed to bundle Mini App client code');
}

export function createMiniAppServer(): http.Server {
  const server = http.createServer(async (req, res) => {
    // Set permissive CORS headers for Telegram WebView & iframes
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    try {
      if (pathname === '/' || pathname === '/index.html') {
        const html = fs.readFileSync(path.join(appRoot, 'index.html'), 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
      }

      if (pathname === '/src/app.ts' || pathname === '/bundle.js') {
        const bundleJs = await buildClientBundle();
        res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
        res.end(bundleJs);
        return;
      }

      if (pathname === '/src/index.css' || pathname === '/index.css') {
        const cssPath = path.join(appRoot, 'src', 'index.css');
        if (fs.existsSync(cssPath)) {
          const css = fs.readFileSync(cssPath, 'utf-8');
          res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
          res.end(css);
          return;
        }
      }

      // Serve other static files if present
      const safePath = path.join(appRoot, pathname);
      if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
        const ext = path.extname(safePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
          '.html': 'text/html; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.json': 'application/json; charset=utf-8',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.svg': 'image/svg+xml',
        };
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(fs.readFileSync(safePath));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Internal Server Error: ${msg}`);
    }
  });

  return server;
}

// Auto-start if run directly
if (process.argv[1] && process.argv[1].endsWith('server.ts')) {
  const server = createMiniAppServer();
  server.listen(PORT, HOST, () => {
    console.log(`🚀 Mecha Bot Telegram Mini App running at: http://localhost:${PORT}`);
    console.log(`   Local preview: http://127.0.0.1:${PORT}`);
    console.log(`   Press Ctrl+C to stop.`);
  });
}
