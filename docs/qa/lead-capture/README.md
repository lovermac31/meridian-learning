# Lead-capture audit and verification

## Form inventory on `origin/main`

| Surface | Fields and destination before this change | Contactability | Result |
| --- | --- | --- | --- |
| Sample-pack form (Home and Products) | Name, one generic required `contact`, child age, optional teacher flag, consent; `/api/sample-pack` writes `Email` and/or `Contact (Zalo / Phone)` to the Notion Leads database. | A generic value could be an arbitrary 9–15 digit number. No reliable phone normalization or explicit alternative. | Changed to primary Zalo/phone plus alternative email; at least one required. Server validates and normalizes Vietnamese phone to `+84…`; Notion prefers Zalo when present. |
| Pricing / registration modal | Required work email, optional WhatsApp phone; `/api/pricing-registration` writes Email and optional phone. | Contactable through required email. | No change. |
| Get Started | Institutional form, required work email and consent; `/api/get-started` writes to Supabase, not Notion. | Contactable through required email; not parent-facing. | No change. |
| Story Club enquiry | No site form; direct `/go/zalo/story-club` link. | Contact is direct through Zalo. | No change. |

The sample-pack form is rendered in both Home and Products; the four mobile screenshots cover both placements and both locales. The sample-pack endpoint keeps its existing Notion property names, `website` honeypot, and rate limiting. It rejects submissions before 30 seconds. The checked-out source had a 1.5-second minimum, while the task specifies the existing anti-spam contract as `startedAt ≥ 30 s`; this change applies and tests the task's 30-second threshold.

The existing `lead_submit` analytics event is emitted once after a successful sample-pack response. Browser evidence confirms the event contains no personal data. Browser tests ran against local preview routes with `/api/sample-pack` and `/api/event` mocked; no production form, Notion API, or external recipient was contacted.

## Evidence

- `browser-evidence.json` records 4 local browser cases at 375 px: Home/Products × EN/VI; each verifies missing-contact inline validation, phone-only success, exactly one `lead_submit`, and no personal data in the event.
- Screenshots: `sample-pack-home-en-375.png`, `sample-pack-home-vi-375.png`, `sample-pack-products-en-375.png`, `sample-pack-products-vi-375.png`.
- API handler tests mock Notion schema and page creation. They assert 400 for missing contact and invalid phone, successful phone-only and email-only cases, normalized Notion phone, Zalo preference, and no phone in logs. They also assert the 30-second guard and honeypot.
