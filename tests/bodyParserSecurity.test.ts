import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { gzipSync } from 'node:zlib';
import { request } from 'node:http';
import type { AddressInfo } from 'node:net';

// Regression for GHSA-27r3-jxmh-p828: malformed bytes following a compressed
// request must not crash the process or leave the JSON parser unavailable.
test('JSON parser survives trailing compressed-body bytes and accepts the next request', async () => {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.post('/json', (_req, res) => { res.status(204).end(); });
  app.use((_error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(400).json({ error: 'invalid_body' });
  });
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const port = (server.address() as AddressInfo).port;
  const send = (body: Buffer) => new Promise<number>((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port, path: '/json', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip', 'Content-Length': body.length },
      timeout: 3000 }, (res) => { res.resume(); res.on('end', () => resolve(res.statusCode ?? 0)); });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('local_parser_timeout')));
    req.end(body);
  });
  try {
    const malformed = Buffer.concat([gzipSync('{"ok":true}'), Buffer.from('invalid gzip trailing bytes')]);
    assert.equal(await send(malformed), 400);
    assert.equal(await send(gzipSync('{"ok":true}')), 204);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
