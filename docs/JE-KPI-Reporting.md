# Jurassic English — KPI and Weekly Reporting Layer
**Internal use only · Jurassic English / World Wise Learning · March 2026**

---

## 1. Overview

This document defines the metrics, reporting cadence, and pipeline health indicators for the JE Plans & Pricing lead pipeline. The model is designed for a lean operation — it uses the tracker schema directly, requires no additional tooling, and can be run manually in under 30 minutes per week.

All metrics are derived from the 18-field tracker schema (`docs/JE-Lead-Tracker-Schema.md`).

---

## 2. Core KPIs

Seven primary KPIs. Each has a definition, calculation method, and health threshold.

---

### KPI 1 — New Leads (Weekly)

**Definition**: Number of new Plans & Pricing registrations received in the past 7 days.

**Calculation**: Count rows where `submitted_at` is within the last 7 days.

**Segmentation**: Break down by `buyer_type` and `alignment_status`.

**Threshold interpretation**:
| Volume | Signal |
|--------|--------|
| 0–1/week | Low — check form visibility and referral sources |
| 2–5/week | Normal operating range |
| 6–10/week | Strong — monitor triage SLA closely |
| 10+/week | High — consider triage capacity; SLA risk |

**Trend**: Compare week-on-week. A sudden spike without a marketing event is worth investigating (possible spam or referral burst).

---

### KPI 2 — Time to First Response

**Definition**: Average number of business days between `submitted_at` and `last_contacted_at` (first contact), for leads that have been actioned.

**Calculation**: For all leads where `lead_status` ≠ `New` in the reporting period:
`(first last_contacted_at date) - (submitted_at date)` in business days. Average across the set.

**Segmentation**: Break down by `alignment_status` (Primary, Secondary, Context-Dependent).

**Targets** (from `JE-Sales-Workflow.md §4`):
| Alignment | Target | Warning | Breach |
|-----------|--------|---------|--------|
| Primary | Same day | 1 day | 2+ days |
| Secondary | 2 days | 3 days | 4+ days |
| Context-Dependent | 3 days | 4 days | 5+ days |

**Health**: If average exceeds target by alignment tier, review triage capacity.

---

### KPI 3 — Access Link → Discovery Call Conversion Rate

**Definition**: Of leads sent the access link (`Access Sent`), what percentage progress to a Discovery Call (`Awaiting Discovery Call` or later).

**Calculation**:
```
(leads where discovery_call_date is not blank AND status ≠ Closed Lost before a call)
÷
(all leads that reached Access Sent)
× 100
```

**Measurement period**: Rolling 90 days (enough volume to be meaningful).

**Target**: 40–60% (leads who request a call after seeing the briefing). Below 30% suggests the briefing is not converting curiosity into engagement.

**Segmentation**: Break down by `buyer_type`. `school_admin` and `institutional_partner` should convert higher than `parent_guardian`.

---

### KPI 4 — Discovery Call → Qualified Rate

**Definition**: Of leads that had a Discovery Call, what percentage reached `Qualified` status.

**Calculation**:
```
(leads where lead_status = Qualified, Proposal Pending, Closed Won, or Closed Lost after a call)
÷
(leads where discovery_call_date is not blank)
× 100
```

**Measurement period**: Rolling 90 days.

**Target**: 65–80%. A lower rate suggests the wrong leads are reaching the call stage (qualification at triage needs tightening), or the call is not surfacing disqualifiers early enough.

**Segmentation**: Break down by `alignment_status` at intake. Primary leads should qualify at a higher rate than Secondary.

---

### KPI 5 — Qualified → Closed Won Rate

**Definition**: Of qualified leads, what percentage close as Won.

**Calculation**:
```
(leads where lead_status = Closed Won)
÷
(leads where lead_status = Qualified, Proposal Pending, Closed Won, or Closed Lost — i.e. reached Qualified or beyond)
× 100
```

**Measurement period**: Rolling 180 days (proposal cycles can be long).

**Target**: 35–55%. The range reflects deal complexity — school licensing and institutional partnerships take longer than CPD training.

**Segmentation**: Break down by `maoi` (service type). Some services will close faster than others.

---

### KPI 6 — Average Days to Close (Won)

**Definition**: Average number of calendar days from `submitted_at` to `Closed Won`.

**Calculation**: For all `Closed Won` records:
`(close date) - (submitted_at)` in calendar days. Average across all Won records in the period.

**Measurement period**: Rolling 180 days.

**Expected ranges by MAOI**:
| MAOI | Expected range |
|------|---------------|
| `teacher_training` | 14–45 days |
| `school_licensing` | 30–90 days |
| `curriculum_review` | 30–60 days |
| `academic_consulting` | 30–90 days |
| `institutional_partnerships` | 60–180 days |
| `digital_reasoning_engine` | 14–45 days (standalone); 0 days (included in licence) |

**Use**: Helps forecast pipeline close timing. Leads that significantly exceed their MAOI's expected range are at risk.

---

### KPI 7 — Pipeline Value (Estimated)

**Definition**: Sum of estimated deal values across all active leads (not including Closed Won, Closed Lost, or On Hold).

**Calculation**: For each active lead, assign an estimated value from the `pricing_range_summary` field using the **midpoint of the range**. Sum across all active leads.

**Example midpoints**:
| Service | Range | Midpoint |
|---------|-------|---------|
| School Licensing (small) | $2,500–$6,000/yr | $4,250 |
| School Licensing (mid) | $6,000–$12,000/yr | $9,000 |
| School Licensing (large) | $12,000–$21,000/yr | $16,500 |
| Teacher Training (group) | $900–$14,000 | $7,450 |
| Curriculum Review | $2,500–$12,000 | $7,250 |
| Academic Consulting | $8,000–$18,000 | $13,000 |
| Institutional Partnerships | Bespoke | Use $15,000 as placeholder |

**Note**: This is an indicator, not a forecast. Weight it by stage probability for a more accurate view:

| Stage | Probability weight |
|-------|--------------------|
| Reviewed | 10% |
| Access Sent | 20% |
| Awaiting Discovery Call | 30% |
| Qualified | 50% |
| Proposal Pending | 70% |

**Weighted pipeline value** = Sum of (estimated value × stage probability) across active leads.

---

## 3. Weekly Review Metrics

Run this review every Monday morning (or equivalent). Takes 20–30 minutes with a current tracker.

### Weekly Review Checklist

```
[ ] New this week
    — How many new registrations?
    — What buyer type / alignment split?
    — Any Manual Review flags outstanding?

[ ] Actions this week
    — How many leads moved stage?
    — How many access links sent?
    — How many Discovery Calls held?
    — How many proposals sent?

[ ] SLA check
    — Any lead in "New" for more than 1 business day?
    — Any Primary/Secondary lead not contacted within SLA?
    — Any lead in "Qualified" for more than 5 business days without a proposal?
    — Any "Proposal Pending" lead past Day 14 without follow-up?

[ ] Pipeline summary
    — Current count by stage (see Section 4 format)
    — Estimated pipeline value (see KPI 7)
    — Weighted pipeline value

[ ] On Hold review
    — How many leads are On Hold?
    — Any On Hold lead past 30 days without a re-engagement check?
    — Any On Hold lead past 90 days — ready to close as Lost?

[ ] Closed this week
    — Won: how many, total value, which MAOI?
    — Lost: how many, what reasons, any patterns?
```

### Weekly Summary Format

Use this format for a brief written record (one paragraph per week, or a row in a weekly log sheet):

```
Week of [date]:
New: [n] leads ([n] Primary, [n] Secondary, [n] Context-Dep, [n] Manual Review)
Actioned: [n] access links sent, [n] Discovery Calls held, [n] proposals sent
Closed: [n] Won ($[value]), [n] Lost
Pipeline: [n] active leads, est. value $[X], weighted $[Y]
On Hold: [n] leads ([n] overdue for check)
SLA flags: [any breaches]
```

---

## 4. Pipeline Health Indicators

These are snapshot views of the pipeline at any given moment. Run these during the weekly review.

### Stage Count Summary

| Stage | Count | % of pipeline | Health signal |
|-------|-------|---------------|---------------|
| New | — | — | Should be near 0 at end of each business day |
| Reviewed | — | — | Low is healthy (fast actioning) |
| Access Sent | — | — | Active conversion zone |
| Awaiting Discovery Call | — | — | Active conversion zone |
| Qualified | — | — | High is good; stale is a risk |
| Proposal Pending | — | — | High is good; old proposals need chasing |
| On Hold | — | — | Should not grow unchecked |
| Closed Won | — | (cumulative) | — |
| Closed Lost | — | (cumulative) | Review reasons quarterly |

### Health Signal Definitions

| Signal | Definition |
|--------|-----------|
| 🟢 Green | Stage count is within normal range and no SLA breaches |
| 🟡 Amber | Stage count is growing or one SLA flag present |
| 🔴 Red | SLA breach, leads stuck, or On Hold growing without re-engagement |

**Specific red flags to monitor:**
- More than 3 leads in `New` at end of business on any given day → triage backlog
- `Reviewed` count climbing without a matching `Access Sent` count → decision delays
- `On Hold` count exceeds 20% of total pipeline → too many deferred leads
- `Proposal Pending` count with no movement for 10+ business days → follow-up sequence breaking down
- `Awaiting Discovery Call` with `discovery_call_date` blank for more than 5 business days → call not being booked

---

## 5. Lead Aging View

The aging view shows how long each active lead has been in its current stage relative to the SLA target.

### Aging Calculation

For each active lead:
`Days in current stage = today - date of last status change`

Compare against the SLA target for that stage:

| Stage | SLA target (max days) | Amber (approaching) | Red (breached) |
|-------|-----------------------|--------------------|----|
| New | 1 business day | — | Any lead still `New` at end of business day |
| Reviewed | Same day | 1 day | 2+ days |
| Access Sent | 10 business days | Day 7 | Day 11+ |
| Awaiting Discovery Call | 10 business days | Day 8 | Day 11+ |
| Qualified | 5 business days | Day 4 | Day 6+ |
| Proposal Pending | 28 business days | Day 20 | Day 29+ |
| On Hold | 30 days per check | Day 25 | Day 31+ without check |

### Aging View Format (for weekly review)

Sort active leads by `Days in current stage` descending. Flag any that are Amber or Red.

| Registration ID | Name | Stage | Days in Stage | Signal |
|----------------|------|-------|--------------|--------|
| JE-SCH-SLI-XXX | [Name] | Proposal Pending | 22 | 🟡 |
| JE-TCL-TRT-XXX | [Name] | Access Sent | 6 | 🟢 |
| JE-INS-IPP-XXX | [Name] | On Hold | 35 | 🔴 |

---

## 6. Conversion Checkpoints

Four funnel checkpoints, each with a conversion metric and improvement lever.

### Checkpoint 1: Intake → Access Sent (or first outbound)

**Metric**: % of `New` leads actioned within SLA

**Formula**: (Leads reached `Reviewed` within 1 business day) ÷ (All leads) × 100

**Target**: 95%+

**If below target**: Triage is delayed. Review email notification setup; consider a dedicated triage time each day.

---

### Checkpoint 2: Access Sent → Discovery Call

**Metric**: % of access link leads who book a Discovery Call

**Formula**: (Leads at `Awaiting Discovery Call` or later) ÷ (Leads at `Access Sent` or later) × 100

**Target**: 40–60%

**If below target**: Check the access briefing quality; check that the invitation to book a call (Template 3) is being sent proactively; review follow-up cadence (Day 4 and Day 10 touchpoints).

---

### Checkpoint 3: Discovery Call → Qualified

**Metric**: % of call leads who qualify

**Formula**: (Leads at `Qualified` or later) ÷ (Leads with `discovery_call_date` filled) × 100

**Target**: 65–80%

**If below target**: Review Discovery Call process (`JE-Discovery-Call-Guide.md`). Common causes: wrong leads reaching the call (triage issue), or disqualifiers not being surfaced on the call (question quality issue).

---

### Checkpoint 4: Qualified → Closed Won

**Metric**: % of qualified leads that close as Won

**Formula**: (Leads at `Closed Won`) ÷ (Leads at `Qualified` or later) × 100

**Target**: 35–55%

**If below target**: Review proposal quality (is pricing calibrated to scope?), proposal follow-up cadence (are Day 5/14/28 touchpoints happening?), and qualification quality (are leads truly qualified before a proposal is issued?).

### Funnel Summary (weekly snapshot)

| Checkpoint | Leads In | Leads Out | Rate | Target | Signal |
|------------|---------|----------|------|--------|--------|
| New → Actioned | [n] | [n] | [x]% | 95%+ | |
| Access Sent → Discovery Call | [n] | [n] | [x]% | 40–60% | |
| Discovery Call → Qualified | [n] | [n] | [x]% | 65–80% | |
| Qualified → Closed Won | [n] | [n] | [x]% | 35–55% | |

---

## 7. Quarterly Review

Once per quarter, run a deeper analysis beyond the weekly metrics.

```
[ ] Closed Lost reasons analysis
    — List all Closed Lost records this quarter
    — Group by reason (budget, timing, no response, disqualified, declined)
    — Identify any pattern: is one reason dominant?
    — Is there a buyer type or MAOI that loses disproportionately?

[ ] On Hold review
    — Are On Hold leads converting when re-engaged? Or are they quiet Closed Lost?
    — Set a more aggressive re-engagement or close-out policy if On Hold is growing

[ ] Average deal size by MAOI
    — Compare actual Closed Won values against pricing range midpoints
    — Are proposals being accepted at the low end of the range? (Scope too broad)
    — Are proposals being lost at the high end? (Pricing sensitivity by org type)

[ ] Time to close by MAOI
    — Compare actual days to close against expected ranges (KPI 6)
    — Any MAOI significantly slower than expected?

[ ] Conversion rate trend
    — Compare this quarter vs. last quarter across all four checkpoints
    — Improving, stable, or declining at each stage?
```

---

*Last updated: 26 March 2026 · Maintained by: Jay Adams / World Wise Learning*
