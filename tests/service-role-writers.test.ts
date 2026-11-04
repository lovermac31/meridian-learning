import test from 'node:test';
import assert from 'node:assert/strict';
import { writeSupabaseGetStarted, writeSupabaseLead, writeSupabasePilotAccessRequest } from '../api/_lib/supabaseWriter';
import { appendPilotAccessEvent } from '../api/_lib/internalPilotStore';
import { recordServerEvent } from '../api/_lib/eventWriter';
import type { NormalizedPricingRegistration } from '../src/lib/pricingRegistrationSchema';
import type { NormalizedGetStartedSubmission } from '../src/lib/getStartedSchema';

test('all public API writers authenticate with the server service-role key, never anon', async (t) => {
  const previous = { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_WRITE_KEY, secret: process.env.SUPABASE_SECRET_KEY, legacy: process.env.SUPABASE_SERVICE_ROLE_KEY };
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; method: string; auth?: string; apikey?: string }> = [];
  const serviceKey = 'eyJhbGciOiJub25lIn0.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.synthetic-signature';
  process.env.SUPABASE_URL = 'https://synthetic.supabase.invalid';
  process.env.SUPABASE_WRITE_KEY = serviceKey;
  delete process.env.SUPABASE_SECRET_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  globalThis.fetch = (async (input, init) => {
    const url = String(input);
    const headers = new Headers(init?.headers);
    calls.push({ url, method: init?.method ?? 'GET', auth: headers.get('authorization') ?? undefined, apikey: headers.get('apikey') ?? undefined });
    if (url.endsWith('/je_pilot_access_events')) {
      return new Response(JSON.stringify([{ id: 'synthetic-event-id', submission_id: 'D1-SYNTHETIC-PILOT', event_type: 'access_viewed', operator_id: null, event_at: '2026-10-29T00:00:00.000Z', details: {} }]), { status: 201 });
    }
    if (url.endsWith('/rpc/record_je_event')) return new Response(null, { status: 204 });
    return new Response(JSON.stringify([{ id: 'synthetic-row-id' }]), { status: 201 });
  }) as typeof fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
    for (const [name, value] of Object.entries({ SUPABASE_URL: previous.url, SUPABASE_WRITE_KEY: previous.key, SUPABASE_SECRET_KEY: previous.secret, SUPABASE_SERVICE_ROLE_KEY: previous.legacy })) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  });

  const registration: NormalizedPricingRegistration = {
    submissionId: 'D1-SYNTHETIC-PRICE', submittedAt: '2026-10-29T00:00:00.000Z', fullName: 'Synthetic Contact',
    workEmail: 'contact@example.invalid', roleTitle: 'Teacher', organizationName: 'Synthetic Org', countryRegion: 'VN',
    buyerType: 'teacher_cpd_lead', interestArea: 'teacher_training', contactConsent: true,
  };
  const getStarted: NormalizedGetStartedSubmission = {
    submissionId: 'D1-SYNTHETIC-START', submittedAt: '2026-10-29T00:00:00.000Z', fullName: 'Synthetic Contact',
    workEmail: 'contact@example.invalid', organizationName: 'Synthetic Org', organizationType: 'school', primaryInterest: 'teacher_training',
    challenge: 'Synthetic test', contactConsent: true, newsletterOptIn: false, source: 'pilot-programme', accessRequest: 'pilot_consultation',
  };

  assert.equal((await writeSupabaseLead(registration)).ok, true);
  assert.equal((await writeSupabaseGetStarted(getStarted)).ok, true);
  assert.equal((await writeSupabasePilotAccessRequest(getStarted)).ok, true);
  assert.equal((await appendPilotAccessEvent({ submissionId: 'D1-SYNTHETIC-PILOT', eventType: 'access_viewed' }))?.id, 'synthetic-event-id');
  assert.deepEqual(await recordServerEvent({ event: 'lead_submit', path: '/synthetic-test' }), { ok: true });

  assert.deepEqual(calls.map((call) => new URL(call.url).pathname), [
    '/rest/v1/je_leads', '/rest/v1/je_get_started_submissions', '/rest/v1/je_pilot_access_requests',
    '/rest/v1/je_pilot_access_events', '/rest/v1/rpc/record_je_event',
  ]);
  for (const call of calls) {
    assert.equal(call.method, 'POST');
    assert.equal(call.auth, `Bearer ${serviceKey}`);
    assert.equal(call.apikey, serviceKey);
  }
});
