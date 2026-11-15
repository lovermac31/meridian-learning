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

test('home: the IELTS app strip sits directly under the hero, EN + VI, with the entrance link and the packs link', () => {
  for (const [path, title, packs] of [['/', 'Practise with an AI examiner. 2 free attempts.', '/ai-speaking?utm_source=home-ielts-app'], ['/vi', 'Luyện nói với giám khảo AI. 2 lượt thử miễn phí.', '/ai-speaking/vi?utm_source=home-ielts-app']] as const) {
    setServerLocation(path);
    const html = amp(renderToStaticMarkup(createElement(HomeOverhaul, { onNavigate: () => {} })));
    setServerLocation('/');
    const hero = html.indexOf('</section>');
    const strip = html.indexOf('data-ielts-app-strip');
    assert.ok(strip > hero && strip < html.indexOf('data-home-tile'), `${path}: between the hero and the Find strip`);
    const block = html.slice(strip, html.indexOf('</section>', strip));
    assert.ok(block.includes(`>${title}<`), `${path}: headline`);
    assert.match(block, new RegExp(`href="${ieltsAppHref('home', path === '/vi' ? 'vi' : 'en').replace(/[?&.]/g, '\\$&')}" target="_blank" rel="noopener noreferrer"[^>]*data-cta="ielts-app-home"`), `${path}: entrance link`);
    assert.ok(block.includes(`href="${packs}"`), `${path}: packs link`);
    assert.match(block, /<img src="\/images\/ielts-app-screen\.webp"[^>]*alt="[^"]+"/, `${path}: labelled screenshot`);
    assert.doesNotMatch(block, /band \d|guarantee|score of/i);
  }
  assert.equal(ieltsAppHref('home'), 'https://ielts.jurassicenglish.com/?utm_source=site&utm_medium=entrance&utm_content=home');
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
    assert.equal((html.match(/<li [^>]*id="/g) ?? []).length, 35, `${locale}: 35 product cards (Phonics Books 1 and 2, the five Story Workbooks, the Mango single workbook and the rest; the 14 IELTS cards moved to jurassicielts.com)`);
  }
});
