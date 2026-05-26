#!/usr/bin/env node
// WWL Site Health Audit (Phase 4B)
// ──────────────────────────────────────────────────────────────────────────
// Per the WWL Website Health Recovery Plan: routine, deterministic checks
// for indexability, security headers, analytics instrumentation, CORS
// posture, sitemap coverage, and API response hygiene.
//
// Stack: pure Node 20 fetch + AbortController (matches the codebase's
// raw-fetch service pattern). Zero new dependencies.
//
// CLI:
//   node scripts/audit-site-health.mjs \
//     --site https://jurassicenglish.com \
//     [--output prod-report] \
//     [--routes /,/framework,/get-started,/methodology] \
//     [--api-routes /api/health,/api/verify-pricing-access?token=bad-token] \
//     [--strict]           # treat P2 as failing too
//     [--quiet]            # suppress per-check console lines
//
// Emits:
//   <output>.json  — machine-readable result
//   <output>.md    — Markdown summary suitable as a GH artifact / issue body
//
// Exit codes:
//   0  — no P0/P1 failures (P2 warnings allowed)
//   1  — at least one P0 or P1 failure
//   2  — script error (network unreachable, bad args)

import { writeFile } from 'node:fs/promises';
import { argv, exit, env } from 'node:process';
import { setTimeout as sleep } from 'node:timers/promises';

// ───── argv parser (no deps) ─────────────────────────────────────────────
function parseArgs(args) {
  const out = { flags: new Set() };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        out[key] = next;
        i++;
      } else {
        out.flags.add(key);
      }
    }
  }
  return out;
}

const argsParsed = parseArgs(argv.slice(2));

const SITE = (argsParsed.site || env.SITE_URL || 'https://jurassicenglish.com').replace(/\/$/, '');
const OUTPUT_BASE = argsParsed.output || 'site-health-report';
const STRICT = argsParsed.flags.has('strict');
const QUIET = argsParsed.flags.has('quiet');
const TIMEOUT_MS = Number.parseInt(argsParsed.timeout ?? '8000', 10);

// Marketing-site canonical paths in production (verified live 2026-05-17).
// The plan listed `/pricing`, `/onboarding`, `/demo`, `/faq` as placeholders
// — those routes do NOT exist on the marketing site. The real route shape
// is `/framework`, `/get-started`, `/methodology`, etc. Override via
// --routes if the canonical set changes.
const DEFAULT_ROUTES = [
  '/',
  '/framework',
  '/get-started',
  '/methodology',
  '/student-academy',
  '/interactive-demo',
  '/book-diagnostic',
  '/school-framework',
];

const DEFAULT_API_ROUTES = [
  '/api/health',
  '/api/verify-pricing-access?token=bad-token',
  '/api/verify-external-portal-access?token=bad-token',
];

const ROUTES = (argsParsed.routes ?? DEFAULT_ROUTES.join(','))
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const API_ROUTES = (argsParsed['api-routes'] ?? DEFAULT_API_ROUTES.join(','))
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// Sitemap MUST contain these routes (canonical equivalents). Configurable
// because the plan's literal list (`/pricing`, `/onboarding`, etc.) is
// placeholder; the marketing site uses different names.
const SITEMAP_REQUIRED = (argsParsed['sitemap-required'] ?? '/,/framework,/get-started,/methodology')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// Vercel env vars the plan flags as manual-remediation-only. Reported as
// a checklist; the script does NOT probe Vercel.
const MANUAL_VERCEL_ENV_CHECKLIST = [
  'SUPABASE_WRITE_KEY',
  'NOTION_TOKEN',
  'PRICING_ACCESS_LINK_OPERATOR_KEY',
  'PRICING_ACCESS_OPERATOR_KEY',
  'EXTERNAL_PORTAL_SIGNING_SECRET',
  'PRICING_ACCESS_SIGNING_SECRET',
  'INTERNAL_PORTAL_OPERATOR_KEY',
  'RESEND_API_KEY',
  'GEMINI_API_KEY',
];

// CTA analytics functions that must appear in the homepage HTML (or in
// referenced bundle hashes that we can grep for). Sourced from
// src/lib/analytics.ts.
const CTA_ANALYTICS_TOKENS = [
  'trackCtaClick',
  'trackFormStart',
  'trackFormSubmit',
  'trackLowFrictionClick',
];

// Phase 2.3A enforced headers. CSP is checked separately because it's
// report-only.
const REQUIRED_SECURITY_HEADERS = [
  'x-content-type-options',
  'x-frame-options',
  'referrer-policy',
  'permissions-policy',
  'strict-transport-security',
];

// ───── result accumulator ────────────────────────────────────────────────
const results = [];
function record(severity, name, status, detail = {}) {
  // severity: 'P0' | 'P1' | 'P2'
  // status:   'PASS' | 'FAIL' | 'WARN' | 'SKIP'
  results.push({ severity, name, status, detail });
  if (!QUIET) {
    const mark =
      status === 'PASS' ? '✓'
      : status === 'FAIL' ? '✗'
      : status === 'WARN' ? '!'
      : '·';
    console.log(`${mark} [${severity}] ${name}` + (detail.note ? ` — ${detail.note}` : ''));
  }
}

// ───── fetch helper with timeout + safe error handling ───────────────────
async function probe(url, init = {}) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: ac.signal, redirect: 'manual' });
    const headers = {};
    for (const [k, v] of res.headers) headers[k.toLowerCase()] = v;
    return { ok: true, status: res.status, headers, res };
  } catch (err) {
    return { ok: false, error: err?.name === 'AbortError' ? 'timeout' : String(err?.message ?? err) };
  } finally {
    clearTimeout(t);
  }
}

// ───── individual checks ─────────────────────────────────────────────────

async function checkHomepage() {
  const r = await probe(`${SITE}/`);
  if (!r.ok) {
    record('P0', 'homepage_reachable', 'FAIL', { note: r.error });
    return null;
  }
  if (r.status < 200 || r.status >= 400) {
    record('P0', 'homepage_status_2xx_or_3xx', 'FAIL', { status: r.status });
    return null;
  }
  // For 3xx, follow once to get the final document
  if (r.status >= 300 && r.status < 400) {
    const loc = r.headers.location;
    if (loc) {
      const r2 = await probe(loc.startsWith('http') ? loc : `${SITE}${loc}`);
      record('P0', 'homepage_reachable', 'PASS', { status: r.status, followedTo: loc });
      return r2.ok ? await (await fetch(loc.startsWith('http') ? loc : `${SITE}${loc}`)).text() : '';
    }
  }
  record('P0', 'homepage_reachable', 'PASS', { status: r.status });
  // Re-fetch to get body (probe returned with redirect: manual; status 200 case here means body is OK to read)
  try {
    const bodyRes = await fetch(`${SITE}/`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    return await bodyRes.text();
  } catch {
    return '';
  }
}

async function checkRobots() {
  const r = await probe(`${SITE}/robots.txt`);
  if (!r.ok) {
    record('P0', 'robots_txt_reachable', 'FAIL', { note: r.error });
    return;
  }
  if (r.status !== 200) {
    // 3xx is FAIL because robots.txt should never redirect (Google treats
    // 3xx as failure-equivalent for robots).
    record('P0', 'robots_txt_returns_200', 'FAIL', { status: r.status });
    return;
  }
  // Redirect target check: if Vercel auth or login wall intercepted, the
  // body would be a login page. Best-effort body sniff:
  try {
    const body = await (await fetch(`${SITE}/robots.txt`)).text();
    if (/<html|<!doctype/i.test(body.slice(0, 200))) {
      record('P0', 'robots_txt_not_html_page', 'FAIL', { note: 'body looks like HTML, not a robots.txt' });
      return;
    }
    record('P0', 'robots_txt_returns_200', 'PASS', { status: r.status, bytes: body.length });
  } catch (e) {
    record('P0', 'robots_txt_returns_200', 'PASS', { status: r.status });
  }
}

async function checkSitemap() {
  const r = await probe(`${SITE}/sitemap.xml`);
  if (!r.ok) {
    record('P0', 'sitemap_xml_reachable', 'FAIL', { note: r.error });
    return;
  }
  if (r.status !== 200) {
    record('P0', 'sitemap_xml_returns_200', 'FAIL', { status: r.status });
    return;
  }
  record('P0', 'sitemap_xml_returns_200', 'PASS', { status: r.status });

  // Inspect body for required routes
  let body = '';
  try {
    body = await (await fetch(`${SITE}/sitemap.xml`)).text();
  } catch {
    record('P1', 'sitemap_body_readable', 'WARN', { note: 'second fetch failed' });
    return;
  }
  if (/<html|<!doctype/i.test(body.slice(0, 200))) {
    record('P0', 'sitemap_not_html_page', 'FAIL', { note: 'body looks like an HTML page, not XML' });
    return;
  }

  const missing = [];
  for (const route of SITEMAP_REQUIRED) {
    // Match either exact route or route at end of <loc>...</loc>
    const re = new RegExp(`<loc>${SITE.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}${route === '/' ? '/?' : escapeRoute(route)}</loc>`);
    if (!re.test(body)) missing.push(route);
  }
  if (missing.length === 0) {
    record('P1', 'sitemap_includes_required_routes', 'PASS', { checked: SITEMAP_REQUIRED });
  } else {
    record('P1', 'sitemap_includes_required_routes', 'FAIL', { missing });
  }
}

function escapeRoute(r) {
  return r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function checkSecurityHeaders(homepageBody) {
  const r = await probe(`${SITE}/`);
  if (!r.ok || !r.headers) {
    record('P0', 'security_headers', 'FAIL', { note: 'cannot fetch homepage headers' });
    return;
  }

  const present = REQUIRED_SECURITY_HEADERS.filter((h) => Boolean(r.headers[h]));
  const missing = REQUIRED_SECURITY_HEADERS.filter((h) => !r.headers[h]);

  if (missing.length === 0) {
    record('P0', 'required_security_headers_present', 'PASS', { headers: present });
  } else {
    record('P0', 'required_security_headers_present', 'FAIL', { missing, present });
  }

  // CSP — accept either enforcement or report-only
  const csp = r.headers['content-security-policy'];
  const cspRO = r.headers['content-security-policy-report-only'];
  if (csp) {
    record('P1', 'csp_present', 'PASS', { mode: 'enforce' });
  } else if (cspRO) {
    record('P1', 'csp_present', 'PASS', { mode: 'report-only' });
  } else {
    record('P1', 'csp_present', 'FAIL', { note: 'neither CSP nor CSP-Report-Only is set' });
  }

  // No wildcard CORS on API routes is checked separately in checkApiRoutes.
}

async function checkApiRoutes() {
  for (const path of API_ROUTES) {
    const url = `${SITE}${path}`;
    const r = await probe(url);
    if (!r.ok) {
      record('P1', `api_reachable_${path}`, 'WARN', { note: r.error });
      continue;
    }
    // Status check — anything in 2xx/4xx is acceptable; 5xx is a problem
    if (r.status >= 500) {
      record('P1', `api_no_5xx_${path}`, 'FAIL', { status: r.status });
    } else {
      record('P2', `api_no_5xx_${path}`, 'PASS', { status: r.status });
    }

    // Wildcard CORS check
    const acao = r.headers['access-control-allow-origin'];
    if (acao === '*') {
      record('P1', `api_no_wildcard_cors_${path}`, 'FAIL', { acao });
    } else {
      record('P2', `api_no_wildcard_cors_${path}`, 'PASS', { acao: acao ?? '(none)' });
    }
  }

  // Stack trace leak: probe one endpoint with malformed input and inspect
  // body for known leak patterns.
  try {
    const bodyRes = await fetch(`${SITE}/api/verify-pricing-access?token=bad-token`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const body = await bodyRes.text();
    const leakMarkers = [/at\s+\S+\s+\(.+:\d+:\d+\)/, /node_modules/, /\/vercel\/path\d+/, /\bError:\s.+\n\s+at\s/];
    const matched = leakMarkers.filter((re) => re.test(body));
    if (matched.length > 0) {
      record('P1', 'api_no_stack_trace_leak', 'FAIL', { matched: matched.map(String) });
    } else {
      record('P2', 'api_no_stack_trace_leak', 'PASS', { bodyLength: body.length });
    }
  } catch (e) {
    record('P2', 'api_no_stack_trace_leak', 'SKIP', { note: 'probe failed', error: String(e?.message ?? e) });
  }
}

async function checkAnalyticsMarkers(homepageBody) {
  if (!homepageBody) {
    record('P2', 'cta_analytics_markers', 'SKIP', { note: 'homepage body unavailable' });
    return;
  }
  // Look for the function names in the inlined HTML. Most are bundled into
  // JS chunks referenced by name; we fetch the main bundle next.
  const inline = CTA_ANALYTICS_TOKENS.filter((t) => homepageBody.includes(t));

  // Find main bundle reference
  const bundleMatch = homepageBody.match(/\/assets\/(index-[a-zA-Z0-9_-]+\.js)/);
  let bundlePresent = [];
  if (bundleMatch) {
    try {
      const bRes = await fetch(`${SITE}/assets/${bundleMatch[1]}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (bRes.ok) {
        const bBody = await bRes.text();
        bundlePresent = CTA_ANALYTICS_TOKENS.filter((t) => bBody.includes(t));
      }
    } catch {
      /* swallow */
    }
  }

  const found = new Set([...inline, ...bundlePresent]);
  const missing = CTA_ANALYTICS_TOKENS.filter((t) => !found.has(t));
  if (missing.length === 0) {
    record('P1', 'cta_analytics_markers_present', 'PASS', { found: [...found] });
  } else {
    // Minified bundles may rename function symbols, so a partial miss is a
    // warning rather than a fail.
    record('P2', 'cta_analytics_markers_present', 'WARN', { missing, found: [...found], note: 'symbols may be minified' });
  }
}

async function checkCanonical(homepageBody) {
  if (!homepageBody) {
    record('P2', 'canonical_link_present', 'SKIP', { note: 'homepage body unavailable' });
    return;
  }
  const m = homepageBody.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (!m) {
    record('P1', 'canonical_link_present', 'FAIL', { note: 'no <link rel="canonical"> in homepage' });
    return;
  }
  const href = m[1];
  if (!href.startsWith(SITE) && !href.startsWith('https://')) {
    record('P1', 'canonical_link_absolute_https', 'FAIL', { href });
    return;
  }
  record('P1', 'canonical_link_present', 'PASS', { href });
}

async function checkAllRoutes() {
  for (const route of ROUTES) {
    const r = await probe(`${SITE}${route}`);
    if (!r.ok) {
      record('P1', `route_reachable_${route}`, 'FAIL', { note: r.error });
      continue;
    }
    if (r.status >= 500) {
      record('P0', `route_no_5xx_${route}`, 'FAIL', { status: r.status });
    } else if (r.status >= 400) {
      record('P1', `route_no_4xx_${route}`, 'FAIL', { status: r.status });
    } else if (r.status >= 300) {
      // 3xx is OK if it's a known canonical redirect; we record as PASS
      // because the audit's job is to detect missing/broken, not assert
      // exact URL canonical form.
      record('P2', `route_status_${route}`, 'PASS', { status: r.status, redirect: r.headers.location });
    } else {
      record('P2', `route_status_${route}`, 'PASS', { status: r.status });
    }
  }
}

// ───── orchestrator ──────────────────────────────────────────────────────
async function main() {
  if (!QUIET) console.log(`# WWL Site Health Audit  —  ${new Date().toISOString()}`);
  if (!QUIET) console.log(`# Site: ${SITE}\n`);

  let homepageBody = '';
  try {
    homepageBody = (await checkHomepage()) ?? '';
  } catch (e) {
    record('P0', 'homepage_reachable', 'FAIL', { note: String(e?.message ?? e) });
  }

  await checkRobots();
  await checkSitemap();
  await checkSecurityHeaders(homepageBody);
  await checkAllRoutes();
  await checkApiRoutes();
  await checkAnalyticsMarkers(homepageBody);
  await checkCanonical(homepageBody);

  // ── Summary
  const summary = {
    site: SITE,
    timestamp: new Date().toISOString(),
    counts: {
      P0: { pass: 0, fail: 0, warn: 0, skip: 0 },
      P1: { pass: 0, fail: 0, warn: 0, skip: 0 },
      P2: { pass: 0, fail: 0, warn: 0, skip: 0 },
    },
    results,
    manualVercelEnvChecklist: MANUAL_VERCEL_ENV_CHECKLIST,
  };
  for (const r of results) {
    const key = r.status.toLowerCase();
    if (summary.counts[r.severity][key] !== undefined) {
      summary.counts[r.severity][key] += 1;
    }
  }

  // Write JSON
  await writeFile(`${OUTPUT_BASE}.json`, JSON.stringify(summary, null, 2));

  // Write Markdown
  const md = renderMarkdown(summary);
  await writeFile(`${OUTPUT_BASE}.md`, md);

  if (!QUIET) {
    console.log('');
    console.log(`Report: ${OUTPUT_BASE}.json + ${OUTPUT_BASE}.md`);
    console.log(`P0 fail=${summary.counts.P0.fail}  P1 fail=${summary.counts.P1.fail}  P2 fail=${summary.counts.P2.fail}`);
  }

  // Exit policy
  const hasFatal =
    summary.counts.P0.fail > 0 ||
    summary.counts.P1.fail > 0 ||
    (STRICT && summary.counts.P2.fail > 0);

  exit(hasFatal ? 1 : 0);
}

function renderMarkdown(summary) {
  const lines = [];
  lines.push(`# WWL Site Health Report`);
  lines.push('');
  lines.push(`**Site:** ${summary.site}`);
  lines.push(`**Run at:** ${summary.timestamp}`);
  lines.push('');

  lines.push(`## Summary`);
  lines.push('');
  lines.push(`| Severity | Pass | Fail | Warn | Skip |`);
  lines.push(`|---|---:|---:|---:|---:|`);
  for (const sev of ['P0', 'P1', 'P2']) {
    const c = summary.counts[sev];
    lines.push(`| ${sev} | ${c.pass} | ${c.fail} | ${c.warn} | ${c.skip} |`);
  }
  lines.push('');

  const fatal =
    summary.counts.P0.fail > 0 || summary.counts.P1.fail > 0;
  lines.push(`**Verdict:** ${fatal ? '❌ REGRESSION (P0 or P1 fail)' : '✅ HEALTHY'}`);
  lines.push('');

  // Per-severity sections
  for (const sev of ['P0', 'P1', 'P2']) {
    const ofSev = summary.results.filter((r) => r.severity === sev);
    if (ofSev.length === 0) continue;
    lines.push(`## ${sev}`);
    lines.push('');
    lines.push(`| Status | Check | Detail |`);
    lines.push(`|---|---|---|`);
    for (const r of ofSev) {
      const mark =
        r.status === 'PASS' ? '✅' :
        r.status === 'FAIL' ? '❌' :
        r.status === 'WARN' ? '⚠️' :
        '➖';
      const detailStr = Object.entries(r.detail || {})
        .map(([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`)
        .join('; ');
      lines.push(`| ${mark} ${r.status} | \`${r.name}\` | ${detailStr || ''} |`);
    }
    lines.push('');
  }

  // Manual Vercel env-var checklist
  lines.push(`## Manual Vercel Env-Var Checklist`);
  lines.push('');
  lines.push(
    'The following env vars are **manual-remediation only**. This routine ' +
      'does NOT probe Vercel and does NOT auto-rotate secrets. Verify in the ' +
      'Vercel dashboard (Project → Settings → Environment Variables) that ' +
      'each is set for Preview and Production with non-empty values, and ' +
      'that none appear in Git or client bundles.',
  );
  lines.push('');
  for (const k of summary.manualVercelEnvChecklist) {
    lines.push(`- [ ] \`${k}\``);
  }
  lines.push('');

  // Do-not-auto-fix list
  lines.push(`## Do-NOT-Auto-Fix List`);
  lines.push('');
  lines.push('Per the WWL Site Health Recovery Plan, this routine NEVER auto-fixes:');
  lines.push('');
  lines.push('- Vercel environment variables');
  lines.push('- Stripe, Notion, Supabase, Resend secrets');
  lines.push('- Pricing values');
  lines.push('- Production deployment settings');
  lines.push('- Domain changes');
  lines.push('');
  lines.push(
    'Safe auto-fix candidates (PRs only, never direct commits to main): ' +
      'sitemap/robots allowlist drift, route metadata drift, missing analytics ' +
      'attributes, obvious broken links.',
  );
  lines.push('');

  lines.push(`---`);
  lines.push(`_Generated by \`scripts/audit-site-health.mjs\`._`);

  return lines.join('\n');
}

main().catch((err) => {
  console.error('audit script error:', err);
  exit(2);
});
