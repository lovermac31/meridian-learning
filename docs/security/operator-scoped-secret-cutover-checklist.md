# Operator Scoped-Secret Cutover Checklist

## 1. Objective

Cut over the operator endpoints on `jurassicenglish.com` from the current legacy shared bearer-token model to endpoint-scoped operator secrets, with optional IP allowlisting and explicit audit-log verification.

This checklist is operational only.

This checklist does **not** include:
- removal of legacy fallback in this phase
- public-route changes
- public API changes

## 2. Endpoints In Scope

- `/api/generate-pricing-access-link`
- `/api/inspect-notion-lead`
- `/api/update-notion-je-leads-schema`

## 3. Current Model vs Target Model

### Current model

- Scoped-secret support is already live in code
- Legacy shared fallback remains enabled through:
  - `PRICING_ACCESS_OPERATOR_KEY`
- If a scoped key is absent, the operator helper can still authenticate with the legacy shared key
- Optional IP allowlisting is supported in code but may not yet be configured in production

### Target model

- `/api/generate-pricing-access-link`
  - `PRICING_ACCESS_LINK_OPERATOR_KEY`
- `/api/inspect-notion-lead`
  - `NOTION_LEAD_INSPECT_OPERATOR_KEY`
- `/api/update-notion-je-leads-schema`
  - `NOTION_SCHEMA_OPERATOR_KEY`
- Operator audit logs show `authMode: "scoped"`
- Optional IP allowlists are enforced where feasible
- Legacy shared fallback is removed only after quiet-window criteria are met

## 4. Required Production Env Vars

### Scoped operator secrets

- `PRICING_ACCESS_LINK_OPERATOR_KEY`
- `NOTION_LEAD_INSPECT_OPERATOR_KEY`
- `NOTION_SCHEMA_OPERATOR_KEY`

### Legacy fallback kept temporarily during migration

- `PRICING_ACCESS_OPERATOR_KEY`

### Optional IP allowlists

- `OPERATOR_IP_ALLOWLIST`
- `PRICING_ACCESS_LINK_OPERATOR_IP_ALLOWLIST`
- `NOTION_LEAD_INSPECT_OPERATOR_IP_ALLOWLIST`
- `NOTION_SCHEMA_OPERATOR_IP_ALLOWLIST`

### Existing endpoint dependencies that must remain unchanged

- `PRICING_ACCESS_SIGNING_SECRET`
- `NOTION_TOKEN`
- `NOTION_JE_LEADS_DB_ID`

## 5. Preparation Checklist

- [ ] Confirm the three operator endpoints in scope are the only endpoints using the operator helper path for this migration
- [ ] Create or update the operator inventory table before cutover
- [ ] Document for each endpoint:
  - client/script
  - owner
  - current credential source
  - expected source IPs if allowlisting is planned
- [ ] Generate three new strong scoped secrets
  - recommended minimum: 24+ characters
  - use distinct values per endpoint
- [ ] Confirm no client is expected to use mixed credentials during migration
- [ ] Decide whether IP allowlisting is:
  - deferred
  - shared via `OPERATOR_IP_ALLOWLIST`
  - per-endpoint
- [ ] Confirm rollback access to Vercel production environment variable management

## 6. Production Env Setup Checklist

- [ ] Add `PRICING_ACCESS_LINK_OPERATOR_KEY` to Vercel production env
- [ ] Add `NOTION_LEAD_INSPECT_OPERATOR_KEY` to Vercel production env
- [ ] Add `NOTION_SCHEMA_OPERATOR_KEY` to Vercel production env
- [ ] Keep `PRICING_ACCESS_OPERATOR_KEY` present during migration
- [ ] If allowlisting is being rolled out, add the chosen allowlist env vars
- [ ] Confirm the following remain unchanged:
  - `PRICING_ACCESS_SIGNING_SECRET`
  - `NOTION_TOKEN`
  - `NOTION_JE_LEADS_DB_ID`
- [ ] Trigger production env refresh / deployment if required by the hosting workflow

## 7. Client Migration Checklist

Perform migration one endpoint at a time.

### Endpoint 1: `/api/generate-pricing-access-link`

- [ ] Identify all clients/scripts calling this endpoint
- [ ] Update each client to use `PRICING_ACCESS_LINK_OPERATOR_KEY`
- [ ] Verify success with scoped auth
- [ ] Mark each client as migrated in the inventory

### Endpoint 2: `/api/inspect-notion-lead`

- [ ] Identify all clients/scripts calling this endpoint
- [ ] Update each client to use `NOTION_LEAD_INSPECT_OPERATOR_KEY`
- [ ] Verify success with scoped auth
- [ ] Mark each client as migrated in the inventory

### Endpoint 3: `/api/update-notion-je-leads-schema`

- [ ] Identify all clients/scripts calling this endpoint
- [ ] Update each client to use `NOTION_SCHEMA_OPERATOR_KEY`
- [ ] Verify success with scoped auth
- [ ] Mark each client as migrated in the inventory

### Migration discipline

- [ ] Each client uses only one auth model at a time
- [ ] No client is left partially migrated across environments
- [ ] Any automation using the legacy shared key is explicitly identified and scheduled for cutover

## 8. Per-Endpoint Verification Checklist

### `/api/generate-pricing-access-link`

- [ ] No token returns `401`
- [ ] Wrong token returns `401`
- [ ] Scoped token returns `200`
- [ ] Response still includes:
  - `ok`
  - `approvedEmail`
  - `expiresAt`
  - `url`
- [ ] Test email used for verification is controlled and non-sensitive

### `/api/inspect-notion-lead`

- [ ] No token returns `401`
- [ ] Wrong token returns `401`
- [ ] Scoped token returns `200`
- [ ] Safe verification path:
  - first call without `submissionId`
  - then call with a known test `submissionId` if needed

### `/api/update-notion-je-leads-schema`

- [ ] No token returns `401`
- [ ] Wrong token returns `401`
- [ ] Scoped token returns authorized result
- [ ] If executed against production, confirm returned property types match expected schema
- [ ] Avoid unnecessary repeat writes during verification

## 9. Audit-Log Verification Checklist

- [ ] Confirm operator action logs are appearing for each endpoint
- [ ] Confirm logs include:
  - endpoint
  - action
  - client IP
  - user agent
  - auth mode
- [ ] Confirm migrated clients are logging `authMode: "scoped"`
- [ ] Confirm any `legacy_fallback` events map to known unmigrated clients
- [ ] Investigate any:
  - `unauthorized`
  - `ip denied`
  - `access misconfigured`
- [ ] Do not remove fallback while unexplained `legacy_fallback` events are still appearing

## 10. Optional IP Allowlist Rollout Checklist

### Planning

- [ ] Identify stable source IPs for each operator client if available
- [ ] Decide whether allowlisting should be shared or per-endpoint

### Rollout

- [ ] Start with shared allowlist if all traffic originates from the same trusted IP set
- [ ] Use per-endpoint allowlists if traffic origins differ by workflow
- [ ] Apply allowlist env vars in production
- [ ] Verify access from approved source IPs
- [ ] If safe to test, verify blocked access from non-approved source returns `403`

### Operational caution

- [ ] Do not enable allowlists until source IP stability is confirmed
- [ ] Be prepared to remove allowlist envs immediately if operator lockout occurs

## 11. Quiet-Window Rule For Fallback Removal

Legacy fallback may be removed only when **all** of the following are true:

- [ ] Minimum quiet window of **7 days** has passed
- [ ] At least one successful real usage cycle has been completed for each operator workflow
- [ ] Zero observed `legacy_fallback` events during the quiet window
- [ ] All known clients/scripts are marked migrated in the inventory
- [ ] Rollback owner is available for the fallback removal deployment

Fallback removal target:
- remove `PRICING_ACCESS_OPERATOR_KEY` from production env

## 12. Rollback Procedure

If a scoped-secret cutover fails:

- [ ] Confirm whether `PRICING_ACCESS_OPERATOR_KEY` is still present
- [ ] Revert affected client(s) to the legacy shared key
- [ ] If allowlisting caused the issue, remove or relax the relevant allowlist env var(s)
- [ ] Re-test the affected endpoint
- [ ] Review operator logs for:
  - `unauthorized`
  - `ip denied`
  - `access misconfigured`

If fallback has already been removed and operator access breaks:

- [ ] Re-add `PRICING_ACCESS_OPERATOR_KEY`
- [ ] Refresh production env / deploy as required
- [ ] Restore operator access via the legacy key
- [ ] Re-investigate before attempting fallback removal again

## 13. Final Sign-Off Section

### Pre-cutover sign-off

- [ ] Inventory completed
- [ ] Scoped secrets generated
- [ ] Production env vars prepared
- [ ] Migration owners assigned
- [ ] Allowlist decision recorded

Approved by:
- Name:
- Date:

### Post-cutover sign-off

- [ ] All operator clients migrated
- [ ] Scoped auth verified for all endpoints
- [ ] Audit logs confirmed
- [ ] No unexplained legacy fallback events remain
- [ ] Quiet window completed

Approved by:
- Name:
- Date:

### Fallback removal sign-off

- [ ] Quiet-window criteria met
- [ ] `PRICING_ACCESS_OPERATOR_KEY` removal approved
- [ ] Rollback owner available

Approved by:
- Name:
- Date:
