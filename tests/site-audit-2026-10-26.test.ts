import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderRoute } from '../src/entry-server';
import { Footer } from '../src/components/Footer';
import { HomeOverhaul } from '../src/components/HomeOverhaul';
import { setServerLocation } from '../src/lib/ssrLocation';

// Site re-assessment, 26 Oct 2026 (Notion: "Re-assessment — 26 Oct 2026"). The home page is rendered component by
// component: the full "/" route loads the chat widget's .scss, which Node cannot import.
const noop = () => {};
const render = (path: string, component: Parameters<typeof createElement>[0]) => {
  setServerLocation(path);
  return renderToStaticMarkup(createElement(component, { onNavigate: noop }));
};

test('the footer links the IELTS band calculator, in the page language', async () => {
  assert.match(render('/', Footer), /href="\/tools\/ielts-band-score-calculator"[^>]*>IELTS Band Score Calculator</);
  assert.match(render('/vi', Footer), /href="\/vi\/cong-cu\/tinh-diem-ielts"[^>]*>Công cụ tính điểm IELTS</);
  // The country pages share the same footer.
  const india = (await renderRoute('/ielts-speaking-online/india')).match(/<footer\b[\s\S]*?<\/footer>/)?.[0] ?? '';
  assert.match(india, /href="\/tools\/ielts-band-score-calculator"[^>]*>IELTS Band Score Calculator</);
});

test('home pricing shows one starting price per path; the ongoing options are folded, closed, and still in the page', () => {
  for (const path of ['/', '/vi']) {
    const pricing = render(path, HomeOverhaul).match(/<section id="pricing-options"[\s\S]*?<\/section>/)?.[0] ?? '';
    const folds = [...pricing.matchAll(/<details class="group mt-4[^"]*">([\s\S]*?)<\/details>/g)].map(match => match[1]);
    assert.equal(folds.length, 3, path);
    for (const fold of folds) assert.match(fold, /<summary\b/, path);
    assert.doesNotMatch(pricing, /<details class="group mt-4[^"]*" open/, path);
    const visible = pricing.replace(/<details\b[\s\S]*?<\/details>/g, '');
    assert.ok(visible.includes('690.000₫'), path);
    for (const folded of ['5.600.000₫', '30.000.000₫', '55.200.000₫', '2.900.000₫']) {
      assert.ok(!visible.includes(folded), `${path}: ${folded} should be folded`);
      assert.ok(pricing.includes(folded), `${path}: ${folded} should stay in the page`);
    }
  }
});
