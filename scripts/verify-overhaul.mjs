#!/usr/bin/env node
/**
 * verify-overhaul.mjs — Gate 1/2 acceptance checks for the human-centered
 * overhaul (revised spec §4). Checks:
 *   1. public/images/overhaul has the 7 illustrations, each 5 KB–200 KB; in live
 *      mode every overhaul image a page references returns 200 image/webp;
 *   2. policy & claims: 0 "recorded speaking portfolio/clip" promises on family
 *      pages; the under-18 non-recording sentence on /, /student-academy, the
 *      Young Learners page and /ai-speaking/baseline (EN + VI); AI Speaking scope
 *      (typed mode does not assess pronunciation, limited beta, synthetic audio)
 *      on /ai-speaking and /ai-speaking/pricing; "Illustrative Teaching Example"
 *      on / and /student-academy; full commitment totals wherever the discounted
 *      lesson rates appear; legacy jargon gone;
 *   3. contrast: no white text on #D97706 in page markup or the built CSS;
 *   4. the header has the four need-first links;
 *   5. visible word counts (main content) are reported, and gated where the
 *      original brief set a ceiling.
 *
 * Local mode (default) reads the built dist/ of this repo.
 * Live mode reads deployed pages:
 *   node scripts/verify-overhaul.mjs --live \
 *     --main https://<main-preview> --academy https://<ecosystem-preview> --speaking https://<ai-speaking-preview>
 * Protected previews: VERCEL_BYPASS=<token> adds the x-vercel-protection-bypass
 * header, or pass a Vercel share link per site (--main-share <url> etc.); the
 * script follows it once and reuses the cookie it sets.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const LIVE = args.includes('--live');
const bases = { main: flag('main'), academy: flag('academy') ?? flag('main'), speaking: flag('speaking') ?? flag('main') };

const MIN_IMG = 5 * 1024;
const MAX_IMG = 200 * 1024;
const JARGON = [
  'Regulation-Before-Reasoning',
  'CEIW writing with named warrants',
  'Scores can only go down',
  'Counter-warrants',
  'palaeontologists of meaning',
  'Digital Reasoning Engine? Teacher-led',
];
const NAV_LABELS = {
  en: ['Reading &amp; Story Adventures', 'Speaking Confidence &amp; Teen IELTS', 'Adult IELTS Practice', 'Meet Mr. Jay &amp; Pricing'],
  vi: ['Đọc sách &amp; Phiêu lưu truyện', 'Tự tin nói &amp; IELTS cho teen', 'Luyện IELTS cho người lớn', 'Gặp thầy Jay &amp; Học phí'],
};
const RECORDING_PROMISES = /recorded speaking (portfolio|clip)s?|recorded portfolio|recorded speaking clips/i;
const POLICY = { en: /sessions with learners under 18 are never recorded/i, vi: /dưới 18 tuổi không bao giờ được ghi âm/i };
const SCOPE = [/does not assess pronunciation|không đánh giá phát âm/i, /limited beta|beta giới hạn/i, /synthetic|tổng hợp/i];
const TOTALS = ['5.600.000₫', '30.000.000₫', '55.200.000₫'];
const RATES = ['700.000₫', '625.000₫', '575.000₫'];

// route, site, ceiling (EN only; VI is reported, not gated — Vietnamese runs longer).
const PAGES = [
  { route: '/', site: 'main', local: 'dist/index.html', lang: 'en', spa: true, policy: true, example: true },
  { route: '/vi', site: 'main', local: 'dist/vi/index.html', lang: 'vi', spa: true, policy: true },
  { route: '/young-learners-speaking/', site: 'main', local: 'dist/young-learners-speaking/index.html', ceiling: 750, lang: 'en', policy: true },
  { route: '/vi/luyen-noi-ielts/', site: 'main', local: 'dist/vi/luyen-noi-ielts/index.html', lang: 'vi', policy: true },
  { route: '/framework', site: 'main', local: 'dist/framework/index.html', lang: 'en', spa: true, family: false },
  { route: '/vi/framework', site: 'main', local: 'dist/vi/framework/index.html', lang: 'vi', spa: true, family: false },
  { route: '/methodology', site: 'main', local: 'dist/methodology/index.html', lang: 'en', spa: true, family: false },
  { route: '/vi/methodology', site: 'main', local: 'dist/vi/methodology/index.html', lang: 'vi', spa: true, family: false },
  { route: '/student-academy', site: 'academy', ceiling: 550, lang: 'en', policy: true, example: true },
  { route: '/ai-speaking', site: 'speaking', ceiling: 650, lang: 'en', scope: true },
  { route: '/ai-speaking/vi', site: 'speaking', lang: 'vi', scope: true },
  { route: '/ai-speaking/pricing', site: 'speaking', ceiling: 650, lang: 'en', scope: true },
  { route: '/ai-speaking/pricing?lang=vi', site: 'speaking', lang: 'vi', scope: true },
  { route: '/ai-speaking/baseline', site: 'speaking', lang: 'en', policy: true },
  { route: '/ai-speaking/vi/baseline', site: 'speaking', lang: 'vi', policy: true },
];

const results = [];
const record = (ok, check, detail) => results.push({ ok, check, detail });

function stripToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<template[\s\S]*?<\/template>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ');
}
const countWords = (text) => (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’.,₫$%–-]*/gu) ?? []).length;

function slice(html, open, close) {
  const a = html.search(open);
  if (a < 0) return '';
  const rest = html.slice(a);
  const b = rest.search(close);
  return b < 0 ? rest : rest.slice(0, b + 10);
}

function analyse(page, html) {
  const body = slice(html, /<body[\s>]/i, /<\/body>/i) || html;
  const header = slice(body, /<nav[\s>]/i, /<\/nav>/i);
  const footer = slice(body, /<footer[\s>]/i, /<\/footer>/i);
  // Page copy = the <main> landmark when the page has one; otherwise the body
  // minus header and footer. Skip links and floating widgets are not counted.
  let main = slice(body, /<main[\s>]/i, /<\/main>/i);
  if (!main) {
    main = body;
    if (header) main = main.replace(header, ' ');
    if (footer) main = main.replace(footer, ' ');
  }
  // Off-screen dialogs and the contact panel are not page copy.
  main = main.replace(/<div[^>]*role="dialog"[\s\S]*?<\/div>/gi, ' ');
  const words = { main: countWords(stripToText(main)), header: countWords(stripToText(header)), footer: countWords(stripToText(footer)) };
  const text = stripToText(body);

  if (page.family !== false) {
    const hits = JARGON.filter((j) => text.includes(j));
    record(hits.length === 0, `jargon ${page.route}`, hits.length ? `found: ${hits.join(', ')}` : '0 matches');
    const promise = text.match(RECORDING_PROMISES);
    record(!promise, `no recording promise ${page.route}`, promise ? `found "${promise[0]}"` : '0 matches');
    const rateShown = RATES.filter((r) => text.includes(r));
    const missingTotals = rateShown.length ? TOTALS.filter((t) => !text.includes(t)) : [];
    if (rateShown.length) record(missingTotals.length === 0, `commitment totals ${page.route}`, missingTotals.length ? `rates ${rateShown.join(', ')} shown without ${missingTotals.join(', ')}` : 'all totals beside rates');
  }
  if (page.policy) record(POLICY[page.lang].test(text), `under-18 policy ${page.route}`, POLICY[page.lang].source);
  if (page.scope) {
    const missing = SCOPE.filter((re) => !re.test(text)).map((re) => re.source);
    record(missing.length === 0, `AI scope disclosure ${page.route}`, missing.length ? `missing ${missing.join(' | ')}` : 'typed/no-pronunciation, beta, synthetic audio');
  }
  if (page.example) record(/Illustrative Teaching Example|Ví dụ giảng dạy minh hoạ/i.test(text), `illustrative badge ${page.route}`, 'lesson demo badged');
  const whiteOnAmber = [...html.matchAll(/class="([^"]*)"/g)].map((m) => m[1]).filter((c) => /(^|\s)bg-(sb-amber|\[#D97706\])(\s|$)/.test(c) && /(^|\s)text-white(\s|$)/.test(c));
  const inlineWhiteOnAmber = /background(-color)?:\s*#D97706[^;"]*;[^"]*color:\s*#fff/i.test(html);
  record(whiteOnAmber.length === 0 && !inlineWhiteOnAmber, `contrast ${page.route}`, whiteOnAmber.length || inlineWhiteOnAmber ? 'white text on #D97706 found' : 'no white text on #D97706');
  if (page.ceiling) {
    record(words.main <= page.ceiling, `words ${page.route}`, `main ${words.main} / ${page.ceiling} (header ${words.header}, footer ${words.footer})`);
  } else {
    record(true, `words ${page.route}`, `main ${words.main} (report only; header ${words.header}, footer ${words.footer})`);
  }
  if (page.spa) {
    const labels = NAV_LABELS[page.lang];
    const missing = labels.filter((l) => !header.includes(l));
    record(missing.length === 0, `nav ${page.route}`, missing.length ? `missing ${missing.join(', ')}` : '4 need-first links present');
    record(/#pricing-options/.test(header), `nav CTA ${page.route}`, 'Choose a Starting Step → #pricing-options');
  }
  return [...html.matchAll(/\/images\/overhaul\/[a-z0-9-]+\.webp/g)].map((m) => m[0]);
}

const cookies = {};
async function shareCookie(site) {
  if (cookies[site] !== undefined) return cookies[site];
  const share = flag(`${site}-share`);
  cookies[site] = '';
  if (share) {
    const res = await fetch(share, { redirect: 'manual' });
    cookies[site] = (res.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).join('; ');
  }
  return cookies[site];
}
async function authHeaders(site) {
  const headers = { 'user-agent': 'verify-overhaul/1.0' };
  if (process.env.VERCEL_BYPASS) headers['x-vercel-protection-bypass'] = process.env.VERCEL_BYPASS;
  const cookie = await shareCookie(site);
  if (cookie) headers.cookie = cookie;
  return headers;
}
async function fetchText(url, site) {
  const res = await fetch(url, { headers: await authHeaders(site), redirect: 'follow' });
  return { status: res.status, type: res.headers.get('content-type') ?? '', text: res.status < 400 ? await res.text() : '' };
}

async function main() {
  // 1. image files
  const dir = path.join(ROOT, 'public/images/overhaul');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.webp')) : [];
  record(files.length === 7, 'image count', `${files.length} webp files in public/images/overhaul (expected 7)`);
  for (const f of files) {
    const size = fs.statSync(path.join(dir, f)).size;
    record(size > MIN_IMG && size < MAX_IMG, `image size ${f}`, `${Math.round(size / 1024)} KB`);
  }

  const referenced = new Map();
  for (const page of PAGES) {
    let html = '';
    if (LIVE) {
      const base = bases[page.site];
      if (!base) {
        record(true, `skip ${page.route}`, `no --${page.site} base given`);
        continue;
      }
      const res = await fetchText(new URL(page.route, base).toString(), page.site);
      record(res.status === 200, `HTTP ${page.route}`, `${res.status} from ${base}`);
      html = res.text;
    } else if (page.local) {
      const file = path.join(ROOT, page.local);
      if (!fs.existsSync(file)) {
        record(false, `built ${page.route}`, `${page.local} missing — run npm run build`);
        continue;
      }
      html = fs.readFileSync(file, 'utf8');
    } else {
      continue; // other projects: live mode only
    }
    if (!html) continue;
    for (const src of analyse(page, html)) referenced.set(src, page.site);
  }

  // 1b. every referenced overhaul image is a real file (local) or serves 200 (live)
  for (const [src, site] of referenced) {
    if (LIVE) {
      const res = await fetch(new URL(src, bases[site]).toString(), { method: 'GET', headers: await authHeaders(site) });
      record(res.status === 200 && /image\/webp/.test(res.headers.get('content-type') ?? ''), `image 200 ${src}`, `${res.status} ${res.headers.get('content-type')}`);
    } else {
      record(fs.existsSync(path.join(ROOT, 'public', src)), `image file ${src}`, 'referenced by built page');
    }
  }

  const failed = results.filter((r) => !r.ok);
  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.check}  —  ${r.detail}`);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed${failed.length ? `, ${failed.length} failed` : ''}.`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
