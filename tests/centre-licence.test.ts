import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { getLocalizedPathname, resolveLocalizedRoute } from '../src/i18n/routing';
import { isPublicContentReleased } from '../src/i18n/content';
import { getExpectedPublicIndexableRoutes, getPrerenderRoutes, resolveRouteMetadata } from '../src/lib/routeMetadata';
import { CENTRE_LICENCE_ZALO, FOUNDING_PRICE, centreLicenceContent } from '../src/i18n/content/centreLicence';

// Unlisted Level 1 Centre Licence page (master directive L-4, 27 Oct 2026). Rules come from the Notion
// "L1 Centre Licence — Launch Kit Spec": shared only in Zalo, so noindex, out of the sitemap and linked from
// nowhere; one call to action; no price number; no published book title in selling copy; no outcome claims.
const EN = '/centres/level-1';
const VI = '/vi/centres/level-1';
const mainOf = (html: string) => html.slice(html.indexOf('<main'), html.indexOf('</main>') + 7);

test('the page is paired EN/VI, prerendered and noindex, and stays out of the sitemap', () => {
  assert.equal(isPublicContentReleased(EN, 'vi'), true);
  assert.equal(getLocalizedPathname(EN, 'vi'), VI);
  assert.equal(resolveLocalizedRoute(VI).pathname, EN);
  const indexable = getExpectedPublicIndexableRoutes();
  const prerendered = getPrerenderRoutes();
  for (const route of [EN, VI]) {
    assert.ok(!indexable.includes(route), `${route} must not be in the sitemap source`);
    assert.ok(prerendered.includes(route), `${route} must be prerendered`);
    const m = resolveRouteMetadata(route);
    assert.equal(m.robots, 'noindex, nofollow', route);
    assert.equal(m.canonical, undefined, route);
    assert.equal(m.alternates, undefined, route);
    assert.doesNotMatch(m.description, /₫|\d{3}\.\d{3}|US\$/, `${route}: no price in the description`);
  }
  const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
  for (const source of ['/centres/(.*)', '/vi/centres/(.*)']) {
    const rule = vercel.headers.find((h: { source: string }) => h.source === source);
    assert.ok(rule, `vercel.json needs a ${source} header rule`);
    assert.ok(rule.headers.some((h: { key: string; value: string }) => h.key === 'X-Robots-Tag' && h.value.includes('noindex')), source);
  }
  assert.doesNotMatch(readFileSync('public/robots.txt', 'utf8'), /centres/, 'robots.txt must not name the unlisted URL');
});

test('nothing on the site links to the page', async () => {
  const allowed = new Set([
    'src/i18n/content/centreLicence.ts',
    'src/i18n/content/index.ts',
    'src/i18n/routing.ts',
    'src/lib/routeMetadata.ts',
    'src/App.tsx',
  ]);
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? walk(path) : [path];
    });
  for (const file of walk('src')) {
    if (allowed.has(file) || !/\.(tsx?|json|html|css)$/.test(file)) continue;
    assert.ok(!readFileSync(file, 'utf8').includes('centres/level-1'), `${file} must not link the unlisted page`);
  }
  const { renderRoute } = await import('../src/entry-server');
  // Routes that load the chat widget (its .scss) cannot render in Node; the source scan above covers them.
  for (const route of ['/vi', '/story-club', '/vi/story-club', '/ielts-speaking-online/india']) {
    assert.ok(!(await renderRoute(route)).includes('centres/level-1'), `${route} must not link the unlisted page`);
  }
});

test('one call to action: every button opens Mr. Jay’s Zalo with the centre-page tag, and the site chrome is off', async () => {
  const { renderRoute } = await import('../src/entry-server');
  assert.match(CENTRE_LICENCE_ZALO, /^https:\/\/zalo\.me\/84396085076\?utm_source=centre-page$/);
  for (const [route, counterpart] of [[EN, VI], [VI, EN]]) {
    const html = await renderRoute(route);
    const ctas = [...html.matchAll(/data-cta="([^"]+)"/g)].map((m) => m[1]);
    assert.ok(ctas.length >= 2, `${route}: ${ctas.length} buttons`);
    assert.deepEqual([...new Set(ctas)], ['centre-licence-zalo'], `${route}: one kind of button`);
    const hrefs = new Set([...mainOf(html).matchAll(/href="([^"]+)"/g)].map((m) => m[1].replaceAll('&amp;', '&')));
    assert.deepEqual([...hrefs].sort(), [CENTRE_LICENCE_ZALO, counterpart].sort(), `${route}: the body links only Zalo and its other language`);
    // No site header (and its Baseline button), footer navigation or contact launcher on this page.
    assert.ok(!html.includes('data-contact-panel'), `${route}: no contact launcher`);
    assert.ok(!html.includes('aria-label="Footer"'), `${route}: no site footer navigation`);
    assert.ok(!/Baseline/.test(html), `${route}: no Baseline header button`);
  }
});

test('no price number: the single price slot says "on request"', async () => {
  const { renderRoute } = await import('../src/entry-server');
  assert.equal(FOUNDING_PRICE, null, 'the spec keeps the number in the order summary only');
  for (const route of [EN, VI]) {
    const html = await renderRoute(route);
    assert.doesNotMatch(html, /\d[\d.,]*\s*(?:₫|VND|VNĐ)|US\$/, `${route}: no price number anywhere`);
    assert.equal([...html.matchAll(/data-price-slot=/g)].length, 1, `${route}: one price slot`);
  }
  assert.match(mainOf(await renderRoute(EN)), /Price on request/);
  assert.match(mainOf(await renderRoute(VI)), /Giá: liên hệ/);
});

test('the selling copy names no published book, author or story detail, and makes no outcome claims', async () => {
  const { renderRoute } = await import('../src/entry-server');
  const published = [
    'Hungry Caterpillar', 'Eric Carle', 'Wild Things', 'Sendak', 'Giving Tree', 'Silverstein', 'Snowy Day', 'Keats',
    'Sylvester', 'Magic Pebble', 'Steig', 'Stellaluna', 'Frog and Toad', 'Lobel', 'Owl at Home', 'Rumphius', 'Cooney',
    'Sneetches', 'Seuss', 'Frederick', 'Lionni',
  ];
  for (const route of [EN, VI]) {
    const html = await renderRoute(route);
    for (const name of published) assert.ok(!html.toLowerCase().includes(name.toLowerCase()), `${route}: "${name}"`);
    const body = mainOf(html);
    assert.doesNotMatch(body, /\b(?:boy|stump|apples|shade)\b/i, `${route}: Lesson 09 excerpt carries no story-specific detail`);
    assert.doesNotMatch(body, /certif|accredit|guarantee|chứng nhận|cam kết|bảo đảm|đảm bảo/i, `${route}: no certification or guarantee claims`);
    assert.doesNotMatch(body, /American Study|SACE|testimonial/i, `${route}: no clients or references`);
    assert.doesNotMatch(body, /\b(?:four|4) lessons|\b4 bài|bốn bài/i, `${route}: no "four lessons per book"`);
  }
});

test('both languages carry the same structure', () => {
  const { en, vi } = centreLicenceContent;
  assert.equal(vi.why.items.length, en.why.items.length);
  assert.equal(vi.inside.items.length, en.inside.items.length);
  assert.equal(vi.lesson.phases.length, en.lesson.phases.length);
  assert.equal(vi.books.items.length, 3);
  assert.deepEqual(vi.books.items.map((b) => b.id), en.books.items.map((b) => b.id));
  assert.equal(en.faq.items.length, 5);
  assert.equal(vi.faq.items.length, 5);
  for (const book of en.books.items) statSync(`public/images/centres/${book.id}.webp`);
});
