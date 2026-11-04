import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/story-club/status.js';
import { __resetRateLimitStoreForTests } from '../api/_lib/rateLimitStore.js';

type Reply = { status: number; body?: Record<string, unknown>; headers: Record<string, string> };

async function request(options: { method?: string; memo?: string; ip?: string; db?: 'unpaid' | 'paid' | 'unknown' | 'down'; reset?: boolean } = {}): Promise<{ reply: Reply; calls: string[] }> {
  const envNames = ['SUPABASE_URL', 'SUPABASE_WRITE_KEY', 'ENABLE_DURABLE_RATE_LIMIT', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'] as const;
  const oldEnv = Object.fromEntries(envNames.map(name => [name, process.env[name]]));
  const originalFetch = globalThis.fetch;
  const calls: string[] = [];
  process.env.SUPABASE_URL = 'http://127.0.0.1:55421';
  process.env.SUPABASE_WRITE_KEY = 'sb_secret_synthetic-write-key';
  delete process.env.ENABLE_DURABLE_RATE_LIMIT;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  if (options.reset !== false) __resetRateLimitStoreForTests();
  globalThis.fetch = (async (input) => {
    calls.push(String(input));
    if (options.db === 'down') throw new Error('synthetic failure');
    if (options.db === 'unknown') return new Response('[]', { status: 200 });
    return new Response(JSON.stringify([{ paid_at: options.db === 'paid' ? '2026-10-29T10:00:00Z' : null }]), { status: 200 });
  }) as typeof fetch;
  let status = 200;
  const bodyRef: { current?: Record<string, unknown> } = {};
  const headers: Record<string, string> = {};
  const res = { setHeader(name: string, value: string) { headers[name] = value; return this; }, status(code: number) { status = code; return this; }, json(body: Record<string, unknown>) { bodyRef.current = body; return this; } };
  try {
    await handler({ method: options.method ?? 'GET', query: options.memo === undefined ? {} : { memo: options.memo }, headers: { 'x-forwarded-for': options.ip ?? '198.51.100.11' } } as never, res as never);
    return { reply: { status, body: bodyRef.current, headers }, calls };
  } finally {
    globalThis.fetch = originalFetch;
    if (options.reset !== false) __resetRateLimitStoreForTests();
    for (const name of envNames) oldEnv[name] === undefined ? delete process.env[name] : process.env[name] = oldEnv[name]!;
  }
}

test('status returns only the paid boolean and queries only paid_at with the service key', async () => {
  for (const [db, paid] of [['paid', true], ['unpaid', false], ['unknown', false]] as const) {
    const result = await request({ memo: 'sc-abfd01', db });
    assert.equal(result.reply.status, 200);
    assert.deepEqual(result.reply.body, { paid });
    assert.deepEqual(Object.keys(result.reply.body ?? {}), ['paid']);
    if (db !== 'unknown') assert.match(result.calls[0]!, /select=paid_at/);
  }
});

test('invalid memo is indistinguishable from unpaid and does not query storage', async () => {
  const result = await request({ memo: 'SC-123' });
  assert.equal(result.reply.status, 200);
  assert.deepEqual(result.reply.body, { paid: false });
  assert.deepEqual(result.calls, []);
});

test('rate limits memo status requests and returns no enumerating details', async () => {
  const first = await request({ memo: 'SC-ABFD01', ip: '198.51.100.22' });
  assert.equal(first.reply.status, 200);
  // Exercise the same IP in one process/window; cap is 30 per minute.
  let last: { reply: Reply; calls: string[] } | undefined;
  __resetRateLimitStoreForTests();
  for (let index = 0; index < 31; index += 1) last = await request({ memo: 'SC-ABFD01', ip: '198.51.100.23', reset: false });
  __resetRateLimitStoreForTests();
  assert.equal(last?.reply.status, 429);
  assert.deepEqual(last?.reply.body, { paid: false });
});

test('status is GET-only and backend failures remain a boolean-only response', async () => {
  const method = await request({ method: 'POST' });
  const failed = await request({ memo: 'SC-ABFD01', db: 'down' });
  assert.equal(method.reply.status, 405);
  assert.deepEqual(method.reply.body, { paid: false });
  assert.equal(failed.reply.status, 503);
  assert.deepEqual(failed.reply.body, { paid: false });
});
