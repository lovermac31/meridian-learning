# Adult IELTS Speaking Acquisition Candidate

Candidate date: 2026-10-14. English only.
Route: `/insights/online-ielts-speaking-coaching`.

## Release Boundary

This is a draft candidate for parent review, not a claim that the page is live.
The article uses `status: 'published'` in `insightArticles` so the existing route,
metadata, Article JSON-LD, index, prerender and sitemap discovery include it in
the next build. The candidate publication date is 2026-10-14. It becomes public
only after a reviewed build is deployed. No commit, push or deployment is part
of this change. Parent owns dependency setup, build and integration.

## Audience And Path

- Adults 18+ seeking online IELTS Speaking help, initially in Vietnam.
- Overseas participation is conditional on confirming adult eligibility,
  supported payment and compatible session times through booking.
- Free independent One Change practice -> consider paid live Speaking Baseline
  -> optional paid 1:1 coaching. All three use existing native anchor routes.
- Free practice is illustrative, not a personalised assessment. Typed evidence
  cannot establish pronunciation or spoken delivery. A live baseline is a
  limited sample, not an official result, score prediction or proof of lasting
  improvement. No score guarantees or IELTS endorsement.
- Booking is authoritative for current prices, payment methods, currency,
  availability, duration, deliverables and cancellation terms. No credentials,
  payment coverage, outcomes or commercial terms are invented.

## Implementation Boundary

Only article data, the insights renderer, focused tests and this document change.
Explicit slug-to-body entries replace the old implicit third-article fallback.
Missing-body copy is safe and the SSR coverage test fails if any published
article lacks a body. Mobile headings use fixed responsive sizes, article links
are underlined, and repeated index cards use `rounded-lg` (8px). The new guide
does not mount the existing tracked invitation; its free CTA is an untracked
native link. Existing articles retain their invitation. No translations,
tracking, dependencies, secrets, forms or network handlers are added.

## Verification And Parent Gate

Focused command after the parent supplies existing dependencies:

```sh
node --import tsx --test tests/insights.test.ts tests/adult-coaching.test.ts
```

Expected: all tests pass. Tests check SSR audience/limitations, ordered path,
exact CTA targets and truthful labels, absence of invented commercial claims,
distinct bodies for every published article, date/canonical/description/schema,
English-only indexing and prerender discovery. Counts are derived from article
data, not hardcoded to today's number of articles.

Before deployment, parent should run the normal build and prerender validation,
inspect the generated route HTML and sitemap, and review desktop/mobile at
320px, 390px and 1280px for overflow and readable links. Follow the three CTA
routes and confirm that the booking flow can handle adult enquiries. This
candidate does not assert that external booking/payment/timezone support has
been validated. Search indexing and acquisition outcomes are not guaranteed.

Official references checked on 2026-10-14:
- [IELTS Academic Speaking format](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-speaking)
- [IELTS Speaking assessment criteria](https://ielts.org/cdn/ielts-guides/ielts-speaking-key-assessment-criteria.pdf)

## Hardening And Rollback

Static content introduces no input handling, secrets, rate limits or new logging
requirements. Existing route validation and locale release gates remain intact.
Monitor the deployed route and CTA destinations for 404s using existing tooling;
no acquisition tracking is introduced. If release checks fail, do not deploy.
If already deployed, restore the previous deployment artifact. Merely changing
article status is not enough to remove stale generated HTML: rebuild and verify
the route, index and sitemap together. Retain unrelated work during rollback.

Blind spots: external booking compatibility and actual mobile layout require
parent verification; SEO performance requires post-deployment evidence.
