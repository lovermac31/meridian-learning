import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { WORLDWISE_SITE_URL } from '../src/lib/contactConfig';
import { splitOnWorldWise } from '../src/lib/worldwiseLink';
import { createOrganizationJsonLd } from '../src/lib/structuredData';

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
