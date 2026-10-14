import test from 'node:test';
import assert from 'node:assert/strict';
import { renderRoute } from '../src/entry-server';
import { seoPages, isInternationalMarketPath } from '../src/lib/seoPages';
import { getExpectedPublicIndexableRoutes, resolveRouteMetadata } from '../src/lib/routeMetadata';
import { extractVisibleText } from '../scripts/lib/visible-text.mjs';

const origin = 'https://jurassicenglish.com';
const pages = seoPages.filter(page => isInternationalMarketPath(page.path));
const countryPages = pages.filter(page => !['/ielts-speaking-online', '/es/ielts-speaking-online', '/pt/ielts-speaking-online'].includes(page.path));
const sitemapRoutes = new Set(getExpectedPublicIndexableRoutes());

function phrases(text: string) {
  const words = text.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  return new Set(words.slice(0, -4).map((_, index) => words.slice(index, index + 5).join(' ')));
}

test('three language hubs and seventeen country routes enter the sitemap inventory', () => {
  assert.equal(pages.length, 20);
  assert.equal(countryPages.length, 17);
  assert.equal(new Set(pages.map(page => page.path)).size, pages.length);
  for (const page of pages) assert.ok(sitemapRoutes.has(page.path), page.path);
});

for (const page of pages) {
  test(`${page.path} renders SSR content, metadata, payment and matching FAQ schema`, async () => {
    const rendered = await renderRoute(page.path);
    const visible = extractVisibleText(`<body>${rendered}</body>`);
    const metadata = resolveRouteMetadata(page.path);
    assert.match(rendered, /<main id="main-content"/);
    assert.ok(visible.includes(page.h1), page.path);
    assert.equal(metadata.htmlLang, page.locale);
    assert.equal(metadata.canonical, `${origin}${page.path}`);
    assert.ok(visible.includes('British Council, IDP IELTS') || (page.locale === 'pt-BR' && visible.includes('British Council, da IDP IELTS')));
    assert.ok(visible.includes(page.locale === 'es' ? 'no es una puntuación oficial de IELTS' : page.locale === 'pt-BR' ? 'não é uma pontuação oficial do IELTS' : 'not an official IELTS score'));
    assert.ok(visible.includes('VietQR'));
    assert.ok(visible.includes(page.locale === 'es' ? 'contáctanos antes de reservar' : page.locale === 'pt-BR' ? 'entre em contato antes de reservar' : 'contact us before booking'));
    assert.ok(visible.includes(page.locale === 'en' ? '800,000 VND' : '800.000 VND'));
    assert.ok(visible.includes(page.locale === 'en' ? '690,000 VND' : '690.000 VND'));
    assert.ok(visible.includes('UTC+7'));
    const types = new Set(metadata.jsonLd?.map(block => block['@type']));
    for (const type of ['Service', 'FAQPage', 'BreadcrumbList']) assert.ok(types.has(type), `${page.path}: ${type}`);
    const faq = metadata.jsonLd?.find(block => block['@type'] === 'FAQPage');
    const entities = faq?.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>;
    assert.equal(entities.length, page.faq.length);
    for (const [index, item] of page.faq.entries()) {
      assert.equal(entities[index].name, item.question);
      assert.equal(entities[index].acceptedAnswer.text, item.answer);
      assert.ok(visible.includes(item.question));
      assert.ok(visible.includes(item.answer));
    }
    if (countryPages.includes(page)) assert.ok(visible.split(/\s+/).length >= 600, page.path);
    if (page.locale !== 'en') assert.ok(visible.includes(page.locale === 'es' ? '(en inglés)' : '(em inglês)'));
  });
}

test('only the English and Spanish hubs have cross-language hreflang', () => {
  const expected = [
    { hrefLang: 'en', href: `${origin}/ielts-speaking-online` },
    { hrefLang: 'es', href: `${origin}/es/ielts-speaking-online` },
    { hrefLang: 'x-default', href: `${origin}/ielts-speaking-online` },
  ];
  for (const page of pages) assert.deepEqual(resolveRouteMetadata(page.path).alternates, page.path === '/ielts-speaking-online' || page.path === '/es/ielts-speaking-online' ? expected : undefined);
});

test('country copy within each language shares fewer than 40% of five-word phrases', () => {
  for (const leftPage of countryPages) for (const rightPage of countryPages) {
    if (leftPage.path >= rightPage.path || leftPage.locale !== rightPage.locale) continue;
    const left = phrases(extractVisibleText(`<body>${leftPage.html}</body>`));
    const right = phrases(extractVisibleText(`<body>${rightPage.html}</body>`));
    const shared = [...left].filter(phrase => right.has(phrase)).length;
    assert.ok(shared / Math.min(left.size, right.size) < 0.4, `${leftPage.path} / ${rightPage.path}: ${shared / Math.min(left.size, right.size)}`);
  }
});

test('Nigeria focuses on purpose-specific thresholds without a weak-Speaking claim', () => {
  const nigeria = pages.find(page => page.path.endsWith('/nigeria'))!;
  assert.match(nigeria.html, /NMC nursing registration/);
  assert.match(nigeria.html, /Speaking 7/);
  assert.doesNotMatch(nigeria.html, /Speaking (?:is|as) (?:a )?weak/i);
});

test('localized search intent and first-language averages keep their labels', () => {
  for (const page of countryPages.filter(item => item.locale === 'es')) {
    assert.ok(page.h1.startsWith('Examen IELTS'), page.path);
  }
  for (const slug of ['peru', 'chile', 'argentina']) {
    const page = countryPages.find(item => item.path.endsWith(`/${slug}`))!;
    assert.match(page.html, /primera lengua/);
    assert.match(page.html, /6,61/);
    assert.match(page.html, /ielts-test-taker-performance-data-2024-2025\.xlsx/);
  }
  const brazil = countryPages.find(item => item.path.endsWith('/brasil'))!;
  assert.match(brazil.h1, /aulas de inglês online para o IELTS/);
  assert.match(brazil.html, /primeira língua/);
  assert.match(brazil.html, /6,89/);
  assert.match(brazil.html, /href="\/pt\/ielts-speaking-online"/);
});
