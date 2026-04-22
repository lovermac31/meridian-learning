import type { VercelRequest, VercelResponse } from '@vercel/node';
import { writeSupabaseGetStarted } from './_lib/supabaseWriter.js';
import {
  checkRateLimit,
  createThrottleLogContext,
  getEmailDomain,
} from './_lib/requestSecurity.js';

const MIN_SUBMISSION_DELAY_MS = 1500;
const MAX_SUBMISSION_AGE_MS = 1000 * 60 * 60 * 8;
const RESEND_TIMEOUT_MS = 7_000;

const organizationTypeOptions = [
  'school',
  'language_academy',
  'educator',
  'school_group',
  'other',
] as const;

const primaryInterestOptions = [
  'teacher_training',
  'school_licensing',
  'curriculum_review',
  'consulting',
  'partnership',
] as const;

const timelineOptions = [
  'immediately',
  'within_3_months',
  'within_6_months',
  'exploring',
] as const;

const decisionStageOptions = [
  'researching',
  'comparing',
  'ready_for_consultation',
  'ready_to_pilot',
] as const;

const pilotAccessRequestOptions = [
  'pilot_overview_pack',
  'implementation_scope_overview',
  'reporting_sample',
  'readiness_checklist',
  'institutional_programme_pack',
  'pilot_consultation',
] as const;

type OrganizationType = (typeof organizationTypeOptions)[number];
type PrimaryInterest = (typeof primaryInterestOptions)[number];
type Timeline = (typeof timelineOptions)[number];
type DecisionStage = (typeof decisionStageOptions)[number];
type PilotAccessRequest = (typeof pilotAccessRequestOptions)[number];

type GetStartedFormValues = {
  fullName: string;
  workEmail: string;
  organizationName: string;
  organizationType: OrganizationType | '';
  primaryInterest: PrimaryInterest | '';
  challenge: string;
  contactConsent: boolean;
  roleTitle: string;
  countryRegion: string;
  ageRange: string;
  learnerCount: string;
  standardsContext: string;
  timeline: Timeline | '';
  decisionStage: DecisionStage | '';
  successDefinition: string;
  notes: string;
  newsletterOptIn: boolean;
  website: string;
  startedAt: string;
  source: string;
  accessRequest: PilotAccessRequest | '';
};

type NormalizedGetStartedSubmission = {
  submissionId: string;
  submittedAt: string;
  fullName: string;
  workEmail: string;
  organizationName: string;
  organizationType: OrganizationType;
  primaryInterest: PrimaryInterest;
  challenge: string;
  contactConsent: true;
  roleTitle?: string;
  countryRegion?: string;
  ageRange?: string;
  learnerCount?: string;
  standardsContext?: string;
  timeline?: Timeline;
  decisionStage?: DecisionStage;
  successDefinition?: string;
  notes?: string;
  newsletterOptIn: boolean;
  source?: string;
  accessRequest?: PilotAccessRequest;
};

type ValidationErrorMap = Partial<Record<keyof GetStartedFormValues, string>>;

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

type NotificationResult =
  | { status: 'sent'; diagnostics: Record<string, unknown> }
  | { status: 'skipped'; reason: string; diagnostics: Record<string, unknown> }
  | { status: 'failed'; reason: string; diagnostics: Record<string, unknown> };

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

function isOption<T extends readonly string[]>(value: string, options: T): value is T[number] {
  return (options as readonly string[]).includes(value);
}

function validateGetStartedPayload(values: GetStartedFormValues): ValidationErrorMap {
  const errors: ValidationErrorMap = {};

  if (!values.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!values.workEmail.trim()) errors.workEmail = 'Work email is required.';
  else if (!isEmail(values.workEmail.trim())) errors.workEmail = 'Enter a valid work email.';

  if (!values.organizationName.trim()) {
    errors.organizationName = 'Organization name is required.';
  }

  if (!isOption(values.organizationType, organizationTypeOptions)) {
    errors.organizationType = 'Select an organization type.';
  }

  if (!isOption(values.primaryInterest, primaryInterestOptions)) {
    errors.primaryInterest = 'Select a primary interest.';
  }

  if (!values.challenge.trim()) errors.challenge = 'Tell us what challenge you are trying to solve.';
  else if (values.challenge.trim().length < 20) errors.challenge = 'Please add a little more context.';

  if (!values.contactConsent) {
    errors.contactConsent = 'You must agree to be contacted to submit this form.';
  }

  if (values.timeline && !isOption(values.timeline, timelineOptions)) {
    errors.timeline = 'Select a valid timeline.';
  }

  if (values.decisionStage && !isOption(values.decisionStage, decisionStageOptions)) {
    errors.decisionStage = 'Select a valid decision stage.';
  }

  if (values.accessRequest && !isOption(values.accessRequest, pilotAccessRequestOptions)) {
    errors.accessRequest = 'Select a valid pilot access request.';
  }

  if (values.website.trim()) {
    errors.website = 'Spam detected.';
  }

  return errors;
}

function coerceGetStartedFormValues(input: unknown): GetStartedFormValues {
  const record = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;

  return {
    fullName: typeof record.fullName === 'string' ? record.fullName : '',
    workEmail: typeof record.workEmail === 'string' ? record.workEmail : '',
    organizationName: typeof record.organizationName === 'string' ? record.organizationName : '',
    organizationType:
      typeof record.organizationType === 'string' ? (record.organizationType as OrganizationType | '') : '',
    primaryInterest:
      typeof record.primaryInterest === 'string' ? (record.primaryInterest as PrimaryInterest | '') : '',
    challenge: typeof record.challenge === 'string' ? record.challenge : '',
    contactConsent: Boolean(record.contactConsent),
    roleTitle: typeof record.roleTitle === 'string' ? record.roleTitle : '',
    countryRegion: typeof record.countryRegion === 'string' ? record.countryRegion : '',
    ageRange: typeof record.ageRange === 'string' ? record.ageRange : '',
    learnerCount: typeof record.learnerCount === 'string' ? record.learnerCount : '',
    standardsContext: typeof record.standardsContext === 'string' ? record.standardsContext : '',
    timeline: typeof record.timeline === 'string' ? (record.timeline as Timeline | '') : '',
    decisionStage:
      typeof record.decisionStage === 'string' ? (record.decisionStage as DecisionStage | '') : '',
    successDefinition: typeof record.successDefinition === 'string' ? record.successDefinition : '',
    notes: typeof record.notes === 'string' ? record.notes : '',
    newsletterOptIn: Boolean(record.newsletterOptIn),
    website: typeof record.website === 'string' ? record.website : '',
    startedAt: typeof record.startedAt === 'string' ? record.startedAt : '',
    source: typeof record.source === 'string' ? record.source : '',
    accessRequest:
      typeof record.accessRequest === 'string' ? (record.accessRequest as PilotAccessRequest | '') : '',
  };
}

function normalizeGetStartedPayload(
  values: GetStartedFormValues
): NormalizedGetStartedSubmission {
  return {
    submissionId:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `je_${Date.now().toString(36)}`,
    submittedAt: new Date().toISOString(),
    fullName: values.fullName.trim(),
    workEmail: values.workEmail.trim().toLowerCase(),
    organizationName: values.organizationName.trim(),
    organizationType: values.organizationType as OrganizationType,
    primaryInterest: values.primaryInterest as PrimaryInterest,
    challenge: values.challenge.trim(),
    contactConsent: true,
    roleTitle: cleanOptional(values.roleTitle),
    countryRegion: cleanOptional(values.countryRegion),
    ageRange: cleanOptional(values.ageRange),
    learnerCount: cleanOptional(values.learnerCount),
    standardsContext: cleanOptional(values.standardsContext),
    timeline: values.timeline || undefined,
    decisionStage: values.decisionStage || undefined,
    successDefinition: cleanOptional(values.successDefinition),
    notes: cleanOptional(values.notes),
    newsletterOptIn: Boolean(values.newsletterOptIn),
    source: cleanOptional(values.source),
    accessRequest: values.accessRequest || undefined,
  };
}

function formatSubmissionBody(submission: NormalizedGetStartedSubmission) {
  const lines = [
    `Submission ID: ${submission.submissionId}`,
    `Submitted At: ${submission.submittedAt}`,
    `Source: ${submission.source || 'Not provided'}`,
    `Pilot Access Request: ${submission.accessRequest || 'Not provided'}`,
    `Primary Interest: ${submission.primaryInterest}`,
    `Organization Name: ${submission.organizationName}`,
    `Organization Type: ${submission.organizationType}`,
    `Full Name: ${submission.fullName}`,
    `Work Email: ${submission.workEmail}`,
    `Contact Consent: ${submission.contactConsent ? 'Yes' : 'No'}`,
    `Newsletter Opt-In: ${submission.newsletterOptIn ? 'Yes' : 'No'}`,
    `Role / Title: ${submission.roleTitle || 'Not provided'}`,
    `Country / Region: ${submission.countryRegion || 'Not provided'}`,
    `Age Range: ${submission.ageRange || 'Not provided'}`,
    `Learner Count: ${submission.learnerCount || 'Not provided'}`,
    `Standards Context: ${submission.standardsContext || 'Not provided'}`,
    `Timeline: ${submission.timeline || 'Not provided'}`,
    `Decision Stage: ${submission.decisionStage || 'Not provided'}`,
    '',
    'Challenge:',
    submission.challenge,
    '',
    'Success Definition:',
    submission.successDefinition || 'Not provided',
    '',
    'Additional Notes:',
    submission.notes || 'Not provided',
  ];

  return lines.join('\n');
}

async function sendGetStartedNotification(
  submission: NormalizedGetStartedSubmission
): Promise<NotificationResult> {
  const mailConfig = resolveMailConfig();
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

  const subject = `[Get Started] ${submission.primaryInterest} · ${submission.organizationName}`;
  const payloadDiagnostics = {
    ...configDiagnostics,
    configResolved: true,
    transportReady: true,
    configReason: mailConfig.diagnosticReason,
    subjectKind: 'get_started',
    fromPresent: Boolean(mailConfig.fromEmail),
    toCount: mailConfig.notifyEmail ? 1 : 0,
    replyToPresent: Boolean(submission.workEmail),
    bodyLength: formatSubmissionBody(submission).length,
  };

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
        reply_to: submission.workEmail,
        subject,
        text: formatSubmissionBody(submission),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        status: 'failed',
        reason: `Resend request failed: ${response.status}`,
        diagnostics: {
          ...payloadDiagnostics,
          ...parseProviderFailure(response.status, errorText),
          rejectedBeforeDispatch: response.status >= 400 && response.status < 500,
        },
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
    return {
      status: 'failed',
      reason: isTimeout ? 'resend_timeout' : (error?.message || 'Unknown notification transport error.'),
      diagnostics: {
        ...payloadDiagnostics,
        providerCategory: isTimeout ? 'timeout' : 'transport_exception',
        providerCode: error?.code || null,
        providerMessage: redactProviderMessage(
          isTimeout ? 'Resend request timed out.' : (error?.message || 'Unknown notification transport error.')
        ),
        rejectedBeforeDispatch: false,
      },
    };
  } finally {
    clearTimeout(abortTimer);
  }
}

function isSpam(startedAt: string, website: string) {
  if (website.trim().length > 0) return true;
  if (!startedAt) return true;

  const startedTime = new Date(startedAt).getTime();
  if (Number.isNaN(startedTime)) return true;

  const elapsed = Date.now() - startedTime;
  return elapsed < MIN_SUBMISSION_DELAY_MS || elapsed > MAX_SUBMISSION_AGE_MS;
}

function createSubmissionLogContext(submission: NormalizedGetStartedSubmission) {
  return {
    submissionId: submission.submissionId,
    submittedAt: submission.submittedAt,
    primaryInterest: submission.primaryInterest,
    organizationType: submission.organizationType,
    hasRoleTitle: Boolean(submission.roleTitle),
    hasCountryRegion: Boolean(submission.countryRegion),
    hasAgeRange: Boolean(submission.ageRange),
    hasLearnerCount: Boolean(submission.learnerCount),
    hasStandardsContext: Boolean(submission.standardsContext),
    hasTimeline: Boolean(submission.timeline),
    hasDecisionStage: Boolean(submission.decisionStage),
    hasSuccessDefinition: Boolean(submission.successDefinition),
    hasNotes: Boolean(submission.notes),
    source: submission.source,
    accessRequest: submission.accessRequest,
    newsletterOptIn: submission.newsletterOptIn,
    emailDomain: getEmailDomain(submission.workEmail),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const rateLimit = checkRateLimit(req, {
    key: 'get-started',
    windowMs: 10 * 60 * 1000,
    max: 5,
  });

  if (!rateLimit.allowed) {
    console.warn('[get-started] request throttled', createThrottleLogContext(
      req,
      '/api/get-started',
      rateLimit.retryAfterSeconds,
    ));
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds));
    return res.status(429).json({
      ok: false,
      error: 'Too many submissions were received from this connection. Please wait a few minutes and try again.',
    });
  }

  const values = coerceGetStartedFormValues(req.body);

  if (isSpam(values.startedAt, values.website)) {
    return res.status(400).json({ ok: false, error: 'Submission could not be accepted.' });
  }

  const errors = validateGetStartedPayload(values);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      ok: false,
      error: 'Please review the required fields and try again.',
      fieldErrors: errors,
    });
  }

  const submission = normalizeGetStartedPayload(values);

  const [notification, supabaseResult] = await Promise.all([
    sendGetStartedNotification(submission),
    Promise.race([
      writeSupabaseGetStarted(submission),
      new Promise<{ ok: false; reason: string }>((resolve) =>
        setTimeout(() => resolve({ ok: false, reason: 'supabase_timeout' }), 4000),
      ),
    ]),
  ]);

  console.info('[get-started] supabase write', {
    submissionId:   submission.submissionId,
    supabaseOk:     supabaseResult.ok,
    supabaseReason: (supabaseResult as any).reason,
  });

  console.info('[get-started] submission received', {
    ...createSubmissionLogContext(submission),
    notificationStatus: notification.status,
    notificationDiagnostics: notification.diagnostics,
  });

  if (notification.status === 'skipped') {
    console.warn('[get-started] notification skipped', {
      submissionId: submission.submissionId,
      notificationReason: notification.reason,
      notificationDiagnostics: notification.diagnostics,
    });
    return res.status(503).json({
      ok: false,
      error:
        'Get Started submissions are temporarily unavailable. Please email info@jurassicenglish.com directly.',
    });
  }

  if (notification.status === 'failed') {
    console.warn('[get-started] notification failure', {
      submissionId: submission.submissionId,
      notificationReason: notification.reason,
      notificationDiagnostics: notification.diagnostics,
    });
    return res.status(502).json({
      ok: false,
      error:
        'We could not deliver your Get Started submission just now. Please try again shortly or email info@jurassicenglish.com directly.',
    });
  }

  return res.status(200).json({
    ok: true,
    submissionId: submission.submissionId,
  });
}
