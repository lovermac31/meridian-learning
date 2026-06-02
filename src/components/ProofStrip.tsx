import { getHomeContent } from '../i18n/content/home';
import { getCurrentLocale } from '../i18n/routing';
import { trackCtaClick } from '../lib/analytics';

type ProofStripProps = {
  onNavigate: (path: string) => void;
};

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2';

const STATS: Array<{ value: string; label: string }> = [
  { value: '5', label: 'structured levels' },
  { value: 'Pre-A1 – C1', label: 'CEFR-aligned' },
  { value: '40', label: 'lessons / year' },
  { value: '10', label: 'core texts / level' },
];

/**
 * ProofStrip — P0 screen 2. One credibility beat (replaces the old
 * ten-section homepage narrative) plus a low-commitment re-fork for the
 * visitor who scrolled past the doors in the hero.
 */
export function ProofStrip({ onNavigate }: ProofStripProps) {
  const locale = getCurrentLocale();
  const home = getHomeContent(locale) ?? getHomeContent('en');
  const fork = home?.hero?.fork;

  const go = (path: string, label: string) => {
    trackCtaClick({ label, type: 'secondary', segment: 'institutional' });
    onNavigate(path);
  };

  return (
    <section className="bg-jurassic-ivory py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl font-bold text-jurassic-dark sm:text-4xl">{s.value}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-widest text-jurassic-dark/55">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Re-fork — catches the scroller who skipped the hero doors. */}
        <div className="mt-16 flex flex-col items-center gap-4 border-t border-jurassic-dark/10 pt-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-jurassic-dark/45">
            {fork?.reconsiderLabel ?? 'Still deciding?'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => go('/school-framework', 'For Schools (proof re-fork)')}
              className={`rounded-full bg-jurassic-accent px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95 ${FOCUS_RING}`}
            >
              {fork?.schoolsTitle ?? 'For Schools'}
            </button>
            <button
              type="button"
              onClick={() => go('/student-academy', 'For Parents (proof re-fork)')}
              className={`rounded-full border border-jurassic-dark/15 bg-white px-6 py-3 text-sm font-bold text-jurassic-dark transition hover:border-jurassic-dark/30 ${FOCUS_RING}`}
            >
              {fork?.parentsTitle ?? 'For Parents'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => go('/knowledge', 'Knowledge Hub (proof)')}
            className={`mt-1 text-sm font-medium text-jurassic-dark/55 underline underline-offset-2 transition hover:text-jurassic-dark ${FOCUS_RING} rounded-md`}
          >
            Or browse the Knowledge Hub
          </button>
        </div>
      </div>
    </section>
  );
}
