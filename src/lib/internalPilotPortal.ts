import { externalPortalResourceKeys, type ExternalPortalResourceKey } from './externalPortalResources.js';

export const pilotOperatorStatuses = [
  'submitted',
  'under_review',
  'approved',
  'denied',
  'consultation_required',
  'fulfilled',
  'revoked',
] as const;

export const pilotConsultationStatuses = [
  'not_required',
  'required',
  'proposed',
  'scheduled',
  'completed',
  'declined',
] as const;

export const pilotFulfillmentStatuses = [
  'not_started',
  'token_issued',
  'materials_sent',
  'completed',
  'blocked',
] as const;

export const pilotAccessEventTypes = [
  'review_started',
  'status_changed',
  'consultation_required',
  'scopes_approved',
  'token_issued',
  'token_regenerated',
  'token_revoked_operationally',
  'fulfillment_updated',
  'operator_note_added',
  'access_viewed',
] as const;

export const pilotIntakeAccessRequests = [
  'pilot_overview_pack',
  'implementation_scope_overview',
  'reporting_sample',
  'readiness_checklist',
  'institutional_programme_pack',
  'pilot_consultation',
] as const;

export type PilotOperatorStatus = (typeof pilotOperatorStatuses)[number];
export type PilotConsultationStatus = (typeof pilotConsultationStatuses)[number];
export type PilotFulfillmentStatus = (typeof pilotFulfillmentStatuses)[number];
export type PilotAccessEventType = (typeof pilotAccessEventTypes)[number];
export type PilotIntakeAccessRequest = (typeof pilotIntakeAccessRequests)[number];
export type PilotApprovedScope = ExternalPortalResourceKey;

export type PilotAccessRequest = {
  id: string;
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
  lastTokenIssuedAt: string | null;
  lastTokenExpiresAt: string | null;
  lastTokenScope: PilotApprovedScope[] | null;
  lastTokenReference: string | null;
  assignedOperator: string | null;
  operatorNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PilotAccessEvent = {
  id: string;
  submissionId: string;
  eventType: PilotAccessEventType;
  operatorId: string | null;
  eventAt: string;
  details: Record<string, unknown>;
};

export const pilotScopeLabels: Record<PilotApprovedScope, string> = {
  pilot_overview_pack: 'Pilot overview pack',
  readiness_checklist: 'Readiness checklist',
  executive_summary_sample: 'Executive summary sample',
  consultation_prep: 'Consultation prep',
};

export const pilotStatusLabels: Record<PilotOperatorStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under review',
  approved: 'Approved',
  denied: 'Denied',
  consultation_required: 'Consultation required',
  fulfilled: 'Fulfilled',
  revoked: 'Revoked',
};

export const consultationStatusLabels: Record<PilotConsultationStatus, string> = {
  not_required: 'Not required',
  required: 'Required',
  proposed: 'Proposed',
  scheduled: 'Scheduled',
  completed: 'Completed',
  declined: 'Declined',
};

export const fulfillmentStatusLabels: Record<PilotFulfillmentStatus, string> = {
  not_started: 'Not started',
  token_issued: 'Token issued',
  materials_sent: 'Materials sent',
  completed: 'Completed',
  blocked: 'Blocked',
};

export const intakeAccessMapping: Record<PilotIntakeAccessRequest, {
  label: string;
  defaultScopes: PilotApprovedScope[];
  recommendedAction: string;
}> = {
  pilot_overview_pack: {
    label: 'Pilot overview pack',
    defaultScopes: ['pilot_overview_pack', 'readiness_checklist'],
    recommendedAction: 'Qualified material access request. Approve overview and checklist when context is credible.',
  },
  readiness_checklist: {
    label: 'Readiness checklist',
    defaultScopes: ['readiness_checklist'],
    recommendedAction: 'Checklist-first request. Add overview only if the institution is ready for broader review.',
  },
  reporting_sample: {
    label: 'Reporting sample',
    defaultScopes: ['executive_summary_sample'],
    recommendedAction: 'Reporting-focused request. Map to executive summary sample after manual review.',
  },
  pilot_consultation: {
    label: 'Pilot consultation',
    defaultScopes: ['consultation_prep'],
    recommendedAction: 'Consultation-first request. Send prep only unless deeper materials are explicitly approved.',
  },
  implementation_scope_overview: {
    label: 'Implementation scope overview',
    defaultScopes: ['consultation_prep', 'readiness_checklist'],
    recommendedAction: 'Requires consultation before implementation materials. Start with prep and readiness review.',
  },
  institutional_programme_pack: {
    label: 'Institutional programme pack',
    defaultScopes: ['pilot_overview_pack', 'readiness_checklist'],
    recommendedAction: 'Broad institutional request. Start narrow; add reporting sample only after approval.',
  },
};

export function isPilotApprovedScope(value: unknown): value is PilotApprovedScope {
  return typeof value === 'string' &&
    (externalPortalResourceKeys as readonly string[]).includes(value);
}

export function isPilotOperatorStatus(value: unknown): value is PilotOperatorStatus {
  return typeof value === 'string' &&
    (pilotOperatorStatuses as readonly string[]).includes(value);
}

export function isPilotConsultationStatus(value: unknown): value is PilotConsultationStatus {
  return typeof value === 'string' &&
    (pilotConsultationStatuses as readonly string[]).includes(value);
}

export function isPilotFulfillmentStatus(value: unknown): value is PilotFulfillmentStatus {
  return typeof value === 'string' &&
    (pilotFulfillmentStatuses as readonly string[]).includes(value);
}

export function isPilotAccessEventType(value: unknown): value is PilotAccessEventType {
  return typeof value === 'string' &&
    (pilotAccessEventTypes as readonly string[]).includes(value);
}

export function getDefaultScopesForAccessRequest(accessRequest?: string | null): PilotApprovedScope[] {
  if (!accessRequest || !(pilotIntakeAccessRequests as readonly string[]).includes(accessRequest)) {
    return [];
  }

  return intakeAccessMapping[accessRequest as PilotIntakeAccessRequest].defaultScopes;
}
