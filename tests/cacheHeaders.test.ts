import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

// Guards the Cache-Control rules in vercel.json (2026-10-04).
// /ai-speaking/* is an external rewrite to the Jurassic AI Speaking app. That app sets its own Cache-Control
// (no-store on its APIs, including the token-gated booking status; must-revalidate on pages). A Cache-Control
// rule here would overwrite it and tell browsers and shared caches that private responses are public for 1 h.
// /api/health must stay uncacheable: a cached health check hides outages and skips the Supabase keepalive.

type HeaderRule = { source?: string; headers?: Array<{ key?: string; value?: string }> };
const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8')) as { headers?: HeaderRule[] };
const cacheRules = (config.headers ?? []).filter((rule) =>
  (rule.headers ?? []).some((h) => (h.key ?? '').toLowerCase() === 'cache-control'),
);

test('no Cache-Control rule targets /ai-speaking paths directly', () => {
  for (const rule of cacheRules) {
    assert.ok(!(rule.source ?? '').startsWith('/ai-speaking'), `rule ${rule.source} sets Cache-Control on /ai-speaking`);
  }
});

test('negative-lookahead Cache-Control catch-alls exclude ai-speaking', () => {
  const catchAlls = cacheRules.filter((rule) => (rule.source ?? '').startsWith('/((?!'));
  assert.ok(catchAlls.length > 0, 'expected at least one catch-all Cache-Control rule');
  for (const rule of catchAlls) {
    const excluded = /^\/\(\(\?!([^)]*)\)/.exec(rule.source ?? '')?.[1]?.split('|') ?? [];
    assert.ok(excluded.includes('ai-speaking'), `catch-all ${rule.source} must exclude ai-speaking`);
  }
});

test('/api/health has no Cache-Control rule (the function sends no-store)', () => {
  assert.equal(cacheRules.find((rule) => rule.source === '/api/health'), undefined);
});
