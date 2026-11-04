-- Durable, privacy-minimal Story Club reservations and manual payment confirmation.
-- No bank details, payment provider, buyer contact data, or student data are stored.

create table public.story_club_reservations (
  memo text primary key check (memo ~ '^SC-[A-Z0-9]{6}$'),
  submission_id text not null unique check (submission_id ~* '^JE-SC-[0-9a-fA-F-]{36}$'),
  group_id text not null check (group_id in ('sat-0900', 'flexible')),
  amount_vnd integer not null default 590000 check (amount_vnd = 590000),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table public.story_club_payment_audit (
  id bigint generated always as identity primary key,
  memo text not null references public.story_club_reservations(memo),
  action text not null check (action = 'marked_paid'),
  marked_at timestamptz not null default now(),
  actor_kind text not null default 'operator' check (actor_kind = 'operator')
);

alter table public.story_club_reservations enable row level security;
alter table public.story_club_payment_audit enable row level security;
revoke all on public.story_club_reservations, public.story_club_payment_audit from public, anon, authenticated, service_role;
revoke all on sequence public.story_club_payment_audit_id_seq from public, anon, authenticated, service_role;

create or replace function public.create_story_club_reservation(p_submission_id text, p_group text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_memo text;
  v_existing text;
  v_inserted integer;
begin
  if p_submission_id is null or p_submission_id !~ '^JE-SC-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'
     or p_group not in ('sat-0900', 'flexible') then
    raise exception using errcode = '22023', message = 'invalid reservation input';
  end if;

  v_memo := 'SC-' || upper(right(replace(p_submission_id, '-', ''), 6));
  insert into public.story_club_reservations (memo, submission_id, group_id)
  values (v_memo, lower(p_submission_id), p_group)
  on conflict (submission_id) do nothing;
  get diagnostics v_inserted = row_count;

  select memo into v_existing from public.story_club_reservations where submission_id = lower(p_submission_id);
  if v_existing is null then
    -- A different submission collided on its six-character memo. Never issue a shared payment reference.
    raise exception using errcode = '23505', message = 'reservation memo collision';
  end if;
  return jsonb_build_object('memo', v_existing, 'created', v_inserted = 1);
end;
$$;

alter table public.je_events drop constraint je_events_event_check;
alter table public.je_events add constraint je_events_event_check check (event in (
  'zalo_click', 'pricing_view', 'checkout_start', 'paypal_return', 'sample_open', 'video_play', 'lead_submit',
  'reserve_view', 'reserve_submit', 'pay_instructions_shown', 'story_club_paid'
));

create or replace function public.mark_story_club_paid(p_memo text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.story_club_reservations%rowtype;
  v_now timestamptz := now();
begin
  if p_memo is null or p_memo !~ '^SC-[A-Z0-9]{6}$' then
    raise exception using errcode = '22023', message = 'invalid payment memo';
  end if;

  select * into v_row from public.story_club_reservations where memo = p_memo for update;
  if not found then
    return jsonb_build_object('status', 'not_found', 'paid_at', null);
  end if;
  if v_row.paid_at is not null then
    return jsonb_build_object('status', 'already_paid', 'paid_at', v_row.paid_at);
  end if;

  update public.story_club_reservations set paid_at = v_now where memo = p_memo;
  insert into public.story_club_payment_audit (memo, action, marked_at) values (p_memo, 'marked_paid', v_now);

  insert into public.je_events (ts, event, path, product_id, locale)
  values (v_now, 'story_club_paid', '/story-club/reserve', 'story-club', null);

  return jsonb_build_object('status', 'paid', 'paid_at', v_now);
end;
$$;

revoke all on function public.create_story_club_reservation(text, text) from public, anon, authenticated;
revoke all on function public.mark_story_club_paid(text) from public, anon, authenticated;
grant execute on function public.create_story_club_reservation(text, text) to service_role;
grant execute on function public.mark_story_club_paid(text) to service_role;
