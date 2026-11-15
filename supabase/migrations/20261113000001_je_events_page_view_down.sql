-- Down for 20261113000001_je_events_page_view.sql (NOT APPLIED). Removes page_view rows first so the old constraint holds.
delete from public.je_events where event = 'page_view';
drop function if exists public.record_je_event(text, text, text, text, text, text, text, text, text);
create or replace function public.record_je_event(
  p_event text, p_path text default null, p_product_id text default null, p_utm_source text default null,
  p_utm_content text default null, p_locale text default null, p_utm_medium text default null, p_utm_campaign text default null
)
returns void language plpgsql security definer set search_path = public
as $$
begin
  insert into public.je_events (ts, event, path, product_id, utm_source, utm_content, locale, utm_medium, utm_campaign)
  values (now(), p_event, p_path, p_product_id, p_utm_source, p_utm_content, p_locale, p_utm_medium, p_utm_campaign);
end;
$$;
revoke all on function public.record_je_event(text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.record_je_event(text, text, text, text, text, text, text, text) to service_role;
drop index if exists public.je_events_event_ts_idx;
alter table public.je_events drop constraint je_events_event_check;
alter table public.je_events add constraint je_events_event_check check (event in (
  'zalo_click', 'pricing_view', 'checkout_start', 'paypal_return', 'sample_open', 'video_play', 'lead_submit',
  'reserve_view', 'reserve_submit', 'pay_instructions_shown', 'story_club_paid', 'ls_order'
));
alter table public.je_events drop column if exists referrer_host;
