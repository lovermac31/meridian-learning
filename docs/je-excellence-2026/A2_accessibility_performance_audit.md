# P00: Accessibility and performance audit, production jurassicenglish.com

Run date: 2026-10-15. Read-only. No forms submitted, nothing deployed, no repos edited.
Scripts and raw output: `/private/tmp/claude-501/-Users-jayadams-Downloads-World-Wide-Learning-WWL-Website-Design-2026-WEBSITE-OVERHAUL-DIRECTIVE/3d1b1974-0f33-4b4a-8141-46238d9939e5/scratchpad/p00-a11y/` (`a11y.mjs`, `focus.mjs`, `bl.mjs`, `fw.mjs`, `lh.sh`, `a11y-results.json`, `focus-results.json`, `lh/*.json`).

## Tools and method

- Playwright 1.49 driving installed Google Chrome (`channel: 'chrome'`, headless), @axe-core/playwright, tags `wcag2a, wcag2aa, wcag21aa, wcag22aa`, at 375x812 (isMobile/hasTouch) and 1440x900. Every page returned HTTP 200 with no redirect.
- Focus: Tab pressed 25 times from page load at 1440. For each focused element, a screenshot of its box (+8px) was taken while focused and again after blur, and the two were compared byte for byte. A first pass that compared computed styles gave false negatives because the Tailwind `transition` class had not finished. A manual screenshot of "Choose a Starting Step" confirmed a visible 2px forest ring, so the pixel diff is the result reported here.
- Touch targets: all visible interactive elements at 375 with width or height under 24px. Inline text links inside P/LI were excluded. The 24px spacing exception in WCAG 2.5.8 was **not** checked, so the items listed are candidates and not confirmed failures.
- Reduced motion: separate context with `reducedMotion: 'reduce'`, 2s settle, then `document.getAnimations()` running, video autoplay state, and a count of `prefers-reduced-motion` CSS rules.
- Lighthouse 12.8.2 (`npx -y lighthouse@12`), default mobile preset (simulated Moto G Power, 4x CPU, slow 4G), installed Chrome `--headless=new`, performance category only, 3 runs per URL, median reported. All runs came from one residential connection on one machine.
- **All performance numbers are LAB numbers.** I did not get field data (CrUX): the PageSpeed Insights API returned `429 RESOURCE_EXHAUSTED` (daily quota on the shared key), and no CrUX API key was available. The field-data columns stay empty until someone fetches real CrUX/PSI data.
- Automated checks find only part of real accessibility problems. No screen reader, zoom/reflow, or cognitive testing was done.

## 1. Accessibility findings

### 1a. axe-core results (violations and needs-review)

| id | page | rule / metric | severity | count | element selector / resource | recommended fix |
|---|---|---|---|---|---|---|
| A1 | /framework | color-contrast (1.4.3) | serious (violation) | 15 nodes at 375 and 15 at 1440 | `span.text-jurassic-accent.font-bold.uppercase.tracking-widest.text-xs` (section eyebrows): #f26419 on #fcfbfa/#fff gives 3.07–3.17:1 at 12px bold | Use a darker accent for small text (#c2410c or darker gives >=4.5:1 on white), or raise the eyebrow to >=18.66px bold |
| A2 | /framework | color-contrast (1.4.3) | serious (violation) | included in A1's 15 | `p.text-xs.uppercase.tracking-widest.text-gray-400` ("Epistemological", "Pedagogical", "Operational", "Termly", "Annual", "Every 3 years", "Ecocentric Text…"): #99a1af on #fff gives 2.55–2.6:1 | Replace `text-gray-400` with `text-gray-600` (#4b5563, about 7.5:1) or darker |
| A3 | /framework, /methodology, /student-academy | color-contrast (needs review) | review | /framework 8 (375) / 10 (1440); /methodology 7 / 9; /student-academy 2 / 4; others 1 | text over gradients or images that axe could not resolve | Check by hand with a contrast picker. /methodology probably shares the /framework eyebrow and gray-400 classes |
| A4 | /, /student-academy, /framework, /methodology | aria-valid-attr-value (needs review) | minor | 1 per page | `button.pointer-events-auto[aria-controls="je-botui-panel"][aria-haspopup]` (chat bot launcher). The panel ID is not in the DOM while the panel is closed | Keep `#je-botui-panel` mounted (hidden) or set `aria-controls` only when the panel is open |
| A5 | /ai-speaking/pricing | aria-prohibited-attr (needs review) | moderate | 3 | `span[aria-label="Basic, 1 credit"]`, `…"Intermediate, 2 credits"`, `…"Advanced, 3 credits"` | Screen readers may ignore aria-label on a role-less span. Add `role="img"` (if it is a badge graphic), or put the text in a visually-hidden span |
| A6 | /young-learners-speaking/ | link-in-text-block (needs review) | review | 1 | inline link that relies on color alone | Underline links inside body text |
| A7 | all other pages | axe violations | none | 0 | / , /vi, /student-academy, /young-learners-speaking/, /vi/luyen-noi-ielts/, /ai-speaking, /ai-speaking/pricing, /ai-speaking/baseline, /methodology had **0** violations at both 375 and 1440 | none |

### 1b. Keyboard focus visibility (first 25 Tab stops, 1440)

| id | page | rule / metric | severity | count | element | recommended fix |
|---|---|---|---|---|---|---|
| F1 | all 10 pages | focus visible (2.4.7) | pass | 0 of 249 tab stops had no visible change (25 on each page except /student-academy, which had 24 before Tab left the page) | every stop matched `:focus-visible` and showed a pixel change; skip link is present and shows first on the content pages | none. Optional: also check 2.4.11 (focus not obscured) against the fixed bottom-left contact `nav` |

### 1c. Touch targets under 24px at 375 (candidates for 2.5.8; spacing exception not evaluated)

| id | page | rule / metric | severity | count | element (w x h px) | recommended fix |
|---|---|---|---|---|---|---|
| T1 | /, /vi, /framework, /methodology | target-size | minor | 1 | header brand `button` "JURASSIC ENGLISH™" 172x21 (`rounded-md px-1 py-0.5`) | `py-1.5` or `min-h-[24px]` (44px preferred for primary nav) |
| T2 | /ai-speaking, /ai-speaking/pricing, /ai-speaking/baseline | target-size | minor | 2 | `a.mark` brand 153x16; footer brand link 168x20 | give the brand link padding so it reaches at least 24px tall |
| T3 | /methodology | target-size | moderate | 4 | `button.mt-6.inline-flex.text-xs` "See the Analyze/Evaluate/Justify/Reflect stage in full" 269x16 | `py-1` plus `text-sm`, or `min-h-6` |
| T4 | /framework, /methodology | target-size | minor | 2 | "Back to homepage" 150x20, "Back to main site" 140x20, "Explore the Curriculum Series" 199x20 | same as above |
| T5 | /ai-speaking/baseline | target-size | moderate | 4 + 2 + 5 | range-slider label rows 293x19; "Myself"/"My child" radio labels 205x20 / 170x20; "Tiếng Việt" 75x19; "Full privacy notice →" 159x19, "By booking you agree…" 252x15, and footer email/domain links 16px (these may be inline-exempt; this script did not apply the inline exclusion) | add `py-1` to the radio and checkbox label rows; check that the range thumbs are at least 24px (not measured). Day and time radio labels (≈100x37 / 66x37) and checkbox rows (≥23px) are fine |
| T6 | /, /vi, /student-academy, /framework, /methodology | skip link 1x1 | pass (exempt) | 1 | `sr-only focus:not-sr-only` skip link | none. It expands when focused |

### 1d. Images, forms, motion

| id | page | rule / metric | severity | count | element | recommended fix |
|---|---|---|---|---|---|---|
| I1 | all | img missing alt | pass | 0 missing | 0–7 `<img>` per page. / and /vi each have 1 decorative `alt=""` | none |
| L1 | /ai-speaking/baseline | form labels | pass | 0 unlabelled of 38 controls | 4 range inputs (`label[for]`), 8 checkboxes and 23 radios (wrapping label), `#bk-name`/`#bk-email`/`#bk-lang` (`label[for]`, autocomplete name/email set), 3 fieldset+legend groups, 7 aria-live/aria-describedby hooks | optional: `aria-valuetext` on the band sliders (for example "Band 6") |
| M1 | all | prefers-reduced-motion | pass | 0 meaningful running animations | 1–3 reduced-motion rules on every page except /ai-speaking/pricing (0, though it also has no running animations). The only running animation under reduce is `yl-bot-pulse` on `button.yl-bot-bubble` (/young-learners-speaking/, /vi/luyen-noi-ielts/), already cut to 0.001ms. No `<video>` on any audited page. `scroll-behavior: auto` | none |

### 1e. Per-page accessibility score (0–10, from the automated findings only)

| page | score | justification |
|---|---|---|
| / | 9 | 0 violations; focus visible on all 25; 1 aria-controls review item; brand button 21px tall |
| /vi | 9 | same as / (no aria-controls item) |
| /student-academy | 9 | 0 violations; 2–4 contrast review items over imagery; chat aria-controls item |
| /young-learners-speaking/ | 9 | 0 violations; reduced motion respected; 1 link-in-text-block review |
| /vi/luyen-noi-ielts/ | 9 | 0 violations; 1 contrast review item |
| /ai-speaking | 9 | 0 violations, 0 review items; brand links 16–20px tall |
| /ai-speaking/pricing | 8 | 0 violations; 3 aria-label-on-span items (credit badges may not be announced); no reduced-motion rules (harmless today) |
| /ai-speaking/baseline | 8 | 0 violations; all 38 controls labelled and grouped; several 19–20px label and link targets |
| /framework | 6 | 15 **serious** contrast violations (eyebrows 3.1:1, gray-400 labels 2.6:1) at both widths, plus 8–10 contrast review items |
| /methodology | 8 | 0 violations, but 7–9 contrast review items (probably the same classes as /framework) and 4 stage buttons only 16px tall |

## 2. Performance (LAB, Lighthouse 12.8.2 mobile, median of 3)

### 2a. Core metrics

| id | page | LCP (median) | CLS (median) | TBT (median, lab proxy for INP) | perf score | FCP | per-run LCP | field (CrUX) |
|---|---|---|---|---|---|---|---|---|
| P1 | / | **5.16 s** (poor) | 0.006 | 0 ms | 75 | 2.99 s | 5.16 / 5.01 / 5.31 | not available |
| P2 | /student-academy | 3.00 s (needs improvement) | 0.000 | 11 ms | 94 | 1.09 s | 3.00 / 3.95 / 2.27 | not available |
| P3 | /young-learners-speaking/ | 2.07 s (good) | 0.053 | 31 ms | 98 | 1.35 s | 2.07 / 3.36 / 1.91 | not available |
| P4 | /ai-speaking | **4.80 s** (poor) | 0.000 | 118 ms | 71 | 3.32 s | 4.80 / 4.72 / 5.00 | not available |

/student-academy and /young-learners-speaking/ each had one slow outlier run (network variance). Treat their medians as ±1 s.

### 2b. Transfer weight (median-LCP run)

| page | total | JS | images | fonts | CSS | requests | third-party |
|---|---|---|---|---|---|---|---|
| / | 837 KB | 394 KB (11) | 387 KB (3) | 16 KB | 25 KB | 20 | onlinewebfonts.com 16 KB |
| /student-academy | 1,291 KB | 179 KB (10) | **1,024 KB (6)** | 47 KB | 18 KB | 23 | onlinewebfonts.com 19 KB |
| /young-learners-speaking/ | 443 KB | 317 KB (8) | 60 KB (1) | 27 KB | 3 KB | 15 | onlinewebfonts.com 16 KB, Google Fonts 10 KB |
| /ai-speaking | 419 KB | 228 KB (12) | 34 KB (1) | 130 KB (6) | 4 KB | 30 | Google Fonts 115 KB, onlinewebfonts.com 16 KB |

No third-party JavaScript (no analytics or tag-manager vendors) was seen on any of the four pages. The only third parties are font hosts.

### 2c. Findings

| id | page | rule / metric | severity | value | element / resource | recommended fix |
|---|---|---|---|---|---|---|
| P5 | / | LCP element is the hero image, discovered late | high | LCP 5.16 s; phases TTFB 664 ms, **load delay 1,631 ms**, load time 2,609 ms, render delay 261 ms | `figure > img.aspect-[16/9]` `/images/overhaul/hero-story-expedition.webp` (186 KB) | Add `<link rel="preload" as="image" fetchpriority="high" imagesrcset=…>` or SSR the img with `fetchpriority="high"`. Serve a ~600–800px mobile variant via `srcset`/`sizes` (Lighthouse estimates 144 KB of the 186 KB is wasted) |
| P6 | /, /student-academy | uses-responsive-images | high | / 265 KiB, /student-academy **776 KiB** potential savings | hero-story-expedition.webp (144 KB waste), thinking-cycle-storybook-map.webp (143 KB), world-01-mistwood-harbor.webp (131 KB), world-02/03 (172 KB each), professor-rex-mascot.webp (121 KB waste) | Generate 480/768/1200 widths and use `srcset` + `sizes` (next/image on the Next route); lazy-load below-fold world images |
| P7 | /ai-speaking | render-blocking Google Fonts, text LCP delayed | high | LCP 4.80 s; LCP = `h1.sf-h1` with **render delay 3,929 ms**; render-blocking est. savings 2,040 ms | `fonts.googleapis.com/css2?family=Cinzel…Playfair Display…Plus Jakarta Sans` (6 font files, 130 KB) | Self-host the fonts (next/font), subset them, `font-display: swap`, preload only the H1 face; drop unused families/weights |
| P8 | /, /young-learners-speaking/ | large first-party JS chunk | medium | `assets/analytics-DzwE88IA.js` 158 KB transferred / **646 KB raw**, the largest script on both pages | despite the name, it is the Vite entry chunk (it contains the modulepreload polyfill and app code) | Code-split per route/component, check what is bundled into it (`vite-bundle-visualizer`), and rename it if it is not analytics |
| P9 | /, /young-learners-speaking/ | unused-javascript | medium | 61–67 KiB | `vendor-motion-Bt1xE00a.js` (39 KB unused), `vendor-react-vXcxLDut.js` (22–28 KB unused) | Lazy-load framer-motion / use `LazyMotion` + `domAnimation`; tree-shake the lucide icons (`vendor-lucide` also has 3 KB unminified) |
| P10 | /ai-speaking | main-thread / TBT | medium | TBT 118 ms (highest of the four); bootup 0.5 s; legacy-JS 14 KiB; unused JS 28 KiB | `_next/static/immutable/chunks/3h8tz0aeyszhh.js` (72 KB, 325 ms), document 526 ms | Defer the DiagnosticPreview waveform component (`dynamic(..., {ssr:false})` below the fold); set a modern browserslist to drop polyfills |
| P11 | /young-learners-speaking/ | CLS | low | 0.053 in 2 of 3 runs (good, under 0.1) | `div#yl-contact-root > nav.fixed` (bottom-left contact panel) 0.050; also on / (0.005) | Reserve the panel's size or render it with `transform` instead of changing layout; mount it with `position: fixed` from first paint |
| P12 | /ai-speaking | uses-responsive-images | low | 23 KiB | `/ai-speaking/brand/jurassic-english-emblem.png` (34 KB PNG) | Serve WebP/AVIF at display size, or use the emblem SVG |
| P13 | all four | third-party | low | 16–19 KB on every page | `onlinewebfonts.com` (font CSS/file) | Self-host the font, which also removes an extra DNS/TLS connection |
| P14 | / | render-blocking CSS | low | `main-CG0ZuGPL.css` flagged (est. 0 ms) | stylesheet | Fine as is. Inline critical CSS only if P5 is fixed and FCP is still around 3 s |
| P15 | all four | server response | pass | TTFB in the document audit 40–200 ms; DOM 199–392 nodes | — | none |

## Notes / limitations

- Two different front-end stacks are serving: / and /young-learners-speaking/ load Vite `assets/*` bundles, while /student-academy and /ai-speaking are Next.js (`_next/static`). The fixes have to go to the right codebase.
- The CrUX/PSI field data was not fetched (PSI 429), so none of the numbers above are real-user numbers.
