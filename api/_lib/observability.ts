// Phase 4A — Observability event taxonomy.
//
// Canonical structured-event emitter shared by every server-side surface.
// Existing free-form console.* calls remain in place (they preserve
// human-readable signal); this helper emits an additional canonical
// payload that downstream alerting / log search can pivot on.
//
// Design principles:
//   1. Never block the request path. All emit functions are synchronous,
//      side-effect-only, return void.
//   2. Never put PII in the canonical payload. The shape only includes
//      already-safe fields (event, severity, route, status, durationMs,
//      clientHash, plus a small whitelist of context fields). Callers
//      that pass extra context must omit raw emails, phone numbers,
//      child names, free-text messages, and similar restricted strings.
//   3. One canonical name per logical event. Names are stable contracts
//      that alert rules and dashboards depend on — change them with the
//      same care as a public API rename.
//   4. Sample, don't suppress, high-volume info events later. For now
//      we emit every occurrence so first-week telemetry is complete.

export type EventSeverity = 'info' | 'warn' | 'error';

// Closed set of canonical event names. Anything not in this set is a
// non-canonical free-form log and should use console.* directly, not
// this helper.
export const CANONICAL_EVENTS = [
  // ── Phase 2.1A — rate limit ──────────────────────────────────────
  'rate_limited',
  'rate_limit_store_error',
  // ── Phase 2.2A — CORS perimeter ──────────────────────────────────
  'cors_origin_denied',
  // ── Phase 4A — submission lifecycle ──────────────────────────────
  'submission_accepted',
  'validation_failed',
  'spam_rejected',
  // ── Phase 4A — Supabase write outcomes ───────────────────────────
  'supabase_write_succeeded',
  'supabase_write_failed',
  // ── Phase 4A — Notion CRM outcomes ───────────────────────────────
  'notion_write_succeeded',
  'notion_write_failed',
  // ── Phase 4A — email transport outcomes ──────────────────────────
  'email_sent',
  'email_failed',
  // ── Phase 4A — operator boundary ─────────────────────────────────
  'operator_unauthorized',
  'operator_ip_denied',
] as const;

export type CanonicalEvent = (typeof CANONICAL_EVENTS)[number];

// Default severity per event. Callers can override with the severity field.
const DEFAULT_SEVERITY: Record<CanonicalEvent, EventSeverity> = {
  rate_limited: 'warn',
  rate_limit_store_error: 'warn',
  cors_origin_denied: 'warn',
  submission_accepted: 'info',
  validation_failed: 'warn',
  spam_rejected: 'warn',
  supabase_write_succeeded: 'info',
  supabase_write_failed: 'error',
  notion_write_succeeded: 'info',
  notion_write_failed: 'error',
  email_sent: 'info',
  email_failed: 'error',
  operator_unauthorized: 'warn',
  operator_ip_denied: 'warn',
};

// Fields the alert layer cares about. All optional except `event`.
// `clientHash` is the 12-char SHA-256 IP digest from requestSecurity.ts
// (never the raw IP). `route` is the API path identifier (`/api/get-started`
// or the short route label).
export type ObservabilityFields = {
  route?: string;
  status?: number;
  durationMs?: number;
  clientHash?: string;
  // Open-ended whitelist for per-event metadata. Callers MUST NOT pass
  // raw emails, phone numbers, child names, or free-text user content.
  // Safe examples: submissionId, emailDomain, errorCategory, retryCount.
  [key: string]: unknown;
};

export type LogEventInput = {
  event: CanonicalEvent | (string & {});
  severity?: EventSeverity;
} & ObservabilityFields;

// Internal: known PII keys that should never appear in `extra`. If a
// caller accidentally passes them, we strip and tag the event so it's
// visible in the log stream that a PII guard fired.
const PII_KEY_DENYLIST = new Set([
  'email',
  'workEmail',
  'parentEmail',
  'studentEmail',
  'phone',
  'phoneContact',
  'phoneWhatsapp',
  'parentFullName',
  'studentFirstName',
  'studentName',
  'childName',
  'message',
  'notes',
  'address',
  'rawIp',
  'ip',
  'forwardedFor',
  'userAgent', // captured separately via createThrottleLogContext, not via canonical
]);

function stripPii(fields: ObservabilityFields): { safe: ObservabilityFields; stripped: string[] } {
  const safe: ObservabilityFields = {};
  const stripped: string[] = [];
  for (const [k, v] of Object.entries(fields)) {
    if (PII_KEY_DENYLIST.has(k)) {
      stripped.push(k);
      continue;
    }
    safe[k] = v;
  }
  return { safe, stripped };
}

function severityFor(event: string, override?: EventSeverity): EventSeverity {
  if (override) return override;
  if (event in DEFAULT_SEVERITY) return DEFAULT_SEVERITY[event as CanonicalEvent];
  return 'info';
}

// Canonical emit. Adds [obs] prefix so a single grep pulls all canonical
// events out of mixed logs. The console method is chosen by severity so
// existing Vercel log filters (info/warn/error) keep working.
export function logEvent(input: LogEventInput): void {
  const { event, severity: severityOverride, ...rest } = input;
  const severity = severityFor(event, severityOverride);
  const { safe, stripped } = stripPii(rest);

  const payload: Record<string, unknown> = {
    event,
    severity,
    ...safe,
  };

  if (stripped.length > 0) {
    payload.piiStripped = stripped;
  }

  const tag = `[obs] ${event}`;
  switch (severity) {
    case 'error':
      console.error(tag, payload);
      break;
    case 'warn':
      console.warn(tag, payload);
      break;
    case 'info':
    default:
      console.info(tag, payload);
      break;
  }
}

// Convenience: time-a-promise pattern used by call sites that want
// durationMs in their event without manual timer plumbing.
//   const result = await withTiming(() => supabaseInsert(...), (ms, ok) => {
//     logEvent({
//       event: ok ? 'supabase_write_succeeded' : 'supabase_write_failed',
//       route: '/api/get-started',
//       durationMs: ms,
//     });
//   });
export async function withTiming<T>(
  fn: () => Promise<T>,
  onComplete: (durationMs: number, ok: boolean) => void,
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    onComplete(Date.now() - start, true);
    return result;
  } catch (err) {
    onComplete(Date.now() - start, false);
    throw err;
  }
}
