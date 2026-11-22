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
