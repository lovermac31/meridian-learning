import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as levelBooksModule from '../docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing/src/lib/academy/levelBooks.ts';

// The ecosystem app has no "type": "module", so tsx loads the file as CommonJS; read named exports via default.
type LevelBooks = typeof levelBooksModule;
const lb: LevelBooks = (levelBooksModule as unknown as { default?: LevelBooks }).default ?? levelBooksModule;
const { BOOKS_BASE_URL, LEVEL_BOOKS, bookHref, continueHref, coverSrc, levelHref } = lb;

const ECO = '../docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing/src';
const read = (p: string) => readFileSync(new URL(`${ECO}/${p}`, import.meta.url), 'utf8');
// The public game apps are hosted on vercel.app by design; any other vercel.app host is a preview leak.
const PUBLIC_VERCEL_APPS = /https:\/\/worldwise-(story|cognitive)-quest\.vercel\.app/g;
const LEAK = /localhost|127\.0\.0\.1|\.vercel\.app/;
const FORBIDDEN_HOSTS = { test: (text: string) => LEAK.test(text.replace(PUBLIC_VERCEL_APPS, '')) };

test('every Student Academy level maps to exactly two distinct original stories', () => {
  assert.deepEqual(LEVEL_BOOKS.map((l) => l.level), [1, 2, 3, 4, 5]);
  const ids = LEVEL_BOOKS.flatMap((l) => [...l.stories, ...l.extras].map((b) => b.id));
  assert.equal(new Set(ids).size, ids.length, 'no book is listed twice');
  for (const l of LEVEL_BOOKS) {
    assert.equal(l.stories.length, 2, `Level ${l.level} has two stories`);
    for (const b of l.stories) assert.ok(b.id && b.title, `Level ${l.level} story has id and title`);
  }
  assert.ok(LEVEL_BOOKS[0].extras.some((b) => b.id === 'lina-and-the-orchard-map'), 'Lina stays available in Level 1');
  assert.deepEqual(LEVEL_BOOKS.map((l) => l.accepted), [true, true, true, true, true]);
});

test('book links never point at localhost or a preview domain, and unaccepted levels never link', () => {
  assert.ok(!FORBIDDEN_HOSTS.test(BOOKS_BASE_URL), `BOOKS_BASE_URL must be a public home, got "${BOOKS_BASE_URL}"`);
  if (BOOKS_BASE_URL) assert.match(BOOKS_BASE_URL, /^https:\/\/[^/]+(\/[^/].*)?[^/]$/, 'https, no trailing slash');
  for (const l of LEVEL_BOOKS) {
    for (const b of l.stories) {
      if (!l.accepted || !BOOKS_BASE_URL) {
        assert.equal(bookHref(l, b), null);
        assert.equal(coverSrc(l, b), null);
      } else {
        assert.equal(bookHref(l, b), `${BOOKS_BASE_URL}/book.html#${b.id}`);
      }
    }
  }
});

test('card → level collection → Story Club, carrying only non-personal context', () => {
  for (const l of LEVEL_BOOKS) {
    assert.equal(levelHref(l.level), `/student-academy/stories#level-${l.level}`);
    assert.equal(continueHref(l.level), `/story-club/?level=${l.level}&src=academy`);
  }
  const card = read('components/student-academy/StudentAcademyOverhaul.tsx');
  assert.ok(card.includes('href={levelHref(lv.n)}'), 'each card opens its level');
  assert.match(card, /Open Level \{lv\.n\}/);
  assert.ok(!/>\s*(Order|Buy|Pay now)\b/i.test(card), 'no order/pay wording on the cards');
  assert.ok(!card.includes('noreferrer'));

  const stories = read('app/student-academy/stories/page.tsx');
  assert.ok(stories.includes('@/lib/academy/levelBooks'), 'collections read the central map');
  assert.ok(!stories.includes('book.html'), 'no hard-coded book links in the page');
  assert.ok(stories.includes('Continue with Mr. Jay') && stories.includes('Ask about a place'));
  assert.ok(!/Pay now/i.test(stories));
  assert.ok(!FORBIDDEN_HOSTS.test(stories + card));
});

test('Story Club tells older families Mr. Jay confirms a suitable option first (EN + VI)', async () => {
  const { renderRoute } = await import('../src/entry-server');
  const en = (await renderRoute('/story-club')).replace(/&amp;/g, '&');
  const vi = (await renderRoute('/vi/story-club')).replace(/&amp;/g, '&');
  assert.ok(en.includes('Mr. Jay will confirm a suitable option before you pay'));
  assert.ok(vi.includes('thầy Jay sẽ xác nhận lựa chọn phù hợp trước khi bạn thanh toán'));
  assert.ok(en.includes('href="/ai-speaking/lessons"') && en.includes('Ask about a place'));
  assert.ok(vi.includes('href="/ai-speaking/vi/lessons"') && vi.includes('Hỏi về một chỗ'));
  for (const html of [en, vi]) {
    assert.ok(!FORBIDDEN_HOSTS.test(html), 'no localhost or preview host on Story Club');
    assert.ok(!/Pay now|Thanh toán ngay/i.test(html));
  }
});
