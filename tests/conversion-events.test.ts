import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyConversionLink } from '../src/lib/conversionEvents';

test('Zalo, reserve and buy links map to conversion events; other links do not', () => {
  assert.deepEqual(classifyConversionLink('/go/zalo?utm_source=checkout&utm_content=talk-to-jay', {}, '/story-club'), { name: 'zalo_click', params: { page: '/story-club', link_content: 'talk-to-jay' } });
  assert.equal(classifyConversionLink('/en/story-club/reserve?utm_source=zalo', {}, '/story-club')?.name, 'reserve_click');
  assert.equal(classifyConversionLink('/story-club/reserve', {}, '/')?.name, 'reserve_click');
  assert.deepEqual(classifyConversionLink('/products/x', { buyNow: 'baseline' }, '/products'), { name: 'buy_click', params: { page: '/products', product_id: 'baseline' } });
  assert.equal(classifyConversionLink('/insights', {}, '/'), null);
  assert.equal(classifyConversionLink(null, {}, '/'), null);
  assert.equal(classifyConversionLink('https://example.com/go/zalo-not', {}, '/'), null);
});
