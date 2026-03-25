import crypto from 'crypto';

export const PRICING_ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

type TokenPayload = {
  email: string;
  iat: number;
  exp: number;
  ref?: string;
};

export type PricingAccessTokenClaims = {
  approvedEmail: string;
  issuedAt: number;
  expiresAt: number;
  referenceId?: string;
};

export type PricingAccessVerificationResult =
  | { ok: true; status: 'valid'; claims: PricingAccessTokenClaims }
  | { ok: false; status: 'missing' | 'invalid' | 'expired' };

function getSigningSecret() {
  const secret = process.env.PRICING_ACCESS_SIGNING_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error('PRICING_ACCESS_SIGNING_SECRET is missing or too short.');
  }
  return secret;
}

function base64urlEncode(input: string | Buffer) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64urlDecode(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, 'base64').toString('utf8');
}

function sign(encodedPayload: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

function sanitizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function generatePricingAccessToken(input: {
  approvedEmail: string;
  referenceId?: string;
  now?: number;
}) {
  const approvedEmail = sanitizeEmail(input.approvedEmail);
  if (!approvedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(approvedEmail)) {
    throw new Error('A valid approved email is required.');
  }

  const now = input.now ?? Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    email: approvedEmail,
    iat: now,
    exp: now + PRICING_ACCESS_TOKEN_TTL_SECONDS,
    ref: input.referenceId?.trim() || undefined,
  };

  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload, getSigningSecret());

  return `${encodedPayload}.${signature}`;
}

export function verifyPricingAccessToken(token?: string | null): PricingAccessVerificationResult {
  if (!token) {
    return { ok: false, status: 'missing' };
  }

  const [encodedPayload, receivedSignature] = token.split('.');
  if (!encodedPayload || !receivedSignature) {
    return { ok: false, status: 'invalid' };
  }

  let expectedSignature: string;
  try {
    expectedSignature = sign(encodedPayload, getSigningSecret());
  } catch {
    return { ok: false, status: 'invalid' };
  }

  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(receivedSignature);
  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    return { ok: false, status: 'invalid' };
  }

  try {
    const parsed = JSON.parse(base64urlDecode(encodedPayload)) as TokenPayload;
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

export function buildPricingAccessUrl(input: {
  baseUrl?: string;
  approvedEmail: string;
  referenceId?: string;
}) {
  const baseUrl = (input.baseUrl || 'https://jurassicenglish.com').replace(/\/+$/g, '');
  const token = generatePricingAccessToken({
    approvedEmail: input.approvedEmail,
    referenceId: input.referenceId,
  });
  return `${baseUrl}/plans-pricing-access?token=${encodeURIComponent(token)}`;
}

export function formatAccessDate(unixSeconds: number) {
  return new Date(unixSeconds * 1000).toISOString();
}
