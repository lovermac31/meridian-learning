import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PAUSED_COPY, PRODUCTS, pausedNoteFor } from '../src/i18n/content/products';
import { PAUSED_PRODUCTS } from '../api/sample-pack';

// 17 Nov 2026: Thinking Expeditions Level 1 stays visible (card, page, sample, licence, price) but opens no checkout until the
// re-gated book file is approved. Un-pause = remove `paused`/`pauseNote` in products.ts and the id from PAUSED_PRODUCTS.
const ID = 'thinking-expeditions-l1';
const amp = (s: string) => s.replaceAll('&amp;', '&').replaceAll('&#x27;', "'").replaceAll('<!-- -->', '');
const mainOf = (html: string) => html.slice(html.indexOf('<main'), html.indexOf('</main>'));
const NO_BUY = /data-buy-now=|data-cta="product-(?:page-)?thinking-expeditions-l1"|data-order-code=|data-paypal-link=|data-viewer-order=|\?checkout=1/;

test('Thinking Expeditions L1 is paused in the catalogue and on the server', () => {
  const p = PRODUCTS.find((entry) => entry.id === ID)!;
  assert.equal(p.live, true, 'still listed');
  assert.equal(p.paused, true);
  assert.ok(PAUSED_PRODUCTS.has(ID), 'server refuses payment codes and orders');
  assert.ok(p.pauseNote, 'its own honest reason, not the "being rewritten" note');
});

test('paused: product page (EN + VI) keeps sample, licence and price, shows the waitlist, and has no buy or checkout link', async () => {
  const { renderRoute } = await import('../src/entry-server');
  for (const [route, locale] of [[`/products/${ID}`, 'en'], [`/vi/products/${ID}`, 'vi']] as const) {
    const main = mainOf(amp(await renderRoute(route)));
    assert.ok(main.includes(`data-sample-link="${ID}"`), `${route}: sample`);
    assert.ok(main.includes(`data-licence="${ID}"`), `${route}: licence`);
    assert.ok(main.indexOf(`data-licence="${ID}"`) < main.indexOf(`data-price="${ID}"`), `${route}: licence above the price`);
    assert.ok(main.includes(`data-paused-waitlist="${ID}"`) && main.includes(pausedNoteFor(PRODUCTS.find((p) => p.id === ID)!, locale)), `${route}: waitlist note`);
    assert.ok(!main.includes(PAUSED_COPY[locale].note), `${route}: no generic "being rewritten" note`);
    assert.doesNotMatch(main, NO_BUY, `${route}: no buy, order or checkout link`);
  }
});

test('paused: /products card (EN + VI) has no buy or order button', async () => {
  const { renderRoute } = await import('../src/entry-server');
  for (const route of ['/products', '/vi/products']) {
    const html = amp(await renderRoute(route));
    const start = html.indexOf(`id="${ID}"`);
    const card = html.slice(start, html.indexOf('</li>', start));
    assert.ok(start > 0 && card.includes(`data-paused-waitlist="${ID}"`), `${route}: card with waitlist`);
    assert.doesNotMatch(card, NO_BUY, `${route}: no buy, order or checkout link`);
  }
});

test('paused: ?checkout=1 never renders the checkout for a paused product (ProductPage guard)', () => {
  const src = readFileSync('src/components/ProductPage.tsx', 'utf8');
  assert.match(src, /if \(checkout && !product\.paused && !product\.orderOnly\) return <StoryClubReservePage/, 'the checkout is gated on !paused');
});

test('paused: the llms product catalogue states the real reason, not "being rewritten"', async () => {
  const { execFileSync } = await import('node:child_process');
  execFileSync('node', ['--import', 'tsx', 'scripts/generate-llms-product-catalog.mjs'], { stdio: 'ignore' });
  const md = readFileSync('public/llms-products.md', 'utf8');
  const block = md.slice(md.indexOf(`- ID: \`${ID}\``), md.indexOf('### ', md.indexOf(`- ID: \`${ID}\``)));
  assert.match(block, /- Availability: paused, not for sale; Coming soon: the final book file is being checked/);
  assert.doesNotMatch(block, /being rewritten/);
});
