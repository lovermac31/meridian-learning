import assert from 'node:assert/strict';
import test from 'node:test';
import { LIVE_CHECK_OFFER, PAID_OFFERS, canonicalPaymentMemo, paidOffer, paymentHref, paymentQrUrl } from '../src/config/payment';
import { createPaidMemo } from '../api/sample-pack';
import { resolveRouteMetadata, getExpectedPublicIndexableRoutes, getClientOnlyRoutes, getPrivateOrNonIndexableRoutes } from '../src/lib/routeMetadata';
import { usdFromVnd } from '../src/lib/paypal';

test('Live Speaking Check: own memo prefix, no collision with Baseline BL or any priced offer', () => {
  assert.equal(LIVE_CHECK_OFFER.amount, 250_000);
  assert.equal(LIVE_CHECK_OFFER.prefix, 'LC');
  assert.ok(!PAID_OFFERS.some((o) => o.prefix === 'LC' || o.prefix === 'BL' && o.id === LIVE_CHECK_OFFER.id));
  assert.equal(paidOffer(LIVE_CHECK_OFFER.id), LIVE_CHECK_OFFER);
  assert.ok(!PAID_OFFERS.some((o) => o.id === LIVE_CHECK_OFFER.id), 'stays out of the priced product list');
});

test('Live Speaking Check: server memo, QR amount/memo and bank-stripped reconciliation (mock data only)', () => {
  const memo = createPaidMemo(LIVE_CHECK_OFFER.id, 'JE-LC-11111111-1111-4111-8111-111111111111');
  assert.match(memo, /^LC-[A-Z0-9]{6}$/);
  const qr = new URL(paymentQrUrl(250_000, memo)!);
  assert.equal(qr.searchParams.get('amount'), '250000');
  assert.equal(qr.searchParams.get('des'), memo);
  assert.equal(canonicalPaymentMemo(`MBVCB.123 ${memo.replace('-', '')} chuyen khoan`), memo);
  assert.equal(canonicalPaymentMemo('BL1A2B3C'), 'BL-1A2B3C', 'Baseline memos still parse as BL');
  assert.equal(paymentHref(LIVE_CHECK_OFFER.id, 'vi'), '/live-speaking-check?lang=vi');
  assert.equal(usdFromVnd(250_000), 10);
});

test('Live Speaking Check: public route is indexable, server-rendered and in the sitemap list', () => {
  assert.doesNotMatch(resolveRouteMetadata('/live-speaking-check').robots ?? '', /noindex/);
  assert.ok(!getClientOnlyRoutes().includes('/live-speaking-check'));
  assert.ok(!getPrivateOrNonIndexableRoutes().includes('/live-speaking-check'));
  assert.ok(getExpectedPublicIndexableRoutes().includes('/live-speaking-check'));
});
