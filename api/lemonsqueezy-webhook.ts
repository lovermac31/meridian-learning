/**
 * Lemon Squeezy webhook (phase 2 of card payments, Jay + CEO, 2 Nov 2026). LS signs every delivery with
 * X-Signature = HMAC-SHA256(raw body, signing secret). Verified in constant time; a bad or missing signature is 401,
 * no secret configured is 503 (LS retries), GET answers 405 (the hourly probe and check:api-handlers expect it).
 *
 * What it does with a verified order_created / order_refunded: logs one structured line (event, order id, order
 * reference from custom data, amount, status, test mode; never the buyer's name or email), records an anonymous
 * ls_order event (fail-open, needs migration 20261102000002), and emails the owner once per order id + outcome
 * (api/_lib/paymentAlert.ts). Idempotent: a re-delivered event is answered 200 and does nothing more. Delivery of
 * the files is LS's job (phase 1), so there is no fulfilment here; AI Speaking credits come later.
 *
 * Imports only ./_lib and node:crypto, so it loads under plain Node ESM (the webhook-crash lesson of #256).
 * Env (names only): LEMONSQUEEZY_WEBHOOK_SECRET; the owner alert uses RESEND_API_KEY + ORDER_NOTIFY_EMAIL /
 * GET_STARTED_NOTIFY_EMAIL as the SePay alert does.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { recordServerEvent } from './_lib/eventWriter.js';
import { alertPaymentEvent } from './_lib/paymentAlert.js';

// Raw body: the signature covers the bytes LS sent, not a re-serialisation.
export const config = { api: { bodyParser: false } };

const MAX_BODY_BYTES = 64 * 1024;
const SEEN_MAX = 5_000;
const seen = new Map<string, number>();
/** Tests only. */
export function _resetLemonSqueezyWebhook() { seen.clear(); }

export function verifyLemonSqueezySignature(rawBody: string | Buffer, header: unknown, secret: string): boolean {
  if (typeof header !== 'string' || !/^[0-9a-f]{64}$/i.test(header.trim())) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest();
  const supplied = Buffer.from(header.trim(), 'hex');
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

async function readRawBody(req: VercelRequest): Promise<Buffer | null> {
  if (typeof req.body === 'string') return Buffer.from(req.body, 'utf8');
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof (req as unknown as { on?: unknown }).on !== 'function') return null;
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size <= MAX_BODY_BYTES) chunks.push(chunk);
    });
    req.on('end', () => resolve(size > MAX_BODY_BYTES ? Buffer.alloc(MAX_BODY_BYTES + 1) : Buffer.concat(chunks)));
    req.on('error', () => resolve(null));
  });
}

const str = (v: unknown, max = 64) => (typeof v === 'string' || typeof v === 'number' ? String(v).trim().slice(0, max) : '');
const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

/** The order facts an alert and a log line may carry. Nothing about the buyer. */
export function summarizeLemonSqueezyEvent(payload: unknown) {
  const p = obj(payload);
  const meta = obj(p.meta);
  const data = obj(p.data);
  const attributes = obj(data.attributes);
  const custom = obj(meta.custom_data);
  const totalCents = Number(attributes.total);
  const currency = str(attributes.currency, 3).toUpperCase() || 'USD';
  const orderRef = str(custom.order_ref, 80);
  return {
    event: str(meta.event_name, 40) || 'unknown',
    orderId: str(data.id, 40),
    orderNumber: str(attributes.order_number, 20),
    orderRef,
    productId: str(custom.product_id, 64) || orderRef.split('|')[0] || '',
    utmSource: str(custom.utm_source, 64) || undefined,
    utmContent: str(custom.utm_content, 64) || undefined,
    utmMedium: str(custom.utm_medium, 64) || undefined,
    utmCampaign: str(custom.utm_campaign, 64) || undefined,
    status: str(attributes.status, 20),
    testMode: attributes.test_mode === true,
    amount: Number.isFinite(totalCents) ? `${currency === 'USD' ? 'US$' : `${currency} `}${(totalCents / 100).toFixed(2)}` : null,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET?.trim();
  if (!secret) return res.status(503).json({ ok: false });

  const raw = await readRawBody(req);
  if (!raw) return res.status(400).json({ ok: false });
  if (raw.length > MAX_BODY_BYTES) return res.status(413).json({ ok: false });
  if (!verifyLemonSqueezySignature(raw, req.headers['x-signature'], secret)) return res.status(401).json({ ok: false });

  let payload: unknown;
  try {
    payload = JSON.parse(raw.toString('utf8'));
  } catch {
    return res.status(400).json({ ok: false });
  }
  const order = summarizeLemonSqueezyEvent(payload);
  if (!order.orderId) {
    console.info('lemonsqueezy_webhook', { event: order.event, status: 'ignored_no_order' });
    return res.status(200).json({ ok: true });
  }
  const outcome = order.event === 'order_created' ? (order.status === 'paid' ? 'paid' : 'needs_review')
    : order.event === 'order_refunded' ? 'refunded' : 'ignored';
  const key = `${order.orderId}:${outcome}`;
  const duplicate = seen.has(key);
  console.info('lemonsqueezy_webhook', { event: order.event, order: order.orderId, number: order.orderNumber, ref: order.orderRef, amount: order.amount, status: order.status, test: order.testMode, outcome, duplicate });
  if (outcome === 'ignored' || duplicate) return res.status(200).json({ ok: true });
  seen.set(key, Date.now());
  if (seen.size > SEEN_MAX) for (const k of seen.keys()) { seen.delete(k); if (seen.size <= SEEN_MAX) break; }

  // Answer LS first; the record and the owner alert follow and never change the response.
  res.status(200).json({ ok: true });
  try {
    await recordServerEvent({ event: 'ls_order', path: '/api/lemonsqueezy-webhook', product_id: order.productId || undefined, utm_source: order.utmSource, utm_content: order.utmContent, utm_medium: order.utmMedium, utm_campaign: order.utmCampaign });
  } catch (err) {
    console.warn('[lemonsqueezy-webhook] event record threw (fail-open)', err);
  }
  await alertPaymentEvent({ provider: 'lemonsqueezy', txn: order.orderId, memo: order.orderRef || order.orderNumber || 'unknown', amount: order.amount, outcome: outcome === 'refunded' ? 'needs_review' : outcome, httpStatus: 200 });
}
