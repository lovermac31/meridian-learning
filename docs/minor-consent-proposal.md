# Minor Consent & Form Compliance — Proposal (Roadmap PR E)

_Status: **proposal — needs product/legal sign-off before implementation.** This PR ships **no live copy and no form changes** — it is a spec + draft wording for your review._

## The gap (from the 2026-06 audit)

`/young-learners-speaking/` markets speaking coaching for **ages 9–18** and sends
parents to a **booking form hosted on Google Apps Script** via an external link
(`<a href target="_blank">`). The page already carries a recordings-consent
statement, but there is **no explicit in-page parental-consent capture** tied to
the data the form collects, and the form bypasses our serverless
validation / rate-limiting / logging.

## Recommended approach

1. **Explicit parental/guardian consent** at the point of inquiry — a clear
   acknowledgment + checkbox before the form is opened/submitted.
2. **Separate consents** — keep general-contact consent distinct from
   recording/media consent (the latter already exists for sessions).
3. **Privacy-policy link** next to the form CTA (→ `/legal/privacy`).
4. **Data minimization** — collect only what is needed to arrange an evaluation.
5. **Form hardening** — route submissions through the rate-limited `/api/*`
   (mirroring `get-started`) so validation, CORS, logging, and spam protection
   apply; or, if staying on Google Apps Script, add a consent gate + captcha.

## Draft copy (EN — **DRAFT, requires legal review; not final**)

> **Before you continue:** This evaluation form is for a parent or legal
> guardian. By proceeding you confirm you are the parent/guardian of the child
> and consent to Jurassic English (World Wise Learning) collecting the
> information you provide solely to arrange a free speaking evaluation. We do not
> sell your data. See our [Privacy Policy](/legal/privacy). Any session
> recordings are made only with separate, explicit parental consent.

_Vietnamese and Simplified-Chinese translations are required for the trilingual
page once the EN wording is approved._

## Needs your sign-off before I implement

- [ ] Approve / edit the **consent wording** (legal).
- [ ] Decide **form routing**: keep Google Apps Script + consent gate, **or**
      move to the rate-limited `/api` (larger change).
- [ ] Confirm the **privacy-policy URL** covers minors' data.

## Implementation once approved

- Add consent acknowledgment + checkbox + privacy link at the YL form CTA, wired
  into the existing `data-i18n` system (EN / VI / zh-CN keys, maintaining key parity).
- (If chosen) build a `/api/yl-booking` route + in-page form, reusing the
  `get-started` validation / rate-limit / CORS pattern.
- QA: submit valid / invalid / consent-unchecked on a preview; confirm
  submission is blocked without consent and that leads still reach their destination.
