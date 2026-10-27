import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import * as levelBooksModule from '../docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing/src/lib/academy/levelBooks.ts';

// The ecosystem app has no "type": "module", so tsx loads the file as CommonJS; read named exports via default.
type LevelBooks = typeof levelBooksModule;
const lb: LevelBooks = (levelBooksModule as unknown as { default?: LevelBooks }).default ?? levelBooksModule;
const { BOOKS_BASE_URL, COVER_WIDTHS, LEVEL_BOOKS, STORY_HUB_ZALO, bookHref, continueHref, coverSrc, coverSrcSet, levelHref } = lb;

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

test('card → level collection → next step, carrying only non-personal context', () => {
  // Story Club is for ages 5–8 (Levels 1–2); Levels 3–5 go to Mr. Jay's Live Speaking Baseline, as in the books.
  for (const l of LEVEL_BOOKS) {
    assert.equal(levelHref(l.level), `/student-academy/stories#level-${l.level}`);
    if (l.level <= 2) {
      assert.equal(continueHref(l.level), `/story-club/?level=${l.level}&utm_source=academy`);
      assert.equal(continueHref(l.level, 'vi'), `/vi/story-club/?level=${l.level}&utm_source=academy`);
    } else {
      assert.equal(continueHref(l.level), `/ai-speaking/baseline?utm_source=academy&level=${l.level}`);
      assert.equal(continueHref(l.level, 'vi'), `/ai-speaking/vi/baseline?utm_source=academy&level=${l.level}`);
    }
    assert.doesNotMatch(continueHref(l.level), /[?&]src=/, 'utm_source, not src');
  }
  const card = read('components/student-academy/StudentAcademyOverhaul.tsx');
  assert.ok(card.includes('href={levelHref(lv.n)}'), 'each card opens its level');
  assert.match(card, /Open Level \{lv\.n\}/);
  assert.ok(!/>\s*(Order|Buy|Pay now)\b/i.test(card), 'no order/pay wording on the cards');
  assert.ok(!card.includes('noreferrer'));

  const stories = read('components/student-academy/LevelStories.tsx');
  assert.ok(stories.includes('@/lib/academy/levelBooks'), 'collections read the central map');
  assert.ok(!stories.includes('book.html'), 'no hard-coded book links in the page');
  // Website assessment, 27 Oct 2026, fix 10: the next step goes straight to Zalo (1 click), tagged story-hub.
  assert.ok(stories.includes('Continue with Mr. Jay') && stories.includes('Ask Mr. Jay on Zalo') && stories.includes('Nhắn thầy Jay qua Zalo'));
  assert.ok(stories.includes('href={STORY_HUB_ZALO}'));
  assert.equal(STORY_HUB_ZALO, 'https://zalo.me/84396085076?utm_source=story-hub');
  assert.ok(stories.includes('href={samplePackHref(locale)}'), 'the free sample pack band');
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

// W-1 (Jay, 27 Oct 2026): a Vietnamese twin of the story collections, same structure, served by a rewrite.
test('the story collections exist in English and Vietnamese with the same structure', () => {
  const en = read('app/(en)/student-academy/stories/page.tsx');
  const vi = read('app/(vi)/vi/student-academy/stories/page.tsx');
  assert.match(en, /<LevelStories locale="en" \/>/);
  assert.match(vi, /<LevelStories locale="vi" \/>/);
  assert.match(vi, /native read needed/i);
  const component = read('components/student-academy/LevelStories.tsx');
  for (const key of ['back', 'title', 'intro', 'continueCta', 'samplePack', 'samplePackCta', 'unsure', 'consultation']) {
    assert.equal((component.match(new RegExp(`^\\s+${key}:`, 'gm')) ?? []).length, 2, `${key} in EN and VI`);
  }
  assert.ok(component.includes('Nhắn thầy Jay qua Zalo') && component.includes('Tiếp tục cùng thầy Jay'));
  assert.ok(component.includes('samplePackHref(locale)'), 'the sample pack link follows the page language');
  const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.ok(
    vercel.rewrites.some((r: { source: string; destination: string }) => r.source === '/vi/student-academy/stories' && r.destination === 'https://je-ecosystem-landing-preview.vercel.app/vi/student-academy/stories'),
    'vercel.json serves /vi/student-academy/stories from the ecosystem app',
  );
});

// QA, 27 Oct 2026 (ecosystem-landing defects 2–4): the page language comes from the route, the contact panel renders the
// same text on the server and in the browser, and the story covers are small WebPs instead of 1440 px JPGs.
test('every page declares its own language: an English and a Vietnamese root layout share one shell', () => {
  assert.ok(!existsSync(new URL(`${ECO}/app/layout.tsx`, import.meta.url)), 'no single root layout with a hard-coded lang');
  assert.match(read('components/RootShell.tsx'), /<html lang=\{lang\} suppressHydrationWarning>/);
  assert.match(read('app/(en)/layout.tsx'), /<RootShell lang="en">/);
  assert.match(read('app/(vi)/layout.tsx'), /<RootShell lang="vi">/);
  const vi = readdirSync(new URL(`${ECO}/app/(vi)`, import.meta.url));
  assert.deepEqual(vi.sort(), ['layout.tsx', 'vi'], 'only /vi routes use the Vietnamese layout');
});

test('the contact panel takes its language from the route, never from window during render (React #418)', () => {
  const panel = read('components/GlobalContactPanel.tsx');
  assert.match(panel, /contactLocale\(usePathname\(\) \?\? '\/'\)/);
  assert.doesNotMatch(panel, /window\.location\.pathname/);
});

test('story covers are resized WebPs on a proxied path, with a srcset', () => {
  for (const l of LEVEL_BOOKS.filter((level) => level.accepted)) {
    for (const b of l.stories) {
      assert.equal(coverSrc(l, b), `/student-academy/covers/${b.id}-${COVER_WIDTHS[0]}.webp`);
      assert.equal(coverSrcSet(l, b), COVER_WIDTHS.map((w) => `/student-academy/covers/${b.id}-${w}.webp ${w}w`).join(', '));
      for (const w of COVER_WIDTHS) {
        const file = new URL(`${ECO}/../public/student-academy/covers/${b.id}-${w}.webp`, import.meta.url);
        assert.ok(existsSync(file), `${b.id}-${w}.webp`);
        assert.equal(readFileSync(file).subarray(8, 12).toString(), 'WEBP', `${b.id}-${w} is a WebP`);
        assert.ok(statSync(file).size < 90_000, `${b.id}-${w}: ${statSync(file).size} bytes`);
      }
    }
  }
  assert.match(read('components/student-academy/LevelStories.tsx'), /srcSet=\{coverSrcSet\(level, book\) \?\? undefined\} sizes=\{COVER_SIZES\}/);
});
