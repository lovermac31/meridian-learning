import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  PORTAL_BUY_FLAGS,
  isPortalBuyEnabled,
  setPortalBuyEnabled,
  getPortalBuyUrl,
} from '../src/config/portalBuy';
import { ProductsPage } from '../src/components/ProductsPage';
import { ProductPage } from '../src/components/ProductPage';
import { PRODUCTS, type Product } from '../src/i18n/content/products';

test('portal buy button feature flags default to false for every product', () => {
  for (const [productId, enabled] of Object.entries(PORTAL_BUY_FLAGS)) {
    assert.equal(
      enabled,
      false,
      `Product ${productId} should have portal buy disabled by default`
    );
    assert.equal(
      isPortalBuyEnabled(productId),
      false,
      `isPortalBuyEnabled(${productId}) should return false by default`
    );
  }
});

test('buy button is completely hidden/unrendered by default across products and product pages', () => {
  // Test ProductsPage in both locales
  const enHtml = renderToStaticMarkup(createElement(ProductsPage, { locale: 'en' }));
  assert.ok(!enHtml.includes('data-portal-buy'), 'No portal buy button in EN ProductsPage by default');

  const viHtml = renderToStaticMarkup(createElement(ProductsPage, { locale: 'vi' }));
  assert.ok(!viHtml.includes('data-portal-buy'), 'No portal buy button in VI ProductsPage by default');

  // Test ProductPage for printable-pack
  const printablePack = PRODUCTS.find((p) => p.id === 'printable-pack') as Product;
  assert.ok(printablePack, 'printable-pack product exists');

  const enProductHtml = renderToStaticMarkup(
    createElement(ProductPage, { product: printablePack, locale: 'en' })
  );
  assert.ok(!enProductHtml.includes('data-portal-buy'), 'No portal buy button on EN ProductPage by default');

  const viProductHtml = renderToStaticMarkup(
    createElement(ProductPage, { product: printablePack, locale: 'vi' })
  );
  assert.ok(!viProductHtml.includes('data-portal-buy'), 'No portal buy button on VI ProductPage by default');
});

test('flipping the flag renders the Buy button with the exact portal checkout URL', () => {
  const targetSku = 'printable-pack';
  const printablePack = PRODUCTS.find((p) => p.id === targetSku) as Product;

  try {
    // Enable for target SKU
    setPortalBuyEnabled(targetSku, true);
    assert.equal(isPortalBuyEnabled(targetSku), true);

    const expectedUrlEn = 'https://my.jurassicenglish.com/buy?sku=printable-pack&lang=en&ref=site';
    const expectedUrlVi = 'https://my.jurassicenglish.com/buy?sku=printable-pack&lang=vi&ref=site';

    assert.equal(getPortalBuyUrl(targetSku, 'en'), expectedUrlEn);
    assert.equal(getPortalBuyUrl(targetSku, 'vi'), expectedUrlVi);

    // Verify on ProductsPage
    const enHtml = renderToStaticMarkup(createElement(ProductsPage, { locale: 'en' })).replaceAll('&amp;', '&');
    assert.ok(enHtml.includes(`data-portal-buy="${targetSku}"`), 'Portal buy button rendered on EN ProductsPage');
    assert.ok(enHtml.includes(`href="${expectedUrlEn}"`), 'Portal buy URL matches on EN ProductsPage');
    assert.ok(enHtml.includes('>Buy<'), 'Button copy is "Buy" on EN ProductsPage');

    const viHtml = renderToStaticMarkup(createElement(ProductsPage, { locale: 'vi' })).replaceAll('&amp;', '&');
    assert.ok(viHtml.includes(`data-portal-buy="${targetSku}"`), 'Portal buy button rendered on VI ProductsPage');
    assert.ok(viHtml.includes(`href="${expectedUrlVi}"`), 'Portal buy URL matches on VI ProductsPage');
    assert.ok(viHtml.includes('>Mua ngay<'), 'Button copy is "Mua ngay" on VI ProductsPage');

    // Verify on ProductPage
    const enProductHtml = renderToStaticMarkup(
      createElement(ProductPage, { product: printablePack, locale: 'en' })
    ).replaceAll('&amp;', '&');
    assert.ok(enProductHtml.includes(`data-portal-buy="${targetSku}"`), 'Portal buy button rendered on EN ProductPage');
    assert.ok(enProductHtml.includes(`href="${expectedUrlEn}"`), 'Portal buy URL matches on EN ProductPage');

    const viProductHtml = renderToStaticMarkup(
      createElement(ProductPage, { product: printablePack, locale: 'vi' })
    ).replaceAll('&amp;', '&');
    assert.ok(viProductHtml.includes(`data-portal-buy="${targetSku}"`), 'Portal buy button rendered on VI ProductPage');
    assert.ok(viProductHtml.includes(`href="${expectedUrlVi}"`), 'Portal buy URL matches on VI ProductPage');
  } finally {
    // Clean up flag back to default false
    setPortalBuyEnabled(targetSku, false);
    assert.equal(isPortalBuyEnabled(targetSku), false);
  }
});
