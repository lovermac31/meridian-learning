import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';

type AvailableSoonPageProps = {
  onBack: () => void;
  onGetStarted: () => void;
  onContactUs: () => void;
};

export function AvailableSoonPage({
  onBack,
  onGetStarted,
  onContactUs,
}: AvailableSoonPageProps) {
  return (
    <main className="min-h-screen bg-jurassic-soft/35 pt-32 pb-20">
      <section className="mx-auto max-w-4xl px-6">
        <div className="overflow-hidden rounded-[2rem] border border-jurassic-accent/15 bg-white shadow-premium">
          <div className="bg-jurassic-dark px-8 py-10 text-white">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-jurassic-accent">
              Available soon
            </div>
            <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight">
              Available soon
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/72">
              This section is being prepared and will be available shortly.
            </p>
          </div>

          <div className="flex flex-col gap-4 px-8 py-8 md:flex-row md:items-center">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-jurassic-dark/10 bg-white px-6 py-3 text-sm font-semibold text-jurassic-dark transition hover:border-jurassic-accent/30 hover:text-jurassic-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </button>
            <button
              type="button"
              onClick={onGetStarted}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-jurassic-accent px-6 py-3 text-sm font-bold text-white shadow-premium transition hover:brightness-110"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onContactUs}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-jurassic-accent/25 bg-jurassic-accent/8 px-6 py-3 text-sm font-semibold text-jurassic-accent transition hover:bg-jurassic-accent/15"
            >
              <Mail className="h-4 w-4" />
              Contact us
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
