import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRouteMetadata } from '../src/lib/routeMetadata';
import { PAGE_PRODUCTS, productPath } from '../src/i18n/content/productSeo';

test('every product page (EN + VI) has a wide share image and large card', () => {
  assert.ok(PAGE_PRODUCTS.length >= 27);
  for (const product of PAGE_PRODUCTS) {
    for (const path of [productPath(product.id), `/vi${productPath(product.id)}`]) {
      const meta = resolveRouteMetadata(path);
      assert.match(meta.og.image, /^https:\/\/jurassicenglish\.com\/images\/og\//, path);
      assert.equal(meta.og.imageWidth, 1200, path);
      assert.equal(meta.og.imageHeight, 630, path);
      assert.equal(meta.twitter.image, meta.og.image, path);
      assert.equal(meta.twitter.card, 'summary_large_image', path);
    }
  }
});
