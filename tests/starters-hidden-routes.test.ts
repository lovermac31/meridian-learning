import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { PRODUCTS } from '../src/i18n/content/products';
import { PAGE_PRODUCTS, PRODUCT_PAGE_PATHS, getProductByPath, relatedProducts } from '../src/i18n/content/productSeo';
import { STARTERS_HELD_IDS, STARTERS_IDS, STARTERS_TEST3_AND_SET_PUBLIC, STARTERS_VI_PUBLIC, isStartersVietnameseHeld } from '../src/i18n/content/startersFlags';
import { isPublicContentReleased } from '../src/i18n/content';
import { getExpectedPublicIndexableRoutes, getPrerenderRoutes, resolveRouteMetadata } from '../src/lib/routeMetadata';

/**
 * Starters launch (27 Nov 2026). What a visitor sees on production after Jay merges the launch PR, with both flags at their default:
 *   Tests 1 and 2: live in English (page, card, sitemap, JSON-LD, llms catalogue);
 *   their Vietnamese twins: not routed (the site's "Available soon" holding page, noindex), not on /vi/products, not in the sitemap;
 *   Test 3 and the 3-test set: nothing at all, in either language.
 */
const LIVE = ['starters-practice-test-1', 'starters-practice-test-2'];
const HELD = ['starters-practice-test-3', 'starters-practice-tests-pack'];

test('the two release flags default to false, and only the held ids depend on the first one', () => {
  assert.equal(STARTERS_TEST3_AND_SET_PUBLIC, false);
  assert.equal(STARTERS_VI_PUBLIC, false);
  assert.deepEqual([...STARTERS_HELD_IDS], HELD);
  assert.deepEqual([...STARTERS_IDS].sort(), [...LIVE, ...HELD].sort());
  for (const id of LIVE) assert.equal(PRODUCTS.find(p => p.id === id)!.live, true, id);
  for (const id of HELD) assert.equal(PRODUCTS.find(p => p.id === id)!.live, false, id);
});

test('Tests 1 and 2 are routed, prerendered and indexable in English', () => {
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

test('the Vietnamese twins of Tests 1 and 2 are held: no product, not indexable, not on /vi/products, never suggested', async () => {
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

test('Test 3 and the 3-test set are hidden everywhere (EN and VI): no page, no card, no route, no clip file, not in llms-products.md', async () => {
  const { renderRoute } = await import('../src/entry-server');
  const { readFileSync } = await import('node:fs');
  const prerender = getPrerenderRoutes();
  const indexable = getExpectedPublicIndexableRoutes();
  const llms = readFileSync('public/llms-products.md', 'utf8');
  for (const id of HELD) {
    assert.equal(getProductByPath(`/products/${id}`), null, id);
    assert.ok(!PAGE_PRODUCTS.some(p => p.id === id));
    for (const path of [`/products/${id}`, `/vi/products/${id}`]) {
      assert.ok(!PRODUCT_PAGE_PATHS.includes(path), path);
      assert.ok(!indexable.includes(path), path);
      const html = await renderRoute(path);
      assert.equal(html.includes(`data-product-page-main="${id}"`), false, `${path}: not served`);
    }
    for (const route of ['/products', '/vi/products']) assert.ok(!(await renderRoute(route)).includes(id), `${route}: ${id} absent`);
    assert.ok(!llms.includes(id), `llms-products.md: ${id} absent`);
    assert.ok(!prerender.includes(`/products/${id}`), id);
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
