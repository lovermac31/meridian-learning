# P00 — Commercial-funnel and claims audit (read-only)

> **Reviewer correction (controller, 15 Oct 2026):** `/student-academy` *is* in version control. The Vercel project `je-ecosystem-landing-preview` builds from lovermac31/meridian-learning (`docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing`, page `src/app/student-academy/page.tsx` + `src/components/student-academy/StudentAcademyOverhaul.tsx`); its production deployment dpl_8vaYkGV7M1rKRVQtXgKhw3Kw31sd is built from main @ 7b83f27. Statements below that it is "outside both repos" are wrong; the funnel facts themselves stand.


Date: 2026-10-15. Auditor: subagent, read-only (no purchase, booking, payment call, email, edit or commit).

## Scope and sources

| Source | State |
|---|---|
| Main site `lovermac31/meridian-learning` at `~/Downloads/JE_site_overhaul` | HEAD `8a30352` on `feat/yl-band-5-8-flyers` (unmerged), merge-base `origin/main` = `7b83f27`. Branch diff touches only `young-learners-speaking/index.html`, `src/yl/i18n.vi.json`, `scripts/verify-overhaul.mjs`. |
| AI Speaking app `lovermac31/jurassic-ai-speaking` at `~/Downloads/JE_AI_Speaking_overhaul/mvp` | detached at `a5d1ce1` (main, PR #104). `basePath: "/ai-speaking"` (next.config.ts:27). |
| Live | `https://jurassicenglish.com` fetched 2026-10-15 by plain GET (SSR HTML only; client-side JS did not run, so text such as "Checking availability…" / "Loading available times…" is the pre-hydration state, not a defect). |
| Live read-only JSON | `GET /ai-speaking/api/status` → `{"scoring":true,"provider":"gemini-paid","payments":true,"vietqr":true,"autopay":true,"lessons":{"enabled":true},"baseline":{"enabled":true,"full":false},"voice":{"enabled":true,"open":false}}`; `GET /ai-speaking/api/pay/paypal/status` → `{"enabled":false}`; `GET /ai-speaking/api/baseline/slots` → `mode:"calendar"`, slots from 2026-10-16; `GET /ai-speaking/api/lessons/offer` → lesson_single 800000 / lesson_month 5600000, validDays 35, selfBooking true; `GET /ai-speaking/api/sessions/offer` → 30/60/90 min at 400k/800k/1.2M, holdMinutes 15. |

Routing (main-site `vercel.json` rewrites): `/ai-speaking` and `/ai-speaking/:path*` → `jurassic-ai-speaking.vercel.app` (vercel.json:189–194). `/student-academy` → **`je-ecosystem-landing-preview.vercel.app`** (vercel.json:141–146), a preview deployment whose source is in neither audited repo. `/`, `/about/nathaniel-jay-adams` (src/content/seoPages.json) and `/young-learners-speaking/` (static `young-learners-speaking/index.html`) are served by the main site.

**PayOS: zero references in either repo** (`grep -rni payos` on lib/app/components/supabase and main-site src/api). Vietnamese bank confirmation is **SePay** (lib/sepay.ts) on a VietQR image URL (lib/shop-handlers.ts:31–36). Any PayOS claim/plan is not implemented.

Live production flags inferred: `BASELINE_AUTO_PAY=1` (the SePay webhook refuses to run without it, sepay.ts:71, and `/api/status` reports `autopay:true`, credits.ts:57) → Baseline hold = **30 min** (baseline-booking.ts:33). `PAYPAL_AUTO_PAY` is **off** (`/api/pay/paypal/status` enabled:false) → every PayPal payment is a manual `_xclick` link confirmed by the owner. These are inferences from public endpoints, not env reads.

Legend: **Works** = code path present and consistent; **Risk** = works but has a gap that can lose money/booking/consent or mislead; **Unknown** = cannot be established without running a transaction or prod env/DB access. "S" = verified statically only; "L" = also observed live.

---

## Section A — Funnel traces

### A1. Live Speaking Baseline booking (`/ai-speaking/baseline`)

| # | Step | Status | Evidence | Verified |
|---|---|---|---|---|
| 1 | Page + price | Works | Price comes from server/DB, not client (BookingForm.tsx:4–6, 150); live page shows "690.000₫ · one 15–20 minute live session". `SERVICES` display mirror 690_000 (lib/packs.ts:75). | S+L |
| 2 | Slot loading | Works | `GET /api/baseline/slots` → `mode: off|link|calendar` (baseline-handlers.ts:138–150); 503 `slots_unavailable` on Google failure; UI modes loading/calendar/link/error (BookingForm.tsx:41–48, 152–156); submit disabled while loading/error/no slots (:227). Live: `mode:"calendar"` with slots. | S+L |
| 3 | Slot rules | Works | 20-min session on 30-min grid, 24 h lead, 21-day horizon (baseline-slots.ts:14); Google busy times padded by `CALENDAR_BUFFER_MINUTES` default 30 (baseline-booking.ts:63–73); held/booked times from DB always fresh, Google cached 60 s (:43–61). | S |
| 4 | Timezone | **Risk** | Times are **always shown in Hanoi time** "whatever the visitor's clock says" (SlotPicker.tsx:4, 11–15); no local-time conversion or label beyond `copy.slots.tz`. Home markets "live online (GMT+3 to GMT+8)" (overhaul.ts pricing.disclosure; live home hero). International buyers (the PayPal audience) must convert themselves → missed-session risk. | S+L |
| 5 | Validation | Works | Client: name 2–80, email regex, slot required in calendar mode, adult box or child name/age/guardian (BookingForm.tsx:68–81). Server re-validates (baseline-handlers.ts:61–76), slot re-checked against **fresh** offered list (`isOfferedSlot`, :82–91), 409 `slot_taken`; DB enforces weekly cap `baseline_full`, `too_many_holds` (max 2 live holds per buyer, 010:173); rate limit 3/10 min per IP (:47). | S |
| 6 | Under-18 consent | Works (Qualified) | "My child" path: parent's name/email, child name 2–80, age 1–17, `guardianConsent` required (baseline-handlers.ts:68–75); recording forced off for a child server-side (`recordingConsent = bookedFor === "self" && …`, :76). Age and guardian status are **self-attested** checkboxes; "parent confirms on camera" (baseline-content.ts §privacy) is an operational promise, not code. An under-18 can tick "I am 18 or older" on the self path. | S |
| 7 | Hold + payment step | **Risk** | Hold 30 min with SePay auto-pay, 12 h when manual (baseline-booking.ts:32–33). Response returns VietQR (`img.vietqr.io` URL with amount + booking ref as memo) or manual email fallback (baseline-handlers.ts:117–120). The page polls `POST /api/baseline/status` every 8 s with a private claim token in the body (BookingForm.tsx:50–66; handler :156–174). **PayPal path is broken for slot holders:** PayPalOption (BookingForm.tsx:139) is the manual `_xclick` link while auto PayPal is off (PayPalOption.tsx:34–36, 68); manual confirmation is "usually within 1 business day" (YL page) vs a 30-min hold → hold lapses; if someone else takes the time, `_baseline_mark_paid` clears `slot_start` (010_ai_speaking_baseline.sql:216–227) and the buyer gets a "paid, no time" email while the owner schedules by hand (baseline-handlers.ts:227–232; same for SePay-late `hold_lapsed`, sepay.ts:186–196). The PayPal panel also disappears once the hold lapses (`{!lapsed && <PayPalOption…>}`, BookingForm.tsx:139). | S+L |
| 8 | Payment webhook (SePay) | Works | `Authorization: Apikey` timing-safe compare (sepay.ts:61–66); ref extraction tolerant to bank mangling (`JEBL[0-9A-F]{6}`, :50–58); DB idempotent per provider+txn (`duplicate`), 503 → SePay retries ~5 h (:120–128); duplicate re-delivery resumes scheduling only if not yet scheduled (:178–184); under/over/second/cancelled/unknown/no-code transfers alert owner + Sentry RED (:198–218). | S |
| 9 | Confirmation / calendar | Works | `scheduleBooking`: single-claim lease (`claimBaselineSchedule`) so SePay retry, status poll and admin button cannot double-create (baseline-booking.ts:96–101); Google event + Meet; on Google failure owner alerted, booking stays `awaiting_schedule`, retry button (:107–114; admin route baseline-handlers.ts:351–357). Status poll also retries scheduling (:165–168). UI shows Meet link when `scheduled` (BookingForm.tsx:111–119). | S |
| 10 | Emails | Works (Unknown in prod) | Order-placed buyer + owner email (`notifyOrderPlaced`, baseline-handlers.ts:111–116); "scheduled" email after calendar (baseline-booking.ts:119–125, no .ics because Google invites); "paid" email for manual/lapsed (baseline-handlers.ts:232); result email only after `completed` with 4 bands, marked sent only if delivered (:269–285). Delivery depends on Resend config (not observable). | S |
| 11 | Error states | Works | Mapped codes → field errors / form error: `slot_taken` reloads slots, `too_many_holds`, `baseline_full`, `rate_limited`, `baseline_unavailable` (BookingForm.tsx:94–105); hold-lapsed message (:121–131). | S |
| 12 | Cancel / refund / no-show | Works (owner-only) | Admin patch state machine; cancel/refund deletes calendar event (baseline-handlers.ts:287–299). No buyer self-cancel for the Baseline. | S |
| 13 | Report delivery | Works (manual) | Owner records 4 whole bands (validatePatch, :248–251), result email via `renderBaselineResult`. Assessment is human; nothing sent to AI (baseline page "No AI"). | S |

### A2. AI credit purchase (`/ai-speaking/pricing` → checkout)

| # | Step | Status | Evidence | Verified |
|---|---|---|---|---|
| 1 | Pack display | Works | `PACKS` 79.000/199.000/549.000 (packs.ts:8–12); DB is source of truth for charge (packs.ts:2). Live pricing shows the three packs. `?pack=` preselect only for sellable packs (pricing-client.tsx:177–179). | S+L |
| 2 | Sale gate | Works | Server refuses non-sellable packs before DB (shop-handlers.ts:44–50); page opens only when `scoring && payments` (pricing-client.tsx:192). | S+L |
| 3 | Order create | Works | `POST /api/order` contact 5–120 chars (email **or Zalo**), name 2–80 under `AIS_ORDER_V4`, rate-limited (shop-handlers.ts:38–85). Returns VietQR + "put JEAI… in the message". | S |
| 4 | VietQR | Works | QR image + copy buttons + "save QR" for same-phone payers (pricing-client.tsx:305–333). | S |
| 5 | PayOS | **N/A** | Not implemented anywhere (see Scope). | S |
| 6 | PayPal | **Risk** | Automated Orders-v2 flow exists and is strong (server-priced USD = ceil(VND/25,897), payee/amount/custom_id checks before capture, re-reads order on webhook, `verify-webhook-signature` before reading, idempotent via capture id as txn — paypal-checkout.ts:1–32, 118–144, 188–193, 279–319) **but is OFF live** (`enabled:false`). Live checkout shows a manual `_xclick` link with the JEAI ref in item_name/custom (paypal.ts:55–63); webhook ignores it (`unknown_checkout`, paypal-checkout.ts:304); owner confirms by hand. | S+L |
| 7 | Pending state | Works (Qualified) | No status polling on the pricing page; buyer is told the code is emailed "usually within a few minutes" (autopay) and given "Paid but no code yet? Email info@… with your order code" (pricing-client.tsx:71–75, 336–337). "Close this order" keeps the order server-side; a later transfer still fulfils (copy at :66). | S |
| 8 | Webhook verification + idempotency | Works | SePay: Apikey header, `ais_record_credit_payment` idempotent per txn, `duplicate` flag; notice lease `claimOrderNotice` (2 min) so first delivery and retry never both email; 503 `retry_later` while another holder is mid-send (sepay.ts:81–103; credit-pay.ts:78–119). Kill switch `CREDITS_AUTO_PAY=0`. | S |
| 9 | Entitlement / credit creation | Works | DB `fulfill_order` issues access code on full transfer; receipt emailed then `adminMarkReceipt` (credit-pay.ts:104–110). Credits valid 12 months (`CREDIT_VALIDITY_MONTHS`, packs.ts:13). | S |
| 10 | Failure + recovery | Works (Qualified) | Zalo contacts, failed receipt emails, under/over/second/cancelled/unknown → owner alert + Sentry (credit-pay.ts:111–133). Zalo-contact buyers always depend on a manual owner send (:115–118). | S |
| 11 | Report generation | Works | Credits reserved at mock start; scoring failure settles a refund via server secret; learner told "returned" only if settlement succeeded, otherwise `SCORING_FAILED_PENDING` + owner alert (score-handler.ts:155–159, credits.ts:141–179). Anti-inflation pass can only hold or lower a band (scoring.ts:14–15; report-rules.ts:251). | S |
| 12 | Report retrieval | **Risk** | Learner's report persists **only in the same browser** (`saveReport` localStorage, "Kept in this browser for 30 days", exam-client.tsx:518, 830–835) plus PDF save; the server keeps a copy for review 30 days (`purge_after`, 022_ai_speaking_review.sql:41–144) but there is no learner-facing cross-device retrieval. Device loss = report loss. | S |
| 13 | Support escalation | Works | "You can ask a teacher to review any report" (live footer); review request/notice handlers exist (`app/api/admin/review/*`, lib/review.ts); contact email on every pricing state. | S+L |
| 14 | Question-set inventory | **Risk** | Live pricing says "Right now there is one practice question set (Mock A), so every mock you start uses the same questions" (rendered when `LIVE_QUESTION_SETS === 1`, pricing-client.tsx:224) while the 10-credit pack is on sale; packs.ts:16–21 says pack10 returned "once … several reviewed question sets … live in production (5 sets, FORM_BINDING=1, verified 5 Oct 2026)". The build-time count (next.config.ts:29) says 1 → either the comment is stale or FORM_BINDING is not set in the production build. Disclosure is honest; value of a 10-credit pack on one form is the risk. | S+L |

### A3. Young Learners 1-to-1 packs and PayPal links

| # | Step | Status | Evidence | Verified |
|---|---|---|---|---|
| 1 | YL CTA → lessons page | Works | Live YL links `/ai-speaking/lessons?pack=lesson_single` and `?pack=lesson_month`; lessons client preselects from `pack` param (lessons-client.tsx:97). Live lessons page renders 800.000₫ / 5.600.000₫, "Use within 5 weeks" (validDays 35, packs.ts:85–88; live offer JSON). | S+L |
| 2 | Order form | Works (Qualified) | Name, email, terms checkbox (24 h cancel, 5-week validity, not recorded), self vs child (child name/age/guardian) (lessons-client.tsx:28–36, 106–122); server maps `terms_required`, guardian codes (lessons-handlers.ts:68–99). The "Me (18 or older)" path has **no explicit adult attestation** (radio label only). | S |
| 3 | Payment | Works (VietQR) | VietQR + copy table; "When your transfer arrives we email you a private link" (auto) (lessons-client.tsx:198–227); SePay JEAI path → `afterLessonPayment` issues private booking link (credit-pay.ts:97–98). Lost-link resend (`/api/lessons/link`). | S |
| 4 | Booking lessons | Works | 60-min slots, 12 h lead, 28-day horizon (baseline-slots.ts:16); same availability calendar as the Baseline; cancel ≥24 h returns lesson (copy + `handleLessonCancel`). | S |
| 5 | PayPal on lessons page | **Absent** | Lessons client has **no** PayPalOption (0 occurrences); automated PayPal refuses lesson packs (`isLessonPack → not_offered`, paypal-checkout.ts:134). | S |
| 6 | YL static PayPal links | **High risk** | `young-learners-speaking/index.html:576–578` (live and branch): Baseline US$27, 1 lesson US$31, month US$217 — plain `_xclick` links with **no booking/order reference, no slot, no child name/age, no guardian consent, no recording choice, no terms acceptance**. Everything `handleBaselineOrder` (baseline-handlers.ts:64–76) and the lesson order enforce is bypassed; the AI-app webhook will not recognise them (`unknown_checkout`). Copy: "We confirm PayPal payments by hand, usually within 1 business day." The owner must reconstruct buyer, learner, consent and scheduling from the PayPal item name. | S+L |
| 7 | USD amounts | **Inconsistent** | PayPal charges ceil(VND/25,897) (main-site src/lib/paypal.ts:33–38; AI app paypal.ts:19–25) → $27/$31/$217; the same YL page and home show "~$220" for 8 lessons at **1 USD ≈ 25.400₫** (overhaul.ts pricing.disclosure; YL "Family pricing"). Market SEO pages advertise **US$35/lesson, US$29 Baseline** and higher tiers (marketPricing.json tiers 1–4; seoPages.json market descriptions) vs $31/$27 at checkout. | S+L |
| 8 | 6-month / annual plans, Small-Group Lab, Self-Study Toolkit | **Not purchasable** | Priced on home/YL (30.000.000₫, 55.200.000₫, 2.900.000₫, 990.000₫) but no pack, order route or checkout in either repo ("6-month and annual plans … come with the plans release", packs.ts:81; no Toolkit/Lab code). Contact-only. | S |

### A4. Student Academy placement consultation and Cambridge Flyers waitlist

| # | Step | Status | Evidence | Verified |
|---|---|---|---|---|
| 1 | Placement consultation CTA | Works (static) | Live `/student-academy`: `mailto:info@jurassicenglish.com?subject=Reading%20%26%20Thinking%20Placement%20Consultation` and `https://zalo.me/84396085076`; home links `mailto:…?subject=Reading%20placement%20consultation` + Zalo (overhaul.ts pricing rows → `/student-academy#diagnostic`). No form, no confirmation, no tracking of response; turnaround and "written Level 1–5 placement note" are operational promises. | L only (page source is the preview deployment, not in audited repos) |
| 2 | Price of consultation / tuition | Unknown | "45-min … Placement Consultation" shown with **no price**; "Small-group & 1-to-1 Student Academy tuition" with no price. | L |
| 3 | Cambridge Flyers waitlist | **Branch only** | `mailto:info@jurassicenglish.com?subject=Cambridge%20Flyers%20Priority%20Waitlist` exists only on `feat/yl-band-5-8-flyers` (index.html new `<aside class="yl2-flyers">`); **not on live**. mailto-only: no capture, depends on the visitor having a mail client; "Join the waitlist to hear first" has no list behind it in code. | S |

### A — highest-risk summary
1. YL static PayPal links (Baseline $27, lessons $31/$217) bypass booking, under-18 guardian consent, terms and order references entirely (index.html:576–578).
2. Baseline + manual PayPal: 30-min hold vs ~1-business-day manual confirmation; PayPal auto is off live; lapsed-hold buyers lose the time and the PayPal option disappears (baseline-booking.ts:33; BookingForm.tsx:139; sepay.ts:186–196).
3. Slots shown only in Hanoi time while the service is sold GMT+3–GMT+8 (SlotPicker.tsx:11–15).
4. AI reports retrievable only on the same browser; pack10 sold while live shows a single question set.
5. PayOS is not implemented; Student Academy is served from a preview deployment outside version control audited here.

---

## Section B — Claims register

Classification: **Verified** (source in code/config/live endpoint) · **Qualified** (true with a caveat the page omits or states elsewhere) · **Illustrative** (labelled sample) · **Unverified** (no source in code/config; requires documents/operations) · **Deprecated** (on main/live but removed or changed on the feature branch). "Inconsistent" = contradicts another page.

### B1. Mr. Jay credentials, role and experience

| # | Claim | Page(s) | Source | Class |
|---|---|---|---|---|
| 1 | "M.S. in IT Management, WGU" | `/` | overhaul.ts:136 | Unverified; **inconsistent** (about: "M.S. in Information Technology Management, 2017", no institution) |
| 2 | "International PGCE, University of Warwick (completing 2026)" | `/` | overhaul.ts:136 | Unverified; **inconsistent** with about "iPGCE, in progress" (no date) |
| 3 | "Advanced TEFL" | `/` | overhaul.ts:136 | Unverified (about specifies 120 h, International TESOL TEFL Academy) |
| 4 | CELTA (Cambridge) | `/about/nathaniel-jay-adams`, market SEO pages, blog bylines | seoPages.json:6–15, 47–56, 397+ | Unverified; **inconsistent** — home credential line omits CELTA entirely |
| 5 | Google Certified Educator L1 & L2 | about | seoPages.json | Unverified |
| 6 | "Over the past decade teaching in international classrooms in Asia and here in Hanoi" | `/` | overhaul.ts:138 | Unverified |
| 7 | "Founder & Lead Teacher" (home) vs "Founder and Lead Coach" (about) | `/`, about | overhaul.ts:134; seoPages.json | Inconsistent (wording) |
| 8 | Online 1-to-1 lessons "taught by Mr. Jay's team of professional IELTS teachers" | about, `/ai-speaking`, lessons page | seoPages.json; lessons-client.tsx:21 | Unverified (no teacher roster/assignment in code; one availability calendar, baseline-slots.ts header) and **inconsistent** with market pages "led by CELTA-qualified Mr. Jay Adams" (seoPages.json:397+) and home "Meet your teacher … what you can expect when working with me" |
| 9 | Baseline "assessed live by your assessor, Nathaniel Jay Adams" / "chat with Mr. Jay" | `/ai-speaking/baseline` | baseline-content.ts:82 | Qualified (single assessor; consistent with one calendar) |
| 10 | "American, lives and teaches in Hanoi" | about | seoPages.json | Unverified |
| 11 | "Teaching now: IELTS Speaking classes … in Hanoi" | about | seoPages.json | Unverified |

### B2. Academic levels and band targets

| # | Claim | Page(s) | Source | Class |
|---|---|---|---|---|
| 12 | Student Academy Levels 1–5 mapped Pre-A1/A1 → B2/C1 | `/student-academy` | live only (preview deployment) | Unverified (no placement instrument in audited code) |
| 13 | YL stages "Ages 9–11 · CEFR A2–B1", "Ages 11–14 · CEFR B1–B2" | `/young-learners-speaking/` (live) | index.html @ origin/main | Unverified; **Deprecated** on branch |
| 14 | "Ages 15–18 · Band 6.5–8.5 targets" | YL (live) | index.html @ origin/main | Qualified ("targets"); **Deprecated** on branch |
| 15 | "Band 5.0 Foundation to Band 8.5 Mastery", four Band stages 5.0–5.5 / 6.0–6.5 / 7.0–7.5 / 8.0–8.5 for ages 9–18 | YL title/meta/JSON-LD/hero | branch only (index.html:63, 526) | Qualified ("coaching targets, not guarantees" note) — **branch only, not live**; plausibility risk: Band 5.0 as the floor for 9-year-olds, with Flyers framed as "before Band 5.0" |
| 16 | Cambridge "Flyer 1 & Flyer 2 Speaking Preparation — coming soon, ages 9–12" | YL | branch only | Unverified (no product); "Flyer 1/Flyer 2" is not Cambridge's naming (A2 Flyers) |
| 17 | Band 7 Target Pathway: full attendance + test within 30 days without Band 7 → added coaching/re-sit prep "at no extra tuition" | YL (live and branch) | index.html:582 | Unverified (no terms/fulfilment in code); conflicts in spirit with "No band guarantee" (about) — reads as a conditional guarantee; plans it attaches to are not purchasable |
| 18 | Overall band = mean of 4 whole bands rounded **down** to half band | Baseline | baseline-band.ts; BandCalculator.tsx; validatePatch whole bands (baseline-handlers.ts:248–251) | Verified (the rounding-down choice is stated as Jurassic's own) |
| 19 | Forms A and B "of equal difficulty", re-test difference "reflects your progress" | Baseline | baseline-content.ts:85, 178; admin `form_used` A/B/C (baseline-handlers.ts:245) | Unverified (no equating evidence); note a Form C exists in code |
| 20 | Sample report 5.5/6.0/5.5/6.0, overall 5.5–6.0 | YL | index.html | Illustrative (labelled) |
| 21 | AI demo 6.5, synthetic voice, transcript | `/ai-speaking` | live copy "Illustrative … AI-generated (synthetic) voice" | Illustrative |
| 22 | Maya flare Point+Proof+Explain | `/`, `/student-academy` | overhaul.ts lesson | Illustrative (labelled) |

### B3. Prices and USD figures

| # | Claim | Page(s) | Source | Class |
|---|---|---|---|---|
| 23 | Baseline 690.000₫ | `/`, YL, baseline, about | packs.ts:75 (mirror of DB row) | Verified |
| 24 | Credits 79.000 / 199.000 / 549.000₫; ~66.300 / ~54.900 per credit | `/`, `/ai-speaking`, pricing | packs.ts:8–12 | Verified |
| 25 | US$4 / US$8 / US$22 by PayPal | `/`, pricing | ceil(VND/25,897) (paypal.ts:19–25) | Verified |
| 26 | Lessons 800.000₫ single; 8 for 5.600.000₫ (700.000/lesson), 5-week validity | `/`, YL, lessons, about | packs.ts:85–88; live lessons offer | Verified |
| 27 | 1-to-1 range "575.000–800.000₫ (~$23–$31)" | YL | index.html | Qualified (575k only via the non-purchasable annual plan) |
| 28 | 6-month 30.000.000₫ (625k/lesson), annual 55.200.000₫ (575k/lesson), payable monthly/biweekly by VietQR | `/`, YL | overhaul.ts pricing rows; index.html | Unverified (not purchasable; packs.ts:81) |
| 29 | Small-Group Speaking Lab 2.900.000₫ (ages 9–14, max 6 "international students", 6 weeks) | `/`, YL | overhaul.ts; index.html | Unverified (no product/cohort in code) |
| 30 | Self-Study Speaking Toolkit 990.000₫ | `/`, YL | overhaul.ts; index.html | Unverified (no product exists) |
| 31 | "~$" figures at 1 USD ≈ 25.400₫ (~$27, ~$31, ~$114, ~$220, ~$1,180, ~$2,170) | `/`, YL | overhaul.ts disclosure | **Inconsistent** with PayPal rate 25,897 (month: ~$220 shown vs US$217 charged) |
| 32 | PayPal "set US$ amounts" Baseline $27, lesson $31, month $217 | YL | index.html:576–578 | Verified (amounts match ceil rule) but **inconsistent** with market pages US$29/$35 and higher tiers (marketPricing.json) |
| 33 | "VietQR … confirmed automatically" | YL, lessons | SePay webhook; `/api/status` autopay:true | Verified (L) |
| 34 | "Outside Vietnam, pay with PayPal, confirmed by hand … within 1 business day" | YL, home FAQ | PayPal auto off live | Verified (manual) / SLA Unverified |
| 35 | "families outside Vietnam can pay set US$ amounts by PayPal for the Baseline and 1-to-1 lessons" | `/` FAQ | overhaul.ts faq | Qualified (lessons page itself has no PayPal; only the YL static links) |
| 36 | Pricing page: "PayPal, offered at checkout … VND ÷ 25,897, rounded up" | pricing | paypal.ts:19–25 | Verified |
| 37 | Placement consultation "45-min", price not stated | `/`, `/student-academy` | live only | Unverified |

### B4. Feature availability

| # | Claim | Page(s) | Source | Class |
|---|---|---|---|---|
| 38 | Typed practice mode live; does not assess pronunciation | `/`, `/ai-speaking`, pricing | `/api/status` scoring:true | Verified |
| 39 | Spoken audio "limited beta, invited users only" | same | `/api/status` voice.open:false; `voiceAllowed` (shop-handlers.ts:114) | Verified |
| 40 | Credits returned automatically if scoring fails | pricing, `/ai-speaking` | score-handler.ts:155–159 | Qualified (a "pending" refund path exists when settlement cannot be confirmed) |
| 41 | Credits valid 12 months | pricing, home | packs.ts:13 | Verified |
| 42 | "Every band estimate points to a direct quote from your answer" | `/ai-speaking` | verbatim quote checks (diagnosis-guard.ts, quote-clip.ts, report-rules.ts) | Verified (S) |
| 43 | "A second review can hold or lower a band, never raise it" | `/ai-speaking` | scoring.ts:14–15; report-rules.ts:251 | Verified |
| 44 | "Each estimate comes with a range" | `/ai-speaking` | footer copy; scoring range fields | Verified (S, not exhaustively traced) |
| 45 | Basic 1 / Intermediate 2 / Advanced 3 credits; Advanced has "4-week plan" | pricing, home | PACK_USES (packs.ts:37–42); tiers.ts | Verified |
| 46 | "one practice question set (Mock A)" | pricing | pricing-client.tsx:224 (LIVE_QUESTION_SETS===1) | Verified live; **inconsistent** with packs.ts:16–21 "5 sets … verified 5 Oct 2026" |
| 47 | "Book, move or cancel online with your private link"; cancel ≥24 h returns lesson | lessons, YL | lessons-handlers.ts (book/cancel); live offer selfBooking:true | Verified |
| 48 | Lessons "book from Mr. Jay's calendar" | lessons | single availability calendar (baseline-slots.ts:5–9) | Verified; conflicts with "Mr. Jay's team" (#8) |
| 49 | Baseline "If your connection drops, the clock is paused and the session resumes" | baseline | operational | Unverified |
| 50 | Parents receive written observation notes, sentences noted live, Growth Portfolio, monthly update | `/`, YL, `/student-academy` | none | Unverified (operational; no parent-report feature in code) |
| 51 | Baseline "credit back against a coaching package" | — | `BASELINE_CREDIT_BACK_LIVE = false` (baseline-content.ts:17) | Correctly hidden (not shown live) |
| 52 | AI tool "For adults aged 18 and over" | `/ai-speaking` | no age gate in `handleOrder` (shop-handlers.ts:38–85) | Qualified (stated, not enforced) |

### B5. Privacy, recording and data retention

| # | Claim | Page(s) | Source | Class |
|---|---|---|---|---|
| 53 | "Sessions with learners under 18 are never recorded" | `/`, YL, baseline, `/student-academy` | Baseline: recording forced false for child (baseline-handlers.ts:76); lessons "not recorded" | Verified for Baseline booking data; operational for live lessons; **bypassed** for YL PayPal-paid Baselines (no booking record of age) |
| 54 | Adult Baseline recording optional, asked twice, only assessed part, deleted within 30 days | baseline | `recordingConsent` field; `recording_delete_by` column "set on completion (30-day retention)" (010:59) | Qualified (deletion is a manual owner action; no purge job) |
| 55 | Baseline booking + bands kept 24 months | baseline | admin list window max 730 days (010:208) — display only | Unverified (no deletion job found) |
| 56 | Baseline "Nothing about this session is sent to an AI service" | baseline | no AI calls in baseline handlers | Verified (S); but the shared footer on the same page says "Jurassic AI Speaking gives practice feedback generated by AI" — **inconsistent** presentation |
| 57 | Google Calendar event shows only booking code, email and time | baseline | `G.buildEventBody({bookingRef, email, startIso, locale})` (baseline-booking.ts:105–106) | Verified |
| 58 | Photo ID "shown on camera, never copied or kept" | baseline | operational | Unverified |
| 59 | AI answers + report kept 30 days for review then deleted automatically | `/ai-speaking`, pricing | `purge_after = now()+retention_days` default 30 (022:144; review-retention.ts; next.config.ts) | Qualified (daily purge via pg_cron "where the extension exists", plus bounded purge on new submissions, 022:26–27) |
| 60 | Answers sent to "the AI scoring provider named before you start, outside Vietnam" | `/ai-speaking` | provider-disclosure.ts (live provider gemini-paid) | Verified |
| 61 | Voice: Vercel Singapore → Azure Speech (Singapore), "never stored by us" | `/ai-speaking` | provider-disclosure.ts:21–22, 80 | Verified (S) |
| 62 | "We never sell your personal data" | footer | policy | Unverified (policy statement) |
| 63 | Payer name/account/transfer text never stored or logged | (code comment, not public) | sepay.ts:17 | Verified (S) |

### B6. Human vs AI assessment, affiliation, guarantees

| # | Claim | Page(s) | Source | Class |
|---|---|---|---|---|
| 64 | Live Baseline is human-assessed, separate from AI | `/`, `/ai-speaking`, pricing | baseline flow has no AI; owner enters bands | Verified |
| 65 | AI reports are AI practice estimates, not official scores | all AI pages | footer + score copy | Verified |
| 66 | "You can ask a teacher to review any report" | AI footer | review request handlers (app/api/writing/review/*, admin/review/*) | Qualified (speaking review path exists via admin review; SLA not stated) |
| 67 | Not affiliated with IELTS/IDP/British Council/Cambridge; "No band guarantee" | all | footer copy | Verified (statement) — undercut by #17 |
| 68 | Jurassic English operated by WorldWise Learning, Hanoi; Zalo +84 396 085 076 | all | footer; contactConfig | Verified (consistent everywhere) |

### B — tally

- Claims registered: 68.
- **Unverified: 23 rows** — #1, 2, 3, 4, 5, 6, 8, 10, 11, 12, 13, 16, 17, 19, 28, 29, 30, 37, 49, 50, 55, 58, 62 (the "1 business day" SLA in #34 is also unverified but the row is not counted).
- **Inconsistent (cross-page or page-vs-code contradictions): 10 rows** — #1, #2, #4 (home credential line vs about page), #7 (title), #8 ("team" vs "led by Mr. Jay"), #17 (Band 7 remedy vs "no band guarantee"), #31 (FX 25.400 vs 25.897), #32 (YL vs market-page USD), #46 (one question set live vs "5 sets" in packs.ts), #56 ("No AI" vs AI footer on the same page).
- Overlap: 5 rows are both (#1, #2, #4, #8, #17).
- **Unverified or inconsistent: 28 distinct rows** (23 + 5 inconsistent-only: #7, #31, #32, #46, #56).
- Deprecated on branch (still live): 2 (#13, #14). Branch-only, not live: 2 (#15, #16).
- Illustrative (correctly labelled): 3 (#20, #21, #22).
