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

export const pilotAccessRequestOptions = [
  'pilot_overview_pack',
  'implementation_scope_overview',
  'reporting_sample',
  'readiness_checklist',
  'institutional_programme_pack',
  'pilot_consultation',
] as const;

export type OrganizationType = (typeof organizationTypeOptions)[number];
export type PrimaryInterest = (typeof primaryInterestOptions)[number];
export type Timeline = (typeof timelineOptions)[number];
export type DecisionStage = (typeof decisionStageOptions)[number];
export type PilotAccessRequest = (typeof pilotAccessRequestOptions)[number];

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
  source: string;
  accessRequest: PilotAccessRequest | '';
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
  source?: string;
  accessRequest?: PilotAccessRequest;
};

export type ValidationErrorMap = Partial<Record<keyof GetStartedFormValues, string>>;

const getStartedLabels: Record<Locale, Record<string, string>> = {
  en: {
    school: 'School',
    language_academy: 'Language Academy',
    educator: 'Educator',
    school_group: 'School Group',
    other: 'Other',
    teacher_training: 'Teacher Training',
    school_licensing: 'School Licensing',
    curriculum_review: 'Curriculum Review',
    consulting: 'Academic Consulting',
    partnership: 'Institutional Partnership',
    immediately: 'Immediately',
    within_3_months: 'Within 3 Months',
    within_6_months: 'Within 6 Months',
    exploring: 'Exploring',
    researching: 'Researching',
    comparing: 'Comparing',
    ready_for_consultation: 'Ready for Consultation',
    ready_to_pilot: 'Ready to Pilot',
    pilot_overview_pack: 'Full Pilot Overview Pack',
    implementation_scope_overview: 'Implementation Scope Overview',
    reporting_sample: 'Reporting Sample / Executive Summary Sample',
    readiness_checklist: 'Pilot Readiness Checklist',
    institutional_programme_pack: 'Detailed Institutional Programme Pack',
    pilot_consultation: 'Pilot Consultation',
  },
  vi: {
    school: 'Trường học',
    language_academy: 'Học viện ngôn ngữ',
    educator: 'Nhà giáo dục',
    school_group: 'Hệ thống trường',
    other: 'Khác',
    teacher_training: 'Đào tạo giáo viên',
    school_licensing: 'Cấp phép cho trường',
    curriculum_review: 'Rà soát chương trình',
    consulting: 'Tư vấn học thuật',
    partnership: 'Hợp tác tổ chức',
    immediately: 'Ngay lập tức',
    within_3_months: 'Trong 3 tháng',
    within_6_months: 'Trong 6 tháng',
    exploring: 'Đang tìm hiểu',
    researching: 'Đang nghiên cứu',
    comparing: 'Đang so sánh',
    ready_for_consultation: 'Sẵn sàng tư vấn',
    ready_to_pilot: 'Sẵn sàng thí điểm',
    pilot_overview_pack: 'Bộ tài liệu tổng quan thí điểm đầy đủ',
    implementation_scope_overview: 'Tổng quan phạm vi triển khai',
    reporting_sample: 'Mẫu báo cáo / mẫu tóm tắt điều hành',
    readiness_checklist: 'Danh sách kiểm tra sẵn sàng thí điểm',
    institutional_programme_pack: 'Bộ tài liệu chương trình dành cho tổ chức',
    pilot_consultation: 'Tư vấn thí điểm',
  },
};

const getStartedErrorMessages: Record<Locale, Record<string, string>> = {
  en: {
    fullNameRequired: 'Full name is required.',
    workEmailRequired: 'Work email is required.',
    workEmailInvalid: 'Enter a valid work email.',
    organizationNameRequired: 'Organization name is required.',
    organizationTypeRequired: 'Select an organization type.',
    primaryInterestRequired: 'Select a primary interest.',
    challengeRequired: 'Tell us what challenge you are trying to solve.',
    challengeShort: 'Please add a little more context.',
    contactConsentRequired: 'You must agree to be contacted to submit this form.',
    timelineInvalid: 'Select a valid timeline.',
    decisionStageInvalid: 'Select a valid decision stage.',
    accessRequestInvalid: 'Select a valid pilot access request.',
    spamDetected: 'Spam detected.',
  },
  vi: {
    fullNameRequired: 'Họ và tên là bắt buộc.',
    workEmailRequired: 'Email công việc là bắt buộc.',
    workEmailInvalid: 'Vui lòng nhập email công việc hợp lệ.',
    organizationNameRequired: 'Tên tổ chức là bắt buộc.',
    organizationTypeRequired: 'Vui lòng chọn loại hình tổ chức.',
    primaryInterestRequired: 'Vui lòng chọn mối quan tâm chính.',
    challengeRequired: 'Hãy cho chúng tôi biết thách thức bạn đang muốn giải quyết.',
    challengeShort: 'Vui lòng bổ sung thêm một chút bối cảnh.',
    contactConsentRequired: 'Bạn phải đồng ý để được liên hệ mới có thể gửi biểu mẫu này.',
    timelineInvalid: 'Vui lòng chọn mốc thời gian hợp lệ.',
    decisionStageInvalid: 'Vui lòng chọn giai đoạn quyết định hợp lệ.',
    accessRequestInvalid: 'Vui lòng chọn yêu cầu truy cập thí điểm hợp lệ.',
    spamDetected: 'Đã phát hiện spam.',
  },
};

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
  source: '',
  accessRequest: '',
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

export function validateGetStartedPayload(
  values: GetStartedFormValues,
  locale: Locale = 'en',
): ValidationErrorMap {
  const errors: ValidationErrorMap = {};
  const messages = getStartedErrorMessages[locale];

  if (!values.fullName.trim()) errors.fullName = messages.fullNameRequired;
  if (!values.workEmail.trim()) errors.workEmail = messages.workEmailRequired;
  else if (!isEmail(values.workEmail.trim())) errors.workEmail = messages.workEmailInvalid;

  if (!values.organizationName.trim()) {
    errors.organizationName = messages.organizationNameRequired;
  }

  if (!isOption(values.organizationType, organizationTypeOptions)) {
    errors.organizationType = messages.organizationTypeRequired;
  }

  if (!isOption(values.primaryInterest, primaryInterestOptions)) {
    errors.primaryInterest = messages.primaryInterestRequired;
  }

  if (!values.challenge.trim()) errors.challenge = messages.challengeRequired;
  else if (values.challenge.trim().length < 20) errors.challenge = messages.challengeShort;

  if (!values.contactConsent) {
    errors.contactConsent = messages.contactConsentRequired;
  }

  if (values.timeline && !isOption(values.timeline, timelineOptions)) {
    errors.timeline = messages.timelineInvalid;
  }

  if (values.decisionStage && !isOption(values.decisionStage, decisionStageOptions)) {
    errors.decisionStage = messages.decisionStageInvalid;
  }

  if (values.accessRequest && !isOption(values.accessRequest, pilotAccessRequestOptions)) {
    errors.accessRequest = messages.accessRequestInvalid;
  }

  if (values.website.trim()) {
    errors.website = messages.spamDetected;
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
    source: typeof record.source === 'string' ? record.source : '',
    accessRequest:
      typeof record.accessRequest === 'string' ? (record.accessRequest as PilotAccessRequest | '') : '',
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
    source: cleanOptional(values.source),
    accessRequest: values.accessRequest || undefined,
  };
}

export function getStartedLabel(value: string, locale: Locale = 'en') {
  const localized = getStartedLabels[locale][value];

  if (localized) {
    return localized;
  }

  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
import type { Locale } from '../i18n/locales';
