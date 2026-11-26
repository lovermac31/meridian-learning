# Gulf IELTS click count

Links to share (site domain):

- `https://jurassicenglish.com/go/gulf-ielts-test-1?src=linkedin` (Ko-fi, the default destination)
- `https://jurassicenglish.com/go/gulf-ielts-test-1?src=dm&dest=calendly` (paid baseline booking)

`src` says where the link was shared: `linkedin`, `facebook`, `wechat`, `dm`, `email`, `poster`, or `test`
(our own checks, excluded from counts). Any other value is stored as `direct`. Only `gulf-ielts-test-1` and the two
approved destinations in `api/_lib/goConfig.ts` are accepted; anything else returns 404, so this can never be used as
an open redirect. Only GET is supported.

## What is counted

Each human GET returns an uncached 302 and writes **one row to `je_events`** through the existing anonymous
`record_je_event` RPC (same path and privacy rules as Zalo clicks):

| column | value |
|---|---|
| event | `checkout_start` (the visitor was sent to a payment page) |
| path | `/go/gulf-ielts-test-1` |
| product_id | `gulf-baseline-kofi` or `gulf-baseline-calendly` |
| utm_source / utm_medium / utm_campaign | `src` / `social` / `gulf-ielts-test-1` |
| referrer_host | a known public host (LinkedIn, Facebook, Google…) or empty |

Bots, link-preview fetchers (LinkedIn, Facebook, WhatsApp…), monitors, HTTP libraries and requests with no user
agent are redirected but **not counted** (`api/_lib/automation.ts`, response header `X-JE-Click: skipped:<reason>`).
No IP, user agent, cookie or personal data is stored. A database error never blocks the redirect (fail-open). A
one-line JSON `go_click` message is also written to the runtime log for debugging; the database row is the count.

No database change was needed: `checkout_start` is already an allowed event. The `path` and `product_id` keep these
rows apart from the product-card `checkout_start` events.

## Count the clicks

```sql
select coalesce(utm_source,'direct') as src, product_id, count(*) as clicks
from public.je_events
where event = 'checkout_start' and path = '/go/gulf-ielts-test-1'
  and coalesce(utm_source,'') <> 'test'
group by 1, 2 order by 3 desc;
```

For the stop rule ("0 paid after 100 verified clicks") use the `gulf-baseline-kofi` rows. These are filtered
requests, not proven unique people: a person who taps twice counts twice.

## Verify and rollback

Locally: `npm test`, `npm run lint`, `node scripts/check-api-handlers.mjs`.
After deploy: a `curl` GET must return 302 to the approved URL with `X-JE-Click: skipped:user-agent` (curl is never
counted). A browser-style GET with `src=test` returns `X-JE-Click: recorded` and adds one `test` row, which the query
above excludes.

Rollback: revert the click-redirect merge commit, or promote the previous production deployment in Vercel. Links
already shared would then 404 on the site, so switch them back to the direct Ko-fi link. No data cleanup is needed.
