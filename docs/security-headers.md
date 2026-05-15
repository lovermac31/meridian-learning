# Browser Security Headers — Phase 2.3A

Live as of: 2026-05-15
Scope: `vercel.json` `headers` block, applied to `/(.*)` (every response).
Enforcement: **report-only for CSP**; the four static headers below are
enforced by the browser.

## Static headers (enforced)

| Header | Value | Why |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Stops browsers from MIME-sniffing responses (a classic XSS / file-execution vector). |
| `X-Frame-Options` | `DENY` | The site is not embedded anywhere — refuse all framing. Belt-and-suspenders with `frame-ancestors 'none'` in CSP. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Standard modern default. Sends full URL for same-origin, only origin for cross-origin HTTPS, nothing on downgrade. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` | The site does not use any of these device APIs. Lock them off. |

`Strict-Transport-Security: max-age=63072000` is **already set by the Vercel
platform** for jurassicenglish.com — verified on prod with `curl -sI`. Not
duplicated here.

## Content-Security-Policy-Report-Only

Header name is `Content-Security-Policy-Report-Only`, **not** the enforcing
`Content-Security-Policy`. Violations are logged to the browser console and,
once a collector is wired up, will ship to a report endpoint. No request is
ever blocked by this header.

### Policy

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com;
style-src 'self' 'unsafe-inline' https://db.onlinewebfonts.com;
font-src 'self' https://db.onlinewebfonts.com data:;
img-src 'self' data: blob: https:;
connect-src 'self' https://*.supabase.co https://api.resend.com https://vitals.vercel-insights.com https://va.vercel-scripts.com;
frame-ancestors 'none';
object-src 'none';
base-uri 'self';
form-action 'self'
```

### Source-list rationale

| Allowance | Why it exists | Path to remove |
|---|---|---|
| `script-src 'unsafe-inline'` | `dist/index.html` ships `<script type="application/ld+json">` JSON-LD blocks emitted by `scripts/prerender-route-metadata.mjs` (Organization + WebSite per route, for SEO). Also an inline `onload=` on the brand-font preload `<link>`. | Move JSON-LD to external files referenced by hash, OR add `nonce-{value}` per request via Edge middleware. |
| `script-src 'unsafe-eval'` | Defensive belt during the report-only phase while Vercel Analytics / Speed Insights bootstrap. The first-party `va.vercel-scripts.com` script historically uses `Function()`-style eval for shimming. | Verify with the report stream; tighten once no `script-src` violations of kind `eval` appear over a multi-day observation window. |
| `script-src https://va.vercel-scripts.com` | Source domain for `@vercel/analytics` and `@vercel/speed-insights` runtime scripts. | Keep — required while either package is installed. |
| `style-src 'unsafe-inline'` | `dist/index.html` ships an inline `<style>` block (`html,body{background:#101820;…}#root{min-height:100vh}` — pre-React paint) and ~5 `style="…"` attributes on the SSR loading fallback. | Lift the inline `<style>` into a static asset; convert the SSR fallback to a class-based stylesheet. |
| `style-src https://db.onlinewebfonts.com` | **Temporary third-party brand font (`Neuland-Inline`).** External stylesheet at `https://db.onlinewebfonts.com/c/3000a0539c78d3cf6ab2d94db856f5ef?family=Neuland-Inline`. | Self-host the font under `/fonts/`. Phase 6 (Frontend / UX / Performance QA) explicitly tracks this; removing the exception lets `style-src` and `font-src` shrink to `'self'`. |
| `font-src https://db.onlinewebfonts.com data:` | Font files for Neuland-Inline. `data:` covers Vite's inlined small-font base64. | Same as above — self-host removes the external entry. |
| `img-src https:` | Broad-open for image sources. Image embedding is low-risk from a CSP perspective (no script execution surface). | Tighten later once a full image-source inventory is done. |
| `connect-src *.supabase.co` | Server-side Supabase calls go through serverless functions, but defensive coverage for any future browser-side telemetry. | Drop once browser-side Supabase usage is confirmed never used. |
| `connect-src api.resend.com` | Resend is server-side only today. Same defensive rationale. | Drop later. |
| `connect-src vitals.vercel-insights.com` | Vercel Speed Insights beacon endpoint. | Keep while Speed Insights is enabled. |
| `frame-ancestors 'none'` | The site refuses to be embedded. Stronger than `X-Frame-Options: DENY` in modern browsers (which use `frame-ancestors`). | Permanent. |
| `object-src 'none'` | No `<object>`, `<embed>`, `<applet>`. Disables a legacy XSS vector. | Permanent. |
| `base-uri 'self'` | Stops attacker `<base>` injection from rewriting relative URLs. | Permanent. |
| `form-action 'self'` | Forms only POST to the same origin. | Permanent. |

## Path to enforcement (future, not in 2.3A)

1. Deploy `vercel.json` with `Content-Security-Policy-Report-Only` to a
   preview build first.
2. Open every key route (home, `/student-academy`, `/book-diagnostic`,
   `/interactive-demo`, `/school-framework`, `/get-started`, the two
   `?token=` routes) in Chrome DevTools → Console; harvest CSP violations.
3. Add a real report endpoint and `report-uri` / `report-to` to capture
   field violations from real visitors over at least 7 days.
4. Plan font self-hosting (Phase 6 — see `Health_Check_outline_May 2026/`).
5. Remove `'unsafe-inline'` / `'unsafe-eval'` / `db.onlinewebfonts.com` as
   each underlying dependency is retired; tighten `connect-src` and
   `img-src`.
6. Once a multi-day clean violation stream is observed, rename the header
   from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`
   in `vercel.json` to flip enforcement.

## Rollback

Delete the new `{ "source": "/(.*)", "headers": [ … ] }` entry from
`vercel.json`. Static headers and the CSP go away on the next deploy.
No code changes required.

The header block intentionally lives ahead of the per-route header blocks
in the same `headers` array so it can be removed in one contiguous edit
without touching the cache-control or `X-Robots-Tag` entries below it.
