import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GA4_MEASUREMENT_ID, optedOut, shouldLoadGa4 } from '../src/lib/ga4.ts';

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('GA4 loads on the production hosts only', () => {
  assert.equal(shouldLoadGa4('jurassicenglish.com', {}, true), true);
  assert.equal(shouldLoadGa4('www.jurassicenglish.com', {}, true), true);
  for (const host of ['localhost', 'jurassic-english-git-x-jay71adams-1388s-projects.vercel.app', 'jurassicenglish.com.evil.test', '']) {
    assert.equal(shouldLoadGa4(host, {}, true), false, host);
  }
});

test('Global Privacy Control and Do Not Track switch GA4 off', () => {
  assert.equal(optedOut({ globalPrivacyControl: true }), true);
  assert.equal(optedOut({ doNotTrack: '1' }), true);
  assert.equal(optedOut({ doNotTrack: '0' }), false);
  assert.equal(shouldLoadGa4('jurassicenglish.com', { globalPrivacyControl: true }, true), false);
});

test('the measurement ID is the jurassicenglish.com stream', () => {
  assert.match(GA4_MEASUREMENT_ID, /^G-[A-Z0-9]{10}$/);
  assert.equal(GA4_MEASUREMENT_ID, 'G-H334PZMDYW');
});

test('the site CSP allows gtag.js and the GA4 collection endpoints (not the AI Speaking CSP)', () => {
  const v = JSON.parse(read('vercel.json')) as { headers: { source: string; headers: { key: string; value: string }[] }[] };
  const csp = (source: string) => v.headers.find((h) => h.source === source)?.headers.find((x) => x.key.toLowerCase() === 'content-security-policy')?.value ?? '';
  const site = csp('/((?!ai-speaking).*)');
  const directive = (name: string) => site.split(';').map((d) => d.trim()).find((d) => d.startsWith(`${name} `)) ?? '';
  assert.match(directive('script-src'), /https:\/\/www\.googletagmanager\.com/);
  for (const host of ['https://www.googletagmanager.com', 'https://*.google-analytics.com', 'https://*.analytics.google.com']) {
    assert.ok(directive('connect-src').includes(host), host);
  }
  assert.doesNotMatch(csp('/ai-speaking/:path*'), /googletagmanager/);
});

test('GA4 starts after hydration and on the static YL page; CTA events are mirrored', () => {
  assert.match(read('src/components/PrivacyControls.tsx'), /analyticsAllowed\(\).*loadGa4\(\)/);
  assert.match(read('src/yl/main.tsx'), /<OptionalAnalytics/);
  assert.match(read('src/lib/analytics.ts'), /ga4Event\(name, params\)/);
});
