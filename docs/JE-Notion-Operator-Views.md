# Jurassic English — Notion Operator Views
**Internal use only · Jurassic English / World Wise Learning · March 2026**

---

## Overview

This document defines the recommended views for the JE Leads Notion database. Each view is designed for a specific operational purpose — triage, pipeline management, reporting, or owner-specific work. Configure these views once; they update automatically as lead records are created and modified.

All views are created within the same `JE Leads` database. Views do not duplicate data — they are filters and display configurations over the same records.

---

## View 1 — New Leads (Daily Triage)

**Purpose**: See every lead that has just arrived and needs triage. This is the view you open first each morning.

**Type**: Table (Grid)

**Filter**:
- `Lead Status` is `New`

**Sort**:
- `Submitted At` — Ascending (oldest first — act on the most overdue leads first)

**Visible properties**:
`Registration ID` · `Submitted At` · `Full Name` · `Organisation` · `Buyer Type` · `Alignment Status` · `Recommended Next Step`

**Operational notes**:
- This view should be empty by end of each business day
- If you see `Alignment Status` = `manual_review`, do not contact the lead — escalate immediately
- Click into a record to see the full §8 payload before making the triage decision

---

## View 2 — Reviewed (Pending First Action)

**Purpose**: Leads that have been triaged but not yet acted on — access link not yet sent, call not yet booked.

**Type**: Table (Grid)

**Filter**:
- `Lead Status` is `Reviewed`

**Sort**:
- `Submitted At` — Ascending

**Visible properties**:
`Registration ID` · `Submitted At` · `Full Name` · `Organisation` · `Buyer Type` · `Alignment Status` · `Owner`

**Operational notes**:
- Leads should spend minimal time here — same day or next day action depending on alignment
- A growing Reviewed count is a signal that first-response SLA is slipping

---

## View 3 — Awaiting Discovery Call

**Purpose**: Leads where a call has been booked but not yet held.

**Type**: Table (Grid)

**Filter**:
- `Lead Status` is `Awaiting Discovery Call`

**Sort**:
- `Discovery Call Date` — Ascending (soonest call first)

**Visible properties**:
`Registration ID` · `Full Name` · `Organisation` · `Buyer Type` · `Main Area of Interest` · `Discovery Call Date` · `Owner`

**Operational notes**:
- Use this view for pre-call prep — click into each record before the scheduled call
- If `Discovery Call Date` is blank, the call has been booked but the date not logged — update it
- Cross-reference with `JE-Discovery-Call-Guide.md` before each call

---

## View 4 — Access Sent (Awaiting Engagement)

**Purpose**: Leads who have received the access link but have not yet moved to a Discovery Call.

**Type**: Table (Grid)

**Filter**:
- `Lead Status` is `Access Sent`

**Sort**:
- `Last Contacted` — Ascending (longest without follow-up first)

**Visible properties**:
`Registration ID` · `Full Name` · `Organisation` · `Buyer Type` · `Last Contacted` · `Owner` · `Notes`

**Operational notes**:
- Leads should move from this view within 10 business days
- If `Last Contacted` is 4+ days ago — Day 4 check-in is due
- If `Last Contacted` is 10+ days ago — move to On Hold; log reason

---

## View 5 — Qualified (Proposal Ready)

**Purpose**: Leads who have passed the 6-point qualification gate and are ready to receive a proposal.

**Type**: Table (Grid)

**Filter**:
- `Lead Status` is `Qualified`

**Sort**:
- `Discovery Call Date` — Ascending (call happened longest ago — proposal is most overdue)

**Visible properties**:
`Registration ID` · `Full Name` · `Organisation` · `Buyer Type` · `Main Area of Interest` · `Pricing Range Summary` · `Discovery Call Date` · `Owner`

**Operational notes**:
- Proposals should be sent within 5 business days of qualification
- Use `Pricing Range Summary` and `Main Area of Interest` to prepare the proposal
- Reference `JE-Sales-Workflow.md §9` for proposal components by MAOI

---

## View 6 — Proposal Pending

**Purpose**: Leads where a proposal has been sent and a decision is awaited.

**Type**: Table (Grid)

**Filter**:
- `Lead Status` is `Proposal Pending`

**Sort**:
- `Proposal Sent` — Ascending (oldest proposals first — most in need of follow-up)

**Visible properties**:
`Registration ID` · `Full Name` · `Organisation` · `Buyer Type` · `Proposal Sent` · `Last Contacted` · `Owner` · `Notes`

**Operational notes**:
- Day 5: follow-up if no reply (check `Last Contacted` vs. `Proposal Sent`)
- Day 14: second follow-up
- Day 28: final follow-up → Closed Lost if no response
- If `Proposal Sent` is blank — proposal was not logged; update it

---

## View 7 — Closed Won

**Purpose**: All won leads — historical record and reference for onboarding.

**Type**: Table (Grid)

**Filter**:
- `Lead Status` is `Closed Won`

**Sort**:
- `Submitted At` — Descending (most recent wins first)

**Visible properties**:
`Registration ID` · `Full Name` · `Organisation` · `Buyer Type` · `Main Area of Interest` · `Pricing Range Summary` · `Outcome` · `Owner`

**Operational notes**:
- Do not edit records in this view — they are the permanent archive
- Use for onboarding handoff reference
- Review quarterly: compare `Pricing Range Summary` vs. actual deal size (logged in `Outcome`)

---

## View 8 — Closed Lost

**Purpose**: All lost leads — pattern analysis and re-engagement source.

**Type**: Table (Grid)

**Filter**:
- `Lead Status` is `Closed Lost`

**Sort**:
- `Submitted At` — Descending

**Visible properties**:
`Registration ID` · `Full Name` · `Organisation` · `Buyer Type` · `Alignment Status` · `Outcome` · `Last Contacted`

**Operational notes**:
- Review quarterly — group by `Outcome` reason to identify patterns
- If a lost lead re-engages, create a new record and cross-reference in Notes
- Look for `Alignment Status` = `manual_review` patterns — are they overrepresented in Closed Lost?

---

## View 9 — On Hold

**Purpose**: Paused leads requiring periodic re-engagement checks.

**Type**: Table (Grid)

**Filter**:
- `Lead Status` is `On Hold`

**Sort**:
- `Last Contacted` — Ascending (longest without contact first — most overdue for check)

**Visible properties**:
`Registration ID` · `Full Name` · `Organisation` · `Buyer Type` · `Last Contacted` · `Outcome` · `Owner`

**Operational notes**:
- Check every 30 days — the `Last Contacted` sort surfaces the most overdue leads
- `Outcome` should contain the hold reason and re-engagement date
- After 90 days without response to re-engagement attempts → `Closed Lost`

---

## View 10 — Pipeline Board (Kanban)

**Purpose**: Full pipeline overview in a board format — the go-to view for weekly review.

**Type**: Board (Kanban)

**Group by**: `Lead Status`

**Card display properties**: `Full Name` · `Organisation` · `Buyer Type` · `Alignment Status`

**Sort within columns**: `Submitted At` — Ascending

**Hidden columns**: `Closed Won` · `Closed Lost` (collapse or hide to keep the board focused on active pipeline)

**Operational notes**:
- Use this view for the Monday weekly review
- Count of cards per column is the pipeline snapshot
- Drag cards between columns to update `Lead Status` (does not auto-update other fields — remember to update `Last Contacted` and `Notes` in the record)

---

## View 11 — By Buyer Type

**Purpose**: See all leads grouped by buyer type — useful for identifying which BT is most active and whether routing is correct.

**Type**: Board (Kanban)

**Group by**: `Buyer Type`

**Sort within groups**: `Submitted At` — Descending

**Filter**: None (show all active + closed)

**Operational notes**:
- Use quarterly to see which buyer types are converting vs. stalling
- If `other` is a large group, qualifying questions may need to be sent faster

---

## View 12 — By MAOI (Service Interest)

**Purpose**: See all leads grouped by main area of interest — useful for service capacity planning and proposal prioritisation.

**Type**: Board (Kanban)

**Group by**: `Main Area of Interest`

**Sort within groups**: `Lead Status` — Ascending (active stages first)

**Filter**: Exclude `Closed Won` and `Closed Lost` (active pipeline only)

**Operational notes**:
- Useful when preparing multiple proposals of the same type
- If `school_licensing` is heavily loaded, prioritise those proposals to avoid SLA drift

---

## View 13 — High Priority (Primary + Admin Leads)

**Purpose**: Surface the highest-priority active leads — Primary alignment and school_admin buyer type — in one focused view.

**Type**: Table (Grid)

**Filter** (all conditions must be true):
- `Lead Status` is not `Closed Won`
- `Lead Status` is not `Closed Lost`
- `Lead Status` is not `On Hold`
- `Alignment Status` is `primary`
- `Buyer Type` is `school_admin` OR `institutional_partner`

**Sort**:
- `Submitted At` — Ascending (oldest active primary leads first)

**Visible properties**:
`Registration ID` · `Full Name` · `Organisation` · `Lead Status` · `Last Contacted` · `Recommended Next Step` · `Owner`

**Operational notes**:
- This is the highest-SLA view — same day / next business day response required
- Any lead appearing here that was submitted yesterday or earlier is a SLA flag

---

## View 14 — Owner View

**Purpose**: Filter the pipeline to a single operator's assigned leads.

**Type**: Table (Grid)

**Filter**:
- `Owner` contains `[operator name or initials]`
- `Lead Status` is not `Closed Won`
- `Lead Status` is not `Closed Lost`

**Sort**:
- `Last Contacted` — Ascending (longest without contact first)

**Note**: Create one of these per operator. In a solo operation, this is identical to the active pipeline view. In a multi-operator team, each person creates their own version filtered to their name.

---

## View 15 — Aging View

**Purpose**: Identify leads that have been in their current stage too long relative to SLA targets.

**Type**: Table (Grid)

**Filter**:
- `Lead Status` is not `Closed Won`
- `Lead Status` is not `Closed Lost`
- `Lead Status` is not `New`
- `Lead Status` is not `On Hold`

**Sort**:
- `Last Contacted` — Ascending (longest without any contact — highest aging risk)

**Visible properties**:
`Registration ID` · `Full Name` · `Lead Status` · `Submitted At` · `Last Contacted` · `Alignment Status` · `Owner`

**How to use**:
Manually compare `Last Contacted` to today against the SLA targets from `JE-Sales-Workflow.md §4`:

| Stage | Max days since last contact |
|-------|-----------------------------|
| Access Sent | 4 (Day 4 check-in due) / 10 (move to On Hold) |
| Awaiting Discovery Call | 10 from booking |
| Qualified | 5 (proposal due) |
| Proposal Pending | 5 / 14 / 28 (follow-up sequence) |

Highlight any record where `Last Contacted` exceeds the threshold for its stage.

**Note**: Notion does not natively compute `days since last contact` without formulas. Add a formula property `Days Since Contact` = `dateBetween(now(), prop("Last Contacted"), "days")` to automate the aging calculation.

---

## Recommended Formula Properties

Add these to the JE Leads database for inline SLA visibility:

**`Days Since Contact`** (Number formula):
```
dateBetween(now(), prop("Last Contacted"), "days")
```

**`Days Since Submission`** (Number formula):
```
dateBetween(now(), prop("Submitted At"), "days")
```

**`SLA Flag`** (Checkbox formula — true = overdue):
```
and(
  not(prop("Lead Status") == "Closed Won"),
  not(prop("Lead Status") == "Closed Lost"),
  not(prop("Lead Status") == "On Hold"),
  or(
    and(prop("Lead Status") == "New",                    prop("Days Since Submission") >= 1),
    and(prop("Lead Status") == "Qualified",              prop("Days Since Contact") >= 5),
    and(prop("Lead Status") == "Proposal Pending",       prop("Days Since Contact") >= 5)
  )
)
```

Use `SLA Flag` as a conditional highlight or add it as a visible column in the Aging view.

---

*Last updated: 26 March 2026 · Maintained by: Jay Adams / World Wise Learning*
