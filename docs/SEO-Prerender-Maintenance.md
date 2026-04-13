# SEO Prerender Maintenance Checklist

Use this checklist whenever a new public route is added to Jurassic English™.

## Required Rule
- Public and indexable routes must have prerender coverage.
- Private or non-indexable routes must be excluded from required public prerender coverage.

## Checklist
- Add or update route intent in `src/lib/routeMetadata.ts`
- If the route is public and indexable, ensure it is included by `getExpectedPublicIndexableRoutes()`
- If the route is private or non-indexable, ensure it is excluded from required public coverage
- Confirm the prerender pipeline still consumes the shared route inventory
- Run `npm run validate:prerender`
- Run `npm run build`

## Release Rule
Do not release a new public route until prerender coverage validation passes.
