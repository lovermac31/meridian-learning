import { ArrowLeft } from 'lucide-react';

type NotFoundPageProps = {
  onBack: () => void;
  onGetStarted: () => void;
};

export function NotFoundPage({ onBack, onGetStarted }: NotFoundPageProps) {
  return (
    <main className="min-h-screen bg-jurassic-dark pt-32 pb-20 text-white">
      <section className="mx-auto max-w-3xl px-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to main site
        </button>

        <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-jurassic-accent">
          Page not found
        </p>
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
          This Jurassic English page could not be found.
        </h1>
        <p className="mb-8 max-w-2xl text-lg leading-8 text-white/70">
          The link may be outdated, or the section may not be part of the public site.
        </p>
        <button
          type="button"
          onClick={onGetStarted}
          className="rounded-full bg-jurassic-accent px-6 py-3 text-sm font-bold text-white shadow-premium transition hover:brightness-110"
        >
          Get Started
        </button>
      </section>
    </main>
  );
}
