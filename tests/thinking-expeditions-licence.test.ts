import { STARTERS_IDS } from '../src/i18n/content/startersFlags';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CT_LICENCE, PRODUCTS } from '../src/i18n/content/products';

// Jay, KING MASTER EXECUTION DIRECTIVE, 17 Nov 2026: Thinking Expeditions Levels 1 and 2 at 190.000₫ with a personal, ONE-LEARNER licence,
// verbatim. Nothing on the card, the product page or the checkout may grant one family, one classroom or a class at this price.
const IDS = ['thinking-expeditions-l1', 'thinking-expeditions-l2'] as const; // Level 2: same licence, same price (17 Nov 2026, D4)
const EN = "Personal licence — one learner. This digital workbook is licensed for use by one individual learner. A parent or guardian may assist that learner and print copies for that learner's personal educational use. This licence does not permit sharing, redistribution, resale, or reproduction for multiple learners, families, classrooms, schools or organisations. Separate licences are required for additional learners or classroom use.";
const VI = 'Giấy phép sử dụng cá nhân — một học viên. Sách bài tập điện tử này được cấp phép sử dụng cho một học viên duy nhất. Cha mẹ hoặc người giám hộ có thể hỗ trợ và in bản phục vụ việc học cá nhân của học viên đó. Giấy phép không cho phép chia sẻ, phân phối lại, bán lại hoặc sao chép để sử dụng cho nhiều học viên, gia đình, lớp học, trường học hoặc tổ chức. Cần có giấy phép riêng cho học viên bổ sung hoặc việc sử dụng trong lớp học.';
const CLASS_GRANT = /one (family|classroom|class)\b|for (your|a) class\b|own children or class|một gia đình|một lớp học|cho con hoặc lớp/i;
const amp = (s: string) => s.replaceAll('&amp;', '&').replaceAll('&#x27;', "'").replaceAll('&#39;', "'").replaceAll('<!-- -->', '');
const mainOf = (html: string) => html.slice(html.indexOf('<main'), html.indexOf('</main>'));

for (const ID of IDS) {
  test(`${ID}: the licence is Jay’s verbatim one-learner text, EN + VI`, () => {
    assert.equal(CT_LICENCE.en, EN);
    assert.equal(CT_LICENCE.vi, VI);
    const p = PRODUCTS.find((entry) => entry.id === ID)!;
    assert.equal(p.price, '190.000₫');
    assert.ok(!p.paypal, 'no US$ price approved');
    assert.deepEqual(p.licence, CT_LICENCE);
    assert.match(p.en.forWho, /Personal licence — one learner: for one learner’s personal use only\. Separate licences are required for additional learners or classroom use\./);
    assert.match(p.vi.forWho, /Giấy phép sử dụng cá nhân — một học viên: .*Cần có giấy phép riêng cho học viên bổ sung hoặc việc sử dụng trong lớp học\./);
    for (const locale of ['en', 'vi'] as const) {
      assert.doesNotMatch(Object.values(p[locale]).join(' ') + ' ' + p.credit![locale] + ' ' + p.licence![locale], CLASS_GRANT, `${locale}: no classroom or family grant`);
    }
  });

  test(`Thinking Expeditions ${ID}: product page (EN + VI) shows the full licence above the price and grants no classroom use`, async () => {
    const { renderRoute } = await import('../src/entry-server');
    for (const [route, text] of [[`/products/${ID}`, EN], [`/vi/products/${ID}`, VI]] as const) {
      const main = mainOf(amp(await renderRoute(route)));
      const at = main.indexOf(`data-licence="${ID}"`);
      assert.ok(at > 0 && main.includes(text), `${route}: full licence`);
      assert.ok(at < main.indexOf(`data-price="${ID}"`), `${route}: licence above the price`);
      assert.doesNotMatch(main, CLASS_GRANT, `${route}: no classroom grant`);
    }
  });

  test(`Thinking Expeditions ${ID}: checkout (EN + VI) shows the full licence before the payment step and in the pay step`, async () => {
    const { StoryClubReservePage } = await import('../src/components/StoryClubReservePage');
    for (const [locale, text] of [['en', EN], ['vi', VI]] as const) {
      // Before the payment code is created (the payment gate) and after (the memo + QR step).
      for (const initialMemo of [undefined, 'PR1C-AB12CD']) {
        const html = amp(renderToStaticMarkup(createElement(StoryClubReservePage, { locale, productId: ID, initialMemo })));
        const at = html.indexOf(`data-checkout-licence="${ID}"`);
        assert.ok(at > 0 && html.includes(text), `${locale} ${initialMemo ?? 'gate'}: licence in the checkout summary`);
        const pay = Math.max(html.indexOf('data-payment-gate'), html.indexOf('data-payment-instructions'));
        assert.ok(pay > at, `${locale} ${initialMemo ?? 'gate'}: licence before the payment section`);
        assert.doesNotMatch(html, CLASS_GRANT, `${locale}: no classroom grant`);
      }
      const other = renderToStaticMarkup(createElement(StoryClubReservePage, { locale, productId: 'student-workbook-l1', initialMemo: 'PR0Z-AB12CD' }));
      assert.ok(!other.includes('data-checkout-licence'), `${locale}: other products' checkout unchanged`);
    }
  });
}

test('licence lines appear only on products that set one (no other product changes its rights)', () => {
  // The Starters Practice Tests (27 Nov 2026, D8) set their own licence line (starters-honest-claims.test.ts pins its wording).
  assert.deepEqual(PRODUCTS.filter((p) => p.licence && !STARTERS_IDS.includes(p.id)).map((p) => p.id), [...IDS]);
  assert.deepEqual(PRODUCTS.filter((p) => p.licence && STARTERS_IDS.includes(p.id)).map((p) => p.id).sort(), [...STARTERS_IDS].sort());
});
