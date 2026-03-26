# Jurassic English — Lead Tracker Schema
**Internal use only · Jurassic English / World Wise Learning · March 2026**

---

## 1. Overview

This schema defines the canonical field structure for the JE lead tracker. It is designed to work as-is in a spreadsheet (Google Sheets, Excel), a Notion database, an Airtable base, or as the target structure for a lightweight CRM migration.

Every field maps to a source — either the §8 Structured Record from the CRM intake email, or an operator-entered value. Fields sourced from §8 never need to be typed manually: copy-paste from the intake email.

The schema has **18 fields**. 10 are system-sourced (from intake); 8 are operator-entered (from triage, follow-up, and outcome).

---

## 2. Full Schema

### Group A — System-Sourced Fields
*Copy directly from §7 CRM Tags and §8 Structured Record in the intake email. Never type these manually.*

---

#### `registration_id`
| Attribute | Value |
|-----------|-------|
| Type | String |
| Format | `JE-[BT]-[MAOI]-[base36]` e.g. `JE-SCH-SLI-MN7E40G8` |
| Source | §7 `registration_id` |
| Required | **Yes — primary key** |
| Unique | Yes — one row per registration ID |
| Notes | The primary key for the entire record. Never duplicate. If the same person submits twice, create two rows and cross-reference in Notes. |
| CRM migration | Maps to: Record ID / Primary Key |

---

#### `submitted_at`
| Attribute | Value |
|-----------|-------|
| Type | DateTime |
| Format | ISO 8601 (`2026-03-26T11:34:59.311Z`) — display as local date/time |
| Source | §7 `submitted_at` |
| Required | **Yes** |
| Notes | Used for SLA tracking and lead aging. Always store as UTC; display in local time. |
| CRM migration | Maps to: Created Date |

---

#### `full_name`
| Attribute | Value |
|-----------|-------|
| Type | String |
| Source | §2 Contact / §8 field 1 |
| Required | **Yes** |
| Notes | As submitted on the form. Do not alter. |
| CRM migration | Maps to: Contact Name |

---

#### `work_email`
| Attribute | Value |
|-----------|-------|
| Type | Email |
| Source | §2 Contact / §8 field 2 |
| Required | **Yes** |
| Unique | Yes per active lead (flag duplicates) |
| Notes | Lowercase. Used for access link generation — must match exactly. |
| CRM migration | Maps to: Contact Email |

---

#### `organisation`
| Attribute | Value |
|-----------|-------|
| Type | String |
| Source | §2 Contact / §8 field 4 |
| Required | **Yes** |
| Notes | School, institution, or organisation name as submitted. |
| CRM migration | Maps to: Company / Account Name |

---

#### `buyer_type`
| Attribute | Value |
|-----------|-------|
| Type | Enum |
| Allowed values | `school_admin` · `teacher_cpd_lead` · `parent_guardian` · `institutional_partner` · `other` |
| Source | §7 `buyer_type` / §8 field 6 |
| Required | **Yes** |
| Notes | Use canonical key, not human label. If reclassified during a Discovery Call, update this field and log the change in Notes with the date. |
| CRM migration | Maps to: Lead Type / Contact Category |

---

#### `maoi`
| Attribute | Value |
|-----------|-------|
| Type | Enum |
| Allowed values | `teacher_training` · `school_licensing` · `curriculum_review` · `academic_consulting` · `institutional_partnerships` · `digital_reasoning_engine` |
| Source | §7 `maoi` / §8 field 7 |
| Required | **Yes** |
| Notes | Main area of interest. If scope shifts during the Discovery Call (e.g. from `school_licensing` to `curriculum_review` + `school_licensing`), update to the primary and note the secondary in Notes. |
| CRM migration | Maps to: Interest Area / Primary Product |

---

#### `alignment_status`
| Attribute | Value |
|-----------|-------|
| Type | Enum |
| Allowed values | `primary` · `secondary` · `context_dependent` · `manual_review` |
| Source | §7 `alignment` / §8 field 8 |
| Required | **Yes** |
| Notes | Drives SLA and first-response logic. Never override without logging the reason. |
| CRM migration | Maps to: Lead Score / Fit Rating |

---

#### `service_category`
| Attribute | Value |
|-----------|-------|
| Type | String (human label of MAOI) |
| Allowed values | `Teacher Training` · `School Licensing` · `Curriculum Review` · `Academic Consulting` · `Institutional Partnerships` · `Digital Reasoning Engine` |
| Source | Derived from `maoi` — use the human label from `MAOI_LABELS` in the CRM mapper |
| Required | **Yes** |
| Notes | Human-readable version of `maoi`. Redundant with `maoi` but useful for display and filtering in non-technical tracker tools. |
| CRM migration | Maps to: Product Line / Service Type |

---

#### `pricing_range_summary`
| Attribute | Value |
|-----------|-------|
| Type | String |
| Source | §7 `pricing_band` / §8 field 9 |
| Required | **Yes** |
| Example | `$2,500–$21,000/year (by school size and tier)` |
| Notes | From the service catalogue. Do not modify — this is the system-generated range. Actual proposal pricing may differ based on scoping. |
| CRM migration | Maps to: Deal Value (range) / Pricing Tier |

---

#### `recommended_next_step`
| Attribute | Value |
|-----------|-------|
| Type | String |
| Source | §7 `next_step` (the CTA from the CRM mapper) |
| Required | **Yes** |
| Notes | System-generated recommended action based on buyer type. Read this at triage — it is the starting point for the first outbound contact. |
| CRM migration | Maps to: Next Action / CTA |

---

### Group B — Operator-Entered Fields
*Set by the operator during triage, follow-up, and outcome recording.*

---

#### `lead_status`
| Attribute | Value |
|-----------|-------|
| Type | Enum |
| Allowed values | `New` · `Reviewed` · `Access Sent` · `Awaiting Discovery Call` · `Qualified` · `Proposal Pending` · `Closed Won` · `Closed Lost` · `On Hold` |
| Default | `New` |
| Required | **Yes** |
| Notes | Update at every pipeline transition. The status column is the heartbeat of the tracker — if it is stale, the tracker is unreliable. See `JE-Status-Transition-Rules.md` for permitted transitions. |
| CRM migration | Maps to: Deal Stage / Pipeline Stage |

---

#### `owner`
| Attribute | Value |
|-----------|-------|
| Type | String (name or initials) |
| Required | **Yes** |
| Default | Operator who performed triage |
| Notes | The person responsible for this lead. In a solo operation, this is always the same person. In a team, this is the assigned operator. Reassignment must be logged in Notes with a date. |
| CRM migration | Maps to: Owner / Assigned To |

---

#### `last_contacted_at`
| Attribute | Value |
|-----------|-------|
| Type | Date |
| Required | **Yes** (update after every outbound contact) |
| Format | `YYYY-MM-DD` |
| Notes | Every time an email or call is made, update this field. Used for SLA monitoring, follow-up sequencing, and lead aging. A stale `last_contacted_at` on an active lead is a red flag. |
| CRM migration | Maps to: Last Activity Date |

---

#### `discovery_call_date`
| Attribute | Value |
|-----------|-------|
| Type | Date |
| Required | Optional (required when status reaches `Awaiting Discovery Call` or `Qualified`) |
| Format | `YYYY-MM-DD` (add time if useful: `YYYY-MM-DD HH:MM`) |
| Notes | Date the call was held (not booked). Leave blank until the call is completed. If the call was a no-show, log in Notes; do not set this date until a call is successfully held. |
| CRM migration | Maps to: Discovery Call Date / Activity Date |

---

#### `proposal_sent_at`
| Attribute | Value |
|-----------|-------|
| Type | Date |
| Required | Optional (required when status = `Proposal Pending`) |
| Format | `YYYY-MM-DD` |
| Notes | Date the proposal or scoping report was sent. Used to anchor the Day 5 / Day 14 / Day 28 follow-up sequence. |
| CRM migration | Maps to: Proposal Date / Quote Sent Date |

---

#### `outcome`
| Attribute | Value |
|-----------|-------|
| Type | String (structured) |
| Required | Optional (required when status = `Closed Won`, `Closed Lost`, or `On Hold`) |
| Format | `[Won/Lost/Hold] — [brief reason]` |
| Examples | `Won — Full School Licence signed March 2026` · `Lost — Budget not available this cycle` · `Hold — Board approval pending; review April 2026` |
| Notes | Required on any terminal or hold status. Keep it to one line. The detail goes in Notes. |
| CRM migration | Maps to: Close Reason / Deal Outcome |

---

#### `notes`
| Attribute | Value |
|-----------|-------|
| Type | Free text (append-only log) |
| Required | Optional (but strongly recommended on every active lead) |
| Format | Append entries with date prefix: `[2026-03-26] Access link sent. Replied same day, interested in Discovery Call.` |
| Notes | The running log of all activity on this lead. Every outbound contact, every inbound reply, every status change reason, every Discovery Call summary, every reclassification note goes here. Never overwrite — always append. |
| CRM migration | Maps to: Notes / Activity Log / Timeline |

---

## 3. Required vs Optional Fields

### Required at Entry (New → Reviewed)

All Group A fields must be populated at triage. They come directly from the intake email.

| Field | Source | Editable later? |
|-------|--------|-----------------|
| `registration_id` | §7 intake | No |
| `submitted_at` | §7 intake | No |
| `full_name` | §2 intake | No |
| `work_email` | §2 intake | No |
| `organisation` | §2 intake | No |
| `buyer_type` | §7 intake | Yes (if reclassified — log change) |
| `maoi` | §7 intake | Yes (if scope shifts — log change) |
| `alignment_status` | §7 intake | No |
| `service_category` | Derived from `maoi` | Yes (if MAOI updates) |
| `pricing_range_summary` | §7 intake | No |
| `recommended_next_step` | §7 intake | No |
| `lead_status` | System default (`New`) → operator (`Reviewed`) | Yes — update at every transition |
| `owner` | Operator | Yes (log reassignment) |

### Required at Specific Stages

| Field | Required when |
|-------|---------------|
| `last_contacted_at` | Every time outbound contact is made |
| `discovery_call_date` | Status = `Awaiting Discovery Call` (set when call is booked; confirm date when held) |
| `proposal_sent_at` | Status = `Proposal Pending` |
| `outcome` | Status = `Closed Won`, `Closed Lost`, or `On Hold` |

### Always Optional

| Field | Notes |
|-------|-------|
| `notes` | Optional but strongly recommended — it is the audit trail |

---

## 4. Implementation Notes by Platform

### Google Sheets / Excel
- Use data validation dropdowns for all Enum fields
- Lock columns 1–11 (Group A) with a permission note after triage — operators should not be editing system-sourced fields after entry
- Freeze row 1 (headers) and column 1 (`registration_id`) for easy navigation
- Apply conditional formatting: colour `lead_status` column by value (green = Won, red = Lost, amber = On Hold, blue = active)
- Recommended: one sheet per year; archive quarterly

### Notion
- Create a database with the 18 properties above
- Use Select for all Enum fields
- Use Date for date fields
- Use Text for free-text fields
- Use the `registration_id` as the page title (it is unique and sortable)
- Add a `board_view` grouped by `lead_status` for pipeline visibility
- Add a `timeline_view` using `submitted_at` + `proposal_sent_at`

### Airtable
- Create a base with a single `Leads` table using the schema above
- Use Single Select fields for all Enum fields
- Use Date fields for all date fields
- Use a Long Text field for `notes`
- Link to a `Templates` table for the operator template pack
- Create a `Pipeline` view (grouped by `lead_status`, sorted by `submitted_at`)
- Create an `At Risk` view (filtered: status = active AND `last_contacted_at` > SLA threshold)

### CRM Migration
All Group A fields map cleanly to standard CRM objects. The key mapping decisions:
- `registration_id` → Record ID or custom unique identifier
- `buyer_type` + `maoi` → Contact Type + Product/Service Interest
- `alignment_status` → Lead Score or Fit Rating
- `lead_status` → Deal Stage (configure pipeline to match the 9 stages exactly)
- `notes` → Activity Log / Timeline (import as a single entry; future activity logged natively)

---

*Last updated: 26 March 2026 · Maintained by: Jay Adams / World Wise Learning*
