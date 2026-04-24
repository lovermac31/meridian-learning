# Internal Portal Operator SOP

Internal use only. This SOP describes the manual pilot access workflow for requests submitted through Jurassic English Get Started.

## 1. Overview

Pilot access is never granted automatically from the public website. Every request must move through operator review before scoped external portal access or consultation follow-up is sent.

Workflow:

`Request submitted -> Email alert -> Internal portal review -> Decision -> Scoped access or consultation -> Event logging -> Fulfillment complete`

## 2. Workflow Trigger

The workflow starts when a user submits `/get-started` with:

- `source=pilot-programme`
- `access=<pilot access request>`

Supported access request values:

- `pilot_overview_pack`
- `implementation_scope_overview`
- `reporting_sample`
- `readiness_checklist`
- `institutional_programme_pack`
- `pilot_consultation`

## 3. Email Destination

The Get Started API sends the operator alert to `GET_STARTED_NOTIFY_EMAIL`. Production should resolve this to:

`info@jurassicenglish.com`

Inbox receipt must be confirmed manually unless the operator has direct inbox access.

## 4. Internal Portal Access

Open:

`/internal/pilot-requests`

Use the scoped `INTERNAL_PORTAL_OPERATOR_KEY` as a bearer-style operator key. Do not store the key in shared notes, screenshots, tickets, or chat.

## 5. Search Workflow

Use the queue search to find requests by:

- submission ID
- work email
- organisation name
- recent submissions

Open the request detail view before making a decision.

## 6. Review Rubric

Check the request against these criteria:

| Check | Pass signal | Risk signal |
|---|---|---|
| Email credibility | Work or institutional domain | disposable, suspicious, personal-only |
| Organisation credibility | named school, centre, academy, institution, investor, partner | vague or missing organisation |
| Role credibility | school leader, academic director, centre owner, teacher trainer, investor, decision-maker | unclear role or unrelated individual |
| Request alignment | pilot pack, readiness checklist, reporting sample, consultation, institutional pack | unrelated enquiry or broad data request |
| Consultation need | implementation or institutional request needs scoping | asks for broad access without context |
| Minimum scope | narrowest useful resource set | broad pack requested without qualification |

Use the minimum necessary scope. Do not send broad institutional materials without review.

## 7. Decision Paths

Use the existing status vocabulary:

- `submitted`: received and not yet triaged
- `under_review`: needs clarification or active operator review
- `consultation_required`: credible request, call required before broad access
- `approved`: approved for scoped portal access
- `denied`: not qualified or not aligned
- `fulfilled`: workflow completed
- `revoked`: future access should be withdrawn

Clarification required is represented as `operator_status=under_review` plus an operator note and a clarification email.

## 8. Approved Access Workflow

1. Set `operator_status=approved`.
2. Select approved scopes.
3. Issue the token.
4. Copy the returned URL once.
5. Send Template A from `docs/JE-Pilot-Email-Templates.md`.
6. Set `fulfillment_status=materials_sent` after sending.
7. Set `fulfillment_status=completed` when the action is complete.

## 9. Consultation-Required Workflow

1. Set `operator_status=consultation_required`.
2. Set `consultation_status=required` or `proposed`.
3. Send Template B.
4. Log a manual event noting the email was sent.
5. Update consultation status as the call moves to `scheduled`, `completed`, or `declined`.

There is no `consultation_sent` fulfillment status in the current production enum. Consultation email progress is tracked through `consultation_status` and manual event logging.

## 10. Clarification Workflow

1. Set `operator_status=under_review`.
2. Add a note describing the missing information.
3. Send Template C.
4. Log a manual event.
5. Wait for reply before approving, requiring consultation, or denying.

## 11. Denied Workflow

1. Set `operator_status=denied`.
2. Add an internal note with the reason.
3. Optionally send Template D.
4. Do not issue a token.

## 12. Token Issuance Rules

Tokens may only be issued when `operator_status=approved`.

Allowed scopes:

- `pilot_overview_pack`
- `readiness_checklist`
- `executive_summary_sample`
- `consultation_prep`

Intake mapping:

| Intake request | Default operator scope guidance |
|---|---|
| `pilot_overview_pack` | `pilot_overview_pack`, `readiness_checklist` |
| `readiness_checklist` | `readiness_checklist` |
| `reporting_sample` | `executive_summary_sample` |
| `pilot_consultation` | `consultation_prep` |
| `implementation_scope_overview` | `consultation_prep`, optional `readiness_checklist` |
| `institutional_programme_pack` | `pilot_overview_pack`, `readiness_checklist`; add `executive_summary_sample` only if explicitly approved |

Default maximum expiry is 30 days. Longer expiry requires an explicit override and reason.

## 13. Logging Rules

Every status, note, token, or fulfillment action should leave an event trail in `je_pilot_access_events`.

The raw token is never stored in Supabase. Only metadata is stored:

- issued at
- expires at
- scope
- reference

## 14. Cleanup Rules

For QA rows:

1. Delete related `je_pilot_access_events`.
2. Delete the `je_pilot_access_requests` row.
3. Delete or clearly label related `je_get_started_submissions` rows.
4. Remove local env pull files such as `.vercel/.env.production.local`.

## 15. Security Reminders

- Never store raw token URLs in Notion or shared docs.
- Never paste the operator key into chat.
- Rotate any exposed secret immediately.
- Use minimum necessary scope.
- Use short expiry.
- Do not send broad institutional packs without review.
- Keep `/internal/pilot-requests` private, noindex, and hidden from navigation.
