-- Migration: 20261113000001_je_events_page_view.sql   (NOT APPLIED; for Jay's review)
-- Page views (13 Nov 2026, master WW-20261113-10): je_events recorded clicks but no page views, so "have people been
-- clicking?" had no denominator. Adds the page_view event name and a referrer_host column (the referrer's host only,
-- never the full URL). Still anonymous: no IP, cookie, session or user id.
alter table public.je_events add column if not exists referrer_host text;

alter table public.je_events drop constraint je_events_event_check;
alter table public.je_events add constraint je_events_event_check check (event in (
  'zalo_click', 'pricing_view', 'checkout_start', 'paypal_return', 'sample_open', 'video_play', 'lead_submit',
  'reserve_view', 'reserve_submit', 'pay_instructions_shown', 'story_club_paid', 'ls_order', 'page_view'
));

-- Reporting index for the per-path, per-day counts in supabase/queries/je_events_views_and_clicks_by_day.sql.
create index if not exists je_events_event_ts_idx on public.je_events (event, ts desc);

-- One function, nine parameters. The eight-parameter overload is dropped so PostgREST never sees two candidates;
-- api/_lib/eventWriter.ts sends p_referrer_host only when set and retries without it on a 404.
drop function if exists public.record_je_event(text, text, text, text, text, text, text, text);
create or replace function public.record_je_event(
  p_event         text,
  p_path          text default null,
  p_product_id    text default null,
  p_utm_source    text default null,
  p_utm_content   text default null,
  p_locale        text default null,
  p_utm_medium    text default null,
  p_utm_campaign  text default null,
  p_referrer_host text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.je_events (ts, event, path, product_id, utm_source, utm_content, locale, utm_medium, utm_campaign, referrer_host)
  values (now(), p_event, p_path, p_product_id, p_utm_source, p_utm_content, p_locale, p_utm_medium, p_utm_campaign, p_referrer_host);
end;
$$;

revoke all on function public.record_je_event(text, text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.record_je_event(text, text, text, text, text, text, text, text, text) to service_role;
