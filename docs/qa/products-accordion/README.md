# Products accordion verification — 27 October 2026

Base: `85ded15` (merged #199, #206, #201 performance and #207 video SEO). Branch: `codex/products-accordion`.

## Result

Four category tiles follow `PRODUCT_SECTIONS`, with live counts and minimum VND prices. Families opens by default; categories and products expand independently. Full product copy, sample blocks, payment links and JSON-LD remain server-rendered. Product data, detail pages, sample viewer, source/order-code generation and dependencies are unchanged.

| Locale / viewport | Before document height | Default Families open | All categories closed | Closed reduction |
| --- | ---: | ---: | ---: | ---: |
| EN / 390×844 | 17,893 | 4,576 | 2,627 | 85.3% |
| VI / 390×844 | 18,271 | 4,921 | 2,692 | 85.3% |
| EN / 1440×900 | 9,728 | 3,480 | 1,845 | 81.0% |
| VI / 1440×900 | 9,917 | 3,523 | 1,887 | 81.0% |

At 390px, the overview ends at 511px EN / 510px VI; the third Families product ends at 1,189px EN / 1,209px VI, within 1.5 × 844px. No horizontal overflow. The heading reserves two phone lines so late display-font loading cannot shift the overview.

## Executed checks

- Initial baseline: 372/372 tests; final after syncing main: 384/384 tests, including six accordion SSR/anchor tests.
- TypeScript: `npm run lint` passes.
- Production client/SSR/prerender/sitemap build: `npm run build` passes.
- `npm run validate:prerender`: 184 public indexable routes pass; 7 rewrite-served routes exempted by the existing validator.
- JSON-LD on EN/VI products pages is identical to the base build. All 35 cards, copy, prices, payment/sample/video links remain in HTML even when panels are inert.
- Muted Chromium: 42 category/product/alias/group anchor cases per locale/viewport combination (168 total), actual target visibility below the header, malformed/unknown hashes, multi-open toggles, keyboard Enter, back navigation, source-tagged Zalo/PayPal codes, sample-hash modal, Escape and opener-focus restoration.
- 48px minimum visible category/row/sample/order/watch targets checked in both locales and viewports.
- 16 axe scans across collapsed, Families-open, product-expanded and sample-modal states: zero violations. No page JavaScript errors.
- Normal-motion smoke: folding transition 240ms; legacy product anchor opens and scrolls after animation. Reduced-motion duration effectively zero (0.00001s from the existing global override).
- `git diff --check` passes; no product data, dependency/lockfile, individual product-page, payment-source, video-data or metadata implementation changes.

Reproduce server-side checks:

```sh
npm ci --no-audit --no-fund
npm run lint
npm test
npm run build
npm run validate:prerender
npm run preview -- --host 127.0.0.1 --port 5198
```

Browser acceptance (separate terminal):

```sh
BROWSER_TOOLS=/path/to/qa/node_modules node scripts/test-products-accordion-browser.mjs
```

The browser harness uses `/products/` and `/vi/products/`: Vite preview resolves the prerendered directory index at the trailing-slash URL; extensionless requests otherwise use its SPA fallback. Production canonical URLs stay unchanged.

QA used external Playwright 1.63.0 and @axe-core/playwright 4.14.0; no packages were added to this project. If these packages resolve normally, omit BROWSER_TOOLS. BASE_URL defaults to http://127.0.0.1:5198; EVIDENCE_DIR defaults to .regen/runs/products-accordion. Chromium launches with --mute-audio. Raw results: [browser-acceptance.json](browser-acceptance.json), [baseline-metrics.json](baseline-metrics.json).

## Performance limits and existing risks

Five fresh contexts per version/locale/viewport were measured with alternating before/after ordering on production preview builds, using the actual prerendered directory-index URLs. Local LCP medians before → after: EN390 184→180ms; VI390 184→192ms; EN1440 184→196ms; VI1440 184→196ms. These −4 to +12ms differences are local lab measurements, not field CWV or a guarantee of identical LCP. Phone median/max CLS is 0.000024 in both builds. EN desktop CLS improves from 0.000636 to 0.000183; VI desktop remains 0.000181. No new layout-shift regression was measured. See [performance-ab.json](performance-ab.json).

The unchanged production dependency tree reports one pre-existing HIGH body-parser advisory (GHSA-27r3-jxmh-p828, <1.20.9). No dependency fix was mixed into this layout PR; owner unassigned. A dedicated dependency update should verify compressed-request handling. No new endpoints, persistence, credentials, analytics or external submissions were introduced.

Browser coverage here is Chromium only; Firefox/WebKit and real-device/network field performance were not measured. Native Vietnamese editorial review remains the existing content owner’s responsibility; product copy was not changed.

## Screenshots

| Locale / viewport | Collapsed | Families open | Product expanded | Sample modal |
| --- | --- | --- | --- | --- |
| EN390 | [image](screenshots/en-390-collapsed.png) | [image](screenshots/en-390-category-open.png) | [image](screenshots/en-390-product-expanded.png) | [image](screenshots/en-390-sample-modal.png) |
| VI390 | [image](screenshots/vi-390-collapsed.png) | [image](screenshots/vi-390-category-open.png) | [image](screenshots/vi-390-product-expanded.png) | [image](screenshots/vi-390-sample-modal.png) |
| EN1440 | [image](screenshots/en-1440-collapsed.png) | [image](screenshots/en-1440-category-open.png) | [image](screenshots/en-1440-product-expanded.png) | [image](screenshots/en-1440-sample-modal.png) |
| VI1440 | [image](screenshots/vi-1440-collapsed.png) | [image](screenshots/vi-1440-category-open.png) | [image](screenshots/vi-1440-product-expanded.png) | [image](screenshots/vi-1440-sample-modal.png) |

## Rollback

Revert the isolated accordion commit through a reviewed PR. No database migration, production configuration or dependency change is involved. This task does not merge or deploy.
