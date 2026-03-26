# Jurassic English — Platform Pack
**Internal use only · Jurassic English / World Wise Learning · March 2026**

---

## Overview

This document provides ready-to-implement field maps and configuration guides for three platforms: **Google Sheets**, **Notion**, and **Airtable**. Each section covers property types, required configuration, recommended views, and any platform-specific notes.

All three implementations use the same 18-field canonical schema from `JE-Lead-Tracker-Schema.md`. The field names, enum values, and data types are identical across platforms — only the platform UI terms differ.

---

## Platform 1 — Google Sheets

### Workbook Structure

Create a single workbook with 5 tabs (see `JE-KPI-Sheet-Structure.md` for formula detail):

| Tab | Colour code | Purpose |
|-----|------------|---------|
| Pipeline | Blue | Live tracker — master data |
| Weekly | Green | Monday snapshot — one row per week |
| KPIs | Orange | Auto-calculated KPI dashboard |
| Aging | Red | SLA monitoring — active leads sorted by days in stage |
| Closed | Grey | Monthly archive — Won and Lost records |

---

### Pipeline Tab — Column Configuration

| Col | Field | Type | Validation / Format | Width |
|-----|-------|------|---------------------|-------|
| A | `registration_id` | Text | None — free text | 200px |
| B | `submitted_at` | DateTime | Format: `YYYY-MM-DD HH:MM` (display local) | 160px |
| C | `full_name` | Text | None | 180px |
| D | `work_email` | Text | None | 200px |
| E | `organisation` | Text | None | 180px |
| F | `buyer_type` | Dropdown | See dropdown list below | 160px |
| G | `maoi` | Dropdown | See dropdown list below | 180px |
| H | `alignment_status` | Dropdown | See dropdown list below | 140px |
| I | `service_category` | Text | None (derived from maoi) | 180px |
| J | `pricing_range_summary` | Text | None (from intake email) | 220px |
| K | `recommended_next_step` | Text | None (from intake email) | 220px |
| L | `lead_status` | Dropdown | See dropdown list below | 160px |
| M | `owner` | Text | None | 120px |
| N | `last_contacted_at` | Date | Format: `YYYY-MM-DD` | 130px |
| O | `discovery_call_date` | Date | Format: `YYYY-MM-DD` | 130px |
| P | `proposal_sent_at` | Date | Format: `YYYY-MM-DD` | 130px |
| Q | `outcome` | Text | None | 220px |
| R | `notes` | Text | Wrap text on | 350px |

**Freeze**: Row 1 (headers) + Column A (`registration_id`)

### Dropdown Lists (Data Validation → List from range or custom)

**Column F — `buyer_type`:**
```
school_admin,teacher_cpd_lead,parent_guardian,institutional_partner,other
```

**Column G — `maoi`:**
```
teacher_training,school_licensing,curriculum_review,academic_consulting,institutional_partnerships,digital_reasoning_engine
```

**Column H — `alignment_status`:**
```
primary,secondary,context_dependent,manual_review
```

**Column L — `lead_status`:**
```
New,Reviewed,Access Sent,Awaiting Discovery Call,Qualified,Proposal Pending,Closed Won,Closed Lost,On Hold
```

### Conditional Formatting — Column L (`lead_status`)

Apply cell colour rules to column L:

| Value | Background | Text |
|-------|-----------|------|
| New | #FFF9C4 | #333 |
| Reviewed | #BBDEFB | #333 |
| Access Sent | #90CAF9 | #333 |
| Awaiting Discovery Call | #42A5F5 | #FFF |
| Qualified | #C8E6C9 | #333 |
| Proposal Pending | #FFE0B2 | #333 |
| Closed Won | #388E3C | #FFF |
| Closed Lost | #FFCDD2 | #333 |
| On Hold | #ECEFF1 | #333 |

### Recommended Named Ranges

Define these named ranges for use in KPI formulas:

| Name | Range |
|------|-------|
| `pipeline_status` | `Pipeline!L:L` |
| `pipeline_alignment` | `Pipeline!H:H` |
| `pipeline_buyer_type` | `Pipeline!F:F` |
| `pipeline_maoi` | `Pipeline!G:G` |
| `pipeline_submitted` | `Pipeline!B:B` |
| `pipeline_last_contact` | `Pipeline!N:N` |
| `pipeline_call_date` | `Pipeline!O:O` |
| `pipeline_proposal_date` | `Pipeline!P:P` |

---

## Platform 2 — Notion

### Database Setup

Create a **full-page database** (not inline). Set the page title property to `registration_id` — this ensures every record has a unique, sortable identifier as its primary key.

### Property Map

| Property name | Notion type | Configuration |
|--------------|-------------|---------------|
| `registration_id` | **Title** | Primary key — e.g. `JE-SCH-SLI-MN7E40G8` |
| `submitted_at` | **Date** | Include time; display format: `MMM D, YYYY H:mm` |
| `full_name` | **Text** | — |
| `work_email` | **Email** | — |
| `organisation` | **Text** | — |
| `buyer_type` | **Select** | 5 options — see values below |
| `maoi` | **Select** | 6 options — see values below |
| `alignment_status` | **Select** | 4 options with colour coding |
| `service_category` | **Text** | — |
| `pricing_range_summary` | **Text** | — |
| `recommended_next_step` | **Text** | — |
| `lead_status` | **Select** | 9 options with colour coding |
| `owner` | **Person** (or Text if solo) | — |
| `last_contacted_at` | **Date** | Date only; format: `MMM D, YYYY` |
| `discovery_call_date` | **Date** | Date only; format: `MMM D, YYYY` |
| `proposal_sent_at` | **Date** | Date only; format: `MMM D, YYYY` |
| `outcome` | **Text** | — |
| `notes` | **Text** (or use page body) | For longer notes, use the page body area — keep this property for a one-line summary |

### Select Options and Colours

**`buyer_type`:**
| Value | Colour |
|-------|--------|
| school_admin | Blue |
| teacher_cpd_lead | Green |
| parent_guardian | Purple |
| institutional_partner | Red |
| other | Grey |

**`maoi`:**
| Value | Colour |
|-------|--------|
| teacher_training | Blue |
| school_licensing | Green |
| curriculum_review | Purple |
| academic_consulting | Orange |
| institutional_partnerships | Red |
| digital_reasoning_engine | Grey |

**`alignment_status`:**
| Value | Colour |
|-------|--------|
| primary | Green |
| secondary | Blue |
| context_dependent | Orange |
| manual_review | Red |

**`lead_status`:**
| Value | Colour |
|-------|--------|
| New | Yellow |
| Reviewed | Blue |
| Access Sent | Blue |
| Awaiting Discovery Call | Blue |
| Qualified | Green |
| Proposal Pending | Orange |
| Closed Won | Green |
| Closed Lost | Red |
| On Hold | Grey |

### Recommended Views

Create these four database views:

**1. Pipeline Board** (Board view)
- Group by: `lead_status`
- Card preview properties: `full_name`, `organisation`, `buyer_type`, `alignment_status`
- Sort within columns: `submitted_at` ascending (oldest first)
- Filter: hide `Closed Won` and `Closed Lost` (keep pipeline uncluttered; use the Closed view for archives)

**2. All Leads Table** (Table view)
- Show all records
- Columns: `registration_id`, `full_name`, `organisation`, `buyer_type`, `maoi`, `alignment_status`, `lead_status`, `last_contacted_at`, `owner`
- Sort: `submitted_at` descending (newest first)

**3. On Hold Review** (Table view)
- Filter: `lead_status` = `On Hold`
- Sort: `last_contacted_at` ascending (longest without contact first)
- Columns: `registration_id`, `full_name`, `organisation`, `last_contacted_at`, `outcome`, `notes`

**4. Closed Log** (Table view)
- Filter: `lead_status` = `Closed Won` OR `lead_status` = `Closed Lost`
- Sort: `submitted_at` descending
- Columns: all 18 fields
- Do not delete records from this view — it is the permanent archive

### Notion Formula Properties (Optional)

Add these formula properties for light KPI visibility within Notion:

**`days_since_submitted`:**
```
dateBetween(now(), prop("submitted_at"), "days")
```

**`days_since_contact`:**
```
dateBetween(now(), prop("last_contacted_at"), "days")
```

**`sla_status`** (simplified — flags leads not contacted in 3+ days):
```
if(prop("days_since_contact") >= 3 and not(prop("lead_status") == "Closed Won") and not(prop("lead_status") == "Closed Lost") and not(prop("lead_status") == "On Hold"), "⚠️ Check", "✅")
```

---

## Platform 3 — Airtable

### Base Structure

Create a base named **JE Lead Pipeline** with two tables:

| Table | Purpose |
|-------|---------|
| **Leads** | Main tracker — 18 fields |
| **Templates** | Quick reference — 8 template records linked for in-tool access |

### Leads Table — Field Map

| Field name | Airtable type | Configuration |
|-----------|--------------|---------------|
| `registration_id` | **Single line text** | Mark as primary field |
| `submitted_at` | **Date** | Include time; ISO 8601 format |
| `full_name` | **Single line text** | — |
| `work_email` | **Email** | — |
| `organisation` | **Single line text** | — |
| `buyer_type` | **Single select** | 5 options — see values below |
| `maoi` | **Single select** | 6 options — see values below |
| `alignment_status` | **Single select** | 4 options — colour-coded |
| `service_category` | **Single line text** | — |
| `pricing_range_summary` | **Single line text** | — |
| `recommended_next_step` | **Long text** | — |
| `lead_status` | **Single select** | 9 options — colour-coded |
| `owner` | **Collaborator** (or Single line text) | — |
| `last_contacted_at` | **Date** | Date only; no time |
| `discovery_call_date` | **Date** | Date only; no time |
| `proposal_sent_at` | **Date** | Date only; no time |
| `outcome` | **Single line text** | — |
| `notes` | **Long text** | Enable rich text formatting |

### Single Select Options

**`buyer_type`:**
```
school_admin        (blue)
teacher_cpd_lead    (green)
parent_guardian     (purple)
institutional_partner (red)
other               (grey)
```

**`maoi`:**
```
teacher_training             (blue)
school_licensing             (green)
curriculum_review            (purple)
academic_consulting          (orange)
institutional_partnerships   (red)
digital_reasoning_engine     (grey)
```

**`alignment_status`:**
```
primary            (green)
secondary          (blue)
context_dependent  (orange)
manual_review      (red)
```

**`lead_status`:**
```
New                       (yellow)
Reviewed                  (blue)
Access Sent               (blue)
Awaiting Discovery Call   (blue)
Qualified                 (green)
Proposal Pending          (orange)
Closed Won                (green, dark)
Closed Lost               (red, light)
On Hold                   (grey)
```

### Recommended Views

**1. Pipeline (Kanban)**
- Group by: `lead_status`
- Visible fields on card: `full_name`, `organisation`, `buyer_type`, `alignment_status`, `last_contacted_at`
- Collapse: `Closed Won`, `Closed Lost`
- Sort: `submitted_at` ascending within columns

**2. All Leads (Grid)**
- All records
- Columns: `registration_id`, `full_name`, `organisation`, `buyer_type`, `maoi`, `alignment_status`, `lead_status`, `last_contacted_at`, `owner`
- Sort: `submitted_at` desc

**3. At Risk (Grid)**
- Filter: `lead_status` is not `Closed Won` AND `lead_status` is not `Closed Lost` AND `last_contacted_at` is before 7 days ago
- Sort: `last_contacted_at` ascending
- Purpose: Leads overdue for contact — the SLA monitoring view

**4. On Hold (Grid)**
- Filter: `lead_status` = `On Hold`
- Sort: `last_contacted_at` ascending (most neglected first)

**5. Closed Log (Grid)**
- Filter: `lead_status` = `Closed Won` OR `Closed Lost`
- All columns visible
- Sort: `submitted_at` desc

### Airtable Automations (Optional)

These automations can be configured in the Airtable Automations panel without scripting:

**Automation 1 — SLA alert (Primary leads)**
- Trigger: Record updated — `lead_status` changed to `Reviewed`
- Condition: `alignment_status` = `primary` AND `last_contacted_at` is empty
- Action: Send email notification to owner — "Primary lead [full_name] from [organisation] needs same-day contact"

**Automation 2 — On Hold re-engagement reminder**
- Trigger: At scheduled time (runs daily)
- Condition: `lead_status` = `On Hold` AND `last_contacted_at` is before 30 days ago
- Action: Send email notification to owner — "On Hold re-engagement due: [full_name], [organisation]"

**Automation 3 — Proposal Day 5 follow-up reminder**
- Trigger: At scheduled time (runs daily)
- Condition: `lead_status` = `Proposal Pending` AND `proposal_sent_at` = 5 days ago AND `last_contacted_at` < `proposal_sent_at` + 5 days
- Action: Send notification to owner — "Day 5 follow-up due: [full_name], [organisation]"

---

## Compatibility Notes

All three platforms use identical field names, enum values, and data types. A record created in one platform can be migrated to another without field remapping — the canonical keys are the same everywhere.

The `registration_id` format (`JE-[BT]-[MAOI]-[base36]`) is the universal primary key. Any external tool (future CRM, API integration, reporting layer) should use this as the join key.

The `LeadStatus` enum in `api/_lib/je-crm-mapper.ts` matches the `lead_status` dropdown values exactly — enabling future programmatic status updates via the API without translation logic.

**Migration path**: Google Sheets → Notion or Airtable is straightforward. Export the Pipeline tab as CSV; import into the target platform; map the 18 column headers to the corresponding properties. The CSV template (`JE-Lead-Tracker-Template.csv`) is the migration seed file.

---

*Last updated: 26 March 2026 · Maintained by: Jay Adams / World Wise Learning*
