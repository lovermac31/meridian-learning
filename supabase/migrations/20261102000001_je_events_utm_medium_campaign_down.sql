-- Rollback for 20261102000001_je_events_utm_medium_campaign.sql: back to the six-parameter function and columns.
drop function if exists public.record_je_event(text, text, text, text, text, text, text, text);
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
  insert into public.je_events (ts, event, path, product_id, utm_source, utm_content, locale)
  values (now(), p_event, p_path, p_product_id, p_utm_source, p_utm_content, p_locale);
end;
$$;
revoke all on function public.record_je_event(text, text, text, text, text, text) from public, anon;
grant execute on function public.record_je_event(text, text, text, text, text, text) to service_role;
drop index if exists public.je_events_utm_campaign_idx;
alter table public.je_events drop column if exists utm_campaign;
alter table public.je_events drop column if exists utm_medium;
