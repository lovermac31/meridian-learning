# Jurassic English™ — Page-by-Page UX Audit & Condensation Plan

**Date:** 2026-05-31 · **Iteration:** 3rd redesign pass · **Author:** UX/IA review
**Decisions locked with Jay:** (1) deliverable = page-by-page audit, no build yet; (2) information architecture = **split at the front door** (Schools vs Parents/Students); (3) offload channels = **expand the AI chatbot** + **condensed FAQ/knowledge hub** (PDFs and email sequences deferred).

---

## 0. The one-sentence finding

> **You are not missing a design — you already built the condensed, single-audience, engaging page twice (`/student-academy` and `/school-framework`). The problem is the homepage and the legacy institutional pages never adopted that discipline, so every visitor still meets a 10-section, two-audience wall.**

That is why iterations 1–2 didn't stick: they were *visual* passes on a *structural* problem. The craft is already good. The fix is to change **what loads, for whom, and in what order** — not how it looks.

---

## 1. Why it feels like "too much" (root causes, evidence-based)

| # | Root cause | Evidence (live, 2026-05-31) |
|---|---|---|
| 1 | **Homepage does 10 jobs.** Ten full-height sections load on `/`: Hero, Decision Snapshot, Services, Series, Contact, About, Framework Foundations, Thinking Cycle, Student Academy, Neuroinclusive Layer. | Four screen-scrolls only reached the Series section. "Everything is important" = nothing is. |
| 2 | **8 top-level nav choices** (About, Framework, Series, Student Academy, Services, Contact, Education Affiliate Program, Plans & Pricing) + Get Started + language. | Decision paralysis at second one (Hick's Law). More doors ≠ more engagement. |
| 3 | **Two audiences in one funnel.** Hero says *"FOR SCHOOLS, ACADEMIES, AND CURRICULUM LEADERS"*; nav says *"Student Academy."* | Each visitor wades through ~2× the content they need. This is the single biggest "too much" multiplier. |
| 4 | **Hero delays the payoff.** Dark panel, slow fade-in, abstract copy: *"structured reasoning, moral judgment, and academic expression through complete literature, CEFR-aware progression, and teacher-ready implementation support."* | 5 abstract nouns before the visitor knows what to *do*. Slow clarity = bounce. |
| 5 | **Deep reference pages sit in primary nav.** `/framework` ("The deeper architecture behind Jurassic English™"), `/methodology` (469 ln), `/cefr-alignment` (527 ln), `/teacher-standards` (438 ln), `/pilot-programme` (919 ln). | These are *documentation*, not *landing pages*. They belong behind on-demand pull, not in the front door. |

---

## 2. The hidden asset: you run two apps, and the newer one is the answer

The site is actually **two stitched-together apps** (via `vercel.json` rewrites):

| App | Routes | Character |
|---|---|---|
| **Vite SPA** (legacy) | `/`, `/framework`, `/methodology`, `/cefr-alignment`, `/teacher-standards`, `/series/*`, `/thinking-cycle/*`, `/worldwise`, `/audit-sprint`, `/pilot-programme`, `/discovery`, `/get-started` | Dense, institutional, abstract. The "too much." |
| **Next.js ecosystem** (newer) | `/student-academy`, `/school-framework`, `/interactive-demo`, `/book-diagnostic`, `/evidence`, `/digital-reasoning-engine` | **Clean, single-audience, problem-first, one clear CTA, engaging visuals.** The model. |

**`/student-academy`** ("FOR PARENTS & STUDENTS" → *"Reading. Reasoning. Writing. With the books your child deserves."* → one CTA + "Try one thinking move" + hero image) and **`/school-framework`** ("SCHOOLS & CENTERS" → problem-first → 3 pain cards) are *exactly* the front-door split you asked for. They already exist. They are good.

**The redesign is therefore mostly subtraction + routing, not new design.**

---

## 3. The new information architecture: a two-door front door

```
                          ┌─────────────────────────────┐
                          │   HOMEPAGE  (new, ~3 screens)│
                          │   "Critical thinking through │
                          │    literature."  + ONE line  │
                          │                              │
                          │   Who are you?               │
                          │  ┌───────────┐ ┌───────────┐ │
                          │  │I run a    │ │I'm a      │ │
                          │  │school     │ │parent     │ │
                          │  └─────┬─────┘ └─────┬─────┘ │
                          └────────┼─────────────┼───────┘
                                   ▼             ▼
                        /school-framework   /student-academy
                        (EXISTS, good)      (EXISTS, good)
                                   │             │
            ┌──────────────────────┘             └──────────────────┐
   Schools track (focused)                          Parents track (focused)
   • School Framework  • Evidence                    • Student Academy • Interactive Demo
   • Audit Sprint / Discovery (convert)              • Book a Diagnostic (convert)
   • Pilot (condensed)                               • Series overview (light)
                                   │             │
                                   ▼             ▼
                    ┌─────────────────────────────────────┐
                    │ DEPTH ON DEMAND (off the main path)  │
                    │  • AI chatbot: "Ask anything"        │
                    │  • FAQ / Knowledge Hub (1 page)      │
                    │  Holds: Framework deep-dive,         │
                    │  Methodology, CEFR, Teacher          │
                    │  Standards, Thinking Cycle, syllabus │
                    └─────────────────────────────────────┘
```

**New primary nav (8 → 4 + 1 CTA):**
`For Schools` · `For Parents` · `The Curriculum` (Series) · `Ask / FAQ` · **Get Started**
(About, Framework, Methodology, Services, Plans & Pricing, Education Affiliate → demoted to footer or absorbed into the four above.)

---

## 4. Page-by-page audit

**Verdict key:** `KEEP` (works as-is) · `CONDENSE` (keep page, cut length) · `MERGE` (fold into another) · `DEMOTE` (remove from primary nav, still reachable) · `→FAQ` (move into knowledge hub) · `→BOT` (answerable on demand by chatbot) · `CUT`.

### 4a. The homepage & its 10 sections

| Section on `/` | Audience | Verdict | Specific fix | Priority |
|---|---|---|---|---|
| **Hero** | Both | **REBUILD** | Replace abstract subhead with one concrete line + an audience fork (two buttons: "I run a school" / "I'm a parent"). Kill the slow fade — clarity in <2s. | **P0** |
| InstitutionalDecisionSnapshot ("What it is / Who it fits / What you receive / How to start") | Schools | DEMOTE → move onto `/school-framework` | Good content, wrong place. It's a B2B summary; it belongs on the Schools page, not the shared homepage. | P0 |
| Services ("Choose the right implementation path") | Schools | DEMOTE → Schools track | B2B-only. Off the shared homepage. | P0 |
| SeriesSection ("The Jurassic English™ Series") | Both | CONDENSE → keep a 1-card teaser linking to `/series` | The curriculum is the product; keep a *taste*, not the full 4-level table, on home. | P1 |
| Contact | Both | MERGE → footer + chatbot | A full contact section mid-homepage is scroll tax. Footer + the chatbot's "contact" intent covers it. | P1 |
| AboutSection | Both | DEMOTE → `/about` or footer | Brand story is not a first-visit need. | P1 |
| FrameworkFoundations | Schools | →FAQ / →BOT | Deep methodology. Off the main path. | P1 |
| ThinkingCycle | Both | →FAQ / →BOT | Signature method — give it ONE teaser line + "ask the bot / read more," not a homepage section. | P1 |
| StudentAcademyMural | Parents | DEMOTE → it's the Parents fork; link, don't inline | This *is* the parent doorway; the fork button replaces it. | P0 |
| NeuroinclusiveLayer | Both | →FAQ | Important differentiator, but reference depth. Hub it. | P1 |

> **Homepage target:** ~3 screens. Screen 1 = headline + one line + two-door fork. Screen 2 = single proof strip (numbers / logos / one testimonial). Screen 3 = the two doors again + footer. Everything else pulls on demand.

### 4b. Legacy Vite SPA institutional pages

| Route | Lines | Audience | Verdict | Specific fix | Priority |
|---|---|---|---|---|---|
| `/framework` | 346 | Schools | **→FAQ + CONDENSE** | "Deeper architecture" deep-dive → move the depth into the knowledge hub + chatbot. Keep at most a short, linked summary inside `/school-framework`. Remove from primary nav. | P1 |
| `/methodology` | 469 | Schools | **MERGE → FAQ** | Overlaps `/framework`. Collapse both into one "How it works" hub entry with accordions. | P1 |
| `/cefr-alignment` | 527 | Schools | **→FAQ** | Pure reference. Becomes a hub section + a bot answer ("How does CEFR alignment work?"). | P1 |
| `/teacher-standards` | 438 | Schools | **→FAQ** | Pure reference. Hub section + bot answer ("How are teachers trained/standards met?"). | P1 |
| `/thinking-cycle` + stages + `/compare` | ~360 | Both | **CONDENSE → 1 overview + →BOT** | Keep one visual overview page; the per-stage deep pages become bot answers + hub accordions. | P2 |
| `/worldwise` | 364 | Both | **DEMOTE** | WWL parent-brand page. Footer link + a line on `/about`. Not front-door. | P2 |
| `/audit-sprint` | 407 | Schools | **KEEP + CONDENSE** | Real B2B offer / conversion page. Trim to problem → what you get → book. Lives in Schools track. | P2 |
| `/pilot-programme` | **919** | Schools | **CONDENSE HARD** | Densest page on the site. Cut to: what the pilot is → what you receive → CTA. The deep operating-model detail → PDF (you have the pilot sales pack!) + bot. | P2 |
| `/discovery` | 392 | Schools | **KEEP + CONDENSE** | Conversion page. Trim to one promise + booking. | P2 |
| `/get-started` | 696 | Both | **KEEP + SIMPLIFY FORM** | Long intake = friction at the moment of highest intent. Cut fields to the minimum; progressive-profile the rest later. | P1 |
| `/series`, `/series/compare`, `/series/level-N`, `/series/level-N/syllabus` | — | Both | **KEEP core + OFFLOAD deep syllabus** | The series IS the product — keep level pages. But the full 40-lesson/10-text syllabus tables → on-demand (expand/PDF/bot), not default render. | P2 |
| `/legal/*` | — | — | **KEEP** | Required. Fine as-is (noindex-appropriate). | — |
| `/plans-pricing-access`, `/external/pilot`, `/internal/pilot-requests`, `/pilot/:id` | — | Private | **OUT OF PUBLIC IA** | Correctly gated/noindex. Not part of this audit's surface. | — |
| `/vi/*` | — | — | **MIRROR** | Whatever structure ships in EN mirrors to VI through the existing release-gate. | — |

### 4c. Next.js ecosystem pages (the good app — mostly keep)

| Route | Audience | Verdict | Specific fix | Priority |
|---|---|---|---|---|
| `/student-academy` | Parents | **KEEP — this is the model** | It becomes the **Parents fork destination**. Minor: make "Try one thinking move" even more prominent (it's a dwell-time engine). | P0 (as fork target) |
| `/school-framework` | Schools | **KEEP — this is the model** | Becomes the **Schools fork destination**. Absorb the homepage's "What it is / Who it fits / What you receive" block here. | P0 (as fork target) |
| `/interactive-demo` | Parents (+Both) | **KEEP + SURFACE** | Your #1 engagement asset. Currently buried. Link it from both forks and the homepage proof strip. Interaction → dwell time → lower bounce. | P1 |
| `/book-diagnostic` | Parents | **KEEP** | B2C conversion endpoint. Good. | — |
| `/evidence` | Both | **KEEP** | Proof. Link from both tracks ("see the evidence"). | — |
| `/digital-reasoning-engine` | Both | **KEEP + CONDENSE** | Product/tech story. Keep but ensure it's not another abstract wall; one concrete demo beats five claims. | P2 |

---

## 5. The offload plan (your two chosen channels)

### Channel 1 — Expand the AI chatbot into "Ask Jurassic English anything"

The widget already exists and even re-flavors its prompt per page ("Curriculum, methodology, schools, or contact" on home; "Pathway, diagnostic, evidence, or learner support" on Student Academy). Promote it from *help widget* to *primary depth layer*.

- **Feed it the demoted content as its knowledge base:** Framework deep-dive, Methodology, CEFR alignment, Teacher Standards, Thinking Cycle stages, syllabus detail, pricing logic (public-safe only).
- **Seed visible starter questions** per audience so visitors know it holds real answers:
  - Schools: *"How does CEFR alignment work?"* · *"How are teachers trained?"* · *"What does a pilot involve?"*
  - Parents: *"What happens in a diagnostic?"* · *"What will my child read?"* · *"How do you show progress?"*
- **Why it lowers bounce:** answers depth *without* a page-load or a scroll. The visitor stays in one place and pulls exactly what they need.

### Channel 2 — One condensed FAQ / Knowledge Hub (`/faq` or `/knowledge`)

Replaces **five** standalone dense pages (Framework, Methodology, CEFR, Teacher Standards, Thinking Cycle) with **one** searchable page of collapsible accordions, grouped by audience.

- Progressive disclosure: everything collapsed by default; the page looks short, reads deep only when asked.
- Each accordion = what one dense page used to be, trimmed to its essentials, with "ask the bot for more."
- SEO note: keep the *content* (so you don't lose the indexed depth), just relocate it. Add the hub to the sitemap; 301 the old dense routes to their hub anchors so ranking transfers.

**Net effect on the route map:** primary public surface drops from ~20 dense areas to ~8 focused ones; the rest becomes pull-on-demand.

---

## 6. Engagement & bounce-rate levers (ranked by impact)

| Lever | Why it moves the metric |
|---|---|
| **Fork in <2s** (audience routing in the hero) | Bounce is mostly "this isn't for me / I can't tell what to do." A two-door hero answers both instantly. |
| **Cut nav 8 → 4** | Fewer choices = faster commitment = fewer paralysis-bounces. |
| **Surface `/interactive-demo`** | Interaction is the single biggest dwell-time multiplier you have, and it's currently buried. |
| **Promote the chatbot to "ask anything"** | Turns passive reading into active pulling; sessions lengthen, pages-per-visit rises. |
| **Progressive disclosure everywhere** (accordions, "show me more") | Curiosity gaps create scroll *intent* instead of scroll *fatigue*. |
| **Kill the slow hero fade** | Every 100ms of delayed clarity costs attention. |
| **One proof strip, not ten claims** | A single credible proof (numbers / named schools / one quote) outperforms a 10-section narrative. |

---

## 7. Prioritized roadmap

### P0 — Front door (highest impact, smallest build; both destinations already exist)
1. Rebuild `/` to ~3 screens: concrete headline + **two-door audience fork** → routes to existing `/school-framework` and `/student-academy`.
2. Cut primary nav from 8 to 4 + Get Started.
3. Move the homepage's B2B blocks (Decision Snapshot, Services) onto `/school-framework`.

### P1 — Offload depth
4. Build the **FAQ / Knowledge Hub** (one page, audience-grouped accordions).
5. **Demote** Framework, Methodology, CEFR, Teacher Standards, Thinking Cycle from nav → into the hub; 301 old routes to hub anchors.
6. **Expand the chatbot** knowledge base + seeded starter questions.
7. Simplify the `/get-started` form.
8. Surface `/interactive-demo` from both tracks + homepage.

### P2 — Condense the long tail
9. Condense `/pilot-programme` (919 → ~250 ln) and push deep detail to the existing pilot PDF + bot.
10. Trim `/audit-sprint`, `/discovery`, `/digital-reasoning-engine` to problem → offer → CTA.
11. Offload deep syllabus tables to on-demand/PDF/bot; keep series level pages light.
12. Mirror all changes to `/vi/*`.

---

## 8. What NOT to do (so iteration 3 is the last one)

- **Don't** do another visual-only pass. The visuals are already good; the problem is load and structure.
- **Don't** delete the deep content — *relocate* it (hub + bot + PDF) so SEO and substance survive.
- **Don't** keep serving both audiences from one scroll. The split is the point.
- **Don't** add new sections to the homepage. Every addition is a step backward from "condense."

---

## 9. Open questions for Jay (before any build)

1. **Primary growth audience** — if forced to pick, is Schools (B2B) or Parents (B2C) the revenue priority? (Affects which door is visually dominant / default.)
2. **`/faq` vs `/knowledge`** — preferred URL + name for the hub?
3. **SEO appetite** — OK to 301 the dense legacy routes (`/methodology`, `/cefr-alignment`, `/teacher-standards`) into hub anchors? (Recommended; preserves ranking, removes the pages from the front door.)
4. **Scope of the first build** — start with P0 (homepage fork) only, or P0 + the FAQ hub together?
