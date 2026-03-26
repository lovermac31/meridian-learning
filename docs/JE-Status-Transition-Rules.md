# Jurassic English — Status Transition Rules
**Internal use only · Jurassic English / World Wise Learning · March 2026**

---

## 1. Overview

This document defines the exact rules for moving a lead between pipeline stages. Every transition has:
- A defined trigger condition
- A named actor (who can make the move)
- Required evidence (what must exist before the move is valid)
- A tracker update requirement (what fields must change)

Transitions not listed in Section 2 are **invalid** and should not be made.

---

## 2. Transition Matrix

### Reading the matrix

Each row is a transition: FROM → TO.
**Actor**: `Operator` (any team member doing triage/follow-up) or `Senior` (senior team member only — for escalations).
**Evidence**: What must be true or recorded before the transition is valid.
**Tracker update**: Which fields must be updated when making the transition.

---

### `New` → `Reviewed`

| Attribute | Value |
|-----------|-------|
| Trigger | Operator has completed triage checklist (SOP §5) |
| Actor | Operator |
| Evidence required | Triage checklist complete; §8 fields entered into tracker; decision (Approve / Hold / Manual Review / Decline) noted |
| Tracker updates | `lead_status` → `Reviewed`; `owner` set; Notes: log triage date and decision |
| Max time in `New` | 1 business day |

---

### `Reviewed` → `Access Sent`

| Attribute | Value |
|-----------|-------|
| Trigger | Decision = Approve; access link generated and emailed to lead |
| Actor | Operator |
| Evidence required | (1) Alignment is `primary` or `secondary`; (2) Contact details verified; (3) No outstanding qualifying questions; (4) Access link generated via API; (5) Email sent using approved template |
| Tracker updates | `lead_status` → `Access Sent`; `last_contacted_at` → today; Notes: log date and access link ref |
| Max time in `Reviewed` | Same day (Primary/Secondary); 3 business days max |

---

### `Reviewed` → `Awaiting Discovery Call`

| Attribute | Value |
|-----------|-------|
| Trigger | Decision = Approve; Discovery Call booked directly (before access link, for school_admin or institutional_partner leads) |
| Actor | Operator |
| Evidence required | (1) Alignment is `primary` or `secondary`; (2) Contact details verified; (3) Calendar invite sent and accepted |
| Tracker updates | `lead_status` → `Awaiting Discovery Call`; `discovery_call_date` → booked date; `last_contacted_at` → today; Notes: log booking date |
| Notes | This transition is most common for `school_admin` and `institutional_partner` leads where a call is more appropriate than an access link as the first step |

---

### `Reviewed` → `On Hold`

| Attribute | Value |
|-----------|-------|
| Trigger | Decision = Manual Review or Hold at triage |
| Actor | Operator (Manual Review requires `Senior` to resolve the hold) |
| Evidence required | Specific reason documented; for Manual Review — escalation flag raised to Senior |
| Tracker updates | `lead_status` → `On Hold`; `outcome` → `Hold — [reason]`; Notes: log reason and re-engagement date |

---

### `Access Sent` → `Awaiting Discovery Call`

| Attribute | Value |
|-----------|-------|
| Trigger | Lead replies and accepts / requests a Discovery Call |
| Actor | Operator |
| Evidence required | (1) Inbound reply from lead; (2) Calendar invite sent |
| Tracker updates | `lead_status` → `Awaiting Discovery Call`; `discovery_call_date` → booked date; `last_contacted_at` → today; Notes: log reply date and call booking |

---

### `Access Sent` → `Qualified`

| Attribute | Value |
|-----------|-------|
| Trigger | Lead confirms fit and scope in writing without needing a Discovery Call |
| Actor | Operator |
| Evidence required | All 6 proposal-readiness criteria met (see `JE-Discovery-Call-Guide.md §9`) — confirmed via email exchange |
| Tracker updates | `lead_status` → `Qualified`; `last_contacted_at` → today; Notes: log qualification basis and all 6 criteria |
| Notes | Uncommon. Only valid if all 6 criteria are genuinely met via async exchange. If any criterion is unclear, book a call first. |

---

### `Access Sent` → `On Hold`

| Attribute | Value |
|-----------|-------|
| Trigger | No response after full follow-up sequence (Day 10) |
| Actor | Operator |
| Evidence required | (1) Day 0 access link sent; (2) Day 4 follow-up sent; (3) Day 10 follow-up sent — all logged with dates in Notes |
| Tracker updates | `lead_status` → `On Hold`; `outcome` → `Hold — No response post-access link`; Notes: log all contact attempts with dates |

---

### `Awaiting Discovery Call` → `Qualified`

| Attribute | Value |
|-----------|-------|
| Trigger | Discovery Call held; all 6 qualification criteria confirmed |
| Actor | Operator |
| Evidence required | (1) Call held (not no-show); (2) All 6 proposal-readiness criteria met (`JE-Discovery-Call-Guide.md §9`); (3) Scope notes written |
| Tracker updates | `lead_status` → `Qualified`; `discovery_call_date` → actual date held; `last_contacted_at` → today; Notes: log call summary and any scope data collected |
| Max time in `Awaiting Discovery Call` | 10 business days from booking |

---

### `Awaiting Discovery Call` → `On Hold`

| Attribute | Value |
|-----------|-------|
| Trigger | No-show after 2 reschedule attempts; OR call held but qualification criteria not met |
| Actor | Operator |
| Evidence required | (1) For no-show: 2 reschedule email attempts logged; OR (2) For failed qualification: call held but specific blocking criterion noted |
| Tracker updates | `lead_status` → `On Hold`; `outcome` → `Hold — [No-show x2 / Qualification blocked: reason]`; Notes: log all contact attempts |

---

### `Qualified` → `Proposal Pending`

| Attribute | Value |
|-----------|-------|
| Trigger | Formal proposal or scoping report issued to the lead |
| Actor | Operator |
| Evidence required | (1) Lead is at `Qualified` status; (2) All 6 qualification criteria are on record; (3) Proposal prepared using service catalogue pricing; (4) Proposal sent |
| Tracker updates | `lead_status` → `Proposal Pending`; `proposal_sent_at` → today; `last_contacted_at` → today; Notes: log proposal type and scope |
| Max time in `Qualified` | 5 business days |

---

### `Qualified` → `On Hold`

| Attribute | Value |
|-----------|-------|
| Trigger | Lead is qualified but a specific blocker prevents proposal issuance (e.g. budget cycle, board decision pending) |
| Actor | Operator |
| Evidence required | Specific blocker documented; re-engagement date set |
| Tracker updates | `lead_status` → `On Hold`; `outcome` → `Hold — [reason]`; Notes: log blocker and re-engagement date |

---

### `Proposal Pending` → `Closed Won`

| Attribute | Value |
|-----------|-------|
| Trigger | Lead accepts the proposal; written acceptance or signed agreement received |
| Actor | Operator |
| Evidence required | Written acceptance (email reply, signed document, or payment confirmation) |
| Tracker updates | `lead_status` → `Closed Won`; `outcome` → `Won — [brief description e.g. Full School Licence signed]`; Notes: log acceptance date and any contract reference |

---

### `Proposal Pending` → `Closed Lost`

| Attribute | Value |
|-----------|-------|
| Trigger | Lead explicitly declines; OR no response after Day 28 follow-up |
| Actor | Operator |
| Evidence required | (1) Explicit decline in writing; OR (2) Day 5 + Day 14 + Day 28 follow-ups all sent and logged, no response received |
| Tracker updates | `lead_status` → `Closed Lost`; `outcome` → `Lost — [reason]`; Notes: log the specific reason and all follow-up dates |

---

### `Proposal Pending` → `On Hold`

| Attribute | Value |
|-----------|-------|
| Trigger | Lead pauses decision with stated intention to re-engage (budget cycle, board approval, academic calendar) |
| Actor | Operator |
| Evidence required | Explicit communication from lead stating a pause reason and expected return |
| Tracker updates | `lead_status` → `On Hold`; `outcome` → `Hold — [reason + expected date]`; Notes: log lead's stated reason and re-engagement date |

---

### `On Hold` → Any Active Stage

| Attribute | Value |
|-----------|-------|
| Trigger | Lead re-engages; OR blocker is resolved (e.g. Manual Review cleared, budget approved, decision-maker introduced) |
| Actor | Operator (Senior if the hold was Manual Review) |
| Evidence required | (1) Re-engagement contact from lead or confirmed blocker resolution; (2) Appropriate active stage identified |
| Tracker updates | `lead_status` → target active stage; clear `outcome` field or update it; Notes: log re-engagement date and context |

---

### `On Hold` → `Closed Lost`

| Attribute | Value |
|-----------|-------|
| Trigger | 90 days on hold with no response to re-engagement attempts |
| Actor | Operator |
| Evidence required | 3+ re-engagement attempts over 90 days, all logged in Notes with dates |
| Tracker updates | `lead_status` → `Closed Lost`; `outcome` → `Lost — No re-engagement after 90 days on hold`; Notes: log final contact attempt date |

---

## 3. Transition Summary Table

Quick-reference matrix. ✅ = valid. ❌ = invalid. ⚠️ = conditional (see rules above).

| From \ To | New | Reviewed | Access Sent | Awaiting DC | Qualified | Proposal Pending | Closed Won | Closed Lost | On Hold |
|-----------|-----|----------|-------------|-------------|-----------|-----------------|------------|-------------|---------|
| **New** | — | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Reviewed** | ❌ | — | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Access Sent** | ❌ | ❌ | — | ✅ | ⚠️ | ❌ | ❌ | ❌ | ✅ |
| **Awaiting DC** | ❌ | ❌ | ❌ | — | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Qualified** | ❌ | ❌ | ❌ | ❌ | — | ✅ | ❌ | ❌ | ✅ |
| **Proposal Pending** | ❌ | ❌ | ❌ | ❌ | ❌ | — | ✅ | ✅ | ✅ |
| **Closed Won** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — | ❌ | ❌ |
| **Closed Lost** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — | ❌ |
| **On Hold** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | — |

**⚠️ `Access Sent` → `Qualified`**: Valid only when all 6 proposal-readiness criteria are met via async exchange. See rules above.

---

## 4. Invalid Transitions to Avoid

These transitions are explicitly blocked. If you find yourself wanting to make one, it is a signal to review the current state first.

| Attempted transition | Why it's invalid | Correct path |
|---------------------|-----------------|--------------|
| `New` → `Qualified` | Skips triage, verification, and qualification | `New` → `Reviewed` → follow pipeline |
| `New` → `Closed *` | No engagement has occurred | `New` → `Reviewed` → pipeline |
| `Reviewed` → `Qualified` | Qualification requires a Discovery Call or equivalent engagement | `Reviewed` → `Access Sent` / `Awaiting DC` → `Qualified` |
| `Reviewed` → `Proposal Pending` | No qualification has occurred | Cannot issue a proposal to an unqualified lead |
| `Access Sent` → `Proposal Pending` | No qualification has occurred | `Access Sent` → `Awaiting DC` → `Qualified` → `Proposal Pending` |
| `Awaiting DC` → `Proposal Pending` | Call was booked but no qualification yet | `Awaiting DC` → `Qualified` first |
| `Qualified` → `Closed Won` | No proposal has been issued | `Qualified` → `Proposal Pending` → `Closed Won` |
| `Closed Won` → any status | Terminal — engagement is complete | Create a new record if re-engagement |
| `Closed Lost` → any active status | Terminal — create a new record | New intake → new record; cross-reference with Note |
| Any → `New` | `New` is the entry point only | Not applicable |

---

## 5. Operator Rules

1. **Only one status at a time.** A lead can only be in one stage. There is no "in transition" state.

2. **Always update the tracker on the same day as the action.** A status change that is not logged in the tracker has not happened operationally.

3. **Notes are the audit trail.** Every status transition must have a corresponding note. Minimum format: `[date] [action] — [outcome]`.

4. **`lead_status` and `last_contacted_at` are always updated together** when an outbound contact is made.

5. **Manual Review holds require senior sign-off before any outbound contact.** Do not email or call a Manual Review lead until escalation is resolved.

6. **Do not issue proposals to unqualified leads.** If the 6-point qualification checklist has not been completed, the lead is not at `Qualified` regardless of how promising they seem.

7. **Reclassifications must be logged.** If `buyer_type` or `maoi` changes after the Discovery Call, update the field and write `[date] Reclassified: [old value] → [new value]` in Notes.

8. **On Hold is not a holding pen for neglected leads.** Every On Hold record must have a re-engagement date. Check all On Hold records every 30 days.

---

*Last updated: 26 March 2026 · Maintained by: Jay Adams / World Wise Learning*
