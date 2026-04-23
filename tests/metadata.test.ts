import test from 'node:test';
import assert from 'node:assert/strict';
import { applyHeadMetadata } from '../src/lib/headManager';
import { resolveRouteMetadata } from '../src/lib/routeMetadata';

type ElementKind = 'meta' | 'link' | 'script';

class FakeElement {
  tagName: string;
  attributes = new Map<string, string>();
  parent: FakeHead | null = null;
  textContent = '';
  rel = '';
  href = '';
  name = '';
  content = '';
  type = '';

  constructor(tagName: ElementKind) {
    this.tagName = tagName;
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);

    if (name === 'rel') this.rel = value;
    if (name === 'href') this.href = value;
    if (name === 'name') this.name = value;
    if (name === 'content') this.content = value;
    if (name === 'property') this.attributes.set('property', value);
    if (name === 'type') this.type = value;
  }

  getAttribute(name: string) {
    if (name === 'rel') return this.rel || this.attributes.get(name) || null;
    if (name === 'href') return this.href || this.attributes.get(name) || null;
    if (name === 'name') return this.name || this.attributes.get(name) || null;
    if (name === 'content') return this.content || this.attributes.get(name) || null;
    if (name === 'type') return this.type || this.attributes.get(name) || null;
    return this.attributes.get(name) || null;
  }

  remove() {
    this.parent?.removeChild(this);
  }
}

class FakeHead {
  children: FakeElement[] = [];

  appendChild(element: FakeElement) {
    element.parent = this;
    this.children.push(element);
    return element;
  }

  removeChild(element: FakeElement) {
    this.children = this.children.filter((child) => child !== element);
    element.parent = null;
  }

  querySelector<T extends FakeElement>(selector: string): T | null {
    return (this.querySelectorAll(selector)[0] as T | undefined) ?? null;
  }

  querySelectorAll<T extends FakeElement>(selector: string): T[] {
    return this.children.filter((element) => matchesSelector(element, selector)) as T[];
  }
}

class FakeDocument {
  title = '';
  head = new FakeHead();
  documentElement = {
    lang: 'en',
  };

  createElement(tagName: ElementKind) {
    return new FakeElement(tagName);
  }
}

function matchesSelector(element: FakeElement, selector: string) {
  if (selector.startsWith('meta[name="')) {
    const name = selector.slice(11, -2);
    return element.tagName === 'meta' && element.name === name;
  }

  if (selector.startsWith('meta[property="')) {
    const property = selector.slice(15, -2);
    return element.tagName === 'meta' && element.getAttribute('property') === property;
  }

  if (selector === 'link[rel="canonical"]') {
    return element.tagName === 'link' && element.rel === 'canonical';
  }

  if (selector === 'link[rel="alternate"][data-seo-controlled="alternate"]') {
    return (
      element.tagName === 'link' &&
      element.rel === 'alternate' &&
      element.getAttribute('data-seo-controlled') === 'alternate'
    );
  }

  if (selector === 'script[type="application/ld+json"][data-seo-controlled="json-ld"]') {
    return (
      element.tagName === 'script' &&
      element.type === 'application/ld+json' &&
      element.getAttribute('data-seo-controlled') === 'json-ld'
    );
  }

  return false;
}

function installFakeDocument() {
  const document = new FakeDocument();
  (globalThis as unknown as { document?: FakeDocument }).document = document;
  return document;
}

test('resolver returns route-specific public metadata', () => {
  const home = resolveRouteMetadata('/');
  const framework = resolveRouteMetadata('/framework');
  const pilot = resolveRouteMetadata('/pilot-programme');
  const series = resolveRouteMetadata('/series/level-3-expansion');
  const stage = resolveRouteMetadata('/thinking-cycle/justify');
  const legal = resolveRouteMetadata('/legal/privacy');

  assert.equal(home.title, 'Critical Thinking Through Literature for Schools | Jurassic English™');
  assert.equal(home.canonical, 'https://jurassicenglish.com');
  assert.equal(home.robots, 'index, follow');
  assert.equal(home.jsonLd?.length, 2);

  assert.equal(framework.canonical, 'https://jurassicenglish.com/framework');
  assert.match(framework.description, /jurassic english™ framework integrates/i);
  assert.equal(framework.twitter.title, framework.title);
  assert.equal(framework.alternates?.[0]?.href, 'https://jurassicenglish.com/framework');

  assert.equal(pilot.canonical, 'https://jurassicenglish.com/pilot-programme');
  assert.equal(pilot.robots, 'index, follow');
  assert.match(pilot.description, /6-8 week/i);
  assert.equal(pilot.og.url, pilot.canonical);

  assert.equal(series.canonical, 'https://jurassicenglish.com/series/level-3-expansion');
  assert.match(series.description, /ages 10–12/i);
  assert.equal(series.og.url, series.canonical);

  assert.equal(stage.canonical, 'https://jurassicenglish.com/thinking-cycle/justify');
  assert.match(stage.description, /structured reasoning framework/i);

  assert.equal(legal.canonical, 'https://jurassicenglish.com/legal/privacy');
  assert.match(legal.description, /policy details/i);
});

test('resolver returns localized metadata for released Vietnamese home and framework routes', () => {
  const frameworkVi = resolveRouteMetadata('/vi/framework');
  const homeVi = resolveRouteMetadata('/vi');

  assert.equal(frameworkVi.canonical, 'https://jurassicenglish.com/vi/framework');
  assert.equal(frameworkVi.robots, 'index, follow');
  assert.equal(frameworkVi.og.url, 'https://jurassicenglish.com/vi/framework');
  assert.equal(frameworkVi.og.locale, 'vi_VN');
  assert.equal(homeVi.canonical, 'https://jurassicenglish.com/vi');
  assert.equal(homeVi.robots, 'index, follow');
  assert.equal(homeVi.og.url, 'https://jurassicenglish.com/vi');
  assert.equal(homeVi.og.locale, 'vi_VN');
});

test('resolver returns localized metadata for released Vietnamese series detail routes', () => {
  const seriesVi = resolveRouteMetadata('/vi/series/level-3-expansion');

  assert.equal(seriesVi.canonical, 'https://jurassicenglish.com/vi/series/level-3-expansion');
  assert.equal(seriesVi.robots, 'index, follow');
  assert.equal(seriesVi.og.locale, 'vi_VN');
  assert.match(seriesVi.title, /Cấp độ 3|Level 3/i);
  assert.match(seriesVi.description, /A2|B1/i);
});

test('resolver returns localized metadata for released Vietnamese syllabus routes', () => {
  const syllabusVi = resolveRouteMetadata('/vi/series/level-3-expansion/syllabus');

  assert.equal(syllabusVi.canonical, 'https://jurassicenglish.com/vi/series/level-3-expansion/syllabus');
  assert.equal(syllabusVi.robots, 'index, follow');
  assert.equal(syllabusVi.og.locale, 'vi_VN');
  assert.match(syllabusVi.title, /Đề cương Cấp độ 3: Mở rộng/);
  assert.match(syllabusVi.description, /A2|B1/i);
});

test('resolver returns localized metadata for released Vietnamese Thinking Cycle routes', () => {
  const compareVi = resolveRouteMetadata('/vi/thinking-cycle/compare');
  const stageVi = resolveRouteMetadata('/vi/thinking-cycle/justify');

  assert.equal(compareVi.canonical, 'https://jurassicenglish.com/vi/thinking-cycle/compare');
  assert.equal(compareVi.robots, 'index, follow');
  assert.equal(compareVi.og.locale, 'vi_VN');
  assert.match(compareVi.title, /Thinking Cycle|giai đoạn/i);

  assert.equal(stageVi.canonical, 'https://jurassicenglish.com/vi/thinking-cycle/justify');
  assert.equal(stageVi.robots, 'index, follow');
  assert.equal(stageVi.og.locale, 'vi_VN');
  assert.match(stageVi.title, /LẬP LUẬN|JUSTIFY/i);
});

test('resolver returns localized metadata for released Vietnamese legal routes', () => {
  const legalVi = resolveRouteMetadata('/vi/legal/privacy');

  assert.equal(legalVi.canonical, 'https://jurassicenglish.com/vi/legal/privacy');
  assert.equal(legalVi.robots, 'index, follow');
  assert.equal(legalVi.og.locale, 'vi_VN');
  assert.match(legalVi.title, /Chính sách quyền riêng tư/);
  assert.match(legalVi.description, /Jurassic English™/);
});

test('resolver keeps the available-soon route non-indexable in both locales', () => {
  const availableSoon = resolveRouteMetadata('/available-soon');
  const availableSoonVi = resolveRouteMetadata('/vi/available-soon');

  assert.equal(availableSoon.title, 'Available soon | Jurassic English™');
  assert.equal(availableSoon.robots, 'noindex, nofollow');
  assert.equal(availableSoon.canonical, undefined);

  assert.equal(availableSoonVi.title, 'Available soon | Jurassic English™');
  assert.equal(availableSoonVi.robots, 'noindex, nofollow');
  assert.equal(availableSoonVi.canonical, undefined);
  assert.equal(availableSoonVi.og.locale, 'vi_VN');
});

test('resolver returns available-soon metadata for unreleased Vietnamese institutional routes', () => {
  const worldwiseVi = resolveRouteMetadata('/vi/worldwise');
  const pilotVi = resolveRouteMetadata('/vi/pilot-programme');

  assert.equal(worldwiseVi.title, 'Available soon | Jurassic English™');
  assert.equal(worldwiseVi.description, 'This section is being prepared and will be available shortly.');
  assert.equal(worldwiseVi.robots, 'noindex, nofollow');
  assert.equal(worldwiseVi.canonical, undefined);

  assert.equal(pilotVi.title, 'Available soon | Jurassic English™');
  assert.equal(pilotVi.description, 'This section is being prepared and will be available shortly.');
  assert.equal(pilotVi.robots, 'noindex, nofollow');
  assert.equal(pilotVi.canonical, undefined);
});

test('resolver keeps the private route non-indexable and non-canonical', () => {
  const privateRoute = resolveRouteMetadata('/plans-pricing-access');
  const localizedPrivateRoute = resolveRouteMetadata('/vi/plans-pricing-access');
  const externalPortalRoute = resolveRouteMetadata('/external/pilot');
  const localizedExternalPortalRoute = resolveRouteMetadata('/vi/external/pilot');
  const internalPortalRoute = resolveRouteMetadata('/internal/pilot-requests');
  const localizedInternalPortalRoute = resolveRouteMetadata('/vi/internal/pilot-requests');

  assert.equal(privateRoute.robots, 'noindex, nofollow');
  assert.equal(privateRoute.canonical, undefined);
  assert.equal(privateRoute.jsonLd?.length ?? 0, 0);
  assert.equal(privateRoute.og.url, 'https://jurassicenglish.com/plans-pricing-access');

  assert.equal(localizedPrivateRoute.htmlLang, 'en');
  assert.equal(localizedPrivateRoute.title, privateRoute.title);
  assert.equal(localizedPrivateRoute.robots, 'noindex, nofollow');
  assert.equal(localizedPrivateRoute.canonical, undefined);
  assert.equal(localizedPrivateRoute.jsonLd?.length ?? 0, 0);
  assert.equal(localizedPrivateRoute.og.url, 'https://jurassicenglish.com/plans-pricing-access');

  assert.equal(externalPortalRoute.robots, 'noindex, nofollow');
  assert.equal(externalPortalRoute.canonical, undefined);
  assert.equal(externalPortalRoute.jsonLd?.length ?? 0, 0);
  assert.equal(externalPortalRoute.og.url, 'https://jurassicenglish.com/external/pilot');

  assert.equal(localizedExternalPortalRoute.htmlLang, 'en');
  assert.equal(localizedExternalPortalRoute.title, externalPortalRoute.title);
  assert.equal(localizedExternalPortalRoute.robots, 'noindex, nofollow');
  assert.equal(localizedExternalPortalRoute.canonical, undefined);
  assert.equal(localizedExternalPortalRoute.jsonLd?.length ?? 0, 0);
  assert.equal(localizedExternalPortalRoute.og.url, 'https://jurassicenglish.com/external/pilot');

  assert.equal(internalPortalRoute.robots, 'noindex, nofollow');
  assert.equal(internalPortalRoute.canonical, undefined);
  assert.equal(internalPortalRoute.jsonLd?.length ?? 0, 0);
  assert.equal(internalPortalRoute.og.url, 'https://jurassicenglish.com/internal/pilot-requests');

  assert.equal(localizedInternalPortalRoute.htmlLang, 'en');
  assert.equal(localizedInternalPortalRoute.title, internalPortalRoute.title);
  assert.equal(localizedInternalPortalRoute.robots, 'noindex, nofollow');
  assert.equal(localizedInternalPortalRoute.canonical, undefined);
  assert.equal(localizedInternalPortalRoute.jsonLd?.length ?? 0, 0);
  assert.equal(localizedInternalPortalRoute.og.url, 'https://jurassicenglish.com/internal/pilot-requests');
});

test('resolver keeps unknown routes non-indexable and non-canonical', () => {
  const unknown = resolveRouteMetadata('/definitely-not-a-route');
  const unknownVi = resolveRouteMetadata('/vi/definitely-not-a-route');

  assert.equal(unknown.title, 'Page not found | Jurassic English™');
  assert.equal(unknown.robots, 'noindex, nofollow');
  assert.equal(unknown.canonical, undefined);
  assert.equal(unknown.jsonLd?.length ?? 0, 0);

  assert.equal(unknownVi.title, 'Page not found | Jurassic English™');
  assert.equal(unknownVi.robots, 'noindex, nofollow');
  assert.equal(unknownVi.canonical, undefined);
  assert.equal(unknownVi.jsonLd?.length ?? 0, 0);
});

test('head manager replaces stale public metadata when navigating to a private route', () => {
  const document = installFakeDocument();

  applyHeadMetadata(resolveRouteMetadata('/framework'));

  assert.equal(document.documentElement.lang, 'en');
  assert.equal(document.title, 'Literature-Based Critical Thinking Framework | Jurassic English™');
  assert.equal(
    document.head.querySelector<FakeElement>('link[rel="canonical"]')?.href,
    'https://jurassicenglish.com/framework',
  );
  assert.equal(
    document.head.querySelectorAll('script[type="application/ld+json"][data-seo-controlled="json-ld"]').length,
    1,
  );

  applyHeadMetadata(resolveRouteMetadata('/plans-pricing-access'));

  assert.equal(document.documentElement.lang, 'en');
  assert.equal(document.title, 'Private Plans and Pricing Access | Jurassic English™');
  assert.equal(document.head.querySelector('link[rel="canonical"]'), null);
  assert.equal(
    document.head.querySelector<FakeElement>('meta[name="robots"]')?.content,
    'noindex, nofollow',
  );
  assert.equal(
    document.head.querySelectorAll('script[type="application/ld+json"][data-seo-controlled="json-ld"]').length,
    0,
  );
});

test('head manager stays idempotent for controlled tags', () => {
  const document = installFakeDocument();
  const metadata = resolveRouteMetadata('/get-started');

  applyHeadMetadata(metadata);
  applyHeadMetadata(metadata);

  assert.equal(document.documentElement.lang, 'en');
  assert.equal(document.head.querySelectorAll('meta[name="description"]').length, 1);
  assert.equal(document.head.querySelectorAll('meta[name="twitter:title"]').length, 1);
  assert.equal(document.head.querySelectorAll('meta[property="og:title"]').length, 1);
  assert.equal(document.head.querySelectorAll('link[rel="canonical"]').length, 1);
  assert.equal(
    document.head.querySelectorAll('script[type="application/ld+json"][data-seo-controlled="json-ld"]').length,
    1,
  );
});
