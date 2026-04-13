# Jurassic English — Sales Workflow
**Internal use only · Jurassic English / World Wise Learning · March 2026**

---

## 1. Pipeline Overview

Every inbound Plans & Pricing lead moves through a defined nine-stage pipeline. The pipeline is sequential by default. Lateral moves to **On Hold** are permitted from any active stage. Terminal stages (**Closed Won**, **Closed Lost**) are final.

```
[Form submitted at jurassicenglish.com]
             │
             ▼
        ┌─────────┐
        │   New   │  ← Intake email arrives at info@jurassicenglish.com
        └────┬────┘
             │  Triage complete
             ▼
        ┌──────────┐
        │ Reviewed │  ← Decision: Approve / Hold / Manual Review / Decline
        └─────┬────┘
              │
     ┌────────┼──────────────────────────────────┐
     │        │                                  │
     ▼        ▼                                  ▼
┌──────────┐  ┌──────────────────────────┐   ┌─────────┐
│  Access  │  │  Awaiting Discovery Call │   │  On     │
│  Sent    │  │  (call booked, not held) │   │  Hold   │◄──── from any stage
└────┬─────┘  └────────────┬─────────────┘   └────┬────┘
     │                     │                      │
     │  Lead engages       │  Call held            │  Re-engaged
     └──────────┬──────────┘                      │
                ▼                                 │
          ┌───────────┐ ◄───────────────────────── ┘
          │ Qualified │  ← Scope confirmed; proposal-ready
          └─────┬─────┘
                │  Proposal issued
                ▼
        ┌──────────────────┐
        │ Proposal Pending │  ← Awaiting lead decision
        └────────┬─────────┘
                 │
       ┌─────────┼──────────┐
       ▼         ▼          ▼
  ┌──────────┐ ┌─────────┐ ┌─────────┐
  │ Closed   │ │ Closed  │ │  On     │
  │  Won     │ │  Lost   │ │  Hold   │
  └──────────┘ └─────────┘ └─────────┘
```

---

## 2. Lead Stages

| Stage | Key | Who sets it | Terminal? |
|-------|-----|-------------|-----------|
| New | `New` | System (automatic on intake) | No |
| Reviewed | `Reviewed` | Operator | No |
| Access Sent | `Access Sent` | Operator | No |
| Awaiting Discovery Call | `Awaiting Discovery Call` | Operator | No |
| Qualified | `Qualified` | Operator (post-call) | No |
| Proposal Pending | `Proposal Pending` | Operator | No |
| Closed Won | `Closed Won` | Operator | Yes |
| Closed Lost | `Closed Lost` | Operator | Yes |
| On Hold | `On Hold` | Operator | No |

**`New`** is the only status set automatically by the system. All subsequent transitions require a deliberate operator action.

---

## 3. Stage Definitions — Entry and Exit Criteria

### New

**Description**: Lead has submitted the Plans & Pricing registration form. The 8-section CRM intake email has been delivered to `info@jurassicenglish.com`.

**Entry criteria**:
- Form submitted successfully at `jurassicenglish.com`
- API returned `ok: true` with a `JE-[BT]-[MAOI]-[base36]` registration ID
- Intake email delivered to `info@jurassicenglish.com`

**Exit criteria (→ Reviewed)**:
- Operator has opened the intake email
- Triage checklist (SOP §5) completed
- Lead logged in tracker

**Max time in stage**: 1 business day

**Owner**: Intake email; operator triage

---

### Reviewed

**Description**: Operator has completed triage. A decision has been made: Approve, Hold, Manual Review, or Decline.

**Entry criteria**:
- Triage checklist complete
- Registration ID logged in tracker
- §2 contact details verified as legitimate
- Alignment classification read from §3
- Pricing match reviewed against stated org size (§4)
- §6 message/flag noted

**Exit criteria**:
- **→ Access Sent**: Decision = Approve; access link generated and emailed
- **→ Awaiting Discovery Call**: Decision = Approve; Discovery Call booked before access link
- **→ On Hold**: Decision = Manual Review or Hold; reason logged
- **→ (no further action)**: Decision = Decline; reason logged internally

**Max time in stage**: Same day as triage

**Owner**: Operator

---

### Access Sent

**Description**: Gated pricing access link has been generated and emailed to the lead. Lead is in receipt of the private briefing.

**Entry criteria**:
- Lead approved (alignment = Primary or Secondary; contact verified)
- No outstanding qualifying questions
- Access link generated via `api/generate-pricing-access-link`
- Email sent using approved template (`docs/Plans-Pricing-Access-Email-Template.md`)
- Date logged in tracker

**Exit criteria**:
- **→ Awaiting Discovery Call**: Lead replies and accepts / requests a Discovery Call
- **→ Qualified**: Lead confirms fit and scope without needing a call (rare)
- **→ On Hold**: No response after full follow-up sequence (Day 10)

**Max time in stage**: 10 business days (follow-up sequence; see Section 6)

**Owner**: Operator (follow-up sequence)

---

### Awaiting Discovery Call

**Description**: Discovery Call has been booked in the calendar. No call has been held yet.

**Entry criteria**:
- Call booked with confirmed date/time
- Calendar invite sent to lead
- Pre-call prep completed (see `docs/JE-Discovery-Call-Guide.md`)
- Date logged in tracker

**Exit criteria**:
- **→ Qualified**: Call held; all six qualification criteria met
- **→ On Hold**: No-show after two reschedule attempts; or call held but qualification criteria not met

**Max time in stage**: 10 business days from booking (allow for scheduling; escalate if call delayed further)

**Owner**: Operator (calendar management + pre-call prep)

---

### Qualified

**Description**: Discovery Call has been held. Organisation is confirmed as a fit. Scope is understood. Lead is ready to receive a proposal.

**Entry criteria** (all six must be confirmed — see `docs/JE-Discovery-Call-Guide.md §9`):
1. Org type and size confirmed
2. Primary service (MAOI) confirmed and understood by the lead
3. Decision authority confirmed, or path to decision-maker established
4. Timeline is realistic (current or next academic year)
5. Pricing range acknowledged — lead has not disqualified on cost
6. Agreed next step is clear with a specific date

**Exit criteria**:
- **→ Proposal Pending**: Formal proposal or scoping report issued
- **→ On Hold**: Qualification criterion cannot be resolved at this time (e.g. budget cycle blocks decision)

**Max time in stage**: 5 business days (issue proposal within this window)

**Owner**: Operator (proposal preparation)

---

### Proposal Pending

**Description**: A formal proposal, scoping report, or agreement draft has been issued to the lead. Awaiting their decision.

**Entry criteria**:
- Lead is at `Qualified` status
- Proposal prepared using service catalogue pricing (see Section 11)
- Proposal sent and date logged in tracker

**Exit criteria**:
- **→ Closed Won**: Lead accepts; agreement signed or purchase confirmed
- **→ Closed Lost**: Lead declines explicitly, or no response after full follow-up sequence (Day 28)
- **→ On Hold**: Lead pauses decision with stated intention to re-engage (e.g. budget cycle, board approval pending)

**Max time in stage**: 28 business days (follow-up sequence; see Section 11)

**Owner**: Operator (proposal follow-up sequence)

---

### Closed Won

**Description**: Lead has accepted the proposal. Agreement is signed or payment confirmed. Onboarding begins.

**Entry criteria**:
- Written acceptance of proposal received, OR
- Agreement / contract signed, OR
- First payment confirmed

**Exit criteria**: Terminal. Record remains closed. A new intake creates a new pipeline record.

**Post-close actions**:
- Update tracker: status → `Closed Won`; log date and value
- Initiate onboarding handoff
- Archive lead record (do not delete)

**Owner**: Operator + onboarding team

---

### Closed Lost

**Description**: Lead declined, did not respond after the full follow-up sequence, or was disqualified and will not proceed.

**Entry criteria** (any one of the following):
- Lead explicitly declined the proposal or engagement
- No response to three post-proposal follow-ups (Day 5, 14, 28)
- Lead disqualified at triage (Decline decision at Reviewed stage)
- Lead confirmed the opportunity will not proceed in the current period

**Exit criteria**: Terminal (unless lead re-engages — create new record at that point).

**Post-close actions**:
- Update tracker: status → `Closed Lost`; log reason
- Note any re-engagement signals for future reference
- Archive record (do not delete)

**Owner**: Operator

---

### On Hold

**Description**: Active engagement is paused. The lead has not been lost — there is a specific reason for the pause and an expected re-engagement point.

**Entry criteria** (any active stage → On Hold when):
- Alignment = Manual Review and escalation not yet resolved
- Contact details unverifiable pending clarification
- Lead is not the decision-maker and the path to the decision-maker is unclear
- Lead explicitly pauses (budget cycle, board approval, internal review)
- No-show after two Discovery Call reschedule attempts
- No response after Day 10 post-access link

**Exit criteria**:
- **→ Any active stage**: Lead re-engages or blocker is resolved
- **→ Closed Lost**: Re-engagement attempts exhausted after 90 days with no response

**Re-engagement check**: Every 30 days. Log contact attempt in Notes column.

**Owner**: Operator

---

## 4. SLA and Response Expectations

### First Response — by Alignment

The alignment classification from §7 of the intake email determines how quickly to act.

| Alignment | First response window | Default first action |
|-----------|----------------------|---------------------|
| **Primary** | Same day or next business day | Send access link + invite Discovery Call |
| **Secondary** | Within 2 business days | Send access link; note the primary offering briefly |
| **Context-Dependent** | Within 3 business days | Send qualifying question first; access link follows their reply |
| **Manual Review** | Pause — do not contact | Escalate to senior team member; agree approach before any outbound |

### Follow-Up Sequence — After Access Link Sent

| Day | Action |
|-----|--------|
| Day 0 | Access link sent |
| Day 4 | Check-in if no reply: "Did the briefing come through?" |
| Day 7 | Link expires — offer renewal if lead has engaged but not replied |
| Day 10 | Final follow-up. No response → move to `On Hold` |
| Day 30 | Optional re-engagement: "Checking back in — is this still a priority for you?" |

### Follow-Up Sequence — After Proposal Issued

| Day | Action |
|-----|--------|
| Day 0 | Proposal sent |
| Day 5 | Light follow-up: "Happy to answer any questions on the proposal" |
| Day 14 | Second follow-up: offer a call to walk through the proposal |
| Day 28 | Final follow-up. No response → `Closed Lost` unless a pause is actively agreed |

### Stage Velocity Targets

| Transition | Target |
|------------|--------|
| New → Reviewed | 1 business day |
| Reviewed → first outbound | Per alignment SLA above |
| Access Sent → Discovery Call booked | Within 5 business days of lead reply |
| Discovery Call held → Qualified decision | Same day or next business day post-call |
| Qualified → Proposal issued | Within 5 business days |
| Proposal Pending → close | 28 days follow-up window |
| On Hold → re-engagement check | Every 30 days |

---

## 5. Inbox-to-Tracker Workflow

### The Daily Operational Pattern

When a new intake email arrives at `info@jurassicenglish.com`:

```
Step 1 — Open the email
  └── Check §1: Registration ID present + lead_status = "new"
  └── Confirm this is not a duplicate (search tracker by email)

Step 2 — Run triage checklist (SOP §5)
  └── §2: Verify contact details (real domain, plausible role, organisation exists)
  └── §3: Read alignment classification
  └── §4: Review pricing match vs. stated org size
  └── §5: Read recommended next step
  └── §6: Note any free-text message or qualification flag

Step 3 — Add tracker row
  └── Copy §8 Structured Record → tracker columns 1–12
  └── Set status = Reviewed

Step 4 — Copy §7 CRM Tags → CRM system
  └── All 9 fields (see SOP §3)

Step 5 — Make decision (see Section 6)
  └── Approve / Hold / Manual Review / Decline

Step 6 — Take action within SLA window

Step 7 — Update tracker
  └── Log action taken, date, and any outbound contact
```

### Lead Tracker Schema

19 columns. Columns 1–12 map directly to the §8 Structured Record.

| # | Column | Source | Notes |
|---|--------|--------|-------|
| 1 | Registration ID | §7 `registration_id` | Primary key — never duplicate |
| 2 | Full Name | §2 Contact | |
| 3 | Work Email | §2 Contact | |
| 4 | Role / Title | §2 Contact | |
| 5 | Organisation | §2 Contact | |
| 6 | Country / Region | §2 Contact | |
| 7 | Buyer Type | §7 `buyer_type` | Canonical key |
| 8 | MAOI | §7 `maoi` | Canonical key |
| 9 | Alignment | §7 `alignment` | primary / secondary / context_dependent / manual_review |
| 10 | Pricing Band | §7 `pricing_band` | From service catalogue |
| 11 | Lead Status | §7 → update manually | Update at every transition |
| 12 | Submitted At | §7 `submitted_at` | ISO 8601 |
| 13 | Triage Date | Operator | Date operator reviewed |
| 14 | Decision | Operator | Approve / Hold / Manual Review / Decline |
| 15 | Access Link Sent | Operator | Date sent, or "—" |
| 16 | Discovery Call Date | Operator | Date/time held, or "—" |
| 17 | Proposal Sent | Operator | Date sent, or "—" |
| 18 | Outcome | Operator | Won / Lost / On Hold + brief reason |
| 19 | Notes | Operator | Free text — log all outbound contacts with dates |

**Maintenance rules:**
- One row per Registration ID — never create duplicate rows
- Status column updated at every pipeline transition
- Notes column: log every outbound contact as `[date] [action]`
- Monthly: archive Closed Won and Closed Lost rows to a separate sheet (retain; do not delete)
- Quarterly: review all On Hold rows — re-engage or close

---

## 6. Approval / Hold / Reject Logic

### Decision Tree at the Reviewed Stage

```
Is alignment = Manual Review?
  └── YES → Hold immediately; escalate to senior team. Do not contact lead.
  └── NO → continue ↓

Are contact details verifiable?
  (real email domain, plausible role, organisation can be confirmed)
  └── NO → Hold; attempt single verification email before discarding
  └── YES → continue ↓

Is alignment = Context-Dependent?
  └── YES → Send qualifying question(s) first; defer access link until answered
  └── NO → continue ↓

Is the pricing match reasonable for the stated org?
  (does the pricing band fit what they've described?)
  └── NO → Note the mismatch; still approve but flag in Discovery Call prep
  └── YES → continue ↓

→ APPROVE
  Send access link using Plans-Pricing-Access-Email-Template.md
  Update status → Access Sent
```

### Approve

Send the gated pricing access link. Applies when:
- Alignment is Primary or Secondary
- Contact details are verified
- No outstanding qualifying questions
- Pricing match is plausible for the stated org

### Hold

Move to `On Hold`. Log reason. Applies when:
- Alignment = Manual Review (always hold pending escalation)
- Alignment = Context-Dependent and qualifying questions not yet answered
- Contact details cannot be verified
- Lead is not the decision-maker and no path to decision-maker is established
- Any other circumstance requiring senior judgment

### Manual Review (escalation)

A sub-type of Hold. Applies specifically when:
- Alignment classification = `manual_review` from §7
- The buyer type and MAOI combination is a weak fit requiring human interpretation
- The intake email contains a qualification flag (§6)

Action: flag to senior team member within 24 hours. Do not send access link or contact the lead until reviewed.

### Decline

No follow-up. Log reason internally. Applies when:
- Submission is clearly spam or fabricated
- Domain is a known spam domain
- Lead explicitly states they are not interested (rare — usually they just don't reply)
- Org is confirmed ineligible (e.g. a competitor doing competitive intelligence)

Do not delete the record — log with reason `Declined` and keep in tracker.

---

## 7. Access-Link Workflow

### When to Send

Send the gated pricing access link when:
- Lead is at `Reviewed` status with Approve decision, AND
- Alignment is Primary or Secondary, AND
- Contact details are verified, AND
- No qualifying questions are outstanding

Do **not** send when:
- Alignment = Manual Review (escalate first)
- Alignment = Context-Dependent and qualifying questions unanswered
- Contact details are suspect
- Decision = Hold or Decline

### How to Generate

Per SOP §6:

```bash
curl -X POST https://jurassicenglish.com/api/generate-pricing-access-link \
  -H "Authorization: Bearer $PRICING_ACCESS_LINK_OPERATOR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "lead@school.edu", "ref": "JE-SCH-SLI-XXXXXXXX"}'
```

The API returns a signed URL valid for 7 days. Use the template in `docs/Plans-Pricing-Access-Email-Template.md`. Replace `{{ACCESS_URL}}` before sending.

Use the endpoint-scoped operator secret for this workflow:
- `PRICING_ACCESS_LINK_OPERATOR_KEY`

### What to Track

| Event | Tracker action |
|-------|---------------|
| Link generated and emailed | Status → `Access Sent`; log date in col. 15 |
| Lead replies or engages | Move to `Awaiting Discovery Call` or `Qualified`; log in Notes |
| Day 7: link expires | Offer renewal if lead has engaged; note in tracker |
| Day 10: no response | Status → `On Hold`; log reason "No response post-access link" |

### Link Rules

- Links are single-use per email address — do not forward or share publicly
- If a lead reports their link has expired: verify their Registration ID, generate a new link using the same API call, send a brief reply email (not the full template)
- If a lead shares the link with a colleague: treat the colleague as a new enquiry and ask them to submit the form

---

## 8. Discovery Call Handoff

### What Triggers a Discovery Call

A Discovery Call is the appropriate next step when:
- Lead is `Access Sent` or `Reviewed` (Approve decision) AND
- Lead has replied expressing interest OR
- Buyer type is `school_admin` or `institutional_partner` (these always benefit from a call regardless of access link status)

For `teacher_cpd_lead` and `parent_guardian`: a call is optional if scope is clear from the form; proceed to proposal / referral if enough information is available.

### What to Pass into the Call

The pre-call prep is built entirely from the §8 Structured Record. Before the call, confirm you have:

| Data point | Source |
|------------|--------|
| Full Name + Role | §2 |
| Organisation + Country | §2 |
| Buyer Type | §7 `buyer_type` |
| MAOI | §7 `maoi` |
| Alignment | §7 `alignment` |
| Pricing Band | §7 `pricing_band` |
| Org Size (if provided) | §2 / form field |
| Timeline (if provided) | Form field |
| Message (if any) | §6 |
| Has lead seen the access briefing? | Tracker col. 15 + any reply |

### How to Book

- Offer 2–3 specific date/time options in the outbound email (do not just say "let me know when you're free")
- Confirm time zone explicitly
- Send a calendar invite with a clear subject line: `Jurassic English — Discovery Call with [Name], [Organisation]`
- Include a one-sentence agenda in the invite body

### Completed Handoff

The handoff is complete when:
- Calendar invite accepted
- Pre-call prep notes written
- Status updated to `Awaiting Discovery Call`
- Date logged in tracker col. 16

---

## 9. Proposal Handoff

### Qualification Requirement

A proposal is only issued once the lead is at `Qualified` status. Do not send pricing or proposals to leads at earlier stages — the access briefing covers the range; the proposal covers the specific scope.

### Proposal Components by MAOI

| MAOI | Proposal must include |
|------|-----------------------|
| `school_licensing` | Recommended licence tier · School-size pricing band · Multi-year discount options · DRE access summary · Implementation timeline · Next steps |
| `teacher_training` | Module selection recommendation · Group size and rate · CPD accreditation alignment note · Delivery format options · Train-the-Trainer pathway (if applicable) |
| `curriculum_review` | Scope summary (from RAA) · Engagement timeline · Deliverables list · Optional follow-on consultation · Fixed fee or range |
| `academic_consulting` | Engagement model (fixed / retainer / bespoke) · Scope of work · Milestones · Governance outcomes · Investment summary |
| `institutional_partnerships` | Partnership structure options (revenue share / flat annual / in-kind) · Co-branding scope · Multi-campus governance design · QA framework · Proposed agreement timeline |
| `digital_reasoning_engine` | Tier recommendation · Per-student annual cost · Volume discount calculation · School licence relationship (if applicable) · Access and onboarding process |

### Post-Proposal Follow-Up Sequence

| Day | Action | Status if no response |
|-----|--------|-----------------------|
| Day 0 | Proposal sent | `Proposal Pending` |
| Day 5 | "Happy to answer any questions on the proposal" | — |
| Day 14 | Offer a call to walk through the proposal | — |
| Day 28 | Final follow-up: "Let me know if the timing has changed" | → `Closed Lost` if no response |

If the lead asks for changes: update the proposal, re-send, reset the Day 0 clock.

If the lead pauses with a stated reason: status → `On Hold`; set a re-engagement date tied to their stated timeline.

---

## 10. Closeout Logic

### Closed Won

A lead is closed as Won when written acceptance is received — either an explicit "yes" reply, a signed agreement, or a confirmed first payment.

**On close:**
- Update tracker: status → `Closed Won`; log date and contract/deal value in Notes
- Initiate onboarding handoff to the implementation team
- Send a brief confirmation to the lead (no sales language — operational tone)
- Archive the record (retain indefinitely; this is a client record now)
- If a school licence: initiate Resource Allocation Audit if not already done

### Closed Lost

A lead is closed as Lost when:
- Lead explicitly declines in writing, OR
- No response received after three follow-ups post-proposal (Day 5, 14, 28), OR
- Lead was disqualified at triage (Decline decision at Reviewed), OR
- Lead confirms the opportunity will not proceed

**On close:**
- Update tracker: status → `Closed Lost`; log the specific reason (explicit decline / no response / disqualified)
- Do not delete the record
- Note any re-engagement signals: if the lead mentioned a future date or budget cycle, set a calendar reminder

**Re-engagement note:** A `Closed Lost` record is not necessarily permanent. If a lead contacts JE in the future, create a new tracker record — do not reopen the closed record. Link the records with a note.

### On Hold

On Hold is not a terminal status. It means active engagement is paused with a specific reason.

**Required when placing on hold:**
- Log the reason explicitly (e.g. "Manual Review — escalation pending", "Budget cycle — resumes April", "No-show — awaiting reschedule")
- Set a re-engagement date
- Update tracker: status → `On Hold`; log reason + re-engagement date in Notes

**Re-engagement cadence:**
- Check every 30 days
- On each check: attempt contact if appropriate; log the attempt
- After 90 days with no response to re-engagement attempts: move to `Closed Lost`

---

## 11. Buyer-Type Routing Quick Reference

### School Administrator (`school_admin`)
- **Default path**: Reviewed → Access Sent → Awaiting Discovery Call → Qualified (RAA) → Proposal Pending → Closed Won
- **SLA**: Same day / next business day (alignment typically Primary)
- **Key info to capture**: School size (student count) and year groups — this determines licence tier
- **Proposal driver**: School size + desired coverage level + CEFR/curriculum framework

### Teacher / CPD Lead (`teacher_cpd_lead`)
- **Default path**: Reviewed → Access Sent → (Discovery Call optional) → Qualified → Proposal Pending → Closed Won
- **SLA**: Within 2 business days (Primary for Teacher Training; Secondary for adjacent MAOIs)
- **Key info to capture**: Individual vs. group training; group size; CPD accreditation requirements
- **Note**: If school not yet licensed, consider a parallel `school_admin` referral

### Institutional Partner (`institutional_partner`)
- **Default path**: Reviewed → Awaiting Discovery Call (skip access link for pure partnership enquiries) → Qualified → Partnership Scoping Consultation → Proposal Pending → Closed Won
- **SLA**: Same day / next business day (alignment typically Primary)
- **Key info to capture**: Distribution vs. co-delivery vs. licensing intent; network size; decision timeline

### Parent / Guardian (`parent_guardian`)
- **Default path**: Reviewed → routing decision → referral or DRE access info
- **SLA**: Within 2 business days
- **Note**: Parents are not commercial proposal leads. Route to licensed school or independent DRE access. If the parent is actually a school decision-maker, reclassify as `school_admin`.

### Other (`other`)
- **Default path**: Reviewed → qualifying question(s) → reclassify → follow reclassified BT path
- **SLA**: Within 3 business days
- **Note**: Do not issue a proposal until reclassified. The qualifying question is the first outbound contact.

---

*Last updated: 26 March 2026 · Maintained by: Jay Adams / World Wise Learning*
