import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clipboard,
  FileText,
  KeyRound,
  Loader2,
  LockKeyhole,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  consultationStatusLabels,
  fulfillmentStatusLabels,
  getDefaultScopesForAccessRequest,
  intakeAccessMapping,
  pilotAccessEventTypes,
  pilotConsultationStatuses,
  pilotFulfillmentStatuses,
  pilotOperatorStatuses,
  pilotScopeLabels,
  pilotStatusLabels,
  type PilotAccessEvent,
  type PilotAccessEventType,
  type PilotAccessRequest,
  type PilotApprovedScope,
  type PilotConsultationStatus,
  type PilotFulfillmentStatus,
  type PilotOperatorStatus,
} from '../lib/internalPilotPortal';
import { externalPortalResourceKeys } from '../lib/externalPortalResources';

const SESSION_KEY = 'je_internal_portal_operator_key';

type DetailState = {
  request: PilotAccessRequest;
  events: PilotAccessEvent[];
};

type Notice = {
  tone: 'success' | 'error' | 'info';
  text: string;
};

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

function getAuthHeader(operatorKey: string) {
  return {
    Authorization: `Bearer ${operatorKey}`,
    'Content-Type': 'application/json',
  };
}

async function readApi<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }
  return data as T;
}

export function InternalPilotRequestsPage() {
  const [operatorKey, setOperatorKey] = useState(() => sessionStorage.getItem(SESSION_KEY) || '');
  const [operatorKeyInput, setOperatorKeyInput] = useState(operatorKey);
  const [requests, setRequests] = useState<PilotAccessRequest[]>([]);
  const [detail, setDetail] = useState<DetailState | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('');
  const [search, setSearch] = useState('');
  const [operatorStatusFilter, setOperatorStatusFilter] = useState('');
  const [consultationFilter, setConsultationFilter] = useState('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('');
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [tokenUrl, setTokenUrl] = useState('');
  const [tokenDays, setTokenDays] = useState(14);
  const [allowOver30Days, setAllowOver30Days] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [manualEventType, setManualEventType] = useState<PilotAccessEventType>('fulfillment_updated');
  const [manualEventNote, setManualEventNote] = useState('');

  const selectedRequest = detail?.request ?? null;
  const approvedScopes = selectedRequest?.approvedScopes ?? [];
  const recommendedScopes = useMemo(
    () => getDefaultScopesForAccessRequest(selectedRequest?.accessRequest),
    [selectedRequest?.accessRequest],
  );

  const loadQueue = async () => {
    if (!operatorKey) return;

    setLoadingQueue(true);
    setNotice(null);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (search.trim()) params.set('search', search.trim());
      if (operatorStatusFilter) params.set('operatorStatus', operatorStatusFilter);
      if (consultationFilter) params.set('consultationStatus', consultationFilter);
      if (fulfillmentFilter) params.set('fulfillmentStatus', fulfillmentFilter);

      const data = await readApi<{ ok: true; requests: PilotAccessRequest[] }>(
        await fetch(`/api/internal/pilot-requests?${params}`, {
          headers: getAuthHeader(operatorKey),
        }),
      );
      setRequests(data.requests);

      if (!selectedSubmissionId && data.requests[0]) {
        setSelectedSubmissionId(data.requests[0].submissionId);
      }
    } catch (error: any) {
      setNotice({ tone: 'error', text: error?.message || 'Could not load pilot requests.' });
    } finally {
      setLoadingQueue(false);
    }
  };

  const loadDetail = async (submissionId: string) => {
    if (!operatorKey || !submissionId) return;

    setLoadingDetail(true);
    setTokenUrl('');
    try {
      const data = await readApi<{ ok: true; request: PilotAccessRequest; events: PilotAccessEvent[] }>(
        await fetch(`/api/internal/pilot-requests/${encodeURIComponent(submissionId)}`, {
          headers: getAuthHeader(operatorKey),
        }),
      );
      setDetail({ request: data.request, events: data.events });
    } catch (error: any) {
      setNotice({ tone: 'error', text: error?.message || 'Could not load request detail.' });
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (operatorKey) {
      void loadQueue();
    }
  }, [operatorKey]);

  useEffect(() => {
    if (selectedSubmissionId) {
      void loadDetail(selectedSubmissionId);
    }
  }, [selectedSubmissionId, operatorKey]);

  const saveOperatorKey = () => {
    const trimmed = operatorKeyInput.trim();
    sessionStorage.setItem(SESSION_KEY, trimmed);
    setOperatorKey(trimmed);
  };

  const updateRequest = async (patch: Record<string, unknown>, successText: string) => {
    if (!selectedRequest) return;

    setSaving(true);
    setNotice(null);
    try {
      const data = await readApi<{ ok: true; request: PilotAccessRequest; events: PilotAccessEvent[] }>(
        await fetch(`/api/internal/pilot-requests/${encodeURIComponent(selectedRequest.submissionId)}`, {
          method: 'PATCH',
          headers: getAuthHeader(operatorKey),
          body: JSON.stringify(patch),
        }),
      );
      setDetail({ request: data.request, events: data.events });
      setRequests((current) =>
        current.map((request) =>
          request.submissionId === data.request.submissionId ? data.request : request,
        ),
      );
      setNotice({ tone: 'success', text: successText });
    } catch (error: any) {
      setNotice({ tone: 'error', text: error?.message || 'Could not update request.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleScope = (scope: PilotApprovedScope) => {
    if (!selectedRequest) return;
    const nextScopes = approvedScopes.includes(scope)
      ? approvedScopes.filter((item) => item !== scope)
      : [...approvedScopes, scope];
    void updateRequest({ approvedScopes: nextScopes }, 'Approved scopes updated.');
  };

  const issueToken = async () => {
    if (!selectedRequest) return;

    setSaving(true);
    setTokenUrl('');
    setNotice(null);
    try {
      const data = await readApi<{
        ok: true;
        request: PilotAccessRequest;
        events: PilotAccessEvent[];
        tokenUrl: string;
      }>(
        await fetch(`/api/internal/pilot-requests/${encodeURIComponent(selectedRequest.submissionId)}/issue-token`, {
          method: 'POST',
          headers: getAuthHeader(operatorKey),
          body: JSON.stringify({
            scopes: approvedScopes,
            days: tokenDays,
            allowOver30Days,
            overrideReason,
            referenceId: selectedRequest.submissionId,
          }),
        }),
      );
      setDetail({ request: data.request, events: data.events });
      setTokenUrl(data.tokenUrl);
      setNotice({ tone: 'success', text: 'Token URL generated. Copy it now; it is not stored.' });
    } catch (error: any) {
      setNotice({ tone: 'error', text: error?.message || 'Could not issue token.' });
    } finally {
      setSaving(false);
    }
  };

  const logManualEvent = async () => {
    if (!selectedRequest) return;

    setSaving(true);
    setNotice(null);
    try {
      const data = await readApi<{ ok: true; events: PilotAccessEvent[] }>(
        await fetch(`/api/internal/pilot-requests/${encodeURIComponent(selectedRequest.submissionId)}/log-action`, {
          method: 'POST',
          headers: getAuthHeader(operatorKey),
          body: JSON.stringify({
            eventType: manualEventType,
            details: { note: manualEventNote.trim() || 'Manual operator event' },
          }),
        }),
      );
      setDetail((current) => current ? { ...current, events: data.events } : current);
      setManualEventNote('');
      setNotice({ tone: 'success', text: 'Event logged.' });
    } catch (error: any) {
      setNotice({ tone: 'error', text: error?.message || 'Could not log event.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-jurassic-ivory text-jurassic-dark">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-jurassic-dark/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-jurassic-accent">
              Internal Operator Portal
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Pilot access requests
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-jurassic-dark/65">
              Review pilot access submissions, approve scopes, issue controlled external portal links, and track fulfillment events.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row">
            <label className="sr-only" htmlFor="operator-key">Operator key</label>
            <input
              id="operator-key"
              type="password"
              value={operatorKeyInput}
              onChange={(event) => setOperatorKeyInput(event.target.value)}
              placeholder="Operator key"
              className="min-h-11 flex-1 rounded-md border border-jurassic-dark/15 bg-white px-3 text-sm outline-none focus:border-jurassic-accent"
            />
            <button
              type="button"
              onClick={saveOperatorKey}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-jurassic-dark px-4 text-sm font-bold text-white"
            >
              <LockKeyhole className="h-4 w-4" />
              Unlock
            </button>
          </div>
        </div>

        {notice ? (
          <div
            className={`mt-5 flex items-start gap-3 rounded-md border p-4 text-sm ${
              notice.tone === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : notice.tone === 'success'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-jurassic-blue/20 bg-white text-jurassic-dark/70'
            }`}
          >
            {notice.tone === 'error' ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            {notice.text}
          </div>
        ) : null}

        {!operatorKey ? (
          <div className="mt-8 rounded-md border border-jurassic-dark/10 bg-white p-6">
            <KeyRound className="h-8 w-8 text-jurassic-accent" />
            <h2 className="mt-4 text-xl font-bold">Operator key required</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-jurassic-dark/65">
              Enter the scoped internal portal key. It is kept in this browser session only and sent as a bearer token to internal API routes.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(320px,0.42fr)_minmax(0,0.58fr)]">
            <section className="min-w-0">
              <div className="rounded-md border border-jurassic-dark/10 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold">Queue</h2>
                  <button
                    type="button"
                    onClick={loadQueue}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-jurassic-dark/10 px-3 text-sm font-bold"
                  >
                    {loadingQueue ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Refresh
                  </button>
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-jurassic-dark/40" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') void loadQueue();
                      }}
                      placeholder="Search ID, email, organisation"
                      className="min-h-11 w-full rounded-md border border-jurassic-dark/15 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-jurassic-accent"
                    />
                  </div>
                  <select
                    value={operatorStatusFilter}
                    onChange={(event) => setOperatorStatusFilter(event.target.value)}
                    className="min-h-11 rounded-md border border-jurassic-dark/15 bg-white px-3 text-sm"
                  >
                    <option value="">All operator statuses</option>
                    {pilotOperatorStatuses.map((status) => (
                      <option key={status} value={status}>{pilotStatusLabels[status]}</option>
                    ))}
                  </select>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      value={consultationFilter}
                      onChange={(event) => setConsultationFilter(event.target.value)}
                      className="min-h-11 rounded-md border border-jurassic-dark/15 bg-white px-3 text-sm"
                    >
                      <option value="">All consultation</option>
                      {pilotConsultationStatuses.map((status) => (
                        <option key={status} value={status}>{consultationStatusLabels[status]}</option>
                      ))}
                    </select>
                    <select
                      value={fulfillmentFilter}
                      onChange={(event) => setFulfillmentFilter(event.target.value)}
                      className="min-h-11 rounded-md border border-jurassic-dark/15 bg-white px-3 text-sm"
                    >
                      <option value="">All fulfillment</option>
                      {pilotFulfillmentStatuses.map((status) => (
                        <option key={status} value={status}>{fulfillmentStatusLabels[status]}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={loadQueue}
                    className="min-h-11 rounded-md bg-jurassic-accent px-4 text-sm font-bold text-white"
                  >
                    Apply filters
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {loadingQueue ? (
                  <div className="rounded-md border border-jurassic-dark/10 bg-white p-5 text-sm text-jurassic-dark/60">
                    Loading requests...
                  </div>
                ) : requests.length === 0 ? (
                  <div className="rounded-md border border-jurassic-dark/10 bg-white p-5 text-sm text-jurassic-dark/60">
                    No pilot access requests found.
                  </div>
                ) : requests.map((request) => (
                  <button
                    key={request.submissionId}
                    type="button"
                    onClick={() => setSelectedSubmissionId(request.submissionId)}
                    className={`min-h-[8rem] min-w-0 rounded-md border p-4 text-left transition ${
                      selectedSubmissionId === request.submissionId
                        ? 'border-jurassic-accent bg-jurassic-accent/5'
                        : 'border-jurassic-dark/10 bg-white hover:border-jurassic-dark/25'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{request.organisationName}</p>
                        <p className="mt-1 truncate text-xs text-jurassic-dark/55">{request.workEmail}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-jurassic-dark/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-jurassic-dark/65">
                        {pilotStatusLabels[request.operatorStatus]}
                      </span>
                    </div>
                    <p className="mt-3 truncate text-xs text-jurassic-dark/55">{request.submissionId}</p>
                    <p className="mt-2 truncate text-xs text-jurassic-dark/55">{formatDate(request.submittedAt)}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="min-w-0">
              {!selectedRequest ? (
                <div className="rounded-md border border-jurassic-dark/10 bg-white p-6">
                  <FileText className="h-8 w-8 text-jurassic-accent" />
                  <h2 className="mt-4 text-xl font-bold">Select a request</h2>
                  <p className="mt-2 text-sm text-jurassic-dark/65">Choose a queue item to review details and issue access.</p>
                </div>
              ) : (
                <div className="grid gap-5">
                  <div className="rounded-md border border-jurassic-dark/10 bg-white p-5">
                    {loadingDetail ? (
                      <div className="flex items-center gap-2 text-sm text-jurassic-dark/60">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading detail...
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-4 border-b border-jurassic-dark/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-jurassic-accent">
                              {selectedRequest.submissionId}
                            </p>
                            <h2 className="mt-2 text-2xl font-bold">{selectedRequest.organisationName}</h2>
                            <p className="mt-1 text-sm text-jurassic-dark/60">{selectedRequest.fullName} · {selectedRequest.workEmail}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => loadDetail(selectedRequest.submissionId)}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-jurassic-dark/10 px-3 text-sm font-bold"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Reload
                          </button>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          <Field label="Submitted" value={formatDate(selectedRequest.submittedAt)} />
                          <Field label="Source" value={selectedRequest.source || 'Not provided'} />
                          <Field label="Access request" value={selectedRequest.accessRequest || 'Not provided'} />
                          <Field label="Primary interest" value={selectedRequest.primaryInterest || 'Not provided'} />
                          <Field label="Organisation type" value={selectedRequest.organisationType || 'Not provided'} />
                          <Field label="Decision stage" value={selectedRequest.decisionStage || 'Not provided'} />
                          <Field label="Timeline" value={selectedRequest.timeline || 'Not provided'} />
                        </div>

                        <div className="mt-5">
                          <h3 className="text-sm font-bold">Challenge/context</h3>
                          <p className="mt-2 rounded-md bg-jurassic-dark/5 p-4 text-sm leading-relaxed text-jurassic-dark/70">
                            {selectedRequest.challenge || 'No challenge provided.'}
                          </p>
                        </div>

                        {selectedRequest.accessRequest && selectedRequest.accessRequest in intakeAccessMapping ? (
                          <div className="mt-5 rounded-md border border-jurassic-gold/25 bg-jurassic-gold/10 p-4">
                            <h3 className="text-sm font-bold">Mapping recommendation</h3>
                            <p className="mt-2 text-sm leading-relaxed text-jurassic-dark/70">
                              {intakeAccessMapping[selectedRequest.accessRequest as keyof typeof intakeAccessMapping].recommendedAction}
                            </p>
                            <p className="mt-2 text-xs font-bold uppercase tracking-wide text-jurassic-dark/55">
                              Default scopes: {recommendedScopes.length ? recommendedScopes.map((scope) => pilotScopeLabels[scope]).join(', ') : 'Manual review required'}
                            </p>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>

                  <div className="rounded-md border border-jurassic-dark/10 bg-white p-5">
                    <h3 className="text-lg font-bold">Review controls</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <ControlSelect
                        label="Operator status"
                        value={selectedRequest.operatorStatus}
                        options={pilotOperatorStatuses}
                        labels={pilotStatusLabels}
                        onChange={(value) => updateRequest({ operatorStatus: value }, 'Operator status updated.')}
                      />
                      <ControlSelect
                        label="Consultation"
                        value={selectedRequest.consultationStatus}
                        options={pilotConsultationStatuses}
                        labels={consultationStatusLabels}
                        onChange={(value) => updateRequest({ consultationStatus: value }, 'Consultation status updated.')}
                      />
                      <ControlSelect
                        label="Fulfillment"
                        value={selectedRequest.fulfillmentStatus}
                        options={pilotFulfillmentStatuses}
                        labels={fulfillmentStatusLabels}
                        onChange={(value) => updateRequest({ fulfillmentStatus: value }, 'Fulfillment status updated.')}
                      />
                    </div>

                    <div className="mt-5">
                      <h4 className="text-sm font-bold">Approved scopes</h4>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {externalPortalResourceKeys.map((scope) => (
                          <label
                            key={scope}
                            className="flex min-h-11 items-center gap-3 rounded-md border border-jurassic-dark/10 px-3 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={approvedScopes.includes(scope)}
                              onChange={() => toggleScope(scope)}
                              disabled={saving}
                              className="h-4 w-4"
                            />
                            {pilotScopeLabels[scope]}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5">
                      <label className="text-sm font-bold" htmlFor="operator-notes">Operator notes</label>
                      <textarea
                        id="operator-notes"
                        defaultValue={selectedRequest.operatorNotes || ''}
                        onBlur={(event) => updateRequest({ operatorNotes: event.target.value }, 'Operator notes saved.')}
                        className="mt-2 min-h-28 w-full rounded-md border border-jurassic-dark/15 bg-white p-3 text-sm outline-none focus:border-jurassic-accent"
                      />
                    </div>
                  </div>

                  <div className="rounded-md border border-jurassic-dark/10 bg-white p-5">
                    <h3 className="text-lg font-bold">Issue token</h3>
                    <p className="mt-2 text-sm text-jurassic-dark/60">
                      The raw URL is returned once for copy. It is not stored in Supabase.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-[9rem_1fr]">
                      <label className="text-sm font-bold" htmlFor="token-days">Days</label>
                      <input
                        id="token-days"
                        type="number"
                        min={1}
                        max={90}
                        value={tokenDays}
                        onChange={(event) => setTokenDays(Number(event.target.value))}
                        className="min-h-11 rounded-md border border-jurassic-dark/15 px-3 text-sm"
                      />
                      <span className="text-sm font-bold">Over 30 days</span>
                      <label className="flex min-h-11 items-center gap-3 rounded-md border border-jurassic-dark/10 px-3 text-sm">
                        <input
                          type="checkbox"
                          checked={allowOver30Days}
                          onChange={(event) => setAllowOver30Days(event.target.checked)}
                        />
                        Explicit override approved
                      </label>
                      <label className="text-sm font-bold" htmlFor="override-reason">Reason</label>
                      <input
                        id="override-reason"
                        value={overrideReason}
                        onChange={(event) => setOverrideReason(event.target.value)}
                        placeholder="Required only above 30 days"
                        className="min-h-11 rounded-md border border-jurassic-dark/15 px-3 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={issueToken}
                      disabled={saving || approvedScopes.length === 0}
                      className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-jurassic-dark px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                      Generate external portal URL
                    </button>
                    {tokenUrl ? (
                      <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-4">
                        <p className="text-sm font-bold text-green-900">Copy this URL now</p>
                        <textarea
                          readOnly
                          value={tokenUrl}
                          className="mt-2 min-h-24 w-full rounded-md border border-green-200 bg-white p-3 text-xs text-green-950"
                        />
                        <button
                          type="button"
                          onClick={() => navigator.clipboard?.writeText(tokenUrl)}
                          className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-md bg-green-800 px-3 text-sm font-bold text-white"
                        >
                          <Clipboard className="h-4 w-4" />
                          Copy URL
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-md border border-jurassic-dark/10 bg-white p-5">
                    <h3 className="text-lg font-bold">Event log</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
                      <select
                        value={manualEventType}
                        onChange={(event) => setManualEventType(event.target.value as PilotAccessEventType)}
                        className="min-h-11 rounded-md border border-jurassic-dark/15 bg-white px-3 text-sm"
                      >
                        {pilotAccessEventTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <input
                        value={manualEventNote}
                        onChange={(event) => setManualEventNote(event.target.value)}
                        placeholder="Event note"
                        className="min-h-11 rounded-md border border-jurassic-dark/15 px-3 text-sm"
                      />
                      <button
                        type="button"
                        onClick={logManualEvent}
                        className="min-h-11 rounded-md border border-jurassic-dark/10 px-4 text-sm font-bold"
                      >
                        Log
                      </button>
                    </div>
                    <div className="mt-5 grid gap-3">
                      {detail?.events.length ? detail.events.map((event) => (
                        <article key={event.id} className="rounded-md border border-jurassic-dark/10 bg-jurassic-dark/[0.025] p-3">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm font-bold">{event.eventType}</p>
                            <p className="text-xs text-jurassic-dark/55">{formatDate(event.eventAt)}</p>
                          </div>
                          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs leading-relaxed text-jurassic-dark/60">
                            {JSON.stringify(event.details, null, 2)}
                          </pre>
                        </article>
                      )) : (
                        <p className="text-sm text-jurassic-dark/55">No events yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-jurassic-dark/5 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-jurassic-dark/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-jurassic-dark/80">{value}</p>
    </div>
  );
}

function ControlSelect<T extends string>({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (value: T) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="min-h-11 rounded-md border border-jurassic-dark/15 bg-white px-3 text-sm font-normal"
      >
        {options.map((option) => (
          <option key={option} value={option}>{labels[option]}</option>
        ))}
      </select>
    </label>
  );
}
