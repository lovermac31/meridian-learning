# Jurassic English DigitalOcean host plan

Status: staging release `20261016-r2` (commit `32d646b`, production commit `5a4595e` + host adapter) is live at https://staging.jurassicenglish.com and matches production on 207/207 checked paths; production remains on Vercel. Cutover is a separate owner decision (see "Before any production cutover").
Date: 2026-10-16 (Asia/Ho_Chi_Minh)

## Decision

Keep `jurassicenglish.com` on the current Vercel production project while a separate DigitalOcean host is built and tested as staging. Do not point production DNS at a Droplet until the acceptance gate below passes. The current public site depends on Vercel behavior which the repository's `server.ts` does not implement.

The Droplet is Singapore, Ubuntu 24.04 x64, Basic 2 vCPU / 4 GiB / 80 GB, estimated $24/month before tax ($0.036/hour), no block volume, no paid backups, and free metrics enabled. It is active at public IPv4 `152.42.198.173` and private VPC address `10.104.0.3`. This is a test-host size, not a capacity guarantee.

## Provisioned host state

- Dedicated firewall `jurassic-english-staging-fw` is attached only to this Droplet. It allows inbound TCP 22, 80 and 443; outbound ICMP, TCP and UDP are allowed.
- UFW is active with inbound default deny and outbound allow; only 22/80/443 are permitted inbound.
- SSH password and keyboard-interactive auth are off. Root SSH is disabled (`PermitRootLogin no`); the root `authorized_keys` file is empty. Non-root `je-admin` has key-based access and sudo; the dedicated host key is `~/.ssh/id_ed25519_jurassic_admin` on the controlling Mac. `sshd -t` passed, the service was reloaded, and a fresh `je-admin` login plus `sudo -n true` succeeded after disabling root SSH. The earlier shared WWL public key was removed from the Droplet. Max authentication attempts is four; agent forwarding, TCP forwarding, X11 forwarding and tunnels are off.
- Fail2ban SSH jail is active. Ubuntu unattended package updates are enabled. Nginx is installed and its default server returns 404 rather than exposing a generic welcome page.
- Ubuntu 24.04 security updates were applied. Seven packages remain listed as upgradable due to phased and/or kernel package updates; no reboot was performed.
- SSH is still permitted from any IPv4/IPv6 source at the network firewall. It requires the dedicated host key and Fail2ban; narrow the CIDRs to the owner's trusted network when supplied. The current key is an administrator key, not a deploy-only key; create a distinct least-privilege deployment account/key when the service unit and release directory are defined.
- No Jurassic application code or production secrets have been deployed to the host. DNS and the live Vercel site are unchanged.

## Production contract to preserve

The inspected production deployment is Vercel project `jurassic-english`, built from `lovermac31/meridian-learning` `main` at `eb59afff5c146366c85fc99fad008bc4ee2702fc`. It uses Node 24, `npm run build`, and `dist` output. Its route contract contains 12 API function handlers, 23 redirects, 22 rewrites, 12 header rules, and a daily `/api/health` cron at 12:00 UTC. Rewrites expose AI Speaking and school/product sub-apps on the Jurassic domain.

The staging branch now dispatches all 12 functions declared by `vercel.json` to the existing API handlers and applies configured redirects, rewrites, and response headers. External section rewrites are proxied to their current Vercel applications. Route-table tests and smoke tests cover this implementation, but full route-by-route parity against production is still required before calling the host production-ready.

## Host build sequence

1. Restrict SSH CIDRs to the owner's trusted network when its CIDR is supplied. Do not reuse `wwl-beta-sg1` or attach its firewall.
2. Create a non-root deploy account with a separately reviewed, least-privilege deployment key and sudo policy. Bind the Node service to loopback behind Nginx TLS termination.
3. Pin Node 24 and install the reviewed commit in a reproducible deployment directory. Build with `npm ci` and `npm run build`. Deploy immutable release directories and switch a symlink atomically; keep the previous release for rollback.
4. Implement and test a generated route layer from `vercel.json` for every API handler, redirect, rewrite and response-header rule. Preserve request method/body/query, dynamic path parameters, cache semantics, CSP, noindex, and canonical-host behavior. Reject the release if any route differs from the Vercel contract.
5. Run the health job as a systemd timer with a bounded timeout, one retry, `CRON_SECRET` from a root-readable environment file, structured result logs, and an alert on consecutive failures. Ensure the health check does not send customer mail or cause duplicate work.
6. Provision only staging credentials for synthetic tests. Production credentials, signing keys, customer records, payment processing, CRM writes, and live email remain on Vercel until a distinct credential-transfer and cutover decision is recorded. Never place values in cloud-init, Git, shell history, or deployment logs.
7. Use a staging hostname and synthetic data to verify all 12 API handlers, all redirects and rewrites, security/cache headers, SEO routes, EN/VI presentation, AI Speaking and school sub-apps, forms, private portal authorization, cron, and restart recovery.
8. Run the staging host in parallel for at least 14 days. Compare availability, latency, 5xx, CPU/memory, deploy recovery, and total cost. The single Droplet remains one failure domain; this is not high availability.

## Acceptance checks

- `npm ci --ignore-scripts --no-audit --no-fund` succeeds from the pinned commit.
- `npm test`, `npm run lint`, and `npm run build` pass.
- Route-manifest test proves exact parity with all Vercel API/redirect/rewrite/header entries and the health schedule.
- HTTP smoke checks match Vercel for status, redirect location, content type, relevant security/cache headers, and API method behavior.
- Staging-only form tests prove accepted and rejected submissions without external contact or production data writes.
- Health timer logs successful and failed executions without leaking secrets or personal data; a forced failure produces the expected alert.
- Rollback to the prior immutable release is tested. Vercel remains the production rollback target.

## Rollback and release boundary

For staging failure, stop the service, retain sanitized diagnostics, and delete the pilot Droplet after preserving needed evidence. For any later approved DNS cutover, restore the previous Vercel DNS values and verify the live domain, API health, canonical redirects, headers, and key routes. No production cutover is part of this host-build step.

## Baseline verification evidence

At the inspected production commit, `npm ci` succeeded, `npm test` passed 265/265, and `npm run build` succeeded. The build emitted the existing Rollup chunk-size warning and omitted sitemap `lastmod` values because the checkout was shallow. These checks validate the Vercel source baseline only; they do not prove a self-hosted deployment works.

Live read-only checks returned 200 for `/`, `/api/health`, `/ai-speaking`, and `/student-academy`; `www.jurassicenglish.com` returned the expected 308 canonical redirect. No production secrets were read or copied.

## Host access verification (2026-10-16)

- Connected to `jurassic-english-host-pilot-sgp1` with the dedicated Jurassic administrator key; verified host identity, Nginx active, and the expected empty-host HTTP 404.
- Created non-root `je-admin`, installed the dedicated public key, validated its sudoers file with `visudo -cf`, and verified `sudo -n true` over a fresh SSH connection.
- Set and verified effective `PermitRootLogin no`, `PasswordAuthentication no`, and `KbdInteractiveAuthentication no`; `sshd -t` passed and SSH was reloaded.
- Removed the prior WWL shared public key and confirmed root has zero authorized SSH keys. Fail2ban, unattended-upgrades, Nginx, and UFW report active.
- SSH source CIDRs remain `0.0.0.0/0` and `::/0` because the owner's trusted CIDR has not been supplied. Key-only auth and Fail2ban remain active; restrict the DigitalOcean and UFW SSH rules when a stable owner CIDR is known.

## Staging release verification (2026-10-16)

- Installed official Node.js `v24.21.0` for Linux x64 at `/opt/node-v24.21.0`; verified its archive with the matching `SHASUMS256.txt` entry from nodejs.org.
- Deployed source-only release `20261016-r1` to `/opt/jurassic-staging/releases/20261016-r1`; `.env*`, Git history, local dependencies, Vercel state, and production secrets were excluded.
- `npm ci --ignore-scripts --no-audit --no-fund`, `npm run lint`, all 270 tests, and `npm run build` passed on the Droplet. The build retains the existing >500 kB Rollup chunk warning; sitemap `lastmod` is omitted because deployment source lacks Git history.
- `jurassic-staging.service` is enabled and running as non-root `je-app`, bound to `127.0.0.1:3001`, with systemd filesystem/kernel protections, no privilege escalation, 2 GiB memory cap, and 150% CPU cap. Nginx proxies port 80 to the loopback service.
- Public staging preview: `http://152.42.198.173/`. Staging responses carry `X-Robots-Tag: noindex, nofollow`. No custom hostname or TLS is configured yet.
- Fresh external smoke checks passed for `/`, `/vi/luyen-noi-ielts/`, `/ai-speaking`, `/ai-speaking/pricing`, `/student-academy`, `/api/health`, and unknown API 404 behavior. The `www` canonical 308 retained its query string. AI Speaking and Student Academy rewrites returned 200.
- All 12 API routes were exercised with safe GET requests; method guards returned 405 where expected. Operator/Notion routes returned 503 because no credentials were provisioned, so staging cannot write customer or CRM data. No production secrets were transferred.
- The IP preview is staging-only and has no HTTPS. Do not promote DNS or announce it.

## Open decisions

- Whether the host is staging only or is intended to become a production failover after the parallel-run gate.
- Owner's trusted IPv4/IPv6 CIDR to narrow SSH access.
- Dedicated Jurassic deployment key; do not reuse the WWL beta key for the finished production setup.
- A separate explicit approval is required before production secrets or customer-data access are provisioned on the Droplet.

## Route parity release r2 (2026-10-16)

**What changed.** A parity probe of `r1` against production (207 paths) found 136 differences. In `r2`, `src/server/createApp.ts` routes requests the way Vercel documents for `vercel.json`:
- headers and redirects;
- then the filesystem (static files and functions);
- then rewrites;
- then the filesystem again for internal rewrites;
- then 404.

The fixes:
- **Directories without a trailing slash:** served from `index.html` with 200, not 301-redirected. This affected every market page.
- **Unknown paths:** return Vercel's `text/plain` 404, not the SPA shell with 200.
- **Static files before rewrites.**
- **Cache-Control:** Vercel's default `public, max-age=0, must-revalidate` when nothing else sets one.
- **`.ico`:** served as `image/vnd.microsoft.icon`.
- **Request bodies:** parsed only on function routes, so a POST proxied to AI Speaking keeps its body. The old global JSON parser would have emptied it.

Vercel references (vercel.com/docs/project-configuration/vercel-json, read 16 Oct 2026):
- "precedence is given to the filesystem prior to rewrites being applied";
- with `trailingSlash` unset, "visiting a path with or without a trailing slash will not redirect".

**Evidence.**
- **Local checks:**
  - `npm run lint` passes; `npm test` passes 280/280 (10 new integration tests in `tests/vercel-host-app.test.ts`);
  - `npm run build`, `npm run test:metadata` (14/14) and `npm run validate:prerender` pass.
- **On the host:** the same tests pass 280/280.
- **Parity, recorded once from production** with `scripts/host/parity-*.mjs` (207 paths: 127 sitemap pages, every redirect, rewrite and header source, assets, images, root files, directories, unknown paths, all 12 API routes, and the `www` redirect):
  - `r1`: 71/207;
  - `r2` on loopback: 207/207;
  - `r2` through nginx and TLS: 207/207.
- **What matched:** status, Location, Content-Type, every header named in a `vercel.json` rule, and the body sha256 of every static page and asset.
- **Expected differences:**
  - API bodies with timestamps;
  - `X-Robots-Tag: noindex, nofollow` on every staging response;
  - HSTS matches production on every non-error response, via the nginx `map` in `/etc/nginx/conf.d/jurassic-hsts.conf`, which is added only when the upstream sends none.
- **Staging-only values:** `/etc/jurassic-staging/app.env` (root, 0600) holds a cron secret and four operator keys, generated on the host and never copied off it. With them, protected routes answer 401 as in production instead of 503. No production secret is on the host. The file is loaded by the drop-in `/etc/systemd/system/jurassic-staging.service.d/10-staging-env.conf`.
- **Health cron:** `jurassic-health.timer` runs at 12:00 UTC daily, the `vercel.json` schedule.
  - `scripts/host/health-check.sh` makes one retry and logs structured JSON.
  - A manual run returned the expected staging result: authorized, Supabase not configured.
  - A forced failure fired `jurassic-health-alert.service`, which writes an error-level journal entry and `/var/lib/jurassic-health/LAST_FAILURE`. The test marker was then cleared.
  - No external alert channel exists yet.
- **Releases:** `scripts/host/deploy-release.sh` builds `releases/<name>` from `git archive <full sha>`.
  - Each release has a `RELEASE_SHA` file and is owned by root after the build.
  - A candidate runs on `127.0.0.1:3002` for the probe.
  - Activation is an atomic symlink switch that checks the expected current release first.
- **Rollback drill:** `r2` → `r1` (a market page returned the 301 that only `r1` produces) → `r2` (200), with health OK.
- **Crash recovery:** after a SIGKILL, systemd restarted the service in about 7 seconds.

**Note.** `r2` was built from `32d646b`. The branch head adds only operator tooling (comparer and activation guard), no app code.

## Before any production cutover

These still apply after a perfect parity run.
- Remove both noindex layers: nginx `add_header X-Robots-Tag "noindex, nofollow" always` (with `proxy_hide_header X-Robots-Tag`) and `STAGING=true` in the unit. Otherwise production would be de-indexed.
- `npm start` runs `tsx server.ts`, transpiling at runtime. Compile before production.
- Production secrets need their own explicit transfer approval. Then rerun the probe with them in place: the 401 paths will behave differently.
- Run in parallel for 14 days. The DNS change at Namecheap belongs to the owner. Vercel stays the failback.
- Alerting: add a real channel. Today an alert is a journal entry plus a marker file.
- The host is a single Droplet with no paid backups, so it is one failure domain.
- Pending kernel updates need a planned reboot, followed by the probe again.
- The SSH source CIDR is still open, waiting for the owner's trusted network.
