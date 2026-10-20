# Family Rewards accounts and ledger: runbook

This extends the Family Rewards pilot (`docs/family-rewards-pilot.md`, PR #171) with:
- persistent member accounts;
- an append-only credit ledger;
- a customer dashboard at `/student-academy/referrals/account`;
- owner administration at `/student-academy/referrals/account/admin`.

## How it fits together

| Layer | What | Where |
|---|---|---|
| Database | Schema `family_rewards` in the Jurassic English Supabase project. Members, private contacts, referrals (with snapshotted terms and reward), packages, invoices, redemptions, the append-only ledger, idempotency, audit, login tokens and sessions | `supabase/migrations/20261021000001_family_rewards_ledger.sql` (down: `…_down.sql`) |
| Money rules | One `SECURITY DEFINER` function per operation, each running in one transaction with row locks, unique indexes and CHECK constraints | same file |
| Database boundary | Role `fr_app` has `EXECUTE` on the `fr_*` functions only and no table privileges. Every function resolves the caller from a hashed session token, so the app cannot act as a member or as the owner without that person's session | same file |
| App path | `src/lib/familyRewards/server/rpc.ts` (the only path to the ledger) and `server/env.ts` (pool, session cookie, mailer, origin check) | ecosystem-landing |
| Pages | Account, sign-in, verify, sign-out, admin, admin action, admin export | `src/app/student-academy/referrals/account/**` |

**Identity:** emailed one-time sign-in links. Only a hash of each token is stored. The link opens a confirm page, so a mail scanner opening the link cannot use it up. Sessions are HttpOnly cookies scoped to the account path. There are no passwords.

A member's data appears only after the owner links an email (approval) **and** that address signs in. A typed Google Form email is never treated as identity. The owner is any signed-in email listed in `family_rewards.owners`.

**Balances** are always derived:
- posted = the sum of ledger entries;
- available = posted − held redemptions.

The dashboard shows Earned / Used / Available / Pending (pending = referrals not yet credited; never spendable). No balance column exists to edit. Corrections are compensating entries with reasons. Ledger rows cannot be updated, deleted or truncated (trigger).

This is an append-only *application* ledger; a database superuser can still change it.

**Privacy:** the customer projection returns the member's own code and totals, plus neutral aliases ("Family 7KQ") and generic statuses. Referred adults' names and contacts are returned only by owner functions.

Account pages are request-time rendered and set `Cache-Control: private, no-store` and `X-Robots-Tag: noindex`, both in the app and in the root `vercel.json`. They are not in the sitemap.

## Release controls (three, independent)

| Control | Where | Off means |
|---|---|---|
| Account pages exist | `FR_ACCOUNTS_ENABLED=1` (production) and `FR_DATABASE_URL` set | `/student-academy/referrals/account/**` returns 404 |
| New enrolment and referrals | `settings.enrolment_open` (owner switch in admin) | No new members or referrals. Existing accounts and balances stay readable and usable |
| Customers can open accounts | `settings.dashboard_open` | Customers see "temporarily unavailable"; the owner still administers |
| Credit changes | `settings.ledger_writes_open` | No rewards, redemptions or adjustments; reads continue |

`FAMILY_REWARDS_ENABLED` only controls the public information page. Switching it off does not hide accounts or balances.

## Proofs (re-run before any release)

```
# isolated local Postgres 17 only — the suite drops and creates databases
FR_TEST_ADMIN_URL=postgres://postgres@127.0.0.1:54329/postgres npm run test:family-rewards-db
npm run test:family-rewards
# HTTP journey against a locally running app on a fresh local database (see the script header)
BASE=http://localhost:3418 LOG=<server log> node scripts/family-rewards-e2e.mjs
```

`FR_TEST_PGCTL` / `FR_TEST_PGDATA` make case E5 restart the Postgres server for real.

## Production migration: prerequisites (all must be true)

1. **Recovery point.** A successful `db-backup.yml` run (jurassic-ai-speaking) within the last 24 h with its artifact present, and the restore drill in `docs/ops/BACKUP_RESTORE.md` done once. *As of 21 Oct 2026 every scheduled run since 16 Oct has failed (missing Actions secrets): **blocked**.*
2. **Funding** recorded privately by the owner (the amount is set in the admin with "Set funded allocation", never in the repo).
3. **Owner credentials set in Vercel (je-ecosystem-landing-preview, Production)** by the owner:
   - `FR_DATABASE_URL`: session-mode pooler URI for role `fr_app`;
   - `RESEND_API_KEY` and `FR_FROM_EMAIL`: the verified sender already used by AI Speaking;
   - `FR_PUBLIC_ORIGIN=https://jurassicenglish.com`;
   - `FR_ACCOUNTS_ENABLED=1` last.

## Production migration: steps

1. Confirm prerequisite 1. Note the backup artifact ID.
2. Apply `supabase/migrations/20261021000001_family_rewards_ledger.sql` (additive; creates only schema `family_rewards` and role `fr_app`).
3. As the database owner, set the app login. The owner chooses the password and stores it only in Vercel:
   ```sql
   alter role fr_app login password '<owner-chosen>';
   ```
4. Add the owner's sign-in email:
   ```sql
   insert into family_rewards.owners(email) values ('<owner email, lower-case>');
   ```
5. Verify the database boundary (read-only):
   ```sql
   select has_table_privilege('fr_app', 'family_rewards.ledger_entries', 'select');
   ```
   It must be `false`.
6. Set the Vercel variables from prerequisite 3, then merge via the normal Git release (`gh pr merge … --match-head-commit …`); Vercel deploys from Git.
7. On `https://jurassicenglish.com`:
   1. Request a sign-in link to the owner email. It arrives, and the confirm page signs in.
   2. In admin: Set funded allocation, then Programme switches (enrolment on).
   3. Check `curl -sI https://jurassicenglish.com/student-academy/referrals/account` shows `private, no-store`, not `s-maxage`.
   4. Run `node scripts/verify-overhaul.mjs --live --main https://jurassicenglish.com`.
8. First real member: approve them in admin after checking they are a current or former academy family. Then confirm they can sign in and see their code.

## Importing registrations

1. Export the form's response sheet as CSV (owner-only).
2. Run the dry run:
   ```
   node scripts/family-rewards-import-dryrun.mjs responses.csv
   ```
   It writes nothing. It merges duplicates by email, excludes the synthetic QA row, and lists incomplete rows.
3. Approve each listed applicant in admin after checking membership. Approving the same email twice is refused, so a partial run can be resumed safely.
4. Credit confirmed to a customer before this ledger: use "Import established credit" (once per member, cites its source). As of 21 Oct 2026 there are **none** to import.

No invitations are sent automatically.

## Rollback

| Situation | Action |
|---|---|
| Hide accounts quickly | Unset `FR_ACCOUNTS_ENABLED` and redeploy (account routes return 404). Data is untouched |
| Stop new referrals only | Admin → Programme switches → enrolment off |
| Freeze credit changes | Admin → switches → credit changes off |
| Bad app release | `vercel rollback <previous production deployment> --scope jay71adams-1388s-projects`. The schema is additive, so older code ignores it |
| Remove the schema | `…_down.sql` refuses while any ledger entry exists, by design. Entitlements can never be dropped by a routine rollback. Before any deliberate removal: owner export plus a database backup |

## Recovery

- **Database restore:** use the backup and restore procedure in `docs/ops/BACKUP_RESTORE.md` (jurassic-ai-speaking). After a restore, check the reconciliation line in admin:
  - ledger total = sum of member balances;
  - rewards posted = budget issued;
  - open reservations = budget reserved.
- **Lost response or crash during an owner action:** re-submit the same form. The request key returns the original result without repeating the effect.
