# Dependency audit — meridian-learning — 2026-10-29

## Scope and remediation

`npm audit` initially reported 9 advisories (1 low, 3 moderate, 5 high). Applied `npm audit fix` without `--force`; then updated `tsx` from the existing `^4.21.0` range to `^4.23.15`, which brings its esbuild dependency to 0.28.2. The lockfile also contains the non-breaking Vite 6.4.5 and qs 6.16.2 resolutions. No `--force` upgrade was used.

The final audit reports 6 advisories (0 low, 2 moderate, 4 high). All remaining advisories are in the `@vercel/node` 5.10.2 development/platform adapter dependency graph: `@fastify/busboy`, `@vercel/static-config`, `ajv`, `path-to-regexp`, and `undici`. `npm audit` only offers `@vercel/node@4.0.0`, a major downgrade from the current v5 line; that change was not applied.

## Reachability assessment

Application source imports `VercelRequest` and `VercelResponse` from `@vercel/node` using TypeScript `import type`; there are no direct imports of the vulnerable packages. The flagged multipart parser and websocket paths are not called directly by application code. The adapter can still participate in Vercel's function build/runtime request handling, so the high-severity adapter advisories cannot be declared unreachable from externally supplied requests solely from repository call sites. Treat the residual as platform-adapter risk and upgrade when a fixed compatible v5 release is available; do not downgrade to v4 without a compatibility review.

## Verification

- `npm run lint`: passed.
- `npm test`: 431/431 passed.
- `npm run build`: passed; Vite emitted its existing large-chunk advisory.
- `npm run test:browser:reserve -- --workers=1`: 1/1 passed with the local browser harness.
- No database connection or migration was needed for this dependency-only change.
