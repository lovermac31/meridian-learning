import type { VercelRequest, VercelResponse } from '@vercel/node';

const MIN_SUBMISSION_DELAY_MS = 1500;
const MAX_SUBMISSION_AGE_MS = 1000 * 60 * 60 * 8;

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

type OrganizationType = (typeof organizationTypeOptions)[number];
type PrimaryInterest = (typeof primaryInterestOptions)[number];
type Timeline = (typeof timelineOptions)[number];
type DecisionStage = (typeof decisionStageOptions)[number];

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
};

type ValidationErrorMap = Partial<Record<keyof GetStartedFormValues, string>>;

type NotificationResult =
  | { status: 'sent' }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; reason: string };

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
  };
}

function formatSubmissionBody(submission: NormalizedGetStartedSubmission) {
  const lines = [
    `Submission ID: ${submission.submissionId}`,
    `Submitted At: ${submission.submittedAt}`,
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
  const resendApiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.GET_STARTED_NOTIFY_EMAIL;
  const fromEmail = process.env.GET_STARTED_FROM_EMAIL || 'Jurassic English <onboarding@jurassicenglish.com>';

  if (!resendApiKey || !notifyEmail) {
    return {
      status: 'skipped',
      reason: 'Notification transport is not configured.',
    };
  }

  const subject = `[Get Started] ${submission.primaryInterest} · ${submission.organizationName}`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [notifyEmail],
        reply_to: submission.workEmail,
        subject,
        text: formatSubmissionBody(submission),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        status: 'failed',
        reason: `Resend request failed: ${response.status} ${errorText}`,
      };
    }

    return { status: 'sent' };
  } catch (error: any) {
    return {
      status: 'failed',
      reason: error?.message || 'Unknown notification transport error.',
    };
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
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
  const notification = await sendGetStartedNotification(submission);

  console.info('[get-started] submission received', {
    submissionId: submission.submissionId,
    submittedAt: submission.submittedAt,
    primaryInterest: submission.primaryInterest,
    organizationType: submission.organizationType,
    organizationName: submission.organizationName,
    workEmail: submission.workEmail,
    notificationStatus: notification.status,
    payload: submission,
  });

  if (notification.status !== 'sent') {
    console.warn('[get-started] notification fallback', {
      submissionId: submission.submissionId,
      notification,
    });
  }

  return res.status(200).json({
    ok: true,
    submissionId: submission.submissionId,
  });
}
