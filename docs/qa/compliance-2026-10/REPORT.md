# JE compliance and QA scorecard — 27 October 2026

## A. Plan and scope

Audit the six areas in the supplied compliance brief, fix reproduced JE-owned defects in independent PRs from latest marketing `origin/main` (`d81d1bd`), and distinguish engineering proof from legal, merchant, authenticated and operational validation. King-coder plan/spec lock was frozen before edits. The initial production checks were anonymous/read-only, with local mocked mutations/load. Jay subsequently approved isolated staging purchases and load: the [staging follow-up](STAGING-FOLLOWUP.md) records six synthetic staging users/four orders and related records. No merge, production deployment, real payment, message, production data change or payment/vendor setting change was performed. No new traffic to the production origins occurred after the staging-only instruction.

The brief is a scope document, not verified evidence. Its Decree 13-only privacy baseline is stale in October 2026: official sources establish Vietnam Law 91/2025/QH15 and Decree 356/2025 effective 1 January 2026. Hosted card redirects support SAQ A alignment, not certification or automatic eligibility. See the specialist reports for primary sources and qualifications.

## B. Implementation and scorecard

A status of FIX-PR means a verified defect has a proposed code fix; it does **not** assert that the fix is deployed or that the entire standard is satisfied. NEEDS-JAY identifies evidence or business/operational decisions still required.

| Area | Result | Evidence and residual gap |
|---|---|---|
| Security / OWASP / PCI | FIX-PR + NEEDS-JAY | [PR 209](https://github.com/lovermac31/meridian-learning/pull/209): body-parser 1.20.8→1.20.9, production audit 0, compressed-body regression. Sampled headers/CSP and portal source RLS/grants/session review completed. Full dev/toolchain audit still 8 affected packages (5 high / 2 moderate / 1 low). Deployment rate/body limits, applied grants, provider/PCI/ASV evidence remain open. |
| Privacy | FIX-PR + NEEDS-JAY | [PR 210](https://github.com/lovermac31/meridian-learning/pull/210): default-off GA4/Vercel analytics+SpeedInsights, bilingual reject/accept/settings/withdrawal, deletion-request email route; standalone optional telemetry disabled. Browser default/reject/withdraw checks pass. Legal bases, parental process, retention/deletion enforcement, transfer/vendor agreements and external app analytics need owner/legal validation. |
| WCAG2.2AA | FIX-PR + NEEDS-JAY | [PR 211](https://github.com/lovermac31/meridian-learning/pull/211): WebKit sample-dialog Tab containment fixed;12 regression combinations pass.52 initial axe scans clean, but enabled StoryQuest Start state fails contrast 1.01:1 in all 6 browser/width pairs. Sample images need accessible equivalents. The approved staging follow-up adds 24 authenticated portal scans with zero violations; native screen-reader/device checks remain open. |
| Functional | FIX-PR + NEEDS-JAY | [PR 212](https://github.com/lovermac31/meridian-learning/pull/212): sample fetch 15s deadline and fixed-origin EN/VI PayPal return/cancel navigation with no payment variables.35 cards × 2 locales prices match;115 internal responses clean;10 isolated form cases pass;404 checks pass. Existing portal 16/16 simulation/five CI jobs reused. The follow-up adds 25 passing staging API assertions and 6 authenticated browser combinations including QR, My products and own PDF download; real settlement/full-edition fulfillment remain unverified. |
| Performance | NEEDS-JAY | Eight mobile Lighthouse navigations completed: local marketing 99 × 4; live AI90/reader 74/portal-login99/Quest88. Reader LCP 6.219s is a clear follow-up, not a marketing regression claim. Local API load 500 requests / 10 connections, no transport errors or outbound calls, expected throttling. Approved staging catalog load now passes 600 reads/10 connections/30.07 seconds with 0 errors, and authenticated staging buy Lighthouse scores 100. Direct DB/RPC load does not measure public portal rendering; no production load occurred. |
| Compatibility | FIX-PR + NEEDS-JAY | Chromium/WebKit/Firefox at390/1440; products/sample/video/captions/reader/Quest interactions exercised. WebKit focus fix inPR 211. Firefox reader emits auth LockManager errors but scenes navigate. WebKit engine tests are not a physical iPhone/Safari test. |

Detailed evidence:

- [Security report in PR 209](https://github.com/lovermac31/meridian-learning/blob/codex/compliance-security/docs/qa/compliance-2026-10/SECURITY.md)
- [Privacy report in PR 210](https://github.com/lovermac31/meridian-learning/blob/codex/compliance-privacy/docs/qa/compliance-2026-10/PRIVACY.md)
- [Accessibility/compatibility report in PR 211](https://github.com/lovermac31/meridian-learning/blob/codex/compliance-accessibility/docs/qa/compliance-2026-10/ACCESSIBILITY-COMPATIBILITY.md)
- [Functional/performance report](FUNCTIONAL-PERFORMANCE.md), [approved staging follow-up](STAGING-FOLLOWUP.md), and machine-readable evidence in `evidence/functional/` and `evidence/staging/`.

### Marketability and EN/VI fluency

First-screen review used390 × 900 browser captures. Home clearly identifies story-led English for children/teens and provides paths to products; a single price is inappropriate for its multiple offers. Story Club landing shows ages5–8, group format,590.000₫/four weeks and a Zalo action within the first screen. Story Club product detail has title/problem/image but its image pushes price and purchase action below the fold. Products has approved price/action details behind compact product controls. Reader and StoryQuest correctly present free access rather than invented purchase prices.

Proposed concise detail-page lead, using existing offer facts:

- EN: “Online story groups for children aged 5–8. 590,000₫ for four weeks. Ask about Story Club on Zalo.”
- VI: “Nhóm học trực tuyến qua truyện cho trẻ 5–8 tuổi. 590.000₫/4tuần. Hỏi về Story Club qua Zalo.”

Place the existing price and primary action immediately after that lead, before the large image. This is a layout/copy follow-up; no new promise or price was published. No speculative broad rewrite was applied to working copy. Pricing, learner outcomes, ages and licensing remain unchanged in the proposed code fixes.

## C. Verification

- Security: production audit 0;385 tests in green GitHub verify, bounded built-secret scan267 artifacts/zero selected pattern hits, sampled live headers. Full dev audit findings remain disclosed.
- Privacy:386/386 full tests;17 targeted tests; built/prerender/typecheck. Mocked-vendor browser tests on EN/VI products and static Young Learners record0 optional scripts default/rejected,3 after explicit acceptance,0 additional after withdrawal/reload. Failed-storage revocation regression included. Banner stays below sample modal.
- Accessibility:54 visits/52 new initial axe scans; prior products Chromium scan reused. Actual selected-age Quest state separately fails contrast and is explicitly open.12/12 fixed sample keyboard regressions; video decoding/caption selection and reader/Quest navigation across six engine/width pairs.384 existing tests/typecheck/build in that isolated branch.
- Functional:385/385 final full tests and6/6 focused checks after return addition; types/build pass. All70 locale/card VND checks and 60 PayPal amounts match live source; zero price mismatches.115 status checks, two explicit404s,10 intercepted form scenarios. No payment was made.
- Performance: all 8 mobile Lighthouse results and local Autocannon summary committed. Four local scores 99; reader 74 deserves targeted investigation. Portal login is explicitly not authenticated purchase coverage.

Each code PR is independent from `d81d1bd`; none silently includes another area's fix. A separate detached local integration checkout combined code commits `aa8ce40`, `a77cd56`, `e6b8ce8` and `9f1e3fb` without conflicts: **388/388 tests, typecheck and production build passed**. Against that combined build, all **12 sample keyboard cases**, the **three-page consent lifecycle/withdrawal harness**, and **six additional mobile axe scans** passed with zero violations. Both EN/VI deletion links were verified. Integrated JSON evidence is committed beside the functional summaries. This is local integration evidence, not a merge or deployment. CI status is attached to the independent PRs; green source/build checks do not close legal or deployment gaps.

## D. Hardening, owner decisions and rollback

Only Jay/authorized operators can supply or decide the following; no additional action was executed against live systems:

1. Approve current-law privacy wording and operation-specific bases, parental-consent process, transfers/processors and retention/deletion schedule; demonstrate actual deletion/retention operations. Existing policies alone are not enforcement proof. Confirm the conservative global opt-in banner choice before merging; it already has a reviewable implementation.
2. Obtain accepting-entity SAQ A scope/eligibility confirmation, provider AoCs/responsibility split and required ASV/annual validation evidence. No payment processing was certified.
3. Review/merge [portal foundation PR 1](https://github.com/lovermac31/je-portal/pull/1) before main-based portal hardening. Audited app source is 993afc7; portal main 2be9821 is README-only. The approved staging UI/catalog checks are now complete in the linked addendum. Production data remains outside test scope; physical-device, email-delivery and production operations still need their own evidence.
4. Verify deployed migration 009/RLS grants and trusted-proxy ingress/body/time/rate controls; verify production durable-limiter enablement without exposing secrets. Address remaining toolchain advisories separately and assess how deployed functions package them.
5. Reconcile StoryQuest's deployed source, fix enabled Start contrast, and provide accessible text equivalents for sample images. Investigate Firefox reader auth locks and slow reader first paint in their owning apps. Arrange physical Safari/iPhone, screen-reader and caption-language review.

Rollback is per PR: revert the relevant commit and rebuild. No schema/migration/vendor rollback is needed. Dependency rollback restores a known HIGH; privacy rollback restores pre-consent loading; prefer forward fixes or disable optional collection while investigating. A browser return must never unlock products or be accepted as payment proof. API deadlines do not guarantee that a server-side write did not occur; no automatic retry was added.

## E. Confidence

High (0.92) in the bounded, reproduced code fixes and reported executed checks. Medium for complete compliance/production readiness: legal and operational evidence, vendor settings, external-app defects and physical-device/assistive-technology coverage are unresolved. Authenticated staging evidence is now supplied in the addendum. Weighted assessment prioritizes verified code/browser/CI evidence over untested source assertions; no blanket PASS or certification is claimed.

## F. Assumptions

The supplied brief authorizes safe code fixes and draft PRs, while reserving merge/deploy for Jay. Current 35-card live/source catalogue is authoritative; earlier Notion28-row tasks were not reused as current price evidence. Public anonymous flows and synthetic intercepted input contain no personal/student records. Other contributors' dirty original checkouts were not changed.

## G. Tradeoffs / blind spots

1. Clean initial axe and single-run Lighthouse scores are bounded snapshots; interactive states, field metrics and real assistive technologies require additional evidence. The Quest contrast failure illustrates why initial axe alone is insufficient.
2. Existing portal simulation is strong local CI evidence, but it cannot establish live settlement, deployed grants, delivery reliability or successful erasure. The follow-up tests the actual isolated staging catalog, while distinguishing direct DB/RPC capacity from public portal rendering and production capacity.
