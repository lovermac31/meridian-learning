# Story Club first screen — 28 October 2026

## A. Plan

Make the Story Club product's price, age and action visible before its large image, in English and Vietnamese. Use a separate branch from current main `5f994a2`; preserve the approved offer and existing purchase destination. Other products retain their layout.

## B. Implementation

`ProductPage` promotes the existing single price/action block into the Story Club hero. It states ages 5–8, Saturdays 9:00, Google Meet and up to 6 children, with the existing 590.000₫/four-week price. The short lead says “Online story groups for children aged 5–8” / “Nhóm học trực tuyến qua truyện cho bé 5–8 tuổi.” Detailed approved copy remains below.

`ToolHero` accepts optional content after its lead. All other consumers render as before when no content is supplied. The product purchase block is a fragment reused in one location, so Story Club does not gain a second primary CTA. The button retains its existing localized `/story-club?utm_source=products` destination and existing label. This does not replace the purchase flow with a new payment or direct-message action.

No prices, product records, structured metadata, tracking, API, consent, licensing or enrollment rules changed. No backend or new dependency is involved.

## C. Verification

- `npm test`: 390/390 pass, zero failed/skipped, including two new focused regressions. The regressions verify EN/VI facts in the hero, one unchanged action, promotion before the image, and the existing card order for the other 34 products in both languages.
- `npm run lint` and production `npm run build`: pass.
- Muted Chromium 153, WebKit 26.6 and Firefox 155 × 390/1440 × EN/VI: 12/12 browser cases pass. Default privacy controls remain visible; no analytics choice was pre-seeded or dismissed to make the first-screen result pass.
- In all six mobile engine/language cases, the price ends at approximately 288px and the action at 348px in a 900px viewport. The main product image starts at 569px (EN) / 597px (VI). The action is unobscured by the consent banner; no horizontal overflow.
- Twelve axe scans across those cases: zero violations. These are automated checks, not a WCAG or native-device certification.
- All browser traffic was constrained to the local built preview; external/non-GET requests were aborted. No form was submitted or purchase/message sent.

Evidence: `evidence/browser.json` and two initial mobile screenshots. The first-screen screenshots show the default consent controls still open.

Reproduction:

```sh
npm ci
npm test
npm run lint
npm run build
npm run preview -- --host 127.0.0.1 --port 5212
# Separate terminal with Playwright 1.63.0 and @axe-core/playwright 4.14.0 available:
BROWSER_TOOLS=/path/to/qa/node_modules node scripts/test-story-club-first-screen-browser.mjs
```

The browser runner refuses non-local targets. It checks actual geometry, hit-testing, approved facts, CTA count/destination and axe output; it does not infer visibility from DOM order alone.

## D. Hardening and rollback

No new input surface, network endpoint, credential or database migration. Existing consent and checkout behavior remain intact. Rollback: revert the presentation/test commit and rebuild; no vendor/data rollback is required. All changes remain PR-only; no merge or production deploy is authorized by this handoff.

## E. Confidence

High for the measured first-screen improvement and preserved offer/destination in the tested matrix. Physical Safari/VoiceOver and conversion impact remain unverified.

## F. Assumptions

Approved facts are 590.000₫, four weeks, ages 5–8, Saturdays 9:00, Google Meet and maximum 6. This change targets the product detail page, not a rewrite of the Story Club landing page.

## G. Tradeoffs / blind spots

The product detail action continues to lead to the existing Story Club landing page; no extra checkout shortcut was introduced. Browser geometry/axe evidence does not establish actual marketing conversion gains.
