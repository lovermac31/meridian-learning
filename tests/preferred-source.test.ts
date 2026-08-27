import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PREFERRED_SOURCE_DOMAIN,
  PREFERRED_SOURCE_DEEPLINK,
  isEnhancedFlowEnabled,
  ensurePreferredSource,
  preferredSourceState,
} from '../src/lib/preferredSource';

test('deeplink targets Google\'s documented Preferred Sources endpoint for the apex domain', () => {
  assert.equal(PREFERRED_SOURCE_DOMAIN, 'jurassicenglish.com');
  assert.equal(
    PREFERRED_SOURCE_DEEPLINK,
    'https://www.google.com/preferences/source?q=jurassicenglish.com',
  );
});

test('enhanced in-page flow is OFF unless VITE_PREFERRED_SOURCE_ENHANCED is set', () => {
  // Security-preserving default: no third-party script / CSP change is needed.
  assert.equal(isEnhancedFlowEnabled(), false);
});

test('ensurePreferredSource resolves null without a DOM (SSR / crawler / test env)', async () => {
  const api = await ensurePreferredSource();
  assert.equal(api, null); // → button stays in deeplink mode; never throws
  assert.ok(['idle', 'disabled'].includes(preferredSourceState()));
});
