# Monday site-quality verification

Base: `origin/main` at `f1e1998fbc536f9c3b9b5dc5491b30a55e5bd51b`.
Fresh worktree: `.regen/runs/monday-site-quality-20261029` in the World Wide Learning workspace.
No new routes, prices, filler copy, API changes, database migrations or deployment actions.

The same offline browser audit inspected 232 built pages (223 main-site HTML pages and nine mounted Academy pages) at 375×812. It waits for hydration, scrolls to trigger below-fold content, then checks the whole document. All browser processes are muted; non-local requests and API calls are blocked. The static scanner uses actual build files, redirect targets, fragment IDs and the Academy build manifest, and rejects an SPA fallback as proof of a real page. AI Speaking paths must appear in the published sitemap; the separate existing indexability check verifies their public HTML responses without requesting an API.

| Type / measured defect | Before | After | Fix or verification |
|---|---:|---:|---|
| WCAG AA contrast failures, element occurrences across 232 pages | 973 | 0 | Dark ink on orange CTAs; readable accent text, labels and links on light surfaces; post-submit Zalo CTA cascade corrected. |
| Images without width/height, initial page state | 40 | 0 | True dimensions on all ten presentation-deck variants; dimensions also added to conditional contact QR and generated-image elements. |
| Pages with horizontal overflow at 375px | 10 | 0 | Wrap presentation-deck navigation, including translated labels. Reserve and products initial/interactive states pass at 375px. |
| Unused font preloads | 2 | 0 | Drop Lilita One on the Vietnamese Young Learners page and Neuland on the private operator screen. |
| Broken local href / asset references in built HTML and CSS | 0 | 0 | 9,303 internal hrefs and 3,711 asset references inventoried; delegated API/external-app references separately reported. CI now rejects missing targets, fragments, redirect loops, SPA soft 404s and upstream path typos. |
| Payment QR load/error scenarios exercised | 1 | 2 | Restore the QR image at the configured asset path. A successful load shows the image; onError hides it and reveals the existing Zalo-delivery fallback. Both states are tested in EN/VI at 375/1440px; no payment details invented. |
| Stale Story Quest host references in visitor-facing source inventories/components | 7 | 0 | Use the same HTTPS host as the homepage; read-only HEAD returned 200. Update strict inventory assertions and review documentation together. |
| Missing/duplicate H1, missing alt attributes, unnamed controls/links, unlabelled fields | 0 | 0 | Verified on every built page, plus reserve/payment and product/sample-dialog states. Decorative images keep empty alt text. Reserve fields also have explicit stable label associations; submit keeps its name while busy. |
| Eager below-fold images in the initial 375px layouts | 0 | 0 | Existing coverage retained; lazy loading made explicit on product artwork, teacher portrait, Rex medallion and decorative institutional images. Visible heroes remain eager. |

Counts are occurrences, not unique components. `before.json` and `after.json` list every audited route and its counts. `links.json` reports scanner totals. Existing reserve screenshots cover EN/VI at 375 and 1440px; this directory adds products screenshots and the baseline snapshot.

`/ai-speaking/baseline` is served by a different application, whose source is outside this repository. Its public SSR HTML was captured read-only and rendered locally at 375px with all scripts and network requests disabled: one H1, no overflow, all 17 controls labelled, and zero requested axe violations. `baseline-375.json` records the captured HTML SHA-256 and this limitation. This is a responsive SSR check, not a local build or integration test of that application. No booking, payment or real API request was submitted there.

Verification completed:

- Root type-check, all 451 unit/regression tests, Vite/SSR build and prerender validation pass.
- Academy build and all 13 deterministic Family Rewards tests pass; database/TLS integration tests are intentionally not invoked.
- All three muted browser acceptance tests pass: reserve funnel with the QR present and missing, and products/sample dialog, EN/VI at 375/1440px, with synthetic reserve responses only. Validation, labels, accessible names, AA contrast, overflow, modal dismissal and focus restoration are checked.
- Offline 232-page browser audit and built href/fragment/asset check pass with zero failures.
- Existing 112-link SEO asset check, 225-URL indexability check and rendered crawl-graph check pass. The latter two retain their existing warnings for duplicate upstream AI sample descriptions and redirecting upstream sample links; they do not fail and were not changed in another application's source.
- Automatic Vercel deployments are disabled for `codex/monday-site-quality-20261029` only, in both app configs, to keep this draft PR undeployed. This uses [Vercel's branch-scoped configuration](https://vercel.com/docs/project-configuration/git-configuration).

Reproduce from this worktree without loading any production environment file:

```sh
npm ci --no-audit --no-fund
npm run lint
npm test
npm run build
npm ci --prefix docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing --no-audit --no-fund
npm run test:family-rewards --prefix docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing
npm run build --prefix docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing
npm run check:links
npx playwright install chromium
npm run test:site-quality -- /tmp/site-quality.json
npm run test:browser:reserve
npm run validate:prerender
npm run verify:asset-links
npm run validate:crawl
npm run validate:indexability
```

Rollback: revert this PR. No database or external configuration rollback is needed. Keep the PR in draft; merging and deploying are outside this task.
