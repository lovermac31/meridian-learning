import { getHomeContent } from '../i18n/content/home';
import { getLocalizedHref } from '../i18n/localizedHref';
import { getCurrentLocale } from '../i18n/routing';
import { trackCtaClick } from '../lib/analytics';

type ProofStripProps = {
  onNavigate: (path: string) => void;
};

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2';

// /young-learners-speaking/ is a STATIC page in public/. Native <a href> only;
// Vietnamese pages link its VI page (/vi/luyen-noi-ielts/) via getLocalizedHref.
const YOUNG_LEARNERS_HREF = '/young-learners-speaking/';


const STATS: Record<'en' | 'vi', Array<{ value: string; label: string }>> = {
  en: [
    { value: '5', label: 'structured levels' },
    { value: 'Pre-A1 – C1', label: 'CEFR-aligned' },
    { value: '40', label: 'lessons / year' },
    { value: '10', label: 'core texts / level' },
  ],
  vi: [
    { value: '5', label: 'cấp độ có cấu trúc' },
    { value: 'Pre-A1 – C1', label: 'theo khung CEFR' },
    { value: '40', label: 'bài học / năm' },
    { value: '10', label: 'tác phẩm cốt lõi / cấp độ' },
  ],
};

const PROOF_LINKS = {
  en: { knowledgeHub: 'Browse the Knowledge Hub', getStarted: 'Contact / Get Started' },
  vi: { knowledgeHub: 'Khám phá Trung tâm Kiến thức', getStarted: 'Liên hệ / Bắt đầu' },
} as const;

/**
 * ProofStrip — P1 screen 2.
 *
 * Layout:
 *  1. Credibility stats strip. (The social-intent "Looking for coaching"
 *     card folded into the homepage OffersBand, 14 Oct 2026.)
 *  2. Three-button re-fork (Schools / Parents / IELTS Speaking) +
 *     Knowledge Hub and Get Started underline links — catches every
 *     remaining audience without forcing another scroll.
 */
export function ProofStrip({ onNavigate }: ProofStripProps) {
  const locale = getCurrentLocale();
  const copyLocale = locale === 'vi' ? 'vi' : 'en';
  const home = getHomeContent(locale) ?? getHomeContent('en');
  const fork = home?.hero?.fork;

  const go = (path: string, label: string, segment: 'institutional' | 'parent_student' = 'institutional') => {
    trackCtaClick({ label, type: 'secondary', segment });
    onNavigate(path);
  };

  return (
    <section className="bg-jurassic-ivory py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS[copyLocale].map((s) => (
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
              href={getLocalizedHref(YOUNG_LEARNERS_HREF, locale)}
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
              {PROOF_LINKS[copyLocale].knowledgeHub}
            </button>
            <button
              type="button"
              onClick={() => go('/get-started', 'Get Started (proof)', 'institutional')}
              className={`font-medium underline underline-offset-2 transition hover:text-jurassic-dark ${FOCUS_RING} rounded-md`}
            >
              {PROOF_LINKS[copyLocale].getStarted}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
