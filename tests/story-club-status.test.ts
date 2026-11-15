import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/story-club/status.js';
import { __resetRateLimitStoreForTests } from '../api/_lib/rateLimitStore.js';

type Reply = { status: number; body?: Record<string, unknown>; headers: Record<string, string> };

async function request(options: { method?: string; memo?: string; code?: string; ip?: string; db?: 'unpaid' | 'paid' | 'unknown' | 'down'; reset?: boolean } = {}): Promise<{ reply: Reply; calls: string[]; bodies: string[] }> {
  const envNames = ['SUPABASE_URL', 'SUPABASE_WRITE_KEY', 'ENABLE_DURABLE_RATE_LIMIT', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'] as const;
  const oldEnv = Object.fromEntries(envNames.map(name => [name, process.env[name]]));
  const originalFetch = globalThis.fetch;
  const calls: string[] = [];
  const bodies: string[] = [];
  process.env.SUPABASE_URL = 'http://127.0.0.1:55421';
  process.env.SUPABASE_WRITE_KEY = 'sb_secret_synthetic-write-key';
  delete process.env.ENABLE_DURABLE_RATE_LIMIT;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  if (options.reset !== false) __resetRateLimitStoreForTests();
  globalThis.fetch = (async (input, init) => {
    calls.push(String(input));
    if (options.db === 'down') throw new Error('synthetic failure');
    // The definer RPC (20261115000002): POST /rest/v1/rpc/story_club_payment_status {p_memo} -> {status}.
    if (!String(input).endsWith('/rest/v1/rpc/story_club_payment_status') || init?.method !== 'POST') return new Response('{}', { status: 403 });
    bodies.push(String(init.body));
    const status = options.db === 'unknown' ? 'not_found' : options.db === 'paid' ? 'paid' : 'unpaid';
    return new Response(JSON.stringify({ status }), { status: 200 });
  }) as typeof fetch;
  let status = 200;
  const bodyRef: { current?: Record<string, unknown> } = {};
  const headers: Record<string, string> = {};
  const res = { setHeader(name: string, value: string) { headers[name] = value; return this; }, status(code: number) { status = code; return this; }, json(body: Record<string, unknown>) { bodyRef.current = body; return this; } };
  try {
    await handler({ method: options.method ?? 'GET', query: { ...(options.memo === undefined ? {} : { memo: options.memo }), ...(options.code === undefined ? {} : { code: options.code }) }, headers: { 'x-forwarded-for': options.ip ?? '198.51.100.11' } } as never, res as never);
    return { reply: { status, body: bodyRef.current, headers }, calls, bodies };
  } finally {
    globalThis.fetch = originalFetch;
    if (options.reset !== false) __resetRateLimitStoreForTests();
    for (const name of envNames) oldEnv[name] === undefined ? delete process.env[name] : process.env[name] = oldEnv[name]!;
  }
}

test('status returns only the paid boolean and reads it through the definer RPC', async () => {
  for (const [db, paid] of [['paid', true], ['unpaid', false], ['unknown', false]] as const) {
    const result = await request({ memo: 'sc-abfd01', db });
    assert.equal(result.reply.status, 200);
    assert.deepEqual(result.reply.body, { paid });
    assert.deepEqual(Object.keys(result.reply.body ?? {}), ['paid']);
    assert.match(result.calls[0]!, /\/rest\/v1\/rpc\/story_club_payment_status$/);
    assert.deepEqual(JSON.parse(result.bodies[0]!), { p_memo: 'SC-ABFD01' });
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
  let last: { reply: Reply; calls: string[]; bodies: string[] } | undefined;
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

// P5c (15 Nov 2026): the shared pay-step status intent, ?code=SC-XXXXXX -> {status} only.
test('code intent: waiting or received, nothing else, read through the definer RPC', async () => {
  for (const [db, status] of [['paid', 'received'], ['unpaid', 'waiting'], ['unknown', 'waiting']] as const) {
    const result = await request({ code: 'sc-abfd01', db });
    assert.equal(result.reply.status, 200);
    assert.deepEqual(result.reply.body, { status });
    assert.deepEqual(Object.keys(result.reply.body ?? {}), ['status']);
    assert.equal(result.reply.headers['Cache-Control'], 'no-store, max-age=0');
    assert.equal(result.reply.headers['Access-Control-Allow-Origin'], undefined, 'same-origin only');
    assert.equal(result.calls.length, 1);
    assert.match(result.calls[0]!, /\/rest\/v1\/rpc\/story_club_payment_status$/);
    assert.deepEqual(JSON.parse(result.bodies[0]!), { p_memo: 'SC-ABFD01' });
  }
});

test('code intent: a code that is not a Story Club code is 400 unknown_code with no lookup', async () => {
  for (const code of ['PR0S-AB12CD', '1T-AB12CD', 'LC-AB12CD', 'SC-123', 'SC-AB12CD&x=1', '']) {
    const result = await request({ code });
    assert.equal(result.reply.status, 400, code);
    assert.deepEqual(result.reply.body, { error: 'unknown_code' });
    assert.deepEqual(result.calls, []);
  }
});

test('code intent: rate limit, method and backend failure answer with an error word only', async () => {
  __resetRateLimitStoreForTests();
  let last: { reply: Reply; calls: string[]; bodies: string[] } | undefined;
  for (let index = 0; index < 31; index += 1) last = await request({ code: 'SC-ABFD01', ip: '198.51.100.24', reset: false });
  __resetRateLimitStoreForTests();
  assert.equal(last?.reply.status, 429);
  assert.deepEqual(last?.reply.body, { error: 'rate_limited' });
  assert.ok(Number(last?.reply.headers['Retry-After']) > 0);
  const method = await request({ method: 'POST', code: 'SC-ABFD01' });
  assert.equal(method.reply.status, 405);
  assert.deepEqual(method.reply.body, { error: 'method_not_allowed' });
  const failed = await request({ code: 'SC-ABFD01', db: 'down' });
  assert.equal(failed.reply.status, 503);
  assert.deepEqual(failed.reply.body, { error: 'unavailable' });
});

// 15 Nov 2026: production answered 403 because service_role has no table privileges (20261029000002);
// a direct table read must never come back, and the RPC must stay definer, read-only and service_role-only.
test('the status read never touches the table over REST, and the RPC migration keeps its grants tight', async () => {
  const { readFile } = await import('node:fs/promises');
  const writer = await readFile(new URL('../api/_lib/supabaseWriter.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(writer, /rest\/v1\/story_club_reservations/);
  const sql = await readFile(new URL('../supabase/migrations/20261115000002_story_club_payment_status.sql', import.meta.url), 'utf8');
  assert.match(sql, /security definer/);
  assert.match(sql, /set search_path = ''/);
  assert.match(sql, /\bstable\b/);
  assert.match(sql, /revoke all on function public\.story_club_payment_status\(text\) from public, anon, authenticated;/);
  assert.match(sql, /grant execute on function public\.story_club_payment_status\(text\) to service_role;/);
  assert.doesNotMatch(sql.replace(/--.*$/gm, ''), /\b(update|insert|delete)\b/i);
  const down = await readFile(new URL('../supabase/migrations/20261115000002_story_club_payment_status_down.sql', import.meta.url), 'utf8');
  assert.match(down, /drop function if exists public\.story_club_payment_status\(text\);/);
});
