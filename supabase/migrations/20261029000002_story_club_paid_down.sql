-- Rollback for 20261029000002_story_club_paid.sql. Preserve the C1 reserve events.
drop function if exists public.mark_story_club_paid(text);
drop function if exists public.create_story_club_reservation(text, text);
drop table if exists public.story_club_payment_audit;
drop table if exists public.story_club_reservations;

alter table public.je_events drop constraint je_events_event_check;
alter table public.je_events add constraint je_events_event_check check (event in (
  'zalo_click', 'pricing_view', 'checkout_start', 'paypal_return', 'sample_open', 'video_play', 'lead_submit',
  'reserve_view', 'reserve_submit', 'pay_instructions_shown'
));
