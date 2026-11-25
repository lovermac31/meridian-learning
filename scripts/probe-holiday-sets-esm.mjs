// Production-style money-path probe for the holiday sets (added after the 25 Nov 2026 webhook 500).
// scripts/probe-holiday-sets.mts runs under tsx, which forgives extensionless imports; this one does not. It transpiles api/ and src/
// file by file to native ESM (as Vercel does, see check-api-handlers.mjs), loads the REAL handlers, and then, with a frozen clock and
// a mocked Notion (every other URL throws), sends: webhook GET (405), a set payment-code order inside and outside the window,
// and the webhook reconcile for the minted code. LOCAL ONLY. Usage: node scripts/probe-holiday-sets-esm.mjs  (exit 1 on any failure)
import { transform } from 'esbuild';
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = process.cwd(), out = join(root, '.vercel-emulate-probe');
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
process.on('exit', () => rmSync(out, { recursive: true, force: true }));
writeFileSync(join(out, 'package.json'), '{"type":"module"}');
symlinkSync(join(root, 'node_modules'), join(out, 'node_modules'));
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? (n === 'node_modules' ? [] : walk(p)) : [p]; });
for (const dir of ['api', 'src']) for (const f of walk(join(root, dir))) {
  if (!/\.tsx?$/.test(f) || f.endsWith('.d.ts')) continue;
  const { code } = await transform(readFileSync(f, 'utf8'), { loader: f.endsWith('x') ? 'tsx' : 'ts', format: 'esm', target: 'es2022', jsx: 'automatic' });
  const o = join(out, f.slice(root.length + 1).replace(/\.tsx?$/, '.js')); mkdirSync(dirname(o), { recursive: true }); writeFileSync(o, code);
}
const load = (h) => import(pathToFileURL(join(out, 'api', `${h}.js`)).href).then((m) => m.default);
const sample = await load('sample-pack'), webhook = await load('sepay-webhook');

const rows = []; let bad = 0;
const check = (label, ok, detail = '') => { rows.push(`${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? `  (${detail})` : ''}`); if (!ok) bad++; };
const RealDate = Date;
const freeze = (iso) => { const f = RealDate.parse(iso); globalThis.Date = class extends RealDate { constructor(...a) { super(...(a.length ? a : [f])); } static now() { return f; } }; };
const thaw = () => { globalThis.Date = RealDate; };
const realFetch = globalThis.fetch; const quiet = { info: console.info, warn: console.warn, error: console.error };
const schema = { 'Lead Name': { type: 'title' }, Email: { type: 'email' }, 'Contact (Zalo / Phone)': { type: 'phone_number' }, 'Preferred Channel': { type: 'select' }, Source: { type: 'select' }, 'UTM / Raw Source': { type: 'rich_text' }, 'Lifecycle Stage': { type: 'select' }, 'Next Action': { type: 'rich_text' } };
let notion = 0;
globalThis.fetch = async (u, init) => {
  const url = String(u);
  if (!/^https:\/\/api\.notion\.com\//.test(url)) throw new Error(`BLOCKED network call: ${url}`);
  notion++;
  const json = url.endsWith('/query') ? { results: [] } : url.endsWith('/pages') && init?.method === 'POST' ? { id: 'mock' } : { properties: schema };
  return new Response(JSON.stringify(json), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
process.env.NOTION_TOKEN = 'synthetic'; process.env.SEPAY_WEBHOOK_KEY = 'synthetic-key'; process.env.SEPAY_AUTOCONFIRM = '1';
for (const k of ['NOTION_LEADS_DB_ID', 'RESEND_API_KEY', 'GET_STARTED_NOTIFY_EMAIL', 'ORDER_NOTIFY_EMAIL', 'SUPABASE_URL', 'SUPABASE_WRITE_KEY']) delete process.env[k];
for (const m of ['info', 'warn', 'error']) console[m] = () => {};

async function call(handler, req, at) {
  let status, body; notion = 0;
  const res = { setHeader() { return res; }, status(s) { status = s; return res; }, json(b) { body = b; return res; }, end() { return res; } };
  freeze(at);
  try { await handler(req, res); await new Promise((r) => setTimeout(r, 20)); } finally { thaw(); }
  return { status, body, notion };
}
const key = (n) => `0000${n.toString(16).padStart(4, '0')}-0000-4000-8000-${n.toString(16).padStart(12, '0')}`;
let ip = 0; const nextIp = () => `198.51.100.${(ip++ % 250) + 1}`;
const prepare = (product, n, at) => call(sample, { method: 'POST', headers: { 'x-forwarded-for': nextIp() }, body: { intent: 'prepare_payment', product, submissionKey: key(n), startedAt: '', website: '' } }, at);

const get = await call(webhook, { method: 'GET', headers: {}, query: {} }, '2026-12-02T12:00:00+07:00');
check('webhook loads under native ESM and answers GET 405', get.status === 405, String(get.status));
const getSample = await call(sample, { method: 'GET', headers: {}, query: {} }, '2026-12-02T12:00:00+07:00');
check('sample-pack loads under native ESM and answers GET 405', getSample.status === 405, String(getSample.status));

const sets = [['holiday-reading-set-l1', 'PR1E', 399000], ['teacher-starter-set', 'PR1F', 1190000]];
let n = 0;
for (const [id, prefix, amount] of sets) {
  const inside = await prepare(id, ++n, '2026-12-02T14:30:00+07:00');
  const memo = inside.body?.memo;
  check(`${id}: payment code minted inside the window`, inside.status === 200 && new RegExp(`^${prefix}-[A-Z0-9]{6}$`).test(memo) && inside.body.amount === amount, `${inside.status} ${memo} ${inside.body?.amount}`);
  for (const [label, at] of [['27 Nov 23:59:59.999', '2026-11-27T23:59:59.999+07:00'], ['7 Dec 00:00:00.000', '2026-12-07T00:00:00.000+07:00']]) {
    const closed = await prepare(id, ++n, at);
    check(`${id}: code refused at ${label}, no memo, no lead`, closed.status === 400 && closed.body?.error === 'offer_closed' && !closed.body?.memo && closed.notion === 0, `${closed.status} ${closed.body?.error}`);
  }
  for (const [label, at] of [['28 Nov 00:00:00.000', '2026-11-28T00:00:00.000+07:00'], ['6 Dec 23:59:59.999', '2026-12-06T23:59:59.999+07:00']]) {
    const edge = await prepare(id, ++n, at);
    check(`${id}: code minted at ${label}`, edge.status === 200 && Boolean(edge.body?.memo), String(edge.status));
  }
  const hook = (content, date, at) => call(webhook, { method: 'POST', headers: { authorization: 'Apikey synthetic-key', 'content-length': '200' }, body: { id: ++n, transferType: 'in', content, transferAmount: amount, transactionDate: date } }, at);
  const reconcile = await hook(`CK ${memo.replace('-', '')} cam on`, '2026-12-02 14:35:00', '2026-12-02T14:35:30+07:00');
  check(`${id}: webhook reconcile answers 200 success for the minted code`, reconcile.status === 200 && reconcile.body?.success === true, String(reconcile.status));
  const wrong = await call(webhook, { method: 'POST', headers: { authorization: 'Apikey wrong', 'content-length': '200' }, body: { id: ++n, transferType: 'in', content: memo, transferAmount: amount } }, '2026-12-02T14:35:30+07:00');
  check(`${id}: webhook with a wrong key is 401`, wrong.status === 401, String(wrong.status));
}
const other = await prepare('parent-pack-l1', ++n, '2026-12-08T10:00:00+07:00');
check('an ordinary product still mints its usual code after the window', other.status === 200 && other.body?.amount === 249000, `${other.status} ${other.body?.amount}`);

globalThis.fetch = realFetch; Object.assign(console, quiet);
console.log(rows.join('\n'));
console.log(bad ? `\nPROBE FAILED: ${bad} check(s)` : `\nPROBE PASSED: ${rows.length} checks under native ESM (local only: frozen clock, mocked Notion, no other network)`);
process.exit(bad ? 1 : 0);
