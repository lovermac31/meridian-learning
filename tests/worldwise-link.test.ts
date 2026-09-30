import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { WORLDWISE_SITE_URL } from '../src/lib/contactConfig';
import { splitOnWorldWise } from '../src/lib/worldwiseLink';
import { createOrganizationJsonLd } from '../src/lib/structuredData';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Footer } from '../src/components/Footer';
import { LinkifyWorldWise } from '../src/components/WorldWiseLink';

test('the WorldWise Learning site URL is the canonical www host over https', () => {
  assert.equal(WORLDWISE_SITE_URL, 'https://www.worldwiselearning.app');
});

test('splitOnWorldWise recognises both spellings in use on the site', () => {
  assert.deepEqual(splitOnWorldWise('© 2026 World Wise Learning. All rights reserved.'), {
    before: '© 2026 ',
    brand: 'World Wise Learning',
    after: '. All rights reserved.',
  });
  assert.deepEqual(splitOnWorldWise('reviewed by the WorldWise Learning team.'), {
    before: 'reviewed by the ',
    brand: 'WorldWise Learning',
    after: ' team.',
  });
});

test('splitOnWorldWise keeps the written spelling and leaves suffixes outside the link', () => {
  const parts = splitOnWorldWise('World Wise Learning Ltd');
  assert.equal(parts?.brand, 'World Wise Learning');
  assert.equal(parts?.after, ' Ltd');
});

test('splitOnWorldWise links only the first mention in a string', () => {
  const parts = splitOnWorldWise('World Wise Learning owns it. World Wise Learning.');
  assert.equal(parts?.before, '');
  assert.equal(parts?.after, ' owns it. World Wise Learning.');
});

test('splitOnWorldWise ignores the e-mail domain and unrelated text', () => {
  // A mailbox on a different TLD is not a reference to the website.
  assert.equal(splitOnWorldWise('legal@worldwiselearning.com'), null);
  assert.equal(splitOnWorldWise('Jurassic English™'), null);
  assert.equal(splitOnWorldWise(''), null);
});

test('organisation JSON-LD links the parent organisation to its website', () => {
  const org = createOrganizationJsonLd() as { parentOrganization?: { name?: string; url?: string } };
  assert.equal(org.parentOrganization?.name, 'World Wise Learning');
  assert.equal(org.parentOrganization?.url, WORLDWISE_SITE_URL);
});

test('no shipped source links to a retired or non-canonical WorldWise host', () => {
  const roots = ['src', 'young-learners-speaking', 'index.html'];
  const bad = /worldwise-learning-services\.vercel\.app|https?:\/\/worldwiselearning\.app|https?:\/\/(www\.)?worldwiselearning\.com/i;
  const offenders: string[] = [];
  const walk = (p: string) => {
    if (statSync(p).isDirectory()) {
      for (const name of readdirSync(p)) walk(join(p, name));
    } else if (/\.(tsx?|json|html|css)$/.test(p) && bad.test(readFileSync(p, 'utf8'))) {
      offenders.push(p);
    }
  };
  roots.forEach(walk);
  assert.deepEqual(offenders, []);
});

const ANCHOR_OPEN = `<a href="${WORLDWISE_SITE_URL}" target="_blank" rel="noopener noreferrer"`;

test('LinkifyWorldWise renders the mention as a safe, announced external link', () => {
  const html = renderToStaticMarkup(
    createElement(LinkifyWorldWise, { text: 'Published by World Wise Learning · Version 3.0' }),
  );
  assert.ok(html.startsWith(`Published by ${ANCHOR_OPEN}`), html);
  assert.ok(html.includes('>World Wise Learning<span class="sr-only"> (opens in a new tab)</span></a>'), html);
  assert.ok(html.endsWith(' · Version 3.0'), html);
  assert.ok(!html.includes('nofollow'), 'the parent organisation link must be followed');
});

test('LinkifyWorldWise leaves strings without the organisation name untouched', () => {
  for (const text of ['Jurassic English™', 'www.jurassicenglish.com', 'March 2026']) {
    assert.equal(renderToStaticMarkup(createElement(LinkifyWorldWise, { text })), text);
  }
});

test('the site footer links both organisation mentions', () => {
  const html = renderToStaticMarkup(createElement(Footer, {}));
  const links = html.split(ANCHOR_OPEN).length - 1;
  assert.equal(links, 2, 'copyright line + trademark line');
  // The legal mailbox stays a mailto on its own domain — it is not a website link.
  assert.ok(html.includes('href="mailto:legal@worldwiselearning.com"'));
});

test('the homepage hero publisher lockup links the WorldWise mark and name as one target', async () => {
  const { Hero } = await import('../src/components/Hero');
  const html = renderToStaticMarkup(createElement(Hero, { onNavigate: () => {} }));
  const anchor = html.match(new RegExp(`<a href="${WORLDWISE_SITE_URL}"[^>]*>(.*?)</a>`, 's'));
  assert.ok(anchor, 'hero renders a WorldWise Learning link');
  assert.match(anchor[0], /target="_blank"/);
  assert.match(anchor[0], /rel="noopener noreferrer"/);
  // The mark is decorative inside the link, so the accessible name is the publisher text.
  assert.match(anchor[1], /<img src="\/images\/worldwise-learning-mark\.webp" alt=""/);
  assert.match(anchor[1], /World Wise Learning/);
  assert.ok(statSync(join('public', 'images', 'worldwise-learning-mark.webp')).size > 0, 'mark asset ships');
});
