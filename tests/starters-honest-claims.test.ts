import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PRODUCTS, STARTERS_DRAFT_PRICE, STARTERS_DRAFT_PRICE_VND, STARTERS_PACK_DRAFT_PRICE, STARTERS_PACK_DRAFT_PRICE_VND } from '../src/i18n/content/products';
import { PRODUCT_SEO } from '../src/i18n/content/productSeo';
import { ProductPage } from '../src/components/ProductPage';
import { assertStartersDraft } from '../src/components/StartersDraftPage';
import { readFileSync } from 'node:fs';
import { validateSampleText } from '../src/lib/sampleText';

const banned = /\b(?:approved|official|endorsed|authorised|accredited|partner|licensed by|pass|score|shields|exam-ready|testimonials?|popular)\b|children love it|used by \d/i;
for (const id of ['starters-practice-test-1', 'starters-practice-test-2', 'starters-practice-test-3', 'starters-practice-tests-pack']) {
  const isPack = id === 'starters-practice-tests-pack';
  const draftPrice = isPack ? STARTERS_PACK_DRAFT_PRICE : STARTERS_DRAFT_PRICE;
  const draftVnd = isPack ? STARTERS_PACK_DRAFT_PRICE_VND : STARTERS_DRAFT_PRICE_VND;
  const pageCount = isPack ? 9 : 7;
  const product = PRODUCTS.find(p => p.id === id)!;
  test(`${id}: honest draft copy and sample text, EN + VI`, () => {
    assert.equal(product.live, false);
    assert.equal(product.price, String(draftVnd));
    assert.equal(draftVnd, isPack ? 249000 : 99000);
    for (const locale of ['en', 'vi'] as const) {
      const html = renderToStaticMarkup(createElement(ProductPage, { product, locale }));
      assert.doesNotMatch(html, banned);
      assert.doesNotMatch(html, /Cambridge|Google Drive|autoplay/i);
      assert.match(html, /AI-generated pictures; synthetic voices/);
      assert.match(html, /ADVISER TO CONFIRM/);
      assert.ok(html.includes(draftPrice));
      assert.doesNotMatch(PRODUCT_SEO[id][locale].title + PRODUCT_SEO[id][locale].description + product[locale].title, /Cambridge/i);
      const at = (marker: string) => html.indexOf(`${marker}="${id}"`);
      if (product.clip) {
        assert.ok(at('data-starters-sample') < at('data-starters-audio'));
        assert.ok(at('data-starters-audio') < at('data-licence'));
        assert.match(html, /<audio[^>]*controls=""[^>]*muted=""[^>]*preload="none"/);
      } else {
        // Test 3: no clip until its tracks are listened to.
        assert.ok(!html.includes('<audio') && !html.includes('data-starters-audio'));
        assert.ok(at('data-starters-sample') < at('data-licence'));
      }
      assert.ok(at('data-licence') < at('data-price'));
      assert.ok(at('data-price') < at('data-draft-buy'));
      if (locale === 'vi') assert.match(html, /VI DRAFT: native read needed/);
    }
    const doc = validateSampleText(JSON.parse(readFileSync(`public/samples/pages/${id}-text.json`, 'utf8')), id, id, pageCount);
    // The delivered books print two honest NEGATIVE disclaimers. Allow exactly these phrases, nothing wider,
    // and still ban every positive claim (approved, pass as a promise, official as a claim, scores, shields...).
    const allowedDisclaimers = [/There is no pass or fail\./gi, /not an official Cambridge English test\./gi];
    for (const page of doc.pages) {
      let text = page.text.replace(/\s+/g, ' ');
      for (const phrase of allowedDisclaimers) text = text.replace(phrase, '');
      assert.doesNotMatch(text, banned, `sample ${page.page}`);
    }
    // Contents can name the key/scripts; none of those answer-bearing pages is in the sample set.
    if (!isPack) {
      assert.match(doc.pages[3].text, /Look and read/);
      assert.match(doc.pages[4].text, /There is one example/);
      assert.match(doc.pages[5].text, /Listen and colou?r/);
      assert.match(doc.pages[6].text, /Speaking: the big picture/);
    } else {
      // The set shows cover, Reading and Writing picture page and Listening page of each test, in that order.
      for (const test of [0, 1, 2]) {
        assert.match(doc.pages[test * 3].text, /Practice Test [123]/);
        assert.match(doc.pages[test * 3 + 1].text, /Look and read/);
        assert.match(doc.pages[test * 3 + 2].text, /Listen and look/);
      }
    }
    assert.doesNotMatch(doc.pages.map(p => p.text).join('\n'), /Reading and Writing\s*Part 1\s*1[. :]\s*(?:yes|no)|Audio script S[123]/i);
  });
  test(`${id}: unresolved placeholders cannot render live`, () => {
    assert.throws(() => assertStartersDraft({ ...product, live: true }), /decisions must be resolved/);
    assert.throws(() => renderToStaticMarkup(createElement(ProductPage, { product: { ...product, live: true }, locale: 'en' })), /decisions must be resolved/);
  });
}
