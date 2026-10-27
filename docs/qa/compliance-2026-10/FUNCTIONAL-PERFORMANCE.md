# Functional and performance evidence — 27 October 2026

Source baseline `d81d1bd`; isolated branch `codex/compliance-qa`. Anonymous production GET checks only. Forms and load use localhost with intercepted/forbidden outbound requests. No real message, lead, order, payment, webhook, upload, account or vendor setting changed.

## A. Plan

Check current EN/VI prices and payment links, exercise form errors locally, reuse the verified portal purchase simulation, run eight mobile Lighthouse navigations and bounded localhost API load. Separate code proof from production settlement, authenticated UI and legal proof.

## B. Implementation

Two bounded functional fixes:

1. The sample form previously waited indefinitely for a stalled fetch. `submitSamplePack` aborts after 15 seconds, clears its timer on every outcome and uses the existing localized safe error state. No automatic retry: the server might already have stored a lead. Existing server input validation, honeypot, consent check, upstream timeouts and structured redacted events remain authoritative.
2. All 30 live PayPal-enabled cards lacked explicit return/cancel navigation in both languages. Product links now specify the fixed JE origin, matching EN/VI products page and card anchor; `rm=1` requests GET navigation without payment variables. The existing allowlisted product lookup prevents arbitrary redirect targets. Amount, currency, merchant, order code and manual Drive fulfillment are unchanged. Return navigation neither claims payment success nor grants access.

The generic PayPal helper and other payment rails remain unchanged. These are URL parameters in product links; no PayPal account setting or callback handler changed. [PayPal's primary parameter reference](https://developer.paypal.com/api/nvp-soap/paypal-payments-standard/integration-guide/Appx-websitestandard-htmlvariables/) documents `return`, `cancel_return` and `rm=1`.

## C. Verification

| Check | Observed result | Limit |
|---|---|---|
| Live EN/VI catalogue | 35 cards × 2 locales; every VND price found, all PayPal amounts matched source, zero mismatches | Live HTML versus current approved source, not merchant settlement |
| Public internal link crawl | 115 unique/bounded responses, zero HTTP errors | GET status check; not every asset, fragment, private route or soft-404 heuristic |
| Missing route / retired PDF | `/__je_qa_missing_20261027` and `/samples/baseline-sample.pdf` both HTTP404 | Anonymous production GET |
| Source Zalo/order-code checks | Existing products/source tests preserve channel source, code and merchant references | Links inspected; no Zalo message sent |
| Form browser matrix | EN/VI × success/400/429/502/network failure = 10 passes; invalid contact/missing consent make zero submissions; success shows four samples; failure restores submit button | Every POST intercepted, synthetic `.invalid` email; no downstream persistence proof |
| Request helper | Success, safe HTTP errors, stalled fetch abort and no automatic retry pass | Unit-level transport stub |
| PayPal local SSR | All digital cards: original USD/merchant/custom preserved; EN/VI return and cancel anchors, `rm=1` verified | Does not complete real/sandbox hosted payment |
| Application suite after timeout fix | 385/385 pass, no skipped/failed; types/build pass | Final full local suite after return-link addition also 385/385; CI rechecks independently |
| Final focused suite | 6/6 pass after return-link addition; typecheck/build pass | Includes all international product/payment assertions |
| Portal existing purchase proof | Foundation PR 1 at `993afc7`: verify/database/supabase/security/image all SUCCESS; CI includes simulated purchase and negative webhook cases | Existing test evidence reused as requested, not a new live order |

Portal source `origin/main` is still README-only `2be9821`; the application is on the unmerged foundation. [Portal PR 1](https://github.com/lovermac31/je-portal/pull/1) and [Supabase test job](https://github.com/lovermac31/je-portal/actions/runs/40473631633/job/122086423601). No portal code was changed or imported into a misleading main-based fix PR.

### Mobile Lighthouse 12.8.2

Pinned QA-only tools; Node 22.17.0 and muted Chromium 153. Single cold mobile simulated-throttling navigation per URL, serial. Local results measure built static/SSR pages, not production CDN/device/network performance. Other apps use public read-only live URLs. Do not compare these mixed origins as a controlled before/after experiment. Portal result is **login**, not authenticated buy.

| Surface | Target | Score | LCP | CLS | TBT |
|---|---|---:|---:|---:|---:|
| Home | localhost5200 `/` | 99 | 2.110s | .000023 | 35.5ms |
| Products | localhost5200 `/products/` | 99 | 2.038s | .000023 | 79ms |
| Story Club product | localhost5200 `/products/story-club/` | 99 | 2.087s | .000023 | 0ms |
| Story Club | localhost5200 `/story-club/` | 99 | 1.959s | .000023 | 0ms |
| AI Speaking | live `/ai-speaking` | 90 | 3.203s | .017828 | 195ms |
| Mina reader | live books subdomain `book.html#mina-and-the-midnight-drum` | 74 | 6.219s | 0 | 114ms |
| Portal buy redirect | live `/login?next=%2Fbuy%2Fprintable-pack` | 99 | 1.188s | 0 | 52ms |
| Story Quest | live Vercel `/#home` | 88 | 3.095s | 0 | 0ms |

Reader LCP is the clearest follow-up; inspect image/network waterfall and exact deployed source before changing that external app. AI Speaking and Story Quest also exceed 2.5s in this single lab run. No production performance regression is attributed to the marketing fixes from these measurements. Field Core Web Vitals and physical iPhone remain unverified.

### Isolated light load

Autocannon 8.0.0; actual sample-pack handler behind a minimal local HTTP adapter, **10 connections, 100 req/s, 5s**, invalid synthetic body only. All outbound fetches forbidden; durable store forced to local memory. 500 completed requests: five 400 validations then 495 responses with status 429; zero transport errors/timeouts/outbound attempts; average 2.2ms, p99=13ms. This establishes local validation/throttling behavior, not throughput of successful email/Notion writes, distributed rate limits or Vercel transport capacity.

**Portal catalog load not run.** No approved isolated staging/database was provided; a mock catalog cannot substantiate real database capacity. No production load was performed. Staging simulation needs the foundation merged and safe test fixtures without production bank/data credentials.

### Reproduction

```sh
npm ci
npm run lint
npm test
npm run build
node --import tsx --test tests/products-international.test.ts tests/sample-pack-request.test.ts
npm run preview -- --host 127.0.0.1 --port 5200
```

Expected: types/tests/build pass; inspect `/products/` and `/vi/products/` PayPal hrefs without navigating to checkout. Vite preview extensionless `/products` can serve the SPA fallback; trailing-slash preregenerated route is required for faithful static-page measurements. QA tool versions: Lighthouse 12.8.2, autocannon 8.0.0, Playwright1.63.0 (external QA installation, not runtime dependencies). Machine-readable summaries in `evidence/functional`; full Lighthouse JSON and exploratory harnesses retained locally in ignored `.regen/runs/compliance`.

## D. Hardening / rollback

No secrets introduced, no environment values read into reports, no schema/data changes. Fixed return origin and locale allowlist; API remains responsible for untrusted form inputs. Safe UI errors do not expose response bodies. Automatic retry is absent to reduce duplicate persistence. A timeout does not prove the request failed server-side.

Rollback: revert the functional commit and rebuild; this restores unbounded waiting and provider-default return navigation. No migration/vendor rollback needed. Prefer a forward fix for a demonstrated regression. Never treat a browser return URL as payment verification.

## E. Confidence

High (0.92) for the reproduced bounded defects, local tests and live link/price observations. Medium for end-to-end payment/production capacity: existing portal CI is green, while real merchant settlement, authenticated staging and distributed ingress remain unverified.

## F. Assumptions

Current35-card source is the intended price catalogue; no earlier27/28-row Notion snapshot was used as pricing authority. All frontend submissions were intercepted. The existing portal simulation evidence is intentionally reused per brief.

## G. Tradeoffs / blind spots

Single lab runs are directional; mixed local/live measurements cannot establish a deploy delta. Public GET and mocked form checks cannot certify real fulfillment or authenticated portal behavior.
