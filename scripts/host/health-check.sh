#!/usr/bin/env bash
# Jurassic English host: replacement for the Vercel cron in vercel.json ("/api/health" daily at 12:00 UTC).
# Installed as /usr/local/lib/jurassic/health-check.sh and run by jurassic-health.service (timer at 12:00 UTC).
# CRON_SECRET comes from the systemd EnvironmentFile (/etc/jurassic-staging/app.env, root-only); it is sent only in the
# Authorization header to the loopback app and is never printed. One retry after 30 s. Exit 1 = failure (OnFailure alert).
#
# HEALTH_ALLOW_UNCONFIGURED=1 (staging): the app answers 502 "supabase_not_configured" because the host holds no
# production database key; that is the expected staging result and counts as success, logged as such.
set -uo pipefail
URL="${HEALTH_URL:-http://127.0.0.1:3001/api/health}"
[ -n "${CRON_SECRET:-}" ] || { echo '{"event":"health_cron","ok":false,"error":"cron_secret_missing"}'; exit 1; }
body="$(mktemp)"; trap 'rm -f "$body"' EXIT

check() {
  local code keep
  code="$(curl -sS -o "$body" -w '%{http_code}' --max-time 20 -H "Authorization: Bearer ${CRON_SECRET}" -H 'Host: jurassicenglish.com' "$URL" 2>/dev/null)" || code=000
  keep="$(python3 -I -c 'import json,sys
try: d=json.load(open(sys.argv[1]))
except Exception: print("unparsable"); sys.exit()
k=d.get("keepalive")
print(k if isinstance(k,str) else ("ok" if k.get("ok") else k.get("error","unknown")))' "$body" 2>/dev/null || echo unparsable)"
  printf '{"event":"health_cron","attempt":%s,"http":%s,"keepalive":"%s"}\n' "$1" "$code" "$keep"
  [ "$code" = 200 ] && [ "$keep" = ok ] && return 0
  [ "${HEALTH_ALLOW_UNCONFIGURED:-0}" = 1 ] && [ "$code" = 502 ] && [ "$keep" = supabase_not_configured ] && return 0
  return 1
}

check 1 && exit 0
sleep 30
check 2 && exit 0
exit 1
