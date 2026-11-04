#!/usr/bin/env bash
# Deploy a static site directory to the Jurassic server as an immutable release.
# Usage: deploy-static-release.sh <site> <release-name> <local-dir> <manifest.sha256>
#   site: story-quest (installs to /srv/<site>/releases/<release-name>, switches /srv/<site>/current)
# Verifies every file against the sha256 manifest on the server before switching.
set -euo pipefail
SITE="$1"; REL="$2"; SRC="$3"; MANIFEST="$4"
HOST="${JURASSIC_HOST:-je-admin@152.42.198.173}"
KEY="${JURASSIC_KEY:-$HOME/.ssh/id_ed25519_jurassic_admin}"
SSH=(ssh -i "$KEY" -o BatchMode=yes -o ConnectTimeout=10 "$HOST")
case "$SITE" in *[!a-z0-9-]*|"") echo "bad site name" >&2; exit 2;; esac
case "$REL" in *[!A-Za-z0-9._-]*|"") echo "bad release name" >&2; exit 2;; esac
STAGE="/tmp/static-release-$SITE-$REL"
rsync -a --delete -e "ssh -i $KEY -o BatchMode=yes" "$SRC"/ "$HOST:$STAGE/"
scp -q -i "$KEY" -o BatchMode=yes "$MANIFEST" "$HOST:$STAGE.sha256"
"${SSH[@]}" "set -euo pipefail
  cd '$STAGE' && sha256sum -c --quiet '$STAGE.sha256'
  D=/srv/$SITE/releases/$REL
  sudo -n test ! -e \"\$D\" || { echo \"release exists: \$D\" >&2; exit 3; }
  sudo -n mkdir -p /srv/$SITE/releases
  sudo -n cp -a '$STAGE' \"\$D\"
  sudo -n chown -R root:root \"\$D\" && sudo -n chmod -R a+rX,go-w \"\$D\"
  sudo -n cp '$STAGE.sha256' \"\$D.sha256\"
  sudo -n ln -sfn \"\$D\" /srv/$SITE/current.new && sudo -n mv -T /srv/$SITE/current.new /srv/$SITE/current
  rm -rf '$STAGE' '$STAGE.sha256'
  echo \"current -> \$(readlink /srv/$SITE/current)\""
