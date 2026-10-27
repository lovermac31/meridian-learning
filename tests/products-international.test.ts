import test from 'node:test';
import assert from 'node:assert/strict';
import { renderRoute } from '../src/entry-server';
import { seoPages, isInternationalMarketPath } from '../src/lib/seoPages';
import { orderCode } from '../src/lib/productsSource';

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
