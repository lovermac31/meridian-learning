import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PRODUCTS } from '../src/i18n/content/products';
import { STARTERS_IDS } from '../src/i18n/content/startersFlags';
import { PAID_OFFERS, PRODUCT_MEMO_CODES, paidOffer, paymentQrUrl } from '../src/config/payment';
import { HOLIDAY_SETS } from '../src/config/holidaySets';
import { isPortalBuyEnabled } from '../src/config/portalBuy';
import { payStatusSource } from '../src/lib/payStatus';
import { StoryClubReservePage } from '../src/components/StoryClubReservePage';
import { DRAFT_STARTERS_PRODUCTS } from '../api/sample-pack';

/** D4: manual order path at launch, exactly like Phonics: Order on Zalo, written summary, VietQR sent by Jay, or PayPal; NO portal checkout. */
const amounts: Record<string, number> = { 'starters-practice-test-1': 99000, 'starters-practice-test-2': 99000, 'starters-practice-test-3': 99000, 'starters-practice-tests-pack': 249000 };

test('Starters memo prefixes are reserved uniquely; the site mints no payment code and no QR; the portal stays off', () => {
  assert.equal(new Set([...Object.values(PRODUCT_MEMO_CODES), ...HOLIDAY_SETS.map(s => s.prefix)]).size, Object.values(PRODUCT_MEMO_CODES).length + HOLIDAY_SETS.length);
  for (const id of STARTERS_IDS) {
    const prefix = PRODUCT_MEMO_CODES[id];
    assert.equal(DRAFT_STARTERS_PRODUCTS[id as keyof typeof DRAFT_STARTERS_PRODUCTS].prefix, prefix);
    assert.equal(DRAFT_STARTERS_PRODUCTS[id as keyof typeof DRAFT_STARTERS_PRODUCTS].amount, amounts[id]);
    assert.equal(Number(PRODUCTS.find(p => p.id === id)!.price.replace(/\D/g, '')), amounts[id], `${id}: price on the card = reserved amount`);
    assert.equal(paidOffer(id), undefined);
    assert.ok(!PAID_OFFERS.some(p => p.id === id));
    assert.equal(isPortalBuyEnabled(id), false);
    assert.deepEqual(payStatusSource(`${prefix}-AB12CD`), { kind: 'manual' });
    assert.equal(paymentQrUrl(amounts[id], `${prefix}-AB12CD`), null);
    for (const locale of ['en', 'vi'] as const) {
      // An old or guessed ?checkout=1 link opens no payment page for an order-only product.
      const checkout = renderToStaticMarkup(createElement(StoryClubReservePage, { locale, productId: id, initialMemo: `${prefix}-AB12CD` }));
      assert.doesNotMatch(checkout, /data-payment|data-buy|<form|<img|<audio/);
    }
  }
});
