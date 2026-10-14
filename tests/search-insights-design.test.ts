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
    assert.match(html, /<nav class="fixed top-0 w-full z-50[^\"]*bg-jurassic-dark(?:\s|")/, path);
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
    // The booking pages charge VND by VietQR, so a USD-priced CTA must open an email request, not a checkout.
    const hero = html.match(/<div class="insights-teacher">[\s\S]*?<\/header>/)?.[0] ?? '';
    const ctaHrefs = [...hero.matchAll(/class="insights-button-(?:primary|secondary)" href="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ctaHrefs.length, 2, page.path);
    for (const href of ctaHrefs) assert.match(href, /^mailto:info@jurassicenglish\.com\?subject=/, page.path);
    assert.match(hero, /class="insights-cta-note"[^>]*>[\s\S]*info@jurassicenglish\.com/, page.path);
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

test('non-Latin market pages render without Google Fonts requests', async () => {
  for (const page of seoPages.filter(item => ['ar', 'ur', 'th', 'bn'].includes(item.locale))) {
    const html = await renderRoute(page.path);
    assert.doesNotMatch(html, /fonts\.googleapis\.com/, page.path);
    assert.match(html, new RegExp(`class="insights-page" lang="${page.locale}"`), page.path);
  }
});

test('market closing band offers the booking request, AI Speaking and a free tool', async () => {
  for (const page of seoPages.filter(item => isInternationalMarketPath(item.path))) {
    const html = await renderRoute(page.path);
    const closing = html.match(/<div class="insights-closing"[\s\S]*?<\/main>/)?.[0] ?? '';
    const hrefs = [...closing.matchAll(/class="insights-button-(?:primary|secondary)" href="([^"]+)"/g)].map(match => match[1]);
    assert.equal(hrefs.length, 3, page.path);
    assert.match(hrefs[0], /^mailto:info@jurassicenglish\.com\?subject=Speaking%20Baseline/, page.path);
    assert.equal(hrefs[1], '/ai-speaking', page.path);
    assert.equal(hrefs[2], '/tools/ielts-band-score-calculator', page.path);
    if (page.locale !== 'en') assert.doesNotMatch(closing, /See how AI Speaking|Free IELTS band/, page.path);
  }
});
