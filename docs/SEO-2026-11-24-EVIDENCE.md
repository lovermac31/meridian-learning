# Jurassic English SEO evidence — 24 November 2026

Working copy: standalone `seo/je-og-links` clone. The master owns commits. No commit, push, merge, deployment, publication, or search-engine submission was made.

## Implementation

- Added eight 1200×630 JPEG share cards in `public/images/og/`, composed only from existing Jurassic English site art and the approved brand logo, on a navy background. Each file is below 200,000 bytes.
- Route metadata selects these cards for home, products, product details, Story Club, series, and the Vietnamese teacher page. Product routes now emit `summary_large_image`; OG dimensions, alt, and Twitter image are set. The client head manager also updates OG alt on navigation.
- Shortened the three audited descriptions. Added one localized home handoff strip with direct English and Vietnamese JurassicIELTS links and the required brand line. Added the requested World Wise Learning footer link.
- `EducationalOrganization` retains `name`, `url`, and `logo`, adds `alternateName: "Jurassic English"`, and reads `sameAs` only from `docs/SAMEAS.json`. The source list is empty because no approved profile URLs were supplied; `sameAs` is therefore omitted.

## Acceptance commands and real output

### Install, build, type check, tests

```text
$ npm ci
added 349 packages, and audited 350 packages in 3s
11 vulnerabilities (2 low, 5 moderate, 4 high)
exit 0

$ npm run build
[prerender-route-metadata] generated 257 route HTML files (254 server-rendered, 3 client-only)
[generate-sitemap] wrote 146 URLs (+30 static) to dist/sitemap.xml
{"event":"html_sitemap_built","pages":2,"entries":150}
exit 0

$ npm run lint
> tsc --noEmit
exit 0

$ npm test
# tests 863
# pass 863
# fail 0
exit 0

$ npm run typecheck
npm error Missing script: "typecheck"
exit 1
```

`package.json` has no `typecheck` script. It is outside the spec's owned paths, so it was not edited. `npm run lint` runs the same `tsc --noEmit` check and passed. AC5's literal `npm run typecheck` command remains unmet for the master to resolve.

### AC1 and AC2 — built metadata and physical images

Started the local preview with `npm run preview -- --host 127.0.0.1 --port 4173`. Converted the 20 URLs in the supplied `evidence/je_sel.txt` to local preview URLs, adding trailing slashes because Vite preview otherwise serves its home fallback for extensionless paths. Ran the supplied audit script against those 20 URLs:

```text
$ python3 "$TASK_EVIDENCE/audit.py" /tmp/je_local_sel.txt /tmp/je_local_audit.json
/products/ |T59 |D146 |... |og=True tw=summary_large_image
/story-club/reserve/ |T45 |D135 |... |og=True tw=summary_large_image
/vi/products/ |T56 |D146 |... |og=True tw=summary_large_image
/vi/series/level-1-foundation/ |T48 |D130 |... |og=True tw=summary_large_image
/vi/ve-thay-jay-adams/ |T48 |D155 |... |og=True tw=summary_large_image
```

A follow-up Python check fetched every preview page, checked nonempty `og:image:alt`, `og:image:width=1200`, `og:image:height=630`, matching Twitter image, card type and description length, then read each built JPEG with `magick identify`:

```text
dist/images/og/home.jpg 1200 630 133900
dist/images/og/jay-adams.jpg 1200 630 57767
dist/images/og/one-to-one.jpg 1200 630 104870
dist/images/og/printable-pack.jpg 1200 630 113998
dist/images/og/products.jpg 1200 630 121318
dist/images/og/series.jpg 1200 630 121318
dist/images/og/story-club.jpg 1200 630 109129
dist/images/og/story-workbooks.jpg 1200 630 96050
urls 20 unique_images 8 large_cards 20 descriptions_over_155 0 max_description 155 errors 0
error_details []
```

The spec permits JPEG or PNG. `magick identify` reads the JPEG dimensions; the PNG-header example in AC1 does not apply to these JPEG files.

### AC3 and AC4 — verification and handoff

```text
$ grep -c 'msvalidate.01' index.html
1
$ test -f public/BingSiteAuth.xml; echo $?
0
$ rg -o 'jurassicielts.com' dist/index.html | wc -l
15
$ rg -o 'worldwiselearning.app' dist/index.html | wc -l
5
$ rg -o 'JurassicIELTS is a brand of World Wise Learning' dist/index.html | wc -l
1
```

The home strip rendered once with two links on both checked layouts: English desktop at 1440 px and Vietnamese mobile at 390 px. Screenshots were inspected at `/tmp/je-en-desktop-strip.png` and `/tmp/je-vi-mobile-strip.png`.

### AC5 guard and AC6 diff

The OG test reads the actual JPEG headers, checks 1200×630 and size under 200 KB, and checks metadata for all sample routes plus every English and Vietnamese product route. An intentional substitution of `home.jpg` with a 960×640 copy produced:

```text
# Subtest: share images and social cards match 1200×630 assets
not ok 1 - share images and social cards match 1200×630 assets
negative_test_exit=1
```

The original asset was restored (`cmp` exit 0); the final full suite passed afterward.

```text
$ git diff main | rg '^\+.*vercel\.app' | wc -l
0
$ git diff main --stat
9 files changed, 67 insertions(+), 59 deletions(-)
$ git diff --check
exit 0
```

`TASK_EVIDENCE` denotes the supplied task's `evidence/` directory. `git diff main --stat` excludes untracked files; `git status --short` also shows the new evidence file, `docs/SAMEAS.json`, eight OG images, and `tests/og-images.test.ts`.

## Release notes and rollback

The only remaining acceptance gap is the missing `typecheck` npm script. For release, the master can add the alias in an authorized package change or accept the equivalent passing `npm run lint` command. To roll back these changes before release, restore the changed source and test files from `main` and remove the newly added OG cards and `docs/SAMEAS.json`; no external state changed. The `npm ci` audit reported 11 dependency findings, which were not changed under this task's owned-path constraint.
