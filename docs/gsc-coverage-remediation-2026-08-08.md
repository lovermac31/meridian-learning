# Google Search Console Coverage Remediation - 2026-08-08

## Source

Search Console export: `jurassicenglish.com-Coverage-2026-08-08.xlsx`

Latest reported state (data through 2026-08-05):

- Indexed: 57
- Not indexed: 7
- Total known pages: 64

The property improved from 25 indexed / 40 not indexed on 2026-05-11 to
57 indexed / 7 not indexed on 2026-08-05.

## URL-Level Triage

### Page with redirect - expected

- `http://jurassicenglish.com/`
- `http://www.jurassicenglish.com/`
- `https://www.jurassicenglish.com/`

These are non-canonical origin variants and should remain redirected to
`https://jurassicenglish.com/`. They must not be placed in the sitemap or made
indexable as separate pages.

### Redirect error - confirmed remediation

- `https://jurassicenglish.com/index.html`

Search Console last crawled this URL on 2026-05-06. The route is now explicitly
configured as a permanent one-hop redirect to `/`, eliminating the duplicate
HTML entry point and giving Google an unambiguous canonical destination.

### Crawled - currently not indexed

- `https://jurassicenglish.com/vi/legal/terms`
- `https://jurassicenglish.com/series/level-5-advanced`
- `https://jurassicenglish.com/legal/privacy`

All three currently return HTTP 200, `index, follow`, unique titles and
descriptions, self-canonicals, and valid language alternates. Search Console's
last crawls were 2026-06-29, 2026-06-22, and 2026-05-01 respectively.

The shared prerender pipeline previously copied the homepage fallback body into
every route HTML file. JavaScript replaced it at runtime, but crawlers reading
the first response saw the homepage H1 and body before rendering the actual
page. The pipeline now emits a route-specific H1, description, locale, and
internal navigation in every generated route document.

## Validation Gates

- `/index.html` redirects once to `/` on Vercel.
- `/pilot/:id` still rewrites internally to the SPA shell and remains noindex.
- Every prerendered route contains its own `data-prerendered-route-path` marker.
- Non-home routes cannot inherit the homepage fallback H1.
- The three affected pages remain indexable with one canonical each.
- Search Console validation should be resumed after production verification.

## Expected Reporting Lag

Search Console coverage is not real-time. A successful deployment and URL
inspection request may take days or weeks to change the coverage totals. The
three canonical-origin redirect rows are expected exclusions and should remain.
