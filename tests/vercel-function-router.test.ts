import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { vercelFunctionRoutes } from '../src/server/vercelFunctionRouter.js';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('self-hosted API route table covers every Vercel function exactly once', async () => {
  const config = JSON.parse(await readFile(path.join(repositoryRoot, 'vercel.json'), 'utf8')) as {
    functions: Record<string, unknown>;
  };
  const expected = Object.keys(config.functions)
    .map((file) => `/${file.replace(/\.ts$/, '').replace(/\[([^\]]+)\]/g, ':$1')}`)
    .sort();
  const actual = vercelFunctionRoutes.map(({ path: route }) => route).sort();

  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, actual.length, 'route table must not contain duplicates');
});
