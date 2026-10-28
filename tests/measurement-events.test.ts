import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import zaloHandler, { ZALO_TARGET } from '../api/go/zalo';
import eventHandler, { ALLOWED_EVENTS, validateEventPayload } from '../api/event';
import { recordServerEvent } from '../api/_lib/eventWriter';

// Mock Vercel request & response helper
function createMockRes() {
  const headers: Record<string, string> = {};
  let statusCode = 200;
  let ended = false;
  let jsonBody: unknown = null;

  return {
    headers,
    get statusCode() { return statusCode; },
    get ended() { return ended; },
    get jsonBody() { return jsonBody; },
    status(code: number) {
      statusCode = code;
      return this;
    },
    setHeader(key: string, val: string) {
      headers[key.toLowerCase()] = val;
      return this;
    },
    getHeader(key: string) {
      return headers[key.toLowerCase()];
    },
    json(data: unknown) {
      jsonBody = data;
      ended = true;
      return this;
    },
    end() {
      ended = true;
      return this;
    },
  };
}

test('302 target: /go/zalo redirects to https://zalo.me/84396085076', async () => {
  assert.equal(ZALO_TARGET, 'https://zalo.me/84396085076');

  const req = {
    method: 'GET',
    url: '/go/zalo?utm_source=tiktok&utm_content=bio',
    query: { utm_source: 'tiktok', utm_content: 'bio' },
    headers: {},
  } as any;

  const res = createMockRes();
  await zaloHandler(req, res as any);

  assert.equal(res.statusCode, 302);
  assert.equal(res.getHeader('location'), 'https://zalo.me/84396085076');
  assert.ok(res.ended);
});

test('302 target with product id: carries product, fails open without database, still 302s', async () => {
  const req = {
    method: 'GET',
    url: '/go/zalo/holiday-reading-challenge?utm_source=social-desk',
    query: { product: 'holiday-reading-challenge', utm_source: 'social-desk' },
    headers: {},
  } as any;

  const res = createMockRes();
  await zaloHandler(req, res as any);

  assert.equal(res.statusCode, 302);
  assert.equal(res.getHeader('location'), 'https://zalo.me/84396085076');
  assert.ok(res.ended);
});

test('unknown events rejected: only whitelisted events are accepted', () => {
  assert.deepEqual(ALLOWED_EVENTS, [
    'pricing_view',
    'checkout_start',
    'paypal_return',
    'sample_open',
    'video_play',
    'lead_submit',
  ]);

  for (const event of ALLOWED_EVENTS) {
    const valid = validateEventPayload({ event, path: '/products' });
    assert.equal(valid.ok, true, `allowed event ${event}`);
  }

  const rejected = [
    'user_login',
    'click',
    'page_view',
    'purchase_completed',
    'custom_event',
    '',
    123,
    null,
  ];

  for (const bad of rejected) {
    const invalid = validateEventPayload({ event: bad });
    assert.equal(invalid.ok, false);
    if (!invalid.ok) {
      assert.equal(invalid.status, 400);
      assert.equal(invalid.error, 'unknown_event');
    }
  }
});

test('a payload with an email field is rejected (PII prevention)', () => {
  const piiSamples = [
    { event: 'pricing_view', email: 'visitor@example.com' },
    { event: 'checkout_start', Email: 'visitor@example.com' },
    { event: 'checkout_start', e_mail: 'visitor@example.com' },
    { event: 'sample_open', user_id: 'usr_12345' },
    { event: 'video_play', userId: 'usr_12345' },
    { event: 'lead_submit', phone: '0901234567' },
    { event: 'lead_submit', cookie: 'sess_abc' },
    { event: 'lead_submit', ip: '127.0.0.1' },
    { event: 'lead_submit', name: 'Nguyen Van A' },
  ];

  for (const body of piiSamples) {
    const res = validateEventPayload(body);
    assert.equal(res.ok, false);
    if (!res.ok) {
      assert.equal(res.status, 400);
      assert.equal(res.error, 'pii_rejected');
    }
  }
});

test('no PII columns in migration schema: asserts je_events table structure and RLS', () => {
  const sql = readFileSync('supabase/migrations/20261028000001_je_events.sql', 'utf8');

  // Verify RLS is enabled
  assert.match(sql, /alter table public\.je_events enable row level security;/i);

  // Verify security-definer function exists
  assert.match(sql, /create or replace function public\.record_je_event/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /revoke all on function public\.record_je_event.*from public, anon;/i);
  assert.match(sql, /grant execute on function public\.record_je_event.*to service_role;/i);

  // Extract column definitions inside create table public.je_events (...)
  const tableDefMatch = sql.match(/create table public\.je_events\s*\(([\s\S]*?)\);/i);
  assert.ok(tableDefMatch, 'create table statement exists');
  const tableBody = tableDefMatch[1];

  // Strictly assert allowed columns
  const allowedCols = ['id', 'ts', 'event', 'path', 'product_id', 'utm_source', 'utm_content', 'locale'];
  const columnsSection = tableBody.split(/constraint/i)[0];
  const columnLines = columnsSection
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('--'));

  const definedCols = columnLines.map((l) => l.split(/\s+/)[0]);
  for (const col of definedCols) {
    assert.ok(allowedCols.includes(col), `column ${col} must be in allowed anonymous set`);
  }

  // Assert absolutely NO PII columns
  const forbiddenCols = ['email', 'user_id', 'ip', 'cookie', 'phone', 'name', 'address', 'session_id'];
  for (const forbidden of forbiddenCols) {
    assert.ok(!definedCols.includes(forbidden), `table must not contain PII column ${forbidden}`);
  }
});

test('fail-open behavior: /api/event returns 204 even if database is unconfigured', async () => {
  const req = {
    method: 'POST',
    url: '/api/event',
    headers: { 'content-type': 'application/json' },
    body: {
      event: 'pricing_view',
      path: '/products',
      utm_source: 'tiktok',
    },
  } as any;

  const res = createMockRes();
  await eventHandler(req, res as any);

  assert.equal(res.statusCode, 204);
  assert.ok(res.ended);
});

test('1 KB body cap: requests exceeding 1024 bytes are rejected', async () => {
  const req = {
    method: 'POST',
    url: '/api/event',
    headers: {
      'content-type': 'application/json',
      'content-length': '2048',
    },
    body: {
      event: 'pricing_view',
      path: '/'.repeat(1500),
    },
  } as any;

  const res = createMockRes();
  await eventHandler(req, res as any);

  assert.equal(res.statusCode, 413);
  assert.equal((res.jsonBody as any)?.error, 'payload_too_large');
});
