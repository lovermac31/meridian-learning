import test from 'node:test';
import assert from 'node:assert/strict';
import { hasSocialTrafficIntent } from '../src/lib/trafficIntent';

test('detects explicit social campaign intent', () => {
  assert.equal(
    hasSocialTrafficIntent({
      search: '?utm_source=facebook&utm_medium=paid_social',
      referrer: '',
    }),
    true,
  );
  assert.equal(
    hasSocialTrafficIntent({
      search: '?utm_source=newsletter&utm_medium=social',
      referrer: '',
    }),
    true,
  );
});

test('detects supported social referrers including subdomains', () => {
  assert.equal(
    hasSocialTrafficIntent({
      search: '',
      referrer: 'https://m.facebook.com/story.php?id=123',
    }),
    true,
  );
  assert.equal(
    hasSocialTrafficIntent({
      search: '',
      referrer: 'https://l.instagram.com/?u=https%3A%2F%2Fjurassicenglish.com',
    }),
    true,
  );
});

test('does not classify ordinary or malformed traffic as social', () => {
  assert.equal(
    hasSocialTrafficIntent({
      search: '?utm_source=google&utm_medium=organic',
      referrer: 'https://www.google.com/',
    }),
    false,
  );
  assert.equal(
    hasSocialTrafficIntent({
      search: '',
      referrer: 'not a URL',
    }),
    false,
  );
  assert.equal(
    hasSocialTrafficIntent({
      search: '',
      referrer: 'https://facebook.com.example.com/',
    }),
    false,
  );
});
