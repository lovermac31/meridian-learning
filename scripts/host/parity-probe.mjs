#!/usr/bin/env node
// Fetches every path in a parity list once and records what the origin answered.
//   node scripts/host/parity-probe.mjs --paths parity-paths.json --base https://jurassicenglish.com --mode url --delay 1500 --out prod.json
//   node scripts/host/parity-probe.mjs --paths parity-paths.json --base http://127.0.0.1:3002 --host jurassicenglish.com --mode header --delay 50 --out staging.json
// mode url:    an entry with its own host is fetched at https://<host><path> (used for production).
// mode header: everything goes to --base, with the entry's host (or --host) in the Host header (used for an unexposed origin).
// Redirects are never followed. Bodies are requested uncompressed and hashed. One request at a time, --delay ms apart.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import http from 'node:http';
import https from 'node:https';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => (v.startsWith('--') ? [...a, [v.slice(2), all[i + 1]]] : a), []));
const entries = JSON.parse(readFileSync(args.paths, 'utf8'));
const base = new URL(args.base);
const mode = args.mode ?? 'url';
const delay = Number(args.delay ?? 1500);
const KEEP = ['content-type', 'location', 'cache-control', 'x-content-type-options', 'x-frame-options', 'referrer-policy', 'permissions-policy',
  'content-security-policy', 'x-robots-tag', 'strict-transport-security', 'content-length'];

function get(entry) {
  let url, hostHeader;
  if (mode === 'url' && entry.host) { url = new URL(`https://${entry.host}${entry.path}`); hostHeader = entry.host; }
  else { url = new URL(entry.path, base); hostHeader = entry.host ?? args.host ?? base.host; }
  const lib = url.protocol === 'https:' ? https : http;
  return new Promise((resolve) => {
    const req = lib.request(url, { method: 'GET', servername: url.hostname, timeout: 30_000,
      headers: { host: hostHeader, 'user-agent': 'JE-host-parity/1.0 (+staging comparison)', accept: '*/*', 'accept-encoding': 'identity' } }, (res) => {
      const hash = createHash('sha256'); let bytes = 0;
      res.on('data', (c) => { bytes += c.length; hash.update(c); });
      res.on('end', () => resolve({ status: res.statusCode, headers: Object.fromEntries(KEEP.filter((k) => res.headers[k] !== undefined).map((k) => [k, String(res.headers[k])])),
        bytes, sha256: hash.digest('hex') }));
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', (e) => resolve({ status: 0, error: e.message, headers: {}, bytes: 0, sha256: '' }));
    req.end();
  });
}

const results = [];
for (const [i, entry] of entries.entries()) {
  results.push({ ...entry, ...(await get(entry)) });
  if (i < entries.length - 1) await new Promise((r) => setTimeout(r, delay));
}
writeFileSync(args.out, JSON.stringify({ base: args.base, mode, at: new Date().toISOString(), results }, null, 1));
console.log(`${results.length} paths -> ${args.out} (${results.filter((r) => r.status === 0).length} network errors)`);
