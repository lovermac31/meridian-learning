#!/usr/bin/env node
/**
 * audit-jsonld.mjs — headless structured-data audit for the core indexed pages.
 *
 * For every application/ld+json block on each page it checks:
 *   - the JSON parses and every node has @type;
 *   - required properties per type (EducationalOrganization, WebSite, Course,
 *     Service, Offer, FAQPage, BreadcrumbList, WebPage);
 *   - Offer prices are numeric, priced in VND/USD, and are a current live price;
 *   - every FAQPage question is visible on the page (markup must match content);
 *   - no obsolete or unverified claims, and VND numbers use the 79.000₫ format.
 *
 *   node scripts/audit-jsonld.mjs                      # built dist/ (main site pages only)
 *   node scripts/audit-jsonld.mjs --live https://jurassicenglish.com
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const liveIndex = args.indexOf('--live');
const LIVE = liveIndex >= 0 ? args[liveIndex + 1] : null;

const ROUTES = [
  ['/', 'dist/index.html'],
  ['/vi', 'dist/vi/index.html'],
  ['/young-learners-speaking/', 'dist/young-learners-speaking/index.html'],
  ['/vi/luyen-noi-ielts/', 'dist/vi/luyen-noi-ielts/index.html'],
  ['/framework', 'dist/framework/index.html'],
  ['/methodology', 'dist/methodology/index.html'],
  ['/student-academy', null],
  ['/ai-speaking', null],
  ['/ai-speaking/vi', null],
  ['/ai-speaking/pricing', null],
  ['/ai-speaking/baseline', null],
  ['/ai-speaking/vi/baseline', null],
];

// Live prices (VND) the site sells today; USD 0 is the free-tool offer.
const LIVE_PRICES = new Set(['690000', '800000', '5600000', '30000000', '55200000', '2900000', '990000', '79000', '199000', '549000', '0']);
const REQUIRED = {
  EducationalOrganization: ['name', 'url'],
  WebSite: ['name', 'url'],
  Course: ['name', 'description', 'provider'],
  Service: ['name', 'description'],
  Offer: ['price', 'priceCurrency'],
  FAQPage: ['mainEntity'],
  BreadcrumbList: ['itemListElement'],
  WebPage: ['name', 'url'],
};
const OBSOLETE = [
  [/recorded speaking (portfolio|clip)s?|recorded portfolio/i, 'recorded-portfolio promise'],
  [/Jay[’']s team/i, '"Mr. Jay\'s team" (unverified)'],
  [/most popular|best value/i, 'popularity badge'],
  [/Regulation-Before-Reasoning|CEIW|counter-warrant|named warrants|regulated thinking/i, 'retired jargon'],
  [/Scores can only go down/i, 'retired defensive copy'],
  [/5 practice sets/i, 'unverified practice-set count'],
  [/(?<!not |never |no |not a |without )guarantee(d|s)? (a |your )?(band|score)/i, 'score guarantee'],
  [/\d{1,3}(?:,\d{3})+\s?(?:₫|đ|VND)/, 'VND comma format (use 79.000₫)'],
];

// Known, pre-existing markup-only FAQs (owner decision kept by the AI Speaking
// repo's evals/seo-jsonld.mts "original FAQ retained"): reported as WARN.
const FAQ_MARKUP_ONLY_OK = new Set(['/ai-speaking', '/ai-speaking/vi']);

const results = [];
const record = (ok, check, detail) => results.push({ ok, check, detail });

const visibleText = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
const norm = (s) => s.replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();

function nodesOf(block) {
  const list = Array.isArray(block) ? block : block['@graph'] ? block['@graph'] : [block];
  const out = [];
  const walk = (n) => {
    if (!n || typeof n !== 'object') return;
    if (n['@type']) out.push(n);
    for (const v of Object.values(n)) {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') walk(v);
    }
  };
  list.forEach(walk);
  return out;
}

async function load(route, local) {
  if (LIVE) {
    const res = await fetch(new URL(route, LIVE), { headers: { 'user-agent': 'audit-jsonld/1.0' } });
    record(res.status === 200, `HTTP ${route}`, String(res.status));
    return res.status === 200 ? res.text() : null;
  }
  if (!local) return null;
  const file = path.join(ROOT, local);
  if (!fs.existsSync(file)) {
    record(false, `built ${route}`, `${local} missing — run npm run build`);
    return null;
  }
  return fs.readFileSync(file, 'utf8');
}

for (const [route, local] of ROUTES) {
  const html = await load(route, local);
  if (!html) continue;
  const raw = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  const text = visibleText(html);
  const types = [];
  let parseErrors = 0;
  for (const json of raw) {
    let block;
    try {
      block = JSON.parse(json);
    } catch {
      parseErrors += 1;
      continue;
    }
    const blockText = JSON.stringify(block);
    for (const [re, label] of OBSOLETE) {
      const m = blockText.match(re);
      if (m) record(false, `claims ${route}`, `${label}: "${m[0]}"`);
    }
    for (const node of nodesOf(block)) {
      const type = [].concat(node['@type'])[0];
      types.push(type);
      const missing = (REQUIRED[type] ?? []).filter((key) => node[key] === undefined || node[key] === '' || (Array.isArray(node[key]) && !node[key].length));
      if (missing.length) record(false, `required ${route} ${type}`, `missing ${missing.join(', ')}`);
      if (type === 'Offer') {
        const price = String(node.price);
        const ok = /^\d+(\.\d+)?$/.test(price) && ['VND', 'USD'].includes(node.priceCurrency) && (node.priceCurrency === 'USD' || LIVE_PRICES.has(price));
        record(ok, `offer ${route}`, `${node.name ?? ''} ${price} ${node.priceCurrency}`);
      }
      if (type === 'FAQPage') {
        const hidden = (node.mainEntity ?? []).filter((q) => !q.name || !q.acceptedAnswer?.text || !norm(text).includes(norm(q.name)));
        const warnOnly = hidden.length > 0 && FAQ_MARKUP_ONLY_OK.has(route);
        if (warnOnly) { results.push({ ok: true, warn: true, check: `faq visible ${route}`, detail: `WARN pre-existing markup-only FAQ (${hidden.length} questions not rendered)` }); continue; }
        record(hidden.length === 0, `faq visible ${route}`, hidden.length ? `not on page: ${hidden.map((q) => q.name).join(' | ')}` : `${node.mainEntity.length} questions all visible`);
      }
    }
  }
  record(parseErrors === 0, `parse ${route}`, `${raw.length} blocks, ${parseErrors} invalid; types: ${[...new Set(types)].join(', ')}`);
}

if (!results.some((r) => r.check.startsWith('claims') && !r.ok)) record(true, 'claims', 'no obsolete or unverified claims in structured data');
const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.warn ? 'WARN' : r.ok ? 'PASS' : 'FAIL'}  ${r.check}  —  ${r.detail}`);
console.log(`\n${results.length - failed.length}/${results.length} checks passed${failed.length ? `, ${failed.length} failed` : ''}.`);
process.exit(failed.length ? 1 : 0);
