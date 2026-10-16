import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import type { VercelEdgeConfig } from './src/server/vercelEdgeRouter.js';
import { createApp } from './src/server/createApp.js';

// Local developer convenience only. Production secrets are injected by the
// service manager and must never be loaded from a checked-out .env.local file.
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
  dotenv.config({ path: '.env' });
}

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

const app = createApp({
  edgeConfig,
  distPath: isProduction ? path.resolve(moduleDirectory, 'dist') : null,
  staging: process.env.STAGING === 'true',
});

const server = app.listen(port, host, () => {
  console.info(JSON.stringify({ event: 'server_started', host, port, environment: process.env.NODE_ENV ?? 'development' }));
});

server.requestTimeout = 30_000;
server.headersTimeout = 35_000;
server.keepAliveTimeout = 5_000;
