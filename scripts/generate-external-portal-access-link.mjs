import { createHmac } from 'node:crypto';
import { externalPortalResourceKeys } from '../src/lib/externalPortalResources.ts';

const DEFAULT_MAX_DAYS = 30;
const OVERRIDE_MAX_DAYS = 90;

function readArg(name, fallback = '') {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] ?? fallback : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function requireArg(name) {
  const value = readArg(name).trim();
  if (!value) {
    console.error(`Missing required --${name}`);
    process.exit(1);
  }
  return value;
}

function signPayload(encodedPayload, secret) {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

const secret = process.env.EXTERNAL_PORTAL_SIGNING_SECRET?.trim();
if (!secret || secret.length < 32) {
  console.error('EXTERNAL_PORTAL_SIGNING_SECRET must be set and at least 32 characters.');
  process.exit(1);
}

const email = requireArg('email').toLowerCase();
const org = requireArg('org');
const ref = readArg('ref') || undefined;
const baseUrl = readArg('base-url', 'https://jurassicenglish.com').replace(/\/$/, '');
const days = Number(readArg('days', '14'));
const allowOver30Days = hasFlag('allow-over-30-days');
const overrideReason = readArg('override-reason').trim();
const scopeInput = readArg('scope', externalPortalResourceKeys.join(','));
const scope = scopeInput.split(',').map((item) => item.trim()).filter(Boolean);

if (!Number.isFinite(days) || days <= 0 || days > OVERRIDE_MAX_DAYS) {
  console.error(`--days must be a number from 1 to ${OVERRIDE_MAX_DAYS}.`);
  process.exit(1);
}

if (days > DEFAULT_MAX_DAYS && (!allowOver30Days || overrideReason.length < 12)) {
  console.error(
    `Links over ${DEFAULT_MAX_DAYS} days require --allow-over-30-days and --override-reason with a clear reason.`,
  );
  process.exit(1);
}

const invalidScope = scope.filter((item) => !externalPortalResourceKeys.includes(item));
if (invalidScope.length > 0 || scope.length === 0) {
  console.error(`Invalid --scope. Allowed values: ${externalPortalResourceKeys.join(', ')}`);
  process.exit(1);
}

const now = Math.floor(Date.now() / 1000);
const payload = {
  email,
  org,
  iat: now,
  exp: now + days * 24 * 60 * 60,
  scope,
  ...(ref ? { ref } : {}),
};

const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
const signature = signPayload(encodedPayload, secret);
const token = `${encodedPayload}.${signature}`;

console.log(JSON.stringify({
  url: `${baseUrl}/external/pilot?token=${encodeURIComponent(token)}`,
  expiresAt: new Date(payload.exp * 1000).toISOString(),
  scope,
  over30DayOverride: days > DEFAULT_MAX_DAYS,
  overrideReason: days > DEFAULT_MAX_DAYS ? overrideReason : undefined,
}, null, 2));
