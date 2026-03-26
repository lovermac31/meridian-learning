# Jurassic English — Operator Template Pack
**Internal use only · Jurassic English / World Wise Learning · March 2026**

---

## Overview

Eight email templates covering the key touchpoints in the JE lead pipeline. Each template is:
- Short — no longer than necessary
- Written in the JE/WWL voice: warm, professional, and direct
- Paired with a subject line
- Annotated with merge fields in `[brackets]`
- Paired with the pipeline stage it belongs to

Use these as starting points. Adjust for the specific lead's context, buyer type, and tone.

---

## Template 1 — Review Complete / Initial Response (Context-Dependent Alignment)

**When to use**: Lead has been triaged; alignment = `context_dependent`; you need to ask a qualifying question before sending the access link.

**Tracker action**: `lead_status` = `Reviewed` (hold at this stage until reply received)

---

**Subject**: Your Jurassic English enquiry — a quick question before we proceed

```
Hi [Full Name],

Thank you for your interest in Jurassic English — we appreciate you taking
the time to get in touch.

Before we send across the private Plans & Pricing briefing, it would help
to understand your context a little better:

[Insert one focused qualifying question — e.g.
"Are you looking at this as a whole-school programme, or for a specific
year group or department?"]

This helps us make sure the briefing is relevant to what you're working on.
It only takes a moment to reply.

Kind regards,
[Operator Name]
Jurassic English / World Wise Learning
info@jurassicenglish.com
```

**Usage notes**:
- Use only one qualifying question per email — not a list
- Frame it as helping them, not screening them
- If no reply after 5 business days, send a single follow-up; if no reply after a further 5 days, move to `On Hold`

---

## Template 2 — Access Link Sent

**When to use**: Decision = Approve; access link generated; ready to send the gated pricing briefing.

**Tracker action**: `lead_status` → `Access Sent`; `last_contacted_at` → today

---

**Subject**: Jurassic English — your Plans & Pricing access

```
Hi [Full Name],

Thank you for your interest in Jurassic English.

Your access to the private Plans & Pricing briefing is now available at
the secure link below:

[ACCESS_URL]

This gives you an overview of our implementation pathways, service
structure, and pricing context. The link is valid for 7 days.

If you would like to discuss the most appropriate pathway for
[your school / your team / your organisation], I would be glad to
arrange a short Discovery Call — no obligation.

Kind regards,
[Operator Name]
Jurassic English / World Wise Learning
info@jurassicenglish.com
```

**Usage notes**:
- Replace `[ACCESS_URL]` with the signed URL from `api/generate-pricing-access-link`
- Replace the bracketed phrase with the appropriate context: `your school`, `your team`, `your organisation`
- Do not personalise this template with pricing specifics — that comes in the proposal
- This is the approved access email template (`docs/Plans-Pricing-Access-Email-Template.md`) with an added Discovery Call invitation

---

## Template 3 — Discovery Call Invitation

**When to use**: Lead has replied, expressed interest, or you are proactively inviting a `school_admin` or `institutional_partner` lead to a call.

**Tracker action**: Send before or alongside the access link depending on buyer type; `lead_status` remains `Access Sent` until call is booked

---

**Subject**: Jurassic English — scheduling our Discovery Call

```
Hi [Full Name],

I'd love to arrange a short Discovery Call — 30 minutes, no cost, no
obligation — to understand your situation and make sure the programme
is a strong fit for [school/organisation name].

Here are a few options:

- [Day, Date] at [Time] [Time Zone]
- [Day, Date] at [Time] [Time Zone]
- [Day, Date] at [Time] [Time Zone]

If none of these work, just let me know your availability and I will
find a time that suits.

Kind regards,
[Operator Name]
Jurassic English / World Wise Learning
info@jurassicenglish.com
```

**Usage notes**:
- Always offer 2–3 specific options — do not say "let me know when you're free"
- Include time zone explicitly
- Keep it short — this email's job is to get a reply, not to sell
- Once call is confirmed: send a calendar invite with subject `Jurassic English — Discovery Call with [Name], [Organisation]`; include a one-sentence agenda in the body

---

## Template 4 — Discovery Call Follow-Up

**When to use**: Discovery Call has been held; lead is qualified; confirming next steps.

**Tracker action**: `lead_status` → `Qualified`; `discovery_call_date` → today; `last_contacted_at` → today

---

**Subject**: Following our conversation — Jurassic English next steps

```
Hi [Full Name],

Great to speak with you today — thank you for the time.

Following our conversation, the next step is:

[One clear sentence: e.g. "I'll prepare a proposal for a Full School
Licence for [school name] and send it across by [date]." OR "I'll share
the Resource Allocation Audit questions by end of this week so we can
scope the engagement properly."]

In the meantime, please don't hesitate to reply with any questions.

Kind regards,
[Operator Name]
Jurassic English / World Wise Learning
info@jurassicenglish.com
```

**Usage notes**:
- Send same day or first thing the following morning
- The one clear sentence is the most important line — do not leave the next step vague
- If Resource Allocation Audit is the next step, attach or link the RAA questions
- If the proposal is the next step, confirm the delivery date in writing

---

## Template 5 — Proposal Sent

**When to use**: Formal proposal or scoping report has been prepared and is ready to send.

**Tracker action**: `lead_status` → `Proposal Pending`; `proposal_sent_at` → today; `last_contacted_at` → today

---

**Subject**: Jurassic English — proposal for [Organisation Name]

```
Hi [Full Name],

As discussed, please find attached the proposal for [brief description:
e.g. "a Full School Licence for [school name]" / "Teacher Training for
your department"].

The proposal covers:
- [Key point 1 — e.g. recommended service tier]
- [Key point 2 — e.g. pricing and timeline]
- [Key point 3 — e.g. next steps if you'd like to proceed]

I'm happy to walk through it on a call if that would be useful — just
let me know.

Please feel free to reply with any questions.

Kind regards,
[Operator Name]
Jurassic English / World Wise Learning
info@jurassicenglish.com
```

**Usage notes**:
- Replace the bullet points with 2–3 actual highlights from the specific proposal
- Keep the email short — the proposal document carries the detail
- Attach the proposal as a PDF; do not paste the content into the email body
- After sending, set your Day 5, Day 14, and Day 28 follow-up reminders

---

## Template 6 — No-Show Follow-Up

**When to use**: Lead did not attend the scheduled Discovery Call. Use a version of this template up to three times before moving to On Hold.

**Tracker action**: No status change; `last_contacted_at` → today; Notes: log no-show attempt number

---

**Attempt 1 (Day of no-show)**

**Subject**: Jurassic English — missed you today

```
Hi [Full Name],

It looks like we missed each other for our call today. No problem at
all — these things happen.

I'm happy to reschedule at a time that works better for you. Here are
a couple of options:

- [Day, Date] at [Time] [Time Zone]
- [Day, Date] at [Time] [Time Zone]

Or just reply with your availability and I'll arrange something.

Kind regards,
[Operator Name]
Jurassic English / World Wise Learning
info@jurassicenglish.com
```

---

**Attempt 2 (Day 3)**

**Subject**: Jurassic English — rescheduling our call

```
Hi [Full Name],

Just following up on my note from earlier this week — I wanted to check
in and see if one of the times below might work for a rescheduled call:

- [Day, Date] at [Time] [Time Zone]
- [Day, Date] at [Time] [Time Zone]

Happy to work around your schedule.

Kind regards,
[Operator Name]
Jurassic English / World Wise Learning
info@jurassicenglish.com
```

---

**Attempt 3 (Day 10 — final)**

**Subject**: Jurassic English — leaving the door open

```
Hi [Full Name],

I'll leave this here in case the timing works better at a later point —
please feel free to get in touch whenever suits you.

If there's anything I can answer by email in the meantime, I'm happy to help.

Kind regards,
[Operator Name]
Jurassic English / World Wise Learning
info@jurassicenglish.com
```

**Usage notes after Attempt 3**: Move to `On Hold`; log "No-show x3"; set 30-day re-engagement check.

---

## Template 7 — Hold / Defer

**When to use**: Lead has requested a pause; or you are placing a lead on hold with their knowledge (e.g. they've said "come back to us in the new term").

**Tracker action**: `lead_status` → `On Hold`; `outcome` → `Hold — [reason]`; set re-engagement date in Notes

---

**Subject**: Jurassic English — picking this up [timeframe]

```
Hi [Full Name],

Understood — [brief acknowledgement of their situation: e.g. "we'll let
the budget cycle run its course" / "we'll revisit once the new academic
year is underway"].

I'll follow up with you around [month/date] to see if the timing is
right to pick this up.

In the meantime, please don't hesitate to get in touch if anything
changes or if you have questions.

Kind regards,
[Operator Name]
Jurassic English / World Wise Learning
info@jurassicenglish.com
```

**Usage notes**:
- Use this when the lead has indicated a specific future point — match their language
- Log the stated re-engagement date in the Notes column and set a calendar reminder
- Do not use this as a way to avoid a difficult conversation — if the lead is not interested, use Template 8

---

## Template 8 — Close-Lost Polite Closeout

**When to use**: Lead has declined; or proposal follow-up sequence complete with no response; or lead confirmed the opportunity will not proceed.

**Tracker action**: `lead_status` → `Closed Lost`; `outcome` → `Lost — [reason]`; `last_contacted_at` → today

---

**Subject**: Jurassic English — closing our conversation for now

```
Hi [Full Name],

Thank you for considering Jurassic English. I appreciate you taking the
time to explore whether it might be a fit for [your school / your team /
your organisation].

I'll leave the door open — if your situation changes or if there's ever
a good moment to revisit, please feel free to get in touch.

Kind regards,
[Operator Name]
Jurassic English / World Wise Learning
info@jurassicenglish.com
```

**Variant — when it is clear the lead did not want to engage:**
If the lead never replied after the access link and follow-up sequence, you do not need to send this email. Move to `Closed Lost` in the tracker; no outbound contact required. This template is for leads who were actively engaged but the outcome did not progress.

**Usage notes**:
- Keep it gracious and brief — no hard sell, no list of reasons to reconsider
- Do not apologise, over-explain, or ask "what could we have done differently?" in the email
- If you genuinely want feedback, wait 2–3 weeks and send a separate, very short note

---

## Template Usage Map

| Stage transition | Template |
|----------------|----------|
| Reviewed → (qualifying question first) | Template 1 |
| Reviewed → Access Sent | Template 2 |
| Any → Awaiting Discovery Call (booking) | Template 3 |
| Awaiting Discovery Call → Qualified (post-call) | Template 4 |
| Qualified → Proposal Pending | Template 5 |
| No-show (up to x3) | Template 6 |
| Any → On Hold (with lead's knowledge) | Template 7 |
| Proposal Pending → Closed Lost | Template 8 |

---

*Last updated: 26 March 2026 · Maintained by: Jay Adams / World Wise Learning*
