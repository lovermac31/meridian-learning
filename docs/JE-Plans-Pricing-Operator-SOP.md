# Jurassic English — Plans & Pricing Operator SOP
**Internal use only · Jurassic English / World Wise Learning · March 2026**

---

## 1. Overview

When a visitor submits the Plans & Pricing registration form at `jurassicenglish.com`, the system:

1. Validates the submission (required fields, spam checks)
2. Generates a JE-format registration ID
3. Classifies the lead using the CRM Mapping Engine (buyer type × MAOI alignment)
4. Emails an 8-section CRM intake brief to `info@jurassicenglish.com`

This SOP covers what to do when that email arrives.

---

## 2. Registration Email Structure

Each intake email contains exactly **8 sections**:

| § | Section | What to read |
|---|---------|--------------|
| §1 | Lead Snapshot | Registration ID · submitted time · lead status · buyer type · MAOI · alignment |
| §2 | Contact Details | Name · email · role · organisation · country |
| §3 | Buyer Alignment | Primary MAOI interests (pills) · secondary interests |
| §4 | Service + Pricing Match | Matched service · module table · pricing range |
| §5 | Recommended Next Step / CTA | What to do with this lead |
| §6 | Notes / Context | Free-text message · qualification flag |
| §7 | CRM Tags | 9-field pill block (see below) |
| §8 | CRM Fields | 12-row structured record for CRM entry |

---

## 3. Reading the CRM Tags (§7)

The 9 CRM tags are present in every email:

| Tag | Meaning |
|-----|---------|
| `buyer_type` | Canonical buyer type key (`school_admin`, `teacher_cpd_lead`, etc.) |
| `maoi` | Main area of interest (`school_licensing`, `teacher_training`, etc.) |
| `alignment` | `primary` / `secondary` / `context_dependent` / `manual_review` |
| `pricing_band` | Service pricing range summary |
| `next_step` | Recommended follow-up action |
| `registration_id` | `JE-[BT]-[MAOI]-[base36]` — unique per submission |
| `lead_status` | Always `new` on intake |
| `source_ref` | `plans_pricing_registration` |
| `submitted_at` | ISO 8601 timestamp |

---

## 4. Alignment Decision Guide

| Alignment | Meaning | Action |
|-----------|---------|--------|
| **Primary** | Buyer type + MAOI are a natural match | Proceed to Discovery Call / follow §5 CTA |
| **Secondary** | Related, not the core fit | Proceed with context — mention the primary offering |
| **Context-Dependent** | Fit depends on org specifics | Ask qualifying questions first |
| **Manual Review** | Weak fit — needs human judgment | Pause; discuss with team before responding |

---

## 5. Triage Checklist (for each new registration)

```
[ ] §1 — Note the Registration ID (for your CRM / tracking log)
[ ] §1 — Confirm lead_status = "new" (not a duplicate)
[ ] §2 — Verify contact details look legitimate (real domain, role title plausible)
[ ] §3 — Read the alignment classification
[ ] §4 — Review the pricing match — does the range fit the stated org size?
[ ] §5 — Read the recommended next step
[ ] §6 — Check for a message or qualification flag
[ ] §7 — Copy the 9 CRM tags into your CRM system
[ ] §8 — Use the structured record to fill CRM fields

Decision:
[ ] Approve → send gated pricing access link (see Section 6)
[ ] Hold → needs more context (reply with qualifying question)
[ ] Manual Review → escalate to senior team member
[ ] Decline → no follow-up (rare; log reason internally)
```

---

## 6. Approving a Lead — Sending the Gated Pricing Access Link

1. Generate the access link using the API:

```bash
curl -X POST https://jurassicenglish.com/api/generate-pricing-access-link \
  -H "Authorization: Bearer $PRICING_ACCESS_LINK_OPERATOR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "lead@school.edu", "ref": "JE-SCH-SLI-XXXXXXXX"}'
```

Use the endpoint-scoped operator secret for this workflow:
- `PRICING_ACCESS_LINK_OPERATOR_KEY`

Do not use the legacy shared operator key for new client setup.

2. The API returns a signed URL, valid for **7 days**:
```json
{
  "ok": true,
  "accessUrl": "https://jurassicenglish.com/plans-pricing-access?token=...",
  "expiresAt": "2026-04-02T11:00:00.000Z"
}
```

3. Use the **email template** in `docs/Plans-Pricing-Access-Email-Template.md` to craft the outbound email.

4. Replace `{{ACCESS_URL}}` with the signed URL before sending.

5. **Important**: Do not share the URL publicly or forward to another contact — links are single-use per email.

---

## 7. Regenerating an Expired Link

If a lead reports their link has expired (links are valid for 7 days):

1. Verify the lead's identity by checking their original registration ID.
2. Generate a new link using the same command in Section 6 with their email.
3. Send the new link using a brief reply.

---

## 8. Common Buyer Type Scenarios

### School Administrator (`school_admin`)
- **Primary MAOIs**: School Licensing · Academic Consulting · Curriculum Review
- **Likely goal**: Whole-school JE licence for one or more year groups
- **Next step**: Book Discovery Call + Resource Allocation Audit (no cost)

### Teacher / CPD Lead (`teacher_cpd_lead`)
- **Primary MAOIs**: Teacher Training
- **Likely goal**: Professional development for staff; train-the-trainer pathway
- **Next step**: Enquire about training modules or Framework Onboarding

### Institutional Partner (`institutional_partner`)
- **Primary MAOIs**: Institutional Partnerships · Academic Consulting
- **Likely goal**: Distribution, licensing, or co-delivery agreement
- **Next step**: Request Partnership Scoping Consultation

### Parent / Guardian (`parent_guardian`)
- **Primary MAOI**: Digital Reasoning Engine (DRE)
- **Likely goal**: Independent learner access or school confirmation
- **Next step**: Direct to licensed school or independent learner access

### Other (`other`)
- **Primary MAOIs**: Curriculum Review · Academic Consulting
- **Likely goal**: Varies — treat as context-dependent
- **Next step**: Discovery Call within 5 business days

---

## 9. CRM Entry

When adding a lead to your CRM, use the §8 Structured Record directly. The 12 fields are:

| # | Field | Source |
|---|-------|--------|
| 1 | Full Name | §2 Contact |
| 2 | Work Email | §2 Contact |
| 3 | Role / Title | §2 Contact |
| 4 | Organisation | §2 Contact |
| 5 | Country / Region | §2 Contact |
| 6 | Buyer Type | §7 CRM Tag |
| 7 | MAOI | §7 CRM Tag |
| 8 | Alignment | §7 CRM Tag |
| 9 | Pricing Band | §7 CRM Tag |
| 10 | Registration ID | §7 CRM Tag |
| 11 | Lead Status | §7 CRM Tag → update as workflow progresses |
| 12 | Submitted At | §7 CRM Tag |

---

## 10. Quick Reference — Canonical Keys

**Buyer Type codes:**
| Key | Code | Label |
|-----|------|-------|
| `school_admin` | SCH | School Administrator / Academic Director |
| `teacher_cpd_lead` | TCL | Teacher / CPD Lead |
| `parent_guardian` | PAR | Parent / Guardian |
| `institutional_partner` | INS | Institutional Partner |
| `other` | OTH | Other / General Enquiry |

**MAOI codes:**
| Key | Code | Label |
|-----|------|-------|
| `teacher_training` | TRT | Teacher Training |
| `school_licensing` | SLI | School Licensing |
| `curriculum_review` | CRV | Curriculum Review |
| `academic_consulting` | ACN | Academic Consulting |
| `institutional_partnerships` | IPP | Institutional Partnerships |
| `digital_reasoning_engine` | DRE | Digital Reasoning Engine |

---

*Last updated: 26 March 2026 · Maintained by: Jay Adams / World Wise Learning*
