import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkRateLimit, createThrottleLogContext, logRateLimited } from './_lib/requestSecurity.js';
import { applyCors, handlePreflight } from './_lib/corsSecurity.js';
import { recordServerEvent } from './_lib/eventWriter.js';

export const ALLOWED_EVENTS = [
  'pricing_view',
  'checkout_start',
  'paypal_return',
  'sample_open',
  'video_play',
  'lead_submit',
  'reserve_view',
  'reserve_submit',
  'pay_instructions_shown',
] as const;

export type AllowedEvent = (typeof ALLOWED_EVENTS)[number];

const FORBIDDEN_PII_KEYS = [
  'email',
  'e_mail',
  'mail',
  'user_id',
  'userid',
  'ip',
  'cookie',
  'phone',
  'name',
  'fullname',
  'first_name',
  'last_name',
  'token',
];

const MAX_BODY_BYTES = 1024; // 1 KB body cap

export type ValidatedEventData = {
  event: AllowedEvent;
  path?: string;
  product_id?: string;
  utm_source?: string;
  utm_content?: string;
  locale?: string;
};

export function validateEventPayload(body: unknown):
  | { ok: true; data: ValidatedEventData }
  | { ok: false; error: string; status: number } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'invalid_payload', status: 400 };
  }

  const raw = body as Record<string, unknown>;
  const keys = Object.keys(raw);

  // Assert NO PII fields present
  for (const k of keys) {
    const normalized = k.toLowerCase().replace(/[-_]/g, '');
    for (const forbidden of FORBIDDEN_PII_KEYS) {
      if (normalized === forbidden.replace(/[-_]/g, '')) {
        return { ok: false, error: 'pii_rejected', status: 400 };
      }
    }
  }

  const event = raw.event;
  if (typeof event !== 'string' || !ALLOWED_EVENTS.includes(event as AllowedEvent)) {
    return { ok: false, error: 'unknown_event', status: 400 };
  }

  const str = (v: unknown, max: number): string | undefined => {
    if (typeof v !== 'string') return undefined;
    const trimmed = v.trim().slice(0, max);
    return trimmed || undefined;
  };

  return {
    ok: true,
    data: {
      event: event as AllowedEvent,
      path: str(raw.path, 256),
      product_id: str(raw.product_id, 64),
      utm_source: str(raw.utm_source, 64),
      utm_content: str(raw.utm_content, 64),
      locale: str(raw.locale, 8),
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreflight(req, res)) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }
  applyCors(req, res);

  // 1 KB body cap
  const contentLength = Number(req.headers['content-length'] ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return res.status(413).json({ ok: false, error: 'payload_too_large' });
  }

  const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
  if (Buffer.byteLength(bodyStr, 'utf8') > MAX_BODY_BYTES) {
    return res.status(413).json({ ok: false, error: 'payload_too_large' });
  }

  // Rate limiter (fail-open for anonymous events)
  const rateLimit = await checkRateLimit(req, {
    key: 'event-counter',
    windowMs: 60 * 1000,
    max: 60,
    failMode: 'open',
  });

  if (!rateLimit.allowed) {
    console.warn('[event] request throttled', createThrottleLogContext(req, '/api/event', rateLimit.retryAfterSeconds));
    logRateLimited(req, '/api/event', rateLimit);
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds));
    return res.status(429).json({ ok: false, error: 'Too many requests.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ ok: false, error: 'invalid_json' });
    }
  }

  const validation = validateEventPayload(body);
  if (validation.ok === false) {
    return res.status(validation.status).json({ ok: false, error: validation.error });
  }

  // Record to Supabase (fails open if DB unconfigured or table unmigrated)
  try {
    await recordServerEvent(validation.data);
  } catch (err) {
    console.warn('[event] failed to record event to database (fail-open)', err);
  }

  return res.status(204).end();
}
