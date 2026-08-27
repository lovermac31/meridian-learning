/**
 * analytics.ts — JE CTA event schema
 *
 * Wraps Vercel Analytics `track()` with typed, consistent event shapes.
 * Import from this module rather than calling `track()` directly so the
 * full event catalogue stays in one place.
 */
import { track } from '@vercel/analytics';

export type CtaType       = 'primary' | 'secondary' | 'low_friction';
export type AudienceSegment = 'institutional' | 'institutional_snapshot' | 'parent_student' | 'unknown';

/** Fired on every CTA click across all pages. */
export function trackCtaClick(params: {
  label:   string;
  type:    CtaType;
  segment: AudienceSegment;
  page?:   string;
}) {
  track('cta_click', {
    cta_label:       params.label,
    cta_type:        params.type,
    audience_segment: params.segment,
    cta_page:        params.page ?? window.location.pathname,
  });
}

/** Fired when the user first interacts with the enquiry form. */
export function trackFormStart(source?: string) {
  track('form_start', {
    source: source ?? window.location.pathname,
  });
}

/** Fired on successful form submission. */
export function trackFormSubmit(submissionId: string) {
  track('form_submit', {
    submission_id: submissionId,
    page: window.location.pathname,
  });
}

/** Fired when a low-friction CTA (e.g. Curriculum Overview request) is clicked. */
export function trackLowFrictionClick(label: string) {
  track('low_friction_click', {
    label,
    page: window.location.pathname,
  });
}

/** Where a "Preferred Sources" CTA is rendered. */
export type PreferredSourcePlacement =
  | 'homepage'
  | 'footer'
  | 'article_end'
  | 'student_academy'
  | 'resources';

/**
 * Fired when the Google "Preferred Sources" CTA is clicked. Tracks the JE CTA
 * interaction only — never Google's own opt-in behaviour or any account data.
 */
export function trackPreferredSourceClick(params: {
  placement: PreferredSourcePlacement;
  variant?: string;
}) {
  track('preferred_source_click', {
    placement:   params.placement,
    cta_variant: params.variant ?? 'default',
    page_path:   window.location.pathname,
    language:    (typeof document !== 'undefined' && document.documentElement.lang) || 'en',
  });
}
