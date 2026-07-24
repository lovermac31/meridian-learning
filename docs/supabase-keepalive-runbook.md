# Jurassic English Supabase Keepalive Runbook

## Purpose

The Jurassic English free-tier Supabase project can pause after sustained
inactivity. The production health endpoint performs a minimal read against
`je_leads` when called with the configured cron bearer.

Project reference: `hvuohtenmsqlsqrbgveg`

## Scheduled Controls

- Vercel calls `/api/health` daily using `CRON_SECRET`.
- GitHub Actions calls the same endpoint every six hours as an independent
  backstop.
- The GitHub check requires HTTP 200, `status: "ok"`, `keepalive.ok: true`,
  and the expected project reference.
- A failed or skipped keepalive fails the workflow after artifacts are
  uploaded and opens or updates the `WWL Site Health Regression` issue.

## Required Secret Configuration

Vercel production:

- `SUPABASE_URL`: Jurassic English project URL.
- `SUPABASE_WRITE_KEY`: `sb_secret_...` backend key or legacy service-role JWT.
- `CRON_SECRET`: bearer used by scheduled callers.

GitHub Actions:

- `CRON_SECRET`: must match Vercel production.

Never use an `sb_publishable_...` key for the keepalive. Never print secret
values in logs or copy them into repository files.

## Safe Verification

1. Call the production endpoint with the cron bearer.
2. Confirm HTTP 200 and the expected project reference.
3. Run the `WWL Site Health` workflow manually.
4. Confirm the `Supabase keepalive` step reports success.

An unauthenticated `/api/health` response intentionally reports
`keepalive: "skipped"` and does not touch Supabase.

## Failure Response

1. Check whether Vercel production has all three required variables.
2. Confirm the write key is a backend key, not a publishable key.
3. Confirm the GitHub `CRON_SECRET` exists and matches Vercel.
4. Review the health response's safe `supabaseKeyStatus` diagnostic.
5. Restore the project from the Supabase dashboard if it is paused, then rerun
   the authenticated health check.

## Long-Term Guarantee

Scheduled activity reduces free-tier auto-pause risk but is not a service-level
guarantee. Upgrade the project to Supabase Pro when continuous availability is
required.
