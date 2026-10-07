/**
 * generate-sitemap.mjs
 *
 * Generates dist/sitemap.xml from the authoritative prerender route list.
 * Run after `vite build` and `prerender-route-metadata.mjs`.
 *
 * Route source of truth: getExpectedPublicIndexableRoutes()
 * — the same function used by validate-prerender-routes.mjs to verify
 *   prerender coverage. Only indexable public routes are included;
 *   private/noindex routes (available-soon, plans-pricing-access) and
 *   scaffolded-but-unreleased /vi/* routes are excluded automatically.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getExpectedPublicIndexableRoutes } from '../src/lib/routeMetadata.ts';
import { createLastmodResolver } from './lib/sitemap-lastmod.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir   = path.resolve(__dirname, '..', 'dist');
const SITE_URL  = 'https://jurassicenglish.com';

// Per-URL lastmod = most recent commit touching that page's own source files
// (scripts/lib/sitemap-lastmod.mjs). Omitted — never guessed — when history is
// shallow/unavailable or the URL has no honest source mapping. (Phase 16 used
// one repo-wide commit date for every URL, which told crawlers nothing.)
const lastmodResolver = createLastmodResolver({ cwd: path.resolve(__dirname, '..') });

function lastmodLine(pathname) {
  const lastmod = lastmodResolver.lastmodFor(pathname);
  return lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : [];
}

/** Remove the /vi prefix to get the canonical en path for priority/changefreq lookups. */
function canonicalPath(pathname) {
  if (pathname === '/vi') return '/';
  if (pathname.startsWith('/vi/')) return pathname.slice(3);
  return pathname;
}

function getPriority(pathname) {
  const canon = canonicalPath(pathname);
  if (canon === '/')                          return '1.0';
  if (canon === '/get-started' ||
      canon === '/discovery')                 return '0.9';
  if (canon.startsWith('/legal/'))            return '0.3';
  if (canon.includes('/syllabus'))            return '0.5';
  const depth = canon.split('/').filter(Boolean).length;
  return depth === 1 ? '0.8' : '0.6';
}

function getChangefreq(pathname) {
  const canon = canonicalPath(pathname);
  if (canon === '/')                return 'weekly';
  if (canon.startsWith('/legal/')) return 'yearly';
  return 'monthly';
}

function buildUrl(pathname) {
  // Root en path is served at / — every other path appends as-is.
  const loc = pathname === '/' ? `${SITE_URL}/` : `${SITE_URL}${pathname}`;
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    ...lastmodLine(pathname),
    `    <changefreq>${getChangefreq(pathname)}</changefreq>`,
    `    <priority>${getPriority(pathname)}</priority>`,
    '  </url>',
  ].join('\n');
}

/**
 * Static landing pages that live in public/ and are served as standalone
 * HTML — not part of the Vite SPA route system. These are appended to the
 * sitemap with their own changefreq and priority values so they are
 * discovered by search engines without touching routeMetadata.ts.
 */
const STATIC_EXTRA_URLS = [
  {
    loc: `${SITE_URL}/young-learners-speaking/`,
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    // Jurassic AI Speaking (adults 18+) — separate Next.js app served via vercel.json rewrite
    loc: `${SITE_URL}/ai-speaking`,
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    loc: `${SITE_URL}/ai-speaking/pricing`,
    changefreq: 'weekly',
    priority: '0.6',
  },
  {
    loc: `${SITE_URL}/ai-speaking/vi`,
    changefreq: 'weekly',
    priority: '0.7',
  },
  {
    loc: `${SITE_URL}/ai-speaking/samples`,
    changefreq: 'monthly',
    priority: '0.6',
  },
  ...['basic', 'intermediate', 'advanced'].map((tier) => ({
    loc: `${SITE_URL}/ai-speaking/samples/${tier}`,
    changefreq: 'monthly',
    priority: '0.5',
  })),
  {
    loc: `${SITE_URL}/ai-speaking/baseline`,
    changefreq: 'weekly',
    priority: '0.7',
  },
  {
    // Prerendered Vietnamese edition — scripts/prerender-yl-vi.mjs
    loc: `${SITE_URL}/vi/luyen-noi-ielts/`,
    changefreq: 'weekly',
    priority: '0.8',
  },
];

function buildStaticUrl({ loc, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    ...lastmodLine(new URL(loc).pathname),
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

async function main() {
  const routes  = getExpectedPublicIndexableRoutes();
  const urlTags = routes.map(buildUrl).join('\n');
  const extraTags = STATIC_EXTRA_URLS.map(buildStaticUrl).join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlTags,
    extraTags,
    '</urlset>',
    '', // trailing newline
  ].join('\n');

  await fs.mkdir(distDir, { recursive: true });
  await fs.writeFile(path.join(distDir, 'sitemap.xml'), xml, 'utf8');

  const datedCount = (xml.match(/<lastmod>/g) ?? []).length;
  const totalCount = routes.length + STATIC_EXTRA_URLS.length;
  console.log(`[generate-sitemap] wrote ${routes.length} URLs (+${STATIC_EXTRA_URLS.length} static) to dist/sitemap.xml`);
  console.log(
    lastmodResolver.status === 'ok'
      ? `[generate-sitemap] lastmod from per-page git history on ${datedCount}/${totalCount} URLs (others omitted: no honest source mapping)`
      : `[generate-sitemap] lastmod omitted on all URLs: ${lastmodResolver.reason}`,
  );
}

await main();
