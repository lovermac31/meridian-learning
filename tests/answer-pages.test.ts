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

// Deepened country pages (Nov 2026): Philippines, Malaysia, India carry a dated sources box, 2,200+ words and the first-step path.
for (const country of ['philippines', 'malaysia', 'india']) {
  test(`/ielts-speaking-online/${country}: deepened with sources box, first-step path and no team claim`, () => {
    const page = seoPages.find(p => p.path === `/ielts-speaking-online/${country}`)!;
    const text = page.html.replace(/<[^>]+>/g, ' ');
    assert.ok(text.split(/\s+/).filter(Boolean).length >= 2200);
    assert.match(page.html, /Sources and last checked/);
    assert.match(page.html, /2 November 2026/);
    assert.match(page.html, /\/live-speaking-check/);
    assert.match(page.html, /\/ai-speaking\/baseline/);
    assert.ok((page.html.match(/<a /g) ?? []).length >= 40);
    assert.doesNotMatch(page.html, /guarantee/i);
  });
}

// Keyword pass (Nov 2026): titles <= 60, meta <= 155, "fake IELTS certificate" on the scam guides, reciprocal links from the country pages.
test('keyword pass: title and meta limits on answer pages, hub and country pages', () => {
  const target = seoPages.filter(p => p.answer || /^\/ielts-speaking-online(\/|$)/.test(p.path) && p.locale === 'en');
  for (const p of target) {
    assert.ok(p.title.length <= 60, `${p.path} title ${p.title.length}: ${p.title}`);
    assert.ok(p.description.length <= 155, `${p.path} meta ${p.description.length}`);
  }
});
test('keyword pass: scam guides carry "fake IELTS certificate" in title and H1', () => {
  for (const slug of ['ielts-scams-fake-certificates-philippines', 'ielts-scams-fake-certificates-vietnam']) {
    const p = seoPages.find(x => x.path === `/insights/${slug}`)!;
    assert.match(p.title, /Fake IELTS Certificate/);
    assert.match(p.h1, /fake IELTS certificates/i);
  }
});
test('keyword pass: country pages link to their matching answer pages', () => {
  const need: Record<string, string[]> = {
    philippines: ['ielts-scams-fake-certificates-philippines', 'ielts-for-ukvi-philippines', 'computer-delivered-ielts-philippines'],
    malaysia: ['ielts-for-ukvi-malaysia', 'computer-delivered-ielts-malaysia'],
    india: ['ielts-scams-fake-certificates-philippines'],
  };
  for (const [country, slugs] of Object.entries(need)) {
    const page = seoPages.find(p => p.path === `/ielts-speaking-online/${country}`)!;
    for (const slug of slugs) assert.ok(page.html.includes(`/insights/${slug}`), `${country} -> ${slug}`);
    assert.match(page.title, /Online IELTS Speaking Tutor/);
  }
});
