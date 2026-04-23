create table public.je_pilot_access_requests (
  id                     uuid        primary key default gen_random_uuid(),
  submission_id          text        not null unique,
  submitted_at           timestamptz not null,
  full_name              text        not null,
  work_email             text        not null,
  organisation_name      text        not null,
  organisation_type      text,
  primary_interest       text,
  source                 text,
  access_request         text,
  challenge              text,
  decision_stage         text,
  timeline               text,
  operator_status        text        not null default 'submitted',
  consultation_status    text        not null default 'not_required',
  approved_scopes        text[]      not null default '{}',
  fulfillment_status     text        not null default 'not_started',
  last_token_issued_at   timestamptz,
  last_token_expires_at  timestamptz,
  last_token_scope       text[],
  last_token_reference   text,
  assigned_operator      text,
  operator_notes         text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  constraint je_pilot_access_operator_status_check
    check (operator_status in (
      'submitted',
      'under_review',
      'approved',
      'denied',
      'consultation_required',
      'fulfilled',
      'revoked'
    )),

  constraint je_pilot_access_consultation_status_check
    check (consultation_status in (
      'not_required',
      'required',
      'proposed',
      'scheduled',
      'completed',
      'declined'
    )),

  constraint je_pilot_access_fulfillment_status_check
    check (fulfillment_status in (
      'not_started',
      'token_issued',
      'materials_sent',
      'completed',
      'blocked'
    )),

  constraint je_pilot_access_approved_scopes_check
    check (approved_scopes <@ array[
      'pilot_overview_pack',
      'readiness_checklist',
      'executive_summary_sample',
      'consultation_prep'
    ]::text[]),

  constraint je_pilot_access_last_token_scope_check
    check (
      last_token_scope is null
      or last_token_scope <@ array[
        'pilot_overview_pack',
        'readiness_checklist',
        'executive_summary_sample',
        'consultation_prep'
      ]::text[]
    )
);

create table public.je_pilot_access_events (
  id             uuid        primary key default gen_random_uuid(),
  submission_id  text        not null,
  event_type     text        not null,
  operator_id    text,
  event_at       timestamptz not null default now(),
  details        jsonb       not null default '{}',

  constraint je_pilot_access_events_event_type_check
    check (event_type in (
      'review_started',
      'status_changed',
      'consultation_required',
      'scopes_approved',
      'token_issued',
      'token_regenerated',
      'token_revoked_operationally',
      'fulfillment_updated',
      'operator_note_added',
      'access_viewed'
    )),

  constraint je_pilot_access_events_details_object_check
    check (jsonb_typeof(details) = 'object')
);

alter table public.je_pilot_access_requests enable row level security;
alter table public.je_pilot_access_events enable row level security;

create index je_pilot_access_requests_submitted_at_idx
  on public.je_pilot_access_requests (submitted_at desc);

create index je_pilot_access_requests_work_email_idx
  on public.je_pilot_access_requests (work_email);

create index je_pilot_access_requests_organisation_name_idx
  on public.je_pilot_access_requests (organisation_name);

create index je_pilot_access_requests_operator_status_idx
  on public.je_pilot_access_requests (operator_status);

create index je_pilot_access_requests_consultation_status_idx
  on public.je_pilot_access_requests (consultation_status);

create index je_pilot_access_requests_fulfillment_status_idx
  on public.je_pilot_access_requests (fulfillment_status);

create index je_pilot_access_events_submission_event_at_idx
  on public.je_pilot_access_events (submission_id, event_at desc);

create or replace function public.set_je_pilot_access_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_je_pilot_access_requests_updated_at
before update on public.je_pilot_access_requests
for each row
execute function public.set_je_pilot_access_updated_at();
