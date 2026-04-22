create table public.je_leads (
  id                       uuid        primary key default gen_random_uuid(),
  registration_id          text        not null unique,
  submitted_at             timestamptz not null,
  full_name                text        not null,
  work_email               text        not null,
  role_title               text        not null,
  organisation_name        text        not null,
  country_region           text        not null,
  buyer_type               text        not null,
  interest_area            text        not null,
  organisation_size        text,
  phone_whatsapp           text,
  preferred_contact_method text,
  timeline                 text,
  message                  text,
  contact_consent          boolean     not null default true,
  alignment_status         text,
  service_category         text,
  pricing_range_summary    text,
  recommended_next_step    text,
  lead_status              text        not null default 'new',
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

alter table public.je_leads enable row level security;

create index je_leads_work_email_idx    on public.je_leads (work_email);
create index je_leads_submitted_at_idx  on public.je_leads (submitted_at desc);
create index je_leads_lead_status_idx   on public.je_leads (lead_status);
create index je_leads_buyer_type_idx    on public.je_leads (buyer_type);
create index je_leads_interest_area_idx on public.je_leads (interest_area);

create function public.je_leads_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger je_leads_updated_at
  before update on public.je_leads
  for each row execute function public.je_leads_set_updated_at();
