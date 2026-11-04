import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/event';

test('reserve funnel events are accepted and written once to the mocked Supabase RPC without PII', async (t) => {
  const originalFetch = globalThis.fetch;
  const names = ['SUPABASE_URL', 'SUPABASE_WRITE_KEY', 'SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'ENABLE_DURABLE_RATE_LIMIT'] as const;
  const originalEnv = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  t.after(() => {
    globalThis.fetch = originalFetch;
    for (const name of names) {
      const value = originalEnv[name];
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  process.env.SUPABASE_URL = 'https://synthetic.supabase.invalid';
  process.env.SUPABASE_WRITE_KEY = 'sb_secret_synthetic_test_key';
  delete process.env.SUPABASE_SECRET_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.ENABLE_DURABLE_RATE_LIMIT;

  const writes: Array<Record<string, unknown>> = [];
  globalThis.fetch = (async (input, init) => {
    assert.equal(String(input), 'https://synthetic.supabase.invalid/rest/v1/rpc/record_je_event');
    assert.equal(init?.method, 'POST');
    writes.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    return new Response(null, { status: 204 });
  }) as typeof fetch;

  for (const event of ['reserve_view', 'reserve_submit', 'pay_instructions_shown']) {
    let status = 200;
    let ended = false;
    const res = {
      setHeader() { return this; },
      status(code: number) { status = code; return this; },
      end() { ended = true; return this; },
      json() { throw new Error('unexpected JSON response'); },
    };
    await handler({
      method: 'POST',
      headers: { 'x-forwarded-for': `198.51.100.${70 + writes.length}`, 'content-type': 'application/json' },
      body: { event, path: '/story-club/reserve', product_id: 'story-club', locale: 'vi', utm_source: 'synthetic', utm_content: 'reserve-qa' },
    } as never, res as never);
    assert.equal(status, 204, event);
    assert.equal(ended, true, event);
  }

  assert.deepEqual(writes.map((write) => write.p_event), ['reserve_view', 'reserve_submit', 'pay_instructions_shown']);
  for (const write of writes) {
    assert.deepEqual(Object.keys(write).sort(), ['p_event', 'p_locale', 'p_path', 'p_product_id', 'p_utm_content', 'p_utm_source'].sort());
    assert.equal(Object.keys(write).some((key) => /email|phone|name|ip|user.?id/i.test(key)), false);
  }
});
