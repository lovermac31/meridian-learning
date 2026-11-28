import test from 'node:test';
import assert from 'node:assert/strict';
import { prefersVietnamese, vietnameseBannerTarget } from '../src/lib/languageBanner.ts';
import { getUiString } from '../src/i18n/ui/index.ts';

test('only a browser whose first preferred language is Vietnamese qualifies', () => {
  assert.equal(prefersVietnamese(['vi-VN', 'en-US'], 'vi-VN'), true);
  assert.equal(prefersVietnamese(['vi'], undefined), true);
  assert.equal(prefersVietnamese(undefined, 'vi_VN'), true);
  assert.equal(prefersVietnamese(['en-US', 'vi'], 'en-US'), false, 'Vietnamese as a second language is not a signal');
  assert.equal(prefersVietnamese(['en-US'], 'en-US'), false);
  assert.equal(prefersVietnamese(['vivid'], 'vivid'), false, 'a language code that merely starts with vi does not match');
  assert.equal(prefersVietnamese([], ''), false);
  assert.equal(prefersVietnamese(undefined, undefined), false);
});

test('the banner offers the matching Vietnamese page only on a released English page and keeps query and hash', () => {
  const vn = ['vi-VN'];
  assert.equal(vietnameseBannerTarget('/', vn, 'vi-VN', false), '/vi');
  assert.equal(vietnameseBannerTarget('/products?utm_source=facebook#top', vn, 'vi-VN', false), '/vi/products?utm_source=facebook#top');
  assert.equal(vietnameseBannerTarget('/vi', vn, 'vi-VN', false), null, 'already Vietnamese');
  assert.equal(vietnameseBannerTarget('/vi/products', vn, 'vi-VN', false), null, 'already Vietnamese');
  assert.equal(vietnameseBannerTarget('/', ['en-US'], 'en-US', false), null, 'English browsers never see it, which includes crawlers');
  assert.equal(vietnameseBannerTarget('/', vn, 'vi-VN', true), null, 'dismissed');
  assert.equal(vietnameseBannerTarget('/portal', vn, 'vi-VN', false), null, 'private or unlocalised routes get no offer');
  assert.equal(vietnameseBannerTarget('/this-page-does-not-exist', vn, 'vi-VN', false), null, 'no released Vietnamese twin, no offer');
});

test('the banner strings exist in both dictionaries', () => {
  for (const locale of ['en', 'vi'] as const) {
    for (const key of ['ariaLabel', 'message', 'action', 'dismiss']) {
      assert.ok(getUiString(locale, `languageBanner.${key}`).length > 0, `${locale} ${key}`);
    }
  }
  assert.equal(getUiString('vi', 'languageBanner.message'), 'Xem trang này bằng tiếng Việt');
});
