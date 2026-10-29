# Story Club SePay webhook

**Research checked 29 October 2026.** SePay's [webhook integration guide](https://docs.sepay.vn/tich-hop-webhooks.html) documents JSON POST notifications, `transferType` (`in`/`out`), `content`, and `transferAmount`; API-key auth uses `Authorization: Apikey API_KEY`. It considers an HTTP 200/201 response with `{"success":true}` successful and retries unsuccessful responses.

## Configure after this change is reviewed and deployed

1. In SePay, open **Webhooks → Add webhook**. Select incoming transfers only, set the URL to `https://jurassicenglish.com/api/sepay-webhook`, select API Key authentication, choose JSON request content, and enter a newly generated random key in the authentication key field. Do not reuse the operator key.
2. In the matching Vercel project, add `SEPAY_WEBHOOK_KEY` with the same value for the intended environment. Keep the value in the secret manager; do not paste it in source, tickets, or logs.
3. Keep `SEPAY_AUTOCONFIRM` unset or `0` until the endpoint is deployed and verified. Then set it to `1` in the intended environment to enable marking. `SUPABASE_URL` and the existing backend-only `SUPABASE_WRITE_KEY` (or supported server-only equivalent) must already be configured; these are never exposed to the browser.
4. SePay sends the key as `Authorization: Apikey <configured-key>`. The endpoint rejects missing/mismatched auth with 401. It accepts incoming transfers at least 590,000 VND with a Story Club memo, normalizes the memo to `SC-XXXXXX`, and calls the existing atomic/idempotent `mark_story_club_paid` RPC. Unknown memos and underpayments are acknowledged with 200 and marked `needs_review` in minimal logs. Outgoing transfers are ignored. Database/network errors return 503 so SePay can retry.

The endpoint stores no webhook payload, account number, payer name, description, or transfer reference. Its application log contains only the normalized memo (or `unknown`) and processing status. Tests use synthetic payloads and a mocked RPC; do not use a live transfer as a test.
