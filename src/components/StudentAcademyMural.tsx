import { ArrowRight, Sparkles } from 'lucide-react';

type StudentAcademyMuralProps = {
  onNavigate: (path: string) => void;
};

/**
 * Homepage mural / teaser section for the Student Academy.
 *
 * Phase 9 — re-routed the primary diagnostic CTA from `/get-started`
 * (the institutional B2B portal) to `/book-diagnostic` — the
 * production-live Phase 6 conversion page. Added secondary links to
 * `/student-academy` (the production-live Phase 5 program page) and to
 * `/interactive-demo#try-one-thinking-move` (the Phase 4 playable
 * micro-demo). Removed the stale "Full Student Academy page coming
 * soon" copy.
 *
 * Includes a hidden `id="studio"` compatibility anchor so the
 * still-unchanged footer link to `#studio` continues to scroll to this
 * section during the transition window.
 */
export function StudentAcademyMural({ onNavigate }: StudentAcademyMuralProps) {
  const handleNavClick =
    (path: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      onNavigate(path);
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
              <Sparkles aria-hidden="true" className="w-3.5 h-3.5 text-jurassic-accent" />
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
            {/* Phase 9 — primary CTA routes to /book-diagnostic
                (Phase 6 conversion page) instead of /get-started. */}
            <a
              href="/book-diagnostic"
              onClick={handleNavClick('/book-diagnostic')}
              className="inline-flex items-center justify-center bg-jurassic-accent text-white px-8 py-4 rounded-full text-sm font-bold transition-all duration-500 shadow-[0_15px_30px_-12px_rgba(242,100,25,0.3)] hover:shadow-[0_20px_40px_-12px_rgba(242,100,25,0.4)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Book a Student Thinking Diagnostic
              <ArrowRight aria-hidden="true" className="w-4 h-4 ml-2" />
            </a>

            {/* Phase 9 — secondary links to the production-live Student
                Academy and the playable Phase 4 micro-demo. Replaces the
                stale "Full Student Academy page coming soon" copy. */}
            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-jurassic-dark/65">
              <a
                href="/student-academy"
                onClick={handleNavClick('/student-academy')}
                className="rounded-md font-medium text-jurassic-dark/85 underline underline-offset-2 decoration-jurassic-accent/60 hover:text-jurassic-dark hover:decoration-jurassic-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Explore the Student Academy
              </a>
              <span className="text-jurassic-dark/30" aria-hidden="true">·</span>
              <a
                href="/interactive-demo#try-one-thinking-move"
                onClick={handleNavClick('/interactive-demo#try-one-thinking-move')}
                className="rounded-md font-medium text-jurassic-dark/85 underline underline-offset-2 decoration-jurassic-accent/60 hover:text-jurassic-dark hover:decoration-jurassic-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Try one thinking move
              </a>
            </p>
            <p className="mt-2 text-sm italic text-jurassic-dark/55">
              No score guarantees — just a clear, evidence-led plan.
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
