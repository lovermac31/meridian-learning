# Gulf IELTS click count

After a separately authorized deployment, use these links on the site's existing domain:

- `/go/gulf-ielts-test-1` (Ko-fi, default)
- `/go/gulf-ielts-test-1?dest=calendly` (paid baseline booking)

Only `gulf-ielts-test-1` and the two approved destinations in
`api/_lib/goConfig.ts` are accepted. Add campaigns only to that constant list.
Unknown campaigns/destinations return 404. Only GET is supported; HEAD and other
methods return 405 without counting. The existing Zalo redirect is unchanged.

Each successful GET returns an uncached 302 and emits exactly one JSON message:

```json
{"evt":"go_click","campaign":"gulf-ielts-test-1","dest":"kofi","ref_host":"l.facebook.com","ts":"2026-11-26T00:00:00.000Z"}
```

UTMs are fixed: `utm_source=gulf`, `utm_medium=paid_social`, and
`utm_campaign=gulf-ielts-test-1`. Existing destination query parameters survive;
caller query parameters are never forwarded. No IP, user agent, cookies, query,
path, credentials or personal records are logged by this function. `ref_host`
is a known public host from the config list, otherwise null, including IP hosts.
The response suppresses the referrer sent to the destination.

## Count runtime logs

1. Open this project's Vercel runtime logs, select production and the test's UTC
   start/end times, and filter for `go_click` and `gulf-ielts-test-1`.
2. Count only JSON messages matching `evt`, `campaign`, and the intended `dest`.
   For the Ko-fi stop rule use `dest=kofi`; keep Calendly counts separate.
3. For a reproducible count, save just the matching JSON **message bodies** (one
   per line, without platform wrappers) as `gulf-clicks.jsonl`, then run:

```sh
jq -s '[.[] | select(.evt == "go_click" and .campaign == "gulf-ielts-test-1" and .dest == "kofi")] | length' gulf-clicks.jsonl
```

Check the time window and log retention before starting the campaign; preserve
the messages before they expire. Do not export unrelated platform request data.
Use the same time window when manually comparing paid outcomes; this function
does not read payments or prove purchases.

These are request counts, **not unique or verified human clicks**. GET previews,
bots, retries, repeat visits, direct API calls and your own smoke tests also count.
Record and subtract known tests and review traffic provenance before applying
“0 paid after 100 verified clicks.” No identity-based deduplication or bot
verification is attempted. Logs can be incomplete or delayed; they are not a
transactional ledger. Fixed UTMs assume Gulf paid social traffic.

## Verify and rollback

Locally: `node --import tsx --test tests/go-click.test.ts tests/api-import-extensions.test.ts`,
`npm test`, `npm run lint` (also the repo's TypeScript check), and
`node scripts/check-api-handlers.mjs go`. Tests use synthetic requests only.
No environment variables, secrets, database, or external calls are required.

After an authorized deployment, one manual GET should produce a 302 to the
approved URL with UTMs and one matching runtime log; exclude that test click.
Vite alone does not run Vercel functions. Missing logs or a SPA response indicate
the wrong deployment, log filter/window, or rewrite routing.

Rollback: revert the click-redirect commit and have the deployment owner release
that revert. Restore original destination links if used in campaign materials.
No schema changes or data cleanup are needed. No deployment was performed here.
