export const organizationTypeOptions = [
  'school',
  'language_academy',
  'educator',
  'school_group',
  'other',
] as const;

export const primaryInterestOptions = [
  'teacher_training',
  'school_licensing',
  'curriculum_review',
  'consulting',
  'partnership',
] as const;

export const timelineOptions = [
  'immediately',
  'within_3_months',
  'within_6_months',
  'exploring',
] as const;

export const decisionStageOptions = [
  'researching',
  'comparing',
  'ready_for_consultation',
  'ready_to_pilot',
] as const;

export type OrganizationType = (typeof organizationTypeOptions)[number];
export type PrimaryInterest = (typeof primaryInterestOptions)[number];
export type Timeline = (typeof timelineOptions)[number];
export type DecisionStage = (typeof decisionStageOptions)[number];

export type GetStartedFormValues = {
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

export type NormalizedGetStartedSubmission = {
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

export type ValidationErrorMap = Partial<Record<keyof GetStartedFormValues, string>>;

export const initialGetStartedValues: GetStartedFormValues = {
  fullName: '',
  workEmail: '',
  organizationName: '',
  organizationType: '',
  primaryInterest: '',
  challenge: '',
  contactConsent: false,
  roleTitle: '',
  countryRegion: '',
  ageRange: '',
  learnerCount: '',
  standardsContext: '',
  timeline: '',
  decisionStage: '',
  successDefinition: '',
  notes: '',
  newsletterOptIn: false,
  website: '',
  startedAt: '',
};

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

export function validateGetStartedPayload(values: GetStartedFormValues): ValidationErrorMap {
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

export function coerceGetStartedFormValues(input: unknown): GetStartedFormValues {
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

export function normalizeGetStartedPayload(
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

export function getStartedLabel(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
