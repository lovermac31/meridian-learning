import type { VercelRequest, VercelResponse } from '@vercel/node';

const MIN_SUBMISSION_DELAY_MS = 1500;
const MAX_SUBMISSION_AGE_MS = 1000 * 60 * 60 * 8;

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
  const fromEmail =
    process.env.GET_STARTED_FROM_EMAIL?.trim() ||
    'Jurassic English <onboarding@jurassicenglish.com>';

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
    submissionId:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `pr_${Date.now().toString(36)}`,
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

function formatRegistrationBody(registration: NormalizedPricingRegistration) {
  const lines = [
    'Form Type: Plans and Pricing pre-launch registration',
    `Registration ID: ${registration.submissionId}`,
    `Submitted At: ${registration.submittedAt}`,
    '',
    `Full Name: ${registration.fullName}`,
    `Work Email: ${registration.workEmail}`,
    `Role / Title: ${registration.roleTitle}`,
    `Organisation / School / Company: ${registration.organizationName}`,
    `Country / Region: ${registration.countryRegion}`,
    `Buyer Type: ${registration.buyerType}`,
    `Main Area of Interest: ${registration.interestArea}`,
    `Organisation Size / Learner Range: ${registration.organizationSize || 'Not provided'}`,
    `Phone / WhatsApp: ${registration.phoneWhatsapp || 'Not provided'}`,
    `Preferred Contact Method: ${registration.preferredContactMethod || 'Not provided'}`,
    `Timeline / Implementation Horizon: ${registration.timeline || 'Not provided'}`,
    '',
    'Message / Notes:',
    registration.message || 'Not provided',
  ];

  return lines.join('\n');
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

  const subject = `[Plans and Pricing] ${registration.interestArea} · ${registration.organizationName}`;
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

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
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
    const diagnostics = {
      ...payloadDiagnostics,
      providerCategory: 'transport_exception',
      providerCode: error?.code || null,
      providerMessage: redactProviderMessage(error?.message || 'Unknown notification transport error.'),
      rejectedBeforeDispatch: false,
    };
    return {
      status: 'failed',
      reason: error?.message || 'Unknown notification transport error.',
      diagnostics,
    };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
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
    const mailConfig = resolveMailConfig();
    const notification = await sendPricingRegistrationNotification(registration, mailConfig);

    console.info('[pricing-registration] submission received', {
      submissionId: registration.submissionId,
      submittedAt: registration.submittedAt,
      buyerType: registration.buyerType,
      interestArea: registration.interestArea,
      organizationName: registration.organizationName,
      workEmail: registration.workEmail,
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
        deliveryCategory:
          typeof notification.diagnostics?.providerCategory === 'string'
            ? notification.diagnostics.providerCategory
            : 'notification_skipped',
        deliveryCode:
          typeof notification.diagnostics?.providerCode === 'string'
            ? notification.diagnostics.providerCode
            : null,
        deliveryMessage:
          typeof notification.diagnostics?.providerMessage === 'string'
            ? notification.diagnostics.providerMessage
            : null,
        deliveryDiagnostics: notification.diagnostics ?? null,
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
        deliveryCategory:
          typeof notification.diagnostics?.providerCategory === 'string'
            ? notification.diagnostics.providerCategory
            : 'notification_failed',
        deliveryCode:
          typeof notification.diagnostics?.providerCode === 'string'
            ? notification.diagnostics.providerCode
            : null,
        deliveryMessage:
          typeof notification.diagnostics?.providerMessage === 'string'
            ? notification.diagnostics.providerMessage
            : null,
        deliveryDiagnostics: notification.diagnostics ?? null,
      });
    }

    return res.status(200).json({
      ok: true,
      submissionId: registration.submissionId,
      deliveryDiagnostics: notification.diagnostics ?? null,
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
