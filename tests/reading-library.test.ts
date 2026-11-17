import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PRODUCTS } from '../src/i18n/content/products';
import { PAID_OFFERS } from '../src/config/payment';
import { PORTAL_BUY_FLAGS } from '../src/config/portalBuy';
import { createProductListJsonLd, createProductJsonLd } from '../src/lib/structuredData';
import * as libMod from '../src/i18n/content/readingLibrary';
import { LIBRARY_ANCHOR, LIBRARY_COPY, LIBRARY_TITLES, isLibraryPreview, isSellable, libraryAnchorId, libraryWaitlistHref } from '../src/i18n/content/readingLibrary';
import * as hubModule from '../docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing/src/lib/academy/readingLibrary';

type Hub = typeof hubModule;
const hub: Hub = (hubModule as unknown as { default?: Hub }).default ?? hubModule;
// Reading & Reasoning Library preview (brief WW-20261115-RL6B): PREVIEW_ONLY cards behind ?library-preview=1.
const ECO = 'docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing';
const read = (p: string) => readFileSync(p, 'utf8');
// Code comments are not customer copy (as in claims-safety.test.ts); strip them before scanning for forbidden wording.
const code = (p: string) => read(p).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const amp = (s: string) => s.replaceAll('&amp;', '&').replaceAll('<!-- -->', '');
const PILOTS = [['rl-je-l1-18', 1, 'The Wind, the Sun and the Yellow Coat', '4–8'], ['rl-je-l3-c03', 3, 'The Last Seat on the Night Ferry', '10–12'], ['rl-je-l5-c02', 5, 'The Heron Stamp', '14+']] as const;

test('three pilots, all PREVIEW_ONLY, with the inventory titles and the site level age bands', () => {
  assert.deepEqual(LIBRARY_TITLES.map((t) => [t.id, t.level, t.title, t.ages]), PILOTS.map((p) => [...p]));
  assert.ok(LIBRARY_TITLES.every((t) => t.availability === 'PREVIEW_ONLY' && !isSellable(t)));
  const lb = read(`${ECO}/src/lib/academy/levelBooks.ts`);
  for (const [, level, , ages] of PILOTS) assert.match(lb, new RegExp(`level: ${level},[\\s\\S]*?ages: "${ages.replace('+', '\\+')}"`), `level ${level} age band`);
  assert.ok(LIBRARY_TITLES.every((t) => t.includes.reader && t.includes.workbook && t.includes.guide));
});

// Real Reading & Reasoning Library markup, and only that: the band and card attributes and classes ProductsPage gives the
// library (data-library-*, products-library*, #reading-library, rl-je-* card anchors) and the library's own EN/VI heading.
// A live product that is merely *labelled* "Reading & Reasoning" (rr-l1-wind-sun-yellow-coat, #350) is not library markup.
// Every marker main's AC2 regex had (#353) is kept, so the check is no weaker; only the bare series name is not a marker.
const LIBRARY_MARKERS = [/data-library-/, /reading-library/, /products-library/, /rl-je-/,
  ...(['en', 'vi'] as const).map((l) => new RegExp(LIBRARY_COPY[l].heading.split(' (')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))];
const libraryMarkup = (html: string) => LIBRARY_MARKERS.filter((re) => re.test(html)).map(String);
const LIVE_CARDS = () => PRODUCTS.filter((p) => p.live && p.section !== 'ielts').length;

test('AC2: default render has zero library cards (EN + VI /products; the hub row is client-gated, see the flag test)', async () => {
  // 17 Nov 2026: #350 made the Level 1 single story (rr-l1-wind-sun-yellow-coat) a live product whose card pill reads
  // 'Digital download · Reading & Reasoning · New'. The check now looks for real library markup (libraryMarkup above), so that
  // label passes and any library band, card or heading still fails. The card count is the live non-IELTS product count from the data.
  const { renderRoute } = await import('../src/entry-server');
  for (const route of ['/products', '/vi/products']) {
    const html = amp(await renderRoute(route));
    assert.deepEqual(libraryMarkup(html), [], `${route}: no library markup`);
    assert.equal([...html.matchAll(/<li class="product-row[^"]*" id="/g)].length, LIVE_CARDS(), `${route}: one card per live non-IELTS product`);
  }
});

test('AC2 regression: a live product labelled "Reading & Reasoning" passes; a real library card, band or heading fails', () => {
  const legit = amp('<li class="product-row" id="rr-l1-wind-sun-yellow-coat"><p class="product-row-meta"><span class="product-row-pill">Digital download · Reading &amp; Reasoning · New</span></p>'
    + '<dd>An earlier edition of this story is one of the 10 books in the Level 1 Story Workbooks; this Reading &amp; Reasoning edition is new and is sold on its own.</dd></li>'
    + '<li class="product-row" id="mango-l2"><span class="product-row-pill">Đọc &amp; Tư duy · Mới</span></li>');
  assert.deepEqual(libraryMarkup(legit), [], 'a live product label is not library markup');
  const t = LIBRARY_TITLES[0];
  const real = {
    card: `<li id="${libraryAnchorId(t.id)}" data-library-title="${t.id}" data-availability="${t.availability}" class="products-library-card"><h3>${t.title}</h3></li>`,
    band: `<section id="${LIBRARY_ANCHOR}" aria-labelledby="${LIBRARY_ANCHOR}-h" class="products-library scroll-mt-24" data-library-band="">`,
    headingEn: `<h2>${LIBRARY_COPY.en.heading}</h2>`,
    headingVi: `<h2>${LIBRARY_COPY.vi.heading}</h2>`,
    anchorOnly: `<a href="#${libraryAnchorId(t.id)}">x</a>`,
  };
  for (const [name, html] of Object.entries(real)) assert.notDeepEqual(libraryMarkup(amp(html)), [], `${name}: real library markup is caught`);
  // The same legit label next to a real card still fails as a whole page.
  assert.notDeepEqual(libraryMarkup(legit + real.card), []);
});

test('flag: only ?library-preview=1 turns the library on, and only on the client after hydration', () => {
  assert.equal(isLibraryPreview(''), false);
  assert.equal(isLibraryPreview('?library-preview=0'), false);
  assert.equal(isLibraryPreview('?library-preview=true'), false);
  assert.equal(isLibraryPreview('?utm_source=x&library-preview=1'), true);
  const page = read('src/components/ProductsPage.tsx');
  assert.match(page, /useState\(false\);[\s\S]{0,200}useEffect\(\(\) => \{ setLibraryPreview\(isLibraryPreview\(window\.location\.search\)\); \}, \[\]\)/);
  assert.match(page, /\{libraryPreview \? \(\s*<section id=\{LIBRARY_ANCHOR\}/);
  const row = read(`${ECO}/src/components/student-academy/LibraryRow.tsx`);
  assert.match(row, /useState\(false\)/);
  assert.match(row, /if \(!on \|\| !titles\.length\) return null/);
});

test('AC2 guard: library ids are not in PRODUCTS, PAID_OFFERS, portal flags, JSON-LD, sitemap or llms', () => {
  const ids = LIBRARY_TITLES.map((t) => t.id);
  for (const id of ids) {
    assert.ok(!PRODUCTS.some((p) => p.id === id), `${id} not in PRODUCTS`);
    assert.ok(!PAID_OFFERS.some((o) => o.id === id), `${id} not in PAID_OFFERS`);
    assert.ok(!(id in PORTAL_BUY_FLAGS), `${id} has no portal flag`);
  }
  assert.ok(!PRODUCTS.some((p) => p.id.startsWith('rl-')));
  for (const locale of ['en', 'vi'] as const) {
    const list = JSON.stringify(createProductListJsonLd(locale));
    for (const id of ids) assert.ok(!list.includes(id), `${locale}: ${id} not in the ItemList`);
    assert.equal((list.match(/https:\/\/schema\.org\/InStock/g) ?? []).length, PRODUCTS.filter((p) => p.live && p.section !== 'ielts').length);
    for (const p of PRODUCTS.filter((x) => x.live && x.section !== 'ielts').slice(0, 3)) assert.ok(JSON.stringify(createProductJsonLd(p, locale)).includes(p.id));
  }
  assert.doesNotMatch(read('scripts/generate-sitemap.mjs'), /rl-je-|reading-library/);
  assert.doesNotMatch(read('src/lib/routeMetadata.ts'), /rl-je-|readingLibrary/);
  assert.doesNotMatch(read('scripts/generate-llms-product-catalog.mjs'), /readingLibrary/);
  assert.doesNotMatch(read('public/llms-products.md'), /rl-je-|Reading & Reasoning/);
});

test('no price, no buy button, no Offer, no availability markup in library data, copy or components', () => {
  const sources = [code('src/i18n/content/readingLibrary.ts'), code(`${ECO}/src/lib/academy/readingLibrary.ts`), code(`${ECO}/src/components/student-academy/LibraryRow.tsx`)];
  const page = read('src/components/ProductsPage.tsx');
  const band = page.slice(page.indexOf('data-library-band'), page.indexOf('className="ielts-tool-content products-catalogue"'));
  assert.ok(band.length > 200);
  for (const text of [...sources, band, JSON.stringify(LIBRARY_COPY), JSON.stringify(LIBRARY_TITLES)]) {
    assert.doesNotMatch(text, /\d{1,3}(\.\d{3})+\s?₫|US\$|InStock|OutOfStock|PreOrder|schema\.org|data-price|data-buy-now|data-portal-buy|data-order-code|paypal|VietQR|Buy now|Mua ngay|Order on Zalo|Đặt mua qua Zalo/i);
  }
  assert.equal(isSellable({ availability: 'PREVIEW_ONLY' }), false);
});

test('waitlist link reuses /go/zalo/<id> with utm_source last and no #anchor after a missing query', () => {
  for (const t of LIBRARY_TITLES) {
    assert.equal(libraryWaitlistHref(t.id, 'products'), `/go/zalo/${t.id}?utm_content=${t.id}-waitlist&utm_campaign=reading-library&utm_source=products`);
    assert.equal(hub.libraryWaitlistHref(t.id), `/go/zalo/${t.id}?utm_content=${t.id}-waitlist&utm_campaign=reading-library&utm_source=academy`);
  }
});

test('EN/VI parity, neutral labels, NEEDS-NATIVE-READ markers, and hub data equals main-app data', () => {
  assert.deepEqual(Object.keys(LIBRARY_COPY.en).sort(), Object.keys(LIBRARY_COPY.vi).sort());
  assert.equal(LIBRARY_COPY.en.heading, 'Reading & Reasoning Library (preview)');
  assert.equal(LIBRARY_COPY.vi.heading, 'Thư viện Đọc & Lập luận (bản xem trước)');
  for (const t of LIBRARY_TITLES) assert.ok(t.en.synopsis.length > 20 && t.vi.synopsis.length > 20);
  assert.match(read('src/i18n/content/readingLibrary.ts'), /NEEDS-NATIVE-READ/);
  assert.match(read(`${ECO}/src/lib/academy/readingLibrary.ts`), /NEEDS-NATIVE-READ/);
  assert.deepEqual(hub.LIBRARY_TITLES, LIBRARY_TITLES.map(({ sourceId: _s, ...rest }) => rest));
  assert.equal(JSON.stringify(hub.LIBRARY_COPY.en, (_k, v) => (typeof v === 'function' ? v('X') : v)), JSON.stringify(LIBRARY_COPY.en, (_k, v) => (typeof v === 'function' ? v('X') : v)));
  assert.equal(JSON.stringify(hub.LIBRARY_COPY.vi, (_k, v) => (typeof v === 'function' ? v('X') : v)), JSON.stringify(LIBRARY_COPY.vi, (_k, v) => (typeof v === 'function' ? v('X') : v)));
  const hubUi = read(`${ECO}/src/components/student-academy/LevelStories.tsx`);
  assert.match(hubUi, /<LibraryRow level=\{level\.level\} locale=\{locale\} \/>/);
});

test('palette, no Lina, no audio, no claims in the library UI', () => {
  const css = read('src/styles/products.css');
  const block = css.slice(css.indexOf('Reading & Reasoning Library preview'));
  assert.doesNotMatch(block, /#fff\b|#ffffff|white|rgb\(255 255 255/i);
  assert.match(block, /#13294B/); assert.match(block, /#F3E8CF/); assert.match(block, /#9B1C31/);
  const row = read(`${ECO}/src/components/student-academy/LibraryRow.tsx`);
  assert.doesNotMatch(row, /bg-white|text-white|#fff\b/i);
  const all = [code('src/i18n/content/readingLibrary.ts'), code(`${ECO}/src/components/student-academy/LibraryRow.tsx`), code(`${ECO}/src/lib/academy/readingLibrary.ts`), block].join('\n');
  assert.doesNotMatch(all, /lina|<audio|autoplay|<video|\.mp3/i);
  assert.doesNotMatch(all, /certified|guarantee|accredited|CEFR.aligned|rights.cleared|co-?owner|50\/50/i);
});

test('existing cards untouched: the story-workbook, teacher-pack and phonics entries keep their ids and prices', () => {
  const price = (id: string) => PRODUCTS.find((p) => p.id === id)?.price;
  for (const n of [1, 2, 3, 4, 5]) assert.equal(price(`story-workbooks-l${n}`), '290.000₫');
  assert.equal(price('teacher-pack-l1'), '690.000₫');
  assert.equal(price('phonics-b1'), '79.000₫');
  assert.equal(price('phonics-b2'), '129.000₫');
  // Pinned on purpose (a regression guard, not a guess): 36 since #350, 37 with Thinking Expeditions Level 1 (#355). Read from the data on 17 Nov 2026.
  assert.equal(PRODUCTS.filter((p) => p.live && p.section !== 'ielts').length, 37);
});

test('copy says the story is already inside Story Workbooks Level N, with a link to the existing product page and no sale wording', () => {
  const { libraryIncludedHref } = libMod;
  for (const t of LIBRARY_TITLES) {
    assert.ok(PRODUCTS.some((p) => p.id === `story-workbooks-l${t.level}` && p.live), `story-workbooks-l${t.level} is a live page`);
    assert.equal(libraryIncludedHref(t.level, 'en', 'products'), `/products/story-workbooks-l${t.level}?utm_source=products`);
    assert.equal(libraryIncludedHref(t.level, 'vi', 'products'), `/vi/products/story-workbooks-l${t.level}?utm_source=products`);
    assert.equal(hub.libraryIncludedHref(t.level, 'vi'), `/vi/products/story-workbooks-l${t.level}?utm_source=academy`);
  }
  assert.match(LIBRARY_COPY.en.notForSale, /new standalone edition.*preview with no price yet/);
  assert.match(LIBRARY_COPY.en.included, /already included in/);
  assert.equal(LIBRARY_COPY.en.includedLink(3), 'Story Workbooks Level 3');
  assert.equal(LIBRARY_COPY.vi.includedLink(5), 'Sách truyện bài tập Level 5');
  assert.doesNotMatch(JSON.stringify(LIBRARY_COPY), /Not for sale/i);
});
