#!/usr/bin/env node
// Compares a staging probe with a production probe (parity-probe.mjs output).
//   node scripts/host/parity-compare.mjs prod.json staging.json [--json report.json]
// Exit 0 only when every path matches on status, redirect location, content type, every header named in a
// vercel.json rule, and body hash (body hashes of proxied sub-apps are reported but not required: they render live).
// Expected staging-only delta: X-Robots-Tag "noindex, nofollow" on every response.
import { readFileSync, writeFileSync } from 'node:fs';

const [prodFile, stagingFile] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const jsonOut = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;
const prod = JSON.parse(readFileSync(prodFile, 'utf8')).results;
const staging = new Map(JSON.parse(readFileSync(stagingFile, 'utf8')).results.map((r) => [`${r.host ?? ''} ${r.path}`, r]));
const PROXIED = /^\/(ai-speaking|student-academy|school-framework|digital-reasoning-engine|interactive-demo|evidence|book-diagnostic|_next|c856412889f27af2|425f0745123b9f56|images\/student-academy-page)(\/|$)/;
const HEADERS = ['x-content-type-options', 'x-frame-options', 'referrer-policy', 'permissions-policy', 'content-security-policy', 'cache-control'];
const normLocation = (v) => (v ?? '').replace(/^https:\/\/(jurassicenglish\.com|staging\.jurassicenglish\.com)(?=\/|$)/, 'https://jurassicenglish.com');
const normType = (v) => (v ?? '').toLowerCase().replace(/\s+/g, '');

const rows = [];
for (const p of prod) {
  const s = staging.get(`${p.host ?? ''} ${p.path}`);
  const diffs = [];
  if (!s) diffs.push('missing in staging');
  else {
    if (p.status !== s.status) diffs.push(`status ${p.status} vs ${s.status}`);
    if (normLocation(p.headers.location) !== normLocation(s.headers.location)) diffs.push(`location "${p.headers.location ?? ''}" vs "${s.headers.location ?? ''}"`);
    if (p.status < 300 || s.status < 300) {
      if (normType(p.headers['content-type']) !== normType(s.headers['content-type'])) diffs.push(`content-type "${p.headers['content-type'] ?? ''}" vs "${s.headers['content-type'] ?? ''}"`);
      for (const h of HEADERS) if ((p.headers[h] ?? '') !== (s.headers[h] ?? '')) diffs.push(`${h} "${(p.headers[h] ?? '').slice(0, 60)}" vs "${(s.headers[h] ?? '').slice(0, 60)}"`);
      const pr = (p.headers['x-robots-tag'] ?? '').toLowerCase(), sr = (s.headers['x-robots-tag'] ?? '').toLowerCase();
      if (pr && !sr.includes('noindex')) diffs.push(`x-robots-tag "${pr}" vs "${sr}"`);
    }
  }
  // Proxied sub-apps render live, and API bodies carry timestamps: their bodies are reported, not required to match.
  const proxied = PROXIED.test(p.path.split('?')[0]) || p.path.startsWith('/api/');
  const bodyDiff = s && p.status === 200 && s.status === 200 && p.sha256 !== s.sha256;
  if (bodyDiff && !proxied) diffs.push(`body ${p.bytes}B vs ${s.bytes}B`);
  rows.push({ path: p.path, host: p.host ?? null, kind: p.kind, prod: p.status, staging: s?.status ?? null, ok: diffs.length === 0, diffs,
    note: bodyDiff && proxied ? 'dynamic body differs (live upstream render or API timestamp)' : undefined });
}
const bad = rows.filter((r) => !r.ok);
for (const r of bad) console.log(`DIFF ${r.host ? r.host + ' ' : ''}${r.path} [${r.kind}] ${r.diffs.join('; ')}`);
const notes = rows.filter((r) => r.ok && r.note).length;
console.log(`parity: ${rows.length - bad.length}/${rows.length} paths match${notes ? ` (${notes} dynamic bodies differ, informational)` : ''}`);
if (jsonOut) writeFileSync(jsonOut, JSON.stringify({ total: rows.length, matched: rows.length - bad.length, rows }, null, 1));
process.exit(bad.length ? 1 : 0);
