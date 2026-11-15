-- Saved query (read-only; not a migration, not applied). Page views and clicks per day, path and utm_content.
-- Run in the Supabase SQL editor after 20261113000001_je_events_page_view.sql has been applied.
-- Days are Vietnam time (Asia/Ho_Chi_Minh). "views" = page_view rows; "clicks" = zalo_click, checkout_start,
-- sample_open, video_play and reserve_submit rows; reserve_view and the payment events are left out on purpose.
-- Change the interval below to widen or narrow the window.
select
  (ts at time zone 'Asia/Ho_Chi_Minh')::date                                                        as day,
  coalesce(path, '(none)')                                                                          as path,
  coalesce(utm_content, '(none)')                                                                   as utm_content,
  count(*) filter (where event = 'page_view')                                                       as views,
  count(*) filter (where event in ('zalo_click', 'checkout_start', 'sample_open', 'video_play', 'reserve_submit')) as clicks
from public.je_events
where ts >= now() - interval '14 days'
  and event in ('page_view', 'zalo_click', 'checkout_start', 'sample_open', 'video_play', 'reserve_submit')
group by 1, 2, 3
order by day desc, views desc, clicks desc;
