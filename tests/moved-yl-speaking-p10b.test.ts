import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vercel from '../vercel.json';
import { isMovedToJurassicielts, movedHref, rewriteMovedLinks } from '../src/config/movedToJurassicielts.ts';
import { rewriteAiSpeakingLinks } from '../scripts/rewrite-moved-links.mjs';

// IELTS migration P10b: IELTS Speaking Coaching, Ages 9-18 moved to jurassicielts.com (23 Nov 2026).
// EN /young-learners-speaking/ -> JI /young-learners-speaking/ ; VI /vi/luyen-noi-ielts/ -> JI /vi/young-learners-speaking/.
const JI = 'https://jurassicielts.com';
const EN_JI = `${JI}/young-learners-speaking/`;
const VI_JI = `${JI}/vi/young-learners-speaking/`;
type Rule = { source: string; destination: string; permanent?: boolean; statusCode?: number };
const rules = (vercel as { redirects: Rule[] }).redirects;

test('vercel.json has a permanent (308) redirect for each address, with and without the trailing slash', () => {
  const expected: Record<string, string> = {
    '/young-learners-speaking': EN_JI,
    '/young-learners-speaking/': EN_JI,
    '/vi/luyen-noi-ielts': VI_JI,
    '/vi/luyen-noi-ielts/': VI_JI,
  };
  for (const [source, destination] of Object.entries(expected)) {
    const hits = rules.filter((r) => r.source === source);
    assert.equal(hits.length, 1, `${source}: exactly one rule`);
    assert.equal(hits[0].destination, destination, source);
    assert.equal(hits[0].permanent, true, `${source}: permanent (Vercel answers 308)`);
    assert.equal(hits[0].statusCode, undefined, `${source}: no explicit 307/302`);
  }
});

test('the redirects are narrow: page assets under the old path and unrelated addresses are not moved', () => {
  assert.equal(isMovedToJurassicielts('/young-learners-speaking/assets/images/je-logo.png'), false);
  assert.equal(isMovedToJurassicielts('/young-learners-speaking-notes'), false);
  assert.equal(isMovedToJurassicielts('/vi/luyen-noi-ielts/extra'), false);
  assert.equal(isMovedToJurassicielts('/student-academy'), false);
});

test('moved-link map: every internal link to the old pages points straight at JurassicIELTS', () => {
  for (const p of ['/young-learners-speaking', '/young-learners-speaking/', `https://jurassicenglish.com/young-learners-speaking/`]) assert.equal(movedHref(p), EN_JI, p);
  for (const p of ['/vi/luyen-noi-ielts', '/vi/luyen-noi-ielts/', 'https://jurassicenglish.com/vi/luyen-noi-ielts/']) assert.equal(movedHref(p), VI_JI, p);
  assert.equal(isMovedToJurassicielts('/young-learners-speaking/'), true);
  assert.equal(isMovedToJurassicielts('/vi/luyen-noi-ielts/'), true);
  const html = '<a href="/young-learners-speaking/">a</a><a href="/vi/luyen-noi-ielts/">b</a><a href="/young-learners-speaking/assets/x.png">c</a>';
  assert.equal(rewriteMovedLinks(html), `<a href="${EN_JI}">a</a><a href="${VI_JI}">b</a><a href="/young-learners-speaking/assets/x.png">c</a>`);
  const built = rewriteAiSpeakingLinks('<a class="x" href="/young-learners-speaking/#pricing">p</a><a href="/vi/luyen-noi-ielts/?utm_source=a&amp;x=1">q</a>');
  assert.equal(built.changed, 2);
  assert.match(built.html, /href="https:\/\/jurassicielts\.com\/young-learners-speaking\/#pricing"/);
  assert.match(built.html, /href="https:\/\/jurassicielts\.com\/vi\/young-learners-speaking\/\?utm_source=a&amp;x=1"/);
});

test('llms.txt no longer lists the moved pages', () => {
  const llms = readFileSync('public/llms.txt', 'utf8');
  assert.equal(llms.includes('young-learners-speaking'), false);
  assert.equal(llms.includes('luyen-noi-ielts'), false);
});

test('the JE sitemap generator no longer lists the moved pages', () => {
  const generator = readFileSync('scripts/generate-sitemap.mjs', 'utf8');
  assert.equal(generator.includes('/young-learners-speaking/'), false);
  assert.equal(generator.includes('/vi/luyen-noi-ielts/'), false);
});
