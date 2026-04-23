import type { VercelRequest, VercelResponse } from '@vercel/node';
import { auditOperatorAction, requireOperatorAccess } from './operatorSecurity.js';
import {
  appendPilotAccessEvent,
  getPilotAccessEvents,
  getPilotAccessRequest,
  listPilotAccessRequests,
  recordTokenIssuance,
  updatePilotAccessRequest,
} from './internalPilotStore.js';
import {
  EXTERNAL_PORTAL_DEFAULT_MAX_DAYS,
  EXTERNAL_PORTAL_OVERRIDE_MAX_DAYS,
  createExternalPortalToken,
} from './externalPortalToken.js';
import {
  isPilotAccessEventType,
  isPilotApprovedScope,
  isPilotConsultationStatus,
  isPilotFulfillmentStatus,
  isPilotOperatorStatus,
  type PilotApprovedScope,
} from '../../src/lib/internalPilotPortal.js';

const authConfig = {
  endpoint: '/api/internal/pilot-requests',
  action: 'manage_internal_pilot_portal',
  scopedKeyEnv: 'INTERNAL_PORTAL_OPERATOR_KEY',
  scopedIpAllowlistEnv: 'INTERNAL_PORTAL_OPERATOR_IP_ALLOWLIST',
};

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function prepareInternalResponse(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  return requireOperatorAccess(req, res, authConfig);
}

function sanitizeNullableText(value: unknown) {
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || null;
}

function parseApprovedScopes(value: unknown): PilotApprovedScope[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return [];
  return value.filter(isPilotApprovedScope);
}

function parseScopes(value: unknown): PilotApprovedScope[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isPilotApprovedScope);
}

function normalizeReference(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback;
  return value.trim() || fallback;
}

function sanitizeDetails(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

export async function handlePilotRequestsQueue(req: VercelRequest, res: VercelResponse) {
  const access = prepareInternalResponse(req, res);
  if (!access.ok) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  try {
    const requests = await listPilotAccessRequests({
      search: queryValue(req.query.search),
      operatorStatus: queryValue(req.query.operatorStatus),
      consultationStatus: queryValue(req.query.consultationStatus),
      fulfillmentStatus: queryValue(req.query.fulfillmentStatus),
      accessRequest: queryValue(req.query.accessRequest),
      limit: Number(queryValue(req.query.limit) ?? 50),
    });

    return res.status(200).json({ ok: true, requests });
  } catch (error: any) {
    console.error('[internal-pilot] queue failure', {
      message: error?.message || 'Unknown error',
      authMode: access.authMode,
    });
    return res.status(503).json({
      ok: false,
      error: 'Internal pilot request operation is temporarily unavailable.',
    });
  }
}

export async function handlePilotRequestDetail(req: VercelRequest, res: VercelResponse) {
  const access = prepareInternalResponse(req, res);
  if (!access.ok) return;

  const submissionId = queryValue(req.query.submissionId);
  if (!submissionId) {
    return res.status(400).json({ ok: false, error: 'Missing submission id.' });
  }

  try {
    if (req.method === 'GET') {
      const request = await getPilotAccessRequest(submissionId);
      if (!request) {
        return res.status(404).json({ ok: false, error: 'Pilot request not found.' });
      }

      const events = await getPilotAccessEvents(submissionId);
      return res.status(200).json({ ok: true, request, events });
    }

    if (req.method !== 'PATCH') {
      return res.status(405).json({ ok: false, error: 'Method not allowed.' });
    }

    const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
    const patch: Parameters<typeof updatePilotAccessRequest>[1] = {};

    if (body.operatorStatus !== undefined) {
      if (!isPilotOperatorStatus(body.operatorStatus)) {
        return res.status(400).json({ ok: false, error: 'Invalid operator status.' });
      }
      patch.operatorStatus = body.operatorStatus;
    }

    if (body.consultationStatus !== undefined) {
      if (!isPilotConsultationStatus(body.consultationStatus)) {
        return res.status(400).json({ ok: false, error: 'Invalid consultation status.' });
      }
      patch.consultationStatus = body.consultationStatus;
    }

    const approvedScopes = parseApprovedScopes(body.approvedScopes);
    if (approvedScopes !== undefined) {
      if (!Array.isArray(body.approvedScopes) || approvedScopes.length !== body.approvedScopes.length) {
        return res.status(400).json({ ok: false, error: 'Invalid approved scope.' });
      }
      patch.approvedScopes = approvedScopes;
    }

    if (body.fulfillmentStatus !== undefined) {
      if (!isPilotFulfillmentStatus(body.fulfillmentStatus)) {
        return res.status(400).json({ ok: false, error: 'Invalid fulfillment status.' });
      }
      patch.fulfillmentStatus = body.fulfillmentStatus;
    }

    const assignedOperator = sanitizeNullableText(body.assignedOperator);
    if (assignedOperator !== undefined) patch.assignedOperator = assignedOperator;

    const operatorNotes = sanitizeNullableText(body.operatorNotes);
    if (operatorNotes !== undefined) patch.operatorNotes = operatorNotes;

    const updated = await updatePilotAccessRequest(submissionId, patch);
    if (!updated) {
      return res.status(404).json({ ok: false, error: 'Pilot request not found.' });
    }

    await appendPilotAccessEvent({
      submissionId,
      eventType: body.operatorNotes !== undefined ? 'operator_note_added' : 'status_changed',
      operatorId: updated.assignedOperator,
      details: { changedFields: Object.keys(patch) },
    });

    auditOperatorAction(req, authConfig, {
      authMode: access.authMode,
      submissionId,
      changedFields: Object.keys(patch),
    });

    const events = await getPilotAccessEvents(submissionId);
    return res.status(200).json({ ok: true, request: updated, events });
  } catch (error: any) {
    console.error('[internal-pilot] detail failure', {
      submissionId,
      message: error?.message || 'Unknown error',
      authMode: access.authMode,
    });
    return res.status(503).json({
      ok: false,
      error: 'Internal pilot request operation is temporarily unavailable.',
    });
  }
}

export async function handlePilotRequestAction(req: VercelRequest, res: VercelResponse) {
  const access = prepareInternalResponse(req, res);
  if (!access.ok) return;

  const submissionId = queryValue(req.query.submissionId);
  const action = queryValue(req.query.action);
  if (!submissionId || !action) {
    return res.status(400).json({ ok: false, error: 'Missing request action.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  try {
    const request = await getPilotAccessRequest(submissionId);
    if (!request) {
      return res.status(404).json({ ok: false, error: 'Pilot request not found.' });
    }

    if (action === 'issue-token') {
      const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
      const requestedScopes = parseScopes(body.scopes);

      if (!Array.isArray(body.scopes) || requestedScopes.length === 0 || requestedScopes.length !== body.scopes.length) {
        return res.status(400).json({ ok: false, error: 'At least one valid approved scope is required.' });
      }

      const unapprovedScopes = requestedScopes.filter((scope) => !request.approvedScopes.includes(scope));
      if (unapprovedScopes.length > 0) {
        return res.status(400).json({
          ok: false,
          error: 'Token scopes must already be approved on the request.',
          unapprovedScopes,
        });
      }

      const days = Number(body.days ?? 14);
      const allowOver30Days = body.allowOver30Days === true;
      const overrideReason = typeof body.overrideReason === 'string' ? body.overrideReason.trim() : '';

      if (!Number.isFinite(days) || days <= 0 || days > EXTERNAL_PORTAL_OVERRIDE_MAX_DAYS) {
        return res.status(400).json({
          ok: false,
          error: `Expiry must be between 1 and ${EXTERNAL_PORTAL_OVERRIDE_MAX_DAYS} days.`,
        });
      }

      if (days > EXTERNAL_PORTAL_DEFAULT_MAX_DAYS && (!allowOver30Days || overrideReason.length < 12)) {
        return res.status(400).json({
          ok: false,
          error: 'Expiry over 30 days requires explicit override and reason.',
        });
      }

      const referenceId = normalizeReference(body.referenceId, submissionId);
      const token = createExternalPortalToken({
        approvedEmail: request.workEmail,
        organizationName: request.organisationName,
        scopes: requestedScopes,
        referenceId,
        days,
        baseUrl: typeof body.baseUrl === 'string' ? body.baseUrl : undefined,
      });

      const updated = await recordTokenIssuance({
        submissionId,
        issuedAt: token.issuedAt,
        expiresAt: token.expiresAt,
        scopes: requestedScopes,
        referenceId,
      });

      await appendPilotAccessEvent({
        submissionId,
        eventType: request.lastTokenIssuedAt ? 'token_regenerated' : 'token_issued',
        operatorId: request.assignedOperator,
        details: {
          scopes: requestedScopes,
          referenceId,
          expiresAt: token.expiresAt,
          days,
          over30DayOverride: days > EXTERNAL_PORTAL_DEFAULT_MAX_DAYS,
          overrideReason: days > EXTERNAL_PORTAL_DEFAULT_MAX_DAYS ? overrideReason : undefined,
        },
      });

      auditOperatorAction(req, authConfig, {
        authMode: access.authMode,
        submissionId,
        scopeCount: requestedScopes.length,
        days,
        over30DayOverride: days > EXTERNAL_PORTAL_DEFAULT_MAX_DAYS,
      });

      const events = await getPilotAccessEvents(submissionId);
      return res.status(200).json({
        ok: true,
        request: updated,
        events,
        tokenUrl: token.url,
        expiresAt: token.expiresAt,
        referenceId,
      });
    }

    if (action === 'log-action') {
      const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
      if (!isPilotAccessEventType(body.eventType)) {
        return res.status(400).json({ ok: false, error: 'Invalid pilot access event type.' });
      }

      const event = await appendPilotAccessEvent({
        submissionId,
        eventType: body.eventType,
        operatorId: typeof body.operatorId === 'string' ? body.operatorId : request.assignedOperator,
        details: sanitizeDetails(body.details),
      });

      auditOperatorAction(req, authConfig, {
        authMode: access.authMode,
        submissionId,
        eventType: body.eventType,
      });

      const events = await getPilotAccessEvents(submissionId);
      return res.status(200).json({ ok: true, event, events });
    }

    return res.status(404).json({ ok: false, error: 'Pilot request action not found.' });
  } catch (error: any) {
    console.error('[internal-pilot] action failure', {
      submissionId,
      action,
      message: error?.message || 'Unknown error',
      authMode: access.authMode,
    });
    return res.status(503).json({
      ok: false,
      error: 'Internal pilot request operation is temporarily unavailable.',
    });
  }
}
