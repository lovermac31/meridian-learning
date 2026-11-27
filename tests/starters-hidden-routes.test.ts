import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { PRODUCTS } from '../src/i18n/content/products';
import { PAGE_PRODUCTS, PRODUCT_PAGE_PATHS, getProductByPath, relatedProducts } from '../src/i18n/content/productSeo';
import { STARTERS_HELD_IDS, STARTERS_IDS, STARTERS_TEST3_AND_SET_PUBLIC, STARTERS_VI_PUBLIC, isStartersVietnameseHeld } from '../src/i18n/content/startersFlags';
import { isPublicContentReleased } from '../src/i18n/content';
import { getExpectedPublicIndexableRoutes, getPrerenderRoutes, resolveRouteMetadata } from '../src/lib/routeMetadata';

/**
 * Starters (27 Nov 2026). What a visitor sees on production after this PR (Jay: "Make the Test 3 and set pages live"):
 *   Tests 1 and 2, Test 3 and the 3-test set: live in English (page, card, sitemap, JSON-LD, llms catalogue);
 *   their Vietnamese twins: not routed (the site's "Available soon" holding page, noindex), not on /vi/products, not in the sitemap
 *   (STARTERS_VI_PUBLIC stays false until a native read);
 *   the Test 3 example clip: still not in the repo (the Test 3 tracks have no recorded listen), so the Test 3 page has no audio player.
 */
const LIVE = ['starters-practice-test-1', 'starters-practice-test-2', 'starters-practice-test-3', 'starters-practice-tests-pack'];
const HELD: string[] = []; // nothing is held back once STARTERS_TEST3_AND_SET_PUBLIC is true; the ids that flag governs are in STARTERS_HELD_IDS

test('flags: Test 3 and the set are public (Jay, 27 Nov), the Vietnamese stays held, and all four products are live', () => {
  assert.equal(STARTERS_TEST3_AND_SET_PUBLIC, true);
  assert.equal(STARTERS_VI_PUBLIC, false);
  assert.deepEqual([...STARTERS_HELD_IDS], ['starters-practice-test-3', 'starters-practice-tests-pack']);
  assert.deepEqual([...STARTERS_IDS].sort(), [...LIVE].sort());
  for (const id of LIVE) assert.equal(PRODUCTS.find(p => p.id === id)!.live, true, id);
});

test('all four Starters products are routed, prerendered and indexable in English', () => {
  const prerender = getPrerenderRoutes();
  const indexable = getExpectedPublicIndexableRoutes();
  for (const id of LIVE) {
    const path = `/products/${id}`;
    assert.ok(PAGE_PRODUCTS.some(p => p.id === id), id);
    assert.ok(PRODUCT_PAGE_PATHS.includes(path), id);
    assert.equal(getProductByPath(path)?.id, id);
    assert.ok(prerender.includes(path) && indexable.includes(path), `${path}: prerendered and in the sitemap source`);
    const meta = resolveRouteMetadata(path);
    assert.match(meta.robots ?? '', /^index/, `${path}: indexable`);
    assert.equal(meta.canonical, `https://jurassicenglish.com${path}`);
    // hreflang: the Vietnamese twin is held, so the English page has no alternates pointing at it.
    assert.ok(!JSON.stringify(meta.alternates ?? []).includes('/vi/'), `${path}: no /vi alternate while the Vietnamese is held`);
  }
});

test('the Vietnamese twins of all four are held: no product, not indexable, not on /vi/products, never suggested', async () => {
  const { renderRoute } = await import('../src/entry-server');
  const indexable = getExpectedPublicIndexableRoutes();
  for (const id of LIVE) {
    const path = `/vi/products/${id}`;
    assert.equal(isStartersVietnameseHeld(`/products/${id}`), true);
    assert.equal(isPublicContentReleased(`/products/${id}`, 'vi'), false);
    assert.equal(getProductByPath(`/products/${id}`, 'vi'), null, id);
    assert.ok(!indexable.includes(path), `${path}: not in the sitemap source`);
    assert.match(resolveRouteMetadata(path).robots ?? '', /noindex/, `${path}: holding page is noindex`);
    const html = await renderRoute(path);
    assert.equal(html.includes(`data-product-page-main="${id}"`), false, `${path}: the product is not served`);
    assert.doesNotMatch(html, /data-buy-now|data-paypal-link|data-order-code|data-price=/, `${path}: no order path`);
  }
  const hub = await renderRoute('/vi/products');
  for (const id of STARTERS_IDS) assert.ok(!hub.includes(id), `/vi/products: ${id} absent`);
  for (const p of PAGE_PRODUCTS) assert.ok(!relatedProducts(p.id, 3, 'vi').some(r => STARTERS_IDS.includes(r.id)), `${p.id}: no Starters pick on a /vi page`);
});

test('Test 3 and the 3-test set are live in English with their own page, card, sitemap entry and llms line, and have no order path beyond Zalo and PayPal', async () => {
  const { renderRoute } = await import('../src/entry-server');
  const { readFileSync } = await import('node:fs');
  const indexable = getExpectedPublicIndexableRoutes();
  const llms = readFileSync('public/llms-products.md', 'utf8');
  const hub = await renderRoute('/products');
  for (const id of ['starters-practice-test-3', 'starters-practice-tests-pack']) {
    assert.equal(getProductByPath(`/products/${id}`)?.id, id);
    assert.ok(indexable.includes(`/products/${id}`), `${id}: in the sitemap source`);
    const html = await renderRoute(`/products/${id}`);
    assert.equal(html.includes(`data-product-page-main="${id}"`), true, `${id}: page served`);
    assert.doesNotMatch(html, /data-buy-now|data-portal-buy|qr\.sepay|checkout=1/, `${id}: no automatic checkout`);
    assert.doesNotMatch(html, /authentic|TO CONFIRM|VI DRAFT/i, `${id}: no placeholder or banned word (the site-wide footer's Cambridge disclaimer is not product copy)`);
    assert.ok(hub.includes(id), `/products: ${id} card present`);
    if (id === 'starters-practice-test-3') assert.doesNotMatch(html, /audio example|example clip|<audio/, 'Test 3 promises no audio example while it has no clip');
    assert.ok(llms.includes(id), `llms-products.md: ${id} present`);
  }
});

test('the unlistened Test 3 example clip is not in the public files or on the product; Tests 1 and 2 keep theirs; the set reuses Test 1\'s', () => {
  const clip = (n: number) => `public/audio/starters/starters-practice-test-${n}-clip.mp3`;
  assert.equal(existsSync(clip(3)), false);
  assert.equal(PRODUCTS.find(p => p.id === 'starters-practice-test-3')!.clip, undefined);
  for (const n of [1, 2]) {
    assert.equal(existsSync(clip(n)), true);
    assert.equal(PRODUCTS.find(p => p.id === `starters-practice-test-${n}`)!.clip!.src, `/audio/starters/starters-practice-test-${n}-clip.mp3`);
  }
  assert.equal(PRODUCTS.find(p => p.id === 'starters-practice-tests-pack')!.clip!.src, '/audio/starters/starters-practice-test-1-clip.mp3');
});
