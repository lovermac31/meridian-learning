import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
// @ts-ignore Native ESM checker intentionally has no application dependencies.
import { checkBuild } from '../scripts/check-internal-links.mjs';

test('built link guard rejects soft 404s, missing assets/fragments and redirect loops', async () => {
  const fixture = await mkdtemp(path.join(tmpdir(), 'built-link-check-'));
  try {
    const dist = path.join(fixture, 'dist');
    await mkdir(path.join(dist, 'real'), { recursive: true });
    await mkdir(path.join(dist, 'assets'));
    await writeFile(path.join(dist, 'real/index.html'), '<h1 id="heading">Real page</h1><a href="../#home">Home</a>');
    await writeFile(path.join(dist, 'assets/site.css'), '.hero{background:url(/missing-background.webp)}');
    await writeFile(path.join(dist, 'index.html'), '<h1 id="home">Home</h1><a href="/real#heading">Valid</a><a href="/real#typo">Invalid fragment</a><a href="/typo">Soft 404</a><a href="/legacy">Redirect</a><a href="/loop">Loop</a><img src="/missing.webp" alt=""><link rel="stylesheet" href="/assets/site.css"><a href="/delegated/page">Other app</a><a href="/ai-speaking/baseline">Published upstream</a><a href="/ai-speaking/typo">Upstream typo</a>');
    await writeFile(path.join(dist, 'sitemap.xml'), '<urlset><url><loc>https://jurassicenglish.com/ai-speaking/baseline</loc></url></urlset>');
    const config = path.join(fixture, 'vercel.json');
    await writeFile(config, JSON.stringify({ redirects: [{ source: '/legacy', destination: '/real' }, { source: '/loop', destination: '/loop' }], rewrites: [{ source: '/ai-speaking/:path*', destination: 'https://example.com/ai-speaking/:path*' }, { source: '/delegated/:path*', destination: 'https://example.com/:path*' }, { source: '/:path*', destination: '/index.html' }] }));
    const report = await checkBuild(dist, config);
    assert.deepEqual(report.failures.map((f: { href: string }) => f.href).sort(), ['/ai-speaking/typo', '/loop', '/missing-background.webp', '/missing.webp', '/real#typo', '/typo']);
    assert.equal(report.delegated.length, 2, 'separate applications are explicit coverage, not fabricated local passes');
  } finally { await rm(fixture, { recursive: true, force: true }); }
});
