import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
  teachers: [['teacher-pack', '690.000₫']],
  centres: [['centre-licence', '4.900.000₫']],
};

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
    for (const [section, cards] of Object.entries(EXPECTED)) {
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
    for (const id of ['printable-pack', 'teacher-pack', 'centre-licence']) assert.equal(ctas[id], PRODUCTS_ZALO, `${route} ${id}`);
    assert.equal(PRODUCTS_ZALO, 'https://zalo.me/84396085076?utm_source=products');
    // Every link in the page body (back link, cards, closing CTA) is tagged, except the language switch.
    const counterpart = route === EN ? VI : EN;
    for (const [, href] of main.matchAll(/href="([^"]+)"/g)) {
      if (href === counterpart) continue;
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
    assert.deepEqual(delivered.map((m) => m[1]), ['printable-pack', 'teacher-pack', 'centre-licence'], route);
    for (const m of delivered) assert.equal(m[2], line, route);
    const html = await renderRoute(route);
    for (const name of ['Wild Things', 'Giving Tree', 'Snowy Day', 'Sylvester', 'Stellaluna', 'Frog and Toad', 'Owl at Home', 'Rumphius', 'Sneetches', 'Frederick', 'Hungry Caterpillar']) {
      assert.ok(!html.includes(name), `${route}: "${name}"`);
    }
  }
  assert.match(productsContent.en.sections[1].cards[0].forWho, /10 widely available picture books the teacher provides/);
  // Lines aligned to the live pages: no Baseline fee-credit promise, and 1-to-1 lessons are with Mr. Jay's team.
  for (const c of Object.values(productsContent)) {
    const cards = c.sections.flatMap((s) => s.cards);
    const text = JSON.stringify(cards);
    assert.doesNotMatch(text, /credited|trừ vào/i);
    assert.match(cards.find((card) => card.id === 'one-to-one')!.title, /Mr\. Jay’s team|đội ngũ của thầy Jay/);
  }
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
  assert.doesNotMatch(readFileSync('src/components/Navbar.tsx', 'utf8'), /products/i, 'no header change');
});

// More products are coming (Teacher Packs L2–5, a bundle): the cards come from one list, so a new card is one entry.
test('cards are data-driven from PRODUCTS; a product image shows as a square when the entry has one', async () => {
  const { PRODUCTS, productsPage } = await import('../src/i18n/content/products');
  const { ProductsPage } = await import('../src/components/ProductsPage');
  for (const locale of ['en', 'vi'] as const) {
    const ids = productsPage(locale).sections.flatMap((s) => s.cards.map((c) => c.id));
    assert.deepEqual(ids, PRODUCTS.map((p) => p.id), `${locale}: every entry is a card, in list order`);
  }
  // Each entry with an image has its square WebP in public/images/products.
  for (const p of PRODUCTS.filter((entry) => entry.image)) readFileSync(`public/images/products/${p.id}.webp`);

  // One new entry → one new card in its section, with its image slot.
  const extra = {
    id: 'test-extra', section: 'teachers' as const, price: '1.000₫', href: 'zalo', delivery: true, image: true,
    en: { label: 'L', title: 'Extra pack', problem: 'P', inside: 'I', forWho: 'F', unit: 'one-time', cta: 'Order on Zalo' },
    vi: { label: 'L', title: 'Gói thêm', problem: 'P', inside: 'I', forWho: 'F', unit: 'mua một lần', cta: 'Đặt mua qua Zalo' },
  };
  PRODUCTS.push(extra);
  try {
    setServerLocation(EN);
    const html = renderToStaticMarkup(createElement(ProductsPage, { locale: 'en' }));
    const teachers = html.slice(html.indexOf('<section id="teachers"'), html.indexOf('</section>', html.indexOf('<section id="teachers"')));
    assert.deepEqual([...teachers.matchAll(/<li [^>]*id="([^"]+)"/g)].map((m) => m[1]), ['teacher-pack', 'test-extra']);
    assert.match(teachers, /<img src="\/images\/products\/test-extra\.webp" alt="Extra pack" width="480" height="480"[^>]*aspect-square/);
    assert.equal([...html.matchAll(/data-product-image=/g)].length, PRODUCTS.filter((p) => p.image).length);
  } finally {
    PRODUCTS.pop();
  }
});
