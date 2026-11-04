import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProductPage } from '../src/components/ProductPage';
import { PRODUCTS } from '../src/i18n/content/products';

test('Story Club first screen states the approved offer and has one unchanged purchase action before the image', () => {
  const product = PRODUCTS.find(p => p.id === 'story-club')!;
  for (const locale of ['en', 'vi'] as const) {
    const html = renderToStaticMarkup(createElement(ProductPage, { product, locale })).replaceAll('<!-- -->', '');
    const hero = html.slice(html.indexOf('<header class="insights-hero"'), html.indexOf('</header>'));
    for (const fact of ['5–8', '9:00', 'Google Meet', '6', '590.000₫', locale === 'en' ? 'for 4 weeks' : 'cho 4 tuần']) assert.ok(hero.includes(fact), `${locale}: ${fact} visible in hero`);
    assert.equal(html.split('data-price="story-club"').length - 1, 1);
    assert.equal(html.split('data-cta="product-page-story-club"').length - 1, 1);
    assert.ok(hero.includes('data-cta="product-page-story-club"'));
    assert.ok(html.indexOf('data-price="story-club"') < html.indexOf('data-product="story-club"'), 'purchase offer precedes image card');
    assert.ok(hero.includes(`href="${locale === 'vi' ? '/vi' : ''}/story-club?utm_source=products"`), 'same landing-page destination');
  }
});

test('other products retain the purchase block within their image/content card', () => {
  for (const product of PRODUCTS.filter(p => p.id !== 'story-club')) for (const locale of ['en', 'vi'] as const) {
    const html = renderToStaticMarkup(createElement(ProductPage, { product, locale }));
    assert.ok(!html.includes('data-story-club-first-screen'));
    assert.ok(html.indexOf(`data-price="${product.id}"`) > html.indexOf(`data-product="${product.id}"`));
    assert.equal(html.split(`data-cta="product-page-${product.id}"`).length - 1, 1);
  }
});
