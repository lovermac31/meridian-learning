# Jurassic English — KPI Sheet Structure
**Internal use only · Jurassic English / World Wise Learning · March 2026**

---

## Overview

This document defines the tab structure, formula logic, and metric definitions for a spreadsheet-based KPI and reporting layer built on top of the JE Lead Tracker. All formulas assume the tracker lives in a tab named **Pipeline** with the 18-column schema from `JE-Lead-Tracker-Schema.md`.

Column references below use the letter assignments from the recommended column order (Section 1).

---

## 1. Column Letter Reference

| Col | Field | Type |
|-----|-------|------|
| A | `registration_id` | Text |
| B | `submitted_at` | DateTime |
| C | `full_name` | Text |
| D | `work_email` | Text |
| E | `organisation` | Text |
| F | `buyer_type` | Enum |
| G | `maoi` | Enum |
| H | `alignment_status` | Enum |
| I | `service_category` | Text |
| J | `pricing_range_summary` | Text |
| K | `recommended_next_step` | Text |
| L | `lead_status` | Enum |
| M | `owner` | Text |
| N | `last_contacted_at` | Date |
| O | `discovery_call_date` | Date |
| P | `proposal_sent_at` | Date |
| Q | `outcome` | Text |
| R | `notes` | Text |

**Row 1**: Headers. **Row 2 onwards**: data. In all formulas below, column ranges start from row 2 (`:2:` notation) to exclude the header.

---

## 2. Recommended Workbook Tab Structure

| Tab name | Purpose |
|----------|---------|
| **Pipeline** | The live tracker — 18 columns, one row per lead |
| **Weekly** | Weekly review snapshot — filled each Monday |
| **KPIs** | Running KPI calculations — auto-updating from Pipeline |
| **Aging** | Lead aging view — flags leads past SLA thresholds |
| **Closed** | Archive — Closed Won and Closed Lost records (monthly copy) |

---

## 3. Pipeline Tab

**This is the master data tab.** All other tabs reference it. Rules:
- Row 1: headers (frozen)
- Column A: frozen (always visible while scrolling right)
- Apply data validation dropdowns to columns F, G, H, L (see Section 6)
- Apply date format `YYYY-MM-DD` to columns B, N, O, P
- Apply conditional formatting to column L (lead_status):

| Value | Suggested colour |
|-------|-----------------|
| New | Light yellow |
| Reviewed | Light blue |
| Access Sent | Sky blue |
| Awaiting Discovery Call | Medium blue |
| Qualified | Light green |
| Proposal Pending | Amber/orange |
| Closed Won | Green |
| Closed Lost | Light red/pink |
| On Hold | Light grey |

---

## 4. KPIs Tab — Formula Logic

All formulas reference the **Pipeline** tab. Written as Google Sheets formulas; adapt for Excel by replacing `COUNTIFS`/`AVERAGEIFS` syntax as needed.

---

### KPI 1 — New Leads (Last 7 Days)

```
=COUNTIFS(Pipeline!B:B, ">="&(TODAY()-7), Pipeline!B:B, "<="&TODAY())
```

**Segmentation by alignment:**
```
Primary:            =COUNTIFS(Pipeline!B:B,">="&(TODAY()-7),Pipeline!H:H,"primary")
Secondary:          =COUNTIFS(Pipeline!B:B,">="&(TODAY()-7),Pipeline!H:H,"secondary")
Context-Dependent:  =COUNTIFS(Pipeline!B:B,">="&(TODAY()-7),Pipeline!H:H,"context_dependent")
Manual Review:      =COUNTIFS(Pipeline!B:B,">="&(TODAY()-7),Pipeline!H:H,"manual_review")
```

**Segmentation by buyer type:**
```
school_admin:          =COUNTIFS(Pipeline!B:B,">="&(TODAY()-7),Pipeline!F:F,"school_admin")
teacher_cpd_lead:      =COUNTIFS(Pipeline!B:B,">="&(TODAY()-7),Pipeline!F:F,"teacher_cpd_lead")
institutional_partner: =COUNTIFS(Pipeline!B:B,">="&(TODAY()-7),Pipeline!F:F,"institutional_partner")
parent_guardian:       =COUNTIFS(Pipeline!B:B,">="&(TODAY()-7),Pipeline!F:F,"parent_guardian")
other:                 =COUNTIFS(Pipeline!B:B,">="&(TODAY()-7),Pipeline!F:F,"other")
```

---

### KPI 2 — Time to First Response (Average Business Days)

**Note**: Google Sheets does not have a built-in NETWORKDAYS-based average. Use a helper column approach.

**Add a helper column S (`response_days`) to the Pipeline tab:**
```
=IF(AND(N2<>"", B2<>""), NETWORKDAYS(DATEVALUE(LEFT(B2,10)), N2)-1, "")
```
*(Subtracts 1 to treat Day 0 as same-day response)*

**KPI formula (average across all actioned leads):**
```
=AVERAGEIF(Pipeline!S:S, "<>")
```

**By alignment:**
```
Primary:   =AVERAGEIFS(Pipeline!S:S, Pipeline!H:H, "primary",   Pipeline!S:S, "<>")
Secondary: =AVERAGEIFS(Pipeline!S:S, Pipeline!H:H, "secondary", Pipeline!S:S, "<>")
```

**SLA breach count (Primary leads contacted in 2+ days):**
```
=COUNTIFS(Pipeline!H:H, "primary", Pipeline!S:S, ">=2")
```

---

### KPI 3 — Access Sent → Discovery Call Conversion Rate

**Leads that reached Access Sent (ever):**
```
Active or later:
=COUNTIFS(Pipeline!L:L, "Access Sent")
 + COUNTIFS(Pipeline!L:L, "Awaiting Discovery Call")
 + COUNTIFS(Pipeline!L:L, "Qualified")
 + COUNTIFS(Pipeline!L:L, "Proposal Pending")
 + COUNTIFS(Pipeline!L:L, "Closed Won")
 + COUNTIFS(Pipeline!L:L, "Closed Lost")
```
*Note: This counts current status, not history. For precise historical tracking, add a `reached_access_sent` boolean helper column (set to TRUE when access link is sent, never reset).*

**Simpler approximation (column O filled = call occurred):**
```
Numerator:   =COUNTA(Pipeline!O:O)-1   [subtract header]
Denominator: [leads that reached Access Sent or later — use helper column method]
Rate:        =Numerator/Denominator
```

**Recommended helper column T (`access_sent_flag`) in Pipeline tab:**
```
Set to TRUE manually when access link is sent (or via a status-history approach)
```

---

### KPI 4 — Discovery Call → Qualified Rate

**Leads with a call held (O column not blank):**
```
=COUNTA(Pipeline!O:O)-1
```

**Leads that qualified (status = Qualified or later):**
```
=COUNTIFS(Pipeline!L:L,"Qualified")
 +COUNTIFS(Pipeline!L:L,"Proposal Pending")
 +COUNTIFS(Pipeline!L:L,"Closed Won")
 +COUNTIFS(Pipeline!L:L,"Closed Lost")
```
*Note: Closed Lost post-Proposal counts as "did qualify". Closed Lost pre-qualification does not.*

**Rate:**
```
=Qualified_or_later / Leads_with_call
```

---

### KPI 5 — Qualified → Closed Won Rate

**Leads that reached Qualified or beyond:**
```
=COUNTIFS(Pipeline!L:L,"Qualified")
 +COUNTIFS(Pipeline!L:L,"Proposal Pending")
 +COUNTIFS(Pipeline!L:L,"Closed Won")
 +COUNTIFS(Pipeline!L:L,"Closed Lost")
```

**Closed Won count:**
```
=COUNTIFS(Pipeline!L:L,"Closed Won")
```

**Rate:**
```
=Closed_Won / Reached_Qualified
```

---

### KPI 6 — Average Days to Close (Closed Won)

**Add helper column U (`days_to_close`) in Pipeline tab:**
```
=IF(AND(L2="Closed Won", B2<>""), TODAY()-DATEVALUE(LEFT(B2,10)), "")
```
*(Replace TODAY() with actual close date if logged in outcome column)*

**Average:**
```
=AVERAGEIF(Pipeline!U:U,"<>")
```

**By MAOI:**
```
School Licensing: =AVERAGEIFS(Pipeline!U:U, Pipeline!G:G,"school_licensing", Pipeline!U:U,"<>")
Teacher Training: =AVERAGEIFS(Pipeline!U:U, Pipeline!G:G,"teacher_training",  Pipeline!U:U,"<>")
```

---

### KPI 7 — Weighted Pipeline Value

**Step 1**: Add helper column V (`stage_weight`) in Pipeline tab:
```
=IFS(
  L2="Reviewed",                0.10,
  L2="Access Sent",             0.20,
  L2="Awaiting Discovery Call", 0.30,
  L2="Qualified",               0.50,
  L2="Proposal Pending",        0.70,
  L2="Closed Won",              1.00,
  TRUE,                         0
)
```

**Step 2**: Add helper column W (`midpoint_value`) — manually enter or lookup from a reference table. Example midpoints:

| MAOI | Midpoint |
|------|---------|
| school_licensing | $9,000 |
| teacher_training | $5,500 |
| curriculum_review | $7,250 |
| academic_consulting | $13,000 |
| institutional_partnerships | $15,000 |
| digital_reasoning_engine | $3,000 |

**Step 3**: Add helper column X (`weighted_value`):
```
=IF(AND(V2<>0, W2<>""), V2*W2, "")
```

**Total weighted pipeline:**
```
=SUM(Pipeline!X:X)
```

**Raw pipeline (unweighted):**
```
=SUMIF(Pipeline!W:W,"<>")
```

---

## 5. Weekly Tab — Review Template

The Weekly tab captures a snapshot every Monday. One row per week.

**Column structure:**

| Col | Field | How to populate |
|-----|-------|----------------|
| A | Week of (date) | Manual: Monday date |
| B | New leads | Formula: count submitted_at in last 7 days |
| C | New — Primary | Formula: alignment filter |
| D | New — Secondary | Formula: alignment filter |
| E | New — Context-Dep | Formula: alignment filter |
| F | New — Manual Review | Formula: alignment filter |
| G | Access links sent | Manual count (or helper column T) |
| H | Discovery Calls held | Formula: count new O values this week |
| I | Proposals sent | Formula: count new P values this week |
| J | Closed Won this week | Manual |
| K | Closed Won value | Manual |
| L | Closed Lost this week | Manual |
| M | Pipeline count (active) | Formula: count non-terminal, non-hold statuses |
| N | Weighted pipeline value | Formula: SUM of col X (Weighted tab) |
| O | On Hold count | Formula: COUNTIF status = On Hold |
| P | SLA breaches | Manual: count from Aging tab |
| Q | Notes | Free text |

**Active leads formula (col M):**
```
=COUNTIFS(Pipeline!L:L,"<>Closed Won",
           Pipeline!L:L,"<>Closed Lost",
           Pipeline!L:L,"<>New")
```

**On Hold count (col O):**
```
=COUNTIF(Pipeline!L:L,"On Hold")
```

---

## 6. Aging Tab — Lead Aging View

The Aging tab is a filtered/sorted view for the weekly SLA check.

**Structure**: Pull all active leads (status not Closed Won, Closed Lost) and calculate days in current stage.

**Step 1**: Add helper column Y (`status_changed_at`) to Pipeline tab — update manually each time status changes. This is the only field in the schema not already defined; it enables accurate aging.

**Step 2**: Aging formula (col Z, `days_in_stage`):
```
=IF(AND(Y2<>"", L2<>"Closed Won", L2<>"Closed Lost"), TODAY()-Y2, "")
```

**Step 3**: Aging tab — use FILTER to pull active leads sorted by days_in_stage descending:
```
=SORT(
  FILTER(
    Pipeline!A:Z,
    (Pipeline!L:L<>"Closed Won") *
    (Pipeline!L:L<>"Closed Lost") *
    (Pipeline!L:L<>"")
  ),
  26, FALSE   [col Z = days_in_stage, sort descending]
)
```

**SLA threshold reference (add as a lookup table in the Aging tab):**

| Stage | Amber (days) | Red (days) |
|-------|-------------|-----------|
| New | 1 | 2 |
| Reviewed | 1 | 2 |
| Access Sent | 7 | 11 |
| Awaiting Discovery Call | 8 | 11 |
| Qualified | 4 | 6 |
| Proposal Pending | 20 | 29 |
| On Hold | 25 | 31 |

**Conditional formatting on the Aging tab**: Apply to the `days_in_stage` column using the threshold table above via a VLOOKUP-based rule.

---

## 7. Closed Tab — Archive

Monthly, copy all `Closed Won` and `Closed Lost` rows from Pipeline to this tab. Retain indefinitely.

**Structure**: Same 18 columns as Pipeline, plus:
- Column S: `close_month` — `=TEXT(B[row],"YYYY-MM")` for filtering by period
- Column T: `close_type` — `Won` or `Lost` (derived from lead_status)

**Quarterly analysis formulas:**

Won count by MAOI (this quarter):
```
=COUNTIFS(Closed!G:G,"school_licensing",Closed!S:S,">="&TEXT(DATE(YEAR(TODAY()),MONTH(TODAY())-2,1),"YYYY-MM"))
```

Lost reasons — use a COUNTIF across the outcome column (Q) after standardising reason text.

---

## 8. Dropdown Values (Data Validation)

Apply these dropdown lists to the Pipeline tab columns.

**Column F — `buyer_type`:**
```
school_admin
teacher_cpd_lead
parent_guardian
institutional_partner
other
```

**Column G — `maoi`:**
```
teacher_training
school_licensing
curriculum_review
academic_consulting
institutional_partnerships
digital_reasoning_engine
```

**Column H — `alignment_status`:**
```
primary
secondary
context_dependent
manual_review
```

**Column L — `lead_status`:**
```
New
Reviewed
Access Sent
Awaiting Discovery Call
Qualified
Proposal Pending
Closed Won
Closed Lost
On Hold
```

---

*Last updated: 26 March 2026 · Maintained by: Jay Adams / World Wise Learning*
