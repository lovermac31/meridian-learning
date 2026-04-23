# Pilot Access Phase 1 SOP

Phase 1 is intake tagging and manual approval foundation only. Do not grant portal
access automatically from a public form submission.

## Intake Source

Pilot access requests enter through:

`/get-started?interest=curriculum_review&source=pilot-programme&access=<request>`

Allowed access request values:

- `pilot_overview_pack`
- `implementation_scope_overview`
- `reporting_sample`
- `readiness_checklist`
- `institutional_programme_pack`
- `pilot_consultation`

## Manual Review Statuses

These statuses are operator workflow labels only. They are not public form fields
and are not written by the Phase 1 public intake schema.

- `submitted`: request received through Get Started.
- `under_review`: operator is reviewing institutional fit and request quality.
- `consultation_required`: a call is required before sending materials.
- `approved`: request is approved for manual material delivery.
- `denied`: request is not qualified for gated materials.
- `fulfilled`: approved materials or next-step instructions were sent.
- `revoked`: future access or delivery should be withdrawn.

## Review Criteria

Review whether the requester:

- uses a credible work email and names an institution.
- appears to represent a school, academy, school group, centre, or institutional partner.
- describes a real curriculum challenge or pilot objective.
- requests materials appropriate to their role and decision stage.
- needs a consultation before detailed material delivery.

## Delivery Expectations

- Respond within two business days when possible.
- Do not send sensitive programme packs to unqualified personal or ambiguous requests.
- Use consultation-required language when the context is plausible but incomplete.
- Log the manual decision outside the public submission schema until the internal portal exists.

## Logging Expectations

For Phase 1, confirm the notification/Supabase intake context includes:

- `source`
- `accessRequest`
- `userNotes`

Do not add approval status, requested portal, token, or access grant fields until
the External Portal MVP phase.
