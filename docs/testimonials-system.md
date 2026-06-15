# Testimonials & Social-Proof System

Enterprise, verified-only, consent-gated, child-safe social proof for
`/young-learners-speaking/` (reusable site-wide). Phased delivery; each phase
ships behind the `VITE_TESTIMONIALS_ENABLED` flag (default **off**) with green
acceptance tests.

## Non-negotiable invariants (enforced as code, see `tests/testimonials.test.ts`)
1. **Verified-only.** Only `status:"published"` + `consent.granted` + a non-empty
   `consent.record` may render. `getPublishable()` is the single gate; drafts,
   verified-but-unpublished, archived, and unconsented entries are structurally
   excluded. Components must never read raw entries.
2. **Minor-safe (PDPD / child safety).** `authorDisplay` carries no minor PII
   (no school/grade, email, or phone). Photo/video render only when
   `consent.scope` explicitly permits it. `getMinorSafetyViolations()` /
   `assertMinorSafe()` enforce this.
3. **Consent on record.** No `consent.record` → not publishable. Real entries
   arrive via the Phase 4 moderation pipeline, never edited into "published" by hand.
4. **Claim discipline.** Quotes are linted (`checkClaimDiscipline`) for
   score-guarantee / band-promise language (en/vi/zh). Reviewer-stated bands are
   allowed only as the reviewer's own words, never as a JE promise.
5. **Schema honesty.** `Review`/`AggregateRating` JSON-LD is emitted **only** when
   ≥ `MIN_REVIEWS_FOR_SCHEMA` (default 3) genuine, consented, rated entries exist
   (`buildReviewSchema()` returns `null` otherwise). `assertSchemaHonesty()` is a
   build/CI guard that fails on self-serving markup.

## Files (Phase 1 — Foundation)
- `src/types/testimonial.ts` — typed contract (status, consent, scope, program, locale, media).
- `src/content/testimonials.json` — source of truth. **Seeded with draft/no-consent STRUCTURE EXAMPLES only** — they never publish.
- `src/lib/testimonials.ts` — pure data layer + all guardrail logic + conditional schema builder + feature flag.
- `src/components/TestimonialsEmptyState.tsx` — honest empty state (en/vi/zh), CTA to the free-evaluation form. We never fabricate content to fill space.
- `src/styles/testimonials.css` — design tokens (scoped under `.je-testimonials`; safe in the SPA and the YL island).
- `tests/testimonials.test.ts` — acceptance tests (`npm run test:testimonials`).

## Adding a verified testimonial (target: < 5 min, finalized in Phase 4/5)
1. Capture parental consent with explicit scope on the post-evaluation form.
2. Enter as `status:"draft"`, `consent.granted:false` until reviewed.
3. Human review: claim discipline + minor-safety + consent on file → `verified`.
4. Flip to `published` with the stored `consent.record` id. Build re-runs guards.
5. Revoke by setting `status:"archived"` (removed from output + schema within 72h).

## Roadmap
- **Phase 1 (this PR):** foundation — types, data layer, guardrails, empty state, tokens, tests. *Nothing mounted, nothing published.*
- **Phase 2:** `featured` + `wall` + accessible carousel components; mount on the YL page slots (coordinate with the in-flight YL header/perf branch).
- **Phase 3:** conditional Review/AggregateRating injection + claim-discipline CI assertion + analytics events.
- **Phase 4:** consent/moderation pipeline (Notion DB or admin flow) + revocation + full i18n.
- **Phase 5:** a11y audit, Lighthouse, CI assertions, runbook + editorial guide.
