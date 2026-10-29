import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/story-club-paid';

type Reply = { status: number; body: Record<string, unknown> | undefined; headers: Record<string, string> };

async function request(options: { method?: string; memo?: unknown; token?: string; scoped?: boolean; rpc?: 'paid' | 'already_paid' | 'not_found' | 'down' } = {}): Promise<Reply> {
  const names = ['STORY_CLUB_PAYMENT_OPERATOR_KEY', 'STORY_CLUB_PAYMENT_OPERATOR_IP_ALLOWLIST', 'PRICING_ACCESS_OPERATOR_KEY', 'SUPABASE_URL', 'SUPABASE_WRITE_KEY'] as const;
  const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  const originalFetch = globalThis.fetch;
  const originalConsole = { info: console.info, warn: console.warn, error: console.error };
  const logs: string[] = [];
  const responseHeaders: Record<string, string> = {};
  let status = 200;
  let body: Record<string, unknown> | undefined;
  const scopedKey = 'synthetic-story-club-operator-key-32chars';
  if (options.scoped === false) delete process.env.STORY_CLUB_PAYMENT_OPERATOR_KEY;
  else process.env.STORY_CLUB_PAYMENT_OPERATOR_KEY = scopedKey;
  process.env.STORY_CLUB_PAYMENT_OPERATOR_IP_ALLOWLIST = '';
  process.env.PRICING_ACCESS_OPERATOR_KEY = 'synthetic-legacy-key-32-characters';
  process.env.SUPABASE_URL = 'http://127.0.0.1:55421';
  process.env.SUPABASE_WRITE_KEY = 'sb_secret_synthetic-write-key';
  globalThis.fetch = (async (input) => {
    assert.match(String(input), /\/rpc\/mark_story_club_paid$/);
    if (options.rpc === 'down') throw new Error('synthetic network failure');
    const rpcBody = options.rpc === 'not_found'
      ? { status: 'not_found', paid_at: null }
      : { status: options.rpc === 'already_paid' ? 'already_paid' : 'paid', paid_at: '2026-10-29T10:00:00.000Z' };
    return new Response(JSON.stringify(rpcBody), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }) as typeof fetch;
  console.info = ((...args: unknown[]) => logs.push(JSON.stringify(args))) as typeof console.info;
  console.warn = ((...args: unknown[]) => logs.push(JSON.stringify(args))) as typeof console.warn;
  console.error = ((...args: unknown[]) => logs.push(JSON.stringify(args))) as typeof console.error;
  const res = {
    setHeader(name: string, value: string) { responseHeaders[name] = value; return this; },
    status(code: number) { status = code; return this; },
    json(value: Record<string, unknown>) { body = value; return this; },
  };
  try {
    await handler({
      method: options.method ?? 'POST',
      headers: { authorization: options.token ?? `Bearer ${scopedKey}`, 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.77', 'content-length': '20' },
      body: { memo: options.memo ?? 'SC-A1B2C3' },
    } as never, res as never);
    return { status, body, headers: responseHeaders };
  } finally {
    globalThis.fetch = originalFetch;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    for (const name of names) {
      const value = previous[name];
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
    assert.equal(logs.join('\n').includes(scopedKey), false, 'operator secret must not be logged');
  }
}

test('mark-paid is POST-only, no-store and validates its memo before mutation', async () => {
  const method = await request({ method: 'GET' });
  assert.equal(method.status, 405);
  assert.equal(method.headers['Cache-Control'], 'no-store, max-age=0');
  assert.equal(method.headers['X-Robots-Tag'], 'noindex, nofollow');
  const invalid = await request({ memo: 'sc-123' });
  assert.equal(invalid.status, 400);
});

test('mark-paid requires the dedicated scoped key and rejects the legacy shared key', async () => {
  const missing = await request({ scoped: false, token: 'Bearer synthetic-legacy-key-32-characters' });
  assert.equal(missing.status, 503);
  const wrong = await request({ token: 'Bearer wrong-synthetic-key' });
  assert.equal(wrong.status, 401);
});

test('mark-paid reports paid and idempotent repeat results from the database RPC', async () => {
  const paid = await request({ rpc: 'paid' });
  assert.equal(paid.status, 200);
  assert.equal(paid.body?.status, 'paid');
  assert.equal(paid.body?.paidAt, '2026-10-29T10:00:00.000Z');
  const repeat = await request({ rpc: 'already_paid' });
  assert.equal(repeat.status, 200);
  assert.equal(repeat.body?.status, 'already_paid');
});

test('mark-paid safely handles unknown memos and database failures', async () => {
  const missing = await request({ rpc: 'not_found' });
  assert.equal(missing.status, 404);
  const failed = await request({ rpc: 'down' });
  assert.equal(failed.status, 503);
  assert.equal(failed.body?.error, 'Payment status could not be updated.');
});
