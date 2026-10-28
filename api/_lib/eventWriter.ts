/**
 * Event Writer
 * ─────────────────────────────────────────────────────────────────────────────
 * Persists anonymous visitor events to Supabase via security-definer RPC record_je_event.
 *
 * Privacy rules:
 *   - Strictly anonymous: NO IP address, cookies, or user/session IDs are stored.
 *   - Raw fetch only — no external SDK dependency.
 *   - Never throws — network or DB errors are caught, warned, and returned as typed results.
 *   - Fail-open: allows API handlers to return 302/204 even if database is unreachable or table is unmigrated.
 */

export type ServerEventInput = {
  event: string;
  path?: string;
  product_id?: string;
  utm_source?: string;
  utm_content?: string;
  locale?: string;
};

export type EventWriteResult =
  | { ok: true }
  | { ok: false; reason: string };

type SupabaseWriteKey =
  | { value: string; kind: 'opaque_secret' }
  | { value: string; kind: 'legacy_service_role_jwt' };

type SupabaseConfig = {
  url: string;
  writeKey: SupabaseWriteKey;
};

function decodeJwtPayload(key: string): Record<string, unknown> | null {
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

function classifyWriteKey(key: string): SupabaseWriteKey | null {
  if (key.startsWith('sb_publishable_')) {
    console.error('[eventWriter] publishable key refused for server-side writes');
    return null;
  }
  if (key.startsWith('sb_secret_')) {
    return { value: key, kind: 'opaque_secret' };
  }
  const payload = decodeJwtPayload(key);
  if (payload?.role === 'service_role') {
    return { value: key, kind: 'legacy_service_role_jwt' };
  }
  return { value: key, kind: 'opaque_secret' };
}

function resolveConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_WRITE_KEY?.trim()
    ?? process.env.SUPABASE_SECRET_KEY?.trim()
    ?? process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    return null;
  }

  const writeKey = classifyWriteKey(key);
  if (!writeKey) return null;
  return { url, writeKey };
}

function supabaseHeaders(writeKey: SupabaseWriteKey): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: writeKey.value,
    'Content-Type': 'application/json',
  };
  if (writeKey.kind === 'legacy_service_role_jwt') {
    headers.Authorization = `Bearer ${writeKey.value}`;
  } else {
    headers.Authorization = `Bearer ${writeKey.value}`;
  }
  return headers;
}

export async function recordServerEvent(input: ServerEventInput): Promise<EventWriteResult> {
  const config = resolveConfig();
  if (!config) {
    console.warn('[eventWriter] Supabase not configured — event write skipped (fail-open)', {
      event: input.event,
      path: input.path,
    });
    return { ok: false, reason: 'not_configured' };
  }

  const payload = {
    p_event: input.event,
    p_path: input.path ?? null,
    p_product_id: input.product_id ?? null,
    p_utm_source: input.utm_source ?? null,
    p_utm_content: input.utm_content ?? null,
    p_locale: input.locale ?? null,
  };

  try {
    const res = await fetch(`${config.url}/rest/v1/rpc/record_je_event`, {
      method: 'POST',
      headers: supabaseHeaders(config.writeKey),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn('[eventWriter] Supabase RPC returned error (fail-open)', {
        status: res.status,
        error: errText,
        event: input.event,
      });
      return { ok: false, reason: `http_${res.status}` };
    }

    return { ok: true };
  } catch (err) {
    console.warn('[eventWriter] Network error recording event (fail-open)', {
      error: String(err),
      event: input.event,
    });
    return { ok: false, reason: 'network_error' };
  }
}
