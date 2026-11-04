# Supabase backend migration audit — 2026-10-29

## Scope and method

Static review of checked-in SQL only, using the meridian-learning `origin/main` checkout, the current `je-portal` PR #2 head `0abe43dee80f43e2fd6a0d2879dd717a2448bcea` (branch `feat/owner-insights`), and jurassic-ai-speaking `origin/main`. No Supabase project connection, catalog query, `supabase db push`, data read, or live write was used. Rollback files and schema snapshot files were not treated as forward migrations. The app-code query review was limited to the matching repository checkout.

This can establish what migration sources declare, but not effective deployed grants, whether a migration has been applied, PostgREST schema exposure, or pre-existing objects that are absent from the source history. “Not specified” below means the migration source does not provide enough evidence to state the effective catalog ACL.

## Executive findings

- **No confirmed anonymous table read of personal data in the reviewed forward migrations.** All declared `je_commerce` and `ai_speaking` application tables have RLS enabled; `family_rewards` tables are in a non-public schema with schema privileges revoked from `PUBLIC`. Meridian public lead/event/pilot tables enable RLS and define no direct table policies. This is source-level evidence, not a live ACL verification.
- **No `SECURITY DEFINER` routine missing a pinned `search_path` was found** in forward migration definitions reviewed (meridian 20; portal PR #2 39; AI Speaking 231 detected definitions/replacements, including repeated replacement definitions).
- **Two follow-ups need owner/runtime evidence:** (1) meridian API references `student_academy_registrations`, but the current checkout contains neither a forward migration nor the source-commented `docs/database/student_academy_registrations.sql`; the repository alone cannot establish whether this relation exists in the deployed schema. (2) AI Speaking migration 033 documents historic privilege-escalation findings and includes remediation source marked “NOT applied by this PR”; whether the remediation has been applied in any database cannot be proven from the checkout.
- **No confirmed missing index found on indexed API filters in reviewed migrations.** Meridian filters use `submission_id`/`id` primary or unique keys, plus event `submission_id,event_at`; portal query paths have indexes on `orders(user_id,created_at)`, `orders(status,expires_at)`, `payment_events(order_ref)`, `entitlements(user_id,status)`, `downloads(user_id,at)`. AI API access is via RPCs; no direct PostgREST table filter was found in the reviewed `mvp` API. The SQL routines should still be checked against real query plans and data volumes.
- **Unused-object determination is inconclusive from static search.** RPCs can be called by other deployments, scheduled workers, auth hooks, or SQL triggers. No object is called unused solely because it lacks an in-repo call site.
- **No draft security migration added:** there is no confirmed source-level defect whose safe remediation and rollback can be specified without the missing deployed schema contract/catalog state. In particular, creating a guessed `student_academy_registrations` schema or applying AI Speaking 033 was not safe to infer.

## Table-by-table migration inventory

For each table created by the forward migration sources, RLS is based on an explicit `ENABLE ROW LEVEL SECURITY`; policies are those declared in those sources. An empty policy list means no direct row policy was created in the reviewed migration files. Effective anon/authenticated table grants are **not determined** unless explicit grants/revokes are stated under each project’s grant notes.

### meridian-learning

Forward SQL files reviewed: 6; declared created tables: 20.

| Table | RLS | Policies declared in reviewed source | Anonymous/authenticated table grants in source |
|---|---|---|---|
| `family_rewards.audit_log` | not enabled in source | none in source | not specified per-role; PUBLIC schema revoke is declared; verify direct grants |
| `family_rewards.budget` | not enabled in source | none in source | not specified per-role; PUBLIC schema revoke is declared; verify direct grants |
| `family_rewards.households` | not enabled in source | none in source | not specified per-role; PUBLIC schema revoke is declared; verify direct grants |
| `family_rewards.idempotency` | not enabled in source | none in source | not specified per-role; PUBLIC schema revoke is declared; verify direct grants |
| `family_rewards.invoices` | not enabled in source | none in source | not specified per-role; PUBLIC schema revoke is declared; verify direct grants |
| `family_rewards.ledger_entries` | not enabled in source | none in source | not specified per-role; PUBLIC schema revoke is declared; verify direct grants |
| `family_rewards.login_tokens` | not enabled in source | none in source | not specified per-role; PUBLIC schema revoke is declared; verify direct grants |
| `family_rewards.members` | not enabled in source | none in source | not specified per-role; PUBLIC schema revoke is declared; verify direct grants |
| `family_rewards.owners` | not enabled in source | none in source | not specified per-role; PUBLIC schema revoke is declared; verify direct grants |
| `family_rewards.packages` | not enabled in source | none in source | not specified per-role; PUBLIC schema revoke is declared; verify direct grants |
| `family_rewards.private_contacts` | not enabled in source | none in source | not specified per-role; PUBLIC schema revoke is declared; verify direct grants |
| `family_rewards.redemptions` | not enabled in source | none in source | not specified per-role; PUBLIC schema revoke is declared; verify direct grants |
| `family_rewards.referrals` | not enabled in source | none in source | not specified per-role; PUBLIC schema revoke is declared; verify direct grants |
| `family_rewards.sessions` | not enabled in source | none in source | not specified per-role; PUBLIC schema revoke is declared; verify direct grants |
| `family_rewards.settings` | not enabled in source | none in source | not specified per-role; PUBLIC schema revoke is declared; verify direct grants |
| `public.je_events` | ON | none in source | not specified; catalog ACL unknown |
| `public.je_get_started_submissions` | ON | none in source | not specified; catalog ACL unknown |
| `public.je_leads` | ON | none in source | not specified; catalog ACL unknown |
| `public.je_pilot_access_events` | ON | none in source | not specified; catalog ACL unknown |
| `public.je_pilot_access_requests` | ON | none in source | not specified; catalog ACL unknown |

**Explicit privilege/policy notes:** no table-level grants/revokes or `CREATE POLICY` statements were found in the forward migrations. RLS is enabled on `public.je_leads`, `public.je_get_started_submissions`, `public.je_pilot_access_requests`, `public.je_pilot_access_events`, and `public.je_events`. `record_je_event` revokes function execution from `PUBLIC, anon` and grants it to `service_role`. Family Rewards revokes all privileges on schema `family_rewards` from `PUBLIC`; its source documents a dedicated `fr_app` function-only application role, but per-table and schema rights for that role are not established by this repo source. The 15 `family_rewards` tables therefore have RLS off but are intended to be unreachable by API roles; verify role/schema grants in a local catalog before deployment.

**API/index review:** `je_leads.registration_id` and `je_get_started_submissions.submission_id` are unique; pilot requests `submission_id` is unique; pilot events have `(submission_id,event_at DESC)`; anonymous events have indexes on `ts,event,product_id,utm_source`. No missing index was identified for the current API query predicates.

**Unresolved relation:** `api/_lib/supabaseWriter.ts` inserts into and updates `public.student_academy_registrations` by `id`, while its comment references `docs/database/student_academy_registrations.sql`, which is absent from this checkout. No migration creates that relation. Obtain the canonical schema and verify an isolated/local database migration history; do not infer whether the deployed relation is missing from source alone.

### je-portal PR #2 feat/owner-insights

Forward SQL files reviewed: 10; declared created tables: 22.

| Table | RLS | Policies declared in reviewed source | Anonymous/authenticated table grants in source |
|---|---|---|---|
| `je_commerce.account_credits` | ON | credits_own | not specified; catalog ACL unknown |
| `je_commerce.accounts` | ON | accounts_own | not specified; catalog ACL unknown |
| `je_commerce.audit_log` | ON | none in source | not specified; catalog ACL unknown |
| `je_commerce.delivery_jobs` | ON | none in source | not specified; catalog ACL unknown |
| `je_commerce.disputes` | ON | none in source | not specified; catalog ACL unknown |
| `je_commerce.downloads` | ON | downloads_own | not specified; catalog ACL unknown |
| `je_commerce.entitlements` | ON | entitlements_own | not specified; catalog ACL unknown |
| `je_commerce.feedback` | ON | none in source | not specified; catalog ACL unknown |
| `je_commerce.institutions` | ON | none in source | not specified; catalog ACL unknown |
| `je_commerce.licences` | ON | licences_own | not specified; catalog ACL unknown |
| `je_commerce.order_items` | ON | order_items_own | not specified; catalog ACL unknown |
| `je_commerce.orders` | ON | orders_own | not specified; catalog ACL unknown |
| `je_commerce.payment_events` | ON | none in source | not specified; catalog ACL unknown |
| `je_commerce.product_components` | ON | none in source | not specified; catalog ACL unknown |
| `je_commerce.product_files` | ON | none in source | not specified; catalog ACL unknown |
| `je_commerce.products` | ON | products_active | not specified; catalog ACL unknown |
| `je_commerce.provider_events` | ON | none in source | not specified; catalog ACL unknown |
| `je_commerce.reader_items` | ON | none in source | not specified; catalog ACL unknown |
| `je_commerce.reader_opens` | ON | none in source | not specified; catalog ACL unknown |
| `je_commerce.refunds` | ON | none in source | not specified; catalog ACL unknown |
| `je_commerce.review_items` | ON | none in source | not specified; catalog ACL unknown |
| `je_commerce.settings` | ON | none in source | not specified; catalog ACL unknown |

**Explicit privilege/policy notes:** all 19 declared `je_commerce` tables have RLS enabled. Only `accounts`, `products`, `orders`, `order_items`, `licences`, `entitlements`, `account_credits`, and `downloads` have direct authenticated read policies; there are no anon table policies in the migration source. Other direct table access has no policy. Migration 009 explicitly revokes worker RPCs from public/anon/authenticated, grants them to `service_role`, and grants buyer RPCs to authenticated. The public catalog and admin/payment/CRM RPCs are individually retained for anon/authenticated under their secret or auth gates. No explicit `GRANT` on these `je_commerce` tables appears; effective table grants are not established from the repo sources. Storage policy `jec_copies_read_own` limits object reads to authenticated accounts authorized by `jec_reader_can_open`.

**Indexes inspected:** order user/date and open-state indexes; `payment_events(order_ref)`; `entitlements(user_id,status)`; `downloads(user_id,at)`; supporting primary/unique keys. The audit found no missing index on the visible API code’s join/filter columns in those migrations.

### jurassic-ai-speaking

Forward SQL files reviewed: 37; declared created tables: 59.

| Table | RLS | Policies declared in reviewed source | Anonymous/authenticated table grants in source |
|---|---|---|---|
| `ai_speaking.access_codes` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.answer_checkpoints` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.attempt_consents` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.baseline_bookings` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.code_batch_members` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.code_batches` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.consent_texts` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.credit_uses` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.function_backups` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.ladder_entitlements` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.ladder_offers` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.lesson_accounts` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.lesson_bookings` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.lesson_grants` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.lesson_refunds` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.mock_ratings` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.order_acceptances` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.order_adjustments` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.orders` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.packs` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.part_saves` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.payment_events` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.paypal_checkouts` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.paypal_webhook_events` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.review_events` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.review_submissions` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.session_bookings` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.session_offers` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.settings` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.terms_versions` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_analysis_jobs` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_attempt_quota` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_attempts` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_audit_log` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_consent_records` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_draft_versions` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_entitlements` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_events` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_evidence_spans` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_google_bindings` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_health_alerts` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_learner_profiles` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_learner_sessions` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_offers` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_orders` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_payment_events` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_photo_handoffs` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_photo_pages` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_photo_starts` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_photo_usage` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_pilot_reviews` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_prompt_requirements` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_prompts` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_rate_hits` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_reports` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_review_requests` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_submissions` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `ai_speaking.wr_teacher_handoffs` | ON | none in source | schema access revoked for PUBLIC, anon, authenticated in 006; table ACL otherwise unspecified | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |
| `consents` | ON | consents_own_read, consents_center_read, consents_own_insert, consents_own_withdraw | no complete anon/auth table ACL declaration; see explicit 033 note where applicable |

**Explicit privilege/policy notes:** migration 006 revokes `PUBLIC, anon, authenticated` privileges on schema `ai_speaking`; migration sources create no anon/authenticated policies for `ai_speaking` application tables. Several sensitive relations also have explicit table revokes (for example function backups, worker rate/health tables, payment/provider events, photos, batch membership, and acceptance provenance). Public-schema consent/profile policies are in 002–005; migration 033 contains explicit `user_profiles` column update grants/revokes and a restricted `subscriptions` insert policy. Forward sources do not provide a full effective table-grant inventory for baseline Supabase objects or prove `service_role` state.

**Definer functions:** all detected definitions/replacements in the forward files pin `search_path` (mostly empty string; legacy helpers in 003 use `public`). Count includes repeated function replacements. Public RPCs granted to `anon` are a deliberate surface in this design and are guarded by code/order secrets or limited read contracts in their bodies; this static scan is not a function-by-function exploit proof.

**Known security-history item:** `033_public_privilege_hardening.sql` describes role/org escalation through `user_profiles`, untrusted signup role metadata, and public subscription inserts. The migration source includes fixes but its header says it was “NOT applied by this PR”. Treat current deployed status as unknown until an isolated database/catalog or migration-history check proves the remediation is applied. Do not apply it to a live database under this task.

## Function, grants, index, and object checks

| Project | SECURITY DEFINER functions detected | Missing `search_path` | Table-grant / anon exposure evidence |
|---|---:|---:|---|
| meridian-learning | 20 | 0 | No table grants/policies in migrations; RLS on 5 public tables; Family Rewards schema revoked from PUBLIC |
| je-portal PR #2 | 39 | 0 | No direct anon table policies; eight authenticated owner/catalog read policies; explicit function grants/revokes in 009 |
| jurassic-ai-speaking | 231 definitions/replacements | 0 | AI schema revoked from public roles; explicit sensitive table revokes; public legacy consent/user-profile policies require runtime grant verification |

### Security-definer function inventory and `search_path`

The forward migration scan found 20 definitions/replacements in meridian-learning, 39 in je-portal PR #2, and 231 in AI Speaking. Every detected function definition pins a path: meridian `public.record_je_event` uses `public`; the Family Rewards routines use `pg_catalog, family_rewards`; portal routines use an empty path (`''`); AI Speaking routines use an empty path (`''`) except the legacy `current_center()` and `current_role_je()` helpers in migration 003, which use `public`. Repeated replacements are included in the counts. No detected definition was missing `SET search_path`.

Representative table-access mappings from function bodies: `record_je_event` → `public.je_events`; Family Rewards `fr_*` routines → `family_rewards.*`; `jec_*` routines → `je_commerce.*`; `ais_*` routines → `ai_speaking.*` and public consent/profile relations as applicable. The full function names and search_path declarations are present in the reviewed migration sources listed in the source-control branches, so this report avoids copying hundreds of repeated function bodies; consumers should use the migration definition as the authoritative signature/body.

The security-definer scanner checks forward migration function definitions/replacements for `SECURITY DEFINER` and a same-definition `SET search_path`. Index checks compared API-visible SQL/PostgREST filters and joins with primary/unique keys and declared indexes; RPC internals were reviewed by source inspection, not `EXPLAIN` against live or representative data. “Unused” objects need database catalog/telemetry and deployment inventory evidence before removal.

## Recommended next validation (local/isolated only)

1. Apply each project migration chain to its own disposable local PostgreSQL/Supabase instance and query `pg_class.relrowsecurity`, `pg_policies`, `information_schema.role_table_grants`, `information_schema.role_routine_grants`, `pg_proc.prosecdef`, and `pg_proc.proconfig`.
2. For meridian, resolve the `student_academy_registrations` schema contract from its canonical source and add it to version control only after confirming whether a matching migration already exists outside this checkout.
3. For AI Speaking 033, inspect only the disposable database’s migration ledger and effective ACLs; record the result without querying production.
4. Use representative synthetic data and `EXPLAIN (ANALYZE, BUFFERS)` locally for slow API/RPC filters before adding indexes; compare object calls against app deployments, pg_cron and auth triggers before marking any routine unused.

## Rollback

This C2 change is documentation only. No database or application behavior changes. Revert the report commit to roll it back.
