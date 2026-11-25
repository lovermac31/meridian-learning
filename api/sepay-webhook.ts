import { canonicalPaymentMemo } from '../src/config/payment.js';
import { sepayTransactionTime, storyClubMinimumAmountAt } from '../src/config/storyClubOffer.js';
import { holidayWindowStatus, isHolidaySetMemo } from '../src/config/holidaySets.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';
import { markStoryClubReservationPaid } from './_lib/supabaseWriter.js';
import { alertPaymentEvent, sepayAlertEvent } from './_lib/paymentAlert.js';

const MAX_BODY_BYTES = 4_096;
// The Story Club minimum is the dated price in src/config/storyClubOffer.ts at the time of the transfer. A short or late payment
// is never auto-confirmed: it goes to manual review and the owner alert.

/** SePay's "YYYY-MM-DD HH:mm:ss" read as Vietnam time; `fallback` when it is absent or not that shape. */
function bankTransactionTime(value: unknown, fallback: Date): Date {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(value.trim())) return fallback;
  const parsed = new Date(`${value.trim().replace(' ', 'T')}+07:00`);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function matchesConfiguredKey(header: unknown, configuredKey: string): boolean {
  if (typeof header !== 'string' || !header.startsWith('Apikey ')) return false;
  const supplied = Buffer.from(header.slice('Apikey '.length), 'utf8');
  const expected = Buffer.from(configuredKey, 'utf8');
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}


/** What the delivery decided, for the owner alert that runs after the response (funnel audit fix 3). */
type Decision = { status: number; memo: string; outcome: string };

function complete(res: VercelResponse, status: number, success: boolean) {
  return res.status(status).json({ success });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const decision: Decision = { status: 0, memo: 'unknown', outcome: '' };
  try {
    await respond(req, res, decision);
  } finally {
    // After the answer: one short owner email per transaction + outcome (api/_lib/paymentAlert.ts). It never
    // throws and never touches the response, so the 200/503 contract above is unchanged.
    await alertPaymentEvent(sepayAlertEvent(decision.status, decision.outcome, decision.memo, req.body));
  }
}

async function respond(req: VercelRequest, res: VercelResponse, decision: Decision) {
  const note = (channel: string, memo: string, status: string) => {
    decision.memo = memo;
    decision.outcome = status;
    console.info(channel, { memo, status });
  };
  const done = (status: number, success: boolean) => {
    decision.status = status;
    return complete(res, status, success);
  };
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return done(405, false);
  }

  const configuredKey = process.env.SEPAY_WEBHOOK_KEY?.trim();
  if (!configuredKey) return done(503, false);
  if (!matchesConfiguredKey(req.headers.authorization, configuredKey)) return done(401, false);
  if (process.env.SEPAY_AUTOCONFIRM !== '1') return done(503, false);

  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body as Record<string, unknown>
    : {};
  if (Number(req.headers['content-length'] ?? 0) > MAX_BODY_BYTES || Buffer.byteLength(JSON.stringify(body)) > MAX_BODY_BYTES) {
    return done(413, false);
  }

  if (body.transferType !== 'in') {
    note('sepay_story_club_payment', 'unknown', 'ignored_outgoing');
    return done(200, true);
  }

  const memo = canonicalPaymentMemo(body.content);
  if (!memo) {
    note('sepay_story_club_payment', 'unknown', 'needs_review');
    return done(200, true);
  }

  if (!memo.startsWith('SC-')) {
    // Holiday sets (28 Nov to 6 Dec 2026) are matched by hand like every PR product. The outcome says whether the transfer reached the
    // bank inside the dated window, so the owner alert tells Jay at a glance if a set payment arrived late (a refund, not a sale).
    // This is a label for Jay, not a price tier: the bank's own stamp is used as it is (no one-hour guard, which would swap in a
    // late delivery's receipt time), and the receipt time only when the stamp is missing or unreadable.
    const outcome = isHolidaySetMemo(memo)
      ? holidayWindowStatus(bankTransactionTime(body.transactionDate, new Date())) === 'open' ? 'needs_review_holiday_set' : 'needs_review_holiday_set_outside_window'
      : 'needs_review';
    note('sepay_product_payment', memo, outcome);
    return done(200, true);
  }

  const amount = typeof body.transferAmount === 'number' ? body.transferAmount
    : typeof body.transferAmount === 'string' && /^\d{1,12}(?:\.0+)?$/.test(body.transferAmount) ? Number(body.transferAmount)
    : Number.NaN;
  const minimum = storyClubMinimumAmountAt(sepayTransactionTime(body.transactionDate, new Date()));
  if (!Number.isSafeInteger(amount) || amount < minimum) {
    note('sepay_story_club_payment', memo, 'needs_review');
    return done(200, true);
  }

  const result = await markStoryClubReservationPaid(memo);
  if (result.ok === false) {
    if (result.reason === 'not_found') {
      note('sepay_story_club_payment', memo, 'needs_review');
      return done(200, true);
    }
    note('sepay_story_club_payment', memo, 'retry');
    return done(503, false);
  }

  note('sepay_story_club_payment', memo, result.status);
  return done(200, true);
}
