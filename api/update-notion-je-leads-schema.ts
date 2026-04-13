import type { VercelRequest, VercelResponse } from '@vercel/node';
import { auditOperatorAction, requireOperatorAccess } from './_lib/operatorSecurity.js';

const NOTION_VERSION = '2022-06-28';
const NOTION_BASE = 'https://api.notion.com/v1';
const NOTION_TIMEOUT_MS = 6_000;

function notionHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const notionToken = process.env.NOTION_TOKEN?.trim();
  const dbId = process.env.NOTION_JE_LEADS_DB_ID?.trim();
  const access = requireOperatorAccess(req, res, {
    endpoint: '/api/update-notion-je-leads-schema',
    action: 'update_notion_je_leads_schema',
    scopedKeyEnv: 'NOTION_SCHEMA_OPERATOR_KEY',
    scopedIpAllowlistEnv: 'NOTION_SCHEMA_OPERATOR_IP_ALLOWLIST',
  });

  if (!access.ok) {
    return;
  }

  if (!notionToken || !dbId) {
    return res.status(503).json({ ok: false, error: 'Notion access is not configured.' });
  }

  auditOperatorAction(req, {
    endpoint: '/api/update-notion-je-leads-schema',
    action: 'update_notion_je_leads_schema',
    scopedKeyEnv: 'NOTION_SCHEMA_OPERATOR_KEY',
    scopedIpAllowlistEnv: 'NOTION_SCHEMA_OPERATOR_IP_ALLOWLIST',
  }, {
    authMode: access.authMode,
    propertyCount: 4,
  });

  const abortController = new AbortController();
  const abortTimer = setTimeout(() => abortController.abort(), NOTION_TIMEOUT_MS);

  try {
    const patchRes = await fetch(`${NOTION_BASE}/databases/${encodeURIComponent(dbId)}`, {
      method: 'PATCH',
      headers: notionHeaders(notionToken),
      signal: abortController.signal,
      body: JSON.stringify({
        properties: {
          'Organisation Size': { rich_text: {} },
          Timeline: { rich_text: {} },
          'Phone / WhatsApp': { rich_text: {} },
          'Preferred Contact Method': {
            select: {
              options: [
                { name: 'email' },
                { name: 'phone_whatsapp' },
                { name: 'either' },
              ],
            },
          },
        },
      }),
    });

    const body = await patchRes.json().catch(() => null);

    if (!patchRes.ok) {
      return res.status(patchRes.status).json({
        ok: false,
        error: 'Notion schema update failed.',
        code: body?.code ?? null,
        message: body?.message ?? null,
      });
    }

    const propertyTypes = Object.fromEntries(
      Object.entries(body?.properties ?? {}).map(([name, meta]: [string, any]) => [
        name,
        meta?.type ?? 'unknown',
      ]),
    );

    return res.status(200).json({
      ok: true,
      properties: {
        'Organisation Size': propertyTypes['Organisation Size'] ?? null,
        Timeline: propertyTypes['Timeline'] ?? null,
        'Phone / WhatsApp': propertyTypes['Phone / WhatsApp'] ?? null,
        'Preferred Contact Method': propertyTypes['Preferred Contact Method'] ?? null,
      },
    });
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return res.status(504).json({ ok: false, error: 'Notion request timed out.' });
    }
    return res.status(500).json({
      ok: false,
      error: 'Notion schema update failed.',
      message: error?.message || 'Unknown error',
    });
  } finally {
    clearTimeout(abortTimer);
  }
}
