/**
 * Guard (25 Nov 2026 incident, PR 376): the serverless functions run as native ESM, which cannot resolve an extensionless
 * relative import. PR 376 shipped one inside src/i18n/content/holidaySets.ts, reached from api/sepay-webhook.ts through
 * src/config/payment.ts, and the webhook returned 500 in production. `npm run check:api-handlers` catches it, but it is not part
 * of `npm test`; this test walks every file reachable from api/ by relative imports and fails on any extensionless value import.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const importRe = /(?:^|\n)\s*(import|export)\s+(type\s+)?([^'"\n;]*?\s+from\s+)?['"](\.{1,2}\/[^'"]+)['"]/g;

function apiFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? apiFiles(full) : full.endsWith('.ts') ? [full] : [];
  });
}

test('every file reachable from api/ uses explicit extensions on relative value imports', () => {
  const seen = new Set<string>();
  const bad: string[] = [];
  const queue = apiFiles(path.join(root, 'api'));
  while (queue.length) {
    const file = queue.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(importRe)) {
      if (match[2]) continue; // import type / export type: erased at runtime
      const spec = match[4];
      if (!/\.(js|json|mjs)$/.test(spec)) { bad.push(`${path.relative(root, file)}: ${spec}`); continue; }
      const target = path.resolve(path.dirname(file), spec.replace(/\.js$/, '.ts'));
      if (spec.endsWith('.js') && existsSync(target)) queue.push(target);
    }
  }
  assert.ok(seen.size > 20, `walked ${seen.size} files`);
  assert.ok([...seen].some((f) => f.endsWith(path.join('src', 'i18n', 'content', 'holidaySets.ts'))), 'reaches the holiday-set copy through payment.ts');
  assert.deepEqual(bad, []);
});
