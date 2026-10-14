import test from 'node:test';
import assert from 'node:assert/strict';
import { renderRoute } from '../src/entry-server';
import { seoPages, isInternationalMarketPath } from '../src/lib/seoPages';
import pricing from '../src/content/marketPricing.json';

const representative = [...seoPages.map(page => page.path), '/vi/insights', '/insights', '/insights/online-ielts-speaking-coaching'];

test('market, editorial, and profile routes use a solid navbar and dark hero', async () => {
  for (const path of representative) {
    const html = await renderRoute(path);
    assert.match(html, /insights-hero/, path);
    assert.match(html, /<nav class="fixed top-0 w-full z-50[^\"]*bg-jurassic-dark\/85/, path);
  }
});

test('paired SEO pages render a two-option accessible hero switcher', async () => {
  for (const page of seoPages.filter(item => item.alternatePath !== item.path)) {
    const counterpart = seoPages.find(item => item.path === page.alternatePath);
    if (!counterpart) continue;
    const html = await renderRoute(page.path);
    assert.match(html, /role="group" aria-label="[^"]+"/, page.path);
    assert.match(html, /aria-current="true" lang="[^"]+"/, page.path);
    assert.ok(html.includes(`href="${counterpart.path}"`), page.path);
    assert.ok(html.includes(`lang="${counterpart.locale}"`), page.path);
  }
});

test('RTL markets set direction and isolate price and range runs', async () => {
  for (const page of seoPages.filter(item => isInternationalMarketPath(item.path) && ['ar', 'ur'].includes(item.locale))) {
    const html = await renderRoute(page.path);
    assert.match(html, /class="insights-page" lang="(?:ar|ur)" dir="rtl"/, page.path);
    assert.match(html, /<bdi dir="ltr">US\$\d+<\/bdi>/, page.path);
    assert.match(html, /<bdi dir="ltr">15–20<\/bdi>/, page.path);
    assert.match(html, /<button[^>]*dir="ltr"[^>]*>Jurassic English<sup[^>]*>™<\/sup><\/button>/, page.path);
    assert.match(html, /<bdi dir="ltr">Mr\. Jay Adams \(CELTA\)<\/bdi>/, page.path);
    assert.doesNotMatch(html, /&<bdi[^>]*>amp<\/bdi>;/, page.path);
  }
});

test('every market CTA uses its approved tier and localized chrome', async () => {
  for (const page of seoPages.filter(item => isInternationalMarketPath(item.path))) {
    const market = page.path.split('/').at(-1) === 'ielts-speaking-online' ? undefined : page.path.split('/').at(-1) === 'brasil' ? 'brazil' : page.path.split('/').at(-1);
    const tier = market ? pricing.markets[market as keyof typeof pricing.markets] : 1;
    const prices = pricing.tiers[String(tier) as keyof typeof pricing.tiers];
    const html = await renderRoute(page.path);
    assert.ok(html.includes(`href="/ai-speaking/baseline"`), page.path);
    assert.ok(html.includes(`href="/ai-speaking/solutions"`), page.path);
    assert.ok(html.includes(`US$${prices.baseline_usd}`), page.path);
    assert.ok(html.includes(`US$${prices.lesson_usd}`), page.path);
    if (!market) assert.ok(html.includes(`from US$${prices.baseline_usd}`) || !['en'].includes(page.locale), page.path);
    if (page.locale !== 'en') assert.doesNotMatch(html.match(/<nav aria-label="Breadcrumb">[\s\S]*?<\/nav>/)?.[0] ?? '', /Learning resources/, page.path);
  }
});

test('market key facts have one space after labels and one time comparison', () => {
  for (const page of seoPages.filter(item => isInternationalMarketPath(item.path))) {
    const aside = page.html.match(/<aside\b[\s\S]*?<\/aside>/)?.[0];
    if (!aside) continue;
    assert.doesNotMatch(aside, /<\/strong>(?! [^ ])/u, page.path);
    if (['india', 'philippines', 'indonesia', 'malaysia', 'singapore', 'thailand', 'uae', 'saudi-arabia'].some(key => page.path === `/ielts-speaking-online/${key}`)) {
      const time = aside.match(/<strong>Time:<\/strong> ([\s\S]*?)<\/li>/)?.[1] ?? '';
      assert.doesNotMatch(time, /Hanoi.*(?:ahead|behind|later|UTC\+7)/, page.path);
    }
  }
});

test('market fact asides have no emerald source classes', async () => {
  const html = await renderRoute('/ar/ielts-speaking-online/uae');
  const aside = html.match(/<aside\b[\s\S]*?<\/aside>/)?.[0];
  assert.ok(aside);
  assert.doesNotMatch(aside, /emerald/);
  assert.match(aside, /Key facts/);
});
