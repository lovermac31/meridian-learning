# Observability Event Taxonomy — Phase 4A

Live as of: 2026-05-15
Helper: [`api/_lib/observability.ts`](../api/_lib/observability.ts)
Status: **instrumentation only — no Vercel alerts wired yet**

## Canonical envelope

Every canonical event uses the same shape. Existing free-form `console.*`
calls are preserved alongside (human-readable signal); `logEvent()` adds
the canonical alert-ready payload.

```typescript
{
  event: string;               // canonical name from CANONICAL_EVENTS
  severity: 'info' | 'warn' | 'error';
  route?: string;              // '/api/get-started', '/api/pricing-registration', etc.
  status?: number;             // HTTP status emitted to client (0/200/4xx/5xx)
  durationMs?: number;         // optional duration from withTiming()
  clientHash?: string;         // 12-char SHA-256(IP) — non-reversible
  // …plus open-ended whitelist of safe extension fields per event
}
```

Console method is chosen by severity: `info → console.info`,
`warn → console.warn`, `error → console.error`. Tag prefix is `[obs]` so
a single grep pulls all canonical events out of mixed logs.

## PII guard

The helper strips known-PII keys before logging. If a caller accidentally
passes them, the payload is emitted with the offending keys removed and a
`piiStripped: [<keys>]` field added so the leak attempt is visible.

Denylist (current):
- `email`, `workEmail`, `parentEmail`, `studentEmail`
- `phone`, `phoneContact`, `phoneWhatsapp`
- `parentFullName`, `studentFirstName`, `studentName`, `childName`
- `message`, `notes`, `address`
- `rawIp`, `ip`, `forwardedFor`
- `userAgent` (captured separately via `createThrottleLogContext`)

**Safe alternatives** that callers MUST use instead:
- `emailDomain` (just the part after `@`)
- `clientHash` (12-hex SHA-256 of IP)
- `submissionId` (server-generated, non-identifying)
- `errorCategory` / `reason` (string enum, never user content)

## 14 canonical events

### Phase 2.1A — rate limiting

| Event | Severity | Emitted from | When |
|---|---|---|---|
| `rate_limited` | warn | `requestSecurity.ts:logRateLimited()` | After `checkRateLimit` returns `!allowed`. Carries `limit`, `remaining`, `retryAfterSeconds`, `source`. |
| `rate_limit_store_error` | warn | `requestSecurity.ts:checkRateLimit()` | Upstash REST call timed out / errored. Carries `source`, `reason`, `failMode`. |

### Phase 2.2A — CORS perimeter

| Event | Severity | Emitted from | When |
|---|---|---|---|
| `cors_origin_denied` | warn | `corsSecurity.ts:applyCors()` | Cross-origin request from non-allowlisted origin. Carries `origin`, `method`. |

### Phase 4A — submission lifecycle

| Event | Severity | Emitted from | When |
|---|---|---|---|
| `submission_accepted` | info | 3 route handlers | Final 200 response on the happy path. Carries `submissionId`, `emailDomain`, plus per-route context (`organizationType`, `buyerType`, `source`, etc.). |
| `validation_failed` | warn | 3 route handlers | Validator returned ≥1 field error. Carries `errorFields` array, never the field values. |
| `spam_rejected` | warn | 3 route handlers | Honeypot filled or submission timing rejected. Carries `reason: 'honeypot_filled' \| 'submission_timing'`. |

### Phase 4A — Supabase writes

| Event | Severity | Emitted from | When |
|---|---|---|---|
| `supabase_write_succeeded` | info | `supabaseWriter.ts` (4 tables) | Insert returned 200/201/409 (created or duplicate-skipped). Carries `table`, `reason: 'created' \| 'duplicate_skipped'`. |
| `supabase_write_failed` | error | `supabaseWriter.ts` (4 tables) | Network error or non-OK non-409 status. Carries `table`, `status`, `reason`. |

Tables covered: `je_leads`, `je_get_started_submissions`,
`je_pilot_access_requests`, `student_academy_registrations`.

### Phase 4A — Notion CRM writes

| Event | Severity | Emitted from | When |
|---|---|---|---|
| `notion_write_succeeded` | info | `notionCrmWriter.ts` | Page created or duplicate detected. Carries `submissionId`, `reason`. |
| `notion_write_failed` | error | `notionCrmWriter.ts` | Network error or Notion API non-OK. Carries `submissionId`, `status`, `reason`. |

### Phase 4A — email transport

| Event | Severity | Emitted from | When |
|---|---|---|---|
| `email_sent` | info | 3 route handlers + email helper | Resend returned 200. Carries `transport`, `kind`, `submissionId`. |
| `email_failed` | error | 3 route handlers + email helper | Resend returned non-200, threw, or transport skipped because config missing. Carries `transport`, `kind`, `submissionId`, `failureMode`, `reason`. |

### Phase 4A — operator boundary

| Event | Severity | Emitted from | When |
|---|---|---|---|
| `operator_unauthorized` | warn | `operatorSecurity.ts:requireOperatorAccess()` | Missing or wrong operator token. Carries `route`, `action`, `clientHash`, `authMode`, `tokenPresent`. |
| `operator_ip_denied` | warn | `operatorSecurity.ts:requireOperatorAccess()` | Valid token but IP not in allowlist. Carries `route`, `action`, `clientHash`, `authMode`. |

## Event coverage map

| Surface | Events emitted |
|---|---|
| `/api/generate-image` | `rate_limited`, `rate_limit_store_error` (others n/a — not a submission flow) |
| `/api/get-started` (institutional) | `rate_limited`, `cors_origin_denied`, `spam_rejected`, `validation_failed`, `email_sent`, `email_failed`, `submission_accepted` |
| `/api/get-started` (student-academy fork) | All of the above + `email_sent`/`email_failed` from `studentAcademyRegistrationEmail.ts` |
| `/api/pricing-registration` | `rate_limited`, `cors_origin_denied`, `spam_rejected`, `validation_failed`, `email_sent`, `email_failed`, `submission_accepted` |
| Operator endpoints (`/api/internal/*`, `/api/inspect-notion-lead`, `/api/update-notion-je-leads-schema`, `/api/generate-pricing-access-link`) | `operator_unauthorized`, `operator_ip_denied`, plus inherited `rate_limited`/`cors_origin_denied` |
| Supabase writer (called from 3 routes) | `supabase_write_succeeded`, `supabase_write_failed` (×4 tables) |
| Notion writer (called from `/api/pricing-registration`) | `notion_write_succeeded`, `notion_write_failed` |

## Sample log payloads

```jsonc
// 1. Successful submission
[obs] submission_accepted {
  "event": "submission_accepted",
  "severity": "info",
  "route": "/api/get-started",
  "status": 200,
  "submissionId": "sub_2026_05_15_abcd1234",
  "organizationType": "school",
  "primaryInterest": "teacher_training",
  "emailDomain": "school.edu",
  "newsletterOptIn": true,
  "supabaseOk": true,
  "pilotAccessQueueOk": false
}

// 2. Supabase write error (alerting candidate)
[obs] supabase_write_failed {
  "event": "supabase_write_failed",
  "severity": "error",
  "table": "je_get_started_submissions",
  "status": 503,
  "reason": "api_503",
  "submissionId": "sub_2026_05_15_abcd1234"
}

// 3. Operator unauthorized (security signal)
[obs] operator_unauthorized {
  "event": "operator_unauthorized",
  "severity": "warn",
  "route": "/api/inspect-notion-lead",
  "action": "inspect",
  "status": 401,
  "clientHash": "a1b2c3d4e5f6",
  "authMode": "scoped",
  "tokenPresent": false
}

// 4. CORS denial (perimeter signal)
[obs] cors_origin_denied {
  "event": "cors_origin_denied",
  "severity": "warn",
  "origin": "https://evil.example.com",
  "method": "POST"
}

// 5. Rate-limit store outage (infrastructure signal)
[obs] rate_limit_store_error {
  "event": "rate_limit_store_error",
  "severity": "warn",
  "route": "get-started",
  "clientHash": "a1b2c3d4e5f6",
  "limit": 5,
  "windowMs": 600000,
  "source": "upstash",
  "reason": "timeout",
  "failMode": "closed"
}
```

## Residual gaps (deferred)

These are intentionally NOT instrumented in Phase 4A:

1. **`/api/health` and `/api/supabase-keepalive`** — operational endpoints
   already log structured `supabase_keepalive_*` events. Out of scope for
   the user-facing taxonomy.
2. **`token_issued` / `token_regenerated` / `token_revoked_operationally`**
   — present in source as free-form events (`api/_lib/internalPilotStore.ts`
   region). Migrate to canonical helper in a follow-up packet so the
   issuance audit trail uses the same shape.
3. **Generate-image success** — `/api/generate-image` is not a submission
   flow; `submission_accepted` is not the right name. A future
   `image_generated` event could be added if image generation needs alerts.
4. **`withTiming()` not yet wired in any caller.** The helper exists but
   no production code calls it today. Wire it into Supabase/Notion/email
   writes in a follow-up to start collecting durationMs for p95 alerts.
5. **Sampling.** All events are emitted unsampled. Once volume is known
   from real traffic, `submission_accepted` and `supabase_write_succeeded`
   are good candidates to drop to 10% sampling at the Vercel log layer
   (NOT in this helper — leave the canonical event always emitted).

## Path to alerting (NOT in 4A)

Phase 4A explicitly stops at instrumentation. Alert wiring happens later:

1. Deploy this branch to a Vercel preview; observe at least 24 h of
   canonical events under simulated traffic.
2. Define alert thresholds in a follow-up packet — likely:
   - `supabase_write_failed` count > 0 in any 5 min → page on-call
   - `email_failed` count > 3 in 10 min → email/Slack
   - `rate_limit_store_error` count > 0 in 5 min → infrastructure alert
   - `operator_unauthorized` count > 5 in 10 min → security alert
   - `cors_origin_denied` count > 50 in 1 h → security alert
   - `validation_failed` rate sustained > 30% → UX investigation
3. Create the alerts in Vercel project settings only after thresholds
   are validated against real traffic. Otherwise alert fatigue burns
   trust in the system.

## Rollback

The helper is additive only. To revert any single event:

```bash
# Remove a specific logEvent() call:
git checkout HEAD -- api/_lib/<file>.ts

# Or revert the entire phase:
git revert <phase-4a-sha>

# Disable the helper entirely without touching call sites:
# Replace api/_lib/observability.ts logEvent with a no-op:
#   export function logEvent(): void {}
```

No frontend or response-contract changes, so no rollback path touches the
client. Bundle JS bytes unchanged this phase (server-only helper).
