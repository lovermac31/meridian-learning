// Structural tests for Phase 2.2A CORS allowlist helper.
// Same-origin baseline, allowed/denied classifications, preflight handling,
// and Vercel preview opt-in are all exercised against a fake response that
// records header sets.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyCors,
  classifyOrigin,
  handlePreflight,
  isAllowedOrigin,
  readCorsConfig,
  type CorsResponseLike,
  type CorsRequestLike,
} from '../api/_lib/corsSecurity.js';

type Recorded = {
  headers: Map<string, string>;
  statusCode: number;
  ended: boolean;
};

function fakeRes(): CorsResponseLike & Recorded {
  const rec: Recorded = { headers: new Map(), statusCode: 0, ended: false };
  return Object.assign(rec, {
    setHeader(name: string, value: string) {
      rec.headers.set(name.toLowerCase(), value);
    },
    end() {
      rec.ended = true;
    },
  });
}

function req(origin: string | undefined, method = 'POST'): CorsRequestLike {
  const h: Record<string, string> = {};
  if (origin !== undefined) h.origin = origin;
  return { headers: h, method };
}

function clearEnv() {
  delete process.env.API_CORS_ALLOWED_ORIGINS;
  delete process.env.API_CORS_ALLOW_VERCEL_PREVIEWS;
}

test('same-origin (no Origin header) is allowed, no ACAO emitted', () => {
  clearEnv();
  const res = fakeRes();
  const result = applyCors(req(undefined, 'POST'), res);
  assert.equal(result.allowed, true);
  assert.equal(result.origin, null);
  assert.equal(result.reason, 'same_origin');
  assert.equal(res.headers.has('access-control-allow-origin'), false);
  assert.equal(res.headers.has('vary'), false);
});

test('default allowlist accepts production apex and www', () => {
  clearEnv();
  assert.equal(isAllowedOrigin('https://jurassicenglish.com'), true);
  assert.equal(isAllowedOrigin('https://www.jurassicenglish.com'), true);
});

test('default allowlist denies arbitrary origins', () => {
  clearEnv();
  assert.equal(isAllowedOrigin('https://evil.example.com'), false);
  assert.equal(isAllowedOrigin('http://jurassicenglish.com'), false, 'plain http should be denied');
  assert.equal(isAllowedOrigin('https://jurassicenglish.com.evil.com'), false, 'subdomain spoof must fail');
});

test('allowed origin sets ACAO and Vary: Origin', () => {
  clearEnv();
  const res = fakeRes();
  const result = applyCors(req('https://jurassicenglish.com'), res);
  assert.equal(result.allowed, true);
  assert.equal(result.reason, 'allowlist_match');
  assert.equal(res.headers.get('access-control-allow-origin'), 'https://jurassicenglish.com');
  assert.equal(res.headers.get('vary'), 'Origin');
});

test('disallowed origin: no ACAO, no Vary, request still continues (returns allowed=false)', () => {
  clearEnv();
  const res = fakeRes();
  const result = applyCors(req('https://evil.example.com'), res);
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'origin_denied');
  assert.equal(res.headers.has('access-control-allow-origin'), false);
  assert.equal(res.headers.has('vary'), false);
});

test('env-driven extension: additional origins from API_CORS_ALLOWED_ORIGINS', () => {
  clearEnv();
  process.env.API_CORS_ALLOWED_ORIGINS = 'https://staging.jurassicenglish.com, https://partner.edu';
  try {
    assert.equal(isAllowedOrigin('https://staging.jurassicenglish.com'), true);
    assert.equal(isAllowedOrigin('https://partner.edu'), true);
    assert.equal(isAllowedOrigin('https://jurassicenglish.com'), true, 'defaults still apply');
    assert.equal(isAllowedOrigin('https://evil.example.com'), false);
  } finally {
    clearEnv();
  }
});

test('Vercel preview pattern: opt-in only', () => {
  clearEnv();
  assert.equal(isAllowedOrigin('https://je-feat-x-team.vercel.app'), false, 'opt-out by default');

  process.env.API_CORS_ALLOW_VERCEL_PREVIEWS = 'true';
  try {
    assert.equal(isAllowedOrigin('https://je-feat-x-team.vercel.app'), true);
    assert.equal(isAllowedOrigin('https://attacker.vercel.app.evil.com'), false, 'suffix spoof must fail');
    assert.equal(isAllowedOrigin('http://je-feat-x-team.vercel.app'), false, 'plain http preview denied');
  } finally {
    clearEnv();
  }
});

test('preflight: allowed origin returns 204 with method/header/max-age', () => {
  clearEnv();
  const res = fakeRes();
  const handled = handlePreflight(req('https://jurassicenglish.com', 'OPTIONS'), res);
  assert.equal(handled, true);
  assert.equal(res.statusCode, 204);
  assert.equal(res.ended, true);
  assert.equal(res.headers.get('access-control-allow-origin'), 'https://jurassicenglish.com');
  assert.ok(res.headers.get('access-control-allow-methods')?.includes('POST'));
  assert.ok(res.headers.get('access-control-allow-headers')?.includes('Content-Type'));
  assert.ok((Number(res.headers.get('access-control-max-age')) || 0) > 0);
});

test('preflight: disallowed origin returns 204 but NO ACAO (browser will block follow-up)', () => {
  clearEnv();
  const res = fakeRes();
  const handled = handlePreflight(req('https://evil.example.com', 'OPTIONS'), res);
  assert.equal(handled, true);
  assert.equal(res.statusCode, 204);
  assert.equal(res.ended, true);
  assert.equal(res.headers.has('access-control-allow-origin'), false);
  assert.equal(res.headers.has('access-control-allow-methods'), false);
});

test('preflight: non-OPTIONS returns false (caller continues normally)', () => {
  clearEnv();
  const res = fakeRes();
  const handled = handlePreflight(req('https://jurassicenglish.com', 'POST'), res);
  assert.equal(handled, false);
  assert.equal(res.ended, false);
  assert.equal(res.statusCode, 0);
});

test('classifyOrigin reasons map cleanly across the 4 input cases', () => {
  clearEnv();
  assert.equal(classifyOrigin(req(undefined)).reason, 'same_origin');
  assert.equal(classifyOrigin(req('https://jurassicenglish.com')).reason, 'allowlist_match');
  assert.equal(classifyOrigin(req('https://evil.example.com')).reason, 'origin_denied');

  process.env.API_CORS_ALLOW_VERCEL_PREVIEWS = 'true';
  try {
    assert.equal(
      classifyOrigin(req('https://je-feat-x-team.vercel.app')).reason,
      'allowlist_match_preview',
    );
  } finally {
    clearEnv();
  }
});

test('readCorsConfig: defaults shape is what callers expect', () => {
  clearEnv();
  const cfg = readCorsConfig();
  assert.equal(cfg.staticOrigins.has('https://jurassicenglish.com'), true);
  assert.equal(cfg.staticOrigins.has('https://www.jurassicenglish.com'), true);
  assert.equal(cfg.allowVercelPreviews, false);
  assert.ok(cfg.methods.includes('POST'));
  assert.ok(cfg.methods.includes('OPTIONS'));
  assert.ok(cfg.allowedHeaders.includes('Content-Type'));
  assert.ok(cfg.maxAge > 0);
});
