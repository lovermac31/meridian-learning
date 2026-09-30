import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { resolveRouteMetadata } from '../src/lib/routeMetadata.ts';

type VercelConfig = {
  redirects?: Array<{
    source?: string;
    destination?: string;
    permanent?: boolean;
  }>;
};

test('/index.html permanently redirects to the canonical homepage', () => {
  const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8')) as VercelConfig;
  const redirect = config.redirects?.find((entry) => entry.source === '/index.html');

  assert.deepEqual(redirect, {
    source: '/index.html',
    destination: '/',
    permanent: true,
  });
});

test('AI Speaking addresses with a trailing slash redirect to the slash-less page instead of 404', () => {
  const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8')) as VercelConfig;
  const redirects = config.redirects ?? [];

  assert.deepEqual(redirects.find((entry) => entry.source === '/ai-speaking/'), {
    source: '/ai-speaking/',
    destination: '/ai-speaking',
    permanent: true,
  });
  assert.deepEqual(redirects.find((entry) => entry.source === '/ai-speaking/:path(.+)/'), {
    source: '/ai-speaking/:path(.+)/',
    destination: '/ai-speaking/:path',
    permanent: true,
  });
});

test('every forwarded section redirects its trailing-slash addresses to the slash-less page', () => {
  const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8')) as VercelConfig & {
    rewrites?: Array<{ source?: string; destination?: string }>;
  };
  const redirects = config.redirects ?? [];
  // Page sections are the single-segment prefixes with a "/<section>/:path*" rewrite. Asset prefixes
  // (/_next, /images/..., the hashed build folders) and /api are file or endpoint paths, not pages.
  const sections = (config.rewrites ?? [])
    .map((entry) => /^\/([a-z][a-z-]*)\/:path\*$/.exec(entry.source ?? '')?.[1])
    .filter((name): name is string => Boolean(name));

  assert.deepEqual([...sections].sort(), [
    'ai-speaking', 'book-diagnostic', 'digital-reasoning-engine', 'evidence',
    'interactive-demo', 'pilot', 'school-framework', 'student-academy',
  ]);
  for (const section of sections) {
    assert.deepEqual(
      redirects.find((entry) => entry.source === `/${section}/`),
      { source: `/${section}/`, destination: `/${section}`, permanent: true },
      `/${section}/`,
    );
    assert.deepEqual(
      redirects.find((entry) => entry.source === `/${section}/:path(.+)/`),
      { source: `/${section}/:path(.+)/`, destination: `/${section}/:path`, permanent: true },
      `/${section}/<page>/`,
    );
  }
});

test('pilot holding routes keep an internal app-shell rewrite after the index redirect', () => {
  const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8')) as VercelConfig & {
    rewrites?: Array<{ source?: string; destination?: string }>;
  };
  const rewrite = config.rewrites?.find((entry) => entry.source === '/pilot/:path*');

  assert.deepEqual(rewrite, {
    source: '/pilot/:path*',
    destination: '/',
  });
});

test('Search Console crawled-not-indexed examples retain strong indexability signals', () => {
  const expected = [
    ['https://jurassicenglish.com/vi/legal/terms', '/vi/legal/terms'],
    ['https://jurassicenglish.com/series/level-5-advanced', '/series/level-5-advanced'],
    ['https://jurassicenglish.com/legal/privacy', '/legal/privacy'],
  ] as const;

  for (const [canonical, route] of expected) {
    const metadata = resolveRouteMetadata(route);
    assert.equal(metadata.robots, 'index, follow', route);
    assert.equal(metadata.canonical, canonical, route);
    assert.ok(metadata.title.length > 20, route);
    assert.ok(metadata.description.length > 80, route);
  }
});
