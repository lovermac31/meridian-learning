# Jurassic English — Notion CRM Integration
**Internal use only · Jurassic English / World Wise Learning · March 2026**

---

## Overview

This document covers the Notion CRM integration for the Plans & Pricing intake workflow.
It combines the schema design (Phase 21), payload mapping (Phase 22), and cloud workflow
model (Phase 25) into a single operator and developer reference.

**Architecture principle**: The structured CRM payload produced by `je-crm-mapper.ts` is
the source of truth. Email remains human-readable notification. Notion is the operating CRM.

---

## Part 1 — Notion Database Schema (Phase 21)

### Database name: `JE Leads`

Create this database as a **full-page Notion database** (not inline).
Set `Registration ID` as the **Title property** — it is the primary key.

---

### Property Map

| Property name | Notion type | Required | Source | Notes |
|---------------|-------------|----------|--------|-------|
| `Registration ID` | **Title** | Yes | CRM mapper | Primary key — `JE-[BT]-[MAOI]-[base36]` format. Never edited after creation. |
| `Submitted At` | **Date** | Yes | Registration | ISO 8601 with time. UTC stored; display in local timezone. |
| `Full Name` | **Text** | Yes | Registration | As submitted. |
| `Work Email` | **Email** | Yes | Registration | Lowercase. Used for access link generation. |
| `Organisation` | **Text** | Yes | Registration | School / institution / org name. |
| `Role / Title` | **Text** | Yes | Registration | As submitted. |
| `Country / Region` | **Text** | Yes | Registration | As submitted. |
| `Buyer Type` | **Select** | Yes | CRM mapper | 5 options — canonical key. See options below. |
| `Main Area of Interest` | **Select** | Yes | CRM mapper | 6 options — canonical key. See options below. |
| `Alignment Status` | **Select** | Yes | CRM mapper | 4 options. Drives SLA and triage logic. |
| `Service Category` | **Text** | Yes | CRM mapper | Human label of the MAOI (e.g. "School Licensing"). |
| `Pricing Range Summary` | **Text** | Yes | CRM mapper | From service catalogue. |
| `Recommended Next Step` | **Text** | Yes | CRM mapper | CTA for this buyer type. |
| `Lead Status` | **Select** | Yes | System (New) / Operator | 9 values. Updated manually by operator through pipeline. |
| `Organisation Size` | **Text** | No | Registration | If provided on form. |
| `Timeline` | **Text** | No | Registration | If provided on form. |
| `Notes` | **Text** | No | Registration / Operator | Form message on creation; operator appends manually. |
| `Phone / WhatsApp` | **Text** | No | Registration | If provided on form. |
| `Preferred Contact Method` | **Select** | No | Registration | `email` / `phone_whatsapp` / `either`. |
| `Owner` | **Person** or Text | No | Operator | Set during triage. |
| `Last Contacted` | **Date** | No | Operator | Updated after every outbound contact. |
| `Discovery Call Date` | **Date** | No | Operator | Date call was held (not booked). |
| `Proposal Sent` | **Date** | No | Operator | Date proposal was dispatched. |
| `Outcome` | **Text** | No | Operator | `Won — [detail]` / `Lost — [reason]` / `Hold — [reason]`. |

**Total: 23 properties.** 14 are written automatically on intake. 9 are operator-managed.

---

### Select Options

**`Buyer Type`** (5 options):
| Value | Colour |
|-------|--------|
| `school_admin` | Blue |
| `teacher_cpd_lead` | Green |
| `parent_guardian` | Purple |
| `institutional_partner` | Red |
| `other` | Grey |

**`Main Area of Interest`** (6 options):
| Value | Colour |
|-------|--------|
| `teacher_training` | Blue |
| `school_licensing` | Green |
| `curriculum_review` | Purple |
| `academic_consulting` | Orange |
| `institutional_partnerships` | Red |
| `digital_reasoning_engine` | Grey |

**`Alignment Status`** (4 options):
| Value | Colour | Meaning |
|-------|--------|---------|
| `primary` | Green | Strong fit — act same day |
| `secondary` | Blue | Related fit — act within 2 days |
| `context_dependent` | Orange | Qualifying questions required first |
| `manual_review` | Red | Pause — escalate before any contact |

**`Lead Status`** (9 options):
| Value | Colour |
|-------|--------|
| `New` | Yellow |
| `Reviewed` | Blue |
| `Access Sent` | Blue |
| `Awaiting Discovery Call` | Blue |
| `Qualified` | Green |
| `Proposal Pending` | Orange |
| `Closed Won` | Green (dark) |
| `Closed Lost` | Red (light) |
| `On Hold` | Grey |

**`Preferred Contact Method`** (3 options):
`email` · `phone_whatsapp` · `either`

---

### Relation suggestions (for future expansion)

| Relation | Target database | Purpose |
|----------|----------------|---------|
| `Organisation` | JE Organisations DB | Link to a parent account record |
| `Owner` | Team members DB | Structured owner assignment with workload view |
| `Proposal` | JE Proposals DB | Link to proposal documents |

These relations are not required for the initial integration. Add them when the Notion workspace grows to multi-operator scale.

---

## Part 2 — Payload-to-Notion Mapping (Phase 22)

### Source: CRM Intake Payload

Every Plans & Pricing submission produces two objects before the Notion write:
1. `NormalizedPricingRegistration` — the contact and form data
2. `CrmContext` — the CRM classification output from `je-crm-mapper.ts`

The Notion writer calls `crmMap()` independently, matching the pattern used by the email builder.

---

### Exact Field Mapping

| Notion property | Source object | Source field | Transformation |
|----------------|--------------|-------------|----------------|
| `Registration ID` | `registration` | `submissionId` | None — `JE-[BT]-[MAOI]-[base36]` |
| `Submitted At` | `registration` | `submittedAt` | ISO 8601 → Notion date.start |
| `Full Name` | `registration` | `fullName` | None |
| `Work Email` | `registration` | `workEmail` | None (already lowercase) |
| `Organisation` | `registration` | `organizationName` | None |
| `Role / Title` | `registration` | `roleTitle` | None |
| `Country / Region` | `registration` | `countryRegion` | None |
| `Buyer Type` | `crmContext` | `buyerType.key` | `normaliseBuyerType(registration.buyerType)` |
| `Main Area of Interest` | `crmContext` | `maoi.key` | `normaliseMAOI(registration.interestArea)` |
| `Alignment Status` | `crmContext` | `alignment.status` | `classifyAlignment()` output |
| `Service Category` | `crmContext` | `maoi.label` | Human label from `MAOI_LABELS` |
| `Pricing Range Summary` | `crmContext` | `service.rangeSummary` | From `SERVICE_CATALOGUE` |
| `Recommended Next Step` | `crmContext` | `cta` | From `CTA_MAP[btKey]` |
| `Lead Status` | Hardcoded | `'New'` | Always `New` on creation |
| `Organisation Size` | `registration` | `organizationSize` | Optional — only written if present |
| `Timeline` | `registration` | `timeline` | Optional — only written if present |
| `Notes` | `registration` | `message` | Optional — form message on creation |
| `Phone / WhatsApp` | `registration` | `phoneWhatsapp` | Optional — only written if present |
| `Preferred Contact Method` | `registration` | `preferredContactMethod` | Optional — only written if present |

**Properties written by operator (not on intake):**
`Owner` · `Last Contacted` · `Discovery Call Date` · `Proposal Sent` · `Outcome`

---

### Normalisation Rules

| Rule | Detail |
|------|--------|
| Text truncation | All `rich_text` values truncated at 2,000 characters (Notion block limit) |
| Email | Written as Notion `email` property type — not `rich_text` |
| Dates | ISO 8601 strings passed directly to `date.start` — Notion accepts this format |
| Select values | If a select option does not exist in the database, Notion creates it automatically |
| Optional fields | Never written as empty strings — only written when the value is truthy |
| `buyerType` normalisation | `schema.buyerType` may be `school_administrator` — `normaliseBuyerType()` converts to `school_admin` |

---

### Duplicate Prevention

**Strategy**: Before creating a page, the writer queries the database for any existing record where `Registration ID` equals the current `submissionId`. If found, the create is skipped and `{ ok: true, reason: 'duplicate_skipped' }` is returned.

**Why the title property**:
- The `Registration ID` is a `JE-[BT]-[MAOI]-[base36]` string derived from `Date.now().toString(36)` — collision probability is negligible in normal operation
- However, network retries or test submissions could produce the same ID; the guard prevents duplicate records

**Duplicate check failure behaviour**:
- If the check itself fails (wrong token, wrong DB ID, network error), `isDuplicate()` returns `false` and the create proceeds
- This means a failed duplicate check causes a create attempt — preferable to silently swallowing the write
- The create will fail with a different error if the root cause is a configuration issue

---

## Part 3 — Cloud Workflow and Hardening (Phase 25)

### Source of Truth Hierarchy

```
Form submission
      │
      ▼
[Serverless function: api/pricing-registration.ts]
      │
      ├─── Notion write ──► JE Leads database (operating CRM — PRIMARY)
      │    [capped 4s]
      │
      └─── Email notification ──► info@jurassicenglish.com (human alert — SECONDARY)
```

Notion is the durable record. Email is the human-readable signal. The two paths run in parallel.

---

### Write Order

```
1. Validate and normalise submission
2. Launch both paths simultaneously (Promise.all):
   a. safeNotionWrite(registration)    — capped at 4s, never throws
   b. sendPricingRegistrationNotification(registration, mailConfig)
3. Log both results
4. Determine HTTP response based on email result only:
   - email sent    → 200 { ok: true, submissionId }
   - email skipped → 503 (transport not configured)
   - email failed  → 502 (delivery failure)
5. Notion result is logged but never exposed in the HTTP response
```

---

### Failure Handling Model

| Scenario | Notion outcome | Email outcome | HTTP response | Notes |
|----------|---------------|---------------|---------------|-------|
| Both succeed | `created` | `sent` | 200 ✅ | Normal path |
| Notion fails, email succeeds | `{ ok: false }` logged | `sent` | 200 ✅ | Lead in email; manually add to Notion |
| Notion times out, email succeeds | `notion_timeout` logged | `sent` | 200 ✅ | Same recovery path |
| Notion succeeds, email fails | `created` | `failed` | 502 ❌ | Lead in Notion; operator sees the submission |
| Notion succeeds, email skipped | `created` | `skipped` | 503 ❌ | Transport not configured — Notion record exists |
| Both fail | `{ ok: false }` logged | `failed` | 502 ❌ | Lead lost — user shown retry message |
| Notion not configured | `not_configured` logged | (normal) | Per email | Both env vars absent — graceful skip |
| 4s timeout hit | `notion_timeout` logged | (normal) | Per email | Notion was slow — does not stall the user |

**Recovery for Notion failures when email succeeded**:
The intake email contains the full §8 Structured Record. An operator can manually create the Notion record from the email using `JE-Lead-Tracker-Template.csv` as a reference. The Registration ID in the email is the same key that would have been written to Notion.

---

### Retry / Fallback Recommendation

**Current implementation**: Single attempt with 4-second cap. No automatic retry.

**Recommended future enhancement**: If `notionResult.ok === false` and `notification.status === 'sent'`, enqueue a retry job (e.g. Vercel Cron, a simple retry queue, or a background function) that retries the Notion write up to 3 times with exponential backoff. This handles transient Notion API unavailability without affecting the user experience.

**Not required for current scale**: At low submission volume (2–10/week), manual recovery from the email is practical and has no operational cost.

---

### Audit Logging

Every Notion write outcome is logged to the serverless function's console (visible in Vercel Runtime Logs):

| Log level | Event |
|-----------|-------|
| `console.info` | Lead created successfully — includes `submissionId` and `pageId` |
| `console.info` | Duplicate skipped — includes `submissionId` |
| `console.warn` | Env not configured — includes which vars are missing |
| `console.warn` | Duplicate check failed — proceeds with create |
| `console.warn` | 4s timeout hit |
| `console.error` | Page create failed — includes HTTP status and truncated response body |
| `console.error` | Network error during create |

All logs are tagged `[notion]` for easy filtering in Vercel Runtime Logs.

---

## Part 4 — Setup Instructions

### Step 1 — Create a Notion Integration

1. Go to `https://www.notion.so/profile/integrations`
2. Click `+ New integration`
3. Name: `JE CRM Integration`
4. Select your workspace
5. Capabilities: `Insert content`, `Read content` (no user information needed)
6. Save — copy the **Internal Integration Token** (`secret_...`)

### Step 2 — Create the JE Leads Database

1. Create a new full-page database in Notion
2. Set `Registration ID` as the **Title** property (rename the default "Name" property)
3. Add all properties from the schema above with the correct types
4. Add the select options and colours

### Step 3 — Share the Database with the Integration

1. Open the JE Leads database page
2. Click `...` → `Connect to` → search for `JE CRM Integration` → `Confirm`
3. The integration now has read/write access to this database

### Step 4 — Find the Database ID

The database ID is in the URL when you open the database as a full page:
```
https://www.notion.so/{workspace}/{DATABASE_ID}?v={view_id}
```
Copy the 32-character hex segment before the `?v=` parameter. Hyphens are optional.

### Step 5 — Set Environment Variables

In Vercel (Settings → Environment Variables):
```
NOTION_TOKEN           = secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_JE_LEADS_DB_ID  = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

For local development, add to `.env.local`:
```
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_JE_LEADS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 6 — Verify

Submit a test lead via the Plans & Pricing form. Check:
1. Vercel Runtime Logs: look for `[notion] lead record created` with a `pageId`
2. Notion JE Leads database: new record with `Registration ID` = the `submissionId` from the API response
3. Email: existing CRM intake email still arrives at `info@jurassicenglish.com`

---

*Last updated: 26 March 2026 · Maintained by: Jay Adams / World Wise Learning*
