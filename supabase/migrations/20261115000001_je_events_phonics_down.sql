-- Rollback for 20261115000001_je_events_phonics.sql (NOT APPLIED). Delete any Phonics event rows first if they exist.
alter table public.je_events drop constraint je_events_event_check;
alter table public.je_events add constraint je_events_event_check check (event in (
  'zalo_click', 'pricing_view', 'checkout_start', 'paypal_return', 'sample_open', 'video_play', 'lead_submit',
  'reserve_view', 'reserve_submit', 'pay_instructions_shown', 'story_club_paid', 'ls_order', 'page_view'
));
