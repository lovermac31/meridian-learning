import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Clock3, KeyRound, Loader2, MailWarning } from 'lucide-react';

type PlansPricingAccessPageProps = {
  onBack: () => void;
};

type AccessState =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'invalid' }
  | { status: 'expired' }
  | { status: 'error'; message: string }
  | { status: 'valid'; approvedLead: string; referenceId: string | null; expiresAt: number };

export function PlansPricingAccessPage({ onBack }: PlansPricingAccessPageProps) {
  const [accessState, setAccessState] = useState<AccessState>({ status: 'loading' });

  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('token');
  }, []);

  useEffect(() => {
    const existing = document.querySelector('meta[name="robots"][data-pricing-access="true"]');
    if (existing) return;

    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    meta.dataset.pricingAccess = 'true';
    document.head.appendChild(meta);

    return () => {
      meta.remove();
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setAccessState({ status: 'missing' });
      return;
    }

    const controller = new AbortController();

    const verify = async () => {
      try {
        const response = await fetch(`/api/verify-pricing-access?token=${encodeURIComponent(token)}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Access verification failed.');
        }

        if (!data.ok) {
          if (data.status === 'missing' || data.status === 'invalid' || data.status === 'expired') {
            setAccessState({ status: data.status });
            return;
          }

          throw new Error(data.error || 'Access verification failed.');
        }

        setAccessState({
          status: 'valid',
          approvedLead: data.approvedLead,
          referenceId: data.referenceId,
          expiresAt: data.expiresAt,
        });
      } catch (error: any) {
        if (controller.signal.aborted) return;
        setAccessState({
          status: 'error',
          message: error?.message || 'Access verification failed.',
        });
      }
    };

    verify();

    return () => controller.abort();
  }, [token]);

  return (
    <main className="min-h-screen bg-jurassic-soft/40 pt-32 pb-20">
      <section className="max-w-7xl mx-auto px-6">
        <button
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-jurassic-dark/70 transition hover:text-jurassic-accent"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to main site
        </button>

        {accessState.status === 'valid' ? (
          <UnlockedPricingContent
            approvedLead={accessState.approvedLead}
            referenceId={accessState.referenceId}
            expiresAt={accessState.expiresAt}
          />
        ) : (
          <AccessStatePanel state={accessState} />
        )}
      </section>
    </main>
  );
}

function AccessStatePanel({ state }: { state: AccessState }) {
  const config =
    state.status === 'loading'
      ? {
          icon: Loader2,
          title: 'Verifying access',
          body: 'Please wait while we verify your approved access link.',
          iconClass: 'animate-spin text-jurassic-accent',
        }
      : state.status === 'missing'
        ? {
            icon: KeyRound,
            title: 'Access link required',
            body:
              'This page is reserved for approved Plans & Pricing access. Please use the secure link provided after review.',
            iconClass: 'text-jurassic-accent',
          }
        : state.status === 'expired'
          ? {
              icon: Clock3,
              title: 'Access link expired',
              body:
                'This secure Plans & Pricing link has expired. Please contact info@jurassicenglish.com to request a refreshed access link.',
              iconClass: 'text-jurassic-accent',
            }
          : state.status === 'invalid'
            ? {
                icon: MailWarning,
                title: 'Access not available',
                body:
                  'This access link is invalid or no longer available. Please contact info@jurassicenglish.com if you need a new approved link.',
                iconClass: 'text-jurassic-accent',
              }
            : {
                icon: MailWarning,
                title: 'Verification unavailable',
                body:
                  state.message ||
                  'Access verification is temporarily unavailable. Please contact info@jurassicenglish.com directly.',
                iconClass: 'text-jurassic-accent',
              };

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl rounded-[2rem] border border-jurassic-dark/8 bg-white p-10 shadow-premium"
    >
      <div className="rounded-2xl bg-jurassic-dark p-8 text-white">
        <span className="text-jurassic-accent font-bold uppercase tracking-[0.2em] text-[10px] mb-3 block">
          Private Access
        </span>
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-white/5 p-3">
            <Icon className={`w-7 h-7 ${config.iconClass}`} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
            <p className="mt-3 max-w-2xl text-white/70 leading-relaxed">{config.body}</p>
            <p className="mt-6 text-sm text-white/45">
              For manual assistance, contact{' '}
              <a
                href="mailto:info@jurassicenglish.com"
                className="text-jurassic-accent hover:text-jurassic-accent/80 transition"
              >
                info@jurassicenglish.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function UnlockedPricingContent({
  approvedLead,
  referenceId,
  expiresAt,
}: {
  approvedLead: string;
  referenceId: string | null;
  expiresAt: number;
}) {
  const expiresLabel = new Date(expiresAt * 1000).toLocaleString();

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] bg-jurassic-dark p-10 text-white shadow-premium"
      >
        <span className="text-jurassic-accent font-bold uppercase tracking-[0.2em] text-[10px] mb-4 block">
          Approved Access
        </span>
        <h1 className="text-5xl font-bold tracking-tight mb-5">Plans & Pricing</h1>
        <p className="max-w-3xl text-lg text-white/72 leading-relaxed">
          This private briefing page is intended for approved institutional review.
          Pricing is structured around implementation level, learner context, staffing,
          and governance scope rather than a single public table.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <MetaCard label="Approved lead" value={approvedLead} />
          <MetaCard label="Reference" value={referenceId || 'Approved access'} />
          <MetaCard label="Access valid until" value={expiresLabel} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
        className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-jurassic-dark/8 bg-white p-8 shadow-premium">
            <SectionHeading
              eyebrow="Service Structure"
              title="Five implementation pathways"
              description="Jurassic English is scoped through modular pathways that can stand alone or be combined into a phased institutional proposal."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['Teacher Training', 'Professional certification and implementation training for the Thinking Cycle, Accountable Talk, CEIW, and calibration workflows.'],
                ['School Licensing', 'Annual institutional licensing aligned to learner band, implementation tier, and quality-assurance expectations.'],
                ['Curriculum Review', 'Independent review of text selection, CEFR progression, scope and sequence, and standards alignment.'],
                ['Academic Consulting', 'Implementation design, rollout architecture, governance support, and strategic curriculum advisory.'],
                ['Institutional Partnerships', 'Formal partnership arrangements for networks, universities, ministries, and multi-campus groups.'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-jurassic-dark/8 bg-jurassic-soft/35 p-5">
                  <h3 className="text-lg font-bold text-jurassic-dark">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-jurassic-dark/70">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-jurassic-dark/8 bg-white p-8 shadow-premium">
            <SectionHeading
              eyebrow="Pricing Logic"
              title="How proposals are scoped"
              description="Private access does not replace institutional scoping. Formal pricing is still aligned to programme maturity, staff needs, student range, and implementation fidelity."
            />
            <div className="grid gap-4 md:grid-cols-2">
              <InfoPanel
                title="Indicative pathways"
                items={[
                  'School Licensing is structured by learner band and implementation level.',
                  'Teacher Training may be priced per educator or by school cohort.',
                  'Curriculum Review and Academic Consulting are typically scoped as project-based engagements.',
                  'Institutional Partnerships are bespoke and proposal-led.',
                ]}
              />
              <InfoPanel
                title="Governance principle"
                items={[
                  'Pricing is not confirmed before Discovery Call review.',
                  'Resource Allocation Audit precedes formal institutional quotation.',
                  'Proposal structure reflects implementation depth and QA expectations.',
                  'Some elements may be phased over multiple terms or budget cycles.',
                ]}
              />
            </div>
          </section>

          <section className="rounded-[2rem] border border-jurassic-dark/8 bg-white p-8 shadow-premium">
            <SectionHeading
              eyebrow="Implementation Pathway"
              title="Standard next-step sequence"
              description="Approved access is intended to support the next institutional conversation, not replace it."
            />
            <div className="grid gap-4 md:grid-cols-4">
              {[
                ['1', 'Discovery Call', 'Review institutional context, pressures, and intended implementation pathway.'],
                ['2', 'Resource Allocation Audit', 'Assess existing resources, staff capacity, and delivery readiness.'],
                ['3', 'Phased Proposal', 'Receive a scoped proposal aligned to learner range, staffing, and rollout horizon.'],
                ['4', 'Implementation Review', 'Move to onboarding, pilot planning, or institutional decision-making.'],
              ].map(([num, title, body]) => (
                <div key={title} className="rounded-2xl border border-jurassic-dark/8 bg-jurassic-soft/35 p-5">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-jurassic-accent text-sm font-bold text-white">
                    {num}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-jurassic-dark">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-jurassic-dark/70">{body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[2rem] bg-jurassic-dark p-8 text-white shadow-premium">
            <span className="text-jurassic-accent font-bold uppercase tracking-[0.2em] text-[10px] mb-3 block">
              Recommended Next Step
            </span>
            <h2 className="text-2xl font-bold tracking-tight">Schedule the Discovery Call</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              The most useful next step is a Discovery Call so the appropriate pricing pathway
              can be matched to your implementation level and review context.
            </p>
            <a
              href="mailto:info@jurassicenglish.com?subject=Jurassic%20English%20%E2%80%94%20Discovery%20Call%20Request"
              className="mt-6 inline-flex rounded-2xl bg-jurassic-accent px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
            >
              Contact info@jurassicenglish.com
            </a>
          </section>

          <section className="rounded-[2rem] border border-jurassic-dark/8 bg-white p-8 shadow-premium">
            <SectionHeading
              eyebrow="Note"
              title="Private review only"
              description="This access page is intended for approved review and should not be forwarded publicly."
            />
            <ul className="space-y-3 text-sm leading-relaxed text-jurassic-dark/70">
              <li>Pricing remains subject to scope confirmation and audit findings.</li>
              <li>Institutional quotations are aligned to implementation fidelity, not commodity pricing.</li>
              <li>If this access window expires, a refreshed link can be issued after review.</li>
            </ul>
          </section>
        </aside>
      </motion.div>
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <span className="text-jurassic-accent font-bold uppercase tracking-[0.2em] text-[10px] mb-2 block">
        {eyebrow}
      </span>
      <h2 className="text-2xl font-bold tracking-tight text-jurassic-dark">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-jurassic-dark/65">{description}</p>
    </div>
  );
}

function InfoPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-jurassic-dark/8 bg-jurassic-soft/35 p-5">
      <h3 className="text-lg font-bold text-jurassic-dark">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-jurassic-dark/70">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-jurassic-accent shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
