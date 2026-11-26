import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import handler, { trackedUrl } from '../api/go.js';
import { GO_CAMPAIGNS, GO_DESTINATIONS } from '../api/_lib/goConfig.js';

function request(query: Record<string, unknown> = {}, options: {
  method?: string; referer?: unknown; url?: string;
} = {}) {
  const headers: Record<string, string> = {};
  let status = 0;
  const logs: unknown[][] = [];
  const original = console.log;
  console.log = (...args: unknown[]) => { logs.push(args); };
  try {
    handler({
      method: options.method ?? 'GET', url: options.url,
      query: { campaign: 'gulf-ielts-test-1', ...query },
      headers: {
        referer: options.referer,
        'x-forwarded-for': '198.51.100.2', 'user-agent': 'synthetic-private-agent',
        cookie: 'private=value', authorization: 'Bearer synthetic-private-token',
      },
    } as never, {
      setHeader(key: string, value: string) { headers[key] = value; },
      status(value: number) { status = value; return this; },
      end() { return this; },
    } as never);
  } finally {
    console.log = original;
  }
  return { status, headers, logs };
}

test('only the approved campaign and exact two destinations are configured', () => {
  assert.deepEqual(GO_CAMPAIGNS, ['gulf-ielts-test-1']);
  assert.deepEqual(GO_DESTINATIONS, {
    kofi: 'https://ko-fi.com/s/a65482a4e9',
    calendly: 'https://calendly.com/jay71adams/ielts-speaking-baseline-20-min-paid-us-27',
  });
  for (const dest of ['kofi', 'calendly'] as const) {
    const result = request({ dest });
    assert.equal(result.status, 302);
    assert.equal(result.headers['Cache-Control'], 'no-store');
    assert.equal(result.headers['Referrer-Policy'], 'no-referrer');
    const url = new URL(result.headers.Location);
    assert.equal(url.origin + url.pathname, GO_DESTINATIONS[dest]);
    assert.deepEqual(Object.fromEntries(url.searchParams), {
      utm_source: 'gulf', utm_medium: 'paid_social', utm_campaign: 'gulf-ielts-test-1',
    });
  }
  assert.equal(new URL(request().headers.Location).hostname, 'ko-fi.com');
});

test('UTM builder preserves existing destination query and replaces UTM values', () => {
  const url = new URL(trackedUrl('https://ko-fi.com/s/a65482a4e9?keep=yes&utm_source=old#details', 'gulf-ielts-test-1'));
  assert.equal(url.searchParams.get('keep'), 'yes');
  assert.deepEqual(url.searchParams.getAll('utm_source'), ['gulf']);
  assert.equal(url.hash, '#details');
});

test('unknown, duplicate, prototype and URL-shaped inputs fail closed without logs', () => {
  for (const campaign of [undefined, '', 'unknown', '__proto__', ['gulf-ielts-test-1'], 'https://evil.invalid']) {
    const result = request({ campaign });
    assert.equal(result.status, 404);
    assert.equal(result.headers.Location, undefined);
    assert.deepEqual(result.logs, []);
  }
  for (const dest of ['', 'unknown', '__proto__', 'constructor', ['kofi'], 'https://evil.invalid', '//evil.invalid', 'kofi\r\nLocation: https://evil.invalid']) {
    const result = request({ dest });
    assert.equal(result.status, 404);
    assert.equal(result.headers.Location, undefined);
    assert.deepEqual(result.logs, []);
  }
  assert.equal(request({}, { url: '/go/unknown?campaign=gulf-ielts-test-1' }).status, 404);
});

test('caller query cannot override redirect URL or fixed UTM values', () => {
  const result = request({ url: 'https://evil.invalid', redirect: '//evil.invalid', utm_source: 'private@example.invalid' });
  assert.equal(result.status, 302);
  assert.equal(new URL(result.headers.Location).hostname, 'ko-fi.com');
  assert.doesNotMatch(result.headers.Location, /evil|private/);
});

test('one JSON console argument per click has the exact schema and no PII', () => {
  const { logs } = request({}, { referer: 'https://l.facebook.com/private-person?email=private@example.invalid#secret' });
  assert.equal(logs.length, 1);
  assert.equal(logs[0].length, 1);
  assert.equal(typeof logs[0][0], 'string');
  const line = logs[0][0] as string;
  assert.equal(line.includes('\n'), false);
  const entry = JSON.parse(line);
  assert.deepEqual(Object.keys(entry).sort(), ['campaign', 'dest', 'evt', 'ref_host', 'ts']);
  assert.equal(entry.evt, 'go_click');
  assert.equal(entry.campaign, 'gulf-ielts-test-1');
  assert.equal(entry.dest, 'kofi');
  assert.equal(entry.ref_host, 'l.facebook.com');
  assert.equal(new Date(entry.ts).toISOString(), entry.ts);
  assert.doesNotMatch(line, /private|198\.51\.100|cookie|user-agent|authorization|email|secret/);
  for (const referer of [undefined, ['https://facebook.com'], 'invalid', 'https://198.51.100.2/path', 'https://[::1]/', 'https://private-person.example.invalid/', 'file:///private', 'https://facebook.com.evil.invalid/']) {
    assert.equal(JSON.parse(request({}, { referer }).logs[0][0] as string).ref_host, null);
  }
});

test('HEAD and unsupported methods do not count', () => {
  for (const method of ['HEAD', 'POST', 'OPTIONS', 'PUT', 'DELETE']) {
    const result = request({}, { method });
    assert.equal(result.status, 405);
    assert.equal(result.headers.Allow, 'GET');
    assert.deepEqual(result.logs, []);
  }
});

test('campaign rewrite follows existing Zalo routes and precedes API passthrough', () => {
  const { rewrites } = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const index = rewrites.findIndex((rule: { source: string }) => rule.source === '/go/:campaign');
  assert.ok(index > rewrites.findIndex((rule: { source: string }) => rule.source === '/go/zalo'));
  assert.deepEqual(rewrites[index], { source: '/go/:campaign', destination: '/api/go?campaign=:campaign' });
  assert.ok(index < rewrites.findIndex((rule: { source: string }) => rule.source === '/api/(.*)'));
});
