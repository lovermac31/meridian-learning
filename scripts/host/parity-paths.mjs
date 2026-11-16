#!/usr/bin/env node
// Builds the route-parity path list from the build output and vercel.json:
// every sitemap URL, one concrete instance of every redirect / rewrite / header source,
// real asset and image files, the www canonical redirect, unknown paths and every API route (GET only).
//   node scripts/host/parity-paths.mjs > parity-paths.json
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const vercel = JSON.parse(readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const out = new Map();
const add = (p, extra = {}) => { const key = `${extra.host ?? ''} ${p}`; if (!out.has(key)) out.set(key, { path: p, ...extra }); };

// 1. Every sitemap URL (production origin stripped).
const sitemap = readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
for (const [, loc] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) add(new URL(loc).pathname, { kind: 'sitemap' });

// 2. Redirect sources, instantiated (":path(.+)/" -> "pricing/", ":path(.*)" handled by the host case below).
for (const r of vercel.redirects) {
  if (r.has?.some((h) => h.type === 'host')) continue;
  add(r.source.replace(/:path\(\.\+\)\//, 'pricing/').replace(/:path\(\.\*\)/, ''), { kind: 'redirect' });
}
add('/', { kind: 'host-redirect', host: 'www.jurassicenglish.com' });
add('/young-learners-speaking/?utm_source=parity', { kind: 'host-redirect', host: 'www.jurassicenglish.com' });
add('/young-learners-speaking/?utm_source=parity', { kind: 'query' });

// 3. Rewrite sources, instantiated.
for (const r of vercel.rewrites) {
  let p = r.source.replace(/\/:path\*$/, '/x-parity').replace(/\(\.\*\)$/, 'health');
  if (p.startsWith('/_next/') || p.startsWith('/c856') || p.startsWith('/425f') || p.startsWith('/images/student-academy-page/')) continue; // added below with real files
  add(p, { kind: 'rewrite' });
}
add('/student-academy/', { kind: 'redirect' });
add('/pilot/demo-parity', { kind: 'rewrite' });

// 4. Header rule sources and real static files.
for (const p of ['/plans-pricing-access', '/external/pilot', '/internal/pilot-requests', '/pilot/x']) add(p, { kind: 'header' });
const assets = readdirSync(path.join(dist, 'assets')).sort();
for (const f of assets.filter((f) => /\.(js|css)$/.test(f)).slice(0, 6)) add(`/assets/${f}`, { kind: 'asset' });
for (const f of assets.filter((f) => /\.(png|jpg|webp|svg|woff2?)$/.test(f)).slice(0, 3)) add(`/assets/${f}`, { kind: 'asset' });
for (const f of readdirSync(path.join(dist, 'images')).filter((f) => /\.(png|jpg|webp)$/.test(f)).sort().slice(0, 4)) add(`/images/${f}`, { kind: 'image' });
const video = path.join(dist, 'young-learners-speaking', 'assets', 'video');
if (existsSync(video)) for (const f of readdirSync(video).filter((f) => !f.endsWith('.mp4')).slice(0, 2)) add(`/young-learners-speaking/assets/video/${f}`, { kind: 'video-dir' });
for (const f of ['/robots.txt', '/sitemap.xml', '/favicon.ico', '/favicon.svg', '/llms.txt', '/apple-touch-icon.png', '/index.html']) add(f, { kind: 'root-file' });

// 5. Directory paths without and with a trailing slash (Vercel: no redirect either way when trailingSlash is unset).
for (const p of ['/legal/privacy', '/legal/privacy/', '/about', '/about/', '/vi', '/vi/']) add(p, { kind: 'directory' });

// 6. Unknown paths.
for (const p of ['/no-such-page-parity', '/vi/no-such-page-parity', '/assets/no-such-file.js', '/images/no-such.png']) add(p, { kind: 'unknown' });

// 7. Every API route declared in vercel.json functions, GET only (no request is sent that could write anything).
for (const fn of Object.keys(vercel.functions ?? {})) {
  const p = '/' + fn.replace(/\.ts$/, '').replace(/\[submissionId\]/, 'parity-0000').replace(/\[action\]/, 'approve');
  add(p, { kind: 'api' });
}
add('/api/internal/approval-action', { kind: 'api' });
add('/api/no-such-endpoint', { kind: 'api' });

process.stdout.write(JSON.stringify([...out.values()], null, 1) + '\n');
