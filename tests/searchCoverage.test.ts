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
