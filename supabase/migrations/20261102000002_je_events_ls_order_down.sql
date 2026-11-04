-- Rollback for 20261102000002_je_events_ls_order.sql. Existing ls_order rows must be deleted first.
delete from public.je_events where event = 'ls_order';
alter table public.je_events drop constraint je_events_event_check;
alter table public.je_events add constraint je_events_event_check check (event in (
  'zalo_click', 'pricing_view', 'checkout_start', 'paypal_return', 'sample_open', 'video_play', 'lead_submit',
  'reserve_view', 'reserve_submit', 'pay_instructions_shown', 'story_club_paid'
));
