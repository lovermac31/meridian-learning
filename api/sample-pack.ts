import type { VercelRequest, VercelResponse } from '@vercel/node';
import { contactKind } from '../src/i18n/content/samplePack.js';
import { sampleLeadNotes, writeNotionSampleLead, type SampleLead } from './_lib/notionCrmWriter.js';
import { checkRateLimit, createThrottleLogContext, getClientHash, logRateLimited } from './_lib/requestSecurity.js';
import { logEvent } from './_lib/observability.js';
import { applyCors, handlePreflight } from './_lib/corsSecurity.js';

// The free sample pack (website assessment, 27 Oct 2026; master's decision the same day): no Supabase change. Each
// sign-up goes to the Notion JE Leads CRM and to Jay by a Resend email. The form shows success when at least one of
// the two succeeded. Contact details are never logged, only their kind.
const MIN_SUBMISSION_DELAY_MS = 1500;
const MAX_SUBMISSION_AGE_MS = 1000 * 60 * 60 * 8;
const RESEND_TIMEOUT_MS = 8_000;
const NOTION_TIMEOUT_MS = 4_000;

type Input = {
  name: string; contact: string; childAge: string; teacher: boolean; consent: boolean;
  locale: string; placement: string; source: string; website: string; startedAt: string;
};

const str = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

export function coerceSampleInput(body: unknown): Input {
  const r = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  return {
    name: str(r.name, 120),
    contact: str(r.contact, 254),
    childAge: str(r.childAge, 2),
    teacher: r.teacher === true,
    consent: r.consent === true,
    locale: str(r.locale, 2),
    placement: str(r.placement, 16),
    source: str(r.source, 64),
    website: typeof r.website === 'string' ? r.website : '',
    startedAt: str(r.startedAt, 40),
  };
}

function isSpam(startedAt: string, website: string) {
  if (website.trim().length > 0 || !startedAt) return true;
  const started = new Date(startedAt).getTime();
  if (Number.isNaN(started)) return true;
  const elapsed = Date.now() - started;
  return elapsed < MIN_SUBMISSION_DELAY_MS || elapsed > MAX_SUBMISSION_AGE_MS;
}

/** The lead the CRM and the email receive, or the reason the input is not accepted. */
export function toSampleLead(input: Input, now = new Date()): SampleLead | { error: 'contact' | 'consent' } {
  const kind = contactKind(input.contact);
  if (!kind) return { error: 'contact' };
  if (!input.consent) return { error: 'consent' };
  return {
    submissionId: `JE-SP-${now.getTime().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    submittedAt: now.toISOString(),
    name: input.name,
    ...(kind === 'email' ? { email: input.contact.toLowerCase() } : { zalo: input.contact.replace(/[\s().-]/g, '') }),
    teacher: input.teacher,
    ...(/^\d{1,2}$/.test(input.childAge) ? { childAge: input.childAge } : {}),
    locale: input.locale === 'vi' ? 'vi' : 'en',
    placement: input.placement === 'products' ? 'products' : 'home',
    ...(/^[a-z0-9_-]+$/i.test(input.source) ? { source: input.source } : {}),
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
  const contact = lead.email ? `Email: ${lead.email}` : `Zalo: ${lead.zalo}`;
  const text = [
    `Free sample pack request (${who})`,
    '',
    `Name: ${lead.name || '(not given)'}`,
    contact,
    lead.childAge ? `Child's age: ${lead.childAge}` : null,
    `Reference: ${lead.submissionId}`,
    sampleLeadNotes(lead),
    '',
    'The thank-you screen showed the view-only samples and "Book Story Club on Zalo". Send the pack and follow up within 24 hours.',
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
        subject: `Free sample pack — ${who} — ${lead.email ? 'email' : 'Zalo'} (${lead.placement})`,
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
  if (isSpam(input.startedAt, input.website)) {
    logEvent({ event: 'spam_rejected', route: '/api/sample-pack', status: 400, clientHash: getClientHash(req), reason: input.website.trim() ? 'honeypot_filled' : 'submission_timing' });
    return res.status(400).json({ ok: false, error: 'Submission could not be accepted.' });
  }
  const lead = toSampleLead(input);
  if ('error' in lead) {
    logEvent({ event: 'validation_failed', route: '/api/sample-pack', status: 400, clientHash: getClientHash(req), errorFields: [lead.error], errorFieldCount: 1 });
    return res.status(400).json({ ok: false, error: lead.error });
  }

  const [notion, email] = await Promise.all([safeNotion(lead), sendEmail(lead)]);
  console.info('[sample-pack] submission', {
    submissionId: lead.submissionId,
    contactKind: lead.email ? 'email' : 'zalo',
    teacher: lead.teacher,
    placement: lead.placement,
    notionOk: notion.ok,
    notionReason: notion.reason,
    email,
  });
  if (notion.ok || email === 'sent') return res.status(200).json({ ok: true, submissionId: lead.submissionId });
  return res.status(502).json({ ok: false, error: 'not_stored' });
}
