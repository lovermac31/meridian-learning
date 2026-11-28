import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

// IELTS migration P7 (WW-20261113-08): AI Speaking pages now live at jurassicielts.com/ai-speaking. JE page addresses
// redirect there (308, one hop); API, webhook, OAuth-callback and static-asset addresses stay proxied on JE.
// Vercel matches `source` with path-to-regexp 6.x {strict, sensitive, delimiter: '/'} and applies redirects before
// rewrites; this test runs every rule through the same matcher. The query string is not part of `source`: when the
// destination has no '?', Vercel forwards the original query unchanged, which the test also asserts.

type Rule = { source: string; destination: string; permanent?: boolean; has?: Array<{ type: string; value?: string }> };
type Config = { redirects: Rule[]; rewrites: Rule[] };
type P2R = {
  match: (s: string, o?: object) => (p: string) => false | { params: Record<string, string> };
};

const require_ = createRequire(import.meta.url);
function loadMatcher(): P2R {
  const candidates = ['path-to-regexp-updated', 'path-to-regexp', '/Users/jayadams/.npm-global/lib/node_modules/vercel/node_modules/path-to-regexp-updated'];
  for (const c of candidates) {
    try {
      const mod = require_(c) as P2R;
      const version = String((require_(`${c}/package.json`) as { version: string }).version);
      if (version.startsWith('6.') && typeof mod.match === 'function') return mod;
    } catch { /* try the next candidate */ }
  }
  throw new Error('path-to-regexp 6.x not found (install it or point the list at the Vercel CLI copy)');
}

const { match } = loadMatcher();
const OPTS = { strict: true, sensitive: true, delimiter: '/' };
const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8')) as Config;
const JI = 'https://jurassicielts.com';

function firstMatch(rules: Rule[], pathname: string) {
  for (const rule of rules) {
    // Requests are modelled as arriving on the apex JE host with no cookies/headers: a rule with a `has` condition
    // (the www -> apex redirect) only applies when its host condition is the apex host.
    if (rule.has && !rule.has.every((c) => c.type === 'host' && c.value === 'jurassicenglish.com')) continue;
    const hit = match(rule.source, OPTS)(pathname);
    if (hit) return { rule, params: hit.params };
  }
  return undefined;
}

/** What a browser gets for a JE request: the first matching redirect (one hop), else the rewrite (proxy), else the app. */
function resolve(url: string) {
  const u = new URL(url, 'https://jurassicenglish.com');
  const redirect = firstMatch(config.redirects, u.pathname);
  if (redirect) {
    const dest = redirect.rule.destination;
    const external = /^https?:\/\//.test(dest);
    const origin = external ? new URL(dest).origin : '';
    const destPath = external ? new URL(dest).pathname : dest;
    // Vercel substitutes the captured segments into the destination as-is (no re-encoding).
    const path = destPath.replace(/:(\w+)/g, (_m, k: string) => redirect.params[k] ?? '');
    // Vercel forwards the request's query string when the destination carries none.
    assert.ok(!dest.includes('?'), `${redirect.rule.source}: destination must not carry its own query, or the visitor's query is lost`);
    return { kind: 'redirect' as const, status: redirect.rule.permanent ? 308 : 307, location: `${origin}${path}${u.search}`, rule: redirect.rule };
  }
  const rewrite = firstMatch(config.rewrites, u.pathname);
  return rewrite ? { kind: 'rewrite' as const, destination: rewrite.rule.destination } : { kind: 'app' as const };
}

const REDIRECTED: Array<[string, string]> = [
  ['/ai-speaking', `${JI}/ai-speaking`],
  ['/ai-speaking/', `${JI}/ai-speaking`],
  ['/ai-speaking/pricing', `${JI}/ai-speaking/pricing`],
  ['/ai-speaking/vi/pricing', `${JI}/ai-speaking/vi/pricing`],
  ['/ai-speaking/lessons?pack=lesson_single&market=india', `${JI}/ai-speaking/lessons?pack=lesson_single&market=india`],
  ['/ai-speaking/baseline?market=uae', `${JI}/ai-speaking/baseline?market=uae`],
  ['/ai-speaking/pricing/', `${JI}/ai-speaking/pricing`],
  ['/ai-speaking/samples/basic', `${JI}/ai-speaking/samples`],
  ['/ai-speaking/vi/samples/basic', `${JI}/ai-speaking/vi/samples`],
  ['/ai-speaking/paypal?token=ABC', `${JI}/ai-speaking/paypal?token=ABC`],
  ['/ai-speaking/writing/demo', `${JI}/ai-speaking/writing/demo`],
  ['/ai-speaking/vi/lessons?pack=lesson_month', `${JI}/ai-speaking/vi/lessons?pack=lesson_month`],
  ['/ai-speaking/samples', `${JI}/ai-speaking/samples`],
  ['/ai-speaking/one-to-one', `${JI}/ai-speaking/solutions`],
  ['/ai-speaking/one-to-one/', `${JI}/ai-speaking/solutions`],
  ['/ai-speaking/vi/one-to-one?x=1', `${JI}/ai-speaking/vi/solutions?x=1`],
];

// Page routes of the AI Speaking app (jurassic-ai-speaking mvp/app, checked 16 Nov 2026 against the P7 branch). Every redirect
// target must be one of these, so no JE address is ever sent to a JI page that does not exist.
const AIS_PAGE = /^\/ai-speaking(?:\/vi)?(?:|\/(?:baseline|exam|ladder|ladder\/lesson\/[^/]+|lessons|lessons\/manage|one-to-one|pricing|privacy|samples|samples\/(?:basic|intermediate|advanced)|solutions|terms|writing|writing\/(?:buy|demo|history|photo|practice|sample|feedback\/[^/]+|report\/[^/]+|revise\/[^/]+)))$/;
const AIS_EN_ONLY = /^\/ai-speaking\/(?:admin|paypal)$/;

for (const [from, to] of REDIRECTED) {
  test(`JE ${from} -> one permanent hop to ${to}`, () => {
    const r = resolve(from);
    assert.equal(r.kind, 'redirect');
    if (r.kind !== 'redirect') return;
    assert.equal(r.status, 308);
    assert.equal(r.location, to);
    assert.ok(!r.location.startsWith('https://jurassicenglish.com'), 'one hop: the target is on the JI host, not another JE address');
    const target = new URL(r.location).pathname;
    assert.ok(AIS_PAGE.test(target) || AIS_EN_ONLY.test(target), `${target} is not a page route of the AI Speaking app`);
  });
}

const PROXIED = [
  '/ai-speaking/api/health',
  '/ai-speaking/api/pay/sepay',
  '/ai-speaking/api/pay/status?code=PR0S-AB12CD',
  '/ai-speaking/api/health/',
  '/ai-speaking/_next/static/x.js',
  '/ai-speaking/assets/pay/vietqr.png',
  '/ai-speaking/brand/mr-jay-portrait.webp',
  '/ai-speaking/email/je-logo.png',
  '/ai-speaking/report/jurassic-english-logo.png',
  '/ai-speaking/sample/diagnostic-sample-answer.mp3',
  '/ai-speaking/social/ai-speaking-card.png',
  '/ai-speaking/voice/us/p1q1.mp3',
  '/76921473805ca108/_next/static/x.js',
  // Lesson ladder: access code and lesson progress live only in JE-origin localStorage; still held (404 on both hosts).
  '/ai-speaking/ladder',
  '/ai-speaking/ladder/lesson/abc',
  '/ai-speaking/ladder/lesson/abc?x=1',
  '/ai-speaking/vi/ladder',
  '/ai-speaking/vi/ladder/lesson/abc',
  '/ai-speaking/ladder/',
  '/ai-speaking/vi/ladder/lesson/abc/',
];

for (const from of PROXIED) {
  test(`JE ${from} is not redirected to JI (stays proxied on JE)`, () => {
    const r = resolve(from);
    if (r.kind === 'redirect') {
      // Only the old JE-internal trailing-slash strip may apply; it never leaves the JE host.
      assert.ok(!r.location.startsWith(JI), `${from} must not leave for JI, got ${r.location}`);
      assert.equal(r.status, 308);
      assert.ok(from.endsWith('/'), `${from}: only a trailing slash may redirect inside JE`);
      assert.equal(r.location, from.replace(/\/$/, ''));
    } else {
      assert.equal(r.kind, 'rewrite');
      if (r.kind === 'rewrite') assert.match(r.destination, /^https:\/\/jurassic-ai-speaking\.vercel\.app\//);
    }
  });
}

// IELTS migration G7 (#386): the exam and solutions pages left the 30-day hold and now take one permanent hop to JI.
const G7_MOVED: Array<[string, string]> = [
  ['/ai-speaking/exam', `${JI}/ai-speaking/exam`],
  ['/ai-speaking/vi/exam', `${JI}/ai-speaking/vi/exam`],
  ['/ai-speaking/solutions', `${JI}/ai-speaking/solutions`],
  ['/ai-speaking/vi/solutions', `${JI}/ai-speaking/vi/solutions`],
  ['/ai-speaking/exam/', `${JI}/ai-speaking/exam`],
  ['/ai-speaking/vi/exam/', `${JI}/ai-speaking/vi/exam`],
  ['/ai-speaking/solutions/', `${JI}/ai-speaking/solutions`],
  ['/ai-speaking/vi/solutions/', `${JI}/ai-speaking/vi/solutions`],
  ['/ai-speaking/exam?x=1', `${JI}/ai-speaking/exam?x=1`],
  ['/ai-speaking/vi/solutions?x=1', `${JI}/ai-speaking/vi/solutions?x=1`],
  // G7 follow-up (#387): Writing buy and photo go to the Writing hub.
  ['/ai-speaking/writing/buy', `${JI}/ai-speaking/writing`],
  ['/ai-speaking/vi/writing/photo', `${JI}/ai-speaking/vi/writing`],
];

for (const [from, to] of G7_MOVED) {
  test(`JE ${from} -> one permanent hop to ${to} (G7)`, () => {
    const r = resolve(from);
    assert.equal(r.kind, 'redirect');
    if (r.kind !== 'redirect') return;
    assert.equal(r.status, 308);
    assert.equal(r.location, to);
  });
}

test('/book-evaluation (printed on flyers) stays a temporary 307 to the JI Baseline page, with or without a trailing slash', () => {
  // The trailing-slash form answered 404 before and after P7 (found by the P7 probe, 16 Nov 2026); both forms take one hop.
  for (const p of ['/book-evaluation', '/book-evaluation/', '/book-evaluation?utm_source=flyer']) {
    const r = resolve(p);
    assert.equal(r.kind, 'redirect', p);
    if (r.kind === 'redirect') { assert.equal(r.status, 307, p); assert.equal(r.location, `${JI}/ai-speaking/baseline${p.includes('?') ? '?utm_source=flyer' : ''}`, p); }
  }
});

test('the 30-day hold is exact: /ai-speaking/laddering and /ai-speaking/exams are not held and still redirect', () => {
  for (const p of ['/ai-speaking/laddering', '/ai-speaking/exams', '/ai-speaking/vi/solutionsx']) {
    const r = resolve(p);
    assert.equal(r.kind, 'redirect', p);
    if (r.kind === 'redirect') assert.equal(r.location, `${JI}${p}`);
  }
});

test('/ai-speaking-notes and other look-alike addresses are untouched', () => {
  for (const p of ['/ai-speaking-notes', '/ai-speakingx', '/ai-speaking.html']) {
    const r = resolve(p);
    assert.ok(r.kind !== 'redirect', `${p} must not match an AI Speaking redirect`);
  }
});

test('every AI Speaking redirect to JI is permanent and targets the JI host only', () => {
  const rules = config.redirects.filter((r) => r.source.startsWith('/ai-speaking'));
  assert.ok(rules.length >= 8);
  for (const rule of rules) {
    assert.equal(rule.permanent, true, rule.source);
    const external = rule.destination.startsWith(JI + '/');
    const internalStrip = rule.destination.startsWith('/ai-speaking/');
    assert.ok(external || internalStrip, `${rule.source} -> ${rule.destination}`);
  }
});

test('the API/asset proxy rewrites stay in place, after the redirects (Vercel applies redirects first)', () => {
  const sources = config.rewrites.map((r) => r.source);
  assert.ok(sources.includes('/ai-speaking'));
  assert.ok(sources.includes('/ai-speaking/:path*'));
  assert.ok(sources.includes('/76921473805ca108/:path*'));
  for (const s of ['/ai-speaking', '/ai-speaking/:path*', '/76921473805ca108/:path*']) {
    const rule = config.rewrites.find((r) => r.source === s);
    assert.match(rule!.destination, /^https:\/\/jurassic-ai-speaking\.vercel\.app\//);
  }
});

test('the redirect for pages and the exclusion list agree: no excluded prefix is an app page', () => {
  const generic = config.redirects.find((r) => r.source.startsWith('/ai-speaking/:path((?!') && !r.source.endsWith('/'));
  assert.ok(generic, 'generic page redirect present');
  const excluded = /\(\?!\(\?:([^)]*)\)\//.exec(generic!.source)![1].split('|');
  assert.deepEqual(excluded.sort(), ['_next', 'api', 'assets', 'brand', 'email', 'report', 'sample', 'social', 'voice']);
});
