-- Run with psql from the repository root. This starts with a synthetic local
-- copy of the pre-existing relation, then applies the migration twice.
begin;

\ir ../../docs/database/student_academy_registrations.sql
alter table public.student_academy_registrations enable row level security;
revoke all privileges on table public.student_academy_registrations from public, anon, authenticated;

create temp table d2_schema_before as
select jsonb_agg(jsonb_build_object(
  'name', a.attname,
  'type', format_type(a.atttypid, a.atttypmod),
  'not_null', a.attnotnull,
  'default', pg_get_expr(d.adbin, d.adrelid)
) order by a.attnum) as signature
from pg_attribute a
left join pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum
where a.attrelid = 'public.student_academy_registrations'::regclass and a.attnum > 0 and not a.attisdropped;

\ir ../migrations/20261029000004_student_academy_registrations.sql
\ir ../migrations/20261029000004_student_academy_registrations.sql

do $$
declare
  v_after jsonb;
  v_before jsonb;
  v_columns text[];
  v_expected_columns constant text[] := array[
    'id', 'created_at', 'updated_at', 'registration_source', 'auth_provider', 'parent_full_name',
    'parent_email', 'phone_contact', 'preferred_contact_method', 'country_city', 'student_first_name',
    'student_age_or_grade', 'current_english_level', 'main_goal', 'learning_notes', 'preferred_diagnostic_time',
    'consent_contact', 'canonical_access_url', 'status', 'email_sent', 'email_sent_at', 'internal_notes'
  ];
begin
  select signature into v_before from d2_schema_before;
  select jsonb_agg(jsonb_build_object(
    'name', a.attname,
    'type', format_type(a.atttypid, a.atttypmod),
    'not_null', a.attnotnull,
    'default', pg_get_expr(d.adbin, d.adrelid)
  ) order by a.attnum) into v_after
  from pg_attribute a
  left join pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum
  where a.attrelid = 'public.student_academy_registrations'::regclass and a.attnum > 0 and not a.attisdropped;

  select array_agg(a.attname::text order by a.attnum) into v_columns
  from pg_attribute a
  where a.attrelid = 'public.student_academy_registrations'::regclass and a.attnum > 0 and not a.attisdropped;
  if v_columns is distinct from v_expected_columns then
    raise exception 'schema columns differ from the runbook contract: %', v_columns;
  end if;
  if v_after is distinct from v_before then
    raise exception 'applying the idempotent migration changed the existing schema';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public.student_academy_registrations'::regclass) then
    raise exception 'RLS is not enabled';
  end if;
  if has_table_privilege('anon', 'public.student_academy_registrations', 'SELECT,INSERT,UPDATE,DELETE')
     or has_table_privilege('authenticated', 'public.student_academy_registrations', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'direct client table privileges remain';
  end if;
  if (select count(*) from public.student_academy_registrations) <> 0 then
    raise exception 'idempotence test unexpectedly created data';
  end if;
end;
$$;

rollback;
