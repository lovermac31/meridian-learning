/**
 * No internal link goes nowhere.
 *
 * Every server-rendered route is rendered through src/entry-server.tsx (the
 * markup that ships in dist/<route>/index.html), and every internal href is
 * checked against what the deployment can actually serve: an SPA route, a
 * vercel.json rewrite or redirect source, an /api function, or a file or
 * directory in public/. A link that matches none of these is a 404 or a silent
 * homepage fallback for the visitor.
 *
 * Rule for fixing a failure (Jay, 26 Oct 2026): a parent-facing dead end goes
 * to /ai-speaking/lessons (1-to-1 with Mr. Jay); anything else goes to
 * /get-started (contact). Route the fix through getLocalizedHref.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { register } from 'node:module';
import { join } from 'node:path';
import { getClientOnlyRoutes, getPrerenderRoutes } from '../src/lib/routeMetadata';

// Some English routes lazy-load the BotUI chat, whose .scss import tsx cannot
// load. Stylesheets carry no links, so they load as empty modules here.
register(
  'data:text/javascript,' +
    encodeURIComponent(
      'export async function load(url, context, next) {' +
        " if (/\\.s?css(\\?.*)?$/.test(url)) return { format: 'module', source: 'export default {}', shortCircuit: true };" +
        ' return next(url, context); }',
    ),
);
const { renderRoute } = await import('../src/entry-server');

const ORIGIN = 'https://jurassicenglish.com';
const ROOT = join(import.meta.dirname, '..');
const CLIENT_ONLY = new Set(getClientOnlyRoutes());
const SSR_ROUTES = getPrerenderRoutes().filter((route) => !CLIENT_ONLY.has(route));

function normalize(pathname: string) {
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

const SPA_ROUTES = new Set(getPrerenderRoutes().map(normalize));

/** vercel.json rewrite/redirect sources as matchers (`:x*`, `:x(.*)`, `:x(.+)`, `:x`). */
const vercel = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8')) as {
  rewrites?: { source: string; has?: unknown }[];
  redirects?: { source: string; has?: unknown }[];
};
const VERCEL_MATCHERS = [...(vercel.rewrites ?? []), ...(vercel.redirects ?? [])]
  // Host-conditioned rules (e.g. www → apex) don't make a path exist.
  .filter((rule) => !rule.has)
  .map((rule) => {
    const pattern = rule.source
      .replace(/[.]/g, '\\.')
      .replace(/:[A-Za-z]+\((\.\*|\.\+)\)/g, '($1)')
      .replace(/:[A-Za-z]+\*/g, '(.*)')
      .replace(/:[A-Za-z]+/g, '([^/]+)');
    return new RegExp(`^${pattern}/?$`);
  });

// Vite multi-page inputs and their build-time VI copy (vite.config.ts input,
// scripts/prerender-yl-vi.mjs). They live outside the SPA router and public/.
const STATIC_PAGES = new Set(['/young-learners-speaking', '/vi/luyen-noi-ielts']);

function servedByPublic(pathname: string) {
  const file = join(ROOT, 'public', decodeURIComponent(pathname));
  if (!existsSync(file)) return false;
  return statSync(file).isFile() || existsSync(join(file, 'index.html'));
}

function isServed(pathname: string) {
  const path = normalize(pathname);
  return (
    SPA_ROUTES.has(path) ||
    STATIC_PAGES.has(path) ||
    path.startsWith('/api/') ||
    VERCEL_MATCHERS.some((re) => re.test(path) || re.test(`${path}/`)) ||
    servedByPublic(path)
  );
}

function internalHrefs(html: string) {
  return [...html.matchAll(/<a\b[^>]*?\shref="([^"]*)"/g)]
    .map((match) => match[1].replace(/&amp;/g, '&'))
    .filter((href) => href.startsWith('/') && !href.startsWith('//'));
}

test('the matcher itself: real routes pass, made-up ones fail', () => {
  for (const ok of ['/', '/get-started', '/vi/get-started', '/ai-speaking/lessons', '/young-learners-speaking/', '/legal/privacy']) {
    assert.ok(isServed(ok), `${ok} should be served`);
  }
  for (const bad of ['/contact', '/story-club-typo', '/vi/not-a-page']) {
    assert.equal(isServed(bad), false, `${bad} should not be served`);
  }
});

test('no server-rendered page links to a path the deployment cannot serve', async () => {
  const dead: string[] = [];
  for (const route of SSR_ROUTES) {
    const html = await renderRoute(route);
    for (const href of internalHrefs(html)) {
      const { pathname } = new URL(href, ORIGIN);
      if (!isServed(pathname)) dead.push(`${route} → ${href}`);
    }
  }
  assert.deepEqual([...new Set(dead)], [], `dead internal links:\n${[...new Set(dead)].join('\n')}`);
});
