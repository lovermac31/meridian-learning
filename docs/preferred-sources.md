# Google Preferred Sources — implementation notes

_Feature: let users add Jurassic English as a Google "preferred source", which
surfaces our content (with a "preferred" badge) in **Top Stories, AI Mode and AI
Overviews** — **only for users who opt in**. Per Google, this is per-user
personalisation, **not** a general ranking signal._

Source of truth: <https://developers.google.com/search/docs/appearance/preferred-sources>

## What ships by default (no CSP change)

`<PreferredSourceButton>` (`src/components/PreferredSourceButton.tsx`) renders a
real `<a>` to Google's **documented no-JS deeplink**:

```
https://www.google.com/preferences/source?q=jurassicenglish.com
```

This works with JavaScript disabled, needs **no third-party script**, and needs
**no Content-Security-Policy change**. Clicks are tracked via
`trackPreferredSourceClick()` in `src/lib/analytics.ts`
(`preferred_source_click`; params `placement`, `page_path`, `cta_variant`,
`language`). Placements: footer brand strip (compact) + foot of the homepage
(full band).

## Optional: the in-page (publisher.js) enhancement

A richer in-page opt-in popup (`preferredSource.addPreferredSource()`) is
available behind **two** switches that must BOTH be on. It lazy-loads Google's
`publisher.js` once and, if anything is blocked, silently falls back to the
deeplink.

1. **Build flag** — set `VITE_PREFERRED_SOURCE_ENHANCED=true` (Vercel project env
   var, same mechanism as `VITE_TESTIMONIALS_ENABLED`). Default off.
2. **CSP allowance** — the commit titled _"chore(csp): allow Google Preferred
   Sources publisher.js (optional enhanced flow)"_ adds to `vercel.json`:
   - `script-src`  += `https://news.google.com`
   - `connect-src` += `https://news.google.com https://www.google.com`
   - `frame-src`    = `'self' https://news.google.com https://www.google.com` (new directive; the opt-in popup is a Google-hosted iframe)

   `img-src` already allows `https:`, so Google's gstatic assets need no change.

### ⚠️ The CSP origins are best-effort, not Google-verified

Google publishes **no** CSP/origin allowlist for `publisher.js`. The set above
is derived from the documented script host plus the opt-in flow's known Google
endpoints. **Before enabling the enhanced flow in production, confirm the actual
origins empirically**: enable the flag on a preview, open a page with the button,
click it, and watch for `Content-Security-Policy` violation reports in the
console / reporting endpoint; then tighten or extend the allowlist to exactly
what fires. Until then, prefer the deeplink default.

## Honest value note

The Preferred Sources payoff lands in **Top Stories**, a *news* surface. Jurassic
English is a commercial **education** site, not a news publisher — so the
realistic benefit of the Top Stories path is **low**. The button is a cheap,
legitimate audience-building affordance; it is **not** an SEO lever, and no copy
in this repo claims a ranking boost. Reconsider the enhanced flow (and its CSP
cost) if/when a genuine editorial/publication surface exists (see the `/insights`
foundation).
