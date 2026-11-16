import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { createApp } from '../src/server/createApp.js';
import { resolveDistFile, vercelContentType, VERCEL_DEFAULT_CACHE_CONTROL } from '../src/server/vercelEdgeRouter.js';
import type { VercelEdgeConfig } from '../src/server/vercelEdgeRouter.js';

// A dist tree shaped like the real build output.
const dist = mkdtempSync(path.join(tmpdir(), 'je-dist-'));
mkdirSync(path.join(dist, 'legal', 'privacy'), { recursive: true });
mkdirSync(path.join(dist, 'about', 'person'), { recursive: true });
mkdirSync(path.join(dist, 'images', 'student-academy-page'), { recursive: true });
mkdirSync(path.join(dist, 'assets'), { recursive: true });
writeFileSync(path.join(dist, 'index.html'), '<!doctype html><title>home</title>');
writeFileSync(path.join(dist, 'legal', 'privacy', 'index.html'), '<!doctype html><title>privacy</title>');
writeFileSync(path.join(dist, 'images', 'student-academy-page', 'local.png'), 'png');
writeFileSync(path.join(dist, 'assets', 'app-abc.js'), 'console.log(1)');
writeFileSync(path.join(dist, 'favicon.ico'), 'ico');

const edgeConfig: VercelEdgeConfig = {
  headers: [{ source: '/assets/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }],
  redirects: [{ source: '/index.html', destination: '/', permanent: true }],
  rewrites: [
    // An unreachable upstream: if the filesystem did not win, this request would fail with 502.
    { source: '/images/student-academy-page/:path*', destination: 'http://127.0.0.1:9/images/student-academy-page/:path*' },
    { source: '/pilot/:path*', destination: '/' },
    { source: '/proxied/:path*', destination: 'http://127.0.0.1:9/proxied/:path*' },
  ],
};

async function withApp(fn: (base: string, received: { body: string | null }) => Promise<void>) {
  const received = { body: null as string | null };
  const app = createApp({
    edgeConfig, distPath: dist, staging: true,
    // Stands in for a rewrite target: records the raw request body it receives.
    mountExtra: (router) => router.post('/raw-echo', (req, res) => {
      let data = ''; req.setEncoding('utf8'); req.on('data', (c) => { data += c; }); req.on('end', () => { received.body = data; res.json({ ok: true }); });
    }),
  });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  try { await fn(`http://127.0.0.1:${(server.address() as AddressInfo).port}`, received); }
  finally { await new Promise((r) => server.close(r)); }
}

test('a directory is served from its index.html with and without the trailing slash (no redirect)', async () => {
  await withApp(async (base) => {
    for (const p of ['/legal/privacy', '/legal/privacy/']) {
      const res = await fetch(base + p, { redirect: 'manual' });
      assert.equal(res.status, 200, p);
      assert.equal(res.headers.get('content-type'), 'text/html; charset=utf-8');
      assert.match(await res.text(), /privacy/);
    }
  });
});

test('unknown paths are a Vercel-style 404, never the SPA shell', async () => {
  await withApp(async (base) => {
    for (const p of ['/no-such-page', '/about', '/about/', '/assets/missing.js', '/api/no-such-endpoint']) {
      const res = await fetch(base + p, { redirect: 'manual' });
      assert.equal(res.status, 404, p);
      assert.equal(res.headers.get('content-type'), 'text/plain; charset=utf-8', p);
      assert.match(await res.text(), /NOT_FOUND/);
    }
  });
});

test('the filesystem answers before a rewrite (a real file is never proxied)', async () => {
  await withApp(async (base) => {
    const res = await fetch(base + '/images/student-academy-page/local.png');
    assert.equal(res.status, 200);
    assert.equal(await res.text(), 'png');
  });
});

test('an internal rewrite is looked up in the filesystem again', async () => {
  await withApp(async (base) => {
    const res = await fetch(base + '/pilot/anything');
    assert.equal(res.status, 200);
    assert.match(await res.text(), /home/);
  });
});

test('redirects run before the filesystem', async () => {
  await withApp(async (base) => {
    const res = await fetch(base + '/index.html', { redirect: 'manual' });
    assert.equal(res.status, 308);
    assert.equal(res.headers.get('location'), '/');
  });
});

test('Vercel default Cache-Control applies when nothing else sets one; header rules win', async () => {
  await withApp(async (base) => {
    assert.equal((await fetch(base + '/favicon.ico')).headers.get('cache-control'), VERCEL_DEFAULT_CACHE_CONTROL);
    assert.equal((await fetch(base + '/assets/app-abc.js')).headers.get('cache-control'), 'public, max-age=31536000, immutable');
    assert.equal((await fetch(base + '/favicon.ico')).headers.get('content-type'), 'image/vnd.microsoft.icon');
    assert.equal((await fetch(base + '/')).headers.get('x-robots-tag'), 'noindex, nofollow');
  });
});

test('a request body is not consumed before it reaches its handler (proxied POSTs keep their body)', async () => {
  await withApp(async (base, received) => {
    const body = JSON.stringify({ orderRef: 'JEAI000000', note: 'keep me' });
    const res = await fetch(base + '/raw-echo', { method: 'POST', headers: { 'content-type': 'application/json' }, body });
    assert.equal(res.status, 200);
    assert.equal(received.body, body);
  });
});

test('an unreachable rewrite upstream is a 502, not a hang or a crash', async () => {
  await withApp(async (base) => {
    const res = await fetch(base + '/proxied/x');
    assert.equal(res.status, 502);
  });
});

test('resolveDistFile never leaves dist', () => {
  for (const p of ['/../package.json', '/%2e%2e/package.json', '/legal/../../etc/passwd', '/%00', '/legal/privacy/%2e%2e/%2e%2e/%2e%2e/x']) {
    const file = resolveDistFile(dist, p);
    assert.ok(file === null || file.startsWith(dist + path.sep), `${p} -> ${file}`);
  }
  assert.equal(resolveDistFile(dist, '/legal/privacy'), path.join(dist, 'legal', 'privacy', 'index.html'));
  assert.equal(resolveDistFile(dist, '/about'), null);
});

test('content types match Vercel (lower-case charset, .ico media type)', () => {
  assert.equal(vercelContentType('/x/index.html'), 'text/html; charset=utf-8');
  assert.equal(vercelContentType('/x/app.js'), 'application/javascript; charset=utf-8');
  assert.equal(vercelContentType('/sitemap.xml'), 'application/xml');
  assert.equal(vercelContentType('/robots.txt'), 'text/plain; charset=utf-8');
  assert.equal(vercelContentType('/favicon.ico'), 'image/vnd.microsoft.icon');
});
