import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { POLL, checkPayStatus, isFinalPayState, payStatusSource, pollDelay, watchPayment, type PayCheck, type PayState } from '../src/lib/payStatus';
import { PayStep, PAY_STATUS_COPY } from '../src/components/PayStep';
import { createPaidMemo, isMisroutableMemo } from '../api/sample-pack';
import { PAID_OFFERS, LIVE_CHECK_OFFER } from '../src/config/payment';

// --- status source per code family ---------------------------------------------------------------------------------------

test('PR and LC poll the same-origin AI Speaking proxy, SC polls JE, 1T is manual, anything else has no status', () => {
  assert.deepEqual(payStatusSource('PR0S-AB12CD'), { kind: 'auto', family: 'product', url: '/ai-speaking/api/pay/status?code=PR0S-AB12CD' });
  assert.deepEqual(payStatusSource('PR1A-ZZ0000'), { kind: 'auto', family: 'product', url: '/ai-speaking/api/pay/status?code=PR1A-ZZ0000' });
  assert.deepEqual(payStatusSource('LC-AB12CD'), { kind: 'auto', family: 'live-check', url: '/ai-speaking/api/pay/status?code=LC-AB12CD' });
  assert.deepEqual(payStatusSource('SC-AB12CD'), { kind: 'auto', family: 'story-club', url: '/api/story-club/status?code=SC-AB12CD' });
  assert.deepEqual(payStatusSource('1T-AB12CD'), { kind: 'manual' });
  for (const bad of ['BL-AB12CD', 'PR0S-AB12C', 'pr0s-ab12cd', 'PR0S-AB12CD&x=1', 'https://evil.example/PR0S-AB12CD', '', null, 42]) assert.deepEqual(payStatusSource(bad), { kind: 'none' });
  // Every offer on sale maps to the source the brief names.
  for (const offer of [...PAID_OFFERS, LIVE_CHECK_OFFER]) {
    const source = payStatusSource(`${offer.prefix}-AB12CD`);
    const expected = offer.prefix === 'SC' ? 'auto' : offer.prefix === '1T' ? 'manual' : offer.prefix === 'BL' ? 'none' : 'auto';
    assert.equal(source.kind, expected, offer.id);
  }
});

test('poll cadence: 5 s for 2 min, then 15 s; back-off doubles and caps at 60 s', () => {
  assert.equal(pollDelay(0), 5_000);
  assert.equal(pollDelay(119_999), 5_000);
  assert.equal(pollDelay(120_000), 15_000);
  assert.deepEqual([0, 1, 2, 3, 4].map(b => pollDelay(0, b)), [5_000, 10_000, 20_000, 40_000, 60_000]);
  assert.deepEqual([0, 1, 2, 3].map(b => pollDelay(200_000, b)), [15_000, 30_000, 60_000, 60_000]);
  assert.equal(POLL.until, 30 * 60_000);
});

// --- one status check ----------------------------------------------------------------------------------------------------

const reply = (status: number, body: unknown) => async () => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

test('a status check returns only a known status word; 429, 400 unknown_code, 5xx, bad JSON and network errors are not statuses', async () => {
  for (const status of ['waiting', 'received', 'underpaid', 'overpaid'] as const) assert.equal(await checkPayStatus('/x', reply(200, { status }) as typeof fetch), status);
  assert.equal(await checkPayStatus('/x', reply(200, { status: 'paid' }) as typeof fetch), 'error');
  assert.equal(await checkPayStatus('/x', reply(200, 'not json') as typeof fetch), 'error');
  assert.equal(await checkPayStatus('/x', reply(429, { error: 'rate_limited' }) as typeof fetch), 'rate');
  assert.equal(await checkPayStatus('/x', reply(400, { error: 'unknown_code' }) as typeof fetch), 'unknown');
  assert.equal(await checkPayStatus('/x', reply(400, {}) as typeof fetch), 'error');
  assert.equal(await checkPayStatus('/x', reply(503, { error: 'unavailable' }) as typeof fetch), 'error');
  assert.equal(await checkPayStatus('/x', (async () => { throw new TypeError('offline'); }) as typeof fetch), 'error');
});

test('a status check is a same-origin no-store GET that sends nothing but the URL', async () => {
  let seen: { url: string; init?: RequestInit } | undefined;
  await checkPayStatus('/ai-speaking/api/pay/status?code=PR0S-AB12CD', (async (url: string, init?: RequestInit) => { seen = { url, init }; return new Response('{"status":"waiting"}'); }) as typeof fetch);
  assert.equal(seen?.url, '/ai-speaking/api/pay/status?code=PR0S-AB12CD');
  assert.equal(seen?.init?.method, 'GET');
  assert.equal(seen?.init?.cache, 'no-store');
  assert.equal(seen?.init?.body, undefined);
  assert.ok(seen?.init?.signal, 'every check can be aborted (timeout or hidden tab)');
});

// --- the polling state machine (fake clock, fake timers, fake document) --------------------------------------------------

function harness(answers: (n: number) => Response | Promise<Response> | 'throw') {
  let clock = 0;
  const pending: { fn: () => void; at: number; id: number }[] = [];
  let nextId = 1;
  const listeners = new Set<() => void>();
  const doc = { hidden: false, addEventListener: (_: 'visibilitychange', fn: () => void) => { listeners.add(fn); }, removeEventListener: (_: 'visibilitychange', fn: () => void) => { listeners.delete(fn); } };
  const states: PayState[] = [];
  const checks: PayCheck[] = [];
  const delays: number[] = [];
  let calls = 0;
  const request = (async () => { const answer = answers(++calls); if (answer === 'throw') throw new TypeError('offline'); return answer; }) as typeof fetch;
  const stop = watchPayment({
    url: '/ai-speaking/api/pay/status?code=PR0S-AB12CD', request, doc, now: () => clock, onState: s => states.push(s), onCheck: c => checks.push(c),
    timers: { set: (fn, ms) => { delays.push(ms); const id = nextId++; pending.push({ fn, at: clock + ms, id }); return id; }, clear: id => { const i = pending.findIndex(p => p.id === id); if (i >= 0) pending.splice(i, 1); } },
  });
  const flush = () => new Promise(resolve => setImmediate(resolve));
  return {
    states, checks, delays, doc, stop, get calls() { return calls; }, get pending() { return pending.length; },
    /** Runs the next timer (advancing the clock to it) and lets its check settle. */
    async step() { pending.sort((a, b) => a.at - b.at); const next = pending.shift(); if (!next) return false; clock = Math.max(clock, next.at); next.fn(); await flush(); await flush(); return true; },
    setHidden(hidden: boolean) { doc.hidden = hidden; for (const fn of [...listeners]) fn(); },
    advance(ms: number) { clock += ms; },
    listeners,
  };
}
const status = (value: string) => new Response(JSON.stringify({ status: value }), { status: 200 });

test('waiting → received: shows waiting at once, polls every 5 s, stops on received', async () => {
  const h = harness(n => status(n < 3 ? 'waiting' : 'received'));
  assert.deepEqual(h.states, ['waiting']);
  for (let i = 0; i < 3; i += 1) await h.step();
  assert.deepEqual(h.states, ['waiting', 'received']);
  assert.deepEqual(h.checks, ['waiting', 'waiting', 'received']);
  assert.deepEqual(h.delays, [5_000, 5_000, 5_000]);
  assert.equal(h.pending, 0, 'no timer left after a final state');
  assert.equal(h.listeners.size, 0, 'visibility listener removed');
  assert.ok(isFinalPayState('received') && isFinalPayState('underpaid') && isFinalPayState('overpaid') && !isFinalPayState('waiting') && !isFinalPayState('expired'));
});

test('underpaid and overpaid are final states too', async () => {
  for (const word of ['underpaid', 'overpaid'] as const) {
    const h = harness(() => status(word));
    await h.step();
    assert.deepEqual(h.states, ['waiting', word]);
    assert.equal(h.pending, 0);
  }
});

test('429 doubles the interval up to 60 s; a waiting answer resets it', async () => {
  const h = harness(n => n <= 5 ? new Response('{"error":"rate_limited"}', { status: 429 }) : status('waiting'));
  for (let i = 0; i < 7; i += 1) await h.step();
  assert.deepEqual(h.delays.slice(0, 8), [5_000, 10_000, 20_000, 40_000, 60_000, 60_000, 15_000, 15_000]);
  assert.deepEqual(h.states, ['waiting'], 'the waiting line never changes on 429');
});

test('network errors and 400 unknown_code keep the waiting line', async () => {
  const h = harness(n => n % 2 ? 'throw' : new Response('{"error":"unknown_code"}', { status: 400 }));
  for (let i = 0; i < 6; i += 1) await h.step();
  assert.deepEqual(h.states, ['waiting']);
  assert.deepEqual(h.checks, ['error', 'unknown', 'error', 'unknown', 'error', 'unknown']);
});

test('a hidden tab pauses polling and checks at once when visible again', async () => {
  const h = harness(n => status(n < 2 ? 'waiting' : 'received'));
  await h.step();
  assert.equal(h.calls, 1);
  h.setHidden(true);
  assert.equal(h.pending, 0, 'no timer while hidden');
  h.advance(10 * 60_000);
  assert.equal(await h.step(), false);
  assert.equal(h.calls, 1, 'no request while hidden');
  h.setHidden(false);
  assert.equal(h.delays.at(-1), 0, 'immediate check on return');
  await h.step();
  assert.deepEqual(h.states, ['waiting', 'received']);
});

test('after 30 minutes without a match the state is expired and polling stops', async () => {
  const h = harness(() => status('waiting'));
  let guard = 0;
  while (await h.step()) if (++guard > 500) assert.fail('never expired');
  assert.deepEqual(h.states, ['waiting', 'expired']);
  // 24 checks in the first 2 min (every 5 s), then every 15 s to 30 min.
  assert.ok(h.calls > 100 && h.calls < 140, `calls ${h.calls}`);
});

test('stop() cancels the timer and removes the listener', async () => {
  const h = harness(() => status('waiting'));
  h.stop();
  assert.equal(h.pending, 0);
  assert.equal(h.listeners.size, 0);
});

// --- the pay step markup -------------------------------------------------------------------------------------------------

const render = (productId: string, memo: string, amount: number, locale: 'en' | 'vi' = 'en') =>
  renderToStaticMarkup(createElement(PayStep, { locale, amount, memo, productId }));

test('each pay step has exactly one polite live region, after the memo and the QR', () => {
  for (const offer of [...PAID_OFFERS, LIVE_CHECK_OFFER]) for (const locale of ['en', 'vi'] as const) {
    const html = render(offer.id, `${offer.prefix}-AB12CD`, offer.amount, locale);
    assert.equal(html.match(/aria-live="polite"/g)?.length, 1, `${offer.id} ${locale}`);
    assert.equal(html.match(/role="status"/g)?.length, 1);
    assert.ok(html.indexOf('data-pay-status') > html.indexOf('data-payment-qr'), 'status comes after the QR');
    assert.ok(html.indexOf('data-pay-status') > html.indexOf('data-transfer-memo'));
  }
});

test('1-to-1 shows the by-hand line and never polls; other codes start without a status word before hydration', () => {
  assert.match(render('one-to-one', '1T-AB12CD', 5_600_000), /We confirm 1-to-1 payments by hand\. We’ll message you on Zalo after we check it\./);
  assert.match(render('one-to-one', '1T-AB12CD', 5_600_000, 'vi'), /Chúng tôi xác nhận thanh toán gói 1-1 thủ công/);
  assert.doesNotMatch(render('printable-pack', 'PR03-AB12CD', 149_000), /data-pay-manual|data-pay-waiting/);
});

test('the status copy matches the JurassicIELTS pay step word for word', () => {
  assert.equal(PAY_STATUS_COPY.en.waiting, 'Waiting for your transfer… This page updates by itself. Keep it open.');
  assert.equal(PAY_STATUS_COPY.vi.waiting, 'Đang chờ bạn chuyển khoản… Trang sẽ tự cập nhật, vui lòng giữ trang mở.');
  assert.equal(PAY_STATUS_COPY.en.received, 'Payment received. Thank you!');
  assert.equal(PAY_STATUS_COPY.vi.received, 'Đã nhận thanh toán. Cảm ơn bạn!');
  assert.deepEqual(PAY_STATUS_COPY.en.next.product.zalo.link, ['Message us on Zalo with your code ', ' to receive your files.']);
  assert.deepEqual(PAY_STATUS_COPY.vi.next.product.zalo.link, ['Nhắn Zalo cho chúng tôi kèm mã ', ' để nhận tài liệu.']);
  assert.equal(PAY_STATUS_COPY.en.expired.before + PAY_STATUS_COPY.en.expired.link.join('CODE'), 'Already paid? Message us on Zalo with your code CODE.');
});

// --- memo generator ------------------------------------------------------------------------------------------------------

const rawSuffix = (seed: string) => (createHash('sha256').update(seed).digest().readUIntBE(0, 6) % 36 ** 6).toString(36).toUpperCase().padStart(6, '0');

const misroutable = (memo: string) => { const [prefix, suffix] = memo.split('-') as [string, string]; return /BL|JE/.test(prefix.slice(-1) + suffix) || /[BJ]$/.test(suffix); };

test('the misroute guard rejects the reviewer examples and every BL/JE or trailing B/J shape', () => {
  for (const [prefix, suffix] of [['LC', 'W1A7BL'], ['PR03', 'ABCDBL'], ['PR0B', 'L3F2A1'], ['PR03', 'BL3F2A'], ['PR03', 'JEAI12'], ['PR03', 'A1JE2C'], ['PR03', 'A1B2CB'], ['1T', 'A1B2CJ'], ['PR0J', 'E12345'] /* prefix J + E */] as const) {
    assert.equal(isMisroutableMemo(prefix, suffix), true, `${prefix}-${suffix}`);
  }
  for (const [prefix, suffix] of [['PR03', 'AB12CD'], ['PR0B', 'A3F2L1'], ['LC', 'B1A7L2']] as const) {
    assert.equal(isMisroutableMemo(prefix, suffix), false, `${prefix}-${suffix}`);
  }
});

test('createPaidMemo: a misroutable first draw is redrawn, stable on retry; a clean first draw is unchanged', () => {
  // Real submission ids whose first draw is misroutable, one per kind.
  const found: Record<'inner' | 'trailing', string | undefined> = { inner: undefined, trailing: undefined };
  for (let i = 0; i < 200_000 && !(found.inner && found.trailing); i += 1) {
    const id = `JE-PR03-00000000-0000-4000-8000-${String(i).padStart(12, '0')}`;
    const suffix = rawSuffix(`printable-pack:${id}`);
    if (/BL|JE/.test('3' + suffix)) found.inner ??= id;
    else if (/[BJ]$/.test(suffix)) found.trailing ??= id;
  }
  for (const kind of ['inner', 'trailing'] as const) {
    const id = found[kind];
    assert.ok(id, `a ${kind} misroutable first draw exists in the search space`);
    const memo = createPaidMemo('printable-pack', id!);
    assert.match(memo, /^PR03-[A-Z0-9]{6}$/);
    assert.equal(misroutable(memo), false);
    assert.notEqual(memo.slice(5), rawSuffix(`printable-pack:${id}`), 'redrawn');
    assert.equal(createPaidMemo('printable-pack', id!), memo, 'same key, same memo');
  }
  const clean = 'JE-PR03-11111111-1111-4111-8111-111111111111';
  assert.equal(isMisroutableMemo('PR03', rawSuffix(`printable-pack:${clean}`)), false);
  assert.equal(createPaidMemo('printable-pack', clean), `PR03-${rawSuffix(`printable-pack:${clean}`)}`, 'draw 0 unchanged when clean');
});

test('sweep: no issued memo contains BL/JE in prefixLast+suffix or ends in B/J (200k draws for the reviewer prefixes, 20k for every other)', () => {
  const heavy = new Set(['printable-pack', 'teacher-pack-l4' /* PR0B */, 'live-speaking-check' /* LC */, 'one-to-one' /* 1T */]);
  for (const offer of [...PAID_OFFERS, LIVE_CHECK_OFFER]) {
    if (offer.prefix === 'SC' || offer.prefix === 'BL') continue; // SC memos are made in SQL; BL is AIS's own family by design
    const draws = heavy.has(offer.id) ? 200_000 : 20_000;
    let bad = 0;
    for (let i = 0; i < draws; i += 1) if (misroutable(createPaidMemo(offer.id, `JE-${offer.prefix}-sweep-${i}`))) bad += 1;
    assert.equal(bad, 0, `${offer.id}: ${bad} of ${draws}`);
  }
});
