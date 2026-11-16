import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS } from '../src/i18n/content/products';

// Jay, 17 Nov 2026: Thinking Expeditions Level 1 is sold at 190.000₫ with a ONE-LEARNER licence. Class use is a separate offer
// on Zalo; nothing on the card or its product page may grant one family, one classroom or a class at this price.
const ID = 'thinking-expeditions-l1';
const CLASS_GRANT = /one (family|classroom|class)\b|for (your|a) class\b|print for your own children or class|một gia đình|một lớp học|cho con hoặc lớp/i;

test('Thinking Expeditions L1: one-learner licence on the card, EN + VI, no classroom or family grant', () => {
  const p = PRODUCTS.find((entry) => entry.id === ID)!;
  assert.equal(p.price, '190.000₫');
  assert.ok(!p.paypal, 'no US$ price approved');
  assert.match(p.en.forWho, /One-learner licence: print for one child only\./);
  assert.match(p.vi.forWho, /Bản quyền cho một học viên: chỉ in cho một bé\./);
  for (const locale of ['en', 'vi'] as const) {
    const text = Object.values(p[locale]).join(' ') + ' ' + p.credit![locale];
    assert.doesNotMatch(text, CLASS_GRANT, `${locale}: no classroom or family grant`);
  }
});

test('Thinking Expeditions L1: the rendered product pages (EN + VI) carry the one-learner line and no classroom grant', async () => {
  const { renderRoute } = await import('../src/entry-server');
  for (const [route, line] of [['/products/thinking-expeditions-l1', 'One-learner licence'], ['/vi/products/thinking-expeditions-l1', 'Bản quyền cho một học viên']] as const) {
    const html = (await renderRoute(route)).replaceAll('&amp;', '&');
    const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
    assert.ok(main.includes(line), `${route}: licence line`);
    assert.doesNotMatch(main.replace(/Teachers and tutors can ask on Zalo about using it with a class\.|Giáo viên và gia sư muốn dùng cho lớp xin nhắn Zalo\./g, ''), CLASS_GRANT, `${route}: no classroom grant`);
  }
});
