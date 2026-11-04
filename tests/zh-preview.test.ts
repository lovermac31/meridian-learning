import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { getExpectedPublicIndexableRoutes, getPrerenderRoutes, resolveRouteMetadata } from '../src/lib/routeMetadata';
import { ZH_HANS_PATH, ZH_HANT_PATH, zhPreviewPages } from '../src/i18n/content/zhPreview';

// China Option A (4 Nov 2026): unlisted Chinese previews. Machine-drafted copy, no native review yet, so noindex,
// out of the sitemap, no hreflang, linked from nowhere. Copy rules: adults 18+, practice not an official score,
// no promises, no affiliation, Mr. Jay is the only teacher (no team wording), no prices.
const PATHS = [ZH_HANS_PATH, ZH_HANT_PATH];

test('both previews are prerendered, noindex, canonical-free and out of the sitemap', () => {
  const indexable = getExpectedPublicIndexableRoutes();
  const prerendered = getPrerenderRoutes();
  for (const route of PATHS) {
    assert.ok(!indexable.includes(route), `${route} must not be in the sitemap source`);
    assert.ok(prerendered.includes(route), `${route} must be prerendered`);
    const m = resolveRouteMetadata(route);
    assert.equal(m.robots, 'noindex, nofollow', route);
    assert.equal(m.canonical, undefined, route);
    assert.equal(m.alternates, undefined, route);
    assert.equal(m.htmlLang, route === ZH_HANS_PATH ? 'zh-Hans' : 'zh-Hant');
  }
  const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
  for (const source of ['/zh-hans/(.*)', '/zh-hant/(.*)']) {
    const rule = vercel.headers.find((h: { source: string }) => h.source === source);
    assert.ok(rule, `vercel.json needs a ${source} header rule`);
    assert.ok(rule.headers.some((h: { key: string; value: string }) => h.key === 'X-Robots-Tag' && h.value.includes('noindex')), source);
  }
  assert.doesNotMatch(readFileSync('public/robots.txt', 'utf8'), /zh-han/, 'robots.txt must not name the unlisted URLs');
});

test('copy rules: no team wording, no prices, no promises, practice-only and no-affiliation lines present', () => {
  assert.equal(zhPreviewPages.length, 2);
  for (const page of zhPreviewPages) {
    const all = JSON.stringify(page);
    assert.doesNotMatch(all, /团队|團隊|團隊|team|师资团|教師團/i, `${page.path}: no team wording`);
    assert.doesNotMatch(all, /₫|VND|US\$|\$\d|元|万|保证|保證|一定|最快|包过|包過/, `${page.path}: no prices or promises`);
    assert.match(page.estimate, /不是雅思官方成[绩績]/, `${page.path}: estimate, not official`);
    assert.match(page.practiceTitle, /18 岁|18 歲/, `${page.path}: adults 18+`);
    assert.match(page.practice, /不是官方成[绩績]/, `${page.path}: practice only`);
    assert.match(page.affiliation, /IDP/, `${page.path}: no-affiliation line`);
    assert.match(page.teacher, /Mr\. Jay/, `${page.path}: sole teacher named`);
    assert.ok(page.title.length <= 32, `${page.path}: title length ${page.title.length}`);
    assert.ok(page.description.length <= 80, `${page.path}: description length ${page.description.length}`);
  }
});

test('the rounding table matches the English calculator rule', () => {
  const expected: Record<string, string> = { '6.000': '6.0', '6.125': '6.0', '6.250': '6.5', '6.375': '6.5', '6.500': '6.5', '6.625': '6.5', '6.750': '7.0', '6.875': '7.0' };
  for (const page of zhPreviewPages) {
    assert.deepEqual(Object.fromEntries(page.rounding), expected, page.path);
  }
});

test('each page renders its own script, links only the English tool and the practice page, and no site chrome', async () => {
  const { renderRoute } = await import('../src/entry-server');
  for (const page of zhPreviewPages) {
    const html = await renderRoute(page.path);
    assert.ok(html.includes(`<h1 class="text-3xl font-semibold text-sb-forest">${page.h1}</h1>`), `${page.path}: h1`);
    assert.ok(html.includes(`lang="${page.script}"`), `${page.path}: lang attribute`);
    const main = html.slice(html.indexOf('<main'), html.indexOf('</main>') + 7);
    const hrefs = [...main.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replaceAll('&amp;', '&'));
    assert.equal(hrefs.length, 2, `${page.path}: two links in the body`);
    assert.ok(hrefs[0] === '/tools/ielts-band-score-calculator' && hrefs[1].startsWith('https://ielts.jurassicenglish.com/'), `${page.path}: ${hrefs.join(' ')}`);
    assert.ok(!html.includes('header-products-link'), `${page.path}: no site header`);
  }
});

test('nothing on the site links to the previews', () => {
  const allowed = new Set(['src/i18n/content/zhPreview.ts', 'src/components/ZhPreviewPage.tsx', 'src/App.tsx', 'src/lib/routeMetadata.ts']);
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? walk(path) : [path];
    });
  for (const file of walk('src')) {
    if (allowed.has(file) || !/\.(tsx?|json|html|css)$/.test(file)) continue;
    assert.ok(!/zh-han[st]\//.test(readFileSync(file, 'utf8')), `${file} must not link the unlisted previews`);
  }
});
