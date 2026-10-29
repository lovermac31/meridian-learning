#!/usr/bin/env bash
# Jay runs this from the repo root:  bash scripts/host/books/install-books.sh
# Step 1 (any time; visitors are unaffected while DNS still points at Vercel):
#   installs the books API service (systemd, 127.0.0.1:3110) and the nginx site for books.jurassicenglish.com,
#   with an `nginx -t` check (the site is removed again if it fails), then checks both through the server itself.
# Step 2 (only after the books A record points at 152.42.198.173): run it again; it then gets the TLS certificate.
# The release files are already on the server: /srv/books/current.
set -euo pipefail
HOST="${JURASSIC_HOST:-je-admin@152.42.198.173}"
IP="152.42.198.173"
KEY="${JURASSIC_KEY:-$HOME/.ssh/id_ed25519_jurassic_admin}"
NAME="books.jurassicenglish.com"
DIR="$(cd "$(dirname "$0")" && pwd)"
scp -q -i "$KEY" -o BatchMode=yes "$DIR/books.nginx.conf" "$HOST:/tmp/books.nginx.conf"
scp -q -i "$KEY" -o BatchMode=yes "$DIR/jurassic-books-api.service" "$HOST:/tmp/jurassic-books-api.service"
ssh -i "$KEY" -o BatchMode=yes "$HOST" 'set -e
  sudo -n test -e /srv/books/current/public/index.html
  sudo -n install -d -m 0755 /var/www/letsencrypt
  sudo -n install -m 644 -o root -g root /tmp/jurassic-books-api.service /etc/systemd/system/jurassic-books-api.service
  sudo -n systemctl daemon-reload
  sudo -n systemctl enable --now jurassic-books-api.service
  sudo -n systemctl restart jurassic-books-api.service
  if ! sudo -n test -e /etc/letsencrypt/live/books.jurassicenglish.com; then
    sudo -n install -m 644 -o root -g root /tmp/books.nginx.conf /etc/nginx/sites-available/books
  fi
  sudo -n ln -sfn /etc/nginx/sites-available/books /etc/nginx/sites-enabled/books
  if sudo -n nginx -t; then sudo -n systemctl reload nginx; echo "nginx: books site installed and reloaded"
  else sudo -n rm -f /etc/nginx/sites-enabled/books; echo "nginx test failed: books site removed, nothing reloaded" >&2; exit 1; fi
  rm -f /tmp/books.nginx.conf /tmp/jurassic-books-api.service
  sleep 1
  echo "check: home $(curl -s -o /dev/null -w %{http_code} -H "Host: books.jurassicenglish.com" http://127.0.0.1/) (want 200), api $(curl -s -o /dev/null -w %{http_code} -H "Host: books.jurassicenglish.com" http://127.0.0.1/api/book) (want 400), private file $(curl -s -o /dev/null -w %{http_code} -H "Host: books.jurassicenglish.com" http://127.0.0.1/api/_content/not-now-rosa.json) (want 404)"'
if [ "$(dig +short "$NAME" A | tail -1)" = "$IP" ]; then
  ssh -i "$KEY" -o BatchMode=yes "$HOST" "sudo -n certbot --nginx -d $NAME --redirect --non-interactive --agree-tos --register-unsafely-without-email --keep-until-expiring && sudo -n nginx -t && sudo -n systemctl reload nginx && echo 'TLS: certificate installed'"
else
  echo "DNS: $NAME still points at Vercel. That is expected until the switch. After the A record changes to $IP, run this again for TLS."
fi
