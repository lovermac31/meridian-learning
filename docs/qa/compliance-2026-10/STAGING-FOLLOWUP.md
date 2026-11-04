# Approved staging follow-up — 27 October 2026 (ICT)

## A. Plan and authorization

Jay approved `https://staging.jurassicenglish.com/portal`, its separate Supabase project named “je-portal-staging,” simulated SePay purchases using its existing HMAC configuration, and load up to 50 virtual users for less than two minutes. Main-site checks must use Vercel previews; no new traffic/webhooks may go to `my.jurassicenglish.com` or main production.

This follow-up closes the staging evidence gaps in the initial scorecard. It does not deploy code or certify legal, PCI, WCAG or production readiness. The initial specialist reports remain historical snapshots; their authenticated-portal coverage gap is superseded by the results below.

## B. Implementation and safeguards

No application, deployment, infrastructure, schema, payment-provider, login-wall, master-content or production-data change was made. Changes in this PR are reports and sanitized evidence only.

- Public staging health and the existing container agree on release `c6551b6c754f8a8d97536d62000849d4ab0ec312`, test mode, healthy config/database, automatic SePay recording enabled and PayPal disabled.
- Runtime `SUPABASE_URL` is `https://riwybxamvmtuqovsupee.supabase.co`, distinct from the known production project. The project name comes from Jay's authorization; the endpoint and test-mode configuration were verified in the running container. Email provider configuration is absent, and test Auth users were created confirmed without sending email.
- SSH used the existing trusted host-key entry for `152.42.198.173` and the existing admin identity. No host-key check was disabled or new host key accepted. The alias hostname lacked a trusted SSH entry, so the already-trusted IP was used.
- HMAC/service credentials stayed in the staging container. The existing Basic Auth login was read server-side from `/etc/je-portal/staging.login` into the browser test process environment through captured SSH output. It was never displayed, saved to a credential file or committed. Test session cookies and the staging anon credential stayed in process memory; no credentials appear in evidence.
- API requests use exact staging-origin allowlists and refuse redirects. Browser routes permit staging `/portal` resources and only own signed-copy downloads from the staging Supabase project. Basic Authorization is injected only on the staging origin. No browser external request was observed in the final matrix.
- nginx staging configuration was read only: payment routes have a 16 KiB body cap; job routes are publicly 404; health/payment paths are deliberately outside Basic Auth; portal pages retain the existing login wall. Ingress rate limits and production configuration are not established by this partial config inspection.

### Test fixtures and failed harness attempts

The only active staging catalogue item was **teacher-pack-l2, 690,000 VND**; Printable Pack was not activated or invented. Six clearly marked synthetic users and four synthetic orders were created across the setup and successful runs. Their IDs are listed in `evidence/staging/synthetic-records.json`. Associated payment, entitlement, copy, review and audit records remain for inspection. No destructive cleanup was attempted.

An early API harness tried to create a second order for a product already owned by the same buyer; the RPC rejected it. The underpayment scenario was corrected to use the second synthetic buyer, after which all 25 assertions passed. One unused browser fixture account came from an incorrect “first form” selector: the first form was the header sign-out form. This was corrected. Subsequent runs reused the existing browser buyer/order through an admin-generated, unsent staging sign-in token rather than creating further accounts.

WebKit with request interception returned nginx401 despite the context credentials. A guarded, preemptive staging-only Basic header resolved it; the login wall was not disabled. A second harness assertion incorrectly expected a normal form to trap Tab focus; it was replaced with an observation, not an application patch. Native WebKit Tab moves from the licence input to BODY under its default macOS control-navigation setting, while Chromium/Firefox move to an input. This remains a physical-Safari/full-keyboard-access verification item; do not claim a complete keyboard-only Safari checkout pass.

The initial load harness could not use host Node (not installed), and SSH port forwarding was prohibited. Neither failure sent catalog load. The successful load used direct HTTPS to the explicitly verified staging Supabase catalogue with its anon credential held in memory. A temporary read-only proxy process self-expired after 90 seconds with zero requests; no SSH or server configuration was changed.

## C. Executed verification

| Check | Result | Evidence / boundary |
|---|---|---|
| Environment gates | PASS: HTTP200 health, mode=test, config/db=ok, exact release, separate staging DB endpoint | `preflight.json`; no secrets returned |
| Simulated payment API sequence | **25/25 assertions pass** | `purchase-final.json`; no real transfer |
| Invalid signatures | Bad, missing and stale signatures each 401; order stays awaiting payment with no entitlement | Actual public staging webhook |
| Paid/idempotent path | Valid signed event pays order; repeated event acknowledged; paid amount remains690,000 rather than doubling | Buyer status RPC and own entitlement readback |
| Isolation | Other synthetic buyer cannot read the order, see its entitlement or authorize its PDF | RLS-bound buyer RPCs; no production DB query |
| Automatic fulfillment | Own entitlement active, worker makes PDF ready, own signed download succeeds and order metadata is present | Existing small staging fixture PDF, about 1.8 KiB; this is delivery/watermark proof, **not full-edition content verification** |
| Underpayment/top-up | 100,000 VND remains locked; 590,000 VND top-up yields paid | Second synthetic buyer; no vendor API or real money |
| Authenticated browser flows | **6/6 engine/width combinations pass** | Chromium 153 / WebKit 26.6 / Firefox 155 × 390/1440 |
| Rendered states | Buy, unpaid QR checkout, My products empty, My products paid/ready; six authorized PDF downloads succeed | `browser.json`; UI server action creates one order, public signed webhook pays it |
| Accessibility | **24 rendered-state axe scans, zero violations**, no horizontal overflow or page errors | Not native-device, screen-reader, all-state or caption certification |
| Browser login boundary | Existing HTTP Basic login used; Supabase session seeded for the synthetic buyer | Does not test sending/receiving a sign-in email; no email was sent |
| Catalog light load | **600 requests, 10 connections, 20 req/s, 30.07 seconds; 0 errors/timeouts/non2xx** | Autocannon 8.0.0 against real staging `jec_catalog`, anon role |
| Load latency | Mean 107.47ms, p50=79ms, p97.5=599ms, p99=741ms, max=851ms | Client-to-staging-Supabase network included; not public Next/nginx throughput |
| Authenticated buy mobile Lighthouse | **100**, LCP 977.656ms, CLS 0, TBT 19.5ms, no runtime error | Final URL remains `/portal/buy/teacher-pack-l2`; one lab navigation, not login |
| Main-site Vercel preview |35 cards × 2 languages, 60 PayPal links; zero price or return/cancel mismatches | Preview commit 5847697; authenticated Vercel connector, no new production requests |

Mobile Lighthouse 12.8.2 preserved only the seeded staging auth cookies (`disableStorageReset=true`), used muted Chromium, and blocked both production origins. Only selected metrics were saved: a complete LHR can contain the Basic Authorization configuration, so it was deliberately not archived. This single result supplements the earlier public-login measurement; it is not a controlled production speed comparison.

### Load interpretation

The 600 calls exercised the actual isolated staging `jec_catalog` RPC. They did **not** exercise Basic Auth, Next rendering, successful form writes or webhook/stamping concurrency. It would be false to describe this as 600 full purchase requests or an end-to-end public buy-page capacity test. Maximum concurrency 10 and measured duration 30.07 seconds meet Jay's ceiling 50 and limit under 120 seconds. Staging health remained 200/test/config-ok/db-ok after the run.

### Main preview provenance

The Vercel deployment is `dpl_DYVBb7GbLQi3CktL4u45DnXnXJLp`, preview URL `https://jurassic-english-o0hb2meuk-jay71adams-1388s-projects.vercel.app`, Git head `5847697a0a5851bb56f072ba711d91e54f930298`. The connected Vercel tool provided temporary private access to the protected deployment; access URLs/cookies are not in the report or evidence. EN/VI HTML has all35 expected cards, matched VND/USD amounts, localized fixed-origin PayPal return/cancel anchors and `rm=1`. The production URLs in those hrefs were inspected as strings, never navigated.

### Reproduction boundaries

The actual exploratory harnesses and sanitized run logs are retained locally in `.regen/runs/staging-followup/` in the compliance QA worktree. They are intentionally not production scripts or unattended jobs: they contain explicit fixture/release guards and create synthetic staging records. The committed JSON evidence is the stable audit record. A repeat run must reconfirm the staging release, DB endpoint, test-mode/email/payment flags and ownership of reused fixture IDs; never point it at production or reuse an arbitrary real user.

For the bounded load, the essential reviewed parameters were:

```js
// Existing staging anon credential loaded privately at runtime, never printed.
autocannon({
  url: verifiedStagingSupabaseUrl + '/rest/v1/rpc/jec_catalog',
  method: 'POST',
  headers: { apikey: stagingAnon, Authorization: 'Bearer ' + stagingAnon,
    'Content-Type': 'application/json' },
  body: '{}', connections: 10, overallRate: 20, duration: 30, timeout: 6,
});
```

No full Autocannon configuration/result object containing headers or session objects was logged; only selected numerical metrics were archived.

## D. Hardening and rollback

There is no code/config/schema deployment to roll back. All transient browsers, Lighthouse Chrome and temporary proxy processes stopped. Credentials were discarded when their processes exited. Existing synthetic fixtures were retained, not bulk-deleted: any cleanup must target the recorded IDs and respect entitlement/payment audit relationships. No master PDF upload, vendor notification, real payment, message, publication, sharing-policy setting or production traffic was performed in this follow-up; temporary Vercel preview access is described above.

Remaining risks: validate real merchant settlement/fulfillment separately; retain the original PCI/legal/vendor decisions; investigate StoryQuest contrast and reader issues in their owning sources. The local staging PDF is a tiny fixture, not proof that all production editions and licensing are correct. Do not infer production ingress or capacity from staging results.

## E. Confidence

High for the executed staging payment, isolation, watermark/download, rendered browser and bounded catalogue checks. Medium for wider production readiness because physical Safari keyboard behavior, email sign-in delivery, actual full editions, production configuration, legal obligations and merchant operations were outside these tests.

## F. Assumptions

Jay's supplied staging project name/authorization is authoritative; runtime endpoint/test mode and active catalogue were independently checked. Test users are synthetic, not customer/student data. API and browser results are specific to deployed release c6551b6 and the one active staging product.

## G. Tradeoffs / blind spots

1. Direct staging catalogue load isolates the real DB/RPC, but does not measure the public portal rendering/auth layer or purchase/write capacity.
2. Auth sessions were seeded without email; WebKit engine/viewport coverage does not establish physical iPhone/Safari or complete keyboard/screen-reader conformance.
