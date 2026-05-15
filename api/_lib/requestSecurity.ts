import { getRateLimitStore, type RateLimitConsumeResult, type RateLimitConsumeError } from './rateLimitStore.js';
import { createHash } from 'node:crypto';

function isConsumeError(c: RateLimitConsumeResult): c is RateLimitConsumeError {
  return c.ok === false;
}

type RequestLike = {
  headers?: Record<string, string | string[] | undefined>;
  socket?: {
    remoteAddress?: string | null;
  };
};

type RateLimitOptions = {
  key: string;
  windowMs: number;
  max: number;
  // 'closed' (default for mutations) denies the request on a store error.
  // 'open' allows the request on a store error — use only for low-risk reads.
  failMode?: 'open' | 'closed';
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
  limit: number;
  // 'in-memory' | 'upstash' | 'upstash-fallback-open' | 'upstash-fallback-closed'
  source: 'in-memory' | 'upstash' | 'upstash-fallback-open' | 'upstash-fallback-closed';
};

function headerValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

function normalizeIp(rawValue: string) {
  const trimmed = rawValue.trim();

  if (!trimmed) {
    return 'unknown';
  }

  const forwarded = trimmed.split(',')[0]?.trim() ?? trimmed;
  return forwarded.replace(/^::ffff:/, '') || 'unknown';
}

export function getClientIp(req: RequestLike) {
  const forwardedFor = headerValue(req.headers?.['x-forwarded-for']);
  const realIp = headerValue(req.headers?.['x-real-ip']);
  const candidate = forwardedFor || realIp || req.socket?.remoteAddress || '';
  return normalizeIp(candidate);
}

// Stable, non-reversible client identifier for structured logs. SHA-256 of
// the IP truncated to 12 hex chars — enough to correlate across log lines
// without persisting raw IP.
export function getClientHash(req: RequestLike) {
  const ip = getClientIp(req);
  if (ip === 'unknown') return 'unknown';
  return createHash('sha256').update(ip).digest('hex').slice(0, 12);
}

export function getUserAgent(req: RequestLike) {
  return headerValue(req.headers?.['user-agent']).slice(0, 180) || 'unknown';
}

export function getEmailDomain(email?: string | null) {
  if (!email) {
    return null;
  }

  const normalized = email.trim().toLowerCase();
  const parts = normalized.split('@');
  return parts.length === 2 ? parts[1] : null;
}

export async function checkRateLimit(
  req: RequestLike,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const now = Date.now();
  const ip = getClientIp(req);
  const scopedKey = `${options.key}:${ip}`;
  const store = getRateLimitStore();
  const failMode = options.failMode ?? 'closed';

  const consume = await store.consume(scopedKey, options.windowMs, options.max);

  if (isConsumeError(consume)) {
    // Store error path. Emit a structured event so observability can pick it
    // up regardless of which side of the failMode coin we land on.
    console.warn('[rate-limit] store_error', {
      event: 'rate_limit_store_error',
      route: options.key,
      clientHash: getClientHash(req),
      limit: options.max,
      windowMs: options.windowMs,
      source: consume.source,
      reason: consume.reason,
      failMode,
    });

    if (failMode === 'closed') {
      // Deny — abuse resistance during outage outweighs lost legitimate traffic.
      return {
        allowed: false,
        retryAfterSeconds: Math.max(Math.ceil(options.windowMs / 1000), 1),
        remaining: 0,
        limit: options.max,
        source: 'upstash-fallback-closed',
      };
    }

    // Fail-open: allow the request, but treat it as a first hit for log shape.
    return {
      allowed: true,
      retryAfterSeconds: Math.max(Math.ceil(options.windowMs / 1000), 1),
      remaining: Math.max(options.max - 1, 0),
      limit: options.max,
      source: 'upstash-fallback-open',
    };
  }

  const count = consume.count;
  const resetAtMs = consume.resetAtMs;
  const retryAfterSeconds = Math.max(Math.ceil((resetAtMs - now) / 1000), 1);

  if (count > options.max) {
    return {
      allowed: false,
      retryAfterSeconds,
      remaining: 0,
      limit: options.max,
      source: consume.source,
    };
  }

  return {
    allowed: true,
    retryAfterSeconds,
    remaining: Math.max(options.max - count, 0),
    limit: options.max,
    source: consume.source,
  };
}

export function createThrottleLogContext(req: RequestLike, route: string, retryAfterSeconds: number) {
  return {
    route,
    clientIp: getClientIp(req),
    clientHash: getClientHash(req),
    userAgent: getUserAgent(req),
    retryAfterSeconds,
  };
}

// Emit a structured "rate_limited" event for the observability taxonomy.
// Call this immediately before returning a 429. Kept separate so call sites
// don't have to change shape — they can keep their existing console.warn.
export function logRateLimited(
  req: RequestLike,
  route: string,
  result: RateLimitResult,
) {
  console.warn('[rate-limit] rate_limited', {
    event: 'rate_limited',
    route,
    clientHash: getClientHash(req),
    limit: result.limit,
    remaining: result.remaining,
    retryAfterSeconds: result.retryAfterSeconds,
    source: result.source,
  });
}
