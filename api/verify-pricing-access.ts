import { createHmac, timingSafeEqual } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

type TokenPayload = {
  email: string;
  iat: number;
  exp: number;
  ref?: string;
};

type VerificationResult =
  | {
      ok: true;
      status: 'valid';
      claims: {
        approvedEmail: string;
        issuedAt: number;
        expiresAt: number;
        referenceId?: string;
      };
    }
  | { ok: false; status: 'missing' | 'invalid' | 'expired' };

function getSigningSecret() {
  const secret = process.env.PRICING_ACCESS_SIGNING_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error('PRICING_ACCESS_SIGNING_SECRET is missing or too short.');
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

function verifyPricingAccessToken(token?: string | null): VerificationResult {
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
      typeof parsed.iat !== 'number' ||
      typeof parsed.exp !== 'number'
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
        issuedAt: parsed.iat,
        expiresAt: parsed.exp,
        referenceId: parsed.ref,
      },
    };
  } catch {
    return { ok: false, status: 'invalid' };
  }
}

function maskEmail(email: string) {
  const [localPart, domainPart] = email.split('@');
  if (!localPart || !domainPart) return 'Approved lead';
  const visible = localPart.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(localPart.length - 2, 2))}@${domainPart}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, status: 'invalid', error: 'Method not allowed.' });
  }

  try {
    const token = typeof req.query.token === 'string' ? req.query.token : null;
    const result = verifyPricingAccessToken(token);

    if (!result.ok) {
      return res.status(200).json({
        ok: false,
        status: result.status,
      });
    }

    return res.status(200).json({
      ok: true,
      status: 'valid',
      approvedLead: maskEmail(result.claims.approvedEmail),
      referenceId: result.claims.referenceId || null,
      expiresAt: result.claims.expiresAt,
    });
  } catch (error: any) {
    console.error('[verify-pricing-access] verification failure', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
    });

    return res.status(503).json({
      ok: false,
      status: 'invalid',
      error: 'Access verification is temporarily unavailable.',
    });
  }
}
