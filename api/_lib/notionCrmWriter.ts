/**
 * Notion CRM Writer
 * ─────────────────────────────────────────────────────────────────────────────
 * Writes a JE lead record to the Notion JE Leads database on every successful
 * Plans & Pricing intake submission.
 *
 * Architecture rules:
 *   - Raw fetch only — no Notion SDK; consistent with Resend integration pattern
 *   - Server-side only — never imported by the frontend bundle
 *   - Never throws — all errors caught, logged, and returned as a typed result
 *   - Caller logs the result but never surfaces it to the user-facing response
 *   - Duplicate guard: checks for existing Registration ID before creating
 *   - Graceful degradation: if NOTION_TOKEN or NOTION_JE_LEADS_DB_ID are absent,
 *     the write is skipped with a warning — existing email flow is unaffected
 *
 * Required env vars:
 *   NOTION_TOKEN           — Notion internal integration token (secret_...)
 *   NOTION_JE_LEADS_DB_ID  — The JE Leads database ID from the Notion URL
 */

import {
  normaliseBuyerType,
  normaliseMAOI,
  map as crmMap,
} from './je-crm-mapper.js';
import type { NormalizedPricingRegistration } from '../../src/lib/pricingRegistrationSchema';

// ─── Constants ────────────────────────────────────────────────────────────────

const NOTION_VERSION = '2022-06-28';
const NOTION_BASE    = 'https://api.notion.com/v1';

// Notion's rich_text block hard limit per property value
const NOTION_TEXT_LIMIT = 2000;

// ─── Result type ──────────────────────────────────────────────────────────────

export type NotionWriteResult =
  | { ok: true;  pageId: string; reason: 'created' | 'duplicate_skipped' }
  | { ok: false; reason: string };

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Wrap a string in a Notion rich_text array, truncating to the block limit. */
function rt(content: string) {
  return [{ text: { content: (content ?? '').slice(0, NOTION_TEXT_LIMIT) } }];
}

/** Build the auth + version headers required by every Notion API request. */
function notionHeaders(token: string): Record<string, string> {
  return {
    Authorization:    `Bearer ${token}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type':   'application/json',
  };
}

// ─── Property builder ─────────────────────────────────────────────────────────

/**
 * Build the Notion page properties object from a normalised registration record.
 * The CRM mapping engine is called here independently — this keeps the email
 * notification path completely untouched.
 */
function buildProperties(r: NormalizedPricingRegistration): Record<string, unknown> {
  const btKey   = normaliseBuyerType(r.buyerType);
  const maoiKey = normaliseMAOI(r.interestArea);
  const ctx     = crmMap(btKey, maoiKey);

  // ── Required properties ────────────────────────────────────────────────────
  const props: Record<string, unknown> = {

    // Title property — primary key in Notion; must be unique per record
    'Registration ID': { title: rt(r.submissionId) },

    // Intake timestamp — ISO 8601 date with time
    'Submitted At': { date: { start: r.submittedAt } },

    // Contact fields — from §2 of the CRM intake email
    'Full Name':        { rich_text: rt(r.fullName) },
    'Work Email':       { email: r.workEmail },
    'Organisation':     { rich_text: rt(r.organizationName) },
    'Role / Title':     { rich_text: rt(r.roleTitle) },
    'Country / Region': { rich_text: rt(r.countryRegion) },

    // CRM classification — derived from the JE CRM Mapping Engine
    'Buyer Type':            { select: { name: ctx.buyerType.key } },
    'Main Area of Interest': { select: { name: ctx.maoi.key } },
    'Alignment Status':      { select: { name: ctx.alignment.status } },
    'Service Category':      { rich_text: rt(ctx.maoi.label) },
    'Pricing Range Summary': { rich_text: rt(ctx.service.rangeSummary) },
    'Recommended Next Step': { rich_text: rt(ctx.cta) },

    // Pipeline entry — always New on first write; updated manually by operator
    'Lead Status': { select: { name: 'New' } },
  };

  // ── Optional properties — only written when present on the submission ───────
  if (r.organizationSize)       props['Organisation Size']        = { rich_text: rt(r.organizationSize) };
  if (r.timeline)               props['Timeline']                 = { rich_text: rt(r.timeline) };
  if (r.message)                props['Notes']                    = { rich_text: rt(r.message) };
  if (r.phoneWhatsapp)          props['Phone / WhatsApp']         = { rich_text: rt(r.phoneWhatsapp) };
  if (r.preferredContactMethod) props['Preferred Contact Method'] = { select: { name: r.preferredContactMethod } };

  return props;
}

// ─── Duplicate guard ──────────────────────────────────────────────────────────

/**
 * Check whether a record with this Registration ID already exists in the database.
 * On any check failure (network error, bad credentials, wrong dbId), returns false
 * so the create proceeds rather than silently swallowing the write.
 */
async function isDuplicate(
  token: string,
  dbId: string,
  submissionId: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${NOTION_BASE}/databases/${encodeURIComponent(dbId)}/query`, {
      method:  'POST',
      headers: notionHeaders(token),
      body:    JSON.stringify({
        filter:    { property: 'Registration ID', title: { equals: submissionId } },
        page_size: 1,
      }),
    });

    if (!res.ok) {
      console.warn('[notion] duplicate check returned non-OK — proceeding with create', {
        status: res.status,
        submissionId,
      });
      return false;
    }

    const data = await res.json() as { results: unknown[] };
    return Array.isArray(data.results) && data.results.length > 0;
  } catch (err) {
    console.warn('[notion] duplicate check threw — proceeding with create', {
      submissionId,
      error: String(err),
    });
    return false;
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Write a JE lead record to the Notion JE Leads database.
 *
 * Safe to call from a serverless handler — never throws. Returns a typed
 * result that the caller should log. Does not affect the user-facing response
 * regardless of outcome.
 */
export async function writeNotionLead(
  registration: NormalizedPricingRegistration,
): Promise<NotionWriteResult> {
  const token = process.env.NOTION_TOKEN?.trim();
  const dbId  = process.env.NOTION_JE_LEADS_DB_ID?.trim();

  // Graceful skip when not configured — does not break email flow
  if (!token || !dbId) {
    console.warn('[notion] env not configured — write skipped', {
      hasToken: Boolean(token),
      hasDbId:  Boolean(dbId),
    });
    return { ok: false, reason: 'not_configured' };
  }

  // Duplicate guard — skip if this registration ID already exists
  const duplicate = await isDuplicate(token, dbId, registration.submissionId);
  if (duplicate) {
    console.info('[notion] duplicate — record already exists, skipping', {
      submissionId: registration.submissionId,
    });
    return { ok: true, pageId: '', reason: 'duplicate_skipped' };
  }

  // Build and dispatch the page create request
  let createRes: Response;
  try {
    createRes = await fetch(`${NOTION_BASE}/pages`, {
      method:  'POST',
      headers: notionHeaders(token),
      body:    JSON.stringify({
        parent:     { database_id: dbId },
        properties: buildProperties(registration),
      }),
    });
  } catch (err) {
    console.error('[notion] page create request threw (network error)', {
      submissionId: registration.submissionId,
      error: String(err),
    });
    return { ok: false, reason: 'network_error' };
  }

  if (!createRes.ok) {
    const errText = await createRes.text().catch(() => '(unreadable)');
    console.error('[notion] page create failed', {
      status:       createRes.status,
      submissionId: registration.submissionId,
      response:     errText.slice(0, 500),
    });
    return { ok: false, reason: `api_${createRes.status}` };
  }

  const page = await createRes.json() as { id: string };
  console.info('[notion] lead record created', {
    submissionId: registration.submissionId,
    pageId:       page.id,
  });
  return { ok: true, pageId: page.id, reason: 'created' };
}
