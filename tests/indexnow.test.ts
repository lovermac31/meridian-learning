/**
 * IndexNow — key file + scripts/indexnow-submit.mjs. No network: fetch is
 * injected, so these tests prove the dry run sends nothing and --submit
 * never POSTs before the live key file checks out.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  INDEXNOW_KEY,
  KEY_LOCATION,
  MAX_URLS_PER_REQUEST,
  buildPayload,
  chunk,
  normalizeUrls,
  parseSitemapUrls,
} from '../scripts/lib/indexnow.mjs';
import { run } from '../scripts/indexnow-submit.mjs';

type Call = { url: string; init?: { method?: string; body?: string; headers?: Record<string, string> } };

function fakeFetch(responses: Record<string, { status: number; body?: string }>) {
  const calls: Call[] = [];
  const impl = async (url: string, init?: Call['init']) => {
    calls.push({ url, init });
    const hit = responses[url] ?? { status: 404, body: '' };
    return new Response(hit.body ?? '', { status: hit.status });
  };
  return { calls, impl };
}

const quiet = () => {};

test('key is 32 lowercase hex and the public key file contains exactly it', () => {
  assert.match(INDEXNOW_KEY, /^[0-9a-f]{32}$/);
  const contents = readFileSync(new URL(`../public/${INDEXNOW_KEY}.txt`, import.meta.url), 'utf8');
  assert.equal(contents.trim(), INDEXNOW_KEY);
  assert.equal(KEY_LOCATION, `https://jurassicenglish.com/${INDEXNOW_KEY}.txt`);
});

test('URL normalisation: paths become absolute, duplicates and hashes collapse, other hosts are refused', () => {
  assert.deepEqual(normalizeUrls(['/methodology', 'https://jurassicenglish.com/methodology', '/#top', '/vi/framework']), [
    'https://jurassicenglish.com/methodology',
    'https://jurassicenglish.com/',
    'https://jurassicenglish.com/vi/framework',
  ]);
  assert.throws(() => normalizeUrls(['https://www.jurassicenglish.com/x']), /must be https:\/\/jurassicenglish.com/);
  assert.throws(() => normalizeUrls(['http://jurassicenglish.com/x']));
  assert.throws(() => normalizeUrls(['https://je-ecosystem-landing-preview.vercel.app/student-academy']));
});

test('sitemap parsing, payload shape and the 10,000-URL batch limit', () => {
  const xml = '<urlset><url><loc>https://jurassicenglish.com/</loc></url><url>\n<loc> https://jurassicenglish.com/companies </loc></url></urlset>';
  assert.deepEqual(parseSitemapUrls(xml), ['https://jurassicenglish.com/', 'https://jurassicenglish.com/companies']);
  assert.deepEqual(buildPayload(['https://jurassicenglish.com/']), {
    host: 'jurassicenglish.com',
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: ['https://jurassicenglish.com/'],
  });
  const batches = chunk(Array.from({ length: MAX_URLS_PER_REQUEST + 1 }, (_, index) => index));
  assert.deepEqual(batches.map((batch) => batch.length), [MAX_URLS_PER_REQUEST, 1]);
});

test('dry run (default) makes no network request', async () => {
  const { calls, impl } = fakeFetch({});
  const result = await run(['/methodology', '/vi/framework'], { fetchImpl: impl, log: quiet });
  assert.equal(result?.submitted, false);
  assert.deepEqual(result?.urls, ['https://jurassicenglish.com/methodology', 'https://jurassicenglish.com/vi/framework']);
  assert.equal(calls.length, 0);
});

test('--submit refuses to POST when the live key file is not deployed', async () => {
  const { calls, impl } = fakeFetch({ [KEY_LOCATION]: { status: 404 } });
  await assert.rejects(run(['--submit', '/methodology'], { fetchImpl: impl, log: quiet }), /Live key file check failed/);
  assert.deepEqual(calls.map((call) => call.url), [KEY_LOCATION]);
});

test('--submit verifies the key file, then POSTs the JSON payload to api.indexnow.org', async () => {
  const { calls, impl } = fakeFetch({
    [KEY_LOCATION]: { status: 200, body: INDEXNOW_KEY },
    'https://api.indexnow.org/indexnow': { status: 202 },
  });
  const result = await run(['--submit', '/methodology', '/companies'], { fetchImpl: impl, log: quiet });
  assert.equal(result?.failed, false);
  assert.equal(calls.length, 2);
  const post = calls[1];
  assert.equal(post.url, 'https://api.indexnow.org/indexnow');
  assert.equal(post.init?.method, 'POST');
  assert.equal(post.init?.headers?.['Content-Type'], 'application/json; charset=utf-8');
  assert.deepEqual(JSON.parse(post.init?.body ?? '{}'), buildPayload([
    'https://jurassicenglish.com/methodology',
    'https://jurassicenglish.com/companies',
  ]));
});

test('--submit reports a rejected submission as a failure', async () => {
  const { impl } = fakeFetch({
    [KEY_LOCATION]: { status: 200, body: INDEXNOW_KEY },
    'https://api.indexnow.org/indexnow': { status: 403, body: 'key not valid' },
  });
  const result = await run(['--submit', '/methodology'], { fetchImpl: impl, log: quiet });
  assert.equal(result?.failed, true);
});
