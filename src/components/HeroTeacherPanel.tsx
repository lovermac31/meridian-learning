import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { getHomeContent } from '../i18n/content/home';
import { getLocalizedHref } from '../i18n/localizedHref';
import { getCurrentLocale } from '../i18n/routing';
import { trackCtaClick } from '../lib/analytics';
import { baselineHref } from '../lib/baselineLink';


/**
 * Hero right column — parent-facing teacher panel.
 *
 * Replaces the adult AI Speaking spotlight in the first screen: parents see
 * the real teacher (Mr. Jay's photo), how we teach, and the two parent offers,
 * each labelled: the 690.000₫ Speaking Baseline (an assessment, the primary
 * action) and 60-minute lessons at 800.000₫ (the Young Learners page).
 * AI Speaking keeps its own section further down for adult learners.
 *
 * Copy is facts-only (see `hero.teacher` in home.ts). `experienceLine` is
 * owner-supplied and renders nothing while empty.
 */
export function HeroTeacherPanel() {
  const locale = getCurrentLocale();
  const teacher = (getHomeContent(locale) ?? getHomeContent('en'))?.hero.teacher;
  if (!teacher) return null;

  return (
    <aside
      aria-labelledby="hero-teacher-name"
      className="relative min-w-0 overflow-hidden rounded-[1.75rem] border border-jurassic-gold/40 bg-jurassic-soft text-jurassic-dark shadow-[0_28px_85px_-30px_rgba(0,0,0,0.8)]"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-jurassic-accent via-jurassic-gold to-jurassic-accent" aria-hidden="true" />
      <div className="flex flex-col p-4 sm:p-7 lg:p-8">
        <div className="flex items-center gap-4 sm:gap-5">
          <img
            src="/images/mr-jay-portrait.webp"
            alt={teacher.portraitAlt}
            width={960}
            height={960}
            decoding="async"
            className="h-20 w-20 flex-none rounded-2xl object-cover ring-2 ring-jurassic-gold/60 sm:h-28 sm:w-28"
          />
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-jurassic-dark/70">{teacher.kicker}</p>
            <h2 id="hero-teacher-name" className="mt-1 font-display text-[1.7rem] leading-[1.05] sm:text-[2.2rem]">
              {teacher.name}
            </h2>
            <p className="mt-1 text-sm font-semibold text-jurassic-dark/80">{teacher.role}</p>
            {teacher.experienceLine ? (
              <p className="mt-1 text-sm leading-snug text-jurassic-dark/75">{teacher.experienceLine}</p>
            ) : null}
          </div>
        </div>

        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-jurassic-dark/70">{teacher.commitmentsTitle}</p>
        <ul className="mt-2 space-y-1.5">
          {teacher.commitments.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm leading-snug text-jurassic-dark/85">
              <Check aria-hidden="true" className="mt-0.5 h-4 w-4 flex-none text-jurassic-accent" />
              {item}
            </li>
          ))}
        </ul>

        {/* Native <a>: /ai-speaking/baseline is served by the AI Speaking app. */}
        <a
          href={baselineHref(locale)}
          onClick={() => trackCtaClick({ label: 'homepage_teacher_baseline_click', type: 'primary', segment: 'parent_student' })}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-jurassic-accent px-5 py-3 text-sm font-extrabold text-jurassic-dark transition hover:bg-[#f97b38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-dark focus-visible:ring-offset-2"
        >
          {teacher.primaryCta}
          <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </a>
        <p className="mt-2 text-center text-xs font-semibold text-jurassic-dark/70">{teacher.primaryNote}</p>
        {/* Native <a>: the Young Learners page is static (not an SPA route). */}
        <a
          href={`${getLocalizedHref('/young-learners-speaking/', locale)}#pricing`}
          onClick={() => trackCtaClick({ label: 'homepage_teacher_lessons_click', type: 'secondary', segment: 'parent_student' })}
          className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-jurassic-dark/15 px-4 text-sm font-semibold text-jurassic-dark transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-dark"
        >
          {teacher.lessonsCta}
          <ArrowRight aria-hidden="true" className="h-4 w-4 flex-none" />
        </a>
      </div>
    </aside>
  );
}
