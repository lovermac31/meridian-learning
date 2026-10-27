import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getLocalizedPathname, resolveLocalizedRoute } from '../src/i18n/routing';
import { isPublicContentReleased } from '../src/i18n/content';
import { getExpectedPublicIndexableRoutes, resolveRouteMetadata } from '../src/lib/routeMetadata';
import { PRODUCTS_ZALO, productsContent } from '../src/i18n/content/products';
import { Footer } from '../src/components/Footer';
import { setServerLocation } from '../src/lib/ssrLocation';

// /products (P-1, Jay 27 Oct 2026), built on the JE Page Infrastructure Standard: one hub, audience sections with
// anchors, cards with one CTA each, EN/VI twins, utm_source=products on every outbound link (query before #).
const EN = '/products';
const VI = '/vi/products';
const mainOf = (html: string) => html.slice(html.indexOf('<main'), html.indexOf('</main>') + 7);
const amp = (s: string) => s.replaceAll('&amp;', '&');

const EXPECTED: Record<string, [string, string][]> = {
  families: [['story-club', '590.000₫'], ['baseline', '690.000₫'], ['one-to-one', '800.000₫'], ['printable-pack', '149.000₫']],
  teachers: [
    ['teacher-pack', '690.000₫'], ['teacher-pack-l2', '690.000₫'], ['teacher-pack-l3', '690.000₫'], ['teacher-pack-l4', '690.000₫'],
    ['teacher-pack-l5', '690.000₫'], ['teacher-bundle', '2.900.000₫'], ['thinking-cycle-set', '490.000₫'],
    ['reasoning-assessment-kit', '390.000₫'], ['ielts-speaking-ladder', '390.000₫'],
  ],
  centres: [['centre-licence', '4.900.000₫'], ['teacher-training-course', '1.490.000₫'], ['pilot-class-kit', '690.000₫'], ['curriculum-overview', '290.000₫']],
};
// Cards render only while their entry is live. The factory-built packs stay off the page until their 00 READ ME
// says "Cleared" (master, 27 Oct 2026).
const LIVE = new Set(Object.values(EXPECTED).flat().map(([id]) => id));
const SHOWN: Record<string, [string, string][]> = Object.fromEntries(
  Object.entries(EXPECTED).map(([section, cards]) => [section, cards.filter(([id]) => LIVE.has(id))]),
);

test('the products hub is released, indexable and paired EN/VI', () => {
  assert.equal(isPublicContentReleased(EN, 'vi'), true);
  assert.equal(getLocalizedPathname(EN, 'vi'), VI);
  assert.equal(resolveLocalizedRoute(VI).pathname, EN);
  const routes = getExpectedPublicIndexableRoutes();
  for (const route of [EN, VI]) {
    assert.ok(routes.includes(route), route);
    const m = resolveRouteMetadata(route);
    assert.equal(m.robots, 'index, follow');
    assert.equal(m.alternates?.find((a) => a.hrefLang === 'vi')?.href, `https://jurassicenglish.com${VI}`);
  }
});

test('sections in order, each card with its price and exactly one CTA', async () => {
  const { renderRoute } = await import('../src/entry-server');
  for (const route of [EN, VI]) {
    const main = amp(mainOf(await renderRoute(route)));
    const order = [...main.matchAll(/<section id="(families|teachers|centres)"/g)].map((m) => m[1]);
    assert.deepEqual(order, ['families', 'teachers', 'centres'], route);
    for (const [section, cards] of Object.entries(SHOWN)) {
      const start = main.indexOf(`<section id="${section}"`);
      const block = main.slice(start, main.indexOf('</section>', start));
      const ids = [...block.matchAll(/<li [^>]*id="([^"]+)"/g)].map((m) => m[1]);
      assert.deepEqual(ids, cards.map(([id]) => id), `${route} ${section}`);
      for (const [id, price] of cards) {
        const card = block.slice(block.indexOf(`id="${id}"`), block.indexOf('</li>', block.indexOf(`id="${id}"`)));
        assert.equal([...card.matchAll(/data-cta=/g)].length, 1, `${route} ${id}: one CTA`);
        assert.ok(card.includes(`data-price="${id}">${price}<`), `${route} ${id}: ${price}`);
      }
    }
  }
});

test('every link carries utm_source=products before any #anchor, in the page language', async () => {
  const { renderRoute } = await import('../src/entry-server');
  const expected = {
    [EN]: { 'story-club': '/story-club?utm_source=products', baseline: '/ai-speaking/baseline?utm_source=products', 'one-to-one': '/ai-speaking/lessons?utm_source=products' },
    [VI]: { 'story-club': '/vi/story-club?utm_source=products', baseline: '/ai-speaking/baseline?lang=vi&utm_source=products', 'one-to-one': '/ai-speaking/vi/lessons?utm_source=products' },
  };
  for (const route of [EN, VI]) {
    const main = amp(mainOf(await renderRoute(route)));
    const ctas = Object.fromEntries([...main.matchAll(/href="([^"]+)"[^>]*data-cta="product-([^"]+)"/g)].map((m) => [m[2], m[1]]));
    for (const [id, href] of Object.entries(expected[route])) assert.equal(ctas[id], href, `${route} ${id}`);
    for (const id of ['printable-pack', ...SHOWN.teachers.map(([cardId]) => cardId), ...SHOWN.centres.map(([cardId]) => cardId)]) assert.equal(ctas[id], PRODUCTS_ZALO, `${route} ${id}`);
    assert.equal(PRODUCTS_ZALO, 'https://zalo.me/84396085076?utm_source=products');
    // Every link in the page body (back link, cards, closing CTA) is tagged, except the language switch and the sample
    // PDFs (files on this site, not page links).
    const counterpart = route === EN ? VI : EN;
    for (const [, href] of main.matchAll(/href="([^"]+)"/g)) {
      if (href === counterpart || /^\/samples\/[^/?#]+-sample\.pdf$/.test(href)) continue;
      assert.match(href, /[?&]utm_source=products(#|$)/, `${route}: ${href}`);
      assert.ok(!/#[^?]*\?/.test(href), `${route}: query before the anchor in ${href}`);
    }
    assert.ok(!main.includes('centres/level-1'), `${route}: the unlisted centre page stays unlinked until #184 merges`);
  }
});

test('digital products state payment and delivery; the Teacher Pack names no published book', async () => {
  const { renderRoute } = await import('../src/entry-server');
  for (const [route, line] of [
    [EN, 'Pay by VietQR after a written order summary; your files arrive by Google Drive within 24 hours.'],
    [VI, 'Thanh toán qua VietQR sau khi nhận bản tóm tắt đơn hàng; tài liệu được gửi qua Google Drive trong vòng 24 giờ.'],
  ]) {
    const main = mainOf(await renderRoute(route));
    const delivered = [...main.matchAll(/data-delivery="([^"]+)">([^<]+)</g)];
    assert.deepEqual(delivered.map((m) => m[1]), ['printable-pack', ...SHOWN.teachers.map(([id]) => id), ...SHOWN.centres.map(([id]) => id)], route);
    for (const m of delivered) assert.equal(m[2], line, route);
    const html = await renderRoute(route);
    for (const name of ['Wild Things', 'Giving Tree', 'Snowy Day', 'Sylvester', 'Stellaluna', 'Frog and Toad', 'Owl at Home', 'Rumphius', 'Sneetches', 'Frederick', 'Hungry Caterpillar']) {
      assert.ok(!html.includes(name), `${route}: "${name}"`);
    }
  }
  assert.match(productsContent.en.sections[1].cards[0].forWho, /10 widely available picture books the teacher provides/);
  // Lines aligned to the live pages: no Baseline fee-credit promise, and 1-to-1 lessons are with Mr. Jay's team.
  // The only credit on the page is the one Jay approved (27 Oct): the Curriculum Overview against a Centre Licence.
  for (const c of Object.values(productsContent)) {
    const cards = c.sections.flatMap((s) => s.cards);
    const credited = cards.filter((card) => /credited|trừ vào/i.test(JSON.stringify(card))).map((card) => card.id);
    assert.deepEqual(credited, ['curriculum-overview']);
    assert.match(cards.find((card) => card.id === 'curriculum-overview')!.unit, /Centre Licence|Giấy phép Trung tâm/);
    assert.match(cards.find((card) => card.id === 'one-to-one')!.title, /Mr\. Jay’s team|đội ngũ của thầy Jay/);
  }
});

test('cleared packs match their 00 READ MEs: Ladder is 18 lessons + a 1-lesson Starter, no deck, all five curriculum models', async () => {
  const { PRODUCTS } = await import('../src/i18n/content/products');
  const entry = (id: string) => PRODUCTS.find((p) => p.id === id)!;
  for (const locale of ['en', 'vi'] as const) {
    const ladder = entry('ielts-speaking-ladder')[locale];
    assert.match(ladder.inside, /^18 /, locale);
    assert.match(ladder.inside, /One-to-One Starter.*149\.000₫/, locale);
    assert.match(ladder.unit, /One-to-One Starter 490\.000₫/, locale);
    assert.doesNotMatch(entry('teacher-training-course')[locale].inside, /deck|slide|trình chiếu|30/i, locale);
    assert.doesNotMatch(entry('curriculum-overview')[locale].inside, /1–4/, locale);
  }
  assert.equal(entry('ielts-speaking-ladder').price, '390.000₫');
});

test('reachable without clutter: one footer link (EN + VI) and one Kids Academy card link; no header change', () => {
  for (const [path, href, label] of [['/', '/products', 'Products'], ['/vi', '/vi/products', 'Sản phẩm']]) {
    setServerLocation(path);
    const footer = renderToStaticMarkup(createElement(Footer, { onNavigate: () => {} }));
    assert.equal([...footer.matchAll(/href="\/(vi\/)?products"/g)].length, 1, path);
    assert.match(footer, new RegExp(`href="${href}"[^>]*>${label}<`), path);
  }
  const academy = readFileSync('docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing/src/components/student-academy/StudentAcademyOverhaul.tsx', 'utf8');
  assert.equal((academy.match(/\/products\?utm_source=academy/g) ?? []).length, 1);
  assert.equal((academy.match(/data-link="academy-products"/g) ?? []).length, 1);
  // The header links /products only through the Baseline sample (Jay, 27 Oct 2026; tested below).
  assert.equal((readFileSync('src/components/Navbar.tsx', 'utf8').match(/PRODUCTS_PATH/g) ?? []).length, 2, 'header: Baseline sample only');
});

// More products are coming (Teacher Packs L2–5, a bundle): the cards come from one list, so a new card is one entry.
test('cards are data-driven from PRODUCTS; a product image shows as a square when the entry has one', async () => {
  const { PRODUCTS, productsPage } = await import('../src/i18n/content/products');
  const { ProductsPage } = await import('../src/components/ProductsPage');
  for (const locale of ['en', 'vi'] as const) {
    const ids = productsPage(locale).sections.flatMap((s) => s.cards.map((c) => c.id));
    assert.deepEqual(ids, PRODUCTS.filter((p) => p.live).map((p) => p.id), `${locale}: every live entry is a card, in list order`);
  }
  // Each image an entry names exists in public/images/products.
  for (const p of PRODUCTS.filter((entry) => entry.image)) readFileSync(`public/images/products/${p.image}.webp`);

  // One new entry → one new card in its section, with its image slot.
  const extra = {
    id: 'test-extra', live: true, section: 'teachers' as const, price: '1.000₫', href: 'zalo', delivery: true, image: 'teacher-bundle',
    en: { label: 'L', title: 'Extra pack', problem: 'P', inside: 'I', forWho: 'F', unit: 'one-time', cta: 'Order on Zalo' },
    vi: { label: 'L', title: 'Gói thêm', problem: 'P', inside: 'I', forWho: 'F', unit: 'mua một lần', cta: 'Đặt mua qua Zalo' },
  };
  PRODUCTS.push(extra);
  try {
    setServerLocation(EN);
    const html = renderToStaticMarkup(createElement(ProductsPage, { locale: 'en' }));
    const teachers = html.slice(html.indexOf('<section id="teachers"'), html.indexOf('</section>', html.indexOf('<section id="teachers"')));
    assert.deepEqual([...teachers.matchAll(/<li [^>]*id="([^"]+)"/g)].map((m) => m[1]), [...SHOWN.teachers.map(([id]) => id), 'test-extra']);
    assert.match(teachers, /<img src="\/images\/products\/teacher-bundle\.webp" alt="" width="480" height="480"[^>]*aspect-square[^>]*data-product-image="test-extra"/);
    assert.equal([...html.matchAll(/data-product-image=/g)].length, PRODUCTS.filter((p) => p.live && p.image).length);
  } finally {
    PRODUCTS.pop();
  }
});

test('the ChatGPT product images are on their cards, square and light', async () => {
  const expected: Record<string, string> = {
    'story-club': 'story-club', baseline: 'baseline', 'one-to-one': 'one-to-one', 'printable-pack': 'printable-pack-l1',
    'teacher-pack': 'teacher-pack-l1', 'teacher-pack-l2': 'teacher-pack-l2', 'teacher-pack-l3': 'teacher-pack-l3',
    'teacher-pack-l4': 'teacher-pack-l4', 'teacher-pack-l5': 'teacher-pack-l5', 'teacher-bundle': 'teacher-bundle',
    'thinking-cycle-set': 'thinking-cycle-set',
    'reasoning-assessment-kit': 'reasoning-assessment-kit', 'ielts-speaking-ladder': 'ielts-speaking-ladder',
    'centre-licence': 'centre-licence', 'teacher-training-course': 'teacher-training-course',
    'pilot-class-kit': 'pilot-class-kit', 'curriculum-overview': 'curriculum-overview',
  };
  for (const locale of ['en', 'vi'] as const) {
    setServerLocation(locale === 'en' ? EN : VI);
    const cards = productsContent[locale].sections.flatMap((s) => s.cards);
    assert.deepEqual(Object.fromEntries(cards.filter((c) => c.image).map((c) => [c.id, c.image])), expected, locale);
  }
  const { PRODUCTS } = await import('../src/i18n/content/products');
  // Every product, live or hidden, has its own image, so flipping live needs no image work.
  for (const p of PRODUCTS) assert.ok(p.image, `${p.id} has an image`);
  assert.equal(new Set(PRODUCTS.map((p) => p.image)).size, PRODUCTS.length, 'no two products share an image');
  for (const name of new Set(PRODUCTS.map((p) => p.image).filter(Boolean) as string[])) {
    const file = readFileSync(`public/images/products/${name}.webp`);
    assert.equal(file.subarray(0, 4).toString(), 'RIFF', `${name} is a WebP`);
    assert.ok(file.length < 160_000, `${name}: ${file.length} bytes`);
  }
});

test('packs marked live: false stay in the data but off the page; all 17 are cleared as of 27 Oct', async () => {
  const { PRODUCTS } = await import('../src/i18n/content/products');
  const { renderRoute } = await import('../src/entry-server');
  for (const p of PRODUCTS) assert.equal(typeof p.live, 'boolean', `${p.id}: live is set`);
  const hidden = PRODUCTS.filter((p) => !p.live).map((p) => p.id);
  // Cleared 27 Oct (Drive 00 READ MEs) and live once Jay approves the prices: L2–5 Teacher Packs, the Complete Teacher
  // Bundle and factory B's six packs. A future pack can still ship hidden with live: false.
  assert.deepEqual(hidden, []);
  for (const route of [EN, VI]) {
    const html = await renderRoute(route);
    for (const id of hidden) assert.ok(!html.includes(`id="${id}"`) && !html.includes(`product-${id}`), `${route}: ${id} hidden`);
  }
});

// "See a sample" (Jay, 27 Oct 2026: everybody sees a sample before a price or a booking). The factories name the files
// by these stems (master's SAMPLES-AND-BRANDED-PDF-SPEC): public/samples/<stem>-sample.pdf and <stem>-p1..p3.webp.
const SAMPLE_STEMS: Record<string, string> = {
  'story-club': 'story-club', baseline: 'baseline', 'one-to-one': 'one-to-one', 'printable-pack': 'printable-pack-l1',
  'teacher-pack': 'teacher-pack-l1', 'teacher-pack-l2': 'teacher-pack-l2', 'teacher-pack-l3': 'teacher-pack-l3',
  'teacher-pack-l4': 'teacher-pack-l4', 'teacher-pack-l5': 'teacher-pack-l5', 'teacher-bundle': 'teacher-bundle',
  'thinking-cycle-set': 'thinking-cycle-set', 'reasoning-assessment-kit': 'reasoning-assessment-kit',
  'ielts-speaking-ladder': 'ielts-speaking-ladder', 'centre-licence': 'centre-licence',
  'teacher-training-course': 'teacher-training-course', 'pilot-class-kit': 'pilot-class-kit', 'curriculum-overview': 'curriculum-overview',
};
const SAMPLE_FILE = /^(.+)-(sample\.pdf|p[123]\.webp)$/;

test('samples: every sample stem is wired to its four files in public/samples, and every file to a product', async () => {
  const { PRODUCTS } = await import('../src/i18n/content/products');
  assert.deepEqual(Object.keys(SAMPLE_STEMS).sort(), PRODUCTS.map((p) => p.id).sort(), 'one stem per product');
  for (const p of PRODUCTS.filter((entry) => entry.sample)) assert.equal(p.sample, SAMPLE_STEMS[p.id], `${p.id}: stem from the spec`);
  const files = existsSync('public/samples') ? readdirSync('public/samples').filter((f) => !f.startsWith('.')) : [];
  for (const file of files) assert.match(file, SAMPLE_FILE, `public/samples/${file}`);
  const onDisk = [...new Set(files.map((file) => file.match(SAMPLE_FILE)![1]))].sort();
  assert.deepEqual(onDisk, PRODUCTS.filter((p) => p.sample).map((p) => p.sample!).sort(), 'files in public/samples ↔ products with a sample');
  for (const stem of onDisk) {
    const pdf = readFileSync(`public/samples/${stem}-sample.pdf`);
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-', `${stem}: PDF`);
    assert.ok(pdf.length <= 3 * 1024 * 1024, `${stem}: PDF ≤ 3 MB (${pdf.length})`);
    for (const n of [1, 2, 3]) {
      const page = readFileSync(`public/samples/${stem}-p${n}.webp`);
      assert.equal(page.subarray(8, 12).toString(), 'WEBP', `${stem}-p${n}: WebP`);
      assert.ok(page.length < 80 * 1024, `${stem}-p${n}: < 80 KB (${page.length})`);
    }
  }
});

test('samples: the block sits above the price and order button, one link to the PDF with three page thumbnails', async () => {
  const { PRODUCTS } = await import('../src/i18n/content/products');
  const { ProductsPage } = await import('../src/components/ProductsPage');
  const set = (ids: string[]) => {
    const before = new Map(PRODUCTS.map((p) => [p.id, p.sample]));
    for (const p of PRODUCTS) if (ids.includes(p.id)) p.sample = SAMPLE_STEMS[p.id];
    return () => { for (const p of PRODUCTS) p.sample = before.get(p.id); };
  };
  // Hidden until wired: a card without a sample shows no block.
  for (const [locale, route] of [['en', EN], ['vi', VI]] as const) {
    setServerLocation(route);
    const html = renderToStaticMarkup(createElement(ProductsPage, { locale }));
    assert.equal([...html.matchAll(/data-sample="/g)].length, PRODUCTS.filter((p) => p.live && p.sample).length, locale);
  }
  const restore = set(['baseline', 'teacher-pack']);
  try {
    for (const [locale, route, heading, open] of [['en', EN, 'See a sample', 'Open the sample (PDF)'], ['vi', VI, 'Xem mẫu', 'Mở bản mẫu (PDF)']] as const) {
      setServerLocation(route);
      const html = renderToStaticMarkup(createElement(ProductsPage, { locale }));
      const shown = [...html.matchAll(/data-sample="([^"]+)"/g)].map((m) => m[1]);
      assert.deepEqual(shown, PRODUCTS.filter((p) => p.live && p.sample).map((p) => p.id), locale);
      for (const id of ['baseline', 'teacher-pack']) assert.ok(shown.includes(id), `${locale}: ${id} sample shown`);
      for (const [id, stem] of [['baseline', 'baseline'], ['teacher-pack', 'teacher-pack-l1']]) {
        const card = html.slice(html.indexOf(`id="${id}"`), html.indexOf('</li>', html.indexOf(`id="${id}"`)));
        const at = (marker: string) => card.indexOf(marker);
        assert.ok(at('</dl>') < at(`data-sample="${id}"`) && at(`data-sample="${id}"`) < at(`data-price="${id}"`), `${locale} ${id}: after the text, before the price`);
        assert.ok(at(`data-price="${id}"`) < at(`data-cta="product-${id}"`), `${locale} ${id}: price before the order button`);
        assert.match(card, new RegExp(`<div id="${id}-sample" class="[^"]*scroll-mt-24`), `${locale} ${id}: anchor clears the fixed header`);
        assert.ok(card.includes(`>${heading}<`), `${locale} ${id}: heading`);
        const links = [...card.matchAll(/<a [^>]*data-sample-link="[^"]+"[^>]*>/g)].map((m) => m[0]);
        assert.equal(links.length, 1, `${locale} ${id}: one sample link`);
        assert.match(links[0], new RegExp(`href="/samples/${stem}-sample\\.pdf" target="_blank" rel="noopener noreferrer"`), `${locale} ${id}`);
        const label = links[0].match(/aria-label="([^"]+)"/)![1];
        assert.ok(label.startsWith(`${open}: `) && label.length > open.length + 2, `${locale} ${id}: accessible name starts with the visible text`);
        assert.ok(card.includes(`>${open}</span>`), `${locale} ${id}: visible link text`);
        assert.deepEqual([...card.matchAll(/<img src="([^"]+)" alt="" width="600" height="849"[^>]*data-sample-page=/g)].map((m) => m[1]),
          [1, 2, 3].map((n) => `/samples/${stem}-p${n}.webp`), `${locale} ${id}: three thumbnails`);
        assert.equal([...card.matchAll(/data-cta="/g)].length, 1, `${locale} ${id}: still one CTA`);
      }
    }
  } finally {
    restore();
  }
});

test('samples: the header "Book Baseline" leads to the Baseline sample once it exists, else to the booking page', async () => {
  const { PRODUCTS } = await import('../src/i18n/content/products');
  const { Navbar } = await import('../src/components/Navbar');
  const noop = () => {};
  const headerHrefs = (path: string) => {
    setServerLocation(path);
    const html = renderToStaticMarkup(createElement(Navbar, {
      onGetStarted: noop, onNavigateHome: noop, onNavigate: noop, onPricingClick: noop, onEducationAffiliateClick: noop,
    }));
    setServerLocation('/');
    return [...html.matchAll(/<a href="([^"]+)"[^>]*class="inline-flex min-h-11/g)].map((m) => m[1]);
  };
  const baseline = PRODUCTS.find((p) => p.id === 'baseline')!;
  const before = baseline.sample;
  try {
    baseline.sample = undefined;
    assert.deepEqual(headerHrefs('/'), ['/ai-speaking/baseline']);
    assert.deepEqual(headerHrefs('/vi'), ['/ai-speaking/baseline?lang=vi']);
    baseline.sample = 'baseline';
    assert.deepEqual(headerHrefs('/'), ['/products#baseline-sample']);
    assert.deepEqual(headerHrefs('/vi'), ['/vi/products#baseline-sample']);
  } finally {
    baseline.sample = before;
  }
});
