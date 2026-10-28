import type { VercelRequest, VercelResponse } from '@vercel/node';
import { recordServerEvent } from '../_lib/eventWriter.js';

export const ZALO_TARGET = 'https://zalo.me/84396085076';

function cleanStr(val: unknown, max = 64): string | undefined {
  if (Array.isArray(val)) val = val[0];
  if (typeof val !== 'string') return undefined;
  const trimmed = val.trim().slice(0, max);
  return trimmed || undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Support both GET and HEAD
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const url = new URL(req.url ?? '/', 'https://jurassicenglish.com');
  const product = cleanStr(req.query?.product) ?? cleanStr(url.searchParams.get('product'));
  const utmSource = cleanStr(req.query?.utm_source) ?? cleanStr(url.searchParams.get('utm_source'));
  const utmContent = cleanStr(req.query?.utm_content) ?? cleanStr(url.searchParams.get('utm_content'));
  const locale = cleanStr(req.query?.locale, 8) ?? cleanStr(url.searchParams.get('locale'), 8);

  const path = product ? `/go/zalo/${product}` : '/go/zalo';

  // Fail-open event logging: database errors never prevent the redirect
  try {
    await recordServerEvent({
      event: 'zalo_click',
      path,
      product_id: product,
      utm_source: utmSource,
      utm_content: utmContent,
      locale,
    });
  } catch (err) {
    console.warn('[go/zalo] event recording threw (fail-open)', err);
  }

  res.setHeader('Location', ZALO_TARGET);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  return res.status(302).end();
}
