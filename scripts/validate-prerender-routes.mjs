import {
  getExpectedPublicIndexableRoutes,
  getPrerenderRoutes,
  getRewriteServedRoutes,
} from '../src/lib/routeMetadata.ts';

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

const rewriteServedCount = expectedPublicRoutes.filter((route) =>
  rewriteServedRoutes.has(route),
).length;

console.log(
  `[validate-prerender-routes] verified ${
    expectedPublicRoutes.length - rewriteServedCount
  } public indexable routes with prerender coverage` +
    (rewriteServedCount > 0
      ? ` (and ${rewriteServedCount} rewrite-served route${
          rewriteServedCount === 1 ? '' : 's'
        } exempted)`
      : ''),
);
