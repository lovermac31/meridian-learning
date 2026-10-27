import test from 'node:test';
import assert from 'node:assert/strict';
import { renderRoute } from '../src/entry-server';
import { seoPages, isInternationalMarketPath } from '../src/lib/seoPages';
import { orderCode, productPaypalHref } from '../src/lib/productsSource';
import { PRODUCTS } from '../src/i18n/content/products';

// Overseas buyers (master, 27 Oct 2026; Sale Team visibility-me-asia/campaign/03): every country page links the
// Baseline sample report on /products (S3), tagged utm_source=market-<country> before the # (S2).
const amp = (s: string) => s.replaceAll('&amp;', '&');
const hubs = new Set(['/ielts-speaking-online', '/es/ielts-speaking-online', '/pt/ielts-speaking-online']);
const pages = seoPages.filter((page) => isInternationalMarketPath(page.path));
const slug = (path: string) => { const s = path.split('/').filter(Boolean).at(-1)!; return s === 'brasil' ? 'brazil' : s; };
const NO_PAYPAL = new Set(['pakistan', 'bangladesh']);

test('S2 + S3: every country page links the Baseline sample once, tagged market-<country> before the #; hubs do not', async () => {
  assert.equal(pages.length, 33);
  let countries = 0;
  for (const page of pages) {
    const html = amp(await renderRoute(page.path));
    const samples = [...html.matchAll(/<a href="([^"]+)" data-link="market-sample">/g)].map((m) => m[1]);
    // The page's own content (the header Baseline button and the footer link are site chrome, not market links).
    const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
    const productLinks = [...main.matchAll(/href="(\/products[^"]*)"/g)].map((m) => m[1]);
    if (hubs.has(page.path)) {
      assert.deepEqual(samples, [], page.path);
      continue;
    }
    countries += 1;
    const market = slug(page.path);
    assert.deepEqual(samples, [`/products?utm_source=market-${market}#baseline-sample`], page.path);
    assert.deepEqual(productLinks, samples, `${page.path}: every /products link is tagged, utm before the #`);
    // Beside the PayPal options where the page takes PayPal; under the hero buttons where it does not.
    const pay = html.indexOf('<section id="pay"');
    const at = html.indexOf('data-link="market-sample"');
    if (NO_PAYPAL.has(market)) {
      assert.equal(pay, -1, page.path);
      assert.ok(at > html.indexOf('class="insights-teacher"') && at < html.indexOf('</header>'), `${page.path}: in the hero`);
    } else {
      assert.ok(pay > 0 && at > html.lastIndexOf('insights-paypal-option', at) && at < html.indexOf('</section>', pay), `${page.path}: inside #pay, after the options`);
    }
  }
  assert.equal(countries, 30);
});

test('S3: the link text is in the page language and says when /products is in English', async () => {
  const expected: Record<string, string> = {
    '/ielts-speaking-online/uae': 'See a sample report first',
    '/es/ielts-speaking-online/colombia': 'Mira primero un informe de muestra (en inglés)',
    '/pt/ielts-speaking-online/brasil': 'Veja primeiro um relatório de exemplo (em inglês)',
    '/id/ielts-speaking-online/indonesia': 'Lihat contoh laporan dulu (bahasa Inggris)',
    '/ms/ielts-speaking-online/malaysia': 'Lihat contoh laporan dahulu (bahasa Inggeris)',
    '/th/ielts-speaking-online/thailand': 'ดูตัวอย่างรายงานก่อน (ภาษาอังกฤษ)',
    '/bn/ielts-speaking-online/bangladesh': 'আগে একটি নমুনা রিপোর্ট দেখুন (ইংরেজিতে)',
  };
  for (const [path, text] of Object.entries(expected)) {
    const html = amp(await renderRoute(path));
    const link = html.match(/<a href="[^"]+" data-link="market-sample">(.*?)<\/a>/)![1];
    assert.equal(link.replace(/<[^>]+>/g, '').replace(/\s*→$/, ''), text, path);
  }
  for (const path of ['/ar/ielts-speaking-online/uae', '/ur/ielts-speaking-online/pakistan']) {
    const html = (await renderRoute(path)).replaceAll('<!-- -->', '');
    assert.match(html, /data-link="market-sample"><span>.*?<\/span> ←<\/a>/, `${path}: RTL text isolated, arrow pointing left`);
  }
});

test('market order codes: the Sale Team table maps each market-<country> source to its code', () => {
  const table: Record<string, string> = {
    'market-uae': 'MAE', 'market-saudi-arabia': 'MSA', 'market-egypt': 'MEG', 'market-india': 'MIN', 'market-pakistan': 'MPK',
    'market-bangladesh': 'MBD', 'market-philippines': 'MPH', 'market-indonesia': 'MID', 'market-malaysia': 'MMY',
    'market-thailand': 'MTH', 'market-singapore': 'MSG',
  };
  for (const [source, code] of Object.entries(table)) assert.equal(orderCode(source, 'teacher-pack-l1'), code, source);
  assert.equal(orderCode('market-colombia', 'teacher-pack-l1'), 'MARKET-COLOMBIA', 'a market not in the table shows its source');
});

// S1 (master decision (a), 27 Oct 2026): a direct PayPal payment per digital card at Jay's approved US$ price.
const USD: Record<string, number> = {
  'printable-pack': 6, 'parent-pack-l1': 10, 'teacher-pack-l1': 27, 'teacher-pack-l2': 27, 'teacher-pack-l3': 27, 'teacher-pack-l4': 27,
  'teacher-pack-l5': 27, 'teacher-bundle': 112, 'student-workbook-l1': 8, 'thinking-cycle-set': 19, 'reasoning-assessment-kit': 16,
  'ielts-speaking-ladder': 16, 'teacher-training-course': 58, 'pilot-class-kit': 27, 'curriculum-overview': 12,
};

test('S1: the 13 digital cards take PayPal at the approved US$ prices; the Centre Licence and live services do not', () => {
  assert.deepEqual(PRODUCTS.filter((p) => p.paypal).map((p) => p.id), Object.keys(USD));
  assert.ok(!PRODUCTS.find((p) => p.id === 'centre-licence')!.paypal, 'the Centre Licence stays on Zalo');
  for (const p of PRODUCTS.filter((entry) => entry.paypal)) {
    assert.ok(p.delivery && p.href === 'zalo', `${p.id}: a digital card ordered on Zalo`);
    const url = new URL(productPaypalHref(p.id, null));
    assert.equal(`${url.origin}${url.pathname}`, 'https://www.paypal.com/cgi-bin/webscr');
    const q = Object.fromEntries(url.searchParams);
    assert.equal(q.cmd, '_xclick');
    assert.equal(q.business, 'XW7RP68VVPZP2');
    assert.equal(q.currency_code, 'USD');
    assert.equal(q.amount, `${USD[p.id]}.00`, `${p.id}: US$${USD[p.id]} = ceil(${p.price} ÷ 25,897)`);
    assert.equal(q.item_name, `${p.en.title} - /products ${p.id} code ${p.id.toUpperCase()} (Jurassic English)`);
    assert.equal(q.custom, `${p.id}|${p.id.toUpperCase()}`, `${p.id}: card id and code for matching`);
  }
  const fb = Object.fromEntries(new URL(productPaypalHref('teacher-pack-l1', 'fb-teachers')).searchParams);
  assert.equal(fb.custom, 'teacher-pack-l1|FBT');
  assert.match(fb.item_name, / code FBT \(Jurassic English\)$/);
});

test('S1: each PayPal card shows the US$ option after the VND order button, with Drive delivery within 24 hours (EN + VI)', async () => {
  for (const [route, pay, note] of [
    ['/products', 'Pay US$', 'Your files arrive by Google Drive within 24 hours'],
    ['/vi/products', 'Thanh toán US$', 'Tài liệu được gửi qua Google Drive trong vòng 24 giờ'],
  ] as const) {
    const html = amp((await renderRoute(route)).replaceAll('<!-- -->', ''));
    assert.deepEqual([...html.matchAll(/data-paypal="([^"]+)"/g)].map((m) => m[1]), Object.keys(USD), route);
    for (const id of Object.keys(USD)) {
      const card = html.slice(html.indexOf(`id="${id}"`), html.indexOf('</li>', html.indexOf(`id="${id}"`)));
      assert.ok(card.indexOf(`data-cta="product-${id}"`) < card.indexOf(`data-paypal="${id}"`), `${route} ${id}: VND first`);
      const link = card.match(/<a href="([^"]+)" target="_blank" rel="noopener noreferrer"[^>]*data-paypal-link="[^"]+">([^<]+)</)!;
      assert.ok(link[1].startsWith('https://www.paypal.com/cgi-bin/webscr?cmd=_xclick'), `${route} ${id}`);
      assert.ok(link[2].startsWith(`${pay}${USD[id]} `), `${route} ${id}: ${link[2]}`);
      assert.ok(card.includes(note), `${route} ${id}: delivery promise`);
      assert.equal([...card.matchAll(/data-cta="/g)].length, 1, `${route} ${id}: still one CTA`);
    }
    assert.ok(!html.slice(html.indexOf('id="centre-licence"'), html.indexOf('</li>', html.indexOf('id="centre-licence"'))).includes('data-paypal='), `${route}: no PayPal on the Centre Licence`);
  }
});
