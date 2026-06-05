import { ShieldCheck } from 'lucide-react';

const CREDIBILITY_MARKS = [
  {
    name: 'IELTS',
    context: 'Speaking alignment',
    src: '/cert-logos/ielts-logo.png',
    imgClass: 'max-h-10 max-w-[9.5rem]',
  },
  {
    name: 'TOEFL iBT',
    context: 'Academic English',
    src: '/cert-logos/toefl-ibt-logo.webp',
    imgClass: 'max-h-10 max-w-[10rem]',
  },
  {
    name: 'TOEIC',
    context: 'Workplace English',
    src: '/cert-logos/toeic-logo.png',
    imgClass: 'max-h-10 max-w-[9rem]',
  },
  {
    name: 'Cambridge CELTA',
    context: 'Teacher training',
    src: '/cert-logos/celta-cambridge-logo.png',
    imgClass: 'max-h-12 max-w-[12rem]',
  },
  {
    name: 'CEFR',
    context: 'A1-C2 framework',
    src: '/cert-logos/cefr-logo.webp',
    imgClass: 'max-h-12 max-w-[7rem]',
  },
  {
    name: 'Oxford Test of English',
    context: 'Assessment reference',
    src: '/cert-logos/oxford-test-of-english.png',
    imgClass: 'max-h-12 max-w-[5rem]',
  },
  {
    name: 'Pearson',
    context: 'English assessment',
    src: '/cert-logos/pearson-logo.png',
    imgClass: 'max-h-10 max-w-[9rem]',
  },
  {
    name: 'Partner Schools',
    context: 'School network',
    src: '/cert-logos/partner-schools.avif',
    imgClass: 'max-h-12 max-w-[10rem]',
  },
  {
    name: 'Top SEA Partner 2025',
    context: 'Regional recognition',
    src: '/cert-logos/top-sea-partner.avif',
    imgClass: 'max-h-12 max-w-[10rem]',
  },
];

const marqueeRows = [...CREDIBILITY_MARKS, ...CREDIBILITY_MARKS];

export function CredibilityLogoMarquee() {
  return (
    <section
      aria-labelledby="credibility-marquee-title"
      className="relative overflow-hidden border-y border-white/10 bg-jurassic-dark"
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#101820_0%,rgba(16,24,32,0)_18%,rgba(16,24,32,0)_82%,#101820_100%)] z-10 pointer-events-none" />
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-7 sm:flex-row sm:items-center sm:gap-8">
        <div className="relative z-20 flex shrink-0 items-center gap-3 text-white/70">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-jurassic-gold">
            <ShieldCheck aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <div>
            <h2
              id="credibility-marquee-title"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80"
            >
              Certifications & associations
            </h2>
            <p className="mt-1 max-w-[23rem] text-xs leading-relaxed text-white/45">
              Teaching credentials, standards, and academic references represented with provided marks.
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="je-logo-marquee-track flex w-max items-center gap-5">
            {marqueeRows.map((mark, index) => (
              <div
                key={`${mark.name}-${index}`}
                className="group flex h-20 min-w-[13.75rem] items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white px-5 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.22)] transition duration-200 hover:border-jurassic-gold/45 hover:shadow-[0_18px_44px_rgba(0,0,0,0.3)]"
              >
                <span className="flex h-14 min-w-0 flex-1 items-center justify-center">
                  <img
                    src={mark.src}
                    alt={`${mark.name} logo`}
                    loading="eager"
                    decoding="async"
                    className={`block h-auto w-auto object-contain opacity-90 grayscale transition duration-200 group-hover:opacity-100 group-hover:grayscale-0 ${mark.imgClass}`}
                  />
                </span>
                <span className="max-w-[5.5rem] text-right text-[9px] font-semibold uppercase leading-tight tracking-[0.12em] text-jurassic-dark/45 group-hover:text-jurassic-dark/70">
                  {mark.context}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
