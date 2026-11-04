-- All application access to these public tables goes through server-side APIs
-- using the backend service-role key. No client or anonymous API path requires
-- direct table privileges.
revoke all privileges on table
  public.je_events,
  public.je_leads,
  public.je_get_started_submissions,
  public.je_pilot_access_events,
  public.je_pilot_access_requests
from anon, authenticated;
