# Jurassic English — Pilot Tracking Fields and Automation Recommendation
**Internal use only · Jurassic English / World Wise Learning · April 2026**

---

## 1. Minimum Tracking Fields for Pilot Requests

These fields are captured automatically on every `/get-started` submission with `source=pilot-programme` and written to both the Notion CRM and Supabase backup. No additional setup is required to begin tracking — the system is already writing them.

### Core Identification Fields

| Field | System Key | Source | Notes |
|-------|------------|--------|-------|
| Submission ID | `submissionId` | Auto-generated | `JE-{base36}` format; unique per submission |
| Submitted At | `submittedAt` | Auto-generated | ISO 8601 UTC |
| Full Name | `fullName` | Form | Required |
| Work Email | `workEmail` | Form | Required; lowercased on normalisation |
| Organisation Name | `organizationName` | Form | Required |

### Segmentation Fields (Pilot-Specific Priority)

| Field | System Key | Values | Why It Matters |
|-------|------------|--------|----------------|
| **Source** | `source` | `pilot-programme`, `manual` | Confirms lead entered through pilot funnel |
| **Access Request** | `accessRequest` | `pilot_overview_pack`, `implementation_scope_overview`, `reporting_sample`, `readiness_checklist`, `institutional_programme_pack`, `pilot_consultation` | Tells you what they need and their urgency |
| **Primary Interest** | `primaryInterest` | `curriculum_review`, `school_licensing`, `teacher_training`, `consulting`, `partnership` | Determines which commercial pathway is relevant |
| **Organisation Type** | `organizationType` | `school`, `language_academy`, `school_group`, `educator`, `other` | Determines pilot scope (MVP vs Scale Readiness) |
| **Decision Stage** | `decisionStage` | `researching`, `comparing`, `ready_for_consultation`, `ready_to_pilot` | Determines response urgency and template |

### Context Fields (Scoring and Qualification Signals)

| Field | System Key | Notes |
|-------|------------|-------|
| Timeline | `timeline` | `immediately` / `within_3_months` / `within_6_months` / `exploring` |
| Learner Count | `learnerCount` | Optional free text — scan for scale signals |
| Age Range | `ageRange` | Optional free text — useful for level recommendation |
| Standards Context | `standardsContext` | Vietnam MOET, international, etc. |
| Challenge | `challenge` | Required (min 20 chars) — primary qualification signal |
| Success Definition | `successDefinition` | Optional — strong indicator of buyer maturity |
| Country / Region | `countryRegion` | Market identification |
| Role Title | `roleTitle` | Seniority signal |

---

## 2. Recommended Notion CRM View for Pilot Pipeline

Create a filtered Notion database view with:

**Filter:** `source` = `pilot-programme`
**Sort:** `submittedAt` descending
**Group by:** `decisionStage`

**Columns to show:**
1. Submission ID
2. Full Name
3. Organisation Name
4. Organisation Type
5. Access Request (what they asked for)
6. Decision Stage
7. Timeline
8. Lead Status (current — update manually per SOP)
9. Next Action (manual field)
10. Notes (one-line summary)

This view is the pilot pipeline. Review it at least twice per week when submissions are active.

---

## 3. Automation Recommendation

### What Is Already Automated

| Function | Status |
|----------|--------|
| Form validation and spam detection | ✅ Live |
| Supabase write (backup record) | ✅ Live |
| Notion CRM write (lead record) | ✅ Live |
| Intake notification email to operator | ✅ Live |

The current system does everything needed for manual fulfillment. There is no gap in data capture.

---

### What Could Be Automated — Deferred Recommendations

The following automations are **recommended for deferral** until pilot volume justifies the build cost. Each is low-risk to defer because the manual SOP is sufficient at current scale.

#### A — Auto-acknowledge email to submitter
**What:** Immediately after submission, send a short holding message to confirm receipt.
**Value:** Reduces perceived response lag. Appropriate when same-day human reply is not guaranteed.
**Build effort:** Low — one Resend template + trigger in `api/get-started.ts`.
**Defer until:** Response time consistently exceeds 4 hours, OR more than 5 pilot submissions per week.
**Risk of deferral:** Low. Qualified buyers will wait 24 hours; a good personal response is better than an instant templated one.

#### B — Notion status auto-update on submission
**What:** When a new pilot submission arrives, automatically set Lead Status to `new — pilot` rather than the generic `new`.
**Value:** Reduces manual CRM triage step.
**Build effort:** Very low — change in the CRM mapper.
**Defer until:** Lead volume makes manual triage slow (>10 submissions/week).
**Risk of deferral:** None at current scale.

#### C — Readiness checklist as a form (not PDF)
**What:** Replace the PDF readiness checklist with a Notion form or Typeform that auto-logs responses against the submitter's record.
**Value:** Eliminates the manual step of reading a returned PDF. Creates structured scoring.
**Build effort:** Medium — requires a new intake form and a webhook to map responses to CRM.
**Defer until:** At least 3 pilot cohorts have been through the process and the checklist has been validated in practice.
**Risk of deferral:** Low. The manual PDF version is functional and allows more flexibility for early iterations.

#### D — Calendar booking integration (Calendly or equivalent)
**What:** In Template B (consultation request), replace proposed times with a Calendly link.
**Value:** Eliminates back-and-forth on scheduling.
**Build effort:** Zero build — just create a Calendly account and embed the link in the template.
**Defer until:** More than 2 consultation requests per week, OR timezone friction becomes a repeated friction point.
**Risk of deferral:** Low. Proposed times are more personal at small volume.

#### E — Pilot pipeline Slack or email digest
**What:** Daily or weekly summary of new pilot submissions sent to the operator inbox or Slack channel.
**Value:** Removes the need to check Notion manually.
**Build effort:** Low — Notion automation or a simple cron job querying the CRM.
**Defer until:** Notion dashboard check becomes unreliable or too slow.
**Risk of deferral:** None. Manual Notion review is sufficient at current scale.

---

### What Should NOT Be Automated Now

| Function | Reason to Keep Manual |
|----------|----------------------|
| Asset delivery (sending the PDF) | Human review before sending is a quality gate — automated delivery would send to unqualified leads |
| Consultation scheduling | Personal response is a positioning signal at this stage |
| Lead qualification scoring | Challenge field and context signals require judgment that automated scoring cannot yet provide reliably |
| CRM status progression | Status changes reflect human interaction, not just form submission |

---

## 4. Summary Recommendation

**The live pilot funnel is operationally ready for manual fulfillment as-is.** No automation is required to begin receiving and responding to pilot requests today.

Automate in this order when volume justifies it:

1. **Auto-acknowledge email** — first automation to add; lowest effort, immediately reduces response anxiety for submitters
2. **Calendly for consultation booking** — zero build cost; add as soon as consultation frequency makes scheduling friction notable
3. **Notion pilot status tag** — small CRM improvement; add in next CRM maintenance pass
4. **Readiness checklist as form** — add after 3+ completed pilot cohorts have validated the checklist content

Everything else defers to scale.
