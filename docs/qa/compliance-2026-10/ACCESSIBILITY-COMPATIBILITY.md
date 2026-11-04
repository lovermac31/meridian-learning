# Accessibility and compatibility — 27 Oct 2026

## A. Plan and scope

Audit production public GET surfaces, then reproduce any JE-owned defect locally before changing code. No order, form, account, workbook submission, live payment, or external mutation was performed. All non-GET browser requests were aborted. Chromium used `--mute-audio`, Firefox `media.volume_scale=0.0`, and WebKit used media muting before playback; native video controls remained present. Narration was disabled in reader interaction probes.

Baseline: `d81d1bd`, isolated `codex/compliance-accessibility` worktree. This report distinguishes deployed observations from the local fix. A clean automated scan is not a WCAG conformance certification.

## B. Implementation

**FIX-PR: sample dialog keyboard containment in WebKit.** `src/components/ProductsPage.tsx` previously handled Tab only at the last control and Shift+Tab only at the first/dialog container. WebKit's default Tab behavior skips buttons: from the initially focused dialog, forward Tab escaped it at both tested widths. The new handler explicitly cycles through enabled buttons/links in either direction, including entry from the dialog. It preserves Escape, arrow navigation, content, sample images, and focus restoration logic.

`scripts/test-sample-viewer-keyboard-browser.mjs` verifies every enabled control, two forward cycles, reverse entry, Escape, and restoration to a keyboard opener. Production before-fix run failed `webkit/en/390: forward 0`; local fixed build passes all 12 engine/width/language combinations. This is evidence of an actual browser difference rather than a speculative change.

## C. Verification

| Check | Result | Evidence |
|---|---|---|
| Public surface matrix | 54 page visits: 9 routes × 3 engines × 2 widths; all return 200 after redirects | `evidence/accessibility/results.json` |
| Automated initial-state WCAG checks | 52 new axe scans, zero violations; WCAG2 A/AA, 2.1 AA, 2.2 AA tags | Same JSON |
| Chromium products axe | Prior merged #208 proof reused; no duplicate axe scan | Existing accordion browser script/proof |
| Layout and image attributes | No horizontal overflow; no `<img>` lacking `alt` on visited initial states | Same JSON; this does not assess semantic adequacy of every alt |
| Products interactions | Accordion Enter opens; sample opens and Escape closes in all six browser/width pairs | Same JSON |
| Sample keyboard regression, fixed build | 12/12: Chromium/WebKit/Firefox × 390/1440 × EN/VI | `sample-keyboard.json`; failing baseline `sample-keyboard-before.txt` |
| Video compatibility | Story Club product MP4 decodes, advances >1s while muted, native controls present, 1280px decoded width, default EN track showing in all six pairs | `interactions.json` |
| Subtitle control | Keyboard selects VI, `aria-pressed=true` after React settles in all six pairs | `keyboard.json` |
| Reader | Keyboard next-scene changes scene to 2, focus moves to article in all six pairs | `interactions.json` |
| Story Quest | Keyboard EN → Ages 6–7 → Start opens `#reader`, heading “Who made the locked lighthouse flash?” in all six pairs | `quest-navigation.json`; initial `keyboard.json` start probe was disabled/no age and is not navigation evidence |
| Story Quest selected-age accessibility | Six additional axe scans reproduce one color-contrast defect in each state | `quest-navigation.json`: enabled Start control **1.01:1**, expected **4.5:1** |
| Existing application tests | 384/384 passed | `npm test` |
| Deterministic build and types | `npm ci`, `npm run build`, `npm run lint` pass | Local execution, no lockfile changes |

Browser versions: Chromium **153.0.8010.12**, Playwright WebKit **26.6**, Firefox **155.0**. Viewports **390×900** and **1440×900**. WebKit is an engine-level compatibility test, not a physical iPhone/Safari test.

Exact audited URLs (discovered from source or portal tests):

- `https://jurassicenglish.com/`
- `https://jurassicenglish.com/products`
- `https://jurassicenglish.com/products/story-club`
- `https://jurassicenglish.com/story-club`
- `https://jurassicenglish.com/ai-speaking`
- `https://books.jurassicenglish.com/`
- `https://books.jurassicenglish.com/book.html#mina-and-the-midnight-drum`
- `https://my.jurassicenglish.com/buy/printable-pack` → `/login?next=%2Fbuy%2Fprintable-pack`
- `https://worldwise-story-quest.vercel.app/#home`

Route provenance: `src/i18n/content/overhaul.ts`, `src/components/Hero.tsx`; books `docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing/src/lib/academy/levelBooks.ts`; portal read-only checkout `tests/e2e/simulation.spec.ts` and `app/buy/[product]/page.tsx`.

### Manual/automated boundaries and findings

1. **NEEDS-JAY / Story Quest enabled Start contrast (confirmed WCAG 1.4.3 failure):** After selecting Ages 6–7, the enabled Start button has white `#ffffff` text on `#fffdf7`, **1.01:1**, rather than required **4.5:1**. All six engine/width combinations reproduce the same axe finding. Its initial disabled state was exempt. Fix the enabled control’s background/text classes in the reconciled Story Quest source, then test selected and disabled states. No cross-repository/source-uncertain edit was made.
2. **NEEDS-JAY / accessible sample equivalent:** The modal's educational page text exists only as images. Alt is `product title: page N of M`; this names a page but does not convey its text, exercises, or diagrams. Axe cannot establish WCAG 1.1.1 equivalence from a nonempty alt. Provide an equivalent accessible HTML/text sample (or an accessible equivalent document without changing the view-only presentation). No guessed transcription or sample content was added in this PR.
3. **NEEDS-JAY / portal authenticated buy:** Public `/buy/printable-pack` redirects to login. The scan covers the login page, not the purchase form. Need a staging/test authenticated account and deterministic test catalogue to audit the buy UI without touching production orders. Static source has explicit form labels, fieldsets/legends and required terms checkbox, but source inspection is not a rendered authenticated audit.
4. **NEEDS-JAY / reader Firefox auth lock:** Both Firefox reader page visits emit `Acquiring an exclusive Navigator LockManager lock … immediately failed` from the reader's Supabase auth integration. The public story and scene navigation still work. Reproduce in the books source repo with a real/auth-mock session and inspect duplicated clients/lock timeout configuration; this external app is not owned by the JE worktree, so no unsafe cross-repo fix was made.
5. **Manual review remains:** Axe reports incomplete `color-contrast`, `video-caption`, and `aria-prohibited-attr` checks. This is not a clean bill for image/background text, caption accuracy, screen-reader reading order, or every interactive game state. Videos have language tracks but linguistic accuracy/native review and whether subtitles include all needed non-speech information remain unverified.
6. **WebKit opener distinction:** Pointer clicks do not necessarily focus buttons on macOS/WebKit; unchanged restoration logic returns the element focused before opening. The pointer smoke therefore reports `sampleFocusRestored=false` when checking the clicked button. With a keyboard opener, restoration passes all 12 fixed-build combinations. No speculative pointer-focus behavior change was included.
7. **Targets and contrast:** Products category/product actions have 48px minimums; sample controls are 44×44px and subtitle choices at least 44×36px. These exceed WCAG 2.2 AA's 24px target threshold, although the brief's stronger 48px touch target preference is not universal. Source palette contrast checks: forest `#1E4D3B`/white **9.63:1**; slate `#4A5568`/cream **7.04:1**; amber focus `#D97706`/white **3.19:1**; deep amber `#B45309`/white **5.02:1**. Plain amber must not be used for ordinary small white text; this check does not substitute for auditing composited backgrounds. Visible focus rings/skip-link presentation were inspected in captured states.

### First-screen clarity observations (390×900)

- Home: clear story-led English proposition, children/teens audience, learning-path and products actions. Price requires products navigation, reasonable for a multi-offer homepage.
- Story Club landing: ages 5–8, small online group, 590,000₫ for four weeks, group size and Zalo action visible within the first 900px. Opening paragraph is long but concrete.
- Story Club product detail: title and problem clear; large image pushes product price and purchase action below the first screen. Suggested follow-up: concise age/format/price/primary action immediately below the title, keeping the existing detailed content further down. No copy changed.
- Story Quest: clear free English reading game, ages 6–12, 10-minute/no-sign-up promise, age selection and start action. Start remains disabled until an age is selected.
- Reader: title, level, book selector and reader controls clear; no price needed for this free reading surface.
- Four representative screenshots are committed: WebKit 390 products initial, Chromium 390 Story Club landing/product detail, and WebKit 390 Story Quest reader after starting. Remaining screenshots, including `*-products.png` post-dialog scroll positions, are preserved locally under ignored `.regen/runs/accessibility/full/`. Those post-dialog images must not be represented as first-screen evidence.

Reproduce the focused regression against a built preview (browser tooling remains external; not a new application dependency):

```sh
npm ci --no-audit --no-fund
npm test
npm run lint
npm run build
npm run preview -- --host 127.0.0.1 --port 5202 --strictPort
# In another shell:
BROWSER_TOOLS=/private/tmp/je-l1-audit-0uEueC/node_modules \
BASE_URL=http://127.0.0.1:5202 \
EVIDENCE_DIR=.regen/runs/sample-keyboard \
node scripts/test-sample-viewer-keyboard-browser.mjs
```

Expected: 12 passing rows; production baseline fails WebKit forward-entry assertion. The initial interaction harness sampled some React `aria-pressed` values before rendering settled; `keyboard.json` uses an awaited condition and establishes subtitle selection in every pair. An early reader locator used the wrong accessible name; the corrected `Turn the page: next scene` probe produced the retained six successful reader results.

## D. Hardening and rollback

- No new dependencies, secrets, telemetry, user data, live submissions, or backend requests were added.
- The handler is limited to the mounted sample modal; disabled buttons remain excluded and the existing document listener is cleaned up on unmount.
- Rollback: revert the isolated `ProductsPage.tsx` keyboard-handler change and its browser regression script; rebuild and rerun the regression. No data migration or vendor settings rollback is needed.
- Changes are submitted as a draft accessibility PR for review. No merge/deploy was performed; production still exhibits the pre-fix focus behavior until the user merges.

## E. Confidence

**High (0.93)** that the local fix resolves the reproduced WebKit dialog escape while retaining keyboard closure/restoration. **Medium** for overall WCAG conformance: authenticated portal, accessible equivalent sample content, native device/screen-reader testing, caption review and deeper game states remain open.

## F. Assumptions

The chosen Story Club product and Mina story are representative samples, not evidence for every product/story. Existing #208 Chromium products accessibility evidence remains valid at baseline `d81d1bd`. Network non-GET blocking intentionally excludes analytics and account mutations.

## G. Tradeoffs / blind spots

1. Public engine tests are broad but are not real Safari/iPhone hardware, assistive-technology testing, authenticated portal testing, or complete Story Quest gameplay.
2. Story Quest's source/deployment reconciliation is documented as unresolved in `docs/je-excellence-2026/JE_STORY_QUEST_RECONCILIATION.md`; findings there remain report-only until a reproducible production source is established.
