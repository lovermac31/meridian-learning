-- Local-only synthetic acceptance test. Apply the 20261028 events migration,
-- the 20261029 reserve-event migration, then the C4 migration before running.
begin;

do $$
declare
  v_created jsonb;
  v_duplicate jsonb;
  v_paid jsonb;
  v_again jsonb;
  v_memo text;
begin
  if not has_function_privilege('service_role', 'public.create_story_club_reservation(text,text)', 'EXECUTE')
     or not has_function_privilege('service_role', 'public.mark_story_club_paid(text)', 'EXECUTE') then
    raise exception 'service_role RPC grants missing';
  end if;
  if has_function_privilege('anon', 'public.create_story_club_reservation(text,text)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.mark_story_club_paid(text)', 'EXECUTE') then
    raise exception 'untrusted role can execute payment RPC';
  end if;
  if has_table_privilege('service_role', 'public.story_club_reservations', 'SELECT,INSERT,UPDATE,DELETE')
     or has_table_privilege('anon', 'public.story_club_payment_audit', 'SELECT') then
    raise exception 'direct table privileges unexpectedly granted';
  end if;

  v_created := public.create_story_club_reservation('JE-SC-123e4567-e89b-42d3-a456-426614174000', 'sat-0900');
  v_memo := v_created ->> 'memo';
  if v_memo <> 'SC-174000' or v_created ->> 'created' <> 'true' then
    raise exception 'reservation creation result incorrect: %', v_created;
  end if;
  v_duplicate := public.create_story_club_reservation('JE-SC-123e4567-e89b-42d3-a456-426614174000', 'sat-0900');
  if v_duplicate ->> 'memo' <> v_memo or v_duplicate ->> 'created' <> 'false' then
    raise exception 'duplicate reservation was not idempotent: %', v_duplicate;
  end if;
  v_paid := public.mark_story_club_paid(v_memo);
  if v_paid ->> 'status' <> 'paid' or (v_paid ->> 'paid_at')::timestamptz is null then
    raise exception 'first mark-paid result incorrect: %', v_paid;
  end if;
  v_again := public.mark_story_club_paid(v_memo);
  if v_again ->> 'status' <> 'already_paid' or v_again ->> 'paid_at' <> v_paid ->> 'paid_at' then
    raise exception 'repeat mark-paid changed state: %', v_again;
  end if;
  if (select count(*) from public.story_club_payment_audit where memo = v_memo) <> 1 then
    raise exception 'expected one payment audit row';
  end if;
  if (select count(*) from public.je_events where event = 'story_club_paid' and product_id = 'story-club') <> 1 then
    raise exception 'expected one story_club_paid event';
  end if;
  if (select count(*) from public.story_club_reservations where memo = v_memo and paid_at is not null) <> 1 then
    raise exception 'expected exactly one paid reservation';
  end if;
  if (select relrowsecurity from pg_class where oid = 'public.story_club_reservations'::regclass) is not true
     or (select relrowsecurity from pg_class where oid = 'public.story_club_payment_audit'::regclass) is not true then
    raise exception 'RLS must remain enabled';
  end if;
end;
$$;

rollback;
