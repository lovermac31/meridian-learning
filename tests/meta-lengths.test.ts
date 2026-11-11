/**
 * Search-result metadata limits for every public sitemap page (audit fix 10, 11 Nov 2026):
 * title ≤ 60 characters, description 120–160 characters, an og:image, and no two pages sharing a description.
 * The static challenge page lives in public/ and is checked from its HTML.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getExpectedPublicIndexableRoutes, isRewriteServedRoute, resolveRouteMetadata } from '../src/lib/routeMetadata';
import { isMovedToJurassicielts } from '../src/config/movedToJurassicielts';

// Pages served by other Vercel projects (rewrites) carry placeholder metadata here; their own repos own it.
const routes = getExpectedPublicIndexableRoutes().filter((route) => !isMovedToJurassicielts(route) && !isRewriteServedRoute(route));

test('every public page title fits a search result (≤ 60 characters)', () => {
  const tooLong = routes.map((route) => [route, resolveRouteMetadata(route).title] as const).filter(([, title]) => title.length > 60);
  assert.deepEqual(tooLong.map(([route, title]) => `${route} (${title.length})`), []);
});

test('every public page description is 120–160 characters', () => {
  const off = routes
    .map((route) => [route, resolveRouteMetadata(route).description] as const)
    .filter(([, description]) => description.length < 120 || description.length > 160);
  assert.deepEqual(off.map(([route, description]) => `${route} (${description.length})`), []);
});

test('every public page has an og:image and no description is shared', () => {
  const seen = new Map<string, string>();
  for (const route of routes) {
    const meta = resolveRouteMetadata(route);
    assert.ok(meta.og.image?.startsWith('https://'), `${route} needs an absolute og:image`);
    const earlier = seen.get(meta.description);
    assert.equal(earlier, undefined, `${route} repeats the description of ${earlier}`);
    seen.set(meta.description, route);
  }
});

test('the static one-change challenge page has a 120–160 character description and an og:image', () => {
  const html = fs.readFileSync('public/challenges/one-change/index.html', 'utf8');
  const description = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? '';
  assert.ok(description.length >= 120 && description.length <= 160, `description is ${description.length} characters`);
  assert.match(html, /<meta property="og:image" content="https:\/\/[^"]+"/);
});
