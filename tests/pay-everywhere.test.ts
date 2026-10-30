import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PAID_OFFERS, BANK_CONFIG, canonicalPaymentMemo, paymentQrUrl, paymentHref } from '../src/config/payment';
import { createPaidMemo, coerceSampleInput, toSampleLead } from '../api/sample-pack';
import { sampleLeadNotes } from '../api/_lib/notionCrmWriter';
import { PayStep } from '../src/components/PayStep';
import { validateStoryClubReserve } from '../src/lib/storyClubReserve';
import { resolveLocalizedRoute } from '../src/i18n/routing';

const amounts: Record<string, number> = {
  'story-club': 590000, baseline: 690000, 'one-to-one': 5600000, 'printable-pack': 149000,
  'parent-pack-l1': 249000, 'parent-pack-l2': 249000, 'parent-pack-l3': 249000,
  'holiday-reading-challenge': 149000, 'teacher-pack-l1': 690000, 'teacher-pack-l2': 690000,
  'teacher-pack-l3': 690000, 'teacher-pack-l4': 690000, 'teacher-pack-l5': 690000, 'teacher-bundle': 2900000,
  'student-workbook-l1': 190000, 'student-workbook-l2': 190000, 'student-workbook-l3': 190000,
  'student-workbook-l4': 190000, 'student-workbook-l5': 190000, 'word-fossil-flashcards-l1': 190000,
  'thinking-cycle-set': 490000, 'thinking-cycle-posters': 149000, 'reasoning-assessment-kit': 390000,
  'centre-licence': 4900000, 'teacher-training-course': 1490000, 'pilot-class-kit': 690000,
  'curriculum-overview': 290000, 'ielts-speaking-ladder': 390000, 'ielts-one-to-one-starter': 149000,
  'ielts-cue-card-bank': 290000, 'writing-baseline': 79000, 'ielts-writing-ladder-task2': 390000,
  'ielts-writing-task1-method': 290000, 'ielts-essay-bank-task2': 290000, 'ielts-writing-teacher-pack': 690000,
};

test('every priced offer has an approved price and a unique stable memo namespace', () => {
  assert.deepEqual(PAID_OFFERS.map(o => o.id).sort(), Object.keys(amounts).sort());
  assert.equal(new Set(PAID_OFFERS.map(o => o.prefix)).size, PAID_OFFERS.length);
  assert.equal(BANK_CONFIG.bank, 'MBBank');
  assert.equal(BANK_CONFIG.account, '0269494315526');
});

for (const offer of PAID_OFFERS) test(`${offer.id}: server memo, exact QR amount and memo, dashless bank reconciliation, two-field intake`, () => {
  const key = '11111111-1111-4111-8111-111111111111';
  const memo = createPaidMemo(offer.id, key);
  assert.equal(offer.amount, amounts[offer.id]);
  assert.match(memo, new RegExp(`^${offer.prefix}-[A-Z0-9]{6}$`));
  assert.equal(createPaidMemo(offer.id, key), memo, 'retry is stable');
  assert.notEqual(createPaidMemo(offer.id, key + '2'), memo, 'different orders have distinct fixtures');
  const qr = new URL(paymentQrUrl(offer.amount, memo)!);
  assert.equal(qr.origin + qr.pathname, 'https://qr.sepay.vn/img');
  assert.equal(qr.searchParams.get('amount'), String(amounts[offer.id]));
  assert.equal(qr.searchParams.get('des'), memo);
  assert.equal(qr.searchParams.get('acc'), '0269494315526');
  assert.equal(qr.searchParams.get('bank'), 'MBBank');
  for (const value of [memo, memo.replace('-', ''), memo.replace('-', ' '), `PAY ${memo.toLowerCase()} thanks`]) assert.equal(canonicalPaymentMemo(value), memo);
  assert.equal(canonicalPaymentMemo(memo + 'X'), null);
  const lead = toSampleLead(coerceSampleInput({ product: offer.id, name: 'Synthetic Parent', phone: '0396085076', email: 'parent@example.test', location: 'VN', consent: true, submissionKey: key, amount: 1, memo: 'SC-HACKED' }));
  if ('error' in lead) return assert.fail(lead.error);
  assert.equal(lead.product, offer.id);
  assert.equal(lead.childAge, undefined);
  assert.equal(lead.paymentMemo, undefined, 'client cannot supply canonical memo');
  assert.match(sampleLeadNotes(lead), /child age: not given/);
  assert.match(sampleLeadNotes(lead), /preferred group: not given/);
  for (const locale of ['en', 'vi'] as const) {
    const html = renderToStaticMarkup(createElement(PayStep, { locale, amount: offer.amount, memo, productId: offer.id }));
    assert.ok(html.includes('https://qr.sepay.vn/img?'));
    assert.match(html, /data-payment-qr/);
    assert.doesNotMatch(html, /vietqr-story-club\.png|enter the amount|nhập số tiền/i);
    const path = new URL(paymentHref(offer.id, locale), 'https://example.invalid');
    assert.equal(resolveLocalizedRoute(path.pathname).locale, locale);
  }
});

test('optional age/group stay validated when supplied; name and Zalo remain mandatory', () => {
  const values = { name: 'Synthetic', phone: '0396085076', email: 'parent@example.test', location: 'VN', childAge: '', group: '' };
  assert.equal(validateStoryClubReserve(values), null);
  assert.equal(validateStoryClubReserve({ ...values, name: '' }), 'name');
  assert.equal(validateStoryClubReserve({ ...values, phone: '' }), 'phone');
  assert.equal(validateStoryClubReserve({ ...values, childAge: '4' }), 'age');
  assert.equal(validateStoryClubReserve({ ...values, group: 'invented' }), 'group');
  assert.deepEqual(toSampleLead(coerceSampleInput({ product: 'baseline', name: 'Synthetic', email: 'test@example.invalid', consent: true })), { error: 'phone' });
  assert.throws(() => createPaidMemo('unknown', 'id'), /Invalid reservation/);
  assert.equal(canonicalPaymentMemo('PRZZABC123'), null);
});

test('missing bank config disables the dynamic QR; invalid amount or memo cannot produce a URL', () => {
  for (const key of ['bank', 'account', 'name'] as const) assert.equal(paymentQrUrl(590000, 'SC-ABC123', { ...BANK_CONFIG, [key]: '' }), null);
  for (const amount of [0, -1, 1.5, NaN, Infinity]) assert.throws(() => paymentQrUrl(amount, 'SC-ABC123'));
  assert.throws(() => paymentQrUrl(590000, 'SC-BAD&amount=1'));
});

test('meeting CTAs use attributed Zalo links and never render payment instructions', async () => {
  const { readFileSync } = await import('node:fs');
  const { getBotUIPublicDestination } = await import('../src/lib/botUiRoutes');
  for (const key of ['discovery', 'institutionalGetStarted'] as const) assert.match(getBotUIPublicDestination(key).path, /^\/go\/zalo\?utm_source=assistant&utm_content=[a-z-]+$/);
  for (const file of ['WorldWisePage', 'PilotProgrammePage', 'MethodologyPage', 'AuditSprintPage', 'CefrAlignmentPage', 'DiscoveryPage', 'TeacherStandardsPage', 'CompaniesPage']) {
    const source = readFileSync(`src/components/${file}.tsx`, 'utf8');
    assert.match(source, /href="\/go\/zalo\?utm_source=[a-z-]+&utm_content=(discovery-call|book-call)"/);
    assert.doesNotMatch(source, /<PayStep|data-payment-qr|to=\{'\/discovery'\}/);
  }
});
