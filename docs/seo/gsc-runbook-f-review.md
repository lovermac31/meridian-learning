# Runbook F review packet

## Scope and status

Fresh worktree from `origin/main` at `1aae60a`. Draft only; no merge, manual deployment, GSC submission or IndexNow call.

F1: all 61 Discovered rows receive three indexed contextual sources (`/`, `/products`, `/framework`) to their final destinations. Two basic aliases deliberately remain redirects and receive no new links. Resource sections use real rendered anchors and shared SSR/client components. VI hubs keep their existing language. Two standalone directories, `/site-map` and `/vi/so-do-trang`, group all 225 indexable routes by section and are linked from native footers. These directories use no client bundle or SPA-router dependency; links to other languages identify their URL.

F2: 22 native pages and two Academy pages receive 150–300 authored words each. Worked reasoning tasks, syllabus-specific practice, preparation steps and policy-reading guidance have distinct purposes. No offers, prices or legal policy terms are changed. Baseline evidence records title, H1, template family and body-token Jaccard similarity. Shared template language is included, so this metric is diagnostic, not a semantic duplication score. Distinct intents are retained; no unjustified content merge. Thinking-cycle Article markup matches visible text. Syllabuses describe the existing Course, alongside existing Course markup on level pages. Existing FAQ structures are tested; no artificial FAQ, rating or offer is added.

F3: canonical host hrefs replace www in two Academy components and ten static film decks. Bounded read-only smoke requests verify the existing host redirects and `/index.html` (308 to canonical homepage, 200). The canonical-alternate row is annotated “query string omitted”: it is not a reproducible URL. The clean `/vi/get-started` is 200 and self-canonical; query alternatives are not new links or indexing-request targets.

## Open work: F2 is 24/25, not complete

`/ai-speaking/vi/solutions` is rewritten to a separate AI Speaking repository. Its current title, H1 and overlap with `/ai-speaking/vi/lessons` were reviewed, but no body change for it ships here. Add a specific Vietnamese worked answer and revision example in that repository; verify the published offer and visible/schema agreement, then run its tests and the combined graph checks. Keep this PR a draft until that content work is resolved.

Six live AI sample pages still link to the two basic aliases. The crawl gate reports these as `upstreamWarnings`; this repository cannot edit that app's rendered source. Repository-controlled redirect links fail the gate. Host/index.html links fail regardless of ownership. The basic aliases are absent from the sitemap and new links. Two pre-existing duplicate-description warnings on VI sample pages remain in #221's gate.

## Verification and evidence

Local type-check, 448 tests, Vite build, Academy build, 13 family-rewards tests, prerender coverage, 112 asset links, #221 indexability for 225 URLs and new crawl gate pass. All sitemap routes are at most two clicks from `/`; each Discovered final destination has three indexed contextual sources. The gate checks all indexable routes, a superset of money/SEO pages, and fails on unreadable pages, depth above three or insufficient contextual sources.

Local Playwright failed before test execution: macOS `bootstrap_check_in` / MachPortRendezvousServer permission denied. Hosted PR Quality Gate runs the existing browser acceptance on Ubuntu; record its actual result separately. Academy graph sources use the local Academy build; separate AI pages use allowlisted public GETs, five workers and 20-second timeouts. The unchanged #221 gate checks live rewritten apps and therefore cannot prove deployment of Academy edits.

The CSV is preserved under `docs/seo/data/`. Baseline sibling data comes from the unmodified build at the base commit. Rerunning `sibling-audit.mjs` on a changed build creates a new comparison, not the historical baseline. The graph, redirect smoke and table preserve all 91 rows. No database, payment, secret or customer-data operation is involved; no new environment configuration is needed.

## Reproduce

```sh
npm ci --no-audit --no-fund
npm run lint
npm test
npm run build
npm run validate:prerender
npm ci --prefix docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing --no-audit --no-fund
npm run test:family-rewards --prefix docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing
npm run build --prefix docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing
npm run verify:asset-links
npm run validate:indexability
npm run validate:crawl
npm run test:browser:reserve
```

## Rollback

Before merge: close the draft and delete its branch if rejected. After a separately approved merge/release, revert this PR as a unit through a reviewed PR. Remove directories, resource sections, editorial supplements, schema and gate together. No migration, persistent state, flag or secret rollback is needed. Production release remains the owner's decision.
