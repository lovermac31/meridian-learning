import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSpeedInsightsRoute } from '../src/lib/speedInsightsRoute';

test('normalizes static routes and strips query strings and hashes', () => {
  assert.equal(normalizeSpeedInsightsRoute('/'), '/');
  assert.equal(normalizeSpeedInsightsRoute('/get-started?interest=audit_sprint'), '/get-started');
  assert.equal(normalizeSpeedInsightsRoute('/discovery#agenda'), '/discovery');
  assert.equal(normalizeSpeedInsightsRoute('https://jurassicenglish.com/worldwise?utm_source=test'), '/worldwise');
});

test('normalizes dynamic curriculum and thinking-cycle routes to stable buckets', () => {
  assert.equal(normalizeSpeedInsightsRoute('/series/level-3-expansion'), '/series/[level]');
  assert.equal(
    normalizeSpeedInsightsRoute('/series/level-3-expansion/syllabus?download=true'),
    '/series/[level]/syllabus',
  );
  assert.equal(normalizeSpeedInsightsRoute('/thinking-cycle/justify'), '/thinking-cycle/[stage]');
  assert.equal(normalizeSpeedInsightsRoute('/thinking-cycle/compare'), '/thinking-cycle/compare');
});

test('preserves Vietnamese route context for localized public routes', () => {
  assert.equal(normalizeSpeedInsightsRoute('/vi'), '/vi');
  assert.equal(normalizeSpeedInsightsRoute('/vi/framework'), '/vi/framework');
  assert.equal(normalizeSpeedInsightsRoute('/vi/series/level-3-expansion'), '/vi/series/[level]');
  assert.equal(
    normalizeSpeedInsightsRoute('/vi/series/level-3-expansion/syllabus'),
    '/vi/series/[level]/syllabus',
  );
  assert.equal(normalizeSpeedInsightsRoute('/vi/thinking-cycle/justify'), '/vi/thinking-cycle/[stage]');
});

test('collapses private pricing variants and unknown routes safely', () => {
  assert.equal(
    normalizeSpeedInsightsRoute('/plans-pricing-access?token=secret-token'),
    '/plans-pricing-access',
  );
  assert.equal(
    normalizeSpeedInsightsRoute('/vi/plans-pricing-access?token=secret-token'),
    '/plans-pricing-access',
  );
  assert.equal(normalizeSpeedInsightsRoute('/unexpected/path?token=secret-token'), '/unknown');
  assert.equal(normalizeSpeedInsightsRoute('/vi/unreleased/path'), '/vi/unknown');
});
