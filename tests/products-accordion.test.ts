import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProductsPage, productAnchor } from '../src/components/ProductsPage';
import { PRODUCTS, PRODUCT_SECTIONS, PRODUCT_FORMER_IDS, productsPage } from '../src/i18n/content/products';

for (const locale of ['en', 'vi'] as const) {
  test(`accordion ${locale}: Families alone starts open; all category tiles show real counts and lowest prices`, () => {
    const html = renderToStaticMarkup(createElement(ProductsPage, { locale }));
    const tiles = [...html.matchAll(/aria-expanded="(true|false)" aria-controls="([^"]+)" data-category-tile="([^"]+)"/g)];
    assert.deepEqual(tiles.map((m) => [m[3], m[1]]), PRODUCT_SECTIONS.map((id) => [id, id === 'families' ? 'true' : 'false']));
    for (const section of productsPage(locale).sections) {
      assert.ok(html.includes(`id="${section.id}-products"`));
      const count = section.cards.length;
      const price = Math.min(...section.cards.map((card) => Number(card.price.replace(/\D/g, '')))).toLocaleString('de-DE');
      const tile = html.match(new RegExp(`data-category-tile="${section.id}"[\\s\\S]*?</button>`))![0];
      assert.ok(tile.includes(`${count} ${locale === 'vi' ? 'sản phẩm' : 'products'}`));
      assert.ok(tile.includes(`${price}₫`));
    }
    assert.equal((html.match(/data-product-toggle="/g) ?? []).length, 35);
    assert.equal((html.match(/data-product-panel="/g) ?? []).length, 35);
    assert.equal((html.match(/aria-expanded="false" aria-controls="[^"]+-details"/g) ?? []).length, 35);
  });

  test(`accordion ${locale}: every product remains in SSR with copy, lazy image, sample action and payment links`, () => {
    const html = renderToStaticMarkup(createElement(ProductsPage, { locale })).replaceAll('&#x27;', "'").replaceAll('&amp;', '&').replaceAll('&quot;', '"');
    assert.equal((html.match(/<li [^>]*id="/g) ?? []).length, 35);
    for (const product of PRODUCTS.filter((p) => p.live)) {
      const start = html.indexOf(`id="${product.id}"`);
      const card = html.slice(start, html.indexOf('</li>', start));
      const escape = (value: string) => value.replaceAll('>', '&gt;').replaceAll('<', '&lt;');
      for (const key of ['title', 'problem', 'inside', 'forWho', 'unit'] as const) {
        assert.ok(card.includes(escape(product[locale][key])), `${product.id}: SSR ${key}`);
      }
      assert.ok(card.includes(`data-sample-open="${product.id}"`));
      assert.ok(card.includes(`data-cta="product-${product.id}"`));
      assert.match(card, /loading="lazy"/);
      if (product.paypal) assert.ok(card.includes(`data-paypal-link="${product.id}"`));
      if (product.video) assert.ok(card.includes(`data-watch="${product.id}"`));
      assert.match(card, /data-open="false"[^>]*inert=""/);
    }
  });

  test(`accordion ${locale}: every canonical, former, sample and IELTS subgroup anchor resolves to its category`, () => {
    for (const product of PRODUCTS.filter((p) => p.live)) {
      assert.deepEqual(productAnchor(`#${product.id}`, locale), { section: product.section, product: product.id, sample: false, target: product.id });
      assert.equal(productAnchor(`#${product.id}-sample`, locale)?.sample, !!product.sample);
      for (const alias of PRODUCT_FORMER_IDS[product.id] ?? []) assert.equal(productAnchor(`#${alias}`, locale)?.product, product.id);
    }
    for (const id of PRODUCT_SECTIONS) assert.equal(productAnchor(`#${id}`, locale)?.section, id);
    assert.equal(productAnchor('#ielts-speaking', locale)?.section, 'ielts');
    assert.equal(productAnchor('#ielts-writing', locale)?.section, 'ielts');
    assert.equal(productAnchor('#not-a-product', locale), null);
    assert.equal(productAnchor('#%E0%A4%A', locale), null);
  });
}
