import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEADS_DB_ID, buildPageBody, buildProperties, registrationSummary } from '../api/_lib/notionCrmWriter';
import type { NormalizedPricingRegistration } from '../src/lib/pricingRegistrationSchema';

// Pricing registrations move from the retired "JE Leads" database (no rows since 12 Aug) to the live "Leads" database in
// the RevOps Hub (master, 27 Oct 2026). Its schema and select options as read on 27 Oct; the Notion API adds no options.
const LEADS_SCHEMA: Record<string, string> = {
  'Lead Name': 'title', Email: 'email', 'Contact (Zalo / Phone)': 'phone_number', 'Preferred Channel': 'select', Source: 'select',
  'UTM / Raw Source': 'rich_text', 'Lifecycle Stage': 'select', 'Alignment Class': 'select', 'Offer Fit (MAOI)': 'select',
  'Human Review Needed': 'checkbox', 'Next Action': 'rich_text', 'Parent Name': 'rich_text', 'Child Age Band': 'select',
  'Current Level': 'select', 'Main Goal': 'select', 'Urgency Signal': 'select', 'Lead Score': 'number', 'HubSpot ID': 'rich_text',
};
const OPTIONS: Record<string, string[]> = {
  'Preferred Channel': ['Zalo', 'Phone', 'WhatsApp', 'Email'],
  Source: ['Brochure QR', 'Referral', 'Facebook', 'SEO / Search', 'Zalo', 'Event', 'Walk-in', 'Social signal', 'Other', 'Action Center'],
  'Lifecycle Stage': ['Subscriber', 'Lead', 'MQL', 'SQL', 'Evaluation booked', 'Enrolled', 'Lost'],
  'Alignment Class': ['Primary', 'Secondary', 'Context-dependent', 'Manual review'],
  'Offer Fit (MAOI)': ['1:1 Speaking', 'Small Group', 'IELTS Track', 'Diagnostic only', 'Manual review'],
};

const registration = (over: Partial<NormalizedPricingRegistration> = {}): NormalizedPricingRegistration => ({
  submissionId: 'JE-TCH-TT-TEST1', submittedAt: '2026-10-27T03:00:00.000Z', fullName: 'Test Teacher', workEmail: 'teacher@example.com',
  roleTitle: 'Head of English', organizationName: 'Test School', countryRegion: 'Vietnam', buyerType: 'teacher_cpd_lead',
  interestArea: 'teacher_training', organizationSize: '20–50', phoneWhatsapp: '+84 396 000 000', preferredContactMethod: 'email',
  timeline: 'This term', message: 'Please call after 5pm.', contactConsent: true, ...over,
});

test('Leads: every property written exists in the database and uses an existing option', () => {
  assert.equal(LEADS_DB_ID, 'b5dcf12081844218a5d0d1bd0ea1ce0e');
  for (const r of [registration(), registration({ buyerType: 'parent_guardian', preferredContactMethod: 'phone_whatsapp' }), registration({ buyerType: 'other', interestArea: 'digital_reasoning_engine', preferredContactMethod: 'either' })]) {
    const props = buildProperties(r, LEADS_SCHEMA) as Record<string, any>;
    for (const key of Object.keys(props)) assert.ok(key in LEADS_SCHEMA, `${key} exists in Leads`);
    for (const [key, options] of Object.entries(OPTIONS)) if (props[key]) assert.ok(options.includes(props[key].select.name), `${key}: ${props[key].select.name}`);
    assert.doesNotMatch(JSON.stringify(props), /"Registration ID"|"Work Email"|"Buyer Type"|"Lead Status"/, 'no retired-database properties');
  }
});

test('Leads: field by field, with nothing from the registration lost', () => {
  const r = registration();
  const props = buildProperties(r, LEADS_SCHEMA) as Record<string, any>;
  assert.equal(props['Lead Name'].title[0].text.content, 'Test Teacher · Test School');
  assert.equal(props.Email.email, 'teacher@example.com');
  assert.equal(props['Contact (Zalo / Phone)'].phone_number, '+84 396 000 000');
  assert.equal(props['Preferred Channel'].select.name, 'Email');
  assert.equal(props['Lifecycle Stage'].select.name, 'Lead');
  assert.equal(props.Source.select.name, 'Other');
  assert.equal(props['Offer Fit (MAOI)'].select.name, 'Manual review');
  assert.equal(props['Parent Name'], undefined, 'a teacher is not a parent');
  assert.ok(props['Next Action'].rich_text[0].text.content.length > 0, 'the recommended next step');
  const summary = props['UTM / Raw Source'].rich_text[0].text.content;
  for (const part of ['lead_source: pricing-registration', 'registration_id: JE-TCH-TT-TEST1', 'submitted: 2026-10-27T03:00:00.000Z', 'organisation: Test School', 'role: Head of English', 'country: Vietnam', 'size: 20–50', 'timeline: This term', 'contact preference: email', 'consent: yes']) {
    assert.ok(summary.includes(part), part);
  }
  assert.equal(summary, registrationSummary(r));
  const body = JSON.stringify(buildPageBody(r));
  assert.ok(body.includes('Please call after 5pm.') && body.includes('registration_id: JE-TCH-TT-TEST1'), 'message and summary in the page body');

  const parent = buildProperties(registration({ buyerType: 'parent_guardian', preferredContactMethod: 'phone_whatsapp', organizationName: '' }), LEADS_SCHEMA) as Record<string, any>;
  assert.equal(parent['Lead Name'].title[0].text.content, 'Test Teacher');
  assert.equal(parent['Parent Name'].rich_text[0].text.content, 'Test Teacher');
  assert.equal(parent['Preferred Channel'].select.name, 'WhatsApp');
  const either = buildProperties(registration({ preferredContactMethod: 'either' }), LEADS_SCHEMA) as Record<string, any>;
  assert.equal(either['Preferred Channel'], undefined, '"either" is left blank');
});

test('Leads: the writer reads NOTION_LEADS_DB_ID (default Leads), dedupes on the registration id, and never the retired id', () => {
  const src = readFileSync('api/_lib/notionCrmWriter.ts', 'utf8');
  assert.match(src, /process\.env\.NOTION_LEADS_DB_ID\?\.trim\(\) \|\| LEADS_DB_ID/);
  assert.doesNotMatch(src, /process\.env\.NOTION_JE_LEADS_DB_ID/);
  assert.match(src, /property: 'UTM \/ Raw Source', rich_text: \{ contains: `registration_id: \$\{submissionId\}` \}/);
  assert.match(src, /children:\s+buildPageBody\(registration\)/);
});
