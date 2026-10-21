-- Down for 20261021000001_family_rewards_ledger.sql.
-- DESTRUCTIVE: removes every Family Rewards account, referral and credit record.
-- Refuses to run while any ledger entry exists, so earned balances can never be
-- dropped by a routine rollback. Export first (owner export) if ever needed.
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'family_rewards' and table_name = 'ledger_entries')
     and exists (select 1 from family_rewards.ledger_entries) then
    raise exception 'family_rewards has posted ledger entries; refusing to drop. Hide the feature with flags instead.';
  end if;
end $$;
drop schema if exists family_rewards cascade;
drop role if exists fr_app;
