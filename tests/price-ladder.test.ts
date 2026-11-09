import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PRODUCTS, IELTS_GROUPS } from '../src/i18n/content/products';
import { PAID_OFFERS, paymentQrUrl } from '../src/config/payment';
import { usdFromVnd } from '../src/lib/paypal';
import { productUsd } from '../src/lib/productsSource';
import { PRODUCT_SEO } from '../src/i18n/content/productSeo';
import { createProductJsonLd } from '../src/lib/structuredData';

// Price ladder (Jay's go, 5 Nov 2026; brief .regen/command/JURASSICIELTS/PRICING-LADDER-DECISION-2026-11-05.md section 4).
const vnd = (id: string) => Number(PRODUCTS.find((p) => p.id === id)!.price.replace(/\D/g, ''));
const fmt = (n: number) => n.toLocaleString('de-DE');

const SINGLES: Record<string, [number, number]> = {
  'ielts-cue-card-bank': [199000, 8], 'ielts-writing-task1-method': [199000, 8], 'ielts-essay-bank-task2': [199000, 8],
  'ielts-speaking-ladder': [299000, 12], 'ielts-writing-ladder-task2': [299000, 12], 'ielts-reading-ladder': [250000, 10], 'ielts-listening-profiler': [299000, 12], 'ielts-diagnostic-mock': [199000, 8],
  // Unchanged by the ladder.
  'writing-baseline': [79000, 4], 'ielts-one-to-one-starter': [149000, 6], 'ielts-writing-teacher-pack': [690000, 27],
};
const BUNDLES: Record<string, { price: number; usd: number; items: string[] }> = {
  'ielts-writing-band-up': { price: 499000, usd: 20, items: ['ielts-writing-task1-method', 'ielts-writing-ladder-task2', 'ielts-essay-bank-task2'] },
  'ielts-speaking-band-up': { price: 449000, usd: 18, items: ['ielts-speaking-ladder', 'ielts-cue-card-bank', 'ielts-one-to-one-starter'] },
  'ielts-four-skill-kit': {
    price: 999000, usd: 39,
    items: ['ielts-speaking-ladder', 'ielts-writing-ladder-task2', 'ielts-reading-ladder', 'ielts-listening-profiler', 'ielts-writing-task1-method', 'ielts-essay-bank-task2', 'ielts-cue-card-bank'],
  },
};

test('the seven repriced packs and the unchanged ones carry the ladder price and the matching US$ price', () => {
  for (const [id, [price, usd]] of Object.entries(SINGLES)) {
    assert.equal(vnd(id), price, id);
    assert.equal(usdFromVnd(price), usd, `${id} US$`);
    assert.equal(productUsd(PRODUCTS.find((p) => p.id === id)!.price, id), usd, `${id} PayPal US$`);
    assert.equal(PAID_OFFERS.find((o) => o.id === id)!.amount, price, `${id} VietQR`);
  }
});

test('the displayed price is the charged price: card = VietQR = server table = JSON-LD, for every product', () => {
  const server = new Map<string, number>();
  for (const m of readFileSync('api/sample-pack.ts', 'utf8').matchAll(/'([a-z0-9-]+)': \{ prefix: '([A-Z0-9]+)', amount: (\d+) \}/g)) server.set(m[1], Number(m[3]));
  for (const p of PRODUCTS.filter((x) => x.live && x.id !== 'one-to-one')) {
    const shown = vnd(p.id);
    assert.equal(server.get(p.id), shown, `${p.id}: server table`);
    const offer = PAID_OFFERS.find((o) => o.id === p.id)!;
    assert.equal(offer.amount, shown, `${p.id}: PAID_OFFERS`);
    assert.equal(new URL(paymentQrUrl(offer.amount, `${offer.prefix}-ABC123`)!).searchParams.get('amount'), String(shown), `${p.id}: QR`);
    for (const locale of ['en', 'vi'] as const) {
      const offers = ([] as Array<{ price: string; priceCurrency: string }>).concat(((createProductJsonLd(p, locale) as { offers?: unknown }).offers ?? []) as never);
      assert.equal(Number(offers.find((o) => o.priceCurrency === 'VND')!.price), shown, `${p.id} ${locale}: JSON-LD VND`);
    }
  }
});

test('bundles: list price is the sum of the packs, the discount is computed from it, per-item prices are shown, nothing manipulative', () => {
  const memo = new Set(PAID_OFFERS.map((o) => o.prefix));
  assert.equal(memo.size, PAID_OFFERS.length, 'memo prefixes stay unique');
  for (const [id, spec] of Object.entries(BUNDLES)) {
    const product = PRODUCTS.find((p) => p.id === id)!;
    assert.ok(product.live && product.section === 'ielts' && product.group === 'bundles' && product.delivery && product.paypal, id);
    assert.equal(vnd(id), spec.price, `${id} price`);
    assert.equal(usdFromVnd(spec.price), spec.usd, `${id} US$`);
    const list = spec.items.reduce((sum, item) => sum + vnd(item), 0);
    const percent = Math.round(((list - spec.price) / list) * 100);
    assert.ok(list > spec.price, `${id}: cheaper than the packs bought separately`);
    for (const locale of ['en', 'vi'] as const) {
      const text = `${product[locale].inside} ${product[locale].forWho}`;
      assert.ok(text.includes(fmt(list)), `${id} ${locale}: list price ${fmt(list)}`);
      assert.ok(text.includes(fmt(spec.price)), `${id} ${locale}: bundle price`);
      assert.ok(text.includes(`${percent}%`), `${id} ${locale}: discount ${percent}%`);
      for (const item of new Set(spec.items)) assert.ok(product[locale].inside.includes(fmt(vnd(item))), `${id} ${locale}: shows ${item} at ${fmt(vnd(item))}`);
      assert.doesNotMatch(JSON.stringify(product[locale]), /countdown|only \d+ left|limited time|hurry|guarantee|đảm bảo|cam kết|còn \d+ suất|<s>|<del>|strike/i, `${id} ${locale}: no scarcity or guarantee`);
    }
    for (const locale of ['en', 'vi'] as const) assert.ok(PRODUCT_SEO[id][locale].description.includes(fmt(spec.price)), `${id} ${locale}: SEO price`);
  }
  assert.deepEqual([...IELTS_GROUPS], ['speaking', 'writing', 'reading', 'listening', 'bundles']);
});

test('the Live Baseline offer for pack and bundle buyers is a manual, honest line (no discount-code mechanism exists), EN and VI', () => {
  const baseline = PRODUCTS.find((p) => p.id === 'baseline')!;
  assert.match(baseline.en.forWho, /IELTS pack or bundle in the last 30 days.*order code.*100\.000₫ off/);
  assert.match(baseline.vi.forWho, /30 ngày qua.*mã đơn hàng.*giảm 100\.000₫/);
  assert.equal(vnd('baseline'), 690000, 'the Baseline price itself is unchanged');
  assert.doesNotMatch(readFileSync('src/config/payment.ts', 'utf8'), /coupon|promo ?code|discountCode/i, 'no automatic discount code was added');
});

test('the old prices are gone from the repriced packs (cards, SEO and the server table)', () => {
  for (const id of Object.keys(SINGLES).filter((id) => [199000, 299000].includes(SINGLES[id][0]))) {
    const product = PRODUCTS.find((p) => p.id === id)!;
    assert.doesNotMatch(`${product.price} ${PRODUCT_SEO[id].en.description} ${PRODUCT_SEO[id].vi.description}`, /290\.000|390\.000/, id);
  }
});
