import type { VercelRequest, VercelResponse } from '@vercel/node';
import { auditOperatorAction, requireOperatorAccess } from './_lib/operatorSecurity.js';

const NOTION_VERSION = '2022-06-28';
const NOTION_BASE = 'https://api.notion.com/v1';
const NOTION_TIMEOUT_MS = 4_000;

function notionHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

function getTitle(properties: Record<string, any>, name: string) {
  return properties?.[name]?.title?.map((x: any) => x.plain_text).join('') || null;
}

function getText(properties: Record<string, any>, name: string) {
  return properties?.[name]?.rich_text?.map((x: any) => x.plain_text).join('') || null;
}

function getEmail(properties: Record<string, any>, name: string) {
  return properties?.[name]?.email ?? null;
}

function getDate(properties: Record<string, any>, name: string) {
  return properties?.[name]?.date?.start ?? null;
}

function getSelect(properties: Record<string, any>, name: string) {
  return properties?.[name]?.select?.name ?? null;
}

function getStatus(properties: Record<string, any>, name: string) {
  return properties?.[name]?.status?.name ?? null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const notionToken = process.env.NOTION_TOKEN?.trim();
  const dbId = process.env.NOTION_JE_LEADS_DB_ID?.trim();
  const access = requireOperatorAccess(req, res, {
    endpoint: '/api/inspect-notion-lead',
    action: 'inspect_notion_lead',
    scopedKeyEnv: 'NOTION_LEAD_INSPECT_OPERATOR_KEY',
    scopedIpAllowlistEnv: 'NOTION_LEAD_INSPECT_OPERATOR_IP_ALLOWLIST',
  });

  if (!access.ok) {
    return;
  }

  if (!notionToken || !dbId) {
    return res.status(503).json({ ok: false, error: 'Notion access is not configured.' });
  }

  const submissionId =
    typeof req.query.submissionId === 'string' ? req.query.submissionId.trim() : '';

  auditOperatorAction(req, {
    endpoint: '/api/inspect-notion-lead',
    action: 'inspect_notion_lead',
    scopedKeyEnv: 'NOTION_LEAD_INSPECT_OPERATOR_KEY',
    scopedIpAllowlistEnv: 'NOTION_LEAD_INSPECT_OPERATOR_IP_ALLOWLIST',
  }, {
    authMode: access.authMode,
    submissionIdPresent: Boolean(submissionId),
  });

  try {
    const ctrl1 = new AbortController();
    const t1 = setTimeout(() => ctrl1.abort(), NOTION_TIMEOUT_MS);
    let dbRes: Response;
    try {
      dbRes = await fetch(`${NOTION_BASE}/databases/${encodeURIComponent(dbId)}`, {
        method: 'GET',
        headers: notionHeaders(notionToken),
        signal: ctrl1.signal,
      });
    } finally {
      clearTimeout(t1);
    }

    const dbBody = await dbRes.json().catch(() => null);

    if (!dbRes.ok) {
      return res.status(dbRes.status).json({
        ok: false,
        error: 'Notion database inspection failed.',
        code: dbBody?.code ?? null,
        message: dbBody?.message ?? null,
      });
    }

    const propertyTypes = Object.fromEntries(
      Object.entries(dbBody?.properties ?? {}).map(([name, meta]: [string, any]) => [
        name,
        meta?.type ?? 'unknown',
      ]),
    );

    const optionalProperties = {
      'Organisation Size': propertyTypes['Organisation Size'] ?? null,
      Timeline: propertyTypes['Timeline'] ?? null,
      'Phone / WhatsApp': propertyTypes['Phone / WhatsApp'] ?? null,
      'Preferred Contact Method': propertyTypes['Preferred Contact Method'] ?? null,
      'Lead Status': propertyTypes['Lead Status'] ?? null,
    };

    if (!submissionId) {
      return res.status(200).json({
        ok: true,
        optionalProperties,
      });
    }

    const ctrl2 = new AbortController();
    const t2 = setTimeout(() => ctrl2.abort(), NOTION_TIMEOUT_MS);
    let queryRes: Response;
    try {
      queryRes = await fetch(`${NOTION_BASE}/databases/${encodeURIComponent(dbId)}/query`, {
        method: 'POST',
        headers: notionHeaders(notionToken),
        signal: ctrl2.signal,
        body: JSON.stringify({
          filter: { property: 'Registration ID', title: { equals: submissionId } },
          page_size: 1,
        }),
      });
    } finally {
      clearTimeout(t2);
    }

    const queryBody = await queryRes.json().catch(() => null);

    if (!queryRes.ok) {
      return res.status(queryRes.status).json({
        ok: false,
        error: 'Notion row query failed.',
        code: queryBody?.code ?? null,
        message: queryBody?.message ?? null,
        optionalProperties,
      });
    }

    const result = queryBody?.results?.[0];
    if (!result) {
      return res.status(200).json({
        ok: true,
        found: false,
        optionalProperties,
      });
    }

    const properties = result.properties ?? {};

    return res.status(200).json({
      ok: true,
      found: true,
      pageId: result.id,
      optionalProperties,
      fields: {
        'Registration ID': getTitle(properties, 'Registration ID'),
        'Submitted At': getDate(properties, 'Submitted At'),
        'Full Name': getText(properties, 'Full Name'),
        'Work Email': getEmail(properties, 'Work Email'),
        Organisation: getText(properties, 'Organisation'),
        'Buyer Type': getSelect(properties, 'Buyer Type'),
        'Main Area of Interest': getSelect(properties, 'Main Area of Interest'),
        'Alignment Status': getSelect(properties, 'Alignment Status'),
        'Service Category': getText(properties, 'Service Category'),
        'Pricing Range Summary': getText(properties, 'Pricing Range Summary'),
        'Recommended Next Step': getText(properties, 'Recommended Next Step'),
        'Lead Status': getStatus(properties, 'Lead Status'),
        'Organisation Size': getText(properties, 'Organisation Size'),
        Timeline: getText(properties, 'Timeline'),
        Notes: getText(properties, 'Notes'),
        'Phone / WhatsApp': getText(properties, 'Phone / WhatsApp'),
        'Preferred Contact Method':
          getSelect(properties, 'Preferred Contact Method') ??
          getStatus(properties, 'Preferred Contact Method'),
      },
    });
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return res.status(504).json({ ok: false, error: 'Notion request timed out.' });
    }
    return res.status(500).json({
      ok: false,
      error: 'Notion inspection failed.',
      message: error?.message || 'Unknown error',
    });
  }
}
