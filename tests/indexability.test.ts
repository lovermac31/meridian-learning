import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectHtml } from '../scripts/seo/indexability-check.mjs';
const url = 'https://jurassicenglish.com/example';
const fixture = `<html lang="en"><head><title>Example</title><meta name="description" content="A specific description"><link rel="canonical" href="${url}"></head><body><main><h1>Example</h1><p>${'Useful content '.repeat(100)}</p></main></body></html>`;
test('indexability accepts substantive canonical server HTML', () => {
  assert.deepEqual(inspectHtml(fixture, url).errors, []);
});
test('indexability rejects wrong canonical, noindex header, hidden shell and missing metadata', () => {
  assert.ok(inspectHtml(fixture.replace(url, url + '/other'), url).errors.includes('non-self-canonical'));
  assert.ok(inspectHtml(fixture, url, 'noindex').errors.includes('noindex'));
  assert.ok(inspectHtml(fixture.replace('</head>', '<meta name="googlebot" content="none"></head>'), url).errors.includes('noindex'));
  assert.ok(inspectHtml(fixture.replace(/<main>[\s\S]*<\/main>/, '<main><h1>Loading</h1></main>'), url).errors.includes('empty-or-placeholder-content'));
  assert.ok(inspectHtml(fixture.replace('<main>', '<main><div hidden>').replace('</main>', '</div></main>'), url).errors.includes('empty-or-placeholder-content'));
  assert.ok(inspectHtml(fixture.replace('name="description"', 'name="other"'), url).errors.includes('missing-description'));
});
test('indexability requires Vietnamese language for Vietnamese routes', () => {
  assert.ok(inspectHtml(fixture, 'https://jurassicenglish.com/vi/example').errors.includes('wrong-html-lang'));
});
