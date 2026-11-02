import test from 'node:test';
import assert from 'node:assert/strict';
import { seoPages } from '../src/lib/seoPages';
import { renderRoute } from '../src/entry-server';
import { getExpectedPublicIndexableRoutes } from '../src/lib/routeMetadata';

// Hand-checked answer pages (Nov 2026): official sources only, a visible "Sources and last checked" box, no score promises.
const answers = seoPages.filter(page => page.answer);
const OFFICIAL = /^(ielts\.org|www\.ielts\.org|ielts\.idp\.com|idp\.com|www\.idp\.com|www\.gov\.uk|www\.britishcouncil\.[a-z.]+|britishcouncil\.[a-z.]+|takeielts\.britishcouncil\.org|ieltsidpindia\.com)$/;
const wordCount = (html: string) => html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

test('answer pages exist and are in the sitemap list', () => {
  assert.ok(answers.length >= 1);
  const routes = new Set(getExpectedPublicIndexableRoutes());
  for (const page of answers) assert.ok(routes.has(page.path), page.path);
});

for (const page of answers) {
  test(`${page.path}: sources box, official domains, links, words, FAQ, no score promise`, async () => {
    assert.match(page.html, /<aside aria-label="(Sources and last checked|Nguồn và ngày kiểm tra)">/);
    assert.match(page.html, /2 November 2026|2\/11\/2026/);
    const hosts = [...page.html.matchAll(/<li><a href="(https?:\/\/[^"]+)" rel="noopener">/g)].map(m => new URL(m[1]).hostname);
    assert.ok(hosts.length >= 3, 'cites at least three sources');
    for (const host of hosts) assert.match(host, OFFICIAL, `${host} is an official source`);
    assert.ok((page.html.match(/<a /g) ?? []).length >= 20, 'at least 20 links');
    const words = wordCount(page.html);
    assert.ok(words >= 1200 && words <= 2000 || page.locale === 'vi' && words >= 1200, `${words} words`);
    assert.ok(page.faq.length >= 4);
    assert.ok(!/guarantee|đảm bảo band|chắc chắn đạt/i.test(page.html.replace(/no teacher can honestly promise/gi, '')), 'no score promise');
    assert.match(page.html, /\/ai-speaking\/baseline/, 'Baseline path');
    assert.match(page.html, /\/go\/zalo\?utm_source=answer-page&utm_content=/, 'Zalo path with utm_content');
    const html = await renderRoute(page.path);
    assert.match(html, /ielts\.jurassicenglish\.com\/\?utm_source=site&(?:amp;)?utm_medium=entrance&(?:amp;)?utm_content=[a-z0-9-]+/, 'closing app card carries the page slug as utm_content');
    if (page.alternatePath === page.path) assert.ok(page.locale === 'en');
  });
}
