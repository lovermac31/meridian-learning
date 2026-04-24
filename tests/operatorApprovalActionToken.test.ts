import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createOperatorApprovalActionToken,
  verifyOperatorApprovalActionToken,
} from '../api/_lib/operatorApprovalActionToken';

test('creates scoped operator approval action tokens without exposing signing secrets', () => {
  process.env.EXTERNAL_PORTAL_SIGNING_SECRET = 'operator_action_test_secret_32_chars_minimum';

  const result = createOperatorApprovalActionToken({
    submissionId: 'QA-ACTION-001',
    action: 'approve_basic_pack',
    baseUrl: 'https://jurassicenglish.com',
  });
  const url = new URL(result.url);
  const token = url.searchParams.get('token');
  const verified = verifyOperatorApprovalActionToken(token);

  assert.equal(url.pathname, '/internal/approval-action');
  assert.ok(token);
  assert.equal(result.url.includes(process.env.EXTERNAL_PORTAL_SIGNING_SECRET), false);
  assert.equal(verified.ok, true);
  if (verified.ok) {
    assert.equal(verified.payload.sub, 'QA-ACTION-001');
    assert.equal(verified.payload.action, 'approve_basic_pack');
    assert.equal(verified.payload.scope, 'pilot_access_request_review');
  }
});

test('rejects missing and tampered operator approval action tokens', () => {
  process.env.EXTERNAL_PORTAL_SIGNING_SECRET = 'operator_action_test_secret_32_chars_minimum';

  const result = createOperatorApprovalActionToken({
    submissionId: 'QA-ACTION-002',
    action: 'denied',
    baseUrl: 'https://jurassicenglish.com',
  });
  const token = new URL(result.url).searchParams.get('token') || '';

  assert.deepEqual(verifyOperatorApprovalActionToken(null), { ok: false, status: 'missing' });
  assert.deepEqual(verifyOperatorApprovalActionToken(`${token.slice(0, -1)}x`), {
    ok: false,
    status: 'invalid',
  });
});
