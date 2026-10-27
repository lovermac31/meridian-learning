import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyticsAllowed, CONSENT_KEY, readAnalyticsConsent, saveAnalyticsConsent, consentBeforeSend } from '../src/lib/analyticsConsent.ts';
import { loadGa4, stopGa4, ga4Event, shouldLoadGa4 } from '../src/lib/ga4.ts';

// A deterministic browser boundary: script insertions represent external loads;
// idle callbacks are explicitly flushed, so withdrawal races are reproducible.
test('consent defaults off, validates persisted input, cancels delayed loads and blocks events after revocation', () => {
  const previous = Object.fromEntries(['window', 'document', 'navigator'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const store = new Map<string, string>();
  const idle: (() => void)[] = [];
  const scripts: unknown[] = [];
  const browser = Object.assign(new EventTarget(), {
    localStorage: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value) },
    location: { hostname: 'jurassicenglish.com' },
    requestIdleCallback: (callback: () => void) => idle.push(callback),
    gtag: undefined as ((...args: unknown[]) => void) | undefined,
    dataLayer: [] as unknown[],
  });
  const nav = { doNotTrack: '0', globalPrivacyControl: false };
  Object.defineProperty(globalThis, 'window', { value: browser, configurable: true });
  Object.defineProperty(globalThis, 'navigator', { value: nav, configurable: true });
  Object.defineProperty(globalThis, 'document', { value: {
    readyState: 'complete', cookie: '', createElement: () => ({}),
    head: { appendChild: (script: unknown) => scripts.push(script) }, getElementById: () => null,
  }, configurable: true });
  try {
    assert.equal(readAnalyticsConsent(), null);
    assert.equal(analyticsAllowed(), false);
    assert.equal(shouldLoadGa4('jurassicenglish.com', {}), false);
    loadGa4(); assert.equal(idle.length, 0); assert.equal(scripts.length, 0);
    for (const value of ['invalid', '{}', JSON.stringify({ version: 1, choice: 'accepted', at: Date.now() - 181 * 86400000 }), JSON.stringify({ version: 1, choice: 'accepted', at: Date.now() + 86400000 })]) {
      store.set(CONSENT_KEY, value); assert.equal(analyticsAllowed(), false);
    }
    saveAnalyticsConsent('rejected'); loadGa4(); assert.equal(scripts.length, 0);
    saveAnalyticsConsent('accepted'); assert.equal(analyticsAllowed(), true);
    nav.globalPrivacyControl = true; assert.equal(analyticsAllowed(), false);
    nav.globalPrivacyControl = false; nav.doNotTrack = '1'; assert.equal(analyticsAllowed(), false);
    nav.doNotTrack = '0';
    loadGa4(); assert.equal(idle.length, 1);
    saveAnalyticsConsent('rejected'); stopGa4(); idle.shift()!(); assert.equal(scripts.length, 0);
    saveAnalyticsConsent('accepted'); loadGa4(); idle.shift()!(); assert.equal(scripts.length, 1);
    const events: unknown[] = []; browser.gtag = (...event) => events.push(event);
    ga4Event('cta', {}); assert.equal(events.length, 1);
    assert.deepEqual(consentBeforeSend({ type: 'pageview' }), { type: 'pageview' });
    saveAnalyticsConsent('rejected'); stopGa4(); ga4Event('cta', {});
    assert.equal(events.length, 1); assert.equal(consentBeforeSend({ type: 'pageview' }), null);
    assert.equal((browser as unknown as Record<string, unknown>)['ga-disable-G-H334PZMDYW'], true);
    store.clear(); assert.equal(readAnalyticsConsent(), null);
    saveAnalyticsConsent('accepted');
    browser.localStorage.setItem = () => { throw new Error('write quota exhausted'); };
    saveAnalyticsConsent('rejected');
    assert.equal(analyticsAllowed(), false, 'withdrawal overrides an accepted persisted value when writes fail');
    assert.equal(JSON.parse(store.get(CONSENT_KEY)!).choice, 'accepted');
    browser.localStorage.getItem = () => { throw new Error('storage blocked'); };
    browser.localStorage.setItem = () => { throw new Error('storage blocked'); };
    assert.equal(analyticsAllowed(), false);
    saveAnalyticsConsent('accepted'); assert.equal(analyticsAllowed(), true);
    saveAnalyticsConsent('rejected'); assert.equal(analyticsAllowed(), false);
  } finally {
    stopGa4();
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key);
    }
  }
});

test('all React entrypoints share consent controls; optional SDKs have send-time withdrawal guards', () => {
  const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  assert.match(read('src/AppRoot.tsx'), /<PrivacyControls/);
  assert.match(read('src/App.tsx'), /<OptionalAnalytics/);
  assert.match(read('src/yl/main.tsx'), /<OptionalAnalytics[\s\S]*<PrivacyControls/);
  assert.match(read('src/components/PrivacyControls.tsx'), /Analytics beforeSend={consentBeforeSend}/);
  assert.match(read('src/components/PrivacyControls.tsx'), /SpeedInsights route={route} beforeSend={consentBeforeSend}/);
  assert.doesNotMatch(read('public/challenges/one-change/index.html'), /insights\/script\.js/);
  assert.match(read('src/components/LegalPage.tsx'), /mailto:info@jurassicenglish.com\?subject=/);
});
