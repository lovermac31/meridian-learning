-- Migration: 20261115000001_je_events_phonics.sql   (NOT APPLIED; for Jay's review)
-- Phonics on /products (15 Nov 2026, brief WW-20261115-02): two new anonymous event names, phonics_audio_play (the card's
-- audio clip was played) and reader_open (the sample in the storybook reader was opened). api/event.ts already accepts
-- them; until this runs, the database check rejects them and the event writer fails open (no error for the visitor).
alter table public.je_events drop constraint je_events_event_check;
alter table public.je_events add constraint je_events_event_check check (event in (
  'zalo_click', 'pricing_view', 'checkout_start', 'paypal_return', 'sample_open', 'video_play', 'lead_submit',
  'reserve_view', 'reserve_submit', 'pay_instructions_shown', 'story_club_paid', 'ls_order', 'page_view',
  'phonics_audio_play', 'reader_open'
));
