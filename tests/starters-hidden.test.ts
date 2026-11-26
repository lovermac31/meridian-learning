import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PRODUCTS } from '../src/i18n/content/products';
import { PAGE_PRODUCTS, PRODUCT_PAGE_PATHS, relatedProducts } from '../src/i18n/content/productSeo';
import { getExpectedPublicIndexableRoutes, getPrerenderRoutes, resolveRouteMetadata } from '../src/lib/routeMetadata';
import { PAID_OFFERS, PRODUCT_MEMO_CODES, paidOffer, paymentQrUrl } from '../src/config/payment';
import { HOLIDAY_SETS } from '../src/config/holidaySets';
import { isPortalBuyEnabled } from '../src/config/portalBuy';
import { payStatusSource } from '../src/lib/payStatus';
import { StoryClubReservePage } from '../src/components/StoryClubReservePage';
import { SampleViewer, ProductsPage } from '../src/components/ProductsPage';
import { toCard } from '../src/components/ProductPage';
import { productsPage } from '../src/i18n/content/products';
import { DRAFT_STARTERS_PRODUCTS } from '../api/sample-pack';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ids = ['starters-practice-test-1', 'starters-practice-test-2', 'starters-practice-test-3', 'starters-practice-tests-pack'];
const amounts: Record<string, number> = { 'starters-practice-test-1': 99000, 'starters-practice-test-2': 99000, 'starters-practice-test-3': 99000, 'starters-practice-tests-pack': 249000 };
test('Starters prefixes reserved uniquely, manual status, all payment paths closed', () => {
  assert.equal(new Set([...Object.values(PRODUCT_MEMO_CODES), ...HOLIDAY_SETS.map(s => s.prefix)]).size, Object.values(PRODUCT_MEMO_CODES).length + HOLIDAY_SETS.length);
  for (const id of ids) {
    const prefix = PRODUCT_MEMO_CODES[id];
    assert.equal(DRAFT_STARTERS_PRODUCTS[id as keyof typeof DRAFT_STARTERS_PRODUCTS].prefix, prefix);
    assert.equal(DRAFT_STARTERS_PRODUCTS[id as keyof typeof DRAFT_STARTERS_PRODUCTS].amount, amounts[id]);
    assert.equal(paidOffer(id), undefined);
    assert.ok(!PAID_OFFERS.some(p => p.id === id));
    assert.equal(isPortalBuyEnabled(id), false);
    assert.deepEqual(payStatusSource(`${prefix}-AB12CD`), { kind: 'manual' });
    assert.equal(paymentQrUrl(amounts[id], `${prefix}-AB12CD`), null);
    for (const locale of ['en', 'vi'] as const) {
      const checkout = renderToStaticMarkup(createElement(StoryClubReservePage, { locale, productId: id, initialMemo: `${prefix}-AB12CD` }));
      assert.doesNotMatch(checkout, /data-payment|data-buy|<form|<img|<audio/);
      const product = PRODUCTS.find(p => p.id === id)!;
      const viewer = renderToStaticMarkup(createElement(SampleViewer, { card: toCard(product, locale), locale, source: null, copy: productsPage(locale).viewer, onClose() {}, initialPage: 6 }));
      assert.doesNotMatch(viewer, /data-viewer-order|data-buy|checkout=|qr\.sepay/);
      const path = `${locale === 'vi' ? '/vi' : ''}/products/${id}`;
      // Hide-fix: the draft pages are not routed at all while STARTERS_DRAFTS_PUBLIC is false (see starters-hidden-routes.test.ts).
      assert.ok(!getPrerenderRoutes().includes(path));
    }
  }
});

test('Starters never appear in public listings or indexable route sources', async () => {
  for (const id of ids) {
    assert.ok(!PAGE_PRODUCTS.some(p => p.id === id));
    assert.ok(!PRODUCT_PAGE_PATHS.some(p => p.includes(id)));
    assert.ok(!getExpectedPublicIndexableRoutes().some(p => p.includes(id)));
    assert.ok(!PRODUCTS.some(p => p.live && relatedProducts(p.id).some(r => r.id === id)));
    assert.ok(!PRODUCTS.some(p => p.live && JSON.stringify(p.alsoIn ?? '').includes(id)));
  }
  for (const locale of ['en', 'vi'] as const) {
    const path = `${locale === 'vi' ? '/vi' : ''}/products`;
    const html = renderToStaticMarkup(createElement(ProductsPage, { locale }));
    for (const id of ids) assert.ok(!html.includes(id), `${path}: ${id}`);
  }
  for (const id of ids) assert.ok(!readFileSync('public/llms-products.md', 'utf8').includes(id));
});

test('built sitemap files and all public HTML exclude drafts and their buy links', { skip: !existsSync('dist/sitemap.xml') }, () => {
  const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(d => d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]);
  for (const file of walk('dist').filter(p => /\.xml$|\.html$|llms-products\.md$/.test(p))) {
    const html = readFileSync(file, 'utf8');
    for (const id of ids) {
      if (file.includes(`/products/${id}/`)) {
        assert.match(html, /noindex/);
        assert.doesNotMatch(html, /data-buy-now|data-portal-buy|data-payment-instructions|qr\.sepay|checkout=1/);
      } else assert.ok(!html.includes(id), `${file} leaked ${id}`);
    }
  }
});
