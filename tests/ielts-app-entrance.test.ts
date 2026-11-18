import test from 'node:test';
import assert from 'node:assert/strict';
import { seoPages, isInternationalMarketPath } from '../src/lib/seoPages';
import { ieltsAppHref } from '../src/lib/ieltsApp';

// The IELTS app entrance on the adult IELTS pages (Jay + CEO, 2 Nov 2026): country pages (every locale), insights
// articles and indexes, the two tools. Same wording as the home strip, utm_content=<page type>. Never on kids pages.
const amp = (s: string) => s.replaceAll('&amp;', '&');
const main = (html: string) => html.slice(html.indexOf('<main'), html.indexOf('</main>'));

test('country pages (all locales), insights pages and the two tools carry one entrance with the right utm_content', async () => {
  const { renderRoute } = await import('../src/entry-server');
  const targets: Array<[string, 'country' | 'insights' | 'tool', string]> = [
    ...seoPages.filter((p) => isInternationalMarketPath(p.path)).map((p): [string, 'country', string] => [p.path, 'country', p.locale === 'vi' ? '/ai-speaking/vi' : '/ai-speaking']),
    ...seoPages.filter((p) => p.path.includes('/insights/')).map((p): [string, 'insights', string] => [p.path, 'insights', p.locale === 'vi' ? '/ai-speaking/vi' : '/ai-speaking']),
    ['/insights', 'insights', '/ai-speaking'], ['/vi/insights', 'insights', '/ai-speaking/vi'],
    ['/insights/what-to-fix-first-in-ielts-speaking', 'insights', '/ai-speaking'],
    ['/tools/ielts-speaking-part-2-timer', 'tool', '/ai-speaking'], ['/tools/ielts-band-score-calculator', 'tool', '/ai-speaking'],
    ['/vi/cong-cu/dong-ho-ielts-speaking-part-2', 'tool', '/ai-speaking/vi'], ['/vi/cong-cu/tinh-diem-ielts', 'tool', '/ai-speaking/vi'],
  ];
  assert.ok(targets.length >= 40, `${targets.length} target pages`);
  for (const [path, placement, packs] of targets) {
    const html = amp(await renderRoute(path));
    assert.equal((html.match(/data-ielts-app-entrance="/g) ?? []).length, 1, `${path}: one entrance`);
    assert.ok(html.includes(`data-ielts-app-entrance="${placement}"`), `${path}: placement ${placement}`);
    const vi = path.startsWith('/vi');
    // Hand-checked answer pages carry their single entrance at the end of the page, tagged with the page slug.
    const answer = seoPages.find((p) => p.path === path)?.answer;
    assert.ok(html.includes(`href="${ieltsAppHref(placement, vi ? 'vi' : 'en', answer ? path.split('/').at(-1) : undefined)}" target="_blank" rel="noopener noreferrer"`), `${path}: entrance link`);
    assert.ok(html.includes(vi ? '>Người lớn 18+<' : '>Adults 18+<'), `${path}: adults label`);
    assert.ok(html.includes(`href="${packs}?utm_source=${placement}-ielts-app"`), `${path}: packs link`);
    assert.ok(html.includes('Practise with an AI examiner. 2 free attempts.') || html.includes('Luyện nói với giám khảo AI. 2 lượt thử miễn phí.'), `${path}: wording`);
    assert.ok(answer || html.indexOf('data-ielts-app-entrance') < html.indexOf('insights-content') || html.indexOf('data-ielts-app-entrance') < html.indexOf('ielts-tool-content'), `${path}: near the top, before the article`);
    assert.match(html, /<img src="\/images\/w\/ielts-app-screen-640\.webp"[^>]*width="640" height="400"/, `${path}: image box reserved`);
  }
  assert.equal(ieltsAppHref('country'), 'https://app.jurassicielts.com/?utm_source=site&utm_medium=entrance&utm_content=country');
});

test('no entrance on kids pages or people pages; the home has no IELTS app strip', async () => {
  const { renderRoute } = await import('../src/entry-server');
  for (const path of ['/story-club', '/vi/story-club', '/student-academy', '/vi/student-academy', '/student-academy/stories', '/about/nathaniel-jay-adams', '/vi/ve-thay-jay-adams', '/products', '/vi/products', '/products/story-club']) {
    const html = await renderRoute(path);
    assert.doesNotMatch(main(html), /data-ielts-app-entrance=/, `${path}: no entrance card`);
  }
  // Home ('/' lazy-loads BotUI, whose .scss cannot load under tsx): render the component. The banner sits above
  // the hero (first screen), the strip directly under it, both with the Adults 18+ label and locale-aware utm_content.
  const { HomeOverhaul } = await import('../src/components/HomeOverhaul');
  const { setServerLocation } = await import('../src/lib/ssrLocation');
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  for (const [path] of [['/', 'en'], ['/vi', 'vi']] as const) {
    setServerLocation(path);
    const html = amp(renderToStaticMarkup(createElement(HomeOverhaul, { onNavigate: () => {} })));
    setServerLocation('/');
    // IELTS migration P10: the home banner and strip left; the one JurassicIELTS card replaced them (see ielts-app-feature.test.ts).
    assert.equal((html.match(/data-ielts-app-banner/g) ?? []).length, 0, `${path}: no banner on home`);
    assert.equal((html.match(/data-ielts-app-strip/g) ?? []).length, 0, `${path}: no strip on home`);
    assert.equal((html.match(/data-ielts-app-entrance=/g) ?? []).length, 0, `${path}: no compact card on home`);
  }
  // /products: banner above the segment tiles, with the adults label. IELTS migration P6: the in-catalogue IELTS app
  // card left with the IELTS group; the one moved IELTS card stands in its place.
  for (const route of ['/products', '/vi/products']) {
    const html = amp(await renderRoute(route));
    assert.ok(html.indexOf('data-ielts-app-banner="products"') < html.indexOf('data-products-mini-nav'), `${route}: banner above the tiles`);
    assert.ok(!html.includes('data-ielts-app-card'), `${route}: no in-catalogue IELTS app card (IELTS moved to jurassicielts.com)`);
    assert.match(html, /<section id="ielts"[^>]*data-ielts-moved="">/, `${route}: the one moved IELTS card`);
    // The adults label now sits only on the banner (the in-catalogue card that carried data-ielts-app-adults is gone).
    assert.match(html, new RegExp(`data-ielts-app-banner="products">[\\s\\S]*?<span class="ielts-app-banner-adults">${route.startsWith('/vi') ? 'Người lớn 18\\+' : 'Adults 18\\+'}</span>`), `${route}: adults label`);
    assert.ok(html.includes(`href="${ieltsAppHref('products', route.startsWith('/vi') ? 'vi' : 'en')}"`), route);
  }
});
