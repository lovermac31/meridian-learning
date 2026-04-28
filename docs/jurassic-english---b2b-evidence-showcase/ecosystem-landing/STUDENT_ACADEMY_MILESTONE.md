# Student Academy Landing Page — Milestone Record

**Status:** Student Academy Landing Page — Final Accepted / Public-Release Ready
**Route:** `/student-academy`
**App:** `ecosystem-landing` (Next.js 16 App Router · React 19 · Tailwind v4 · shadcn @ base-nova)
**Acceptance date:** 2026-04-27

---

## Preview URL

`https://je-ecosystem-landing-preview-r084lgzm3.vercel.app/student-academy`

This URL is hosted on a dedicated, non-production Vercel preview project (see "Vercel preview project" below). It is `noindex`-tagged and not aliased to any customer-facing domain.

---

## Final QA summary

Browser QA was run live against the preview URL via the Chrome MCP at desktop dimensions. All structural, visual, and claims-safety checks passed.

**Structure**
- Title matches metadata: *Jurassic English™ Student Academy | Literature-Based English Thinking for Students*
- Exactly 1 `<h1>`, 11 `<h2>`s, 12 `<section>` landmarks — all sections labeled with `aria-labelledby`
- Total scroll height ~9,243 px; no horizontal overflow
- All anchor targets present (`#pathway`, `#diagnostic-detail`); `scroll-mt-24` honored under sticky header

**Visuals**
- All four `/images/student-academy/*.webp` assets load successfully (`naturalWidth > 0`, `complete: true`)
- Hero rendered 520×325 from 1672×941 source — Retina-sharp at DPR 2
- Final CTA backdrop confirmed at `opacity: 0.15` over the navy-green gradient — gradient still dominant
- **CLS = 0.0000** on initial render

**Accessibility / contrast**
- Hero H1: deep-green `#0B3B24` on parchment `#F4F1EA` ≈ 9.94:1 (WCAG AAA)
- Final CTA H2: parchment on navy `rgb(17,42,70)` ≈ 11.96:1 (WCAG AAA)
- All meaningful images carry descriptive `alt` text; the decorative final-CTA backdrop carries `alt=""`
- FAQ uses Base UI accordion primitive — keyboard-operable

**CTAs / links**
- 20 internal links inventoried; all targets resolve to existing routes
- All approved CTA labels in place; "See How Progress Is Tracked" → `#diagnostic-detail`

**Claims-safety (rendered DOM scan)**
- Forbidden phrases (`guaranteed admission`, `proven results`, `scientifically proven`, `best english program`, `improve your score in`) — all absent
- `guaranteed ielts` and `guaranteed score` present **only inside denial frames** ("We do not claim…", "This is not…")
- One `pilot` mention — the intentional "This is not: The internal Pilot Program Portal" denial line. No accidental Pilot Portal leakage.

**Build**
- `npm run build` clean; TypeScript clean; `/student-academy` listed as `○ Static`

---

## Known non-blocking items

1. **Live narrow-mobile browser QA** is still recommended on another machine. The Chrome session used for this QA ran at DPR 2 with a minimum-window-width Chrome could not shrink below ~1638 CSS px, so true mobile rendering was not captured live. Static evidence (responsive Tailwind classes, prerendered HTML, breakpoint markup) is consistent with mobile working correctly.
2. **One empty `<a>` element** appears in the rendered DOM (`href: null`, `text: ""`). Worth a follow-up cleanup pass; no visual impact today.
3. **`/.well-known/vercel/jwe` returning 503** was a Vercel infrastructure artifact tied to the temporary disabled-SSO state during the QA pass, not a site-code issue. Resolved on 2026-04-27 when SSO protection was re-enabled.
4. **`metadataBase` remains unset** in `src/app/layout.tsx` — Open Graph image URLs currently resolve against `localhost:3000`. Should be addressed in a separate SEO / release task once a canonical production domain is approved.

---

## Vercel preview project

| Field | Value |
|---|---|
| Name | `je-ecosystem-landing-preview` |
| Project ID | `prj_Fw2EvDLqAnAADiYqwrJ1sGQ3a7nZ` |
| Team | `team_pQ4A9QLt0SH9fd9klYdAxiXS` (jay71adams-1388's projects) |
| Linked at | `ecosystem-landing/.vercel/project.json` only |
| SSO Deployment Protection | **Re-enabled** on 2026-04-27 after milestone closure — returned to Vercel default `{"deploymentType": "all_except_custom_domains"}`. Was temporarily disabled during the QA pass to allow live browser verification, then restored. |
| `x-robots-tag: noindex` | Still served — search engines do not index the preview |
| Production aliases | None |
| Custom domains | None |
| Environment variables | None |
| Other projects on team | **Untouched** (`jurassic-english`, `je-bilingual-release`, `je-seo-release`, `meridian-learning`, `sovereign-stack`, `happy-andy`, `v0-educationalwebmonitordashboard`) |
| Parent `jurassic-english™/.vercel/project.json` | **Hash unchanged** before/after all operations (`17301eb260a9ce…`) |

### Recommendation after milestone closure

Pick one of:
- **Re-enable SSO protection** on `je-ecosystem-landing-preview` — `PATCH ssoProtection: {"deploymentType":"all_except_custom_domains"}` against the same project. Reversible, no other side-effects.
- **Delete the project** entirely once it's no longer needed — `vercel project remove je-ecosystem-landing-preview --scope jay71adams-1388s-projects`.

Either is appropriate. The project exists only to host this QA pass; nothing else depends on it.

---

## What was *not* changed in this milestone

The following remain explicitly out of scope and untouched:

- `metadataBase` and Open Graph URL resolution
- `/interactive-demo` route, content, or linkage from `/student-academy`
- Any layout, route, CTA structure, or copy beyond the approved alt-text and label fixes
- The parent Vite app at `jurassic-english™/` and its Vercel project (`jurassic-english`)
- Other ecosystem brand pages: `/school-framework`, `/digital-reasoning-engine`, `/academic-thinker`, `/ielts-reasoning-lab`
- The Pilot Program Portal and Foundation Demo
- DNS, environment variables, production aliases, the production target on any project

New work in any of those areas requires a separately approved scope.
