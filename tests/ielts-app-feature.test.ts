import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HomeOverhaul } from '../src/components/HomeOverhaul';
import { ProductsPage } from '../src/components/ProductsPage';
import { setServerLocation } from '../src/lib/ssrLocation';
import { ieltsAppHref } from '../src/lib/ieltsApp';

// The IELTS Speaking app as a main-page feature (Jay + CEO, 2 Nov 2026): one strip directly under the home hero and a
// free card on top of the /products IELTS group. Jay's wording only; practice, never a score. Header unchanged.
const amp = (s: string) => s.replaceAll('&amp;', '&');

test('home: no IELTS app banner or strip; IELTS is one JurassicIELTS card in the paths section, EN + VI (IELTS migration P10)', () => {
  for (const [path, title, door, appHref] of [
    ['/', 'IELTS on JurassicIELTS', 'https://jurassicielts.com/?utm_source=jurassicenglish&utm_medium=home&utm_campaign=ielts-move', ieltsAppHref('home', 'en')],
    ['/vi', 'IELTS tại JurassicIELTS', 'https://jurassicielts.com/vi/?utm_source=jurassicenglish&utm_medium=home&utm_campaign=ielts-move', ieltsAppHref('home', 'vi')],
  ] as const) {
    setServerLocation(path);
    const html = amp(renderToStaticMarkup(createElement(HomeOverhaul, { onNavigate: () => {} })));
    setServerLocation('/');
    assert.doesNotMatch(html, /data-ielts-app-(?:strip|banner|entrance)/, `${path}: no app strip, banner or card`);
    assert.doesNotMatch(html, /data-home-free-tools|band-score-calculator/, `${path}: no calculator link`);
    const paths = html.slice(html.indexOf('id="learning-paths"'), html.indexOf('</section>', html.indexOf('id="learning-paths"')));
    assert.ok(paths.includes(`>${title}<`), `${path}: the JurassicIELTS card`);
    assert.ok(paths.includes(`href="${door}"`), `${path}: the one door, tagged home`);
    assert.ok(paths.includes(`href="${appHref}"`), `${path}: free practice link`);
    assert.equal((html.match(/jurassicielts\.com\/(?:vi\/)?\?utm_source=jurassicenglish&utm_medium=home/g) ?? []).length, 1, `${path}: exactly one JurassicIELTS card`);
    assert.doesNotMatch(paths, /band \d|guarantee|score of/i);
  }
  assert.equal(ieltsAppHref('home'), 'https://app.jurassicielts.com/?utm_source=site&utm_medium=entrance&utm_content=home');
  for (const file of ['public/images/ielts-app-screen.webp', 'public/images/w/ielts-app-screen-640.webp']) assert.equal(readFileSync(file).subarray(8, 12).toString(), 'WEBP', file);
});

test('/products: the free IELTS app card tops the IELTS group with utm_content=products; prices and cards unchanged', () => {
  // IELTS migration P6: the IELTS group (with its free app card) left /products. #ielts is now the one moved card,
  // with no app card, no IELTS groups and no priced card; the free app stays reachable from the banner.
  for (const [locale, title, solutions] of [['en', 'Free: IELTS Speaking practice, 2 attempts', 'https://jurassicielts.com/solutions/?utm_source=jurassicenglish&utm_medium=moved'], ['vi', 'Miễn phí: luyện IELTS Speaking, 2 lượt thử', 'https://jurassicielts.com/vi/solutions/?utm_source=jurassicenglish&utm_medium=moved']] as const) {
    setServerLocation(locale === 'vi' ? '/vi/products' : '/products');
    const html = amp(renderToStaticMarkup(createElement(ProductsPage, { locale })));
    const section = html.slice(html.indexOf('<section id="ielts"'), html.indexOf('</section>', html.indexOf('<section id="ielts"')));
    assert.ok(section.includes('data-ielts-moved=""'), `${locale}: #ielts is the moved card`);
    assert.ok(!html.includes('data-ielts-app-card'), `${locale}: no in-catalogue IELTS app card`);
    assert.ok(!html.includes(`>${title}<`), `${locale}: no app card title`);
    assert.ok(!section.includes('data-ielts-group='), `${locale}: no IELTS groups`);
    assert.ok(section.includes(`href="${solutions}"`), `${locale}: the moved card links JurassicIELTS /solutions/`);
    assert.ok(html.includes(`href="${ieltsAppHref('products', locale)}"`), `${locale}: entrance link (banner)`);
    assert.doesNotMatch(section, /<li |data-price=/, `${locale}: not a priced product card`);
    assert.equal((html.match(/<li [^>]*id="/g) ?? []).length, 37, `${locale}: 37 product cards (Phonics Books 1 and 2, the five Story Workbooks, the Mango single workbook, the Reading & Reasoning single story, Thinking Expeditions Level 1 and the rest; the 14 IELTS cards moved to jurassicielts.com)`);
  }
});
