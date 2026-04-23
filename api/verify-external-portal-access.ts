import { createHmac, timingSafeEqual } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  externalPortalResourceKeys,
  getExternalPortalResources,
  type ExternalPortalResourceKey,
} from '../src/lib/externalPortalResources.js';

type TokenPayload = {
  email: string;
  org: string;
  iat: number;
  exp: number;
  scope: ExternalPortalResourceKey[];
  ref?: string;
};

type VerificationResult =
  | {
      ok: true;
      status: 'valid';
      claims: {
        approvedEmail: string;
        organizationName: string;
        issuedAt: number;
        expiresAt: number;
        referenceId?: string;
        scope: ExternalPortalResourceKey[];
      };
    }
  | { ok: false; status: 'missing' | 'invalid' | 'expired' };

function getSigningSecret() {
  const secret = process.env.EXTERNAL_PORTAL_SIGNING_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error('EXTERNAL_PORTAL_SIGNING_SECRET is missing or too short.');
  }
  return secret;
}

function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, 'base64').toString('utf8');
}

function signPayload(encodedPayload: string, secret: string) {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

function isResourceScope(value: unknown): value is ExternalPortalResourceKey[] {
  return Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === 'string' &&
      (externalPortalResourceKeys as readonly string[]).includes(item));
}

function verifyExternalPortalToken(token?: string | null): VerificationResult {
  if (!token) {
    return { ok: false, status: 'missing' };
  }

  const [encodedPayload, receivedSignature] = token.split('.');
  if (!encodedPayload || !receivedSignature) {
    return { ok: false, status: 'invalid' };
  }

  const secret = getSigningSecret();
  const expectedSignature = signPayload(encodedPayload, secret);
  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(receivedSignature);

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    return { ok: false, status: 'invalid' };
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(encodedPayload)) as TokenPayload;
    if (
      !parsed ||
      typeof parsed.email !== 'string' ||
      typeof parsed.org !== 'string' ||
      typeof parsed.iat !== 'number' ||
      typeof parsed.exp !== 'number' ||
      !isResourceScope(parsed.scope)
    ) {
      return { ok: false, status: 'invalid' };
    }

    const now = Math.floor(Date.now() / 1000);
    if (parsed.exp <= now) {
      return { ok: false, status: 'expired' };
    }

    return {
      ok: true,
      status: 'valid',
      claims: {
        approvedEmail: parsed.email,
        organizationName: parsed.org,
        issuedAt: parsed.iat,
        expiresAt: parsed.exp,
        referenceId: parsed.ref,
        scope: parsed.scope,
      },
    };
  } catch {
    return { ok: false, status: 'invalid' };
  }
}

function maskEmail(email: string) {
  const [localPart, domainPart] = email.split('@');
  if (!localPart || !domainPart) return 'Approved user';
  return `${localPart.slice(0, 2)}${'*'.repeat(Math.max(localPart.length - 2, 2))}@${domainPart}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, status: 'invalid', error: 'Method not allowed.' });
  }

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  try {
    const token = typeof req.query.token === 'string' ? req.query.token : null;
    const result = verifyExternalPortalToken(token);

    if (!result.ok) {
      return res.status(200).json({
        ok: false,
        status: result.status,
      });
    }

    return res.status(200).json({
      ok: true,
      status: 'valid',
      approvedUser: maskEmail(result.claims.approvedEmail),
      organizationName: result.claims.organizationName,
      referenceId: result.claims.referenceId || null,
      expiresAt: result.claims.expiresAt,
      resources: getExternalPortalResources(result.claims.scope),
    });
  } catch (error: any) {
    console.error('[verify-external-portal-access] verification failure', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
    });

    return res.status(503).json({
      ok: false,
      status: 'invalid',
      error: 'External portal verification is temporarily unavailable.',
    });
  }
}
