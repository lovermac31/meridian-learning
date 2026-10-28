import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { coerceSampleInput, toSampleLead } from '../api/sample-pack';
import { SAMPLE_LEADS_DB_ID, sampleLeadNotes, sampleLeadProperties } from '../api/_lib/notionCrmWriter';
import { isValidContactEmail, normalizeVietnamesePhone, sampleContactError, samplePackContent } from '../src/i18n/content/samplePack';

// The free sample pack (website assessment, 27 Oct 2026; master's decision): no Supabase change, a Notion CRM lead plus
// a Resend email to Jay. Contact is a Zalo number OR an email; name and age optional; consent required.
const base = { name: '', phone: '', email: '', childAge: '', teacher: false, consent: true, locale: 'en', placement: 'home', source: '', website: '', startedAt: '' };

test('sample pack: a Zalo number or an email is the one required contact, and consent is required', () => {
  assert.equal(normalizeVietnamesePhone('0396 085.076'), '+84396085076');
  assert.equal(normalizeVietnamesePhone('+84 396 085 076'), '+84396085076');
  assert.equal(normalizeVietnamesePhone('0396-085-076'), null, 'only spaces and dots are stripped');
  assert.equal(normalizeVietnamesePhone('12345'), null);
  assert.equal(sampleContactError('', ''), 'contact');
  assert.equal(sampleContactError('invalid', 'parent@example.com'), 'phone');
  assert.equal(sampleContactError('', 'not an email'), 'email');
  assert.equal(isValidContactEmail('parent@example.com'), true);
  assert.deepEqual(toSampleLead({ ...base, phone: 'abc' }), { error: 'phone' });
  assert.deepEqual(toSampleLead({ ...base, phone: '0396085076', consent: false }), { error: 'consent' });
});

test('sample pack: a Zalo-only parent lead has no email; a teacher tick, the page and the utm are carried', () => {
  const zalo = toSampleLead({ ...base, phone: '0396 085.076', childAge: '7', source: 'fb-teachers' }, new Date('2026-10-27T03:00:00Z'));
  assert.ok(!('error' in zalo));
  if ('error' in zalo) return;
  assert.equal(zalo.email, undefined);
  assert.equal(zalo.zalo, '+84396085076');
  assert.equal(zalo.teacher, false);
  assert.match(zalo.submissionId, /^JE-SP-[0-9A-Z]+-[0-9A-Z]{4}$/);
  assert.equal(sampleLeadNotes(zalo), 'lead_source: sample-pack · role: parent · page: home (en) · utm_source: fb-teachers · child age: 7 · consent: sample + occasional updates');
  const teacher = toSampleLead({ ...base, email: 'Teacher@Example.com', teacher: true, placement: 'products', locale: 'vi', source: 'x"><script>' });
  if ('error' in teacher) return assert.fail('valid');
  assert.equal(teacher.email, 'teacher@example.com');
  assert.equal(teacher.teacher, true);
  assert.equal(teacher.source, undefined, 'a malformed utm is dropped');
  assert.match(sampleLeadNotes(teacher), /^lead_source: sample-pack · role: teacher · page: products \(vi\)/);
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

test('privacy notice: the sample pack retention line, EN + VI (master, 27 Oct 2026)', async () => {
  const { legalDocuments } = await import('../src/lib/legalContent');
  const { getLocalizedLegalDocument } = await import('../src/i18n/content/legal');
  const en = JSON.stringify(legalDocuments['/legal/privacy'].sections);
  const vi = JSON.stringify(getLocalizedLegalDocument('/legal/privacy', 'vi')!.sections);
  assert.ok(en.includes('Free sample pack: we keep your email or Zalo number and your request for 12 months, or delete them sooner if you ask: info@jurassicenglish.com.'));
  assert.ok(vi.includes('Bộ mẫu miễn phí: chúng tôi lưu email hoặc số Zalo và yêu cầu của bạn trong 12 tháng, hoặc xóa sớm hơn nếu bạn yêu cầu: info@jurassicenglish.com.'));
});

// "JE Leads" was retired on 7 Oct 2026 (no rows since 12 Aug); the live B2C database is "Leads" (RevOps Hub). Its schema,
// read 27 Oct 2026: the select options below exist, and the Notion API does not add new ones.
const LEADS_SCHEMA = {
  'Lead Name': 'title', Email: 'email', 'Contact (Zalo / Phone)': 'phone_number', 'Preferred Channel': 'select', Source: 'select',
  'UTM / Raw Source': 'rich_text', 'Lifecycle Stage': 'select', 'Child Age Band': 'select', 'Parent Name': 'rich_text', 'Next Action': 'rich_text',
};
const OPTIONS: Record<string, string[]> = {
  'Preferred Channel': ['Zalo', 'Phone', 'WhatsApp', 'Email'],
  Source: ['Brochure QR', 'Referral', 'Facebook', 'SEO / Search', 'Zalo', 'Event', 'Walk-in', 'Social signal', 'Other', 'Action Center'],
  'Lifecycle Stage': ['Subscriber', 'Lead', 'MQL', 'SQL', 'Evaluation booked', 'Enrolled', 'Lost'],
  'Child Age Band': ['9–11', '11–14', '15–18'],
};

test('sample pack: the lead goes to the live "Leads" database by its own property names and existing options', () => {
  assert.equal(SAMPLE_LEADS_DB_ID, 'b5dcf12081844218a5d0d1bd0ea1ce0e');
  const parent = toSampleLead({ ...base, name: 'Lan', phone: '0396 085 076', email: 'parent@example.com', childAge: '12', source: 'fb-parents' });
  const teacher = toSampleLead({ ...base, email: 'T@example.com', teacher: true, childAge: '7' });
  if ('error' in parent || 'error' in teacher) return assert.fail('valid');
  const p = sampleLeadProperties(parent, LEADS_SCHEMA) as Record<string, any>;
  const t = sampleLeadProperties(teacher, LEADS_SCHEMA) as Record<string, any>;
  for (const props of [p, t]) {
    for (const key of Object.keys(props)) assert.ok(key in LEADS_SCHEMA, `${key} exists in Leads`);
    for (const [key, options] of Object.entries(OPTIONS)) if (props[key]) assert.ok(options.includes(props[key].select.name), `${key}: ${props[key].select.name}`);
    assert.doesNotMatch(JSON.stringify(props), /Registration ID|Work Email|Buyer Type/);
  }
  assert.equal(p['Lead Name'].title[0].text.content, 'Lan');
  assert.equal(p['Contact (Zalo / Phone)'].phone_number, '+84396085076');
  assert.equal(p.Email.email, 'parent@example.com');
  assert.equal(p['Preferred Channel'].select.name, 'Zalo', 'phone stays preferred when both contacts are supplied');
  assert.equal(p.Source.select.name, 'Facebook');
  assert.equal(p['Child Age Band'].select.name, '11–14');
  assert.equal(p['Parent Name'].rich_text[0].text.content, 'Lan');
  assert.match(p['UTM / Raw Source'].rich_text[0].text.content, /^lead_source: sample-pack · role: parent/);
  assert.equal(t['Lead Name'].title[0].text.content, 'Sample pack request (teacher)');
  assert.equal(t.Email.email, 't@example.com');
  assert.equal(t['Preferred Channel'].select.name, 'Email');
  assert.equal(t['Child Age Band'], undefined, 'age 7 fits no band; it stays in the raw source');
  assert.equal(t['Parent Name'], undefined);
  assert.equal(t.Source.select.name, 'Other');
});

test('sample pack: before hydration the form cannot submit natively, and never by GET (QA, 27 Oct 2026)', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { SamplePackForm } = await import('../src/components/SamplePackForm');
  const html = renderToStaticMarkup(createElement(SamplePackForm, { placement: 'home' }));
  assert.match(html, /<form[^>]* method="post"/);
  assert.match(html, /name="phone"/);
  assert.match(html, /name="email"/);
  assert.match(html, /Mr. Jay will contact you on Zalo or email about this request./);
  assert.match(html, /<button type="submit"[^>]* disabled=""/, 'the submit button is disabled until hydration');
  assert.doesNotMatch(html, /<form[^>]*action=/);
});
