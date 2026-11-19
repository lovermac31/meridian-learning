import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRouteMetadata } from '../src/lib/routeMetadata';
import { PRODUCT_SEO } from '../src/i18n/content/productSeo';

test('home and catalogue describe English stories, workbooks and tutoring', () => {
  const home = resolveRouteMetadata('/');
  const catalogue = resolveRouteMetadata('/products');
  assert.match(home.title, /Storybooks.*Workbooks/);
  assert.match(home.description, /online English tutoring/);
  assert.match(catalogue.title, /English Workbooks, Storybooks/);
  assert.match(catalogue.description, /licences/);
  assert.doesNotMatch(home.title, /IELTS/);
  assert.doesNotMatch(PRODUCT_SEO['one-to-one'].en.title, /IELTS/);
});

test('discovery pages preserve real English and Vietnamese alternates and self canonicals', () => {
  for (const route of ['/', '/products', '/vi', '/vi/products']) {
    const meta = resolveRouteMetadata(route);
    assert.equal(meta.robots, 'index, follow');
    assert.equal(meta.canonical, `https://jurassicenglish.com${route === '/' ? '' : route}`);
    for (const lang of ['en', 'vi', 'x-default']) {
      assert.ok(meta.alternates?.some(item => item.hrefLang === lang), `${route}: ${lang}`);
    }
    assert.ok(meta.title.length <= 60);
    assert.ok(meta.description.length >= 120 && meta.description.length <= 160);
    assert.equal(meta.og.title, meta.title);
    assert.equal(meta.twitter.description, meta.description);
  }
});
