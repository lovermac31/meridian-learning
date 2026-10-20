# Family Rewards pilot (Student Academy referral programme)

Terms version **FR-2026-10-pilot-v1** (20 October 2026). Owner: Nathaniel Jay Adams.
Source: "Jurassic English — Hanoi Referral Strategy and CC Build Directive — 20 October 2026" (Google Doc and the local .docx; same content).

## What ships

| Piece | Where |
|---|---|
| Single source of terms (amounts, steps, terms, privacy, contacts, form URL) | `docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing/src/lib/familyRewards/terms.ts` |
| Release gate | `…/src/lib/familyRewards/flag.ts` |
| Page `/student-academy/referrals` | `…/src/app/student-academy/referrals/page.tsx` |
| Card below the placement consultation (`#diagnostic`) | `…/src/components/student-academy/StudentAcademyOverhaul.tsx` |
| Local footer link (academy footer only; no header item) | `…/src/components/StudentAcademyFooter.tsx`, `LayoutChrome.tsx` |
| Private ledger rules + synthetic rehearsal | `…/src/lib/familyRewards/ledger.ts`, `…/scripts/family-rewards-ledger.test.mjs` (`npm run test:family-rewards`) |

No change to checkout, payments, pricing, authentication, databases, Speaking, Writing, OCR, SePay, PayPal or attendance. The ledger module is not imported by any page.

## Release gate

`main` auto-deploys the je-ecosystem-landing-preview project to production, so the feature is gated:

- **Production, flag unset:** `/student-academy/referrals` returns 404. No card and no footer link.
- **Preview or local:** the feature renders with a "Preview only: this programme is not yet open" banner.
- **Production with `FAMILY_REWARDS_ENABLED=1`:** the programme is live, with no banner.

## Go-live checklist (only after funding is approved)

1. Done (21 Oct 2026). The owner approved a funded reward reserve and owner-funded teacher compensation. The amount is recorded privately, not in this public repo.
2. Done. The owner chose to keep the published wording: details are kept only as long as needed to run the programme and honour a balance.
3. Done. The Google Form exists, its responder URL was tested signed out, and `FORM_RESPONDER_URL` in `terms.ts` is set. The test rejects edit links.
4. Set `FAMILY_REWARDS_ENABLED=1` on je-ecosystem-landing-preview (Production), then redeploy the current production commit.
5. Done. `/student-academy/referrals` is in `REWRITE_SERVED_ROUTES` (`src/lib/routeMetadata.ts`), so it appears in the sitemap. No `vercel.json` change is needed: `/student-academy/:path*` already rewrites and has cache headers. If the flag is ever unset, remove this entry too.
6. Verify on jurassicenglish.com:
   - The page returns 200.
   - The canonical is `https://jurassicenglish.com/student-academy/referrals`.
   - The card and the footer link are present.
   - The form opens signed out.
   - The first real registration arrives in the private sheet.
   - Then run `node scripts/verify-overhaul.mjs --live --main https://jurassicenglish.com`. `/student-academy` must stay at or under 550 words; the card adds 13.

**Rollback:** unset `FAMILY_REWARDS_ENABLED` and redeploy, which hides everything. Code rollback: `vercel rollback <previous production deployment> --scope jay71adams-1388s-projects`.

## Signup form specification (Google Forms)

- **Title:** "Jurassic English Family Rewards — join the programme".
- **Description:** states terms version FR-2026-10-pilot-v1, links to `https://jurassicenglish.com/student-academy/referrals`, and says the form confirms receipt only.
- **Settings:**
  - Collect email addresses: **Responder input** (typed, any address). Not "Verified".
  - Limit to 1 response: **off**, because it needs Google sign-in.
  - Restrict to users in an organisation: off.
  - View results summary: **off**.
  - Allow response editing: off.
  - No file-upload questions.
- **Questions, all short:**
  1. Your name (adult parent/guardian, or adult learner) — required.
  2. Zalo or phone (optional).
  3. "Are you a current or former Student Academy customer?" — Current / Former / Not sure — required.
  4. Checkbox: "I accept the Family Rewards terms (version FR-2026-10-pilot-v1)" — required.
  5. Checkbox: "I have read how my details are used (privacy notice on the programme page)" — required, and separate from 4.
- **Never ask for:** a child's name, school or birth date; friends' contact details; uploads; marketing consent.
- **Confirmation message:** the `CONFIRMATION_TEXT` constant in `terms.ts`.
- **Permissions:**
  - Form editors: owner only.
  - The linked response sheet is a separate file: owner only, not "anyone with the link", not published to the web.
  - Check each file's permissions separately.

## Private ledger (owner's Google Sheet; never public)

The pilot reserve caps new eligible bookings. Its amount lives in the owner's private records; `ledger.ts` takes it as a parameter.

Columns: registration ID · adult contact · referral code (random, opaque: no name or email) · terms version · consent timestamp · status (applied / approved / declined) · booking reference · new household ID · code declared at · first payment at · lessons paid · lessons completed · refund status · dispute open · reserve held (VND) · qualification date · credit issued (VND) · credit redeemed (VND) · invoice applied to · balance (VND) · audit note.

Each of these is a separate action, mirroring `ledger.ts`:

1. **Approve and issue a code:** check membership, then generate the code.
2. **Record the referral before payment:** this reserves 200,000 VND against the pilot budget. Refuse if:
   - the reserve is exhausted;
   - it is a self-referral or a same-household referral;
   - the household was already referred (the earliest valid code stands);
   - the code arrives after payment.
3. **Reconcile payment, attendance, refunds and disputes.** A refund before qualification voids the referral and releases the reserve.
4. **Qualify:** 8 lessons paid and completed, with no open dispute.
5. **Issue the credit.**
6. **Redeem:** check the invoice against the ledger first. Apply at most 400,000 VND to each later 8-lesson individual package, once per invoice. The balance carries forward.

A reward that has already been confirmed is honoured even if the budget closes later. Rewards are never deducted from a teacher's agreed pay without their agreement. Owner-funded rewards are recorded as owner-funded marketing.

Analytics: page and card views only, through the existing cookieless Vercel Analytics. Never put names, emails, phones or codes in URLs or events.

## Understanding summary and decision log

- **What:** a discreet referral page plus a card and a footer link inside Student Academy, with manual credits and a private ledger.
- **For whom:** current and former academy parents and guardians, and adult learners, in Hanoi.
- **Constraints:**
  - quiet placement;
  - one versioned terms source;
  - no checkout, database or auth changes;
  - unapproved funding means the release stops at preview;
  - no invented prices, testimonials or results.
- **Non-goals:** automatic credits, a referral-tracking database, Vietnamese routes, a header or homepage placement.

| Decision | Alternatives | Why |
|---|---|---|
| Server-side env gate, production off by default | Hold the PR unmerged; ship live | Merge equals production deploy; the gate lets a reviewed PR merge without advertising an unfunded offer. Follows the repo's `LADDER_ENABLED` and resource-store precedents. |
| Card limited to 13 words, all terms on the page | Blueprint's longer card copy with small print | `/student-academy` is at 536 of the 550-word ceiling enforced by `verify-overhaul.mjs`. |
| One primary CTA on the page; the card links to the page | Card "Join" button straight to the form | Families read the terms before joining. Keeps one signup button. |
| Email request as the primary CTA until a verified form URL exists | A placeholder form link | Never ship a placeholder; email is a working path. |
| Vietnamese kept as an unrendered draft in `terms.ts` | Render the machine draft | The app has no VI locale and the draft has had no native review. |
| Ledger rules as pure code with synthetic tests, not wired to any UI | Spreadsheet only | Rules are executable and rehearsed; nothing in the browser can grant credit. |
| Funding amount kept out of the repo | State it in the terms | The directive keeps funding evidence private. Only the per-household amounts are public. |
| No public service-time promise ("within two working days") | Publish it | The blueprint says publish only if it can be staffed; not confirmed. |
