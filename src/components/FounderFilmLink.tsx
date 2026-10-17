/**
 * FounderFilmLink — the one way the site links to Mr. Jay's founder film.
 *
 * The film lives at an unlisted static section (public/film/<token>/, noindex,
 * out of the sitemap). It is AI-assisted, so every link to it carries the AI
 * label (Google Vids, AI video, AI voice) in the same visual unit: a viewer never reaches the film without being
 * told first. It is a plain document link (not RouteLink): the film is a static
 * page outside the SPA. It never autoplays and never appears on children's pages.
 *
 * Placement (Oct 2026): founder page (card), homepage "Meet your teacher"
 * (inline), WorldWise / Companies / Pilot Programme heroes (dark).
 */
import { Play } from 'lucide-react';
import type { Locale } from '../i18n/locales';
import { trackCtaClick } from '../lib/analytics';

export const FOUNDER_FILM_BASE = '/film/jay-adams-rgfr11pf7cqk/';
export const FOUNDER_FILM_THUMB = '/images/founder-film-thumb.webp';

/** The film's Vietnamese page is its root; English sits at /en/. */
export function founderFilmHref(locale: Locale): string {
  return locale === 'vi' ? FOUNDER_FILM_BASE : `${FOUNDER_FILM_BASE}en/`;
}

export const FOUNDER_FILM_COPY = {
  en: {
    cta: 'Watch my vision in 60 seconds',
    ctaB2b: 'Watch the 60-second founder vision film',
    title: 'A message from Mr. Jay',
    body: 'Why I built Jurassic English and WorldWise Learning, in one minute. Subtitles in 10 languages.',
    label: 'Made with Google Vids: AI video and AI voice',
    note: 'Scenes are illustrative, not real lessons or clients.',
    thumbAlt: 'Still from the founder vision film (AI-generated with Google Vids)',
  },
  vi: {
    cta: 'Xem tầm nhìn của thầy Jay trong 60 giây',
    ctaB2b: 'Xem phim tầm nhìn 60 giây của nhà sáng lập',
    title: 'Lời nhắn từ thầy Jay',
    body: 'Vì sao thầy xây dựng Jurassic English và WorldWise Learning, trong một phút. Phụ đề 10 ngôn ngữ.',
    label: 'Thực hiện bằng Google Vids: video và giọng nói do AI tạo',
    note: 'Các cảnh mang tính minh họa, không phải buổi học hay khách hàng thật.',
    thumbAlt: 'Ảnh từ phim tầm nhìn của nhà sáng lập (do AI tạo bằng Google Vids)',
  },
} as const satisfies Record<Locale, Record<string, string>>;

type Variant = 'card' | 'inline' | 'dark';

export function FounderFilmLink({ locale, variant }: { locale: Locale; variant: Variant }) {
  const copy = FOUNDER_FILM_COPY[locale];
  const href = founderFilmHref(locale);
  // Same CTA event schema as every other link; never personal data.
  const onClick = () => trackCtaClick({ label: `founder_film_${variant}`, type: 'secondary', segment: variant === 'dark' ? 'institutional' : 'parent_student' });

  if (variant === 'card') {
    return (
      <aside className="founder-film-card not-prose my-8 overflow-hidden rounded-2xl border border-jurassic-dark/10 bg-white shadow-sm" aria-label={copy.title} data-founder-film="card">
        <a href={href} onClick={onClick} className="group grid gap-0 no-underline sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]" style={{ textDecoration: 'none' }}>
          <span className="relative block aspect-video bg-jurassic-dark sm:aspect-auto">
            <img src={FOUNDER_FILM_THUMB} alt={copy.thumbAlt} width={640} height={360} loading="lazy" decoding="async" className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100" />
            <span aria-hidden="true" className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-jurassic-dark shadow-lg">
              <Play className="h-5 w-5 translate-x-0.5" />
            </span>
          </span>
          <span className="block p-5">
            <span className="block text-xs font-bold uppercase tracking-widest text-jurassic-accent">{copy.label}</span>
            <span className="mt-1 block text-lg font-bold text-jurassic-dark">{copy.title}</span>
            <span className="mt-1 block text-sm text-slate-600">{copy.body}</span>
            <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-jurassic-blue underline decoration-jurassic-accent underline-offset-4">
              <Play aria-hidden="true" className="h-4 w-4" />
              {copy.cta}
            </span>
            <span className="mt-2 block text-xs text-slate-500">{copy.note}</span>
          </span>
        </a>
      </aside>
    );
  }

  if (variant === 'dark') {
    return (
      <p className="mt-6 text-sm text-white/70" data-founder-film="dark">
        <a href={href} onClick={onClick} className="inline-flex items-center gap-2 font-bold text-white underline decoration-jurassic-gold/70 underline-offset-4 transition hover:decoration-jurassic-gold">
          <Play aria-hidden="true" className="h-4 w-4" />
          {copy.ctaB2b}
        </a>
        <span className="ml-2 text-xs text-white/50">({copy.label}. {copy.note})</span>
      </p>
    );
  }

  return (
    <p className="mt-4 text-sm" data-founder-film="inline">
      <a href={href} onClick={onClick} className="inline-flex items-center gap-2 font-bold text-sb-forest underline decoration-sb-amber-deep underline-offset-4">
        <Play aria-hidden="true" className="h-4 w-4" />
        {copy.cta}
      </a>
      <span className="ml-2 text-xs text-sb-slate">({copy.label}. {copy.note})</span>
    </p>
  );
}
