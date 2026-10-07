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
