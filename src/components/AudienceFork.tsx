import { ArrowRight } from 'lucide-react';
import { getHomeContent } from '../i18n/content/home';
import { getCurrentLocale } from '../i18n/routing';
import { trackCtaClick } from '../lib/analytics';

type AudienceForkProps = {
  onNavigate: (path: string) => void;
};

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark';

// /young-learners-speaking/ is a STATIC page in public/ — it is NOT an SPA
// route and NOT rewrite-served. The IELTS door must use a native <a href>
// (real document navigation). Routing it through onNavigate/pushState would
// land on the SPA NotFound fallback because the Vite router has no client
// route for this path. Mirrors the Navbar promo-pill pattern.
const YOUNG_LEARNERS_HREF = '/young-learners-speaking/';

/**
 * AudienceFork — the P1 three-door front door.
 *
 * Schools remains the primary (dominant, orange) door per the locked
 * institutional positioning. Parents is the secondary general door.
 * IELTS Speaking is the new B2C door for ages 9–18 — added in response
 * to the FB-referrer + 75% bounce signal: Facebook parents arriving on
 * `/` need a "speaking / free evaluation" hook above-the-fold, not just
 * "literature curriculum". /school-framework and /student-academy are
 * rewrite-served by the ecosystem app (App.navigateTo does a full-document
 * nav for those). /young-learners-speaking/ is a static page (native <a>).
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
    <div className="mt-8 w-full max-w-3xl">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
        {fork.label}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* PRIMARY door — Schools */}
        <button
          type="button"
          onClick={() => go('/school-framework', 'For Schools (fork)', 'institutional')}
          className={`group flex flex-col items-start rounded-2xl border border-jurassic-accent/40 bg-jurassic-accent/15 p-6 text-left transition hover:bg-jurassic-accent/25 ${FOCUS_RING}`}
        >
          <span className="text-xl font-bold text-white">{fork.schoolsTitle}</span>
          <span className="mt-2 text-sm leading-relaxed text-white/70">{fork.schoolsBody}</span>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-jurassic-accent">
            {fork.schoolsCta}
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </button>

        {/* SECONDARY door — Parents */}
        <button
          type="button"
          onClick={() => go('/student-academy', 'For Parents (fork)', 'parent_student')}
          className={`group flex flex-col items-start rounded-2xl border border-white/12 bg-white/[0.04] p-6 text-left transition hover:bg-white/[0.08] ${FOCUS_RING}`}
        >
          <span className="text-xl font-bold text-white">{fork.parentsTitle}</span>
          <span className="mt-2 text-sm leading-relaxed text-white/65">{fork.parentsBody}</span>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-white/85">
            {fork.parentsCta}
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </button>

        {/* NEW B2C door — IELTS Speaking. Native <a>: static page in public/.
            The "New" badge + accent-tinted border draws the FB-parent eye
            without overpowering the institutional Schools door. Spans both
            mobile columns at <sm so it stays clickable above-the-fold. */}
        <a
          href={YOUNG_LEARNERS_HREF}
          onClick={() =>
            trackCtaClick({
              label: 'IELTS Speaking (fork)',
              type: 'primary',
              segment: 'parent_student',
            })
          }
          aria-label={`${fork.ieltsTitle ?? 'IELTS Speaking Ages 9-18'} — ${fork.ieltsCta ?? 'Book Free Evaluation'}`}
          className={`group flex flex-col items-start rounded-2xl border border-jurassic-gold/45 bg-gradient-to-br from-jurassic-gold/15 to-jurassic-accent/10 p-6 text-left transition hover:from-jurassic-gold/25 hover:to-jurassic-accent/20 sm:col-span-2 lg:col-span-1 ${FOCUS_RING}`}
        >
          <span className="mb-2 inline-flex items-center gap-2">
            <span className="rounded-full bg-jurassic-gold px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-jurassic-dark">
              {fork.ieltsBadge ?? 'New'}
            </span>
          </span>
          <span className="text-xl font-bold text-white">{fork.ieltsTitle ?? 'IELTS Speaking Ages 9-18'}</span>
          <span className="mt-2 text-sm leading-relaxed text-white/70">
            {fork.ieltsBody ?? 'Book a free 30-minute evaluation for your child.'}
          </span>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-jurassic-gold">
            {fork.ieltsCta ?? 'Book Free Evaluation'}
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </a>
      </div>
    </div>
  );
}
