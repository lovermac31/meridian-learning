import assert from 'node:assert/strict';
import test from 'node:test';
import {
  classifyKey,
  decodeJwtPayload,
  supabaseKeyStatus,
} from '../api/health.ts';

function jwtWithRole(role: string) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ role })).toString('base64url');
  return `${header}.${payload}.test-signature`;
}

test('rejects a publishable Supabase key for backend keepalive', () => {
  const key = 'sb_publishable_example';

  assert.equal(classifyKey(key), null);
  assert.equal(supabaseKeyStatus(key), 'publishable_not_allowed');
});

test('accepts an opaque Supabase secret key', () => {
  const key = 'sb_secret_example';

  assert.deepEqual(classifyKey(key), {
    value: key,
    kind: 'opaque_secret',
  });
  assert.equal(supabaseKeyStatus(key), 'backend_key');
});

test('accepts only service-role legacy JWT keys', () => {
  const serviceRoleKey = jwtWithRole('service_role');
  const anonKey = jwtWithRole('anon');

  assert.equal(decodeJwtPayload(serviceRoleKey)?.role, 'service_role');
  assert.equal(classifyKey(serviceRoleKey)?.kind, 'legacy_service_role_jwt');
  assert.equal(classifyKey(anonKey), null);
  assert.equal(supabaseKeyStatus(anonKey), 'unsupported');
});

test('reports a missing key without exposing key material', () => {
  assert.equal(supabaseKeyStatus(undefined), 'missing');
});
