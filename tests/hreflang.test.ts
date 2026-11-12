/**
 * hreflang invariants (audit fix 10, 11 Nov 2026).
 *
 * - Every English-only Insights page declares its own address + x-default (the 12 flagged pages).
 * - A page that declares a translation points only at an indexable page that points back at it.
 * - No page declares hreflang to an unreleased (noindex) Vietnamese twin: Google ignores such pairs.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { getExpectedPublicIndexableRoutes, resolveRouteMetadata } from '../src/lib/routeMetadata';

const ORIGIN = 'https://jurassicenglish.com';
const routes = getExpectedPublicIndexableRoutes();
const indexable = new Set(routes);
const toPath = (href: string) => href.replace(ORIGIN, '').replace(/\/$/, '') || '/';

test('English-only Insights pages declare en + x-default pointing at themselves', () => {
  const englishOnly = routes.filter((route) => /^\/insights\/[^/]+$/.test(route))
    .filter((route) => !resolveRouteMetadata(route).alternates?.some((alt) => alt.hrefLang === 'vi'));
  assert.ok(englishOnly.length >= 12, `expected the 12 flagged Insights pages, found ${englishOnly.length}`);
  for (const route of englishOnly) {
    const alternates = resolveRouteMetadata(route).alternates ?? [];
    assert.deepEqual(
      alternates.map((alt) => `${alt.hrefLang} ${toPath(alt.href)}`).sort(),
      [`en ${route}`, `x-default ${route}`],
      `${route} must declare a self-referencing en + x-default pair`,
    );
  }
});

test('every declared alternate is an indexable page that points back (no noindex twins, no one-way pairs)', () => {
  for (const route of routes) {
    for (const alt of resolveRouteMetadata(route).alternates ?? []) {
      // The English and Vietnamese pages on jurassicielts.com are checked from that repo (it declares this page back).
      if (alt.href.startsWith('https://jurassicielts.com/')) continue;
      const target = toPath(alt.href);
      assert.ok(indexable.has(target), `${route} declares ${alt.hrefLang} → ${target}, which is not an indexable sitemap page`);
      if (target === route) continue;
      const back = (resolveRouteMetadata(target).alternates ?? []).map((a) => toPath(a.href));
      assert.ok(back.includes(route), `${target} does not point back at ${route}`);
    }
  }
});

test('x-default is declared exactly once and every declaring page lists itself', () => {
  for (const route of routes) {
    const alternates = resolveRouteMetadata(route).alternates ?? [];
    if (alternates.length === 0) continue;
    assert.equal(alternates.filter((alt) => alt.hrefLang === 'x-default').length, 1, `${route} x-default count`);
    assert.ok(alternates.some((alt) => toPath(alt.href) === route && alt.hrefLang !== 'x-default'), `${route} must list itself`);
  }
});
