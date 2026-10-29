# Story Club manual payment confirmation

This endpoint records a payment that an operator has independently confirmed. It does not contact a bank or payment provider, store bank details, or accept client payment claims.

## Required server configuration

- Apply `supabase/migrations/20261029000002_story_club_paid.sql` through the approved database release process.
- Set `STORY_CLUB_PAYMENT_OPERATOR_KEY` to a unique random secret of at least 24 characters. Do not reuse the pricing operator key. It is intentionally not accepted through the legacy shared-key fallback.
- Optionally set `STORY_CLUB_PAYMENT_OPERATOR_IP_ALLOWLIST` to comma-separated exact operator IPs.
- The server's existing `SUPABASE_URL` and service-role write key are used only by server-side RPC calls.

## Manual procedure

1. Confirm receipt of the 590,000 VND transfer through the operator's normal banking process.
2. Use the memo shown on the parent's reserve confirmation, such as `SC-A1B2C3`.
3. From a trusted terminal, provide the operator key through a protected environment variable and POST `{"memo":"SC-A1B2C3"}` to `/api/story-club-paid`. Never put the key in shell history, a URL, browser JavaScript, a ticket, or a log.
4. A first confirmation returns `status: paid` and a UTC timestamp. A repeat returns `status: already_paid` and the original timestamp. Unknown memos return 404.

The database RPC performs the state transition, anonymous `story_club_paid` counter event, and audit insert atomically. The audit record contains only the memo, fixed action, timestamp, and operator actor category. It does not identify an individual operator. This endpoint does not provide a customer-facing payment state lookup.

## Rollback

Use the paired `20261029000002_story_club_paid_down.sql` only through the approved database change process. Reverting the application commit disables the endpoint and returns the reserve page to its prior behavior; do not roll back the database while retaining code that depends on the reservation RPC.
