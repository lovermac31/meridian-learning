# Accessible sample text — 28 October 2026 (ICT)

## A. Plan

Provide the text of the existing public sample pages, not any full edition. Preserve the view-only images, current page order, keyboard containment, payment links, prices and consent controls. Authoritative local inputs are each sample PDF and its `samples/pages/pages.json` export manifest. Ordinary CI must work without those private local sources.

The branch starts from main `5f994a2`, which already includes the four merged compliance PRs. No production requests, submissions, deployment, schema or vendor changes are part of this work.

## B. Implementation

- Added one `<product-id>-text.json` for every live product: **35 files / 361 pages**. The printable and holiday product aliases map to the existing sample stems. Each document records the named sample PDF's SHA-256; each page binds its public image filename/hash and text/hash, method and ordinal.
- `scripts/extract-sample-text.py` opens only each manifest's exact `<stem>-sample.pdf`. It rejects PDF/manifest/public-page count or order disagreement, local/public image mismatch, symlinks escaping the approved source root, empty/low-content unreviewed pages and unauthorized OCR page numbers. No full-edition path is discovered or read.
- Fourteen illustrated pages originally yielded only watermark/footer text. The user approved manually checked transcription of their already-visible wording. `scripts/sample-text-ocr.json` contains those reviewed supplements, bound to exact public-image hashes; the PDF's extracted footer is appended. No invented scene descriptions or full-edition text were added.
- The user also approved refreshing seven stale viewer-page images from current local exports: IELTS Writing Teacher Pack page 1 and Parent Pack L2 pages 1–4, 9–10. Parent Pack L2's current sample chart contains six weeks rather than the former four; this content change is explicit. Prices and other product catalogue fields were not edited. Existing card thumbnails are outside this seven-viewer-page refresh.
- The seven replacement viewer images receive content-hash URL revisions, so a browser cannot reuse their former week-long cached URL. Build/tests bind each revision to the actual image bytes. Unchanged image and thumbnail URLs are preserved. Sample text requests use `cache: no-cache` to revalidate across deployments. No Vercel setting changed.
- SampleViewer fetches only the opened product's JSON. It validates the schema/count/order and imposes an eight-second deadline and 1 MB streaming bound; redirects are refused and closure aborts the request. Errors use localized safe copy.
- The current page is exposed through an image `aria-describedby` target containing the actual text. A named region wraps that unlabelled target: pointing at the named region itself was tested and found to expose only its label in Chromium, so that approach was rejected.
- EN/VI Text version toggles reveal the same text. Visible long text is focusable/scrollable, participates in the modal's focus cycle and allows reading keys without changing pages. Toggling or paging does not programmatically steal focus. The existing image-only keyboard cycle, swipe behavior and last-page CTA remain.
- There is no PDF, download or print control. Current sample images remain view-only. As with any accessible webpage, public text can be inspected/copied; this is not DRM.

## C. Verification

| Check | Actual result |
|---|---|
| Authoritative source comparison | All 35 generated documents / 361 pages exactly reproduce the named sample sources plus the 14 reviewed public-image supplements. |
| Normal build without private source | Node validates all checked-in schemas, page orders, image hashes, text hashes, product coverage and size limits. No Python/private PDF requirement in ordinary CI. |
| Unit suite | 393/393 passed; TypeScript check and production client/SSR/prerender build passed. |
| Local extraction guard tests | Seven passed: sample-only reads, full-edition/traversal source rejection before PDF reading, wrong page set, image mismatch, unreviewed footer-only page, unauthorized OCR page and escaping ancestor symlink. |
| Browser matrix | Chromium, WebKit and Firefox × 390/1440 × EN/VI: 12 combinations passed. |
| Open/paged/toggled/last-page axe | 48 scans in the matrix plus two reviewed illustrated-page scans: **50 scans / zero violations**. |
| Accessibility-tree checks | The page-text region is exposed across the matrix. Fourteen recorded Chromium CDP comparisons verify that the image's actual accessible description equals the current page text, not just a label. |
| Long-text keyboard behavior | Parent Pack L3 page 4 is Tab-reachable and PageDown/ArrowDown scrollable; ArrowRight while reading does not turn the sample page. |
| Refreshed-image cache behavior | The two affected products load revised image URLs whose fetched bytes match the text provenance; unit/build checks bind all seven revisions and preserve all other image URLs. |
| Failure paths | Missing/malformed JSON produces a safe localized error; Escape still closes. Unit checks cover malformed schema, unsafe paths, oversized streams and cancellation. |
| Existing modal regression | All 12 default hidden-text keyboard-cycle, reverse-entry, Escape and opener-restoration cases pass. |

Muted browsers and a local-only GET allowlist were used. No real lead, order or payment was generated. Browser evidence: `evidence/browser.json`; prior keyboard regression: `evidence/keyboard.json`.

### Reproduction

```sh
npm ci
npm run samples:text:check
npm run lint
npm test
npm run build
```

Local source verification/regeneration (private sample PDFs stay outside the repository):

```sh
python3 -m pip install -r scripts/requirements-sample-text.txt
node --import tsx scripts/prepare-sample-text.mjs --verify-source \
  --source-root "$APPROVED_SAMPLE_ROOT"
node --import tsx scripts/prepare-sample-text.mjs --generate \
  --source-root "$APPROVED_SAMPLE_ROOT"
python3 scripts/tests/test_sample_text_extractor.py
```

`APPROVED_SAMPLE_ROOT` is the local `Sale Team/sellable-products-pdf` directory. The extractor pins pypdf 6.11.0. To regenerate as a build step when that source is available, set `JE_SAMPLE_SOURCE_ROOT` for `npm run build`; unset it for ordinary checked-in-asset CI validation. Generation verifies all documents and size bounds before writing any output. There is no timestamp or absolute source path in generated public JSON.

Browser regression (existing external QA tools may be supplied without adding runtime dependencies):

```sh
npm run preview -- --host 127.0.0.1 --port 5211
BROWSER_TOOLS=/path/to/qa/node_modules node scripts/test-sample-text-browser.mjs
BROWSER_TOOLS=/path/to/qa/node_modules BASE_URL=http://127.0.0.1:5211 \
  node scripts/test-sample-viewer-keyboard-browser.mjs
```

The new harness refuses a non-local preview URL. Browser evidence used Playwright 1.63.0 and axe-core integration from the existing QA installation.

## D. Hardening and rollback

No additional runtime dependency, credentials, backend endpoint or telemetry was introduced. JSON is rendered as React text, never HTML. Exact keys and expected page sets reject extra content fields/pages; source verification binds output to approved public samples. A source/image change requires regenerated text and, for transcribed pages, a reviewed matching image hash. Ordinary validation also rejects a missing/extra text asset.

Rollback: revert this isolated change, including generated JSON, reviewed supplements, generator/build hook, UI/tests and seven approved image refreshes. No schema, vendor configuration or data migration rollback is required. This returns samples to their prior image-only accessibility limitation.

## E. Confidence

High for exact source/public-page boundaries, generated coverage and the executed browser/ARIA behavior. No blanket WCAG or assistive-technology certification is claimed.

## F. Assumptions

The named local sample PDFs and user-approved current image exports are authoritative. The reviewed OCR is limited to already-public sample-page wording. The generator is a controlled authoring tool; ordinary CI validates the reviewed committed artifacts without access to private full editions.

## G. Tradeoffs / blind spots

1. Playwright/Chromium accessibility-tree output is **not VoiceOver output**. Physical Safari/iPhone with VoiceOver remains open; extracted text does not itself establish ideal semantic reading order for every table or educational illustration.
2. Only the seven approved viewer images were refreshed. Existing card thumbnails/catalogue copy were not silently revised, and the approved Parent Pack L2 six-week sample change is recorded for content review.
