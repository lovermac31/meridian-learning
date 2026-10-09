# Security Hardening Roadmap

_Status: **planned — not yet implemented.** Created 2026-06-16, after the header/footer typography-uniformity phase shipped to production (PR #39, `main` @ `2aa9996`)._

## Purpose

Tracks the remediation roadmap from the 2026-06-16 read-only functional + security audit of the
Jurassic English monorepo (main Vite SPA · `ecosystem-landing` Next.js app · `api/` serverless
functions · static `/young-learners-speaking/`; Stripe · Supabase · Vercel).

The audit (static code + config + dependency + functional review; **no** live pentesting) found
**overall posture STRONG** — no critical or exploitable code vulnerabilities. Verified mature
controls:

- Operator/admin auth via `crypto.timingSafeEqual` + Bearer + IP allowlist + audit logging
  (`api/_lib/operatorSecurity.ts`); correctly applied to `internal/pilot-requests*` via the shared handler.
- HMAC-SHA256 expiring portal tokens with constant-time verification + `exp` enforcement
  (`api/verify-external-portal-access.ts`).
- Fail-closed rate limiting (Upstash-capable; `api/_lib/rateLimitStore.ts`).
- Strict, non-wildcard CORS allowlist (`api/_lib/corsSecurity.ts`).
- Supabase access via PostgREST JSON bodies (no SQL injection).
- No hardcoded secrets, no committed `.env`, only `VITE_TESTIMONIALS_ENABLED` (a flag) exposed client-side.
- Strong baseline headers (nosniff, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy,
  `noindex` on internal/pilot/pricing routes); email masking in logs.

Remaining items are **hardening / config / dependency / compliance** improvements, split into five
small, independently-reviewable PRs. **No hardening code is written until each PR is explicitly approved.**

## Current state & checkpoints

| Item | Value |
|---|---|
| Production `main` commit | `2aa9996` (PR #39 merged + deployed; live on jurassicenglish.com) |
| Prior safe checkpoint (rollback target) | `4b2cb50` (PR #38) |
| Dirty perf/header branch | `perf/initial-payload-2026-06-10` @ `3e9eb90` — **untouched; do not modify** |
| Testimonials | Flag-dark (`VITE_TESTIMONIALS_ENABLED` default off); **Phase 3 not started** |
| Header/footer typography uniformity | **Complete & live** |

## Global rules for every hardening PR

- One concern per PR; isolated `git worktree` off fresh `origin/main`; **preview-first**.
- No auto-merge — each PR awaits explicit approval.
- Never touch the dirty perf/header branch; never start testimonials Phase 3.
- **No production deploy without explicit confirmation.**
- Recommended sequence: **A → B → C** (B before C so CSP can drop the font CDN); **D** independent; **E** after product/legal sign-off.

---

## PR A — Security metadata (safe warm-up)

- **Scope:** Responsible-disclosure policy + repo security metadata. No app/runtime behavior change.
- **Files likely touched:** `SECURITY.md` (new), `public/.well-known/security.txt` (new). No dependency changes.
- **Risk:** 🟢 Very low — static text; no code paths, no runtime surface.
- **Rollback:** Delete the two files / revert the PR; zero runtime impact.
- **QA commands:** `npm run lint` · `npm run build` · `npm run validate:prerender`; confirm `/.well-known/security.txt` resolves in `dist` and stays `noindex`.
- **Deployment impact:** Negligible — two static files; safe to deploy anytime.
- **Out of scope:** Any dependency changes, header/CSP/HSTS changes, form changes, or code.

## PR B — HSTS & header hardening (+ self-host display font)

- **Scope:** Add `Strict-Transport-Security`; review existing `vercel.json` headers; self-host the Neuland display font (still used by the hero) to drop the low-trust `db.onlinewebfonts.com` dependency.
- **Files likely touched:** `vercel.json` (HSTS header); `index.html` + `docs/.../ecosystem-landing/src/app/layout.tsx` (CDN `<link>` → self-hosted `@font-face`); `public/fonts/…` (font asset); `src/index.css` / ecosystem `globals.css` (`@font-face` + `--font-display`).
- **Risk:** 🟡 Low-Med. **Do NOT enable `preload`** unless every subdomain is HTTPS-safe (preload is hard to reverse — ramp `max-age` short→long). **Confirm Neuland-Inline redistribution license** before bundling the file.
- **Rollback:** Remove the HSTS header (note: an already-served `max-age` persists in browsers — start short, avoid `preload`); revert the font to the CDN link.
- **QA commands:** `npm run build`; `curl -I <preview-url>` to verify headers; visual check that the hero wordmark renders from the self-hosted font on the preview deployment.
- **Deployment impact:** Low; staged via preview. Self-hosting the font also removes one third-party request (perf win).
- **Out of scope:** CSP enforcement (PR C), dependency updates (PR D), consent/forms (PR E).

## PR C — CSP enforcement

- **Scope:** Move CSP from `Content-Security-Policy-Report-Only` to enforced `Content-Security-Policy`; drop `'unsafe-eval'`; reduce `'unsafe-inline'` via nonces/hashes; remove `db.onlinewebfonts.com` (after PR B self-hosts the font). Add a `report-to`/`report-uri` sink **first** to collect violations.
- **Files likely touched:** `vercel.json` (CSP header); `index.html` + ecosystem inline-script / `<style>` / JSON-LD handling (nonce/hash for `va.vercel-scripts.com`, theme CSS, JSON-LD).
- **Risk:** 🟠 **Med-High** — enforcing CSP can break inline scripts, external fonts, the Google Apps Script form, analytics, JSON-LD, Vercel scripts, and third-party embeds.
- **Rollback:** Flip the single header key back to `*-Report-Only` (fast, low-risk).
- **QA commands:** Preview-first. Keep report-only and collect violations across **all** public routes; then enforce on preview and manually exercise homepage, `/school-framework`, `/student-academy`, the YL page + forms, BotUI, analytics, and JSON-LD; browser console must show **zero** CSP violations before any prod consideration.
- **Deployment impact:** High if mis-scoped. Staged rollout: preview → zero violations → prod, with report-only fallback ready.
- **Out of scope:** Adding new third-party origins; dependency changes; consent/forms.

## PR D — Dependency remediation

- **Scope:** Update `next` (ecosystem, high) and **runtime-reachable** highs in the main app (`undici`, `path-to-regexp`, `ws`); explicitly separate **dev/build-only** vulns (`vite`, `esbuild`, `tsx`, `@vercel/*`) and prioritize production-reachable ones.
- **Files likely touched:** `package.json` + `package-lock.json` (main); ecosystem `package.json` + `package-lock.json`; minor code only if a major bump changes an API.
- **Risk:** 🟠 **Med-High** — bumps (esp. Next 16 / React 19 ecosystem, Vite tooling) can break build or runtime. **Do NOT use blind `npm audit fix --force`.** Targeted, reviewed updates only.
- **Rollback:** Revert the lockfile / `package.json` changes; pin back to prior versions.
- **QA commands:** `npm ci` + full gate in **both** apps — main: `npm run lint` · `npm run test:testimonials` · `npm run test:metadata` · `npm run validate:prerender` · `npm run build`; ecosystem: `npm ci` + `next build`. `npm audit` before/after to confirm reduction; serverless route smoke checks (`health`, `get-started`, `pricing-registration`) on preview.
- **Deployment impact:** Med — runtime dep changes affect production behavior; verify on preview + API smoke-test before prod; stage one app at a time.
- **Out of scope:** Header/CSP changes; consent/forms; feature changes.

## PR E — Minor consent & form compliance (requires product/legal sign-off)

- **Scope:** Explicit parent/guardian consent capture where child data or recordings are involved; privacy-policy link; separate general-contact consent from recording/media consent (data minimization); route the YL booking form through the rate-limited serverless API (or add captcha/honeypot) so validation, logging, CORS, and rate limits apply.
- **Files likely touched:** `young-learners-speaking/index.html` (consent fields + privacy link + form action); a new/extended `api/` route mirroring `get-started`'s validation + rate-limit + CORS; a validation lib; legal copy source.
- **Risk:** 🟠 Med — involves **legal/product wording** (must be approved) + a live form-flow change (test end-to-end).
- **Rollback:** Revert the form markup + route; the existing Google Apps Script endpoint remains as the fallback.
- **QA commands:** `npm run lint` · `npm run build`; submit the form on preview (valid / invalid / consent-unchecked) → confirm `429` rate-limit, validation, and that submission is **blocked without consent**; confirm leads still reach their destination.
- **Deployment impact:** Med — touches a **live lead-capture form**; verify no leads are lost; preview-test thoroughly before prod.
- **Out of scope:** Broader GDPR program, cookie-consent banner, analytics changes — unless separately requested. **Blocked on product/legal approval of the consent copy.**

---

## Audit findings → PR mapping

| Sev | Finding | Addressed by |
|---|---|---|
| 🔴 High | `next` (ecosystem) + runtime-reachable highs (`undici`, `path-to-regexp`, `ws`) | PR D |
| 🟠 Med | CSP is `Report-Only` + allows `unsafe-inline`/`unsafe-eval` | PR C |
| 🟠 Med | No HSTS header | PR B |
| 🟠 Med | Supply chain: Neuland from `db.onlinewebfonts.com` (no SRI), in CSP | PR B (+ C drops it from CSP) |
| 🟠 Med | Minor/child PII: no explicit consent checkbox on YL booking form | PR E |
| 🟡 Low-Med | Rate limiting defaults to in-memory unless `ENABLE_DURABLE_RATE_LIMIT` set | Ops check (verify prod env) — fold into PR D or track separately |
| 🟡 Low-Med | YL form posts directly to public Google Apps Script (bypasses rate-limit) | PR E |
| 🟡 Low | No `SECURITY.md` / `security.txt` | PR A |
| ⚪ Info | `innerHTML` / `dangerouslySetInnerHTML` sinks all static (i18n / theme / JSON-LD) | No action — safe as-is |

_Implementation of any PR above is gated on explicit per-PR approval. This document is the tracked plan only._
