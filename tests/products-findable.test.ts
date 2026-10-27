import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { setServerLocation } from '../src/lib/ssrLocation';
import { resolveRouteMetadata } from '../src/lib/routeMetadata';
import { getLocalizedPathname } from '../src/i18n/routing';
import { isPublicContentReleased } from '../src/i18n/content';
import { PRODUCTS } from '../src/i18n/content/products';
import { seriesLevels } from '../src/lib/seriesContent';
import { syllabusData } from '../src/lib/syllabusContent';
import { thinkingCycleStages } from '../src/lib/thinkingCycleContent';
import * as levelBooksModule from '../docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing/src/lib/academy/levelBooks.ts';

// Making /products findable (master, 27 Oct 2026): fresh meta + Product/Offer JSON-LD, the Level 1 card on
// #teacher-pack-l1 (old #teacher-pack kept), contextual card links from teacher, centre and level pages, and the
// footer link. Links point at cards, never new pages (JE Page Infrastructure Standard), tagged utm_source=<page>.
const amp = (s: string) => s.replaceAll('&amp;', '&');
const LIVE = PRODUCTS.filter((p) => p.live);
const productsHref = (locale: 'en' | 'vi', source: string, id: string) => `${locale === 'vi' ? '/vi' : ''}/products?utm_source=${source}#${id}`;

test('metadata: the description covers the whole range in EN and VI, OG matches it, and the hreflang pair stays', () => {
  for (const [path, locale] of [['/products', 'en'], ['/vi/products', 'vi']] as const) {
    const meta = resolveRouteMetadata(path);
    assert.ok(meta.description.length >= 80 && meta.description.length <= 160, `${path}: ${meta.description.length} chars`);
    assert.match(meta.description, /Level 1–5/, path);
    assert.match(meta.description, locale === 'en' ? /Story Club.*Baseline.*1-to-1.*centre licence/ : /Câu lạc bộ Truyện.*Đánh giá Nói.*1 kèm 1.*giấy phép/, path);
    assert.doesNotMatch(meta.description, /Level 1 materials|tài liệu Level 1 cho/, `${path}: not the old Level 1-only text`);
    assert.equal(meta.og.description, meta.description, `${path}: OG text`);
    assert.equal(meta.twitter.description, meta.description, `${path}: Twitter text`);
    assert.deepEqual(meta.alternates, [
      { hrefLang: 'en', href: 'https://jurassicenglish.com/products' },
      { hrefLang: 'vi', href: 'https://jurassicenglish.com/vi/products' },
      { hrefLang: 'x-default', href: 'https://jurassicenglish.com/products' },
    ], path);
  }
});

test('JSON-LD: one Product with a VND Offer for every live card, in the page language, plus the breadcrumbs', () => {
  assert.equal(LIVE.length, 17);
  for (const [path, locale] of [['/products', 'en'], ['/vi/products', 'vi']] as const) {
    const blocks = resolveRouteMetadata(path).jsonLd as Array<Record<string, any>>;
    assert.ok(blocks.some((b) => b['@type'] === 'BreadcrumbList'), `${path}: breadcrumbs kept`);
    const list = blocks.find((b) => b['@type'] === 'ItemList')!;
    assert.equal(list.numberOfItems, LIVE.length, path);
    const page = `https://jurassicenglish.com${locale === 'vi' ? '/vi' : ''}/products`;
    assert.equal(list.url, page, path);
    list.itemListElement.forEach((entry: Record<string, any>, i: number) => {
      const p = LIVE[i];
      const product = entry.item;
      assert.equal(entry.position, i + 1);
      assert.equal(product['@type'], 'Product');
      assert.equal(product.name, p[locale].title, `${path} ${p.id}: name in the page language`);
      assert.equal(product.url, `${page}#${p.id}`);
      assert.equal(product.image, `https://jurassicenglish.com/images/products/${p.image}.webp`);
      assert.equal(product.offers['@type'], 'Offer');
      assert.equal(product.offers.priceCurrency, 'VND');
      assert.equal(product.offers.price, p.price.replace(/\D/g, ''), `${path} ${p.id}: ${p.price}`);
      assert.ok(Number(product.offers.price) >= 100_000, `${path} ${p.id}: whole VND`);
      assert.equal(product.offers.availability, 'https://schema.org/InStock');
    });
  }
  const prices = Object.fromEntries((resolveRouteMetadata('/products').jsonLd as Array<Record<string, any>>)
    .find((b) => b['@type'] === 'ItemList')!.itemListElement.map((e: Record<string, any>) => [e.item.url.split('#')[1], e.item.offers.price]));
  assert.equal(prices['story-club'], '590000');
  assert.equal(prices['centre-licence'], '4900000');
  assert.equal(prices['teacher-bundle'], '2900000');
});

test('anchors: the Level 1 Teacher Pack is #teacher-pack-l1 like Levels 2–5, and #teacher-pack still lands on it', async () => {
  const { renderRoute } = await import('../src/entry-server');
  assert.deepEqual(PRODUCTS.filter((p) => /^teacher-pack/.test(p.id)).map((p) => p.id),
    ['teacher-pack-l1', 'teacher-pack-l2', 'teacher-pack-l3', 'teacher-pack-l4', 'teacher-pack-l5']);
  for (const route of ['/products', '/vi/products']) {
    const html = await renderRoute(route);
    assert.equal([...html.matchAll(/ id="teacher-pack-l1"/g)].length, 1, route);
    assert.equal([...html.matchAll(/ id="teacher-pack"/g)].length, 1, route);
    const card = html.slice(html.indexOf('id="teacher-pack-l1"'), html.indexOf('</li>', html.indexOf('id="teacher-pack-l1"')));
    assert.match(card, /<span id="teacher-pack" class="block scroll-mt-24" aria-hidden="true">/, `${route}: old anchor inside the card`);
    assert.match(html, /<li class="[^"]*scroll-mt-24[^"]*" id="teacher-pack-l1"/, `${route}: card anchors clear the fixed header`);
  }
});

// Every contextual link: the page, the card it points at, its utm source, and the page component. Components are
// rendered directly (some English routes lazy-load the BotUI chat, whose .scss import cannot load under tsx).
type Contextual = [path: string, id: string, source: string, render: (locale: 'en' | 'vi') => Promise<ReactElement>];
const noop = () => {};
const CONTEXTUAL: Contextual[] = [
  ...seriesLevels.map((level): Contextual => [level.path, `teacher-pack-l${level.order}`, 'series', async () =>
    createElement((await import('../src/components/SeriesExperience')).SeriesExperience, { level, onBack: noop, onSelectLevel: noop, onCompareLevels: noop, onViewSyllabus: noop })]),
  ...syllabusData.map((syllabus, i): Contextual => [syllabus.syllabusRoutePath, `teacher-pack-l${i + 1}`, 'syllabus', async () =>
    createElement((await import('../src/components/SyllabusExperience')).SyllabusExperience, { level: seriesLevels[i], syllabus, onBack: noop, onViewLevel: noop })]),
  ...['teacher-pack-l1', 'teacher-pack-l2', 'teacher-pack-l3', 'teacher-pack-l4', 'teacher-pack-l5', 'teacher-bundle'].map((id): Contextual => ['/series/compare', id, 'series-compare', async () =>
    createElement((await import('../src/components/SeriesComparisonExperience')).SeriesComparisonExperience, { onBack: noop, onSelectLevel: noop, onViewSyllabus: noop })]),
  ...thinkingCycleStages.map((stage): Contextual => [stage.path, 'thinking-cycle-set', 'thinking-cycle', async () =>
    createElement((await import('../src/components/ThinkingCycleExperience')).ThinkingCycleExperience, { stage, onBack: noop, onSelectStage: noop, onCompareStages: noop })]),
  ['/thinking-cycle/compare', 'thinking-cycle-set', 'thinking-cycle-compare', async () =>
    createElement((await import('../src/components/ThinkingCycleComparisonExperience')).ThinkingCycleComparisonExperience, { onBack: noop, onSelectStage: noop })],
  ['/teacher-standards', 'teacher-training-course', 'teacher-standards', async () =>
    createElement((await import('../src/components/TeacherStandardsPage')).TeacherStandardsPage, { onBack: noop, onGetStarted: noop, onNavigate: noop })],
  ['/pilot-programme', 'pilot-class-kit', 'pilot-programme', async (locale) =>
    createElement((await import('../src/components/PilotProgrammePage')).PilotProgrammePage, { locale, onBack: noop, onGetStarted: noop, onNavigate: noop })],
  ['/framework', 'curriculum-overview', 'framework', async () =>
    createElement((await import('../src/components/FrameworkExperience')).FrameworkExperience, { onBack: noop, onGetStarted: noop })],
];

test('contextual links: teacher, centre and level pages link their product card, tagged with the source page (EN + VI)', async () => {
  assert.deepEqual(syllabusData.map((s) => s.syllabusRoutePath), seriesLevels.map((l) => `${l.path}/syllabus`), 'syllabus i ↔ level i');
  const leads = { en: { teachers: 'For teachers:', centres: 'For centres:' }, vi: { teachers: 'Dành cho giáo viên:', centres: 'Dành cho trung tâm:' } } as const;
  const checked: string[] = [];
  for (const [path, id, source, render] of CONTEXTUAL) {
    const product = PRODUCTS.find((p) => p.id === id)!;
    assert.ok(product.live, `${id} is live`);
    for (const locale of ['en', 'vi'] as const) {
      if (!isPublicContentReleased(path, locale)) continue;
      const route = getLocalizedPathname(path, locale);
      setServerLocation(route);
      const html = amp(renderToStaticMarkup(await render(locale)));
      const links = [...html.matchAll(new RegExp(`<a href="([^"]+)"[^>]*data-link="product-card-${id}"[^>]*>([^<]+)<`, 'g'))];
      assert.equal(links.length, 1, `${route}: one link to ${id}`);
      assert.equal(links[0][1], productsHref(locale, source, id), route);
      assert.equal(links[0][2], `${leads[locale][product.section as 'teachers' | 'centres']} ${product[locale].title}`, route);
      checked.push(`${route} → ${id}`);
    }
  }
  setServerLocation('/');
  assert.ok(checked.length >= CONTEXTUAL.length, `checked ${checked.length} page links`);
});

test('story hub: each level (EN + VI) has "For teachers: Level N Teacher Pack" to its card, tagged academy (code AC)', async () => {
  type LevelBooks = typeof levelBooksModule;
  const lb: LevelBooks = (levelBooksModule as unknown as { default?: LevelBooks }).default ?? levelBooksModule;
  for (const level of [1, 2, 3, 4, 5]) {
    assert.equal(lb.teacherPackHref(level, 'en'), productsHref('en', 'academy', `teacher-pack-l${level}`));
    assert.equal(lb.teacherPackHref(level, 'vi'), productsHref('vi', 'academy', `teacher-pack-l${level}`));
    assert.ok(PRODUCTS.some((p) => p.id === `teacher-pack-l${level}` && p.live), `teacher-pack-l${level} is a live card`);
  }
  const src = readFileSync('docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing/src/components/student-academy/LevelStories.tsx', 'utf8');
  assert.match(src, /teacherPack: \(level: number\) => `For teachers: Level \$\{level\} Teacher Pack`/);
  assert.match(src, /teacherPack: \(level: number\) => `Dành cho giáo viên: Bộ tài liệu Giáo viên Level \$\{level\}`/);
  assert.match(src, /href=\{teacherPackHref\(level\.level, locale\)\}[^>]*data-link=\{`story-hub-teacher-pack-l\$\{level\.level\}`\}/);
  assert.equal(PRODUCTS.find((p) => p.id === 'teacher-pack-l2')!.vi.title, 'Bộ tài liệu Giáo viên Level 2', 'VI link text matches the card title');
  const { orderCode } = await import('../src/lib/productsSource');
  assert.equal(orderCode(new URL(lb.teacherPackHref(1), 'https://jurassicenglish.com').searchParams.get('utm_source'), 'teacher-pack-l1'), 'AC', 'story hub orders show code AC');
});

// Order codes (master, 27 Oct 2026): the Zalo buttons keep the buyer's channel. Codes from the Sale Team's
// 03_UTM_Link_Table.md.
test('order codes: the visit source is read from the URL, kept for the visit, and safe when storage is blocked', async () => {
  const { cleanSource, readVisitorSource } = await import('../src/lib/productsSource');
  const store = () => {
    const data = new Map<string, string>();
    return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k, v); }, data };
  };
  const s = store();
  assert.equal(readVisitorSource('?utm_source=fb-teachers', s), 'fb-teachers');
  assert.equal(readVisitorSource('', s), 'fb-teachers', 'kept for the rest of the visit');
  assert.equal(readVisitorSource('?utm_source=Zalo-Centre', s), 'zalo-centre', 'a newer source replaces it, lower-cased');
  assert.equal(readVisitorSource('?utm_source=%3Cscript%3E', store()), null, 'unsafe values are ignored');
  assert.equal(readVisitorSource('', store()), null, 'no source');
  const blocked = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
  assert.equal(readVisitorSource('?utm_source=academy', blocked), 'academy', 'the URL still works when storage throws');
  assert.equal(readVisitorSource('', blocked), null);
  assert.equal(readVisitorSource('?utm_source=video2', null), 'video2');
  assert.equal(cleanSource('x'.repeat(41)), null);
});

test('order codes: the channel code from the table, else the source, else the card id; Zalo links carry the source', async () => {
  const { orderCode, zaloHref } = await import('../src/lib/productsSource');
  const { PRODUCTS_ZALO } = await import('../src/i18n/content/products');
  const table: Record<string, string> = {
    'fb-teachers': 'FBT', 'zalo-teachers': 'ZT', 'zalo-centre': 'ZC', 'email-centre': 'EC', 'zalo-parent': 'ZP',
    storybook: 'SB', academy: 'AC', video1: 'VD1', video2: 'VD2', video3: 'VD3',
  };
  for (const [source, code] of Object.entries(table)) assert.equal(orderCode(source, 'teacher-pack-l1'), code, source);
  assert.equal(orderCode('series', 'teacher-pack-l1'), 'SERIES', 'a source not in the table is shown as itself');
  assert.equal(orderCode(null, 'teacher-pack-l1'), 'TEACHER-PACK-L1', 'no source: the card id');
  assert.equal(orderCode('products', 'centre-licence'), 'CENTRE-LICENCE', 'the catch-all source: the card id');
  assert.equal(zaloHref('fb-teachers'), 'https://zalo.me/84396085076?utm_source=fb-teachers');
  assert.equal(zaloHref(null), PRODUCTS_ZALO, 'the prerendered page keeps utm_source=products until the visit is read');
});

test('order codes: every Order on Zalo button shows its code line (EN + VI); other buttons do not', async () => {
  const { renderRoute } = await import('../src/entry-server');
  const zalo = PRODUCTS.filter((p) => p.live && p.href === 'zalo').map((p) => p.id);
  assert.ok(zalo.length >= 10);
  for (const [route, before] of [['/products', 'When you message, mention code'], ['/vi/products', 'Khi nhắn tin, hãy nhắc mã']] as const) {
    const html = await renderRoute(route);
    const lines = [...html.replaceAll('<!-- -->', '').matchAll(/<p class="mt-2 text-sm" data-order-code="([^"]+)">([^<]*)<strong>([^<]+)<\/strong>\.<\/p>/g)];
    assert.deepEqual(lines.map((m) => m[1]), zalo, route);
    for (const [, id, text, code] of lines) {
      assert.equal(text.trim(), before, `${route} ${id}`);
      assert.equal(code, id.toUpperCase(), `${route} ${id}: card id until the visit source is read`);
      const card = html.slice(html.indexOf(`id="${id}"`), html.indexOf('</li>', html.indexOf(`id="${id}"`)));
      assert.ok(card.indexOf(`data-cta="product-${id}"`) < card.indexOf(`data-order-code="${id}"`), `${route} ${id}: next to the button`);
    }
  }
});
