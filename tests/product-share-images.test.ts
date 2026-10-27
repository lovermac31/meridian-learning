import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveRouteMetadata } from '../src/lib/routeMetadata';
import { PAGE_PRODUCTS, productPath } from '../src/i18n/content/productSeo';

// Image studio, 27 Oct 2026: a shared product link (Facebook, Zalo, X) shows that product's own square image, not the
// site's generic compass image. Other pages keep the default.
const webpSize = (file: Buffer) => {
  // VP8X (extended): canvas width/height are 24-bit little-endian minus one at bytes 24 and 27.
  if (file.subarray(12, 16).toString() === 'VP8X') return [file.readUIntLE(24, 3) + 1, file.readUIntLE(27, 3) + 1];
  if (file.subarray(12, 16).toString() === 'VP8 ') return [file.readUInt16LE(26) & 0x3fff, file.readUInt16LE(28) & 0x3fff];
  const bits = file.readUInt32LE(21); // VP8L
  return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
};

test('every product page (EN + VI) shares its own product image, 800×800, as a summary card', () => {
  assert.ok(PAGE_PRODUCTS.length >= 27);
  for (const product of PAGE_PRODUCTS) {
    const url = `https://jurassicenglish.com/images/products/${product.image}.webp`;
    const [width, height] = webpSize(readFileSync(`public/images/products/${product.image}.webp`));
    assert.deepEqual([width, height], [800, 800], `${product.id}: the declared size matches the file`);
    for (const path of [productPath(product.id), `/vi${productPath(product.id)}`]) {
      const meta = resolveRouteMetadata(path);
      assert.equal(meta.og.image, url, path);
      assert.equal(meta.og.imageWidth, 800, path);
      assert.equal(meta.og.imageHeight, 800, path);
      assert.equal(meta.twitter.image, url, path);
      assert.equal(meta.twitter.card, 'summary', path);
    }
  }
});

test('pages without their own image keep the default share image', () => {
  for (const path of ['/', '/vi', '/products', '/story-club']) {
    const meta = resolveRouteMetadata(path);
    assert.equal(meta.og.image, 'https://jurassicenglish.com/images/hero-compass-960.webp', path);
    assert.equal(meta.twitter.card, 'summary_large_image', path);
  }
});
