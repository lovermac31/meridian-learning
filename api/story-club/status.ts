import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStoryClubPaymentStatus } from '../_lib/supabaseWriter.js';
import { checkRateLimit, logRateLimited } from '../_lib/requestSecurity.js';

const MEMO_PATTERN = /^SC-[A-Z0-9]{6}$/;

// Two intents on one function (no new Vercel function, P5c 15 Nov 2026):
//   ?memo=SC-XXXXXX  legacy poll of the pre-P5c page: {paid: boolean}; malformed and unknown memos read as unpaid.
//   ?code=SC-XXXXXX  the shared pay-step status (src/lib/payStatus.ts): 200 {status: "waiting"|"received"} and nothing else;
//                    400 {error: "unknown_code"} for anything that is not a Story Club code (format only, no lookup, so it is
//                    no oracle: an unknown well-formed code answers "waiting" like an unpaid one); 429 {error: "rate_limited"};
//                    503 {error: "unavailable"}.
// Both read only story_club_reservations.paid_at for that one memo with the server key. Same-origin only: no CORS headers.
// Nothing about the payer exists in that table; nothing is logged beyond the rate-limit hash.
type Body = { paid: boolean } | { status: 'waiting' | 'received' } | { error: 'unknown_code' | 'rate_limited' | 'unavailable' | 'method_not_allowed' };

function send(res: VercelResponse, status: number, body: Body) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  return res.status(status).json(body);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const rawCode = req.query?.code;
  const codeIntent = rawCode !== undefined;
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return send(res, 405, codeIntent ? { error: 'method_not_allowed' } : { paid: false });
  }

  const limit = await checkRateLimit(req, { key: 'story-club-status', windowMs: 60_000, max: 30, failMode: 'closed' });
  if (!limit.allowed) {
    logRateLimited(req, 'story-club-status', limit);
    if (codeIntent) res.setHeader('Retry-After', String(limit.retryAfterSeconds));
    return send(res, 429, codeIntent ? { error: 'rate_limited' } : { paid: false });
  }

  if (codeIntent) {
    const code = typeof rawCode === 'string' ? rawCode.trim().toUpperCase() : '';
    if (!MEMO_PATTERN.test(code)) return send(res, 400, { error: 'unknown_code' });
    const result = await getStoryClubPaymentStatus(code);
    if (!result.ok) return send(res, 503, { error: 'unavailable' });
    return send(res, 200, { status: result.paid ? 'received' : 'waiting' });
  }

  const rawMemo = req.query?.memo;
  const memo = typeof rawMemo === 'string' ? rawMemo.trim().toUpperCase() : '';
  // Treat malformed and unknown memos identically to avoid creating an enumeration oracle.
  if (!MEMO_PATTERN.test(memo)) return send(res, 200, { paid: false });

  const result = await getStoryClubPaymentStatus(memo);
  if (!result.ok) return send(res, 503, { paid: false });
  return send(res, 200, { paid: result.paid });
}
