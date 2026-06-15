/**
 * Testimonials data layer + guardrails (Phase 1).
 *
 * This module is PURE (no DOM, no fetch) so the guardrails are unit-testable
 * and runnable at build time. Components and the schema injector consume it.
 *
 * The invariants enforced here, each covered by tests/testimonials.test.ts:
 *  1. Verified-only        → getPublishable() returns ONLY published+consented.
 *  2. Consent on record    → publishable requires consent.granted && record.
 *  3. Minor-safe           → getMinorSafetyViolations() / assertMinorSafe().
 *  4. Claim discipline      → checkClaimDiscipline() / assertClaimDiscipline().
 *  5. Schema honesty        → buildReviewSchema() returns null below threshold;
 *                             assertSchemaHonesty() throws if violated.
 */
import type {
  AggregateRating,
  ClaimDisciplineResult,
  Program,
  Testimonial,
  TestimonialLocale,
  TestimonialSource,
} from '../types/testimonial';
import sourceJson from '../content/testimonials.json';

/** Minimum genuine, consented ratings before any Review/AggregateRating is emitted. */
export const MIN_REVIEWS_FOR_SCHEMA = 3;

/** Existing organization node the reviews nest under (do not duplicate @id). */
export const ORG_ID = 'https://jurassicenglish.com/#organization';

/**
 * Phase flag — each phase ships dark. Until explicitly enabled, the system
 * renders nothing live (Phase 2 mounts the empty-state / wall behind this).
 * Reads import.meta.env when present (Vite) and falls back to process.env
 * (node/build/test); defaults OFF.
 */
export function isTestimonialsEnabled(): boolean {
  try {
    const viteEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
    if (viteEnv && 'VITE_TESTIMONIALS_ENABLED' in viteEnv) {
      return viteEnv.VITE_TESTIMONIALS_ENABLED === 'true';
    }
  } catch {
    /* import.meta not available in this context */
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.VITE_TESTIMONIALS_ENABLED === 'true';
  }
  return false;
}

/**
 * Claim-discipline lint. Quotes must not promise scores or assert band
 * guarantees. Reviewer-stated band numbers are allowed as plain statements;
 * only PROMISE/GUARANTEE framing is rejected. Covers en + vi + zh phrasing.
 */
const BANNED_CLAIM_PATTERNS: ReadonlyArray<{ re: RegExp; label: string }> = [
  { re: /\bguarantee(d|s)?\b/i, label: 'guarantee' },
  { re: /\b(promis(e|ed|es)|assured?)\s+(a\s+)?(band|score|ielts)/i, label: 'promised-band/score' },
  { re: /\b(band|score)\s*\d(\.\d)?\s*(guaranteed|promised|assured)\b/i, label: 'band-N-guaranteed' },
  { re: /\b100\s*%\s*(score|results?|success|pass)\b/i, label: '100%-results' },
  { re: /\bcam\s*k(ế|e)t\s*(đi(ể|e)m|band)/i, label: 'vi: cam kết điểm/band' },
  { re: /\b(đ|d)(ả|a)m\s*b(ả|a)o\s*(đi(ể|e)m|band)/i, label: 'vi: đảm bảo điểm' },
  { re: /保(证|障)[^。.]{0,6}分/, label: 'zh: 保证/保障…分' },
  { re: /包过|保分/, label: 'zh: 包过/保分' },
];

export function checkClaimDiscipline(quote: string): ClaimDisciplineResult {
  const violations = BANNED_CLAIM_PATTERNS.filter((p) => p.re.test(quote)).map((p) => p.label);
  return { ok: violations.length === 0, violations };
}

/** Scope ladder: which media a consent scope permits. */
function scopePermitsImage(scope: Testimonial['consent']['scope']): boolean {
  return scope === 'text+photo' || scope === 'text+video';
}
function scopePermitsVideo(scope: Testimonial['consent']['scope']): boolean {
  return scope === 'text+video';
}

const SCHOOL_KEYWORDS = /\b(school|truong|trường|学校|grade\s*\d|lớp\s*\d|年级)\b/i;
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const LONG_DIGIT_RUN = /\d[\d\s.-]{6,}\d/; // phone-like

/**
 * Minor-safety scan. Returns human-readable violations; empty = safe.
 * Enforces: no minor PII in authorDisplay (school/grade, email, phone), and
 * media only when the consent scope explicitly permits it.
 */
export function getMinorSafetyViolations(t: Testimonial): string[] {
  const v: string[] = [];
  if (SCHOOL_KEYWORDS.test(t.authorDisplay)) v.push(`authorDisplay names a school/grade: "${t.authorDisplay}"`);
  if (EMAIL_RE.test(t.authorDisplay)) v.push('authorDisplay contains an email');
  if (LONG_DIGIT_RUN.test(t.authorDisplay)) v.push('authorDisplay contains a phone-like number');
  if (t.mediaType === 'image' && !scopePermitsImage(t.consent.scope)) {
    v.push(`image media without photo consent (scope: ${t.consent.scope})`);
  }
  if (t.mediaType === 'video' && !scopePermitsVideo(t.consent.scope)) {
    v.push(`video media without video consent (scope: ${t.consent.scope})`);
  }
  if (t.mediaUrl && t.mediaType === 'text') v.push('mediaUrl present on a text testimonial');
  return v;
}

/** Load the raw source. (Static import → available at build and in tests.) */
export function loadTestimonials(): Testimonial[] {
  const src = sourceJson as unknown as TestimonialSource;
  return Array.isArray(src.testimonials) ? src.testimonials : [];
}

/** The single source of truth for "may this render publicly?" */
export function isPublishable(t: Testimonial): boolean {
  return (
    t.status === 'published' &&
    t.consent.granted === true &&
    typeof t.consent.record === 'string' &&
    t.consent.record.length > 0
  );
}

export interface PublishableQuery {
  locale?: TestimonialLocale;
  program?: Program;
}

/**
 * The ONLY function components may use to obtain renderable testimonials.
 * Drafts, verified-but-unpublished, archived, and unconsented entries are
 * structurally excluded. Optionally narrowed by locale/program.
 */
export function getPublishable(query: PublishableQuery = {}): Testimonial[] {
  return loadTestimonials().filter((t) => {
    if (!isPublishable(t)) return false;
    if (query.locale && t.locale !== query.locale) return false;
    if (query.program && t.program !== query.program) return false;
    return true;
  });
}

/** Throw if any publishable quote breaks claim discipline (build-time guard). */
export function assertClaimDiscipline(list: Testimonial[]): void {
  for (const t of list) {
    const r = checkClaimDiscipline(t.quote);
    if (!r.ok) {
      throw new Error(`Claim-discipline violation in "${t.id}": ${r.violations.join(', ')}`);
    }
  }
}

/** Throw if any publishable entry has a minor-safety violation (build-time guard). */
export function assertMinorSafe(list: Testimonial[]): void {
  for (const t of list) {
    const v = getMinorSafetyViolations(t);
    if (v.length) throw new Error(`Minor-safety violation in "${t.id}": ${v.join('; ')}`);
  }
}

/** Publishable + consented + rated — the only entries eligible for schema. */
export function getRatedForSchema(query: PublishableQuery = {}): Testimonial[] {
  return getPublishable(query).filter((t) => typeof t.rating === 'number');
}

export function buildAggregateRating(list: Testimonial[]): AggregateRating | null {
  const rated = list.filter((t) => typeof t.rating === 'number');
  if (rated.length < MIN_REVIEWS_FOR_SCHEMA) return null;
  const sum = rated.reduce((acc, t) => acc + (t.rating as number), 0);
  return {
    ratingValue: Math.round((sum / rated.length) * 10) / 10,
    reviewCount: rated.length,
    bestRating: 5,
    worstRating: 1,
  };
}

export interface ReviewSchema {
  aggregateRating: AggregateRating;
  reviews: Array<Record<string, unknown>>;
}

/**
 * Build Review[] + AggregateRating JSON-LD from an explicit list — ONLY when
 * ≥ MIN_REVIEWS_FOR_SCHEMA genuine, rated, claim-clean, minor-safe entries
 * exist. Returns null otherwise. (Exposed for tests + callers with a list.)
 */
export function buildReviewSchemaFromList(list: Testimonial[]): ReviewSchema | null {
  const rated = list.filter((t) => typeof t.rating === 'number');
  if (rated.length < MIN_REVIEWS_FOR_SCHEMA) return null;
  // Honesty: never emit schema from entries that fail any guardrail.
  assertClaimDiscipline(rated);
  assertMinorSafe(rated);
  const aggregate = buildAggregateRating(rated);
  if (!aggregate) return null;
  const reviews = rated.map((t) => ({
    '@type': 'Review',
    reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: 5, worstRating: 1 },
    author: { '@type': 'Person', name: t.authorDisplay },
    reviewBody: t.quote,
    datePublished: t.dateGiven,
  }));
  return { aggregateRating: aggregate, reviews };
}

/**
 * Build Review/AggregateRating schema from the live source (published +
 * consented + rated only). Returns null below threshold → caller renders
 * visually WITHOUT rating schema.
 */
export function buildReviewSchema(query: PublishableQuery = {}): ReviewSchema | null {
  return buildReviewSchemaFromList(getRatedForSchema(query));
}

/**
 * CI honesty assertion: a non-null schema MUST be backed by ≥ threshold real
 * ratings. Wire into the build to fail CI on any self-serving markup.
 */
export function assertSchemaHonesty(query: PublishableQuery = {}): void {
  const schema = buildReviewSchema(query);
  if (schema === null) return; // no schema is always honest
  const ratedCount = getRatedForSchema(query).length;
  if (ratedCount < MIN_REVIEWS_FOR_SCHEMA) {
    throw new Error(
      `Schema honesty violation: emitting rating schema with ${ratedCount} < ${MIN_REVIEWS_FOR_SCHEMA} verified ratings.`,
    );
  }
  if (schema.aggregateRating.reviewCount !== ratedCount) {
    throw new Error('Schema honesty violation: reviewCount does not match verified rated entries.');
  }
}
