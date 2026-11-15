import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/sepay-webhook.js';

type Reply = { status: number; body?: Record<string, unknown> };
type Options = {
  date?: string; receivedAt?: string; auth?: string; enabled?: boolean; transferType?: string; content?: string; amount?: unknown; rpc?: 'paid' | 'already_paid' | 'not_found' | 'down' };

async function request(options: Options = {}): Promise<{ reply: Reply; calls: string[]; logs: string[] }> {
  // The owner alert (api/_lib/paymentAlert.ts) stays off here: no Resend key or owner address, so `calls` lists RPCs only.
  const envNames = ['SEPAY_WEBHOOK_KEY', 'SEPAY_AUTOCONFIRM', 'SUPABASE_URL', 'SUPABASE_WRITE_KEY', 'RESEND_API_KEY', 'ORDER_NOTIFY_EMAIL', 'GET_STARTED_NOTIFY_EMAIL'] as const;
  const oldEnv = Object.fromEntries(envNames.map(name => [name, process.env[name]]));
  // The handler reads the receipt time with `new Date()`: pin it. Default: five seconds after the transfer stamp.
  const stamp = options.date ?? '2026-11-30 10:00:00';
  mock.timers.enable({ apis: ['Date'], now: options.receivedAt ? new Date(options.receivedAt) : new Date(Date.parse(`${stamp.replace(' ', 'T')}+07:00`) + 5_000) });
  const originalFetch = globalThis.fetch;
  const originalInfo = console.info;
  const calls: string[] = [];
  const logs: string[] = [];
  process.env.SEPAY_WEBHOOK_KEY = 'synthetic-sepay-webhook-key-32chars';
  process.env.SEPAY_AUTOCONFIRM = options.enabled === false ? '0' : '1';
  process.env.SUPABASE_URL = 'http://127.0.0.1:55421';
  process.env.SUPABASE_WRITE_KEY = 'sb_secret_synthetic-write-key';
  delete process.env.RESEND_API_KEY;
  delete process.env.ORDER_NOTIFY_EMAIL;
  delete process.env.GET_STARTED_NOTIFY_EMAIL;
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
      transferType: options.transferType ?? 'in', content: options.content ?? 'Payment SC-ABFD01', transferAmount: options.amount ?? 590000, transactionDate: options.date ?? '2026-11-30 10:00:00',
      accountNumber: 'SYNTHETIC-MUST-NOT-LOG', description: 'Synthetic payer name must not be logged',
    } } as never, res as never);
    return { reply: { status, body }, calls, logs };
  } finally {
    mock.timers.reset();
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

// Story Club launch offer (src/config/storyClubOffer.ts): the minimum is the dated price at the transfer time, Vietnam time,
// with a 30-minute grace after each cut-off. Receipt time is pinned to 5 seconds after the transfer stamp.
test('launch-offer tiers and grace: short or late money goes to manual review, never auto-confirm', async () => {
  const cases: Array<[string, string, number, boolean]> = [
    ['first tier, one second before the cut-off', '2026-11-21 12:59:59', 295000, true],
    ['first tier, short by 1₫', '2026-11-21 12:59:59', 294999, false],
    ['one second after the first cut-off: grace keeps 295000', '2026-11-21 13:00:01', 295000, true],
    ['last second of the 30-minute grace', '2026-11-21 13:29:55', 295000, true],
    ['after the grace the second price is needed', '2026-11-21 13:30:01', 295000, false],
    ['after the grace the second price is accepted', '2026-11-21 13:30:01', 440000, true],
    ['second tier, one second before its cut-off', '2026-11-28 12:59:59', 440000, true],
    ['second tier, short by 1₫', '2026-11-28 12:59:59', 439999, false],
    ['one second after the second cut-off: grace keeps 440000', '2026-11-28 13:00:01', 440000, true],
    ['after the second grace the list price is needed', '2026-11-28 13:30:01', 440000, false],
    ['list price after the offers', '2026-11-28 13:30:01', 590000, true],
  ];
  for (const [label, date, amount, paid] of cases) {
    const result = await request({ date, amount });
    assert.equal(result.reply.status, 200, label);
    assert.equal(result.calls.length, paid ? 1 : 0, label);
    assert.match(result.logs.join('\n'), paid ? /paid/ : /needs_review/, label);
  }
});

test('time-zone guard: a UTC-shaped transfer stamp cannot buy the first tier after its cut-off', async () => {
  // Transfer really arrives Sat 14 Nov 15:00 Vietnam time (08:00 UTC). If SePay stamped it in UTC ("08:00:00"), reading that as
  // Vietnam time would say 08:00 and accept 295000. The stamp is 7 hours before receipt, so the receipt time decides.
  const utcShaped = await request({ date: '2026-11-21 08:00:00', receivedAt: '2026-11-21T15:00:00+07:00', amount: 295000 });
  assert.equal(utcShaped.calls.length, 0, '295000 is not auto-confirmed');
  assert.match(utcShaped.logs.join('\n'), /needs_review/);
  const paidInFull = await request({ date: '2026-11-21 08:00:00', receivedAt: '2026-11-21T15:00:00+07:00', amount: 440000 });
  assert.equal(paidInFull.calls.length, 1, 'the second price is still accepted');
  // A stamp later than the receipt time is not believed either.
  const future = await request({ date: '2026-11-21 12:00:00', receivedAt: '2026-11-21T15:00:00+07:00', amount: 295000 });
  assert.equal(future.calls.length, 0);
});
