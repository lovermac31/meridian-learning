import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProductsPage, productAnchor } from '../src/components/ProductsPage';
import { PRODUCTS, PRODUCT_SECTIONS, PRODUCT_FORMER_IDS, productsPage } from '../src/i18n/content/products';
import { FEATURED_PRODUCTS } from '../src/components/ProductsPage';

// Stitch layout (Jay's mock, 2 Nov 2026) with featured-first (Jay, "tighten"): a segment filter row over one wide card
// per product. SSR renders all 40 cards (search engines and deep links see them) but only the six featured cards show;
// the rest sit behind the segment tiles and "Show all 40 products".
for (const locale of ['en', 'vi'] as const) {
  test(`filter ${locale}: four segment tiles with real counts and lowest prices; six featured cards show, the rest wait behind the filters`, () => {
    const html = renderToStaticMarkup(createElement(ProductsPage, { locale }));
    const tiles = [...html.matchAll(/aria-pressed="(true|false)" aria-controls="([^"]+)" data-category-tile="([^"]+)"/g)];
    assert.deepEqual(tiles.map((m) => [m[3], m[1], m[2]]), PRODUCT_SECTIONS.map((id) => [id, 'false', id]));
    const total = productsPage(locale).sections.reduce((sum, section) => sum + section.cards.length, 0);
    assert.equal(total, 40);
    for (const section of productsPage(locale).sections) {
      const featuredHere = section.cards.some((card) => (FEATURED_PRODUCTS as readonly string[]).includes(card.id));
      assert.match(html, new RegExp(`<section id="${section.id}" aria-labelledby="${section.id}-h" class="[^"]*products-category[^"]*"${featuredHere ? '' : ' hidden=""'} data-category-panel="${section.id}">`), `${section.id}: ${featuredHere ? 'shown' : 'hidden'} until its tile is pressed`);
      const count = section.cards.length;
      const price = Math.min(...section.cards.map((card) => Number(card.price.replace(/\D/g, '')))).toLocaleString('de-DE');
      const tile = html.match(new RegExp(`data-category-tile="${section.id}"[\\s\\S]*?</button>`))![0];
      assert.ok(tile.includes(`${count} ${locale === 'vi' ? 'sản phẩm' : 'products'}`));
      assert.ok(tile.includes(`${price}₫`));
    }
    assert.equal(FEATURED_PRODUCTS.length, 6);
    assert.deepEqual(FEATURED_PRODUCTS.slice(0, 3), ['story-club', 'baseline', 'one-to-one'], 'the three live services lead');
    for (const id of FEATURED_PRODUCTS) assert.ok(PRODUCTS.find((p) => p.id === id)?.live, `${id} is a live product`);
    assert.ok(html.includes('data-products-count="6"'), 'the count line shows the six featured cards');
    assert.ok(html.includes(locale === 'vi' ? `Hiển thị 6/${total} sản phẩm` : `Showing 6 of ${total} products`));
    assert.ok(html.includes(locale === 'vi' ? `>Xem tất cả ${total} sản phẩm<` : `>Show all ${total} products<`), 'the "show all" control');
    const visible = [...html.matchAll(/<li class="product-row[^"]*" id="([^"]+)"(?: hidden="")?>/g)].filter((m) => !m[0].includes('hidden')).map((m) => m[1]);
    assert.deepEqual(visible, [...FEATURED_PRODUCTS].sort((a, b) => PRODUCTS.findIndex((p) => p.id === a) - PRODUCTS.findIndex((p) => p.id === b)), 'only the featured cards show, in catalogue order');
    assert.equal((html.match(/<li class="product-row[^"]*" id="[^"]+" hidden="">/g) ?? []).length, 40 - 6, 'the other cards are in the DOM, hidden');
  });

  test(`cards ${locale}: every product in SSR with its copy, badge, lazy icon, sample above the price, and payment links`, () => {
    const html = renderToStaticMarkup(createElement(ProductsPage, { locale })).replaceAll('&#x27;', "'").replaceAll('&amp;', '&').replaceAll('&quot;', '"');
    assert.equal((html.match(/<li [^>]*id="/g) ?? []).length, 40);
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
      // One payment line under the price (the delivery line); the long PayPal note stays in the FAQ, not on every card.
      if (product.delivery) assert.ok(at(`data-price="${product.id}"`) < at(`data-delivery="${product.id}"`) && at(`data-delivery="${product.id}"`) < at('data-buy-now='), `${product.id}: payment line between price and buttons`);
      assert.doesNotMatch(card, /paypal\.com to Jurassic English|paypal\.com cho Jurassic English/, `${product.id}: no PayPal paragraph on the card`);
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
