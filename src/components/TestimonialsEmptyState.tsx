/**
 * TestimonialsEmptyState — the honest fallback shown when no PUBLISHED +
 * CONSENTED testimonials exist for the active locale.
 *
 * Guardrail: we never fabricate content to fill space. Until real, consented
 * testimonials enter via the moderation pipeline (Phase 4), this is what
 * renders. Locale-aware (en/vi/zh-CN); reusable in the SPA and the YL island.
 * Presentational + pure (no data access) — styling via src/styles/testimonials.css.
 */
import { useId } from 'react';
import type { TestimonialLocale } from '../types/testimonial';
import { baselineHref } from '../lib/baselineLink';

interface EmptyCopy {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  ariaLabel: string;
}

const COPY: Record<TestimonialLocale, EmptyCopy> = {
  en: {
    eyebrow: 'Parent stories',
    title: 'Real results, shared with consent',
    body: 'Early-cohort results are being collected. Book a Live Speaking Baseline to see where your child stands today.',
    cta: 'Book a Speaking Baseline',
    ariaLabel: 'Parent testimonials',
  },
  vi: {
    eyebrow: 'Câu chuyện phụ huynh',
    title: 'Kết quả thật, chia sẻ khi có sự đồng ý',
    body: 'Chúng tôi đang thu thập kết quả từ các nhóm học đầu tiên. Hãy đặt lịch Đánh giá Nói trực tiếp để biết con đang ở đâu hôm nay.',
    cta: 'Đặt lịch đánh giá Nói trực tiếp',
    ariaLabel: 'Cảm nhận của phụ huynh',
  },
  'zh-CN': {
    eyebrow: '家长心声',
    title: '真实结果，经同意后分享',
    body: '我们正在收集首批学员的成长结果。欢迎预约真人口语基线测评，了解孩子目前的水平。',
    cta: '预约口语基线测评',
    ariaLabel: '家长评价',
  },
};

export interface TestimonialsEmptyStateProps {
  locale?: TestimonialLocale;
  ctaHref?: string;
}

export function TestimonialsEmptyState({
  locale = 'en',
  ctaHref = baselineHref(locale),
}: TestimonialsEmptyStateProps) {
  const copy = COPY[locale] ?? COPY.en;
  const titleId = useId();

  return (
    <section className="je-testimonials" aria-labelledby={titleId} aria-label={copy.ariaLabel}>
      <div className="je-testimonials-empty">
        <p className="t-eyebrow">{copy.eyebrow}</p>
        <h2 id={titleId} className="t-title">
          {copy.title}
        </h2>
        <p className="t-body">{copy.body}</p>
        <a className="t-cta" href={ctaHref} target="_blank" rel="noopener">
          {copy.cta}
        </a>
      </div>
    </section>
  );
}
