# Story Quest on Jay's server

`https://story-quest.jurassicenglish.com` serves Story Quest from the Jurassic DigitalOcean host (152.42.198.173), replacing `worldwise-story-quest.vercel.app`.

## What is on the server (27 Oct 2026)

- `/srv/story-quest/releases/20261027-live-mirror/` holds the exact files of the live Vercel deployment `dpl_AX1csQURcPyBpmE1u9KGWiNJdafn` (26 files, 13 MB, mirrored byte for byte). `../20261027-live-mirror.sha256` is its manifest. `sha256sum -c` passed on the host.
- `/srv/story-quest/current` is a symlink to the active release.
- Story Quest makes no `/api` calls, so it is a static site.

## Files

| File | Purpose |
|---|---|
| `story-quest.nginx.conf` | nginx site: the headers from Story Quest's own `vercel.json`, HSTS, an SPA fallback, and a real 404 for missing `/assets/*`. No `X-Robots-Tag` (public site). |
| `install-site.sh` | Jay runs it once: installs the nginx site (runs `nginx -t` first and removes the site again if the test fails). Once the DNS A record exists, it also gets the TLS certificate with certbot. Safe to re-run. |
| `deploy-static-release.sh` | Uploads a new build as an immutable release, checks it against a sha256 manifest, and switches `current` atomically. |

## Order (the homepage must never link to a dead host)

1. Namecheap: add an A record `story-quest` → `152.42.198.173`.
2. `bash scripts/host/story-quest/install-site.sh` (from the repo root; run it again if DNS was not visible yet).
3. Check: `curl -sI https://story-quest.jurassicenglish.com/`. Expect 200, the six headers, and no `X-Robots-Tag`.
4. Only then merge the PR that points the homepage at the new address.

## Updating Story Quest

Build it, write a manifest (`cd dist && find . -type f | sort | xargs shasum -a 256 > ../MANIFEST.sha256`), then run:

```bash
scripts/host/story-quest/deploy-static-release.sh story-quest <YYYYMMDD-name> dist MANIFEST.sha256
```

Rollback: `sudo ln -sfn /srv/story-quest/releases/<previous> /srv/story-quest/current` on the host. No reload is needed.
