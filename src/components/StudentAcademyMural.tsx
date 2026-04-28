import { ArrowRight, Sparkles } from 'lucide-react';

type StudentAcademyMuralProps = {
  onNavigate: (path: string) => void;
};

/**
 * Homepage mural / teaser section for the Student Academy.
 *
 * Replaces the mounted <CreativeStudio /> section. Uses the canonical B4
 * Student Academy hero copy. Routes the primary CTA into the existing
 * `/get-started` diagnostic-booking funnel; the standalone /student-academy
 * route is deferred to a separate scope (Option 1 handling).
 *
 * Includes a hidden `id="studio"` compatibility anchor so the still-unchanged
 * footer link to `#studio` continues to scroll to this section during the
 * transition window.
 */
export function StudentAcademyMural({ onNavigate }: StudentAcademyMuralProps) {
  const handleCtaClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onNavigate('/get-started');
  };

  return (
    <section
      id="student-academy"
      className="py-28 bg-white relative overflow-hidden"
      aria-labelledby="student-academy-mural-heading"
    >
      {/* Backwards-compat anchor for the unchanged footer link `#studio`. */}
      <span id="studio" className="sr-only" aria-hidden="true" />

      {/* Subtle decorative tints in the JE inner-page rhythm */}
      <div className="absolute top-10 -right-20 h-72 w-72 rounded-full bg-jurassic-gold/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-24 bottom-10 h-64 w-64 rounded-full bg-jurassic-accent/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Copy column */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-jurassic-soft border border-jurassic-dark/10 text-jurassic-dark/70 text-[11px] font-semibold uppercase tracking-[0.12em] mb-5">
              <Sparkles className="w-3.5 h-3.5 text-jurassic-accent" />
              Student Academy
            </div>
            <h2
              id="student-academy-mural-heading"
              className="text-4xl md:text-5xl font-bold text-jurassic-dark tracking-tight leading-[1.1] mb-6"
            >
              Reading. Reasoning. Writing.
              <span className="block text-jurassic-accent font-serif font-light italic mt-2">
                With the books your child deserves.
              </span>
            </h2>
            <p className="text-lg text-jurassic-dark/70 font-light leading-relaxed mb-8 max-w-xl">
              Jurassic English<span className="align-super text-xs text-jurassic-accent">™</span>{' '}
              Student Academy is a five-level academic English program built
              around authentic literature, regulated thinking, and visible
              reasoning. Your child reads real stories, thinks aloud, writes
              with evidence, and grows through portfolio work that you can see.
            </p>
            <a
              href="/get-started"
              onClick={handleCtaClick}
              className="inline-flex items-center justify-center bg-jurassic-accent text-white px-8 py-4 rounded-full text-sm font-bold transition-all duration-500 shadow-[0_15px_30px_-12px_rgba(242,100,25,0.3)] hover:shadow-[0_20px_40px_-12px_rgba(242,100,25,0.4)] hover:brightness-110"
            >
              Book a Student Thinking Diagnostic
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
            <p className="mt-3 text-sm italic text-jurassic-dark/55">
              Full Student Academy page coming soon — early access through the
              diagnostic.
            </p>
          </div>

          {/* Image column */}
          <div className="lg:pl-4">
            <div
              className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-jurassic-dark/8"
              role="img"
              aria-label="A premium academy hall with arched windows, fossil reliefs, and literature laid out on polished study tables"
            >
              <img
                src="/images/student-academy/student-academy-hero.webp"
                alt="A premium academy hall with arched windows, fossil reliefs, and literature laid out on polished study tables"
                width={1672}
                height={941}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
