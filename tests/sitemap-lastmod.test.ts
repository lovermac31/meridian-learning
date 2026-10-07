/**
 * Honest sitemap <lastmod> — scripts/lib/sitemap-lastmod.mjs.
 *
 * lastmod must come from the page's own source files, be omitted when history
 * is shallow/unavailable or the URL has no honest mapping, and never be one
 * date stamped on every URL.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createLastmodResolver,
  findMissingSourceFiles,
  getAllMappedSourceFiles,
  getRouteSourceFiles,
} from '../scripts/lib/sitemap-lastmod.mjs';
import { getExpectedPublicIndexableRoutes, getRewriteServedRoutes } from '../src/lib/routeMetadata';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('every mapped source file exists (a rename must update the map)', () => {
  assert.deepEqual(findMissingSourceFiles(ROOT), []);
});

test('every native sitemap route has a source mapping; rewrite-served routes have none', () => {
  const rewriteServed = new Set(getRewriteServedRoutes());
  for (const route of getExpectedPublicIndexableRoutes()) {
    const files = getRouteSourceFiles(route);
    if (rewriteServed.has(route)) {
      assert.equal(files, null, `${route} is served by another Vercel project`);
    } else {
      assert.ok(files && files.length > 0, `${route} needs an entry in scripts/lib/sitemap-lastmod.mjs`);
    }
  }

  assert.ok(getRouteSourceFiles('/young-learners-speaking/'));
  assert.ok(getRouteSourceFiles('/vi/luyen-noi-ielts/')?.includes('scripts/prerender-yl-vi.mjs'));
  assert.equal(getRouteSourceFiles('/ai-speaking'), null);
  assert.equal(getRouteSourceFiles('/ai-speaking/samples/basic'), null);
});

test('shared layout files never date a page', () => {
  const shared = [
    'src/App.tsx',
    'src/components/Navbar.tsx',
    'src/components/Footer.tsx',
    'src/lib/routeMetadata.ts',
    'index.html',
  ];
  const mapped = new Set(getAllMappedSourceFiles());
  for (const file of shared) assert.ok(!mapped.has(file), `${file} must not be mapped`);
});

test('VI routes use the same page sources as their EN counterpart', () => {
  assert.deepEqual(getRouteSourceFiles('/vi/framework'), getRouteSourceFiles('/framework'));
  assert.deepEqual(getRouteSourceFiles('/vi'), getRouteSourceFiles('/'));
  assert.deepEqual(
    getRouteSourceFiles('/vi/series/level-2-development/syllabus'),
    getRouteSourceFiles('/series/level-2-development/syllabus'),
  );
});

test('shallow or missing git history omits lastmod everywhere (never guesses)', () => {
  const shallow = createLastmodResolver({ runGit: () => 'true' });
  assert.equal(shallow.status, 'disabled');
  assert.match(shallow.reason ?? '', /shallow/);
  assert.equal(shallow.lastmodFor('/methodology'), null);

  const noGit = createLastmodResolver({
    runGit: () => {
      throw new Error('not a git repository');
    },
  });
  assert.equal(noGit.status, 'disabled');
  assert.equal(noGit.lastmodFor('/methodology'), null);
});

test('full history: per-page dates from each page’s own files; unknown → omitted', () => {
  const calls: string[][] = [];
  const datesByFile: Record<string, string> = {
    'src/components/MethodologyPage.tsx': '2026-04-22',
    'src/components/FrameworkExperience.tsx': '2026-09-01',
  };
  const resolver = createLastmodResolver({
    runGit: (args: string[]) => {
      calls.push(args);
      if (args[0] === 'rev-parse') return 'false';
      const files = args.slice(args.indexOf('--') + 1);
      const hit = files.map((file) => datesByFile[file]).find(Boolean);
      return hit ?? '';
    },
  });

  assert.equal(resolver.status, 'ok');
  assert.equal(resolver.lastmodFor('/methodology'), '2026-04-22');
  assert.equal(resolver.lastmodFor('/framework'), '2026-09-01');
  assert.equal(resolver.lastmodFor('/companies'), null, 'no commit found → omitted');

  const logCallsBefore = calls.filter((args) => args[0] === 'log').length;
  assert.equal(resolver.lastmodFor('/student-academy'), null);
  assert.equal(
    calls.filter((args) => args[0] === 'log').length,
    logCallsBefore,
    'unmapped URLs do not consult git',
  );
});
