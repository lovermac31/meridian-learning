-- Migration: 20261028000001_je_events.sql
-- Description: Anonymous event counter for Zalo clicks and checkout events (Phase 1)
-- Privacy: Strictly anonymous. Stores no IP, cookie, session ID, or user ID.
-- Security: Table RLS enabled with 0 direct anon/authenticated policies.
--           Inserts executed exclusively via security-definer function record_je_event.

create table public.je_events (
  id           uuid        primary key default gen_random_uuid(),
  ts           timestamptz not null default now(),
  event        text        not null,
  path         text,
  product_id   text,
  utm_source   text,
  utm_content  text,
  locale       text,

  constraint je_events_event_check
    check (event in (
      'zalo_click',
      'pricing_view',
      'checkout_start',
      'paypal_return',
      'sample_open',
      'video_play',
      'lead_submit'
    ))
);

-- Enable Row Level Security (RLS)
alter table public.je_events enable row level security;

-- Performance indexes for analytics and dashboard aggregations
create index je_events_ts_idx         on public.je_events (ts desc);
create index je_events_event_idx      on public.je_events (event);
create index je_events_product_id_idx on public.je_events (product_id);
create index je_events_utm_source_idx on public.je_events (utm_source);

-- Security-definer insert function: encapsulates write logic with search_path protection.
create or replace function public.record_je_event(
  p_event       text,
  p_path        text default null,
  p_product_id  text default null,
  p_utm_source  text default null,
  p_utm_content text default null,
  p_locale      text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.je_events (
    ts,
    event,
    path,
    product_id,
    utm_source,
    utm_content,
    locale
  ) values (
    now(),
    p_event,
    p_path,
    p_product_id,
    p_utm_source,
    p_utm_content,
    p_locale
  );
end;
$$;

-- Grant execution to service_role; revoke all direct execution from public and anon.
revoke all on function public.record_je_event(text, text, text, text, text, text) from public, anon;
grant execute on function public.record_je_event(text, text, text, text, text, text) to service_role;
