/**
 * Testimonial type contract — Phase 1 foundation of the verified-only,
 * consent-gated, child-safe social-proof system.
 *
 * Every guardrail in the build brief is encoded here or enforced by
 * src/lib/testimonials.ts (and asserted by tests/testimonials.test.ts):
 *  - Verified-only: only `status: "published"` renders (see isPublishable).
 *  - Consent on record: `consent.granted` + `consent.record` required to publish.
 *  - Minor-safe: `authorDisplay` carries NO minor PII (parent first name +
 *    child age band only); media requires a consent scope that permits it.
 *  - Claim discipline: `quote` is lint-checked for score-guarantee language.
 *  - Schema honesty: ratings feed Review/AggregateRating JSON-LD only above a
 *    configured minimum of genuine, consented ratings.
 */

export const TESTIMONIAL_STATUSES = ['draft', 'verified', 'published', 'archived'] as const;
export type TestimonialStatus = (typeof TESTIMONIAL_STATUSES)[number];

/**
 * Consent scope is a strict ladder. Each level implicitly permits everything
 * a lower display needs, but media (photo/video) MUST have its matching scope.
 */
export const CONSENT_SCOPES = ['text', 'text+firstname', 'text+photo', 'text+video'] as const;
export type ConsentScope = (typeof CONSENT_SCOPES)[number];

export const PROGRAMS = ['speaking-foundations', 'ielts-reasoning-lab'] as const;
export type Program = (typeof PROGRAMS)[number];

/** Mirrors the site's hreflang locales (en / vi / zh-CN). */
export const TESTIMONIAL_LOCALES = ['en', 'vi', 'zh-CN'] as const;
export type TestimonialLocale = (typeof TESTIMONIAL_LOCALES)[number];

export const MEDIA_TYPES = ['text', 'image', 'video'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface ConsentRecord {
  /** Whether parental/owner consent is on file. No `true` → never published. */
  granted: boolean;
  /** ISO date the consent was captured. */
  date: string;
  /** Exactly what the parent consented to display. */
  scope: ConsentScope;
  /** Pointer to the stored signed consent (form id, Drive link, Notion id…). */
  record: string;
}

export interface Testimonial {
  id: string;
  status: TestimonialStatus;
  consent: ConsentRecord;
  program: Program;
  /**
   * Public attribution with NO minor PII — e.g. "Linh, parent of a 12-year-old".
   * Never a child's full name, school, or identifying data.
   */
  authorDisplay: string;
  locale: TestimonialLocale;
  /** Claim-discipline checked: no score guarantees / unverifiable band promises. */
  quote: string;
  /** Optional — the reviewer's OWN rating, never a JE promise. */
  rating?: Rating;
  mediaType: MediaType;
  /** Consented assets only; lazy-loaded with explicit dimensions (CLS = 0). */
  mediaUrl?: string;
  /** Width/height carried so media reserves space and never shifts layout. */
  mediaWidth?: number;
  mediaHeight?: number;
  verifiedBadge: boolean;
  /** ISO date the testimonial was given (drives schema datePublished). */
  dateGiven: string;
}

/** The on-disk source shape (wrapper documents the verified-only invariant). */
export interface TestimonialSource {
  _doc?: string;
  testimonials: Testimonial[];
}

/** Result of a claim-discipline check on a single quote. */
export interface ClaimDisciplineResult {
  ok: boolean;
  violations: string[];
}

/** Aggregate computed ONLY from genuine, consented, rated testimonials. */
export interface AggregateRating {
  ratingValue: number;
  reviewCount: number;
  bestRating: 5;
  worstRating: 1;
}
