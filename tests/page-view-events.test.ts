import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import eventHandler, { ALLOWED_EVENTS, validateEventPayload } from '../api/event';
import { pageViewParams, type PageViewEnv } from '../src/lib/tracker';

const human: PageViewEnv = {
  pathname: '/story-club', referrer: 'https://l.facebook.com/l.php?u=x', host: 'jurassicenglish.com',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Mobile/15E148 Safari/604.1',
  webdriver: false, prerendering: false, counting: true, firstViewOfLoad: true,
};

test('page_view is an allowed event with a referrer host and no personal fields', () => {
  assert.ok(ALLOWED_EVENTS.includes('page_view'));
  const ok = validateEventPayload({ event: 'page_view', path: '/story-club', utm_source: 'facebook', utm_content: 'fb-en-01', referrer_host: 'l.facebook.com', locale: 'en' });
  assert.equal(ok.ok, true);
  assert.equal(ok.ok && ok.data.referrer_host, 'l.facebook.com');
  assert.equal(validateEventPayload({ event: 'page_view', ip: '1.2.3.4' }).ok, false);
});

test('pageViewParams: a person gets the path and the referrer host only', () => {
  const p = pageViewParams(human)!;
  assert.deepEqual(p, { event: 'page_view', path: '/story-club', referrer_host: 'l.facebook.com' });
  assert.equal(pageViewParams({ ...human, pathname: '/vi/story-club' })!.path, '/vi/story-club');
});

test('pageViewParams: own-site referrer and later in-app views carry no referrer', () => {
  assert.equal(pageViewParams({ ...human, referrer: 'https://www.jurassicenglish.com/products' })!.referrer_host, undefined);
  assert.equal(pageViewParams({ ...human, firstViewOfLoad: false })!.referrer_host, undefined);
  assert.equal(pageViewParams({ ...human, referrer: 'not a url' })!.referrer_host, undefined);
});

test('pageViewParams: bots, webdriver, prerender, no consent and private pages are not counted', () => {
  for (const userAgent of ['Mozilla/5.0 HeadlessChrome/120', 'Googlebot/2.1 (+http://www.google.com/bot.html)', 'curl/8.4', 'Lighthouse', '']) {
    assert.equal(pageViewParams({ ...human, userAgent }), null, userAgent);
  }
  assert.equal(pageViewParams({ ...human, webdriver: true }), null);
  assert.equal(pageViewParams({ ...human, prerendering: true }), null);
  assert.equal(pageViewParams({ ...human, counting: false }), null);
  for (const pathname of ['/internal/pilot-requests', '/pilot/abc123', '/vi/pilot/abc123', '/go/zalo']) assert.equal(pageViewParams({ ...human, pathname }), null, pathname);
});

function res() {
  const r = { code: 0, status(c: number) { r.code = c; return r; }, setHeader() { return r; }, getHeader() { return undefined; }, json() { return r; }, end() { return r; } };
  return r;
}

async function post(headers: Record<string, string>, body: object) {
  const calls: Array<Record<string, unknown>> = [];
  const realFetch = globalThis.fetch;
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SECRET_KEY = 'sb_secret_test';
  globalThis.fetch = (async (_url: unknown, init?: RequestInit) => { calls.push(JSON.parse(String(init?.body))); return new Response('', { status: 204 }); }) as typeof fetch;
  try {
    const r = res();
    await eventHandler({ method: 'POST', headers: { 'content-length': '200', ...headers }, body, socket: {} } as any, r as any);
    return { code: r.code, calls };
  } finally {
    globalThis.fetch = realFetch;
  }
}

const viewBody = { event: 'page_view', path: '/story-club', utm_source: 'facebook', utm_medium: 'social', utm_campaign: 'story-club-14nov', utm_content: 'fb-en-01', referrer_host: 'l.facebook.com', locale: 'en' };
const humanUa = { 'user-agent': human.userAgent, 'x-forwarded-for': '203.0.113.7' };

test('server: a person\'s page_view writes exactly one row with the utm fields (EN and VI twins)', async () => {
  for (const [path, locale] of [['/story-club', 'en'], ['/vi/story-club', 'vi']]) {
    const { code, calls } = await post({ ...humanUa, 'x-forwarded-for': `203.0.113.${locale === 'en' ? 8 : 9}` }, { ...viewBody, path, locale });
    assert.equal(code, 204);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].p_event, 'page_view');
    assert.equal(calls[0].p_path, path);
    assert.equal(calls[0].p_locale, locale);
    assert.equal(calls[0].p_utm_source, 'facebook');
    assert.equal(calls[0].p_utm_medium, 'social');
    assert.equal(calls[0].p_utm_campaign, 'story-club-14nov');
    assert.equal(calls[0].p_utm_content, 'fb-en-01');
    assert.equal(calls[0].p_referrer_host, 'l.facebook.com');
  }
});

test('server: a bot user agent, a missing user agent and the automation header write zero rows', async () => {
  for (const headers of [{ 'user-agent': 'Mozilla/5.0 HeadlessChrome/120' }, { 'user-agent': 'Googlebot/2.1' }, {}, { ...humanUa, 'x-je-automation': 'playwright' }]) {
    const { code, calls } = await post({ ...headers, 'x-forwarded-for': '203.0.113.20' }, viewBody);
    assert.equal(code, 204);
    assert.equal(calls.length, 0, JSON.stringify(headers));
  }
});

test('migration adds page_view and referrer_host, and the saved query is read-only', () => {
  const migration = readFileSync('supabase/migrations/20261113000001_je_events_page_view.sql', 'utf8');
  assert.match(migration, /'page_view'/);
  assert.match(migration, /referrer_host/);
  const query = readFileSync('supabase/queries/je_events_views_and_clicks_by_day.sql', 'utf8');
  assert.doesNotMatch(query.replace(/--.*$/gm, ''), /\b(insert|update|delete|drop|alter|create|truncate|grant)\b/i);
  assert.match(query, /group by/i);
});
