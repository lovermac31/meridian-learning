import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PREFERRED_SOURCE_DOMAIN,
  PREFERRED_SOURCE_DEEPLINK,
} from '../src/lib/preferredSource';

test('deeplink targets Google\'s documented Preferred Sources endpoint for the apex domain', () => {
  assert.equal(PREFERRED_SOURCE_DOMAIN, 'jurassicenglish.com');
  assert.equal(
    PREFERRED_SOURCE_DEEPLINK,
    'https://www.google.com/preferences/source?q=jurassicenglish.com',
  );
});
