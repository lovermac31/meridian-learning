export const buyerTypeOptions = [
  'school_administrator',
  'teacher_cpd_lead',
  'parent_guardian',
  'institutional_partner',
  'other',
] as const;

export const interestAreaOptions = [
  'teacher_training',
  'school_licensing',
  'curriculum_review',
  'academic_consulting',
  'institutional_partnerships',
  'digital_reasoning_engine',
] as const;

export const preferredContactMethodOptions = [
  'email',
  'phone_whatsapp',
  'either',
] as const;

export type BuyerType = (typeof buyerTypeOptions)[number];
export type InterestArea = (typeof interestAreaOptions)[number];
export type PreferredContactMethod = (typeof preferredContactMethodOptions)[number];

export type PricingRegistrationValues = {
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

export type NormalizedPricingRegistration = {
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

export type PricingValidationErrors = Partial<Record<keyof PricingRegistrationValues, string>>;

export const initialPricingValues: PricingRegistrationValues = {
  fullName: '',
  workEmail: '',
  roleTitle: '',
  organizationName: '',
  countryRegion: '',
  buyerType: '',
  interestArea: '',
  organizationSize: '',
  phoneWhatsapp: '',
  preferredContactMethod: '',
  timeline: '',
  message: '',
  contactConsent: false,
  website: '',
  startedAt: '',
};

const buyerTypeLabels: Record<BuyerType, string> = {
  school_administrator: 'School Administrator / Academic Director',
  teacher_cpd_lead: 'Teacher / CPD Lead',
  parent_guardian: 'Parent / Guardian',
  institutional_partner: 'Institutional Partner',
  other: 'Other',
};

const interestAreaLabels: Record<InterestArea, string> = {
  teacher_training: 'Teacher Training',
  school_licensing: 'School Licensing',
  curriculum_review: 'Curriculum Review',
  academic_consulting: 'Academic Consulting',
  institutional_partnerships: 'Institutional Partnerships',
  digital_reasoning_engine: 'Digital Reasoning Engine',
};

const preferredContactMethodLabels: Record<PreferredContactMethod, string> = {
  email: 'Email',
  phone_whatsapp: 'Phone / WhatsApp',
  either: 'Either',
};

export function pricingLabel(value: string): string {
  if (value in buyerTypeLabels) return buyerTypeLabels[value as BuyerType];
  if (value in interestAreaLabels) return interestAreaLabels[value as InterestArea];
  if (value in preferredContactMethodLabels) {
    return preferredContactMethodLabels[value as PreferredContactMethod];
  }
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isOption<T extends readonly string[]>(value: string, options: T): value is T[number] {
  return (options as readonly string[]).includes(value);
}

function cleanOptional(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

export function validatePricingRegistration(values: PricingRegistrationValues): PricingValidationErrors {
  const errors: PricingValidationErrors = {};

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

  if (!values.contactConsent) {
    errors.contactConsent = 'You must agree to be contacted to submit this form.';
  }

  if (values.website.trim()) {
    errors.website = 'Spam detected.';
  }

  return errors;
}

export function coercePricingRegistrationValues(input: unknown): PricingRegistrationValues {
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

export function normalizePricingRegistration(
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
