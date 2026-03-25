import crypto from 'crypto';

const PRICING_ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSigningSecret() {
  const secret = process.env.PRICING_ACCESS_SIGNING_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error('PRICING_ACCESS_SIGNING_SECRET is missing or too short.');
  }
  return secret;
}

function base64urlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function sign(encodedPayload, secret) {
  return crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

function sanitizeEmail(email) {
  return email.trim().toLowerCase();
}

function generatePricingAccessToken({ approvedEmail, referenceId }) {
  const email = sanitizeEmail(approvedEmail);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('A valid approved email is required.');
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    email,
    iat: now,
    exp: now + PRICING_ACCESS_TOKEN_TTL_SECONDS,
    ref: referenceId?.trim() || undefined,
  };

  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload, getSigningSecret());
  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt: payload.exp,
  };
}

function buildPricingAccessUrl({ baseUrl, approvedEmail, referenceId }) {
  const cleanBaseUrl = (baseUrl || 'https://jurassicenglish.com').replace(/\/+$/g, '');
  const { token, expiresAt } = generatePricingAccessToken({
    approvedEmail,
    referenceId,
  });
  return {
    url: `${cleanBaseUrl}/plans-pricing-access?token=${encodeURIComponent(token)}`,
    expiresAt,
  };
}

function formatAccessDate(unixSeconds) {
  return new Date(unixSeconds * 1000).toISOString();
}

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith('--')) continue;
    const key = item.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : 'true';
    result[key] = value;
    if (value !== 'true') i += 1;
  }
  return result;
}

const args = parseArgs(process.argv.slice(2));
const approvedEmail = args.email || args.approvedEmail;
const referenceId = args.referenceId || args.ref;
const baseUrl = args.baseUrl || 'https://jurassicenglish.com';

if (!approvedEmail) {
  console.error('Usage: node scripts/generate-pricing-access-link.mjs --email approved@example.com [--referenceId lead_123] [--baseUrl https://jurassicenglish.com]');
  process.exit(1);
}

try {
  const { url, expiresAt } = buildPricingAccessUrl({
    baseUrl,
    approvedEmail,
    referenceId,
  });

  console.log('Plans & Pricing secure access link');
  console.log(`Approved Email: ${approvedEmail}`);
  console.log(`Reference ID: ${referenceId || 'Not provided'}`);
  console.log(`Expires At: ${formatAccessDate(expiresAt)}`);
  console.log('');
  console.log(url);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Failed to generate access link.');
  process.exit(1);
}
