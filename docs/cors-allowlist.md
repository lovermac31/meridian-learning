# API CORS Allowlist — Phase 2.2A

Live as of: 2026-05-15

## Surface map

The marketing site has three surfaces with different CORS expectations:

| Surface | Current ACAO behavior | Phase 2.2A change |
|---|---|---|
| Static HTML / JS / CSS at `/`, `/student-academy`, etc. | `Access-Control-Allow-Origin: *` (Vercel platform default for static assets) | **No change.** Public resources need to be loadable across origins for link previews, embeds, etc. The wildcard here is correct and is not set by our code. |
| API routes (`/api/*`) | Zero `Access-Control-*` headers — cross-origin OPTIONS returns 405, cross-origin POST returns 400, browser blocks reading the response | **Phase 2.2A:** explicit allowlist via `applyCors()` + `handlePreflight()` helpers. Allowed origins receive `Access-Control-Allow-Origin: <origin>` and `Vary: Origin`. Denied origins receive no ACAO (browser blocks the response) and a `cors_origin_denied` event is emitted. |
| Same-origin form submissions | No CORS in play — same-origin browser requests skip CORS entirely | **No change.** `applyCors()` short-circuits when the `Origin` header is absent. |

## Default allowlist (no env required)

Hardcoded in `api/_lib/corsSecurity.ts`:

- `https://jurassicenglish.com`
- `https://www.jurassicenglish.com`

Origin matching is exact: scheme + host. `http://`, subdomains, and path
variants are denied.

## Env-driven extension

| Env var | Default | Effect |
|---|---|---|
| `API_CORS_ALLOWED_ORIGINS` | `""` (empty) | Comma-separated list of extra origins to append to the default allowlist. Example: `"https://partner-school.edu,https://staging.jurassicenglish.com"`. |
| `API_CORS_ALLOW_VERCEL_PREVIEWS` | `"false"` | When `"true"`, any origin matching `^https://[a-z0-9][a-z0-9-]{0,253}\.vercel\.app$` is allowed. Use during preview-deploy smoke tests; **unset or `"false"` in production**. |

## Helper API

```typescript
// Apply ACAO + Vary based on the request's Origin header.
// Returns the classification so callers can branch on result.
applyCors(req, res): CorsResult

// Handle OPTIONS preflight. Returns true if the request was a preflight
// (caller MUST stop processing). Returns false otherwise (continue normally).
handlePreflight(req, res): boolean

// Pure predicate, useful in tests.
isAllowedOrigin(origin, config?): boolean

// Full classification (origin + allowed + reason).
classifyOrigin(req, config?): CorsResult
```

## Call-site pattern (production routes)

```typescript
export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;   // ① preflight short-circuit

  if (req.method !== 'POST') {
    return res.status(405).json({...});    // ② existing method guard
  }

  applyCors(req, res);                     // ③ set ACAO+Vary if allowed
  // ... rest of handler unchanged
}
```

Why this ordering:
1. Preflight FIRST so OPTIONS never falls into the method-guard 405 branch.
2. Existing 405 is preserved exactly for non-POST/non-OPTIONS (no behavior change).
3. `applyCors` runs on the actual POST so the response carries ACAO when
   allowed. Disallowed origins still process the request — they just don't
   get ACAO, so the browser blocks the response on the client side.

For the Express dev shim (`server.ts`), the same helpers work — preflight
is exposed via a dedicated `app.options(...)` route registration rather
than nested in the POST handler.

## Observability

Disallowed origins emit a structured event for the Phase 4 observability
taxonomy:

```json
{
  "event": "cors_origin_denied",
  "origin": "https://evil.example.com",
  "method": "POST"
}
```

Allowed origins are not logged per request (would flood logs from
legitimate traffic). The `Vary: Origin` header is set so Vercel's CDN
caches separate response copies per origin.

## Curl verification (post-deploy)

These commands assume the branch is deployed to a Vercel preview at
`<preview>.vercel.app`. They will not produce the documented results
against current production until Phase 2.2A is deployed.

```bash
# 1. Same-origin POST — current behavior preserved
curl -i -X POST https://<preview>.vercel.app/api/get-started \
  -H 'Content-Type: application/json' \
  --data '{"website":"","startedAt":"...","email":"..."}'
# Expected: 400 (form validation) or 200, no ACAO in response.

# 2. Allowed cross-origin POST — ACAO + Vary set
curl -i -X POST https://<preview>.vercel.app/api/get-started \
  -H 'Origin: https://jurassicenglish.com' \
  -H 'Content-Type: application/json' \
  --data '{...}'
# Expected: Access-Control-Allow-Origin: https://jurassicenglish.com
#           Vary: Origin

# 3. Disallowed cross-origin POST — no ACAO, server logs denial
curl -i -X POST https://<preview>.vercel.app/api/get-started \
  -H 'Origin: https://evil.example.com' \
  -H 'Content-Type: application/json' \
  --data '{...}'
# Expected: 400/200 status with NO Access-Control-Allow-Origin header.
#           Vercel logs show: "cors_origin_denied" event.

# 4. Allowed preflight — 204 with method/header/max-age
curl -i -X OPTIONS https://<preview>.vercel.app/api/get-started \
  -H 'Origin: https://jurassicenglish.com' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type'
# Expected: 204, Access-Control-Allow-Origin: https://jurassicenglish.com,
#           Access-Control-Allow-Methods, Access-Control-Allow-Headers,
#           Access-Control-Max-Age.

# 5. Disallowed preflight — 204 with NO ACAO (browser blocks follow-up)
curl -i -X OPTIONS https://<preview>.vercel.app/api/get-started \
  -H 'Origin: https://evil.example.com' \
  -H 'Access-Control-Request-Method: POST'
# Expected: 204, no Access-Control-Allow-Origin header.
```

## Rollback

Three escalating levels of rollback:

1. **Revert the commit** — `git revert <phase-2.2a-sha>` removes all CORS
   wiring; routes return to the pre-Phase-2.2A "no ACAO at all" state.
2. **Disable the helper at runtime** — set `API_CORS_ALLOWED_ORIGINS` to a
   single sentinel that no real origin can match (e.g.
   `"https://__disabled__"`), and leave `API_CORS_ALLOW_VERCEL_PREVIEWS`
   unset. All cross-origin requests will be denied; same-origin still works.
3. **Open the gate temporarily** — set `API_CORS_ALLOW_VERCEL_PREVIEWS=true`
   to let every `*.vercel.app` origin through while diagnosing a denied
   preview.

## Hash cascade note (operational)

Adding `api/_lib/corsSecurity.ts` to the module graph causes Vite/Rollup
to produce different chunk hashes (`index-CRu8mAUe.js` → `index-qoIQ30E3.js`
and three other route chunks). **The JavaScript inside each chunk is
byte-identical** — the only delta is the cross-chunk filename references
(`__vite__mapDeps` array on the entry chunk, and the bare `import "./index-*.js"`
on the three route chunks).

This is an artifact of how Rollup fingerprints chunk identity; it does not
indicate any runtime behavior change. The actual JavaScript that runs in
the browser is unchanged. All four affected chunks remain the same byte
size:

| Chunk | Baseline bytes | Phase 2.2A bytes | Delta |
|---|---:|---:|---|
| `index-*.js` | 383,829 | 383,829 | 0 (8 cross-ref bytes shifted within file) |
| `FrameworkExperience-*.js` | 31,804 | 31,804 | 0 (8 cross-ref bytes) |
| `BotUIChat-*.js` | 29,552 | 29,552 | 0 (8 cross-ref bytes) |
| `GetStartedPortal-*.js` | 26,742 | 26,742 | 0 (8 cross-ref bytes) |

Net runtime change: zero. Net CDN cache impact: 4 chunks need a fresh
fetch on the first deploy after merge; permanent thereafter.
