import { createHash } from 'node:crypto';
import { paidOffer } from '../src/config/payment.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { normalizeVietnamesePhone, sampleContactError, samplePackContent } from '../src/i18n/content/samplePack.js';
import { sampleLeadNotes, writeNotionSampleLead, type SampleLead } from './_lib/notionCrmWriter.js';
import { checkRateLimit, createThrottleLogContext, getClientHash, logRateLimited } from './_lib/requestSecurity.js';
import { logEvent } from './_lib/observability.js';
import { createStoryClubReservation } from './_lib/supabaseWriter.js';
import { applyCors, handlePreflight } from './_lib/corsSecurity.js';

// The free sample pack (website assessment, 27 Oct 2026; master's decision the same day): no Supabase change. Each
// sign-up goes to the Notion JE Leads CRM and to Jay by a Resend email. The form shows success when at least one of
// the two succeeded. Contact details are never logged, only their kind.
const MIN_SUBMISSION_DELAY_MS = 30_000;
const MIN_RESERVE_SUBMISSION_DELAY_MS = 1_500;
const MAX_SUBMISSION_AGE_MS = 1000 * 60 * 60 * 8;
const RESEND_TIMEOUT_MS = 8_000;
const NOTION_TIMEOUT_MS = 4_000;

type Input = {
  name: string; phone: string; email: string; location: string; childAge: string; teacher: boolean; consent: boolean;
  locale: string; placement: string; source: string; website: string; startedAt: string;
  product?: string; submissionKey?: string; intent?: string; utm_source?: string; utm_content?: string; utm_medium?: string; utm_campaign?: string; utm_term?: string; group?: string;
};

const str = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

export function coerceSampleInput(body: unknown): Input {
  const r = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  return {
    name: str(r.name, 120),
    phone: str(r.phone, 32),
    email: str(r.email, 254),
    location: str(r.location, 2),
    childAge: str(r.childAge, 2),
    teacher: r.teacher === true,
    consent: r.consent === true,
    locale: str(r.locale, 2),
    placement: str(r.placement, 16),
    source: str(r.source, 64),
    website: typeof r.website === 'string' ? r.website : '',
    startedAt: str(r.startedAt, 40),
    product: str(r.product, 32),
    intent: str(r.intent, 24),
    submissionKey: str(r.submissionKey, 36),
    utm_source: str(r.utm_source, 64),
    utm_content: str(r.utm_content, 64),
    group: str(r.group, 32),
    utm_medium: str(r.utm_medium, 64),
    utm_campaign: str(r.utm_campaign, 64),
    utm_term: str(r.utm_term, 64),
  };
}

function isSpam(startedAt: string, website: string, product: string, intent?: string) {
  // prepare_payment is an automated memo-creation call made by the QR-first checkout,
  // not a human form submission. The timing gate was rejecting it and blocking the QR.
  if (intent === 'prepare_payment') {
    return website.trim().length > 0;
  }
  if (website.trim().length > 0 || !startedAt) return true;
  const started = new Date(startedAt).getTime();
  if (Number.isNaN(started)) return true;
  const elapsed = Date.now() - started;
  return elapsed < (product ? MIN_RESERVE_SUBMISSION_DELAY_MS : MIN_SUBMISSION_DELAY_MS) || elapsed > MAX_SUBMISSION_AGE_MS;
}

/** The lead the CRM and the email receive, or the reason the input is not accepted. */
export function toSampleLead(input: Input, now = new Date()): SampleLead | { error: 'contact' | 'phone' | 'email' | 'consent' | 'name' | 'age' | 'group' | 'product' | 'submission' } {
  if (input.product && !paidOffer(input.product)) return { error: 'product' };
  if (input.product) {
    if (!normalizeVietnamesePhone(input.phone)) return { error: 'phone' };
    if (!input.name.trim()) return { error: 'name' };
    if (!input.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || input.email.length > 254) return { error: 'email' };
    // Simple ISO 3166-1 alpha-2 check. Full country validation is done on the client with libphonenumber-js.
    if (!/^[A-Z]{2}$/.test(input.location)) return { error: 'contact' };
    const age = Number(input.childAge);
    if (input.childAge && (!Number.isInteger(age) || age < 5 || age > 8)) return { error: 'age' };
    if (input.group && !/^(sat-0900|flexible)$/.test(input.group)) return { error: 'group' };
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.submissionKey ?? '')) return { error: 'submission' };
  }
  const contactError = sampleContactError(input.phone, input.email);
  if (contactError) return { error: contactError };
  if (!input.consent) return { error: 'consent' };
  const phone = input.phone.trim() ? normalizeVietnamesePhone(input.phone) : null;
  return {
    submissionId: input.product
      ? `JE-${paidOffer(input.product)!.prefix}-${input.submissionKey!.toLowerCase()}`
      : `JE-SP-${now.getTime().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    submittedAt: now.toISOString(),
    name: input.name,
    ...(input.email.trim() ? { email: input.email.trim().toLowerCase() } : {}),
    ...(phone ? { zalo: phone } : {}),
    teacher: input.teacher,
    ...(/^\d{1,2}$/.test(input.childAge) ? { childAge: input.childAge } : {}),
    locale: input.locale === 'vi' ? 'vi' : 'en',
    placement: input.placement === 'products' ? 'products' : 'home',
    ...(/^[a-z0-9_-]+$/i.test(input.source) ? { source: input.source } : {}),
    ...(input.product ? {
      product: input.product,
      location: input.location,
      ...(input.group ? { group: input.group as 'sat-0900' | 'flexible' } : {}),
      ...( /^[a-z0-9 _.-]+$/i.test(input.utm_medium ?? '') ? { utmMedium: input.utm_medium } : {}),
      ...( /^[a-z0-9 _.-]+$/i.test(input.utm_campaign ?? '') ? { utmCampaign: input.utm_campaign } : {}),
      ...( /^[a-z0-9 _.-]+$/i.test(input.utm_term ?? '') ? { utmTerm: input.utm_term } : {}),
      ...( /^[a-z0-9_-]+$/i.test(input.utm_source ?? '') ? { utmSource: input.utm_source } : {}),
      ...( /^[a-z0-9_-]+$/i.test(input.utm_content ?? '') ? { utmContent: input.utm_content } : {}),
    } : {}),
  };
}

async function safeNotion(lead: SampleLead) {
  return Promise.race([
    writeNotionSampleLead(lead),
    new Promise<{ ok: false; reason: string }>((resolve) => setTimeout(() => resolve({ ok: false, reason: 'timeout' }), NOTION_TIMEOUT_MS)),
  ]).catch(() => ({ ok: false as const, reason: 'threw' }));
}

async function sendEmail(lead: SampleLead): Promise<'sent' | 'skipped' | 'failed'> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.GET_STARTED_NOTIFY_EMAIL?.trim();
  const from = process.env.GET_STARTED_FROM_EMAIL?.trim() || 'onboarding@resend.dev';
  if (!apiKey || !to) return 'skipped';
  const who = lead.teacher ? 'Teacher' : 'Parent';
  const isReserve = !!lead.product;
  const contact = lead.email ? `Email: ${lead.email}` : `Zalo: ${lead.zalo}`;
  const text = [
    `${isReserve ? `${lead.product} reserve request` : 'Free sample pack request'} (${who})`,
    '',
    `Name: ${lead.name || '(not given)'}`,
    contact,
    lead.childAge ? `Child's age: ${lead.childAge}` : null,
    `Reference: ${lead.submissionId}`,
    sampleLeadNotes(lead),
    '',
    isReserve ? 'The reserve thank-you screen showed the payment amount, transfer memo and available QR or Zalo fallback.' : 'The thank-you screen showed the view-only samples and "Book Story Club on Zalo". Send the pack and follow up within 24 hours.',
  ].filter((line) => line !== null).join('\n');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RESEND_TIMEOUT_MS);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: controller.signal,
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        ...(lead.email ? { reply_to: lead.email } : {}),
        subject: `${isReserve ? `${lead.product} reserve` : 'Free sample pack'} — ${who} — ${lead.email ? 'email' : 'Zalo'} (${lead.placement})`,
        text,
      }),
    });
    return res.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  } finally {
    clearTimeout(timer);
  }
}

/** Stable across retries; product namespace prevents cross-product memo reuse. */
export function createPaidMemo(product: string, submissionId: string): string {
  const offer = paidOffer(product);
  if (!offer || !submissionId) throw new Error('Invalid reservation');
  return `${offer.prefix}-${(createHash('sha256').update(`${product}:${submissionId}`).digest().readUIntBE(0, 6) % 36 ** 6).toString(36).toUpperCase().padStart(6, '0')}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreflight(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  applyCors(req, res);

  const rateLimit = await checkRateLimit(req, { key: 'sample-pack', windowMs: 10 * 60 * 1000, max: 5, failMode: 'closed' });
  if (!rateLimit.allowed) {
    console.warn('[sample-pack] request throttled', createThrottleLogContext(req, '/api/sample-pack', rateLimit.retryAfterSeconds));
    logRateLimited(req, '/api/sample-pack', rateLimit);
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds));
    return res.status(429).json({ ok: false, error: 'Too many requests. Please wait a few minutes and try again.' });
  }

  const input = coerceSampleInput(req.body);
  if (isSpam(input.startedAt, input.website, input.product, input.intent)) {
    logEvent({ event: 'spam_rejected', route: '/api/sample-pack', status: 400, clientHash: getClientHash(req), reason: input.website.trim() ? 'honeypot_filled' : 'submission_timing' });
    return res.status(400).json({ ok: false, error: 'Submission could not be accepted.' });
  }

  // Create the priced order reference before collecting contact details, so the buyer can see and scan the QR first.
  if (input.intent === 'prepare_payment') {
    const offer = paidOffer(input.product ?? '');
    if (!offer || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.submissionKey ?? '')) {
      return res.status(400).json({ ok: false, error: 'invalid_order' });
    }
    const submissionId = `JE-${offer.prefix}-${input.submissionKey!.toLowerCase()}`;
    let memo: string;
    if (input.product === 'story-club') {
      const reservation = await createStoryClubReservation(submissionId, 'flexible');
      if (!reservation.ok) {
        logEvent({ event: 'story_club_reservation_failed', route: '/api/sample-pack', status: 503, reason: reservation.reason });
        return res.status(503).json({ ok: false, error: 'reserve_temporarily_unavailable' });
      }
      memo = reservation.memo;
    } else {
      memo = createPaidMemo(input.product!, submissionId);
    }
    return res.status(200).json({ ok: true, submissionId, memo });
  }

  const lead = toSampleLead(input);
  if ('error' in lead) {
    logEvent({ event: 'validation_failed', route: '/api/sample-pack', status: 400, clientHash: getClientHash(req), errorFields: [lead.error], errorFieldCount: 1 });
    const locale = input.locale === 'vi' ? 'vi' : 'en';
    if (input.product) {
      const message = locale === 'vi' ? 'Vui lòng kiểm tra thông tin đặt chỗ và số điện thoại.' : 'Please check your reserve details and phone number.';
      return res.status(400).json({ ok: false, error: lead.error, message });
    }
    return res.status(400).json({ ok: false, error: lead.error, message: samplePackContent[locale].errors[lead.error] });
  }

  let storyClubMemo: string | undefined;
  if (lead.product === 'story-club') {
    const reservation = await createStoryClubReservation(lead.submissionId, lead.group || 'flexible');
    if (!reservation.ok) {
      logEvent({ event: 'story_club_reservation_failed', route: '/api/sample-pack', status: 503, reason: reservation.reason });
      return res.status(503).json({ ok: false, error: 'reserve_temporarily_unavailable' });
    }
    storyClubMemo = reservation.memo;
  }

  if (lead.product) {
    const offer = paidOffer(lead.product)!;
    storyClubMemo ??= createPaidMemo(lead.product, lead.submissionId);
    lead.paymentMemo = storyClubMemo;
    lead.paymentAmount = offer.amount;
  }
  const notionPromise = safeNotion(lead);
  const emailPromise = notionPromise.then((result) =>
    result.ok && result.reason === 'duplicate_skipped' ? 'skipped' : sendEmail(lead));
  const [notion, email] = await Promise.all([notionPromise, emailPromise]);
  console.info('[sample-pack] submission', {
    submissionId: lead.submissionId,
    contactKind: lead.zalo ? 'zalo' : 'email',
    teacher: lead.teacher,
    placement: lead.placement,
    notionOk: notion.ok,
    notionReason: notion.reason,
    email,
  });
  if (notion.ok || ((!lead.product || lead.product === 'story-club') && email === 'sent')) return res.status(200).json({ ok: true, submissionId: lead.submissionId, ...(storyClubMemo ? { memo: storyClubMemo } : {}) });
  return res.status(502).json({ ok: false, error: 'not_stored' });
}
