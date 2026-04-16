# Vietnam English Business Alignment Scraper Design

Date: 2026-04-16
Project: Jurassic English
Status: Approved design for implementation planning

## Executive Summary

Build a compliant, broad-but-shallow research workflow that maps English education, EdTech, business-English, and institutional network targets in Vietnam against Jurassic English's institutional buyer positioning.

The first version prioritizes a lead list and alignment report, not a deep competitor dossier. It will start from known targets in the provided CRM and HCMC market-intelligence documents, add a controlled set of adjacent targets, scrape public pages lightly, and produce ranked CSV, JSON, and Markdown outputs for sales and partnership prioritization.

## Goals

- Create a broad lead map of aligned English businesses and education-adjacent organizations in Vietnam.
- Extract standardized public marketing signals from each target.
- Score each target for Jurassic English fit using institutional, CEFR, curriculum, teacher-training, partnership, proof, and CTA signals.
- Produce outputs that are immediately useful for outreach, prioritization, and later deep-dive research.

## Non-Goals

- Do not build a public-facing website feature.
- Do not crawl private, logged-in, paywalled, or form-gated content.
- Do not submit forms or interact with lead-capture flows.
- Do not scrape personal data beyond public business contact details.
- Do not perform uncontrolled web crawling.
- Do not change Jurassic English runtime, routing, BotUI, private routes, or form flows.

## Source Context

The seed strategy is grounded in:

- `Marketing/CRM_Notes_BusinessNetwork_Saigon.docx`
- `Marketing/HCMC_Market_Intelligence_Report_Jay_Adams.docx`
- The user-provided `JURASSIC ENGLISH COMPETITIVE ALIGNMENT SCRAPER` draft

Relevant targets and channels identified in the source material include:

- English language centers: ILA, VUS, Apollo English, Wall Street English, ACET, YOLA, Language Link, DOL, Ocean Edu, I Can Read.
- EdTech and test-prep: PREP.vn, Edupia, Vuihoc, Topica, ELSA Vietnam, Monkey Junior.
- Academic institutions: RMIT Vietnam, FPT University HCMC, HCMIU, HUTECH, HCMUT.
- Professional networks: TESOL HCMC, AmCham Vietnam, BritCham Vietnam, EuroCham Vietnam, AusCham Vietnam, BEN Vietnam, BNI Vietnam.
- Business and education communities: chambers, HR networks, executive education groups, and English-speaking HCMC business communities.

## Recommended Approach

Use approach A1: broad compliant lead-map pilot.

This approach begins with a curated seed file, enriches targets with public website signals, and produces ranked outputs. It gives the fastest useful market map while keeping compliance and research scope controlled.

## Output Structure

All generated research outputs should live under:

```text
alignment-research/
```

Expected files:

```text
alignment-research/
  targets_seed.csv
  scraped/
    <sanitized-domain-and-path>.json
  alignment_report.csv
  alignment_report.md
  run_summary.json
```

No production app files should be required for the first scraper sprint.

## Target Data Model

`targets_seed.csv` should support:

- `company_name`
- `domain`
- `category`
- `country`
- `city_or_region`
- `seed_source`
- `priority`
- `notes`

Initial categories:

- `english_language_center`
- `edtech`
- `test_prep`
- `international_school`
- `university`
- `professional_network`
- `business_chamber`
- `corporate_training`
- `education_association`

## Scrape Scope Per Target

For each target, the scraper should attempt a small page set:

- homepage
- about page if discoverable
- programs, courses, or curriculum page if discoverable
- school, partner, institutional, or enterprise page if discoverable
- contact page if discoverable
- pricing, admissions, demo, or consultation page if discoverable

The pilot should cap pages per domain to prevent uncontrolled crawling. Recommended initial cap: five pages per target.

## Extraction Schema

Each scraped JSON payload should include:

- `url`
- `final_url`
- `domain`
- `scraped_at`
- `user_agent`
- `robots_allowed`
- `status_code`
- `meta.title`
- `meta.description`
- `headings.h1`
- `headings.h2`
- `ctas`
- `contact_signals`
- `pricing_signals`
- `cefr_terms`
- `institutional_keywords`
- `teacher_training_signals`
- `curriculum_signals`
- `partnership_signals`
- `proof_signals`
- `marketing_psychology_signals`
- `schema_org`
- `page_text_length`
- `errors`

CTA records should include:

- `text`
- `href`
- `tag`
- `classes`
- `intent`

CTA intent values:

- `institutional`
- `teacher`
- `parent_student`
- `consumer`
- `mixed`
- `unknown`

## Signal Dictionaries

The implementation should start from the user-provided dictionaries and extend them for Vietnam English-business research.

### CEFR and Standards Signals

- `cefr`
- `a1`
- `a2`
- `b1`
- `b2`
- `c1`
- `c2`
- `can-do`
- `cambridge`
- `ielts`
- `toeic`
- `assessment`
- `placement test`
- `learning outcomes`
- `standards`
- `rubric`

### Institutional Buyer Signals

- `school`
- `institutional`
- `academic director`
- `training manager`
- `teacher training`
- `curriculum`
- `implementation`
- `partnership`
- `licensing`
- `franchise`
- `campus`
- `procurement`
- `pilot`
- `corporate training`

### Curriculum and Academic Signals

- `curriculum`
- `syllabus`
- `framework`
- `academic program`
- `scope and sequence`
- `lesson plan`
- `methodology`
- `pedagogy`
- `teacher guide`
- `student outcomes`

### Proof Signals

- student count
- campus count
- years operating
- accreditation
- partner logos
- awards
- testimonials
- case studies
- university or ministry relationships

### Marketing Psychology Signals

The scraper should identify evidence of:

- authority: accreditation, Cambridge, IELTS, government, university, official partner language
- social proof: number of students, teachers, campuses, partners, testimonials
- risk reduction: trial class, demo, consultation, placement test, free assessment
- status quo friction: traditional program language without clear differentiation
- jobs-to-be-done: teacher workload, parent outcomes, academic improvement, confidence, exam readiness
- conversion friction: unclear CTA, too many CTAs, no public contact path

## Alignment Scoring

Use a 100-point scoring model:

```text
25 = institutional buyer fit
20 = CEFR / standards / assessment alignment
15 = curriculum or academic-program language
15 = teacher training / implementation support language
10 = partnership / licensing / procurement signals
10 = proof signals, scale, outcomes, accreditations
5  = clear contact or conversion path
```

Alignment bands:

- `80-100`: priority strategic target
- `65-79`: strong outreach target
- `50-64`: moderate fit, nurture or content-led outreach
- `35-49`: weak fit, monitor only
- `0-34`: poor fit for Jurassic English institutional outreach

## Report Requirements

`alignment_report.csv` should include:

- `rank`
- `company_name`
- `domain`
- `category`
- `city_or_region`
- `alignment_score`
- `alignment_band`
- `target_buyer_type`
- `top_signals`
- `missing_signals`
- `recommended_outreach_angle`
- `primary_cta`
- `contact_signal`
- `source_urls`
- `notes`

`alignment_report.md` should include:

- executive summary
- top 10 aligned opportunities
- best English language center targets
- best EdTech targets
- best association/network targets
- common market positioning patterns
- common gaps Jurassic English can exploit
- recommended next deep-dive targets
- scrape limitations and skipped targets

## Compliance and Safety

The scraper must:

- respect `robots.txt`
- use a transparent user agent
- apply a default delay of at least two seconds per request
- enforce per-domain page limits
- use request timeouts
- avoid login, private pages, form submissions, and CAPTCHA bypass
- record skipped URLs and reasons
- avoid collecting sensitive personal information
- write outputs only to the research directory

Recommended user agent:

```text
JurassicEnglish-ResearchBot/1.0 (+https://jurassicenglish.com/bot)
```

## Reliability Design

The implementation should include:

- structured logging
- retry with exponential backoff
- HTTP timeout defaults
- UTF-8 safe parsing and output
- graceful handling of unreachable sites
- JSON validation during report generation
- run summary with success, failure, skipped, and robots-blocked counts

## Proposed Scripts

Create scripts only after implementation planning approval:

```text
scripts/alignment_scraper.py
scripts/build_alignment_report.py
scripts/summarize_alignment_report.py
```

Expected command flow:

```bash
python3 scripts/alignment_scraper.py \
  --targets alignment-research/targets_seed.csv \
  --output-dir alignment-research \
  --extract-ctas \
  --extract-pricing \
  --extract-cefr \
  --extract-institutional

python3 scripts/build_alignment_report.py \
  --input-dir alignment-research/scraped \
  --targets alignment-research/targets_seed.csv \
  --output alignment-research/alignment_report.csv

python3 scripts/summarize_alignment_report.py \
  --csv alignment-research/alignment_report.csv \
  --out alignment-research/alignment_report.md
```

## Verification Plan

Minimum verification for the first implementation:

- `python3 -m py_compile scripts/alignment_scraper.py`
- `python3 -m py_compile scripts/build_alignment_report.py`
- `python3 -m py_compile scripts/summarize_alignment_report.py`
- run scraper on a small pilot of 3-5 targets
- verify JSON output is valid
- verify CSV opens and has expected columns
- verify Markdown summary contains ranked targets and limitations
- confirm skipped/failed URLs are represented in `run_summary.json`

Success criteria:

- 30-50 seeded targets
- 20+ successful public-page extractions in pilot/full run, depending on robots and availability
- ranked CSV output with alignment scores
- executive Markdown report with top opportunities
- no app runtime changes
- no uncontrolled crawling

## Rollback Plan

The first implementation should be isolated from the live site:

- scripts are isolated under `scripts/`
- research outputs are isolated under `alignment-research/`
- no production routing, frontend, BotUI, forms, or private-route files are touched

Rollback is limited to removing generated research outputs and, if necessary, reverting the scraper scripts.

## Implementation Defaults

Use these defaults for the first implementation plan unless the user changes scope:

- Initial seed target count: 40 targets.
- Discovery method: curated/manual seed list only for sprint one; do not add Google/search discovery until the pilot output is reviewed.
- Page limit: maximum five public pages per target.
- Raw text storage: store only short matched evidence snippets around detected signals, not full raw page text.
- Research summary location: generate the main summary as `alignment-research/alignment_report.md`; do not create a separate `docs/research/` summary until after the first run is reviewed.
- Browser use: use `agent-browser` only for spot checks or pages that fail normal HTTP parsing; do not use browser automation for the full scrape unless specific targets require rendered content.

## Approved First Sprint Scope

First sprint should build the broad lead-list and alignment-report workflow:

1. Create `targets_seed.csv` from known targets and adjacent Vietnam English-business targets.
2. Implement the compliant scraper.
3. Implement alignment scoring and CSV report generation.
4. Implement Markdown summary generation.
5. Run a small pilot and verify output quality.
6. If pilot passes, run the broader target set.
