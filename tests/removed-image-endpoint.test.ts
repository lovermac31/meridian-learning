import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

// The public Gemini image-generation endpoint was removed (security audit 16 Nov 2026, finding M3):
// it needed no sign-in and spent the Gemini key, and nothing on the site used it.
// These checks stop it, or anything like it, from coming back unnoticed.

const root = process.cwd();

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

test('the Vercel image route file is gone', () => {
  assert.equal(existsSync(join(root, 'api/generate-image.ts')), false);
  assert.equal(existsSync(join(root, 'api/generate-image.js')), false);
});

test('vercel.json does not configure or route to an image endpoint', () => {
  const v = readFileSync(join(root, 'vercel.json'), 'utf8');
  assert.equal(/generate-image/i.test(v), false);
});

test('the self-hosted Express server does not expose an image endpoint', () => {
  const s = readFileSync(join(root, 'server.ts'), 'utf8');
  assert.equal(/generate-image/i.test(s), false);
  assert.equal(/GoogleGenAI|@google\/genai/.test(s), false);
});

test('no shipped code calls an image endpoint or imports the Gemini SDK', () => {
  const files = [...walk(join(root, 'api')), ...walk(join(root, 'src')), ...walk(join(root, 'lib'))]
    .filter((f) => /\.(ts|tsx|js|jsx|mjs)$/.test(f));
  for (const f of files) {
    const text = readFileSync(f, 'utf8');
    assert.equal(/\/api\/generate-image/.test(text), false, `${f} still references the removed endpoint`);
    assert.equal(/@google\/genai/.test(text), false, `${f} still imports the Gemini SDK`);
  }
});

test('the Gemini SDK is no longer a dependency', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.equal(Boolean(pkg.dependencies?.['@google/genai'] || pkg.devDependencies?.['@google/genai']), false);
});
