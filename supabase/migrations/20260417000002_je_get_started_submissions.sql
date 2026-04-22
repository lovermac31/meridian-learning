create table public.je_get_started_submissions (
  id                 uuid        primary key default gen_random_uuid(),
  submission_id      text        not null unique,
  submitted_at       timestamptz not null,
  full_name          text        not null,
  work_email         text        not null,
  organisation_name  text        not null,
  organisation_type  text        not null,
  primary_interest   text        not null,
  challenge          text        not null,
  contact_consent    boolean     not null default true,
  role_title         text,
  country_region     text,
  age_range          text,
  learner_count      text,
  standards_context  text,
  timeline           text,
  decision_stage     text,
  success_definition text,
  notes              text,
  newsletter_opt_in  boolean     not null default false,
  created_at         timestamptz not null default now()
);

alter table public.je_get_started_submissions enable row level security;

create index je_get_started_work_email_idx        on public.je_get_started_submissions (work_email);
create index je_get_started_submitted_at_idx      on public.je_get_started_submissions (submitted_at desc);
create index je_get_started_primary_interest_idx  on public.je_get_started_submissions (primary_interest);
