# /insights — publication layer: architecture, activation & editorial roadmap

The durable lever for AI discoverability (AI Overviews, AI Mode, Perspectives,
citation) is an **authoritative publication surface** with real, well-structured,
authored articles — not the Preferred Sources button. This PR lays the tested
foundation for that surface **without shipping any empty or fabricated pages**.

## What this PR ships (foundation only)

| Piece | File | Status |
|---|---|---|
| Article / BlogPosting JSON-LD builder | `src/lib/structuredData.ts` `createArticleJsonLd` | ✅ tested |
| Author (Person) JSON-LD builder | `src/lib/structuredData.ts` `createPersonJsonLd` | ✅ tested |
| Content model + selectors | `src/lib/insightsContent.ts` | ✅ tested, **empty** |
| Article template component | `src/components/InsightArticlePage.tsx` | ✅ builds (not yet routed) |
| This roadmap + activation spec | `docs/insights-editorial-roadmap.md` | ✅ |

`insightArticles` is **empty**, so `getInsightRoutePaths()` returns `[]` — the
section contributes nothing to the sitemap, prerender set, or router. It is
inert until a real article is added. Nothing is live.

## Activation — how to turn `/insights` on (do this with the FIRST real article)

Deliberately deferred from this PR: wiring an empty route into the hand-rolled
central router (`src/App.tsx`) adds risk with no user-visible value and can't be
preview-verified. Do it together with the first authored article, so it's tested
against real content. The hookup is small:

1. **Author the article** — add one entry to `insightArticles` in
   `src/lib/insightsContent.ts` with `status: 'published'` and a real
   `authorName`. Put the body in a small content module (e.g.
   `src/lib/insightsBodies/<slug>.tsx`) or as MDX if a loader is added.
2. **Route metadata** — in `src/lib/routeMetadata.ts` add resolvers for
   `/insights` (index) and `/insights/:slug`, following the existing
   `resolveSeriesRoute` pattern:
   - canonical via `getCanonicalPath`; `robots: 'index, follow'`;
   - `jsonLd`: `[createArticleJsonLd({...}), ...createBreadcrumbs([...])]` for an
     article; a `CollectionPage` + breadcrumb for the index.
   - Add `getInsightRoutePaths()` output into `getExpectedPublicIndexableRoutes()`.
     Sitemap, prerender coverage, hreflang and canonical then come **for free**
     from the existing build scripts — no changes to `generate-sitemap.mjs` or
     `prerender-route-metadata.mjs` needed.
3. **Router** — in `src/App.tsx`, add `isInsightsView` / `isInsightsArticleView`
   flags (mirroring `isSeriesView`) that render `InsightsIndexPage` /
   `InsightArticlePage`. Guard the match on
   `getPublishedInsightArticles().length > 0` so the route never renders an empty
   index.
4. **Preferred Sources CTA** — pass PR-A's `<PreferredSourceButton placement="article_end" variant="full" />`
   into the template's `followCta` slot (kept decoupled here so the two PRs merge
   independently).
5. **Validate** — `npm run build && npm run validate:prerender && npm test`; then
   Rich Results Test the article URL on a preview.

## Author entity (Phase 12) — needs a real person

`createArticleJsonLd` / `createPersonJsonLd` never invent an author, date, image,
or credential. Before publishing, decide the **real** author identity (name, and
optionally a `/insights/author/<slug>` profile page with `createPersonJsonLd`).
This is a content/ownership decision, not something code can fabricate.

## Topic clusters (Phase 9) — the site's genuine expertise

Academic English · **CEIW** (Claim · Evidence · Interpretation · Warrant) ·
Authentic Literature · Regulation Before Reasoning · AI + Education (teacher-led,
visible reasoning, Digital Reasoning Engine) · IELTS Speaking. Each cluster
should interlink to the relevant existing routes (`/framework`, `/methodology`,
`/thinking-cycle/compare`, `/student-academy`, the IELTS Service on `/`).

## Editorial roadmap — RECOMMENDATIONS ONLY (nothing here is published)

Draft titles aligned to the clusters and the site's real pedagogy. Each is a
prompt for a human-authored piece; **do not auto-generate these.**

1. Why Fluent English Is Not the Same as Academic English — *Academic English*
2. What CEIW Means: Claim, Evidence, Interpretation and Warrant — *CEIW*
3. Why Children Need Evidence, Not Just Opinions — *CEIW*
4. Authentic Literature vs Worksheet English — *Authentic Literature*
5. Regulation Before Reasoning — *Regulation Before Reasoning*
6. Why Quiet Learners Can Become Powerful Thinkers — *Regulation Before Reasoning*
7. AI Should Make Student Thinking Visible, Not Replace Teachers — *AI + Education*
8. How Jurassic English Uses AI Responsibly — *AI + Education*
9. Why Vocabulary Alone Does Not Produce IELTS Band 7 Speaking — *IELTS*
10. How Students Learn to Defend an Idea in English — *Academic English / CEIW*

## AI-retrievability checklist (Phase 14) for each article

Descriptive H1 · concise intro with a clear thesis · descriptive H2/H3 · define
key terms · direct answers near the top · examples + evidence · tables where
useful · a named framework where relevant · visible author + dates · references
where claims are non-obvious · a clear conclusion. Key concepts must stand alone,
independent of marketing copy.
