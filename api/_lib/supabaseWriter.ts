/**
 * Supabase Writer
 * ─────────────────────────────────────────────────────────────────────────────
 * Persists JE lead and Get Started records to the WorldWise Learning Supabase
 * project (hvuohtenmsqlsqrbgveg) via the PostgREST REST API.
 *
 * Architecture rules (consistent with notionCrmWriter.ts):
 *   - Raw fetch only — no @supabase/supabase-js SDK
 *   - Server-side only — never imported by the frontend bundle
 *   - Never throws — all errors caught, logged, returned as typed results
 *   - Caller logs the result; never surfaces errors to user-facing responses
 *   - Backend-only write key used server-side; never expose it to the browser
 *
 * Required env vars:
 *   SUPABASE_URL       — https://<project-ref>.supabase.co
 *   SUPABASE_WRITE_KEY — preferred backend-only write key
 *
 * Accepted write-key fallbacks:
 *   SUPABASE_SECRET_KEY       — new opaque sb_secret_* key
 *   SUPABASE_SERVICE_ROLE_KEY — legacy service_role JWT
 */

import type { NormalizedPricingRegistration } from '../../src/lib/pricingRegistrationSchema.js';
import type { NormalizedGetStartedSubmission } from '../../src/lib/getStartedSchema.js';
import {
  normaliseBuyerType,
  normaliseMAOI,
  map as crmMap,
} from './je-crm-mapper.js';

// ─── Result type ──────────────────────────────────────────────────────────────

export type SupabaseWriteResult =
  | { ok: true;  id: string; reason: 'created' | 'duplicate_skipped' }
  | { ok: false; reason: string };

// ─── Internal helpers ─────────────────────────────────────────────────────────

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
    console.error('[supabase] publishable key refused for server-side writes', {
      keyPrefix: 'sb_publishable',
    });
    return null;
  }

  if (key.startsWith('sb_secret_')) {
    return { value: key, kind: 'opaque_secret' };
  }

  const payload = decodeJwtPayload(key);
  if (payload?.role === 'service_role') {
    return { value: key, kind: 'legacy_service_role_jwt' };
  }

  if (payload?.role) {
    console.error('[supabase] non-service-role JWT refused for server-side writes', {
      role: payload.role,
    });
    return null;
  }

  console.error('[supabase] unsupported write key format for server-side writes');
  return null;
}

function supabaseHeaders(writeKey: SupabaseWriteKey): Record<string, string> {
  const headers: Record<string, string> = {
    apikey:         writeKey.value,
    'Content-Type': 'application/json',
    Prefer:         'return=representation,resolution=ignore-duplicates',
  };

  if (writeKey.kind === 'legacy_service_role_jwt') {
    headers.Authorization = `Bearer ${writeKey.value}`;
  }

  return headers;
}

function resolveConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_WRITE_KEY?.trim()
    ?? process.env.SUPABASE_SECRET_KEY?.trim()
    ?? process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    console.warn('[supabase] env not configured — write skipped', {
      hasUrl: Boolean(url),
      hasWriteKey: Boolean(key),
    });
    return null;
  }

  const writeKey = classifyWriteKey(key);
  if (!writeKey) {
    return null;
  }

  return { url, writeKey };
}

// ─── je_leads (pricing registrations) ────────────────────────────────────────

export async function writeSupabaseLead(
  registration: NormalizedPricingRegistration,
): Promise<SupabaseWriteResult> {
  const config = resolveConfig();
  if (!config) return { ok: false, reason: 'not_configured' };

  const btKey  = normaliseBuyerType(registration.buyerType);
  const maoiKey = normaliseMAOI(registration.interestArea);
  const ctx    = crmMap(btKey, maoiKey);

  const row = {
    registration_id:          registration.submissionId,
    submitted_at:             registration.submittedAt,
    full_name:                registration.fullName,
    work_email:               registration.workEmail,
    role_title:               registration.roleTitle,
    organisation_name:        registration.organizationName,
    country_region:           registration.countryRegion,
    buyer_type:               registration.buyerType,
    interest_area:            registration.interestArea,
    organisation_size:        registration.organizationSize ?? null,
    phone_whatsapp:           registration.phoneWhatsapp ?? null,
    preferred_contact_method: registration.preferredContactMethod ?? null,
    timeline:                 registration.timeline ?? null,
    message:                  registration.message ?? null,
    contact_consent:          registration.contactConsent,
    alignment_status:         ctx.alignment.status,
    service_category:         ctx.maoi.label,
    pricing_range_summary:    ctx.service.rangeSummary,
    recommended_next_step:    ctx.cta,
    lead_status:              'new',
  };

  let res: Response;
  try {
    res = await fetch(`${config.url}/rest/v1/je_leads`, {
      method:  'POST',
      headers: supabaseHeaders(config.writeKey),
      body:    JSON.stringify(row),
    });
  } catch (err) {
    console.error('[supabase] je_leads insert threw (network error)', {
      registrationId: registration.submissionId,
      error: String(err),
    });
    return { ok: false, reason: 'network_error' };
  }

  // 409 Conflict = duplicate registration_id (unique constraint) — safe to skip
  if (res.status === 409) {
    console.info('[supabase] je_leads duplicate — record already exists, skipping', {
      registrationId: registration.submissionId,
    });
    return { ok: true, id: '', reason: 'duplicate_skipped' };
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '(unreadable)');
    console.error('[supabase] je_leads insert failed', {
      status:         res.status,
      registrationId: registration.submissionId,
      response:       errText.slice(0, 500),
    });
    return { ok: false, reason: `api_${res.status}` };
  }

  const rows = await res.json() as Array<{ id: string }>;
  const id = rows[0]?.id ?? '';
  console.info('[supabase] je_leads record created', {
    registrationId: registration.submissionId,
    rowId: id,
  });
  return { ok: true, id, reason: 'created' };
}

// ─── je_get_started_submissions ───────────────────────────────────────────────

export async function writeSupabaseGetStarted(
  submission: NormalizedGetStartedSubmission,
): Promise<SupabaseWriteResult> {
  const config = resolveConfig();
  if (!config) return { ok: false, reason: 'not_configured' };

  const contextNotes = [
    submission.source ? `Source: ${submission.source}` : null,
    submission.accessRequest ? `Pilot access request: ${submission.accessRequest}` : null,
    submission.notes ? `Notes: ${submission.notes}` : null,
  ].filter(Boolean).join('\n\n') || null;

  const row = {
    submission_id:     submission.submissionId,
    submitted_at:      submission.submittedAt,
    full_name:         submission.fullName,
    work_email:        submission.workEmail,
    organisation_name: submission.organizationName,
    organisation_type: submission.organizationType,
    primary_interest:  submission.primaryInterest,
    challenge:         submission.challenge,
    contact_consent:   submission.contactConsent,
    role_title:        submission.roleTitle ?? null,
    country_region:    submission.countryRegion ?? null,
    age_range:         submission.ageRange ?? null,
    learner_count:     submission.learnerCount ?? null,
    standards_context: submission.standardsContext ?? null,
    timeline:          submission.timeline ?? null,
    decision_stage:    submission.decisionStage ?? null,
    success_definition: submission.successDefinition ?? null,
    notes:             contextNotes,
    newsletter_opt_in: submission.newsletterOptIn,
  };

  let res: Response;
  try {
    res = await fetch(`${config.url}/rest/v1/je_get_started_submissions`, {
      method:  'POST',
      headers: supabaseHeaders(config.writeKey),
      body:    JSON.stringify(row),
    });
  } catch (err) {
    console.error('[supabase] je_get_started_submissions insert threw (network error)', {
      submissionId: submission.submissionId,
      error: String(err),
    });
    return { ok: false, reason: 'network_error' };
  }

  if (res.status === 409) {
    console.info('[supabase] je_get_started_submissions duplicate — skipping', {
      submissionId: submission.submissionId,
    });
    return { ok: true, id: '', reason: 'duplicate_skipped' };
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '(unreadable)');
    console.error('[supabase] je_get_started_submissions insert failed', {
      status:       res.status,
      submissionId: submission.submissionId,
      response:     errText.slice(0, 500),
    });
    return { ok: false, reason: `api_${res.status}` };
  }

  const rows = await res.json() as Array<{ id: string }>;
  const id = rows[0]?.id ?? '';
  console.info('[supabase] je_get_started_submissions record created', {
    submissionId: submission.submissionId,
    rowId: id,
  });
  return { ok: true, id, reason: 'created' };
}
