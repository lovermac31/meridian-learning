-- Migration: 20261102000002_je_events_ls_order.sql
-- Lemon Squeezy card payments (2 Nov 2026): the webhook records one anonymous ls_order event per paid order
-- (product id and first-touch utm only; no buyer data). Adds the event name to the check constraint.
alter table public.je_events drop constraint je_events_event_check;
alter table public.je_events add constraint je_events_event_check check (event in (
  'zalo_click', 'pricing_view', 'checkout_start', 'paypal_return', 'sample_open', 'video_play', 'lead_submit',
  'reserve_view', 'reserve_submit', 'pay_instructions_shown', 'story_club_paid', 'ls_order'
));
