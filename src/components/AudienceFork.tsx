import { ArrowRight } from 'lucide-react';
import { getHomeContent } from '../i18n/content/home';
import { getCurrentLocale } from '../i18n/routing';
import { trackCtaClick } from '../lib/analytics';

type AudienceForkProps = {
  onNavigate: (path: string) => void;
};

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark';

/**
 * AudienceFork — the P0 "two-door front door".
 *
 * Schools is the primary (dominant) door per the locked decision; Parents is
 * secondary. Both destinations (/school-framework, /student-academy) are
 * rewrite-served by the ecosystem app — onNavigate (App.navigateTo) performs a
 * full-document navigation for rewrite-served routes, so these resolve
 * correctly rather than falling through to the SPA NotFound.
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
    <div className="mt-8 w-full max-w-2xl">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
        {fork.label}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>
    </div>
  );
}
