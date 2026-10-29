import test from 'node:test';
import assert from 'node:assert/strict';
import { markStudentAcademyRegistrationEmailSent, writeSupabaseStudentAcademyRegistration } from '../api/_lib/supabaseWriter';
import type { NormalizedStudentAcademyRegistration } from '../src/lib/studentAcademyRegistrationSchema';

test('Student Academy writer matches the restored schema and uses the backend service role', async (t) => {
  const previous = { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_WRITE_KEY, secret: process.env.SUPABASE_SECRET_KEY, legacy: process.env.SUPABASE_SERVICE_ROLE_KEY };
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const serviceKey = 'eyJhbGciOiJub25lIn0.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.synthetic-signature';
  process.env.SUPABASE_URL = 'https://synthetic.supabase.invalid';
  process.env.SUPABASE_WRITE_KEY = serviceKey;
  delete process.env.SUPABASE_SECRET_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  globalThis.fetch = (async (input, init) => {
    calls.push({ url: String(input), init });
    if (init?.method === 'PATCH') return new Response(null, { status: 204 });
    return new Response(JSON.stringify([{ id: '00000000-0000-4000-8000-000000000001' }]), { status: 201 });
  }) as typeof fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
    for (const [name, value] of Object.entries({ SUPABASE_URL: previous.url, SUPABASE_WRITE_KEY: previous.key, SUPABASE_SECRET_KEY: previous.secret, SUPABASE_SERVICE_ROLE_KEY: previous.legacy })) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  });

  const registration: NormalizedStudentAcademyRegistration = {
    submissionId: '00000000-0000-4000-8000-000000000002', submittedAt: '2026-10-29T00:00:00.000Z',
    registrationSource: 'student-academy-book-diagnostic', authProvider: 'email', parentFullName: 'Synthetic Parent',
    parentEmail: 'parent@example.invalid', phoneContact: null, preferredContactMethod: 'email', countryCity: 'Synthetic City',
    studentFirstName: 'Synthetic Learner', studentAgeOrGrade: '7', currentEnglishLevel: 'A2', mainGoal: 'reading_confidence',
    learningNotes: null, preferredDiagnosticTime: null, consentContact: true,
  };
  const result = await writeSupabaseStudentAcademyRegistration(registration);
  assert.equal(result.ok, true);
  const insert = calls[0];
  assert.equal(new URL(insert.url).pathname, '/rest/v1/student_academy_registrations');
  assert.equal(insert.init?.method, 'POST');
  const headers = new Headers(insert.init?.headers);
  assert.equal(headers.get('authorization'), `Bearer ${serviceKey}`);
  assert.equal(headers.get('apikey'), serviceKey);
  const row = JSON.parse(String(insert.init?.body)) as Record<string, unknown>;
  assert.deepEqual(Object.keys(row).sort(), [
    'registration_source', 'auth_provider', 'parent_full_name', 'parent_email', 'phone_contact', 'preferred_contact_method',
    'country_city', 'student_first_name', 'student_age_or_grade', 'current_english_level', 'main_goal', 'learning_notes',
    'preferred_diagnostic_time', 'consent_contact', 'canonical_access_url', 'status', 'email_sent', 'internal_notes',
  ].sort());
  assert.equal(row.parent_full_name, 'Synthetic Parent');

  await markStudentAcademyRegistrationEmailSent('00000000-0000-4000-8000-000000000001');
  assert.equal(calls[1].init?.method, 'PATCH');
  assert.equal(new URL(calls[1].url).pathname, '/rest/v1/student_academy_registrations');
});
