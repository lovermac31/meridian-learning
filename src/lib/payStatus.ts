// Buyer-facing payment status for the JE pay step (P5c, 15 Nov 2026). Mirrors the JurassicIELTS pay step (P5b, src/lib/pay.ts
// there) so both sites poll and back off the same way.
//
// Where a code's status comes from:
//   PR../LC  -> the AI Speaking app, which receives the one SePay webhook per bank account and matches JE codes. jurassicenglish.com
//               proxies it same-origin at /ai-speaking/api/pay/status?code=<CODE>: 200 {status: waiting|received|underpaid|overpaid},
//               400 {error: unknown_code}, 429 when rate-limited.
//   SC       -> JE's own /api/story-club/status?code=<CODE>: 200 {status: waiting|received} from story_club_reservations.paid_at.
//   1T       -> no status: 1-to-1 payments are checked by hand (the forwarded webhook always ends as needs_review).
//   anything else (BL) -> no status source; the pay step shows no status line.
// Only status words are read. No payer data is requested, stored, logged or shown.

import { HOLIDAY_SETS } from '../config/holidaySets';
export const PAY_STATUSES = ['waiting', 'received', 'underpaid', 'overpaid'] as const;
export type PayStatus = typeof PAY_STATUSES[number];
export type PayCheck = PayStatus | 'rate' | 'unknown' | 'error';
export type PayState = PayStatus | 'expired';
export const FINAL_PAY_STATES: ReadonlySet<PayState> = new Set(['received', 'underpaid', 'overpaid']);
export const isFinalPayState = (state: PayState | null | undefined): boolean => !!state && FINAL_PAY_STATES.has(state);

// 5 s for the first 2 min, then 15 s, up to 30 min from the memo; 429 and errors double the interval up to 60 s.
export const POLL = { fast: 5_000, fastFor: 120_000, slow: 15_000, max: 60_000, until: 1_800_000, timeout: 10_000 } as const;

// Holiday-set codes (28 Nov to 6 Dec 2026) are matched by hand: the AI Speaking app's PR status table has no row for them, so
// polling it would only wait and then say "expired". The pay step shows no status line and keeps the Zalo button.
const HOLIDAY_SET_MEMO = new RegExp(`^(?:${HOLIDAY_SETS.map((set) => set.prefix).join('|')})-[A-Z0-9]{6}$`);
export const AIS_STATUS_PATH = '/ai-speaking/api/pay/status';
export const STORY_CLUB_STATUS_PATH = '/api/story-club/status';

export type PayStatusSource =
  | { kind: 'auto'; family: 'product' | 'live-check' | 'story-club'; url: string }
  | { kind: 'manual' }
  | { kind: 'none' };

/** Picks the status source for a canonical memo. Only a well-formed code ever produces a URL. */
export function payStatusSource(memo: unknown): PayStatusSource {
  if (typeof memo !== 'string') return { kind: 'none' };
  const query = `?${new URLSearchParams({ code: memo })}`;
  if (HOLIDAY_SET_MEMO.test(memo)) return { kind: 'none' };
  if (/^PR[A-Z0-9]{2}-[A-Z0-9]{6}$/.test(memo)) return { kind: 'auto', family: 'product', url: AIS_STATUS_PATH + query };
  if (/^LC-[A-Z0-9]{6}$/.test(memo)) return { kind: 'auto', family: 'live-check', url: AIS_STATUS_PATH + query };
  if (/^SC-[A-Z0-9]{6}$/.test(memo)) return { kind: 'auto', family: 'story-club', url: STORY_CLUB_STATUS_PATH + query };
  if (/^1T-[A-Z0-9]{6}$/.test(memo)) return { kind: 'manual' };
  return { kind: 'none' };
}

export function pollDelay(sinceMemo: number, backoff = 0): number {
  return Math.min((sinceMemo < POLL.fastFor ? POLL.fast : POLL.slow) * 2 ** Math.max(0, backoff), POLL.max);
}

export async function checkPayStatus(url: string, request: typeof fetch = fetch, signal?: AbortSignal): Promise<PayCheck> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), POLL.timeout);
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  try {
    const response = await request(url, { method: 'GET', credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' }, signal: controller.signal });
    if (response.status === 429) return 'rate';
    if (response.status === 400) {
      const body = await response.json().catch(() => null) as { error?: unknown } | null;
      return body?.error === 'unknown_code' ? 'unknown' : 'error';
    }
    if (!response.ok) return 'error';
    const body = await response.json() as { status?: unknown } | null;
    return body && typeof body === 'object' && (PAY_STATUSES as readonly unknown[]).includes(body.status) ? body.status as PayStatus : 'error';
  } catch {
    return 'error';
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}

type Timers = { set: (fn: () => void, ms: number) => unknown; clear: (handle: unknown) => void };
type VisibilityDoc = {
  hidden: boolean;
  addEventListener: (type: 'visibilitychange', fn: () => void) => void;
  removeEventListener: (type: 'visibilitychange', fn: () => void) => void;
};

/**
 * Polls one status URL until a final state or 30 minutes from `start`. Pauses while the tab is hidden (and aborts an in-flight
 * check), then checks at once when it is visible again. Network errors, 429, 5xx and 400 unknown_code keep the waiting state and
 * back off; only the 30-minute end reports 'expired'. Returns a stop function.
 */
export function watchPayment(options: {
  url: string; onState: (state: PayState) => void; onCheck?: (result: PayCheck) => void;
  request?: typeof fetch; now?: () => number; start?: number; timers?: Timers; doc?: VisibilityDoc;
}): () => void {
  const now = options.now ?? Date.now;
  const doc = options.doc ?? document;
  const request = options.request ?? ((input, init) => fetch(input, init));
  const timers: Timers = options.timers ?? { set: (fn, ms) => setTimeout(fn, ms), clear: handle => clearTimeout(handle as ReturnType<typeof setTimeout>) };
  const start = options.start ?? now();
  let backoff = 0;
  let done = false;
  let timer: unknown;
  let inflight: AbortController | undefined;
  const cancelTimer = () => { if (timer !== undefined) { timers.clear(timer); timer = undefined; } };
  const stop = () => { done = true; cancelTimer(); inflight?.abort(); doc.removeEventListener('visibilitychange', onVisibility); };
  const finish = (state: PayState) => { stop(); options.onState(state); };
  const schedule = (delay?: number) => {
    if (done || doc.hidden || timer !== undefined || inflight) return;
    const elapsed = now() - start;
    timer = timers.set(tick, Math.max(0, Math.min(delay ?? pollDelay(elapsed, backoff), POLL.until - elapsed)));
  };
  async function tick() {
    timer = undefined;
    if (done || doc.hidden || inflight) return;
    const controller = new AbortController();
    inflight = controller;
    const result = await checkPayStatus(options.url, request, controller.signal);
    inflight = undefined;
    if (done) return;
    if (controller.signal.aborted) { schedule(0); return; } // hidden mid-request: check again as soon as it is visible
    options.onCheck?.(result);
    if (result === 'received' || result === 'underpaid' || result === 'overpaid') { finish(result); return; }
    backoff = result === 'waiting' ? 0 : Math.min(backoff + 1, 4);
    if (now() - start >= POLL.until) { finish('expired'); return; }
    schedule();
  }
  function onVisibility() {
    if (done) return;
    if (doc.hidden) { cancelTimer(); inflight?.abort(); }
    else schedule(0);
  }
  doc.addEventListener('visibilitychange', onVisibility);
  options.onState('waiting');
  schedule();
  return stop;
}
