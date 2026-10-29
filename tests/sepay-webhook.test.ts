import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/sepay-webhook.js';

type Reply = { status: number; body?: Record<string, unknown> };
type Options = { auth?: string; enabled?: boolean; transferType?: string; content?: string; amount?: unknown; rpc?: 'paid' | 'already_paid' | 'not_found' | 'down' };

async function request(options: Options = {}): Promise<{ reply: Reply; calls: string[]; logs: string[] }> {
  const envNames = ['SEPAY_WEBHOOK_KEY', 'SEPAY_AUTOCONFIRM', 'SUPABASE_URL', 'SUPABASE_WRITE_KEY'] as const;
  const oldEnv = Object.fromEntries(envNames.map(name => [name, process.env[name]]));
  const originalFetch = globalThis.fetch;
  const originalInfo = console.info;
  const calls: string[] = [];
  const logs: string[] = [];
  process.env.SEPAY_WEBHOOK_KEY = 'synthetic-sepay-webhook-key-32chars';
  process.env.SEPAY_AUTOCONFIRM = options.enabled === false ? '0' : '1';
  process.env.SUPABASE_URL = 'http://127.0.0.1:55421';
  process.env.SUPABASE_WRITE_KEY = 'sb_secret_synthetic-write-key';
  globalThis.fetch = (async (input) => {
    calls.push(String(input));
    if (options.rpc === 'down') throw new Error('synthetic database unavailable');
    const status = options.rpc === 'already_paid' ? 'already_paid' : options.rpc === 'not_found' ? 'not_found' : 'paid';
    return new Response(JSON.stringify({ status, paid_at: status === 'not_found' ? null : '2026-10-29T10:00:00Z' }), { status: 200 });
  }) as typeof fetch;
  console.info = ((...args: unknown[]) => logs.push(JSON.stringify(args))) as typeof console.info;
  let status = 200;
  let body: Record<string, unknown> | undefined;
  const res = { setHeader() { return this; }, status(code: number) { status = code; return this; }, json(value: Record<string, unknown>) { body = value; return this; } };
  try {
    await handler({ method: 'POST', headers: { authorization: options.auth ?? 'Apikey synthetic-sepay-webhook-key-32chars', 'content-type': 'application/json', 'content-length': '100' }, body: {
      transferType: options.transferType ?? 'in', content: options.content ?? 'Payment SC-ABFD01', transferAmount: options.amount ?? 590000,
      accountNumber: 'SYNTHETIC-MUST-NOT-LOG', description: 'Synthetic payer name must not be logged',
    } } as never, res as never);
    return { reply: { status, body }, calls, logs };
  } finally {
    globalThis.fetch = originalFetch;
    console.info = originalInfo;
    for (const name of envNames) oldEnv[name] === undefined ? delete process.env[name] : process.env[name] = oldEnv[name]!;
    assert.equal(logs.join('\n').includes('SYNTHETIC-MUST-NOT-LOG'), false);
    assert.equal(logs.join('\n').includes('Synthetic payer name'), false);
  }
}

test('rejects bad API key with 401 and does not call the RPC', async () => {
  const result = await request({ auth: 'Apikey wrong' });
  assert.equal(result.reply.status, 401);
  assert.deepEqual(result.calls, []);
});

test('normalizes hyphenated, spaced, and unhyphenated memo formats', async () => {
  for (const content of ['memo SC-ABFD01', 'memo SC ABFD01', 'memo SCABFD01', 'memo sc-abfd01']) {
    const result = await request({ content });
    assert.equal(result.reply.status, 200, content);
    assert.equal(result.reply.body?.success, true);
    assert.equal(result.logs.join('\n').includes('SC-ABFD01'), true);
  }
});

test('short payment and unknown memo acknowledge without mutation and log only review status', async () => {
  const short = await request({ amount: 589999 });
  const unknown = await request({ content: 'unrelated transfer' });
  assert.equal(short.reply.status, 200);
  assert.equal(unknown.reply.status, 200);
  assert.deepEqual(short.calls, []);
  assert.deepEqual(unknown.calls, []);
  assert.match(short.logs.join('\n'), /needs_review/);
  assert.match(unknown.logs.join('\n'), /needs_review/);
});

test('outgoing transfer is ignored and duplicate database delivery is idempotently acknowledged', async () => {
  const outgoing = await request({ transferType: 'out' });
  const duplicate = await request({ rpc: 'already_paid' });
  assert.equal(outgoing.reply.status, 200);
  assert.deepEqual(outgoing.calls, []);
  assert.equal(duplicate.reply.status, 200);
  assert.equal(duplicate.reply.body?.success, true);
  assert.match(duplicate.logs.join('\n'), /already_paid/);
});

test('unknown reservation is acknowledged; transient RPC failure is retryable; feature flag defaults off', async () => {
  const unknownReservation = await request({ rpc: 'not_found' });
  const transient = await request({ rpc: 'down' });
  const disabled = await request({ enabled: false });
  assert.equal(unknownReservation.reply.status, 200);
  assert.equal(unknownReservation.reply.body?.success, true);
  assert.equal(transient.reply.status, 503);
  assert.equal(transient.reply.body?.success, false);
  assert.equal(disabled.reply.status, 503);
});
