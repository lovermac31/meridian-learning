import express from 'express';
import { randomUUID } from 'node:crypto';
import type { VercelEdgeConfig } from './vercelEdgeRouter.js';
import { applyVercelDefaults, applyVercelHeaders, applyVercelRedirects, applyVercelRewrites, serveVercelFilesystem, vercelNotFound } from './vercelEdgeRouter.js';
import { mountVercelApiFunctions } from './vercelFunctionRouter.js';

export type CreateAppOptions = {
  edgeConfig: VercelEdgeConfig;
  /** The built site (dist). null = API only (local development with Vite serving the front end). */
  distPath: string | null;
  /** Adds X-Robots-Tag: noindex, nofollow to every response. */
  staging: boolean;
  /** Extra routes in the filesystem phase (tests). */
  mountExtra?: (router: express.Router) => void;
};

/**
 * The self-hosted Jurassic English origin, routed the way Vercel routes this project (vercel.json):
 * headers and redirects, then the filesystem (static files and functions), then rewrites, then 404. A rewrite to an
 * internal path is looked up in the filesystem again. There is no SPA fallback: an unknown path is a 404, as on Vercel.
 */
export function createApp({ edgeConfig, distPath, staging, mountExtra }: CreateAppOptions) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // Nginx is the only listener-facing proxy.
  app.use((_req, res, next) => {
    const requestId = randomUUID();
    res.setHeader('X-Request-Id', requestId);
    res.locals.requestId = requestId;
    next();
  });
  app.use(applyVercelDefaults());
  app.use(applyVercelHeaders(edgeConfig, staging));
  app.use(applyVercelRedirects(edgeConfig));

  const filesystem = express.Router();
  if (distPath) filesystem.use(serveVercelFilesystem(distPath));
  mountVercelApiFunctions(filesystem);
  mountExtra?.(filesystem);

  app.use(filesystem);
  app.use(applyVercelRewrites(edgeConfig));
  app.use(filesystem);
  app.use(vercelNotFound());

  app.use((error: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const requestId = String(res.locals.requestId ?? 'unknown');
    const errorType = error instanceof Error ? error.name : 'UnknownError';
    console.error(JSON.stringify({ event: 'request_failed', requestId, method: req.method, path: req.path, errorType }));
    if (!res.headersSent) {
      res.status(500).json({ ok: false, error: 'The request could not be completed.', requestId });
    }
  });
  return app;
}
