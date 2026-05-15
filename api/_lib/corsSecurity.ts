// Phase 2.2A — Staged CORS allowlist helper.
//
// The marketing-site API surface currently sets NO Access-Control-* headers.
// This is safe today (same-origin only; cross-origin browser calls are
// blocked because there's no ACAO to grant them) but offers no
// defense-in-depth: a future contributor adding ACAO: * on one route would
// not be caught by any other layer.
//
// This module provides:
//   - `applyCors(req, res)`     — set ACAO + Vary: Origin on the response
//                                  when Origin matches the allowlist.
//   - `handlePreflight(req, res)` — answer OPTIONS preflight from allowed
//                                  origins; route handlers should call this
//                                  first and bail when it returns true.
//   - `isAllowedOrigin(origin)` — pure-function predicate, useful in tests.
//
// Default allowlist is the production apex + www. Additional origins are
// configured via env vars (comma-separated). Vercel preview origins
// (`*-{slug}-{team}.vercel.app`) are opt-in via a separate flag.
//
// Same-origin requests have no Origin header and are passed through
// unchanged — existing form submissions from jurassicenglish.com itself
// continue to work byte-identically.

export type CorsRequestLike = {
  headers?: Record<string, string | string[] | undefined>;
  method?: string;
};

// Structural Response type — matches both @vercel/node's VercelResponse and
// express.Response. We deliberately do not import the Vercel or Express
// types so this helper works in both serverless functions (Vercel) and the
// local-dev shim (server.ts / express) without coupling.
export type CorsResponseLike = {
  setHeader(name: string, value: string): unknown;
  statusCode: number;
  end(): unknown;
};

export type CorsConfig = {
  staticOrigins: ReadonlySet<string>;
  allowVercelPreviews: boolean;
  methods: readonly string[];
  allowedHeaders: readonly string[];
  maxAge: number;
};

export const DEFAULT_STATIC_ALLOWLIST = [
  'https://jurassicenglish.com',
  'https://www.jurassicenglish.com',
] as const;

// Vercel preview hostnames look like:
//   https://<branch-or-sha>-<project>-<team>.vercel.app
//   https://<project>-<random>-<team>.vercel.app
// We allow lowercase letters, digits, dashes only — same character class
// Vercel itself uses for deploy URLs.
const VERCEL_PREVIEW_PATTERN = /^https:\/\/[a-z0-9][a-z0-9-]{0,253}\.vercel\.app$/;

function readEnvList(name: string): string[] {
  const raw = process.env[name]?.trim();
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function readCorsConfig(): CorsConfig {
  const extra = readEnvList('API_CORS_ALLOWED_ORIGINS');
  const allowVercelPreviews = process.env.API_CORS_ALLOW_VERCEL_PREVIEWS === 'true';

  return {
    staticOrigins: new Set<string>([...DEFAULT_STATIC_ALLOWLIST, ...extra]),
    allowVercelPreviews,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 600,
  };
}

function headerString(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function isAllowedOrigin(origin: string, config: CorsConfig = readCorsConfig()): boolean {
  if (!origin) return false;
  if (config.staticOrigins.has(origin)) return true;
  if (config.allowVercelPreviews && VERCEL_PREVIEW_PATTERN.test(origin)) return true;
  return false;
}

export type CorsResult = {
  // null = no Origin header (same-origin request)
  // string = origin was sent
  origin: string | null;
  // true if same-origin OR if origin is in allowlist
  // false if origin is sent AND not in allowlist (response will lack ACAO)
  allowed: boolean;
  // hint for callers to log denials
  reason: 'same_origin' | 'allowlist_match' | 'allowlist_match_preview' | 'origin_denied';
};

export function classifyOrigin(
  req: CorsRequestLike,
  config: CorsConfig = readCorsConfig(),
): CorsResult {
  const origin = headerString(req.headers?.['origin']);

  if (!origin) {
    return { origin: null, allowed: true, reason: 'same_origin' };
  }

  if (config.staticOrigins.has(origin)) {
    return { origin, allowed: true, reason: 'allowlist_match' };
  }

  if (config.allowVercelPreviews && VERCEL_PREVIEW_PATTERN.test(origin)) {
    return { origin, allowed: true, reason: 'allowlist_match_preview' };
  }

  return { origin, allowed: false, reason: 'origin_denied' };
}

// Apply ACAO + Vary headers based on the request. Returns the classification
// so callers can branch on result (e.g., emit denial log). Does NOT short-
// circuit the request; callers must still decide what to do for disallowed
// origins (typically: continue processing without ACAO, so the browser
// rejects the response on the client side).
export function applyCors(req: CorsRequestLike, res: CorsResponseLike): CorsResult {
  const result = classifyOrigin(req);

  if (result.origin && result.allowed) {
    res.setHeader('Access-Control-Allow-Origin', result.origin);
    res.setHeader('Vary', 'Origin');
  } else if (result.origin && !result.allowed) {
    // Structured event for the Phase 4 observability taxonomy. Logged once
    // per request, never echoes back to the client.
    console.warn('[cors] origin_denied', {
      event: 'cors_origin_denied',
      origin: result.origin,
      method: req.method ?? 'unknown',
    });
  }

  return result;
}

// Answer OPTIONS preflight. Returns true when the request was a preflight
// (caller MUST stop processing). Returns false otherwise (continue normally).
//
// For allowed origins: 204 with method/header/max-age allowances.
// For disallowed origins: 204 with no ACAO. The browser will fail the
// follow-up actual request because no ACAO was granted — this is the
// intended behaviour.
export function handlePreflight(req: CorsRequestLike, res: CorsResponseLike): boolean {
  if (req.method !== 'OPTIONS') return false;

  const result = applyCors(req, res);

  if (result.origin && result.allowed) {
    const config = readCorsConfig();
    res.setHeader('Access-Control-Allow-Methods', config.methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
    res.setHeader('Access-Control-Max-Age', String(config.maxAge));
  }

  res.statusCode = 204;
  res.end();
  return true;
}

// Convenience: one-liner for handlers that just want "deny preflight or
// continue". Returns true when the caller should `return` immediately
// (preflight was handled OR origin was sent and denied for a non-OPTIONS
// request and the caller wants strict mode — currently we never deny POST
// outright on origin grounds, we just don't set ACAO).
export function isPreflightHandled(req: CorsRequestLike, res: CorsResponseLike): boolean {
  return handlePreflight(req, res);
}
