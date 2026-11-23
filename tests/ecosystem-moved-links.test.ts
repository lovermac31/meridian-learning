import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

// The ecosystem app has its own deployment, so the main build's link rewrite does not cover it.
test('ecosystem app links straight to JurassicIELTS for moved AI Speaking pages', () => {
  const root = 'docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing/src';
  for (const name of readdirSync(root, { recursive: true, encoding: 'utf8' })) {
    if (!/\.tsx?$/.test(name)) continue;
    assert.doesNotMatch(readFileSync(`${root}/${name}`, 'utf8'), /["'`](?:https:\/\/(?:www\.)?jurassicenglish\.com)?\/ai-speaking(?:[/?#"'`])/, name);
  }
});

// P10b: the Ages 9-18 Speaking pages moved to JurassicIELTS; the academy app (separate deploy) links there directly.
test('ecosystem app links straight to JurassicIELTS for the moved Ages 9-18 Speaking pages', () => {
  const root = 'docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing/src';
  let found = 0;
  for (const name of readdirSync(root, { recursive: true, encoding: 'utf8' })) {
    if (!/\.tsx?$/.test(name)) continue;
    const source = readFileSync(`${root}/${name}`, 'utf8');
    assert.doesNotMatch(source, /["'`](?:https:\/\/(?:www\.)?jurassicenglish\.com)?\/(?:young-learners-speaking|vi\/luyen-noi-ielts)(?:[/?#"'`])/, name);
    found += (source.match(/https:\/\/jurassicielts\.com\/(?:vi\/)?young-learners-speaking\//g) ?? []).length;
  }
  assert.ok(found >= 3, `expected the three academy links to the JI page, found ${found}`);
});
