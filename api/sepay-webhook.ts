import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';
import { markStoryClubReservationPaid } from './_lib/supabaseWriter.js';

const MAX_BODY_BYTES = 4_096;
const MINIMUM_STORY_CLUB_AMOUNT_VND = 590_000;
const MEMO_PATTERN = /(?:^|[^A-Z0-9])SC(?:[-\s]?)([A-Z0-9]{6})(?![A-Z0-9])/i;

function matchesConfiguredKey(header: unknown, configuredKey: string): boolean {
  if (typeof header !== 'string' || !header.startsWith('Apikey ')) return false;
  const supplied = Buffer.from(header.slice('Apikey '.length), 'utf8');
  const expected = Buffer.from(configuredKey, 'utf8');
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

function canonicalMemo(content: unknown): string | null {
  if (typeof content !== 'string' || content.length > 2_000) return null;
  const match = MEMO_PATTERN.exec(content);
  return match ? `SC-${match[1].toUpperCase()}` : null;
}

function complete(res: VercelResponse, status: number, success: boolean) {
  return res.status(status).json({ success });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return complete(res, 405, false);
  }

  const configuredKey = process.env.SEPAY_WEBHOOK_KEY?.trim();
  if (!configuredKey) return complete(res, 503, false);
  if (!matchesConfiguredKey(req.headers.authorization, configuredKey)) return complete(res, 401, false);
  if (process.env.SEPAY_AUTOCONFIRM !== '1') return complete(res, 503, false);

  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body as Record<string, unknown>
    : {};
  if (Number(req.headers['content-length'] ?? 0) > MAX_BODY_BYTES || Buffer.byteLength(JSON.stringify(body)) > MAX_BODY_BYTES) {
    return complete(res, 413, false);
  }

  if (body.transferType !== 'in') {
    console.info('sepay_story_club_payment', { memo: 'unknown', status: 'ignored_outgoing' });
    return complete(res, 200, true);
  }

  const memo = canonicalMemo(body.content);
  if (!memo) {
    console.info('sepay_story_club_payment', { memo: 'unknown', status: 'needs_review' });
    return complete(res, 200, true);
  }

  const amount = typeof body.transferAmount === 'number' ? body.transferAmount
    : typeof body.transferAmount === 'string' && /^\d{1,12}(?:\.0+)?$/.test(body.transferAmount) ? Number(body.transferAmount)
    : Number.NaN;
  if (!Number.isSafeInteger(amount) || amount < MINIMUM_STORY_CLUB_AMOUNT_VND) {
    console.info('sepay_story_club_payment', { memo, status: 'needs_review' });
    return complete(res, 200, true);
  }

  const result = await markStoryClubReservationPaid(memo);
  if (result.ok === false) {
    if (result.reason === 'not_found') {
      console.info('sepay_story_club_payment', { memo, status: 'needs_review' });
      return complete(res, 200, true);
    }
    console.info('sepay_story_club_payment', { memo, status: 'retry' });
    return complete(res, 503, false);
  }

  console.info('sepay_story_club_payment', { memo, status: result.status });
  return complete(res, 200, true);
}
