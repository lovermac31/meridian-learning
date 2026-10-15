# 06b — JE Story Quest: Backup, Verification & Live Reconciliation Evidence (WP8)

Date: 2026-10-15 (backup 07:48Z). Mode: non-destructive. Nothing in the original checkout was edited, reset, stashed, committed, pushed, installed or deployed.

## 1. Source state recorded

| Item | Value |
|---|---|
| Checkout | `~/antigravity/EPU---World-Wise-Learning-Option-2-Prototype` (origin `lovermac31/wwl-institutional-practice-platform`) |
| Branch | `claude/epu-beta-v1.5-production`, **ahead 8 / behind 60** vs origin |
| HEAD | `282994edc704bf14841f9e9f74515739096f7bdd` (2026-10-12 06:52 +07) |
| Origin tip of that branch | `7f806d2` (via `git ls-remote`; no fetch run) |

**Risk:** the 8 commits `110a0d1..282994e` (every Story Quest commit) are **local only, not on origin**. They are safe in the new worktrees because those share the same object store, but they are not backed up off-machine.

`git status --porcelain=v1 -- worldwise-story-quest`:
```
 D worldwise-story-quest/node_modules          (committed symlink -> ../node_modules, now replaced by a real dir)
 M src/App.tsx  M src/client/api-client.ts  M src/components/StoryArtwork.tsx
 M src/components/StrategyCampaignMap.tsx  M src/domain/server-db.ts  M tests/domain.test.ts
?? docs/production/ (10 .md)  ?? package-lock.json  ?? src/components/ScholarModal.tsx
?? src/domain/crypto-hash.ts  ?? src/domain/storage-adapter.ts
```
Ignored: `.vercel/`, `dist/` (and `node_modules/` contents). Tracked diff: 7 files, +612 / −84. Dirty files last modified 2026-10-13 13:38–14:09 +07.

## 2. Backup — `/Users/jayadams/Downloads/_backups/story-quest-2026-10-15/`

| File | Bytes | sha256 |
|---|---|---|
| tracked-changes.patch (`git diff --binary HEAD`) | 53,030 | be6bfc73e5b3425eaade4bb1c3714bd4f5a3b5025c03b054f413eca723ef6ceb |
| untracked.tgz (14 untracked non-ignored files) | 48,699 | 43b78d6d6acad6fc4fa52ee650034ef3b459f0bc57340c56ed39d96f58ab1140 |
| worldwise-story-quest-full-no-node_modules.tgz (incl. dist/, .vercel/) | 26,460,659 | bcd6ce9f272f19d1b6c6a8155d85d6f9fb99cd0c3cba8428d6a4f514efa2af67 |
| MANIFEST.md | — | file lists, HEAD, branch, timestamps, restore steps |

The full tar includes `.vercel/.env.preview.local`, which holds a `VERCEL_OIDC_TOKEN` (short-lived), so treat the archive as sensitive.

## 3. Verification — PASS

`git worktree add --detach /Users/jayadams/antigravity/story-quest-dev-wt 282994e`, then `git apply --binary tracked-changes.patch` and `tar -xzf untracked.tgz` there. Its `git status` matches the original line for line. `diff -r -x node_modules -x dist -x .vercel <dev-wt>/worldwise-story-quest <live>/worldwise-story-quest` gave **exit 0, no output: identical.**

**Isolated dev worktree (keep):** `/Users/jayadams/antigravity/story-quest-dev-wt` (detached at 282994e plus the dirty changes, uncommitted). `npm ci` was run in its `worldwise-story-quest/` (89 packages, from the untracked lockfile). The original checkout was not touched.

Note: an older worktree `/private/tmp/worldwise-story-quest-release` (282994e) is registered but its directory is gone (shows "prunable"). I left it as is; pruning is the owner's call.

## 4. Reconciliation with https://worldwise-story-quest.vercel.app

Live (fetched 07:48Z, `x-vercel-cache: HIT`): `/assets/index-CtwotNil.js` (578,791 B) + `/assets/index-DDnYKx3V.css` (90,163 B).

| Build | JS | CSS | Matches live? |
|---|---|---|---|
| **Live** | index-CtwotNil.js 578,791 | index-DDnYKx3V.css 90,163 | — |
| Local `dist/` + `.vercel/output/static` (built 2026-10-13 14:09 +07, `vercel build --target preview`) | index-zZfAt-N_.js 596,248 | index-BelulsDF.css 92,115 | **No** |
| Dirty tree rebuilt in dev-wt (vite 6.4.4) | index-zZfAt-N_.js | index-BelulsDF.css | No (byte-identical to local dist, so that build is reproducible) |
| Clean HEAD, separate worktree `scratchpad/sq-head-build-wt` (root `npm ci --ignore-scripts`, via committed symlink, vite 6.4.3) | index-CWas6gAP.js 576,721 | index-BjnIuOT9.css 88,854 | No |
| Clean HEAD `git archive` + fresh standalone `npm install` (vite 6.4.4, react 19.3.1) | index-Bba7dLlW.js 577,356 | index-BjnIuOT9.css 88,854 | No |

All builds embed tailwind 4.3.3 and react 19.3.x, so dependency versions don't explain the gap. The cause is a difference in source.

**Content evidence (feature markers in the JS bundle, counts):**

| Marker | live | HEAD | dirty |
|---|---|---|---|
| "Cognitive Quest 3D" CTA (link to worldwise-cognitive-quest.vercel.app) | 1 | 0 | 1 |
| "Manage or switch scholar profile" (ScholarModal) | 0 | 0 | 1 |
| "Switched scholar profile" | 0 | 0 | 1 |
| `wwl_active_attempt_id` (storage-adapter / resume attempt) | 0 | 0 | 1 |
| SHA-256 constants (crypto-hash.ts) | 0 | 0 | 1 |

CSS class sets: live has 701 selectors, HEAD 691, dirty 734. Live = **all HEAD classes plus 10 more** (teal CTA styling: `bg-teal-800`, `from-teal-50`, `min-h-11`, `focus-visible:ring-teal-700`…, all of which appear in the dirty App.tsx). Live lacks 48 dirty-only classes and keeps 15 HEAD classes that the dirty tree removes (the old header layout: `lg:hidden`, `md:inline-flex`, `xl:inline`, `max-w-[85px]`…).

**Conclusion:** live production matches **neither** committed HEAD **nor** the current dirty tree / local dist. It is an intermediate snapshot: HEAD + the "Cognitive Quest 3D" CTA block only. Vercel record: the current production deployment is `dpl_ACTxemCGMkLSXrqd1QVZDV5jZTk2`, created 2026-10-13T07:13:08Z (14:13 +07) by jay71adams-1388. It is a CLI `--prebuilt` upload (source tree contains only `.vercel/output`), so it carries no git SHA. Preview `dpl_6VN1EQ6ytb3AkvwcfdkqiAM9foRg` was created at 07:10Z, and the local `.vercel/output` was built at 07:09Z as `target: preview`. Inference: the local output went to that preview, and production came from a different prebuilt output (most likely the now-deleted `/private/tmp/worldwise-story-quest-release`). The Oct 15 06:00Z `last-modified` header is a CDN artifact, not a new deploy. The protected per-deployment URLs were not opened, because doing so would require creating a bypass link.

## 5. What deploying the current dirty tree would change vs live

- **Adds** ScholarModal (profile switch/create from the header capsule, "Switched scholar profile" / "Scholar profile activated" notifications).
- **Adds** storage-adapter.ts (localStorage/memory abstraction, persisted active attempt `wwl_active_attempt_id`) and the matching changes to api-client.ts / server-db.ts.
- **Adds** crypto-hash.ts (pure-TS SHA-256 integrity hashing, used by server-db).
- **Changes** the header layout (padding/breakpoints, removes `lg:hidden`/`md:inline-flex`/`xl:inline` variants, capsule now always clickable), plus small StoryArtwork / StrategyCampaignMap tweaks.
- **Keeps** the Cognitive Quest 3D CTA that is already live.
- JS +17.5 KB (596,248 vs 578,791), CSS +2 KB.
- Non-shipping: tests/domain.test.ts (+187 lines), docs/production/*.md, package-lock.json (pins deps; HEAD has no story-quest lockfile).
- Deploy hygiene: the committed `node_modules -> ../node_modules` symlink is deleted in the dirty tree. Any commit should drop it deliberately and add the lockfile.

## 6. Worktrees created (metadata only in the original repo)

- `/Users/jayadams/antigravity/story-quest-dev-wt`: isolated dev worktree (dirty state restored). **Keep.**
- `/private/tmp/claude-501/.../scratchpad/sq-head-build-wt`: clean-HEAD build worktree in the session scratchpad. Throwaway; it will show as prunable once the scratchpad is cleared.
