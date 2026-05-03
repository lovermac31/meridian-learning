#!/usr/bin/env node
import 'dotenv/config';

function decodeJwtPayload(key) {
  const [, payload] = key.split('.');
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

function classifyKey(key) {
  if (key.startsWith('sb_publishable_')) return null;
  if (key.startsWith('sb_secret_')) return { value: key, kind: 'opaque_secret' };

  const payload = decodeJwtPayload(key);
  if (payload?.role === 'service_role') {
    return { value: key, kind: 'legacy_service_role_jwt' };
  }

  return null;
}

function resolveSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const rawKey =
    process.env.SUPABASE_WRITE_KEY?.trim()
    ?? process.env.SUPABASE_SECRET_KEY?.trim()
    ?? process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !rawKey) {
    throw new Error(
      `Missing Supabase env. hasUrl=${Boolean(url)} hasKey=${Boolean(rawKey)}`,
    );
  }

  const key = classifyKey(rawKey);
  if (!key) {
    throw new Error('Supabase key is not a backend write/service key.');
  }

  return { url, key };
}

function headersFor(key) {
  const headers = {
    apikey: key.value,
    Accept: 'application/json',
  };

  if (key.kind === 'legacy_service_role_jwt') {
    headers.Authorization = `Bearer ${key.value}`;
  }

  return headers;
}

const startedAt = Date.now();
const config = resolveSupabaseConfig();
const projectRef = new URL(config.url).hostname.split('.')[0];

const response = await fetch(
  `${config.url}/rest/v1/je_leads?select=id&limit=1`,
  {
    method: 'GET',
    headers: headersFor(config.key),
  },
);

if (!response.ok) {
  const body = await response.text().catch(() => '');
  console.error(
    JSON.stringify({
      ok: false,
      projectRef,
      status: response.status,
      elapsedMs: Date.now() - startedAt,
      response: body.slice(0, 300),
    }),
  );
  process.exit(1);
}

const rows = await response.json().catch(() => []);
console.log(
  JSON.stringify({
    ok: true,
    projectRef,
    table: 'je_leads',
    rowSampleCount: Array.isArray(rows) ? rows.length : null,
    checkedAt: new Date().toISOString(),
    elapsedMs: Date.now() - startedAt,
  }),
);
