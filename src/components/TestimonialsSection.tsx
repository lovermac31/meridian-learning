/**
 * TestimonialsSection — the flag-gated mount point for the social-proof system.
 *
 * Contract (all enforced; see tests/testimonials-mount.test.ts):
 *  - Feature OFF (default)         → renders nothing (returns null).
 *  - Feature ON, 0 publishable     → renders the honest TestimonialsEmptyState.
 *  - Feature ON, ≥1 publishable    → renders ONLY published + consented entries
 *                                    via getPublishable(); never drafts/archived/
 *                                    unconsented, never fabricated examples.
 *
 * The page layer never bypasses guardrails — all selection logic lives in
 * src/lib/testimonials.ts. Styling is scoped under .je-testimonials so it
 * cannot leak into the rest of the app. No review schema is emitted here;
 * conditional JSON-LD is a later phase via buildReviewSchema().
 *
 * NOTE: the scoped stylesheet (src/styles/testimonials.css) is imported once at
 * the SPA entry (src/main.tsx), not here, so this component stays pure JS and
 * unit-testable under node:test (which has no CSS loader).
 */
import { getPublishable, isTestimonialsEnabled } from '../lib/testimonials';
import { TestimonialsEmptyState } from './TestimonialsEmptyState';
import type { Testimonial, TestimonialLocale } from '../types/testimonial';

const SECTION_TITLE: Record<TestimonialLocale, string> = {
  en: 'What parents say',
  vi: 'Phụ huynh nói gì',
  'zh-CN': '家长怎么说',
};

const VERIFIED_LABEL: Record<TestimonialLocale, string> = {
  en: 'Verified',
  vi: 'Đã xác minh',
  'zh-CN': '已核实',
};

export interface TestimonialsSectionProps {
  locale?: TestimonialLocale;
}

export function TestimonialsSection({ locale = 'en' }: TestimonialsSectionProps) {
  // Dark by default — when the flag is off there is no testimonial surface.
  if (!isTestimonialsEnabled()) return null;

  const published = getPublishable({ locale });

  // Honest empty state — we never invent content to fill the section.
  if (published.length === 0) {
    return <TestimonialsEmptyState locale={locale} />;
  }

  // Minimal, accessible render for genuine published+consented entries.
  // (The richer featured/wall/carousel treatment is reserved for Phase 3.)
  return (
    <section className="je-testimonials" aria-label={SECTION_TITLE[locale] ?? SECTION_TITLE.en}>
      <div className="je-testimonials-list">
        <h2 className="je-testimonials-list-title">{SECTION_TITLE[locale] ?? SECTION_TITLE.en}</h2>
        <ul className="je-testimonials-cards">
          {published.map((t) => (
            <li key={t.id}>
              <TestimonialCard testimonial={t} locale={locale} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial: t, locale }: { testimonial: Testimonial; locale: TestimonialLocale }) {
  return (
    <figure className="je-testimonial-card">
      <blockquote className="je-testimonial-quote">{t.quote}</blockquote>
      <figcaption className="je-testimonial-meta">
        <span className="je-testimonial-author">{t.authorDisplay}</span>
        {t.verifiedBadge ? (
          <span className="je-testimonial-verified">
            <svg aria-hidden="true" viewBox="0 0 16 16" width="13" height="13" focusable="false">
              <path
                fill="currentColor"
                d="M6.5 10.6 3.9 8l-1 1 3.6 3.6L14 5.1l-1-1z"
              />
            </svg>
            {VERIFIED_LABEL[locale] ?? VERIFIED_LABEL.en}
          </span>
        ) : null}
        {typeof t.rating === 'number' ? (
          <span
            className="je-testimonial-rating"
            aria-label={`${t.rating} out of 5 — reviewer's own rating`}
          >
            <span aria-hidden="true">{'★'.repeat(t.rating)}</span>
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}
