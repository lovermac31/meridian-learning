/**
 * PayPal second payment option (owner decision, 14 Oct 2026): one shared link
 * builder, the FX from marketPricing.json, and the same link shape, logo and
 * account as the market-page panel (PR #128).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pricing from '../src/content/marketPricing.json';
import { buildViPage } from '../scripts/prerender-yl-vi.mjs';
import { PAYPAL_ACCOUNT, PAYPAL_LOGO, VND_PER_USD, paypalHref, paypalItemName, usdFromVnd } from '../src/lib/paypal.ts';

const ROOT = resolve(import.meta.dirname, '..');
const read = (p: string) => readFileSync(resolve(ROOT, p), 'utf8');

test('FX is the one recorded with the approved prices', () => {
  const recorded = Number(pricing._approved.match(/USD 1 = VND ([\d,]+)/)?.[1].replaceAll(',', ''));
  assert.equal(VND_PER_USD, recorded);
});

test('VND prices convert to whole US dollars, rounded up', () => {
  assert.equal(usdFromVnd(690_000), 27);
  assert.equal(usdFromVnd(800_000), 31);
  assert.equal(usdFromVnd(5_600_000), 217);
  assert.equal(usdFromVnd(25_897), 1);
  assert.equal(usdFromVnd(25_898), 2);
});

test('checkout link is a fully encoded _xclick to the Jurassic English account', () => {
  const href = paypalHref(paypalItemName('Live Speaking Baseline', 'Young Learners'), 27);
  assert.equal(href, 'https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=info%40jurassicenglish.com&item_name=Live+Speaking+Baseline+-+Young+Learners+%28Jurassic+English%29&amount=27.00&currency_code=USD&no_shipping=1');
  const url = new URL(href);
  assert.equal(url.searchParams.get('business'), 'info@jurassicenglish.com');
  assert.equal(url.searchParams.get('item_name'), 'Live Speaking Baseline - Young Learners (Jurassic English)');
});

test('account and logo match the market-page panel (PR #128)', () => {
  const market = read('src/components/SearchInsightsPage.tsx');
  assert.ok(market.includes(`const PAYPAL_ACCOUNT = '${PAYPAL_ACCOUNT}'`));
  assert.ok(market.includes(`const PAYPAL_LOGO = '${PAYPAL_LOGO}'`));
  assert.ok(market.includes("cmd: '_xclick'") && market.includes('(Jurassic English)'));
});

// ---- Young Learners (/young-learners-speaking/ and /vi/luyen-noi-ielts/) ----

const YL_EN = read('young-learners-speaking/index.html');
const YL_VI = buildViPage(YL_EN).html;
const YL_OFFERS = [
  { item: 'baseline', offer: 'Live Speaking Baseline', vnd: 690_000 },
  { item: 'lesson_single', offer: 'One-to-one lesson 60 min', vnd: 800_000 },
  { item: 'lesson_month', offer: 'Month of 8 lessons', vnd: 5_600_000 },
];
const ylOptions = (html: string) =>
  [...html.matchAll(/<a class="yl-paypal-option" data-paypal-item="([^"]+)" href="([^"]+)" target="_blank" rel="noopener noreferrer"><span[^>]*>[^<]+<\/span><strong>US\$(\d+)<\/strong><\/a>/g)]
    .map((m) => ({ item: m[1], href: m[2].replaceAll('&amp;', '&'), shown: Number(m[3]) }));

for (const [name, html] of Object.entries({ EN: YL_EN, VI: YL_VI })) {
  test(`YL ${name}: PayPal panel pays ceil(VND / 25,897) for Baseline, 1 lesson and a month`, () => {
    const options = ylOptions(html);
    assert.deepEqual(options.map((o) => o.item), YL_OFFERS.map((o) => o.item));
    for (const [i, o] of YL_OFFERS.entries()) {
      const usd = usdFromVnd(o.vnd);
      assert.equal(options[i].shown, usd, o.item);
      assert.equal(options[i].href, paypalHref(paypalItemName(o.offer, 'Young Learners'), usd), o.item);
    }
    assert.deepEqual(options.map((o) => o.shown), [27, 31, 217]);
    assert.match(html, new RegExp(`<img src="${PAYPAL_LOGO}" width="101" height="32" alt="PayPal"`));
  });

  test(`YL ${name}: PayPal sits under VietQR, with manual confirmation and a jump link from booking`, () => {
    const vietqr = html.indexOf('data-lessons-pack="lesson_month"');
    const panel = html.indexOf('id="paypal"');
    assert.ok(vietqr > 0 && panel > vietqr);
    assert.match(html, /class="yl-paypal-note" data-i18n="pricing.paypalConfirm"/);
    assert.match(html, /<a href="#paypal" data-paypal-jump="booking"/);
    assert.ok(html.indexOf('data-paypal-jump="booking"') > html.indexOf('class="form-booking"'));
  });
}

test('YL copy: card line replaced in EN, VI and zh-CN; VietQR stays first; PayPal confirmation is manual', () => {
  const dicts = {
    en: read('src/yl/i18n.ts'),
    vi: JSON.parse(read('src/yl/i18n.vi.json')),
    zh: JSON.parse(read('src/yl/i18n.zh-CN.json')),
  };
  assert.doesNotMatch(dicts.en + YL_EN + YL_VI + JSON.stringify(dicts.vi) + JSON.stringify(dicts.zh), /Card payments are not available|chưa nhận thanh toán bằng thẻ|暂不支持银行卡/);
  assert.match(YL_EN, /data-i18n="pricing.flexTrust2">Bank transfer with VietQR in Vietnam, confirmed automatically\. Outside Vietnam, pay with PayPal, confirmed by hand\./);
  for (const d of [dicts.vi, dicts.zh]) {
    for (const key of ['pricing.paypalH', 'pricing.paypalP', 'pricing.paypalBaseline', 'pricing.paypalSingle', 'pricing.paypalMonth', 'pricing.paypalConfirm', 'book.paypalLink', 'book.paypalConfirm']) {
      assert.ok(d[key], key);
    }
    assert.ok(d['pricing.flexTrust2'].indexOf('VietQR') < d['pricing.flexTrust2'].indexOf('PayPal'));
  }
  assert.match(YL_EN, /We confirm PayPal payments by hand, usually within 1 business day\./);
});

test('YL: every PayPal link reports a unique click label', () => {
  const main = read('src/yl/main.tsx');
  assert.match(main, /trackCtaClick\(/);
  assert.match(main, /yl_paypal_\$\{item\}/);
  const items = [...YL_EN.matchAll(/data-paypal-item="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(items).size, items.length);
});

test('privacy policy names PayPal as a payment processor in EN and VI', async () => {
  const { legalDocuments } = await import('../src/lib/legalContent.ts');
  const { getLocalizedLegalDocument } = await import('../src/i18n/content/legal.ts');
  for (const doc of [legalDocuments['/legal/privacy'], getLocalizedLegalDocument('/legal/privacy', 'vi')]) {
    assert.ok(doc);
    const text = JSON.stringify(doc.sections);
    assert.match(text, /PayPal/);
    assert.ok((text.match(/PayPal/g) ?? []).length >= 3, doc.title);
  }
  assert.equal(legalDocuments['/legal/privacy'].lastUpdated, 'October 14, 2026');
});
