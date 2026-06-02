# P0 Build Plan — Homepage Fork + Knowledge Hub Shell

**Date:** 2026-06-01 · **Scope:** P0 only · **Status:** PLAN — no application code to be written until approved · **No deploy until explicitly approved.**
**Source:** continues `docs/ux-redesign-audit-2026-05.md`.

## Locked decisions (from Jay)
1. Audience priority: **Schools first, Parents second.**
2. Homepage IA: two-door front door — **primary** door `For Schools → /school-framework`, **secondary** door `For Parents → /student-academy`.
3. Knowledge hub: URL `/knowledge`, nav label **"Ask / Knowledge Hub"**.
4. SEO: dense legacy routes will *eventually* 301 into `/knowledge` anchors (`/framework→/knowledge#framework`, `/methodology→/knowledge#methodology`, `/cefr-alignment→/knowledge#cefr-alignment`, `/teacher-standards→/knowledge#teacher-standards`, thinking-cycle deep pages→`/knowledge#thinking-cycle`). **Documented here, NOT implemented in P0.**
5. P0 build = **homepage fork + Knowledge Hub *shell*** (shell = structure + audience-grouped accordion scaffolding, not the full migrated content).
6. No deploy until approved.

> **Framing reminder:** this is structure + routing, not a visual redesign. `/student-academy` and `/school-framework` are already the design model. The homepage routes people *to* them fast; it does not duplicate their content.

---

## 1. Architecture facts that shape this build (verified in code)

| Fact | Implication for P0 |
|---|---|
| The site is **two apps**: a Vite SPA (homepage, `/series`, dense legacy pages) + a Next.js "ecosystem" app (`/school-framework`, `/student-academy`, `/interactive-demo`, …) stitched by `vercel.json` rewrites. | The fork destinations are in the **ecosystem app**. The homepage only **links** to them — no content moves cross-app in P0. |
| Current nav links are **hash anchors** to homepage sections (`#about`, `#framework`, `#series`, `#student-academy`, `#training`, `#contact`), defined in `Navbar.tsx` (lines ~115–120) from `getUiString(locale, 'navbar.links.*')`. | Nav reduction = swap hash-anchors for **route links**. Strings live in `src/i18n/ui/en.ts` + `vi.ts`. |
| The homepage renders in `App.tsx` as the final `else` branch (`<main id="main-content">`, ~lines 501–563): Hero + 9 staged sections gated by `homeSectionStage`. | The homepage rebuild = **replace the contents of that one branch**. The staging machinery (`homeSectionStage`, `DEFERRED_HOME_STAGE_DELAY_MS`) is simplified/retired for the lean page. |
| A new indexable route requires **3 touchpoints**: (a) a route flag + render branch in `App.tsx`; (b) a metadata entry in `staticRoutes` (`src/lib/routeMetadata.ts`); (c) inclusion in `getExpectedPublicIndexableRoutes()` so it prerenders + enters the sitemap. | `/knowledge` follows the same pattern proved by `/pilot/:id` and every existing route. |
| Build pipeline: `vite build && prerender-route-metadata.mjs && generate-sitemap.mjs`; validated by `validate-prerender-routes.mjs`. Metadata is the single source of truth for prerender + sitemap. | Adding `/knowledge` to `staticRoutes` + `getExpectedPublicIndexableRoutes` auto-prerenders it and adds it to the sitemap. No separate sitemap edit. |
| Old homepage section components (`InstitutionalDecisionSnapshot`, `Services`, `FrameworkFoundations`, `ThinkingCycle`, `AboutSection`, `NeuroinclusiveLayer`, etc.) are standalone files. | **Keep them in the repo** (unreferenced) for instant rollback; delete in a later cleanup pass, not P0. |

---

## 2. Exact file/route inventory for P0

### MODIFY
| File | Change |
|---|---|
| `src/App.tsx` | (1) Replace the home `else` render branch with the lean 3-screen layout. (2) Add `isKnowledgeView = routePathname === '/knowledge'`, add to `isSubpageView`, add a lazy import + render branch for `KnowledgeHubPage`. (3) Simplify/retire `homeSectionStage` staging used only by the old long homepage. |
| `src/components/Navbar.tsx` | Replace the 6 hash-anchor nav links with **4 route links** (For Schools, For Parents, The Curriculum, Ask/Knowledge Hub) + keep **Get Started** CTA. Decide retirement of the Education-Affiliate + Plans-&-Pricing buttons (recommend: move to footer). Mobile menu mirrors. |
| `src/i18n/ui/en.ts`, `src/i18n/ui/vi.ts` | Add `navbar.links.forSchools`, `forParents`, `curriculum`, `knowledge`. Retire/keep old keys (`about`, `framework`, `studio`, `services`, `contact`) — keep defined to avoid breakage; stop referencing. |
| `src/components/Hero.tsx` | Revise to: short concrete headline + one-line subhead + the audience fork (or pair Hero with a new `AudienceFork` below it — see §3). Remove slow fade that delays clarity. |
| `src/i18n/content/home.ts` | Revise hero copy (concrete, <2s clarity) + add fork copy (door labels + sublines). Bilingual EN/VI. |
| `src/lib/routeMetadata.ts` | Add `/knowledge` to `staticRoutes` (`shouldIndex: true`, title, description, `canonicalPath: '/knowledge'`); add `'/knowledge'` to the array in `getExpectedPublicIndexableRoutes()`. |

### CREATE
| File | Purpose |
|---|---|
| `src/components/AudienceFork.tsx` | The two-door component. Primary card "For Schools" (dominant) → `/school-framework`; secondary card "For Parents" → `/student-academy`. Uses `onNavigate` from App. |
| `src/components/ProofStrip.tsx` | One compact proof row (stats / named institutions / one quote) — replaces ten narrative sections with a single credibility beat. May reuse existing stat content (e.g. "40 lessons/year · 10 core texts"). |
| `src/components/KnowledgeHubPage.tsx` | The hub **shell**: intro + audience-grouped accordions (Schools group, Parents group) with stable anchor IDs (`#framework`, `#methodology`, `#cefr-alignment`, `#teacher-standards`, `#thinking-cycle`). Accordions collapsed by default (progressive disclosure). P0 fills each with a short summary + "ask the assistant / read more" — **not** the full migrated content (that's P1). |
| `src/i18n/content/knowledge.ts` | Hub copy + accordion entries (title, anchor id, summary, audience tag). Bilingual. Mirrors the existing `content/*.ts` pattern. |

### NOT in P0 (documented, deferred)
- `vercel.json` 301 redirects — staged for **after** the hub holds real content (§6).
- Ecosystem-app edits (migrating the homepage's `InstitutionalDecisionSnapshot`/`Services` blocks onto `/school-framework`) — **P1**; `/school-framework` already has strong B2B content, so P0 just links to it.
- Chatbot knowledge-base expansion — **P1**.
- Deleting old homepage section components — later cleanup.
- Full content migration into `/knowledge` accordions — **P1**.

---

## 3. New homepage structure (max ~3 screens)

| Screen | Contents | Notes |
|---|---|---|
| **1 — Clarity + fork** | • Eyebrow: short (e.g. "Literature-based English curriculum") • H1: concrete, ≤7 words ("Critical thinking through literature.") • One-line subhead (what + for whom, plain language) • **AudienceFork**: two cards — **For Schools** (primary, larger/orange) → `/school-framework`; **For Parents** (secondary) → `/student-academy` • Single CTA fallback: "Get Started" | Clarity in <2s. No slow fade. Schools door visually dominant (decision #1). |
| **2 — One proof beat** | A single `ProofStrip`: 3–4 stats or named institutions or one short testimonial. | Replaces the 8 narrative sections. One credible proof > ten claims. |
| **3 — Re-fork + footer** | Restate the two doors (low-commitment "still deciding?" framing) + the existing Footer. | Catches the scroller who skipped screen 1's fork. |

**Removed from the homepage default path** (still reachable, relocated per audit): InstitutionalDecisionSnapshot, Services, full SeriesSection table, Contact section, AboutSection, FrameworkFoundations, ThinkingCycle, StudentAcademyMural inline, NeuroinclusiveLayer.

**SEO preservation for the homepage:** keep `staticRoutes['/']` metadata (title, canonical `https://jurassicenglish.com`, Org+WebSite JSON-LD) **unchanged**. The prerendered SSR fallback still renders the new (shorter) content. Keyword depth that left the homepage survives on `/school-framework`, `/series`, and (after P1) `/knowledge`. Flag: a leaner homepage has less on-page text — acceptable and intended; the meta description + JSON-LD carry the core terms.

---

## 4. Reduced navigation

| New nav item | Routes to | Replaces (old hash-anchor) |
|---|---|---|
| **For Schools** | `/school-framework` | `#framework`, `#about`, `#training` (consolidated) |
| **For Parents** | `/student-academy` | `#student-academy` |
| **The Curriculum** | `/series` | `#series` |
| **Ask / Knowledge Hub** | `/knowledge` | (new) |
| **Get Started** (CTA) | `/get-started` | unchanged |

- **Language switcher** retained.
- **Education Affiliate Program** + **Plans & Pricing** buttons → move to **footer** (not first-visit needs). Decision to confirm with Jay; default = footer.
- Both `/school-framework` and `/student-academy` are **rewrite-served** by the ecosystem app — nav uses full-document navigation (the existing `isRewriteServedRoute` path in `App.tsx` already handles this; `navigateTo` calls `window.location.assign` for rewrite-served routes). Confirm both are in `REWRITE_SERVED_ROUTES` (they are).
- Mobile menu (`Navbar.tsx` dialog) mirrors the 4 items + CTA.

---

## 5. `/knowledge` shell structure

```
/knowledge  — "Ask / Knowledge Hub"   (indexable, shouldIndex: true)
 ├─ Intro: "Find the depth on demand." + link to the chatbot ("ask anything")
 ├─ Group: FOR SCHOOLS
 │    ├─ ▸ Framework               (id="framework")        summary + "read more / ask"
 │    ├─ ▸ Methodology             (id="methodology")      summary + "read more / ask"
 │    ├─ ▸ CEFR alignment          (id="cefr-alignment")   summary + "read more / ask"
 │    ├─ ▸ Teacher standards       (id="teacher-standards") summary + "read more / ask"
 │    └─ ▸ The Thinking Cycle      (id="thinking-cycle")   summary + "read more / ask"
 └─ Group: FOR PARENTS
      ├─ ▸ What my child reads
      ├─ ▸ What a diagnostic involves
      └─ ▸ How progress is shown
```

- Accordions **collapsed by default** (page looks short; reads deep on demand).
- **Anchor IDs are load-bearing** — they are the 301 targets in §6. Lock them now: `#framework`, `#methodology`, `#cefr-alignment`, `#teacher-standards`, `#thinking-cycle`.
- On load with a hash (e.g. `/knowledge#cefr-alignment`), auto-expand + scroll to that accordion (reuse the homepage's existing hash-scroll effect pattern in `App.tsx`).
- **P0 content = short summaries** (2–4 sentences each) + a "read the full detail" link to the *still-live* legacy page + an "ask the assistant" affordance. Full migration of the dense pages into the accordions is **P1**.

---

## 6. Redirect strategy (DOCUMENTED — do NOT implement in P0)

**Sequencing is the safety mechanism.** Do not 301 a dense page until its content lives in the hub, or you 301 users into an empty anchor.

| Phase | Action |
|---|---|
| **P0 (this build)** | Build hub **shell** with locked anchor IDs. Legacy pages (`/framework`, `/methodology`, `/cefr-alignment`, `/teacher-standards`, thinking-cycle) stay **fully live and indexable**. Zero redirects. **Zero SEO change.** |
| **P1** | Migrate each dense page's essential content into its hub accordion. |
| **P1→P2 (separate approval)** | Add `vercel.json` 301 redirects: `/framework→/knowledge#framework`, `/methodology→/knowledge#methodology`, `/cefr-alignment→/knowledge#cefr-alignment`, `/teacher-standards→/knowledge#teacher-standards`, thinking-cycle deep pages→`/knowledge#thinking-cycle`. Remove the redirected routes from `getExpectedPublicIndexableRoutes()` (so they leave the sitemap) and update internal links. Re-submit sitemap; validate-fix in GSC. |

Redirect rules will sit in the `vercel.json` `redirects` array (note: query/hash fragments aren't sent to the server, so the `#anchor` is a client-side convenience — the 301 target is `/knowledge` and the hub's hash-scroll handles the section). Per-route `301` (`"permanent": true`).

**P0 SEO guarantees:** `/` metadata unchanged; `/knowledge` added as a new indexable URL (in sitemap, `index, follow`); no existing route removed, redirected, or de-indexed; bilingual `/vi/knowledge` mirrors via the existing release-gate.

---

## 7. Verification the build must keep green (each run before review)
- `npm run lint` (tsc) — clean
- `npm run test:metadata` — add a case asserting `/knowledge` is `index, follow` with canonical `https://jurassicenglish.com/knowledge`; homepage metadata unchanged
- `npm run build` — clean; prerender emits `/knowledge` HTML; sitemap includes `/knowledge`
- `npm run validate:prerender` — `/knowledge` has prerender coverage; count increments cleanly

---

## 8. QA checklist (post-build, pre-deploy)

**Visual / responsive (screenshots at 375 / 390 / 768 / 1280):**
- [ ] New homepage = ~3 screens; Schools door visually dominant; fork visible without scroll on desktop + mobile
- [ ] `/knowledge` renders; accordions collapsed by default; expand/collapse works; deep-link `/knowledge#cefr-alignment` auto-expands + scrolls
- [ ] Fork targets `/school-framework` + `/student-academy` still render correctly (unchanged ecosystem app)
- [ ] No horizontal overflow at any width

**Nav behavior:**
- [ ] Exactly 4 items + Get Started; each routes to the correct destination
- [ ] Rewrite-served doors (`/school-framework`, `/student-academy`) do a full-document navigation (not SPA-push to NotFound)
- [ ] Mobile menu mirrors; opens/closes; focus trap + Esc work
- [ ] Keyboard nav + visible focus rings; skip-link still lands on `#main-content`
- [ ] Affiliate + Pricing reachable from footer

**Route status (curl / browser):**
- [ ] `/` → 200; `/knowledge` → 200; `/vi/knowledge` → 200
- [ ] Legacy pages still 200 (not yet redirected): `/framework`, `/methodology`, `/cefr-alignment`, `/teacher-standards`
- [ ] Fork links resolve 200

**SEO / metadata:**
- [ ] `/` title, canonical (`https://jurassicenglish.com`), Org+WebSite JSON-LD unchanged
- [ ] `/knowledge` has title, `index, follow`, canonical `https://jurassicenglish.com/knowledge`
- [ ] `dist/sitemap.xml` includes `/knowledge`; excludes nothing previously present
- [ ] No public route accidentally `noindex`

**Links:**
- [ ] All nav + footer + fork + hub links resolve (no 404)
- [ ] Old homepage hash anchors (`#about`, `#framework`, …) either still scroll (if section retained) or are removed from all link sources (no dead `#` links)
- [ ] Internal references to retired homepage sections updated or removed

**Bilingual:**
- [ ] `/vi` homepage fork + nav render in VI; `/vi/knowledge` mirrors

---

## 9. Rollback plan
- **Branch isolation:** build on `feat/p0-homepage-knowledge`; never merge to the production branch without explicit approval.
- **Keep old code:** retain all old homepage section components in the repo (unreferenced) so reverting = restore the previous `App.tsx` home branch. No destructive deletes in P0.
- **Additive `/knowledge`:** removing it = delete the route flag + render branch + `staticRoutes` entry + the `getExpectedPublicIndexableRoutes` line + the new files. Self-contained.
- **No redirects in P0** = nothing to un-redirect; legacy routes untouched.
- **Deploy gate:** preview deployment only; production promote requires Jay's explicit go.
- **Instant production rollback:** if promoted and an issue appears, re-promote the previous Vercel production deployment (one action) — no code revert needed to restore service.
- **Git rollback:** `git revert <p0 merge commit>` cleanly restores the prior homepage + removes `/knowledge`, because all changes are contained to the files in §2.

---

## 10. Open confirmations before code (small)
1. **Affiliate + Plans-&-Pricing nav buttons → footer?** (default: yes.)
2. **Homepage H1 wording** — proposed "Critical thinking through literature." (current SEO title is "Critical Thinking Through Literature for Schools" — keep alignment). Confirm or supply.
3. **First-build branch name** — proposed `feat/p0-homepage-knowledge`.
4. **Build target** — confirm P0 = homepage fork + `/knowledge` shell only (no content migration, no 301, no chatbot work this pass).

---

## 11. P0 definition of done
- Homepage is ~3 screens, forks to `/school-framework` (primary) + `/student-academy` (secondary), clarity in <2s.
- Nav is 4 items + Get Started; mobile mirrors; rewrite-served doors navigate correctly.
- `/knowledge` exists, indexable, in sitemap, with locked accordion anchors and collapsed-by-default progressive disclosure.
- All four verifications green; full QA checklist passed at 4 widths.
- Zero redirects, zero de-indexing, zero ecosystem-app changes, zero legacy-page removals.
- Built on a feature branch, preview-only, awaiting deploy approval.
