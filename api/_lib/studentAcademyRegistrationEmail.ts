/**
 * Student Academy registration — confirmation email
 * ─────────────────────────────────────────────────────────────────────────────
 * Sends a parent-facing HTML confirmation email via Resend after a successful
 * /api/student-academy-register insert. Mirrors the dispatch conventions used
 * by `api/get-started.ts` (AbortController timeout, never throws, returns
 * typed result).
 *
 * Required env vars (already set on the jurassic-english Vercel project):
 *   RESEND_API_KEY            — backend-only Resend API key
 *   GET_STARTED_FROM_EMAIL    — verified Resend sender, e.g.
 *                                 "Jurassic English <info@jurassicenglish.com>"
 *
 * Claims-safety contract:
 *   The plain-text body and HTML body MUST contain only language that has
 *   been pre-approved by the operator: no score guarantees, no "AI tutor"
 *   framing, no pricing, no internal manuals, no Drive references, no
 *   reseller/wholesale terminology.
 */

import type { NormalizedStudentAcademyRegistration } from '../../src/lib/studentAcademyRegistrationSchema.js';
import { logEvent } from './observability.js';

const RESEND_TIMEOUT_MS = 7_000;
const CANONICAL_URL = 'https://jurassicenglish.com/student-academy';
const SUPPORT_EMAIL = 'info@jurassicenglish.com';

export type SendEmailResult =
  | { ok: true; reason: 'sent' }
  | { ok: false; reason: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function firstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return '';
  const parts = trimmed.split(/\s+/);
  return parts[0] || '';
}

/**
 * Builds the parent-facing confirmation email — claims-safe copy.
 * The HTML uses inline-only styling so it survives Gmail / Outlook / Apple
 * Mail rendering. No external images required.
 */
export function buildStudentAcademyRegistrationEmail(
  registration: NormalizedStudentAcademyRegistration,
): { subject: string; html: string; text: string } {
  const subject = 'Your Jurassic English™ Student Academy Registration';
  const greetingName = firstName(registration.parentFullName);
  const greeting = greetingName.length > 0 ? `Hello ${escapeHtml(greetingName)},` : 'Hello,';

  const text = [
    `${greetingName ? `Hello ${greetingName},` : 'Hello,'}`,
    '',
    'Thank you for registering your interest in Jurassic English™ Student Academy.',
    '',
    'We received your registration and will review the learner details you provided. The next step is to confirm the most appropriate pathway and, when suitable, arrange a Student Thinking Diagnostic.',
    '',
    'You can access the Student Academy page here:',
    CANONICAL_URL,
    '',
    'The Student Academy is designed to help learners read deeper, speak with more confidence, write with evidence, and build visible academic reasoning through literature-based study.',
    '',
    'There is no fail in the diagnostic process. We do not promise scores. We build the reasoning the bands reward.',
    '',
    `If you have questions, reply to this email or contact ${SUPPORT_EMAIL}.`,
    '',
    'Jurassic English™',
    'A trademark of World Wise Learning.',
    '',
    `© ${new Date().getFullYear()} World Wise Learning.`,
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f1ea;font-family:Aptos,'Segoe UI','Helvetica Neue',Arial,sans-serif;color:#112a46;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f1ea;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid rgba(11,59,36,0.08);border-radius:14px;overflow:hidden;">
            <!-- Header -->
            <tr>
              <td style="background:#0b3b24;padding:28px 32px;color:#f4f1ea;">
                <div style="font-size:20px;font-weight:600;letter-spacing:-0.3px;">
                  Jurassic English<span style="color:#f26419;font-size:11px;vertical-align:top;">&#8482;</span> Student Academy
                </div>
                <div style="font-size:13px;color:rgba(244,241,234,0.75);margin-top:4px;">
                  Registration confirmation
                </div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px;font-size:15px;line-height:1.65;color:#112a46;">
                <p style="margin:0 0 16px 0;">${greeting}</p>
                <p style="margin:0 0 16px 0;">
                  Thank you for registering your interest in Jurassic English<span style="color:#f26419;font-size:10px;vertical-align:super;">&#8482;</span> Student Academy.
                </p>
                <p style="margin:0 0 16px 0;">
                  We received your registration and will review the learner details you provided.
                  The next step is to confirm the most appropriate pathway and, when suitable, arrange a Student Thinking Diagnostic.
                </p>

                <!-- CTA button -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
                  <tr>
                    <td bgcolor="#f26419" style="border-radius:8px;">
                      <a href="${escapeHtml(CANONICAL_URL)}"
                         style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                        Open Student Academy
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 16px 0;">
                  The Student Academy is designed to help learners read deeper, speak with more confidence, write with evidence, and build visible academic reasoning through literature-based study.
                </p>
                <p style="margin:0 0 20px 0;padding:14px 16px;background:#f4f1ea;border-left:3px solid #c5a059;border-radius:4px;font-size:14px;color:#3a4358;">
                  There is no fail in the diagnostic process. We do not promise scores. We build the reasoning the bands reward.
                </p>
                <p style="margin:0 0 8px 0;font-size:14px;color:#3a4358;">
                  If you have questions, reply to this email or contact
                  <a href="mailto:${escapeHtml(SUPPORT_EMAIL)}" style="color:#0b3b24;">${escapeHtml(SUPPORT_EMAIL)}</a>.
                </p>
                <p style="margin:24px 0 0 0;font-size:13px;color:#6b7280;">
                  Canonical link: <a href="${escapeHtml(CANONICAL_URL)}" style="color:#0b3b24;">${escapeHtml(CANONICAL_URL)}</a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:18px 32px;background:#f4f1ea;border-top:1px solid rgba(11,59,36,0.08);font-size:12px;color:#6b7280;">
                Jurassic English<span style="color:#f26419;font-size:9px;vertical-align:super;">&#8482;</span> &middot; A trademark of World Wise Learning.
                <br />
                &copy; ${new Date().getFullYear()} World Wise Learning. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}

/**
 * Sends the parent confirmation via Resend. Never throws.
 *
 * Returns:
 *   { ok: true, reason: 'sent' }                       — Resend accepted the email
 *   { ok: false, reason: 'missing_api_key' }           — RESEND_API_KEY not set
 *   { ok: false, reason: 'missing_from_email' }        — GET_STARTED_FROM_EMAIL not set
 *   { ok: false, reason: 'resend_<status>' }           — Resend returned non-2xx
 *   { ok: false, reason: 'resend_timeout' }            — request exceeded RESEND_TIMEOUT_MS
 *   { ok: false, reason: 'transport_error: <message>' }  — network / fetch threw
 */
export async function sendStudentAcademyRegistrationEmail(
  registration: NormalizedStudentAcademyRegistration,
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.GET_STARTED_FROM_EMAIL?.trim();

  if (!apiKey) {
    logEvent({
      event: 'email_failed',
      route: '/api/get-started#student-academy',
      transport: 'resend',
      kind: 'student_academy_confirmation',
      submissionId: registration.submissionId,
      failureMode: 'skipped',
      reason: 'missing_api_key',
    });
    return { ok: false, reason: 'missing_api_key' };
  }
  if (!fromEmail) {
    logEvent({
      event: 'email_failed',
      route: '/api/get-started#student-academy',
      transport: 'resend',
      kind: 'student_academy_confirmation',
      submissionId: registration.submissionId,
      failureMode: 'skipped',
      reason: 'missing_from_email',
    });
    return { ok: false, reason: 'missing_from_email' };
  }

  const { subject, html, text } = buildStudentAcademyRegistrationEmail(registration);

  const abortController = new AbortController();
  const abortTimer = setTimeout(() => abortController.abort(), RESEND_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: abortController.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:     fromEmail,
        to:       [registration.parentEmail],
        reply_to: SUPPORT_EMAIL,
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      // Don't surface provider error text to the user — keep it server-side.
      const body = await response.text().catch(() => '(unreadable)');
      console.error('[student-academy-email] resend rejected', {
        status: response.status,
        body:   body.slice(0, 300),
      });
      logEvent({
        event: 'email_failed',
        route: '/api/get-started#student-academy',
        transport: 'resend',
        kind: 'student_academy_confirmation',
        status: response.status,
        submissionId: registration.submissionId,
        failureMode: 'failed',
        reason: `resend_${response.status}`,
      });
      return { ok: false, reason: `resend_${response.status}` };
    }

    logEvent({
      event: 'email_sent',
      route: '/api/get-started#student-academy',
      transport: 'resend',
      kind: 'student_academy_confirmation',
      submissionId: registration.submissionId,
    });
    return { ok: true, reason: 'sent' };
  } catch (error: unknown) {
    const isTimeout = (error as { name?: string })?.name === 'AbortError';
    const message = (error as { message?: string })?.message ?? 'unknown';
    console.error('[student-academy-email] transport error', {
      timeout: isTimeout,
      message: message.slice(0, 200),
    });
    // `transport_error: <message>` returned to caller for parity; canonical
    // event records only the stable category code so dashboards don't churn.
    logEvent({
      event: 'email_failed',
      route: '/api/get-started#student-academy',
      transport: 'resend',
      kind: 'student_academy_confirmation',
      submissionId: registration.submissionId,
      failureMode: 'failed',
      reason: isTimeout ? 'resend_timeout' : 'transport_error',
    });
    return {
      ok: false,
      reason: isTimeout ? 'resend_timeout' : `transport_error: ${message}`,
    };
  } finally {
    clearTimeout(abortTimer);
  }
}
