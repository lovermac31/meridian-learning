// Minimal static server for browser specs: serves the production build (dist/) the way Vercel does, so a
// prerendered route such as /products answers with dist/products/index.html at that exact URL (no trailing-slash
// redirect, no SPA fallback). Hydration therefore runs against the real prerendered markup.
// Usage: node tests/browser/support/serve-dist.mjs [port]   (run `npm run build` first)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../dist');
const port = Number(process.argv[2] || process.env.PORT || 4177);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml', '.mp4': 'video/mp4' };

const fileIn = (rel) => {
  const file = path.join(root, rel);
  return file.startsWith(root) && fs.existsSync(file) && fs.statSync(file).isFile() ? file : null;
};

http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://local').pathname);
  const file = fileIn(pathname) ?? fileIn(path.join(pathname, 'index.html')) ?? (path.extname(pathname) ? null : fileIn('index.html'));
  if (!file) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('not found'); }
  res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`serve-dist on http://127.0.0.1:${port}`));
