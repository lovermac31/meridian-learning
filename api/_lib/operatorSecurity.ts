import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getClientIp, getUserAgent } from './requestSecurity.js';

type OperatorAuthConfig = {
  endpoint: string;
  action: string;
  scopedKeyEnv: string;
  scopedIpAllowlistEnv?: string;
};

type OperatorAuthSuccess = {
  ok: true;
  clientIp: string;
  userAgent: string;
  authMode: 'scoped' | 'legacy_fallback';
};

type OperatorAuthFailure = {
  ok: false;
};

const LEGACY_OPERATOR_KEY_ENV = 'PRICING_ACCESS_OPERATOR_KEY';
const SHARED_OPERATOR_IP_ALLOWLIST_ENV = 'OPERATOR_IP_ALLOWLIST';

function readBearerToken(req: VercelRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice('Bearer '.length).trim();
}

function normalizeAllowlist(rawValue?: string | null) {
  if (!rawValue) {
    return [];
  }

  return rawValue
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function getConfiguredSecret(scopedKeyEnv: string) {
  const scopedSecret = process.env[scopedKeyEnv]?.trim() || null;
  const legacySecret = process.env[LEGACY_OPERATOR_KEY_ENV]?.trim() || null;

  if (scopedSecret && scopedSecret.length >= 24) {
    return {
      secret: scopedSecret,
      authMode: 'scoped' as const,
    };
  }

  if (legacySecret && legacySecret.length >= 24) {
    return {
      secret: legacySecret,
      authMode: 'legacy_fallback' as const,
    };
  }

  return null;
}

function isIpAllowed(clientIp: string, config: OperatorAuthConfig) {
  const scopedAllowlist = normalizeAllowlist(
    config.scopedIpAllowlistEnv ? process.env[config.scopedIpAllowlistEnv] : null,
  );
  const sharedAllowlist = normalizeAllowlist(process.env[SHARED_OPERATOR_IP_ALLOWLIST_ENV]);
  const effectiveAllowlist = scopedAllowlist.length > 0 ? scopedAllowlist : sharedAllowlist;

  if (effectiveAllowlist.length === 0) {
    return true;
  }

  return effectiveAllowlist.includes(clientIp);
}

export function auditOperatorAction(
  req: VercelRequest,
  config: OperatorAuthConfig,
  details: Record<string, unknown>,
) {
  console.info('[operator] action', {
    endpoint: config.endpoint,
    action: config.action,
    clientIp: getClientIp(req),
    userAgent: getUserAgent(req),
    ...details,
  });
}

export function requireOperatorAccess(
  req: VercelRequest,
  res: VercelResponse,
  config: OperatorAuthConfig,
): OperatorAuthSuccess | OperatorAuthFailure {
  const presentedKey = readBearerToken(req);
  const configuredSecret = getConfiguredSecret(config.scopedKeyEnv);
  const clientIp = getClientIp(req);
  const userAgent = getUserAgent(req);

  if (!configuredSecret) {
    console.error('[operator] access misconfigured', {
      endpoint: config.endpoint,
      action: config.action,
      scopedKeyEnv: config.scopedKeyEnv,
      legacyKeyEnv: LEGACY_OPERATOR_KEY_ENV,
    });
    res.status(503).json({ ok: false, error: 'Operator access is not configured.' });
    return { ok: false };
  }

  if (!isIpAllowed(clientIp, config)) {
    console.warn('[operator] ip denied', {
      endpoint: config.endpoint,
      action: config.action,
      clientIp,
      userAgent,
      authMode: configuredSecret.authMode,
    });
    res.status(403).json({ ok: false, error: 'Forbidden.' });
    return { ok: false };
  }

  if (!presentedKey || !safeEqual(presentedKey, configuredSecret.secret)) {
    console.warn('[operator] unauthorized', {
      endpoint: config.endpoint,
      action: config.action,
      clientIp,
      userAgent,
      authMode: configuredSecret.authMode,
      tokenPresent: Boolean(presentedKey),
    });
    res.status(401).json({ ok: false, error: 'Unauthorized.' });
    return { ok: false };
  }

  return {
    ok: true,
    clientIp,
    userAgent,
    authMode: configuredSecret.authMode,
  };
}
