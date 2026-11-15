-- Read-only Story Club payment status for /api/story-club/status (15 Nov 2026).
-- 20261029000002 revoked all table privileges from service_role, so the old direct REST read of
-- story_club_reservations answered 403 in production and pay pages never showed "received".
-- This definer function returns only whether a memo is paid: no buyer, group or time data.
create or replace function public.story_club_payment_status(p_memo text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_paid_at timestamptz;
begin
  if p_memo is null or p_memo !~ '^SC-[A-Z0-9]{6}$' then
    raise exception using errcode = '22023', message = 'invalid payment memo';
  end if;
  select paid_at into v_paid_at from public.story_club_reservations where memo = p_memo;
  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;
  return jsonb_build_object('status', case when v_paid_at is null then 'unpaid' else 'paid' end);
end;
$$;

revoke all on function public.story_club_payment_status(text) from public, anon, authenticated;
grant execute on function public.story_club_payment_status(text) to service_role;
