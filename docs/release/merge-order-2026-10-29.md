# Merge order and migration plan — 2026-10-29

This is a review/release plan only. Do not apply any migration, merge a PR, or deploy until Jay explicitly approves. Before any SQL command, connect only to the approved target and inspect the migration ledger; skip any migration already recorded as applied. Use the named file commands below instead of a broad `supabase db push`.

## Current PR state and exact sequence

Historical sequence from Runbook D:

1. **meridian-learning #222** — merged to `main` (07:49 ICT); no migration is part of this PR.
2. **meridian-learning #223** — merged to `main` (07:49 ICT); documentation only.
3. **meridian-learning #224** — GitHub marks this merged, but its base was `codex/runbook-c1-20261029`, not `main`. Do not treat it as the mainline release PR or merge it again.
4. The C4 change from #224 was rebased onto `main` and merged as **#226** (08:18 ICT). Current `origin/main` is `af0dc1d`; it contains `api/story-club-paid.ts` and `20261029000002_story_club_paid.sql`. The relevant C1 reserve migration `20261029000001_story_club_reserve_events.sql` is also on main.
5. **je-portal #2** — open draft, base `main`; merge after review and the required migration set below.
6. **D1 meridian-learning #227** — open draft, base `main`; merge after #222/#223/#226 and after Jay approves its migration.
7. **D2 meridian-learning #228** — open draft, based on #227; merge after #227 and after Jay approves its migration.
8. **D3 meridian-learning #229** — open draft, based on #228; dependency/security evidence only, no migration.
9. **D3 je-portal #3** — open draft, based on `feat/owner-insights` from #2; merge after #2, no migration of its own.
10. **D3 jurassic-ai-speaking #145** — open draft, base `main`; dependency patch only, no migration.
11. **D4** — this merge-order note PR is documentation only; review/merge last if desired.

#222, #223, and #226 are already merged. #224 is superseded for mainline by #226. The remaining PRs are drafts; no PR in this sequence is authorized for merge by this note.

## Migrations and exact commands

Commands are run from the repository root of the approved checkout. Set the database URL only in the local shell after Jay approves the target; never paste or print credentials. Each command applies one named SQL file and stops on error.

### meridian-learning C1/C4

The reserve-event migration is a prerequisite for the Story Club paid-confirmation migration. Confirm each is not already applied before running:

```sh
psql "$MERIDIAN_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261029000001_story_club_reserve_events.sql
psql "$MERIDIAN_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261029000002_story_club_paid.sql
```

The second file is supplied by #226 (the mainline C4 PR). Do not run the paired `_down.sql` in a release.

### je-portal PR #2

PR #2 contains ten ordered commerce/admin-insights migrations. From the je-portal checkout, apply these exact files in sequence, after Jay's approval and after checking the portal migration ledger:

```sh
for f in   supabase/migrations/20261027000001_je_commerce_001_core.sql   supabase/migrations/20261027000002_je_commerce_002_functions.sql   supabase/migrations/20261027000003_je_commerce_003_storage.sql   supabase/migrations/20261027000004_je_commerce_004_jobs_and_kpis.sql   supabase/migrations/20261027000005_je_commerce_005_seed_products.sql   supabase/migrations/20261027000006_je_commerce_006_reader_items.sql   supabase/migrations/20261027000007_je_commerce_007_paypal.sql   supabase/migrations/20261027000008_je_commerce_008_feedback.sql   supabase/migrations/20261027000009_je_commerce_009_grants.sql   supabase/migrations/20261029000010_je_commerce_010_admin_insights.sql
do
  psql "$JE_PORTAL_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f" || exit 1
done
```

D3 je-portal #3 adds no migration; its base is the #2 feature branch.

### meridian-learning D1/D2

Apply D1 after the C4/mainline migrations above, then D2 after D1. Both remain gated on Jay's approval:

```sh
psql "$MERIDIAN_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261029000003_revoke_public_api_table_grants.sql
psql "$MERIDIAN_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261029000004_student_academy_registrations.sql
```

D3 meridian #229, D3 AI Speaking #145, and this D4 note add no database migrations.

## Verification already completed

D1 and D2 migrations were applied to disposable local PostgreSQL 17 databases; D2 was tested twice against a synthetic pre-existing schema and once on an empty database. Portal PR #2 migrations and rollback were also exercised locally. No live or staging database is a test target for this Runbook D work.
