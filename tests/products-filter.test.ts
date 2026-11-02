import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProductsPage, productAnchor } from '../src/components/ProductsPage';
import { PRODUCTS, PRODUCT_SECTIONS, PRODUCT_FORMER_IDS, productsPage } from '../src/i18n/content/products';

// Stitch layout (Jay's mock, 2 Nov 2026): a segment filter row over one wide card per product. SSR shows every section
// unfiltered (no tile pressed, nothing hidden) so search engines, deep links and the no-JS page see all 35 cards.
for (const locale of ['en', 'vi'] as const) {
  test(`filter ${locale}: four segment tiles with real counts and lowest prices; nothing pressed or hidden in SSR`, () => {
    const html = renderToStaticMarkup(createElement(ProductsPage, { locale }));
    const tiles = [...html.matchAll(/aria-pressed="(true|false)" aria-controls="([^"]+)" data-category-tile="([^"]+)"/g)];
    assert.deepEqual(tiles.map((m) => [m[3], m[1], m[2]]), PRODUCT_SECTIONS.map((id) => [id, 'false', id]));
    const total = productsPage(locale).sections.reduce((sum, section) => sum + section.cards.length, 0);
    assert.equal(total, 35);
    for (const section of productsPage(locale).sections) {
      assert.match(html, new RegExp(`<section id="${section.id}" aria-labelledby="${section.id}-h" class="[^"]*products-category[^"]*" data-category-panel="${section.id}">`), `${section.id}: visible, not hidden`);
      const count = section.cards.length;
      const price = Math.min(...section.cards.map((card) => Number(card.price.replace(/\D/g, '')))).toLocaleString('de-DE');
      const tile = html.match(new RegExp(`data-category-tile="${section.id}"[\\s\\S]*?</button>`))![0];
      assert.ok(tile.includes(`${count} ${locale === 'vi' ? 'sản phẩm' : 'products'}`));
      assert.ok(tile.includes(`${price}₫`));
    }
    assert.ok(html.includes(`data-products-count="${total}"`), 'the count line shows every product');
    assert.ok(html.includes(locale === 'vi' ? `Hiển thị tất cả ${total} sản phẩm` : `Showing all ${total} products`));
    assert.doesNotMatch(html, /data-products-show-all/, 'no "show all" control until a segment is pressed');
    assert.doesNotMatch(html, /<section[^>]* hidden/, 'no section hidden in SSR');
  });

  test(`cards ${locale}: every product in SSR with its copy, badge, lazy icon, sample above the price, and payment links`, () => {
    const html = renderToStaticMarkup(createElement(ProductsPage, { locale })).replaceAll('&#x27;', "'").replaceAll('&amp;', '&').replaceAll('&quot;', '"');
    assert.equal((html.match(/<li [^>]*id="/g) ?? []).length, 35);
    for (const product of PRODUCTS.filter((p) => p.live)) {
      const start = html.indexOf(`id="${product.id}"`);
      const card = html.slice(start, html.indexOf('</li>', start));
      const escape = (value: string) => value.replaceAll('>', '&gt;').replaceAll('<', '&lt;');
      for (const key of ['title', 'problem', 'inside', 'forWho', 'unit'] as const) {
        assert.ok(card.includes(escape(product[locale][key])), `${product.id}: SSR ${key}`);
      }
      assert.ok(card.includes(`<span class="product-row-pill">${escape(product[locale].label)}</span>`), `${product.id}: badge pill is the card label`);
      assert.ok(card.includes(`data-sample-open="${product.id}"`));
      assert.ok(card.includes(`data-cta="product-${product.id}"`));
      assert.match(card, /loading="lazy"/);
      const at = (marker: string) => card.indexOf(marker);
      assert.ok(at('</dl>') < at(`data-sample="${product.id}"`) && at(`data-sample="${product.id}"`) < at(`data-price="${product.id}"`) && at(`data-price="${product.id}"`) < at('data-buy-now='), `${product.id}: text → sample → price → buttons`);
      if (product.paypal) assert.ok(card.includes(`data-paypal-link="${product.id}"`));
      if (product.video) assert.ok(card.includes(`data-watch="${product.id}"`));
      assert.doesNotMatch(card, /aria-expanded|data-open=|inert=/, `${product.id}: no fold, the card is open`);
    }
  });

  test(`anchors ${locale}: every canonical, former, sample and IELTS subgroup anchor resolves to its category`, () => {
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

  test(`hub ${locale}: trust strip, why-us and FAQ carry site copy only, no links, and the hero keeps one h1`, () => {
    const html = renderToStaticMarkup(createElement(ProductsPage, { locale }));
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
    const block = (marker: string) => { const start = html.indexOf(marker); return html.slice(start, html.indexOf('</section>', start) > 0 && marker !== 'data-products-trust' ? html.indexOf('</section>', start) : html.indexOf('</ul>', start)); };
    assert.equal((block('data-products-trust').match(/<li\b/g) ?? []).length, 4, 'four trust items');
    assert.doesNotMatch(block('data-products-trust'), /<a /, 'no links in the trust strip');
    assert.equal((block('data-products-why').match(/<li\b/g) ?? []).length, 3, 'three why-us columns');
    assert.doesNotMatch(block('data-products-why'), /<a /, 'no links in why-us');
    assert.equal((block('data-products-faq').match(/<details\b/g) ?? []).length, 4, 'four FAQ items');
    assert.doesNotMatch(block('data-products-faq'), /<a /, 'no links in the FAQ');
    // Nothing from the mock's placeholder text: no student counts, guarantees or invented cities.
    assert.doesNotMatch(html, /2,400\+ Students|30-Day Guarantee|No-quibble|Ho Chi Minh|Mass Gimmicks/i);
  });
}
