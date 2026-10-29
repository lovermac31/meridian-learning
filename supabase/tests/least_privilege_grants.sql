-- Run after all forward migrations on a local Supabase/Postgres test database.
-- Fixture roles and normal Supabase service_role API grants must be present.
-- Every row below uses synthetic data.
begin;

do $$
declare
  v_table text;
  v_tables constant text[] := array[
    'public.je_events',
    'public.je_leads',
    'public.je_get_started_submissions',
    'public.je_pilot_access_events',
    'public.je_pilot_access_requests'
  ];
begin
  foreach v_table in array v_tables loop
    if has_table_privilege('anon', v_table, 'SELECT')
       or has_table_privilege('authenticated', v_table, 'SELECT') then
      raise exception 'direct SELECT grant remains for anon/authenticated on %', v_table;
    end if;
    if has_table_privilege('anon', v_table, 'INSERT,UPDATE,DELETE')
       or has_table_privilege('authenticated', v_table, 'INSERT,UPDATE,DELETE') then
      raise exception 'direct write grant remains for anon/authenticated on %', v_table;
    end if;
  end loop;
  if not has_function_privilege('service_role', 'public.record_je_event(text,text,text,text,text,text)', 'EXECUTE') then
    raise exception 'service_role cannot execute record_je_event';
  end if;
  if has_function_privilege('anon', 'public.record_je_event(text,text,text,text,text,text)', 'EXECUTE') then
    raise exception 'anon can execute record_je_event';
  end if;
end;
$$;

set local role service_role;
insert into public.je_leads (registration_id, submitted_at, full_name, work_email, role_title, organisation_name, country_region, buyer_type, interest_area)
values ('D1-SYNTHETIC-LEAD', now(), 'Synthetic Parent', 'parent@example.invalid', 'Parent', 'Synthetic Org', 'VN', 'parent_guardian', 'teacher_training');
insert into public.je_get_started_submissions (submission_id, submitted_at, full_name, work_email, organisation_name, organisation_type, primary_interest, challenge)
values ('D1-SYNTHETIC-GETSTARTED', now(), 'Synthetic Parent', 'parent@example.invalid', 'Synthetic Org', 'school', 'teacher_training', 'Synthetic test');
insert into public.je_pilot_access_requests (submission_id, submitted_at, full_name, work_email, organisation_name)
values ('D1-SYNTHETIC-PILOT', now(), 'Synthetic User', 'pilot@example.invalid', 'Synthetic Org');
insert into public.je_pilot_access_events (submission_id, event_type)
values ('D1-SYNTHETIC-PILOT', 'access_viewed');
select public.record_je_event('lead_submit', '/synthetic-test', 'synthetic-product', 'test', 'local-sql', 'en');
reset role;

do $$
begin
  if not exists (select 1 from public.je_leads where registration_id = 'D1-SYNTHETIC-LEAD')
     or not exists (select 1 from public.je_get_started_submissions where submission_id = 'D1-SYNTHETIC-GETSTARTED')
     or not exists (select 1 from public.je_pilot_access_requests where submission_id = 'D1-SYNTHETIC-PILOT')
     or not exists (select 1 from public.je_pilot_access_events where submission_id = 'D1-SYNTHETIC-PILOT')
     or not exists (select 1 from public.je_events where event = 'lead_submit' and path = '/synthetic-test') then
    raise exception 'one or more service-role API insert paths did not persist';
  end if;
end;
$$;

rollback;
