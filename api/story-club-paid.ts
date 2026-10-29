import type { VercelRequest, VercelResponse } from '@vercel/node';
import { auditOperatorAction, requireOperatorAccess } from './_lib/operatorSecurity.js';
import { markStoryClubReservationPaid } from './_lib/supabaseWriter.js';
import { logEvent } from './_lib/observability.js';

const MAX_BODY_BYTES = 256;
const AUTH = {
  endpoint: '/api/story-club-paid',
  action: 'mark_story_club_paid',
  scopedKeyEnv: 'STORY_CLUB_PAYMENT_OPERATOR_KEY',
  scopedIpAllowlistEnv: 'STORY_CLUB_PAYMENT_OPERATOR_IP_ALLOWLIST',
  allowLegacyFallback: false,
} as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body as Record<string, unknown>
    : {};
  if (Number(req.headers['content-length'] ?? 0) > MAX_BODY_BYTES || Buffer.byteLength(JSON.stringify(body)) > MAX_BODY_BYTES) {
    return res.status(413).json({ ok: false, error: 'Request too large.' });
  }
  const memo = typeof body.memo === 'string' ? body.memo.trim() : '';
  if (!/^SC-[A-Z0-9]{6}$/.test(memo)) {
    return res.status(400).json({ ok: false, error: 'A valid Story Club memo is required.' });
  }

  const access = requireOperatorAccess(req, res, AUTH);
  if (!access.ok) return;

  const result = await markStoryClubReservationPaid(memo);
  if (result.ok === false) {
    if (result.reason === 'not_found') {
      logEvent({ event: 'story_club_payment_not_found', route: AUTH.endpoint, status: 404 });
      return res.status(404).json({ ok: false, error: 'Reservation not found.' });
    }
    const status = result.reason === 'not_configured' ? 503 : result.reason === 'invalid_response' ? 502 : 503;
    logEvent({ event: 'story_club_payment_failed', route: AUTH.endpoint, status, reason: result.reason });
    return res.status(status).json({ ok: false, error: 'Payment status could not be updated.' });
  }

  auditOperatorAction(req, AUTH, { status: result.status, memo });
  logEvent({ event: 'story_club_payment_marked', route: AUTH.endpoint, status: 200, result: result.status });
  return res.status(200).json({ ok: true, status: result.status, paidAt: result.paidAt });
}
