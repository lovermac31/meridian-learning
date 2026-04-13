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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir   = path.resolve(__dirname, '..', 'dist');
const SITE_URL  = 'https://jurassicenglish.com';
const lastmod   = new Date().toISOString().split('T')[0];

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
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${getChangefreq(pathname)}</changefreq>`,
    `    <priority>${getPriority(pathname)}</priority>`,
    '  </url>',
  ].join('\n');
}

async function main() {
  const routes  = getExpectedPublicIndexableRoutes();
  const urlTags = routes.map(buildUrl).join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlTags,
    '</urlset>',
    '', // trailing newline
  ].join('\n');

  await fs.mkdir(distDir, { recursive: true });
  await fs.writeFile(path.join(distDir, 'sitemap.xml'), xml, 'utf8');

  console.log(`[generate-sitemap] wrote ${routes.length} URLs to dist/sitemap.xml`);
}

await main();
