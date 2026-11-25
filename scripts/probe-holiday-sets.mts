/**
 * Money-path probe for the holiday sets (28 Nov to 6 Dec 2026). LOCAL ONLY: it runs the real handlers in-process with a
 * frozen clock, a mocked Notion and no other network (scripts/lib/holiday-harness.mts); it never touches production data,
 * the bank, SePay, PayPal, Supabase or email.
 *
 * Walks one buyer's path for BOTH sets, then the edges of the window:
 *   1. price agreement: card price = QR amount = server-minted amount = JSON-LD price (VND) and PayPal US$, and the usual
 *      total equals the sum of the three usual prices;
 *   2. order in the window: payment code minted (right prefix, right amount, stable for one submission), Notion lead written;
 *      the contact-form order after payment accepted with the same memo;
 *   3. reconcile: the SePay webhook reads the memo (also dashless, lower case, inside bank text), answers 200 and logs a
 *      "set" needs-review outcome; a transfer stamped after the window logs "outside_window"; a wrong key is 401;
 *   4. edges: refused at 27 Nov 23:59:59.999 and at 7 Dec 00:00:00.000 (no memo, no Notion write), accepted at 28 Nov 00:00:00
 *      and 6 Dec 23:59:59.999; the form order is refused outside the window too;
 *   5. nothing else moved: every other product still mints its usual amount after the window.
 * Run: node --import tsx scripts/probe-holiday-sets.mts   (exit 1 on any failure)
 */
import { HOLIDAY_SETS } from '../src/config/holidaySets.js';
import { PRODUCTS } from '../src/i18n/content/products.js';
import { buyCta, canonicalPaymentMemo, paidOffer, paymentQrUrl } from '../src/config/payment.js';
import { createHolidaySetJsonLd } from '../src/lib/structuredData.js';
import { holidaySetPaypalHref } from '../src/lib/holidaySetLinks.js';
import { callSamplePack, callWebhook, formBody, prepareBody } from './lib/holiday-harness.mjs';

const rows: string[] = [];
let failed = 0;
const check = (label: string, ok: boolean, detail = '') => {
  rows.push(`${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? `  (${detail})` : ''}`);
  if (!ok) failed += 1;
};

const T = {
  beforeLast: '2026-11-27T23:59:59.999+07:00',
  open: '2026-11-28T00:00:00.000+07:00',
  mid: '2026-12-02T14:30:00+07:00',
  lastMs: '2026-12-06T23:59:59.999+07:00',
  ended: '2026-12-07T00:00:00.000+07:00',
};
const usual = (id: string) => Number(PRODUCTS.find((p) => p.id === id)!.price.replace(/\D/g, ''));
const stamp = (local: string) => local.slice(0, 19).replace('T', ' ');
let counter = 100;

for (const set of HOLIDAY_SETS) {
  const offer = paidOffer(set.id)!;

  // 1. price agreement
  check(`${set.id}: usual total = sum of the three usual prices`, set.components.reduce((sum, id) => sum + usual(id), 0) === set.listVnd, String(set.listVnd));
  check(`${set.id}: sale below usual total`, set.saleVnd < set.listVnd, `${set.saleVnd} < ${set.listVnd}`);
  check(`${set.id}: checkout offer amount = sale`, offer.amount === set.saleVnd);
  check(`${set.id}: buy button shows the sale`, buyCta(set.id, 'en').includes(new Intl.NumberFormat('en-US').format(set.saleVnd)), buyCta(set.id, 'en'));
  const qr = new URL(paymentQrUrl(set.saleVnd, `${set.prefix}-ABC123`)!);
  check(`${set.id}: QR amount = sale, memo carries the set prefix`, qr.searchParams.get('amount') === String(set.saleVnd) && qr.searchParams.get('des') === `${set.prefix}-ABC123`);
  for (const locale of ['en', 'vi'] as const) {
    const offers = (createHolidaySetJsonLd(set, locale) as { offers: Array<{ price: string; priceCurrency: string }> }).offers;
    check(
      `${set.id}: ${locale} JSON-LD VND = sale, USD = set price`,
      Number(offers.find((o) => o.priceCurrency === 'VND')?.price) === set.saleVnd && Number(offers.find((o) => o.priceCurrency === 'USD')?.price) === set.usd,
    );
  }
  check(`${set.id}: PayPal link charges the set US$ price`, new URL(holidaySetPaypalHref(set, 'probe')).searchParams.get('amount') === set.usd.toFixed(2), `US$${set.usd}`);

  // 2. order in the window
  const prepared = await callSamplePack(prepareBody(set.id, ++counter), T.mid);
  const memo = String(prepared.body?.memo ?? '');
  check(`${set.id}: payment code minted in the window`, prepared.status === 200 && new RegExp(`^${set.prefix}-[A-Z0-9]{6}$`).test(memo), memo);
  check(`${set.id}: minted amount = sale`, prepared.body?.amount === set.saleVnd, String(prepared.body?.amount));
  check(`${set.id}: lead stored for the prepared code`, prepared.notionWrites === 1);
  const again = await callSamplePack(prepareBody(set.id, counter), T.mid);
  check(`${set.id}: same submission gets the same code`, again.body?.memo === memo);
  const form = await callSamplePack(formBody(set.id, counter, T.mid), T.mid);
  check(`${set.id}: contact-form order accepted in the window, same memo`, form.status === 200 && form.body?.memo === memo, `status ${form.status}`);

  // 3. reconcile through the webhook
  const variants: Array<[string, string]> = [['plain', memo], ['dashless', memo.replace('-', '')], ['lower case in bank text', `CK MB ${memo.toLowerCase()} cam on`]];
  for (const [label, content] of variants) {
    const hook = await callWebhook({ id: ++counter, transferType: 'in', content, transferAmount: set.saleVnd, transactionDate: stamp('2026-12-02T14:35:00') }, '2026-12-02T14:35:30+07:00');
    check(
      `${set.id}: webhook reads the memo (${label})`,
      hook.status === 200 && (hook.body as { success?: boolean }).success === true && hook.memo === memo && hook.outcome === 'needs_review_holiday_set',
      `${hook.status} ${hook.outcome}`,
    );
  }
  const late = await callWebhook({ id: ++counter, transferType: 'in', content: memo, transferAmount: set.saleVnd, transactionDate: stamp('2026-12-07T00:20:00') }, '2026-12-07T00:20:30+07:00');
  check(`${set.id}: a transfer after the window is flagged outside_window`, late.status === 200 && late.outcome === 'needs_review_holiday_set_outside_window', String(late.outcome));
  const noKey = await callWebhook({ id: ++counter, transferType: 'in', content: memo, transferAmount: set.saleVnd }, T.mid, 'Apikey wrong');
  check(`${set.id}: webhook with a wrong key is refused`, noKey.status === 401);
  check(`${set.id}: canonicalPaymentMemo parses the code after the window too`, canonicalPaymentMemo(`x ${memo.replace('-', '')} y`) === memo);

  // 4. window edges
  const edges: Array<[string, string, boolean]> = [
    ['27 Nov 23:59:59.999', T.beforeLast, false],
    ['28 Nov 00:00:00.000', T.open, true],
    ['6 Dec 23:59:59.999', T.lastMs, true],
    ['7 Dec 00:00:00.000', T.ended, false],
  ];
  for (const [label, at, open] of edges) {
    const edge = await callSamplePack(prepareBody(set.id, ++counter), at);
    if (open) check(`${set.id}: code minted at ${label}`, edge.status === 200 && Boolean(edge.body?.memo), `status ${edge.status}`);
    else check(`${set.id}: code REFUSED at ${label}, no memo, no lead`, edge.status === 400 && edge.body?.error === 'offer_closed' && !edge.body?.memo && edge.notionCalls === 0, `status ${edge.status} ${String(edge.body?.error)}`);
  }
  const lateForm = await callSamplePack(formBody(set.id, ++counter, T.ended), T.ended);
  check(`${set.id}: contact-form order REFUSED after the window, no lead`, lateForm.status === 400 && lateForm.body?.error === 'offer_closed' && lateForm.notionCalls === 0, `status ${lateForm.status}`);
  const earlyForm = await callSamplePack(formBody(set.id, ++counter, T.beforeLast), T.beforeLast);
  check(`${set.id}: contact-form order REFUSED before the window`, earlyForm.status === 400 && earlyForm.body?.error === 'offer_closed');
}

// 5. nothing else moved
for (const id of ['parent-pack-l1', 'holiday-reading-challenge', 'word-fossil-flashcards-l1', 'teacher-pack-l1', 'thinking-cycle-set', 'reasoning-assessment-kit']) {
  const after = await callSamplePack(prepareBody(id, ++counter), T.ended);
  check(`${id}: still minted after the window at its usual price`, after.status === 200 && after.body?.amount === usual(id), `${String(after.body?.amount)} vs ${usual(id)}`);
}

console.log(rows.join('\n'));
console.log(failed ? `\nPROBE FAILED: ${failed} check(s)` : `\nPROBE PASSED: ${rows.length} checks (local only: frozen clock, mocked Notion, no other network, no production data)`);
process.exit(failed ? 1 : 0);
