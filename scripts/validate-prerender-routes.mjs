import {
  getExpectedPublicIndexableRoutes,
  getPrerenderRoutes,
} from '../src/lib/routeMetadata.ts';

function sortRoutes(routes) {
  return [...new Set(routes)].sort((a, b) => a.localeCompare(b));
}

const expectedPublicRoutes = sortRoutes(getExpectedPublicIndexableRoutes());
const prerenderRoutes = new Set(getPrerenderRoutes());

const missingRoutes = expectedPublicRoutes.filter((route) => !prerenderRoutes.has(route));

if (missingRoutes.length > 0) {
  console.error('Missing prerender coverage for public indexable routes:');
  for (const route of missingRoutes) {
    console.error(`- ${route}`);
  }
  console.error('Update the prerender inventory before release.');
  process.exit(1);
}

console.log(
  `[validate-prerender-routes] verified ${expectedPublicRoutes.length} public indexable routes with prerender coverage`,
);
