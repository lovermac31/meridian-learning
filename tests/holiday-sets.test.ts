/**
 * Holiday sets, 28 Nov to 6 Dec 2026 (Jay, 25 Nov 2026): the dated window, the two prices, the payment path, the
 * "nothing indexed that should not be" rules, the structured data and the prepared (not applied) migration.
 * Every server check runs the real handlers in-process with a frozen clock and a mocked Notion (scripts/lib/holiday-harness.mts):
 * no production service, database, bank or email is reached.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { renderRoute } from '../src/entry-server';
import {
  HOLIDAY_SETS, HOLIDAY_SET_PATHS, HOLIDAY_WINDOW, getHolidaySetByPath, holidaySetClosedAt, holidaySetSaving, holidayWindowStatus, isHolidaySetMemo,
} from '../src/config/holidaySets';
import { PRODUCTS } from '../src/i18n/content/products';
import { holidayPageSeo, holidaySetComponents, holidaySetText } from '../src/i18n/content/holidaySets';
import { HOLIDAY_OFFERS, PAID_OFFERS, buyCta, canonicalPaymentMemo, paidOffer, paymentHref, paymentQrUrl } from '../src/config/payment';
import { payStatusSource } from '../src/lib/payStatus';
import { createHolidaySetJsonLd } from '../src/lib/structuredData';
import { holidaySetPaypalHref } from '../src/lib/holidaySetLinks';
import { getExpectedPublicIndexableRoutes, getPrivateOrNonIndexableRoutes, getPrerenderRoutes, resolveRouteMetadata } from '../src/lib/routeMetadata';
import { resolveLocalizedRoute, getLocalizedPathname } from '../src/i18n/routing';
import { createPaidMemo, isMisroutableMemo, toSampleLead, coerceSampleInput } from '../api/sample-pack';
import { callSamplePack, callWebhook, formBody, prepareBody } from '../scripts/lib/holiday-harness.mjs';

const T = {
  beforeLast: '2026-11-27T23:59:59.999+07:00',
  open: '2026-11-28T00:00:00.000+07:00',
  lastMs: '2026-12-06T23:59:59.999+07:00',
  ended: '2026-12-07T00:00:00.000+07:00',
  mid: '2026-12-02T14:30:00+07:00',
};
const usual = (id: string) => Number(PRODUCTS.find((p) => p.id === id)!.price.replace(/\D/g, ''));
const SET_IDS = HOLIDAY_SETS.map((set) => set.id);

test('the window is 28 Nov 00:00 to 6 Dec 23:59:59.999 Vietnam time, to the millisecond, and fails closed', () => {
  assert.equal(holidayWindowStatus(new Date(T.beforeLast)), 'before');
  assert.equal(holidayWindowStatus(new Date(T.open)), 'open');
  assert.equal(holidayWindowStatus(new Date(T.mid)), 'open');
  assert.equal(holidayWindowStatus(new Date(T.lastMs)), 'open');
  assert.equal(holidayWindowStatus(new Date(T.ended)), 'ended');
  assert.equal(holidayWindowStatus(new Date('2027-01-15T00:00:00+07:00')), 'ended');
  assert.equal(holidayWindowStatus(new Date('not a date')), 'ended', 'an invalid clock never opens the offer');
  // Hanoi is UTC+7: 6 Dec 23:59 in Hanoi is 16:59 UTC, and 17:00 UTC is already 7 Dec in Hanoi.
  assert.equal(holidayWindowStatus(new Date('2026-12-06T16:59:59.999Z')), 'open');
  assert.equal(holidayWindowStatus(new Date('2026-12-06T17:00:00.000Z')), 'ended');
  assert.equal(HOLIDAY_WINDOW.lastDay, '2026-12-06');
});

test('28 Nov 2026 is a Saturday and 6 Dec 2026 is a Sunday (Hanoi)', () => {
  const weekday = (iso: string) => new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(iso));
  assert.equal(weekday(HOLIDAY_WINDOW.start), 'Saturday');
  assert.equal(weekday(HOLIDAY_WINDOW.lastDay + 'T12:00:00+07:00'), 'Sunday');
});

test('the two sets are exactly what Jay approved, and the usual total is the sum of the three usual prices', () => {
  const [reading, teacher] = HOLIDAY_SETS;
  assert.deepEqual([reading.id, reading.listVnd, reading.saleVnd, reading.usd], ['holiday-reading-set-l1', 588_000, 399_000, 16]);
  assert.deepEqual([teacher.id, teacher.listVnd, teacher.saleVnd, teacher.usd], ['teacher-starter-set', 1_570_000, 1_190_000, 47]);
  assert.deepEqual(reading.components, ['parent-pack-l1', 'holiday-reading-challenge', 'word-fossil-flashcards-l1']);
  assert.deepEqual(teacher.components, ['teacher-pack-l1', 'thinking-cycle-set', 'reasoning-assessment-kit']);
  for (const set of HOLIDAY_SETS) {
    assert.equal(set.components.reduce((sum, id) => sum + usual(id), 0), set.listVnd, `${set.id}: list = sum of the usual prices`);
    assert.ok(holidaySetSaving(set) > 0);
    assert.equal(holidaySetComponents(set).length, 3, `${set.id}: all three items are live products`);
  }
});

test('the sets change no existing product, price or id, and are not products', () => {
  for (const set of HOLIDAY_SETS) {
    assert.ok(!PRODUCTS.some((p) => p.id === set.id), `${set.id} is not a PRODUCTS entry (so no sitemap, llms, Product JSON-LD or price list)`);
    assert.ok(!PAID_OFFERS.some((o) => o.id === set.id || o.prefix === set.prefix), 'no clash with a product offer');
    assert.match(set.prefix, /^PR[A-Z0-9]{2}$/);
  }
  // Every payment prefix (products, Story Club, Baseline, 1-to-1, Live Check, the two sets) is unique.
  const all = [...PAID_OFFERS.map((o) => o.prefix), ...HOLIDAY_OFFERS.map((o) => o.prefix), 'LC'];
  assert.equal(new Set(all).size, all.length, 'every payment prefix is unique');
  // The six items keep their approved usual prices.
  const prices: Record<string, number> = { 'parent-pack-l1': 249_000, 'holiday-reading-challenge': 149_000, 'word-fossil-flashcards-l1': 190_000, 'teacher-pack-l1': 690_000, 'thinking-cycle-set': 490_000, 'reasoning-assessment-kit': 390_000 };
  for (const [id, price] of Object.entries(prices)) assert.equal(usual(id), price);
});

test('checkout config: the sale price everywhere a buyer can see or be charged it', () => {
  for (const set of HOLIDAY_SETS) {
    const offer = paidOffer(set.id)!;
    assert.equal(offer.amount, set.saleVnd);
    assert.equal(offer.prefix, set.prefix);
    assert.equal(paymentHref(set.id, 'en'), `/products/${set.id}?checkout=1`);
    assert.equal(paymentHref(set.id, 'vi'), `/vi/products/${set.id}?checkout=1`);
    assert.ok(buyCta(set.id, 'en').endsWith(new Intl.NumberFormat('en-US').format(set.saleVnd) + '₫'));
    const qr = new URL(paymentQrUrl(offer.amount, `${set.prefix}-ABC123`)!);
    assert.equal(qr.searchParams.get('amount'), String(set.saleVnd));
    assert.equal(canonicalPaymentMemo(`MBVCB.123 ${set.prefix}ABC123 chuyen khoan`), `${set.prefix}-ABC123`);
    assert.ok(isHolidaySetMemo(`${set.prefix}-ABC123`));
    assert.deepEqual(payStatusSource(`${set.prefix}-ABC123`), { kind: 'none' }, 'matched by hand: no polling of a status table with no row for it');
  }
  assert.ok(!isHolidaySetMemo('PR1D-ABC123'));
  assert.equal(payStatusSource('PR1D-ABC123').kind, 'auto', 'other products still poll');
});

test('server: windowed products are only the two sets; the check is exact and fails closed', () => {
  for (const id of SET_IDS) {
    assert.equal(holidaySetClosedAt(id, new Date(T.beforeLast)), true);
    assert.equal(holidaySetClosedAt(id, new Date(T.open)), false);
    assert.equal(holidaySetClosedAt(id, new Date(T.lastMs)), false);
    assert.equal(holidaySetClosedAt(id, new Date(T.ended)), true);
    assert.equal(holidaySetClosedAt(id, new Date('nope')), true);
  }
  for (const id of ['parent-pack-l1', 'teacher-pack-l1', 'story-club', 'baseline', undefined]) assert.equal(holidaySetClosedAt(id, new Date(T.ended)), false, `${id} never depends on the window`);
});

test('server: toSampleLead takes a set order inside the window and refuses it outside', () => {
  const input = (product: string) => coerceSampleInput(formBody(product, 7, T.mid));
  for (const id of SET_IDS) {
    assert.ok(!('error' in toSampleLead(input(id), new Date(T.mid))), `${id}: accepted in the window`);
    assert.deepEqual(toSampleLead(input(id), new Date(T.beforeLast)), { error: 'offer_closed' });
    assert.deepEqual(toSampleLead(input(id), new Date(T.ended)), { error: 'offer_closed' });
  }
  assert.ok(!('error' in toSampleLead(input('parent-pack-l1'), new Date(T.ended))), 'a normal product is unaffected after the window');
});

test('server memos for the sets are stable, well-formed and never misroutable', () => {
  for (const set of HOLIDAY_SETS) {
    for (let n = 0; n < 200; n += 1) {
      const submission = `JE-${set.prefix}-${String(n).padStart(8, '0')}-0000-4000-8000-000000000000`;
      const memo = createPaidMemo(set.id, submission);
      assert.match(memo, new RegExp(`^${set.prefix}-[A-Z0-9]{6}$`));
      assert.equal(memo, createPaidMemo(set.id, submission));
      assert.ok(!isMisroutableMemo(set.prefix, memo.slice(set.prefix.length + 1)));
    }
  }
});

test('handler: a payment code is minted in the window at the sale price, and refused (no memo, no lead) outside it', async () => {
  for (const [index, set] of HOLIDAY_SETS.entries()) {
    const ok = await callSamplePack(prepareBody(set.id, 1 + index), T.mid);
    assert.equal(ok.status, 200);
    assert.match(String(ok.body?.memo), new RegExp(`^${set.prefix}-[A-Z0-9]{6}$`));
    assert.equal(ok.body?.amount, set.saleVnd);
    assert.equal(ok.notionWrites, 1);
    for (const at of [T.beforeLast, T.ended]) {
      const refused = await callSamplePack(prepareBody(set.id, 10 + index), at);
      assert.equal(refused.status, 400, at);
      assert.equal(refused.body?.error, 'offer_closed');
      assert.equal(refused.body?.memo, undefined);
      assert.equal(refused.notionCalls, 0, 'no lead is written for a refused code');
    }
    for (const at of [T.open, T.lastMs]) assert.equal((await callSamplePack(prepareBody(set.id, 20 + index), at)).status, 200, `edge ${at} is open`);
    const form = await callSamplePack(formBody(set.id, 30 + index, T.ended), T.ended);
    assert.deepEqual([form.status, form.body?.error, form.notionCalls], [400, 'offer_closed', 0], 'the contact-form order is refused too');
  }
});

test('handler: after the window every other product is still sold at its usual price', async () => {
  for (const id of ['parent-pack-l1', 'holiday-reading-challenge', 'word-fossil-flashcards-l1', 'teacher-pack-l1', 'thinking-cycle-set', 'reasoning-assessment-kit']) {
    const result = await callSamplePack(prepareBody(id, 40), T.ended);
    assert.equal(result.status, 200, id);
    assert.equal(result.body?.amount, usual(id), id);
  }
});

test('webhook: a set transfer is acknowledged and logged as a set needs-review, late ones as outside_window; no sale is auto-confirmed', async () => {
  const memo = `${HOLIDAY_SETS[0].prefix}-AB12CD`;
  const inside = await callWebhook({ id: 1, transferType: 'in', content: `CK ${memo.replace('-', '')}`, transferAmount: HOLIDAY_SETS[0].saleVnd, transactionDate: '2026-12-02 14:35:00' }, T.mid);
  assert.deepEqual([inside.status, inside.memo, inside.outcome], [200, memo, 'needs_review_holiday_set']);
  const late = await callWebhook({ id: 2, transferType: 'in', content: memo, transferAmount: HOLIDAY_SETS[0].saleVnd, transactionDate: '2026-12-07 00:20:00' }, '2026-12-07T00:20:30+07:00');
  assert.deepEqual([late.status, late.outcome], [200, 'needs_review_holiday_set_outside_window']);
  const other = await callWebhook({ id: 3, transferType: 'in', content: 'PR04-AB12CD', transferAmount: 249_000, transactionDate: '2026-12-02 14:35:00' }, T.mid);
  assert.equal(other.outcome, 'needs_review', 'every other PR product keeps its existing outcome');
  assert.equal((await callWebhook({ id: 4, transferType: 'in', content: memo, transferAmount: 1 }, T.mid, 'Apikey wrong')).status, 401);
});

test('pages: the set page renders its three items and samples but no price and no buy button before the date check', async () => {
  for (const set of HOLIDAY_SETS) for (const locale of ['en', 'vi'] as const) {
    const path = locale === 'vi' ? `/vi/products/${set.id}` : `/products/${set.id}`;
    const html = await renderRoute(path);
    const main = html.slice(html.indexOf('<main'), html.indexOf('</main>') + 7);
    assert.ok(main.includes(`data-holiday-set-page="${set.id}"`), path);
    assert.ok(main.includes(holidaySetText(set.id, locale).title), `${path}: title`);
    for (const item of holidaySetComponents(set)) {
      assert.ok(main.includes(`data-holiday-item="${item.id}"`), `${path}: ${item.id} listed`);
      assert.ok(main.includes(`data-sample="${item.id}"`), `${path}: ${item.id} shows its real sample block`);
    }
    // Samples come before the price block in the document.
    assert.ok(main.indexOf('data-sample=') < main.indexOf('data-holiday-price-block'), `${path}: sample above price`);
    // The server render has no clock: no price, no buy button, no payment link, no JSON-LD.
    assert.ok(!main.includes('data-buy-now'), `${path}: no buy button in the prerender`);
    assert.ok(!main.includes(`data-price="${set.id}"`), `${path}: no price in the prerender`);
    assert.ok(!main.includes('application/ld+json'), `${path}: no JSON-LD while the date is unchecked`);
    assert.ok(!main.includes('paypal.com'), `${path}: no PayPal link in the prerender`);
    assert.ok(main.includes('data-holiday-checking'), `${path}: says the dates are being checked`);
    assert.ok(main.includes(HOLIDAY_WINDOW.label[locale]), `${path}: states the offer dates`);
  }
});

test('pages: the hub renders as it always did (the band is client-only, and shows no price)', async () => {
  for (const path of ['/products', '/vi/products']) assert.ok(!(await renderRoute(path)).includes('data-holiday-sets-band'), path);
});

test('SEO: the set pages are noindex, canonical-less, hreflang-less, out of the sitemap, and still prerendered', () => {
  for (const set of HOLIDAY_SETS) {
    const path = `/products/${set.id}`;
    const viPath = `/vi${path}`;
    assert.ok(!getExpectedPublicIndexableRoutes().includes(path) && !getExpectedPublicIndexableRoutes().includes(viPath), 'not in the sitemap route list');
    assert.ok(getPrivateOrNonIndexableRoutes().includes(path) && getPrivateOrNonIndexableRoutes().includes(viPath), 'listed as a noindex route');
    assert.ok(getPrerenderRoutes().includes(path) && getPrerenderRoutes().includes(viPath), 'prerendered with its noindex meta');
    for (const [p, locale] of [[path, 'en'], [viPath, 'vi']] as const) {
      const meta = resolveRouteMetadata(p);
      assert.equal(meta.robots, 'noindex, nofollow', p);
      assert.equal(meta.canonical, undefined, p);
      assert.deepEqual(meta.alternates ?? [], [], p);
      assert.deepEqual(meta.jsonLd ?? [], [], `${p}: no JSON-LD in the head of a noindex page`);
      assert.equal(meta.title, holidayPageSeo(set.id, locale).title);
      assert.ok(meta.title.length <= 75, `${p}: title length ${meta.title.length}`);
      assert.ok(meta.description.length <= 170, `${p}: description length ${meta.description.length}`);
    }
    assert.equal(getLocalizedPathname(path, 'vi'), viPath);
    assert.deepEqual([resolveLocalizedRoute(viPath).locale, resolveLocalizedRoute(viPath).pathname], ['vi', path]);
    assert.equal(getHolidaySetByPath(path)?.id, set.id);
  }
  assert.equal(getHolidaySetByPath('/products/teacher-pack-l1'), null);
});

test('SEO: vercel.json sends X-Robots-Tag noindex for both set pages in both languages', () => {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8')) as { headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }> };
  for (const path of HOLIDAY_SET_PATHS) for (const url of [path, `/vi${path}`]) {
    const rule = config.headers.find((entry) => new RegExp(`^${entry.source.replace(/\(.*?\)/g, (group) => `(?:${group.slice(1, -1)})`)}$`).test(url) && entry.headers.some((h) => h.key === 'X-Robots-Tag'));
    assert.ok(rule, `${url}: has an X-Robots-Tag rule`);
    assert.match(rule!.headers.find((h) => h.key === 'X-Robots-Tag')!.value, /noindex/);
  }
});

test('SEO: the sets never reach the llms catalogue, the generated sitemap inputs or any Product JSON-LD list', () => {
  const llms = readFileSync('public/llms-products.md', 'utf8');
  for (const set of HOLIDAY_SETS) assert.ok(!llms.includes(set.id), `${set.id} not in llms-products.md`);
  const structured = readFileSync('src/lib/structuredData.ts', 'utf8');
  assert.ok(!/PRODUCTS\.filter[^\n]*holiday/i.test(structured));
});

test('structured data: Product + Offer valid for both sets and both languages, dated, matching the page', () => {
  for (const set of HOLIDAY_SETS) for (const locale of ['en', 'vi'] as const) {
    const ld = createHolidaySetJsonLd(set, locale) as Record<string, any>;
    const url = `https://jurassicenglish.com${locale === 'vi' ? '/vi' : ''}/products/${set.id}`;
    assert.equal(ld['@context'], 'https://schema.org');
    assert.equal(ld['@type'], 'Product');
    assert.equal(ld.url, url);
    assert.equal(ld['@id'], `${url}#product`);
    assert.equal(ld.name, holidaySetText(set.id, locale).title);
    assert.equal(ld.sku, set.id);
    assert.match(ld.image, /^https:\/\/jurassicenglish\.com\/images\/products\/[a-z0-9-]+\.webp$/);
    assert.equal(ld.brand['@type'], 'Brand');
    assert.ok(ld.description.length > 40);
    assert.equal(ld.offers.length, 2);
    const vnd = ld.offers.find((o: any) => o.priceCurrency === 'VND');
    const usd = ld.offers.find((o: any) => o.priceCurrency === 'USD');
    assert.equal(vnd.price, String(set.saleVnd));
    assert.equal(usd.price, String(set.usd));
    assert.equal(vnd.priceSpecification.priceType, 'https://schema.org/ListPrice');
    assert.equal(vnd.priceSpecification.price, String(set.listVnd));
    for (const offer of ld.offers) {
      assert.equal(offer['@type'], 'Offer');
      assert.equal(offer.availability, 'https://schema.org/InStock');
      assert.equal(offer.validFrom, '2026-11-28');
      assert.equal(offer.priceValidUntil, '2026-12-06');
      assert.match(offer.price, /^\d+$/);
      assert.equal(offer.url, url);
    }
    JSON.parse(JSON.stringify(ld)); // serialisable, as the page embeds it
  }
});

test('links: the PayPal link carries the set id, the order code and the set US$ price; UTM source flows into the code', () => {
  for (const set of HOLIDAY_SETS) {
    const href = new URL(holidaySetPaypalHref(set, 'facebook', 'vi'));
    assert.equal(href.searchParams.get('amount'), set.usd.toFixed(2));
    assert.equal(href.searchParams.get('currency_code'), 'USD');
    assert.equal(href.searchParams.get('custom'), `${set.id}|FACEBOOK`);
    assert.match(href.searchParams.get('item_name')!, new RegExp(`${set.id} code FACEBOOK`));
    assert.equal(href.searchParams.get('return'), `https://jurassicenglish.com/vi/products/${set.id}`);
    assert.equal(new URL(holidaySetPaypalHref(set, null)).searchParams.get('custom'), `${set.id}|${set.id.toUpperCase()}`);
  }
});

test('copy: amounts and dates, never a percentage or a countdown; both languages state the window', () => {
  for (const set of HOLIDAY_SETS) for (const locale of ['en', 'vi'] as const) {
    const text = holidaySetText(set.id, locale);
    const seo = holidayPageSeo(set.id, locale);
    for (const value of [text.label, text.title, text.problem, text.inside, text.forWho, text.unit, seo.title, seo.description]) assert.ok(!/%|countdown|hurry|last chance|chỉ còn|nhanh tay/i.test(value), value);
    assert.ok(seo.description.includes(locale === 'vi' ? '28/11' : '28 November'));
  }
});

test('migration files: an up and a down file exist, are guarded, start inactive, and are marked NOT APPLIED', () => {
  const up = 'supabase/migrations/20261126000001_holiday_sets_portal_rows.sql';
  const down = 'supabase/migrations/20261126000001_holiday_sets_portal_rows_down.sql';
  assert.ok(existsSync(up) && existsSync(down));
  const upSql = readFileSync(up, 'utf8');
  const downSql = readFileSync(down, 'utf8');
  assert.match(upSql, /NOT APPLIED/);
  assert.match(downSql, /NOT APPLIED/);
  assert.match(upSql, /to_regclass\('je_commerce\.products'\)/, 'does nothing where the portal schema is absent');
  assert.match(upSql, /on conflict \(id\) do nothing/, 'never changes an existing row');
  assert.ok(!/\bupdate\s+je_commerce/i.test(upSql), 'no update of existing rows');
  for (const set of HOLIDAY_SETS) {
    assert.ok(upSql.includes(`'${set.id}'`) && downSql.includes(`'${set.id}'`));
    assert.ok(upSql.includes(String(set.saleVnd)) && upSql.includes(String(set.usd * 100)), `${set.id}: portal price = site price`);
  }
  assert.equal((upSql.match(/,\s*false\)/g) ?? []).length, 2, 'both portal rows start inactive');
  assert.ok(!/\bdrop\s+(table|schema)/i.test(downSql));
});
