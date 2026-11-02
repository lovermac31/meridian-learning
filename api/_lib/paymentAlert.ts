/**
 * Owner alert for every incoming SePay transfer the main-site webhook handles (funnel audit fix 3, 2 Nov 2026).
 * Pattern: jurassic-ai-speaking mvp/lib/payment-alert.ts. Called by api/sepay-webhook.ts AFTER the response is sent,
 * so nothing here can change or delay the webhook's answer (200/503 contract, auth, amount and memo logic untouched).
 *
 * Alerted (one email each): a clean Story Club payment ("paid"), and every needs-review outcome (no memo, a non-SC
 * memo such as BL-/1T-/PRxx, an amount below the Story Club price, a memo with no reservation). Never alerted: outgoing
 * transfers, "already_paid" re-deliveries, and 401/405/413/503 answers (unauthenticated or retried deliveries).
 *
 * Content: memo, amount, outcome, HTTP status, UTC time. Never the transfer text, bank reference, payer name, account
 * or email. Idempotent per transaction: key = SePay transaction id + outcome, kept in this instance's memory (bounded,
 * 7 days); a failed send forgets the key so a later delivery may try again. Never throws; the send is capped at
 * ALERT_TIMEOUT_MS. Env (names only, all already configured for the site's other emails): RESEND_API_KEY,
 * GET_STARTED_FROM_EMAIL, and the owner address ORDER_NOTIFY_EMAIL (the AI Speaking app's name) or, failing that,
 * GET_STARTED_NOTIFY_EMAIL.
 */
export type PaymentAlertEvent = {
  txn: string;        // SePay transaction id (body.id)
  memo: string;       // canonical memo, or 'unknown'
  amount: string | null; // display only, e.g. "590.000₫"
  outcome: string;    // paid | needs_review | ...
  httpStatus: number;
};
export type PaymentAlertResult = 'sent' | 'duplicate' | 'off' | 'failed' | 'skipped';
export type AlertDeps = { fetch?: typeof fetch; now?: number; timeoutMs?: number; env?: Record<string, string | undefined> };

export const ALERT_TIMEOUT_MS = 4_000;
const SEEN_TTL_MS = 7 * 86_400_000;
const SEEN_MAX = 5_000;
const seen = new Map<string, number>();
/** Tests only. */
export function _resetPaymentAlerts() { seen.clear(); }

const NEVER_OUTCOMES = new Set(['ignored_outgoing', 'already_paid', 'retry']);
const clip = (v: unknown, n = 64) => (typeof v === 'string' || typeof v === 'number' ? String(v).replace(/[^\w.:\-]/g, '').slice(0, n) : '');
export const formatVnd = (amount: number) => `${new Intl.NumberFormat('de-DE').format(amount)}₫`;

/** The alert for one webhook delivery, or null when none is due. `payload` is the raw SePay body; only id and amount are read. */
export function sepayAlertEvent(httpStatus: number, outcome: string, memo: string, payload: unknown): PaymentAlertEvent | null {
  if (httpStatus !== 200 || NEVER_OUTCOMES.has(outcome)) return null;
  const p = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>;
  const txn = clip(p.id);
  if (!txn) return null;
  const raw = typeof p.transferAmount === 'number' ? p.transferAmount : typeof p.transferAmount === 'string' ? Number(p.transferAmount) : Number.NaN;
  return { txn, memo: memo || 'unknown', amount: Number.isFinite(raw) ? formatVnd(Math.round(raw)) : null, outcome, httpStatus };
}

const subjectOf = (e: PaymentAlertEvent) => `[Payments] SePay ${e.outcome === 'paid' ? 'paid' : 'needs review'}: ${e.memo}${e.amount ? ` (${e.amount})` : ''}`;

/** Email the owner once per transaction + outcome. Never throws. */
export async function alertPaymentEvent(e: PaymentAlertEvent | null, deps: AlertDeps = {}): Promise<PaymentAlertResult | null> {
  if (!e) return null;
  const env = deps.env ?? process.env;
  const now = deps.now ?? Date.now();
  const key = `sepay:${e.txn}:${e.outcome}`;
  try {
    console.info('sepay_payment_alert', { txn: e.txn, memo: e.memo, outcome: e.outcome, status: e.httpStatus });
    const apiKey = env.RESEND_API_KEY?.trim();
    const to = env.ORDER_NOTIFY_EMAIL?.trim() || env.GET_STARTED_NOTIFY_EMAIL?.trim();
    const from = env.GET_STARTED_FROM_EMAIL?.trim() || 'onboarding@resend.dev';
    if (!apiKey || !to) return 'off';
    const last = seen.get(key);
    if (last !== undefined && now - last < SEEN_TTL_MS) return 'duplicate';
    seen.set(key, now);
    if (seen.size > SEEN_MAX) for (const k of seen.keys()) { seen.delete(k); if (seen.size <= SEEN_MAX) break; }
    const lines = [
      'Provider: SePay (bank transfer, main site)',
      `Transaction: ${e.txn}`,
      `Memo: ${e.memo}`,
      `Amount: ${e.amount ?? 'unknown'}`,
      `Outcome: ${e.outcome}`,
      `Webhook answer: HTTP ${e.httpStatus}`,
      `Time (UTC): ${new Date(now).toISOString()}`,
      '',
      e.outcome === 'paid'
        ? 'A Story Club seat was confirmed automatically. Nothing to do unless the bank app disagrees.'
        : 'This transfer was not confirmed automatically. Match it by hand in the bank app and the reservations list.',
    ];
    // Capped two ways: the request is aborted, and the race resolves "timeout" even if a transport ignores the signal.
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<{ ok: false; status: number }>((resolve) => {
      timer = setTimeout(() => { controller.abort(); resolve({ ok: false, status: 0 }); }, deps.timeoutMs ?? ALERT_TIMEOUT_MS);
    });
    try {
      const res = await Promise.race([
        (deps.fetch ?? fetch)('https://api.resend.com/emails', {
          method: 'POST',
          signal: controller.signal,
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from, to: [to], subject: subjectOf(e), text: lines.join('\n') }),
        }),
        timeout,
      ]);
      if (res.ok) return 'sent';
      seen.delete(key);
      console.error('sepay_payment_alert_send_failed', { txn: e.txn, outcome: e.outcome, reason: res.status ? `resend_${res.status}` : 'timeout' });
      return 'failed';
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    seen.delete(key);
    console.error('sepay_payment_alert_send_failed', { txn: e.txn, outcome: e.outcome, reason: String((err as Error)?.name ?? err) });
    return 'failed';
  }
}
