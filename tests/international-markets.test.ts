import test from 'node:test';
import assert from 'node:assert/strict';
import { renderRoute } from '../src/entry-server';
import { seoPages } from '../src/lib/seoPages';
import { getExpectedPublicIndexableRoutes, resolveRouteMetadata } from '../src/lib/routeMetadata';
import { extractVisibleText } from '../scripts/lib/visible-text.mjs';

const origin = 'https://jurassicenglish.com';
const marketPages = seoPages.filter(page => page.path.startsWith('/ielts-speaking-online'));
const sitemapRoutes = new Set(getExpectedPublicIndexableRoutes());

function phrases(text: string) {
  const words = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return new Set(words.slice(0, -4).map((_, index) => words.slice(index, index + 5).join(' ')));
}

test('hub and eight distinct country routes enter the sitemap inventory', () => {
  assert.equal(marketPages.length, 9);
  assert.equal(new Set(marketPages.map(page => page.path)).size, 9);
  for (const page of marketPages) assert.ok(sitemapRoutes.has(page.path), page.path);
});

for (const page of marketPages) {
  test(`${page.path} renders English SSR text and market metadata`, async () => {
    const rendered = await renderRoute(page.path);
    const visible = extractVisibleText(`<body>${rendered}</body>`);
    const metadata = resolveRouteMetadata(page.path);
    assert.match(rendered, /<main id="main-content"/);
    assert.ok(visible.includes(page.h1));
    assert.equal(metadata.htmlLang, 'en');
    assert.equal(metadata.canonical, `${origin}${page.path}`);
    assert.equal(metadata.alternates, undefined);
    assert.ok(visible.includes('not an official IELTS score'));
    assert.ok(visible.includes('independent of British Council, IDP IELTS and Cambridge University Press & Assessment'));
    assert.ok(visible.includes('Payment is by bank transfer in Vietnamese đồng (VietQR).'));
    assert.ok(visible.includes("contact us before booking."));
    const types = new Set(metadata.jsonLd?.map(block => block['@type']));
    for (const type of ['Service', 'FAQPage', 'BreadcrumbList']) assert.ok(types.has(type), type);
    for (const item of page.faq) {
      assert.ok(visible.includes(item.question));
      assert.ok(visible.includes(item.answer));
    }
    if (page.path !== '/ielts-speaking-online') {
      const words = visible.split(/\s+/).length;
      assert.ok(words >= 900 && words <= 1300, `${page.path}: ${words} words`);
    }
  });
}

test('country copy shares fewer than 40% of five-word phrases', () => {
  const countries = marketPages.filter(page => page.path !== '/ielts-speaking-online');
  for (let i = 0; i < countries.length; i++) {
    for (let j = i + 1; j < countries.length; j++) {
      const left = phrases(extractVisibleText(`<body>${countries[i].html}</body>`));
      const right = phrases(extractVisibleText(`<body>${countries[j].html}</body>`));
      const shared = [...left].filter(phrase => right.has(phrase)).length;
      assert.ok(shared / Math.min(left.size, right.size) < 0.4, `${countries[i].path} / ${countries[j].path}: ${shared}`);
    }
  }
});
