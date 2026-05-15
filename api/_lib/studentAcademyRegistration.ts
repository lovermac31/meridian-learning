/**
 * Student Academy registration handler (helper, NOT a serverless function)
 * ─────────────────────────────────────────────────────────────────────────────
 * Lives under api/_lib/ so Vercel does NOT deploy it as a separate
 * serverless function. The Hobby plan caps at 12 functions; this project
 * sits at 12 with this helper extracted.
 *
 * Invoked from `api/get-started.ts` when the inbound payload sets
 * `source: "student-academy"`. The institutional get-started flow is
 * preserved unchanged — both flows share rate-limiting, Supabase write
 * conventions, and the Resend transport, but each maps to its own
 * Supabase table and its own confirmation email.
 *
 * Required env vars (all already set on the jurassic-english Vercel
 * production project):
 *   SUPABASE_URL, SUPABASE_WRITE_KEY  (or SUPABASE_SECRET_KEY /
 *                                       SUPABASE_SERVICE_ROLE_KEY fallbacks)
 *   RESEND_API_KEY
 *   GET_STARTED_FROM_EMAIL  ("Jurassic English <info@jurassicenglish.com>")
 *
 * No new env vars are introduced.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  validateStudentAcademyRegistration,
  isSpam,
  type NormalizedStudentAcademyRegistration,
} from '../../src/lib/studentAcademyRegistrationSchema.js';
import {
  writeSupabaseStudentAcademyRegistration,
  markStudentAcademyRegistrationEmailSent,
} from './supabaseWriter.js';
import { sendStudentAcademyRegistrationEmail } from './studentAcademyRegistrationEmail.js';
import {
  checkRateLimit,
  createThrottleLogContext,
  getClientIp,
  getEmailDomain,
} from './requestSecurity.js';

const ROUTE_LABEL = 'student-academy-register';
const MAX_BODY_BYTES = 16 * 1024;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX = 6;

type ApiResponse =
  | {
      ok: true;
      submissionId: string;
      emailQueued: boolean;
      message: string;
    }
  | {
      ok: false;
      error: string;
      field?: string;
    };

function json(res: VercelResponse, status: number, body: ApiResponse): void {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(JSON.stringify(body));
}

function generateSubmissionId(): string {
  const cryptoRef = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (cryptoRef?.randomUUID) return cryptoRef.randomUUID();
  return `sa-reg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function safeLogContext(submission: NormalizedStudentAcademyRegistration) {
  return {
    submissionId: submission.submissionId,
    submittedAt: submission.submittedAt,
    authProvider: submission.authProvider,
    emailDomain: getEmailDomain(submission.parentEmail),
    hasPhoneContact: Boolean(submission.phoneContact),
    hasStudentName: Boolean(submission.studentFirstName),
    mainGoal: submission.mainGoal ?? null,
    preferredContactMethod: submission.preferredContactMethod ?? null,
  };
}

/**
 * Handle a parsed student-academy registration POST.
 *
 * Caller (api/get-started.ts) is responsible for:
 *   - confirming req.method === 'POST'
 *   - parsing JSON body into `payload`
 *   - dispatching to this helper when payload.source === 'student-academy'
 *
 * This helper handles everything else: body-size, rate-limit, anti-spam,
 * validation, Supabase write, email, response.
 */
export async function handleStudentAcademyRegistration(
  req: VercelRequest,
  res: VercelResponse,
  payload: Record<string, unknown>,
): Promise<void> {
  // Body size guard
  const lengthHeader = req.headers['content-length'];
  const declaredLength = typeof lengthHeader === 'string' ? Number.parseInt(lengthHeader, 10) : NaN;
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json(res, 413, { ok: false, error: 'payload_too_large' });
  }

  // Rate-limit per IP
  const rate = await checkRateLimit(req, {
    key: `${ROUTE_LABEL}:${getClientIp(req)}`,
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
    failMode: 'closed',
  });
  if (!rate.allowed) {
    console.warn(
      '[student-academy-register] rate limit hit',
      createThrottleLogContext(req, ROUTE_LABEL, rate.retryAfterSeconds),
    );
    res.setHeader('Retry-After', String(rate.retryAfterSeconds));
    return json(res, 429, { ok: false, error: 'rate_limited' });
  }

  // Anti-spam (honeypot + minimum delay)
  if (isSpam(payload.startedAt, payload.website)) {
    console.warn('[student-academy-register] spam blocked', { route: ROUTE_LABEL });
    return json(res, 200, {
      ok: true,
      submissionId: 'spam-rejected',
      emailQueued: false,
      message: 'Registration received.',
    });
  }

  const submissionId = generateSubmissionId();
  const submittedAt = new Date().toISOString();

  // Validate
  const validation = validateStudentAcademyRegistration(payload, { submissionId, submittedAt });
  if (validation.ok !== true) {
    const failure = validation;
    return json(res, 400, {
      ok: false,
      error: failure.reason,
      field: failure.field,
    });
  }
  const submission = validation.submission;

  // Supabase insert
  const writeResult = await writeSupabaseStudentAcademyRegistration(submission);
  if (!writeResult.ok) {
    console.error('[student-academy-register] supabase write failed', {
      ...safeLogContext(submission),
      reason: writeResult.reason,
    });
    return json(res, 502, { ok: false, error: 'storage_unavailable' });
  }

  // Send confirmation email (best-effort)
  const emailResult = await sendStudentAcademyRegistrationEmail(submission);
  if (emailResult.ok) {
    await markStudentAcademyRegistrationEmailSent(writeResult.id);
  } else {
    console.error('[student-academy-register] email dispatch failed', {
      ...safeLogContext(submission),
      reason: emailResult.reason,
    });
  }

  console.info('[student-academy-register] registration accepted', {
    ...safeLogContext(submission),
    rowId: writeResult.id,
    emailQueued: emailResult.ok,
  });

  return json(res, 200, {
    ok: true,
    submissionId,
    emailQueued: emailResult.ok,
    message: emailResult.ok
      ? 'Your Student Academy registration has been received. Please check your email for confirmation and next steps.'
      : 'Your Student Academy registration has been received. We will follow up by email shortly.',
  });
}
