# Market landing-page crawl discovery — 18 October 2026

## Evidence and objective

Google Search Console for `sc-domain:jurassicenglish.com` showed 31 clicks and 484 impressions over the selected three-month period (16 July–15 October 2026). Filtering Pages for `ielts-speaking-online` returned zero clicks and impressions. URL Inspection showed the India, Bahasa Melayu Malaysia, and Arabic UAE URLs as **Discovered — currently not indexed**; each was present in the public sitemap and had no referring page detected. Live URL tests for the India page and the `/ielts-speaking-online` hub reported **URL is available to Google** / **Page can be indexed**. The hub’s stored index record said URL unknown to Google, despite its presence in the public sitemap.

This change creates a crawlable, sitewide footer link to the existing international IELTS hub, which already links to the priority country routes and their language variants. It does not add translations, make an indexation request, or claim that impressions or rankings will increase.

## Scope lock

- Add one ordinary server-rendered footer anchor to the international IELTS hub in English and Vietnamese.
- Verify the hub links each target English country page and each English page links to its existing Malay or Arabic counterpart.
- Keep URLs, page content, prices, structured data, sitemap rules, payment behavior, and release settings unchanged.
- Do not create or publish unreviewed translations or submit URLs to Search Console.

## Acceptance checks

- SSR output contains the market-hub URL as an ordinary `<a href>` on `/` and `/vi`.
- The hub HTML contains crawlable anchors to all priority country pages, and paired English pages link to their language alternatives.
- Existing market routes and their canonical/hreflang contracts remain unchanged.
- Typecheck, focused metadata/market tests, full test suite, and production build pass.

## Release measurement

After this change is reviewed and deployed, compare Search Console page impressions, clicks, and referring-page/index status for these URLs after 14 and 28 days. Treat Google index selection as its own outcome; do not attribute a traffic change to this link section without the comparison.
