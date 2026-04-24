# Jurassic English — Pilot Email Templates
**Internal use only · Jurassic English / World Wise Learning · April 2026**

These templates are for manual operator use. Each template includes a subject line, body, and operator notes. Adjust bracketed fields before sending. Do not send templated text unedited — at minimum personalise the opening line to reference the institution or the specific challenge they described.

---

## Operator Alert — Internal Review Notification
**Use when:** `/get-started` receives a pilot access request and sends the internal notification to `info@jurassicenglish.com`.

The production notification email should include:

- submission ID and submitted timestamp
- source and pilot access request
- primary interest, organisation, organisation type, full name, work email
- role/title, country/region, age range, learner count, standards context
- timeline and decision stage
- challenge/context, success definition, and notes
- direct internal review link: `/internal/pilot-requests?search=<submissionId>`
- review recommendation based on the intake-to-scope mapping
- signed confirmation links for:
  - `mark_under_review`
  - `approve_basic_pack`
  - `consultation_required`
  - `denied`

Security requirements:

- Action links must open `/internal/approval-action?token=...`.
- The confirmation page must show the request summary and intended action before changing status.
- The email must not contain `INTERNAL_PORTAL_OPERATOR_KEY`.
- The email must not contain raw external portal tokens.
- The approved external user email is the only email type that may include an external portal link.

---

## Template A — Approved Access
**Use when:** `operator_status=approved`, approved scopes are selected, and an external portal token has been issued.

---

**Subject:**
`Jurassic English — Approved Pilot Access for [Organisation Name]`

**Body:**

Hello [First Name],

Thank you for your enquiry about the Jurassic English Pilot Programme.

Your request has been approved for scoped review access. You can use the secure link below to access the materials selected for your institution:

[PASTE EXTERNAL PORTAL LINK]

This link expires on [expiry date]. It includes: [list approved materials, for example Pilot Overview Pack and Readiness Checklist].

Please reply to this email if you have questions about the materials or would like to arrange a pilot consultation.

Kind regards,

[Name]
Jurassic English / World Wise Learning
info@jurassicenglish.com

---

**Operator Notes:**
- Use this template only after the internal portal returns a generated external portal URL
- Include only materials represented by the approved scopes
- Do not paste the raw token into shared notes or Notion
- After sending, update `fulfillment_status` from `token_issued` to `materials_sent`

---

## Template B — Consultation Required
**Use when:** Request is credible but context, readiness, implementation scope, or decision authority needs a call before broad access.

---

**Subject:**
`Jurassic English — Pilot Consultation for [Organisation Name]`

**Body:**

Hello [First Name],

Thank you for your interest in the Jurassic English Pilot Programme.

Before we send wider pilot materials, the best next step is a short scoping conversation. This helps us understand your institution's context and avoid sending materials that are too broad or not relevant to your current stage.

The call is typically 30–45 minutes and covers:
- Your institutional context, learner group, and implementation window
- Which pilot pathway fits your readiness and timeline
- What the commercial structure looks like and what happens after the pilot
- Any questions you have before making a decision

I can offer the following times: [insert 2–3 options with timezone]. If none of these work, please reply with your preferred window and I will find a slot.

We will hold broader access until after that conversation, then send the most relevant materials if the fit is clear.

Kind regards,

[Name]
Jurassic English / World Wise Learning
info@jurassicenglish.com

---

**Operator Notes:**
- Propose 2–3 real calendar slots — do not leave this open-ended
- Include timezone — Vietnam (ICT, UTC+7) is the primary market; adjust accordingly
- Do not include an external portal link in this template
- Set `operator_status=consultation_required`
- Set `consultation_status=required` or `proposed`
- Use a manual event note after sending the email

---

## Template C — Clarification Required
**Use when:** Submission passes minimum validity but lacks enough context to qualify the request — challenge too brief, no role title, no institution type, or the stated problem does not obviously match a pilot pathway.

---

**Subject:**
`Jurassic English — A Quick Question Before We Send Your Materials`

**Body:**

Hello [First Name],

Thank you for your enquiry about the Jurassic English Pilot Programme.

Before I send through the materials, I have one short question so I can make sure I send you the most relevant information:

[Choose one — do not ask multiple questions at once:]

**Option 1 — Unclear institution context:**
Could you tell me a little more about your school or centre? Specifically: roughly how many learners you teach, what age range you work with, and whether this is an independent school, a language academy, or part of a wider group?

**Option 2 — Challenge too brief:**
You mentioned [paraphrase their challenge text]. Could you say a little more about the specific outcome you are trying to achieve? For example: are you exploring whether the programme fits your existing curriculum, looking to differentiate from competitors, or evaluating whether to replace or supplement a current methodology?

**Option 3 — Timeline unclear:**
To make sure I send the right level of detail: are you currently in a position to begin a pilot within the next 3–6 months, or are you still in the early research stage?

I will send the materials as soon as I hear back from you — it will only take a moment.

Kind regards,

[Name]
Jurassic English / World Wise Learning
info@jurassicenglish.com

---

**Operator Notes:**
- Use only one of the three question options — do not combine
- If no reply within 5 business days, send Template D
- If the clarification reply qualifies the lead, proceed with Template A or B as appropriate
- If the reply makes clear the lead is not ready or not a fit, respond with a brief acknowledgement and suggest they revisit when their situation has progressed — do not send the full pack

---

## Template D — Denied / Not Qualified
**Use when:** Request is not credible, not institutionally aligned, or outside the current pilot access criteria.

---

**Subject:**
`Jurassic English — Pilot Access Request`

**Body:**

Hello [First Name],

Thank you for your interest in the Jurassic English Pilot Programme.

At this stage, we are not able to provide gated pilot access for this request. The current pilot materials are intended for qualified institutional review by schools, academies, school groups, and aligned programme partners.

You are welcome to review the public information on jurassicenglish.com, and you may submit a new enquiry in future if your institutional context changes.

Kind regards,

[Name]
Jurassic English / World Wise Learning
info@jurassicenglish.com

---

**Operator Notes:**
- Do not expose internal qualification criteria
- Do not include an external portal link
- Set `operator_status=denied`
- Add an internal note explaining the reason

---

## Tone Guidelines (Applies to All Templates)

The right tone for all pilot correspondence is: **professional, direct, low-pressure, evidence-led.**

| Do | Do not |
|----|--------|
| Reference their specific challenge | Use generic sales language |
| Name the institution and role if known | Overclaim results or outcomes |
| Acknowledge uncertainty or early stage | Create false urgency |
| Offer a clear next step | Leave the next step ambiguous |
| Be brief — 150–250 words per email | Write more than 3–4 short paragraphs |
| Tell them if they are not yet ready | Overpromise fit before scoping |
