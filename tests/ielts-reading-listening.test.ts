import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { IELTS_GROUPS, PRODUCTS } from '../src/i18n/content/products';
import { PRODUCT_SEO } from '../src/i18n/content/productSeo';
import { SAMPLE_PAGE_COUNTS } from '../src/i18n/content/samplePages';
import { PAID_OFFERS } from '../src/config/payment';
import { productUsd } from '../src/lib/productsSource';
import { ProductsPage } from '../src/components/ProductsPage';

// IELTS Reading Ladder and Listening Profiler Pack (IELTS Writing factory, 3 Nov 2026; Jay's go relayed by the factory):
// two 299.000₫ / US$12 packs (390.000₫ / US$16 before the 5 Nov 2026 price ladder) in #ielts under their own Reading and Listening groups, after Speaking and Writing. Neither
// has an IELTS home page or a film yet, so their cards carry no home link and no "Watch" link.
const NEW = { 'ielts-reading-ladder': { group: 'reading', pages: 10, memo: 'PR14' }, 'ielts-listening-profiler': { group: 'listening', pages: 11, memo: 'PR15' } } as const;

test('Reading and Listening: live #ielts cards (Reading 250.000₫ / US$10 from 9 Nov 2026, Listening 299.000₫ / US$12), sample, SEO copy and their own VietQR memo prefix', () => {
  assert.deepEqual([...IELTS_GROUPS], ['speaking', 'writing', 'reading', 'listening', 'bundles']);
  for (const [id, spec] of Object.entries(NEW)) {
    const p = PRODUCTS.find((entry) => entry.id === id)!;
    assert.ok(p.live && p.section === 'ielts' && p.group === spec.group, id);
    const [vnd, usd, amount] = id === 'ielts-reading-ladder' ? ['250.000₫', 10, 250000] : ['299.000₫', 12, 299000];
    assert.equal(p.price, vnd);
    assert.equal(productUsd(p.price), usd);
    assert.ok(p.delivery && p.paypal && p.href === 'zalo', `${id}: a digital download ordered on Zalo or PayPal`);
    assert.equal(p.image, id);
    assert.equal(p.sample, id);
    assert.equal(SAMPLE_PAGE_COUNTS[id], spec.pages);
    assert.equal(p.video, undefined, `${id}: no film yet`);
    assert.deepEqual(PAID_OFFERS.find((o) => o.id === id), { ...PAID_OFFERS.find((o) => o.id === id)!, amount, prefix: spec.memo });
    for (const locale of ['en', 'vi'] as const) {
      assert.match(p[locale].forWho, locale === 'en' ? /One learner, or one tutor with their own students\. Practice material, not an official score\.$/ : /Một học viên, hoặc một gia sư dùng với học viên của mình\. Tài liệu luyện tập, không phải điểm chính thức\.$/);
      const seo = PRODUCT_SEO[id][locale];
      assert.ok(seo.title.length <= 60 && seo.description.length >= 80 && seo.description.length <= 160 && seo.description.includes(vnd.replace('₫', '')), `${id} ${locale}`);
    }
  }
});

test('/products: Reading and Listening headings follow Writing, each card in its group, with no IELTS home link', () => {
  for (const locale of ['en', 'vi'] as const) {
    const html = renderToStaticMarkup(createElement(ProductsPage, { locale }));
    const ielts = html.slice(html.indexOf('<section id="ielts"'), html.indexOf('</section>', html.indexOf('<section id="ielts"')));
    const at = IELTS_GROUPS.map((group) => ielts.indexOf(`data-ielts-group="${group}"`));
    assert.ok(at.every((index, i) => index > 0 && (i === 0 || index > at[i - 1])), `${locale}: Speaking, Writing, Reading, Listening, Bundles`);
    assert.match(ielts, /<h3 id="ielts-reading"[^>]*>IELTS Reading<\/h3>/);
    assert.match(ielts, /<h3 id="ielts-listening"[^>]*>IELTS Listening<\/h3>/);
    for (const [id, spec] of Object.entries(NEW)) {
      const block = ielts.slice(ielts.indexOf(`data-ielts-group="${spec.group}"`));
      const card = block.slice(block.indexOf(`id="${id}"`), block.indexOf('</li>', block.indexOf(`id="${id}"`)));
      assert.ok(card.length > 0, `${locale}: ${id} under ${spec.group}`);
      assert.doesNotMatch(card, /data-ielts-home=|data-watch=/, `${locale}: ${id} has no home or film link`);
    }
    const tile = html.match(/data-category-tile="ielts"[\s\S]*?<\/button>/)![0];
    assert.ok(tile.includes('IELTS Speaking · IELTS Writing · IELTS Reading · IELTS Listening'), `${locale}: the IELTS tile names all four skills`);
  }
});
