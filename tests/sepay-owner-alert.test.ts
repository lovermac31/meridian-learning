import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import handler from '../api/sepay-webhook.js';
import { _resetPaymentAlerts, alertPaymentEvent, sepayAlertEvent } from '../api/_lib/paymentAlert.js';

// Funnel audit fix 3 (2 Nov 2026): after the SePay webhook answers, Jay gets ONE short email per incoming transfer
// (paid-clean or needs-review), de-duplicated per transaction id, with memo, amount and outcome only. Mocks only:
// no real webhook, no real email. The alert never changes the webhook's answer.

const PAYER = 'SYNTHETIC-PAYER-MUST-NOT-APPEAR';
type Sent = { url: string; body: Record<string, unknown> };

async function deliver(options: { content?: string; amount?: unknown; transferType?: string; id?: unknown; rpc?: 'paid' | 'already_paid' | 'not_found' | 'down'; resend?: 'ok' | 'fail' | 'throw'; auth?: string; notify?: boolean }) {
  const envNames = ['SEPAY_WEBHOOK_KEY', 'SEPAY_AUTOCONFIRM', 'SUPABASE_URL', 'SUPABASE_WRITE_KEY', 'RESEND_API_KEY', 'ORDER_NOTIFY_EMAIL', 'GET_STARTED_NOTIFY_EMAIL', 'GET_STARTED_FROM_EMAIL'] as const;
  const oldEnv = Object.fromEntries(envNames.map((n) => [n, process.env[n]]));
  const originalFetch = globalThis.fetch;
  const originalInfo = console.info;
  const originalError = console.error;
  const emails: Sent[] = [];
  const rpcs: string[] = [];
  const logs: string[] = [];
  Object.assign(process.env, {
    SEPAY_WEBHOOK_KEY: 'synthetic-sepay-webhook-key-32chars', SEPAY_AUTOCONFIRM: '1', SUPABASE_URL: 'http://127.0.0.1:55421', SUPABASE_WRITE_KEY: 'sb_secret_synthetic-write-key',
    RESEND_API_KEY: 're_synthetic', GET_STARTED_FROM_EMAIL: 'alerts@example.test',
  });
  delete process.env.GET_STARTED_NOTIFY_EMAIL;
  if (options.notify === false) delete process.env.ORDER_NOTIFY_EMAIL; else process.env.ORDER_NOTIFY_EMAIL = 'owner@example.test';
  globalThis.fetch = (async (input, init) => {
    const url = String(input);
    if (url.startsWith('https://api.resend.com/')) {
      if (options.resend === 'throw') throw new Error('synthetic network error');
      emails.push({ url, body: JSON.parse(String(init?.body)) as Record<string, unknown> });
      return new Response(options.resend === 'fail' ? '{"error":"synthetic"}' : '{"id":"synthetic"}', { status: options.resend === 'fail' ? 500 : 200 });
    }
    rpcs.push(url);
    if (options.rpc === 'down') throw new Error('synthetic database unavailable');
    const status = options.rpc ?? 'paid';
    return new Response(JSON.stringify({ status, paid_at: status === 'not_found' ? null : '2026-10-29T10:00:00Z' }), { status: 200 });
  }) as typeof fetch;
  mock.timers.enable({ apis: ['Date'], now: new Date('2026-11-23T10:00:05+07:00') }); // receipt time just after the 2026-11-23 10:00:00 stamp
  console.info = ((...args: unknown[]) => logs.push(JSON.stringify(args))) as typeof console.info;
  console.error = ((...args: unknown[]) => logs.push(JSON.stringify(args))) as typeof console.error;
  let status = 0;
  let body: Record<string, unknown> | undefined;
  const res = { setHeader() { return this; }, status(code: number) { status = code; return this; }, json(value: Record<string, unknown>) { body = value; return this; } };
  try {
    await handler({ method: 'POST', headers: { authorization: options.auth ?? 'Apikey synthetic-sepay-webhook-key-32chars', 'content-type': 'application/json', 'content-length': '100' }, body: {
      id: options.id ?? 1001, transferType: options.transferType ?? 'in', content: options.content ?? 'Payment SC-ABFD01', transferAmount: options.amount ?? 590000, transactionDate: '2026-11-23 10:00:00',
      accountNumber: PAYER, description: PAYER, referenceCode: PAYER,
    } } as never, res as never);
    return { status, body, emails, rpcs, logs };
  } finally {
    mock.timers.reset();
    globalThis.fetch = originalFetch;
    console.info = originalInfo;
    console.error = originalError;
    for (const n of envNames) oldEnv[n] === undefined ? delete process.env[n] : process.env[n] = oldEnv[n]!;
  }
}

test.beforeEach(() => _resetPaymentAlerts());

test('a clean Story Club payment sends one alert with memo, amount and outcome, and nothing from the payer', async () => {
  const r = await deliver({ id: 2001 });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { success: true });
  assert.equal(r.rpcs.length, 1, 'the reservation RPC ran as before');
  assert.equal(r.emails.length, 1);
  const email = r.emails[0].body;
  assert.deepEqual(email.to, ['owner@example.test']);
  assert.equal(email.from, 'alerts@example.test');
  assert.equal(email.subject, '[Payments] SePay paid: SC-ABFD01 (590.000₫)');
  const text = String(email.text);
  for (const line of ['Transaction: 2001', 'Memo: SC-ABFD01', 'Amount: 590.000₫', 'Outcome: paid', 'Webhook answer: HTTP 200']) assert.ok(text.includes(line), line);
  assert.ok(!JSON.stringify(email).includes(PAYER), 'no payer data in the email');
  assert.ok(!r.logs.join('\n').includes(PAYER), 'no payer data in the logs');
});

test('every needs-review outcome alerts once: no memo, a non-SC memo, a short amount, an unknown reservation', async () => {
  const cases: Array<[string, Parameters<typeof deliver>[0], string]> = [
    ['no memo', { id: 3001, content: 'unrelated transfer' }, '[Payments] SePay needs review: unknown (590.000₫)'],
    ['BL- memo', { id: 3002, content: 'Baseline BL-ABCDEF', amount: 690000 }, '[Payments] SePay needs review: BL-ABCDEF (690.000₫)'],
    ['short amount', { id: 3003, amount: 589999 }, '[Payments] SePay needs review: SC-ABFD01 (589.999₫)'],
    ['unknown reservation', { id: 3004, rpc: 'not_found' }, '[Payments] SePay needs review: SC-ABFD01 (590.000₫)'],
  ];
  for (const [name, options, subject] of cases) {
    const r = await deliver(options);
    assert.equal(r.status, 200, name);
    assert.equal(r.emails.length, 1, `${name}: one email`);
    assert.equal(r.emails[0].body.subject, subject, name);
    assert.ok(String(r.emails[0].body.text).includes('Outcome: needs_review'), name);
  }
});

test('no alert for outgoing transfers, re-deliveries already paid, bad keys or retried (503) deliveries', async () => {
  for (const [name, options, status] of [
    ['outgoing', { id: 4001, transferType: 'out' }, 200],
    ['already paid', { id: 4002, rpc: 'already_paid' }, 200],
    ['bad key', { id: 4003, auth: 'Apikey wrong' }, 401],
    ['database down', { id: 4004, rpc: 'down' }, 503],
  ] as const) {
    const r = await deliver(options);
    assert.equal(r.status, status, name);
    assert.deepEqual(r.emails, [], `${name}: no email`);
  }
});

test('de-duplicated per transaction id and outcome; a failed send is forgotten so a later delivery may try again', async () => {
  const first = await deliver({ id: 5001 });
  const again = await deliver({ id: 5001 });
  const other = await deliver({ id: 5002 });
  assert.equal(first.emails.length, 1);
  assert.equal(again.emails.length, 0, 'same transaction, same outcome: no second email');
  assert.equal(other.emails.length, 1, 'a different transaction alerts');
  _resetPaymentAlerts();
  const failed = await deliver({ id: 5003, resend: 'fail' });
  assert.equal(failed.status, 200, 'a failed send never changes the answer');
  assert.deepEqual(failed.body, { success: true });
  const retried = await deliver({ id: 5003 });
  assert.equal(retried.emails.length, 1, 'after a failed send the next delivery alerts');
});

test('the alert never changes the response: a throwing mail transport, or no owner address, still answers 200', async () => {
  const thrown = await deliver({ id: 6001, resend: 'throw' });
  assert.equal(thrown.status, 200);
  assert.deepEqual(thrown.body, { success: true });
  assert.match(thrown.logs.join('\n'), /sepay_payment_alert_send_failed/);
  const off = await deliver({ id: 6002, notify: false });
  assert.equal(off.status, 200);
  assert.deepEqual(off.emails, []);
  assert.equal(off.rpcs.length, 1, 'the payment itself still ran');
});

test('event derivation and the send are pure enough to test alone: no id, no alert; timeout counts as failed', async () => {
  assert.equal(sepayAlertEvent(200, 'paid', 'SC-ABFD01', { transferAmount: 590000 }), null, 'no transaction id');
  assert.equal(sepayAlertEvent(503, 'retry', 'SC-ABFD01', { id: 1 }), null);
  assert.deepEqual(sepayAlertEvent(200, 'needs_review', 'unknown', { id: 'tx-9', transferAmount: '150000' }), { txn: 'tx-9', memo: 'unknown', amount: '150.000₫', outcome: 'needs_review', httpStatus: 200 });
  const slow = (() => new Promise<Response>(() => { /* never resolves */ })) as unknown as typeof fetch;
  const env = { RESEND_API_KEY: 're_x', ORDER_NOTIFY_EMAIL: 'o@example.test' };
  assert.equal(await alertPaymentEvent({ txn: 't1', memo: 'SC-ABFD01', amount: '590.000₫', outcome: 'paid', httpStatus: 200 }, { fetch: slow, timeoutMs: 20, env }), 'failed');
  assert.equal(await alertPaymentEvent({ txn: 't1', memo: 'SC-ABFD01', amount: '590.000₫', outcome: 'paid', httpStatus: 200 }, { env: { ...env, RESEND_API_KEY: undefined } }), 'off');
  // No new secret names: the module reads only names the site already uses.
  const src = readFileSync('api/_lib/paymentAlert.ts', 'utf8');
  assert.deepEqual([...new Set(src.match(/env\.([A-Z_]+)/g))].sort(), ['env.GET_STARTED_FROM_EMAIL', 'env.GET_STARTED_NOTIFY_EMAIL', 'env.ORDER_NOTIFY_EMAIL', 'env.RESEND_API_KEY']);
});
