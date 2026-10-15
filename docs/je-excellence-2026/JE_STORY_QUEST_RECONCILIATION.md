# JE Story Quest — Reconciliation (WP8, directive EXEC-02 §F)

Date: 15 Oct 2026. Mode: non-destructive. Full evidence: `06b_JE_STORY_QUEST_BACKUP_EVIDENCE.md`.
Status: **CONDITIONAL**. Preservation is complete and verified. Release reconciliation needs an owner decision (see §5).

## 1. Checklist against §F

| # | Requirement | Result | Evidence |
|---|---|---|---|
| 1 | Repo identity and working-tree state | Done | `~/antigravity/EPU---World-Wise-Learning-Option-2-Prototype`, origin `lovermac31/wwl-institutional-practice-platform`. Folder `worldwise-story-quest`: 6 modified, 1 deleted symlink, 5 untracked paths |
| 2 | Commit and branch | Done | `claude/epu-beta-v1.5-production` @ `282994edc704bf14841f9e9f74515739096f7bdd`, ahead 8 / behind 60 |
| 3 | Tracked, untracked and relevant ignored files | Done | `tracked-changes.patch` (`git diff --binary HEAD`), `untracked.tgz`. Full tar includes ignored `dist/` and `.vercel/` |
| 4 | Complete backup outside the working directory | Done | `~/Downloads/_backups/story-quest-2026-10-15/` (3 archives + MANIFEST.md) |
| 5 | Permissions, binaries, config | Done | tar keeps file modes; the patch is `--binary`. The full tar holds `.vercel/.env.preview.local` (short-lived `VERCEL_OIDC_TOKEN`), so it was set to mode 600 |
| 6 | Change inventory with hashes | Done | sha256 for every archive in MANIFEST.md. **Re-verified independently** with `shasum -a 256 -c`: 4/4 OK |
| 7 | Restore into an isolated location | Done | Fresh worktree at 282994e + patch + untracked tar; `diff -r` against the original showed no differences (exit 0) |
| 8 | Link the deployed Vite build to source | Done (negative result) | Live `index-CtwotNil.js`/`index-DDnYKx3V.css` matches **neither** HEAD (`CWas6gAP`/`BjnIuOT9`) **nor** the dirty tree (`zZfAt-N_`/`BelulsDF`). Bundle markers show live = HEAD + the "Cognitive Quest 3D" CTA only |
| 9 | Unreleased profile, storage and card changes | Done | Unreleased: ScholarModal (profile switch/create), storage-adapter (persisted `wwl_active_attempt_id`), crypto-hash (SHA-256 integrity), header layout change. Already live: Cognitive Quest 3D card |
| 10 | Safe development baseline, original untouched | Done | `~/antigravity/story-quest-dev-wt` (detached 282994e + restored dirty state, `npm ci` done). The original checkout's `git status` fingerprint is unchanged |

Not done, by design: no commit, push, reset, stash, prune, install or deploy in the original checkout. No Story Quest deployment.

## 2. Remaining uncertainty (exact)

1. **The exact source of production is unrecoverable from what is on disk.** Production `dpl_ACTxemCGMkLSXrqd1QVZDV5jZTk2` (2026-10-13 07:13Z) is a CLI `--prebuilt` upload with no git SHA. The most likely origin, `/private/tmp/worldwise-story-quest-release`, no longer exists. Marker and CSS-class evidence shows *what* is live (HEAD + the CTA block), but not the byte-exact `App.tsx` that produced it. Confidence: high that live = HEAD + CTA; unknown whether any non-marker detail differs.
2. **The 8 Story Quest commits (`110a0d1..282994e`) exist only on this Mac.** They are not on origin and not in any off-machine backup (the backup folder is on the same disk).
3. **Authorship of the dirty changes is not established** (files last modified 13 Oct 13:38–14:09 +07). They should not be committed under another identity (§F).
4. Whether the 60 origin commits the branch is behind conflict with the local 8 has not been tested. No fetch or merge was run.

## 3. What a deploy of the current dirty tree would change vs live

It adds ScholarModal, storage-adapter and crypto-hash, changes the header layout, adds 17.5 KB of JS and 2 KB of CSS, and drops the committed `node_modules` symlink. It is therefore **not** a like-for-like redeploy, and a casual `vercel deploy` from the original folder would ship unreleased features.

## 4. Proposed safe next action (needs owner approval; none of it has been done)

1. **Off-machine copy (lowest risk, do first):** push the 8 local commits to a new branch on origin (for example `backup/story-quest-local-282994e`) and copy the backup folder to cloud storage. Do not push the dirty tree.
2. **Reproduce live as a commit:** in `story-quest-dev-wt`, create a branch from 282994e that adds only the Cognitive Quest 3D CTA block. Build it and compare the bundle with `index-CtwotNil.js` (accept a marker and class-set match if not byte-identical). That commit becomes the documented source of production.
3. **Owner review of the unreleased features** (ScholarModal, persisted active attempt, SHA-256 hashing) as their own PR with tests (`tests/domain.test.ts` +187 lines is already in the dirty tree), committed under the owner's identity.
4. Only after 1–3: decide whether to redeploy, through a Git-connected build rather than `--prebuilt`, so future deployments carry a SHA.

Rollback (if any later deploy misbehaves): `vercel rollback dpl_ACTxemCGMkLSXrqd1QVZDV5jZTk2` (current production).
