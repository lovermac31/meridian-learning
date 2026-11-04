/**
 * Notion CRM Writer
 * ─────────────────────────────────────────────────────────────────────────────
 * Writes a JE lead record to the Notion "Leads" database (Jurassic English B2C RevOps Hub) on every successful
 * Plans & Pricing intake submission. The older "JE Leads" database was retired on 7 Oct 2026 (no rows since 12 Aug);
 * registrations now go to "Leads", mapped field by field to its own properties (27 Oct 2026).
 *
 * Architecture rules:
 *   - Raw fetch only — no Notion SDK; consistent with Resend integration pattern
 *   - Server-side only — never imported by the frontend bundle
 *   - Never throws — all errors caught, logged, and returned as a typed result
 *   - Caller logs the result but never surfaces it to the user-facing response
 *   - Duplicate guard: checks for an existing Registration ID (kept in "UTM / Raw Source") before creating
 *   - Graceful degradation: if NOTION_TOKEN is absent, the write is skipped with a
 *     warning — existing email flow is unaffected
 *
 * Env vars:
 *   NOTION_TOKEN        — Notion internal integration token (secret_...); its integration needs access to "Leads"
 *   NOTION_LEADS_DB_ID  — optional override of the "Leads" database ID (LEADS_DB_ID). NOTION_JE_LEADS_DB_ID (the
 *                         retired database) is no longer read here.
 */

import {
  BT_LABELS,
  normaliseBuyerType,
  normaliseMAOI,
  map as crmMap,
  type AlignmentStatus,
} from './je-crm-mapper.js';
import type { NormalizedPricingRegistration } from '../../src/lib/pricingRegistrationSchema';
import { logEvent } from './observability.js';

// ─── Notion select label maps ─────────────────────────────────────────────────

/** Map alignment-status keys → the "Leads" Alignment Class options (must match the DB exactly). */
const ALIGNMENT_NOTION_LABELS: Record<AlignmentStatus, string> = {
  primary:           'Primary',
  secondary:         'Secondary',
  context_dependent: 'Context-dependent',
  manual_review:     'Manual review',
};

/** The "Leads" database in the Jurassic English B2C RevOps Hub (NOTION_LEADS_DB_ID overrides it). */
export const LEADS_DB_ID = 'b5dcf12081844218a5d0d1bd0ea1ce0e';

const PREFERRED_CHANNEL: Partial<Record<string, string>> = { email: 'Email', phone_whatsapp: 'WhatsApp' };

// ─── Constants ────────────────────────────────────────────────────────────────

const NOTION_VERSION = '2022-06-28';
const NOTION_BASE    = 'https://api.notion.com/v1';

// Notion's rich_text block hard limit per property value
const NOTION_TEXT_LIMIT = 2000;

type NotionPropertyType =
  | 'title'
  | 'rich_text'
  | 'email'
  | 'date'
  | 'select'
  | 'status'
  | string;

type NotionDatabaseSchema = Record<string, NotionPropertyType>;

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

async function fetchDatabaseSchema(
  token: string,
  dbId: string,
): Promise<NotionDatabaseSchema | null> {
  try {
    const res = await fetch(`${NOTION_BASE}/databases/${encodeURIComponent(dbId)}`, {
      method: 'GET',
      headers: notionHeaders(token),
    });

    if (!res.ok) {
      console.warn('[notion] schema lookup returned non-OK — continuing without schema gating', {
        status: res.status,
      });
      return null;
    }

    const data = await res.json() as {
      properties?: Record<string, { type?: string }>;
    };

    if (!data.properties || typeof data.properties !== 'object') {
      return null;
    }

    return Object.fromEntries(
      Object.entries(data.properties).map(([name, meta]) => [name, meta?.type ?? 'unknown']),
    );
  } catch (err) {
    console.warn('[notion] schema lookup threw — continuing without schema gating', {
      error: err instanceof Error ? err.name : 'unknown',
    });
    return null;
  }
}

// ─── Property builder ─────────────────────────────────────────────────────────

/** One line per registration field, in the intake email's order: what "Leads" has no property for. */
export function registrationSummary(r: NormalizedPricingRegistration): string {
  const ctx = crmMap(normaliseBuyerType(r.buyerType), normaliseMAOI(r.interestArea));
  return [
    'lead_source: pricing-registration',
    `registration_id: ${r.submissionId}`,
    `submitted: ${r.submittedAt}`,
    `buyer type: ${ctx.buyerType.label}`,
    `organisation: ${r.organizationName}`,
    `role: ${r.roleTitle}`,
    `country: ${r.countryRegion}`,
    r.organizationSize ? `size: ${r.organizationSize}` : null,
    `interest: ${ctx.maoi.label}`,
    `alignment: ${ALIGNMENT_NOTION_LABELS[ctx.alignment.status]}`,
    `pricing: ${ctx.service.rangeSummary}`,
    r.timeline ? `timeline: ${r.timeline}` : null,
    r.preferredContactMethod ? `contact preference: ${r.preferredContactMethod}` : null,
    `consent: ${r.contactConsent ? 'yes' : 'no'}`,
  ].filter(Boolean).join(' · ');
}

/**
 * The "Leads" page properties for a pricing registration, field by field (27 Oct 2026):
 *   Full Name (+ organisation) → Lead Name · Work Email → Email · Phone / WhatsApp → Contact (Zalo / Phone)
 *   Preferred Contact Method → Preferred Channel (email → Email, phone_whatsapp → WhatsApp; "either" left blank)
 *   Alignment Status → Alignment Class · manual review → Human Review Needed · Recommended Next Step → Next Action
 *   Lead Status New → Lifecycle Stage Lead · Buyer Type Parent / Guardian → Parent Name
 *   Registration ID, Submitted At, Buyer Type, Organisation, Role, Country, Size, Interest, Pricing Range, Timeline,
 *   consent → UTM / Raw Source (one line; "Leads" has no properties for them) · Message → the page body.
 * Offer Fit (MAOI) is "Manual review": the B2C options (1:1 Speaking, Small Group, …) do not describe a B2B interest.
 * Source is "Other". Only properties the database has (per its schema) and existing select options are written.
 */
export function buildProperties(
  r: NormalizedPricingRegistration,
  schema: NotionDatabaseSchema | null,
): Record<string, unknown> {
  const ctx = crmMap(normaliseBuyerType(r.buyerType), normaliseMAOI(r.interestArea));
  const has = (name: string, ...types: string[]) => !schema || types.includes(schema[name]);
  const props: Record<string, unknown> = {
    'Lead Name': { title: rt(r.organizationName ? `${r.fullName} · ${r.organizationName}` : r.fullName) },
  };
  if (r.workEmail && has('Email', 'email')) props['Email'] = { email: r.workEmail };
  if (r.phoneWhatsapp && has('Contact (Zalo / Phone)', 'phone_number')) props['Contact (Zalo / Phone)'] = { phone_number: r.phoneWhatsapp };
  const channel = r.preferredContactMethod ? PREFERRED_CHANNEL[r.preferredContactMethod] : undefined;
  if (channel && has('Preferred Channel', 'select')) props['Preferred Channel'] = { select: { name: channel } };
  if (has('Source', 'select')) props['Source'] = { select: { name: 'Other' } };
  if (has('UTM / Raw Source', 'rich_text', 'text')) props['UTM / Raw Source'] = { rich_text: rt(registrationSummary(r)) };
  if (has('Lifecycle Stage', 'select')) props['Lifecycle Stage'] = { select: { name: 'Lead' } };
  if (has('Alignment Class', 'select')) props['Alignment Class'] = { select: { name: ALIGNMENT_NOTION_LABELS[ctx.alignment.status] } };
  if (has('Offer Fit (MAOI)', 'select')) props['Offer Fit (MAOI)'] = { select: { name: 'Manual review' } };
  if (ctx.alignment.status === 'manual_review' && has('Human Review Needed', 'checkbox')) props['Human Review Needed'] = { checkbox: true };
  if (has('Next Action', 'rich_text', 'text')) props['Next Action'] = { rich_text: rt(ctx.cta) };
  if (normaliseBuyerType(r.buyerType) === 'parent_guardian' && has('Parent Name', 'rich_text', 'text')) props['Parent Name'] = { rich_text: rt(r.fullName) };
  return props;
}

/** The page body: the registration summary and the message, so nothing the old database held is lost. */
export function buildPageBody(r: NormalizedPricingRegistration): unknown[] {
  const paragraph = (text: string) => ({ object: 'block', type: 'paragraph', paragraph: { rich_text: rt(text) } });
  const message = (r.message ?? '').match(/[\s\S]{1,2000}/g) ?? [];
  return [
    { object: 'block', type: 'heading_3', heading_3: { rich_text: rt('Plans & Pricing registration') } },
    paragraph(registrationSummary(r)),
    ...(message.length ? [{ object: 'block', type: 'heading_3', heading_3: { rich_text: rt('Message') } }, ...message.map(paragraph)] : []),
  ];
}

// ─── Duplicate guard ──────────────────────────────────────────────────────────

/** Check whether a record with this Registration ID already exists. Null means the check failed. */
async function isDuplicate(
  token: string,
  dbId: string,
  submissionId: string,
): Promise<boolean | null> {
  try {
    const res = await fetch(`${NOTION_BASE}/databases/${encodeURIComponent(dbId)}/query`, {
      method:  'POST',
      headers: notionHeaders(token),
      body:    JSON.stringify({
        filter:    { property: 'UTM / Raw Source', rich_text: { contains: `registration_id: ${submissionId}` } },
        page_size: 1,
      }),
    });

    if (!res.ok) {
      console.warn('[notion] duplicate check returned non-OK', { status: res.status });
      return null;
    }

    const data = await res.json() as { results: unknown[] };
    return Array.isArray(data.results) && data.results.length > 0;
  } catch (err) {
    console.warn('[notion] duplicate check threw', { error: err instanceof Error ? err.name : 'unknown' });
    return null;
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
  const dbId  = process.env.NOTION_LEADS_DB_ID?.trim() || LEADS_DB_ID;

  // Graceful skip when not configured — does not break email flow
  if (!token) {
    console.warn('[notion] env not configured — write skipped', {
      hasToken: Boolean(token),
      hasDbId:  Boolean(dbId),
    });
    return { ok: false, reason: 'not_configured' };
  }

  return createLeadPage(token, dbId, registration.submissionId, (schema) => buildProperties(registration, schema), {
    duplicateGuard: 'best-effort',
    children: buildPageBody(registration),
  });
}

type LeadPageOptions = { duplicateGuard: 'off' | 'best-effort' | 'strict'; children?: unknown[] };

/** Create one page in the "Leads" database (duplicate-guarded by the registration id unless told not to). Never throws. */
async function createLeadPage(
  token: string,
  dbId: string,
  submissionId: string,
  build: (schema: NotionDatabaseSchema | null) => Record<string, unknown>,
  options: LeadPageOptions = { duplicateGuard: 'best-effort' },
): Promise<NotionWriteResult> {
  const schema = await fetchDatabaseSchema(token, dbId);

  // Duplicate guard (pricing registrations: the registration id kept in "UTM / Raw Source") — skip if it already exists
  const duplicate = options.duplicateGuard !== 'off' ? await isDuplicate(token, dbId, submissionId) : false;
  if (duplicate) {
    console.info('[notion] duplicate — record already exists, skipping', {
      submissionId,
    });
    logEvent({ event: 'notion_write_succeeded', reason: 'duplicate_skipped', submissionId });
    return { ok: true, pageId: '', reason: 'duplicate_skipped' };
  }
  if (duplicate === null && options.duplicateGuard === 'strict') {
    logEvent({ event: 'notion_write_failed', reason: 'duplicate_check_failed', submissionId });
    return { ok: false, reason: 'duplicate_check_failed' };
  }

  // Build and dispatch the page create request
  let createRes: Response;
  try {
    createRes = await fetch(`${NOTION_BASE}/pages`, {
      method:  'POST',
      headers: notionHeaders(token),
      body:    JSON.stringify({
        parent:     { database_id: dbId },
        properties: build(schema),
        ...(options.children ? { children: options.children } : {}),
      }),
    });
  } catch (err) {
    console.error('[notion] page create request threw (network error)', {
      submissionId,
      error: String(err),
    });
    logEvent({ event: 'notion_write_failed', reason: 'network_error', submissionId });
    return { ok: false, reason: 'network_error' };
  }

  if (!createRes.ok) {
    // Notion error payloads may echo submitted fields. Keep logs metadata-only.
    console.error('[notion] page create failed', {
      status:       createRes.status,
    });
    logEvent({ event: 'notion_write_failed', status: createRes.status, reason: `api_${createRes.status}`, submissionId });
    return { ok: false, reason: `api_${createRes.status}` };
  }

  const page = await createRes.json() as { id: string };
  console.info('[notion] lead record created', {
    submissionId,
    pageId:       page.id,
  });
  logEvent({ event: 'notion_write_succeeded', reason: 'created', submissionId });
  return { ok: true, pageId: page.id, reason: 'created' };
}

// ─── Free sample pack leads (website assessment, 27 Oct 2026) ────────────────

/** A sample-pack sign-up: a Zalo number or an email, consent, and a little context. */
export type SampleLead = {
  submissionId: string;
  submittedAt: string;
  name: string;
  email?: string;
  location?: string;
  zalo?: string;
  teacher: boolean;
  childAge?: string;
  locale: 'en' | 'vi';
  placement: 'home' | 'products';
  source?: string;
  product?: string;
  paymentMemo?: string;
  paymentAmount?: number;
  group?: 'sat-0900' | 'flexible';
  utmSource?: string;
  utmContent?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
};

/**
 * The B2C "Leads" database in the Jurassic English B2C RevOps Hub. The older "JE Leads" database (the pricing
 * registrations' NOTION_JE_LEADS_DB_ID) was retired on 7 Oct 2026 and has no rows since 12 Aug; "Leads" is the live
 * one (47 rows since 7 Oct). NOTION_LEADS_DB_ID overrides it.
 */
export const SAMPLE_LEADS_DB_ID = 'b5dcf12081844218a5d0d1bd0ea1ce0e';

export function sampleLeadNotes(l: SampleLead): string {
  return [
    l.product ? `registration_id: ${l.submissionId}` : null,
    `lead_source: ${l.product ? `${l.product}-reserve` : 'sample-pack'}`,
    `role: ${l.teacher ? 'teacher' : 'parent'}`,
    `page: ${l.placement} (${l.locale})`,
    l.utmSource ? `utm_source: ${l.utmSource}` : l.source ? `utm_source: ${l.source}` : 'utm_source: none',
    l.utmContent ? `utm_content: ${l.utmContent}` : null,
    l.utmMedium ? `utm_medium: ${l.utmMedium}` : null,
    l.utmCampaign ? `utm_campaign: ${l.utmCampaign}` : null,
    l.utmTerm ? `utm_term: ${l.utmTerm}` : null,
    l.product ? `product: ${l.product}` : null,
    l.location ? `buyer location: ${l.location}` : null,
    l.product ? `preferred group: ${l.group || 'not given'}` : null,
    l.childAge ? `child age: ${l.childAge}` : l.product ? 'child age: not given' : null,
    l.paymentMemo ? `payment memo: ${l.paymentMemo}` : null,
    l.paymentAmount ? `payment amount VND: ${l.paymentAmount}` : null,
    l.product ? 'consent: reply to reserve request' : 'consent: sample + occasional updates',
  ].filter(Boolean).join(' · ');
}

const ageBand = (age?: string) => {
  const n = Number(age);
  if (!age || Number.isNaN(n)) return null;
  return n >= 9 && n <= 10 ? '9–11' : n >= 11 && n <= 14 ? '11–14' : n >= 15 && n <= 18 ? '15–18' : null;
};

/**
 * The "Leads" page properties for a sample-pack lead, by that database's own names and existing select options (the
 * Notion API does not add options): Lead Name, Email or Contact (Zalo / Phone), Preferred Channel, Source (Facebook /
 * Zalo from the utm, else Other), UTM / Raw Source (lead source, role, page, utm, age, consent), Lifecycle Stage Lead,
 * Child Age Band when the age fits a band, Parent Name for a parent, and Next Action. A property the database does not
 * have (per its schema) is left out.
 */
export function sampleLeadProperties(l: SampleLead, schema: NotionDatabaseSchema | null): Record<string, unknown> {
  const has = (name: string, type: string) => !schema || schema[name] === type;
  const props: Record<string, unknown> = {
    'Lead Name': { title: rt(l.name || (l.teacher ? 'Sample pack request (teacher)' : 'Sample pack request')) },
  };
  if (l.email && has('Email', 'email')) props['Email'] = { email: l.email };
  if (l.zalo && has('Contact (Zalo / Phone)', 'phone_number')) props['Contact (Zalo / Phone)'] = { phone_number: l.zalo };
  if (has('Preferred Channel', 'select')) props['Preferred Channel'] = { select: { name: l.zalo ? 'Zalo' : 'Email' } };
  if (has('Source', 'select')) props['Source'] = { select: { name: /^fb/.test(l.source ?? '') ? 'Facebook' : /^zalo/.test(l.source ?? '') ? 'Zalo' : 'Other' } };
  if (has('UTM / Raw Source', 'text') || has('UTM / Raw Source', 'rich_text')) props['UTM / Raw Source'] = { rich_text: rt(sampleLeadNotes(l)) };
  if (has('Lifecycle Stage', 'select')) props['Lifecycle Stage'] = { select: { name: 'Lead' } };
  const band = ageBand(l.childAge);
  if (band && has('Child Age Band', 'select')) props['Child Age Band'] = { select: { name: band } };
  if (l.name && !l.teacher && (has('Parent Name', 'text') || has('Parent Name', 'rich_text'))) props['Parent Name'] = { rich_text: rt(l.name) };
  if (has('Next Action', 'text') || has('Next Action', 'rich_text')) {
    props['Next Action'] = { rich_text: rt(l.product
      ? `Reply to the ${l.product} reserve request by ${l.zalo ? 'Zalo' : 'email'} (${l.submissionId}).`
      : `Send the free sample pack by ${l.zalo ? 'Zalo' : 'email'} and follow up within 24 hours (${l.submissionId}).`) };
  }
  return props;
}

/**
 * Write a sample-pack lead to the "Leads" database (master, 27 Oct 2026: no Supabase change; Notion + an email to Jay).
 * Uses the site's NOTION_TOKEN, so that integration needs access to "Leads". Never throws.
 */
export async function writeNotionSampleLead(lead: SampleLead): Promise<NotionWriteResult> {
  const token = process.env.NOTION_TOKEN?.trim();
  const dbId  = process.env.NOTION_LEADS_DB_ID?.trim() || SAMPLE_LEADS_DB_ID;
  if (!token) {
    console.warn('[notion] env not configured — sample lead write skipped', { hasToken: false });
    return { ok: false, reason: 'not_configured' };
  }
  return createLeadPage(token, dbId, lead.submissionId, (schema) => sampleLeadProperties(lead, schema), {
    duplicateGuard: lead.product ? 'strict' : 'off',
  });
}
