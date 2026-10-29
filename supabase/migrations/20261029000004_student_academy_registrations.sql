-- Record the existing Student Academy intake contract in migration history.
-- IF NOT EXISTS makes this safe against the already-created relation; the
-- remaining statements are idempotent and close direct client table access.
create table if not exists public.student_academy_registrations (
  id uuid not null default gen_random_uuid() primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  registration_source text not null default 'student-academy',
  auth_provider text not null default 'email',
  parent_full_name text not null,
  parent_email text not null,
  phone_contact text,
  preferred_contact_method text,
  country_city text,
  student_first_name text,
  student_age_or_grade text,
  current_english_level text,
  main_goal text,
  learning_notes text,
  preferred_diagnostic_time text,
  consent_contact boolean not null default false,
  canonical_access_url text not null default 'https://jurassicenglish.com/student-academy',
  status text not null default 'new',
  email_sent boolean not null default false,
  email_sent_at timestamptz,
  internal_notes text
);

alter table public.student_academy_registrations enable row level security;
revoke all privileges on table public.student_academy_registrations from public, anon, authenticated;
