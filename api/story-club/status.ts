import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStoryClubPaymentStatus } from '../_lib/supabaseWriter.js';
import { checkRateLimit, logRateLimited } from '../_lib/requestSecurity.js';

const MEMO_PATTERN = /^SC-[A-Z0-9]{6}$/;

function response(res: VercelResponse, status: number, paid: boolean) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  return res.status(status).json({ paid });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return response(res, 405, false);
  }

  const limit = await checkRateLimit(req, { key: 'story-club-status', windowMs: 60_000, max: 30, failMode: 'closed' });
  if (!limit.allowed) {
    logRateLimited(req, 'story-club-status', limit);
    return response(res, 429, false);
  }

  const rawMemo = req.query?.memo;
  const memo = typeof rawMemo === 'string' ? rawMemo.trim().toUpperCase() : '';
  // Treat malformed and unknown memos identically to avoid creating an enumeration oracle.
  if (!MEMO_PATTERN.test(memo)) return response(res, 200, false);

  const result = await getStoryClubPaymentStatus(memo);
  if (!result.ok) return response(res, 503, false);
  return response(res, 200, result.paid);
}
