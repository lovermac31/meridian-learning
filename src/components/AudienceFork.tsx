import { ArrowRight } from 'lucide-react';
import { getHomeContent } from '../i18n/content/home';
import { getCurrentLocale } from '../i18n/routing';
import { trackCtaClick } from '../lib/analytics';
import { baselineHref } from '../lib/baselineLink';

type AudienceForkProps = {
  onNavigate: (path: string) => void;
};

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark';

// The IELTS door books the Live Speaking Baseline in the AI Speaking app
// (rewrite-served at /ai-speaking, not an SPA route). It must use a native
// <a href> (real document navigation). Routing it through onNavigate/pushState
// would land on the SPA NotFound fallback because the Vite router has no
// client route for this path. Mirrors the Navbar promo-pill pattern.

/**
 * AudienceFork — the P1 three-door front door.
 *
 * Parent-first (owner decision, 11 Oct 2026): IELTS Speaking ages 9–18
 * (books the paid Live Speaking Baseline, 690.000₫) leads, then Parents
 * (accent door), then Schools (neutral, still one click away). This order
 * is in the DOM, so visual, tab and screen-reader order agree, and it is the
 * same for every visitor (the old social-traffic reorder is no longer needed).
 * /school-framework and /student-academy are rewrite-served by the
 * ecosystem app (App.navigateTo does a full-document nav for those).
 * /ai-speaking/baseline is rewrite-served by the AI Speaking app (native <a>).
 */
export function AudienceFork({ onNavigate }: AudienceForkProps) {
  const locale = getCurrentLocale();
  const home = getHomeContent(locale) ?? getHomeContent('en');
  const fork = home?.hero?.fork;
  if (!fork) return null;

  const go = (path: string, label: string, segment: 'institutional' | 'parent_student') => {
    trackCtaClick({ label, type: 'primary', segment });
    onNavigate(path);
  };

  return (
    <div className="mt-8 w-full">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
        {fork.label}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* IELTS Speaking (ages 9–18) — first door: the parent booking action.
            Native <a>: AI Speaking app page. Spans both columns at sm. */}
        <a
          href={baselineHref(locale)}
          onClick={() =>
            trackCtaClick({
              label: 'IELTS Speaking (fork)',
              type: 'primary',
              segment: 'parent_student',
            })
          }
          aria-label={`${fork.ieltsTitle ?? 'IELTS Speaking Ages 9-18'} — ${fork.ieltsCta ?? 'Book a Speaking Baseline'}`}
          className={`group flex flex-col items-start rounded-2xl border border-jurassic-gold/45 bg-gradient-to-br from-jurassic-gold/15 to-jurassic-accent/10 p-6 text-left transition hover:from-jurassic-gold/25 hover:to-jurassic-accent/20 sm:col-span-2 lg:col-span-1 ${FOCUS_RING}`}
        >
          <span className="mb-2 inline-flex items-center gap-2">
            <span className="rounded-full bg-jurassic-gold px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-jurassic-dark">
              {fork.ieltsBadge ?? 'New'}
            </span>
          </span>
          <span className="text-xl font-bold text-white">{fork.ieltsTitle ?? 'IELTS Speaking Ages 9-18'}</span>
          <span className="mt-2 text-sm leading-relaxed text-white/70">
            {fork.ieltsBody ?? 'Start with a Live Speaking Baseline: 15–20 minutes on Google Meet with an assessor, 690.000₫.'}
          </span>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-jurassic-gold">
            {fork.ieltsCta ?? 'Book a Speaking Baseline'}
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </a>
        {/* Parents door */}
        <button
          type="button"
          onClick={() => go('/student-academy', 'For Parents (fork)', 'parent_student')}
          className={`group flex flex-col items-start rounded-2xl border border-jurassic-accent/40 bg-jurassic-accent/15 p-6 text-left transition hover:bg-jurassic-accent/25 ${FOCUS_RING}`}
        >
          <span className="text-xl font-bold text-white">{fork.parentsTitle}</span>
          <span className="mt-2 text-sm leading-relaxed text-white/70">{fork.parentsBody}</span>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-jurassic-accent">
            {fork.parentsCta}
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </button>

        {/* Institutional door — Schools (last: parents lead on the homepage) */}
        <button
          type="button"
          onClick={() => go('/school-framework', 'For Schools (fork)', 'institutional')}
          className={`group flex flex-col items-start rounded-2xl border border-white/12 bg-white/[0.04] p-6 text-left transition hover:bg-white/[0.08] ${FOCUS_RING}`}
        >
          <span className="text-xl font-bold text-white">{fork.schoolsTitle}</span>
          <span className="mt-2 text-sm leading-relaxed text-white/65">{fork.schoolsBody}</span>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-white/85">
            {fork.schoolsCta}
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </button>

      </div>
    </div>
  );
}
