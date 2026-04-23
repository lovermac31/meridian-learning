# External Portal Issuance SOP

This SOP governs Phase 2 external pilot portal links. Do not issue external
portal access until a Get Started request has been manually reviewed.

## Approved Scopes

- `pilot_overview_pack`: high-level institutional pilot brief.
- `readiness_checklist`: readiness criteria and implementation prerequisites.
- `executive_summary_sample`: sample report structure for leadership review.
- `consultation_prep`: preparation prompts for a pilot or discovery call.

Issue the minimum scope needed for the user's approved review stage.

## Default Expiry Windows

- Consultation preparation: 7 days.
- Readiness checklist: 14 days.
- Pilot overview pack: 14 days.
- Executive summary sample: 14 days.
- Multi-resource institutional review pack: 21 days.

Do not issue links longer than 30 days without explicit operator approval.

## When To Issue Links

Issue a link only when the requester:

- submitted through `/get-started` with `source=pilot-programme`.
- used a credible work email and named an institution.
- appears to represent a school, academy, centre, school group, or approved partner.
- provided enough curriculum challenge or pilot objective context.
- requested materials appropriate to their role and decision stage.

Use consultation-required messaging instead of portal access if the request is
plausible but too ambiguous for material release.

## How To Generate Links

Use the manual generator with the external portal signing secret configured:

```bash
npm run external-portal:access-link -- \
  --email director@example.edu \
  --org "Example Academy" \
  --scope pilot_overview_pack,readiness_checklist \
  --ref PILOT-001 \
  --days 14
```

Allowed scopes are comma-separated. The generated URL should point to:

`/external/pilot?token=<token>`

## Issuance Logging

For every issued link, log:

- submission ID or reference.
- approved email.
- institution name.
- issued scope list.
- issue date.
- expiry date.
- operator initials/name.
- reason for approval.
- delivery email subject/date.

Until the internal portal exists, keep this log in the operating CRM or manual
tracking document. Do not store raw tokens in shared notes; store only the issue
record and expiry.

## Regeneration And Revocation

Regenerate a link when:

- the original link expired and the institution remains qualified.
- the institution requests a narrower or broader approved scope.
- the original email had a typo.

Treat a link as revoked when:

- it was sent to the wrong recipient.
- the recipient is no longer approved.
- the organisation context appears inaccurate.
- the material scope was granted in error.

Phase 2 tokens are stateless. Revocation means the operator should stop using the
old link, issue a corrected link if appropriate, and log the reason. Server-side
revocation belongs to a later approved-user/grant table phase.

## Email Delivery

Use a professional response that includes:

- approved resource scope.
- expiry date.
- reminder not to forward the link.
- next step: review materials or book consultation.
- support contact: `info@jurassicenglish.com`.
