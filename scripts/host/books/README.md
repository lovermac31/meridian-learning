# books.jurassicenglish.com on Jay's server

The storybooks reader (repo `lovermac31/academy-book-pages`, owned by the Book Build session) moves from Vercel project `je-storybooks-preview` to the Jurassic DigitalOcean host (152.42.198.173). The host name does not change, so Supabase sign-in and the Zalo callback URLs stay the same. No Supabase setting changes.

## How it runs

| Part | Where |
|---|---|
| Static pages, data, art, audio | nginx serves `/srv/books/current/public` |
| `/api/book` (gated books for signed-in parents) | Book Build's own `api/book.js`, unchanged, run by `books-api-server.cjs` under systemd `jurassic-books-api` on 127.0.0.1:3110 (`DynamicUser`, read-only system, 128 MB cap) |
| Gated story files (`api/_content/*.json`) | outside the web root; only `/api/book` can return them, to a confirmed parent |

The headers copy the live Vercel site, including its `X-Robots-Tag: noindex, nofollow` (the live site is noindex today; changing that is a separate decision).

## Files

| File | Purpose |
|---|---|
| `build-release.sh` | Builds a release from the books repo with Book Build's `scripts/deploy-preview.sh` (sign-up gate on, gate-split, art-only shelf, leak check), then splits it into `public/` and `api/` plus a sha256 manifest |
| `books-api-server.cjs` | Runs `api/book.js` on loopback; routes other than `/api/book` return 404 |
| `jurassic-books-api.service` | systemd unit for the API |
| `books.nginx.conf` | nginx site: the live headers, `/api/book` to the API, `/api/*` otherwise 404, plain-text 404s |
| `install-books.sh` | Jay runs it: installs the service and the nginx site (with `nginx -t`), checks them, and gets TLS once DNS points here |

## Release in place (29 Oct 2026)

`/srv/books/releases/20261029-0f5a3a2`, from books repo commit `0f5a3a2`. 741 files, 103 MB, manifest checked on the host. Locally the same release passed: 701/701 public files served byte-identical, private files 404, `/api/book` 400 (no id), 401 (bad sign-in), 405 (POST).

## Updating

```bash
JE_AUTH_URL=<public Supabase URL> JE_AUTH_KEY=<publishable key> scripts/host/books/build-release.sh /tmp/books-rel
scripts/host/story-quest/deploy-static-release.sh books <YYYYMMDD-sha> /tmp/books-rel/release /tmp/books-rel/MANIFEST.sha256
ssh je-admin@152.42.198.173 sudo systemctl restart jurassic-books-api
```

Rollback on the host: `sudo ln -sfn /srv/books/releases/<previous> /srv/books/current && sudo systemctl restart jurassic-books-api`.

## Cutover order (each step is Jay's)

1. Run `install-books.sh` once. Visitors are unaffected: DNS still points at Vercel.
2. Namecheap: change the `books` A record from `76.76.21.21` to `152.42.198.173` (today's TTL is 30 minutes).
3. Straight away, run `install-books.sh` again for the TLS certificate. Until it finishes (a few minutes), a visitor whose DNS has already switched can see a certificate warning. Do it at a quiet hour.
4. This session then checks HTTPS, sign-in, a gated book and the headers.

Rollback: put the A record back to `76.76.21.21`. Vercel stays deployed until the move is verified.
