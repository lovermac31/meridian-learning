import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getExpectedPublicIndexableRoutes, getPrerenderRoutes, resolveRouteMetadata } from '../src/lib/routeMetadata';
import { PRODUCTS } from '../src/i18n/content/products';
import { PAGE_PRODUCTS, PRODUCT_SEO, getProductByPath, relatedProducts } from '../src/i18n/content/productSeo';
import { ProductPage } from '../src/components/ProductPage';
import { ProductsPage } from '../src/components/ProductsPage';
import { usdFromVnd } from '../src/lib/paypal';

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
      ...(p.paypal ? [['USD', String(usdFromVnd(Number(vnd)))]] : []),
    ], path);
    const faq = blocks.find((b) => b['@type'] === 'FAQPage')!;
    assert.ok(faq.mainEntity.length >= 1, path);
    const crumbs = blocks.find((b) => b['@type'] === 'BreadcrumbList')!;
    assert.equal(crumbs.itemListElement.length, 3, path);
    assert.equal(crumbs.itemListElement[2].item, `${SITE}${path}`);
  }
});

test('an unknown product id is not a product page and is not indexed', () => {
  assert.equal(getProductByPath('/products/not-a-product'), null);
  assert.equal(resolveRouteMetadata('/products/not-a-product').robots, 'noindex, nofollow');
});

test('page: H1 is the product name, with the copy, sample viewer button (no PDF), price, order, FAQ and 3 related', () => {
  for (const [, locale, p] of pages) {
    const html = renderToStaticMarkup(createElement(ProductPage, { product: p, locale }));
    const h1 = html.match(/<h1[^>]*>(.*?)<\/h1>/)?.[1];
    assert.equal(h1?.replaceAll('&#x27;', '’').replaceAll('&amp;', '&'), p[locale].title.replaceAll('&', '&'), `${p.id} ${locale}`);
    assert.match(html, new RegExp(`data-price="${p.id}"`));
    assert.match(html, new RegExp(`data-cta="product-page-${p.id}"`));
    assert.match(html, /aria-label="Breadcrumb"/);
    assert.equal(html.match(/data-related="/g)?.length, 3, `${p.id}: 3 related`);
    assert.ok(!relatedProducts(p.id).some((r) => r.id === p.id), `${p.id}: not related to itself`);
    if (p.sample) assert.match(html, new RegExp(`data-sample-link="${p.id}"`));
    assert.doesNotMatch(html, /\.pdf/i, `${p.id}: no PDF link`);
    if (p.paypal) assert.match(html, new RegExp(`data-paypal-link="${p.id}"`));
    // The visible FAQ matches the FAQPage markup.
    const faq = (resolveRouteMetadata(`${locale === 'vi' ? '/vi' : ''}/products/${p.id}`).jsonLd as any[]).find((b) => b['@type'] === 'FAQPage');
    assert.equal(html.match(/<dt class="font-bold">/g)?.length, faq.mainEntity.length, `${p.id}: FAQ visible`);
  }
});

test('the /products hub links every card title to its own page', () => {
  for (const locale of ['en', 'vi'] as const) {
    const html = renderToStaticMarkup(createElement(ProductsPage, { locale }));
    for (const p of LIVE) assert.match(html, new RegExp(`href="${locale === 'vi' ? '/vi' : ''}/products/${p.id}" [^>]*data-product-page="${p.id}"`), `${locale} ${p.id}`);
  }
});

test('Bing site verification survives: meta tag in index.html and BingSiteAuth.xml', () => {
  assert.match(readFileSync('index.html', 'utf8'), /<meta name="msvalidate\.01" content="E05B1F4111192BE2DE70E1F2137FF9C9"/);
  assert.ok(existsSync('public/BingSiteAuth.xml'));
});

// 35-today plan (Jay, 27 Oct 2026): the eight new products are live, each with its page, JSON-LD and sitemap entry.
test('35-today: all 35 products are live, and the eight new ones have EN + VI pages with search copy and a sample', async () => {
  const { PRODUCTS } = await import('../src/i18n/content/products');
  assert.equal(PRODUCTS.length, 35);
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
