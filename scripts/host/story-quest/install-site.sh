#!/usr/bin/env bash
# Jay runs this once from the repo root:  bash scripts/host/story-quest/install-site.sh
# 1. Installs the nginx site for story-quest.jurassicenglish.com on the Jurassic server
#    (nginx -t first; if the test fails the site is removed again and nothing reloads).
# 2. If the DNS A record already points at the server, gets the TLS certificate with
#    certbot and turns on the HTTP->HTTPS redirect. Safe to re-run after adding DNS.
# The Story Quest files are already on the server: /srv/story-quest/current.
set -euo pipefail
HOST="${JURASSIC_HOST:-je-admin@152.42.198.173}"
IP="152.42.198.173"
KEY="${JURASSIC_KEY:-$HOME/.ssh/id_ed25519_jurassic_admin}"
NAME="story-quest.jurassicenglish.com"
DIR="$(cd "$(dirname "$0")" && pwd)"
scp -q -i "$KEY" -o BatchMode=yes "$DIR/story-quest.nginx.conf" "$HOST:/tmp/story-quest.nginx.conf"
ssh -i "$KEY" -o BatchMode=yes "$HOST" 'set -e
  sudo -n test -e /srv/story-quest/current/index.html
  if ! sudo -n test -e /etc/nginx/sites-available/story-quest; then
    sudo -n install -m 644 -o root -g root /tmp/story-quest.nginx.conf /etc/nginx/sites-available/story-quest
  fi
  sudo -n ln -sfn /etc/nginx/sites-available/story-quest /etc/nginx/sites-enabled/story-quest
  if sudo -n nginx -t; then sudo -n systemctl reload nginx; echo "nginx: site installed and reloaded"
  else sudo -n rm -f /etc/nginx/sites-enabled/story-quest; echo "nginx test failed: site removed, nothing reloaded" >&2; exit 1; fi
  rm -f /tmp/story-quest.nginx.conf'
if [ "$(dig +short "$NAME" A | tail -1)" = "$IP" ]; then
  ssh -i "$KEY" -o BatchMode=yes "$HOST" "sudo -n certbot --nginx -d $NAME --redirect --non-interactive --agree-tos --keep-until-expiring && sudo -n nginx -t && sudo -n systemctl reload nginx && echo 'TLS: certificate installed'"
else
  echo "DNS: $NAME does not point at $IP yet. Add the A record at Namecheap, wait a few minutes, then run this script again for TLS."
fi
