import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  buildOperatorApprovalActionPlan,
  getReviewRecommendation,
  isTerminalPilotRequestStatus,
} from './operatorApprovalActions.js';
import { verifyOperatorApprovalActionToken } from './operatorApprovalActionToken.js';
import {
  appendPilotAccessEvent,
  getPilotAccessEvents,
  getPilotAccessRequest,
  updatePilotAccessRequest,
} from './internalPilotStore.js';

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function prepareResponse(res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
}

function sanitizeRequestSummary(request: NonNullable<Awaited<ReturnType<typeof getPilotAccessRequest>>>) {
  return {
    submissionId: request.submissionId,
    submittedAt: request.submittedAt,
    fullName: request.fullName,
    workEmail: request.workEmail,
    organisationName: request.organisationName,
    organisationType: request.organisationType,
    primaryInterest: request.primaryInterest,
    source: request.source,
    accessRequest: request.accessRequest,
    challenge: request.challenge,
    decisionStage: request.decisionStage,
    timeline: request.timeline,
    operatorStatus: request.operatorStatus,
    consultationStatus: request.consultationStatus,
    approvedScopes: request.approvedScopes,
    fulfillmentStatus: request.fulfillmentStatus,
  };
}

async function buildActionState(token?: string | null) {
  const verification = verifyOperatorApprovalActionToken(token);
  if (verification.ok === false) {
    return { ok: false as const, status: verification.status };
  }

  const request = await getPilotAccessRequest(verification.payload.sub);
  if (!request) {
    return { ok: false as const, status: 'not_found' as const };
  }

  const events = await getPilotAccessEvents(request.submissionId);
  const alreadyProcessed = events.some((event) =>
    event.details?.actionTokenId === verification.payload.jti,
  );
  const plan = buildOperatorApprovalActionPlan(request, verification.payload.action);

  return {
    ok: true as const,
    payload: verification.payload,
    request,
    events,
    alreadyProcessed,
    plan,
  };
}

export async function handleOperatorApprovalAction(req: VercelRequest, res: VercelResponse) {
  prepareResponse(res);

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  try {
    const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {};
    const token = req.method === 'GET'
      ? queryValue(req.query.token)
      : typeof body.token === 'string'
        ? body.token
        : null;
    const state = await buildActionState(token);

    if (!state.ok) {
      const statusCode = state.status === 'not_found' ? 404 : 200;
      return res.status(statusCode).json({
        ok: false,
        status: state.status,
        error: state.status === 'expired'
          ? 'This approval action link has expired.'
          : state.status === 'not_found'
            ? 'Pilot request not found.'
            : 'This approval action link is not valid.',
      });
    }

    if (req.method === 'GET') {
      return res.status(200).json({
        ok: true,
        status: state.alreadyProcessed ? 'already_processed' : 'ready',
        request: sanitizeRequestSummary(state.request),
        action: {
          id: state.plan.action,
          label: state.plan.label,
          description: state.plan.description,
          approvedScopes: state.plan.approvedScopes,
          expiresAt: new Date(state.payload.exp * 1000).toISOString(),
        },
        recommendation: getReviewRecommendation(state.request),
      });
    }

    if (state.alreadyProcessed) {
      return res.status(409).json({
        ok: false,
        status: 'already_processed',
        error: 'This approval action link has already been processed.',
        request: sanitizeRequestSummary(state.request),
      });
    }

    if (isTerminalPilotRequestStatus(state.request)) {
      return res.status(409).json({
        ok: false,
        status: 'invalid_transition',
        error: 'This request is already terminal and cannot be changed by email action.',
        request: sanitizeRequestSummary(state.request),
      });
    }

    const updated = await updatePilotAccessRequest(state.request.submissionId, state.plan.patch);
    if (!updated) {
      return res.status(404).json({ ok: false, status: 'not_found', error: 'Pilot request not found.' });
    }

    await appendPilotAccessEvent({
      submissionId: state.request.submissionId,
      eventType: state.plan.eventType,
      operatorId: 'operator_email_action',
      details: {
        source: 'operator_email_confirmation',
        action: state.plan.action,
        actionTokenId: state.payload.jti,
        changedFields: Object.keys(state.plan.patch),
        approvedScopes: state.plan.approvedScopes,
      },
    });

    const events = await getPilotAccessEvents(state.request.submissionId);
    return res.status(200).json({
      ok: true,
      status: 'processed',
      request: sanitizeRequestSummary(updated),
      events,
    });
  } catch (error: any) {
    console.error('[operator-approval-action] failure', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
    });
    return res.status(503).json({
      ok: false,
      status: 'unavailable',
      error: 'Approval action is temporarily unavailable.',
    });
  }
}
