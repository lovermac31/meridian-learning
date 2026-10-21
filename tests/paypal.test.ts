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
import { PAYPAL_BUSINESS_ID, PAYPAL_LOGO, VND_PER_USD, paypalHref, paypalItemName, usdFromVnd } from '../src/lib/paypal.ts';
import { baselineHref } from '../src/lib/baselineLink.ts';
import { lessonsHref } from '../src/yl/pageI18n.ts';

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
  assert.equal(href, `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${PAYPAL_BUSINESS_ID}&item_name=Live+Speaking+Baseline+-+Young+Learners+%28Jurassic+English%29&amount=27.00&currency_code=USD&no_shipping=1`);
  const url = new URL(href);
  assert.equal(url.searchParams.get('business'), PAYPAL_BUSINESS_ID);
  assert.equal(url.searchParams.get('item_name'), 'Live Speaking Baseline - Young Learners (Jurassic English)');
});

test('payments go to the business account by merchant ID, never to an email', () => {
  // info@jurassicenglish.com is a separate PayPal account (found 14 Oct 2026); the business account is
  // WorldWiseLearning. A PayPal merchant ID is 13 upper-case letters and digits.
  assert.match(PAYPAL_BUSINESS_ID, /^[A-Z0-9]{13}$/);
  for (const file of ['src/lib/paypal.ts', 'src/components/SearchInsightsPage.tsx', 'young-learners-speaking/index.html']) {
    assert.doesNotMatch(read(file), /business=info%40|business: *'info@|__PAYPAL_MERCHANT_ID__/, file);
  }
});

test('the market-page panel uses the shared account and logo', () => {
  const market = read('src/components/SearchInsightsPage.tsx');
  assert.ok(market.includes("import { PAYPAL_BUSINESS_ID, PAYPAL_LOGO, PAYPAL_PAYEE_NAME } from '../lib/paypal'"));
  assert.ok(market.includes('business: PAYPAL_BUSINESS_ID') && PAYPAL_LOGO.startsWith('https://www.paypalobjects.com/'));
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
// 21 Oct 2026: the options open the order-first checkout (automated PayPal in the AI Speaking app, PR #134 + 039), not
// fixed _xclick links: the Baseline booking page, and the lessons checkout for 1 lesson and the 8-lesson pack.
const ylOptions = (html: string) =>
  [...html.matchAll(/<a class="yl-paypal-option" data-paypal-item="([^"]+)" (?:data-baseline-link|data-lessons-pack="[^"]+") href="([^"]+)"><span[^>]*>[^<]+<\/span><strong>US\$(\d+)<\/strong><\/a>/g)]
    .map((m) => ({ item: m[1], href: m[2].replaceAll('&amp;', '&'), shown: Number(m[3]) }));
const checkoutHref = (item: string, lang: 'en' | 'vi') => (item === 'baseline' ? baselineHref(lang) : lessonsHref(item, lang));

for (const [name, html, lang] of [['EN', YL_EN, 'en'], ['VI', YL_VI, 'vi']] as const) {
  test(`YL ${name}: PayPal panel shows ceil(VND / 25,897) and opens the order-first checkout for Baseline, 1 lesson and a month`, () => {
    const options = ylOptions(html);
    assert.deepEqual(options.map((o) => o.item), YL_OFFERS.map((o) => o.item));
    for (const [i, o] of YL_OFFERS.entries()) {
      const usd = usdFromVnd(o.vnd);
      assert.equal(options[i].shown, usd, o.item);
      assert.equal(options[i].href, checkoutHref(o.item, lang), o.item);
    }
    assert.doesNotMatch(html, /cgi-bin\/webscr/, 'no fixed PayPal link left on the YL page');
    assert.deepEqual(options.map((o) => o.shown), [27, 31, 217]);
    assert.match(html, new RegExp(`<img src="${PAYPAL_LOGO}" width="101" height="32" alt="PayPal"`));
  });

  test(`YL ${name}: PayPal sits under VietQR, with automatic confirmation and a jump link from booking`, () => {
    const vietqr = html.indexOf('data-lessons-pack="lesson_month"');
    const panel = html.indexOf('id="paypal"');
    assert.ok(vietqr > 0 && panel > vietqr);
    assert.match(html, /class="yl-paypal-note" data-i18n="pricing.paypalConfirm"/);
    assert.match(html, /<a href="#paypal" data-paypal-jump="booking"/);
    // Overhaul: the jump link sits in the 1-to-1 booking block (#book-online).
    assert.ok(html.indexOf('data-paypal-jump="booking"') > html.indexOf('id="book-online"'));
  });
}

test('YL copy: card line replaced in EN, VI and zh-CN; VietQR stays first; PayPal confirmation is automatic', () => {
  const dicts = {
    en: read('src/yl/i18n.ts'),
    vi: JSON.parse(read('src/yl/i18n.vi.json')),
    zh: JSON.parse(read('src/yl/i18n.zh-CN.json')),
  };
  assert.doesNotMatch(dicts.en + YL_EN + YL_VI + JSON.stringify(dicts.vi) + JSON.stringify(dicts.zh), /Card payments are not available|chưa nhận thanh toán bằng thẻ|暂不支持银行卡/);
  assert.match(YL_EN, /data-i18n="pricing.flexTrust2">Bank transfer with VietQR in Vietnam, or PayPal in US dollars from outside Vietnam\. Both are confirmed automatically\./);
  for (const d of [dicts.vi, dicts.zh]) {
    for (const key of ['pricing.paypalH', 'pricing.paypalP', 'pricing.paypalBaseline', 'pricing.paypalSingle', 'pricing.paypalMonth', 'pricing.paypalConfirm', 'book.paypalLink', 'book.paypalConfirm']) {
      assert.ok(d[key], key);
    }
    assert.ok(d['pricing.flexTrust2'].indexOf('VietQR') < d['pricing.flexTrust2'].indexOf('PayPal'));
  }
  // No PayPal string anywhere still says payments are checked by hand.
  const paypalKeys = ['pricing.flexTrust2', 'pricing.paypalP', 'pricing.paypalConfirm', 'book.paypalConfirm', 'yl2.paypal.note'];
  for (const d of [dicts.vi, dicts.zh]) for (const k of paypalKeys) if (d[k]) assert.doesNotMatch(d[k], /thủ công|人工/, k);
  assert.doesNotMatch(dicts.en, /PayPal[^'"]*by hand|by hand[^'"]*PayPal/);
  assert.doesNotMatch(YL_EN + YL_VI, /PayPal[^<]*by hand|by hand[^<]*PayPal|PayPal[^<]*thủ công/);
  assert.match(YL_EN, /PayPal payments are confirmed automatically and your order code is attached for you\./);
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
