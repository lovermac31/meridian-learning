import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import vercel from '../vercel.json';
import { isMovedToJurassicielts, movedHref, rewriteMovedLinks } from '../src/config/movedToJurassicielts.ts';
import { rewriteAiSpeakingLinks } from '../scripts/rewrite-moved-links.mjs';

// IELTS migration P10c: the Live Speaking Baseline product page pair moved to jurassicielts.com (24 Nov 2026), stacked on P10b (PR 369).
// EN /products/baseline -> JI /solutions/speaking-baseline/ ; VI /vi/products/baseline -> JI /vi/solutions/speaking-baseline/.
const JI = 'https://jurassicielts.com';
const EN_JI = `${JI}/solutions/speaking-baseline/`;
const VI_JI = `${JI}/vi/solutions/speaking-baseline/`;
type Rule = { source: string; destination: string; permanent?: boolean; statusCode?: number };
const rules = (vercel as { redirects: Rule[] }).redirects;

test('vercel.json has a permanent (308) redirect for each address, with and without the trailing slash (4 rules)', () => {
  const expected: Record<string, string> = {
    '/products/baseline': EN_JI,
    '/products/baseline/': EN_JI,
    '/vi/products/baseline': VI_JI,
    '/vi/products/baseline/': VI_JI,
  };
  for (const [source, destination] of Object.entries(expected)) {
    const hits = rules.filter((r) => r.source === source);
    assert.equal(hits.length, 1, `${source}: exactly one rule`);
    assert.equal(hits[0].destination, destination, source);
    assert.equal(hits[0].permanent, true, `${source}: permanent (Vercel answers 308)`);
    assert.equal(hits[0].statusCode, undefined, `${source}: no explicit 307/302`);
  }
});

test('the redirects are narrow: sibling products, the booking page and assets stay where they are', () => {
  for (const p of ['/products/baseline-extra', '/products/one-to-one', '/products/writing-baseline', '/vi/products/one-to-one', '/products', '/ai-speaking/baseline-x']) {
    assert.equal(rules.some((r) => r.source === p && r.destination.startsWith(JI) && r.destination.includes('speaking-baseline')), false, p);
  }
  assert.equal(isMovedToJurassicielts('/products/baseline/extra'), false);
  assert.equal(isMovedToJurassicielts('/products/one-to-one'), false);
  assert.equal(isMovedToJurassicielts('/vi/products/one-to-one'), false);
  assert.equal(movedHref('/products/writing-baseline'), `${JI}/solutions/writing-baseline/`, 'the earlier P6 move is untouched');
});

test('moved-link map: every internal link to the old pages (including the /products listing card) points straight at JurassicIELTS', () => {
  for (const p of ['/products/baseline', '/products/baseline/', 'https://jurassicenglish.com/products/baseline']) assert.equal(movedHref(p), EN_JI, p);
  for (const p of ['/vi/products/baseline', '/vi/products/baseline/', 'https://jurassicenglish.com/vi/products/baseline']) assert.equal(movedHref(p), VI_JI, p);
  assert.equal(isMovedToJurassicielts('/products/baseline'), true);
  assert.equal(isMovedToJurassicielts('/vi/products/baseline/'), true);
  const html = '<a href="/products/baseline">a</a><a href="/vi/products/baseline/">b</a><a href="/products/one-to-one">c</a>';
  assert.equal(rewriteMovedLinks(html), `<a href="${EN_JI}">a</a><a href="${VI_JI}">b</a><a href="/products/one-to-one">c</a>`);
  const built = rewriteAiSpeakingLinks('<a class="card" href="/products/baseline?checkout=1">p</a><a href="/vi/products/baseline#video">q</a>');
  assert.equal(built.changed, 2);
  assert.match(built.html, /href="https:\/\/jurassicielts\.com\/solutions\/speaking-baseline\/\?checkout=1"/);
  assert.match(built.html, /href="https:\/\/jurassicielts\.com\/vi\/solutions\/speaking-baseline\/#video"/);
});

test('the JE sitemap generator, llms.txt and the llms product catalogue no longer list the moved pages', () => {
  assert.equal(readFileSync('public/llms.txt', 'utf8').includes('products/baseline'), false);
  assert.equal(readFileSync('public/llms-products.md', 'utf8').includes('/products/baseline'), false, 'public/llms-products.md');
  assert.equal(readFileSync('public/llms-products.md', 'utf8').includes('products/one-to-one'), true, 'other live products stay listed');
  if (existsSync('dist/sitemap.xml')) {
    const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
    assert.equal(sitemap.includes('/products/baseline'), false, 'dist sitemap');
    assert.equal(sitemap.includes('/vi/products/baseline'), false, 'dist sitemap (VI)');
    assert.equal(sitemap.includes('/products/one-to-one'), true, 'dist sitemap keeps other products');
  }
});
