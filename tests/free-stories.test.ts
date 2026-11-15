import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PRODUCTS } from '../src/i18n/content/products';
import { PAID_OFFERS } from '../src/config/payment';
import { FREE_STORIES, PENDING_PDF, freeStoriesContent, freeStoryHref } from '../src/i18n/content/freeStories';
import { resolveRouteMetadata, getPrivateOrNonIndexableRoutes, getExpectedPublicIndexableRoutes } from '../src/lib/routeMetadata';

// Free stories page (draft, brief WW-20261115-RL6C).
const read = (p: string) => readFileSync(p, 'utf8');
const amp = (s: string) => s.replaceAll('&amp;', '&').replaceAll('<!-- -->', '');
const code = (p: string) => read(p).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const LEVELS = read('docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing/src/lib/academy/levelBooks.ts');

test('seven titles with the site level data and a live paid page each', () => {
  assert.deepEqual(FREE_STORIES.map((s) => s.sourceId), ['JE-L1-18', 'JE-L1-01', 'JE-L1-17', 'JE-L1-13', 'JE-L3-C03', 'JE-L4-C02', 'JE-L5-C02']);
  for (const s of FREE_STORIES) {
    assert.match(LEVELS, new RegExp(`level: ${s.level},[\\s\\S]*?ages: "${s.ages.replace('+', '\\+')}"`), `${s.id}: age band from level data`);
    const id = s.fullBookPath.replace('/products/', '');
    assert.ok(PRODUCTS.some((p) => p.id === id && p.live), `${s.id}: ${id} is a live page`);
    assert.equal(s.pdfHref, PENDING_PDF);
  }
  assert.deepEqual(FREE_STORIES.filter((s) => s.teenOnly).map((s) => s.sourceId), ['JE-L5-C02']);
});

test('EN and VI render the seven cards, the free line, pending PDFs, links to existing pages, no buy button or price', async () => {
  const { renderRoute } = await import('../src/entry-server');
  for (const [route, locale] of [['/free-stories', 'en'], ['/vi/free-stories', 'vi']] as const) {
    const html = amp(await renderRoute(route));
    const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
    assert.equal([...main.matchAll(/data-free-story="/g)].length, 7, route);
    assert.equal([...main.matchAll(/data-pending-pdf="/g)].length, 7, `${route}: PDFs pending`);
    assert.ok(main.includes(freeStoriesContent[locale].freeLine));
    assert.ok(main.includes(freeStoriesContent[locale].teen), `${route}: 14+ label`);
    assert.ok(!main.includes('PENDING_PDF'), `${route}: placeholder never shown as a link`);
    assert.doesNotMatch(main, /data-buy-now|data-price|data-portal-buy|paypal|VietQR|\d{1,3}(\.\d{3})+\s?₫|US\$|Buy now|Mua ngay|Order on Zalo|Đặt mua/i, `${route}: no buy button or price`);
    for (const s of FREE_STORIES) assert.ok(main.includes(`href="${freeStoryHref(s.fullBookPath, locale)}"`), `${route}: ${s.id} full-book link`);
    assert.equal([...main.matchAll(/data-free-story-club="/g)].length, 4, `${route}: Story Club on the four Level 1 cards`);
    for (const m of main.matchAll(/href="([^"]+)"/g)) if (m[1].includes('#') && !m[1].startsWith('#')) assert.match(m[1].split('#')[0], /utm_source=/);
  }
});

test('twins: EN/VI copy keys match, VI marked NEEDS-NATIVE-READ, neutral headings, hreflang-free noindex draft', () => {
  assert.deepEqual(Object.keys(freeStoriesContent.en).sort(), Object.keys(freeStoriesContent.vi).sort());
  assert.equal(freeStoriesContent.en.title, 'Free stories');
  assert.equal(freeStoriesContent.vi.title, 'Truyện miễn phí');
  assert.match(read('src/i18n/content/freeStories.ts'), /NEEDS-NATIVE-READ/);
  assert.ok(FREE_STORIES.every((s) => s.en.synopsis.length > 20 && s.vi.synopsis.length > 20));
});

test('draft is noindex, out of the sitemap and every product list; no payment or header file knows it', async () => {
  assert.ok(getPrivateOrNonIndexableRoutes().includes('/free-stories'));
  assert.ok(!getExpectedPublicIndexableRoutes().some((r) => r.includes('free-stories')));
  for (const route of ['/free-stories', '/vi/free-stories']) {
    const meta = resolveRouteMetadata(route);
    assert.equal(meta.robots, 'noindex, nofollow', route);
    assert.ok(!meta.canonical, `${route}: no canonical`);
  }
  assert.ok(!PRODUCTS.some((p) => /free-/.test(p.id)) && !PAID_OFFERS.some((o) => /free-/.test(o.id)));
  for (const f of ['src/components/Navbar.tsx', 'src/config/payment.ts', 'src/config/portalBuy.ts', 'src/lib/structuredData.ts', 'scripts/generate-llms-product-catalog.mjs', 'scripts/generate-sitemap.mjs']) assert.doesNotMatch(read(f), /free-stories|freeStories/, f);
  assert.doesNotMatch(read('public/llms-products.md'), /free-stories|Free stories/);
});

test('palette, no Lina, no audio in the new page', () => {
  const css = read('src/styles/free-stories.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /#fff\b|#ffffff|white/i);
  const all = [code('src/components/FreeStoriesPage.tsx'), code('src/i18n/content/freeStories.ts'), css].join('\n');
  assert.doesNotMatch(all, /lina|<audio|autoplay|<video|\.mp3|certified|guarantee|accredited/i);
});
