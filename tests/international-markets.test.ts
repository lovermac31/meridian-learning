import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderRoute } from '../src/entry-server';
import { seoPages, isInternationalMarketPath, getInternationalAlternates } from '../src/lib/seoPages';
import { getExpectedPublicIndexableRoutes, resolveRouteMetadata } from '../src/lib/routeMetadata';
import { extractVisibleText } from '../scripts/lib/visible-text.mjs';

const origin = 'https://jurassicenglish.com';
const hubs = new Set(['/ielts-speaking-online', '/es/ielts-speaking-online', '/pt/ielts-speaking-online']);
const pages = seoPages.filter(page => isInternationalMarketPath(page.path));
const countries = pages.filter(page => !hubs.has(page.path));
const byPath = new Map(pages.map(page => [page.path, page]));
const tiers: Record<string, [number, number, number]> = {
  india: [35, 245, 29], pakistan: [35, 245, 29], bangladesh: [35, 245, 29], nigeria: [35, 245, 29], egypt: [35, 245, 29], philippines: [35, 245, 29],
  indonesia: [45, 315, 39], thailand: [45, 315, 39], colombia: [45, 315, 39], peru: [45, 315, 39], brazil: [45, 315, 39],
  malaysia: [55, 385, 49], chile: [55, 385, 49], argentina: [55, 385, 49],
  singapore: [69, 483, 59], uae: [69, 483, 59], 'saudi-arabia': [69, 483, 59],
};
const payments: Record<string, string> = {
  en: 'Prices are in US dollars. International card checkout is opening soon; until then, contact us to book.',
  es: 'Los precios están en dólares estadounidenses. El pago internacional con tarjeta estará disponible pronto; mientras tanto, contáctanos para reservar.',
  'pt-BR': 'Os preços estão em dólares americanos. O pagamento internacional com cartão estará disponível em breve; até lá, fale conosco para agendar.',
  id: 'Harga dalam dolar AS. Pembayaran kartu internasional segera tersedia; sementara itu, hubungi kami untuk memesan.',
  ms: 'Harga dalam dolar AS. Pembayaran kad antarabangsa akan dibuka tidak lama lagi; buat masa ini, hubungi kami untuk menempah.',
  th: 'ราคาเป็นดอลลาร์สหรัฐ ระบบชำระเงินด้วยบัตรระหว่างประเทศจะเปิดให้บริการเร็ว ๆ นี้ ระหว่างนี้โปรดติดต่อเราเพื่อจอง',
  ar: 'الأسعار بالدولار الأمريكي. سيتوفر الدفع الدولي بالبطاقة قريبًا؛ وحتى ذلك الحين، تواصل معنا للحجز.',
  ur: 'قیمتیں امریکی ڈالر میں ہیں۔ بین الاقوامی کارڈ ادائیگی جلد دستیاب ہوگی؛ تب تک بکنگ کے لیے ہم سے رابطہ کریں۔',
  bn: 'দাম মার্কিন ডলারে। আন্তর্জাতিক কার্ড পেমেন্ট শিগগিরই চালু হবে; ততদিন বুক করতে আমাদের সঙ্গে যোগাযোগ করুন।',
};
const labels: Record<string, string> = { en: 'English', es: 'Español', 'pt-BR': 'Português', id: 'Bahasa Indonesia', ms: 'Bahasa Melayu', th: 'ไทย', ar: 'العربية', ur: 'اردو', bn: 'বাংলা' };

function phrases(text: string) {
  const words = text.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  return new Set(words.slice(0, -4).map((_, index) => words.slice(index, index + 5).join(' ')));
}

test('three hubs and thirty country routes enter the sitemap inventory', () => {
  assert.equal(pages.length, 33);
  assert.equal(countries.length, 30);
  assert.equal(new Set(pages.map(page => page.path)).size, pages.length);
  const routes = new Set(getExpectedPublicIndexableRoutes());
  for (const page of pages) assert.ok(routes.has(page.path), page.path);
});

for (const page of pages) {
  test(`${page.path} renders localized SSR, USD prices, payment, and FAQ schema`, async () => {
    const rendered = await renderRoute(page.path);
    const visible = extractVisibleText(`<body>${rendered}</body>`);
    const metadata = resolveRouteMetadata(page.path);
    assert.match(rendered, /<main id="main-content"/);
    assert.ok(visible.includes(page.h1), page.path);
    assert.equal(metadata.htmlLang, page.locale);
    assert.equal(metadata.canonical, `${origin}${page.path}`);
    assert.ok(visible.includes('British Council') && visible.includes('IDP IELTS'), page.path);
    assert.ok(page.html.replace(/<\/?a\b[^>]*>/g, '').includes(payments[page.locale]), page.path);
    assert.match(rendered, /href="\/get-started"/);
    assert.doesNotMatch(`${page.description} ${page.html} ${JSON.stringify(page.faq)}`, /VND|VietQR|đồng/i);
    const [lesson, pack, baseline] = hubs.has(page.path) ? [35, 245, 29] : tiers[page.path.endsWith('/brasil') ? 'brazil' : page.path.split('/').at(-1)!];
    assert.ok(visible.includes(`US$${lesson}`), page.path);
    assert.ok(visible.includes(`US$${baseline}`), page.path);
    if (!hubs.has(page.path)) {
      assert.ok(visible.includes(`US$${pack}`), page.path);
      assert.match(visible, /35/);
      assert.match(visible, /15–20/);
    }
    const types = new Set(metadata.jsonLd?.map(block => block['@type']));
    for (const type of ['Service', 'FAQPage', 'BreadcrumbList']) assert.ok(types.has(type), `${page.path}: ${type}`);
    const faq = metadata.jsonLd?.find(block => block['@type'] === 'FAQPage');
    const entities = faq?.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>;
    assert.equal(entities.length, page.faq.length);
    for (const [index, item] of page.faq.entries()) {
      assert.equal(entities[index].name, item.question);
      assert.equal(entities[index].acceptedAnswer.text, item.answer);
      assert.ok(visible.includes(item.question));
      assert.ok(visible.includes(item.answer));
    }
  });
}

test('country pairs are reciprocal and unpaired countries have no hreflang', () => {
  for (const page of countries) {
    const counterpart = byPath.get(page.alternatePath);
    const alternates = getInternationalAlternates(page.path);
    assert.deepEqual(resolveRouteMetadata(page.path).alternates, alternates);
    if (!counterpart || counterpart.path === page.path) {
      assert.ok(['india', 'philippines', 'singapore', 'nigeria'].some(slug => page.path.endsWith(`/${slug}`)));
      assert.equal(page.alternatePath, page.path);
      assert.equal(alternates, undefined);
      continue;
    }
    assert.equal(counterpart.alternatePath, page.path);
    assert.equal(page.counterpartLanguageLabel, labels[counterpart.locale]);
    const english = page.locale === 'en' ? page : counterpart;
    assert.deepEqual(alternates?.map(alt => alt.hrefLang), ['en', page.locale === 'en' ? counterpart.locale : page.locale, 'x-default']);
    assert.equal(alternates?.[2].href, `${origin}${english.path}`);
    assert.deepEqual(alternates, getInternationalAlternates(counterpart.path));
  }
});

test('the English hub links all five English Latin American pages', () => {
  const hub = byPath.get('/ielts-speaking-online')!;
  for (const slug of ['colombia', 'peru', 'chile', 'argentina', 'brazil']) assert.ok(hub.html.includes(`href="/ielts-speaking-online/${slug}"`));
});

test('prerendered routes carry html lang, rtl direction, and sitemap alternates', () => {
  if (!fs.existsSync('dist/sitemap.xml')) return;
  const sitemap = fs.readFileSync('dist/sitemap.xml', 'utf8');
  for (const page of pages) {
    const file = `dist${page.path}/index.html`;
    assert.ok(fs.existsSync(file), file);
    const html = fs.readFileSync(file, 'utf8');
    assert.ok(html.includes(`<html lang="${page.locale}"${['ar', 'ur'].includes(page.locale) ? ' dir="rtl"' : ''}>`), page.path);
    assert.ok(html.includes(`<link rel="canonical" href="${origin}${page.path}"`), page.path);
    assert.ok(html.includes(page.h1), page.path);
    const xmlEntry = sitemap.match(new RegExp(`<url>\\s*<loc>${origin}${page.path}</loc>[\\s\\S]*?</url>`))?.[0];
    assert.ok(xmlEntry, page.path);
    for (const alt of getInternationalAlternates(page.path) ?? []) {
      assert.ok(html.includes(`hreflang="${alt.hrefLang}" href="${alt.href}"`), page.path);
      assert.ok(xmlEntry.includes(`hreflang="${alt.hrefLang}" href="${alt.href}"`), page.path);
    }
  }
});

test('country copy within each language shares fewer than 40% of five-word phrases', () => {
  for (const leftPage of countries) for (const rightPage of countries) {
    if (leftPage.path >= rightPage.path || leftPage.locale !== rightPage.locale) continue;
    const left = phrases(extractVisibleText(`<body>${leftPage.html}</body>`));
    const right = phrases(extractVisibleText(`<body>${rightPage.html}</body>`));
    const shared = [...left].filter(phrase => right.has(phrase)).length;
    assert.ok(shared / Math.min(left.size, right.size) < 0.4, `${leftPage.path} / ${rightPage.path}: ${shared / Math.min(left.size, right.size)}`);
  }
});

test('Nigeria focuses on purpose-specific thresholds without a weak-Speaking claim', () => {
  const nigeria = byPath.get('/ielts-speaking-online/nigeria')!;
  assert.match(nigeria.html, /NMC nursing registration/);
  assert.match(nigeria.html, /Speaking 7/);
  assert.doesNotMatch(nigeria.html, /Speaking (?:is|as) (?:a )?weak/i);
});

test('Spanish and Portuguese country search intent retains source labels', () => {
  for (const page of countries.filter(item => item.locale === 'es')) assert.ok(page.h1.startsWith('Examen IELTS'), page.path);
  for (const slug of ['peru', 'chile', 'argentina']) {
    const page = byPath.get(`/es/ielts-speaking-online/${slug}`)!;
    assert.match(page.html, /primera lengua/);
    assert.match(page.html, /6,61/);
    assert.match(page.html, /ielts-test-taker-performance-data-2024-2025\.xlsx/);
  }
  const brazil = byPath.get('/pt/ielts-speaking-online/brasil')!;
  assert.match(brazil.h1, /aulas de inglês online para o IELTS/);
  assert.match(brazil.html, /primeira língua/);
  assert.match(brazil.html, /6,89/);
});
