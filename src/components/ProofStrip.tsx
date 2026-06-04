import { getHomeContent } from '../i18n/content/home';
import { getCurrentLocale } from '../i18n/routing';
import { trackCtaClick } from '../lib/analytics';

type ProofStripProps = {
  onNavigate: (path: string) => void;
};

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2';

// /young-learners-speaking/ is a STATIC page in public/. Native <a href> only.
const YOUNG_LEARNERS_HREF = '/young-learners-speaking/';

// UTM-tagged variant used by the dedicated FB-intent card so Vercel Analytics
// can distinguish social-card clicks from the AudienceFork IELTS door without
// adding a new event property. Campaign value matches the planned FB ad set.
const YOUNG_LEARNERS_FB_HREF =
  '/young-learners-speaking/?utm_source=facebook&utm_medium=social&utm_campaign=free_evaluation';

const STATS: Array<{ value: string; label: string }> = [
  { value: '5', label: 'structured levels' },
  { value: 'Pre-A1 – C1', label: 'CEFR-aligned' },
  { value: '40', label: 'lessons / year' },
  { value: '10', label: 'core texts / level' },
];

/**
 * ProofStrip — P1 screen 2.
 *
 * Layout:
 *  1. Social-intent card (FB-tagged CTA → /young-learners-speaking/) — the
 *     scroll-past parent who skipped the hero IELTS fork lands here first.
 *  2. Credibility stats strip (unchanged).
 *  3. Three-button re-fork (Schools / Parents / IELTS Speaking) +
 *     Knowledge Hub and Get Started underline links — catches every
 *     remaining audience without forcing another scroll.
 */
export function ProofStrip({ onNavigate }: ProofStripProps) {
  const locale = getCurrentLocale();
  const home = getHomeContent(locale) ?? getHomeContent('en');
  const fork = home?.hero?.fork;

  const go = (path: string, label: string, segment: 'institutional' | 'parent_student' = 'institutional') => {
    trackCtaClick({ label, type: 'secondary', segment });
    onNavigate(path);
  };

  return (
    <section className="bg-jurassic-ivory py-20">
      <div className="mx-auto max-w-5xl px-6">
        {/* Social-intent card — explicit FB-parent hook with UTM. Sits at
            the very top of ProofStrip so it is the first thing a visitor
            who scrolled past the hero sees on screen 2. */}
        <div className="mb-14 overflow-hidden rounded-2xl border border-jurassic-accent/25 bg-white shadow-sm">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-jurassic-accent">
                {fork?.socialEyebrow ?? 'For families finding us on social'}
              </p>
              <h2 className="mt-2 font-display text-2xl leading-tight text-jurassic-dark sm:text-3xl">
                {fork?.socialHeadline ?? 'Looking for English speaking coaching for your child?'}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-jurassic-dark/70 sm:text-base">
                {fork?.socialBody ??
                  'IELTS-aligned speaking practice for ages 9–18 with a free 30-minute evaluation — online, house-call, or facility location TBA.'}
              </p>
            </div>
            <a
              href={YOUNG_LEARNERS_FB_HREF}
              onClick={() =>
                trackCtaClick({
                  label: 'IELTS Speaking (social card)',
                  type: 'primary',
                  segment: 'parent_student',
                })
              }
              className={`inline-flex w-full items-center justify-center rounded-full bg-jurassic-accent px-7 py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-95 sm:w-auto ${FOCUS_RING}`}
            >
              {fork?.socialCta ?? 'Book Free Evaluation'}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl font-bold text-jurassic-dark sm:text-4xl">{s.value}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-widest text-jurassic-dark/55">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Re-fork — catches the scroller who skipped the hero doors. Now
            mirrors the hero's three doors plus an underline trio of
            secondary internal links (Knowledge / Get Started / a
            non-redundant default). */}
        <div className="mt-16 flex flex-col items-center gap-4 border-t border-jurassic-dark/10 pt-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-jurassic-dark/45">
            {fork?.reconsiderLabel ?? 'Still deciding?'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => go('/school-framework', 'For Schools (proof re-fork)', 'institutional')}
              className={`rounded-full bg-jurassic-accent px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95 ${FOCUS_RING}`}
            >
              {fork?.schoolsTitle ?? 'For Schools'}
            </button>
            <button
              type="button"
              onClick={() => go('/student-academy', 'For Parents (proof re-fork)', 'parent_student')}
              className={`rounded-full border border-jurassic-dark/15 bg-white px-6 py-3 text-sm font-bold text-jurassic-dark transition hover:border-jurassic-dark/30 ${FOCUS_RING}`}
            >
              {fork?.parentsTitle ?? 'For Parents'}
            </button>
            <a
              href={YOUNG_LEARNERS_HREF}
              onClick={() =>
                trackCtaClick({
                  label: 'IELTS Speaking (proof re-fork)',
                  type: 'secondary',
                  segment: 'parent_student',
                })
              }
              className={`rounded-full border border-jurassic-gold/55 bg-jurassic-gold/15 px-6 py-3 text-sm font-bold text-jurassic-dark transition hover:bg-jurassic-gold/25 ${FOCUS_RING}`}
            >
              {fork?.ieltsTitle ?? 'IELTS Speaking Ages 9-18'}
            </a>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-jurassic-dark/55">
            <button
              type="button"
              onClick={() => go('/knowledge', 'Knowledge Hub (proof)', 'institutional')}
              className={`font-medium underline underline-offset-2 transition hover:text-jurassic-dark ${FOCUS_RING} rounded-md`}
            >
              Browse the Knowledge Hub
            </button>
            <button
              type="button"
              onClick={() => go('/get-started', 'Get Started (proof)', 'institutional')}
              className={`font-medium underline underline-offset-2 transition hover:text-jurassic-dark ${FOCUS_RING} rounded-md`}
            >
              Contact / Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
