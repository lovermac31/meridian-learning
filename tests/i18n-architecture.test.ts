import test from 'node:test';
import assert from 'node:assert/strict';
import { isPublicContentReleased } from '../src/i18n/content';
import { isReleasedPublicLocale } from '../src/i18n/locales';
import {
  getLocalizedPathname,
  localizeRouteTarget,
  resolveLocalizedRoute,
  switchLocaleRoute,
} from '../src/i18n/routing';
import { getScaffoldedLocalizedRoutes, resolveRouteMetadata } from '../src/lib/routeMetadata';

test('language model keeps English as default released locale and Vietnamese as scaffold locale', () => {
  assert.equal(isReleasedPublicLocale('en'), true);
  assert.equal(isReleasedPublicLocale('vi'), false);
  assert.equal(isPublicContentReleased('/framework', 'en'), true);
  assert.equal(isPublicContentReleased('/framework', 'vi'), true);
  assert.equal(isPublicContentReleased('/', 'vi'), true);
  assert.equal(isPublicContentReleased('/get-started', 'vi'), true);
  assert.equal(isPublicContentReleased('/series/compare', 'vi'), true);
  assert.equal(isPublicContentReleased('/series/level-3-expansion', 'vi'), true);
  assert.equal(isPublicContentReleased('/series/level-3-expansion/syllabus', 'vi'), true);
  assert.equal(isPublicContentReleased('/thinking-cycle/compare', 'vi'), true);
  assert.equal(isPublicContentReleased('/thinking-cycle/justify', 'vi'), true);
  assert.equal(isPublicContentReleased('/legal/privacy', 'vi'), true);
});

test('localized route helpers preserve route context and protect private paths', () => {
  assert.equal(getLocalizedPathname('/framework', 'vi'), '/vi/framework');
  assert.equal(localizeRouteTarget('/framework?view=full#overview', 'vi'), '/vi/framework?view=full#overview');
  assert.equal(switchLocaleRoute('/vi/framework?view=full#overview', 'en'), '/framework?view=full#overview');
  assert.equal(localizeRouteTarget('/plans-pricing-access?token=abc', 'vi'), '/plans-pricing-access?token=abc');

  const resolved = resolveLocalizedRoute('/vi/series/level-3-expansion');
  assert.equal(resolved.locale, 'vi');
  assert.equal(resolved.pathname, '/series/level-3-expansion');
  assert.equal(resolved.isLocalizable, true);
});

test('released and scaffolded Vietnamese routes are separated correctly in metadata and prerender coverage', () => {
  const releasedHomeMetadata = resolveRouteMetadata('/vi');
  const releasedFrameworkMetadata = resolveRouteMetadata('/vi/framework');
  const releasedMetadata = resolveRouteMetadata('/vi/series/level-3-expansion');
  const releasedSyllabusMetadata = resolveRouteMetadata('/vi/series/level-3-expansion/syllabus');
  const releasedThinkingCycleCompareMetadata = resolveRouteMetadata('/vi/thinking-cycle/compare');
  const releasedThinkingCycleStageMetadata = resolveRouteMetadata('/vi/thinking-cycle/justify');
  const releasedLegalMetadata = resolveRouteMetadata('/vi/legal/privacy');
  const scaffoldedRoutes = getScaffoldedLocalizedRoutes();

  assert.equal(releasedHomeMetadata.robots, 'index, follow');
  assert.equal(releasedHomeMetadata.canonical, 'https://jurassicenglish.com/vi');
  assert.equal(releasedHomeMetadata.og.url, 'https://jurassicenglish.com/vi');
  assert.equal(releasedHomeMetadata.og.locale, 'vi_VN');
  assert.ok((releasedHomeMetadata.jsonLd?.length ?? 0) >= 1);
  assert.equal(releasedFrameworkMetadata.robots, 'index, follow');
  assert.equal(
    releasedFrameworkMetadata.canonical,
    'https://jurassicenglish.com/vi/framework',
  );
  assert.equal(releasedFrameworkMetadata.og.url, releasedFrameworkMetadata.canonical);
  assert.equal(releasedFrameworkMetadata.og.locale, 'vi_VN');
  assert.ok((releasedFrameworkMetadata.jsonLd?.length ?? 0) >= 1);

  assert.equal(releasedMetadata.robots, 'index, follow');
  assert.equal(
    releasedMetadata.canonical,
    'https://jurassicenglish.com/vi/series/level-3-expansion',
  );
  assert.equal(releasedMetadata.og.url, releasedMetadata.canonical);
  assert.equal(releasedMetadata.og.locale, 'vi_VN');
  assert.ok((releasedMetadata.jsonLd?.length ?? 0) >= 1);
  assert.equal(releasedSyllabusMetadata.robots, 'index, follow');
  assert.equal(
    releasedSyllabusMetadata.canonical,
    'https://jurassicenglish.com/vi/series/level-3-expansion/syllabus',
  );
  assert.equal(releasedSyllabusMetadata.og.locale, 'vi_VN');
  assert.equal(releasedThinkingCycleCompareMetadata.robots, 'index, follow');
  assert.equal(
    releasedThinkingCycleCompareMetadata.canonical,
    'https://jurassicenglish.com/vi/thinking-cycle/compare',
  );
  assert.equal(releasedThinkingCycleStageMetadata.robots, 'index, follow');
  assert.equal(
    releasedThinkingCycleStageMetadata.canonical,
    'https://jurassicenglish.com/vi/thinking-cycle/justify',
  );
  assert.equal(releasedLegalMetadata.robots, 'index, follow');
  assert.equal(releasedLegalMetadata.canonical, 'https://jurassicenglish.com/vi/legal/privacy');
  assert.equal(releasedLegalMetadata.og.locale, 'vi_VN');

  assert.equal(scaffoldedRoutes.includes('/vi'), false);
  assert.equal(scaffoldedRoutes.includes('/vi/framework'), false);
  assert.equal(scaffoldedRoutes.includes('/vi/series/level-3-expansion'), false);
  assert.equal(scaffoldedRoutes.includes('/vi/series/level-3-expansion/syllabus'), false);
  assert.equal(scaffoldedRoutes.includes('/vi/thinking-cycle/compare'), false);
  assert.equal(scaffoldedRoutes.includes('/vi/thinking-cycle/justify'), false);
  assert.equal(scaffoldedRoutes.includes('/vi/legal/privacy'), false);
  assert.equal(scaffoldedRoutes.includes('/vi'), false);
});
