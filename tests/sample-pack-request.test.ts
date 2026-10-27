import test from 'node:test';
import assert from 'node:assert/strict';
import { submitSamplePack } from '../src/lib/samplePackRequest';

test('sample request handles success, safe HTTP failures and stalled network without retrying', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  let calls = 0;
  globalThis.fetch = (async (url, options) => {
    calls++;
    assert.equal(url, '/api/sample-pack');
    assert.equal(options?.method, 'POST');
    assert.deepEqual(JSON.parse(String(options?.body)), { consent: true });
    return new Response('{}', { status: 200 });
  }) as typeof fetch;
  await submitSamplePack({ consent: true });
  assert.equal(calls, 1);
  for (const status of [400, 429, 502]) {
    globalThis.fetch = (async () => new Response('private upstream detail', { status })) as typeof fetch;
    await assert.rejects(submitSamplePack({}), { message: 'Sample request failed' });
  }
  let aborted = false;
  calls = 0;
  globalThis.fetch = ((_url, options) => new Promise((_resolve, reject) => {
    calls++;
    options?.signal?.addEventListener('abort', () => {
      aborted = true;
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  })) as typeof fetch;
  await assert.rejects(submitSamplePack({}, 10), { name: 'AbortError' });
  assert.equal(aborted, true);
  assert.equal(calls, 1, 'do not automatically duplicate a potentially completed lead');
});
