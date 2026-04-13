# Operator Client Migration Worksheet

Use this worksheet to track the endpoint-by-endpoint migration from the legacy shared operator key to endpoint-scoped secrets.

This worksheet is operational only.

It does **not** authorize:
- legacy fallback removal
- public-route changes
- public API changes

## Working Rules

- Update one client at a time
- Do not allow one client to use mixed credentials across environments
- Mark `Migrated?` as `yes` only after scoped-auth verification passes
- Mark `Quiet Window Complete?` as `yes` only after the formal quiet-window rule has been satisfied for that endpoint/client path

## Migration Tracker

| Endpoint | Scoped Secret | Client/Script | Owner | Migrated? | Last Verified | Notes | Current Auth Mode | Secret Location | Source IP Type | Automation or Manual | Cutover Date | Quiet Window Complete? |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/api/generate-pricing-access-link` | `PRICING_ACCESS_LINK_OPERATOR_KEY` | Manual curl workflow documented in `docs/JE-Plans-Pricing-Operator-SOP.md §6` and `docs/JE-Sales-Workflow.md §7` | Jay Adams / World Wise Learning | `yes` | 2026-04-07 01:53 UTC | Live production verification passed after adding `PRICING_ACCESS_LINK_OPERATOR_KEY` and redeploying. `401` for no token, `401` for wrong token, `200` for scoped token. Deployment-specific Vercel runtime logs confirmed `[operator] action` with `authMode: 'scoped'`. Local script `scripts/generate-pricing-access-link.mjs` uses the signing secret directly and is outside endpoint auth cutover scope. | `scoped` | Operator workstation shell env | `variable` | `manual` | 2026-04-07 | `no` |
| `/api/inspect-notion-lead` | `NOTION_LEAD_INSPECT_OPERATOR_KEY` | Unknown. Endpoint is implemented and referenced in save-point notes as protected operator inspection tooling, but no current script, runbook, or documented operator consumer was found in `docs/`, `scripts/`, or `api/`. No production log evidence of recent usage was found during inventory confirmation. | Unknown — confirm before cutover | `no` | 2026-04-07 | Confirmed findings only: endpoint exists; intended purpose is ad hoc JE Leads inspection from production runtime; real current caller remains unconfirmed. Credential storage, source IP type, and manual vs automation status are still unknown. | `unknown` | Unknown | `unknown` | `unknown` |  | `no` |
| `/api/update-notion-je-leads-schema` | `NOTION_SCHEMA_OPERATOR_KEY` | Unknown. Endpoint is implemented and referenced in save-point notes as protected schema maintenance tooling, but no current script, runbook, or documented operator consumer was found in `docs/`, `scripts/`, or `api/`. No production log evidence of recent usage was found during inventory confirmation. | Unknown — confirm before cutover | `no` | 2026-04-07 | Confirmed findings only: endpoint exists; intended purpose is one-off JE Leads schema maintenance from production runtime; real current caller remains unconfirmed. Credential storage, source IP type, and manual vs automation status are still unknown. | `unknown` | Unknown | `unknown` | `unknown` |  | `no` |

## Field Guidance

### Endpoint

Use the exact production endpoint path.

### Scoped Secret

Record the endpoint-specific production environment variable:
- `PRICING_ACCESS_LINK_OPERATOR_KEY`
- `NOTION_LEAD_INSPECT_OPERATOR_KEY`
- `NOTION_SCHEMA_OPERATOR_KEY`

### Client/Script

Record the actual caller:
- script name
- local tool
- operator workflow
- internal runbook reference

### Owner

Record the human accountable for completing and verifying migration of that client.

### Migrated?

Allowed values:
- `no`
- `in_progress`
- `yes`

### Last Verified

Record the date and time of the latest successful verification using the intended auth mode.

### Notes

Use for:
- special handling notes
- known risks
- endpoint-specific cautions
- links to evidence if needed

### Current Auth Mode

Suggested values:
- `legacy_fallback`
- `scoped`
- `unknown`

### Secret Location

Record where the calling client currently reads its credential from, for example:
- Vercel env
- local `.env`
- CI secret store
- operator workstation vault

### Source IP Type

Suggested values:
- `fixed`
- `shared-fixed`
- `variable`
- `unknown`

### Automation or Manual

Suggested values:
- `automation`
- `manual`
- `mixed`

### Cutover Date

Record the date the client was switched to scoped auth.

### Quiet Window Complete?

Allowed values:
- `no`
- `yes`

Only mark `yes` after:
- the formal quiet window has passed
- no `legacy_fallback` events remain attributable to that client/workflow

## Recommended Usage Order

1. Fill `Client/Script`, `Owner`, `Secret Location`, `Source IP Type`, and `Automation or Manual`
2. Confirm the client is still on `legacy_fallback`
3. Cut over the client to the scoped secret
4. Verify endpoint success
5. Update `Migrated?`, `Current Auth Mode`, `Last Verified`, and `Cutover Date`
6. Monitor operator audit logs
7. Mark `Quiet Window Complete?` only after the formal removal condition is met
