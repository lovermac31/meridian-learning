import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getExpectedPublicIndexableRoutes, getPrerenderRoutes, resolveRouteMetadata } from '../src/lib/routeMetadata';
import { IELTS_MOVED_SECTION, PAUSED_COPY, PRODUCTS } from '../src/i18n/content/products';
import { PAGE_PRODUCTS, PRODUCT_SEO, getProductByPath, relatedProducts } from '../src/i18n/content/productSeo';
import { ProductPage } from '../src/components/ProductPage';
import { ProductsPage } from '../src/components/ProductsPage';
import { usdFromVnd } from '../src/lib/paypal';
import { hasRegionalPrice, regionalUsd } from '../src/lib/regionalPrice';

// One indexable page per product (Jay, 27 Oct 2026): /products/<id> and /vi/products/<id> for every live card.
const SITE = 'https://jurassicenglish.com';
const LIVE = PRODUCTS.filter((p) => p.live);
const pages = LIVE.flatMap((p) => [[`/products/${p.id}`, 'en', p], [`/vi/products/${p.id}`, 'vi', p]] as const);

test('every live product has search copy and two indexable, prerendered routes', () => {
  assert.equal(PAGE_PRODUCTS.length, LIVE.length);
  const indexable = new Set(getExpectedPublicIndexableRoutes());
  const prerender = new Set(getPrerenderRoutes());
  for (const [path] of pages) {
    assert.ok(indexable.has(path), `${path} in the sitemap list`);
    assert.ok(prerender.has(path), `${path} prerendered`);
  }
});

test('metadata: unique title ≤ 60 and description 80–160, self canonical, EN/VI hreflang', () => {
  const titles = new Set<string>();
  for (const [path, locale, p] of pages) {
    const meta = resolveRouteMetadata(path);
    assert.equal(meta.robots, 'index, follow', path);
    assert.equal(meta.htmlLang.startsWith(locale), true, `${path}: lang`);
    assert.equal(meta.title, PRODUCT_SEO[p.id][locale].title, path);
    assert.ok(meta.title.length <= 60, `${path}: title ${meta.title.length}`);
    assert.ok(meta.description.length >= 80 && meta.description.length <= 160, `${path}: description ${meta.description.length}`);
    assert.ok(!titles.has(meta.title), `${path}: duplicate title`);
    titles.add(meta.title);
    assert.equal(meta.canonical, `${SITE}${path}`);
    assert.deepEqual(meta.alternates, [
      { hrefLang: 'en', href: `${SITE}/products/${p.id}` },
      { hrefLang: 'vi', href: `${SITE}/vi/products/${p.id}` },
      { hrefLang: 'x-default', href: `${SITE}/products/${p.id}` },
    ]);
  }
});

test('JSON-LD: Product with a VND Offer, a USD Offer only where PayPal is offered, FAQPage and 3-step breadcrumbs', () => {
  for (const [path, locale, p] of pages) {
    const blocks = resolveRouteMetadata(path).jsonLd as Array<Record<string, any>>;
    const product = blocks.find((b) => b['@type'] === 'Product')!;
    assert.equal(product.name, p[locale].title, path);
    assert.equal(product.url, `${SITE}${path}`);
    const vnd = p.price.replace(/\D/g, '');
    assert.deepEqual(product.offers.map((o: any) => [o.priceCurrency, o.price]), [
      ['VND', vnd],
      // Story Workbooks list their default (highest regional tier) US$ price.
      ...(p.paypal ? [['USD', String(p.usd ?? (hasRegionalPrice(p.id) ? regionalUsd(p.id) : usdFromVnd(Number(vnd))))]] : []),
    ], path);
    const faq = blocks.find((b) => b['@type'] === 'FAQPage')!;
    assert.ok(faq.mainEntity.length >= 1, path);
    const crumbs = blocks.find((b) => b['@type'] === 'BreadcrumbList')!;
    // Phonics adds its tile: Home → Products → Phonics → Book N (blueprint 6.2).
    assert.equal(crumbs.itemListElement.length, p.category === 'phonics' ? 4 : 3, path);
    assert.equal(crumbs.itemListElement.at(-1).item, `${SITE}${path}`);
  }
});

test('an unknown product id is not a product page and is not indexed', () => {
  assert.equal(getProductByPath('/products/not-a-product'), null);
  assert.equal(resolveRouteMetadata('/products/not-a-product').robots, 'noindex, nofollow');
});

test('page: H1 distinguishes the localized offer, with the copy, sample viewer button (no PDF), price, order, FAQ and 3 related', () => {
  for (const [, locale, p] of pages) {
    const html = renderToStaticMarkup(createElement(ProductPage, { product: p, locale }));
    const h1 = html.match(/<h1[^>]*>(.*?)<\/h1>/)?.[1];
    // Phonics (blueprint 6.1): the H1 is the book title, as on the cover; the search title stays in <title>.
    assert.equal(h1?.replaceAll('&#x27;', '’').replaceAll('&amp;', '&'), p.category === 'phonics' ? p[locale].title : PRODUCT_SEO[p.id][locale].title.split(' | ')[0], `${p.id} ${locale}`);
    assert.match(html, new RegExp(`data-price="${p.id}"`));
    // Paused products (audit fix 4, 11 Nov 2026): the page stays, with the waitlist note instead of any order button.
    if (p.paused) {
      assert.doesNotMatch(html, /data-cta="product-page-|data-buy-now=|data-paypal-link=|data-order-code=/, `${p.id}: no buy button`);
      assert.match(html, new RegExp(`data-paused-waitlist="${p.id}"`));
      assert.ok(html.includes(PAUSED_COPY[locale].note), `${p.id}: waitlist text`);
    } else assert.match(html, new RegExp(`data-cta="product-page-${p.id}"`));
    assert.match(html, /aria-label="Breadcrumb"/);
    assert.equal(html.match(/data-related="/g)?.length, 3, `${p.id}: 3 related`);
    assert.ok(!relatedProducts(p.id).some((r) => r.id === p.id), `${p.id}: not related to itself`);
    if (p.sample) assert.match(html, new RegExp(`data-sample-link="${p.id}"`));
    assert.doesNotMatch(html, /\.pdf/i, `${p.id}: no PDF link`);
    if (p.paypal && !p.paused) assert.match(html, new RegExp(`data-paypal-link="${p.id}"`));
    // The visible FAQ matches the FAQPage markup.
    const faq = (resolveRouteMetadata(`${locale === 'vi' ? '/vi' : ''}/products/${p.id}`).jsonLd as any[]).find((b) => b['@type'] === 'FAQPage');
    assert.equal(html.match(/<dt class="font-bold">/g)?.length, faq.mainEntity.length, `${p.id}: FAQ visible`);
  }
});

test('the /products hub links every card title to its own page', () => {
  for (const locale of ['en', 'vi'] as const) {
    const html = renderToStaticMarkup(createElement(ProductsPage, { locale }));
    // IELTS migration P6: the IELTS cards left the hub (their pages redirect to jurassicielts.com), so no title link.
    for (const p of LIVE.filter((entry) => entry.section !== IELTS_MOVED_SECTION)) assert.match(html, new RegExp(`href="${locale === 'vi' ? '/vi' : ''}/products/${p.id}" [^>]*data-product-page="${p.id}"`), `${locale} ${p.id}`);
    for (const p of LIVE.filter((entry) => entry.section === IELTS_MOVED_SECTION)) assert.ok(!html.includes(`data-product-page="${p.id}"`), `${locale} ${p.id}: no IELTS card title link`);
  }
});

test('Bing site verification survives: meta tag in index.html and BingSiteAuth.xml', () => {
  assert.match(readFileSync('index.html', 'utf8'), /<meta name="msvalidate\.01" content="E05B1F4111192BE2DE70E1F2137FF9C9"/);
  assert.ok(existsSync('public/BingSiteAuth.xml'));
});

// 35-today plan (Jay, 27 Oct 2026): the eight new products are live, each with its page, JSON-LD and sitemap entry.
test('35-today: all 52 products are live (35, the five Story Workbooks, the Mango single workbook, the Reading & Reasoning single story, Thinking Expeditions Levels 1 and 2, the IELTS Reading and Listening packs, the three IELTS bundles and Phonics Books 1 and 2), and the eight new ones have EN + VI pages with search copy and a sample', async () => {
  const { PRODUCTS } = await import('../src/i18n/content/products');
  assert.equal(PRODUCTS.length, 52); // 52 with Thinking Expeditions Level 2 (17 Nov 2026)
  assert.equal(PRODUCTS.filter((p) => !p.live).length, 0);
  const fresh = ['writing-baseline', 'ielts-one-to-one-starter', 'ielts-cue-card-bank', 'ielts-essay-bank-task2', 'parent-pack-l3',
    'holiday-reading-challenge', 'thinking-cycle-posters', 'word-fossil-flashcards-l1'];
  for (const id of fresh) {
    const p = PRODUCTS.find((entry) => entry.id === id)!;
    assert.ok(p.image && p.sample, `${id}: image and sample`);
    assert.ok(PAGE_PRODUCTS.includes(p), `${id}: has a page`);
    for (const locale of ['en', 'vi'] as const) {
      const seo = PRODUCT_SEO[id][locale];
      assert.ok(seo.title.length <= 60 && seo.description.length >= 80 && seo.description.length <= 160, `${id} ${locale}`);
      assert.ok(seo.description.includes(p.price.replace(/₫$/, '')), `${id} ${locale}: the price is in the description`);
    }
  }
});

// #ielts (Jay, 27 Oct 2026): the IELTS cards (8 with the 35-today products) leave Teachers for their own section, Speaking then Writing, each linked
// to its IELTS home page on /ai-speaking; their product pages carry Products › IELTS › product.
test('#ielts: Speaking and Writing groups, no IELTS card under Teachers, each card links its IELTS home page', () => {
  const groups = {
    speaking: ['ielts-speaking-ladder', 'ielts-one-to-one-starter', 'ielts-cue-card-bank'],
    writing: ['writing-baseline', 'ielts-writing-ladder-task2', 'ielts-writing-task1-method', 'ielts-essay-bank-task2', 'ielts-writing-teacher-pack'],
  };
  const home = {
    en: { speaking: '/ai-speaking?utm_source=products', writing: '/ai-speaking/writing?utm_source=products' },
    vi: { speaking: '/ai-speaking/vi?utm_source=products', writing: '/ai-speaking/vi/writing?utm_source=products' },
  };
  // IELTS migration P6 (15 Nov 2026): the Speaking and Writing groups and their cards left /products for jurassicielts.com.
  // #ielts is now the one moved card, linking JurassicIELTS /solutions/ in the page language.
  const solutions = { en: 'https://jurassicielts.com/solutions/?utm_source=jurassicenglish&amp;utm_medium=moved', vi: 'https://jurassicielts.com/vi/solutions/?utm_source=jurassicenglish&amp;utm_medium=moved' };
  for (const locale of ['en', 'vi'] as const) {
    const html = renderToStaticMarkup(createElement(ProductsPage, { locale }));
    const section = (id: string) => html.slice(html.indexOf(`<section id="${id}"`), html.indexOf('</section>', html.indexOf(`<section id="${id}"`)));
    assert.doesNotMatch(section('teachers'), /id="ielts-/, `${locale}: Teachers has no IELTS card`);
    const ielts = section('ielts');
    assert.ok(ielts.includes('data-ielts-moved=""'), `${locale}: #ielts is the moved card`);
    assert.ok(ielts.includes(`href="${solutions[locale]}"`), `${locale}: the moved card links JurassicIELTS /solutions/`);
    for (const [group, ids] of Object.entries(groups) as Array<['speaking' | 'writing', string[]]>) {
      assert.ok(!html.includes(`data-ielts-group="${group}"`), `${locale}: no ${group} group`);
      for (const id of ids) {
        assert.ok(!html.includes(`id="${id}"`), `${locale} ${id}: no card on /products`);
        assert.ok(!html.includes(`data-ielts-home="${id}"`), `${locale} ${id}: no IELTS home link`);
      }
      assert.ok(!ielts.includes(home[locale][group]), `${locale} ${group}: no IELTS home link in #ielts`);
    }
  }
});

test('IELTS product pages: Products › IELTS › product breadcrumb and the IELTS home link', () => {
  for (const p of LIVE.filter((entry) => entry.group)) {
    for (const locale of ['en', 'vi'] as const) {
      const html = renderToStaticMarkup(createElement(ProductPage, { product: p, locale }));
      assert.match(html, new RegExp(`/products#ielts"[^>]*>IELTS</a>`), `${p.id} ${locale}`);
      // Reading and Listening have no IELTS home page yet (3 Nov 2026), so no link rather than a wrong one.
      // The three IELTS bundles (5 Nov 2026) have no single skill home either.
      if (p.group === 'reading' || p.group === 'listening' || p.group === 'bundles') assert.doesNotMatch(html, /data-ielts-home=/, `${p.id} ${locale}`);
      else assert.match(html, new RegExp(`data-ielts-home="${p.id}"`), `${p.id} ${locale}`);
    }
  }
});
