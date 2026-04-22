# Jurassic English — CRM & Data Architecture
**Internal use only · Jurassic English · April 2026**

---

## 1. Architecture Overview

Jurassic English operates a dual-store CRM model. Every pricing registration writes to two durable stores in parallel. Get Started submissions write to Supabase only.

### Source of Truth

| Layer | System | Scope | Role |
|---|---|---|---|
| **Primary** | Supabase (`je_leads`) | Pricing registrations | Permanent system of record |
| **Primary** | Supabase (`je_get_started_submissions`) | Get Started submissions | Permanent system of record |
| **Mirror** | Notion (`JE Leads` database) | Pricing registrations only | Operator-facing CRM view |
| **Alert** | Email via Resend | Both form types | Human notification |

Supabase is the authoritative record for all data. Notion is a best-effort mirror used for operator triage and pipeline management. Email gates the HTTP success response — Supabase and Notion writes run in parallel and are never exposed to the submitting user.

### Write Path — Pricing Registrations

```
POST /api/pricing-registration
        │
        ▼
  Validate + normalise
        │
        └── Promise.all [all three run in parallel, capped at 4s each]
              │
              ├── Supabase write ──► je_leads          (PRIMARY — permanent)
              │   SUPABASE_WRITE_KEY · RLS enabled · bypassed by secret key
              │
              ├── Notion write ──► JE Leads database   (MIRROR — best-effort)
              │   NOTION_TOKEN · 4s timeout cap · never throws
              │
              └── Email ──► info@jurassicenglish.com   (ALERT — gates HTTP response)
                  RESEND_API_KEY · result determines 200 / 502 / 503
```

### Write Path — Get Started Submissions

```
POST /api/get-started
        │
        ▼
  Validate + normalise
        │
        └── Promise.all
              │
              ├── Supabase write ──► je_get_started_submissions  (PRIMARY)
              │   SUPABASE_WRITE_KEY · 4s timeout cap
              │
              └── Email ──► info@jurassicenglish.com             (ALERT)
                  RESEND_API_KEY · result determines HTTP response
```

**Get Started does not write to Notion.**

---

## 2. Supabase Data Layer (Primary)

**Project:** Jurassic English (`hvuohtenmsqlsqrbgveg`, ap-northeast-2)
**Endpoint:** `https://hvuohtenmsqlsqrbgveg.supabase.co`
**Write credential:** `SUPABASE_WRITE_KEY` (`sb_secret_*` format — bypasses RLS)
**RLS:** Enabled on both tables. No anon SELECT policy — data is not publicly readable.

---

### Table: `je_leads` — Pricing Registrations

| Column | Type | Required | Source |
|---|---|---|---|
| `id` | UUID (PK) | System | Auto-generated |
| `registration_id` | TEXT (unique) | Yes | CRM mapper — `JE-[BT]-[MAOI]-[base36]` |
| `submitted_at` | TIMESTAMPTZ | Yes | Form submission time |
| `full_name` | TEXT | Yes | Form |
| `work_email` | TEXT | Yes | Form |
| `role_title` | TEXT | Yes | Form |
| `organisation_name` | TEXT | Yes | Form |
| `country_region` | TEXT | Yes | Form |
| `buyer_type` | TEXT | Yes | Form (validated enum) |
| `interest_area` | TEXT | Yes | Form (validated enum) |
| `contact_consent` | BOOLEAN | Yes | Form |
| `alignment_status` | TEXT | Yes | CRM mapper output |
| `service_category` | TEXT | Yes | CRM mapper output |
| `pricing_range_summary` | TEXT | Yes | CRM mapper output |
| `recommended_next_step` | TEXT | Yes | CRM mapper output |
| `lead_status` | TEXT | Yes | Default: `new` |
| `organisation_size` | TEXT | No | Form (if provided) |
| `phone_whatsapp` | TEXT | No | Form (if provided) |
| `preferred_contact_method` | TEXT | No | Form (if provided) |
| `timeline` | TEXT | No | Form (if provided) |
| `message` | TEXT | No | Form (if provided) |
| `created_at` | TIMESTAMPTZ | System | Auto-generated |
| `updated_at` | TIMESTAMPTZ | System | Auto-updated via trigger |

---

### Table: `je_get_started_submissions` — Get Started Form

| Column | Type | Required | Source |
|---|---|---|---|
| `id` | UUID (PK) | System | Auto-generated |
| `submission_id` | TEXT (unique) | Yes | Generated on submission |
| `submitted_at` | TIMESTAMPTZ | Yes | Form submission time |
| `full_name` | TEXT | Yes | Form |
| `work_email` | TEXT | Yes | Form |
| `organisation_name` | TEXT | Yes | Form |
| `organisation_type` | TEXT | Yes | Form |
| `primary_interest` | TEXT | Yes | Form |
| `challenge` | TEXT | Yes | Form |
| `contact_consent` | BOOLEAN | Yes | Form |
| `newsletter_opt_in` | BOOLEAN | Yes | Form |
| `role_title` | TEXT | No | Form (if provided) |
| `country_region` | TEXT | No | Form (if provided) |
| `age_range` | TEXT | No | Form (if provided) |
| `learner_count` | TEXT | No | Form (if provided) |
| `standards_context` | TEXT | No | Form (if provided) |
| `timeline` | TEXT | No | Form (if provided) |
| `decision_stage` | TEXT | No | Form (if provided) |
| `success_definition` | TEXT | No | Form (if provided) |
| `notes` | TEXT | No | Form (if provided) |
| `created_at` | TIMESTAMPTZ | System | Auto-generated |

---

## 3. Notion CRM Mirror (Secondary — Pricing Registrations Only)

The Notion `JE Leads` database is a best-effort mirror of `je_leads`. It exists for operator triage, pipeline management, and Discovery Call tracking. It is not the system of record. If a Notion write fails, the Supabase record is authoritative.

**Scope:** Pricing registrations (`/api/pricing-registration`) only. Get Started submissions do not write to Notion.

---

### Notion Database Schema: `JE Leads`

Create as a **full-page Notion database**. Set `Registration ID` as the **Title property** — it is the primary key.

**23 properties total. 14 written automatically on intake. 9 are operator-managed.**

#### Auto-Written on Intake

| Property | Notion type | Source | Notes |
|---|---|---|---|
| `Registration ID` | Title | CRM mapper | Primary key — `JE-[BT]-[MAOI]-[base36]`. Never edited after creation. |
| `Submitted At` | Date | Form | ISO 8601, UTC stored; display in local timezone. |
| `Full Name` | Text | Form | As submitted. |
| `Work Email` | Email | Form | Lowercase. Used for access link generation. |
| `Organisation` | Text | Form | School / institution / org name. |
| `Role / Title` | Text | Form | As submitted. |
| `Country / Region` | Text | Form | As submitted. |
| `Buyer Type` | Select | CRM mapper | 5 options — canonical key. |
| `Main Area of Interest` | Select | CRM mapper | 6 options — canonical key. |
| `Alignment Status` | Select | CRM mapper | 4 options. Drives SLA and triage logic. |
| `Service Category` | Text | CRM mapper | Human label of MAOI. |
| `Pricing Range Summary` | Text | CRM mapper | From service catalogue. |
| `Recommended Next Step` | Text | CRM mapper | CTA for this buyer type. |
| `Lead Status` | Status | System | Hardcoded `New` on creation. Updated manually by operator. |

#### Optional — Written Only If Submitted

| Property | Notion type | Source |
|---|---|---|
| `Organisation Size` | Text | Form |
| `Timeline` | Text | Form |
| `Notes` | Text | Form message on creation; operator appends manually. |
| `Phone / WhatsApp` | Text | Form |
| `Preferred Contact Method` | Select | Form — `email` / `phone_whatsapp` / `either` |

#### Operator-Managed (Not Written on Intake)

| Property | Notion type | Set when |
|---|---|---|
| `Owner` | Person or Text | Triage |
| `Last Contacted` | Date | After every outbound contact |
| `Discovery Call Date` | Date | When call is held |
| `Proposal Sent` | Date | When proposal is dispatched |
| `Outcome` | Text | On terminal or hold status |

---

### Select Options

**`Buyer Type`** (5):
`school_admin` · `teacher_cpd_lead` · `parent_guardian` · `institutional_partner` · `other`

**`Main Area of Interest`** (6):
`teacher_training` · `school_licensing` · `curriculum_review` · `academic_consulting` · `institutional_partnerships` · `digital_reasoning_engine`

**`Alignment Status`** (4):

| Value | Meaning | SLA |
|---|---|---|
| `primary` | Strong fit | Act same day |
| `secondary` | Related fit | Act within 2 days |
| `context_dependent` | Qualifying questions required | Schedule call before committing |
| `manual_review` | Pause — escalate | No contact until reviewed |

**`Lead Status`** (9):
`New` · `Reviewed` · `Access Sent` · `Awaiting Discovery Call` · `Qualified` · `Proposal Pending` · `Closed Won` · `Closed Lost` · `On Hold`

---

### Exact Payload-to-Notion Mapping

| Notion property | Supabase column | Transformation |
|---|---|---|
| `Registration ID` | `registration_id` | None |
| `Submitted At` | `submitted_at` | ISO 8601 → Notion `date.start` |
| `Full Name` | `full_name` | None |
| `Work Email` | `work_email` | None |
| `Organisation` | `organisation_name` | None |
| `Role / Title` | `role_title` | None |
| `Country / Region` | `country_region` | None |
| `Buyer Type` | `buyer_type` | `normaliseBuyerType()` — e.g. `school_administrator` → `school_admin` |
| `Main Area of Interest` | `interest_area` | `normaliseMAOI()` |
| `Alignment Status` | `alignment_status` | From CRM mapper `classifyAlignment()` |
| `Service Category` | `service_category` | Human label from `MAOI_LABELS` |
| `Pricing Range Summary` | `pricing_range_summary` | From `SERVICE_CATALOGUE` |
| `Recommended Next Step` | `recommended_next_step` | From `CTA_MAP[btKey]` |
| `Lead Status` | — | Always hardcoded `New` |
| `Organisation Size` | `organisation_size` | Optional — only written if present |
| `Timeline` | `timeline` | Optional — only written if present |
| `Notes` | `message` | Optional — form message on creation |
| `Phone / WhatsApp` | `phone_whatsapp` | Optional — only written if present |
| `Preferred Contact Method` | `preferred_contact_method` | Optional — only written if present |

**Normalisation rules:**
- All `rich_text` values truncated at 2,000 characters (Notion block limit)
- `Work Email` written as Notion `email` property type, not `rich_text`
- Dates passed as ISO 8601 strings to `date.start` — Notion accepts this format
- Optional fields are never written as empty strings — omitted entirely when absent
- If a Select option does not exist in the database, Notion creates it automatically

---

### Duplicate Prevention

Before creating a page, the Notion writer queries the database for any existing record matching the current `registration_id`. If found, the create is skipped and `{ ok: true, reason: 'duplicate_skipped' }` is returned.

If the duplicate check itself fails (network error, bad auth), `isDuplicate()` returns `false` and the create proceeds. This means a failed check causes a create attempt — preferable to silently dropping the write. If the root cause is a configuration issue, the create will fail with a distinct error.

---

## 4. Write Path and Failure Handling

### Write Order — Pricing Registrations

```
1. Validate and normalise submission
2. Launch three paths simultaneously (Promise.all):
   a. writeSupabaseLead(registration)     — 4s cap, never throws
   b. safeNotionWrite(registration)       — 4s cap, never throws
   c. sendPricingRegistrationNotification — 8s cap
3. Log all three results
4. HTTP response determined by email result only:
   - sent    → 200 { ok: true, submissionId }
   - skipped → 503 (transport not configured)
   - failed  → 502 (delivery failure)
5. Supabase and Notion results are logged but never exposed in the HTTP response
```

### Failure Handling Table — Pricing Registrations

| Scenario | Supabase | Notion | Email | HTTP | Recovery |
|---|---|---|---|---|---|
| All succeed | `created` | `created` | `sent` | 200 ✅ | Normal path |
| Notion fails, others succeed | `created` | `{ ok: false }` logged | `sent` | 200 ✅ | Lead in Supabase and email; Notion row can be added manually |
| Notion times out | `created` | `notion_timeout` logged | `sent` | 200 ✅ | Same as above |
| Supabase fails, email succeeds | `{ ok: false }` logged | (attempted) | `sent` | 200 ✅ | Lead recoverable from intake email and Notion if Notion succeeded |
| Email fails, Supabase succeeds | `created` | (attempted) | `failed` | 502 ❌ | Lead in Supabase; user shown retry message |
| Email skipped (no config) | `created` | (attempted) | `skipped` | 503 ❌ | Transport not configured |
| Both Supabase and email fail | `{ ok: false }` | (attempted) | `failed` | 502 ❌ | Lead lost — user shown retry message |
| Supabase not configured | `not_configured` | (attempted) | (normal) | Per email | Missing `SUPABASE_URL` or `SUPABASE_WRITE_KEY` |
| Notion not configured | `created` | `not_configured` | `sent` | 200 ✅ | Missing `NOTION_TOKEN` or `NOTION_JE_LEADS_DB_ID` — graceful skip |

**Recovery for Supabase failure when email succeeded:** The intake email contains the full §8 Structured Record. The `registration_id` in the email is the same key that would have been written to Supabase. Manual re-insertion is possible from the email.

---

### Audit Logging

Every write outcome is logged to the serverless function console (visible in Vercel Runtime Logs). All Supabase logs are tagged `[supabase]`; all Notion logs are tagged `[notion]`.

| Level | Event |
|---|---|
| `console.info` | Record created — includes `submissionId` / `rowId` / `pageId` |
| `console.info` | Duplicate skipped |
| `console.warn` | Env not configured — lists which vars are missing |
| `console.warn` | Timeout hit (4s cap reached) |
| `console.error` | Insert / page create failed — includes HTTP status and truncated response |
| `console.error` | Network error |

---

## 5. Canonical Field Schema

This schema defines the canonical field structure for the JE lead tracker. Fields map to both the Supabase `je_leads` columns and the Notion `JE Leads` properties.

### Group A — System-Sourced Fields
*Written automatically on intake. Copy directly from §8 Structured Record in the intake email. Never type these manually.*

---

#### `registration_id` / `Registration ID`
| Attribute | Value |
|---|---|
| Supabase column | `registration_id` (TEXT, unique) |
| Notion property | `Registration ID` (Title) |
| Format | `JE-[BT]-[MAOI]-[base36]` e.g. `JE-SCH-TRT-MO2QE1ZB` |
| Required | Yes — primary key |
| Unique | Yes — one record per registration ID |
| Notes | Never duplicate. If the same person submits twice, create two rows and cross-reference in Notes. |

---

#### `submitted_at` / `Submitted At`
| Attribute | Value |
|---|---|
| Supabase column | `submitted_at` (TIMESTAMPTZ) |
| Notion property | `Submitted At` (Date) |
| Format | ISO 8601 (`2026-04-17T09:03:40.402Z`) — display as local date/time |
| Required | Yes |
| Notes | Always stored as UTC. Used for SLA tracking and lead aging. |

---

#### `full_name` / `Full Name`
| Attribute | Value |
|---|---|
| Supabase column | `full_name` (TEXT) |
| Notion property | `Full Name` (Text) |
| Required | Yes |
| Notes | As submitted on the form. Do not alter. |

---

#### `work_email` / `Work Email`
| Attribute | Value |
|---|---|
| Supabase column | `work_email` (TEXT) |
| Notion property | `Work Email` (Email) |
| Required | Yes |
| Unique | Yes per active lead — flag duplicates |
| Notes | Lowercase. Used for access link generation — must match exactly. |

---

#### `organisation_name` / `Organisation`
| Attribute | Value |
|---|---|
| Supabase column | `organisation_name` (TEXT) |
| Notion property | `Organisation` (Text) |
| Required | Yes |
| Notes | School, institution, or organisation name as submitted. |

---

#### `buyer_type` / `Buyer Type`
| Attribute | Value |
|---|---|
| Supabase column | `buyer_type` (TEXT) |
| Notion property | `Buyer Type` (Select) |
| Allowed values | `school_administrator` (Supabase) · `school_admin` (Notion — normalised by `normaliseBuyerType()`) · `teacher_cpd_lead` · `parent_guardian` · `institutional_partner` · `other` |
| Required | Yes |
| Notes | If reclassified during a Discovery Call, update and log the change in Notes with the date. |

---

#### `interest_area` / `Main Area of Interest`
| Attribute | Value |
|---|---|
| Supabase column | `interest_area` (TEXT) |
| Notion property | `Main Area of Interest` (Select) |
| Allowed values | `teacher_training` · `school_licensing` · `curriculum_review` · `academic_consulting` · `institutional_partnerships` · `digital_reasoning_engine` |
| Required | Yes |
| Notes | If scope shifts during Discovery Call, update to the primary and note the secondary in Notes. |

---

#### `alignment_status` / `Alignment Status`
| Attribute | Value |
|---|---|
| Supabase column | `alignment_status` (TEXT) |
| Notion property | `Alignment Status` (Select) |
| Allowed values | `primary` · `secondary` · `context_dependent` · `manual_review` |
| Required | Yes |
| Notes | Drives SLA and first-response logic. Never override without logging the reason. |

---

#### `service_category` / `Service Category`
| Attribute | Value |
|---|---|
| Supabase column | `service_category` (TEXT) |
| Notion property | `Service Category` (Text) |
| Allowed values | `Teacher Training` · `School Licensing` · `Curriculum Review` · `Academic Consulting` · `Institutional Partnerships` · `Digital Reasoning Engine` |
| Required | Yes |
| Notes | Human-readable version of `interest_area`. Derived by CRM mapper. |

---

#### `pricing_range_summary` / `Pricing Range Summary`
| Attribute | Value |
|---|---|
| Supabase column | `pricing_range_summary` (TEXT) |
| Notion property | `Pricing Range Summary` (Text) |
| Required | Yes |
| Notes | System-generated from service catalogue. Do not modify. Actual proposal pricing may differ. |

---

#### `recommended_next_step` / `Recommended Next Step`
| Attribute | Value |
|---|---|
| Supabase column | `recommended_next_step` (TEXT) |
| Notion property | `Recommended Next Step` (Text) |
| Required | Yes |
| Notes | System-generated CTA based on buyer type. Starting point for first outbound contact. |

---

#### `lead_status` / `Lead Status`
| Attribute | Value |
|---|---|
| Supabase column | `lead_status` (TEXT, default `new`) |
| Notion property | `Lead Status` (Status) |
| Allowed values | `new` · `reviewed` · `access_sent` · `awaiting_discovery_call` · `qualified` · `proposal_pending` · `closed_won` · `closed_lost` · `on_hold` |
| Default | `new` (Supabase) / `New` (Notion) |
| Required | Yes |
| Notes | Update at every pipeline transition. See `JE-Status-Transition-Rules.md` for permitted transitions. |

---

### Group B — Operator-Managed Fields
*Set manually during triage, follow-up, and outcome recording. Not written on intake.*

---

#### `owner`
| Attribute | Value |
|---|---|
| Notion property | `Owner` (Person or Text) |
| Required | Yes — set at triage |
| Notes | Reassignment must be logged in Notes with a date. |

---

#### `last_contacted_at`
| Attribute | Value |
|---|---|
| Notion property | `Last Contacted` (Date) |
| Format | `YYYY-MM-DD` |
| Required | Update after every outbound contact |
| Notes | A stale value on an active lead is a red flag. |

---

#### `discovery_call_date`
| Attribute | Value |
|---|---|
| Notion property | `Discovery Call Date` (Date) |
| Format | `YYYY-MM-DD` |
| Required | When status = `Awaiting Discovery Call` or `Qualified` |
| Notes | Date the call was *held*, not booked. Leave blank until the call is successfully completed. |

---

#### `proposal_sent_at`
| Attribute | Value |
|---|---|
| Notion property | `Proposal Sent` (Date) |
| Format | `YYYY-MM-DD` |
| Required | When status = `Proposal Pending` |
| Notes | Anchors Day 5 / Day 14 / Day 28 follow-up sequence. |

---

#### `outcome`
| Attribute | Value |
|---|---|
| Notion property | `Outcome` (Text) |
| Format | `[Won/Lost/Hold] — [brief reason]` |
| Required | When status = `Closed Won`, `Closed Lost`, or `On Hold` |
| Examples | `Won — Full School Licence signed April 2026` · `Lost — Budget not available this cycle` |

---

#### `notes`
| Attribute | Value |
|---|---|
| Notion property | `Notes` (Text) |
| Format | Append-only — date prefix: `[2026-04-17] Access link sent.` |
| Required | Optional but strongly recommended |
| Notes | Never overwrite — always append. Running log of all activity. |

---

### Required Fields by Stage

#### Required at Entry (New → Reviewed)
All Group A fields must be present at triage. They come from the intake email or Supabase record.

| Field | Editable later? |
|---|---|
| `registration_id` | No |
| `submitted_at` | No |
| `full_name` | No |
| `work_email` | No |
| `organisation_name` | No |
| `buyer_type` | Yes — if reclassified, log the change |
| `interest_area` | Yes — if scope shifts, log the change |
| `alignment_status` | No |
| `service_category` | Yes — if MAOI updates |
| `pricing_range_summary` | No |
| `recommended_next_step` | No |
| `lead_status` | Yes — update at every transition |
| `owner` | Yes — log reassignment |

#### Required at Specific Stages

| Field | Required when |
|---|---|
| `last_contacted_at` | Every outbound contact |
| `discovery_call_date` | Status = `Awaiting Discovery Call` (confirm when held) |
| `proposal_sent_at` | Status = `Proposal Pending` |
| `outcome` | Status = `Closed Won`, `Closed Lost`, or `On Hold` |

---

## 6. Setup and Operations

### Environment Variables

#### Supabase (required)

```
SUPABASE_URL      = https://hvuohtenmsqlsqrbgveg.supabase.co
SUPABASE_WRITE_KEY = sb_secret_...
```

`SUPABASE_WRITE_KEY` is the `sb_secret_*` key from Supabase Dashboard → Settings → API Keys → Secret keys. It bypasses RLS and must never be exposed to the client bundle. Set in Vercel → Settings → Environment Variables (all environments).

#### Notion (optional — graceful skip if absent)

```
NOTION_TOKEN          = secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_JE_LEADS_DB_ID = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

`NOTION_TOKEN` is the Internal Integration Token from `notion.so/profile/integrations`. `NOTION_JE_LEADS_DB_ID` is the 32-character hex ID from the JE Leads database URL. If either is absent, Notion writes are skipped silently and Supabase remains unaffected.

---

### Notion Integration Setup

1. Go to `notion.so/profile/integrations` → `+ New integration` → name: `JE CRM Integration`
2. Capabilities: `Insert content`, `Read content`
3. Save — copy the **Internal Integration Token** (`secret_...`)
4. Open the JE Leads database → `...` → `Connect to` → `JE CRM Integration` → Confirm
5. Copy the 32-character database ID from the URL (before `?v=`)
6. Set `NOTION_TOKEN` and `NOTION_JE_LEADS_DB_ID` in Vercel and `.env.local`

---

### Verification

After any credential rotation or environment change:

1. Submit a test entry via the Plans & Pricing form on the live site
2. **Supabase:** Check `je_leads` for a new row matching the `submissionId` returned by the API
3. **Notion:** Check the JE Leads database for a new page with the matching `Registration ID`
4. **Vercel logs:** Filter for `[supabase]` and `[notion]` — confirm `created` status for both
5. **Email:** Confirm intake email arrived at `info@jurassicenglish.com`
6. Delete the test row from Supabase and the test page from Notion

---

*Last updated: 17 April 2026 · Maintained by: Jay Adams / Jurassic English*
