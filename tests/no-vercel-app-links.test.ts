/**
 * No vercel.app address on the production domain.
 *
 * Jay, 26 and 27 Oct 2026: everything moves to his own server, and no
 * visitor-facing page may link to a *.vercel.app host. This test fails on any
 * http(s) URL with a vercel.app host in the shipped sources: src/, public/
 * and index.html.
 *
 * Out of scope on purpose: vercel.json. Its rewrites still proxy some sections
 * to Vercel projects until those move (plan: .regen/command/OFF-VERCEL-PLAN.md
 * in the World Wide Learning workspace, Phase 3). Visitors never see those
 * addresses. Add vercel.json here once they are gone.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const TEXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.html', '.css', '.scss', '.md', '.txt', '.xml', '.svg', '.webmanifest']);
const VERCEL_URL = /https?:\/\/[a-z0-9.-]*\.vercel\.app\b/gi;

function* files(path: string): Generator<string> {
  if (statSync(path).isDirectory()) {
    for (const name of readdirSync(path)) {
      if (name === 'node_modules' || name.startsWith('.')) continue;
      yield* files(join(path, name));
    }
  } else if (TEXT.has(extname(path).toLowerCase())) {
    yield path;
  }
}

test('no vercel.app URL in src/, public/ or index.html', () => {
  const hits: string[] = [];
  for (const start of ['src', 'public', 'index.html']) {
    for (const file of files(join(ROOT, start))) {
      readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
        for (const m of line.matchAll(VERCEL_URL)) hits.push(`${relative(ROOT, file)}:${i + 1} ${m[0]}`);
      });
    }
  }
  assert.deepEqual(hits, [], `vercel.app URLs found (host them on Jay's server instead):\n${hits.join('\n')}`);
});

test('the homepage Story Quest link is on the jurassicenglish.com domain', async () => {
  const { STORY_QUEST_URL } = await import('../src/i18n/content/overhaul');
  assert.equal(new URL(STORY_QUEST_URL).hostname, 'story-quest.jurassicenglish.com');
});
