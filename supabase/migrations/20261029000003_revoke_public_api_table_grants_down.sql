-- Rollback only: this restores the pre-D1 broad ACL described by the 2026-10-29
-- audit. It reopens direct anonymous/authenticated table privileges and should
-- not be run unless the owner has explicitly chosen to restore that state.
grant select, insert, update, delete on table
  public.je_events,
  public.je_leads,
  public.je_get_started_submissions,
  public.je_pilot_access_events,
  public.je_pilot_access_requests
to anon, authenticated;
