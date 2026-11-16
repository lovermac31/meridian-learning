import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderRoute } from '../src/entry-server';
import { Footer } from '../src/components/Footer';
import { HomeOverhaul } from '../src/components/HomeOverhaul';
import { setServerLocation } from '../src/lib/ssrLocation';

// Site re-assessment, 26 Oct 2026 (Notion: "Re-assessment — 26 Oct 2026"). The home page is rendered component by
// component: the full "/" route loads the chat widget's .scss, which Node cannot import.
const noop = () => {};
const render = (path: string, component: ComponentType<{ onNavigate: (path: string) => void }>) => {
  setServerLocation(path);
  return renderToStaticMarkup(createElement(component, { onNavigate: noop }));
};

test('the footer has one IELTS door to JurassicIELTS, in the page language, and no IELTS tool or country link', async () => {
  // IELTS migration P10: the calculator and every other IELTS page live on jurassicielts.com; the footer keeps a single tagged door.
  assert.match(render('/', Footer), /href="https:\/\/jurassicielts\.com\/\?utm_source=jurassicenglish&amp;utm_medium=footer&amp;utm_campaign=ielts-move"[^>]*>IELTS → JurassicIELTS</);
  assert.match(render('/vi', Footer), /href="https:\/\/jurassicielts\.com\/vi\/\?utm_source=jurassicenglish&amp;utm_medium=footer&amp;utm_campaign=ielts-move"[^>]*>IELTS → JurassicIELTS</);
  // The country pages share the same footer.
  const india = (await renderRoute('/ielts-speaking-online/india')).match(/<footer\b[\s\S]*?<\/footer>/)?.[0] ?? '';
  assert.match(india, /utm_medium=footer&amp;utm_campaign=ielts-move"[^>]*>IELTS → JurassicIELTS</);
  for (const footer of [render('/', Footer), render('/vi', Footer), india]) {
    assert.doesNotMatch(footer, /band-score-calculator|\/ielts-speaking-online|\/insights\/|\/tools\/ielts/);
    assert.equal((footer.match(/jurassicielts\.com\/(?:vi\/)?\?utm/g) ?? []).length, 1, 'one IELTS door');
  }
});

test('home pricing shows one starting price per path; the ongoing options are folded, closed, and still in the page', () => {
  for (const path of ['/', '/vi']) {
    const pricing = render(path, HomeOverhaul).match(/<section id="pricing-options"[\s\S]*?<\/section>/)?.[0] ?? '';
    const folds = [...pricing.matchAll(/<details class="group mt-4[^"]*">([\s\S]*?)<\/details>/g)].map(match => match[1]);
    assert.equal(folds.length, 2, path); // IELTS migration P10: the adult IELTS row left; IELTS is one JurassicIELTS card in the paths section
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
