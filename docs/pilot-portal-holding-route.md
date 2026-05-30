# Pilot Portal Holding Route (`/pilot/:id`)

## What this is

A **public-safe pending-approval holding page** served by the JE Vite SPA at
`/pilot/<id>` (e.g. `/pilot/pilot-2026-05-30-b9b4492c`).

Pilot-automation notification emails surface a `/pilot/<id>` URL while the
underlying inquiry is still **STAGED / awaiting approval**. Before this route
existed, clicking that link produced a broken/unknown-route experience. Now it
renders a clean holding page:

- Heading: *"This inquiry is awaiting internal review."*
- Body: *"This pilot portal link will become available after approval by the Jurassic English™ team."*
- Contact: `info@jurassicenglish.com`

## What it is NOT

This is **not** the authenticated external portal. Approved, token-based access
remains at **`/external/pilot?token=...`** (served by `ExternalPilotPortalPage`,
verified by `api/verify-external-portal-access.ts`). That behavior is unchanged.

`/pilot/:id` performs **zero** record lookups and renders **zero** record data —
no inquiry ID, school name, contact name, email, or status is ever displayed.
It deliberately ignores the `:id` segment. It is safe to render to any visitor,
including someone who forwarded the email or guessed a URL.

## Indexing

The route is `noindex, nofollow` two ways (belt-and-suspenders):

1. **Edge header** — `vercel.json` adds `X-Robots-Tag: noindex, nofollow` for
   `/pilot/(.*)` (mirrors the existing `/external/pilot(.*)` and
   `/internal/pilot-requests(.*)` blocks).
2. **In-document `<head>`** — `resolveRouteMetadata()` returns
   `robots: noindex, nofollow` for `/pilot/:id` via `resolvePilotHoldingRoute()`.

It is intentionally **not** in `staticRoutes`, the sitemap, or the prerender
list — the id is dynamic and unbounded, so there is nothing to prerender or
submit to search engines.

## Routing / serving

No `vercel.json` rewrite is required. The project is deployed as
`"framework": "vite"`, whose SPA fallback already serves `index.html` for
unmatched paths, so a direct load of `/pilot/<id>` boots the SPA, which then
matches `isPilotHoldingView` in `src/App.tsx` and renders `PilotHoldingPage`.

## ⚠ DNS / domain assignment is a separate, code-external step

The automation emails reference the host **`portal.jurassicenglish.com`**, but
this route lives on the **apex** app (`jurassicenglish.com`). Two independent
options — **both configured in the Vercel/DNS dashboard, not in this repo:**

**Option A — serve the holding route from the apex (no new subdomain).**
Change the automation email template to emit
`https://jurassicenglish.com/pilot/<id>` instead of
`https://portal.jurassicenglish.com/pilot/<id>`. The route then resolves with
zero infrastructure work. *(The email template lives in the missing
`pilot-inquiry-runner` source, not in this repo — so this change must be made
wherever that runner actually runs.)*

**Option B — make `portal.jurassicenglish.com` resolve to this app.**
In the Vercel project for `jurassicenglish.com`:
1. Add `portal.jurassicenglish.com` as a domain on the project (or a dedicated
   project that serves the same build).
2. Add the DNS record your registrar requires (CNAME → `cname.vercel-dns.com`,
   or the apex/ALIAS Vercel specifies).
3. Verify the domain in Vercel and wait for the certificate to issue.

After Option B, `https://portal.jurassicenglish.com/pilot/<id>` serves the same
SPA and the same holding page. **No code change is needed for Option B** — it is
purely DNS + Vercel domain assignment.

Until one of these is done, the literal URL in the current emails
(`https://portal.jurassicenglish.com/...`) will not resolve, because that
subdomain is not yet pointed at any deployment. The code side (this route) is
ready for both options.

## Files

- `src/components/PilotHoldingPage.tsx` — the holding page (new)
- `src/App.tsx` — `isPilotHoldingView` route flag + render branch
- `src/lib/routeMetadata.ts` — `resolvePilotHoldingRoute()` (noindex metadata)
- `vercel.json` — `X-Robots-Tag` header for `/pilot/(.*)`
