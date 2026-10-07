import {
  getClientOnlyRoutes,
  getExpectedPublicIndexableRoutes,
  getPrerenderRoutes,
  getRewriteServedRoutes,
} from '../src/lib/routeMetadata.ts';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { countVisibleWords } from './lib/visible-text.mjs';

/**
 * Minimum visible words in the raw HTML <body> of every prerendered sitemap
 * route. Crawlers that do not execute JavaScript (Bing, Coc Coc, GPTBot,
 * ClaudeBot, PerplexityBot) index only this text. Before server rendering the
 * fallback stubs carried 25–97 words; real pages carry several hundred.
 */
const MIN_VISIBLE_WORDS = 150;

// Markers of React streaming output that hide or defer the page body.
const OUTLINED_BOUNDARY_PATTERNS = [
  ['pending Suspense boundary <!--$?-->', /<!--\$\?-->/],
  ['client-rendered Suspense boundary <!--$!-->', /<!--\$!-->/],
  ['outlined boundary <template id="B:">', /<template id="B:/],
  ['streaming completion script $RC(', /\$RC\(/],
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');

function sortRoutes(routes) {
  return [...new Set(routes)].sort((a, b) => a.localeCompare(b));
}

const expectedPublicRoutes = sortRoutes(getExpectedPublicIndexableRoutes());
const prerenderRoutes = new Set(getPrerenderRoutes());

// Routes served by external Vercel rewrites are public + indexable but are
// intentionally not prerendered locally — the SPA has no view for them.
// Exempt them from the coverage check so the build does not fail.
const rewriteServedRoutes = new Set(getRewriteServedRoutes());

const missingRoutes = expectedPublicRoutes.filter(
  (route) => !prerenderRoutes.has(route) && !rewriteServedRoutes.has(route),
);

if (missingRoutes.length > 0) {
  console.error('Missing prerender coverage for public indexable routes:');
  for (const route of missingRoutes) {
    console.error(`- ${route}`);
  }
  console.error('Update the prerender inventory before release.');
  process.exit(1);
}

const clientOnlyRoutes = new Set(getClientOnlyRoutes());
const sitemapRoutes = new Set(expectedPublicRoutes);
const wordCounts = [];

const fallbackErrors = [];
for (const route of prerenderRoutes) {
  const filePath = route === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, route.replace(/^\/+/, ''), 'index.html');

  if (!fs.existsSync(filePath)) {
    fallbackErrors.push(`${route}: generated HTML file is missing`);
    continue;
  }

  const html = fs.readFileSync(filePath, 'utf8');
  const expectedMarker = `data-prerendered-route-path="${route}"`;
  if (!html.includes(expectedMarker)) {
    fallbackErrors.push(`${route}: route-specific fallback marker is missing`);
  }
  if (!/<h1[\s>]/.test(html)) {
    fallbackErrors.push(`${route}: semantic fallback H1 is missing`);
  }
  if (route !== '/' && html.includes('Critical thinking <span style="color:#F26419;">through literature.</span>')) {
    fallbackErrors.push(`${route}: inherited the homepage fallback body`);
  }

  if (clientOnlyRoutes.has(route)) {
    if (sitemapRoutes.has(route)) {
      fallbackErrors.push(`${route}: is in the sitemap but marked client-only (no server-rendered body)`);
    }
    continue;
  }

  if (!html.includes(`<div id="root" data-prerendered-route-path="${route}" data-ssr-route="${route}">`)) {
    fallbackErrors.push(`${route}: server-rendered #root (data-ssr-route) is missing — the page body was not prerendered`);
  }
  for (const [label, pattern] of OUTLINED_BOUNDARY_PATTERNS) {
    if (pattern.test(html)) fallbackErrors.push(`${route}: contains a ${label}`);
  }

  const words = countVisibleWords(html);
  const inSitemap = sitemapRoutes.has(route);
  wordCounts.push({ route, words, inSitemap });
  if (inSitemap && words < MIN_VISIBLE_WORDS) {
    fallbackErrors.push(
      `${route}: only ${words} visible words in the raw HTML body (minimum ${MIN_VISIBLE_WORDS} for sitemap routes)`,
    );
  }
}

console.log('[validate-prerender-routes] visible words in raw HTML body (sitemap routes marked *):');
for (const { route, words, inSitemap } of wordCounts) {
  console.log(`  ${inSitemap ? '*' : ' '} ${String(words).padStart(5)}  ${route}`);
}

if (fallbackErrors.length > 0) {
  console.error('Invalid prerender route fallback content:');
  for (const error of fallbackErrors) console.error(`- ${error}`);
  process.exit(1);
}

const rewriteServedCount = expectedPublicRoutes.filter((route) =>
  rewriteServedRoutes.has(route),
).length;

console.log(
  `[validate-prerender-routes] verified ${
    expectedPublicRoutes.length - rewriteServedCount
  } public indexable routes with prerender coverage and server-rendered page bodies ` +
    `(min ${Math.min(...wordCounts.filter((entry) => entry.inSitemap).map((entry) => entry.words))} ` +
    `visible words; floor ${MIN_VISIBLE_WORDS})` +
    (rewriteServedCount > 0
      ? ` (and ${rewriteServedCount} rewrite-served route${
          rewriteServedCount === 1 ? '' : 's'
        } exempted)`
      : ''),
);
