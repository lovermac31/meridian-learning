# Holiday sets, 28 Nov to 6 Dec 2026

Decided by Jay on 25 Nov 2026 ("Yes, go ahead with the holiday sets."). A cheap, reversible test: **no existing price changes**; two dated sets are added, then end on their own.

| Set | Page | Inside | Usual total | Set price | PayPal | Memo prefix |
|---|---|---|---|---|---|---|
| Holiday Reading Set, Level 1 | `/products/holiday-reading-set-l1` (`/vi/...`) | Parent Pack L1 (249.000₫) + Holiday Reading Challenge (149.000₫) + Word Fossil Flashcards L1 (190.000₫) | 588.000₫ | **399.000₫** | US$16 | `PR1E` |
| Teacher Starter Set | `/products/teacher-starter-set` (`/vi/...`) | Teacher Pack L1 (690.000₫) + Thinking Cycle Set (490.000₫) + Reasoning Assessment Kit (390.000₫) | 1.570.000₫ | **1.190.000₫** | US$47 | `PR1F` |

Window: **Saturday 28 Nov 2026 00:00 to Sunday 6 Dec 2026 23:59:59.999, Vietnam time (UTC+7)**. Test: 3 or more paid set orders by 6 Dec; 0 by 9 Dec means remove the sets.

## Where things live

- `src/config/holidaySets.ts`: the dates, prices, prefixes and `holidaySetClosedAt()`. Pure (no browser or Vite imports), so the server can import it.
- `src/i18n/content/holidaySets.ts`: EN and VI copy. Titles and included items are read from `PRODUCTS`, so they cannot drift from the product pages.
- `src/components/HolidaySetPage.tsx`: the set page and the `/products` band (client-only, no price).
- `api/sample-pack.ts`: mints the payment code. **Refuses** a code or an order for a set outside the window (`400 offer_closed`, no memo, no Notion lead).
- `api/sepay-webhook.ts`: a set memo is read, answered 200, and logged `needs_review_holiday_set` (inside the window) or `needs_review_holiday_set_outside_window`. Nothing is auto-confirmed; Jay matches every set payment by hand, as for every other `PR` product.
- `supabase/migrations/20261126000001_holiday_sets_portal_rows(.sql|_down.sql)`: two inactive portal rows. **Prepared, not applied.** Optional: the sale does not use the portal.

## How the window works (no deploy needed)

- **Page**: after load it checks the visitor's clock. Prerendered HTML has no price and no buy button, only the three items with their real sample pages and "Checking the offer dates…". Inside the window the price, buy button, Zalo link, PayPal link and Product JSON-LD appear. Before 28 Nov it says when the set opens; after 6 Dec it says the offer has ended and links the three items at their usual prices. `/products` shows the two set cards only inside the window, with no price on the listing.
- **Server**: the server clock decides. The page cannot be used to get a code outside the window.
- A buyer who paid before the end but submits the contact form after it gets "message Mr. Jay on Zalo with your code" (the code is already stored as a lead from the prepare step).

## Samples before price

Each item shows the same real sample pages as its own product page (the live `/samples/...` set), above the price. The sample viewer opens from the page, or from `/products/<set>#<item-id>-sample`.

## Not indexed

Both pages, in both languages, are `noindex, nofollow` (meta robots and an `X-Robots-Tag` header in `vercel.json`), have no canonical or hreflang, are not in `sitemap.xml`, the HTML sitemap or `llms-products.md`, and are not `PRODUCTS` entries (so no Product/InStock JSON-LD in any list). They are dated, temporary pages: indexing them would leave stale price snippets after 6 Dec. If Jay ever wants them indexed, set `shouldIndex` in `src/lib/routeMetadata.ts` and add the paths to the sitemap list.

## UTM-ready links

The pages read `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` on arrival and keep the first touch for the visit (the Zalo link, the checkout lead and the PayPal order code carry it). `utm_source` also becomes the order code to quote (upper-cased). Use lower case letters, digits and dashes only.

```
https://jurassicenglish.com/products/holiday-reading-set-l1?utm_source=zalo-parent&utm_medium=zalo&utm_campaign=holiday-sets-2026&utm_content=reading-set-vi
https://jurassicenglish.com/vi/products/holiday-reading-set-l1?utm_source=zalo-parent&utm_medium=zalo&utm_campaign=holiday-sets-2026&utm_content=reading-set-vi
https://jurassicenglish.com/products/teacher-starter-set?utm_source=fb-teachers&utm_medium=social&utm_campaign=holiday-sets-2026&utm_content=starter-set-d1
https://jurassicenglish.com/vi/products/teacher-starter-set?utm_source=fb-teachers&utm_medium=social&utm_campaign=holiday-sets-2026&utm_content=starter-set-d1
```

## Money-path probe (local only)

```
node --import tsx scripts/probe-holiday-sets.mts
```

Runs the real handlers in-process with a frozen clock, a mocked Notion and **no other network** (any other URL throws). 56 checks: card price = QR amount = server-minted amount = JSON-LD price; a code minted in the window and stable per submission; the contact-form order; the webhook reading the memo (plain, dashless, in bank text), a late transfer flagged, a wrong key refused; refusal at 27 Nov 23:59:59.999 and 7 Dec 00:00:00.000, acceptance at 28 Nov 00:00:00.000 and 6 Dec 23:59:59.999; every other product still minting its usual amount after the window. Output saved in `docs/qa/holiday-sets-2026/probe-output.txt`. Never run it against production.

## Rollback and removal

- **Before merge**: nothing to do.
- **After merge/deploy**: revert the PR (one `git revert`) and deploy. The set pages return 404; `/products` and every product are exactly as before. The migration was never applied, so the database needs nothing; if someone applied it, run the `_down` file (it stops with an error rather than delete a row an order already references; then set `active = false` instead).
- **If 0 paid orders by 9 Dec**: the sets already ended on 6 Dec; remove them by deleting the two entries in `HOLIDAY_SETS` (and the files above) in a follow-up PR, or revert.

## Open items (owner in brackets)

1. First live test transfer: confirm the bank/SePay route sends a `PR1E`/`PR1F` memo to a place Jay sees (the AI Speaking app's `PR` status table has no row for the new prefixes, so the buyer page does not poll them and says "we check by hand") [Jay].
2. The PayPal link is a static URL and cannot carry the window. The page stops showing it after 6 Dec, but a saved link still works; Jay matches each PayPal payment by hand and refunds one that arrives after the window [Jay].
3. US$47 is Jay's approved figure; the site formula (ceil of VND ÷ 25,897) would give US$46 [Jay, no action unless he wants it changed].
4. The Vietnamese copy is machine-drafted and needs a native read, like the rest of the product copy [Jay].
5. The migration is optional and inactive; apply it only if the sets should exist in the portal [Jay].
