import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { auditOperatorAction, requireOperatorAccess } from './_lib/operatorSecurity.js';

const PRICING_ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function base64urlEncode(input: string) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function sign(encodedPayload: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

function sanitizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function formatAccessDate(unixSeconds: number) {
  return new Date(unixSeconds * 1000).toISOString();
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const signingSecret = process.env.PRICING_ACCESS_SIGNING_SECRET?.trim();
  const access = requireOperatorAccess(req, res, {
    endpoint: '/api/generate-pricing-access-link',
    action: 'generate_pricing_access_link',
    scopedKeyEnv: 'PRICING_ACCESS_LINK_OPERATOR_KEY',
    scopedIpAllowlistEnv: 'PRICING_ACCESS_LINK_OPERATOR_IP_ALLOWLIST',
  });

  if (!signingSecret || signingSecret.length < 32) {
    return res.status(503).json({ ok: false, error: 'Signing secret is not configured.' });
  }

  if (!access.ok) {
    return;
  }

  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
  const approvedEmail = typeof body.approvedEmail === 'string' ? sanitizeEmail(body.approvedEmail) : '';
  const referenceId = typeof body.referenceId === 'string' ? body.referenceId.trim() : '';
  const baseUrl =
    typeof body.baseUrl === 'string' && body.baseUrl.trim()
      ? body.baseUrl.trim().replace(/\/+$/g, '')
      : 'https://jurassicenglish.com';

  if (!approvedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(approvedEmail)) {
    return res.status(400).json({ ok: false, error: 'A valid approved email is required.' });
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    email: approvedEmail,
    iat: now,
    exp: now + PRICING_ACCESS_TOKEN_TTL_SECONDS,
    ref: referenceId || undefined,
  };

  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload, signingSecret);
  const token = `${encodedPayload}.${signature}`;
  const url = `${baseUrl}/plans-pricing-access?token=${encodeURIComponent(token)}`;

  auditOperatorAction(req, {
    endpoint: '/api/generate-pricing-access-link',
    action: 'generate_pricing_access_link',
    scopedKeyEnv: 'PRICING_ACCESS_LINK_OPERATOR_KEY',
    scopedIpAllowlistEnv: 'PRICING_ACCESS_LINK_OPERATOR_IP_ALLOWLIST',
  }, {
    authMode: access.authMode,
    approvedEmailDomain: approvedEmail.split('@')[1] ?? null,
    referenceIdPresent: Boolean(referenceId),
    baseUrl,
  });

  return res.status(200).json({
    ok: true,
    approvedEmail,
    referenceId: referenceId || null,
    expiresAt: formatAccessDate(payload.exp),
    url,
  });
}
