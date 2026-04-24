import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import {
  consultationStatusLabels,
  fulfillmentStatusLabels,
  pilotScopeLabels,
  pilotStatusLabels,
  type PilotApprovedScope,
  type PilotConsultationStatus,
  type PilotFulfillmentStatus,
  type PilotOperatorStatus,
} from '../lib/internalPilotPortal';

type ApprovalActionSummary = {
  ok: boolean;
  status: 'ready' | 'already_processed' | 'missing' | 'invalid' | 'expired' | 'not_found' | 'processed' | 'invalid_transition' | 'unavailable';
  error?: string;
  request?: {
    submissionId: string;
    submittedAt: string;
    fullName: string;
    workEmail: string;
    organisationName: string;
    organisationType: string | null;
    primaryInterest: string | null;
    source: string | null;
    accessRequest: string | null;
    challenge: string | null;
    decisionStage: string | null;
    timeline: string | null;
    operatorStatus: PilotOperatorStatus;
    consultationStatus: PilotConsultationStatus;
    approvedScopes: PilotApprovedScope[];
    fulfillmentStatus: PilotFulfillmentStatus;
  };
  action?: {
    id: string;
    label: string;
    description: string;
    approvedScopes: PilotApprovedScope[];
    expiresAt: string;
  };
  recommendation?: string;
};

type InternalApprovalActionPageProps = {
  onBack: () => void;
};

async function readApi<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok && response.status !== 409) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }
  return data as T;
}

function formatDate(value?: string | null) {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function InternalApprovalActionPage({ onBack }: InternalApprovalActionPageProps) {
  const token = useMemo(() => new URLSearchParams(window.location.search).get('token'), []);
  const [state, setState] = useState<ApprovalActionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      setLoading(true);
      try {
        const data = await readApi<ApprovalActionSummary>(
          await fetch(`/api/internal/pilot-requests/approval-action/confirm?token=${encodeURIComponent(token || '')}`, {
            headers: { Accept: 'application/json' },
          }),
        );
        if (!cancelled) setState(data);
      } catch (error: any) {
        if (!cancelled) {
          setState({
            ok: false,
            status: 'unavailable',
            error: error?.message || 'Approval action could not be loaded.',
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const confirmAction = async () => {
    if (!token) return;

    setConfirming(true);
    try {
      const data = await readApi<ApprovalActionSummary>(
        await fetch('/api/internal/pilot-requests/approval-action/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        }),
      );
      setState(data);
    } catch (error: any) {
      setState((current) => ({
        ...(current || { ok: false, status: 'unavailable' }),
        ok: false,
        status: 'unavailable',
        error: error?.message || 'Approval action could not be confirmed.',
      }));
    } finally {
      setConfirming(false);
    }
  };

  return (
    <main className="min-h-screen bg-jurassic-dark px-5 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/65 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to main site
        </button>

        <section className="rounded-lg border border-white/10 bg-white/[0.045] p-6 shadow-premium sm:p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-jurassic-gold/25 bg-jurassic-gold/10">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-jurassic-gold" />
            ) : state?.ok ? (
              <ShieldCheck className="h-6 w-6 text-jurassic-gold" />
            ) : (
              <LockKeyhole className="h-6 w-6 text-jurassic-gold" />
            )}
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-jurassic-gold">
            Internal Approval Action
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {loading
              ? 'Loading review action.'
              : state?.status === 'processed'
                ? 'Action confirmed.'
                : state?.ok
                  ? 'Confirm operator decision.'
                  : 'Action link unavailable.'}
          </h1>

          {loading ? (
            <p className="mt-5 text-white/65">Verifying the signed approval action link.</p>
          ) : state?.ok && state.request && state.action ? (
            <div className="mt-8 grid gap-6">
              <div className="rounded-lg border border-white/10 bg-black/15 p-5">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-jurassic-gold/30 bg-jurassic-gold/10 px-3 py-1 text-xs font-bold uppercase text-jurassic-gold">
                    {state.action.label}
                  </span>
                  <span className="text-xs text-white/50">
                    Expires {formatDate(state.action.expiresAt)}
                  </span>
                </div>
                <p className="text-base text-white/75">{state.action.description}</p>
                {state.action.approvedScopes.length > 0 ? (
                  <p className="mt-3 text-sm text-white/60">
                    Approved scope: {state.action.approvedScopes.map((scope) => pilotScopeLabels[scope]).join(', ')}
                  </p>
                ) : null}
                {state.recommendation ? (
                  <p className="mt-4 border-l-2 border-jurassic-gold/40 pl-4 text-sm text-white/65">
                    {state.recommendation}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <SummaryField label="Submission ID" value={state.request.submissionId} />
                <SummaryField label="Submitted" value={formatDate(state.request.submittedAt)} />
                <SummaryField label="Name" value={state.request.fullName} />
                <SummaryField label="Work email" value={state.request.workEmail} />
                <SummaryField label="Organization" value={state.request.organisationName} />
                <SummaryField label="Role / type" value={state.request.organisationType || 'Not provided'} />
                <SummaryField label="Access request" value={state.request.accessRequest || 'Not provided'} />
                <SummaryField label="Decision stage" value={state.request.decisionStage || 'Not provided'} />
                <SummaryField label="Operator status" value={pilotStatusLabels[state.request.operatorStatus]} />
                <SummaryField label="Consultation" value={consultationStatusLabels[state.request.consultationStatus]} />
                <SummaryField label="Fulfillment" value={fulfillmentStatusLabels[state.request.fulfillmentStatus]} />
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/45">Challenge / context</p>
                <p className="rounded-lg border border-white/10 bg-black/15 p-4 text-sm leading-relaxed text-white/70">
                  {state.request.challenge || 'Not provided'}
                </p>
              </div>

              {state.status === 'already_processed' ? (
                <Notice
                  tone="info"
                  title="Already processed"
                  body="This signed action link has already been confirmed. Review the internal portal event log for the recorded action."
                />
              ) : state.status === 'processed' ? (
                <Notice
                  tone="success"
                  title="Decision recorded"
                  body="The request status and event log have been updated. External portal access was not issued automatically."
                />
              ) : (
                <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row">
                  <button
                    type="button"
                    onClick={confirmAction}
                    disabled={confirming}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-jurassic-accent px-6 py-3 text-sm font-bold text-white shadow-premium transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Confirm Decision
                  </button>
                  <a
                    href={`/internal/pilot-requests?search=${encodeURIComponent(state.request.submissionId)}`}
                    className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white/75 transition hover:border-white/30 hover:text-white"
                  >
                    Open Full Portal
                  </a>
                </div>
              )}
            </div>
          ) : (
            <Notice
              tone="error"
              title={state?.status === 'expired' ? 'Link expired' : 'Cannot use this link'}
              body={state?.error || 'This approval action link is missing, invalid, expired, or no longer points to a request.'}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-black/15 p-4">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-white/40">{label}</p>
      <p className="truncate text-sm text-white/80">{value}</p>
    </div>
  );
}

function Notice({
  tone,
  title,
  body,
}: {
  tone: 'success' | 'error' | 'info';
  title: string;
  body: string;
}) {
  const Icon = tone === 'success' ? CheckCircle2 : AlertCircle;
  const color = tone === 'success'
    ? 'text-emerald-300'
    : tone === 'info'
      ? 'text-sky-300'
      : 'text-rose-300';

  return (
    <div className="mt-8 rounded-lg border border-white/10 bg-black/15 p-5">
      <div className={`mb-2 flex items-center gap-2 font-bold ${color}`}>
        <Icon className="h-5 w-5" />
        {title}
      </div>
      <p className="text-sm leading-relaxed text-white/65">{body}</p>
    </div>
  );
}
