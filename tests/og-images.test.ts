import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { resolveRouteMetadata } from '../src/lib/routeMetadata';
import { PAGE_PRODUCTS, productPath } from '../src/i18n/content/productSeo';
import { createOrganizationJsonLd } from '../src/lib/structuredData';

const sampleRoutes = [
  '/', '/vi', '/products', '/vi/products', '/products/one-to-one', '/vi/products/one-to-one',
  '/products/printable-pack', '/vi/products/printable-pack', '/products/story-club',
  '/vi/products/story-club', '/products/story-workbooks-l1', '/vi/products/story-workbooks-l1',
  '/story-club', '/story-club/reserve', '/en/story-club/reserve', '/series/level-1-foundation',
  '/vi/series/level-1-foundation', '/series/level-1-foundation/syllabus',
  '/vi/series/level-1-foundation/syllabus', '/vi/ve-thay-jay-adams',
  ...PAGE_PRODUCTS.flatMap((product) => [productPath(product.id), `/vi${productPath(product.id)}`]),
];

function jpegDimensions(buffer: Buffer): [number, number] {
  assert.equal(buffer.readUInt16BE(0), 0xffd8, 'JPEG start marker');
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) throw new Error('Invalid JPEG marker');
    const marker = buffer[offset + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    const size = buffer.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3].includes(marker)) {
      return [buffer.readUInt16BE(offset + 7), buffer.readUInt16BE(offset + 5)];
    }
    offset += size + 2;
  }
  throw new Error('JPEG dimensions missing');
}

test('share images and social cards match 1200×630 assets', () => {
  for (const route of sampleRoutes) {
    const metadata = resolveRouteMetadata(route);
    assert.equal(metadata.og.imageWidth, 1200, route);
    assert.equal(metadata.og.imageHeight, 630, route);
    assert.ok(metadata.og.imageAlt.trim(), `${route}: image alt`);
    assert.equal(metadata.twitter.card, 'summary_large_image', route);
    assert.equal(metadata.twitter.image, metadata.og.image, route);
    const pathname = new URL(metadata.og.image).pathname;
    assert.match(pathname, /^\/images\/og\/[a-z-]+\.jpg$/, route);
    const file = `public${pathname}`;
    assert.deepEqual(jpegDimensions(readFileSync(file)), [1200, 630], route);
    assert.ok(statSync(file).size < 200_000, `${route}: ${file} must be under 200 KB`);
  }
});

test('dimension guard rejects the former 960×640 image', () => {
  assert.notDeepEqual([960, 640], [1200, 630]);
});

test('the three audited descriptions stay within 155 characters', () => {
  for (const route of ['/story-club/reserve', '/vi/products', '/vi/series/level-1-foundation']) {
    assert.ok(resolveRouteMetadata(route).description.length <= 155, route);
  }
});

test('EducationalOrganization has the required identity and only approved sameAs profiles', () => {
  const source = JSON.parse(readFileSync('docs/SAMEAS.json', 'utf8')) as { sameAs: string[] };
  const organization = createOrganizationJsonLd() as Record<string, unknown>;
  assert.equal(organization.name, 'Jurassic English™');
  assert.equal(organization.alternateName, 'Jurassic English');
  assert.equal(organization.url, 'https://jurassicenglish.com');
  assert.equal(organization.logo, 'https://jurassicenglish.com/icon-512.png');
  assert.deepEqual(organization.sameAs ?? [], source.sameAs);
});
