// Durable rate-limit storage adapter.
// In-memory store preserves Phase-0 ergonomics; Upstash store provides
// cross-instance durability when ENABLE_DURABLE_RATE_LIMIT=true and the
// UPSTASH_REDIS_REST_* env vars are populated.

export type RateLimitConsumeOk = {
  ok: true;
  count: number;
  resetAtMs: number;
  source: 'in-memory' | 'upstash';
};

export type RateLimitConsumeError = {
  ok: false;
  source: 'upstash';
  reason: 'transport_error' | 'timeout' | 'rest_error' | 'unexpected_shape';
};

export type RateLimitConsumeResult = RateLimitConsumeOk | RateLimitConsumeError;

export interface RateLimitStore {
  readonly kind: 'in-memory' | 'upstash';
  consume(scopedKey: string, windowMs: number, max: number): Promise<RateLimitConsumeResult>;
}

// ---------------------------------------------------------------------------
// In-memory adapter — preserves the pre-2.1A behaviour exactly. Used when
// ENABLE_DURABLE_RATE_LIMIT is unset/false, or during local dev without
// Upstash credentials.

type InMemoryEntry = { count: number; resetAt: number };

declare global {
  // eslint-disable-next-line no-var
  var __jeRateLimitStore__: Map<string, InMemoryEntry> | undefined;
}

function getInMemoryMap(): Map<string, InMemoryEntry> {
  if (!globalThis.__jeRateLimitStore__) {
    globalThis.__jeRateLimitStore__ = new Map<string, InMemoryEntry>();
  }
  return globalThis.__jeRateLimitStore__;
}

function cleanupExpired(map: Map<string, InMemoryEntry>, now: number) {
  for (const [key, entry] of map.entries()) {
    if (entry.resetAt <= now) {
      map.delete(key);
    }
  }
}

export const inMemoryRateLimitStore: RateLimitStore = {
  kind: 'in-memory',
  async consume(scopedKey, windowMs, _max) {
    const now = Date.now();
    const map = getInMemoryMap();

    cleanupExpired(map, now);

    const existing = map.get(scopedKey);
    if (!existing || existing.resetAt <= now) {
      const entry: InMemoryEntry = { count: 1, resetAt: now + windowMs };
      map.set(scopedKey, entry);
      return { ok: true, count: 1, resetAtMs: entry.resetAt, source: 'in-memory' };
    }

    existing.count += 1;
    return { ok: true, count: existing.count, resetAtMs: existing.resetAt, source: 'in-memory' };
  },
};

// ---------------------------------------------------------------------------
// Upstash adapter — raw fetch against the REST API. No SDK dependency.
// Matches the codebase pattern (Supabase / Resend / Notion all use raw fetch).
//
// Atomicity strategy: pipeline of [INCR, PTTL] in one round-trip. If INCR
// returns 1 we're the first request in the window, so set PEXPIRE in a
// second round-trip. PEXPIRE clobbering by a racing first request is
// impossible because INCR is atomic — only one caller observes count == 1.

type UpstashConfig = {
  restUrl: string;
  restToken: string;
  prefix: string;
  timeoutMs: number;
};

function readUpstashConfig(): UpstashConfig | null {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!restUrl || !restToken) return null;

  const prefix = process.env.UPSTASH_RATELIMIT_KEY_PREFIX?.trim() || 'je:rl:';
  const timeoutEnv = Number.parseInt(process.env.UPSTASH_RATELIMIT_TIMEOUT_MS ?? '', 10);
  const timeoutMs = Number.isFinite(timeoutEnv) && timeoutEnv > 0 ? timeoutEnv : 1500;

  return { restUrl: restUrl.replace(/\/$/, ''), restToken, prefix, timeoutMs };
}

type UpstashPipelineResult = Array<{ result?: unknown; error?: string }>;

async function callUpstashPipeline(
  config: UpstashConfig,
  commands: Array<Array<string | number>>,
): Promise<UpstashPipelineResult | { error: 'timeout' | 'transport_error' | 'rest_error'; detail?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(`${config.restUrl}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.restToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commands),
      signal: controller.signal,
    });

    if (!response.ok) {
      // Read but do not surface body text — may contain key fragments.
      await response.text().catch(() => '');
      return { error: 'rest_error', detail: `status_${response.status}` };
    }

    const parsed = (await response.json().catch(() => null)) as unknown;
    if (!Array.isArray(parsed)) {
      return { error: 'rest_error', detail: 'non_array_response' };
    }
    return parsed as UpstashPipelineResult;
  } catch (error: unknown) {
    const name = (error as { name?: string })?.name;
    if (name === 'AbortError') {
      return { error: 'timeout' };
    }
    return { error: 'transport_error' };
  } finally {
    clearTimeout(timer);
  }
}

function makeUpstashStore(config: UpstashConfig): RateLimitStore {
  return {
    kind: 'upstash',
    async consume(scopedKey, windowMs, _max) {
      const now = Date.now();
      const namespacedKey = `${config.prefix}${scopedKey}`;

      const pipelineRes = await callUpstashPipeline(config, [
        ['INCR', namespacedKey],
        ['PTTL', namespacedKey],
      ]);

      if ('error' in pipelineRes) {
        const reason: RateLimitConsumeError['reason'] =
          pipelineRes.error === 'timeout' ? 'timeout'
          : pipelineRes.error === 'transport_error' ? 'transport_error'
          : 'rest_error';
        return { ok: false, source: 'upstash', reason };
      }

      const incrSlot = pipelineRes[0];
      const pttlSlot = pipelineRes[1];

      const count = Number(incrSlot?.result);
      if (!Number.isFinite(count) || count < 1) {
        return { ok: false, source: 'upstash', reason: 'unexpected_shape' };
      }

      const pttlRaw = Number(pttlSlot?.result);
      let resetAtMs: number;

      if (count === 1) {
        // First request in window — set the TTL. If this PEXPIRE itself
        // fails the next call will observe pttl == -1 and try again.
        const expireRes = await callUpstashPipeline(config, [
          ['PEXPIRE', namespacedKey, String(windowMs)],
        ]);
        resetAtMs = now + windowMs;
        if ('error' in expireRes) {
          // Counter is incremented but TTL is unset. Treat as transient
          // upstash error so the failMode policy decides what to do.
          const reason: RateLimitConsumeError['reason'] =
            expireRes.error === 'timeout' ? 'timeout'
            : expireRes.error === 'transport_error' ? 'transport_error'
            : 'rest_error';
          return { ok: false, source: 'upstash', reason };
        }
      } else if (Number.isFinite(pttlRaw) && pttlRaw > 0) {
        resetAtMs = now + pttlRaw;
      } else {
        // No TTL set (race between two callers, or key from older config).
        // Re-arm the window so we don't accumulate forever.
        await callUpstashPipeline(config, [['PEXPIRE', namespacedKey, String(windowMs)]]);
        resetAtMs = now + windowMs;
      }

      return { ok: true, count, resetAtMs, source: 'upstash' };
    },
  };
}

// ---------------------------------------------------------------------------
// Factory + diagnostics

let cachedStore: RateLimitStore | null = null;
let cachedSelectionLogged = false;

function selectStore(): RateLimitStore {
  const enabled = process.env.ENABLE_DURABLE_RATE_LIMIT === 'true';
  if (!enabled) {
    return inMemoryRateLimitStore;
  }

  const config = readUpstashConfig();
  if (!config) {
    if (!cachedSelectionLogged) {
      console.warn('[rate-limit] ENABLE_DURABLE_RATE_LIMIT=true but UPSTASH_REDIS_REST_URL/TOKEN missing; falling back to in-memory store');
      cachedSelectionLogged = true;
    }
    return inMemoryRateLimitStore;
  }

  return makeUpstashStore(config);
}

export function getRateLimitStore(): RateLimitStore {
  if (!cachedStore) {
    cachedStore = selectStore();
    if (!cachedSelectionLogged) {
      console.info('[rate-limit] store selected', { kind: cachedStore.kind });
      cachedSelectionLogged = true;
    }
  }
  return cachedStore;
}

// Test-only: reset internal state. Safe to call from tests; no-ops in prod
// because nothing imports it from runtime paths.
export function __resetRateLimitStoreForTests() {
  cachedStore = null;
  cachedSelectionLogged = false;
  globalThis.__jeRateLimitStore__ = undefined;
}
