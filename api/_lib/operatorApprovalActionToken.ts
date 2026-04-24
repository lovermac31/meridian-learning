import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

export const operatorApprovalActions = [
  'mark_under_review',
  'approve_basic_pack',
  'consultation_required',
  'denied',
] as const;

export type OperatorApprovalAction = (typeof operatorApprovalActions)[number];

type OperatorApprovalTokenPayload = {
  v: 1;
  sub: string;
  action: OperatorApprovalAction;
  iat: number;
  exp: number;
  jti: string;
  scope: 'pilot_access_request_review';
};

export type VerifiedOperatorApprovalActionToken = OperatorApprovalTokenPayload;

const DEFAULT_ACTION_TOKEN_TTL_HOURS = 72;
const DEFAULT_BASE_URL = 'https://jurassicenglish.com';

function getSigningSecret() {
  const secret =
    process.env.OPERATOR_ACTION_SIGNING_SECRET?.trim() ||
    process.env.EXTERNAL_PORTAL_SIGNING_SECRET?.trim();

  if (!secret || secret.length < 32) {
    throw new Error('OPERATOR_ACTION_SIGNING_SECRET or EXTERNAL_PORTAL_SIGNING_SECRET is missing or too short.');
  }

  return secret;
}

function signPayload(encodedPayload: string, secret: string) {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, 'base64').toString('utf8');
}

function normalizeBaseUrl(baseUrl?: string | null) {
  return (
    baseUrl?.trim() ||
    process.env.PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    DEFAULT_BASE_URL
  ).replace(/\/+$/g, '');
}

function isOperatorApprovalAction(value: unknown): value is OperatorApprovalAction {
  return typeof value === 'string' &&
    (operatorApprovalActions as readonly string[]).includes(value);
}

function isPayload(value: unknown): value is OperatorApprovalTokenPayload {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const payload = value as Partial<OperatorApprovalTokenPayload>;
  return payload.v === 1 &&
    typeof payload.sub === 'string' &&
    payload.sub.trim().length > 0 &&
    isOperatorApprovalAction(payload.action) &&
    typeof payload.iat === 'number' &&
    typeof payload.exp === 'number' &&
    typeof payload.jti === 'string' &&
    payload.jti.trim().length >= 16 &&
    payload.scope === 'pilot_access_request_review';
}

export function createOperatorApprovalActionToken({
  submissionId,
  action,
  ttlHours = DEFAULT_ACTION_TOKEN_TTL_HOURS,
  baseUrl,
}: {
  submissionId: string;
  action: OperatorApprovalAction;
  ttlHours?: number;
  baseUrl?: string | null;
}) {
  const now = Math.floor(Date.now() / 1000);
  const ttlSeconds = Math.min(Math.max(Math.floor(ttlHours), 1), 168) * 60 * 60;
  const payload: OperatorApprovalTokenPayload = {
    v: 1,
    sub: submissionId.trim(),
    action,
    iat: now,
    exp: now + ttlSeconds,
    jti: randomUUID(),
    scope: 'pilot_access_request_review',
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = signPayload(encodedPayload, getSigningSecret());
  const token = `${encodedPayload}.${signature}`;

  return {
    token,
    url: `${normalizeBaseUrl(baseUrl)}/internal/approval-action?token=${encodeURIComponent(token)}`,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  };
}

export function verifyOperatorApprovalActionToken(token?: string | null):
  | { ok: true; payload: VerifiedOperatorApprovalActionToken }
  | { ok: false; status: 'missing' | 'invalid' | 'expired' } {
  if (!token) return { ok: false, status: 'missing' };

  const [encodedPayload, receivedSignature] = token.split('.');
  if (!encodedPayload || !receivedSignature) return { ok: false, status: 'invalid' };

  const expectedSignature = signPayload(encodedPayload, getSigningSecret());
  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(receivedSignature);

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    return { ok: false, status: 'invalid' };
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(encodedPayload));
    if (!isPayload(parsed)) return { ok: false, status: 'invalid' };

    const now = Math.floor(Date.now() / 1000);
    if (parsed.exp <= now) return { ok: false, status: 'expired' };

    return { ok: true, payload: parsed };
  } catch {
    return { ok: false, status: 'invalid' };
  }
}
