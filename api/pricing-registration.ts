import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  normaliseBuyerType,
  normaliseMAOI,
  generateRegistrationId,
  map as crmMap,
} from './_lib/je-crm-mapper.js';
import { buildCrmIntakeEmail } from './_lib/pricingRegistrationNotification.js';
import { writeNotionLead } from './_lib/notionCrmWriter.js';
import {
  checkRateLimit,
  createThrottleLogContext,
} from './_lib/requestSecurity.js';

const MIN_SUBMISSION_DELAY_MS = 1500;
const MAX_SUBMISSION_AGE_MS = 1000 * 60 * 60 * 8;
const RESEND_TIMEOUT_MS = 8_000;

const buyerTypeOptions = [
  'school_administrator',
  'teacher_cpd_lead',
  'parent_guardian',
  'institutional_partner',
  'other',
] as const;

const interestAreaOptions = [
  'teacher_training',
  'school_licensing',
  'curriculum_review',
  'academic_consulting',
  'institutional_partnerships',
  'digital_reasoning_engine',
] as const;

const preferredContactMethodOptions = [
  'email',
  'phone_whatsapp',
  'either',
] as const;

type BuyerType = (typeof buyerTypeOptions)[number];
type InterestArea = (typeof interestAreaOptions)[number];
type PreferredContactMethod = (typeof preferredContactMethodOptions)[number];

type PricingRegistrationValues = {
  fullName: string;
  workEmail: string;
  roleTitle: string;
  organizationName: string;
  countryRegion: string;
  buyerType: BuyerType | '';
  interestArea: InterestArea | '';
  organizationSize: string;
  phoneWhatsapp: string;
  preferredContactMethod: PreferredContactMethod | '';
  timeline: string;
  message: string;
  contactConsent: boolean;
  website: string;
  startedAt: string;
};

type NormalizedPricingRegistration = {
  submissionId: string;
  submittedAt: string;
  fullName: string;
  workEmail: string;
  roleTitle: string;
  organizationName: string;
  countryRegion: string;
  buyerType: BuyerType;
  interestArea: InterestArea;
  organizationSize?: string;
  phoneWhatsapp?: string;
  preferredContactMethod?: PreferredContactMethod;
  timeline?: string;
  message?: string;
  contactConsent: true;
};

type ValidationErrorMap = Partial<Record<keyof PricingRegistrationValues, string>>;

type NotificationResult =
  | { status: 'sent'; diagnostics?: Record<string, unknown> }
  | { status: 'skipped'; reason: string; diagnostics?: Record<string, unknown> }
  | { status: 'failed'; reason: string; diagnostics?: Record<string, unknown> };

type MailConfig = {
  apiKey: string | null;
  notifyEmail: string | null;
  fromEmail: string;
  isTransportReady: boolean;
  diagnosticReason: 'missing_api_key' | 'missing_notify_email' | null;
};

type MailConfigDiagnostics = {
  hasApiKey: boolean;
  hasNotifyEmailEnv: boolean;
  hasFromEmailEnv: boolean;
  notifyEmailReady: boolean;
  fromEmailReady: boolean;
  isTransportReady: boolean;
  diagnosticReason: MailConfig['diagnosticReason'];
};

function resolveMailConfig(): MailConfig {
  const apiKey = process.env.RESEND_API_KEY?.trim() || null;
  const notifyEmail = process.env.GET_STARTED_NOTIFY_EMAIL?.trim() || null;
  const fromEmail = process.env.GET_STARTED_FROM_EMAIL?.trim() || 'onboarding@resend.dev';

  if (!apiKey) {
    return {
      apiKey: null,
      notifyEmail,
      fromEmail,
      isTransportReady: false,
      diagnosticReason: 'missing_api_key',
    };
  }

  if (!notifyEmail) {
    return {
      apiKey,
      notifyEmail: null,
      fromEmail,
      isTransportReady: false,
      diagnosticReason: 'missing_notify_email',
    };
  }

  return {
    apiKey,
    notifyEmail,
    fromEmail,
    isTransportReady: true,
    diagnosticReason: null,
  };
}

function getMailConfigDiagnostics(mailConfig: MailConfig): MailConfigDiagnostics {
  return {
    hasApiKey: Boolean(process.env.RESEND_API_KEY?.trim()),
    hasNotifyEmailEnv: Boolean(process.env.GET_STARTED_NOTIFY_EMAIL?.trim()),
    hasFromEmailEnv: Boolean(process.env.GET_STARTED_FROM_EMAIL?.trim()),
    notifyEmailReady: Boolean(mailConfig.notifyEmail),
    fromEmailReady: Boolean(mailConfig.fromEmail.trim()),
    isTransportReady: mailConfig.isTransportReady,
    diagnosticReason: mailConfig.diagnosticReason,
  };
}

function getEmailDomain(value?: string) {
  if (!value) return null;
  const match = value.match(/<([^>]+)>/);
  const email = (match?.[1] || value).trim().toLowerCase();
  const [, domain] = email.split('@');
  return domain || null;
}

function redactProviderMessage(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220);
}

function parseProviderFailure(status: number, body: string) {
  const contentType = 'application/json';

  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    return {
      providerStatus: status,
      providerCategory:
        typeof parsed.name === 'string'
          ? parsed.name
          : typeof parsed.type === 'string'
            ? parsed.type
            : 'provider_error',
      providerCode:
        typeof parsed.code === 'string'
          ? parsed.code
          : typeof parsed.statusCode === 'number'
            ? String(parsed.statusCode)
            : null,
      providerMessage:
        typeof parsed.message === 'string'
          ? redactProviderMessage(parsed.message)
          : typeof parsed.error === 'string'
            ? redactProviderMessage(parsed.error)
            : null,
      providerContentType: contentType,
    };
  } catch {
    return {
      providerStatus: status,
      providerCategory: 'provider_error',
      providerCode: null,
      providerMessage: redactProviderMessage(body),
      providerContentType: contentType,
    };
  }
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function cleanOptional(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function formatLabel(value: string) {
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function isOption<T extends readonly string[]>(value: string, options: T): value is T[number] {
  return (options as readonly string[]).includes(value);
}

function isSpam(startedAt: string, website: string) {
  if (website.trim().length > 0) return true;
  if (!startedAt) return true;

  const startedTime = new Date(startedAt).getTime();
  if (Number.isNaN(startedTime)) return true;

  const elapsed = Date.now() - startedTime;
  return elapsed < MIN_SUBMISSION_DELAY_MS || elapsed > MAX_SUBMISSION_AGE_MS;
}

function validatePricingRegistration(values: PricingRegistrationValues): ValidationErrorMap {
  const errors: ValidationErrorMap = {};

  if (!values.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!values.workEmail.trim()) errors.workEmail = 'Work email is required.';
  else if (!isEmail(values.workEmail.trim())) errors.workEmail = 'Enter a valid work email.';

  if (!values.roleTitle.trim()) errors.roleTitle = 'Role or title is required.';
  if (!values.organizationName.trim()) errors.organizationName = 'Organisation name is required.';
  if (!values.countryRegion.trim()) errors.countryRegion = 'Country or region is required.';

  if (!isOption(values.buyerType, buyerTypeOptions)) {
    errors.buyerType = 'Select a buyer type.';
  }

  if (!isOption(values.interestArea, interestAreaOptions)) {
    errors.interestArea = 'Select an area of interest.';
  }

  if (
    values.preferredContactMethod &&
    !isOption(values.preferredContactMethod, preferredContactMethodOptions)
  ) {
    errors.preferredContactMethod = 'Select a valid contact method.';
  }

  if (!values.contactConsent) {
    errors.contactConsent = 'You must agree to be contacted to submit this form.';
  }

  if (values.website.trim()) {
    errors.website = 'Spam detected.';
  }

  return errors;
}

function coercePricingRegistrationValues(input: unknown): PricingRegistrationValues {
  const r = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;

  return {
    fullName: typeof r.fullName === 'string' ? r.fullName : '',
    workEmail: typeof r.workEmail === 'string' ? r.workEmail : '',
    roleTitle: typeof r.roleTitle === 'string' ? r.roleTitle : '',
    organizationName: typeof r.organizationName === 'string' ? r.organizationName : '',
    countryRegion: typeof r.countryRegion === 'string' ? r.countryRegion : '',
    buyerType: typeof r.buyerType === 'string' ? (r.buyerType as BuyerType | '') : '',
    interestArea: typeof r.interestArea === 'string' ? (r.interestArea as InterestArea | '') : '',
    organizationSize: typeof r.organizationSize === 'string' ? r.organizationSize : '',
    phoneWhatsapp: typeof r.phoneWhatsapp === 'string' ? r.phoneWhatsapp : '',
    preferredContactMethod:
      typeof r.preferredContactMethod === 'string'
        ? (r.preferredContactMethod as PreferredContactMethod | '')
        : '',
    timeline: typeof r.timeline === 'string' ? r.timeline : '',
    message: typeof r.message === 'string' ? r.message : '',
    contactConsent: Boolean(r.contactConsent),
    website: typeof r.website === 'string' ? r.website : '',
    startedAt: typeof r.startedAt === 'string' ? r.startedAt : '',
  };
}

function normalizePricingRegistration(
  values: PricingRegistrationValues
): NormalizedPricingRegistration {
  return {
    submissionId: generateRegistrationId(
      normaliseBuyerType(values.buyerType),
      normaliseMAOI(values.interestArea)
    ),
    submittedAt: new Date().toISOString(),
    fullName: values.fullName.trim(),
    workEmail: values.workEmail.trim().toLowerCase(),
    roleTitle: values.roleTitle.trim(),
    organizationName: values.organizationName.trim(),
    countryRegion: values.countryRegion.trim(),
    buyerType: values.buyerType as BuyerType,
    interestArea: values.interestArea as InterestArea,
    organizationSize: cleanOptional(values.organizationSize),
    phoneWhatsapp: cleanOptional(values.phoneWhatsapp),
    preferredContactMethod: values.preferredContactMethod || undefined,
    timeline: cleanOptional(values.timeline),
    message: cleanOptional(values.message),
    contactConsent: true,
  };
}

function formatRegistrationSubject(registration: NormalizedPricingRegistration) {
  return `New Plans & Pricing Registration — ${registration.fullName} | ${registration.organizationName}`;
}

function formatRegistrationBody(registration: NormalizedPricingRegistration) {
  const lines = [
    'Plans & Pricing Registration',
    '============================',
    '',
    'Header',
    '------',
    `Applicant: ${registration.fullName}`,
    `Organisation: ${registration.organizationName}`,
    `Buyer Type: ${formatLabel(registration.buyerType)}`,
    `Interest Area: ${formatLabel(registration.interestArea)}`,
    `Submitted At: ${registration.submittedAt}`,
    `Registration ID: ${registration.submissionId}`,
    '',
    'Contact Details',
    '---------------',
    `Work Email: ${registration.workEmail}`,
    `Role / Title: ${registration.roleTitle}`,
    `Country / Region: ${registration.countryRegion}`,
    `Phone / WhatsApp: ${registration.phoneWhatsapp || 'Not provided'}`,
    `Preferred Contact Method: ${
      registration.preferredContactMethod ? formatLabel(registration.preferredContactMethod) : 'Not provided'
    }`,
    '',
    'Context',
    '-------',
    `Organisation Size / Learner Range: ${registration.organizationSize || 'Not provided'}`,
    `Timeline / Implementation Horizon: ${registration.timeline || 'Not provided'}`,
    '',
    'Message / Notes',
    '---------------',
    registration.message || 'Not provided',
    '',
    'Internal Action',
    '---------------',
    'Next step: review this lead, generate an approved access link, and send the Plans & Pricing access email if approved.',
  ];

  return lines.join('\n');
}

function formatRegistrationHtml(registration: NormalizedPricingRegistration) {
  const optionalContact = registration.phoneWhatsapp
    ? `<div style="margin-top:6px;"><strong>Phone / WhatsApp:</strong> ${registration.phoneWhatsapp}</div>`
    : '';
  const optionalMethod = registration.preferredContactMethod
    ? `<div style="margin-top:6px;"><strong>Preferred Contact Method:</strong> ${formatLabel(registration.preferredContactMethod)}</div>`
    : '';

  return `
    <div style="font-family:Segoe UI,Arial,sans-serif;color:#111120;line-height:1.6;background:#f8f9fb;padding:24px;">
      <div style="max-width:760px;margin:0 auto;background:#ffffff;border:1px solid #e7eaee;border-radius:20px;overflow:hidden;">
        <div style="background:#101521;color:#ffffff;padding:28px 32px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#f57c00;">Internal Intake</div>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;">New Plans & Pricing Registration</h1>
        </div>

        <div style="padding:28px 32px;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-bottom:26px;">
            <div style="border:1px solid #eceff1;border-radius:16px;padding:16px;background:#fafbfc;">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:#6b7280;">Applicant</div>
              <div style="margin-top:8px;font-size:16px;font-weight:700;">${registration.fullName}</div>
            </div>
            <div style="border:1px solid #eceff1;border-radius:16px;padding:16px;background:#fafbfc;">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:#6b7280;">Organisation</div>
              <div style="margin-top:8px;font-size:16px;font-weight:700;">${registration.organizationName}</div>
            </div>
            <div style="border:1px solid #eceff1;border-radius:16px;padding:16px;background:#fafbfc;">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:#6b7280;">Buyer Type</div>
              <div style="margin-top:8px;font-size:16px;font-weight:700;">${formatLabel(registration.buyerType)}</div>
            </div>
            <div style="border:1px solid #eceff1;border-radius:16px;padding:16px;background:#fafbfc;">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:#6b7280;">Interest Area</div>
              <div style="margin-top:8px;font-size:16px;font-weight:700;">${formatLabel(registration.interestArea)}</div>
            </div>
            <div style="border:1px solid #eceff1;border-radius:16px;padding:16px;background:#fafbfc;">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:#6b7280;">Submitted At</div>
              <div style="margin-top:8px;font-size:16px;font-weight:700;">${registration.submittedAt}</div>
            </div>
            <div style="border:1px solid #eceff1;border-radius:16px;padding:16px;background:#fafbfc;">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:#6b7280;">Registration ID</div>
              <div style="margin-top:8px;font-size:16px;font-weight:700;">${registration.submissionId}</div>
            </div>
          </div>

          <div style="margin-bottom:26px;">
            <h2 style="margin:0 0 12px;font-size:18px;">Contact Details</h2>
            <div style="border:1px solid #eceff1;border-radius:16px;padding:18px;background:#ffffff;">
              <div><strong>Work Email:</strong> ${registration.workEmail}</div>
              <div style="margin-top:6px;"><strong>Role / Title:</strong> ${registration.roleTitle}</div>
              <div style="margin-top:6px;"><strong>Country / Region:</strong> ${registration.countryRegion}</div>
              ${optionalContact}
              ${optionalMethod}
            </div>
          </div>

          <div style="margin-bottom:26px;">
            <h2 style="margin:0 0 12px;font-size:18px;">Context</h2>
            <div style="border:1px solid #eceff1;border-radius:16px;padding:18px;background:#ffffff;">
              <div><strong>Organisation Size / Learner Range:</strong> ${registration.organizationSize || 'Not provided'}</div>
              <div style="margin-top:6px;"><strong>Timeline / Implementation Horizon:</strong> ${registration.timeline || 'Not provided'}</div>
              <div style="margin-top:16px;"><strong>Message / Notes</strong></div>
              <div style="margin-top:6px;color:#4b5563;">${registration.message || 'Not provided'}</div>
            </div>
          </div>

          <div style="border-left:4px solid #f57c00;background:#fff5ec;padding:16px 18px;border-radius:0 12px 12px 0;">
            <div style="font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#f57c00;">Internal Action</div>
            <div style="margin-top:8px;color:#27323a;">
              Next step: review this lead, generate an approved access link, and send the Plans & Pricing access email if approved.
            </div>
          </div>
        </div>
      </div>
    </div>
  `.trim();
}

async function sendPricingRegistrationNotification(
  registration: NormalizedPricingRegistration,
  mailConfig: MailConfig
): Promise<NotificationResult> {
  const configDiagnostics = getMailConfigDiagnostics(mailConfig);

  if (!mailConfig.isTransportReady || !mailConfig.apiKey || !mailConfig.notifyEmail) {
    return {
      status: 'skipped',
      reason: 'Notification transport is not configured.',
      diagnostics: {
        ...configDiagnostics,
        configResolved: true,
        transportReady: false,
        configReason: mailConfig.diagnosticReason,
      },
    };
  }

  const subject = formatRegistrationSubject(registration);
  const btKey   = normaliseBuyerType(registration.buyerType);
  const maoiKey = normaliseMAOI(registration.interestArea);
  const ctx     = crmMap(btKey, maoiKey);
  const payloadDiagnostics = {
    ...configDiagnostics,
    configResolved: true,
    transportReady: true,
    configReason: mailConfig.diagnosticReason,
    subjectKind: 'pricing_registration',
    fromPresent: Boolean(mailConfig.fromEmail),
    toCount: mailConfig.notifyEmail ? 1 : 0,
    replyToPresent: Boolean(registration.workEmail),
    fromDomain: getEmailDomain(mailConfig.fromEmail),
    toDomain: getEmailDomain(mailConfig.notifyEmail),
    replyToDomain: getEmailDomain(registration.workEmail),
    bodyLength: formatRegistrationBody(registration).length,
  };
  const messageText = formatRegistrationBody(registration);

  const abortController = new AbortController();
  const abortTimer = setTimeout(() => abortController.abort(), RESEND_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: abortController.signal,
      headers: {
        Authorization: `Bearer ${mailConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: mailConfig.fromEmail,
        to: [mailConfig.notifyEmail],
        reply_to: registration.workEmail,
        subject,
        text: messageText,
        html: buildCrmIntakeEmail(registration as any, ctx),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const diagnostics = {
        ...payloadDiagnostics,
        ...parseProviderFailure(response.status, errorText),
        rejectedBeforeDispatch: response.status >= 400 && response.status < 500,
      };
      return {
        status: 'failed',
        reason: `Resend request failed: ${response.status}`,
        diagnostics,
      };
    }

    return {
      status: 'sent',
      diagnostics: {
        ...payloadDiagnostics,
      },
    };
  } catch (error: any) {
    const isTimeout = error?.name === 'AbortError';
    const diagnostics = {
      ...payloadDiagnostics,
      providerCategory: isTimeout ? 'timeout' : 'transport_exception',
      providerCode: error?.code || null,
      providerMessage: redactProviderMessage(
        isTimeout ? 'Resend request timed out.' : (error?.message || 'Unknown notification transport error.')
      ),
      rejectedBeforeDispatch: false,
    };
    return {
      status: 'failed',
      reason: isTimeout ? 'resend_timeout' : (error?.message || 'Unknown notification transport error.'),
      diagnostics,
    };
  } finally {
    clearTimeout(abortTimer);
  }
}

/**
 * Attempt a Notion CRM write with a 4-second hard cap.
 * Never throws and never affects the user-facing HTTP response — Notion
 * availability is independent of the submission success path.
 */
async function safeNotionWrite(
  registration: NormalizedPricingRegistration,
): Promise<{ ok: boolean; reason?: string; pageId?: string }> {
  try {
    return await Promise.race([
      writeNotionLead(registration),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('notion_timeout')), 4000),
      ),
    ]);
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown';
    console.warn('[pricing-registration] notion write did not complete in time', { reason });
    return { ok: false, reason };
  }
}

function createRegistrationLogContext(registration: NormalizedPricingRegistration) {
  return {
    submissionId: registration.submissionId,
    submittedAt: registration.submittedAt,
    buyerType: registration.buyerType,
    interestArea: registration.interestArea,
    hasOrganizationSize: Boolean(registration.organizationSize),
    hasPhoneWhatsapp: Boolean(registration.phoneWhatsapp),
    hasPreferredContactMethod: Boolean(registration.preferredContactMethod),
    hasTimeline: Boolean(registration.timeline),
    hasMessage: Boolean(registration.message),
    emailDomain: getEmailDomain(registration.workEmail),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const rateLimit = checkRateLimit(req, {
    key: 'pricing-registration',
    windowMs: 10 * 60 * 1000,
    max: 5,
  });

  if (!rateLimit.allowed) {
    console.warn('[pricing-registration] request throttled', createThrottleLogContext(
      req,
      '/api/pricing-registration',
      rateLimit.retryAfterSeconds,
    ));
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds));
    return res.status(429).json({
      ok: false,
      error: 'Too many submissions were received from this connection. Please wait a few minutes and try again.',
    });
  }

  try {
    const values = coercePricingRegistrationValues(req.body);

    if (isSpam(values.startedAt, values.website)) {
      return res.status(400).json({ ok: false, error: 'Submission could not be accepted.' });
    }

    const errors = validatePricingRegistration(values);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        ok: false,
        error: 'Please review the required fields and try again.',
        fieldErrors: errors,
      });
    }

    const registration = normalizePricingRegistration(values);
    const mailConfig   = resolveMailConfig();

    // Run Notion write and email notification in parallel.
    // The Notion write is capped at 4 s and never influences the HTTP response —
    // email outcome alone determines 200 / 502 / 503.
    const [notionResult, notification] = await Promise.all([
      safeNotionWrite(registration),
      sendPricingRegistrationNotification(registration, mailConfig),
    ]);

    console.info('[pricing-registration] notion write', {
      submissionId: registration.submissionId,
      notionOk:     notionResult.ok,
      notionReason: notionResult.reason,
      notionPageId: (notionResult as any).pageId ?? null,
    });

    console.info('[pricing-registration] submission received', {
      ...createRegistrationLogContext(registration),
      notificationStatus: notification.status,
      notificationReason: notification.status === 'sent' ? undefined : notification.reason,
    });

    if (notification.status === 'skipped') {
      console.warn('[pricing-registration] notification skipped', {
        submissionId: registration.submissionId,
        notificationReason: notification.reason,
        notificationDiagnostics: notification.diagnostics,
      });
      return res.status(503).json({
        ok: false,
        error:
          'Plans & Pricing registration is temporarily unavailable. Please email info@jurassicenglish.com directly.',
      });
    }

    if (notification.status === 'failed') {
      console.warn('[pricing-registration] notification failure', {
        submissionId: registration.submissionId,
        notificationReason: notification.reason,
        notificationDiagnostics: notification.diagnostics,
      });
      return res.status(502).json({
        ok: false,
        error:
          'We could not deliver your registration just now. Please try again shortly or email info@jurassicenglish.com directly.',
      });
    }

    return res.status(200).json({
      ok: true,
      submissionId: registration.submissionId,
    });
  } catch (error: any) {
    console.error('[pricing-registration] unhandled serverless error', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
    });
    return res.status(500).json({
      ok: false,
      error:
        'Pricing registration could not be processed. Please try again shortly or email info@jurassicenglish.com directly.',
    });
  }
}
