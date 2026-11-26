import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PRODUCTS, STARTERS_DRAFT_PRICE, STARTERS_DRAFT_PRICE_VND } from '../src/i18n/content/products';
import { PRODUCT_SEO } from '../src/i18n/content/productSeo';
import { ProductPage } from '../src/components/ProductPage';
import { assertStartersDraft } from '../src/components/StartersDraftPage';
import { readFileSync } from 'node:fs';
import { validateSampleText } from '../src/lib/sampleText';

const banned = /\b(?:approved|official|endorsed|authorised|accredited|partner|licensed by|pass|score|shields|exam-ready|testimonials?|popular)\b|children love it|used by \d/i;
for (const number of [1, 2]) {
  const id = `starters-practice-test-${number}`;
  const product = PRODUCTS.find(p => p.id === id)!;
  test(`${id}: honest draft copy and sample text, EN + VI`, () => {
    assert.equal(product.live, false);
    assert.equal(product.price, String(STARTERS_DRAFT_PRICE_VND));
    assert.equal(STARTERS_DRAFT_PRICE_VND, 99000);
    for (const locale of ['en', 'vi'] as const) {
      const html = renderToStaticMarkup(createElement(ProductPage, { product, locale }));
      assert.doesNotMatch(html, banned);
      assert.doesNotMatch(html, /Cambridge|Google Drive|autoplay/i);
      assert.match(html, /AI-generated pictures; synthetic voices/);
      assert.match(html, /ADVISER TO CONFIRM/);
      assert.ok(html.includes(STARTERS_DRAFT_PRICE));
      assert.doesNotMatch(PRODUCT_SEO[id][locale].title + PRODUCT_SEO[id][locale].description + product[locale].title, /Cambridge/i);
      const at = (marker: string) => html.indexOf(`${marker}="${id}"`);
      assert.ok(at('data-starters-sample') < at('data-starters-audio'));
      assert.ok(at('data-starters-audio') < at('data-licence'));
      assert.ok(at('data-licence') < at('data-price'));
      assert.ok(at('data-price') < at('data-draft-buy'));
      assert.match(html, /<audio[^>]*controls=""[^>]*muted=""[^>]*preload="none"/);
      if (locale === 'vi') assert.match(html, /VI DRAFT: native read needed/);
    }
    const doc = validateSampleText(JSON.parse(readFileSync(`public/samples/pages/${id}-text.json`, 'utf8')), id, id, 7);
    // The delivered books print two honest NEGATIVE disclaimers. Allow exactly these phrases, nothing wider,
    // and still ban every positive claim (approved, pass as a promise, official as a claim, scores, shields...).
    const allowedDisclaimers = [/There is no pass or fail\./gi, /not an official Cambridge English test\./gi];
    for (const page of doc.pages) {
      let text = page.text.replace(/\s+/g, ' ');
      for (const phrase of allowedDisclaimers) text = text.replace(phrase, '');
      assert.doesNotMatch(text, banned, `sample ${page.page}`);
    }
    // Contents can name the key/scripts; none of those answer-bearing pages is in the sample set.
    assert.match(doc.pages[3].text, /Look and read/);
    assert.match(doc.pages[4].text, /There is one example/);
    assert.match(doc.pages[5].text, /Listen and colour/);
    assert.match(doc.pages[6].text, /Speaking: the big picture/);
    assert.doesNotMatch(doc.pages.map(p => p.text).join('\n'), /Reading and Writing\s*Part 1\s*1[. :]\s*(?:yes|no)|Audio script S[12]/i);
  });
  test(`${id}: unresolved placeholders cannot render live`, () => {
    assert.throws(() => assertStartersDraft({ ...product, live: true }), /decisions must be resolved/);
    assert.throws(() => renderToStaticMarkup(createElement(ProductPage, { product: { ...product, live: true }, locale: 'en' })), /decisions must be resolved/);
  });
}
