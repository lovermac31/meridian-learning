import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  FileText,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import type { ExternalPortalResource } from '../lib/externalPortalResources';

type ExternalPilotPortalPageProps = {
  onBack: () => void;
  onRequestAccess: () => void;
};

type PortalState =
  | { status: 'loading' }
  | {
      status: 'valid';
      approvedUser: string;
      organizationName: string;
      referenceId: string | null;
      expiresAt: number;
      resources: ExternalPortalResource[];
    }
  | { status: 'missing' | 'invalid' | 'expired' | 'error'; message?: string };

function formatExpiry(expiresAt: number) {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(expiresAt * 1000));
}

export function ExternalPilotPortalPage({ onBack, onRequestAccess }: ExternalPilotPortalPageProps) {
  const token = useMemo(() => new URLSearchParams(window.location.search).get('token'), []);
  const [portalState, setPortalState] = useState<PortalState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function verifyAccess() {
      if (!token) {
        setPortalState({ status: 'missing' });
        return;
      }

      try {
        const response = await fetch(`/api/verify-external-portal-access?token=${encodeURIComponent(token)}`, {
          headers: { Accept: 'application/json' },
        });
        const data = await response.json();

        if (cancelled) return;

        if (!response.ok || !data.ok) {
          setPortalState({
            status: data.status === 'expired'
              ? 'expired'
              : data.status === 'missing'
                ? 'missing'
                : 'invalid',
            message: data.error,
          });
          return;
        }

        setPortalState({
          status: 'valid',
          approvedUser: data.approvedUser,
          organizationName: data.organizationName,
          referenceId: data.referenceId,
          expiresAt: data.expiresAt,
          resources: data.resources,
        });
      } catch (error: any) {
        if (!cancelled) {
          setPortalState({
            status: 'error',
            message: error?.message || 'Access verification failed.',
          });
        }
      }
    }

    verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="min-h-screen bg-jurassic-dark pt-32 pb-20 text-white">
      <section className="mx-auto max-w-7xl px-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to main site
        </button>

        {portalState.status === 'loading' ? (
          <PortalShell
            icon={<Loader2 className="h-6 w-6 animate-spin text-jurassic-gold" />}
            eyebrow="External Pilot Portal"
            title="Verifying approved access."
            body="Please wait while we check this institutional access link."
          />
        ) : portalState.status === 'valid' ? (
          <ApprovedPortal state={portalState} />
        ) : (
          <DeniedPortal state={portalState} onRequestAccess={onRequestAccess} />
        )}
      </section>
    </main>
  );
}

function PortalShell({
  icon,
  eyebrow,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-white/10 bg-white/[0.045] p-8 shadow-premium">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-jurassic-gold/25 bg-jurassic-gold/10">
        {icon}
      </div>
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-jurassic-gold">{eyebrow}</p>
      <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
      <p className="mt-5 text-base leading-relaxed text-white/65">{body}</p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}

function DeniedPortal({
  state,
  onRequestAccess,
}: {
  state: Exclude<PortalState, { status: 'loading' | 'valid' }>;
  onRequestAccess: () => void;
}) {
  const copy = {
    missing: {
      title: 'Access token required.',
      body: 'This external pilot portal is available only through an approved access link. Please request access through the institutional intake flow.',
    },
    invalid: {
      title: 'This access link is not valid.',
      body: 'The link may be incomplete, revoked, or outside the approved resource scope. Please request a new review if you believe this is an error.',
    },
    expired: {
      title: 'This access link has expired.',
      body: 'Approved pilot access links are time-limited. Please request renewed access if your institution still needs these materials.',
    },
    error: {
      title: 'Access could not be verified.',
      body: state.message || 'The verification service is temporarily unavailable. Please try again shortly.',
    },
  }[state.status];

  return (
    <PortalShell
      icon={<LockKeyhole className="h-6 w-6 text-jurassic-gold" />}
      eyebrow="Controlled Access"
      title={copy.title}
      body={copy.body}
      action={
        <button
          type="button"
          onClick={onRequestAccess}
          className="inline-flex items-center justify-center rounded-full bg-jurassic-accent px-7 py-3 text-sm font-bold text-white shadow-premium transition hover:opacity-95"
        >
          Request Access Through Get Started
        </button>
      }
    />
  );
}

function ApprovedPortal({ state }: { state: Extract<PortalState, { status: 'valid' }> }) {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,0.5fr)] lg:items-end"
      >
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-jurassic-gold">
            External Pilot Portal
          </p>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
            Approved institutional pilot resources.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/68">
            This controlled library gives your institution access to the pilot resources approved for your current review stage.
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
          <div className="mb-5 flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-jurassic-gold" />
            <div>
              <p className="text-sm font-bold text-white">{state.organizationName}</p>
              <p className="mt-1 text-xs text-white/55">{state.approvedUser}</p>
            </div>
          </div>
          <div className="grid gap-3 text-xs text-white/60">
            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <span>Access expires</span>
              <span className="font-semibold text-white">{formatExpiry(state.expiresAt)}</span>
            </div>
            {state.referenceId ? (
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <span>Reference</span>
                <span className="font-semibold text-white">{state.referenceId}</span>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {state.resources.map((resource, index) => (
          <motion.article
            key={resource.key}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
            className="rounded-lg border border-white/10 bg-white/[0.045] p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-jurassic-gold/10 text-jurassic-gold">
                {resource.key === 'consultation_prep' ? (
                  <CalendarClock className="h-5 w-5" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/45">
                Approved
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-jurassic-gold">
              {resource.eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">{resource.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/65">{resource.summary}</p>
            <ul className="mt-6 space-y-3">
              {resource.sections.map((section) => (
                <li key={section} className="flex items-start gap-3 text-sm leading-relaxed text-white/68">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-jurassic-teal" />
                  {section}
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-jurassic-gold/20 bg-jurassic-gold/10 p-5">
        <p className="text-sm leading-relaxed text-white/72">
          These materials are provided for approved institutional review only. Do not forward this access link. For broader licensing or pricing review, continue through the separate approved pricing process.
        </p>
      </div>
    </div>
  );
}
