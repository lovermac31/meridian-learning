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
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
  limit: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __jeRateLimitStore__: Map<string, RateLimitEntry> | undefined;
}

function getStore() {
  if (!globalThis.__jeRateLimitStore__) {
    globalThis.__jeRateLimitStore__ = new Map<string, RateLimitEntry>();
  }

  return globalThis.__jeRateLimitStore__;
}

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

function cleanupExpiredEntries(now: number) {
  const store = getStore();

  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function getClientIp(req: RequestLike) {
  const forwardedFor = headerValue(req.headers?.['x-forwarded-for']);
  const realIp = headerValue(req.headers?.['x-real-ip']);
  const candidate = forwardedFor || realIp || req.socket?.remoteAddress || '';
  return normalizeIp(candidate);
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

export function checkRateLimit(req: RequestLike, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const store = getStore();
  const ip = getClientIp(req);
  const scopedKey = `${options.key}:${ip}`;

  cleanupExpiredEntries(now);

  const existing = store.get(scopedKey);
  if (!existing || existing.resetAt <= now) {
    store.set(scopedKey, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return {
      allowed: true,
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
      remaining: Math.max(options.max - 1, 0),
      limit: options.max,
    };
  }

  if (existing.count >= options.max) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(Math.ceil((existing.resetAt - now) / 1000), 1),
      remaining: 0,
      limit: options.max,
    };
  }

  existing.count += 1;

  return {
    allowed: true,
    retryAfterSeconds: Math.max(Math.ceil((existing.resetAt - now) / 1000), 1),
    remaining: Math.max(options.max - existing.count, 0),
    limit: options.max,
  };
}

export function createThrottleLogContext(req: RequestLike, route: string, retryAfterSeconds: number) {
  return {
    route,
    clientIp: getClientIp(req),
    userAgent: getUserAgent(req),
    retryAfterSeconds,
  };
}
