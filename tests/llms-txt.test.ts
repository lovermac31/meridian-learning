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
  '/young-learners-speaking/',
  '/vi/luyen-noi-ielts/',
  '/ai-speaking',
  '/ai-speaking/vi',
  '/ai-speaking/one-to-one',
  '/sitemap.xml',
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
    '/ai-speaking/one-to-one',
    '/insights',
    '/insights/what-to-fix-first-in-ielts-speaking',
    '/insights/what-typed-speaking-practice-can-assess',
    '/insights/from-speaking-diagnostic-to-one-to-one-lesson',
    '/about/nathaniel-jay-adams',
  ]) {
    assert.match(LLMS, new RegExp(`https://jurassicenglish\\.com${path.replaceAll('/', '\\/')}(?:[)\\s])`));
  }
});
