import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ROBOTS = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');

test('robots.txt advertises the JE sitemap (the AI Speaking sitemap moved to jurassicielts.com in P7)', () => {
  const sitemapLines = ROBOTS.split('\n').filter((line) => line.startsWith('Sitemap: '));
  assert.deepEqual(sitemapLines, [
    'Sitemap: https://jurassicenglish.com/sitemap.xml',
  ]);
});

test('robots.txt keeps private application surfaces out of search', () => {
  assert.match(ROBOTS, /^Disallow: \/api\/$/m);
  assert.match(ROBOTS, /^Disallow: \/available-soon$/m);
  assert.match(ROBOTS, /^Disallow: \/plans-pricing-access$/m);
});
