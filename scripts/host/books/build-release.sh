#!/usr/bin/env bash
# Build a books.jurassicenglish.com release for Jay's server from the storybooks repo, exactly as Book Build's
# scripts/deploy-preview.sh builds it for Vercel (sign-up gate on, gate-split, art-only shelf, leak check).
# Usage: build-release.sh <out-dir> [git-ref]      (default ref: HEAD of the local academy-book-pages repo)
# Output: <out-dir>/release/{public/, api/, books-api-server.cjs} and <out-dir>/MANIFEST.sha256
# JE_AUTH_URL / JE_AUTH_KEY: the public Supabase URL and publishable key (the same values the live site's
# auth-config.js already serves). Never a service-role key.
set -euo pipefail
OUT="$1"; REF="${2:-HEAD}"
REPO="${BOOKS_REPO:-$HOME/Downloads/University AI Collaboration Deck/academy-book-pages}"
HERE="$(cd "$(dirname "$0")" && pwd)"
: "${JE_AUTH_URL:?set JE_AUTH_URL (public Supabase URL)}" "${JE_AUTH_KEY:?set JE_AUTH_KEY (publishable key)}"
case "$JE_AUTH_KEY" in sb_secret_*|*service_role*) echo "refusing: that is a secret key" >&2; exit 2;; esac

rm -rf "$OUT"; mkdir -p "$OUT/src"
git -C "$REPO" archive "$REF" | tar -x -C "$OUT/src"
git -C "$REPO" rev-parse "$REF" > "$OUT/SOURCE_SHA"
(cd "$OUT/src" && JE_ART_ONLY="${JE_ART_ONLY:-1}" bash scripts/deploy-preview.sh | grep -E '^(gate-split|art-only|precache|dist/ ready|STOP)')

D="$OUT/src/dist"; R="$OUT/release"
mkdir -p "$R/public"
rsync -a --exclude '/api/' --exclude '/vercel.json' --exclude '/.je-dist' "$D/" "$R/public/"
cp -a "$D/api" "$R/api"
cp "$HERE/books-api-server.cjs" "$R/"
cp "$OUT/SOURCE_SHA" "$R/SOURCE_SHA"
# The private story files must never be inside the web root.
if find "$R/public" -path '*/_content/*' -o -name '_auth.json' | grep -q .; then echo "LEAK: private files under public/" >&2; exit 1; fi
(cd "$R" && find . -type f | sort | xargs shasum -a 256 > "$OUT/MANIFEST.sha256")
echo "release: $(find "$R" -type f | wc -l | tr -d ' ') files, $(du -sh "$R" | cut -f1), source $(cut -c1-7 "$OUT/SOURCE_SHA")"
