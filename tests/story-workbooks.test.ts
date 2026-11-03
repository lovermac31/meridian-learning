import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import marketPricing from '../src/content/marketPricing.json';
import digitalPricing from '../src/content/digitalPricing.json';
import { PRODUCTS } from '../src/i18n/content/products';
import { MARKET_IDS, hasRegionalPrice, regionalUsd, regionalUsdRange } from '../src/lib/regionalPrice';
import { productPaypalHref, productUsd } from '../src/lib/productsSource';

// Story Workbooks L1-L5 and regional US$ prices (Jay, 3 Nov 2026).
const IDS = [1, 2, 3, 4, 5].map((n) => `story-workbooks-l${n}`);
const mainOf = (html: string) => html.slice(html.indexOf('<main'), html.indexOf('</main>') + 7);

test('five Story Workbooks cards: Families, Workbooks category, view-only sample, PayPal, Drive delivery, no ownership claim', () => {
  for (const id of IDS) {
    const p = PRODUCTS.find((entry) => entry.id === id)!;
    assert.ok(p, id);
    assert.equal(p.section, 'families'); assert.equal(p.category, 'workbooks'); assert.equal(p.href, 'zalo');
    assert.ok(p.live && p.delivery && p.paypal && p.sample === id && p.image === id, id);
    assert.equal(p.alsoIn?.section, 'teachers', `${id}: pointer from Teachers`);
    for (const locale of ['en', 'vi'] as const) {
      const text = JSON.stringify(p[locale]);
      assert.ok(!/Hungry Caterpillar|Wild Things|Giving Tree|Charlotte|Matilda/.test(text), `${id} ${locale}: no published title`);
      assert.ok(!/Matt|Goslee|co-?owner|50\/50/i.test(text), `${id} ${locale}: no ownership claim`);
    }
  }
  assert.equal(PRODUCTS.find((p) => p.id === IDS[0])!.price, '290.000₫');
  for (const id of IDS.slice(1)) assert.equal(PRODUCTS.find((p) => p.id === id)!.price, '190.000₫');
});

test('regional US$ prices: four tiers per product, rising with the approved 35:45:55:69 market tiers, default is the highest tier', () => {
  const { tiers, markets } = marketPricing;
  const digital = digitalPricing;
  assert.equal(digital.default, '4');
  for (const id of IDS) {
    assert.ok(hasRegionalPrice(id));
    const t = (digital.products as Record<string, Record<string, number>>)[id];
    const v = ['1', '2', '3', '4'].map((k) => t[k]);
    assert.deepEqual(v, [...v].sort((a, b) => a - b), `${id}: prices rise with the tier`);
    assert.ok(v.every((n) => Number.isInteger(n) && n > 0));
    const top = v[3];
    for (const [i, k] of ['1', '2', '3', '4'].entries()) {
      const ratio = tiers[k as '1'].lesson_usd / tiers['4'].lesson_usd;
      assert.ok(Math.abs(v[i] / top - ratio) < 0.08, `${id} tier ${k}: ${v[i]}/${top} vs approved ratio ${ratio.toFixed(2)}`);
    }
    assert.equal(regionalUsd(id), top, 'no market: the default (highest) tier');
    assert.equal(regionalUsd(id, 'not-a-market'), top);
    assert.deepEqual(regionalUsdRange(id), { low: v[0], high: top });
  }
  for (const id of MARKET_IDS) assert.ok(id in markets, `${id} is an approved market`);
  assert.equal(regionalUsd('story-workbooks-l2', 'india'), 5);
  assert.equal(regionalUsd('story-workbooks-l2', 'indonesia'), 7);
  assert.equal(regionalUsd('story-workbooks-l2', 'malaysia'), 8);
  assert.equal(regionalUsd('story-workbooks-l2', 'uae'), 10);
  assert.equal(regionalUsd('story-workbooks-l1', 'philippines'), 8);
  assert.equal(regionalUsd('story-workbooks-l1', 'singapore'), 15);
  assert.equal(productUsd('290.000₫', 'story-workbooks-l1', 'thailand'), 10);
  assert.equal(productUsd('190.000₫', 'student-workbook-l1', 'thailand'), 8, 'other products keep ceil(VND ÷ 25,897)');
});

test('PayPal link: the chosen market sets the amount and is named in the item and custom fields for matching', () => {
  const url = new URL(productPaypalHref('story-workbooks-l3', 'fb', 'en', 'indonesia'));
  assert.equal(url.searchParams.get('amount'), '7.00');
  assert.match(url.searchParams.get('item_name')!, / region indonesia \(Jurassic English\)$/);
  assert.match(url.searchParams.get('custom')!, /^story-workbooks-l3\|FB\|indonesia$/);
  const none = new URL(productPaypalHref('story-workbooks-l3', null));
  assert.equal(none.searchParams.get('amount'), '10.00');
  assert.ok(!/region/.test(none.searchParams.get('item_name')!) && !/\|indonesia/.test(none.searchParams.get('custom')!));
});

test('the page: a Workbooks heading in Families and Teachers, the country picker on each product page, regional range note (EN + VI)', async () => {
  const { renderRoute } = await import('../src/entry-server');
  for (const [route, heading, note] of [['/products', 'Workbooks', /Regional price: it follows each country’s price range, from US\$5 to US\$10/], ['/vi/products', 'Sách bài tập', /Giá theo khu vực/]] as const) {
    const html = mainOf(await renderRoute(route)).replaceAll('<!-- -->', '');
    const fam = html.slice(html.indexOf('<section id="families"'), html.indexOf('</section>', html.indexOf('<section id="families"')));
    const tea = html.slice(html.indexOf('<section id="teachers"'), html.indexOf('</section>', html.indexOf('<section id="teachers"')));
    for (const [name, section] of [['families', fam], ['teachers', tea]] as const) {
      assert.ok(section.includes(`id="${name}-workbooks"`) && section.includes(`>${heading}</h3>`), `${route}: Workbooks heading in ${name}`);
      assert.ok(section.indexOf(`id="${name}-workbooks"`) > section.indexOf('class="product-row'), `${route}: Workbooks come after the other cards in ${name}`);
    }
    for (const id of IDS) assert.ok(fam.includes(`id="${id}"`) && !tea.includes(`id="${id}"`), `${route}: ${id} listed once, in Families`);
    for (const id of IDS) assert.ok(tea.includes(`data-also="${id}"`), `${route}: pointer to ${id} in Teachers`);
    const page = mainOf(await renderRoute(`${route}/story-workbooks-l2`)).replaceAll('<!-- -->', '');
    assert.ok(page.includes('data-regional-select="story-workbooks-l2"'), `${route}: country picker`);
    assert.equal([...page.matchAll(/<option value="[a-z-]+"/g)].length, MARKET_IDS.length + 1, `${route}: every approved market plus another country`);
    assert.match(page, note);
    assert.match(page, /data-paypal-link="story-workbooks-l2">[^<]*US\$10/, `${route}: default US$10 before a country is chosen`);
    assert.ok(!/<a[^>]*href="[^"]*\.pdf/i.test(page), `${route}: no PDF link`);
  }
});

test('samples: three watermarked pages per level, thumbnails, text file; no PDF under public/', () => {
  for (const id of IDS) {
    for (const n of [1, 2, 3]) {
      assert.ok(existsSync(`public/samples/pages/${id}-pg0${n}.webp`) && existsSync(`public/samples/${id}-p${n}.webp`) && existsSync(`public/samples/small/${id}-p${n}.webp`), `${id} page ${n}`);
    }
    const doc = JSON.parse(readFileSync(`public/samples/pages/${id}-text.json`, 'utf8'));
    assert.equal(doc.pageCount, 3);
    assert.ok(!/answer key|Answer key|Teacher guide/i.test(JSON.stringify(doc.pages.map((p: { text: string }) => p.text))), `${id}: no answer key or teacher page in the sample`);
    assert.ok(!doc.source.file.includes('Licensed edition'), 'the full edition is never named');
  }
  const pdfs = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? pdfs(`${dir}/${e.name}`) : /\.pdf$/i.test(e.name) ? [`${dir}/${e.name}`] : []);
  assert.deepEqual(pdfs('public'), [], 'no PDF is published');
});
