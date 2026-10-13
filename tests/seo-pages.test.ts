import test from 'node:test';
import assert from 'node:assert/strict';
import { renderRoute } from '../src/entry-server';
import { seoPages } from '../src/lib/seoPages';
import { getExpectedPublicIndexableRoutes, resolveRouteMetadata } from '../src/lib/routeMetadata';
import { extractVisibleText } from '../scripts/lib/visible-text.mjs';

const origin = 'https://jurassicenglish.com';
const routes = new Set(getExpectedPublicIndexableRoutes());

for (const page of seoPages) {
  test(`${page.path} renders its full SEO page on the server`, async () => {
    const html = await renderRoute(page.path);
    const metadata = resolveRouteMetadata(page.path);
    const visible = extractVisibleText(`<body>${html}</body>`);
    const en = page.locale === 'en' ? page.path : page.alternatePath;
    const vi = page.locale === 'vi' ? page.path : page.alternatePath;

    assert.ok(routes.has(page.path));
    assert.ok(html.includes('<main id="main-content"'), 'SSR main is present');
    assert.ok(visible.includes(page.h1), 'draft H1 is visible');
    assert.ok(visible.length > 1000, 'full body is rendered');
    assert.equal(metadata.htmlLang, page.locale);
    assert.equal(metadata.title, page.title);
    assert.equal(metadata.description, page.description);
    assert.equal(metadata.canonical, `${origin}${page.path}`);
    assert.deepEqual(metadata.alternates, [
      { hrefLang: 'vi', href: `${origin}${vi}` },
      { hrefLang: 'en', href: `${origin}${en}` },
      { hrefLang: 'x-default', href: `${origin}${en}` },
    ]);
    assert.ok(visible.includes(page.locale === 'vi' ? 'không phải điểm IELTS chính thức' : 'not an official IELTS score'));
    assert.ok(visible.includes('British Council, IDP'));
    assert.ok(!visible.includes('[slug TBC') && !visible.includes('[draft 03'));
    const faq = metadata.jsonLd?.find(block => block['@type'] === 'FAQPage');
    assert.ok(faq);
    assert.equal((faq.mainEntity as unknown[]).length, page.faq.length);
    for (const item of page.faq) {
      assert.ok(visible.includes(item.question), `FAQ question visible: ${item.question}`);
      assert.ok(visible.includes(item.answer), `FAQ answer visible: ${item.question}`);
    }
  });
}
