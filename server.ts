import express from 'express';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import type { VercelEdgeConfig } from './src/server/vercelEdgeRouter.js';
import { applyVercelHeaders, applyVercelRedirects, applyVercelRewrites } from './src/server/vercelEdgeRouter.js';
import { mountVercelApiFunctions } from './src/server/vercelFunctionRouter.js';

// Local developer convenience only. Production secrets are injected by the
// service manager and must never be loaded from a checked-out .env.local file.
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
  dotenv.config({ path: '.env' });
}

const app = express();
const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const edgeConfig = JSON.parse(readFileSync(path.join(moduleDirectory, 'vercel.json'), 'utf8')) as VercelEdgeConfig;
const port = Number.parseInt(process.env.PORT ?? '3001', 10);
const host = process.env.HOST ?? '127.0.0.1';
const isProduction = process.env.NODE_ENV === 'production';

if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error('PORT must be an integer between 1024 and 65535.');
}

if (isProduction && host !== '127.0.0.1' && host !== '::1') {
  throw new Error('Production HOST must be loopback; expose the service through Nginx.');
}

app.disable('x-powered-by');
app.set('trust proxy', 1); // Nginx is the only listener-facing proxy.
app.use((req, res, next) => {
  const requestId = randomUUID();
  res.setHeader('X-Request-Id', requestId);
  res.locals.requestId = requestId;
  next();
});
app.use(applyVercelHeaders(edgeConfig, process.env.STAGING === 'true'));
app.use(applyVercelRedirects(edgeConfig));
app.use(applyVercelRewrites(edgeConfig));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

mountVercelApiFunctions(app);

// Unknown API paths must remain API 404s; never fall through to the SPA.
app.use('/api', (req, res) => {
  res.status(404).json({ ok: false, error: 'Not found.' });
});

if (isProduction) {
  const distPath = path.resolve(moduleDirectory, 'dist');
  app.use(express.static(distPath, { fallthrough: true }));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use((error: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const requestId = String(res.locals.requestId ?? 'unknown');
  const errorType = error instanceof Error ? error.name : 'UnknownError';
  console.error(JSON.stringify({
    event: 'request_failed',
    requestId,
    method: req.method,
    path: req.path,
    errorType,
  }));
  if (!res.headersSent) {
    res.status(500).json({ ok: false, error: 'The request could not be completed.', requestId });
  }
});

const server = app.listen(port, host, () => {
  console.info(JSON.stringify({ event: 'server_started', host, port, environment: process.env.NODE_ENV ?? 'development' }));
});

server.requestTimeout = 30_000;
server.headersTimeout = 35_000;
server.keepAliveTimeout = 5_000;
