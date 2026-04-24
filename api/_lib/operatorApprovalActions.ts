import type { PilotRequestPatch } from './internalPilotStore.js';
import {
  intakeAccessMapping,
  pilotScopeLabels,
  type PilotAccessEventType,
  type PilotAccessRequest,
  type PilotApprovedScope,
} from '../../src/lib/internalPilotPortal.js';
import type { OperatorApprovalAction } from './operatorApprovalActionToken.js';

export type OperatorApprovalActionPlan = {
  action: OperatorApprovalAction;
  label: string;
  description: string;
  patch: PilotRequestPatch;
  eventType: PilotAccessEventType;
  approvedScopes: PilotApprovedScope[];
};

export const operatorApprovalActionLabels: Record<OperatorApprovalAction, string> = {
  mark_under_review: 'Mark under review',
  approve_basic_pack: 'Approve basic pack',
  consultation_required: 'Consultation required',
  denied: 'Deny request',
};

function scopeLabels(scopes: PilotApprovedScope[]) {
  return scopes.map((scope) => pilotScopeLabels[scope]).join(', ');
}

export function getReviewRecommendation(request: {
  accessRequest?: string | null;
}) {
  if (!request.accessRequest || !(request.accessRequest in intakeAccessMapping)) {
    return 'Manual review required. No default scope recommendation is available for this access request.';
  }

  return intakeAccessMapping[request.accessRequest as keyof typeof intakeAccessMapping].recommendedAction;
}

export function buildOperatorApprovalActionPlan(
  request: PilotAccessRequest,
  action: OperatorApprovalAction,
): OperatorApprovalActionPlan {
  const basicScopes = ['pilot_overview_pack', 'readiness_checklist'] satisfies PilotApprovedScope[];

  if (action === 'mark_under_review') {
    return {
      action,
      label: operatorApprovalActionLabels[action],
      description: 'Moves the request into operator review without approving access.',
      patch: { operatorStatus: 'under_review' },
      eventType: 'review_started',
      approvedScopes: [],
    };
  }

  if (action === 'approve_basic_pack') {
    return {
      action,
      label: operatorApprovalActionLabels[action],
      description: `Approves the minimum recommended review scope: ${scopeLabels(basicScopes)}. No external token is issued automatically.`,
      patch: {
        operatorStatus: 'approved',
        consultationStatus: 'not_required',
        approvedScopes: basicScopes,
      },
      eventType: 'scopes_approved',
      approvedScopes: basicScopes,
    };
  }

  if (action === 'consultation_required') {
    return {
      action,
      label: operatorApprovalActionLabels[action],
      description: 'Marks the request as credible but requiring consultation before materials are sent.',
      patch: {
        operatorStatus: 'consultation_required',
        consultationStatus: 'required',
        fulfillmentStatus: 'not_started',
      },
      eventType: 'consultation_required',
      approvedScopes: [],
    };
  }

  return {
    action,
    label: operatorApprovalActionLabels.denied,
    description: 'Declines the request and blocks fulfillment. No external access is created.',
    patch: {
      operatorStatus: 'denied',
      fulfillmentStatus: 'blocked',
    },
    eventType: 'status_changed',
    approvedScopes: [],
  };
}

export function isTerminalPilotRequestStatus(request: PilotAccessRequest) {
  return request.operatorStatus === 'fulfilled' || request.operatorStatus === 'revoked';
}
