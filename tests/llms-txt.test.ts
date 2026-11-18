/**
 * public/llms.txt — the plain-text site summary for LLM crawlers
 * (https://llmstxt.org). It must stay short, factual and built only from
 * existing site content; claims-safety.test.ts also scans it for guarantees,
 * credential and endorsement claims.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getExpectedPublicIndexableRoutes } from '../src/lib/routeMetadata';

const LLMS = readFileSync(new URL('../public/llms.txt', import.meta.url), 'utf8');

// Public pages outside the SPA route inventory (see generate-sitemap.mjs STATIC_EXTRA_URLS).
const STATIC_PUBLIC_PATHS = [
  '/challenges/one-change',
  '/young-learners-speaking/',
  '/vi/luyen-noi-ielts/',
  '/ai-speaking',
  '/ai-speaking/vi',
  '/ai-speaking/solutions',
  '/sitemap.xml',
  '/llms-products.md',
];

test('llms.txt follows the llmstxt.org shape and stays under 60 lines', () => {
  const lines = LLMS.trimEnd().split('\n');
  assert.ok(lines.length < 60, `llms.txt has ${lines.length} lines`);
  assert.match(lines[0], /^# Jurassic English/);
  assert.ok(lines.some((line) => line.startsWith('> ')), 'needs a blockquote summary');
  assert.match(LLMS, /^## /m);
});

test('every link points at a live public jurassicenglish.com page', () => {
  const allowed = new Set([...getExpectedPublicIndexableRoutes(), ...STATIC_PUBLIC_PATHS]);
  const urls = [...LLMS.matchAll(/https?:\/\/[^\s)]+/g)].map((match) => match[0]);
  assert.ok(urls.length >= 15);
  for (const url of urls) {
    const parsed = new URL(url);
    // The IELTS Speaking articles moved to the sister site in Stage 2 (#295/#296); link their live homes, not the 308s.
    if (parsed.origin === 'https://jurassicielts.com') {
      // P7: the AI Speaking home pages moved to jurassicielts.com/ai-speaking.
      // P10: every IELTS address points straight at jurassicielts.com (guides hub, One Change, the sister-brand home).
      assert.match(parsed.pathname, /^\/(?:speaking\/articles\/[a-z0-9-]+\/|ai-speaking(?:\/vi)?|ai-speaking\/solutions|guides\/|practice\/one-change\/)?$/, url);
      continue;
    }
    assert.equal(parsed.origin, 'https://jurassicenglish.com', url);
    assert.ok(allowed.has(parsed.pathname), `${url} is not a public sitemap page`);
  }
});

test('keeps the site’s own scoring and independence disclaimers, and no prices', () => {
  assert.match(LLMS, /not an official IELTS score/);
  assert.match(LLMS, /not endorsed by or affiliated with IELTS/);
  assert.doesNotMatch(LLMS, /₫|\bVND\b|\$\s?\d|\bUSD\b/, 'prices change; keep them on the pages');
});

test('surfaces the public IELTS Speaking discovery cluster', () => {
  for (const path of [
    '/about/nathaniel-jay-adams',
  ]) {
    assert.match(LLMS, new RegExp(`https://jurassicenglish\\.com${path.replaceAll('/', '\\/')}(?:[)\\s])`));
  }
  // IELTS migration P10: no moved or held IELTS address is listed as Jurassic English's; JurassicIELTS is named as the sister brand.
  assert.doesNotMatch(LLMS, /jurassicenglish\.com\/(?:ai-speaking|insights|tools|challenges\/one-change|ielts-speaking-online)/);
  assert.match(LLMS, /sister brand for IELTS/);
  assert.ok(LLMS.includes('https://jurassicielts.com/guides/)'));
  for (const slug of ['choose-one-speaking-priority', 'what-typed-speaking-practice-can-assess', 'from-speaking-diagnostic-to-one-to-one-lesson']) {
    assert.ok(LLMS.includes(`https://jurassicielts.com/speaking/articles/${slug}/)`), slug);
  }
});
