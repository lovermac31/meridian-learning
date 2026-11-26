import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PRODUCTS } from '../src/i18n/content/products';
import { ProductPage } from '../src/components/ProductPage';

for (const id of ['starters-practice-test-1', 'starters-practice-test-2', 'starters-practice-test-3', 'starters-practice-tests-pack']) test(`${id}: licence decision remains explicit before price and disabled buy`, () => {
  const product = PRODUCTS.find(p => p.id === id)!;
  assert.equal(product.draftPreview?.licence, '[JAY TO CONFIRM: wording A or B in LISTING-PLAN section 2.1]');
  for (const locale of ['en', 'vi'] as const) {
    const html = renderToStaticMarkup(createElement(ProductPage, { product, locale }));
    const licence = html.indexOf(`data-licence="${id}"`);
    const price = html.indexOf(`data-price="${id}"`);
    assert.ok(licence > 0 && price > licence);
    assert.ok(price < html.indexOf(`data-draft-buy="${id}"`));
    assert.doesNotMatch(html, /Licensed to one (?:teacher|family|learner)|Personal licence — one learner/);
  }
});
