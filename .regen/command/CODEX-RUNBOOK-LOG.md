# Runbook F — F1, F2, F3 — 2026-10-29

A. Plan
- Read F and verified CSV: 91 rows (61 Discovered, 25 Crawled, three host redirects, one canonical alternate with query omitted, one redirect error).
- Fresh worktree `.regen/runs/runbook-f-indexing-20261029`, branch `codex/runbook-f-indexing-20261029`, base `origin/main` / `1aae60a`.
- Draft PR only. No merge, manual deployment or indexing submission.

B. Implementation
- F1: three indexed contextual source pages per Discovered final URL, bilingual HTML directory pages/footer links, and rendered-graph CI gate. Every sitemap page has click depth at most two. Two existing basic sample aliases receive links to their final pages.
- F2: 24/25 pages receive 150–300 specific authored words; 22 native + Academy referrals and interactive demo. Sibling/title/H1/template/body-overlap audit covers all 25. Added valid Course descriptions on syllabuses and Article markup matching visible thinking examples; verified applicable existing FAQ markup. Offers/prices unchanged; no thin/filler page or unsupported merge.
- F2 remains open for `/ai-speaking/vi/solutions`: rewritten separate AI repository; no content change for it ships here. This is explicitly disclosed in the PR/table/review. No claim of full completion.
- F3: canonical-host href fixes in two Academy components and ten film decks. Existing www/HTTP and index.html redirects verified. Clean VI get-started is self-canonical; exact omitted query cannot be reproduced.
- Committed CSV, 91-row table, graph/redirect evidence, sibling audit, review/rollback notes and 30 request-priority URLs.

C. Verification
- Type-check, full 448-test suite, Vite production build, Academy build, 13 family-rewards tests, prerender coverage and 112-link asset check pass.
- #221 gate: 225 URLs, zero failures; two existing VI sample description warnings. New gate: 225 pages, max depth two, all 61 Discovered entries have three indexed contextual sources, zero failures.
- Six basic-alias links in separate live AI sample pages remain explicit upstream warnings. Host/index redirects and repository-controlled redirect hrefs fail the gate.
- Local browser test failed before execution because macOS sandbox denied Chromium Mach-port bootstrap. Hosted browser result to be recorded after PR creation.

D. Hardening
- No credentials, customer/student records, live database or payments used. No new env vars or secrets. Read-only allowlisted upstream checks use five workers and 20-second timeouts; structured JSON failure reports.
- No merge/deploy command. Draft PR automation may create its configured previews; none manually initiated.
- Rollback: close draft before merge; if separately approved/released later, revert this PR as a unit. No persistent-state rollback.

E. Confidence
- High (0.92) in implemented source changes and measured local gates. Medium (0.75) for full F completion because one external content page remains unchanged and local browser launch is sandbox-blocked.
- Improved plan checked immediately: reviewed the live VI solutions title/H1/body against VI lessons and verified source ownership; local source cannot ship that page. Finish its worked VI example in the owning repository, rerun combined gates, and retain this draft until resolved. Hosted Ubuntu CI will validate browser execution.

F. Assumptions
- Indexed approximation is exact canonical sitemap URLs absent from CSV, as directed; it is not a live GSC indexed export. New directories are excluded as indexed link sources.
- Query-omitted alternate is evidence of a variant, not an instruction to redirect or remove the canonical VI page. Basic sample aliases should retain existing final destinations.

G. Tradeoffs / blind spots
- F2 is 24/25, not fully complete; the separate AI app also retains six basic-alias hrefs and two duplicate-description warnings.
- Crawl depth demonstrates reachability, not Google indexing or traffic. Index requests/rechecks remain operator tasks after approved merge/release (5 and 12 November).

RESULT: Draft PR #233 opened; F2 external-source gap remains. Hosted checks pending at this commit; final hosted result will be appended to the workspace command log.
https://github.com/lovermac31/meridian-learning/pull/233
