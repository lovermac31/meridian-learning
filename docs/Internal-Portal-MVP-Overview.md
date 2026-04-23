# Internal Portal MVP Overview

## Purpose

Phase 3 introduces a narrow internal operator portal for managing pilot access
requests after the External Portal MVP is live. The portal is for internal
operators only. It is not a CRM replacement, LMS, analytics dashboard, or full
authentication system.

The MVP supports:

- request review queue
- request detail view
- approval status updates
- consultation-required state
- approved scope selection
- token issuance metadata
- fulfillment tracking
- event log
- search and filtering by submission ID, work email, and organisation name

## Route Structure

Recommended internal route:

- `/internal/pilot-requests`

Required route behavior:

- no navbar exposure
- no sitemap inclusion
- `noindex,nofollow`
- no canonical
- no BotUI exposure
- no public access to operator data without an operator key

Internal portal access remains separate from:

- `/external/pilot`
- `/plans-pricing-access`
- `/get-started`
- public pilot programme pages

## Security Model

The frontend must never talk directly to Supabase.

All reads and writes must go through internal API routes protected by the
existing operator-access pattern.

Operator-key rules:

- use endpoint-scoped operator secrets
- do not put operator keys in URLs
- do not store operator keys in `localStorage`
- use `sessionStorage` only if client-side persistence is required for MVP
- send operator keys only in `Authorization: Bearer <key>` headers
- keep all operator mutations server-side

Recommended environment variables:

- `INTERNAL_PORTAL_OPERATOR_KEY`
- optional `INTERNAL_PORTAL_OPERATOR_IP_ALLOWLIST`
- existing `SUPABASE_URL`
- existing `SUPABASE_WRITE_KEY`
- existing `EXTERNAL_PORTAL_SIGNING_SECRET`

## Internal API Routes

Recommended MVP API surface:

- `GET /api/internal/pilot-requests`
  - returns recent pilot access requests
  - supports search/filter by `submission_id`, `work_email`, and
    `organisation_name`

- `GET /api/internal/pilot-request`
  - returns a single request detail by `submission_id`

- `PATCH /api/internal/pilot-request`
  - updates operator status, consultation status, approved scopes, fulfillment
    status, and operator notes

- `POST /api/internal/issue-pilot-token`
  - generates a scoped external portal token
  - records issuance metadata
  - does not store the raw token

- `POST /api/internal/log-pilot-action`
  - appends operational events such as regenerate, revoke, fulfillment update,
    or operator note

## Data Model

### `je_pilot_access_requests`

Recommended fields:

- `id uuid primary key`
- `submission_id text unique not null`
- `submitted_at timestamptz`
- `full_name text`
- `work_email text`
- `organisation_name text`
- `organisation_type text`
- `primary_interest text`
- `source text`
- `access_request text`
- `challenge text`
- `decision_stage text`
- `timeline text`
- `operator_status text not null default 'submitted'`
- `consultation_status text not null default 'not_required'`
- `approved_scopes text[] not null default '{}'`
- `fulfillment_status text not null default 'not_started'`
- `last_token_issued_at timestamptz`
- `last_token_expires_at timestamptz`
- `last_token_scope text[]`
- `last_token_reference text`
- `assigned_operator text`
- `operator_notes text`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

### Operator Status Values

- `submitted`
- `under_review`
- `approved`
- `denied`
- `consultation_required`
- `fulfilled`
- `revoked`

### Consultation Status Values

- `not_required`
- `required`
- `proposed`
- `scheduled`
- `completed`
- `declined`

### Fulfillment Status Values

These must remain operationally separate:

- `not_started`
- `token_issued`
- `materials_sent`
- `completed`
- `blocked`

Do not collapse `token_issued`, `materials_sent`, and `completed` into one
state.

### Approved Scope Values

- `pilot_overview_pack`
- `readiness_checklist`
- `executive_summary_sample`
- `consultation_prep`

## Event Model

### `je_pilot_access_events`

Recommended fields:

- `id uuid primary key`
- `submission_id text not null`
- `event_type text not null`
- `operator_id text`
- `event_at timestamptz default now()`
- `details jsonb not null default '{}'`

Recommended event values:

- `review_started`
- `status_changed`
- `consultation_required`
- `scopes_approved`
- `token_issued`
- `token_regenerated`
- `token_revoked_operationally`
- `fulfillment_updated`
- `operator_note_added`
- `access_viewed`

`access_viewed` is reserved for later implementation when external portal view
tracking is approved. It should be included in the event model now so the schema
does not need to change when that tracking is added.

## Token Issuance Rules

Token issuance should:

- use the existing external portal signing secret server-side only
- generate tokens through an internal API route only
- record issue date, expiry date, approved scopes, reference, and operator event
- never store raw tokens in Supabase
- return the raw token URL only in the immediate API response for operator copy

Regeneration and revocation remain operational logs in the MVP. Hard server-side
token revocation is deferred until a later access-automation phase.

## Queue and Detail UX

Queue must support:

- recent submissions first
- search by `submission_id`
- search by `work_email`
- search by `organisation_name`
- quick filters for status, consultation required, fulfillment state, and access
  request type

Detail view must show:

- submitter identity
- institution
- submitted access request
- challenge/context
- decision stage and timeline
- approved scopes
- operator status
- consultation status
- fulfillment status
- issuance metadata
- event log

## Out Of Scope

Do not build in Phase 3:

- full authentication
- role matrix
- LMS or client workspace
- analytics dashboard
- automated email workflows
- broad CRM replacement UI
- public portal discovery or navigation
- changes to BotUI
- changes to private pricing behavior
- direct frontend Supabase reads or writes

## Validation Plan

Required local validation:

- `npm run lint`
- `npm run build`
- `npm run test:metadata`
- `npm run validate:prerender`

Required route checks:

- `/internal/pilot-requests`
- `/external/pilot`
- `/pilot-programme`
- `/get-started`
- `/plans-pricing-access`
- `/vi/pilot-programme`

Required API checks:

- no bearer token returns `401`
- wrong bearer token returns `401`
- valid bearer token can list queue data
- unsupported scope is rejected
- invalid status is rejected
- token issuance records metadata but not raw token
- action log appends structured events

Required SEO checks:

- internal route is `noindex,nofollow`
- internal route has no canonical
- internal route is absent from sitemap
- internal route is absent from public navigation

Required mobile checks:

- `/internal/pilot-requests` at `390x844`
- no horizontal overflow
- queue and detail views remain usable

## Deployment Recommendation

Phase 3 should deploy to Vercel preview first. Production promotion should wait
until:

- internal operator key is configured in Preview and Production
- Supabase schema migration is applied
- internal APIs pass authorization checks
- internal route remains hidden, noindex, and non-canonical
- existing external portal and pricing routes show no regressions
