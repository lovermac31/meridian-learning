import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { PRODUCTS, STARTERS_CREDIT, STARTERS_DELIVERY, STARTERS_INDEPENDENCE, STARTERS_LICENCE, STARTERS_SET_DELIVERY } from '../src/i18n/content/products';
import { PRODUCT_SEO, productFaq } from '../src/i18n/content/productSeo';
import { STARTERS_IDS } from '../src/i18n/content/startersFlags';
import { ProductPage } from '../src/components/ProductPage';
import { productPaypalHref } from '../src/lib/productsSource';
import { validateSampleText } from '../src/lib/sampleText';

/**
 * The launch copy of the four Starters products (27 Nov 2026), rendered the way a visitor gets it. The product copy is the "approved for
 * review" wording of WORDING-FOR-APPROVAL.md; this test pins it word for word so a later edit cannot drift unseen, and it keeps every
 * claim the site refuses to make (Jay: "We do not use Cambridge"; no "official", "approved", "authentic" or pass promise).
 */
const banned = /\b(?:approved|official|endorsed|authori[sz]ed|accredited|partner|licensed by|pass|score|shields|exam-ready|testimonials?|popular|authentic)\b|children love it|used by \d/i;
// The honest NEGATIVE disclaimers, exactly as the independence sentence and the books print them; nothing wider is allowed.
// The FAQ question the placement blueprint asks for ("Is this an official test?", answered No) is allowed too.
const allowedDisclaimers = [/There is no pass or fail\./gi, /not an official exam\./gi, /Is this an official test\?/gi, /không phải kỳ thi chính thức\./gi];
const strip = (text: string) => allowedDisclaimers.reduce((t, phrase) => t.replace(phrase, ''), text.replace(/\s+/g, ' '));
const SIDES = { 'starters-practice-test-1': 7, 'starters-practice-test-2': 7, 'starters-practice-test-3': 7, 'starters-practice-tests-pack': 9 } as const;

for (const id of STARTERS_IDS) {
  const isPack = id === 'starters-practice-tests-pack';
  const product = PRODUCTS.find(p => p.id === id)!;
  const set = isPack;
  test(`${id}: approved wording, honest claims, price, sample and clip before the price, manual order path (EN and VI)`, () => {
    assert.equal(product.price, isPack ? '249.000₫' : '99.000₫');
    assert.equal(product.usd, isPack ? 10 : 4);
    assert.equal(product.orderOnly, true);
    assert.equal(product.category, 'practice-tests');
    for (const locale of ['en', 'vi'] as const) {
      const html = renderToStaticMarkup(createElement(ProductPage, { product, locale })).replaceAll('&amp;', '&').replaceAll('<!-- -->', '');
      const text = html.replace(/<[^>]+>/g, ' ');
      // No placeholder of any kind, no exam board, no word that reads as a claim.
      assert.doesNotMatch(html, /JAY TO CONFIRM|ADVISER TO CONFIRM|VI DRAFT|native read needed/i, `${id} ${locale}: no placeholder`);
      assert.doesNotMatch(html, /Cambridge/i, `${id} ${locale}: no Cambridge`);
      assert.doesNotMatch(strip(text), banned, `${id} ${locale}: no banned claim word`);
      assert.doesNotMatch(html, /autoplay/i);
      // The four approved lines, verbatim.
      assert.ok(text.includes(STARTERS_LICENCE[locale]), `${id} ${locale}: licence line`);
      assert.ok(text.includes(STARTERS_CREDIT[locale]), `${id} ${locale}: credit line`);
      assert.ok(text.includes((set ? STARTERS_SET_DELIVERY : STARTERS_DELIVERY)[locale]), `${id} ${locale}: delivery line`);
      assert.ok(text.includes(STARTERS_INDEPENDENCE[locale]), `${id} ${locale}: independence sentence`);
      // Order of the page: sample (thumbnails) → clip → licence → price → order buttons. Samples above the price (Jay's rule).
      const at = (marker: string) => html.indexOf(marker);
      const price = at(`data-price="${id}"`);
      assert.ok(price > 0);
      assert.ok(at(`data-sample="${id}"`) > 0 && at(`data-sample="${id}"`) < price, `${id} ${locale}: sample above the price`);
      assert.ok(at(`data-licence="${id}"`) > 0 && at(`data-licence="${id}"`) < price, `${id} ${locale}: licence above the price`);
      if (product.clip) {
        assert.ok(at(`data-phonics-clip="${id}"`) > 0 && at(`data-phonics-clip="${id}"`) < price, `${id} ${locale}: clip above the price`);
        assert.match(html, /<audio[^>]*preload="none"/);
        assert.doesNotMatch(html, /<audio[^>]*autoplay/);
      } else {
        // Test 3: no clip until its tracks are listened to.
        assert.ok(!html.includes('<audio') && !html.includes('data-phonics-clip'), `${id} ${locale}: no audio element`);
      }
      // Manual order path only: Zalo (named by the product), PayPal US$, no Buy now, no automatic checkout, no portal.
      assert.match(html, new RegExp(`href="/go/zalo/${id}\\?utm_source=`), `${id} ${locale}: Zalo order link`);
      assert.match(html, new RegExp(`data-paypal-link="${id}"`), `${id} ${locale}: PayPal option`);
      assert.doesNotMatch(html, /data-buy-now|data-portal-buy|qr\.sepay|checkout=1/, `${id} ${locale}: no automatic checkout`);
      assert.ok(text.includes(product.price), `${id} ${locale}: VND price shown`);
      // Titles and descriptions: no exam board, short enough, no claim.
      const seo = PRODUCT_SEO[id][locale];
      assert.ok(seo.title.length <= 60, `${id} ${locale}: title ${seo.title.length} characters`);
      assert.ok(seo.description.length >= 80 && seo.description.length <= 160, `${id} ${locale}: description ${seo.description.length} characters`);
      assert.doesNotMatch(seo.title + seo.description + product[locale].title, /Cambridge|authentic|\bofficial\b|\bapproved\b|\bpass\b/i);
      // FAQ answers the two practice-test questions.
      const faq = productFaq(product, locale);
      assert.ok(faq.some(f => /official|chính thức/i.test(f.question)), `${id} ${locale}: "Is this an official test?" asked`);
      assert.ok(faq.some(f => /audio|âm thanh/i.test(f.question)), `${id} ${locale}: audio question`);
    }
    // PayPal: the US$ price the card shows is the one PayPal charges (US$4 / US$10), not a derived or regional one.
    const paypal = new URL(productPaypalHref(id, null, 'en'));
    assert.equal(paypal.searchParams.get('amount'), (isPack ? 10 : 4).toFixed(2), `${id}: PayPal amount`);
    // Sample text: no answer key, no scripts, no exam board, no claim.
    const doc = validateSampleText(JSON.parse(readFileSync(`public/samples/pages/${id}-text.json`, 'utf8')), id, id, SIDES[id]);
    for (const page of doc.pages) {
      const sampleText = strip(page.text);
      assert.doesNotMatch(sampleText, /Cambridge/i, `sample ${page.page}: no exam board is named (Jay, 27 Nov 2026)`);
      assert.doesNotMatch(sampleText, banned, `sample ${page.page}`);
    }
    if (!isPack) {
      assert.match(doc.pages[3].text, /Look and read/);
      assert.match(doc.pages[4].text, /There is one example/);
      assert.match(doc.pages[5].text, /Listen and colou?r/);
      assert.match(doc.pages[6].text, /Speaking: the big picture/);
    } else {
      // The set shows cover, Reading and Writing picture page and Listening page of each test, in that order.
      for (const t of [0, 1, 2]) {
        assert.match(doc.pages[t * 3].text, /Practice Test [123]/);
        assert.match(doc.pages[t * 3 + 1].text, /Look and read/);
        assert.match(doc.pages[t * 3 + 2].text, /Listen and look/);
      }
    }
    assert.doesNotMatch(doc.pages.map(p => p.text).join('\n'), /Reading and Writing\s*Part 1\s*1[. :]\s*(?:yes|no)|Audio script S[123]/i);
  });
}

test('the approved lines carry no exam-board name and the independence sentence is the decided one', () => {
  assert.equal(STARTERS_INDEPENDENCE.en, 'Original practice material written and designed by Jurassic English for ages 6 to 8, at the Pre A1 level. It is a practice test, not an official exam.');
  for (const line of [STARTERS_LICENCE, STARTERS_CREDIT, STARTERS_DELIVERY, STARTERS_SET_DELIVERY, STARTERS_INDEPENDENCE]) for (const text of Object.values(line)) assert.doesNotMatch(text, /Cambridge|authentic/i);
  assert.match(STARTERS_LICENCE.en, /one learner or one classroom/);
});
