import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { PRODUCTS, productSampleFiles } from '../src/i18n/content/products';
import { SAMPLE_PAGE_COUNTS, SAMPLE_PAGE_REVISIONS } from '../src/i18n/content/samplePages';
import { fetchSampleText, SAMPLE_TEXT_MAX_BYTES, validateSampleText } from '../src/lib/sampleText';
const fixture = () => JSON.parse(readFileSync('public/samples/pages/story-club-text.json', 'utf8'));

test('all 35 products expose exactly their 361 approved public sample pages, with bound image and text hashes', () => {
  const sha = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
  const products = PRODUCTS.filter(p => p.live);
  assert.equal(products.length, 35);
  assert.equal(readdirSync('public/samples/pages').filter(p => p.endsWith('-text.json')).length, 35);
  let pages = 0, ocr = 0;
  for (const product of products) {
    const count = SAMPLE_PAGE_COUNTS[product.sample!];
    const doc = validateSampleText(JSON.parse(readFileSync(`public/samples/pages/${product.id}-text.json`, 'utf8')), product.id, product.sample!, count);
    const images = readdirSync('public/samples/pages').filter(p => p.startsWith(`${product.sample}-pg`) && p.endsWith('.webp')).sort();
    assert.deepEqual(doc.pages.map(p => p.image), images);
    for (const page of doc.pages) {
      assert.equal(page.imageSha256, sha(readFileSync(`public/samples/pages/${page.image}`)));
      assert.equal(page.textSha256, sha(page.text));
      if (page.method === 'pdf-text+reviewed-ocr') ocr++;
    }
    pages += doc.pageCount;
  }
  assert.equal(pages, 361);
  assert.equal(ocr, 14);
  assert.equal(readdirSync('public/samples').filter(p => p.endsWith('.pdf')).length, 0, 'no sample PDF is published');
});

test('sample schema rejects full-edition provenance, extra pages/content fields, wrong order and unknown methods', () => {
  const changes = [
    (d: any) => { d.source.file = 'Story Club Licensed edition.pdf'; },
    (d: any) => { d.source.file = '/private/story-club-sample.pdf'; },
    (d: any) => { d.pages.push(d.pages[0]); },
    (d: any) => { d.fullEditionText = 'must not be accepted'; },
    (d: any) => { d.pages[0].privateText = 'must not be accepted'; },
    (d: any) => { d.pages[0].page = 2; },
    (d: any) => { d.pages[0].image = '../other.webp'; },
    (d: any) => { d.pages[0].method = 'full-edition'; },
    (d: any) => { d.pages[0].text = ''; },
  ];
  for (const change of changes) { const d = fixture(); change(d); assert.throws(() => validateSampleText(d, 'story-club', 'story-club', 8), /Invalid sample text/); }
});

test('sample fetch is bounded, same-origin/no-redirect, schema checked, and aborts when the viewer closes', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = (async (url, options) => {
    assert.equal(url, '/samples/pages/story-club-text.json');
    assert.equal(options?.redirect, 'error');
    assert.equal(options?.cache, 'no-cache', 'text is revalidated across deployments');
    return new Response(JSON.stringify(fixture()), { headers: { 'Content-Type': 'application/json' } });
  }) as typeof fetch;
  assert.equal((await fetchSampleText('story-club', 'story-club', 8)).pages.length, 8);
  for (const response of [new Response('', { status: 404 }), new Response('not json'), new Response('{}'), new Response('{}', { headers: { 'Content-Length': String(SAMPLE_TEXT_MAX_BYTES + 1) } }), new Response('x'.repeat(SAMPLE_TEXT_MAX_BYTES + 1))]) {
    globalThis.fetch = (async () => response) as typeof fetch;
    await assert.rejects(fetchSampleText('story-club', 'story-club', 8));
  }
  let aborted = false;
  globalThis.fetch = ((_url, options) => new Promise((_resolve, reject) => {
    options?.signal?.addEventListener('abort', () => { aborted = true; reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
  })) as typeof fetch;
  const close = new AbortController();
  const pending = fetchSampleText('story-club', 'story-club', 8, close.signal); close.abort();
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(aborted, true);
  await assert.rejects(fetchSampleText('../secret', 'story-club', 8), /Invalid sample text/);
});

test('build-time preparation rejects unknown/incomplete CLI arguments instead of treating them as source roots', () => {
  for (const args of [['--unexpected'], ['--source-root'], ['--source-root', '--generate'], ['--generate', '--verify-source']]) {
    const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/prepare-sample-text.mjs', ...args], { encoding: 'utf8', env: { ...process.env, JE_SAMPLE_SOURCE_ROOT: '' } });
    assert.notEqual(result.status, 0, args.join(' '));
    assert.match(result.stderr, /Unknown or incomplete|Choose generation/);
  }
});


test('only the seven approved changed viewer images receive content-bound browser cache revisions', () => {
  const expected = ['ielts-writing-teacher-pack-pg01.webp', 'parent-pack-l2-pg01.webp', 'parent-pack-l2-pg02.webp', 'parent-pack-l2-pg03.webp', 'parent-pack-l2-pg04.webp', 'parent-pack-l2-pg09.webp', 'parent-pack-l2-pg10.webp'];
  assert.deepEqual(Object.keys(SAMPLE_PAGE_REVISIONS).sort(), expected.sort());
  let revised = 0;
  for (const product of PRODUCTS) for (const url of productSampleFiles(product.sample!).pages) {
    const parsed = new URL(url, 'https://sample.test');
    const file = parsed.pathname.split('/').at(-1)!;
    assert.ok(readFileSync(`public${parsed.pathname}`).length > 0);
    if (expected.includes(file)) {
      const prefix = createHash('sha256').update(readFileSync(`public${parsed.pathname}`)).digest('hex').slice(0, 12);
      assert.equal(parsed.searchParams.get('v'), prefix); revised++;
    } else assert.equal(parsed.search, '', `${file}: unchanged browser URL`);
  }
  assert.equal(revised, 7);
});
