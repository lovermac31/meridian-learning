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
  for (const [locale, title] of [['en', 'Free: IELTS Speaking practice, 2 attempts'], ['vi', 'Miễn phí: luyện IELTS Speaking, 2 lượt thử']] as const) {
    setServerLocation(locale === 'vi' ? '/vi/products' : '/products');
    const html = amp(renderToStaticMarkup(createElement(ProductsPage, { locale })));
    const section = html.slice(html.indexOf('<section id="ielts"'), html.indexOf('</section>', html.indexOf('<section id="ielts"')));
    const card = section.indexOf('data-ielts-app-card');
    assert.ok(card > 0 && card < section.indexOf('data-ielts-group="speaking"'), `${locale}: above the Speaking group`);
    assert.ok(section.includes(`>${title}<`), `${locale}: title`);
    assert.ok(section.includes(`href="${ieltsAppHref('products', locale)}"`), `${locale}: entrance link`);
    assert.doesNotMatch(section.slice(card, section.indexOf('data-ielts-group="speaking"')), /<li |data-price=/, `${locale}: not a priced product card`);
    assert.equal((html.match(/<li [^>]*id="/g) ?? []).length, 42, `${locale}: 42 product cards (35, the five Story Workbooks, IELTS Reading and Listening)`);
  }
});
