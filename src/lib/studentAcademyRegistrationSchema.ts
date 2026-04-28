/**
 * Student Academy registration schema
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared types + validation for the B2C registration form at
 * https://jurassicenglish.com/book-diagnostic and the matching API endpoint
 * /api/student-academy-register.
 *
 * Mirrors the patterns used in `getStartedSchema.ts` and
 * `pricingRegistrationSchema.ts`:
 *   • Closed enums for category fields
 *   • Normalised submission shape consumed by the Supabase writer
 *   • Server-side validation function returns a typed result
 *
 * No PII is logged by this module — callers handle redaction.
 */

// ─── Closed enums ────────────────────────────────────────────────────────────

export const preferredContactMethodOptions = [
  'email',
  'whatsapp',
  'zalo',
  'wechat',
  'phone',
] as const;

export const mainGoalOptions = [
  'reading_confidence',
  'academic_writing',
  'speaking_confidence',
  'ielts_preparation',
  'general_academic_english',
  'not_sure_yet',
] as const;

export const authProviderOptions = ['email', 'google', 'manual'] as const;

export type PreferredContactMethod = (typeof preferredContactMethodOptions)[number];
export type MainGoal = (typeof mainGoalOptions)[number];
export type AuthProvider = (typeof authProviderOptions)[number];

// ─── Form values (client-facing) ─────────────────────────────────────────────

export type StudentAcademyRegistrationFormValues = {
  parentFullName: string;
  parentEmail: string;
  phoneContact: string;
  preferredContactMethod: PreferredContactMethod | '';
  countryCity: string;
  studentFirstName: string;
  studentAgeOrGrade: string;
  currentEnglishLevel: string;
  mainGoal: MainGoal | '';
  learningNotes: string;
  preferredDiagnosticTime: string;
  consentContact: boolean;
  /**
   * Honeypot field — real users never see this; bots fill it. Server-side
   * validation rejects any non-empty value.
   */
  website?: string;
  /** ISO timestamp captured when the form first rendered (anti-spam). */
  startedAt?: string;
  /** Reserved for future Supabase Auth Google OAuth wiring. Default 'email'. */
  authProvider?: AuthProvider;
};

// ─── Normalised submission (server-internal) ─────────────────────────────────

export type NormalizedStudentAcademyRegistration = {
  submissionId: string;
  submittedAt: string;
  /**
   * Channel-level provenance (which page / form / flow produced this
   * registration). Stored verbatim in the `registration_source` column.
   * Defaults to `'student-academy'` when the payload omits it. The form
   * at `/book-diagnostic` sends `'student-academy-book-diagnostic'`.
   */
  registrationSource: string;
  authProvider: AuthProvider;
  parentFullName: string;
  parentEmail: string;
  phoneContact: string | null;
  preferredContactMethod: PreferredContactMethod | null;
  countryCity: string | null;
  studentFirstName: string | null;
  studentAgeOrGrade: string | null;
  currentEnglishLevel: string | null;
  mainGoal: MainGoal | null;
  learningNotes: string | null;
  preferredDiagnosticTime: string | null;
  consentContact: boolean;
};

// ─── Validation ──────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const MAX_TEXT = 500;
const MAX_LONG_TEXT = 2_000;

function trim(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function trimToLimit(value: unknown, limit: number): string {
  return trim(value).slice(0, limit);
}

function trimToNullable(value: unknown, limit: number): string | null {
  const trimmed = trimToLimit(value, limit);
  return trimmed.length > 0 ? trimmed : null;
}

function pickEnum<T extends readonly string[]>(
  options: T,
  value: unknown,
): T[number] | null {
  const v = trim(value);
  return (options as readonly string[]).includes(v) ? (v as T[number]) : null;
}

export type ValidateResult =
  | { ok: true; submission: NormalizedStudentAcademyRegistration }
  | { ok: false; reason: string; field?: keyof StudentAcademyRegistrationFormValues };

/**
 * Server-side normalisation + validation. Never throws.
 * The caller (API endpoint) handles error responses.
 *
 * Accepts BOTH camelCase (legacy ecosystem-landing form) and snake_case
 * (Consolidation Option 3 spec, /api/get-started route) field names.
 * The snake_case names are the canonical target — once the form is
 * fully migrated, the camelCase fallbacks can be removed.
 */
export function validateStudentAcademyRegistration(
  input: unknown,
  options: { submissionId: string; submittedAt: string },
): ValidateResult {
  if (!input || typeof input !== 'object') {
    return { ok: false, reason: 'invalid_payload' };
  }
  const raw = input as Record<string, unknown>;

  // --- Field aliasing (snake_case primary, camelCase fallback) ---------------
  const parentFullName = trimToLimit(
    raw.parent_or_guardian_full_name ?? raw.parentFullName,
    200,
  );
  if (parentFullName.length < 2) {
    return { ok: false, reason: 'invalid_parent_full_name', field: 'parentFullName' };
  }

  const parentEmail = trimToLimit(raw.email ?? raw.parentEmail, 254).toLowerCase();
  if (!EMAIL_RE.test(parentEmail)) {
    return { ok: false, reason: 'invalid_parent_email', field: 'parentEmail' };
  }

  const consentRaw = raw.consent ?? raw.consentContact;
  const consentContact = consentRaw === true || consentRaw === 'true';
  if (!consentContact) {
    return { ok: false, reason: 'consent_required', field: 'consentContact' };
  }

  // country/city: support either separate `country` + `city` (spec) or
  // the legacy combined `country_city`/`countryCity` field.
  const country = trimToNullable(raw.country, MAX_TEXT);
  const city    = trimToNullable(raw.city, MAX_TEXT);
  const combinedCountryCity = trimToNullable(
    raw.country_city ?? raw.countryCity ??
      (country || city ? [city, country].filter(Boolean).join(', ') : null),
    MAX_TEXT,
  );

  const authProvider = pickEnum(authProviderOptions, raw.authProvider) ?? 'email';

  // Channel-level provenance. Falls back to the canonical default
  // 'student-academy' when the payload omits it. Length-clamped to keep
  // the field short and free of accidental long-form notes.
  const REGISTRATION_SOURCE_DEFAULT = 'student-academy';
  const registrationSource =
    trimToLimit(raw.registration_source ?? raw.registrationSource, 120) ||
    REGISTRATION_SOURCE_DEFAULT;

  return {
    ok: true,
    submission: {
      submissionId: options.submissionId,
      submittedAt: options.submittedAt,
      registrationSource,
      authProvider,
      parentFullName,
      parentEmail,
      phoneContact: trimToNullable(raw.phone ?? raw.phoneContact, MAX_TEXT),
      preferredContactMethod: pickEnum(
        preferredContactMethodOptions,
        raw.preferred_contact_method ?? raw.preferredContactMethod,
      ),
      countryCity: combinedCountryCity,
      studentFirstName: trimToNullable(raw.student_name ?? raw.studentFirstName, 200),
      studentAgeOrGrade: trimToNullable(raw.student_age ?? raw.studentAgeOrGrade, 80),
      currentEnglishLevel: trimToNullable(
        raw.current_english_level ?? raw.currentEnglishLevel,
        200,
      ),
      mainGoal: pickEnum(
        mainGoalOptions,
        raw.learning_goal ?? raw.mainGoal,
      ),
      learningNotes: trimToNullable(
        raw.learning_notes ?? raw.learningNotes,
        MAX_LONG_TEXT,
      ),
      preferredDiagnosticTime: trimToNullable(
        raw.preferred_diagnostic_time ?? raw.preferredDiagnosticTime,
        MAX_TEXT,
      ),
      consentContact,
    },
  };
}

// ─── Anti-spam helpers (mirrors get-started.ts conventions) ─────────────────

const MIN_SUBMISSION_DELAY_MS = 1500;
const MAX_SUBMISSION_AGE_MS = 1000 * 60 * 60 * 8;

export function isSpam(startedAt: unknown, website: unknown): boolean {
  if (typeof website === 'string' && website.trim().length > 0) return true;
  if (typeof startedAt !== 'string' || startedAt.length === 0) return true;
  const startedTime = new Date(startedAt).getTime();
  if (Number.isNaN(startedTime)) return true;
  const elapsed = Date.now() - startedTime;
  return elapsed < MIN_SUBMISSION_DELAY_MS || elapsed > MAX_SUBMISSION_AGE_MS;
}
