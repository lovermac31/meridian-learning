/** Local-only draft probe: real intake handler, frozen time, blocked network via holiday harness.
 * No payment is minted and no webhook, production service or account is touched. */
import assert from 'node:assert/strict';
import { callSamplePack, prepareBody, formBody } from './lib/holiday-harness.mjs';
import { PRODUCTS } from '../src/i18n/content/products.js';
import { PRODUCT_MEMO_CODES, paidOffer, paymentQrUrl } from '../src/config/payment.js';
import { payStatusSource } from '../src/lib/payStatus.js';
import { getExpectedPublicIndexableRoutes } from '../src/lib/routeMetadata.js';
import { getProductByPath } from '../src/i18n/content/productSeo.js';

const at = '2026-11-26T16:00:00+07:00';
let checks = 0;
for (const n of [1, 2]) {
  const id = `starters-practice-test-${n}`;
  const p = PRODUCTS.find(p => p.id === id)!;
  const prefix = PRODUCT_MEMO_CODES[id];
  assert.equal(p.live, false);
  assert.equal(paidOffer(id), undefined);
  assert.equal(paymentQrUrl(99000, `${prefix}-AB12CD`), null);
  assert.deepEqual(payStatusSource(`${prefix}-AB12CD`), { kind: 'manual' });
  assert.ok(!getExpectedPublicIndexableRoutes().some(path => path.includes(id)));
  // Hide-fix: the draft pages are not routed (STARTERS_DRAFTS_PUBLIC is false), so there is no route metadata to check.
  assert.equal(getProductByPath(`/products/${id}`), null);
  for (const body of [prepareBody(id, n + 1000), formBody(id, n + 2000, at)]) {
    const result = await callSamplePack(body, at);
    assert.equal(result.status, 400);
    assert.equal(result.body?.error, 'intent' in body && body.intent === 'prepare_payment' ? 'invalid_order' : 'product');
    assert.ok(!result.body?.memo);
    assert.equal(result.notionCalls, 0);
    checks += 4;
  }
  checks += 9;
  console.log(JSON.stringify({ event: 'starters_draft_verified', id, prefix, purchasable: false, indexable: false }));
}
console.log(`PROBE PASSED: ${checks} assertions; local-only, no payment code, no QR, no network or production data.`);
