import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import cards from '../src/content/assetLinks.json';
import { seoPages } from '../src/lib/seoPages';
import { getExpectedPublicIndexableRoutes } from '../src/lib/routeMetadata';

test('asset inventory covers published IELTS SEO pages, with localized anchors and no kids cross-sell', () => {
  assert.equal(new Set(cards.map(card => card.path)).size, cards.length);
  for (const page of seoPages.filter(page => /\/ielts-speaking-online|\/insights\//.test(page.path))) {
    const card = cards.find(card => card.path === page.path);
    assert.ok(card, page.path);
    assert.equal(card.locale, page.locale);
  }
  const publicRoutes = new Set(getExpectedPublicIndexableRoutes());
  for (const card of cards) {
    assert.equal(card.links.length, 2, card.path);
    for (const link of card.links) {
      assert.ok(link.text.length > 15, 'descriptive anchor');
      const url = new URL(link.href, 'https://jurassicenglish.com');
      assert.equal(url.searchParams.get('utm_source'), 'jurassicenglish');
      assert.equal(url.searchParams.get('utm_medium'), 'internal');
      assert.equal(url.searchParams.get('utm_content'), card.path.slice(1).replaceAll('/', '-'));
      if (link.href.startsWith('/')) assert.ok(publicRoutes.has(url.pathname) || url.pathname === '/ai-speaking/baseline', link.href);
      else assert.ok(['books.jurassicenglish.com', 'worldwise-story-quest.vercel.app'].includes(url.hostname));
    }
    if (/ielts|insights|cong-cu/.test(card.path)) {
      assert.ok(card.links.some(link => link.href.startsWith('/ai-speaking/baseline?')));
      assert.ok(card.links.some(link => /\/products\/ielts-/.test(link.href)));
      assert.ok(card.links.every(link => !/books\.|story-quest|story-club/.test(link.href)));
    }
  }
});

test('embedded Academy inventory agrees with the review inventory and reserve CTAs specify age', () => {
  const nested = JSON.parse(readFileSync('docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing/src/lib/assetLinks.json', 'utf8'));
  assert.deepEqual(nested, cards.filter(card => card.path.includes('student-academy')));
  for (const card of nested) assert.match(card.links[0].text, /5–8/);
  for (const path of ['/student-academy/stories', '/vi/student-academy/stories', '/story-club', '/vi/story-club']) assert.ok(cards.some(card => card.path === path));
  const inventory = readFileSync('docs/seo/asset-links-2026-10-29.md', 'utf8');
  for (const card of cards) for (const link of card.links) assert.ok(inventory.includes(`| \`${card.path}\` | \`${link.href}\` | ${link.text} |`));
});
