# Jurassic English — Sales Workflow Integration
**Internal use only · Jurassic English / World Wise Learning · March 2026**

---

## 1. Pipeline Overview

Every inbound lead moves through a defined pipeline from intake to close. The pipeline is linear by default; deviation points are noted where branching occurs.

```
[Form Submitted]
      │
      ▼
  ┌─────────┐
  │   New   │  ← Intake email arrives at info@jurassicenglish.com
  └────┬────┘
       │  Triage checklist complete (SOP §5)
       ▼
  ┌──────────┐
  │ Reviewed │  ← Lead logged in tracker; decision made
  └────┬─────┘
       │
       ├─── Approve ──────────────────────────────┐
       │                                          │
       ▼                                          ▼
┌─────────────┐                        ┌──────────────────────────┐
│ Access Sent │                        │ Awaiting Discovery Call  │
│ (link sent) │                        │  (call booked, not held) │
└──────┬──────┘                        └────────────┬─────────────┘
       │                                            │
       │  Lead engages / responds                   │  Call held; fit confirmed
       └─────────────┬──────────────────────────────┘
                     │
                     ▼
               ┌───────────┐
               │ Qualified │  ← Org confirmed; scope understood
               └─────┬─────┘
                     │  Proposal issued
                     ▼
           ┌──────────────────┐
           │ Proposal Pending │  ← Awaiting decision from lead
           └────────┬─────────┘
                    │
          ┌─────────┼──────────┐
          ▼         ▼          ▼
    ┌──────────┐ ┌─────────┐ ┌─────────┐
    │ Closed   │ │ Closed  │ │  On     │
    │  Won     │ │  Lost   │ │  Hold   │
    └──────────┘ └─────────┘ └─────────┘
```

**Hold path also exists at Reviewed:**
- Manual Review alignment → On Hold until escalated
- Incomplete or unverifiable contact details → On Hold pending verification

---

## 2. Lead Status Definitions

| Status | Meaning | Who sets it |
|--------|---------|-------------|
| `New` | Intake email received; not yet reviewed | System (automatic) |
| `Reviewed` | Operator has completed triage checklist; decision recorded | Operator |
| `Access Sent` | Gated pricing access link generated and emailed | Operator |
| `Awaiting Discovery Call` | Call booked in calendar; not yet held | Operator |
| `Qualified` | Discovery Call held; org confirmed fit; scope understood | Operator post-call |
| `Proposal Pending` | Formal proposal or agreement draft issued; awaiting response | Operator |
| `Closed Won` | Agreement signed / purchase confirmed | Operator |
| `Closed Lost` | Lead declined or disengaged after proposal | Operator |
| `On Hold` | Paused — needs follow-up, escalation, or lead re-engagement | Operator |

**Notes:**
- `New` is the only status set by the system automatically; all others require manual operator action.
- `On Hold` is not a terminal status — leads may be re-activated to any stage.
- `Closed Lost` leads should be retained in the tracker with a reason note; they may re-engage later.

---

## 3. Lead Movement Rules

### Permitted Transitions

| From | To | Trigger |
|------|----|---------|
| New | Reviewed | Triage checklist complete |
| Reviewed | Access Sent | Approved; access link generated and sent |
| Reviewed | Awaiting Discovery Call | Approved; call booked before access link |
| Reviewed | On Hold | Manual Review alignment, or details unverifiable |
| Access Sent | Awaiting Discovery Call | Lead responds and requests / accepts call |
| Access Sent | Qualified | Lead confirms fit and scope without needing a call |
| Access Sent | On Hold | No response after follow-up sequence complete |
| Awaiting Discovery Call | Qualified | Call held; fit confirmed |
| Awaiting Discovery Call | On Hold | Call no-show or rescheduled twice |
| Qualified | Proposal Pending | Proposal or scoping report issued |
| Proposal Pending | Closed Won | Signed / payment confirmed |
| Proposal Pending | Closed Lost | Lead declines or goes silent after 3 follow-ups |
| Proposal Pending | On Hold | Lead pauses decision — expected to re-engage |
| On Hold | Any active status | Lead re-engages or escalation resolved |

### Blocked Transitions

- `New → Qualified` — must be reviewed first
- `New → Closed *` — no direct closure from intake
- `Reviewed → Qualified` — qualification requires a Discovery Call or equivalent engagement
- `Closed Won → any status` — won leads exit the pipeline; a new intake creates a new record

---

## 4. Response SLAs by Alignment

The alignment classification from §7 of the intake email sets the response urgency.

| Alignment | Response Window | First Action |
|-----------|----------------|--------------|
| **Primary** | Same day or next business day | Send access link + invite Discovery Call |
| **Secondary** | Within 2 business days | Send access link; note primary offering in email |
| **Context-Dependent** | Within 3 business days | Send qualifying question(s) first; access link follows reply |
| **Manual Review** | Pause — do not respond | Escalate to senior team member before any outbound contact |

**Follow-up sequence after access link sent:**

| Day | Action |
|-----|--------|
| Day 0 | Access link sent |
| Day 4 | Light check-in if no reply ("Did you get a chance to review the briefing?") |
| Day 7 | Link expires — offer renewal if lead engaged but hasn't responded |
| Day 10 | Final follow-up — if no response, move to On Hold |
| Day 30 | Optional re-engagement touchpoint ("Checking back in — is this still a priority?") |

---

## 5. Inbox-to-Tracker Workflow

### The Daily Pattern

When a new intake email arrives at `info@jurassicenglish.com`:

```
1. Open email — check §1 Registration ID and lead_status = "new"
2. Run triage checklist (SOP §5):
   - §2: Verify contact details
   - §3: Read alignment
   - §4: Check pricing match vs. org size
   - §5: Read recommended next step
   - §6: Note any free-text message
3. Add row to Lead Tracker (see Section 6 below)
4. Copy §8 Structured Record into CRM
5. Make decision: Approve / Hold / Manual Review / Decline
6. Take action within SLA window
7. Update tracker row with status and action taken
```

### Lightweight Lead Tracker

Use a shared spreadsheet (Google Sheets or equivalent) with the following columns. The §8 Structured Record maps directly to the first 12 columns.

| # | Column | Source | Notes |
|---|--------|--------|-------|
| 1 | Registration ID | §7 `registration_id` | Primary key |
| 2 | Full Name | §2 | |
| 3 | Work Email | §2 | |
| 4 | Role / Title | §2 | |
| 5 | Organisation | §2 | |
| 6 | Country / Region | §2 | |
| 7 | Buyer Type | §7 `buyer_type` | Use canonical key |
| 8 | MAOI | §7 `maoi` | Use canonical key |
| 9 | Alignment | §7 `alignment` | primary / secondary / etc. |
| 10 | Pricing Band | §7 `pricing_band` | From service catalogue |
| 11 | Lead Status | §7 → update manually | See Section 2 |
| 12 | Submitted At | §7 `submitted_at` | ISO 8601 |
| 13 | Triage Date | Operator | Date operator reviewed |
| 14 | Decision | Operator | Approve / Hold / MR / Decline |
| 15 | Access Link Sent | Operator | Date link was sent (or "—") |
| 16 | Discovery Call Date | Operator | Date/time of call (or "—") |
| 17 | Proposal Sent | Operator | Date proposal issued (or "—") |
| 18 | Outcome | Operator | Won / Lost / On Hold + reason |
| 19 | Notes | Operator | Free text |

**Tracker maintenance rules:**
- One row per registration ID — never duplicate
- Update status column every time a transition occurs
- Log the date of every outbound contact in the Notes column
- Archive Closed Won and Closed Lost rows monthly (keep accessible, don't delete)

---

## 6. Access Link Workflow

### When to Send the Access Link

Send the gated pricing access link when:
- Alignment is **Primary** or **Secondary**, AND
- Contact details are verified (real domain, plausible role), AND
- No qualification questions are outstanding

Do **not** send the link when:
- Alignment is **Manual Review** (escalate first)
- Alignment is **Context-Dependent** and qualifying questions have not been answered
- Contact details look illegitimate (disposable email, missing org)

### Access Link Generation

Per SOP §6 — generate via API:

```bash
curl -X POST https://jurassicenglish.com/api/generate-pricing-access-link \
  -H "Authorization: Bearer $PRICING_ACCESS_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"email": "lead@school.edu", "ref": "JE-SCH-SLI-XXXXXXXX"}'
```

Then send using the template in `docs/Plans-Pricing-Access-Email-Template.md`, replacing `{{ACCESS_URL}}` with the returned signed URL.

### Access Link Tracking

| Event | Action |
|-------|--------|
| Link sent | Update tracker: status → `Access Sent`; log date |
| Link opens (if trackable) | Log in Notes |
| Lead replies | Move to `Awaiting Discovery Call` or `Qualified` as appropriate |
| Link expires (Day 7) | Offer renewal if lead has engaged; otherwise follow-up sequence |
| No response by Day 10 | Move to `On Hold`; log reason |

---

## 7. Qualification Standard

A lead is **Qualified** when all of the following are true after a Discovery Call (or equivalent engagement):

| Criterion | What to confirm |
|-----------|----------------|
| **Org fit** | School, institution, or organisation confirmed as a viable JE implementation context |
| **Decision authority** | Contact has decision-making authority, or has a clear path to the decision-maker |
| **Timeline** | Implementation timeline is realistic (current academic year or next) |
| **Budget signal** | Lead has acknowledged the pricing range and not disqualified on cost |
| **Scope understood** | The appropriate service (MAOI) is confirmed and understood by the lead |

Qualification does **not** require a formal commitment. It means the lead is ready for a proposal.

Leads that fail qualification criteria:
- `decision_authority` not confirmed → On Hold pending intro to decision-maker
- `timeline` too distant (2+ years) → On Hold with 6-month re-engagement date
- `budget signal` negative → Closed Lost (or On Hold if budget review expected)

---

## 8. Proposal Handoff Structure

### What Triggers a Proposal

A formal proposal is issued when:
1. Lead is at `Qualified` status
2. Discovery Call has been held and scope notes recorded
3. Resource Allocation Audit completed (where applicable)
4. Appropriate pricing tier has been identified from the Service Catalogue

### Proposal Components by MAOI

| MAOI | Proposal Contents |
|------|-------------------|
| `school_licensing` | Licence tier recommendation · School size pricing · Multi-year discount options · Implementation timeline · DRE access summary |
| `teacher_training` | Module selection · Group rate breakdown · CPD alignment note (iPGCE/PGCE) · Delivery format options · Refresher pathway |
| `curriculum_review` | Scope summary · Engagement timeline · Deliverables list · Optional follow-on consultation |
| `academic_consulting` | Engagement model (fixed/retainer/bespoke) · Scope of work · Milestone structure · Governance outcomes |
| `institutional_partnerships` | Partnership structure options · Revenue/flat/in-kind options · Co-branding scope · QA framework summary · Proposed next steps |
| `digital_reasoning_engine` | Tier recommendation · Per-student annual cost · Volume discount calculation · School licence relationship (if applicable) |

### Post-Proposal Actions

| Event | Action |
|-------|--------|
| Proposal sent | Status → `Proposal Pending`; log date |
| Day 5 (no reply) | Light follow-up: "Happy to answer any questions on the proposal" |
| Day 14 (no reply) | Second follow-up: offer a call to walk through |
| Day 28 (no reply) | Final follow-up; if no response → `Closed Lost` with note "No response post-proposal" |
| Lead responds with questions | Answer promptly; do not re-send full proposal until changes required |
| Lead requests revision | Update proposal; re-send; reset Day 0 |
| Lead accepts | Status → `Closed Won`; initiate onboarding |
| Lead declines | Status → `Closed Lost`; log reason |
| Lead pauses | Status → `On Hold`; set re-engagement date |

---

## 9. Buyer-Type Routing Reference

Quick-reference for the most common handling pattern per buyer type.

### School Administrator (`school_admin`)
- **Primary MAOIs**: School Licensing · Academic Consulting · Curriculum Review
- **Default path**: Access Sent → Discovery Call → Resource Allocation Audit → Proposal
- **SLA**: Same day / next business day
- **Key qualifying question**: "How many students does the school currently serve across the year groups you're considering?"
- **Proposal trigger**: School size + desired licence tier confirmed

### Teacher / CPD Lead (`teacher_cpd_lead`)
- **Primary MAOI**: Teacher Training
- **Default path**: Access Sent → confirm module interest → training proposal
- **SLA**: Within 2 business days (often Secondary for adjacent MAOIs)
- **Key qualifying question**: "Are you looking for whole-staff training or building a train-the-trainer pathway?"
- **Proposal trigger**: Module selection and group size confirmed

### Institutional Partner (`institutional_partner`)
- **Primary MAOIs**: Institutional Partnerships · Academic Consulting
- **Default path**: Discovery Call → Partnership Scoping Consultation → Scoping Report → Agreement
- **SLA**: Same day / next business day
- **Key qualifying question**: "Is your organisation looking at distribution, co-delivery, or a licensing arrangement?"
- **Note**: Skip access link for pure partnership enquiries; go straight to Partnership Scoping Call

### Parent / Guardian (`parent_guardian`)
- **Primary MAOI**: Digital Reasoning Engine
- **Default path**: Determine whether a licensed school is involved → route accordingly
- **SLA**: Within 2 business days
- **Key qualifying question**: "Is your child's school already using Jurassic English, or are you exploring independent learner access?"
- **Note**: Parents are not proposal leads unless they are school-adjacent decision-makers. Direct to school or independent DRE access.

### Other (`other`)
- **Primary MAOIs**: Teacher Training · Curriculum Review · Academic Consulting
- **Default path**: Qualifying question(s) → reclassify → follow reclassified BT path
- **SLA**: Within 3 business days
- **Key qualifying question**: "Can you tell me a bit more about your role and what you're hoping to achieve with Jurassic English?"
- **Note**: Once reclassified, apply the appropriate buyer-type path above.

---

## 10. Escalation Rules

| Situation | Action |
|-----------|--------|
| `Manual Review` alignment | Do not contact lead. Flag to senior team member within 24 hours |
| Contact details unverifiable | Place On Hold; attempt single email verification before discarding |
| Lead claims different org than domain | Flag for manual review |
| Lead requests pricing outside published ranges | Escalate; do not quote bespoke pricing without authorisation |
| Lead is already a known contact / existing client | Merge with existing CRM record; do not treat as new lead |
| Duplicate registration (same email, different ID) | Keep the later ID as active; archive the earlier one with a note |

---

## 11. Lead Velocity Targets

Indicative benchmarks for a healthy pipeline. These are operational targets, not hard SLAs.

| Metric | Target |
|--------|--------|
| Triage within | 1 business day of intake email |
| First outbound contact | Per alignment SLA (Section 4) |
| Discovery Call booked | Within 5 business days of access link open/reply |
| Qualification decision | Within 2 business days of Discovery Call |
| Proposal issued | Within 5 business days of qualification |
| Proposal follow-up cycle | 5 days → 14 days → 28 days |
| On Hold re-engagement check | Every 30 days |

---

*Last updated: 26 March 2026 · Maintained by: Jay Adams / World Wise Learning*
