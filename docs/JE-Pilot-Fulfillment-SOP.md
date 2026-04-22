# Jurassic English — Pilot Fulfillment SOP
**Internal use only · Jurassic English / World Wise Learning · April 2026**

---

## 1. Overview

This SOP covers the manual review and fulfillment workflow for all pilot-related enquiries submitted through `jurassicenglish.com/get-started` with `source=pilot-programme`.

On submission, the system:
1. Validates the form
2. Writes the submission to the Notion CRM (JE Lead Tracker)
3. Writes a backup record to Supabase (`je_get_started_submissions`)
4. Emails an intake notification to `info@jurassicenglish.com`

This SOP describes what to do when that email arrives.

---

## 2. Intake Sources

| Source Identifier | Entry Point | Trigger |
|-------------------|-------------|---------|
| `pilot-programme` | `/pilot-programme` → "Request Full Pilot Pack" | `access=pilot_pack` |
| `pilot-programme` | `/pilot-programme` → "Request a Pilot Consultation" | `access=consultation` |
| `pilot-programme` | Direct `/get-started` with pilot params | Any `source=pilot-programme` |
| Manual | Inbound email, referral, or conference | Log manually with `source=manual` |

All `source=pilot-programme` submissions are pilot-priority leads. They bypass the general discovery queue and go directly to pilot review.

---

## 3. Intake Email Structure

The intake notification email contains:

| Field | What to check |
|-------|--------------|
| `submissionId` | Unique reference — use in all follow-up correspondence |
| `fullName` + `workEmail` | Primary contact |
| `organizationName` + `organizationType` | Institution type — school, academy, school group, educator, other |
| `roleTitle` + `countryRegion` | Seniority signal and market context |
| `primaryInterest` | Why they submitted — `curriculum_review`, `school_licensing`, `teacher_training`, `consulting`, `partnership` |
| `accessRequest` | What they asked for — see §4 |
| `challenge` | Their stated problem — read carefully before responding |
| `decisionStage` | `researching`, `comparing`, `ready_for_consultation`, `ready_to_pilot` |
| `timeline` | `immediately`, `within_3_months`, `within_6_months`, `exploring` |
| `learnerCount` + `ageRange` | Pilot scoping signals |
| `standardsContext` | Vietnam MOET, international frameworks, etc. |
| `successDefinition` | Their definition of a good outcome |
| `newsletterOptIn` | If true, add to newsletter list |

---

## 4. Access Request Routing

| `accessRequest` value | What was requested | Default response |
|-----------------------|-------------------|-----------------|
| `pilot_overview_pack` | Full Pilot Overview Pack | Send pilot pack PDF + readiness checklist |
| `implementation_scope_overview` | Implementation Scope Overview | Send scope doc + invite for scope call |
| `reporting_sample` | Reporting Sample / Executive Summary | Send reporting sample + follow up re: readiness |
| `readiness_checklist` | Pilot Readiness Checklist | Send checklist, ask to return completed |
| `institutional_programme_pack` | Detailed Institutional Programme Pack | Send full pack, flag for consultation follow-up |
| `pilot_consultation` | Pilot Consultation | Reply to book the call — no document required first |

---

## 5. Review Criteria

Before fulfilling any request, assess the submission against these criteria:

### Minimum Criteria (all must pass)
- [ ] Submission has a valid work email (not gmail/hotmail/yahoo unless explained)
- [ ] Organisation name is a real institution or plausible business name
- [ ] Challenge field is substantive (> 20 words and not generic)
- [ ] `contactConsent` is `true`

### Qualification Signals (positive indicators)
- Named role title (academic director, principal, curriculum coordinator, centre owner)
- Specific learner count or age range
- Specific CEFR context or standards reference
- Decision stage is `comparing`, `ready_for_consultation`, or `ready_to_pilot`
- Timeline is `immediately` or `within_3_months`
- Challenge describes a specific institutional problem, not general curiosity

### Disqualification Signals (proceed with caution or hold)
- Generic challenge text ("I want to learn more about your product")
- Free email provider with no institution name
- No role title and no organisation type specified
- Decision stage is `researching` and timeline is `exploring` simultaneously
- Unusual geography with no plausible institutional context

### Outcome Options
| Assessment | Action |
|-----------|--------|
| Qualified | Proceed to fulfillment within 1 business day |
| Moderate — needs clarification | Send clarification email (Template C); hold fulfillment |
| Not yet qualified | Send clarification or gentle redirect; do not send full pack |
| Spam / invalid | Log as `spam`, do not respond |

---

## 6. Approval Path

All pilot request fulfillments follow this path:

```
Intake email received
    → Operator reads submission (5–10 minutes)
    → Apply review criteria (§5)
    → Qualified: select template, attach assets, send within 1 business day
    → Needs clarification: send Template C, await reply
    → Not yet qualified: send Template D (gentle redirect), log as exploring
    → Spam: log, no action
    → Update Notion CRM record (§8)
```

No multi-person approval is required for standard pilot pack delivery. Consultation scheduling does not require approval — the operator books directly or proposes times via email.

---

## 7. Delivery Timing

| Request Type | Target Response Time |
|-------------|---------------------|
| Pilot overview pack | Within 1 business day |
| Readiness checklist | Within 1 business day |
| Implementation scope overview | Within 1 business day |
| Reporting sample | Within 1 business day |
| Institutional programme pack | Within 2 business days |
| Pilot consultation booking | Within 1 business day; call within 2–3 business days |
| Clarification required | Send clarification request same day; wait up to 5 business days for reply |

---

## 8. Email Response Path

All outbound pilot responses go from `info@jurassicenglish.com`. See `JE-Pilot-Email-Templates.md` for the full template set.

| Situation | Template |
|-----------|----------|
| Pilot pack request — qualified | Template A: Pilot Pack Delivery |
| Consultation request — qualified | Template B: Consultation Request |
| Clarification needed before fulfillment | Template C: Clarification Required |
| Follow-up after assets sent (no reply after 5 days) | Template D: Follow-Up / Next Step |

**Reply-to:** Always `info@jurassicenglish.com`
**CC:** Not required at this stage
**BCC:** Log the sent email in the CRM record (copy submission ID into email subject or body)

---

## 9. CRM Logging Expectations

After every fulfillment action, update the Notion CRM record:

| Field to Update | Value |
|----------------|-------|
| Lead Status | `new` → `contacted` on first outbound response |
| Lead Status | `contacted` → `qualified` if readiness checklist returned or scope call booked |
| Lead Status | `qualified` → `pilot_active` when pilot formally begins |
| Next Action | What the next step is and when |
| Notes | One-line summary of what was sent and any qualitative signal from the challenge field |
| Access Request Sent | Which asset was delivered |
| Response Date | Date of outbound email |

The Supabase backup record is write-once and does not need manual updating.

---

## 10. Weekly Pilot Pipeline Review (Recommended Cadence)

Once pilot volume exceeds 3–5 submissions per week, run a 15-minute weekly review:

1. Filter Notion CRM view for `source=pilot-programme` + `status=new` or `status=contacted`
2. Identify any submissions older than 3 business days without outbound response — escalate
3. Check for any `ready_to_pilot` submissions awaiting consultation — prioritise
4. Log any patterns in challenge field or `standardsContext` for product intelligence

---

## 11. Edge Cases

| Situation | Action |
|-----------|--------|
| Same person submits twice | Merge records; reply once; note duplication in CRM |
| Institutional group inquiry (multiple campuses) | Flag as `school_group`; route to Scale Readiness pathway |
| Inbound email request (not via form) | Log manually in Notion with `source=manual`; apply same review criteria |
| Enquiry in Vietnamese | Respond in English unless operator is fluent; note language preference in CRM |
| Request for pricing before assets | Acknowledge request; explain pricing is reviewed after fit is confirmed; offer pack first |
| Partner or investor inquiry | Separate route — do not use pilot templates; escalate to founder |
