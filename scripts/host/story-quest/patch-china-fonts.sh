#!/usr/bin/env bash
# Make a Story Quest release that does not wait on Google Fonts.
#
# Why: the live Story Quest index.html loads a render-blocking stylesheet from
# fonts.googleapis.com (plus 9 files from fonts.gstatic.com). Both hosts are
# blocked in mainland China, so the page stays blank until the browser gives up
# on the stylesheet. This copies a release, adds the same three font families
# (DM Sans, Manrope, Plus Jakarta Sans; SIL OFL 1.1; latin + latin-ext) under
# /fonts/, and swaps the three Google <link> tags for one same-origin stylesheet.
# Nothing else in the release changes.
#
# Usage:
#   scripts/host/story-quest/patch-china-fonts.sh <release-dir> <out-dir>
# e.g. copy the live release from the host first (read only):
#   rsync -a -e "ssh -i ~/.ssh/id_ed25519_jurassic_admin" \
#     je-admin@152.42.198.173:/srv/story-quest/current/ ./sq-live/
#   scripts/host/story-quest/patch-china-fonts.sh ./sq-live ./sq-china
# then ship it with the normal, owner-approved path:
#   scripts/host/story-quest/deploy-static-release.sh story-quest 20261112-china-fonts ./sq-china ./sq-china.MANIFEST.sha256
set -euo pipefail

SRC="${1:?release dir}"; OUT="${2:?output dir}"
HERE="$(cd "$(dirname "$0")" && pwd)"
FONTS="$HERE/china-fonts"

[ -f "$SRC/index.html" ] || { echo "no index.html in $SRC" >&2; exit 1; }
[ -e "$OUT" ] && { echo "$OUT exists; refusing to overwrite" >&2; exit 1; }

cp -R "$SRC" "$OUT"
mkdir -p "$OUT/fonts"
cp "$FONTS"/*.woff2 "$FONTS/fonts.css" "$OUT/fonts/"

python3 -I - "$OUT/index.html" <<'PY'
import re, sys
p = sys.argv[1]
html = open(p, encoding="utf-8").read()
before = html
# Drop the two preconnects and the Google stylesheet; insert the local one once.
html = re.sub(r'[ \t]*<link rel="preconnect" href="https://fonts\.(googleapis|gstatic)\.com"[^>]*>\n?', '', html)
html, n = re.subn(r'<link href="https://fonts\.googleapis\.com/css2\?[^"]*" rel="stylesheet">',
                  '<link rel="stylesheet" href="/fonts/fonts.css">', html)
if n != 1:
    sys.exit(f"expected exactly 1 Google Fonts stylesheet, found {n}; release layout changed, patch by hand")
if re.search(r'fonts\.(googleapis|gstatic)\.com', html):
    sys.exit("a Google Fonts reference is still present after patching")
open(p, "w", encoding="utf-8").write(html)
print(f"patched {p}: {len(before) - len(html)} bytes shorter")
PY

( cd "$OUT" && find . -type f | sort | xargs shasum -a 256 ) > "$OUT.MANIFEST.sha256"
echo "release ready: $OUT  (manifest: $OUT.MANIFEST.sha256, $(wc -l < "$OUT.MANIFEST.sha256") files)"
