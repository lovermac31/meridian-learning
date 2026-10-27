import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { coerceSampleInput, toSampleLead } from '../api/sample-pack';
import { sampleLeadNotes } from '../api/_lib/notionCrmWriter';
import { contactKind, samplePackContent } from '../src/i18n/content/samplePack';

// The free sample pack (website assessment, 27 Oct 2026; master's decision): no Supabase change, a Notion CRM lead plus
// a Resend email to Jay. Contact is a Zalo number OR an email; name and age optional; consent required.
const base = { name: '', contact: '', childAge: '', teacher: false, consent: true, locale: 'en', placement: 'home', source: '', website: '', startedAt: '' };

test('sample pack: a Zalo number or an email is the one required contact, and consent is required', () => {
  assert.equal(contactKind('0396 085 076'), 'zalo');
  assert.equal(contactKind('+84 396-085-076'), 'zalo');
  assert.equal(contactKind('parent@example.com'), 'email');
  assert.equal(contactKind('12345'), null);
  assert.equal(contactKind('not an email'), null);
  assert.deepEqual(toSampleLead({ ...base, contact: 'abc' }), { error: 'contact' });
  assert.deepEqual(toSampleLead({ ...base, contact: '0396085076', consent: false }), { error: 'consent' });
});

test('sample pack: a Zalo-only parent lead has no email; a teacher tick, the page and the utm are carried', () => {
  const zalo = toSampleLead({ ...base, contact: '0396 085 076', childAge: '7', source: 'fb-teachers' }, new Date('2026-10-27T03:00:00Z'));
  assert.ok(!('error' in zalo));
  if ('error' in zalo) return;
  assert.equal(zalo.email, undefined);
  assert.equal(zalo.zalo, '0396085076');
  assert.equal(zalo.teacher, false);
  assert.match(zalo.submissionId, /^JE-SP-[0-9A-Z]+-[0-9A-Z]{4}$/);
  assert.equal(sampleLeadNotes(zalo), 'lead_source: sample-pack · page: home (en) · utm_source: fb-teachers · child age: 7 · consent: sample + occasional updates');
  const teacher = toSampleLead({ ...base, contact: 'Teacher@Example.com', teacher: true, placement: 'products', locale: 'vi', source: 'x"><script>' });
  if ('error' in teacher) return assert.fail('valid');
  assert.equal(teacher.email, 'teacher@example.com');
  assert.equal(teacher.teacher, true);
  assert.equal(teacher.source, undefined, 'a malformed utm is dropped');
  assert.match(sampleLeadNotes(teacher), /^lead_source: sample-pack · page: products \(vi\)/);
  assert.equal(coerceSampleInput({ teacher: 'yes', consent: 'true' }).consent, false, 'booleans only');
});

test('sample pack: success needs Notion or the email; contact details are never logged; no Supabase write', () => {
  const api = readFileSync('api/sample-pack.ts', 'utf8');
  assert.match(api, /if \(notion\.ok \|\| email === 'sent'\) return res\.status\(200\)/);
  assert.doesNotMatch(api, /supabaseWriter|rest\/v1/);
  const logged = api.match(/console\.info\('\[sample-pack\] submission', \{[\s\S]*?\}\);/)![0];
  assert.doesNotMatch(logged, /lead\.(email|zalo|name)\b(?!\s*\?)/);
  for (const locale of ['en', 'vi'] as const) {
    assert.deepEqual(samplePackContent[locale].thanks.items.map((item) => item.id), ['story-club', 'printable-pack', 'teacher-pack-l1', 'baseline']);
  }
});
