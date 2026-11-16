import assert from 'node:assert/strict';
import test from 'node:test';
import { isMovedToJurassicielts, movedHref, rewriteMovedLinks } from '../src/config/movedToJurassicielts.ts';

// IELTS migration P7: movedToJurassicielts.ts reads the /ai-speaking pattern redirects from vercel.json.
const JI = 'https://jurassicielts.com';

test('/ai-speaking addresses go straight to JI with query and fragment kept', () => {
  assert.equal(movedHref('/ai-speaking?utm_source=x'), `${JI}/ai-speaking?utm_source=x`);
  assert.equal(movedHref('/ai-speaking/vi/pricing'), `${JI}/ai-speaking/vi/pricing`);
  assert.equal(movedHref('/ai-speaking/lessons?pack=lesson_single&market=india'), `${JI}/ai-speaking/lessons?pack=lesson_single&market=india`);
  assert.equal(movedHref('/ai-speaking/baseline?lang=vi&utm_source=products#top'), `${JI}/ai-speaking/baseline?lang=vi&utm_source=products#top`);
  assert.equal(movedHref('https://jurassicenglish.com/ai-speaking/pricing#x'), `${JI}/ai-speaking/pricing#x`);
  assert.equal(movedHref('/ai-speaking/one-to-one'), `${JI}/ai-speaking/solutions`);
  assert.equal(movedHref('/ai-speaking/samples/basic'), `${JI}/ai-speaking/samples`);
});

test('API, assets and the 30-day held pages stay on JE as links', () => {
  for (const p of ['/ai-speaking/api/health', '/ai-speaking/_next/static/x.js', '/ai-speaking/assets/pay/vietqr.png', '/ai-speaking/exam', '/ai-speaking/vi/exam', '/ai-speaking/solutions', '/ai-speaking/vi/solutions?x=1', '/ai-speaking/ladder', '/ai-speaking/vi/ladder/lesson/abc']) {
    assert.equal(movedHref(p), p, p);
    assert.equal(isMovedToJurassicielts(p.split('?')[0]), false, p);
  }
});

test('isMovedToJurassicielts is pattern aware', () => {
  for (const p of ['/ai-speaking', '/ai-speaking/', '/ai-speaking/pricing', '/ai-speaking/vi', '/ai-speaking/writing/demo']) assert.equal(isMovedToJurassicielts(p), true, p);
  assert.equal(isMovedToJurassicielts('/ai-speaking-notes'), false);
});

test('older exact rows keep their behaviour: query dropped, other paths unchanged', () => {
  assert.equal(movedHref('/products/story-workbooks-l1'), '/products/story-workbooks-l1');
  assert.equal(movedHref('/book-evaluation'), `${JI}/ai-speaking/baseline`);
  assert.equal(movedHref('/ai-speaking-notes'), '/ai-speaking-notes');
});

test('rewriteMovedLinks rewrites hrefs in HTML, keeping &amp; queries', () => {
  const html = '<a href="/ai-speaking/lessons?pack=lesson_month&amp;market=uae">x</a><a href="/ai-speaking/exam">y</a>';
  assert.equal(rewriteMovedLinks(html), `<a href="${JI}/ai-speaking/lessons?pack=lesson_month&amp;market=uae">x</a><a href="/ai-speaking/exam">y</a>`);
});

// Build-time pass and the plain-Node twin used by the check scripts.
import { rewriteAiSpeakingLinks } from '../scripts/rewrite-moved-links.mjs';
import { AIS_PAGE_ROUTE, movedPathMatcher } from '../scripts/lib/moved-patterns.mjs';
import vercel from '../vercel.json';

test('rewriteAiSpeakingLinks points built anchors at JI and leaves held pages, API and other links alone', () => {
  const html = [
    '<a href="/ai-speaking?utm_source=home-ielts-app">a</a>',
    '<a class="x" href="https://jurassicenglish.com/ai-speaking/baseline?market=uae&amp;x=1#h">b</a>',
    '<a href="/ai-speaking/exam">held</a>',
    '<a href="/ai-speaking/api/health">api</a>',
    '<a href="/student-academy">other</a>',
    '<link rel="canonical" href="/ai-speaking/pricing">',
  ].join('');
  const { html: out, changed } = rewriteAiSpeakingLinks(html);
  assert.equal(changed, 2);
  assert.match(out, /href="https:\/\/jurassicielts\.com\/ai-speaking\?utm_source=home-ielts-app"/);
  assert.match(out, /href="https:\/\/jurassicielts\.com\/ai-speaking\/baseline\?market=uae&amp;x=1#h"/);
  assert.match(out, /href="\/ai-speaking\/exam"/);
  assert.match(out, /href="\/ai-speaking\/api\/health"/);
  assert.match(out, /<link rel="canonical" href="\/ai-speaking\/pricing">/);
});

test('movedPathMatcher (check scripts) agrees with isMovedToJurassicielts on every AIS page route', () => {
  const moved = movedPathMatcher((vercel as { redirects: { source: string; destination: string }[] }).redirects);
  for (const p of ['/ai-speaking', '/ai-speaking/', '/ai-speaking/pricing', '/ai-speaking/vi', '/ai-speaking/vi/lessons', '/ai-speaking/exam', '/ai-speaking/vi/solutions', '/ai-speaking/ladder', '/ai-speaking/vi/ladder/lesson/x', '/ai-speaking/api/health', '/ai-speaking-notes', '/ai-speaking/typo']) {
    assert.equal(moved(p), isMovedToJurassicielts(p), p);
  }
  assert.ok(AIS_PAGE_ROUTE.test('/ai-speaking/vi/writing/report/abc'));
  assert.ok(!AIS_PAGE_ROUTE.test('/ai-speaking/typo'));
});

// Review fixes (16 Nov): crawl resources keep their AI Speaking links, now pointing at JI.
import { crawlResourceLinks } from '../src/components/CrawlResources.tsx';
import resources from '../src/content/crawlResources.json';

test('CrawlResources keeps every AI Speaking resource and points it at jurassicielts.com (held pages stay on JE)', () => {
  const all = Object.values(resources).flat();
  const ai = all.filter((l) => l.href.startsWith('/ai-speaking'));
  assert.ok(ai.length >= 10);
  const out = Object.values(resources).flatMap((links) => crawlResourceLinks(links)).filter((l) => /\/ai-speaking/.test(l.href));
  assert.equal(out.length, ai.length, 'no AI Speaking link is dropped');
  for (const link of out) {
    if (/\/ai-speaking\/(?:vi\/)?solutions$/.test(link.href)) assert.ok(link.href.startsWith('/ai-speaking'), link.href);
    else assert.ok(link.href.startsWith(`${JI}/ai-speaking`), link.href);
  }
});

test('the JE sitemap leaves out moved and held AI Speaking pages', async () => {
  const { readFile } = await import('node:fs/promises');
  const src = await readFile(new URL('../scripts/generate-sitemap.mjs', import.meta.url), 'utf8');
  assert.match(src, /isHeldAiSpeaking/);
  assert.match(src, /exam\|solutions\|ladder/);
});
