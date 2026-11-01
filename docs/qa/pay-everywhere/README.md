# Pay everywhere QA

Scope: all 35 priced catalogue products, in Vietnamese and English at widths 375 and 1440. The 1-to-1 buy action explicitly purchases the eight-lesson pack for 5,600,000₫; the catalogue still explains the individual lesson price.

The site retains its existing locale scheme: `/` is English, `/vi` is Vietnamese. `/en/` now renders the English home as an alias. Story Club reservation campaign URLs remain `/story-club/reserve` (VI) and `/en/story-club/reserve` (EN). Other purchases use the localized product page with `?checkout=1`; product canonical URLs and the sitemap remain unchanged.

## Run

```sh
npm ci --no-audit --no-fund
npm run lint
npm test
npm run build
npm run validate:prerender
npm run validate:indexability
npx playwright install --with-deps chromium
npm run test:browser:payments
npm run test:browser:reserve
npx playwright test -c playwright.story-club-status.config.ts
```

`Pay everywhere QA` runs these checks on the draft PR with headless Chromium and `--mute-audio`. Local macOS sandboxing blocks Chromium Mach-port registration, so browser results and screenshots are collected on the Linux runner. Browser tests mock all API writes and payment-status reads and block other external browser requests. No live reservation, lead, transfer, or DB migration is made by the tests.

`qr-fixtures/` contains actual SePay images fetched for synthetic `<PREFIX>-AB12CD` memos, served locally by Playwright. The tests independently assert the rendered QR URL's exact product amount, memo, MBBank code and receiving account. `qr-payload-verification.json` records a separate decode of all 35 real fixtures with `jsqr@1.4.0` and `pngjs@7.0.0`: EMV BIN 970422, account 0269494315526, amount tag 54 and transfer note tag 62/08. SePay strips the dash in the payload; normalization restores the canonical memo. Jay's phone verification is from the supplied approved directive; this job made no payment.

The browser matrix checks two required fields, optional empty Story Club fields, failed validation without a request, successful submit, correct price and memo, per-product funnel events, image loading and horizontal overflow. Additional cases cover above-fold home/Story Club CTAs, API failure with safe errors, dynamic-to-static QR fallback, total QR failure with Zalo recovery, and Story Club payment polling. The existing product-dialog test retains accessibility coverage.

## Operations and rollback

Public receiving details are in `src/config/payment.ts`, overridable with the `VITE_VIETQR_*` variables documented in `.env.example`. Explicit empty config disables the dynamic image. The original static image is a fallback and requires the amount and memo to be entered manually. No secrets are exposed to the browser.

Story Club retains its existing server reservation and auto-confirmation path. Other products require Notion to store the server-issued memo and authoritative amount before the API returns success; retries reuse the same memo and registration ID. Their payments require manual Zalo confirmation. The webhook recognizes their prefixes with or without dashes, logs `needs_review`, and does not mark a Story Club reservation paid.

To automate other products later, add a generic durable order ledger with a unique memo constraint, exact amount/product validation, idempotent webhook updates, and scoped status reads. Six-character memos have a finite collision space; atomic uniqueness is deferred to that ledger.

Rollback: revert this PR. It adds no DB migration and changes no live configuration.
