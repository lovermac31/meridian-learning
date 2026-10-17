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

test('Part 2 timer pages state they are not an official IELTS score', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { IeltsSpeakingTimerPage } = await import('../src/components/IeltsToolsPage');
  const en = renderToStaticMarkup(createElement(IeltsSpeakingTimerPage, { locale: 'en' }));
  const vi = renderToStaticMarkup(createElement(IeltsSpeakingTimerPage, { locale: 'vi' }));
  assert.ok(en.includes('not an official IELTS score'), 'EN timer carries the official-score disclaimer');
  assert.ok(vi.includes('không phải điểm IELTS chính thức'), 'VI timer carries the official-score disclaimer');
});

test('tool pages render the shared hero, language counterpart, and closing CTA', async () => {
  const { renderRoute } = await import('../src/entry-server');
  for (const [path, counterpart] of [
    ['/tools/ielts-band-score-calculator', '/vi/cong-cu/tinh-diem-ielts'],
    ['/vi/cong-cu/tinh-diem-ielts', '/tools/ielts-band-score-calculator'],
    ['/tools/ielts-speaking-part-2-timer', '/vi/cong-cu/dong-ho-ielts-speaking-part-2'],
    ['/vi/cong-cu/dong-ho-ielts-speaking-part-2', '/tools/ielts-speaking-part-2-timer'],
  ]) {
    const html = await renderRoute(path);
    assert.match(html, /insights-hero/, path);
    assert.match(html, /bg-jurassic-dark(?:\s|")/, path);
    assert.match(html, /ielts-tool-card/, path);
    assert.match(html, /insights-closing/, path);
    assert.ok(html.includes(`href="${counterpart}"`), path);
  }
});

test('rounding table and target planner agree with calculateOverallBand', async () => {
  const { roundAverage, minimumBandForTarget, AVERAGE_FRACTIONS } = await import('../src/lib/ieltsBand');
  assert.deepEqual(AVERAGE_FRACTIONS.map((f) => roundAverage(6 + f)), [6, 6, 6.5, 6.5, 6.5, 6.5, 7, 7]);
  assert.equal(minimumBandForTarget([7, 6.5, 6], 6.5), 5.5);
  assert.equal(minimumBandForTarget([6, 6, 6], 6.5), 7);
  assert.equal(minimumBandForTarget([9, 9, 9], 0), 0);
  assert.equal(minimumBandForTarget([5, 5, 5], 7.5), null);
  for (let a = 0; a <= 18; a += 1) for (let b = 0; b <= 18; b += 1) {
    const known = [a / 2, b / 2, 6];
    for (let t = 0; t <= 18; t += 1) {
      const m = minimumBandForTarget(known, t / 2);
      if (m === null) assert.ok(calculateOverallBand([...known, 9]) < t / 2);
      else { assert.ok(calculateOverallBand([...known, m]) >= t / 2); if (m > 0) assert.ok(calculateOverallBand([...known, m - 0.5]) < t / 2); }
    }
  }
});
