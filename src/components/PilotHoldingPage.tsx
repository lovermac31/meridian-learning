import { ArrowRight, Clock, ShieldCheck } from 'lucide-react';

/**
 * PilotHoldingPage — public-safe "pending approval" holding state for
 * `/pilot/:id`.
 *
 * SECURITY / PRIVACY CONTRACT — read before editing:
 *   • This route is reachable by ANYONE: the pilot-automation notification
 *     emails surface a `/pilot/<id>` URL while the underlying inquiry is
 *     still STAGED, and recipients may forward the email or guess a URL.
 *   • Therefore this page MUST NOT read, fetch, or render ANY record data.
 *     It deliberately ignores the `:id` segment entirely — no inquiry ID,
 *     no school name, no contact name, no email, no status, no internal
 *     fields are ever displayed. It performs zero network calls.
 *   • It is a static holding state only. Approved, token-based access is a
 *     DIFFERENT route — `/external/pilot?token=...` — served by
 *     ExternalPilotPortalPage. Do not merge the two; do not add token
 *     verification or record lookup here.
 *
 * The matching `X-Robots-Tag: noindex, nofollow` header for `/pilot/(.*)`
 * lives in vercel.json, and resolveRouteMetadata() returns noindex metadata
 * for this path so the SPA <head> agrees with the edge header.
 */
type PilotHoldingPageProps = {
  onBack: () => void;
};

export function PilotHoldingPage({ onBack }: PilotHoldingPageProps) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-jurassic-dark pt-32 pb-20 text-white focus:outline-none"
    >
      <section className="mx-auto max-w-2xl px-6">
        <div className="rounded-lg border border-white/10 bg-white/[0.045] p-8 shadow-premium">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-jurassic-gold/25 bg-jurassic-gold/10">
            <Clock className="h-6 w-6 text-jurassic-gold" />
          </div>

          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-jurassic-gold">
            Pilot Portal
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            This inquiry is awaiting internal review.
          </h1>

          <p className="mt-5 text-base leading-relaxed text-white/65">
            This pilot portal link will become available after approval by the
            Jurassic English™ team.
          </p>

          <div className="mt-8 flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-jurassic-teal" />
            <p className="text-sm leading-relaxed text-white/60">
              Have a question about this review? Contact{' '}
              <a
                href="mailto:info@jurassicenglish.com"
                className="font-semibold text-white underline underline-offset-2 transition hover:text-jurassic-gold"
              >
                info@jurassicenglish.com
              </a>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-jurassic-accent px-7 py-3 text-sm font-bold text-white shadow-premium transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark"
          >
            Visit jurassicenglish.com
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </main>
  );
}
