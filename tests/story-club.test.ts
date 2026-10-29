import test from 'node:test';
import assert from 'node:assert/strict';
import { getLocalizedPathname, resolveLocalizedRoute } from '../src/i18n/routing';
import { isPublicContentReleased } from '../src/i18n/content';
import { resolveRouteMetadata, getExpectedPublicIndexableRoutes } from '../src/lib/routeMetadata';
import { storyClubContent, STORY_CLUB_FREE_STORIES, STORY_CLUB_ZALO } from '../src/i18n/content/storyClub';

const EN = '/story-club';
const VI = '/vi/story-club';

test('story-club is released, indexable and paired EN/VI', () => {
  assert.equal(isPublicContentReleased(EN, 'vi'), true);
  assert.equal(getLocalizedPathname(EN, 'vi'), VI);
  assert.equal(resolveLocalizedRoute(VI).pathname, EN);
  const routes = getExpectedPublicIndexableRoutes();
  for (const route of [EN, VI]) {
    assert.ok(routes.includes(route), route);
    const m = resolveRouteMetadata(route);
    assert.equal(m.robots, 'index, follow');
    assert.equal(m.alternates?.find((a) => a.hrefLang === 'vi')?.href, `https://jurassicenglish.com${VI}`);
  }
});

test('both locales state the same price, seat cap and payment method', () => {
  for (const c of Object.values(storyClubContent)) {
    assert.equal(c.price.amount, '590.000₫');
    assert.match(c.price.seats, /6/);
    assert.match(c.price.note, /VietQR/);
  }
  assert.equal(storyClubContent.vi.faq.items.length, storyClubContent.en.faq.items.length);
});

test('talk buttons use attributed Zalo links; pages state the no-recording policy', async () => {
  const { renderRoute } = await import('../src/entry-server');
  for (const [route, counterpart, policy] of [
    [EN, VI, 'never recorded'],
    [VI, EN, 'không bao giờ được ghi âm, ghi hình'],
  ]) {
    const html = await renderRoute(route);
    const ctas = [...html.matchAll(/data-cta="story-club-zalo"/g)].length;
    assert.ok(ctas >= 3, `${route}: ${ctas} Zalo buttons`);
    assert.ok(html.includes('href="/go/zalo?utm_source=story-club&amp;utm_content=talk-to-jay"'), route);
    assert.ok(html.includes(`href="${counterpart}"`), `${route} links its counterpart`);
    assert.ok(html.includes(policy), route);
  }
  // The 1-to-1 link goes to the lesson checkout, not the IELTS page for ages 9–18.
  const en = await renderRoute(EN);
  const vi = await renderRoute(VI);
  assert.ok(en.includes('href="/ai-speaking/lessons"'), 'EN links the 1-to-1 lesson checkout');
  assert.ok(vi.includes('href="/ai-speaking/vi/lessons"'), 'VI links the VI 1-to-1 lesson checkout');
  for (const html of [en, vi]) {
    // Page body only: the site navbar links the IELTS page on every route.
    const body = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
    assert.ok(body.length > 0, 'main rendered');
    assert.ok(!body.includes('href="/young-learners-speaking/"') && !body.includes('href="/vi/luyen-noi-ielts/"'), 'no IELTS 9–18 link in the Story Club body');
  }
});

// W-1 (Jay, 27 Oct 2026): one quiet link under the price to the Level 1 story collection, in both languages.
test('under the price, one quiet link lets parents try a free story first (the Level 1 collection)', async () => {
  const { renderRoute } = await import('../src/entry-server');
  assert.deepEqual(STORY_CLUB_FREE_STORIES, {
    en: '/student-academy/stories?utm_source=storyclub#level-1',
    vi: '/vi/student-academy/stories?utm_source=storyclub#level-1',
  });
  for (const [route, href, label] of [
    [EN, '/student-academy/stories?utm_source=storyclub#level-1', 'Try a free story first'],
    [VI, '/vi/student-academy/stories?utm_source=storyclub#level-1', 'Đọc thử một truyện miễn phí trước'],
  ]) {
    const html = await renderRoute(route);
    const links = [...html.matchAll(/href="([^"]+)"[^>]*data-link="story-club-free-stories"[^>]*>([^<]+)</g)].map((m) => [m[1], m[2]]);
    assert.deepEqual(links, [[href, label]], route);
    const start = html.indexOf('class="story-price');
    assert.ok(html.slice(start, html.indexOf('</section>', start)).includes(`href="${href}"`), `${route}: the link sits in the price block`);
  }
});
