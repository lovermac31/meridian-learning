-- Migration: 20261102000001_je_events_utm_medium_campaign.sql
-- Funnel audit fix 2 (2 Nov 2026): store the first landing's utm_medium and utm_campaign with every event, so a
-- Facebook-group click on Reserve or Zalo keeps its campaign and post. Still anonymous: no IP, cookie or user id.
alter table public.je_events add column if not exists utm_medium   text;
alter table public.je_events add column if not exists utm_campaign text;
create index if not exists je_events_utm_campaign_idx on public.je_events (utm_campaign);

-- One function, eight parameters. The six-parameter overload is dropped so PostgREST never sees two candidates;
-- api/_lib/eventWriter.ts sends the two new parameters only when set and retries without them on a 404, so
-- clicks are kept whether or not this migration has run yet.
drop function if exists public.record_je_event(text, text, text, text, text, text);
create or replace function public.record_je_event(
  p_event        text,
  p_path         text default null,
  p_product_id   text default null,
  p_utm_source   text default null,
  p_utm_content  text default null,
  p_locale       text default null,
  p_utm_medium   text default null,
  p_utm_campaign text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.je_events (ts, event, path, product_id, utm_source, utm_content, locale, utm_medium, utm_campaign)
  values (now(), p_event, p_path, p_product_id, p_utm_source, p_utm_content, p_locale, p_utm_medium, p_utm_campaign);
end;
$$;

revoke all on function public.record_je_event(text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.record_je_event(text, text, text, text, text, text, text, text) to service_role;
