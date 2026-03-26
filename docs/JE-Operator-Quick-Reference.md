# Jurassic English — Operator Quick Reference
**Internal use only · Jurassic English / World Wise Learning · March 2026**

---

## SECTION A — One-Page Cheat Sheet

*Print this section or keep it open during triage. Everything you need without opening another doc.*

---

### SLA Grid — First Response by Alignment

| Alignment (§7) | Respond within | First action |
|----------------|---------------|--------------|
| `primary` | Same day / next business day | Send access link + invite Discovery Call |
| `secondary` | 2 business days | Send access link; mention primary offering |
| `context_dependent` | 3 business days | Send qualifying question first |
| `manual_review` | STOP — do not contact | Escalate to senior team |

---

### Triage Decision — 60-Second Flow

```
1. Is alignment = manual_review?       → YES: On Hold + escalate. STOP.
2. Are contact details verifiable?     → NO:  On Hold. Verify email. STOP.
3. Is alignment = context_dependent?   → YES: Send qualifying question (T1). Wait for reply.
4. Does pricing match org size?        → NO:  Note mismatch. Still approve but flag in call prep.
5. All clear?                          → APPROVE: Generate access link → send T2.
```

---

### Status → Template Index

| Status transition | Template to use |
|-------------------|----------------|
| Reviewed (context_dependent) → hold for reply | T1 — Qualifying question |
| Reviewed → Access Sent | T2 — Access link sent |
| Any → Awaiting Discovery Call (booking) | T3 — Discovery Call invitation |
| Awaiting Discovery Call → Qualified | T4 — Post-call follow-up |
| Qualified → Proposal Pending | T5 — Proposal sent |
| No-show attempt 1 (day of) | T6a — Missed you today |
| No-show attempt 2 (day 3) | T6b — Rescheduling |
| No-show attempt 3 (day 10) | T6c — Leaving the door open |
| Any → On Hold (with lead's knowledge) | T7 — Hold / defer |
| Proposal Pending → Closed Lost | T8 — Close-lost closeout |

---

### Follow-Up Cadences

**After access link sent:**

| Day | Action |
|-----|--------|
| 0 | Link sent |
| 4 | Check-in: "Did the briefing come through?" |
| 7 | Link expires — offer renewal if engaged |
| 10 | Final follow-up → On Hold if no response |

**After proposal sent:**

| Day | Action |
|-----|--------|
| 0 | Proposal sent |
| 5 | "Happy to answer any questions" |
| 14 | Offer a walk-through call |
| 28 | Final follow-up → Closed Lost if no response |

**On Hold re-engagement:**

| Interval | Action |
|----------|--------|
| Every 30 days | Attempt contact. Log in Notes. |
| 90 days no response | → Closed Lost |

---

### Qualification Gate — All 6 Must Be Yes

```
[ ] 1. Org type and size confirmed
[ ] 2. Primary MAOI / service understood by the lead
[ ] 3. Decision authority confirmed (or path to it)
[ ] 4. Timeline is realistic (this year or next)
[ ] 5. Pricing range acknowledged — not disqualified on cost
[ ] 6. Agreed next step with a specific date
```
If any = NO → stay at `Awaiting Discovery Call` or → `On Hold`. Do not issue a proposal.

---

### Key Permitted Transitions (summary)

```
New          → Reviewed (triage complete)
Reviewed     → Access Sent / Awaiting DC / On Hold
Access Sent  → Awaiting DC / Qualified* / On Hold
Awaiting DC  → Qualified / On Hold
Qualified    → Proposal Pending / On Hold
Proposal     → Closed Won / Closed Lost / On Hold
On Hold      → any active stage (re-engaged) / Closed Lost (90-day rule)
```
*`Access Sent → Qualified` only if all 6 criteria met via async exchange — rare.*

**Never skip Qualified before issuing a proposal.**
**Never skip Reviewed before contacting a lead.**

---

### Tracker — What to Update, When

| Action | Fields to update |
|--------|-----------------|
| Every triage | `lead_status`, `owner`, Notes |
| Every outbound contact | `last_contacted_at`, Notes |
| Access link sent | `lead_status` → Access Sent, Notes |
| Call booked | `lead_status` → Awaiting DC, `discovery_call_date`, Notes |
| Call held | `discovery_call_date` (confirm), Notes (call summary) |
| Qualified | `lead_status` → Qualified, Notes (qual criteria) |
| Proposal sent | `lead_status` → Proposal Pending, `proposal_sent_at`, Notes |
| Closed | `lead_status`, `outcome`, Notes |
| On Hold | `lead_status`, `outcome` (reason + re-engagement date), Notes |
| Reclassification | `buyer_type` + `maoi` updated, Notes (`[date] Reclassified: X → Y`) |

---

## SECTION B — Stage-Based Template Index (Detailed)

---

### T1 — Qualifying Question (Context-Dependent leads)

**When**: Alignment = `context_dependent`. Send before access link.
**Status after send**: Stays at `Reviewed` — do not advance until reply received.
**Subject**: `Your Jurassic English enquiry — a quick question before we proceed`
**Key rule**: One question only. Frame it as helping them.
**If no reply in 5 days**: One follow-up. If no reply in 10 days total: `On Hold`.
**Full template**: `JE-Operator-Template-Pack.md` → Template 1

---

### T2 — Access Link Sent

**When**: Decision = Approve. Access link generated via API.
**Status after send**: `Reviewed` → `Access Sent`
**Subject**: `Jurassic English — your Plans & Pricing access`
**Key rule**: Replace `[ACCESS_URL]` with the signed URL. Replace `[your school/team/organisation]` to match buyer type.
**API call**: `POST /api/generate-pricing-access-link` with `email` + `ref` (registration_id)
**Full template**: `JE-Operator-Template-Pack.md` → Template 2

---

### T3 — Discovery Call Invitation

**When**: Lead has replied / accepted; or proactively booking for school_admin or institutional_partner leads.
**Status after confirmed booking**: → `Awaiting Discovery Call`
**Subject**: `Jurassic English — scheduling our Discovery Call`
**Key rule**: Always offer 2–3 specific times. Always state time zone.
**After booking**: Send calendar invite — subject: `Jurassic English — Discovery Call with [Name], [Org]`
**Full template**: `JE-Operator-Template-Pack.md` → Template 3

---

### T4 — Discovery Call Follow-Up

**When**: Discovery Call held. Lead qualified (all 6 criteria met).
**Status after send**: `Awaiting Discovery Call` → `Qualified`
**Subject**: `Following our conversation — Jurassic English next steps`
**Key rule**: One clear sentence for the next step. Send same day or next morning.
**Full template**: `JE-Operator-Template-Pack.md` → Template 4

---

### T5 — Proposal Sent

**When**: Lead is at `Qualified`. Proposal prepared. Ready to send.
**Status after send**: `Qualified` → `Proposal Pending`
**Subject**: `Jurassic English — proposal for [Organisation Name]`
**Key rule**: Attach proposal as PDF. List 2–3 highlights in the email body only.
**After send**: Set Day 5, Day 14, Day 28 follow-up reminders.
**Full template**: `JE-Operator-Template-Pack.md` → Template 5

---

### T6a / T6b / T6c — No-Show Follow-Up

**When**: Lead missed the Discovery Call.
**T6a**: Day of no-show — reschedule offer with 2 times
**T6b**: Day 3 — second reschedule offer
**T6c**: Day 10 — final, gracious close of the reschedule sequence → `On Hold`
**Subject**: a) `Jurassic English — missed you today` b) `Jurassic English — rescheduling our call` c) `Jurassic English — leaving the door open`
**Full templates**: `JE-Operator-Template-Pack.md` → Template 6

---

### T7 — Hold / Defer

**When**: Lead pauses decision; you are placing on hold with their knowledge.
**Status after send**: → `On Hold`
**Subject**: `Jurassic English — picking this up [timeframe]`
**Key rule**: Match their language. Set a specific re-engagement date in the email and in the tracker.
**Full template**: `JE-Operator-Template-Pack.md` → Template 7

---

### T8 — Close-Lost Closeout

**When**: Explicit decline; or no response after Day 28 post-proposal; or confirmed not proceeding.
**Status after send**: → `Closed Lost`
**Subject**: `Jurassic English — closing our conversation for now`
**Key rule**: Brief, gracious, no hard sell. Do not send if lead never engaged — just update tracker.
**Full template**: `JE-Operator-Template-Pack.md` → Template 8

---

## SECTION C — Naming Conventions

### Email Subject Lines

Use these exact formats for consistency and searchability:

| Context | Format |
|---------|--------|
| Qualifying question | `Jurassic English — [a quick question / next steps]` |
| Access link | `Jurassic English — your Plans & Pricing access` |
| Discovery Call invite | `Jurassic English — scheduling our Discovery Call` |
| Discovery Call confirm | `Jurassic English — Discovery Call with [Name], [Org]` (calendar invite) |
| Post-call | `Following our conversation — Jurassic English next steps` |
| Proposal | `Jurassic English — proposal for [Organisation Name]` |
| No-show | `Jurassic English — missed you today / rescheduling / leaving the door open` |
| Hold | `Jurassic English — picking this up [timeframe]` |
| Close | `Jurassic English — closing our conversation for now` |

### File Naming — Proposals

```
JE-Proposal-[ORG]-[MAOI-CODE]-[YYYY-MM].pdf

Examples:
JE-Proposal-WesthavenAcademy-SLI-2026-03.pdf
JE-Proposal-HazelwoodIntl-TRT-2026-03.pdf
JE-Proposal-MeridianInstitute-IPP-2026-04.pdf
```

### Tracker Notes Format

Always append — never overwrite. Format: `[YYYY-MM-DD] [action]. [outcome or next step].`

```
[2026-03-26] Triage complete. Approved — Primary alignment. Access link sent.
[2026-03-30] Replied — requested Discovery Call. Booked 2026-04-03.
[2026-04-03] Call held. 420 students, Yrs 7–11. Full School Licence. All 6 qual criteria met. Proposal by 2026-04-08.
[2026-04-08] Proposal sent — Full School Licence, Foundation/151–400, $3,500/yr. Day 5 reminder set.
[2026-04-13] Day 5 follow-up sent.
```

---

## SECTION D — Buyer-Type Quick-Action Reference

### `school_admin` — School Administrator
- **SLA**: Same day / next business day
- **First action**: Access link (T2) + Discovery Call invite (T3) in same email or back-to-back
- **Key scoping variable**: Student count → determines licence tier
- **Default path**: Access Sent → Call → RAA → Proposal
- **Qualifying doc**: `JE-Discovery-Call-Guide.md §4 school_admin`

### `teacher_cpd_lead` — Teacher / CPD Lead
- **SLA**: 2 business days
- **First action**: Access link (T2); Discovery Call optional unless group training
- **Key scoping variable**: Group size (individual vs. 8+ teachers) and accreditation need
- **Note**: If school unlicensed → parallel school_admin referral
- **Qualifying doc**: `JE-Discovery-Call-Guide.md §4 teacher_cpd_lead`

### `institutional_partner` — Institutional Partner
- **SLA**: Same day / next business day
- **First action**: Skip access link → go straight to Discovery Call invite (T3)
- **Key scoping variable**: Distribution vs. co-delivery vs. network licensing; network size
- **Note**: Post-call → Partnership Scoping Consultation (separate session)
- **Qualifying doc**: `JE-Discovery-Call-Guide.md §4 institutional_partner`

### `parent_guardian` — Parent / Guardian
- **SLA**: 2 business days
- **First action**: Qualifying question — is school already licensed?
- **Key routing decision**: Licensed school → refer to coordinator | Unlicensed → school referral or DRE standalone
- **Note**: Not a commercial proposal lead. Routing conversation only.
- **Qualifying doc**: `JE-Discovery-Call-Guide.md §4 parent_guardian`

### `other` — Other / General Enquiry
- **SLA**: 3 business days
- **First action**: Qualifying question to reclassify (T1 adapted)
- **Key step**: Reclassify before any further action
- **Note**: Do not issue a proposal until buyer type is confirmed
- **Qualifying doc**: `JE-Discovery-Call-Guide.md §4 other`

---

## SECTION E — Red Flags (Pause and Check)

Stop and verify before proceeding if any of these are present:

```
⚠  alignment_status = manual_review          → Do not contact. Escalate.
⚠  Email domain is a free/disposable domain  → Verify before sending access link
⚠  Lead cannot name an organisation          → Qualifying question first
⚠  Lead is clearly not the decision-maker    → On Hold until path to DM established
⚠  Pricing range far exceeds stated budget   → Note; discuss on call; do not push
⚠  Timeline is 2+ years out                 → On Hold with 6–12 month re-engage date
⚠  Access link requested for forwarding      → Decline; explain single-use policy
⚠  Proposal requested before Discovery Call  → Decline; explain qualification process
```

---

*Last updated: 26 March 2026 · Maintained by: Jay Adams / World Wise Learning*
*Full templates: `docs/JE-Operator-Template-Pack.md`*
*Full workflow: `docs/JE-Sales-Workflow.md`*
*Discovery Call guide: `docs/JE-Discovery-Call-Guide.md`*
