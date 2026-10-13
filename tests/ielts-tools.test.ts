import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateOverallBand } from '../src/lib/ieltsBand';
import { resolveLocalizedRoute, getLocalizedPathname } from '../src/i18n/routing';
import { resolveRouteMetadata, getExpectedPublicIndexableRoutes } from '../src/lib/routeMetadata';

test('IELTS rounding follows quarter and three-quarter boundaries', () => {
  assert.equal(calculateOverallBand([6, 6, 6, 7]), 6.5);
  assert.equal(calculateOverallBand([6, 6, 7, 8]), 7);
  assert.equal(calculateOverallBand([6, 6, 6, 6.5]), 6);
  assert.equal(calculateOverallBand([6, 6, 7, 7.5]), 6.5);
  assert.throws(() => calculateOverallBand([6, 6, 6, 6.25]), RangeError);
  assert.throws(() => calculateOverallBand([6, 6, 6]), RangeError);
});

test('all four tool routes are indexable with reciprocal alternates', () => {
  const pairs = [
    ['/tools/ielts-band-score-calculator', '/vi/cong-cu/tinh-diem-ielts'],
    ['/tools/ielts-speaking-part-2-timer', '/vi/cong-cu/dong-ho-ielts-speaking-part-2'],
  ];
  const routes = getExpectedPublicIndexableRoutes();
  for (const [en, vi] of pairs) {
    assert.equal(getLocalizedPathname(en, 'vi'), vi);
    assert.equal(resolveLocalizedRoute(vi).pathname, en);
    for (const route of [en, vi]) {
      assert.ok(routes.includes(route));
      const metadata = resolveRouteMetadata(route);
      assert.equal(metadata.robots, 'index, follow');
      assert.equal(metadata.alternates?.find((item) => item.hrefLang === 'en')?.href, `https://jurassicenglish.com${en}`);
      assert.equal(metadata.alternates?.find((item) => item.hrefLang === 'vi')?.href, `https://jurassicenglish.com${vi}`);
    }
  }
});
