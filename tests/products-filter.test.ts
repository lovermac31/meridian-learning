import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProductsPage, productAnchor } from '../src/components/ProductsPage';
import { PRODUCTS, PRODUCT_SECTIONS, PRODUCT_SEGMENTS, PRODUCT_FORMER_IDS, WORKBOOKS_SEGMENT, WORKBOOK_AGES, productsPage } from '../src/i18n/content/products';
import { FEATURED_PRODUCTS } from '../src/components/ProductsPage';

// Stitch layout (Jay's mock, 2 Nov 2026) with featured-first (Jay, "tighten"): a segment filter row over one wide card
// per product. SSR renders all 45 cards (search engines and deep links see them) but only the six featured cards show;
// the rest sit behind the segment tiles and "Show all 45 products".
for (const locale of ['en', 'vi'] as const) {
  test(`filter ${locale}: five segment tiles (Story Workbooks included) with real counts and lowest prices; six featured cards show, the rest wait behind the filters`, () => {
    const html = renderToStaticMarkup(createElement(ProductsPage, { locale }));
    const tiles = [...html.matchAll(/aria-pressed="(true|false)" aria-controls="([^"]+)" data-category-tile="([^"]+)"/g)];
    assert.deepEqual(tiles.map((m) => [m[3], m[1], m[2]]), PRODUCT_SEGMENTS.map((id) => [id, 'false', id]));
    assert.deepEqual(PRODUCT_SEGMENTS, ['families', 'story-workbooks', 'teachers', 'centres', 'ielts'], 'Story Workbooks sits right after Families');
    const total = productsPage(locale).sections.reduce((sum, section) => sum + section.cards.length, 0);
    assert.equal(total, 46);
    for (const section of productsPage(locale).sections) {
      const featuredHere = section.cards.some((card) => (FEATURED_PRODUCTS as readonly string[]).includes(card.id));
      assert.match(html, new RegExp(`<section id="${section.id}" aria-labelledby="${section.id}-h" class="[^"]*products-category[^"]*"${''} data-category-panel="${section.id}">`), `${section.id}: ${featuredHere ? 'shown' : 'hidden'} until its tile is pressed`);
      const count = section.cards.length;
      const price = Math.min(...section.cards.map((card) => Number(card.price.replace(/\D/g, '')))).toLocaleString('de-DE');
      const tile = html.match(new RegExp(`data-category-tile="${section.id}"[\\s\\S]*?</button>`))![0];
      assert.ok(tile.includes(`${count} ${locale === 'vi' ? 'sản phẩm' : 'products'}`));
      assert.ok(tile.includes(`${price}₫`));
    }
    // The Story Workbooks tile counts the five level cards (they stay in the Families data) and starts at the L2-L5 price.
    const workbookTile = html.match(/data-category-tile="story-workbooks"[\s\S]*?<\/button>/)![0];
    assert.ok(workbookTile.includes(`5 ${locale === 'vi' ? 'sản phẩm' : 'products'}`) && workbookTile.includes('190.000₫'), 'workbooks tile: 5 products from 190.000₫');
    assert.equal(FEATURED_PRODUCTS.length, 6);
    assert.deepEqual(FEATURED_PRODUCTS.slice(0, 3), ['story-club', 'baseline', 'one-to-one'], 'the three live services lead');
    for (const id of FEATURED_PRODUCTS) assert.ok(PRODUCTS.find((p) => p.id === id)?.live, `${id} is a live product`);
    assert.ok(html.includes(`data-products-count="${total}"`), 'the count line shows every product by default');
    assert.ok(html.includes(locale === 'vi' ? `Hiển thị tất cả ${total} sản phẩm` : `Showing all ${total} products`));
    assert.ok(!html.includes(locale === 'vi' ? `>Xem tất cả ${total} sản phẩm<` : `>Show all ${total} products<`), 'no "show all" control while everything is already shown');
    assert.equal((html.match(/<li class="product-row[^"]*" id="[^"]+" hidden="">/g) ?? []).length, 0, 'no card is hidden by default, so the Story Workbooks and IELTS books are visible');
    assert.ok(html.includes('id="story-workbooks-l2"') || /story-workbooks/.test(html), 'Story Workbooks cards are in the page');
  });

  test(`cards ${locale}: every product in SSR with its copy, badge, lazy icon, sample above the price, and payment links`, () => {
    const html = renderToStaticMarkup(createElement(ProductsPage, { locale })).replaceAll('&#x27;', "'").replaceAll('&amp;', '&').replaceAll('&quot;', '"');
    assert.equal((html.match(/<li [^>]*id="/g) ?? []).length, 46);
    for (const product of PRODUCTS.filter((p) => p.live)) {
      const start = html.indexOf(`id="${product.id}"`);
      const card = html.slice(start, html.indexOf('</li>', start));
      const escape = (value: string) => value.replaceAll('>', '&gt;').replaceAll('<', '&lt;');
      for (const key of ['title', 'problem', 'inside', 'forWho', 'unit'] as const) {
        assert.ok(card.includes(escape(product[locale][key])), `${product.id}: SSR ${key}`);
      }
      assert.ok(card.includes(`<span class="product-row-pill">${escape(product[locale].label)}</span>`), `${product.id}: badge pill is the card label`);
      // The three IELTS bundles (5 Nov 2026) show no sample of their own: each pack inside has its sample on its own page.
      if (product.sample) assert.ok(card.includes(`data-sample-open="${product.id}"`)); else assert.ok(!card.includes('data-sample-open='), `${product.id}: no sample button without a sample`);
      assert.ok(card.includes(`data-cta="product-${product.id}"`));
      assert.match(card, /loading="lazy"/);
      const at = (marker: string) => card.indexOf(marker);
      if (product.sample) assert.ok(at('</dl>') < at(`data-sample="${product.id}"`) && at(`data-sample="${product.id}"`) < at(`data-price="${product.id}"`) && at(`data-price="${product.id}"`) < at('data-buy-now='), `${product.id}: text → sample → price → buttons`);
      else assert.ok(at('</dl>') < at(`data-price="${product.id}"`) && at(`data-price="${product.id}"`) < at('data-buy-now='), `${product.id}: text → price → buttons`);
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
      // A Story Workbooks card opens the Story Workbooks segment (five cards), not the whole Families list.
      assert.deepEqual(productAnchor(`#${product.id}`, locale), { section: product.category === 'workbooks' ? 'story-workbooks' : product.section, product: product.id, sample: false, target: product.id });
      assert.equal(productAnchor(`#${product.id}-sample`, locale)?.sample, !!product.sample);
      for (const alias of PRODUCT_FORMER_IDS[product.id] ?? []) assert.equal(productAnchor(`#${alias}`, locale)?.product, product.id);
    }
    for (const id of PRODUCT_SECTIONS) assert.equal(productAnchor(`#${id}`, locale)?.section, id);
    assert.deepEqual(productAnchor('#story-workbooks', locale), { section: 'story-workbooks', product: null, sample: false, target: 'story-workbooks' });
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

  test(`story workbooks ${locale}: a level picker under the tiles links to all five cards; the cards still sit once, in Families`, () => {
    const html = renderToStaticMarkup(createElement(ProductsPage, { locale })).replaceAll('<!-- -->', '');
    const band = html.match(/<section id="story-workbooks"[^>]*data-story-workbooks-band="">[\s\S]*?<\/section>/)?.[0] ?? '';
    assert.ok(band, 'the band renders (visible by default: no hidden attribute)');
    assert.doesNotMatch(band.slice(0, band.indexOf('>')), /hidden/, 'visible before any tile is pressed');
    assert.ok(html.indexOf('data-products-mini-nav') < html.indexOf('data-story-workbooks-band') && html.indexOf('data-story-workbooks-band') < html.indexOf('data-category-panel="families"'), 'tiles, then the level picker, then the catalogue');
    const ids = [1, 2, 3, 4, 5].map((n) => `story-workbooks-l${n}`);
    assert.deepEqual([...band.matchAll(/href="#([^"]+)" data-workbooks-level/g)].map((m) => m[1]), ids, 'one link per level, in order');
    for (const id of ids) {
      const card = productsPage(locale).sections.flatMap((s) => s.cards).find((c) => c.id === id)!;
      const link = band.match(new RegExp(`data-workbooks-level="${id}"[^>]*>[\\s\\S]*?</a>`))![0];
      assert.ok(link.includes(card.price), `${id}: price on the level link`);
      assert.ok(link.includes(WORKBOOK_AGES[id].replace('+', '')), `${id}: age range on the level link`);
      assert.ok(card.forWho.includes(WORKBOOK_AGES[id].replace('+', '')), `${id}: the picker's age range matches the card's Who it's for`);
      assert.equal((html.match(new RegExp(`<li class="product-row[^"]*" id="${id}"`, 'g')) ?? []).length, 1, `${id}: one card`);
      assert.equal(productAnchor(`#${id}`, locale)?.section, WORKBOOKS_SEGMENT);
    }
    assert.ok(band.includes(productsPage(locale).workbooksBand.intro), 'the intro line');
    assert.doesNotMatch(band, /<img|\.pdf|<form/i, 'no image, PDF or form in the picker');
  });
}

// Audit fix 9 (11 Nov 2026): one hero per audience at the top of /products, before the catalogue.
for (const locale of ['en', 'vi'] as const) test(`audience heroes ${locale}: families → Level 1 Story Workbooks, teachers → Level 1 Teacher Pack, IELTS separate; approved copy only`, async () => {
  const { AUDIENCE_HEROES } = await import('../src/components/ProductsPage');
  const html = renderToStaticMarkup(createElement(ProductsPage, { locale })).replaceAll('<!-- -->', '').replaceAll('&#x27;', "'");
  const band = html.match(/<section[^>]*data-audience-heroes="">[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.ok(band, 'the band renders');
  assert.ok(html.indexOf('data-audience-heroes') < html.indexOf('data-products-mini-nav'), 'above the segment tiles and the catalogue');
  assert.deepEqual([...band.matchAll(/data-audience-hero="([^"]+)"/g)].map((m) => m[1]), ['families', 'teachers', 'ielts']);
  assert.deepEqual(AUDIENCE_HEROES.map((h) => ('lead' in h ? h.lead : null)), ['story-workbooks-l1', 'teacher-pack-l1', null]);
  const c = productsPage(locale);
  for (const id of ['story-workbooks-l1', 'teacher-pack-l1']) {
    const card = c.sections.flatMap((s) => s.cards).find((entry) => entry.id === id)!;
    assert.ok(band.includes(`data-audience-lead="${id}">${card.title}<`), `${id}: title`);
    assert.ok(band.includes(card.problem), `${id}: approved problem line`);
    assert.ok(band.includes(`data-audience-price="${id}">${card.price}`), `${id}: price`);
    assert.ok(band.includes(`href="#${id}-sample"`), `${id}: opens the sample viewer`);
  }
  assert.ok(band.includes('href="#ielts"'), 'IELTS goes to its own section');
  for (const p of PRODUCTS.filter((entry) => (entry as { paused?: boolean }).paused)) assert.ok(!band.includes(`"${p.id}"`), `${p.id}: a paused product is never a hero`);
  assert.doesNotMatch(band, /bg-white/, 'no white surface (brand colours only)');
});
