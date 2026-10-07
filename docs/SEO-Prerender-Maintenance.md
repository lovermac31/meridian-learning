# SEO Prerender Maintenance Checklist

Use this checklist whenever a new public route is added to Jurassic English™.

## Required Rule
- Public and indexable routes must have prerender coverage.
- Private or non-indexable routes must be excluded from required public prerender coverage.
- Every prerendered sitemap route must ship its real page body in the raw HTML
  (at least 150 visible words). Crawlers that do not run JavaScript — Bing,
  Cốc Cốc, GPTBot, ClaudeBot, PerplexityBot — index only that HTML.

## Checklist
- Add or update route intent in `src/lib/routeMetadata.ts`
- If the route is public and indexable, ensure it is included by `getExpectedPublicIndexableRoutes()`
- If the route is private or non-indexable, ensure it is excluded from required public coverage
- Keep the route's first render SSR-safe (see "Full-text prerender" below)
- Confirm the prerender pipeline still consumes the shared route inventory
- Run `npm run build`
- Run `npm run validate:prerender` (after the build — it reads `dist/`)

## Release Rule
Do not release a new public route until prerender coverage validation passes.

## Full-text prerender (server-rendered route bodies)

`npm run build` runs:

1. `vite build` — the browser bundle (`dist/`).
2. `vite build --ssr src/entry-server.tsx --outDir dist-ssr` — a build-time
   server bundle. `dist-ssr/` is never deployed (Vercel serves `dist/` only)
   and is git-ignored.
3. `scripts/prerender-yl-vi.mjs` — the Vietnamese young-learners page.
4. `scripts/prerender-route-metadata.mjs` — for every route in
   `getPrerenderRoutes()` writes `dist/<route>/index.html` with the route's
   head tags (title, description, canonical, hreflang, OG/Twitter, robots,
   JSON-LD) **and** the React app rendered for that route and locale, as the
   whole `#root` element: `<div id="root" data-prerendered-route-path="…"
   data-ssr-route="…">…page body…</div>`.
5. `scripts/generate-sitemap.mjs`.

In the browser, `src/main.tsx` **hydrates** `#root` when `data-ssr-route`
equals `window.location.pathname`; otherwise (a rewrite served another
route's file, e.g. `/pilot/:id` → `/index.html`, a trailing-slash URL, or a
client-only route) it falls back to `createRoot`, which replaces the markup.
Both entries render the same tree, `src/AppRoot.tsx`.

`scripts/validate-prerender-routes.mjs` (CI step "Validate prerender routes")
fails the PR when a prerendered sitemap route has fewer than 150 visible words
in its raw HTML body, lacks the server-rendered `#root`, or contains React
streaming markers that hide or defer the body (`<!--$?-->`, `<!--$!-->`,
`<template id="B:…">`, `$RC(`). It prints the per-route word counts.

### Keeping components SSR-safe

The server render runs in Node at build time, with no `window`, `document`,
`localStorage` or `sessionStorage`, and it cannot know the query string, hash,
or anything stored in the browser. The first client render must produce the
same markup, or React reports a hydration mismatch (minified error #418).

- Read the current path at render time through `src/lib/ssrLocation.ts`
  (`getCurrentPathname()` / `getCurrentLocation()`), or `getCurrentLocale()`.
  Never read `window.location` during render.
- Render output must depend on the **pathname only**. Query strings and hashes
  belong in effects and event handlers (see `LanguageSwitcher`, which resolves
  visibility from the pathname and keeps the full route for the switch target).
- Browser-only state (sessionStorage, localStorage, matchMedia, scroll) starts
  from the server default and is applied in `useEffect`/`useLayoutEffect`
  (see `AiSpeakingHeroSpotlight`'s minimized preference).
- No `Date.now()`, random values or locale-dependent formatting in rendered
  markup.
- Lazy route components are fine: the server render waits for every Suspense
  boundary (`onAllReady`) and keeps boundaries inline
  (`progressiveChunkSize: Infinity`).

### Client-only routes

`getClientOnlyRoutes()` in `src/lib/routeMetadata.ts` lists private, noindex,
token- or session-gated routes (`/plans-pricing-access`, `/external/pilot`,
`/internal/pilot-requests`). Their first render depends on request-time state
the build cannot know, so they keep the small static fallback and are
client-rendered. The list must stay a subset of the private routes
(`tests/prerender-ssr.test.ts`); a public route must never be client-only.

### Decisions (2026-10-07)

- **Build-time React render, no headless browser.** `react-dom/server`
  `renderToPipeableStream` + `onAllReady` over the Vite SSR bundle; nothing new
  runs on Vercel besides a second `vite build`.
- **Main stylesheet is render-blocking on server-rendered routes.** The base
  build loads it asynchronously (`asyncCssPlugin`) because the old fallback was
  styled inline. With a Tailwind-styled body in the HTML, async CSS would paint
  unstyled content first, so the prerender switches those routes back to a plain
  `<link rel="stylesheet">`. Trade-off: first paint waits for the CSS file
  (cached immutably after the first visit); in exchange the first paint is the
  real page instead of a stub that React later replaces. Watch Speed Insights
  (FCP/LCP) after deploy.
- **Hoisted resource hints go to `<head>`.** React emits image preloads ahead
  of fragment markup; the prerender moves them out of `#root`.
- **Animated sections start hidden until hydration.** Components using
  `motion` render their `initial` style (e.g. `opacity:0`) on the server, exactly
  as the first client render did before. The text is in the HTML for crawlers;
  visitors see it animate in after hydration, as before.
- **Language switcher on URLs with a query string or hash.** It used to resolve
  its visibility from the full route, so it was hidden on `?utm_…`/`#…` URLs
  while the server (which only knows the pathname) rendered it. It now resolves
  from the pathname, so it also appears on campaign-tagged URLs. This is the one
  user-visible behaviour change, required for server/client parity.

## Sitemap `<lastmod>` (honest, per page)

`scripts/generate-sitemap.mjs` sets each URL's `<lastmod>` to the committer
date of the most recent commit touching **that page's own** source and content
files, mapped in `scripts/lib/sitemap-lastmod.mjs` (page component + its
`src/i18n/content/*` module + any `src/lib/*Content.ts` it renders). Shared
chrome — `App.tsx`, Navbar, Footer, `routeMetadata.ts`, UI strings,
`index.html` — is not mapped, so a layout change does not re-date every URL.
EN and VI variants share their content modules and therefore their date.
Granularity is per file: `src/lib/seriesContent.ts` holds all five levels, so
editing one level re-dates the others.

`<lastmod>` is **omitted** (allowed by the sitemap protocol), never guessed:

- **Shallow clone.** If `git rev-parse --is-shallow-repository` is `true`, all
  lastmod values are omitted. Vercel clones with `--depth=10` by default; in a
  shallow clone the oldest fetched commit appears to add every file, so
  per-file dates are fabricated (verified locally: in a depth-10 clone
  `MethodologyPage.tsx` reads 2026-10-03; its real last change is 2026-04-22).
  **Production therefore emits no lastmod until the Vercel project has
  `VERCEL_DEEP_CLONE=true`** (Project → Settings → Environment Variables; a
  project setting change — owner decision). The build log line
  `[generate-sitemap] lastmod …` states which case applied. GitHub Actions
  (`actions/checkout`, depth 1) is also shallow, so CI omits lastmod too.
- **No git** in the build environment.
- **No honest mapping**: URLs served by other Vercel projects through
  rewrites (`/student-academy`, `/school-framework`, `/digital-reasoning-engine`,
  `/interactive-demo`, `/evidence`, `/book-diagnostic`, `/ai-speaking/*`).
- **No commit found** for the mapped files.

When you add a public route, add its source files to the map —
`tests/sitemap-lastmod.test.ts` fails for an unmapped native route and for a
mapped file that no longer exists.

## `/llms.txt`

`public/llms.txt` (served at https://jurassicenglish.com/llms.txt) is a short
plain-text map of the site for LLM crawlers, in the llmstxt.org shape: what
Jurassic English is, the main offers, curriculum/method pages, school pages,
key Vietnamese URLs and the contact route. Rules:

- Copy comes only from existing page copy and meta descriptions — no new
  claims. Keep the independence disclaimer and "not an official IELTS score".
- No prices (they change on the pages first).
- Under 60 lines; every link must be a public page in the sitemap
  (`tests/llms-txt.test.ts`). `tests/claims-safety.test.ts` scans it too.
- Update it when a main offer, its URL or its positioning changes.

## IndexNow (Bing, Yandex, Naver, Seznam.cz, Yep, Amazon)

IndexNow lets the site tell participating search engines that URLs changed,
instead of waiting for a recrawl. One POST to `https://api.indexnow.org/indexnow`
is shared with every participant. **Google is not an IndexNow participant** —
for Google use Search Console (sitemap + URL Inspection → Request indexing).

- Key: `474778a35f518368eaaf77d2571e95b3`, served from
  `public/474778a35f518368eaaf77d2571e95b3.txt` at
  https://jurassicenglish.com/474778a35f518368eaaf77d2571e95b3.txt. The key is
  public by design (engines fetch the file to verify ownership). Do not rename
  or delete the file; to rotate, add a new key file, update `INDEXNOW_KEY` in
  `scripts/lib/indexnow.mjs`, deploy, then remove the old file.
- Script: `scripts/indexnow-submit.mjs`. **Dry run by default** — it prints the
  payload and sends nothing. `--submit` sends, and first checks that the live
  key file returns exactly the key (else engines answer 403).

Run it **after** a production deploy is live, never before (engines fetch the
URLs right away):

```bash
# Everything in the live sitemap (first submission after this lands)
node scripts/indexnow-submit.mjs --source live            # review the dry run
node scripts/indexnow-submit.mjs --source live --submit

# Only pages a release changed
node scripts/indexnow-submit.mjs --submit /methodology /vi/framework
```

Responses: `200` received · `202` received, key validation pending (normal on
the first submission) · `400` bad format · `403` key file missing/mismatched ·
`422` URL not on jurassicenglish.com · `429` rate limited (retry later).
Submit only URLs that actually changed; repeated full-sitemap submissions can
be treated as spam (429).
