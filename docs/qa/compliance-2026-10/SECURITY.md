# Security and PCI evidence — 27 October 2026

Audit snapshot: marketing source `d81d1bd`, isolated branch `codex/compliance-security`; portal source `993afc7` inspected read-only. Production observations made using anonymous GET requests on 27 October 2026 (ICT). This is an engineering assessment, not a certification or penetration test. No real lead, account, purchase, payment webhook or database mutation was submitted. No credentials were read or printed.

## Decisions

| Area | Result | Evidence / remaining action |
| --- | --- | --- |
| Production dependency vulnerability | FIX-PR | Confirmed `body-parser` 1.20.8, HIGH [GHSA-27r3-jxmh-p828](https://github.com/advisories/GHSA-27r3-jxmh-p828). Lockfile now pins 1.20.9; runtime declarations unchanged. Production audit falls from 1 HIGH to zero. |
| Marketing response headers | PASS for sampled responses | `/products` and `/ai-speaking` returned HTTP 200 with CSP, HSTS, nosniff, DENY framing, referrer and permissions policies. Source `vercel.json` agrees. This does not prove every route or deployment. |
| Marketing CSP strength | NEEDS-JAY follow-up | CSP allows inline scripts/styles, arbitrary HTTPS images and a wildcard Supabase connection domain. No unsafe-eval. A nonce migration needs coordinated prerender/inline-style testing; removing unsafe-inline alone would break existing generated pages. No untested header change included. |
| Public form validation / abuse controls | PASS in reviewed code and local tests; configuration conditional | `sample-pack`, `get-started` (including Student Academy branch), `pricing-registration` and `generate-image` validate inputs and use rate limits; lead forms use honeypot/timing checks. Durable limiter is opt-in and defaults/falls back to per-process memory. Verify production `ENABLE_DURABLE_RATE_LIMIT` and credential-presence flags without exporting values. Per-process limits do not guarantee cross-instance protection. |
| Operator APIs | PASS for source controls | Scoped >=24-character bearer secrets, constant-time comparison, optional IP allowlists and audit events in `api/_lib/operatorSecurity.ts`; legacy shared-key fallback exists. Operators: access-link generation, lead inspection/schema mutation and internal pilot handlers. Their auth is not replaced by CORS. IP attribution assumes a trusted deployment proxy sanitizes forwarded headers. |
| Client secrets | PASS for bounded scan | Fresh build: 267 `.js`, `.html`, `.json` files scanned; zero matches for private-key blocks, Google/AWS/GitHub/Stripe secret signatures or listed server-secret variable names. Vite defines no injected API key. This is a bounded pattern scan, not proof no secret can exist. No secret-bearing env files were loaded for this audit. |
| Portal headers and sessions | PASS for sampled response and source | Anonymous root redirected to `/login?next=/my`, HTTP 200. Nonce/strict-dynamic CSP, HSTS, nosniff, DENY and referrer/permissions policies observed. `proxy.ts` creates nonce and refreshes Supabase auth; server client uses httpOnly, HTTPS-dependent Secure, SameSite=Lax cookies; `currentUser()` verifies with `getUser()`; `safeNext()` restricts post-login redirects. |
| Portal RLS / grants | PASS for source; NEEDS-JAY deployed verification | Core tables enable RLS; owner-read policies bind `auth.uid()`; direct writes revoked. Migration 009 explicitly removes worker RPC execution from PUBLIC/anon/authenticated, grants service_role only, removes buyer RPC execution from anon. No database was queried: source presence is not proof migrations are applied or advisory results remain clean. |
| Portal webhook boundaries | NEEDS-JAY hardening after foundation merge | SePay checks 16 KiB, raw-body HMAC SHA-256 with constant-time comparison, +/-300-second replay window, safe-integer non-negative amounts and inbound transfers; DB controls duplicate events, currency and entitlement decisions. PayPal validates/re-reads provider objects, verifies webhook signatures via fixed PayPal API, uses idempotency keys and 10-second fetch timeout. However both route handlers call `req.text()` before checking body size; repo `deploy/` contains no verifiable nginx rate/body-limit configuration. Confirm ingress body/time/rate caps; add bounded stream reading later if absent. Do not mistake post-read limits for allocation limits. |
| Development toolchain vulnerabilities | NEEDS-JAY / separate dependency work | Full audit remains 8 affected packages (5 HIGH, 2 moderate, 1 low), including `@vercel/node` and its busboy/path-to-regexp/undici chain, ajv/static-config, Vite and esbuild. Several fixes involve major runtime-tooling changes. They remain explicitly open; production-only audit excludes them and is not a full-clean claim. Do not expose development servers publicly. Confirm how Vercel packages functions before concluding the dev classification excludes deployment relevance. |

## PCI redirect-flow evidence and limits

Marketing `src/lib/paypal.ts` constructs PayPal hosted `_xclick` webscr links to `https://www.paypal.com/cgi-bin/webscr`; product/order identification and the amount are forwarded, without a JE-hosted card-entry field. Portal `app/api/pay/paypal/start/route.ts` obtains the authenticated buyer's order from the database and sends an HTTP 303 redirect to PayPal approval. Return/webhook handlers use server-only PayPal API credentials, re-read amounts/currency and record outcomes through payment RPCs. No embedded PayPal card SDK is allowed by portal CSP. VietQR/SePay uses a bank-transfer reference and signed notification rather than a JE card form. Manual reconciliation of marketing webscr sales remains an operational process; this audit did not submit a sale or verify merchant-account settlement.

These observations support **SAQ A alignment for a fully outsourced card redirect channel**, subject to all eligibility criteria and the accepting entity's decision. They do not establish merchant level, SAQ eligibility, provider compliance, completion of an SAQ/AoC, or PCI certification. The bank-transfer rail does not by itself prove the PayPal channel's PCI obligations are satisfied.

Primary sources read on 27 October 2026:

- [PCI SSC FAQ 1588](https://www.pcisecuritystandards.org/faqs/1588/): the specific embedded-form script eligibility criterion excludes redirect-only integrations; other eligibility criteria still apply. Consult the acquirer/compliance-accepting entity about the appropriate SAQ.
- [PCI SSC FAQ 1604](https://www.pcisecuritystandards.org/faqs/1604/): SAQ A external vulnerability-scan requirements also apply to merchant redirect webpages. An npm audit or this read-only review is not an ASV scan.

NEEDS-JAY: obtain accepting-entity scope/SAQ confirmation, applicable provider AoCs/responsibility statements, and evidence of required ASV scans and merchant annual validation. No payment/vendor configuration was changed.

## Actual verification

All mutation-capable verification was confined to localhost/mocks. Commands were run in the security worktree unless noted.

| Command / check | Actual result |
| --- | --- |
| `npm ci --ignore-scripts` (baseline) | Successful; baseline production audit: 1 HIGH (`body-parser` 1.20.8). |
| `npm update body-parser --package-lock-only --ignore-scripts` | Resolved 1.20.9. Unrelated npm optional-package metadata churn discarded; retained only the body-parser package record from npm output. Final lock diff: 3 insertions / 3 deletions. |
| `npm ci --ignore-scripts` (updated lock) | Successful; installs deterministic patched dependency tree. |
| `npm audit --omit=dev --json` | 0 info/low/moderate/high/critical (exit 0). |
| `npm audit --json` | 8 affected packages: 5 HIGH, 2 moderate, 1 low (exit 1); findings documented above. |
| `npm test` after dependency patch, before new regression test | 384 passed, 0 failed/skipped. |
| `node --import tsx --test tests/bodyParserSecurity.test.ts` | 1 passed; malformed gzip with trailing bytes returns 400; a subsequent valid compressed JSON request succeeds (204). Entirely localhost, ephemeral port, 3-second request timeout. |
| `node --import tsx --test tests/bodyParserSecurity.test.ts tests/rateLimit.test.ts tests/cors.test.ts tests/operatorSecurity.test.ts tests/paypal.test.ts` | 33 passed, 0 failed/skipped. Overlaps previous suite; do not add totals together. |
| `npm run lint` / repeated after new regression | TypeScript noEmit exits 0. |
| `npm run build` | Exit 0; 196 route HTML files generated (193 SSR / 3 client-only); sitemap generation succeeded. Existing bundle-size warnings are not security failures. |
| Built artifact bounded secret scan | 267 HTML/JS/JSON files, zero pattern matches; no matching values emitted. |
| Portal `npm audit --package-lock-only --omit=dev --json` | 0 reported vulnerabilities; read-only dependency audit of portal lockfile. No portal installation/change or live API call. |
| `git diff --check` | Clean. |

Portal's prior 16/16 simulated-purchase CI result was described by the brief; it was not rerun or represented as a new result. No live RLS/advisor/authenticated-user testing was performed. No live endpoint fuzzing, load or exploit request was attempted.

## Change boundary and rollback

Changes: `package-lock.json` (body-parser record only), `tests/bodyParserSecurity.test.ts` (local regression), and this report. No payment code, vendor configuration, schema, secret, privacy/UI or portal file changed.

Review before commit/PR; no deployment is authorized. Roll back by reverting the eventual security change commit, then clean-install from the prior lockfile. That would restore the known HIGH dependency vulnerability, so prefer a forward fix and use rollback only for a demonstrated regression.

Portal `origin/main` is README-only at `2be9821`, while the audited foundation is `993afc7`. **NEEDS-JAY: merge the foundation first**, then propose portal hardening from the merged main branch. Do not create a misleading portal fix PR containing the whole unmerged foundation. Highest-confidence result: reproducible production dependency fix and bounded local checks. Broad OWASP/PCI compliance remains unproven until deployment, operational and external validation gaps above close.
