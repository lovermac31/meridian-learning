import type {
  PilotAccessEvent,
  PilotAccessEventType,
  PilotAccessRequest,
  PilotApprovedScope,
  PilotConsultationStatus,
  PilotFulfillmentStatus,
  PilotOperatorStatus,
} from '../../src/lib/internalPilotPortal.js';

export type PilotQueueFilters = {
  search?: string;
  operatorStatus?: string;
  consultationStatus?: string;
  fulfillmentStatus?: string;
  accessRequest?: string;
  limit?: number;
};

export type PilotRequestPatch = {
  operatorStatus?: PilotOperatorStatus;
  consultationStatus?: PilotConsultationStatus;
  approvedScopes?: PilotApprovedScope[];
  fulfillmentStatus?: PilotFulfillmentStatus;
  assignedOperator?: string | null;
  operatorNotes?: string | null;
};

type SupabaseConfig = {
  url: string;
  writeKey: string;
};

type PilotAccessRequestRow = {
  id: string;
  submission_id: string;
  submitted_at: string;
  full_name: string;
  work_email: string;
  organisation_name: string;
  organisation_type: string | null;
  primary_interest: string | null;
  source: string | null;
  access_request: string | null;
  challenge: string | null;
  decision_stage: string | null;
  timeline: string | null;
  operator_status: PilotOperatorStatus;
  consultation_status: PilotConsultationStatus;
  approved_scopes: PilotApprovedScope[];
  fulfillment_status: PilotFulfillmentStatus;
  last_token_issued_at: string | null;
  last_token_expires_at: string | null;
  last_token_scope: PilotApprovedScope[] | null;
  last_token_reference: string | null;
  assigned_operator: string | null;
  operator_notes: string | null;
  created_at: string;
  updated_at: string;
};

type PilotAccessEventRow = {
  id: string;
  submission_id: string;
  event_type: PilotAccessEventType;
  operator_id: string | null;
  event_at: string;
  details: Record<string, unknown>;
};

function resolveConfig(): SupabaseConfig {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/g, '');
  const writeKey =
    process.env.SUPABASE_WRITE_KEY?.trim()
    ?? process.env.SUPABASE_SECRET_KEY?.trim()
    ?? process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !writeKey) {
    throw new Error('Supabase internal portal configuration is missing.');
  }

  if (writeKey.startsWith('sb_publishable_')) {
    throw new Error('Publishable Supabase key refused for internal portal operations.');
  }

  return { url, writeKey };
}

function supabaseHeaders(config: SupabaseConfig, prefer?: string) {
  return {
    apikey: config.writeKey,
    Authorization: `Bearer ${config.writeKey}`,
    'Content-Type': 'application/json',
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

function mapRequest(row: PilotAccessRequestRow): PilotAccessRequest {
  return {
    id: row.id,
    submissionId: row.submission_id,
    submittedAt: row.submitted_at,
    fullName: row.full_name,
    workEmail: row.work_email,
    organisationName: row.organisation_name,
    organisationType: row.organisation_type,
    primaryInterest: row.primary_interest,
    source: row.source,
    accessRequest: row.access_request,
    challenge: row.challenge,
    decisionStage: row.decision_stage,
    timeline: row.timeline,
    operatorStatus: row.operator_status,
    consultationStatus: row.consultation_status,
    approvedScopes: row.approved_scopes ?? [],
    fulfillmentStatus: row.fulfillment_status,
    lastTokenIssuedAt: row.last_token_issued_at,
    lastTokenExpiresAt: row.last_token_expires_at,
    lastTokenScope: row.last_token_scope,
    lastTokenReference: row.last_token_reference,
    assignedOperator: row.assigned_operator,
    operatorNotes: row.operator_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapEvent(row: PilotAccessEventRow): PilotAccessEvent {
  return {
    id: row.id,
    submissionId: row.submission_id,
    eventType: row.event_type,
    operatorId: row.operator_id,
    eventAt: row.event_at,
    details: row.details ?? {},
  };
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status} ${text.slice(0, 300)}`);
  }

  return text ? JSON.parse(text) as T : ([] as T);
}

function cleanLimit(value?: number) {
  if (!Number.isFinite(value)) return 50;
  return Math.min(Math.max(Math.floor(value ?? 50), 1), 100);
}

export async function listPilotAccessRequests(filters: PilotQueueFilters) {
  const config = resolveConfig();
  const params = new URLSearchParams({
    select: '*',
    order: 'submitted_at.desc',
    limit: String(cleanLimit(filters.limit)),
  });

  if (filters.operatorStatus) params.set('operator_status', `eq.${filters.operatorStatus}`);
  if (filters.consultationStatus) params.set('consultation_status', `eq.${filters.consultationStatus}`);
  if (filters.fulfillmentStatus) params.set('fulfillment_status', `eq.${filters.fulfillmentStatus}`);
  if (filters.accessRequest) params.set('access_request', `eq.${filters.accessRequest}`);

  const search = filters.search?.trim();
  if (search) {
    const escaped = search.replace(/[%*,()]/g, '');
    params.set(
      'or',
      `(submission_id.ilike.*${escaped}*,work_email.ilike.*${escaped}*,organisation_name.ilike.*${escaped}*)`,
    );
  }

  const response = await fetch(`${config.url}/rest/v1/je_pilot_access_requests?${params}`, {
    headers: supabaseHeaders(config),
  });
  const rows = await readJson<PilotAccessRequestRow[]>(response);
  return rows.map(mapRequest);
}

export async function getPilotAccessRequest(submissionId: string) {
  const config = resolveConfig();
  const params = new URLSearchParams({
    submission_id: `eq.${submissionId}`,
    select: '*',
    limit: '1',
  });
  const response = await fetch(`${config.url}/rest/v1/je_pilot_access_requests?${params}`, {
    headers: supabaseHeaders(config),
  });
  const rows = await readJson<PilotAccessRequestRow[]>(response);
  return rows[0] ? mapRequest(rows[0]) : null;
}

export async function getPilotAccessEvents(submissionId: string) {
  const config = resolveConfig();
  const params = new URLSearchParams({
    submission_id: `eq.${submissionId}`,
    select: '*',
    order: 'event_at.desc',
    limit: '100',
  });
  const response = await fetch(`${config.url}/rest/v1/je_pilot_access_events?${params}`, {
    headers: supabaseHeaders(config),
  });
  const rows = await readJson<PilotAccessEventRow[]>(response);
  return rows.map(mapEvent);
}

export async function updatePilotAccessRequest(submissionId: string, patch: PilotRequestPatch) {
  const config = resolveConfig();
  const row: Record<string, unknown> = {};

  if (patch.operatorStatus !== undefined) row.operator_status = patch.operatorStatus;
  if (patch.consultationStatus !== undefined) row.consultation_status = patch.consultationStatus;
  if (patch.approvedScopes !== undefined) row.approved_scopes = patch.approvedScopes;
  if (patch.fulfillmentStatus !== undefined) row.fulfillment_status = patch.fulfillmentStatus;
  if (patch.assignedOperator !== undefined) row.assigned_operator = patch.assignedOperator;
  if (patch.operatorNotes !== undefined) row.operator_notes = patch.operatorNotes;

  const response = await fetch(
    `${config.url}/rest/v1/je_pilot_access_requests?submission_id=eq.${encodeURIComponent(submissionId)}`,
    {
      method: 'PATCH',
      headers: supabaseHeaders(config, 'return=representation'),
      body: JSON.stringify(row),
    },
  );
  const rows = await readJson<PilotAccessRequestRow[]>(response);
  return rows[0] ? mapRequest(rows[0]) : null;
}

export async function recordTokenIssuance({
  submissionId,
  issuedAt,
  expiresAt,
  scopes,
  referenceId,
}: {
  submissionId: string;
  issuedAt: string;
  expiresAt: string;
  scopes: PilotApprovedScope[];
  referenceId: string;
}) {
  const config = resolveConfig();
  const response = await fetch(
    `${config.url}/rest/v1/je_pilot_access_requests?submission_id=eq.${encodeURIComponent(submissionId)}`,
    {
      method: 'PATCH',
      headers: supabaseHeaders(config, 'return=representation'),
      body: JSON.stringify({
        last_token_issued_at: issuedAt,
        last_token_expires_at: expiresAt,
        last_token_scope: scopes,
        last_token_reference: referenceId,
        fulfillment_status: 'token_issued',
      }),
    },
  );
  const rows = await readJson<PilotAccessRequestRow[]>(response);
  return rows[0] ? mapRequest(rows[0]) : null;
}

export async function appendPilotAccessEvent({
  submissionId,
  eventType,
  operatorId,
  details,
}: {
  submissionId: string;
  eventType: PilotAccessEventType;
  operatorId?: string | null;
  details?: Record<string, unknown>;
}) {
  const config = resolveConfig();
  const response = await fetch(`${config.url}/rest/v1/je_pilot_access_events`, {
    method: 'POST',
    headers: supabaseHeaders(config, 'return=representation'),
    body: JSON.stringify({
      submission_id: submissionId,
      event_type: eventType,
      operator_id: operatorId?.trim() || null,
      details: details ?? {},
    }),
  });
  const rows = await readJson<PilotAccessEventRow[]>(response);
  return rows[0] ? mapEvent(rows[0]) : null;
}
