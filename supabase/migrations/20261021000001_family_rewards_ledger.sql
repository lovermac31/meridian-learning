-- Family Rewards: persistent referral accounts and append-only credit ledger.
--
-- Additive only: creates schema family_rewards and nothing else. No existing
-- table, function, grant or row is touched. Down: 20261021000001_family_rewards_ledger_down.sql.
--
-- Access model: no role other than the owner of the schema can read or write a
-- table. The application connects as role fr_app, which has EXECUTE on the fr_*
-- functions below and no table privileges. Every function resolves the caller
-- from a hashed session token inside the database, so the application cannot
-- act for a member or as the owner without that person's session.
--
-- Money: VND as bigint, never floating point. Balances are always derived from
-- posted ledger entries; there is no editable balance column. Posted entries
-- cannot be updated or deleted by any normal operation (trigger); corrections
-- are compensating entries. This is an append-only *application* ledger: a
-- database superuser can still alter it.

create schema family_rewards;
revoke all on schema family_rewards from public;

-- ---------------------------------------------------------------- settings
create table family_rewards.settings (
  id                      int primary key default 1 check (id = 1),
  enrolment_open          boolean not null default false,  -- new members and referrals
  dashboard_open          boolean not null default true,   -- customers can read accounts
  ledger_writes_open      boolean not null default true,   -- rewards, redemptions, adjustments
  reward_per_household    bigint  not null default 200000 check (reward_per_household between 1 and 100000000),
  qualifying_lessons      int     not null default 8 check (qualifying_lessons between 1 and 100),
  max_redemption_per_pkg  bigint  not null default 400000 check (max_redemption_per_pkg between 1 and 100000000),
  terms_version           text    not null default 'FR-2026-10-pilot-v1',
  updated_at              timestamptz not null default now()
);
insert into family_rewards.settings default values;

create table family_rewards.owners (
  email      text primary key check (email = lower(email) and position('@' in email) > 1),
  added_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------- budget
-- One funded allocation. reserved = rewards held for attributed referrals not
-- yet posted; issued = rewards posted. reserved + issued <= funded always.
create table family_rewards.budget (
  id          int primary key default 1 check (id = 1),
  funded_vnd  bigint not null default 0 check (funded_vnd >= 0 and funded_vnd <= 1000000000),
  reserved_vnd bigint not null default 0 check (reserved_vnd >= 0),
  issued_vnd  bigint not null default 0 check (issued_vnd >= 0),
  updated_at  timestamptz not null default now(),
  constraint budget_not_oversubscribed check (reserved_vnd + issued_vnd <= funded_vnd)
);
insert into family_rewards.budget default values;

-- ---------------------------------------------------------------- identity
create table family_rewards.households (
  id          uuid primary key default gen_random_uuid(),
  alias       text not null unique,          -- neutral customer-facing label, e.g. "Family A7"
  created_at  timestamptz not null default now()
);

-- Private contact details. Only owner functions read this table.
create table family_rewards.private_contacts (
  household_id uuid primary key references family_rewards.households(id),
  full_name    text not null check (length(full_name) between 1 and 200),
  email        text check (email is null or (email = lower(email) and position('@' in email) > 1)),
  phone        text check (phone is null or length(phone) <= 40),
  updated_at   timestamptz not null default now()
);

create table family_rewards.members (
  id                 uuid primary key default gen_random_uuid(),
  household_id       uuid not null unique references family_rewards.households(id),
  login_email        text not null unique check (login_email = lower(login_email) and position('@' in login_email) > 1),
  email_verified_at  timestamptz,           -- set when the person first signs in with a link sent to login_email
  status             text not null default 'approved' check (status in ('approved', 'suspended')),
  referral_code      text not null unique check (referral_code ~ '^JE-[A-HJ-NP-Z2-9]{6}$'),
  terms_version      text not null,
  terms_accepted_at  timestamptz not null,
  approved_by        text not null,
  created_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------- packages and invoices
-- Eligible later eight-lesson packages that credit can be applied to.
create table family_rewards.packages (
  id             text primary key check (id ~ '^[A-Za-z0-9._-]{3,64}$'),
  household_id   uuid not null references family_rewards.households(id),
  lessons        int  not null check (lessons between 1 and 100),
  eligible       boolean not null,
  credit_cap_vnd bigint not null check (credit_cap_vnd between 0 and 100000000),  -- snapshot of the per-package cap
  committed_vnd  bigint not null default 0,                                        -- held + confirmed credit on this package
  created_at     timestamptz not null default now(),
  constraint package_cap check (committed_vnd >= 0 and committed_vnd <= credit_cap_vnd)
);

create table family_rewards.invoices (
  id              text primary key check (id ~ '^[A-Za-z0-9._-]{3,64}$'),
  package_id      text not null references family_rewards.packages(id),
  payable_vnd     bigint not null check (payable_vnd between 1 and 1000000000),
  committed_vnd   bigint not null default 0,      -- held + confirmed credit on this invoice
  status          text not null default 'open' check (status in ('open', 'cancelled')),
  created_at      timestamptz not null default now(),
  constraint invoice_not_over_credited check (committed_vnd >= 0 and committed_vnd <= payable_vnd)
);

-- ---------------------------------------------------------------- referrals
create table family_rewards.referrals (
  id                 uuid primary key default gen_random_uuid(),
  referrer_member_id uuid not null references family_rewards.members(id),
  new_household_id   uuid not null references family_rewards.households(id),
  package_ref        text not null check (package_ref ~ '^[A-Za-z0-9._-]{3,64}$'),
  code_declared_at   timestamptz not null,
  first_payment_at   timestamptz,
  terms_version      text not null,         -- snapshotted at attribution
  reward_vnd         bigint not null check (reward_vnd between 1 and 100000000),  -- snapshotted at attribution
  qualifying_lessons int not null check (qualifying_lessons between 1 and 100),   -- snapshotted at attribution
  lessons_paid       int not null default 0 check (lessons_paid between 0 and 100),
  lessons_completed  int not null default 0 check (lessons_completed between 0 and 100),
  payment_issue_open boolean not null default false,
  refunded           boolean not null default false,
  evidence_ref       text check (evidence_ref is null or length(evidence_ref) <= 200),
  status             text not null default 'attributed' check (status in ('attributed', 'qualified', 'credited', 'void')),
  qualified_at       timestamptz,
  credited_at        timestamptz,
  created_at         timestamptz not null default now(),
  constraint completed_le_paid check (lessons_completed <= lessons_paid),
  constraint payment_after_declaration check (first_payment_at is null or first_payment_at > code_declared_at)
);
-- One acquisition per new household (a void referral frees the household).
create unique index referrals_one_per_household on family_rewards.referrals (new_household_id) where status <> 'void';

-- ---------------------------------------------------------------- redemptions
create table family_rewards.redemptions (
  id           uuid primary key default gen_random_uuid(),
  member_id    uuid not null references family_rewards.members(id),
  package_id   text not null references family_rewards.packages(id),
  invoice_id   text not null references family_rewards.invoices(id),
  amount_vnd   bigint not null check (amount_vnd between 1 and 100000000),
  state        text not null default 'held' check (state in ('held', 'confirmed', 'released', 'reversed')),
  external_ref text check (external_ref is null or length(external_ref) <= 200),
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz
);
-- An invoice carries at most one active credit application.
create unique index redemptions_one_active_per_invoice on family_rewards.redemptions (invoice_id) where state in ('held', 'confirmed');

-- ---------------------------------------------------------------- ledger
create table family_rewards.ledger_entries (
  seq              bigserial primary key,
  id               uuid not null unique default gen_random_uuid(),
  member_id        uuid not null references family_rewards.members(id),
  amount_vnd       bigint not null check (amount_vnd <> 0 and amount_vnd between -100000000 and 100000000),
  entry_type       text not null check (entry_type in ('reward', 'redemption', 'redemption_reversal', 'adjustment', 'reversal', 'opening')),
  referral_id      uuid references family_rewards.referrals(id),
  redemption_id    uuid references family_rewards.redemptions(id),
  reverses_entry_id uuid unique references family_rewards.ledger_entries(id),
  actor            text not null,
  reason           text not null check (length(reason) between 1 and 500),
  posted_at        timestamptz not null default now(),
  constraint sign_by_type check (
    (entry_type = 'reward' and amount_vnd > 0 and referral_id is not null) or
    (entry_type = 'redemption' and amount_vnd < 0 and redemption_id is not null) or
    (entry_type = 'redemption_reversal' and amount_vnd > 0 and redemption_id is not null and reverses_entry_id is not null) or
    (entry_type = 'reversal' and reverses_entry_id is not null) or
    (entry_type in ('adjustment', 'opening'))
  )
);
-- One reward posting per referral; one redemption posting per redemption.
create unique index ledger_one_reward_per_referral on family_rewards.ledger_entries (referral_id) where entry_type = 'reward';
create unique index ledger_one_posting_per_redemption on family_rewards.ledger_entries (redemption_id) where entry_type = 'redemption';
create index ledger_member on family_rewards.ledger_entries (member_id, seq);
-- Imported established credit: at most one opening entry per member.
create unique index ledger_one_opening_per_member on family_rewards.ledger_entries (member_id) where entry_type = 'opening';

create function family_rewards.forbid_ledger_change() returns trigger
language plpgsql as $$
begin
  raise exception 'family_rewards.ledger_entries is append-only; post a compensating entry instead' using errcode = 'P0001';
end $$;
create trigger ledger_append_only before update or delete on family_rewards.ledger_entries
  for each row execute function family_rewards.forbid_ledger_change();
create trigger ledger_no_truncate before truncate on family_rewards.ledger_entries
  for each statement execute function family_rewards.forbid_ledger_change();

-- ---------------------------------------------------------------- idempotency, audit, auth
create table family_rewards.idempotency (
  key          text primary key check (length(key) between 8 and 100),
  operation    text not null,
  payload_hash text not null,
  result       jsonb,
  created_at   timestamptz not null default now()
);

create table family_rewards.audit_log (
  seq            bigserial primary key,
  actor          text not null,
  action         text not null,
  target         text,
  reason         text,
  correlation_id text,
  at             timestamptz not null default now()
);

create table family_rewards.login_tokens (
  token_hash  text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
  email       text not null check (email = lower(email)),
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index login_tokens_email on family_rewards.login_tokens (email, created_at);

create table family_rewards.sessions (
  token_hash  text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
  email       text not null,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now(),
  revoked_at  timestamptz
);

revoke all on all tables in schema family_rewards from public;
revoke all on all sequences in schema family_rewards from public;

-- ================================================================ internals
create function family_rewards._fail(p_code text, p_message text) returns void
language plpgsql as $$
begin
  raise exception '%', p_message using errcode = 'P0001', hint = p_code;
end $$;

-- Caller identity from a session token hash. Raises if invalid.
create function family_rewards._who(p_session text, p_require_owner boolean)
returns table (email text, is_owner boolean, member_id uuid)
language plpgsql stable as $$
declare v_email text;
begin
  select s.email into v_email from family_rewards.sessions s
   where s.token_hash = p_session and s.revoked_at is null and s.expires_at > now();
  if v_email is null then perform family_rewards._fail('unauthenticated', 'Sign in again.'); end if;
  email := v_email;
  is_owner := exists (select 1 from family_rewards.owners o where o.email = v_email);
  select m.id into member_id from family_rewards.members m
   where m.login_email = v_email and m.email_verified_at is not null and m.status = 'approved';
  if p_require_owner and not is_owner then perform family_rewards._fail('forbidden', 'Owner access only.'); end if;
  return next;
end $$;

-- Idempotency: returns the stored result for a repeated key+payload, raises on
-- a key reused with a different payload, or claims the key (returns null).
-- A concurrent duplicate blocks on the primary key until the first commits.
create function family_rewards._idem_claim(p_key text, p_operation text, p_payload jsonb) returns jsonb
language plpgsql as $$
declare v_hash text := encode(sha256(convert_to(p_operation || ':' || p_payload::text, 'UTF8')), 'hex');
        v_row family_rewards.idempotency;
begin
  if p_key is null or length(p_key) < 8 or length(p_key) > 100 then
    perform family_rewards._fail('invalid', 'Missing or malformed idempotency key.');
  end if;
  insert into family_rewards.idempotency (key, operation, payload_hash) values (p_key, p_operation, v_hash)
    on conflict (key) do nothing;
  if found then return null; end if;
  select * into v_row from family_rewards.idempotency where key = p_key;
  if v_row.operation <> p_operation or v_row.payload_hash <> v_hash then
    perform family_rewards._fail('idempotency_conflict', 'This request key was already used for a different request.');
  end if;
  return v_row.result;
end $$;

create function family_rewards._idem_store(p_key text, p_result jsonb) returns jsonb
language sql as $$
  update family_rewards.idempotency set result = p_result where key = p_key returning p_result;
$$;

create function family_rewards._audit(p_actor text, p_action text, p_target text, p_reason text, p_correlation text) returns void
language sql as $$
  insert into family_rewards.audit_log (actor, action, target, reason, correlation_id)
  values (p_actor, p_action, p_target, p_reason, p_correlation);
$$;

create function family_rewards._random_code(p_prefix text, p_len int) returns text
language plpgsql volatile as $$
declare alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; b bytea := uuid_send(gen_random_uuid()) || uuid_send(gen_random_uuid());
        out text := p_prefix; i int;
begin
  for i in 0 .. p_len - 1 loop
    out := out || substr(alphabet, (get_byte(b, i) % 32) + 1, 1);
  end loop;
  return out;
end $$;

create function family_rewards._new_household() returns uuid
language plpgsql as $$
declare v_id uuid; v_alias text; i int;
begin
  for i in 1 .. 20 loop
    v_alias := 'Family ' || substr(family_rewards._random_code('', 3), 1, 3);
    begin
      insert into family_rewards.households (alias) values (v_alias) returning id into v_id;
      return v_id;
    exception when unique_violation then null;
    end;
  end loop;
  perform family_rewards._fail('internal', 'Could not allocate a household alias.');
end $$;

create function family_rewards._check_reason(p_reason text) returns text
language plpgsql immutable as $$
begin
  if p_reason is null or length(btrim(p_reason)) < 3 or length(p_reason) > 500 then
    perform family_rewards._fail('invalid', 'A reason (3 to 500 characters) is required.');
  end if;
  return btrim(p_reason);
end $$;

create function family_rewards._check_amount(p_amount bigint) returns bigint
language plpgsql immutable as $$
begin
  if p_amount is null or p_amount < 1 or p_amount > 100000000 then
    perform family_rewards._fail('invalid', 'Amount must be a whole number of VND between 1 and 100,000,000.');
  end if;
  return p_amount;
end $$;

create function family_rewards._writes_open() returns void
language plpgsql as $$
begin
  if not (select ledger_writes_open from family_rewards.settings) then
    perform family_rewards._fail('paused', 'Credit changes are paused.');
  end if;
end $$;

create function family_rewards._balance(p_member uuid) returns table (posted bigint, held bigint)
language sql stable as $$
  select coalesce((select sum(amount_vnd) from family_rewards.ledger_entries where member_id = p_member), 0)::bigint,
         coalesce((select sum(amount_vnd) from family_rewards.redemptions where member_id = p_member and state = 'held'), 0)::bigint;
$$;

-- ================================================================ authentication
-- The application generates a random token, emails it, and stores only its hash.
create function family_rewards.fr_request_login(p_email text, p_token_hash text, p_ttl_minutes int)
returns jsonb language plpgsql security definer set search_path = pg_catalog, family_rewards as $$
declare v_email text := lower(btrim(p_email)); v_recent int;
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(v_email) > 254 then perform _fail('invalid', 'Enter a valid email address.'); end if;
  if p_ttl_minutes not between 5 and 60 then perform _fail('invalid', 'Bad token lifetime.'); end if;
  select count(*) into v_recent from login_tokens where email = v_email and created_at > now() - interval '1 hour';
  if v_recent >= 5 then perform _fail('rate_limited', 'Too many sign-in links. Try again later.'); end if;
  insert into login_tokens (token_hash, email, expires_at) values (p_token_hash, v_email, now() + make_interval(mins => p_ttl_minutes));
  -- Whether the address belongs to a member is not revealed.
  return jsonb_build_object('ok', true);
end $$;

create function family_rewards.fr_redeem_login(p_token_hash text, p_session_hash text, p_session_days int)
returns jsonb language plpgsql security definer set search_path = pg_catalog, family_rewards as $$
declare v_email text;
begin
  if p_session_days not between 1 and 30 then perform _fail('invalid', 'Bad session lifetime.'); end if;
  update login_tokens set used_at = now()
   where token_hash = p_token_hash and used_at is null and expires_at > now()
   returning email into v_email;
  if v_email is null then perform _fail('invalid_link', 'This sign-in link has expired or was already used.'); end if;
  insert into sessions (token_hash, email, expires_at) values (p_session_hash, v_email, now() + make_interval(days => p_session_days));
  -- Verified identity: the person controls the address the owner linked.
  update members set email_verified_at = coalesce(email_verified_at, now()) where login_email = v_email;
  perform _audit(v_email, 'sign_in', null, null, null);
  return jsonb_build_object('email', v_email,
    'is_owner', exists (select 1 from owners where email = v_email),
    'is_member', exists (select 1 from members where login_email = v_email and status = 'approved'));
end $$;

create function family_rewards.fr_sign_out(p_session text)
returns jsonb language sql security definer set search_path = pg_catalog, family_rewards as $$
  update sessions set revoked_at = now() where token_hash = p_session and revoked_at is null;
  select jsonb_build_object('ok', true);
$$;

-- ================================================================ customer view
-- Minimal projection: own code, own totals, aliases and generic statuses only.
create function family_rewards.fr_customer_account(p_session text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, family_rewards as $$
declare w record; m members; v_posted bigint; v_held bigint; v jsonb;
begin
  select * into w from _who(p_session, false);
  if not (select dashboard_open from settings) then perform _fail('paused', 'Accounts are temporarily unavailable.'); end if;
  if w.member_id is null then
    return jsonb_build_object('member', false, 'is_owner', w.is_owner);
  end if;
  select * into m from members where id = w.member_id;
  select posted, held into v_posted, v_held from _balance(m.id);
  select jsonb_build_object(
    'member', true,
    'is_owner', w.is_owner,
    'referral_code', m.referral_code,
    'terms_version', m.terms_version,
    'totals', jsonb_build_object(
      'earned',      coalesce((select sum(amount_vnd) from ledger_entries where member_id = m.id and entry_type in ('reward', 'opening')), 0),
      'used',        coalesce((select -sum(amount_vnd) from ledger_entries where member_id = m.id and entry_type in ('redemption', 'redemption_reversal')), 0),
      'adjustments', coalesce((select sum(amount_vnd) from ledger_entries where member_id = m.id and entry_type in ('adjustment', 'reversal')), 0),
      'posted',      v_posted,
      'held',        v_held,
      'available',   v_posted - v_held,
      'pending',     coalesce((select sum(reward_vnd) from referrals where referrer_member_id = m.id and status in ('attributed', 'qualified')), 0)),
    'referrals', coalesce((select jsonb_agg(jsonb_build_object(
        'family', h.alias,
        'since', to_char(r.code_declared_at at time zone 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD'),
        'status', case r.status when 'credited' then 'credited' when 'void' then 'not eligible' else 'awaiting verification' end,
        'reward', r.reward_vnd) order by r.code_declared_at)
      from referrals r join households h on h.id = r.new_household_id where r.referrer_member_id = m.id), '[]'::jsonb),
    'history', coalesce((select jsonb_agg(jsonb_build_object(
        'date', to_char(e.posted_at at time zone 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD'),
        'type', e.entry_type,
        'amount', e.amount_vnd,
        'family', (select h.alias from referrals r join households h on h.id = r.new_household_id where r.id = e.referral_id),
        'invoice', (select d.invoice_id from redemptions d where d.id = e.redemption_id)) order by e.seq)
      from ledger_entries e where e.member_id = m.id), '[]'::jsonb),
    'holds', coalesce((select jsonb_agg(jsonb_build_object('invoice', d.invoice_id, 'amount', d.amount_vnd, 'since',
        to_char(d.created_at at time zone 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD'))) from redemptions d where d.member_id = m.id and d.state = 'held'), '[]'::jsonb)
  ) into v;
  return v;
end $$;

-- ================================================================ owner operations
create function family_rewards.fr_owner_set_budget(p_session text, p_key text, p_funded_vnd bigint, p_reason text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, family_rewards as $$
declare w record; r jsonb; b budget;
begin
  select * into w from _who(p_session, true);
  r := _idem_claim(p_key, 'set_budget', jsonb_build_object('funded', p_funded_vnd, 'reason', p_reason));
  if r is not null then return r; end if;
  if p_funded_vnd is null or p_funded_vnd < 0 or p_funded_vnd > 1000000000 then perform _fail('invalid', 'Budget must be between 0 and 1,000,000,000 VND.'); end if;
  select * into b from budget where id = 1 for update;
  if p_funded_vnd < b.reserved_vnd + b.issued_vnd then perform _fail('invalid', 'Budget cannot drop below rewards already committed.'); end if;
  update budget set funded_vnd = p_funded_vnd, updated_at = now() where id = 1;
  perform _audit(w.email, 'set_budget', p_funded_vnd::text, _check_reason(p_reason), p_key);
  return _idem_store(p_key, jsonb_build_object('funded', p_funded_vnd));
end $$;

create function family_rewards.fr_owner_set_flags(p_session text, p_key text, p_enrolment boolean, p_dashboard boolean, p_writes boolean, p_reason text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, family_rewards as $$
declare w record; r jsonb;
begin
  select * into w from _who(p_session, true);
  r := _idem_claim(p_key, 'set_flags', jsonb_build_object('e', p_enrolment, 'd', p_dashboard, 'w', p_writes, 'reason', p_reason));
  if r is not null then return r; end if;
  update settings set enrolment_open = p_enrolment, dashboard_open = p_dashboard, ledger_writes_open = p_writes, updated_at = now();
  perform _audit(w.email, 'set_flags', format('enrolment=%s dashboard=%s writes=%s', p_enrolment, p_dashboard, p_writes), _check_reason(p_reason), p_key);
  return _idem_store(p_key, jsonb_build_object('enrolment', p_enrolment, 'dashboard', p_dashboard, 'writes', p_writes));
end $$;

-- Approve an applicant after owner review: creates the household, private
-- contact and member with a random code. The member's data becomes visible to
-- them only after they sign in with a link sent to p_login_email.
create function family_rewards.fr_owner_approve_member(p_session text, p_key text, p_full_name text, p_login_email text,
  p_phone text, p_terms_version text, p_terms_accepted_at timestamptz, p_reason text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, family_rewards as $$
declare w record; r jsonb; v_hh uuid; v_member uuid; v_code text; i int; v_email text := lower(btrim(p_login_email));
begin
  select * into w from _who(p_session, true);
  r := _idem_claim(p_key, 'approve_member', jsonb_build_object('n', p_full_name, 'e', v_email, 'p', p_phone, 't', p_terms_version, 'a', p_terms_accepted_at, 'reason', p_reason));
  if r is not null then return r; end if;
  if not (select enrolment_open from settings) then perform _fail('paused', 'New enrolment is closed.'); end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then perform _fail('invalid', 'Enter a valid email address.'); end if;
  if p_terms_version is distinct from (select terms_version from settings) then perform _fail('invalid', 'Terms version does not match the current terms.'); end if;
  if p_terms_accepted_at is null or p_terms_accepted_at > now() + interval '5 minutes' or p_terms_accepted_at < timestamptz '2026-10-01' then
    perform _fail('invalid', 'Terms acceptance time is not plausible.');
  end if;
  if exists (select 1 from members where login_email = v_email) then perform _fail('duplicate', 'That email already has a membership.'); end if;
  v_hh := _new_household();
  insert into private_contacts (household_id, full_name, email, phone) values (v_hh, btrim(p_full_name), v_email, nullif(btrim(p_phone), ''));
  for i in 1 .. 20 loop
    v_code := _random_code('JE-', 6);
    begin
      insert into members (household_id, login_email, referral_code, terms_version, terms_accepted_at, approved_by)
      values (v_hh, v_email, v_code, p_terms_version, p_terms_accepted_at, w.email) returning id into v_member;
      exit;
    exception when unique_violation then
      if exists (select 1 from members where login_email = v_email) then raise; end if;
    end;
  end loop;
  if v_member is null then perform _fail('internal', 'Could not issue a unique code.'); end if;
  perform _audit(w.email, 'approve_member', v_member::text, _check_reason(p_reason), p_key);
  return _idem_store(p_key, jsonb_build_object('member_id', v_member, 'household_id', v_hh, 'referral_code', v_code));
end $$;

-- Record a referral declared before the first package payment and reserve its
-- reward against the funded allocation. Terms and reward are snapshotted.
create function family_rewards.fr_owner_record_referral(p_session text, p_key text, p_referral_code text,
  p_new_full_name text, p_new_email text, p_new_phone text, p_package_ref text, p_code_declared_at timestamptz, p_reason text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, family_rewards as $$
declare w record; r jsonb; s settings; ref_m members; v_hh uuid; v_ref uuid; v_email text := nullif(lower(btrim(p_new_email)), '');
begin
  select * into w from _who(p_session, true);
  r := _idem_claim(p_key, 'record_referral', jsonb_build_object('c', p_referral_code, 'n', p_new_full_name, 'e', v_email, 'p', p_new_phone,
        'k', p_package_ref, 'd', p_code_declared_at, 'reason', p_reason));
  if r is not null then return r; end if;
  select * into s from settings;
  if not s.enrolment_open then perform _fail('paused', 'New referrals are closed.'); end if;
  if p_code_declared_at is null or p_code_declared_at > now() + interval '5 minutes' or p_code_declared_at < timestamptz '2026-10-01' then
    perform _fail('invalid', 'Code declaration time is not plausible.');
  end if;
  select * into ref_m from members where referral_code = upper(btrim(p_referral_code)) for share;
  if ref_m.id is null or ref_m.status <> 'approved' then perform _fail('invalid', 'Unknown or inactive referral code.'); end if;
  if v_email is not null and (v_email = ref_m.login_email or exists (select 1 from private_contacts c where c.household_id = ref_m.household_id and c.email = v_email)) then
    perform _fail('self_referral', 'A household cannot refer itself.');
  end if;
  if v_email is not null and exists (select 1 from members m where m.login_email = v_email) then
    perform _fail('not_new', 'That family is already an academy member household.');
  end if;
  if v_email is not null and exists (select 1 from private_contacts c join referrals x on x.new_household_id = c.household_id
                                     where c.email = v_email and x.status <> 'void') then
    perform _fail('duplicate', 'That family has already been referred; the earliest valid code stands.');
  end if;
  -- Funded reservation: lock the budget row; the CHECK makes oversubscription impossible.
  perform 1 from budget where id = 1 for update;
  if (select reserved_vnd + issued_vnd + s.reward_per_household > funded_vnd from budget where id = 1) then
    perform _fail('budget_exhausted', 'The funded reward allocation is fully committed; no new qualifying referrals can be accepted.');
  end if;
  update budget set reserved_vnd = reserved_vnd + s.reward_per_household, updated_at = now() where id = 1;
  v_hh := _new_household();
  insert into private_contacts (household_id, full_name, email, phone) values (v_hh, btrim(p_new_full_name), v_email, nullif(btrim(p_new_phone), ''));
  insert into referrals (referrer_member_id, new_household_id, package_ref, code_declared_at, terms_version, reward_vnd, qualifying_lessons)
  values (ref_m.id, v_hh, p_package_ref, p_code_declared_at, s.terms_version, s.reward_per_household, s.qualifying_lessons)
  returning id into v_ref;
  perform _audit(w.email, 'record_referral', v_ref::text, _check_reason(p_reason), p_key);
  return _idem_store(p_key, jsonb_build_object('referral_id', v_ref, 'new_household_id', v_hh, 'reserved', s.reward_per_household));
end $$;

-- Record evidence (owner-entered references; teaching, attendance and payment
-- systems are not modified). first_payment_at, once set, cannot change.
create function family_rewards.fr_owner_update_evidence(p_session text, p_key text, p_referral uuid, p_first_payment_at timestamptz,
  p_lessons_paid int, p_lessons_completed int, p_payment_issue_open boolean, p_refunded boolean, p_evidence_ref text, p_reason text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, family_rewards as $$
declare w record; r jsonb; x referrals;
begin
  select * into w from _who(p_session, true);
  r := _idem_claim(p_key, 'update_evidence', jsonb_build_object('r', p_referral, 'f', p_first_payment_at, 'p', p_lessons_paid, 'c', p_lessons_completed,
        'i', p_payment_issue_open, 'x', p_refunded, 'e', p_evidence_ref, 'reason', p_reason));
  if r is not null then return r; end if;
  select * into x from referrals where id = p_referral for update;
  if x.id is null then perform _fail('not_found', 'Unknown referral.'); end if;
  if x.status in ('credited', 'void') then perform _fail('closed', 'This referral is closed.'); end if;
  if x.first_payment_at is not null and p_first_payment_at is distinct from x.first_payment_at then
    perform _fail('immutable', 'The first payment time is already recorded and cannot change.');
  end if;
  if p_first_payment_at is not null and p_first_payment_at > now() + interval '5 minutes' then perform _fail('invalid', 'Payment time is in the future.'); end if;
  if p_first_payment_at is not null and p_first_payment_at <= x.code_declared_at then
    perform _fail('late_code', 'The code was declared after the first payment, so this referral cannot qualify.');
  end if;
  if p_lessons_paid is null or p_lessons_completed is null or p_lessons_paid not between 0 and 100 or p_lessons_completed not between 0 and p_lessons_paid then
    perform _fail('invalid', 'Lesson counts are not valid.');
  end if;
  update referrals set first_payment_at = p_first_payment_at, lessons_paid = p_lessons_paid, lessons_completed = p_lessons_completed,
         payment_issue_open = coalesce(p_payment_issue_open, false), refunded = coalesce(p_refunded, false),
         evidence_ref = nullif(btrim(p_evidence_ref), ''),
         -- Any change of evidence invalidates an earlier qualification approval.
         status = 'attributed', qualified_at = null
   where id = p_referral;
  perform _audit(w.email, 'update_evidence', p_referral::text, _check_reason(p_reason), p_key);
  return _idem_store(p_key, jsonb_build_object('referral_id', p_referral, 'status', 'attributed'));
end $$;

create function family_rewards._qualifies(x family_rewards.referrals) returns text
language sql immutable as $$
  select case
    when x.first_payment_at is null then 'No first payment recorded.'
    when x.first_payment_at <= x.code_declared_at then 'Code declared after first payment.'
    when x.refunded then 'Refunded before qualification.'
    when x.payment_issue_open then 'An unresolved payment or refund issue is open.'
    when x.lessons_paid < x.qualifying_lessons then 'Not all qualifying lessons are paid.'
    when x.lessons_completed < x.qualifying_lessons then 'Not all qualifying lessons are completed.'
    else null end;
$$;

create function family_rewards.fr_owner_qualify(p_session text, p_key text, p_referral uuid, p_reason text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, family_rewards as $$
declare w record; r jsonb; x referrals; v_why text;
begin
  select * into w from _who(p_session, true);
  r := _idem_claim(p_key, 'qualify', jsonb_build_object('r', p_referral, 'reason', p_reason));
  if r is not null then return r; end if;
  select * into x from referrals where id = p_referral for update;
  if x.id is null then perform _fail('not_found', 'Unknown referral.'); end if;
  if x.status <> 'attributed' then perform _fail('state', 'Only an attributed referral can be qualified.'); end if;
  v_why := _qualifies(x);
  if v_why is not null then perform _fail('not_qualified', v_why); end if;
  update referrals set status = 'qualified', qualified_at = now() where id = p_referral;
  perform _audit(w.email, 'qualify', p_referral::text, _check_reason(p_reason), p_key);
  return _idem_store(p_key, jsonb_build_object('referral_id', p_referral, 'status', 'qualified'));
end $$;

-- Post the snapshotted reward. Re-validates evidence under lock, so a refund or
-- dispute recorded after qualification blocks the posting.
create function family_rewards.fr_owner_post_reward(p_session text, p_key text, p_referral uuid, p_reason text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, family_rewards as $$
declare w record; r jsonb; x referrals; v_why text; v_entry uuid;
begin
  select * into w from _who(p_session, true);
  r := _idem_claim(p_key, 'post_reward', jsonb_build_object('r', p_referral, 'reason', p_reason));
  if r is not null then return r; end if;
  perform _writes_open();
  select * into x from referrals where id = p_referral for update;
  if x.id is null then perform _fail('not_found', 'Unknown referral.'); end if;
  if x.status = 'credited' then perform _fail('already_credited', 'This referral has already been credited.'); end if;
  if x.status <> 'qualified' then perform _fail('state', 'Approve qualification first.'); end if;
  v_why := _qualifies(x);
  if v_why is not null then perform _fail('not_qualified', v_why); end if;
  insert into ledger_entries (member_id, amount_vnd, entry_type, referral_id, actor, reason)
  values (x.referrer_member_id, x.reward_vnd, 'reward', x.id, w.email, _check_reason(p_reason)) returning id into v_entry;
  update referrals set status = 'credited', credited_at = now() where id = x.id;
  -- Convert the reservation into an issued reward: same commitment, no second charge.
  update budget set reserved_vnd = reserved_vnd - x.reward_vnd, issued_vnd = issued_vnd + x.reward_vnd, updated_at = now() where id = 1;
  perform _audit(w.email, 'post_reward', x.id::text, p_reason, p_key);
  return _idem_store(p_key, jsonb_build_object('entry_id', v_entry, 'amount', x.reward_vnd));
end $$;

-- Void an unearned referral (refund, cancellation, ineligible) and release its reservation.
create function family_rewards.fr_owner_void_referral(p_session text, p_key text, p_referral uuid, p_reason text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, family_rewards as $$
declare w record; r jsonb; x referrals;
begin
  select * into w from _who(p_session, true);
  r := _idem_claim(p_key, 'void_referral', jsonb_build_object('r', p_referral, 'reason', p_reason));
  if r is not null then return r; end if;
  select * into x from referrals where id = p_referral for update;
  if x.id is null then perform _fail('not_found', 'Unknown referral.'); end if;
  if x.status = 'credited' then perform _fail('state', 'A credited referral is reversed with a ledger reversal, not voided.'); end if;
  if x.status = 'void' then perform _fail('state', 'Already void.'); end if;
  update referrals set status = 'void' where id = x.id;
  update budget set reserved_vnd = reserved_vnd - x.reward_vnd, updated_at = now() where id = 1;
  perform _audit(w.email, 'void_referral', x.id::text, _check_reason(p_reason), p_key);
  return _idem_store(p_key, jsonb_build_object('referral_id', x.id, 'status', 'void', 'released', x.reward_vnd));
end $$;

create function family_rewards.fr_owner_register_invoice(p_session text, p_key text, p_package_id text, p_member uuid,
  p_lessons int, p_eligible boolean, p_invoice_id text, p_payable_vnd bigint, p_reason text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, family_rewards as $$
declare w record; r jsonb; m members; p packages; s settings;
begin
  select * into w from _who(p_session, true);
  r := _idem_claim(p_key, 'register_invoice', jsonb_build_object('k', p_package_id, 'm', p_member, 'l', p_lessons, 'e', p_eligible,
        'i', p_invoice_id, 'v', p_payable_vnd, 'reason', p_reason));
  if r is not null then return r; end if;
  select * into s from settings;
  select * into m from members where id = p_member;
  if m.id is null then perform _fail('not_found', 'Unknown member.'); end if;
  if p_payable_vnd is null or p_payable_vnd < 1 or p_payable_vnd > 1000000000 then perform _fail('invalid', 'Payable amount is not valid.'); end if;
  select * into p from packages where id = p_package_id for update;
  if p.id is null then
    insert into packages (id, household_id, lessons, eligible, credit_cap_vnd)
    values (p_package_id, m.household_id, p_lessons, coalesce(p_eligible, false) and p_lessons = s.qualifying_lessons, s.max_redemption_per_pkg);
  elsif p.household_id <> m.household_id then
    perform _fail('forbidden', 'That package belongs to another household.');
  end if;
  insert into invoices (id, package_id, payable_vnd) values (p_invoice_id, p_package_id, p_payable_vnd);
  perform _audit(w.email, 'register_invoice', p_invoice_id, _check_reason(p_reason), p_key);
  return _idem_store(p_key, jsonb_build_object('package_id', p_package_id, 'invoice_id', p_invoice_id));
end $$;

-- Hold credit against an invoice. Verifies, under row locks: the invoice's
-- package belongs to the member's household and is eligible, the invoice is
-- open with enough payable left, the package cap is not exceeded across all
-- its invoices, and the member's available balance covers the amount.
create function family_rewards.fr_owner_hold_redemption(p_session text, p_key text, p_member uuid, p_invoice_id text, p_amount_vnd bigint, p_reason text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, family_rewards as $$
declare w record; r jsonb; m members; i invoices; p packages; v_posted bigint; v_held bigint; v_id uuid;
begin
  select * into w from _who(p_session, true);
  r := _idem_claim(p_key, 'hold_redemption', jsonb_build_object('m', p_member, 'i', p_invoice_id, 'a', p_amount_vnd, 'reason', p_reason));
  if r is not null then return r; end if;
  perform _writes_open();
  perform _check_amount(p_amount_vnd);
  select * into m from members where id = p_member for update;          -- serialises spending per member
  if m.id is null then perform _fail('not_found', 'Unknown member.'); end if;
  select * into i from invoices where id = p_invoice_id for update;
  if i.id is null then perform _fail('not_found', 'Unknown invoice.'); end if;
  select * into p from packages where id = i.package_id for update;     -- serialises the package cap
  if p.household_id <> m.household_id then perform _fail('forbidden', 'That invoice belongs to another household.'); end if;
  if not p.eligible then perform _fail('not_eligible', 'This package does not take part in Family Rewards.'); end if;
  if i.status <> 'open' then perform _fail('not_eligible', 'This invoice is not open.'); end if;
  if i.committed_vnd + p_amount_vnd > i.payable_vnd then perform _fail('over_invoice', 'Credit cannot exceed the amount payable on the invoice.'); end if;
  if p.committed_vnd + p_amount_vnd > p.credit_cap_vnd then perform _fail('over_cap', format('At most %s VND of credit per package.', p.credit_cap_vnd)); end if;
  select posted, held into v_posted, v_held from _balance(m.id);
  if p_amount_vnd > v_posted - v_held then perform _fail('insufficient', 'Not enough available credit.'); end if;
  insert into redemptions (member_id, package_id, invoice_id, amount_vnd) values (m.id, p.id, i.id, p_amount_vnd) returning id into v_id;
  update packages set committed_vnd = committed_vnd + p_amount_vnd where id = p.id;
  update invoices set committed_vnd = committed_vnd + p_amount_vnd where id = i.id;
  perform _audit(w.email, 'hold_redemption', v_id::text, _check_reason(p_reason), p_key);
  return _idem_store(p_key, jsonb_build_object('redemption_id', v_id, 'state', 'held', 'amount', p_amount_vnd));
end $$;

-- Confirm after the discount has actually reached the invoice (external reference required).
create function family_rewards.fr_owner_confirm_redemption(p_session text, p_key text, p_redemption uuid, p_external_ref text, p_reason text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, family_rewards as $$
declare w record; r jsonb; d redemptions; v_entry uuid;
begin
  select * into w from _who(p_session, true);
  r := _idem_claim(p_key, 'confirm_redemption', jsonb_build_object('d', p_redemption, 'x', p_external_ref, 'reason', p_reason));
  if r is not null then return r; end if;
  perform _writes_open();
  if p_external_ref is null or length(btrim(p_external_ref)) < 3 then perform _fail('invalid', 'Record the invoice reference the discount was applied to.'); end if;
  select * into d from redemptions where id = p_redemption for update;
  if d.id is null then perform _fail('not_found', 'Unknown redemption.'); end if;
  if d.state <> 'held' then perform _fail('state', 'Only a held redemption can be confirmed.'); end if;
  insert into ledger_entries (member_id, amount_vnd, entry_type, redemption_id, actor, reason)
  values (d.member_id, -d.amount_vnd, 'redemption', d.id, w.email, _check_reason(p_reason)) returning id into v_entry;
  update redemptions set state = 'confirmed', external_ref = btrim(p_external_ref), resolved_at = now() where id = d.id;
  perform _audit(w.email, 'confirm_redemption', d.id::text, p_reason, p_key);
  return _idem_store(p_key, jsonb_build_object('redemption_id', d.id, 'state', 'confirmed', 'entry_id', v_entry));
end $$;

-- Release a hold when applying the credit to the invoice failed. No credit is lost.
create function family_rewards.fr_owner_release_redemption(p_session text, p_key text, p_redemption uuid, p_reason text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, family_rewards as $$
declare w record; r jsonb; d redemptions;
begin
  select * into w from _who(p_session, true);
  r := _idem_claim(p_key, 'release_redemption', jsonb_build_object('d', p_redemption, 'reason', p_reason));
  if r is not null then return r; end if;
  select * into d from redemptions where id = p_redemption for update;
  if d.id is null then perform _fail('not_found', 'Unknown redemption.'); end if;
  if d.state <> 'held' then perform _fail('state', 'Only a held redemption can be released.'); end if;
  update redemptions set state = 'released', resolved_at = now() where id = d.id;
  update packages set committed_vnd = committed_vnd - d.amount_vnd where id = d.package_id;
  update invoices set committed_vnd = committed_vnd - d.amount_vnd where id = d.invoice_id;
  perform _audit(w.email, 'release_redemption', d.id::text, _check_reason(p_reason), p_key);
  return _idem_store(p_key, jsonb_build_object('redemption_id', d.id, 'state', 'released'));
end $$;

-- A credited invoice was cancelled: restore the credit exactly once with a
-- linked compensating entry. Never converted to cash.
create function family_rewards.fr_owner_reverse_redemption(p_session text, p_key text, p_redemption uuid, p_reason text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, family_rewards as $$
declare w record; r jsonb; d redemptions; e ledger_entries; v_entry uuid;
begin
  select * into w from _who(p_session, true);
  r := _idem_claim(p_key, 'reverse_redemption', jsonb_build_object('d', p_redemption, 'reason', p_reason));
  if r is not null then return r; end if;
  perform _writes_open();
  select * into d from redemptions where id = p_redemption for update;
  if d.id is null then perform _fail('not_found', 'Unknown redemption.'); end if;
  if d.state <> 'confirmed' then perform _fail('state', 'Only a confirmed redemption can be reversed.'); end if;
  select * into e from ledger_entries where redemption_id = d.id and entry_type = 'redemption';
  insert into ledger_entries (member_id, amount_vnd, entry_type, redemption_id, reverses_entry_id, actor, reason)
  values (d.member_id, -e.amount_vnd, 'redemption_reversal', d.id, e.id, w.email, _check_reason(p_reason)) returning id into v_entry;
  update redemptions set state = 'reversed', resolved_at = now() where id = d.id;
  update packages set committed_vnd = committed_vnd - d.amount_vnd where id = d.package_id;
  update invoices set committed_vnd = committed_vnd - d.amount_vnd, status = 'cancelled' where id = d.invoice_id;
  perform _audit(w.email, 'reverse_redemption', d.id::text, p_reason, p_key);
  return _idem_store(p_key, jsonb_build_object('redemption_id', d.id, 'state', 'reversed', 'entry_id', v_entry));
end $$;

-- Documented correction. Reversing a reward or adjustment links to it (once).
create function family_rewards.fr_owner_adjust(p_session text, p_key text, p_member uuid, p_amount_vnd bigint, p_reverses_entry uuid, p_reason text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, family_rewards as $$
declare w record; r jsonb; m members; e ledger_entries; v_amount bigint := p_amount_vnd; v_type text := 'adjustment';
        v_posted bigint; v_held bigint; v_entry uuid;
begin
  select * into w from _who(p_session, true);
  r := _idem_claim(p_key, 'adjust', jsonb_build_object('m', p_member, 'a', p_amount_vnd, 'x', p_reverses_entry, 'reason', p_reason));
  if r is not null then return r; end if;
  perform _writes_open();
  select * into m from members where id = p_member for update;
  if m.id is null then perform _fail('not_found', 'Unknown member.'); end if;
  if p_reverses_entry is not null then
    select * into e from ledger_entries where id = p_reverses_entry;
    if e.id is null or e.member_id <> m.id or e.entry_type not in ('reward', 'adjustment', 'opening') then
      perform _fail('invalid', 'Only this member''s reward, adjustment or opening entry can be reversed.');
    end if;
    v_amount := -e.amount_vnd; v_type := 'reversal';
  else
    if v_amount is null or v_amount = 0 or abs(v_amount) > 100000000 then perform _fail('invalid', 'Adjustment must be a non-zero whole number of VND.'); end if;
  end if;
  select posted, held into v_posted, v_held from _balance(m.id);
  if v_posted - v_held + v_amount < 0 then perform _fail('insufficient', 'This correction would make the available balance negative.'); end if;
  insert into ledger_entries (member_id, amount_vnd, entry_type, reverses_entry_id, actor, reason)
  values (m.id, v_amount, v_type, p_reverses_entry, w.email, _check_reason(p_reason)) returning id into v_entry;
  perform _audit(w.email, v_type, v_entry::text, p_reason, p_key);
  return _idem_store(p_key, jsonb_build_object('entry_id', v_entry, 'type', v_type, 'amount', v_amount));
end $$;

-- Import an established (pre-ledger) credit as an explicit opening transaction.
-- Positive only, once per member, with the source record cited in the reason.
create function family_rewards.fr_owner_opening_balance(p_session text, p_key text, p_member uuid, p_amount_vnd bigint, p_source_ref text, p_reason text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, family_rewards as $$
declare w record; r jsonb; m members; v_entry uuid;
begin
  select * into w from _who(p_session, true);
  r := _idem_claim(p_key, 'opening_balance', jsonb_build_object('m', p_member, 'a', p_amount_vnd, 's', p_source_ref, 'reason', p_reason));
  if r is not null then return r; end if;
  perform _writes_open();
  perform _check_amount(p_amount_vnd);
  if p_source_ref is null or length(btrim(p_source_ref)) < 3 then perform _fail('invalid', 'Cite the record the opening balance comes from.'); end if;
  select * into m from members where id = p_member for update;
  if m.id is null then perform _fail('not_found', 'Unknown member.'); end if;
  if exists (select 1 from ledger_entries where member_id = m.id and entry_type = 'opening') then
    perform _fail('duplicate', 'This member already has an opening balance.');
  end if;
  insert into ledger_entries (member_id, amount_vnd, entry_type, actor, reason)
  values (m.id, p_amount_vnd, 'opening', w.email, _check_reason(p_reason) || ' [source: ' || btrim(p_source_ref) || ']') returning id into v_entry;
  perform _audit(w.email, 'opening_balance', v_entry::text, p_reason, p_key);
  return _idem_store(p_key, jsonb_build_object('entry_id', v_entry, 'amount', p_amount_vnd));
end $$;

-- Owner overview and export (full identity: owner only).
create function family_rewards.fr_owner_overview(p_session text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, family_rewards as $$
declare w record;
begin
  select * into w from _who(p_session, true);
  return jsonb_build_object(
    'settings', (select to_jsonb(s) from settings s),
    'budget', (select to_jsonb(b) from budget b),
    'members', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'code', m.referral_code, 'name', c.full_name, 'login_email', m.login_email,
        'phone', c.phone, 'verified', m.email_verified_at is not null, 'status', m.status, 'alias', h.alias,
        'posted', (select posted from _balance(m.id)), 'held', (select held from _balance(m.id))) order by m.created_at)
      from members m join households h on h.id = m.household_id join private_contacts c on c.household_id = m.household_id), '[]'::jsonb),
    'referrals', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'referrer_code', m.referral_code, 'family', h.alias, 'name', c.full_name,
        'email', c.email, 'package_ref', x.package_ref, 'declared', x.code_declared_at, 'first_payment', x.first_payment_at,
        'paid', x.lessons_paid, 'completed', x.lessons_completed, 'issue_open', x.payment_issue_open, 'refunded', x.refunded,
        'evidence', x.evidence_ref, 'status', x.status, 'reward', x.reward_vnd, 'terms', x.terms_version) order by x.created_at)
      from referrals x join members m on m.id = x.referrer_member_id join households h on h.id = x.new_household_id
      join private_contacts c on c.household_id = x.new_household_id), '[]'::jsonb),
    'redemptions', coalesce((select jsonb_agg(jsonb_build_object('id', d.id, 'code', m.referral_code, 'package', d.package_id, 'invoice', d.invoice_id,
        'amount', d.amount_vnd, 'state', d.state, 'external_ref', d.external_ref) order by d.created_at)
      from redemptions d join members m on m.id = d.member_id), '[]'::jsonb),
    'invoices', coalesce((select jsonb_agg(jsonb_build_object('id', i.id, 'package', i.package_id, 'payable', i.payable_vnd, 'committed', i.committed_vnd,
        'status', i.status, 'package_committed', p.committed_vnd, 'package_cap', p.credit_cap_vnd, 'eligible', p.eligible) order by i.created_at)
      from invoices i join packages p on p.id = i.package_id), '[]'::jsonb),
    'ledger', coalesce((select jsonb_agg(jsonb_build_object('id', e.id, 'code', m.referral_code, 'type', e.entry_type, 'amount', e.amount_vnd,
        'actor', e.actor, 'reason', e.reason, 'at', e.posted_at) order by e.seq)
      from ledger_entries e join members m on m.id = e.member_id), '[]'::jsonb),
    'audit', coalesce((select jsonb_agg(to_jsonb(a) order by a.seq desc) from (select * from audit_log order by seq desc limit 200) a), '[]'::jsonb),
    'reconciliation', jsonb_build_object(
      'ledger_total', coalesce((select sum(amount_vnd) from ledger_entries), 0),
      'rewards_posted', coalesce((select sum(amount_vnd) from ledger_entries where entry_type = 'reward'), 0),
      'budget_issued', (select issued_vnd from budget),
      'reserved_open', coalesce((select sum(reward_vnd) from referrals where status in ('attributed', 'qualified')), 0),
      'budget_reserved', (select reserved_vnd from budget)));
end $$;

-- ================================================================ privileges
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'fr_app') then
    create role fr_app nologin;   -- the release step grants LOGIN with a password the owner sets
  end if;
end $$;
grant usage on schema family_rewards to fr_app;
revoke all on all functions in schema family_rewards from public;
grant execute on function
  family_rewards.fr_request_login(text, text, int),
  family_rewards.fr_redeem_login(text, text, int),
  family_rewards.fr_sign_out(text),
  family_rewards.fr_customer_account(text),
  family_rewards.fr_owner_set_budget(text, text, bigint, text),
  family_rewards.fr_owner_set_flags(text, text, boolean, boolean, boolean, text),
  family_rewards.fr_owner_approve_member(text, text, text, text, text, text, timestamptz, text),
  family_rewards.fr_owner_record_referral(text, text, text, text, text, text, text, timestamptz, text),
  family_rewards.fr_owner_update_evidence(text, text, uuid, timestamptz, int, int, boolean, boolean, text, text),
  family_rewards.fr_owner_qualify(text, text, uuid, text),
  family_rewards.fr_owner_post_reward(text, text, uuid, text),
  family_rewards.fr_owner_void_referral(text, text, uuid, text),
  family_rewards.fr_owner_register_invoice(text, text, text, uuid, int, boolean, text, bigint, text),
  family_rewards.fr_owner_hold_redemption(text, text, uuid, text, bigint, text),
  family_rewards.fr_owner_confirm_redemption(text, text, uuid, text, text),
  family_rewards.fr_owner_release_redemption(text, text, uuid, text),
  family_rewards.fr_owner_reverse_redemption(text, text, uuid, text),
  family_rewards.fr_owner_adjust(text, text, uuid, bigint, uuid, text),
  family_rewards.fr_owner_opening_balance(text, text, uuid, bigint, text, text),
  family_rewards.fr_owner_overview(text)
to fr_app;
