# WWL Site Health Routine — Phase 4B

Live as of: 2026-05-26
Workflow: [`.github/workflows/wwl-site-health.yml`](../.github/workflows/wwl-site-health.yml)
Script: [`scripts/audit-site-health.mjs`](../scripts/audit-site-health.mjs)
Plan source: WWL Website Health Recovery Plan (2026-05-26)

## ⚠️ Required setup before the cron is reliable

The workflow **refuses to run** until you set a `SITE_URL` repository
variable. There is no hardcoded brand fallback — that's deliberate, so the
routine cannot silently monitor the wrong site if domains change.

**One-time setup (after merge):**

1. Open the repo on GitHub
2. **Settings → Secrets and variables → Actions**
3. Switch to the **Variables** tab (not Secrets — this is a variable, not a secret)
4. Click **New repository variable**
5. Name: `SITE_URL`
6. Value: the canonical production URL — today that's `https://jurassicenglish.com` (the live WWL web property; `worldwiselearning.com` does not currently resolve)
7. **Save**

Verify by triggering the workflow manually:

```bash
gh workflow run wwl-site-health.yml
```

The first step is a preflight that prints `Auditing: <SITE_URL>`. If
`SITE_URL` is empty, the job aborts with a labelled error before any
network probes happen.

**Per-run override** (e.g., to audit a Vercel preview URL) is available
via the `site_url` input of `workflow_dispatch`:

```bash
gh workflow run wwl-site-health.yml -f site_url=https://my-preview.vercel.app
```

The input takes precedence over `vars.SITE_URL` for that single run.

## What this is

A GitHub Actions-hosted routine that runs every day at **09:00 UTC** (and on
manual dispatch) to audit production health of the marketing site. The
routine **reports** and, when warranted, **opens or updates a single GitHub
issue**. It never auto-deploys, never rotates secrets, and never touches
Vercel configuration.

This is the technical implementation of the plan's recovery sequence —
bounce rate, indexing risk, core web vitals, and analytics instrumentation
all surface through deterministic checks that don't depend on real-time
traffic data.

## What it checks

Every check is bucketed by severity. The job fails (and opens an issue)
only on **P0 or P1** failures. **P2** is informational.

### P0 — must pass

| Check | Why |
|---|---|
| `homepage_reachable` | Site is up. |
| `robots_txt_returns_200` | Crawlers can read the directive file. 3xx redirect on `/robots.txt` is **fail-equivalent** for Google. |
| `sitemap_xml_returns_200` | Indexable sitemap exists. |
| `required_security_headers_present` | The five Phase 2.3A headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`) are live. |
| `homepage_status_2xx_or_3xx` | No 4xx/5xx on root. |
| `route_no_5xx_<path>` | Each canonical route returns under 500. |

### P1 — should pass; failure is a regression

| Check | Why |
|---|---|
| `sitemap_includes_required_routes` | The sitemap contains `/`, `/framework`, `/get-started`, `/methodology`. |
| `csp_present` | `Content-Security-Policy` (enforce) OR `Content-Security-Policy-Report-Only` is set. Phase 2.3A ships in report-only. |
| `canonical_link_present` | `<link rel="canonical" href="…">` is emitted on the homepage with an absolute HTTPS href. |
| `route_no_4xx_<path>` | Canonical routes return 2xx/3xx, not 4xx. |
| `api_no_5xx_<path>` | Public-probe API endpoints don't 5xx. |
| `api_no_wildcard_cors_<path>` | No `Access-Control-Allow-Origin: *` on `/api/*` (Phase 2.2A boundary). |
| `api_no_stack_trace_leak` | Malformed-input probe returns a sanitised error body — no `at …(file:line:col)` traces. |

### P2 — informational

| Check | Why |
|---|---|
| `route_status_<path>` | Status-code visibility for every canonical route. |
| `cta_analytics_markers_present` | `trackCtaClick`/`trackFormStart`/`trackFormSubmit`/`trackLowFrictionClick` appear in the bundle. **Warns** (not fails) because Vite may minify symbol names. |

### Lighthouse (optional)

Enabled per-run via `workflow_dispatch` input `run_lighthouse: true`.
Targets (per plan):

| Metric | Budget |
|---|---|
| Real Experience Score | ≥ 90 |
| LCP | < 2.5s |
| FCP | < 1.8s |
| TTFB | < 0.8s |
| CLS | < 0.1 |
| INP | < 200ms |

Lighthouse reports land in the `lighthouse/` artifact path. Scores below
budget are advisory in this phase — they don't fail the job. Once a
multi-week baseline exists, a follow-up packet can wire score regressions
into P1.

## What it does NOT do

Per the plan's **Do-NOT-Auto-Fix list**:

- ❌ Vercel environment variables (never auto-set, auto-rotate, or read values)
- ❌ Stripe / Notion / Supabase / Resend secrets
- ❌ Pricing values
- ❌ Production deployment settings
- ❌ Domain changes

The routine emits a **manual checklist** of the Vercel env vars that need
human verification:

- `SUPABASE_WRITE_KEY`
- `NOTION_TOKEN`
- `PRICING_ACCESS_LINK_OPERATOR_KEY`
- `PRICING_ACCESS_OPERATOR_KEY`
- `EXTERNAL_PORTAL_SIGNING_SECRET`
- `PRICING_ACCESS_SIGNING_SECRET`
- `INTERNAL_PORTAL_OPERATOR_KEY`
- `RESEND_API_KEY`
- `GEMINI_API_KEY`

Each appears as a markdown checkbox in the report body. The operator ticks
them off in the Vercel dashboard.

### Auto-fix scope (PRs only, never direct main)

A future packet may extend the script to **open a PR** (not auto-merge) for:

- Sitemap or robots allowlist drift
- Route metadata drift
- Missing analytics attributes
- Obvious broken links

The current implementation only reports. PR mode is a TODO once the
report shape stabilises over 1–2 weeks of real signal.

## How it runs

### Local dry-run

```bash
cd "jurassic-english™"
node scripts/audit-site-health.mjs \
  --site https://jurassicenglish.com \
  --output ./prod-report
# → prod-report.json  +  prod-report.md
# Exit code 0 (healthy) or 1 (P0/P1 fail).
```

CLI flags:

| Flag | Default | Notes |
|---|---|---|
| `--site` | `$SITE_URL` or `https://jurassicenglish.com` | Trailing slash stripped. |
| `--output` | `site-health-report` | Base name for `.json` + `.md`. |
| `--routes` | `/`, `/framework`, `/get-started`, `/methodology`, `/student-academy`, `/interactive-demo`, `/book-diagnostic`, `/school-framework` | Comma-separated. |
| `--api-routes` | `/api/health,/api/verify-pricing-access?token=bad-token,/api/verify-external-portal-access?token=bad-token` | Comma-separated. Pass `""` to skip API checks (used for local dry-run against `vite preview`). |
| `--sitemap-required` | `/`, `/framework`, `/get-started`, `/methodology` | Must be present in `/sitemap.xml`. |
| `--timeout` | `8000` | Per-request timeout in ms. |
| `--strict` | off | Treat P2 failures as fatal (exit 1). |
| `--quiet` | off | Suppress per-check console lines. |

### CI (GitHub Actions)

The workflow does, in order:

1. `npm ci`
2. `npm run lint`
3. `npm run build`
4. `vite preview` on port 4173 → local audit (no API)
5. Production audit against `inputs.site_url` (or `https://jurassicenglish.com`)
6. Optional Lighthouse against 4 routes
7. Combine into `wwl-site-health-report.md`
8. Upload all artifacts (kept 30 days)
9. On `prod_audit` failure → open/update single issue titled **`WWL Site Health Regression`**
10. On `prod_audit` success → close that issue if it exists (no spam on green days)

Manual trigger:

```bash
gh workflow run wwl-site-health.yml \
  -f site_url=https://your-preview.vercel.app \
  -f strict=false \
  -f run_lighthouse=false
```

## Skills referenced (per the plan)

The plan listed 20 skills. Their substance is covered as follows:

| Skill | Where it shows up |
|---|---|
| `/vercel`, `/vercel-observability`, `/vercel-security-access` | Manual env-var checklist + deferred Vercel API integration |
| `/nextjs-env-variables`, `/nextjs-best-practices`, `/env-secrets-manager` | Audit script never reads `.env` files; manual checklist for env-var hygiene |
| `/production-audit` | The whole script |
| `/web-performance-optimization`, `/core-web-vitals-tuner` | Lighthouse budgets (optional run) |
| `/analytics-tracking` | `cta_analytics_markers_present` check |
| `/google-search-console` | Manual follow-up (script can't auth to GSC) |
| `/seo-audit`, `/seo-technical`, `/seo-sitemap`, `/seo-schema` | Robots + sitemap + canonical + sitemap-route-coverage checks |
| `/conversionomics`, `/ux-audit`, `/ab-testing` | Deferred — depend on Real Experience Score and form telemetry beyond audit scope |
| `/api-security-hardener`, `/secure-headers-csp-builder` | Security-header check + wildcard-CORS check + stack-trace leak probe |

The script doesn't invoke skills at run time; it encodes their concerns
as deterministic checks so the routine runs without LLM cost in CI.

## Schedule, escalation, ownership

| Aspect | Decision |
|---|---|
| Cadence | Daily, 09:00 UTC. Aligned with Vietnam morning standup. |
| Failure escalation | Single GitHub issue, label `site-health` + `P1`. No paging. |
| Recovery | Issue auto-closes when the next run is green. |
| Permissions needed | `contents: read`, `issues: write`, `pull-requests: write`. |
| Secrets | None. The routine probes only public surfaces; no auth tokens are read. |

## When to extend this

1. **After a multi-week baseline exists** — wire Lighthouse score regressions into P1 (currently advisory).
2. **When the audit-fixable issues stabilise** — add a PR mode for the documented safe-fix categories.
3. **If preview-deployment validation becomes regular** — extend `workflow_dispatch` to accept Vercel automation bypass tokens via a repo secret rather than relying on public access.
4. **If the canonical route shape changes** — update `DEFAULT_ROUTES` and `SITEMAP_REQUIRED` in `scripts/audit-site-health.mjs`.

## Out of scope

The routine measures **readiness and regressions**. It does not measure or
attempt to drive:

- Bounce rate (Vercel Analytics / GA4)
- New-visitor counts (Vercel Analytics / GA4)
- Acquisition source mix
- Conversion-funnel performance

Those depend on real visitor data that lives outside this script. The
routine catches the technical regressions that depress those metrics —
slow LCP, broken sitemap, missing canonicals, leaked tracebacks — but
doesn't predict whether marketing work is moving the right way.
