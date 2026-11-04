# Privacy audit — 27 October 2026

Engineering assessment and proposed fixes, not a legal opinion or certification. Source baseline: JE site `d81d1bd`; portal foundation `993afc7`, inspected read-only. No production data, dashboards, forms, payment callbacks or vendor configuration accessed or changed. No messages sent.

## Result and implemented changes

**AMBER — code controls repaired locally; legal and operational evidence still NEEDS-JAY.**

Before this branch, `src/AppRoot.tsx` called GA4 after hydration and mounted Vercel Analytics unconditionally. `src/App.tsx` mounted Speed Insights unconditionally; `src/yl/main.tsx` injected all three directly. GA4 respected browser GPC/DNT, but neither required a visitor opt-in. Both cookie policies described a banner which these entrypoints did not implement.

This branch introduces:

- Explicit default-off optional analytics on the main React site and static Young Learners island. Equal reject/accept choices, a persistent settings button, EN/VI labels, and linked privacy policy. This is a single analytics category, not a full vendor preference centre.
- Versioned, validated first-party preference in localStorage (180-day expiry); corrupt, absent, expired and future-dated records do not grant consent. With blocked storage, only an explicit session choice applies. GPC/DNT override acceptance. The server and first hydrated tree have the same state.
- GA4 stays production-host-only and deferred until idle after consent. Withdrawal invalidates pending injection jobs, sets Google's per-property disable flag, clears queued events, removes the injected script and attempts removal of first-party `_ga` cookies. Already sent data cannot be recalled.
- Vercel components mount only when accepted. Their SDK `beforeSend` callbacks independently check the current consent at send time, including after unmount/withdrawal. CTA, BotUI and video event wrappers also check consent. No vendor dashboard changes.
- Standalone `/challenges/one-change` previously had its own unconditional Vercel loader. Its optional network telemetry is disabled entirely until it shares the consent UI; local learning events remain available. No exercise, URL, campaign or price changes.
- Explicit English/Vietnamese **request deletion by email** links on each privacy page, using existing `info@jurassicenglish.com` and a subject only. Clicking opens the visitor's email client; it does not send automatically, collect more data, promise deletion or erase records.

Privacy choice logging deliberately remains local; no remote consent logging or visitor identifiers were introduced. Consent events are internal `je:analytics-consent` browser events, and storage events synchronize other tabs. No environment variables or secrets were added. Existing CSP/vendor settings are unchanged.

## Actual data-flow map (code evidence)

| Surface / data | Purpose and destination evidenced by source | Evidence / gap |
|---|---|---|
| Optional page/CTA telemetry | Browser to Google Analytics and Vercel | `src/lib/ga4.ts`, `src/lib/analytics.ts`, `src/components/PrivacyControls.tsx`; consent gate now applies. Vendor retention, regions, DPA and access settings not inspected. |
| Free sample form | Adult contact email or Zalo number, optional name/child age, teacher flag, placement, explicit consent; Notion JE Leads CRM and Resend email delivery | `api/sample-pack.ts`, `api/_lib/notionCrmWriter.ts`. Source validates contact and consent; existing notice promises 12 months. This audit did not verify actual records or a deletion schedule. |
| Get Started / institutional enquiries | Work contact, institution and enquiry details; server notification email, Supabase lead records and pilot access workflow | `api/get-started.ts`, `api/_lib/supabaseWriter.ts`. Retention enforcement and processor contracts not proven by notices. |
| Public PayPal / Zalo links | Visitor follows an external purchase/contact link; external provider processes interaction | Site product/checkout code and privacy paragraph. No card entry on this site was introduced. No provider account or live order accessed. |
| AI Speaking | Separate service, rewrite to `jurassic-ai-speaking.vercel.app` | `vercel.json`. Its internal cookies, recording/AI processing, retention and age gating cannot be certified by this site's code or this patch. NEEDS-JAY: provide matching source/config evidence. |
| Portal account and commerce | Email/Google sign-in, licence-holder name, order amounts/references, campaign attribution, product opening/downloads | Portal `src/lib/legal.ts`, `app/api/downloads/[ent]/[file]/route.ts`, `supabase/migrations/20261027000001_je_commerce_001_core.sql`. Notice lists Supabase (South Korea), DigitalOcean (Singapore), Resend, SePay, Google and PayPal; locations/contracts are declared, not independently verified. Signed download URLs expire after 60 seconds. |

## Policy audit and decisions needed

Both site policies are defined in `src/lib/legalContent.ts` (EN) and `src/i18n/content/legal.ts` (VI). Legal assertions were **not silently rewritten**. The mailto UI is the only legal-page functional addition.

| Finding | Evidence and consequence | Required owner decision |
|---|---|---|
| Vietnam framework is stale in the brief | Law 91/2025/QH15 and implementing Decree 356/2025/NĐ-CP both took effect 1 January 2026 (official government records below). Decree 13/2023 alone is insufficient as the current audit baseline. | NEEDS-JAY/legal: assess current law, implementing obligations, transfers, impact assessments and any exemptions using verified business facts. |
| GDPR scope is conditional | EN/VI callouts broadly invoke UK/EU GDPR. GDPR Article 3 depends on establishment, offering goods/services to people in the Union, or monitoring their behaviour there; a foreign buyer's nationality alone does not settle scope. | Confirm establishment/targeting/monitoring, relevant representatives and actual obligations; do not claim blanket certification. |
| CCPA applicability is unverified | California business nexus and statutory thresholds require facts absent from this repository. CPPA's adjusted revenue threshold is $26,625,000 for 2025/26; other tests include 100,000 residents/households' data bought/sold/shared annually or 50%+ revenue from selling/sharing. | Jay to attest business facts. “Barely applies” is not an evidence-based legal conclusion. |
| Purposes/bases too generic | Existing lists mix contract, legitimate interests, consent and legal obligation without operation-specific mappings. Portal checkout notice says ticking a box agrees to all processing. | Separate necessary account/payment processing from optional analytics/marketing. Counsel must approve which basis or permitted exception applies per jurisdiction; contract necessity is not a universal substitute for consent. |
| Retention promises lack verified enforcement | Site table: account plus 24 months; contracts seven years; communication three years; marketing until withdrawal; analytics indefinitely if anonymous. Existing sample note: 12 months. Portal: accounting-law period; downloads 24 months. | Approve a system-by-system retention schedule, legal holds, deletion job evidence and backups. GA4 data must not be casually described as anonymous or assumed eligible for indefinite storage. No deletion jobs were run. |
| Rights and deadlines too generic | Site says typically 30 days, identity verification may be requested. New mailto makes the request visible but does not prove intake/fulfilment. | Assign inbox owner, jurisdiction-specific deadlines, minimum verification, processor follow-up and a documented erasure/exception response. Avoid requesting identity documents by default. |
| Children's policy mismatches D2C surfaces | Policy frames provision as through institutions, uses under-13 threshold, while family/Story Club/YL surfaces exist and sample form can collect child age. | Map actual family/child data and age rules; establish adult request flow and necessary parental/child consents. An institutional responsibility sentence does not prove consent. No children/student records examined. |
| Broad assurances unsupported | Policies claim all DPAs/SCCs, regular security assessments and staff training; code cannot establish these. | Produce signed agreements, transfer safeguards and operational evidence, or approve narrower truthful wording. |
| Cookie detail differs from new UI | Policies describe detailed management and cookie tables; this branch implements one optional analytics switch. Other embedded/video services may have separate behaviour. | Approve precise EN/VI descriptions and a vendor inventory; do not imply all third-party media is gated by this analytics-only control. |
| Portal deletion language needs implementation proof | Notice promises deletion/account handling and retained nameless legal records. Core schema has user/order/entitlement references with `ON DELETE RESTRICT` and append-only payment/audit logs. A general user deletion does not prove selective lawful erasure. | Portal foundation must first be reviewed/merged (origin/main currently README only). Design a reviewed, permissioned deletion workflow with legal holds/audit minimization and tests; this branch makes no portal edits. |

## Approval drafts — not published policy

These examples are deliberately held in this report for Jay/legal approval; adapt after the data inventory and legal decisions are settled.

**EN analytics:** “Optional Google Analytics and Vercel Analytics/Speed Insights are off until you choose Accept analytics. Rejecting does not prevent you from using the site. Use Privacy settings to change your choice. We remember your choice for 180 days in this browser. Withdrawing stops future collection through these controls; it does not recall information already sent.”

**VI analytics:** “Google Analytics và Vercel Analytics/Speed Insights chỉ được bật khi bạn chọn Đồng ý phân tích. Bạn vẫn có thể dùng trang web khi từ chối. Chọn Cài đặt quyền riêng tư để thay đổi lựa chọn. Chúng tôi ghi nhớ lựa chọn trong trình duyệt này trong 180 ngày. Việc rút lại sự đồng ý dừng thu thập tiếp theo qua các tùy chọn này, không thu hồi thông tin đã gửi.”

**EN rights request:** “To request access, correction or deletion, email info@jurassicenglish.com. Describe the request and the email used with our service. Please do not send a passport, bank details or information about a child in your first message. We may need proportionate verification and may retain records where applicable law requires it.”

**VI rights request:** “Để yêu cầu truy cập, sửa hoặc xóa dữ liệu, hãy gửi email tới info@jurassicenglish.com, nêu yêu cầu và địa chỉ email đã dùng với dịch vụ. Vui lòng không gửi hộ chiếu, thông tin ngân hàng hoặc thông tin của trẻ trong thư đầu tiên. Chúng tôi có thể cần xác minh phù hợp và có thể phải lưu một số hồ sơ theo pháp luật hiện hành.”

## Primary sources checked now

- [Vietnam Law 91/2025/QH15 — official government record](https://vanban.chinhphu.vn/?classid=1&docid=214590&pageid=27160&typegroup=): issued 26 June 2025, effective 1 January 2026; signed law attached to record.
- [Decree 356/2025/NĐ-CP — official government record](https://chinhphu.vn/?docid=216387&pageid=27160): issued 31 December 2025, effective 1 January 2026; implements the personal data protection law. Legal interpretation and transitional/exemption analysis remain for counsel.
- [GDPR Article 3 — EUR-Lex official legislative text](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CONSIL%3APE_17_2016_INIT): territorial scope establishes conditional application.
- [California Attorney General CCPA guidance](https://www.oag.ca.gov/privacy/ccpa): for-profit business nexus and alternative applicability tests.
- [CPPA official threshold adjustment](https://www.cppa.ca.gov/announcements/2024/20241217.html): updated annual gross revenue threshold effective 1 January 2025 is $26,625,000. The older $25m FAQ amount must be read alongside this update.

## Verification and rollback

Commands run from this worktree:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run lint
npm test
node --import tsx --test tests/analytics-consent.test.ts tests/ga4.test.ts tests/one-change.test.ts tests/speedInsightsRoute.test.ts
npm run build
npm run validate:prerender
# Separate terminal: npm run preview -- --host 127.0.0.1 --port 5203
PLAYWRIGHT_MODULE=/private/tmp/je-l1-audit-0uEueC/node_modules/playwright/index.mjs node scripts/test-privacy-browser.mjs
```

Final result: typecheck passed; 17/17 targeted tests and the complete 386/386 test suite passed; complete Vite client/SSR build and 196 route prerender completed; prerender validator passed all 184 public indexable routes. Targeted runtime tests cover default/reject, corrupt/expired/future-dated preference, opt-in, GPC/DNT override, blocked storage, withdrawal before idle injection, custom-event blocking and middleware denial after withdrawal. The final build includes the static YL privacy-control utility styles. Withdrawal also overrides old accepted storage when localStorage writes fail (dedicated regression).

Browser evidence is recorded separately in `privacy-runtime.json`: muted local Chromium, external hosts blocked, vendor script responses mocked, original production hostname mapped to local preview so production-only GA4 gating is exercised. All three tested surfaces passed: EN products, VI products and static Young Learners. Each had zero optional script loads before/rejected consent, three after acceptance, and zero additional loads after withdrawal/reload, with no page errors. Keyboard Tab/Enter acceptance passed; the product sample dialog remained unobscured above the z40 consent controls, retained Tab focus and closed on Escape. It verifies UI interaction and actual script requests, not real vendor processing or dashboards.

Rollback: revert this branch's privacy changes as a single reviewed change set and rebuild. This restores the previous analytics loading behaviour, including the identified pre-consent risk, so disabling optional vendor collection is preferable while investigating. No database migration, credential, env or remote configuration rollback is required.

Known limits: other-origin AI Speaking and future portal runtime remain outside this code gate; no legal deadline/parental verification/vendor contract/actual deletion evidence has been manufactured. Already running vendor SDKs cannot be unloaded from JavaScript memory by removing script elements; send-time guards plus GA's disable flag stop future collection through the documented integrations, while in-flight requests cannot be recalled. Browser extensions and independently inserted tags are outside this patch.
