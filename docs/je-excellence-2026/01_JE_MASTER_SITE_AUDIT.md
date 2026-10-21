# 01 — JE Master Site Audit (Phase 00)

Directive: JE-EXCELLENCE-2026-001 · Phase 00 (P0) · 15 Oct 2026 · read-only audit of production.
Evidence files in this folder: A1 visual/responsive · A2 accessibility/performance · 04+05 funnel & claims · 06 Story Quest & nav/SEO. Screenshots (56 full-page captures) were kept in the session scratchpad, not committed.

## 1. Executive summary

The site is in a stable, honest state after the October overhaul. All links work. Structured data is valid. The under-18 non-recording rule and the AI scope disclosures are live. There are no console errors on tested pages. Every tab stop (249 checked) has a visible focus ring. axe reports 0 violations on 9 of 10 pages.

The weak points are elsewhere:

1. **A mobile blocker.** At 320 px the header menu button is off-screen on every SPA page, so there is no navigation.
2. **Commercial truthfulness.** Several priced offers are not purchasable or operational products. The credential line on the homepage disagrees with the /about page. The USD reference rate disagrees with the actual PayPal charge.
3. **Payment flow.** PayPal fulfilment on the Young Learners page is fragile: there are no order references or consent, payments are confirmed by hand in up to a day, and booking slots are held for only 30 minutes.
4. **Brand fragmentation.** There are four type systems, three headers, three chat/contact widgets and off-token colours. Floating widgets cover CTAs.
5. **Performance.** Mobile lab LCP is 5.2 s on / and 4.8 s on /ai-speaking (target ≤ 2.5 s). The causes are fixable: hero preload and size, and render-blocking fonts.

None of these require re-architecture. Most are small, reversible work packages. Items 2 and 3 need owner decisions before any code changes.

## 2. Production baseline (verified 15 Oct 2026)

| Component | Repo / main | Production deployment |
|---|---|---|
| Main site (jurassicenglish.com) | meridian-learning @ 7b83f27 | jurassic-english dpl_3k4d3uoHmpFiuQqnYT9Z39beKmSe |
| Student Academy (+ ecosystem routes) | meridian-learning @ 7b83f27 (ecosystem-landing) | je-ecosystem-landing-preview dpl_8vaYkGV7M1rKRVQtXgKhw3Kw31sd |
| AI Speaking | jurassic-ai-speaking @ a5d1ce1 (CLI deploy, not Git-connected) | jurassic-ai-speaking dpl_137RT4Km1tGb4FTLVob6Fh6qgEQ5 |
| Story Quest | wwl-institutional-practice-platform (dirty tree) | prebuilt deploy 13 Oct; live = HEAD 282994e + an uncommitted card |

Pending, not in production: meridian-learning #136 (YL Band 5.0–8.5 + Cambridge Flyers banner + balanced CTAs). Backlog: 10 older open PRs in meridian-learning and 9 in jurassic-ai-speaking; issues meridian #36, #57, #58, #59 (#59 was resolved by #135 and can be closed by the owner) and jurassic-ai-speaking #105.

## 3. Design scorecard (production, from A1; 0–10)

| Page | Visual | Hierarchy | Type | Spacing | Mobile | CTA | Brand |
|---|---|---|---|---|---|---|---|
| / | 7 | 7 | 6 | 7 | 4 | 6 | 6 |
| /vi | 6 | 7 | 4 | 7 | 5 | 7 | 4 |
| /student-academy | 7 | 7 | 6 | 7 | 6 | 7 | 6 |
| /young-learners-speaking/ | 6 | 5 | 5 | 5 | 4 | 6 | 3 |
| /vi/luyen-noi-ielts/ | 5 | 5 | 3 | 5 | 4 | 6 | 2 |
| /ai-speaking | 7 | 7 | 6 | 8 | 7 | 7 | 4 |
| /ai-speaking/pricing | 5 | 5 | 5 | 6 | 5 | 4 | 4 |
| /ai-speaking/baseline | 7 | 7 | 6 | 6 | 6 | 5 | 5 |
| /framework | 6 | 5 | 6 | 7 | 5 | 4 | 3 |

Every page is below the 9.0 target. Every cell under 8.5 in a critical category is covered by a remediation item below. Scores are a prioritisation aid, not a measure of user satisfaction.

## 4. Ranked remediation register

| ID | Pri | Sev | Area | Finding (evidence) | Effort | Business impact | Needs owner decision |
|---|---|---|---|---|---|---|---|
| R01 | P0 | Critical | Nav / mobile | At 320 px the SPA header menu button sits at x 326–366 in a 320 px viewport, so there is no nav on /, /framework, /methodology and other SPA pages (A1 F01; re-measured by controller) | S | Small-phone visitors cannot navigate | No |
| R02 | P0 | High | Claims / pricing | Priced cards exist for offers with no product in code: Small-Group Lab 2.900.000₫, Self-Study Toolkit 990.000₫, 6-month 30.000.000₫ and annual 55.200.000₫ plans (04/05 #28–30). The directive says not to show services that are not operationally available. | XS copy | Trust; refund risk | **Yes**: confirm which are available now; relabel the rest "by arrangement after the Baseline" or remove |
| R03 | P0 | High | Claims | Homepage credentials (WGU M.S.; International PGCE, Warwick, completing 2026; Advanced TEFL) disagree with /about (CELTA; iPGCE in progress; M.S. 2017, no institution) (05 #1–4) | XS | Credibility | **Yes**: one source of truth |
| R04 | P0 | High | Payments | The YL static PayPal links carry no order reference, child details or consent. Payment is confirmed by hand within 1 day, but the Baseline slot hold is 30 min (04 #6, #7) | M | Lost bookings; consent gap for under-18s | **Yes**: payment-flow change is a controlled approval |
| R05 | P1 | High | Layout | The chatbot shell (331×66) covers CTAs at 1024 and 1440 px. The Contact pill computes bottom 432 px on /framework and 712 px on /ai-speaking/pricing, so it floats mid-page (A1 F02, F03) | S–M | Blocked primary CTAs | No |
| R06 | P1 | High | Brand / type | Four type systems, three headers, three widget systems; off-token #F26419/#D4AF37; the YL header breaks at 1440; VI headings fall back to Georgia; Lilita One lacks Vietnamese glyphs, so words mix fonts (A1 B02, F04, VI-1, VI-2) | L | Brand coherence; VI quality | Design approval (Gate 2) |
| R07 | P1 | High | Performance | Lab LCP: / 5.16 s (hero not preloaded, 1.6 s load delay, oversized for mobile); /ai-speaking 4.80 s (render-blocking Google Fonts, 3.9 s render delay); /student-academy has 776 KiB of savable image bytes (A2 P5–P7) | S–M | SEO / conversion | No |
| R08 | P1 | High | Accessibility | /framework: 15 serious contrast failures. 12 px orange eyebrows measure 3.18:1 site-wide. Targets are too small: /methodology stage buttons 16 px, baseline label rows 19–20 px (A2) | S | WCAG 2.2 AA | No |
| R09 | P1 | Medium | i18n | YL VI switch goes to ?lang=vi, not /vi/luyen-noi-ielts/. A stored VI preference shows the EN page in Vietnamese. 7 AI pages serve VI at ?lang=vi with an EN canonical. Redirects mix 301, 307 and 308 (06) | M | VI SEO; trust | No |
| R10 | P1 | Medium | SEO | /ai-speaking FAQPage is markup-only (jurassic-ai-speaking #105) | S | Search guideline risk | Directive §10 instructs removal plus an eval update |
| R11 | P1 | Medium | Booking | Times are shown only in Hanoi time (UTC+7), although the service is sold for GMT+3 to GMT+8 (04) | M | Missed sessions | No |
| R12 | P1 | Medium | AI product | The 10-credit pack is on sale while only one question set is live. Reports reopen only in the same browser (04/05 #46) | S copy / M feature | Value perception; support load | **Yes** (product) |
| R13 | P2 | Medium | Cambridge naming | PR #136 says "Cambridge Flyer 1 & 2". Cambridge's qualification is "A2 Flyers" (05 #16) | XS | Trademark / accuracy | **Yes**, before #136 merges |
| R14 | P2 | Low | Accessibility | The skip link targets #main-content, which is missing on 15 template pages (06) | XS | Keyboard users | No |
| R15 | P2 | Low | YL page | H1→H3 skip; 13 px body text; three competing hero CTAs on mobile (A1 F05, F06, T01) | S | Readability | No |
| R16 | P2 | Low | Student Academy | Empty Level 5 art; hero illustration reused (A1 H02) | S | Visual polish | Image needed |
| R17 | P2 | Medium | Story Quest | Live = HEAD + an uncommitted card. The dirty tree also has unreleased profile/storage changes, so deploying local dist/ would ship them (06) | M | Data / UX risk | **Yes**: owner of that work |
| R18 | P3 | Medium | Claims | Operational promises with no implementation: parent written notes/portfolio, photo-ID handling, 24-month retention (no deletion job), Band 7 Target Pathway terms (05 #17, #50, #55, #58) | — | Legal / trust | **Yes** (owner/legal) |
| R19 | P3 | Low | Measurement | No conversion baseline; field CWV unavailable (CrUX 429) | M | Can't prove improvements | Privacy-conscious analytics scope |
| R20 | P4 | Low | Hygiene | Stale PRs and issues (section 2) | S | Noise | Triage |

## 5. Design-review process (Gate 2)

1. **Capture before.** A Playwright script (reusing the A1 harness) takes full-page screenshots of each affected page at 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920 px, in EN and VI, on production.
2. **Automated layout checks** at the same widths: horizontal overflow; elements outside the viewport; fixed or floating widgets intersecting any CTA, link or form control (topmost-element test); CTA baseline spread per card row (≤ 1 px); images with naturalWidth 0; heading order; text clipped by overflow:hidden.
3. **Accessibility.** axe (WCAG 2.2 AA tags) at 375 and 1440; focus-visible tab walk; touch targets ≥ 24 px.
4. **Capture after** on the branch's Vercel preview with the same script, and diff the screenshots.
5. **Human visual review** of every 375 and 1440 pair, plus any width the automated checks flag, scored on the section 3 rubric. A page passes Gate 2 at ≥ 8.5 in each critical category with no open critical or high finding.
6. **Record** results in `07_JE_TEST_AND_RELEASE_MATRIX.md`: page, width, language, check, before, after, evidence path.

A passing build is not a passing design review. Both steps 2–3 and step 5 are required.

## 6. Phased implementation plan (reversible work packages)

Each work package (WP) is one branch and one PR, with a Vercel preview and the section 5 review. Merging and deploying stay approval points.

| WP | Phase | Items | Scope | Risk | Can start now? |
|---|---|---|---|---|---|
| WP1 | 01–02 | R01, R05, R08, R14, R15 | Header fit at 320 px; widget positioning and avoidance; contrast tokens for eyebrows and /framework labels; touch targets; skip-link target; YL heading order | Low (CSS/markup) | Yes |
| WP2 | 03 | R10 | Remove the markup-only AI FAQPage (EN/VI) and update evals/seo-jsonld.mts; nothing else in the payment app | Low | Yes (directive §10) |
| WP3 | 04 | R07, R16 | Hero preload and responsive srcset; AI landing font loading (self-host/subset, `display=swap`, preload); Student Academy image sizes; Level 5 art (needs an image) | Low–medium | Yes (except the art) |
| WP4 | 06 | R09, R06 (VI part) | VI switcher to localized URLs; stored-preference fix; a display face with Vietnamese glyphs on YL/VI; consistent 301s | Medium (SEO) | Yes, after WP1 |
| WP5 | 01/04 | R06 | Design-system consolidation: one token set, one header, one contact/chat pattern across main site, Student Academy, YL and AI Speaking (spec first: `02_JE_DESIGN_SYSTEM_SPEC.md`) | Medium–high (cross-app) | Spec now; build after Gate 2 approval |
| WP6 | 05 | R02, R03, R12, R13, R18 | Copy/claims corrections once the owner decides | Low code, high trust | **Needs decisions** |
| WP7 | 05 | R04, R11 | PayPal order references + consent; slot hold vs manual confirmation; viewer-timezone display | High (payments) | **Needs approval**; design first |
| WP8 | 07 | R17 | Story Quest preservation: full backup outside the tree, inventory, isolated worktree, live/source reconciliation. No live changes | Medium | Backup and inventory can start now (non-destructive) |
| WP9 | 09 | R19 | Privacy-conscious event plan (no PII or answers), baseline measurement | Low | Plan now |
| WP10 | 10 | R20 + regression | Reusable regression suite (verify-overhaul, audit-jsonld, the layout harness); triage the stale backlog | Low | After WP1–4 |

## 7. Decisions needed from the owner

1. **R02:** which of the Small-Group Lab, Self-Study Toolkit, 6-month and annual plans are available today.
2. **R03:** the authoritative credential line.
3. **R13:** the Cambridge naming for PR #136, e.g. "Cambridge A2 Flyers Speaking preparation (Levels 1 & 2)".
4. **R04, R11:** whether to change the PayPal and booking flows (a payment-behaviour change).
5. **R12, R18:** product and legal statements.
6. **R17:** who owns the uncommitted Story Quest work.

Approve WP1–WP3 (and WP8's non-destructive backup) to start the reversible engineering work.
