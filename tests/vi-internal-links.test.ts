/**
 * Vietnamese pages link to Vietnamese URLs in the crawlable HTML.
 *
 * Crawlers that do not run JavaScript (Bing, Cốc Cốc, AI crawlers) only read
 * the href attributes in the prerendered HTML. Every route is rendered through
 * src/entry-server.tsx — the markup scripts/prerender-route-metadata.mjs
 * injects into dist/<route>/index.html — so this checks what ships, without
 * needing a build (CI runs `npm test` before `npm run build`).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderRoute } from '../src/entry-server';
import { Footer } from '../src/components/Footer';
import { Navbar } from '../src/components/Navbar';
import { ProofStrip } from '../src/components/ProofStrip';
import { getLocalizedHref } from '../src/i18n/localizedHref';
import {
  getLocaleForPathname,
  getLocalizablePublicPaths,
  getLocalizedPathname,
  isLocalizablePublicPath,
  isPrivateOrNonLocalizedPath,
  localizeRouteTarget,
} from '../src/i18n/routing';
import { setServerLocation } from '../src/lib/ssrLocation';
import {
  getClientOnlyRoutes,
  getExpectedPublicIndexableRoutes,
  getPrerenderRoutes,
  getPrivateOrNonIndexableRoutes,
  getScaffoldedLocalizedRoutes,
} from '../src/lib/routeMetadata';

const noop = () => {};
const ORIGIN = 'https://jurassicenglish.com';
const INDEXABLE = new Set(getExpectedPublicIndexableRoutes());
const NOINDEX_PLACEHOLDERS = new Set([...getScaffoldedLocalizedRoutes(), ...getPrivateOrNonIndexableRoutes()]);
const CLIENT_ONLY = new Set(getClientOnlyRoutes());
const SSR_ROUTES = getPrerenderRoutes().filter((route) => !CLIENT_ONLY.has(route));
const VI_SSR_ROUTES = SSR_ROUTES.filter((route) => getLocaleForPathname(route) === 'vi');
const EN_SSR_ROUTES = SSR_ROUTES.filter((route) => getLocaleForPathname(route) === 'en');

// Pages outside the SPA router with a verified (live, self-canonical) VI URL.
const VI_EQUIVALENTS: Record<string, string> = {
  '/young-learners-speaking/': '/vi/luyen-noi-ielts/',
  '/ai-speaking': '/ai-speaking/vi',
  '/ai-speaking/baseline': '/ai-speaking/baseline?lang=vi',
};

function hrefsIn(html: string) {
  return [...html.matchAll(/<a\b[^>]*?\shref="([^"]*)"/g)].map((match) => match[1].replace(/&amp;/g, '&'));
}

function isInternal(href: string) {
  return href.startsWith('/') && !href.startsWith('//');
}

function pathOf(href: string) {
  const { pathname } = new URL(href, ORIGIN);
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

/** Navbar (the app's first <nav>) + Footer markup of a rendered route. */
function chromeOf(html: string, route: string) {
  const navStart = html.indexOf('<nav');
  const navEnd = html.indexOf('</nav>', navStart);
  const footerStart = html.indexOf('<footer');
  const footerEnd = html.indexOf('</footer>', footerStart);
  assert.ok(navStart >= 0 && navEnd > navStart, `${route}: navbar rendered`);
  assert.ok(footerStart > navEnd && footerEnd > footerStart, `${route}: footer rendered`);
  return html.slice(navStart, navEnd) + html.slice(footerStart, footerEnd);
}

const rendered = new Map<string, string>();
async function render(route: string) {
  if (!rendered.has(route)) rendered.set(route, await renderRoute(route));
  return rendered.get(route)!;
}

test('(a) Vietnamese pages: navbar/footer links use the indexable Vietnamese URL', async () => {
  assert.ok(VI_SSR_ROUTES.length >= 30, 'every Vietnamese prerendered route is covered');
  const misses: string[] = [];

  for (const route of VI_SSR_ROUTES) {
    for (const href of hrefsIn(chromeOf(await render(route), route)).filter(isInternal)) {
      if (href in VI_EQUIVALENTS) {
        misses.push(`${route}: ${href} (expected ${VI_EQUIVALENTS[href]})`);
        continue;
      }
      const base = pathOf(href);
      if (!isLocalizablePublicPath(base) || isPrivateOrNonLocalizedPath(base)) continue;
      const viPath = getLocalizedPathname(base, 'vi');
      if (INDEXABLE.has(viPath) && pathOf(href) !== viPath) {
        misses.push(`${route}: ${href} (expected ${viPath})`);
      }
    }
  }

  assert.deepEqual(misses, []);
});

test('(a) query strings and hashes survive localization', async () => {
  const footer = chromeOf(await render('/vi'), '/vi');
  assert.ok(hrefsIn(footer).includes('/vi/get-started?interest=school_licensing'));
  assert.equal(getLocalizedHref('/series/compare#level-3', 'vi'), '/vi/series/compare#level-3');
});

// Pre-existing, outside the navbar/footer: the Level 1-4 "demo material" links
// on the series pages (SeriesSection / SeriesExperience /
// SeriesComparisonExperience) deliberately open the "available soon" page.
// Listed exactly so any other placeholder link still fails.
const KNOWN_CONTENT_PLACEHOLDER_LINK = /^\/vi\/available-soon\?resource=je-level[1-4]-demo$/;

test('(b) no link on a Vietnamese page points to a noindex placeholder or a missing /vi URL', async () => {
  const bad: string[] = [];

  for (const route of VI_SSR_ROUTES) {
    const html = await render(route);
    const chromeHrefs = new Set(hrefsIn(chromeOf(html, route)));
    for (const href of hrefsIn(html).filter(isInternal)) {
      const path = pathOf(href);
      const isViPath = path === '/vi' || path.startsWith('/vi/');
      const isPlaceholder = NOINDEX_PLACEHOLDERS.has(path) || (isViPath && !INDEXABLE.has(path) && path !== '/vi/luyen-noi-ielts');
      if (isPlaceholder && (chromeHrefs.has(href) || !KNOWN_CONTENT_PLACEHOLDER_LINK.test(href))) {
        bad.push(`${route}: ${href}`);
      }
    }
  }

  assert.deepEqual(bad, []);
});

test('English pages keep their English hrefs', () => {
  // Component-level: some English routes lazy-load the BotUI chat, whose .scss
  // import cannot load under tsx. dist/ byte-diffs cover the full pages.
  for (const route of EN_SSR_ROUTES) {
    setServerLocation(route);
    const markup = [
      renderToStaticMarkup(createElement(Navbar, {
        onGetStarted: noop, onNavigateHome: noop, onNavigate: noop, onPricingClick: noop, onEducationAffiliateClick: noop,
      })),
      renderToStaticMarkup(createElement(Footer, { onNavigate: noop })),
      renderToStaticMarkup(createElement(ProofStrip, { onNavigate: noop })),
    ].join('');
    const hrefs = hrefsIn(markup).filter(isInternal);
    assert.deepEqual(hrefs.filter((href) => pathOf(href).startsWith('/vi')), [], route);
    for (const href of ['/young-learners-speaking/', '/ai-speaking', '/ai-speaking/baseline', '/framework', '/get-started?interest=partnership']) {
      assert.ok(hrefs.includes(href), `${route}: ${href}`);
    }
  }
  setServerLocation('/');
});

test('ProofStrip links the Vietnamese young-learners page on /vi only', () => {
  setServerLocation('/vi');
  const vi = renderToStaticMarkup(createElement(ProofStrip, { onNavigate: noop }));
  setServerLocation('/');
  const en = renderToStaticMarkup(createElement(ProofStrip, { onNavigate: noop }));

  assert.ok(hrefsIn(vi).includes('/vi/luyen-noi-ielts/'));
  assert.ok(!hrefsIn(vi).includes('/young-learners-speaking/'));
  assert.ok(hrefsIn(en).includes('/young-learners-speaking/'));
});

test('getLocalizedHref never produces a placeholder and only ever returns the href or the click target', () => {
  // A plain localizeRouteTarget() would send crawlers to the noindex placeholder.
  assert.equal(localizeRouteTarget('/methodology', 'vi'), '/vi/methodology');
  assert.equal(getLocalizedHref('/methodology', 'vi'), '/methodology');
  assert.equal(getLocalizedHref('/available-soon', 'vi'), '/available-soon');
  assert.equal(getLocalizedHref('/knowledge', 'vi'), '/knowledge');
  assert.equal(getLocalizedHref('/student-academy', 'vi'), '/student-academy');

  for (const path of getLocalizablePublicPaths()) {
    for (const href of [path, `${path}?interest=partnership`]) {
      const result = getLocalizedHref(href, 'vi');
      assert.ok([href, localizeRouteTarget(href, 'vi')].includes(result), href);
      if (result !== href) assert.ok(INDEXABLE.has(pathOf(result)), `${href} -> ${result}`);
      assert.equal(getLocalizedHref(href, 'en'), href);
    }
  }

  for (const href of ['#main-content', 'mailto:info@jurassicenglish.com', 'https://www.worldwiselearning.app', '//cdn.example.com/x']) {
    assert.equal(getLocalizedHref(href, 'vi'), href);
  }
});

test('Footer hrefs are identical on the server and in the hydrating browser', () => {
  setServerLocation('/vi/framework');
  const serverMarkup = renderToStaticMarkup(createElement(Footer, { onNavigate: noop }));

  const globals = globalThis as unknown as { window?: unknown };
  const saved = globals.window;
  globals.window = { location: { pathname: '/vi/framework', search: '?utm_source=zalo', hash: '#x' } };
  try {
    assert.equal(renderToStaticMarkup(createElement(Footer, { onNavigate: noop })), serverMarkup);
  } finally {
    globals.window = saved;
    setServerLocation('/');
  }
  assert.ok(hrefsIn(serverMarkup).includes('/vi/framework'));
});
