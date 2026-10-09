import { ShieldCheck } from 'lucide-react';
import { getCurrentLocale } from '../i18n/routing';

/**
 * Framework-informed teaching strip (homepage).
 *
 * Replaces the former "Certifications & associations" logo marquee, which displayed third-party
 * marks (IELTS, TOEFL iBT, TOEIC, Cambridge CELTA, Oxford Test of English, Pearson) plus
 * "Partner Schools" and "Top SEA Partner 2025" badges. Displaying those marks without a licence or
 * a verifiable partnership implies endorsement (trademark + consumer-protection risk), so the
 * homepage now matches the young-learners page (#56): a text-only statement of the public frameworks
 * the method draws on, with an explicit independence line. No third-party logos are loaded.
 */
// VI wording matches the young-learners page strip (src/yl/i18n.vi.json certstrip.*).
const STRIP_COPY = {
  en: {
    heading: 'Framework-informed teaching',
    listLabel: 'Frameworks our programmes draw on',
    frameworks: ['Public IELTS Speaking criteria', 'CEFR', 'Assessment for learning'],
    note: 'Our programmes draw on these public frameworks. Jurassic English™ is independent and is not endorsed by IELTS, IDP, British Council, Cambridge, ETS, Pearson or Oxford.',
  },
  vi: {
    heading: 'Giảng dạy dựa trên khung tham chiếu',
    listLabel: 'Các khung tham chiếu chương trình sử dụng',
    frameworks: ['Tiêu chí IELTS Speaking công khai', 'CEFR', 'Đánh giá vì việc học'],
    note: 'Chương trình của chúng tôi tham chiếu các khung công khai này. Jurassic English™ hoạt động độc lập, không được IELTS, IDP, British Council, Cambridge, ETS, Pearson hay Oxford bảo trợ.',
  },
} as const;

export function CredibilityLogoMarquee() {
  const copy = STRIP_COPY[getCurrentLocale() === 'vi' ? 'vi' : 'en'];
  return (
    <section
      aria-labelledby="framework-strip-title"
      className="relative border-y border-white/10 bg-jurassic-dark"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex shrink-0 items-center gap-3 text-white/70">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-jurassic-gold">
            <ShieldCheck aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <h2
            id="framework-strip-title"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80"
          >
            {copy.heading}
          </h2>
        </div>
        <div className="min-w-0 flex-1">
          <ul className="flex flex-wrap gap-2" aria-label={copy.listLabel}>
            {copy.frameworks.map((f) => (
              <li
                key={f}
                className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/75"
              >
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs leading-relaxed text-white/50">
            {copy.note}
          </p>
        </div>
      </div>
    </section>
  );
}
