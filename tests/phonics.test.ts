import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PRODUCTS, PRODUCT_SEGMENTS, phonicsReaderHref } from '../src/i18n/content/products';
import { PAID_OFFERS } from '../src/config/payment';
import { productPaypalHref, productUsd } from '../src/lib/productsSource';
import { createProductJsonLd } from '../src/lib/structuredData';
import { PRODUCTS_NEW_HIGHLIGHT } from '../src/i18n/content/overhaul';
import { setServerLocation } from '../src/lib/ssrLocation';

// Jurassic English Phonics on the site (Jay, 15 Nov 2026: "GO, your recommendations D1 to D9"; brief WW-20261115-02).
const APPROVED: Record<string, { vnd: number; usd: number }> = { 'phonics-b1': { vnd: 79000, usd: 7.99 }, 'phonics-b2': { vnd: 129000, usd: 7.99 } };
const phonics = PRODUCTS.filter((p) => p.category === 'phonics');
const amp = (s: string) => s.replaceAll('&amp;', '&').replaceAll('<!-- -->', '');

test('AC2: only the cleared books (1 and 2) are live; no Book 3–5 or Series card; the tile sits second', () => {
  assert.deepEqual(phonics.map((p) => p.id), ['phonics-b1', 'phonics-b2']);
  assert.ok(phonics.every((p) => p.live && p.section === 'families'));
  assert.ok(!PRODUCTS.some((p) => /^phonics-(b[3-5]|series)$/.test(p.id)), 'no uncleared book or Series');
  assert.equal(PRODUCT_SEGMENTS[1], 'phonics');
});

test('AC2: /products#phonics and /vi/products#phonics show exactly the two book cards in the Phonics band', async () => {
  const { renderRoute } = await import('../src/entry-server');
  for (const route of ['/products', '/vi/products']) {
    const html = amp(await renderRoute(route));
    const band = html.match(/<section id="phonics"[^>]*data-phonics-band="">[\s\S]*?<\/section>/)?.[0] ?? '';
    assert.deepEqual([...band.matchAll(/data-phonics-book="([^"]+)"/g)].map((m) => m[1]), ['phonics-b1', 'phonics-b2'], route);
    assert.ok(band.includes(route.startsWith('/vi') ? 'Học đọc cùng Dane và Kate' : 'Learn to read with Dane and Kate'), `${route}: intro line`);
    assert.equal([...html.matchAll(/<li class="product-row[^"]*" id="phonics-[^"]+"/g)].length, 2, `${route}: two Phonics cards`);
  }
});

test('AC4 + no Buy now: sample block (thumbnails, clip, reader) before the price; the clip never autoplays', async () => {
  const { renderRoute } = await import('../src/entry-server');
  for (const p of phonics) {
    for (const route of [`/products/${p.id}`, `/vi/products/${p.id}`, '/products', '/vi/products']) {
      const html = amp(await renderRoute(route));
      const at = (marker: string) => html.indexOf(marker);
      assert.ok(at(`data-sample="${p.id}"`) > 0 && at(`data-sample="${p.id}"`) < at(`data-price="${p.id}"`), `${route} ${p.id}: sample before price`);
      assert.ok(at(`data-phonics-clip="${p.id}"`) > 0 && at(`data-phonics-clip="${p.id}"`) < at(`data-price="${p.id}"`), `${route} ${p.id}: clip before price`);
      const audio = html.match(new RegExp(`<audio[^>]*data-phonics-audio="${p.id}"[^>]*>`))![0];
      assert.doesNotMatch(audio, /autoplay/i, `${route} ${p.id}: no autoplay`);
      assert.match(audio, /preload="none"/, `${route} ${p.id}: nothing downloads before play`);
      assert.ok(html.includes(`href="${phonicsReaderHref(p)}"`), `${route} ${p.id}: reader sample`);
      assert.ok(!html.includes(`data-buy-now="${p.id}"`), `${route} ${p.id}: no Buy now`);
      assert.ok(html.includes(`href="/go/zalo/${p.id}?utm_source=products"`), `${route} ${p.id}: Order on Zalo names the book`);
      assert.ok(html.includes(route.startsWith('/vi') ? 'giọng đọc là giọng tổng hợp' : 'the voice is synthetic'), `${route}: disclosure`);
    }
  }
});

test('AC5: page amount = PayPal amount = JSON-LD offers (79.000₫ / 129.000₫, US$7.99); no automatic VietQR offer', () => {
  for (const p of phonics) {
    const want = APPROVED[p.id];
    assert.equal(Number(p.price.replace(/\D/g, '')), want.vnd, `${p.id}: page VND`);
    assert.equal(productUsd(p.price, p.id), want.usd, `${p.id}: PayPal US$`);
    for (const locale of ['en', 'vi'] as const) {
      const url = new URL(productPaypalHref(p.id, null, locale));
      assert.equal(url.searchParams.get('amount'), want.usd.toFixed(2));
      assert.equal(url.searchParams.get('currency_code'), 'USD');
      const offers = (createProductJsonLd(p, locale) as { offers: Array<{ price: string; priceCurrency: string }> }).offers;
      assert.deepEqual(offers.map((o) => [o.priceCurrency, o.price]), [['VND', String(want.vnd)], ['USD', String(want.usd)]], `${p.id} ${locale}: two offers`);
    }
    assert.ok(!PAID_OFFERS.some((o) => o.id === p.id), `${p.id}: ordered on Zalo or PayPal, no automatic checkout`);
  }
});

test('AC6: no ownership wording, no ™ after Phonics, and every new link puts utm_source before the #anchor', async () => {
  const { renderRoute } = await import('../src/entry-server');
  const { PRODUCTS_NEW_HREF } = await import('../src/i18n/content/overhaul');
  const ownership = /co-?owner|ownership|owned by|licen[cs]e split|50\/50|royalt/i;
  const tm = /Phonics\s*(™|&trade;|\(TM\)|<sup)/;
  // The Phonics pages and the pages that link to them, as served (EN + VI).
  for (const route of ['/products', '/vi/products', '/products/phonics-b1', '/vi/products/phonics-b1', '/products/phonics-b2', '/vi/products/phonics-b2', '/story-club', '/vi/story-club']) {
    const html = amp(await renderRoute(route));
    const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
    assert.doesNotMatch(main, ownership, `${route}: no ownership wording`);
    assert.doesNotMatch(html, tm, `${route}: no ™ on Phonics`);
    for (const m of html.matchAll(/href="([^"]*(?:phonics)[^"]*)"/g)) {
      if (!m[1].includes('#') || m[1].startsWith('#')) continue;
      const [query] = m[1].split('#');
      assert.match(query, /[?&]utm_source=[a-z0-9-]+/, `${route}: utm before # in ${m[1]}`);
    }
  }
  // Link builders outside the rendered pages: header, reader sample, Level Stories card (academy app).
  const academy = readFileSync('docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing/src/lib/academy/levelBooks.ts', 'utf8');
  for (const href of [PRODUCTS_NEW_HREF, ...phonics.map((p) => phonicsReaderHref(p)), academy.match(/\/products\?utm_source=academy#phonics/)?.[0] ?? '']) {
    assert.match(href.split('#')[0], /[?&]utm_source=[a-z0-9-]+/, `utm before # in ${href}`);
  }
  for (const p of phonics) for (const locale of ['en', 'vi'] as const) {
    const text = Object.values(p[locale]).join(' ');
    assert.doesNotMatch(text, ownership, `${p.id} ${locale}: card copy`);
    assert.doesNotMatch(text, tm, `${p.id} ${locale}: no ™`);
  }
});

test('header: Products carries the New badge and the header-new link; the menu button shows the dot below 2xl', async () => {
  const { Navbar } = await import('../src/components/Navbar');
  const noop = () => {};
  for (const [path, href, badge] of [['/', '/products?utm_source=header-new#phonics', 'New'], ['/vi', '/vi/products?utm_source=header-new#phonics', 'Mới']]) {
    setServerLocation(path);
    const header = amp(renderToStaticMarkup(createElement(Navbar, { onGetStarted: noop, onNavigateHome: noop, onNavigate: noop, onPricingClick: noop, onEducationAffiliateClick: noop })));
    setServerLocation('/');
    if (!PRODUCTS_NEW_HIGHLIGHT) continue;
    assert.ok(header.includes(`href="${href}"`), `${path}: header-new link`);
    assert.match(header, /data-testid="menu-new-dot"/, `${path}: dot on the menu button`);
    // Header Option A (15 Nov 2026): the badge is on Books & Prices, not on IELTS (one link to JurassicIELTS.com).
    const row = header.match(/<a href="https:\/\/jurassicielts\.com[^"]*"[^>]*>[\s\S]*?<\/a>/)?.[0] ?? '';
    assert.ok(row && !row.includes(`>${badge}<`), `${path}: IELTS has no badge`);
    assert.match(header, new RegExp(`href="${href.replace(/[?]/g, '\\?')}"[^>]*aria-label="[^"]+ ${badge}"`), `${path}: Products [New] in the row`);
  }
});
