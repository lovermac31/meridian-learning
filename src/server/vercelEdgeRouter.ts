import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { Readable } from 'node:stream';
import { statSync } from 'node:fs';
import path from 'node:path';
import type { IncomingHttpHeaders } from 'node:http';

type HeaderRule = { source: string; headers: Array<{ key: string; value: string }> };
type RedirectRule = {
  source: string;
  destination: string;
  permanent?: boolean;
  has?: Array<{ type: string; value: string }>;
};
type RewriteRule = { source: string; destination: string };
export type VercelEdgeConfig = {
  headers: HeaderRule[];
  redirects: RedirectRule[];
  rewrites: RewriteRule[];
};

type CompiledSource = { regex: RegExp; namedGroups: string[] };

export function compileVercelSource(source: string): CompiledSource {
  const namedGroups: string[] = [];
  const withOptionalWildcard = source.replace(/\/:([A-Za-z][\w]*)\*/g, (_token, name: string) => {
    namedGroups.push(name);
    return `(?:/(?<${name}>.*))?`;
  });
  const expression = withOptionalWildcard.replace(/:([A-Za-z][\w]*)(?:\(([^)]+)\))?(\*)?/g, (_token, name: string, pattern?: string, star?: string) => {
    namedGroups.push(name);
    return `(?<${name}>${pattern ?? (star ? '.*' : '[^/]+')})`;
  });
  return { regex: new RegExp(`^${expression}$`), namedGroups };
}

export function matchVercelSource(source: string, pathname: string) {
  const compiled = compileVercelSource(source);
  const match = compiled.regex.exec(pathname);
  if (!match) return null;
  return {
    groups: match.groups ?? {},
    numbered: match.slice(1),
  };
}

export function expandVercelDestination(destination: string, matched: NonNullable<ReturnType<typeof matchVercelSource>>) {
  return destination
    .replace(/:([A-Za-z][\w]*)\*?/g, (_token, name: string) => matched.groups[name] ?? '')
    .replace(/\$(\d+)/g, (_token, index: string) => matched.numbered[Number(index) - 1] ?? '');
}

function pathnameOf(req: Request) {
  return new URL(req.originalUrl || req.url, 'http://localhost').pathname;
}

export function applyVercelHeaders(config: VercelEdgeConfig, staging: boolean) {
  const rules = config.headers.map((rule) => ({ ...rule, compiled: compileVercelSource(rule.source) }));
  return (req: Request, res: Response, next: NextFunction) => {
    const pathname = pathnameOf(req);
    for (const rule of rules) {
      if (rule.compiled.regex.test(pathname)) {
        for (const header of rule.headers) res.setHeader(header.key, header.value);
      }
    }
    if (staging) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    next();
  };
}

export function applyVercelRedirects(config: VercelEdgeConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const pathname = pathnameOf(req);
    for (const rule of config.redirects) {
      const matched = matchVercelSource(rule.source, pathname);
      if (!matched) continue;
      const hostCondition = rule.has?.find((condition) => condition.type === 'host');
      if (hostCondition && req.hostname.toLowerCase() !== hostCondition.value.toLowerCase()) continue;
      const destination = expandVercelDestination(rule.destination, matched);
      const query = new URL(req.originalUrl || req.url, 'http://localhost').search;
      const location = `${destination}${query}`;
      return res.redirect(rule.permanent ? 308 : 307, location);
    }
    next();
  };
}

const hopByHopHeaders = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade', 'content-length', 'content-encoding',
]);

function forwardRequestHeaders(headers: IncomingHttpHeaders, originalHost: string) {
  const forwarded = new Headers();
  for (const [key, raw] of Object.entries(headers)) {
    if (!raw || key === 'host' || hopByHopHeaders.has(key.toLowerCase())) continue;
    for (const value of Array.isArray(raw) ? raw : [raw]) forwarded.append(key, value);
  }
  forwarded.set('x-forwarded-host', originalHost);
  return forwarded;
}

async function proxyRequest(req: Request, res: Response, destination: string, source: string) {
  const target = new URL(destination);
  const current = new URL(req.originalUrl || req.url, 'http://localhost');
  target.search = current.search;
  const method = req.method.toUpperCase();
  const init: RequestInit & { duplex?: 'half' } = {
    method,
    headers: forwardRequestHeaders(req.headers, req.get('host') ?? ''),
    redirect: 'manual',
    signal: AbortSignal.timeout(120_000),
  };
  if (method !== 'GET' && method !== 'HEAD') {
    init.body = req as unknown as BodyInit;
    init.duplex = 'half';
  }

  const upstream = await fetch(target, init);
  res.status(upstream.status);
  upstream.headers.forEach((value, key) => {
    if (hopByHopHeaders.has(key.toLowerCase()) || res.hasHeader(key)) return;
    res.setHeader(key, value);
  });
  const setCookies = (upstream.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.();
  if (setCookies?.length && !res.hasHeader('set-cookie')) res.setHeader('set-cookie', setCookies);

  if (!upstream.body) return res.end();
  Readable.fromWeb(upstream.body as import('node:stream/web').ReadableStream).pipe(res);
  res.on('close', () => upstream.body?.cancel().catch(() => undefined));
  return undefined;
}

export function applyVercelRewrites(config: VercelEdgeConfig) {
  const rules = config.rewrites.map((rule) => ({ ...rule, compiled: compileVercelSource(rule.source) }));
  return async (req: Request, res: Response, next: NextFunction) => {
    const pathname = pathnameOf(req);
    for (const rule of rules) {
      const matched = rule.compiled.regex.exec(pathname);
      if (!matched) continue;
      const destination = expandVercelDestination(rule.destination, {
        groups: matched.groups ?? {},
        numbered: matched.slice(1),
      });
      if (/^https?:\/\//i.test(destination)) {
        try {
          await proxyRequest(req, res, destination, rule.source);
        } catch (error) {
          const errorType = error instanceof Error ? error.name : 'UnknownError';
          console.error(JSON.stringify({ event: 'rewrite_proxy_failed', source: rule.source, errorType }));
          if (!res.headersSent) res.status(502).json({ ok: false, error: 'Upstream service is temporarily unavailable.' });
        }
        return;
      }

      const query = new URL(req.originalUrl || req.url, 'http://localhost').search;
      const rewritten = new URL(destination, 'http://localhost');
      const targetUrl = `${rewritten.pathname}${rewritten.search || query}`;
      if (targetUrl === `${pathname}${new URL(req.originalUrl || req.url, 'http://localhost').search}`) continue;
      req.url = targetUrl;
      return next();
    }
    next();
  };
}

// ---------------------------------------------------------------------------------------------
// Vercel platform behavior the static output relies on (vercel.com/docs/project-configuration/vercel-json, read 16 Oct 2026):
// - "precedence is given to the filesystem prior to rewrites being applied": static files and functions answer
//   before any rewrite, so a rewrite only fires for a path with no file behind it;
// - with trailingSlash unset, "visiting a path with or without a trailing slash will not redirect": a directory is
//   served from its index.html either way, never redirected;
// - a path with no file, function or rewrite is a 404 (text/plain "NOT_FOUND"), not the SPA shell;
// - a response that sets no Cache-Control gets "public, max-age=0, must-revalidate".
// Verified against production with scripts/host/parity-*.mjs.

export const VERCEL_DEFAULT_CACHE_CONTROL = 'public, max-age=0, must-revalidate';

/** Adds Vercel's default Cache-Control to any response that reaches writeHead without one. */
export function applyVercelDefaults() {
  return (_req: Request, res: Response, next: NextFunction) => {
    const writeHead = res.writeHead;
    res.writeHead = function patchedWriteHead(this: Response, ...args: Parameters<Response['writeHead']>) {
      if (!this.hasHeader('cache-control')) this.setHeader('Cache-Control', VERCEL_DEFAULT_CACHE_CONTROL);
      return writeHead.apply(this, args as never);
    } as Response['writeHead'];
    next();
  };
}

const CONTENT_TYPE_OVERRIDES: Record<string, string> = { '.ico': 'image/vnd.microsoft.icon' };

/** Content type as Vercel sends it: same media types, lower-case charset. */
export function vercelContentType(filePath: string): string | null {
  const ext = path.extname(filePath).toLowerCase();
  if (CONTENT_TYPE_OVERRIDES[ext]) return CONTENT_TYPE_OVERRIDES[ext];
  const type = express.static.mime.lookup(filePath);
  if (!type) return null;
  const charset = express.static.mime.charsets.lookup(type, '');
  return charset ? `${type}; charset=${charset.toLowerCase()}` : type;
}

/** Resolves a request path to a file inside dist the way Vercel's filesystem check does, or null. */
export function resolveDistFile(distPath: string, pathname: string): string | null {
  let decoded: string;
  try { decoded = decodeURIComponent(pathname); } catch { return null; }
  if (decoded.includes('\0')) return null;
  const candidate = path.resolve(distPath, '.' + path.posix.normalize('/' + decoded));
  if (candidate !== distPath && !candidate.startsWith(distPath + path.sep)) return null;
  try {
    const stat = statSync(candidate);
    if (stat.isFile()) return candidate;
    if (stat.isDirectory()) {
      const index = path.join(candidate, 'index.html');
      return statSync(index).isFile() ? index : null;
    }
  } catch { /* not found */ }
  return null;
}

/** Serves a static file (or a directory's index.html) for GET/HEAD; anything else falls through. */
export function serveVercelFilesystem(distPath: string) {
  const root = path.resolve(distPath);
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    // req.url, not originalUrl: after an internal rewrite the filesystem is checked for the rewritten path.
    const file = resolveDistFile(root, new URL(req.url, 'http://localhost').pathname);
    if (!file) return next();
    const type = vercelContentType(file);
    if (type) res.setHeader('Content-Type', type);
    res.sendFile(file, { dotfiles: 'deny', lastModified: true, etag: true, cacheControl: false }, (error) => {
      if (error && !res.headersSent) next();
    });
  };
}

/** Vercel's 404 for a path nothing answers. */
export function vercelNotFound() {
  return (_req: Request, res: Response) => {
    res.status(404).type('text/plain; charset=utf-8').send('The page could not be found\n\nNOT_FOUND\n');
  };
}
