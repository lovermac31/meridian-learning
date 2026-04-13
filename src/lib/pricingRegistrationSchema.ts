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

const buyerTypeLabels: Record<Locale, Record<BuyerType, string>> = {
  en: {
    school_administrator: 'School Administrator / Academic Director',
    teacher_cpd_lead: 'Teacher / CPD Lead',
    parent_guardian: 'Parent / Guardian',
    institutional_partner: 'Institutional Partner',
    other: 'Other',
  },
  vi: {
    school_administrator: 'Quản trị trường / Giám đốc học thuật',
    teacher_cpd_lead: 'Giáo viên / Phụ trách phát triển chuyên môn',
    parent_guardian: 'Phụ huynh / Người giám hộ',
    institutional_partner: 'Đối tác tổ chức',
    other: 'Khác',
  },
};

const interestAreaLabels: Record<Locale, Record<InterestArea, string>> = {
  en: {
    teacher_training: 'Teacher Training',
    school_licensing: 'School Licensing',
    curriculum_review: 'Curriculum Review',
    academic_consulting: 'Academic Consulting',
    institutional_partnerships: 'Institutional Partnerships',
    digital_reasoning_engine: 'Digital Reasoning Engine',
  },
  vi: {
    teacher_training: 'Đào tạo giáo viên',
    school_licensing: 'Cấp phép cho trường',
    curriculum_review: 'Rà soát chương trình',
    academic_consulting: 'Tư vấn học thuật',
    institutional_partnerships: 'Hợp tác tổ chức',
    digital_reasoning_engine: 'Digital Reasoning Engine',
  },
};

const preferredContactMethodLabels: Record<Locale, Record<PreferredContactMethod, string>> = {
  en: {
    email: 'Email',
    phone_whatsapp: 'Phone / WhatsApp',
    either: 'Either',
  },
  vi: {
    email: 'Email',
    phone_whatsapp: 'Điện thoại / WhatsApp',
    either: 'Cả hai đều được',
  },
};

const pricingErrorMessages: Record<Locale, Record<string, string>> = {
  en: {
    fullNameRequired: 'Full name is required.',
    workEmailRequired: 'Work email is required.',
    workEmailInvalid: 'Enter a valid work email.',
    roleTitleRequired: 'Role or title is required.',
    organizationNameRequired: 'Organisation name is required.',
    countryRegionRequired: 'Country or region is required.',
    buyerTypeRequired: 'Select a buyer type.',
    interestAreaRequired: 'Select an area of interest.',
    contactConsentRequired: 'You must agree to be contacted to submit this form.',
    spamDetected: 'Spam detected.',
  },
  vi: {
    fullNameRequired: 'Họ và tên là bắt buộc.',
    workEmailRequired: 'Email công việc là bắt buộc.',
    workEmailInvalid: 'Vui lòng nhập email công việc hợp lệ.',
    roleTitleRequired: 'Vai trò hoặc chức danh là bắt buộc.',
    organizationNameRequired: 'Tên tổ chức là bắt buộc.',
    countryRegionRequired: 'Quốc gia hoặc khu vực là bắt buộc.',
    buyerTypeRequired: 'Vui lòng chọn nhóm người mua.',
    interestAreaRequired: 'Vui lòng chọn lĩnh vực quan tâm.',
    contactConsentRequired: 'Bạn phải đồng ý để được liên hệ mới có thể gửi biểu mẫu này.',
    spamDetected: 'Đã phát hiện spam.',
  },
};

export function pricingLabel(value: string, locale: Locale = 'en'): string {
  if (value in buyerTypeLabels[locale]) return buyerTypeLabels[locale][value as BuyerType];
  if (value in interestAreaLabels[locale]) return interestAreaLabels[locale][value as InterestArea];
  if (value in preferredContactMethodLabels[locale]) {
    return preferredContactMethodLabels[locale][value as PreferredContactMethod];
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

export function validatePricingRegistration(
  values: PricingRegistrationValues,
  locale: Locale = 'en',
): PricingValidationErrors {
  const errors: PricingValidationErrors = {};
  const messages = pricingErrorMessages[locale];

  if (!values.fullName.trim()) errors.fullName = messages.fullNameRequired;
  if (!values.workEmail.trim()) errors.workEmail = messages.workEmailRequired;
  else if (!isEmail(values.workEmail.trim())) errors.workEmail = messages.workEmailInvalid;

  if (!values.roleTitle.trim()) errors.roleTitle = messages.roleTitleRequired;
  if (!values.organizationName.trim()) errors.organizationName = messages.organizationNameRequired;
  if (!values.countryRegion.trim()) errors.countryRegion = messages.countryRegionRequired;

  if (!isOption(values.buyerType, buyerTypeOptions)) {
    errors.buyerType = messages.buyerTypeRequired;
  }

  if (!isOption(values.interestArea, interestAreaOptions)) {
    errors.interestArea = messages.interestAreaRequired;
  }

  if (!values.contactConsent) {
    errors.contactConsent = messages.contactConsentRequired;
  }

  if (values.website.trim()) {
    errors.website = messages.spamDetected;
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
import type { Locale } from '../i18n/locales';
