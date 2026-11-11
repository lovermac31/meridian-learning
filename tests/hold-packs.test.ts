import test from 'node:test';
import assert from 'node:assert/strict';
import { HOLD_COPY, PAUSED_COPY, PRODUCTS } from '../src/i18n/content/products';
import { PAUSED_PRODUCTS } from '../api/sample-pack';

// Jay, 11 Nov 2026 (P1 directive): the Level 1 Printable Pack and the Parent Pack L1 contain Lina and the Orchard Map,
// whose art is being replaced. New purchases are held; the pages, prices, samples and SEO text stay.
const HELD = [['printable-pack', '149.000₫'], ['parent-pack-l1', '249.000₫']] as const;

test('held packs: flagged as a hold in the catalogue and refused by the server', () => {
  for (const [id] of HELD) {
    assert.equal(PRODUCTS.find((p) => p.id === id)?.paused, 'hold', `${id}: on hold`);
    assert.ok(PAUSED_PRODUCTS.has(id), `${id}: the server refuses a new payment code or order`);
  }
  assert.notEqual(HOLD_COPY.en.note, PAUSED_COPY.en.note, 'the hold notice is its own neutral wording');
  for (const locale of ['en', 'vi'] as const) assert.doesNotMatch(HOLD_COPY[locale].note + HOLD_COPY[locale].cta, /Lina|rights|copyright|bản quyền|rewritten|viết lại/i, `${locale}: neutral, names no reason`);
});

test('held packs: product pages and the products list keep the page, price and sample, and offer no way to pay (EN + VI)', async () => {
  const { renderRoute } = await import('../src/entry-server');
  for (const locale of ['en', 'vi'] as const) {
    const prefix = locale === 'vi' ? '/vi' : '';
    const list = (await renderRoute(`${prefix}/products`)).replaceAll('<!-- -->', '');
    for (const [id, price] of HELD) {
      // An old ?checkout=1 link is read in the browser; the pay-everywhere browser suite covers it for every paused product.
      for (const url of [`${prefix}/products/${id}`]) {
        const page = (await renderRoute(url)).replaceAll('<!-- -->', '');
        assert.ok(page.includes(HOLD_COPY[locale].note), `${url}: neutral notice`);
        assert.ok(page.includes(`data-paused-kind="hold"`), `${url}: marked as a hold`);
        assert.ok(page.includes(`data-price="${id}">${price}`), `${url}: price kept`);
        assert.ok(page.includes(`data-sample`), `${url}: sample kept`);
        // Structured data (OutOfStock for a held product) is added at prerender and asserted in products-findable.test.ts.
        for (const marker of ['data-portal-buy', 'data-paypal-link', 'data-get-code', 'data-pay-step', `data-cta="product-${id}"`, '?checkout=1"']) {
          assert.ok(!page.includes(marker), `${url}: no ${marker}`);
        }
      }
      const card = list.slice(list.indexOf(`<li class="product-row`, list.indexOf(`id="${id}"`) - 200), list.indexOf('</li>', list.indexOf(`id="${id}"`)));
      assert.ok(card.includes(HOLD_COPY[locale].note), `${prefix}/products ${id}: neutral notice on the card`);
      assert.ok(card.includes(`data-price="${id}">${price}`), `${prefix}/products ${id}: price kept on the card`);
      assert.ok(!card.includes(`data-cta="product-${id}"`) && !card.includes('data-paypal-link') && !card.includes('?checkout=1'), `${prefix}/products ${id}: no order link on the card`);
    }
  }
});
