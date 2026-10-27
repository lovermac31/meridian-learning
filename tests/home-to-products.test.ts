import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HomeOverhaul } from '../src/components/HomeOverhaul';
import { PRODUCTS } from '../src/i18n/content/products';
import { setServerLocation } from '../src/lib/ssrLocation';
import { orderCode } from '../src/lib/productsSource';

// Master, 27 Oct 2026 (Jay: a clean, smooth path from the home page to the products): the hero's one secondary button,
// a "Find what you need" strip under the hero, the phone mini-nav on /products and smooth anchors. Home → any product is
// two clicks: a tile (or "See all products") → that card's order button.
const amp = (s: string) => s.replaceAll('&amp;', '&');
const render = (path: string) => {
  setServerLocation(path);
  const html = amp(renderToStaticMarkup(createElement(HomeOverhaul, { onNavigate: () => {} })).replaceAll('<!-- -->', ''));
  setServerLocation('/');
  return html;
};

test('home: "See all products" beside the main hero button, tagged home-hero (EN + VI)', () => {
  for (const [path, href, label] of [['/', '/products?utm_source=home-hero', 'See all products'], ['/vi', '/vi/products?utm_source=home-hero', 'Xem tất cả sản phẩm']]) {
    const html = render(path);
    const hero = html.slice(0, html.indexOf('</section>'));
    assert.match(hero, new RegExp(`<a href="${href.replace('?', '\\?')}"[^>]*>${label}<`), path);
    assert.equal([...hero.matchAll(/<a href=/g)].length, 2, `${path}: one main and one secondary button`);
  }
});

test('home: one "Find what you need" strip right under the hero, a tile per /products section at its lowest live price', () => {
  for (const [path, base, from] of [['/', '/products', 'from'], ['/vi', '/vi/products', 'từ']] as const) {
    const html = render(path);
    const tiles = [...html.matchAll(/<a href="([^"]+)"[^>]*data-home-tile="([^"]+)">[\s\S]*?<\/a>/g)];
    assert.deepEqual(tiles.map((m) => m[2]), ['families', 'teachers', 'centres'], path);
    for (const [, href, section] of tiles.map((m) => [m[0], m[1], m[2]])) {
      assert.equal(href, `${base}?utm_source=home-tiles#${section}`, path);
      const lowest = Math.min(...PRODUCTS.filter((p) => p.live && p.section === section).map((p) => Number(p.price.replace(/[^\d]/g, ''))));
      const tile = tiles.find((m) => m[2] === section)![0];
      assert.match(tile, new RegExp(`${from} ${lowest.toLocaleString('de-DE')}₫`), `${path} ${section}: starting price`);
    }
    assert.ok(html.indexOf('data-home-tile') < html.indexOf('id="learning-paths"'), `${path}: under the hero, before the paths`);
    assert.equal([...html.matchAll(/id="find-heading"/g)].length, 1, path);
  }
});

test('/products: a phone mini-nav (Families · Teachers · Centres · IELTS) whose anchors exist; smooth, reduced-motion-safe scrolling', async () => {
  const { renderRoute } = await import('../src/entry-server');
  for (const [route, labels] of [['/products', ['Families', 'Teachers', 'Centres', 'IELTS']], ['/vi/products', ['Gia đình', 'Giáo viên', 'Trung tâm', 'IELTS']]] as const) {
    const html = await renderRoute(route);
    const nav = html.match(/<nav aria-label="[^"]+" class="sticky top-\[72px\][^"]*md:hidden" data-products-mini-nav="">[\s\S]*?<\/nav>/)?.[0] ?? '';
    const links = [...nav.matchAll(/<a href="#([^"]+)"[^>]*>([^<]+)</g)];
    assert.deepEqual(links.map((m) => m[2]), labels, route);
    for (const [, anchor] of links) assert.match(html, new RegExp(`id="${anchor}"[^>]*scroll-mt-24[^"]*max-md:scroll-mt-36|class="[^"]*scroll-mt-24[^"]*max-md:scroll-mt-36[^"]*"[^>]*id="${anchor}"|id="${anchor}" [^>]*class="[^"]*max-md:scroll-mt-36`), `${route}: #${anchor} clears the header and the mini-nav`);
    assert.ok(html.indexOf('id="ielts"') > html.indexOf('<section id="teachers"') && html.indexOf('id="ielts"') < html.indexOf('id="ielts-speaking-ladder"'), `${route}: IELTS heading before the first IELTS card`);
  }
  const css = readFileSync('src/index.css', 'utf8');
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\) \{\s*html \{ scroll-behavior: smooth; \}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?scroll-behavior: auto !important/);
});

test('home sources keep the product\'s own order code (the home page is the site itself)', () => {
  assert.equal(orderCode('home-tiles', 'teacher-pack-l1'), 'TEACHER-PACK-L1');
  assert.equal(orderCode('home-hero', 'printable-pack'), 'PRINTABLE-PACK');
  assert.equal(orderCode('fb-teachers', 'teacher-pack-l1'), 'FBT');
});
