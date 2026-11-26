import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import handler, { sourceOf, trackedUrl } from '../api/go.js';
import { GO_CAMPAIGNS, GO_DESTINATIONS, GO_PRODUCT_IDS } from '../api/_lib/goConfig.js';

const HUMAN_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const BOT_UA = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';

type Captured = { status: number; headers: Record<string, string>; logs: unknown[][]; events: Record<string, unknown>[] };

// Captures the je_events RPC body by stubbing fetch and setting fake (non-secret) env values for the writer.
async function request(query: Record<string, unknown> = {}, options: {
  method?: string; referer?: unknown; url?: string; ua?: string | null;
} = {}): Promise<Captured> {
  const headers: Record<string, string> = {};
  let status = 0;
  const logs: unknown[][] = [];
  const events: Record<string, unknown>[] = [];
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalFetch = globalThis.fetch;
  const env = { ...process.env };
  process.env.SUPABASE_URL = 'https://example.invalid';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_synthetic_test_value';
  console.log = (...args: unknown[]) => { logs.push(args); };
  console.warn = () => {};
  globalThis.fetch = (async (_url: unknown, init?: { body?: string }) => {
    if (init?.body) events.push(JSON.parse(init.body));
    return new Response('null', { status: 200 });
  }) as typeof fetch;
  const reqHeaders: Record<string, unknown> = {
    referer: options.referer,
    'x-forwarded-for': '198.51.100.2',
    cookie: 'private=value', authorization: 'Bearer synthetic-private-token',
  };
  if (options.ua !== null) reqHeaders['user-agent'] = options.ua ?? HUMAN_UA;
  try {
    await handler({
      method: options.method ?? 'GET', url: options.url,
      query: { campaign: 'gulf-ielts-test-1', ...query },
      headers: reqHeaders,
    } as never, {
      setHeader(key: string, value: string) { headers[key] = value; },
      status(value: number) { status = value; return this; },
      end() { return this; },
    } as never);
  } finally {
    console.log = originalLog;
    console.warn = originalWarn;
    globalThis.fetch = originalFetch;
    process.env = env;
  }
  return { status, headers, logs, events };
}

test('only the approved campaign and exact two destinations are configured', async () => {
  assert.deepEqual(GO_CAMPAIGNS, ['gulf-ielts-test-1']);
  assert.deepEqual(GO_DESTINATIONS, {
    kofi: 'https://ko-fi.com/s/a65482a4e9',
    calendly: 'https://calendly.com/jay71adams/ielts-speaking-baseline-20-min-paid-us-27',
  });
  for (const dest of ['kofi', 'calendly'] as const) {
    const result = await request({ dest, src: 'linkedin' });
    assert.equal(result.status, 302);
    assert.equal(result.headers['Cache-Control'], 'no-store');
    assert.equal(result.headers['Referrer-Policy'], 'no-referrer');
    const url = new URL(result.headers.Location);
    assert.equal(url.origin + url.pathname, GO_DESTINATIONS[dest]);
    assert.deepEqual(Object.fromEntries(url.searchParams), {
      utm_source: 'linkedin', utm_medium: 'social', utm_campaign: 'gulf-ielts-test-1',
    });
  }
  assert.equal(new URL((await request()).headers.Location).hostname, 'ko-fi.com');
});

test('share source is allow-listed; anything else becomes "direct"', () => {
  for (const s of ['linkedin', 'facebook', 'wechat', 'dm', 'email', 'poster', 'test']) assert.equal(sourceOf(s), s);
  for (const s of [undefined, '', 'evil', 'LinkedIn', ['linkedin', 'x'].slice(1), 'private@example.invalid']) {
    assert.equal(sourceOf(s), 'direct');
  }
  assert.equal(sourceOf(['dm']), 'dm');
});

test('UTM builder preserves existing destination query and replaces UTM values', () => {
  const url = new URL(trackedUrl('https://ko-fi.com/s/a65482a4e9?keep=yes&utm_source=old#details', 'gulf-ielts-test-1', 'dm'));
  assert.equal(url.searchParams.get('keep'), 'yes');
  assert.deepEqual(url.searchParams.getAll('utm_source'), ['dm']);
  assert.equal(url.hash, '#details');
});

test('unknown, prototype and URL-shaped inputs fail closed without logs or events', async () => {
  for (const campaign of [undefined, '', 'unknown', '__proto__', 'https://evil.invalid']) {
    const result = await request({ campaign });
    assert.equal(result.status, 404);
    assert.equal(result.headers.Location, undefined);
    assert.deepEqual(result.logs, []);
    assert.deepEqual(result.events, []);
  }
  for (const dest of ['', 'unknown', '__proto__', 'constructor', 'https://evil.invalid', '//evil.invalid', 'kofi\r\nLocation: https://evil.invalid']) {
    const result = await request({ dest });
    assert.equal(result.status, 404);
    assert.equal(result.headers.Location, undefined);
    assert.deepEqual(result.events, []);
  }
  assert.equal((await request({}, { url: '/go/unknown?campaign=gulf-ielts-test-1' })).status, 404);
});

test('caller query cannot override redirect URL or inject UTM values', async () => {
  const result = await request({ url: 'https://evil.invalid', redirect: '//evil.invalid', utm_source: 'private@example.invalid', src: 'private@example.invalid' });
  assert.equal(result.status, 302);
  assert.equal(new URL(result.headers.Location).hostname, 'ko-fi.com');
  assert.doesNotMatch(result.headers.Location, /evil|private/);
  assert.equal(new URL(result.headers.Location).searchParams.get('utm_source'), 'direct');
});

test('a human click is saved once as checkout_start with no personal data', async () => {
  const { logs, events, headers } = await request({ src: 'dm' }, { referer: 'https://l.facebook.com/private-person?email=private@example.invalid#secret' });
  assert.equal(headers['X-JE-Click'], 'recorded');
  assert.equal(events.length, 1);
  const ev = events[0];
  assert.equal(ev.p_event, 'checkout_start');
  assert.equal(ev.p_path, '/go/gulf-ielts-test-1');
  assert.equal(ev.p_product_id, GO_PRODUCT_IDS.kofi);
  assert.equal(ev.p_utm_source, 'dm');
  assert.equal(ev.p_utm_medium, 'social');
  assert.equal(ev.p_utm_campaign, 'gulf-ielts-test-1');
  assert.equal(ev.p_referrer_host, 'l.facebook.com');
  const body = JSON.stringify(ev);
  assert.doesNotMatch(body, /private|198\.51\.100|cookie|authorization|email|secret|Mozilla/);

  assert.equal(logs.length, 1);
  const entry = JSON.parse(logs[0][0] as string);
  assert.deepEqual(Object.keys(entry).sort(), ['campaign', 'dest', 'evt', 'ref_host', 'src', 'ts']);
  assert.equal(entry.evt, 'go_click');
  assert.equal(entry.src, 'dm');
  assert.doesNotMatch(logs[0][0] as string, /private|198\.51\.100|cookie|authorization|email|secret/);

  for (const referer of [undefined, 'invalid', 'https://198.51.100.2/path', 'https://private-person.example.invalid/', 'file:///private', 'https://facebook.com.evil.invalid/']) {
    const r = await request({}, { referer });
    assert.equal(r.events[0].p_referrer_host ?? null, null);
  }
});

test('bots, link previews and requests with no user agent are redirected but not counted', async () => {
  for (const ua of [BOT_UA, 'curl/8.7.1', null]) {
    const result = await request({}, { ua });
    assert.equal(result.status, 302);
    assert.match(result.headers['X-JE-Click'], /^skipped:/);
    assert.deepEqual(result.events, []);
    assert.deepEqual(result.logs, []);
  }
});

test('HEAD and unsupported methods do not count', async () => {
  for (const method of ['HEAD', 'POST', 'OPTIONS', 'PUT', 'DELETE']) {
    const result = await request({}, { method });
    assert.equal(result.status, 405);
    assert.equal(result.headers.Allow, 'GET');
    assert.deepEqual(result.events, []);
  }
});

test('campaign rewrite follows existing Zalo routes and precedes API passthrough', () => {
  const { rewrites } = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const index = rewrites.findIndex((rule: { source: string }) => rule.source === '/go/:campaign');
  assert.ok(index > rewrites.findIndex((rule: { source: string }) => rule.source === '/go/zalo'));
  assert.deepEqual(rewrites[index], { source: '/go/:campaign', destination: '/api/go?campaign=:campaign' });
  assert.ok(index < rewrites.findIndex((rule: { source: string }) => rule.source === '/api/(.*)'));
});
