import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { PRODUCTS } from '../src/i18n/content/products';
import { STARTERS_DRAFTS_PUBLIC, PREVIEW_PRODUCTS, PREVIEW_PRODUCT_PATHS, getProductByPath } from '../src/i18n/content/productSeo';
import { getExpectedPublicIndexableRoutes, getPrerenderRoutes } from '../src/lib/routeMetadata';

/** Hide-fix, 26 Nov 2026: the Starters drafts must not be served on the public site until Jay has settled the open decisions. */
const ids = PRODUCTS.filter(p => p.draftPreview).map(p => p.id);

test('Starters drafts are not routed: no product page, no prerender, no sitemap entry, in EN or VI', () => {
  assert.equal(ids.length, 4);
  assert.equal(STARTERS_DRAFTS_PUBLIC, false);
  assert.equal(PREVIEW_PRODUCTS.length, 0);
  assert.deepEqual(PREVIEW_PRODUCT_PATHS, []);
  const prerender = getPrerenderRoutes();
  const indexable = getExpectedPublicIndexableRoutes();
  for (const id of ids) {
    assert.equal(getProductByPath(`/products/${id}`), null, id);
    for (const path of [`/products/${id}`, `/vi/products/${id}`]) {
      assert.ok(!prerender.includes(path), path);
      assert.ok(!indexable.includes(path), path);
    }
  }
});

test('the unlistened Test 3 example clip is not in the public files or on the product; Tests 1 and 2 keep theirs', () => {
  const clip = (n: number) => `public/audio/starters/starters-practice-test-${n}-clip.mp3`;
  assert.equal(existsSync(clip(3)), false);
  assert.equal(PRODUCTS.find(p => p.id === 'starters-practice-test-3')!.clip, undefined);
  for (const n of [1, 2]) {
    assert.equal(existsSync(clip(n)), true);
    assert.equal(PRODUCTS.find(p => p.id === `starters-practice-test-${n}`)!.clip!.src, `/audio/starters/starters-practice-test-${n}-clip.mp3`);
  }
});
