// Guard added 2 Nov 2026 after /api/sepay-webhook crashed on load in production (extensionless import under Node ESM).
// Emulates Vercel's per-file TS->ESM transpile (no bundling), imports every api/*.ts handler under Node ESM and sends a GET.
// FAILS on a module-load error or a 500/502/504. 405/401/200/302 and an intentional 503 ("not configured") pass.
// Usage: node scripts/check-api-handlers.mjs [handler ...]   (default: every non-underscore handler)
import { transform } from 'esbuild';
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = process.cwd(), out = join(root, '.vercel-emulate');
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
process.on('exit', () => rmSync(out, { recursive: true, force: true }));
writeFileSync(join(out, 'package.json'), '{"type":"module"}');
symlinkSync(join(root, 'node_modules'), join(out, 'node_modules'));
const walk = d => readdirSync(d).flatMap(n => { const p = join(d, n); return statSync(p).isDirectory() ? (n === 'node_modules' ? [] : walk(p)) : [p]; });
for (const dir of ['api', 'src']) for (const f of walk(join(root, dir))) {
  if (!/\.tsx?$/.test(f) || f.endsWith('.d.ts')) continue;
  const { code } = await transform(readFileSync(f, 'utf8'), { loader: f.endsWith('x') ? 'tsx' : 'ts', format: 'esm', target: 'es2022', jsx: 'automatic' });
  const o = join(out, f.slice(root.length + 1).replace(/\.tsx?$/, '.js')); mkdirSync(dirname(o), { recursive: true }); writeFileSync(o, code);
}
const given = process.argv.slice(2);
const handlers = given.length ? given : readdirSync(join(root, 'api')).filter(n => n.endsWith('.ts') && !n.startsWith('_')).map(n => n.slice(0, -3));
let bad = 0;
for (const h of handlers) {
  try {
    const mod = await import(pathToFileURL(join(out, 'api', h + '.js')).href);
    let status, hdrs = {};
    const res = { setHeader: (k, v) => { hdrs[k] = v; }, status(s) { status = s; return this; }, json() { return this; }, end() { return this; } };
    await mod.default({ method: 'GET', headers: {}, query: {}, body: undefined }, res);
    const broken = status === undefined || [500, 502, 504].includes(status);
    console.log(`${broken ? 'FAIL' : 'ok  '} ${h} -> GET ${status}`); if (broken) bad++;
  } catch (e) { console.log(`FAIL ${h} -> ${e.code || e.name}: ${String(e.message).split('\n')[0].slice(0, 150)}`); bad++; }
}
process.exit(bad ? 1 : 0);
