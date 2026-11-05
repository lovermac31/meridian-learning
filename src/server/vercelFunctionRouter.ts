import express from 'express';
import type { IRouter, Request, Response, NextFunction } from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import generateImage from '../../api/generate-image.js';
import generatePricingAccessLink from '../../api/generate-pricing-access-link.js';
import getStarted from '../../api/get-started.js';
import health from '../../api/health.js';
import inspectNotionLead from '../../api/inspect-notion-lead.js';
import pricingRegistration from '../../api/pricing-registration.js';
import updateNotionSchema from '../../api/update-notion-je-leads-schema.js';
import verifyExternalPortalAccess from '../../api/verify-external-portal-access.js';
import verifyPricingAccess from '../../api/verify-pricing-access.js';
import pilotQueue from '../../api/internal/pilot-requests.js';
import pilotDetail from '../../api/internal/pilot-requests/[submissionId].js';
import pilotAction from '../../api/internal/pilot-requests/[submissionId]/[action].js';

type VercelHandler = (req: VercelRequest, res: VercelResponse) => unknown;

export const vercelFunctionRoutes: ReadonlyArray<{ path: string; handler: VercelHandler }> = [
  { path: '/api/health', handler: health },
  { path: '/api/verify-pricing-access', handler: verifyPricingAccess },
  { path: '/api/verify-external-portal-access', handler: verifyExternalPortalAccess },
  { path: '/api/generate-pricing-access-link', handler: generatePricingAccessLink },
  { path: '/api/internal/pilot-requests', handler: pilotQueue },
  { path: '/api/internal/pilot-requests/:submissionId', handler: pilotDetail },
  { path: '/api/internal/pilot-requests/:submissionId/:action', handler: pilotAction },
  { path: '/api/get-started', handler: getStarted },
  { path: '/api/pricing-registration', handler: pricingRegistration },
  { path: '/api/inspect-notion-lead', handler: inspectNotionLead },
  { path: '/api/update-notion-je-leads-schema', handler: updateNotionSchema },
  { path: '/api/generate-image', handler: generateImage },
];

function asVercelRequest(req: Request): VercelRequest {
  const query = { ...req.query, ...req.params } as VercelRequest['query'];
  Object.defineProperty(req, 'query', { configurable: true, value: query });
  return req as unknown as VercelRequest;
}

function asVercelResponse(res: Response): VercelResponse {
  return res as unknown as VercelResponse;
}

// Bodies are parsed only for the function that receives them (as @vercel/node does), so a request that a rewrite
// proxies to another app (e.g. a POST to /ai-speaking/api/...) keeps its raw body stream.
const parseJson = express.json({ limit: '1mb' });
const parseForm = express.urlencoded({ extended: false, limit: '1mb' });

export function mountVercelApiFunctions(app: IRouter) {
  for (const route of vercelFunctionRoutes) {
    app.all(route.path, parseJson, parseForm, (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(route.handler(asVercelRequest(req), asVercelResponse(res))).catch(next);
    });
  }
}
