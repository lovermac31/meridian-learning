# Live indexing audit — 29 October 2026

Public read-only GET crawl: **231 URLs**, including **204/204 sitemap URLs** and **27 additional internal/hreflang targets**. Four workers, 25-second request deadlines, maximum 2,000 URLs; no GSC, forms, authenticated requests or database calls. The sitemap had no child sitemaps. The CSV records every response, redirect chain, final URL, canonical, robots headers/meta, language alternates, title, description, H1, raw body word count, incoming source-page count and duplicate flags. Raw response-derived text and links are retained in the companion JSON.

## What these numbers mean

Google’s reported 91 excluded pages are not available as a URL export in this job. The categories below are **observed technical signals**, not invented GSC classifications or predictions that Google will index all eligible pages. Exact Crawled/Discovered counts require the SEO Manager’s GSC export. A bare origin canonical and the same origin with `/` are equivalent; those are normalized rather than counted as defects.

After = 189 native/static pages served from this branch’s build plus 34 public external rewrite responses. This is local code verification, not a production release. The full after check is in `indexability-after-2026-10-29.json`.

## Google reason groups

| Reason | Before | After | Evidence / treatment |
|---|---:|---:|---|
| Duplicate without user-selected canonical | 0 sitemap URLs | 0 | Every sitemap response has a canonical; no eligible public page lacks one. |
| Alternate page with proper canonical | 1 sitemap URL; 2 public aliases overall | 0 sitemap aliases | `/ai-speaking/samples/basic` and its VI twin duplicate the samples hubs exactly. Keep the hubs, remove the EN alias from sitemap, redirect both aliases permanently. |
| Crawled – currently not indexed | Unknown in GSC | Unknown in GSC | Proxy: 29 sitemap pages shared an H1 before, 6 after. Detailed native product offers and syllabus pages now have distinct localized headings. All sitemap pages have real raw HTML content. |
| Discovered – currently not indexed | Unknown in GSC; 20 eligible linked pages missing from sitemap | Unknown in GSC; 0 of those 20 missing | Add the verified canonical public pages, strengthen lesson/writing/story links. No original sitemap URL had fewer than two incoming source pages. |
| Page with redirect | 0 sitemap URLs | 0 | Two intentional basic-sample aliases now redirect by configuration, outside sitemap. Hosting behavior must be rechecked after release. |
| Not found (404) | 0 | 0 | No crawl response was non-200; local gate also checks actual static-file coverage without SPA fallback. |
| Excluded by noindex | 0 sitemap URLs; 6 internal routes | 0 sitemap URLs | Six account/exam/writing-session pages are intentionally excluded; retain privacy controls. |
| Soft 404 | 0 observed placeholder candidates | 0 observed placeholder candidates | No empty server body was found; after gate requires at least 150 server-rendered main-content words and 50 initially visible words, H1, title and description. Google’s own soft-404 decision remains unknown. |

## Additional checks

- Sitemap inventory: **204 → 223** (remove one alias, add 20 verified public pages). Native build: 189 URLs; public external rewrites: 34 URLs.
- Non-200, accidental noindex, missing SSR content, sitemap redirect: **0 → 0** each.
- Broken reciprocal alternates on eligible canonical sitemap pages: **0 → 0**. The basic aliases had six failed return-link checks; permanent redirects consolidate them. Noindex EN writing practice/history each advertises three nonreciprocal hub alternates in the external app; these are outside the sitemap and remain an external-app follow-up.
- Wrong `lang` on EN/VI twins: **0 → 0**. Existing VI metadata is correct; no speculative translation or language rewrite was introduced.
- Duplicate title groups in sitemap: **0 → 0**. Duplicate-description groups: **0 → 1**; see external ownership below.
- Similarity uses case-folded five-word shingle Jaccard overlap > 90%, plus exact title/H1 matches. Repeated headings are review signals, not proof of duplicate content. The only indexable >90% pairs are the two basic aliases and their hubs; the >90% writing practice/history pair is intentionally noindex.

## Content decisions and external ownership

No page or unique content is deleted. The basic sample routes are exact copies of their hubs (1.000 overlap), so permanent redirects preserve entry links and consolidate canonical identity. Native syllabus pages explain curriculum and assessment; their EN/VI headings now explicitly say syllabus. Product detail pages use their existing localized search titles, distinguishing priced offers from programme hubs and translated product names.

The separately deployed `jurassic-ai-speaking` app still uses the same H1 across its hub/intermediate/advanced sample pages in each language (six sitemap pages) and the same description across three VI sample pages. Their sample reports contain distinct substantive content. This repository only controls their rewrite and sitemap, so **two duplicate-description warnings and six repeated-H1 signals remain**. Follow up in that app: localize tier-specific H1s/descriptions and remove alternate tags from noindex writing sessions. Do not hide this work behind a sitemap exclusion or rewrite the external app’s response in a proxy.

External pages retain their own HTML, headers and content. The quality gate fails for all sitemap URLs on non-200, noindex, non-self-canonical or empty content; it also fails duplicate native metadata. External duplicate metadata is reported as an explicit warning because its source is outside this PR. Availability of those public apps is now a CI dependency; the checker has per-request and overall deadlines.

## URLs added to the sitemap

- https://jurassicenglish.com/ai-speaking/exam
- https://jurassicenglish.com/ai-speaking/lessons
- https://jurassicenglish.com/ai-speaking/privacy
- https://jurassicenglish.com/ai-speaking/solutions
- https://jurassicenglish.com/ai-speaking/terms
- https://jurassicenglish.com/ai-speaking/vi/baseline
- https://jurassicenglish.com/ai-speaking/vi/lessons
- https://jurassicenglish.com/ai-speaking/vi/pricing
- https://jurassicenglish.com/ai-speaking/vi/samples
- https://jurassicenglish.com/ai-speaking/vi/samples/advanced
- https://jurassicenglish.com/ai-speaking/vi/samples/intermediate
- https://jurassicenglish.com/ai-speaking/vi/solutions
- https://jurassicenglish.com/ai-speaking/vi/writing
- https://jurassicenglish.com/ai-speaking/writing
- https://jurassicenglish.com/student-academy/stories
- https://jurassicenglish.com/ai-speaking/vi/writing/demo
- https://jurassicenglish.com/ai-speaking/vi/writing/sample
- https://jurassicenglish.com/ai-speaking/writing/demo
- https://jurassicenglish.com/ai-speaking/writing/sample
- https://jurassicenglish.com/vi/student-academy/stories

## Remaining repeated H1 groups (after)

- https://jurassicenglish.com/ai-speaking/vi/samples; https://jurassicenglish.com/ai-speaking/vi/samples/advanced; https://jurassicenglish.com/ai-speaking/vi/samples/intermediate
- https://jurassicenglish.com/ai-speaking/samples; https://jurassicenglish.com/ai-speaking/samples/intermediate; https://jurassicenglish.com/ai-speaking/samples/advanced

## Intentional noindex routes (not submitted)

- https://jurassicenglish.com/ai-speaking/vi/exam
- https://jurassicenglish.com/student-academy/referrals/account
- https://jurassicenglish.com/ai-speaking/vi/writing/practice
- https://jurassicenglish.com/ai-speaking/writing/practice
- https://jurassicenglish.com/ai-speaking/vi/writing/history
- https://jurassicenglish.com/ai-speaking/writing/history

## Reproduce / release verification

```sh
python3 scripts/seo/audit-live.py
npm ci --no-audit --no-fund
npm test
npm run lint
npm run build
npm run validate:prerender
npm run validate:indexability -- --report
python3 scripts/seo/summarize-audit.py
```

After Jay merges and releases: verify both basic aliases return one 308 to their hubs, fetch all 223 sitemap URLs again, then give the ordered priority list to the SEO Manager. Do not submit aliases, session/account URLs or any noindex page. Compare GSC reason counts after 14 and 28 days. Rollback: revert this PR’s application/config commits and rebuild; no schema or data rollback is required.
