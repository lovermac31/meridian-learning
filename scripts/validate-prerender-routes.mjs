import {
  getExpectedPublicIndexableRoutes,
  getPrerenderRoutes,
  getRewriteServedRoutes,
} from '../src/lib/routeMetadata.ts';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  } public indexable routes with prerender coverage and route-specific fallback content` +
    (rewriteServedCount > 0
      ? ` (and ${rewriteServedCount} rewrite-served route${
          rewriteServedCount === 1 ? '' : 's'
        } exempted)`
      : ''),
);
