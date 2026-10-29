-- Extend the existing anonymous event allowlist for the Story Club reserve funnel.
-- No table data, columns, policies or function grants change.
alter table public.je_events drop constraint je_events_event_check;
alter table public.je_events add constraint je_events_event_check check (event in (
  'zalo_click',
  'pricing_view',
  'checkout_start',
  'paypal_return',
  'sample_open',
  'video_play',
  'lead_submit',
  'reserve_view',
  'reserve_submit',
  'pay_instructions_shown'
));
