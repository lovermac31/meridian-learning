# P00 audit: navigation and links, EN|VI switcher, Story Quest reconciliation

Read-only audit run on 2026-10-15 (around 06:33 to 07:00 UTC). Nothing was edited, committed, deployed or submitted. Only GET/HEAD requests were sent, plus language-switcher clicks in the Claude Browser pane. One scratch-only build of committed HEAD went to `scratchpad/p00-nav/head-build/`; it used `git archive`, so the repo was not touched.

Evidence files are in `/private/tmp/claude-501/-Users-jayadams-Downloads-World-Wide-Learning-WWL-Website-Design-2026-WEBSITE-OVERHAUL-DIRECTIVE/3d1b1974-0f33-4b4a-8141-46238d9939e5/scratchpad/p00-nav/`:
- `crawl.mjs` is the crawler and `crawl.json` holds the raw results (67 pages, 1,781 link edges, externals)
- `switch.txt` lists hreflang alternates and switcher hrefs per page
- `extra.mjs` holds the targeted VI-equivalent checks
- `live-sq/` holds the live Story Quest bundle
- `head-build/` is the HEAD rebuild
- `live.str`, `head.str` and `dirty.str` are the string-literal diffs

## Summary

| Area | Result |
|---|---|
| Internal URLs fetched | 67 pages from 9 seeds. Pages at depth 0–3 were parsed: depth 2 was followed, and depth 3 was fetched and parsed but not followed. 13 more targets got a status-only check. Cap was 300; the site ran out of links before reaching it. Throttled to 1 request per 150 ms. |
| Non-200 internal links | **0** (all 1,550 internal link edges resolve to 200, directly or after a redirect) |
| Broken in-page anchors | **15 pages**: the "Skip to main content" link points to `#main-content`, but no element with that id exists |
| Dead ends (pages with 0 outbound internal links) | **0** (the fewest on any page is 13) |
| `href="#"` / `href=""` | **0**. 10 `<a>` tags have no href, and all are intentional (see 1.5) |
| External links | 7 unique, all reach 200 (zalo and PayPal go through a 302 first) |
| Redirect chains | All single-hop; none longer than 1 |
| EN/VI switcher | Works on most pages, with 7 issues (section 2) |
| Story Quest links on `/` and `/student-academy` | Present and working |
| Story Quest: live vs source | **Neither HEAD nor the current dirty tree** (section 3) |

## 1. Navigation and links (production https://jurassicenglish.com)

### 1.1 Non-200 internal links
None. Every internal `<a href>` found on the 67 crawled pages resolves to 200. The 13 targets that were status-checked only (one level deeper) are also 200 or a single 307 hop, for example `/insights/*`, `/ielts-speaking-online` and `/vi/insights`.

URLs that are not linked anywhere but were probed as possible VI equivalents (expected 404s, not broken links): `/vi/student-academy`, `/vi/young-learners-speaking/`, `/ai-speaking/vi/{pricing,lessons,exam,samples,privacy,terms}`.

### 1.2 Redirect chains (all single-hop)
| From | Chain | To |
|---|---|---|
| http://jurassicenglish.com/ | 308 | https://jurassicenglish.com/ |
| https://www.jurassicenglish.com/ | 308 | https://jurassicenglish.com/ |
| /ai-speaking/baseline?lang=vi | **308** → 200 | /ai-speaking/vi/baseline |
| /ai-speaking/solutions?lang=vi (and ?from=landing&lang=vi) | **301** → 200 | /ai-speaking/vi/solutions?… |
| /ai-speaking/writing?lang=vi | **307** → 200 | /ai-speaking/vi/writing |
| /ai-speaking/vi/writing?lang=en | 307 → 200 | /ai-speaking/writing |
| /ai-speaking/writing/{demo,sample}?lang=vi | 307 → 200 | /ai-speaking/vi/writing/{demo,sample} |
| /ai-speaking/vi/writing/{demo,sample}?lang=en | 307 → 200 | /ai-speaking/writing/{demo,sample} |

Notes:
- The `?lang=` redirects use three different status codes: 308 for baseline, 301 for solutions and 307 for writing.
- Trailing-slash variants both return 200 with no redirect. For example, `/vi/` and `/vi` are both 200, as are `/framework/` and `/framework`, and `/young-learners-speaking` and `/young-learners-speaking/`. Canonical tags are present, so this is low risk.
- The Story Quest app links back to `https://www.jurassicenglish.com`, which costs one 308 hop.

### 1.3 Broken fragment anchors (`#id` not present on the target page)
143 unique fragment links were checked. All are fine except the skip link `href="#main-content"` on these **15 pages**. Each has a `<main>` element with no `id="main-content"`. I confirmed this with curl on /framework, /methodology and /vi/legal/terms.

| Page | Link |
|---|---|
| /framework, /vi/framework | Skip to main content / Chuyển đến nội dung chính |
| /methodology | Skip to main content |
| /get-started, /vi/get-started | same |
| /legal/{privacy,terms,cookies,accessibility,disclaimer} | same |
| /vi/legal/{privacy,terms,cookies,accessibility,disclaimer} | same |

These are the Next.js-rendered "sb" template pages (`/vi/methodology` most likely shares the problem but is not in the crawl).

### 1.4 Dead ends
None. Every crawled page has at least 13 outbound internal links. The legal, framework and methodology template pages have the fewest at 13.

### 1.5 Empty href / `href="#"` / buttons
- `href="#"`, `href=""` and `javascript:` hrefs: **0**.
- `<a>` with no href: **10**, all intentional.
  - 8 are `<a id="how-it-works">` named anchors on the `/ai-speaking/solutions` and `/ai-speaking/vi/solutions` variants.
  - 2 are the current-language marker (`aria-current="true"`) in the switcher on `/about/nathaniel-jay-adams` ("English") and `/vi/ve-thay-jay-adams` ("Tiếng Việt").
- Language switchers on `/`, `/vi`, `/framework`, `/methodology`, `/legal/*`, `/get-started`, `/insights` and `/young-learners-speaking/` are `<button>` elements with no href. They only work with JavaScript, so a crawler cannot follow them; hreflang `<link>` tags carry the SEO signal instead.
- On `/young-learners-speaking/` and `/vi/luyen-noi-ielts/` the SSR HTML also shows a "中文" button.
- On `/vi/luyen-noi-ielts/` the SSR HTML marks "English" as `aria-pressed="true"`. JavaScript corrects it to "Tiếng Việt" after hydration.

### 1.6 External links (status)
| URL | Status | Linked from (pages) |
|---|---|---|
| https://worldwise-story-quest.vercel.app/#home | 200 | 3 (/, /vi, /student-academy) |
| https://www.worldwiselearning.app/ | 200 | 32 |
| https://zalo.me/84396085076 | 302 → 200 | 11 |
| https://zalo.me/0396085076 | 302 → 200 | 8 (solutions pages) |
| PayPal `_xclick` Live Speaking Baseline USD 27 | 302 → 200 | /young-learners-speaking/, /vi/luyen-noi-ielts/ |
| PayPal `_xclick` One-to-one 60 min USD 31 | 302 → 200 | same |
| PayPal `_xclick` Month of 8 lessons USD 217 | 302 → 200 | same |

Note that two different Zalo numbers are in use (84396085076 and 0396085076). They are probably the same line written in international and local format; confirm.

`mailto:` links (not fetched):
- info@jurassicenglish.com, with several subject variants
- legal@worldwiselearning.com, which uses the .com domain while the site links to worldwiselearning.app

### 1.7 Crawled pages (status, html lang, robots meta, internal outbound links)
| Path | Depth | Status | lang | robots | Internal out |
|---|---|---|---|---|---|
| / | 0 | 200 | en | index, follow | 19 |
| /vi | 0 | 200 | vi | index, follow | 19 |
| /student-academy | 0 | 200 | en | - | 19 |
| /young-learners-speaking/ | 0 | 200 | en | index, follow | 20 |
| /vi/luyen-noi-ielts/ | 0 | 200 | vi | index, follow | 20 |
| /ai-speaking | 0 | 200 | en | - | 24 |
| /ai-speaking/vi | 0 | 200 | vi | - | 24 |
| /framework | 0 | 200 | en | index, follow | 13 |
| /methodology | 0 | 200 | en | index, follow | 13 |
| /ai-speaking/baseline | 1 | 200 | en | - | 19 |
| /ai-speaking/pricing | 1 | 200 | en | - | 19 |
| /legal/privacy | 1 | 200 | en | index, follow | 13 |
| /legal/terms | 1 | 200 | en | index, follow | 13 |
| /get-started | 1 | 200 | en | index, follow | 13 |
| /ai-speaking/baseline?lang=vi | 1 | 200 | vi | - | 19 |
| /vi/framework | 1 | 200 | vi | index, follow | 13 |
| /vi/legal/privacy | 1 | 200 | vi | index, follow | 13 |
| /vi/legal/terms | 1 | 200 | vi | index, follow | 13 |
| /vi/get-started | 1 | 200 | vi | index, follow | 13 |
| /ai-speaking/lessons?pack=lesson_single | 1 | 200 | en | - | 23 |
| /ai-speaking/lessons?pack=lesson_month | 1 | 200 | en | - | 23 |
| /ai-speaking/lessons?lang=vi&pack=lesson_single | 1 | 200 | en | - | 23 |
| /ai-speaking/lessons?lang=vi&pack=lesson_month | 1 | 200 | en | - | 23 |
| /ai-speaking/exam | 1 | 200 | en | - | 26 |
| /ai-speaking/solutions?from=landing | 1 | 200 | en | index, follow | 35 |
| /ai-speaking/privacy | 1 | 200 | en | - | 23 |
| /ai-speaking/terms | 1 | 200 | en | - | 24 |
| /ai-speaking/pricing?lang=vi | 1 | 200 | en | - | 19 |
| /ai-speaking/exam?lang=vi | 1 | 200 | en | - | 26 |
| /ai-speaking/solutions?from=landing&lang=vi | 1 | 200 | vi | index, follow | 37 |
| /ai-speaking/vi/baseline | 1 | 200 | vi | - | 19 |
| /ai-speaking/privacy?lang=vi | 1 | 200 | en | - | 23 |
| /ai-speaking/terms?lang=vi | 1 | 200 | en | - | 24 |
| /ai-speaking/pricing?lang=en | 2 | 200 | en | - | 19 |
| /ai-speaking/samples?lang=en | 2 | 200 | en | - | 27 |
| /ai-speaking/samples | 2 | 200 | en | - | 27 |
| /ai-speaking/solutions | 2 | 200 | en | index, follow | 35 |
| /ai-speaking/writing | 2 | 200 | en | index, follow | 24 |
| /ai-speaking/lessons?lang=vi | 2 | 200 | en | - | 23 |
| /legal/cookies | 2 | 200 | en | index, follow | 13 |
| /legal/accessibility | 2 | 200 | en | index, follow | 13 |
| /legal/disclaimer | 2 | 200 | en | index, follow | 13 |
| /ai-speaking/solutions?lang=vi | 2 | 200 | vi | index, follow | 37 |
| /ai-speaking/lessons | 2 | 200 | en | - | 23 |
| /about/nathaniel-jay-adams | 2 | 200 | en | index, follow | 22 |
| /ai-speaking/terms?lang=en | 2 | 200 | en | - | 24 |
| /ai-speaking/samples?lang=vi | 2 | 200 | en | - | 27 |
| /ai-speaking/vi/solutions | 2 | 200 | vi | index, follow | 37 |
| /ai-speaking/vi/writing | 2 | 200 | vi | index, follow | 24 |
| /ai-speaking/vi/solutions?lang=en | 2 | 200 | vi | index, follow | 37 |
| /ai-speaking/vi/solutions?from=landing&lang=vi | 2 | 200 | vi | index, follow | 37 |
| /ai-speaking?lang=vi | 2 | 200 | en | - | 24 |
| /vi/legal/cookies | 2 | 200 | vi | index, follow | 13 |
| /vi/legal/accessibility | 2 | 200 | vi | index, follow | 13 |
| /vi/legal/disclaimer | 2 | 200 | vi | index, follow | 13 |
| /ai-speaking/samples/basic | 3 | 200 | en | - | 27 |
| /ai-speaking/samples/intermediate | 3 | 200 | en | - | 27 |
| /ai-speaking/samples/advanced | 3 | 200 | en | - | 27 |
| /ai-speaking/writing/demo | 3 | 200 | en | index, follow | 16 |
| /ai-speaking/writing/sample | 3 | 200 | en | index, follow | 14 |
| /ai-speaking/writing?lang=vi | 3 | 200 | vi | index, follow | 24 |
| /ai-speaking/vi/solutions?lang=vi | 3 | 200 | vi | index, follow | 37 |
| /vi/ve-thay-jay-adams | 3 | 200 | vi | index, follow | 27 |
| /insights | 3 | 200 | en | index, follow | 18 |
| /ai-speaking/vi/writing/demo | 3 | 200 | vi | index, follow | 16 |
| /ai-speaking/vi/writing/sample | 3 | 200 | vi | index, follow | 14 |
| /ai-speaking/vi/writing?lang=en | 3 | 200 | en | index, follow | 24 |

## 2. EN|VI switcher and hreflang

Method:
- hreflang, canonical and switcher hrefs were read from the SSR HTML.
- Then, in the Claude Browser pane, the VI (or EN) switcher control was clicked and the page I landed on was recorded.

| EN page | hreflang vi alternate | Switcher click lands on | Verdict |
|---|---|---|---|
| / | /vi | /vi (lang=vi) | OK |
| /vi to EN | en=/ | / | OK |
| /framework | /vi/framework | /vi/framework | OK |
| /methodology | **none** (en and x-default only) | /vi/methodology. Its h1 reads "Available soon" and robots is `noindex, nofollow` | Known: there is no real VI page. The switcher sends users to a placeholder |
| /legal/privacy (and terms, cookies, accessibility, disclaimer) | /vi/legal/… | /vi/legal/privacy | OK |
| /get-started | /vi/get-started | /vi/get-started | OK |
| /insights | /vi/insights (200) | /vi/insights | OK |
| /student-academy | **none** | VI and "Tiếng Việt" links go to `/vi` (the homepage) | Known: no VI page. The switcher lands on the VI homepage, not a localized equivalent. `/student-academy` also has no robots meta and no hreflang |
| /young-learners-speaking/ | /vi/luyen-noi-ielts/ | **/young-learners-speaking/?lang=vi**, translated client-side with lang=vi | **Mismatch**: the switcher does not go to the hreflang VI URL |
| /vi/luyen-noi-ielts/ to EN | en=/young-learners-speaking/ | /young-learners-speaking/ | **Bug (sticky preference)**. See the reproduction steps below the table |
| /ai-speaking | /ai-speaking/vi | /ai-speaking/vi | OK (both directions) |
| /ai-speaking/baseline | /ai-speaking/vi/baseline | links go directly to /ai-speaking/vi/baseline | OK |
| /ai-speaking/solutions | /ai-speaking/vi/solutions | `?lang=vi` → 301 → /ai-speaking/vi/solutions | OK |
| /ai-speaking/vi/solutions to EN | en=/ai-speaking/solutions | In the browser, `?lang=en` lands on /ai-speaking/solutions | Works with JS. **Without JS or cookies**, curl of `/ai-speaking/vi/solutions?lang=en` returns **200 with the VI page** (no redirect), unlike writing, which returns 307 |
| /ai-speaking/writing (and /demo, /sample) | /ai-speaking/vi/writing… | `?lang=vi` → 307 → VI path | OK |
| /ai-speaking/pricing, /lessons, /exam, /samples (and samples/basic, intermediate, advanced), /privacy, /terms | **none** | `?lang=vi` on the same path, localized client-side (pricing shows "Bảng giá"; exam, privacy and terms are already VI in the SSR HTML) | SEO gap: VI content sits at a `?lang=vi` URL whose SSR `<html lang="en">` and canonical point to the EN URL, with no hreflang. Not indexable as VI |
| /ai-speaking?lang=vi (linked as "Tổng quan" from the 6 VI solutions variants) | n/a | Returns the EN page (lang=en, EN h1), with no redirect to /ai-speaking/vi | **Wrong link**: the VI "Tổng quan" (Overview) nav item leads to the English overview. It should point to /ai-speaking/vi |
| /about/nathaniel-jay-adams | /vi/ve-thay-jay-adams | link to /vi/ve-thay-jay-adams (reciprocal) | OK |

Reproduction for the sticky-preference bug on `/vi/luyen-noi-ielts/`:
1. On `/young-learners-speaking/`, choose VI. This sets `localStorage.yls_preferred_language=vi`.
2. Open `/vi/luyen-noi-ielts/` and click English.
3. The browser navigates to `/young-learners-speaking/` but the page **still renders Vietnamese** (html lang=vi, VI h1, "Tiếng Việt" pressed). The English click does not update the stored preference before navigating.
4. Choosing English on the EN URL itself (which goes to `?lang=en`) does fix it. Any EN-URL visit with a stored `vi` preference renders Vietnamese at an EN canonical URL.

Every hreflang set found is reciprocal (EN↔VI pairs list each other plus x-default).

Verification notes:
- `/ai-speaking?lang=vi` was also loaded in the browser. After hydration it **stays English** (lang=en, EN h1), so the "Wrong link" verdict for the VI "Tổng quan" nav item stands.
- VI to EN was clicked on `/vi`, `/vi/framework`, `/ai-speaking/vi`, `/ai-speaking/vi/solutions` and `/vi/luyen-noi-ielts/`. For `/vi/legal/*`, `/vi/get-started` and `/vi/insights` it is inferred from the shared template and the hreflang.
- Not tested: the switcher on `/insights/*` articles and on `/ielts-speaking-online` (these were only status-checked).

## 3. Story Quest inventory (no backup, no changes made)

Repo: `~/antigravity/EPU---World-Wise-Learning-Option-2-Prototype`, remote `origin` = `https://github.com/lovermac31/wwl-institutional-practice-platform.git`

| Item | Value |
|---|---|
| Branch | `claude/epu-beta-v1.5-production` |
| HEAD | `282994edc704bf14841f9e9f74515739096f7bdd` (2026-10-12 06:52 +0700, "feat(header): restructure header into unified 3-zone layout and eliminate right-edge overflow") |
| package | `worldwise-story-quest` v4.0.0 |
| Scripts | `dev: vite`, `build: vite build`, `preview: vite preview --port 3000 --host 0.0.0.0`, `lint: tsc --noEmit`, `test: tsx tests/domain.test.ts` |
| dist/ | **Exists** (gitignored). Built 2026-10-13 14:09:52. `.vercel/output/static` holds byte-identical copies (`vercel build` output, 14:09:38–52) |
| .vercel/project.json | projectName `worldwise-story-quest`, framework vite, outputDirectory dist, node 24.x. `.vercel/.env.preview.local` exists (not opened) |
| Other worktree | `/private/tmp/worldwise-story-quest-release` at 282994e (detached). Marked **prunable** because the directory no longer exists. Created 2026-10-13 14:12 |

`git status --short -- worldwise-story-quest`:
```
 D worldwise-story-quest/node_modules        (tracked symlink -> ../node_modules; it is now a real directory, mtime Oct 13 14:09)
 M worldwise-story-quest/src/App.tsx
 M worldwise-story-quest/src/client/api-client.ts
 M worldwise-story-quest/src/components/StoryArtwork.tsx
 M worldwise-story-quest/src/components/StrategyCampaignMap.tsx
 M worldwise-story-quest/src/domain/server-db.ts
 M worldwise-story-quest/tests/domain.test.ts
?? worldwise-story-quest/docs/production/
?? worldwise-story-quest/package-lock.json
?? worldwise-story-quest/src/components/ScholarModal.tsx
?? worldwise-story-quest/src/domain/crypto-hash.ts
?? worldwise-story-quest/src/domain/storage-adapter.ts
```

`git diff --stat -- worldwise-story-quest` shows 7 files changed, 612 insertions(+), 84 deletions(-):
- App.tsx: 276
- api-client.ts: 72
- StoryArtwork.tsx: 18
- StrategyCampaignMap.tsx: 10
- server-db.ts: 132
- domain.test.ts: 187
- node_modules: 1

Untracked files:
- docs/production/ (10 files): ACADEMIC_VALIDATION, ACCESSIBILITY_REPORT, ARCHITECTURE_AND_DATA_FLOW, FUNCTIONAL_QA_MATRIX, PERFORMANCE_BASELINE, PRIVACY_SECURITY_REVIEW, PRODUCTION_GAP_ANALYSIS, PRODUCTION_READINESS_REPORT, RELEASE_CHECKLIST, ROLLBACK_AND_RECOVERY (.md)
- package-lock.json
- src/components/ScholarModal.tsx
- src/domain/crypto-hash.ts
- src/domain/storage-adapter.ts

Ignored: `.vercel/`, `dist/`

Last-modified times (local, +0700):
| File | mtime |
|---|---|
| src/App.tsx | 2026-10-13 14:09:04 |
| tests/domain.test.ts | 2026-10-13 14:09:10 |
| package-lock.json | 2026-10-13 14:09:48 |
| src/components/StrategyCampaignMap.tsx | 2026-10-13 13:48:53 |
| src/components/StoryArtwork.tsx | 2026-10-13 13:38:48 |
| docs/production/ | 2026-10-12 07:37:19 |
| src/components/ScholarModal.tsx | 2026-10-12 07:32:44 |
| src/domain/crypto-hash.ts | 2026-10-12 07:26:02 |
| src/client/api-client.ts | 2026-10-12 07:25:20 |
| src/domain/server-db.ts | 2026-10-12 07:25:03 |
| src/domain/storage-adapter.ts | 2026-10-12 07:24:25 |
| dist/* | 2026-10-13 14:09:52 (no src or test file is newer than dist) |

### 3.1 Live vs local asset comparison
Live: https://worldwise-story-quest.vercel.app/ returned 200, with `last-modified: Thu, 15 Oct 2026 06:00:58 GMT` (edge cache HIT, age 2023 s).

| Build | JS | CSS | JS sha256 (first 12) |
|---|---|---|---|
| **Live** | `index-CtwotNil.js` (578,791 B) | `index-DDnYKx3V.css` (90,163 B) | 1eca3bb96632 |
| Local `dist/` = `.vercel/output/static` (dirty tree, Oct 13 14:09) | `index-zZfAt-N_.js` (596,248 B) | `index-BelulsDF.css` (92,115 B) | dea127b02daf |
| Scratch rebuild of committed HEAD 282994e (`git archive`, same node_modules) | `index-CUk9jcKV.js` (~577.4 kB) | `index-BjnIuOT9.css` (~88.9 kB) | 3fdd2db23672 |

The live index.html matches the local dist/index.html apart from the two asset lines. Static assets (crest, Rex art, logos) have the same filenames in both.

Content markers searched for in the bundles:
| Marker | Origin | Live | Local dist | HEAD rebuild |
|---|---|---|---|---|
| "Manage or Switch Scholar Profile", "Switched scholar profile.", "Failed to create scholar profile." | dirty tree (ScholarModal and App changes) | 0 | 1 | – |
| `wwl_durable_state_v4`, `wwl_durable_corrupted_backup`, `wwl_active_attempt_id` | dirty tree (storage-adapter, server-db) | 0 | 1 | – |
| "Could not update curriculum level." | dirty tree | 0 | 1 | – |
| HEAD-only classes that the dirty tree replaced (`grid-cols-2 … border-stone-200`, `hidden xl:flex flex-col leading-none`, `max-w-[85px]`, `hidden xl:inline text-xs font-bold`) | HEAD 282994e | 1 | 0 | present |
| 282994e header strings ("Academic Lore Codex", "Open Explorer Backpack", "Mute audio synthesizer") | HEAD | 1 | – | present |
| "Explore Cognitive Quest 3D", `cognitive-quest-title`, link to worldwise-cognitive-quest.vercel.app | **uncommitted** App.tsx edit | **1** | 1 | **0** |
| Cognitive Quest h2 classes | live: `font-heading text-xl font-black text-stone-900 sm:text-2xl`; current dirty App.tsx: `mt-1 font-heading text-lg sm:text-xl font-black text-stone-900` | differ | – | – |

### 3.2 Conclusion (with uncertainty)
- Live **does not match the dirty working tree**. It lacks every scholar-profile and durable-storage marker. Deploying the current local `dist/` or `.vercel/output` would ship those uncommitted changes.
- Live **does not exactly match committed HEAD**. It is HEAD 282994e plus one uncommitted addition: an "Explore Cognitive Quest 3D" card, in a **different styling iteration** from the one in the current App.tsx (which one came first is not established). A rebuild of HEAD lacks this card and produces a different hash.
- Vercel deployment list (read-only, team `jay71adams-1388s-projects`): the current production deploy is `dpl_ACTxemCGMkLSXrqd1QVZDV5jZTk2`, **created 2026-10-13 14:13:08 +0700** (production, READY). Earlier deploys were:
  - `dpl_6VN1EQ6ytb3AkvwcfdkqiAM9foRg` at 14:10:00, a preview. It matches the local `.vercel/output` timing (builds.json 14:09:38), so it is probably the dirty-tree build.
  - `dpl_6Nqx9qAhZawCe6qECRWZBPqhe687` at 13:56:28, production.
  - `dpl_4gdGEqqzJiwGcbB7BHpbHEFnXrUZ` on 10-12 at 07:37:47, production.

  All of them are prebuilt (the file tree contains only `.vercel/output`). The file listing was truncated, so asset filenames could not be read, and the deployment URLs are behind Vercel auth (302).
- Most likely scenario: production `dpl_ACTx…` (14:13:08) is a prebuilt deploy from the `/private/tmp/worldwise-story-quest-release` worktree. That worktree was created at 14:12:27 at HEAD 282994e and has since been deleted. The Cognitive Quest card was applied there by hand, so the result was HEAD plus the card, without the scholar-profile and storage work. The dirty-tree build went only to the 14:10 preview. This is inferred from timing; it is not proven.
- The live source therefore **cannot be reproduced from git**.
- Caveats:
  - The marker method shows which features are present, not byte identity.
  - The HEAD rebuild used the working tree's current real `node_modules` directory. That directory replaced the tracked `../node_modules` symlink, so its dependencies may differ from the ones the release build used. Hash and size comparisons against the rebuild are therefore weak evidence. The conclusion rests on the content markers: no dirty-only markers, the HEAD-only classes present, and the Cognitive Quest card present. Other small uncommitted changes cannot be ruled out.
  - The live `last-modified` is 2026-10-15 06:00 GMT, which may reflect an edge-cache refresh rather than the deploy time. Vercel deployment metadata was not checked.

### 3.3 Story Quest links from production
| Page | Link text | href | Result |
|---|---|---|---|
| / | "Try the Free 2-Min Story Quest Activity (Ages 6–12)" and "Try Free Story Quest" (path cards) | https://worldwise-story-quest.vercel.app/#home, `target=_blank rel="noopener noreferrer"` | 200. In a browser it renders the h1 "Majestic English quests for confident young scholars." with no console errors |
| /student-academy | "Play the Free 2-Min Story Quest (ages 6–12)" and "Play the free 2-minute Story Quest" (placement section) | same | 200, working |
| /vi | 2 links | same | 200 |
