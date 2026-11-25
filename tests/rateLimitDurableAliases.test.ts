// Durable rate limiter: Vercel Upstash integration name aliases (KV_REST_API_*),
// automatic switch to the durable store, the explicit off-switch, and the
// in-memory fallback when the durable store errors. Uses a fake Upstash REST
// endpoint (stubbed fetch) with test-only credentials.

import test, { afterEach, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit } from '../api/_lib/requestSecurity.js';
import { __resetRateLimitStoreForTests, getRateLimitStore } from '../api/_lib/rateLimitStore.js';

const ENV_KEYS = [
  'ENABLE_DURABLE_RATE_LIMIT',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
  'UPSTASH_RATELIMIT_KEY_PREFIX',
  'UPSTASH_RATELIMIT_TIMEOUT_MS',
] as const;

const savedEnv: Record<string, string | undefined> = {};
const realFetch = globalThis.fetch;

type FetchCall = { url: string; authorization: string; commands: Array<Array<string | number>> };
let calls: FetchCall[] = [];
let redis: Map<string, { count: number; expiresAt: number }>;
let failMode: 'none' | 'throw' | 'http500' = 'none';

function installFakeUpstash() {
  globalThis.fetch = (async (input: unknown, init?: { headers?: Record<string, string>; body?: string }) => {
    const url = String(input);
    const commands = JSON.parse(init?.body ?? '[]') as Array<Array<string | number>>;
    calls.push({ url, authorization: init?.headers?.Authorization ?? '', commands });

    if (failMode === 'throw') throw new TypeError('network down');
    if (failMode === 'http500') return new Response('boom', { status: 500 });

    const now = Date.now();
    const results = commands.map((command) => {
      const [name, key, arg] = command as [string, string, string | undefined];
      const entry = redis.get(key);
      if (entry && entry.expiresAt !== 0 && entry.expiresAt <= now) redis.delete(key);
      const live = redis.get(key);
      if (name === 'INCR') {
        const next = { count: (live?.count ?? 0) + 1, expiresAt: live?.expiresAt ?? 0 };
        redis.set(key, next);
        return { result: next.count };
      }
      if (name === 'PTTL') {
        if (!live) return { result: -2 };
        return { result: live.expiresAt === 0 ? -1 : live.expiresAt - now };
      }
      if (name === 'PEXPIRE' && live) {
        live.expiresAt = now + Number(arg);
        return { result: 1 };
      }
      return { error: 'unsupported' };
    });
    return new Response(JSON.stringify(results), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }) as typeof fetch;
}

beforeEach(() => {
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
  calls = [];
  redis = new Map();
  failMode = 'none';
  installFakeUpstash();
  __resetRateLimitStoreForTests();
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
  globalThis.fetch = realFetch;
  __resetRateLimitStoreForTests();
});

function makeReq(ip: string) {
  return { headers: { 'x-forwarded-for': ip, 'user-agent': 'test-suite' }, socket: { remoteAddress: ip } };
}

const opts = (key: string, max = 3, failModeOpt: 'open' | 'closed' = 'closed') => ({
  key,
  windowMs: 60_000,
  max,
  failMode: failModeOpt,
});

test('KV_REST_API_* alone selects the durable store with no flag set', async () => {
  process.env.KV_REST_API_URL = 'https://kv-test.example.upstash.io/';
  process.env.KV_REST_API_TOKEN = 'kv-test-token';
  const r = await checkRateLimit(makeReq('198.51.100.1'), opts('alias-kv'));
  assert.equal(r.source, 'upstash');
  assert.equal(r.allowed, true);
  assert.equal(calls[0].url, 'https://kv-test.example.upstash.io/pipeline');
  assert.equal(calls[0].authorization, 'Bearer kv-test-token');
});

test('UPSTASH_REDIS_REST_* names still work and win over KV_REST_API_*', async () => {
  process.env.UPSTASH_REDIS_REST_URL = 'https://primary.example.upstash.io';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'primary-token';
  process.env.KV_REST_API_URL = 'https://kv-test.example.upstash.io';
  process.env.KV_REST_API_TOKEN = 'kv-test-token';
  const r = await checkRateLimit(makeReq('198.51.100.2'), opts('alias-precedence'));
  assert.equal(r.source, 'upstash');
  assert.equal(calls[0].url, 'https://primary.example.upstash.io/pipeline');
  assert.equal(calls[0].authorization, 'Bearer primary-token');
});

test('a URL without its token (or the reverse) stays in-memory', async () => {
  process.env.KV_REST_API_URL = 'https://kv-test.example.upstash.io';
  const r = await checkRateLimit(makeReq('198.51.100.3'), opts('alias-half'));
  assert.equal(r.source, 'in-memory');
  assert.equal(calls.length, 0);
});

test('no credentials selects the in-memory store', async () => {
  const r = await checkRateLimit(makeReq('198.51.100.4'), opts('no-creds'));
  assert.equal(r.source, 'in-memory');
  assert.equal(getRateLimitStore().kind, 'in-memory');
  assert.equal(calls.length, 0);
});

test('ENABLE_DURABLE_RATE_LIMIT=false is an explicit off-switch even with credentials', async () => {
  for (const flag of ['false', 'FALSE', '0', 'off']) {
    __resetRateLimitStoreForTests();
    process.env.ENABLE_DURABLE_RATE_LIMIT = flag;
    process.env.KV_REST_API_URL = 'https://kv-test.example.upstash.io';
    process.env.KV_REST_API_TOKEN = 'kv-test-token';
    const r = await checkRateLimit(makeReq('198.51.100.5'), opts(`off-${flag}`));
    assert.equal(r.source, 'in-memory', `flag=${flag} must force in-memory`);
  }
  assert.equal(calls.length, 0, 'no Redis traffic while switched off');
});

test('ENABLE_DURABLE_RATE_LIMIT=true with credentials uses the durable store', async () => {
  process.env.ENABLE_DURABLE_RATE_LIMIT = 'true';
  process.env.KV_REST_API_URL = 'https://kv-test.example.upstash.io';
  process.env.KV_REST_API_TOKEN = 'kv-test-token';
  const r = await checkRateLimit(makeReq('198.51.100.6'), opts('flag-true'));
  assert.equal(r.source, 'upstash');
});

test('durable count is shared across simulated serverless instances', async () => {
  process.env.KV_REST_API_URL = 'https://kv-test.example.upstash.io';
  process.env.KV_REST_API_TOKEN = 'kv-test-token';
  const req = makeReq('198.51.100.7');
  const o = opts('shared-count', 3);

  const results = [];
  for (let i = 0; i < 4; i += 1) {
    // Each call simulates a different cold instance: fresh module state, empty local memory.
    __resetRateLimitStoreForTests();
    results.push(await checkRateLimit(req, o));
  }
  assert.deepEqual(results.map((r) => r.allowed), [true, true, true, false]);
  assert.ok(results.every((r) => r.source === 'upstash'));
});

for (const mode of ['throw', 'http500'] as const) {
  test(`durable store error (${mode}) falls back to in-memory counting, never throws`, async () => {
    process.env.KV_REST_API_URL = 'https://kv-test.example.upstash.io';
    process.env.KV_REST_API_TOKEN = 'kv-test-token';
    failMode = mode;
    const req = makeReq('198.51.100.8');
    const o = opts(`fallback-${mode}`, 2, 'closed');

    const r1 = await checkRateLimit(req, o);
    const r2 = await checkRateLimit(req, o);
    const r3 = await checkRateLimit(req, o);

    assert.equal(r1.allowed, true);
    assert.equal(r2.allowed, true);
    assert.equal(r3.allowed, false, 'fallback still enforces the per-instance limit');
    assert.ok([r1, r2, r3].every((r) => r.source === 'in-memory'));
  });
}

test('after Redis recovers the durable store is used again', async () => {
  process.env.KV_REST_API_URL = 'https://kv-test.example.upstash.io';
  process.env.KV_REST_API_TOKEN = 'kv-test-token';
  const req = makeReq('198.51.100.9');

  failMode = 'throw';
  const during = await checkRateLimit(req, opts('recover', 5));
  assert.equal(during.source, 'in-memory');

  failMode = 'none';
  const after = await checkRateLimit(req, opts('recover', 5));
  assert.equal(after.source, 'upstash');
});
