import { createHmac } from 'node:crypto';
import type { PilotApprovedScope } from '../../src/lib/internalPilotPortal.js';

const DEFAULT_EXTERNAL_PORTAL_BASE_URL = 'https://jurassicenglish.com';
export const EXTERNAL_PORTAL_DEFAULT_MAX_DAYS = 30;
export const EXTERNAL_PORTAL_OVERRIDE_MAX_DAYS = 90;

type ExternalPortalTokenInput = {
  approvedEmail: string;
  organizationName: string;
  scopes: PilotApprovedScope[];
  referenceId?: string | null;
  days: number;
  baseUrl?: string | null;
};

function getSigningSecret() {
  const secret = process.env.EXTERNAL_PORTAL_SIGNING_SECRET?.trim();

  if (!secret || secret.length < 32) {
    throw new Error('EXTERNAL_PORTAL_SIGNING_SECRET is missing or too short.');
  }

  return secret;
}

function signPayload(encodedPayload: string, secret: string) {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

function normalizeBaseUrl(baseUrl?: string | null) {
  return (baseUrl?.trim() || DEFAULT_EXTERNAL_PORTAL_BASE_URL).replace(/\/+$/g, '');
}

export function createExternalPortalToken({
  approvedEmail,
  organizationName,
  scopes,
  referenceId,
  days,
  baseUrl,
}: ExternalPortalTokenInput) {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + days * 24 * 60 * 60;
  const payload = {
    email: approvedEmail.trim().toLowerCase(),
    org: organizationName.trim(),
    iat: now,
    exp: expiresAt,
    scope: scopes,
    ...(referenceId?.trim() ? { ref: referenceId.trim() } : {}),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = signPayload(encodedPayload, getSigningSecret());
  const token = `${encodedPayload}.${signature}`;

  return {
    token,
    url: `${normalizeBaseUrl(baseUrl)}/external/pilot?token=${encodeURIComponent(token)}`,
    issuedAt: new Date(now * 1000).toISOString(),
    expiresAt: new Date(expiresAt * 1000).toISOString(),
  };
}
