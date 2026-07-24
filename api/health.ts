import type { VercelRequest, VercelResponse } from '@vercel/node';

type SupabaseKey =
  | { value: string; kind: 'opaque_secret' }
  | { value: string; kind: 'legacy_service_role_jwt' };

type SupabaseKeyStatus =
  | 'missing'
  | 'publishable_not_allowed'
  | 'backend_key'
  | 'unsupported';

export function decodeJwtPayload(key: string): Record<string, unknown> | null {
  const [, payload] = key.split('.');
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function classifyKey(key: string): SupabaseKey | null {
  if (key.startsWith('sb_publishable_')) return null;
  if (key.startsWith('sb_secret_')) return { value: key, kind: 'opaque_secret' };

  const payload = decodeJwtPayload(key);
  if (payload?.role === 'service_role') {
    return { value: key, kind: 'legacy_service_role_jwt' };
  }

  return null;
}

export function supabaseKeyStatus(rawKey: string | undefined): SupabaseKeyStatus {
  if (!rawKey) return 'missing';
  if (rawKey.startsWith('sb_publishable_')) return 'publishable_not_allowed';
  return classifyKey(rawKey) ? 'backend_key' : 'unsupported';
}

function configuredSupabaseKey() {
  return (
    process.env.SUPABASE_WRITE_KEY?.trim()
    ?? process.env.SUPABASE_SECRET_KEY?.trim()
    ?? process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

function resolveSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const rawKey = configuredSupabaseKey();

  if (!url || !rawKey) return null;

  const key = classifyKey(rawKey);
  if (!key) return null;

  return { url, key };
}

function supabaseHeaders(key: SupabaseKey): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: key.value,
    Accept: 'application/json',
  };

  if (key.kind === 'legacy_service_role_jwt') {
    headers.Authorization = `Bearer ${key.value}`;
  }

  return headers;
}

function isCronAuthorized(req: VercelRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) return false;

  return req.headers.authorization === `Bearer ${cronSecret}`;
}

async function runSupabaseKeepalive() {
  const config = resolveSupabaseConfig();
  if (!config) {
    return {
      ok: false,
      error: 'supabase_not_configured',
      hasSupabaseUrl: Boolean(process.env.SUPABASE_URL?.trim()),
      supabaseKeyStatus: supabaseKeyStatus(configuredSupabaseKey()),
    };
  }

  const startedAt = Date.now();
  const response = await fetch(
    `${config.url}/rest/v1/je_leads?select=id&limit=1`,
    {
      method: 'GET',
      headers: supabaseHeaders(config.key),
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    return {
      ok: false,
      error: 'supabase_keepalive_failed',
      status: response.status,
      elapsedMs: Date.now() - startedAt,
      response: body.slice(0, 300),
    };
  }

  const rows = await response.json().catch(() => []);

  return {
    ok: true,
    checkedAt: new Date().toISOString(),
    projectRef: new URL(config.url).hostname.split('.')[0],
    table: 'je_leads',
    rowSampleCount: Array.isArray(rows) ? rows.length : null,
    elapsedMs: Date.now() - startedAt,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  const cronAuthorized = isCronAuthorized(req);

  if (!cronAuthorized) {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      keepalive: 'skipped',
    });
  }

  try {
    const keepalive = await runSupabaseKeepalive();
    return res.status(keepalive.ok ? 200 : 502).json({
      status: keepalive.ok ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      keepalive,
    });
  } catch (err) {
    return res.status(502).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      keepalive: {
        ok: false,
        error: 'supabase_keepalive_network_error',
        message: String(err instanceof Error ? err.message : err).slice(0, 300),
      },
    });
  }
}
