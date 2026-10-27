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
  families: [['story-club', '590.000₫'], ['baseline', '690.000₫'], ['one-to-one', '800.000₫'], ['printable-pack', '149.000₫'], ['parent-pack-l1', '249.000₫'], ['parent-pack-l2', '249.000₫'], ['parent-pack-l3', '249.000₫'], ['holiday-reading-challenge', '149.000₫']],
  teachers: [
    ['teacher-pack-l1', '690.000₫'], ['teacher-pack-l2', '690.000₫'], ['teacher-pack-l3', '690.000₫'], ['teacher-pack-l4', '690.000₫'],
    ['teacher-pack-l5', '690.000₫'], ['teacher-bundle', '2.900.000₫'], ['student-workbook-l1', '190.000₫'], ['student-workbook-l2', '190.000₫'], ['student-workbook-l3', '190.000₫'], ['student-workbook-l4', '190.000₫'], ['student-workbook-l5', '190.000₫'], ['word-fossil-flashcards-l1', '190.000₫'], ['thinking-cycle-set', '490.000₫'], ['thinking-cycle-posters', '149.000₫'],
    ['reasoning-assessment-kit', '390.000₫'], ['ielts-speaking-ladder', '390.000₫'], ['ielts-one-to-one-starter', '149.000₫'], ['ielts-cue-card-bank', '290.000₫'], ['writing-baseline', '79.000₫'], ['ielts-writing-ladder-task2', '390.000₫'], ['ielts-writing-task1-method', '290.000₫'], ['ielts-essay-bank-task2', '290.000₫'], ['ielts-writing-teacher-pack', '690.000₫'],
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
    for (const id of ['printable-pack', 'parent-pack-l1', 'parent-pack-l2', ...SHOWN.teachers.map(([cardId]) => cardId), ...SHOWN.centres.map(([cardId]) => cardId)]) assert.equal(ctas[id], PRODUCTS_ZALO, `${route} ${id}`);
    assert.equal(PRODUCTS_ZALO, 'https://zalo.me/84396085076?utm_source=products');
    // Every link in the page body (back link, cards, closing CTA) is tagged, except the language switch, the sample
    // PDFs (files on this site, not page links) and the PayPal payments (their item name carries the order code).
    // Product pages (/products/<id>, 27 Oct 2026) stay untagged: they are the same funnel, and a utm_source=products
    // there would overwrite the visit's real source (e.g. fb-teachers) that the page keeps for the order code.
    const counterpart = route === EN ? VI : EN;
    for (const [, href] of main.matchAll(/href="([^"]+)"/g)) {
      if (/^(\/vi)?\/products\/[a-z0-9-]+$/.test(href)) continue;
      if (href === counterpart || href.startsWith('#') || /^\/samples\/[^/?#]+-sample\.pdf$/.test(href) || href.startsWith('https://www.paypal.com/cgi-bin/webscr?')) continue;
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
    // The Writing Baseline is a service (an essay read by hand), not a download: no Drive delivery line.
    assert.deepEqual(delivered.map((m) => m[1]), ['printable-pack', 'parent-pack-l1', 'parent-pack-l2', 'parent-pack-l3', 'holiday-reading-challenge', ...SHOWN.teachers.map(([id]) => id).filter((id) => id !== 'writing-baseline'), ...SHOWN.centres.map(([id]) => id)], route);
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
  for (const [path, href, label] of [['/', '/products', 'Products &amp; prices'], ['/vi', '/vi/products', 'Sản phẩm &amp; bảng giá']]) {
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
    'teacher-pack-l1': 'teacher-pack-l1', 'teacher-pack-l2': 'teacher-pack-l2', 'teacher-pack-l3': 'teacher-pack-l3',
    'teacher-pack-l4': 'teacher-pack-l4', 'teacher-pack-l5': 'teacher-pack-l5', 'teacher-bundle': 'teacher-bundle',
    'parent-pack-l1': 'parent-pack-l1', 'parent-pack-l2': 'parent-pack-l2', 'student-workbook-l1': 'student-workbook-l1', 'student-workbook-l2': 'student-workbook-l2', 'student-workbook-l3': 'student-workbook-l3',
    'student-workbook-l4': 'student-workbook-l4', 'student-workbook-l5': 'student-workbook-l5', 'thinking-cycle-set': 'thinking-cycle-set',
    'reasoning-assessment-kit': 'reasoning-assessment-kit', 'ielts-speaking-ladder': 'ielts-speaking-ladder', 'ielts-writing-ladder-task2': 'ielts-writing-ladder-task2', 'ielts-writing-task1-method': 'ielts-writing-task1-method', 'ielts-writing-teacher-pack': 'ielts-writing-teacher-pack',
    'ielts-one-to-one-starter': 'ielts-one-to-one-starter', 'writing-baseline': 'writing-baseline',
    'ielts-cue-card-bank': 'ielts-cue-card-bank', 'ielts-essay-bank-task2': 'ielts-essay-bank-task2', 'parent-pack-l3': 'parent-pack-l3',
    'holiday-reading-challenge': 'holiday-reading-challenge', 'thinking-cycle-posters': 'thinking-cycle-posters', 'word-fossil-flashcards-l1': 'word-fossil-flashcards-l1',
    'centre-licence': 'centre-licence', 'teacher-training-course': 'teacher-training-course',
    'pilot-class-kit': 'pilot-class-kit', 'curriculum-overview': 'curriculum-overview',
  };
  for (const locale of ['en', 'vi'] as const) {
    setServerLocation(locale === 'en' ? EN : VI);
    const cards = productsContent[locale].sections.flatMap((s) => s.cards);
    assert.deepEqual(Object.fromEntries(cards.filter((c) => c.image).map((c) => [c.id, c.image])), expected, locale);
  }
  const { PRODUCTS } = await import('../src/i18n/content/products');
  // Every live product has its own image. A hidden card may wait for the image studio (35-today plan, 27 Oct 2026);
  // it cannot go live without one.
  for (const p of PRODUCTS.filter((entry) => entry.live)) assert.ok(p.image, `${p.id} has an image`);
  const images = PRODUCTS.filter((p) => p.image).map((p) => p.image);
  assert.equal(new Set(images).size, images.length, 'no two products share an image');
  for (const name of new Set(PRODUCTS.map((p) => p.image).filter(Boolean) as string[])) {
    const file = readFileSync(`public/images/products/${name}.webp`);
    assert.equal(file.subarray(0, 4).toString(), 'RIFF', `${name} is a WebP`);
    assert.ok(file.length < 160_000, `${name}: ${file.length} bytes`);
  }
});

test('packs marked live: false stay in the data, off the page and without a product page; all 35 are live (35-today)', async () => {
  const { PRODUCTS } = await import('../src/i18n/content/products');
  const { renderRoute } = await import('../src/entry-server');
  for (const p of PRODUCTS) assert.equal(typeof p.live, 'boolean', `${p.id}: live is set`);
  const hidden = PRODUCTS.filter((p) => !p.live).map((p) => p.id);
  // 35-today plan (Jay, 27 Oct 2026): every new product went live once the master approved its sample. A future
  // pack can still ship hidden with live: false.
  assert.deepEqual(hidden, []);
  const { PRODUCT_PAGE_PATHS } = await import('../src/i18n/content/productSeo');
  for (const route of [EN, VI]) {
    const html = await renderRoute(route);
    for (const id of hidden) assert.ok(!html.includes(`id="${id}"`) && !html.includes(`product-${id}`), `${route}: ${id} hidden`);
  }
  for (const id of hidden) {
    assert.ok(!PRODUCT_PAGE_PATHS.includes(`/products/${id}`), `${id}: no product page, so nothing in the sitemap`);
    assert.equal((await renderRoute(`/products/${id}`)).includes(`data-product-page-main="${id}"`), false, `${id}: /products/${id} is not served`);
  }
});

// "See a sample" (Jay, 27 Oct 2026: everybody sees a sample before a price or a booking). The factories name the files
// by these stems (master's SAMPLES-AND-BRANDED-PDF-SPEC): public/samples/<stem>-sample.pdf and <stem>-p1..p3.webp.
const SAMPLE_STEMS: Record<string, string> = {
  'story-club': 'story-club', baseline: 'baseline', 'one-to-one': 'one-to-one', 'printable-pack': 'printable-pack-l1',
  'teacher-pack-l1': 'teacher-pack-l1', 'teacher-pack-l2': 'teacher-pack-l2', 'teacher-pack-l3': 'teacher-pack-l3',
  'teacher-pack-l4': 'teacher-pack-l4', 'teacher-pack-l5': 'teacher-pack-l5', 'teacher-bundle': 'teacher-bundle',
  'parent-pack-l1': 'parent-pack-l1', 'parent-pack-l2': 'parent-pack-l2', 'student-workbook-l1': 'student-workbook-l1',
  'student-workbook-l2': 'student-workbook-l2', 'student-workbook-l3': 'student-workbook-l3', 'student-workbook-l4': 'student-workbook-l4',
  'student-workbook-l5': 'student-workbook-l5',
  'thinking-cycle-set': 'thinking-cycle-set', 'reasoning-assessment-kit': 'reasoning-assessment-kit',
  'ielts-speaking-ladder': 'ielts-speaking-ladder', 'ielts-writing-ladder-task2': 'ielts-writing-ladder-task2', 'ielts-writing-task1-method': 'ielts-writing-task1-method', 'ielts-writing-teacher-pack': 'ielts-writing-teacher-pack', 'centre-licence': 'centre-licence',
  'teacher-training-course': 'teacher-training-course', 'pilot-class-kit': 'pilot-class-kit', 'curriculum-overview': 'curriculum-overview',
  // 35-today plan (27 Oct 2026): the eight new products, stem = id.
  'writing-baseline': 'writing-baseline', 'ielts-one-to-one-starter': 'ielts-one-to-one-starter', 'ielts-cue-card-bank': 'ielts-cue-card-bank',
  'ielts-essay-bank-task2': 'ielts-essay-bank-task2', 'parent-pack-l3': 'parent-pack-l3', 'holiday-reading-challenge': 'holiday-challenge',
  'thinking-cycle-posters': 'thinking-cycle-posters', 'word-fossil-flashcards-l1': 'word-fossil-flashcards-l1',
};
const SAMPLE_FILE = /^(.+)-p[123]\.webp$/;
const PAGE_FILE = /^(.+)-pg(\d\d)\.webp$/;
const filesUnder = (dir: string): string[] => (existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
  entry.isDirectory() ? filesUnder(`${dir}/${entry.name}`) : entry.name.startsWith('.') ? [] : [`${dir}/${entry.name}`]) : []);

test('samples: no PDF is published; every card has three thumbnails and every page set matches the manifest', async () => {
  const { PRODUCTS } = await import('../src/i18n/content/products');
  const { SAMPLE_PAGE_COUNTS } = await import('../src/i18n/content/samplePages');
  // Jay, 27 Oct 2026: no PDF download. Nothing under public/samples may be a PDF.
  assert.deepEqual(filesUnder('public/samples').filter((file) => /\.pdf$/i.test(file)), [], 'no PDF under public/samples');
  assert.deepEqual(Object.keys(SAMPLE_STEMS).sort(), PRODUCTS.map((p) => p.id).sort(), 'one stem per product');
  for (const p of PRODUCTS.filter((entry) => entry.sample)) assert.equal(p.sample, SAMPLE_STEMS[p.id], `${p.id}: stem from the spec`);
  const stems = PRODUCTS.filter((p) => p.sample).map((p) => p.sample!).sort();
  const thumbs = readdirSync('public/samples').filter((f) => !f.startsWith('.') && f !== 'pages');
  for (const file of thumbs) assert.match(file, SAMPLE_FILE, `public/samples/${file}`);
  assert.deepEqual([...new Set(thumbs.map((file) => file.match(SAMPLE_FILE)![1]))].sort(), stems, 'thumbnails ↔ products with a sample');
  for (const stem of stems) for (const n of [1, 2, 3]) {
    const page = readFileSync(`public/samples/${stem}-p${n}.webp`);
    assert.equal(page.subarray(8, 12).toString(), 'WEBP', `${stem}-p${n}: WebP`);
    assert.ok(page.length < 80 * 1024, `${stem}-p${n}: < 80 KB (${page.length})`);
  }
  // Viewer page sets: public/samples/pages/<stem>-pgNN.webp, 01…N, exactly as samplePages.ts lists them.
  const pages = readdirSync('public/samples/pages').filter((f) => !f.startsWith('.'));
  for (const file of pages) assert.match(file, PAGE_FILE, `pages/${file}`);
  const found: Record<string, number> = {};
  for (const file of pages) { const [, stem] = file.match(PAGE_FILE)!; found[stem] = (found[stem] ?? 0) + 1; }
  assert.deepEqual(found, SAMPLE_PAGE_COUNTS, 'page files ↔ manifest');
  for (const [stem, count] of Object.entries(SAMPLE_PAGE_COUNTS)) {
    assert.ok(stems.includes(stem), `${stem}: a product's sample`);
    for (let n = 1; n <= count; n += 1) {
      const file = readFileSync(`public/samples/pages/${stem}-pg${String(n).padStart(2, '0')}.webp`);
      assert.equal(file.subarray(8, 12).toString(), 'WEBP', `${stem}-pg${n}: WebP`);
      assert.ok(file.length < 300 * 1024, `${stem}-pg${n}: ${file.length} bytes`);
    }
  }
});

test('samples: the block sits above the price; one button opens the viewer; no link to any PDF', async () => {
  const { PRODUCTS } = await import('../src/i18n/content/products');
  const { ProductsPage } = await import('../src/components/ProductsPage');
  for (const [locale, route, heading, open] of [['en', EN, 'See a sample', 'See the sample pages'], ['vi', VI, 'Xem mẫu', 'Xem các trang mẫu']] as const) {
    setServerLocation(route);
    const html = renderToStaticMarkup(createElement(ProductsPage, { locale }));
    assert.deepEqual([...html.matchAll(/data-sample="([^"]+)"/g)].map((m) => m[1]), PRODUCTS.filter((p) => p.live && p.sample).map((p) => p.id), locale);
    assert.doesNotMatch(html, /href="[^"]*\.pdf/i, `${locale}: no PDF link`);
    assert.doesNotMatch(html, /data-sample-viewer=/, `${locale}: the viewer opens only on request`);
    assert.ok(html.includes('@media print { body { display: none !important; } }'), `${locale}: printing gives a blank page`);
    for (const [id, stem] of [['baseline', 'baseline'], ['teacher-pack-l1', 'teacher-pack-l1']]) {
      const card = html.slice(html.indexOf(`id="${id}"`), html.indexOf('</li>', html.indexOf(`id="${id}"`)));
      const block = card.slice(card.indexOf(`data-sample="${id}"`), card.indexOf(`data-price="${id}"`));
      const at = (marker: string) => card.indexOf(marker);
      assert.ok(at('</dl>') < at(`data-sample="${id}"`) && at(`data-sample="${id}"`) < at(`data-price="${id}"`), `${locale} ${id}: after the text, before the price`);
      assert.ok(at(`data-price="${id}"`) < at(`data-cta="product-${id}"`), `${locale} ${id}: price before the order button`);
      assert.match(card, new RegExp(`<div id="${id}-sample" class="[^"]*scroll-mt-24`), `${locale} ${id}: anchor clears the fixed header`);
      assert.ok(block.includes(`>${heading}<`), `${locale} ${id}: heading`);
      assert.doesNotMatch(block, /<a /, `${locale} ${id}: no link in the sample block`);
      const button = block.match(/<button type="button" aria-label="([^"]+)"[^>]*data-sample-link="[^"]+">/)!;
      assert.ok(button[1].startsWith(`${open}: `) && button[1].length > open.length + 2, `${locale} ${id}: accessible name starts with the visible text`);
      assert.ok(block.includes(`>${open}</span>`), `${locale} ${id}: visible text`);
      assert.deepEqual([...block.matchAll(/<img src="([^"]+)" alt="" width="600" height="849"[^>]*draggable="false"[^>]*data-sample-page=/g)].map((m) => m[1]),
        [1, 2, 3].map((n) => `/samples/${stem}-p${n}.webp`), `${locale} ${id}: three thumbnails, not draggable`);
      assert.equal([...card.matchAll(/data-cta="/g)].length, 1, `${locale} ${id}: still one CTA`);
    }
  }
});

test('samples: the viewer shows one watermarked page at a time, a counter, and the order button on the last page', async () => {
  const { PRODUCTS, productsPage } = await import('../src/i18n/content/products');
  const { SAMPLE_PAGE_COUNTS } = await import('../src/i18n/content/samplePages');
  const { SampleViewer } = await import('../src/components/ProductsPage');
  const noop = () => {};
  for (const [locale, route, first, end] of [['en', EN, 'Page 1 of 8', 'That’s the sample. Ready to order?'], ['vi', VI, 'Trang 1/8', 'Đó là bản mẫu. Sẵn sàng đặt mua?']] as const) {
    setServerLocation(route);
    const c = productsPage(locale);
    const card = c.sections.flatMap((section) => section.cards).find((entry) => entry.id === 'baseline')!;
    const view = (initialPage: number) => renderToStaticMarkup(createElement(SampleViewer, { card, locale, source: null, copy: c.viewer, onClose: noop, initialPage }));
    const start = view(0);
    assert.match(start, /role="dialog" aria-modal="true"/, locale);
    assert.ok(start.includes(`>${first}<`), `${locale}: counter`);
    assert.match(start, /<img src="\/samples\/pages\/baseline-pg01\.webp" alt="[^"]+" width="1200" height="1699" draggable="false" class="pointer-events-none/, `${locale}: page 1, not draggable`);
    assert.match(start, /disabled=""[^>]*data-viewer-prev/, `${locale}: no previous page on page 1`);
    assert.doesNotMatch(start, /data-viewer-order=/, `${locale}: order button only at the end`);
    assert.doesNotMatch(start, /href="[^"]*\.pdf|download|print/i, `${locale}: no PDF, download or print control`);
    const last = view(SAMPLE_PAGE_COUNTS.baseline - 1);
    assert.ok(last.includes('/samples/pages/baseline-pg08.webp') && last.includes(`>${end}<`), `${locale}: last page and end text`);
    assert.match(last, /data-viewer-order="baseline"/, `${locale}: order button on the last page`);
    assert.match(last, /disabled=""[^>]*data-viewer-next/, `${locale}: no next page at the end`);
  }
  // A future card whose page set has not landed yet shows its three thumbnails.
  const waiting = PRODUCTS.find((p) => p.id === 'teacher-pack-l2')!;
  const count = SAMPLE_PAGE_COUNTS[waiting.sample!];
  delete SAMPLE_PAGE_COUNTS[waiting.sample!];
  try {
    setServerLocation(EN);
    const card = productsPage('en').sections.flatMap((section) => section.cards).find((entry) => entry.id === waiting.id)!;
    const html = renderToStaticMarkup(createElement(SampleViewer, { card, locale: 'en', source: null, copy: productsPage('en').viewer, onClose: noop }));
    assert.ok(html.includes(`/samples/${waiting.sample}-p1.webp`) && html.includes('>Page 1 of 3<'), `${waiting.id}: thumbnails until its pages land`);
  } finally {
    SAMPLE_PAGE_COUNTS[waiting.sample!] = count;
  }
  assert.equal(PRODUCTS.filter((p) => p.sample && !SAMPLE_PAGE_COUNTS[p.sample]).length, 0, 'every card has its full page set');
});

// The header Baseline link is covered by the next test (it leads to #baseline-sample); '/' lazy-loads BotUI, whose .scss
// cannot load under tsx, so the rendered checks cover /products and the country pages.
test('samples: no page links a PDF sample (products and country pages)', async () => {
  const { renderRoute } = await import('../src/entry-server');
  for (const route of [EN, VI, '/ielts-speaking-online/uae', '/ar/ielts-speaking-online/uae', '/ielts-speaking-online/pakistan', '/es/ielts-speaking-online/colombia']) {
    const html = await renderRoute(route);
    assert.doesNotMatch(html, /href="[^"]*\.pdf/i, `${route}: no .pdf link`);
  }
  assert.doesNotMatch(readFileSync('src/components/ProductsPage.tsx', 'utf8') + readFileSync('src/i18n/content/products.ts', 'utf8'), /sample\.pdf/);
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

// Wave 2 (master, 27 Oct 2026; Jay gave authority): the Level 1 Parent Home Reading Pack (families) and the Level 1
// Student Workbook (teachers, with a one-line pointer in the families section).
test('wave 2: two new cards with their samples, US$ by PayPal, and the workbook pointer in the families section (EN + VI)', async () => {
  const { renderRoute } = await import('../src/entry-server');
  for (const [route, line] of [
    [EN, /Doing Level 1 at home\? The <a href="#student-workbook-l1"[^>]*>Level 1 Student Workbook<\/a> has a page for every lesson: 190\.000₫ a learner, using 10 picture books you provide\./],
    [VI, /Học Level 1 ở nhà\? <a href="#student-workbook-l1"[^>]*>Sách bài tập học viên Level 1<\/a> có một trang cho mỗi bài học: 190\.000₫ mỗi học viên, dùng 10 cuốn sách tranh bạn tự chuẩn bị\./],
  ] as const) {
    const html = amp(mainOf(await renderRoute(route)).replaceAll('<!-- -->', ''));
    const families = html.slice(html.indexOf('<section id="families"'), html.indexOf('</section>', html.indexOf('<section id="families"')));
    const teachers = html.slice(html.indexOf('<section id="teachers"'), html.indexOf('</section>', html.indexOf('<section id="teachers"')));
    assert.ok(families.includes('id="parent-pack-l1"') && families.includes('id="parent-pack-l2"') && !families.includes('id="student-workbook-l1"'), `${route}: parent packs in families`);
    assert.ok(teachers.includes('id="student-workbook-l1"'), `${route}: workbook in teachers`);
    assert.match(families, line, `${route}: workbook line in families`);
    assert.equal([...html.matchAll(/data-also="/g)].length, 1, `${route}: one pointer line`);
    for (const [id, price, usd] of [['parent-pack-l1', '249.000₫', 10], ['parent-pack-l2', '249.000₫', 10], ['student-workbook-l1', '190.000₫', 8]] as const) {
      const card = html.slice(html.indexOf(`id="${id}"`), html.indexOf('</li>', html.indexOf(`id="${id}"`)));
      assert.ok(card.includes(`data-sample="${id}"`) && card.includes(`data-sample-link="${id}"`) && card.includes(`/samples/${id}-p1.webp`), `${route} ${id}: sample`);
      assert.ok(card.includes(`data-price="${id}">${price}`), `${route} ${id}: ${price}`);
      assert.match(card, new RegExp(`data-paypal-link="${id}">[^<]*US\\$${usd} `), `${route} ${id}: US$${usd}`);
      assert.ok(card.indexOf(`data-sample="${id}"`) < card.indexOf(`data-price="${id}"`), `${route} ${id}: sample before price`);
    }
    const workbook = html.slice(html.indexOf('id="student-workbook-l1"'), html.indexOf('</li>', html.indexOf('id="student-workbook-l1"')));
    assert.ok(workbook.includes('1.490.000₫'), `${route}: class set price`);
  }
});
