#!/usr/bin/env bash
# Jurassic English staging host: build an immutable release from an exact commit, check it beside the live release,
# and switch to it only when asked. Run from a clone of lovermac31/meridian-learning on the operator's Mac.
#
#   scripts/host/deploy-release.sh build    <full-40-char-sha> <release-name>   # extract, npm ci, lint, test, build
#   scripts/host/deploy-release.sh candidate <release-name>                     # run it on 127.0.0.1:3002 (transient unit)
#   scripts/host/deploy-release.sh probe    <release-name> <paths.json> <out.json>  # parity probe on the host, copied back
#   scripts/host/deploy-release.sh activate <release-name> <expected-current-release>  # atomic switch + restart
#   scripts/host/deploy-release.sh stop-candidate
#
# Releases live in /opt/jurassic-staging/releases/<name>, are owned by root after the build (the je-app service user
# can read, not write), carry a RELEASE_SHA file, and are never modified once built. Rollback = activate the previous
# release name. Nothing here reads, copies or prints a secret; /etc/jurassic-staging/app.env stays on the host.
set -euo pipefail
HOST="${JE_HOST:-je-admin@152.42.198.173}"
KEY="${JE_HOST_KEY:-$HOME/.ssh/id_ed25519_jurassic_admin}"
NODE_BIN=/opt/node-v24.21.0/bin
ROOT=/opt/jurassic-staging
ssh_() { ssh -i "$KEY" -o BatchMode=yes -o ConnectTimeout=15 "$HOST" "$@"; }
name_ok() { [[ "$1" =~ ^[0-9]{8}-r[0-9]+$ ]] || { echo "STOP: release name must look like 20261016-r2" >&2; exit 2; }; }

case "${1:-}" in
  build)
    SHA="${2:?full sha}"; NAME="${3:?release name}"; name_ok "$NAME"
    [[ "$SHA" =~ ^[0-9a-f]{40}$ ]] || { echo "STOP: pass the full 40-character commit SHA" >&2; exit 2; }
    git cat-file -e "$SHA^{commit}" || { echo "STOP: $SHA is not a commit in this clone" >&2; exit 2; }
    git archive --format=tar "$SHA" | ssh_ "set -euo pipefail; R=$ROOT/releases/$NAME
      [ ! -e \"\$R\" ] || { echo 'STOP: release exists (releases are immutable)' >&2; exit 2; }
      sudo -n mkdir \"\$R\"; sudo -n chown je-admin:je-admin \"\$R\"; tar -x -C \"\$R\"; echo $SHA > \"\$R/RELEASE_SHA\"
      cd \"\$R\"; export PATH=$NODE_BIN:\$PATH
      npm ci --ignore-scripts --no-audit --no-fund --loglevel=error
      npm run -s lint
      npm test > /tmp/je-release-test.log 2>&1 || { tail -40 /tmp/je-release-test.log >&2; echo 'tests failed' >&2; exit 1; }
      grep -E '^(#|ℹ) (pass|fail) ' /tmp/je-release-test.log || true
      npm run -s build > /tmp/je-release-build.log 2>&1 || { tail -40 /tmp/je-release-build.log >&2; echo 'build failed' >&2; exit 1; }
      sudo -n chown -R root:root \"\$R\"; echo \"built \$R (\$(cat RELEASE_SHA))\""
    ;;
  candidate)
    NAME="${2:?release name}"; name_ok "$NAME"
    ssh_ "set -euo pipefail; sudo -n systemctl stop jurassic-candidate 2>/dev/null || true
      sudo -n systemd-run --unit=jurassic-candidate --uid=je-app --gid=je-app -p WorkingDirectory=$ROOT/releases/$NAME \
        -p EnvironmentFile=-/etc/jurassic-staging/app.env -E NODE_ENV=production -E STAGING=true -E HOST=127.0.0.1 -E PORT=3002 \
        -E PATH=$NODE_BIN:/usr/bin:/bin -p NoNewPrivileges=yes -p ProtectSystem=strict -p ProtectHome=yes -p PrivateTmp=yes \
        -p MemoryMax=1G $NODE_BIN/npm start >/dev/null
      for i in \$(seq 1 30); do curl -fsS -o /dev/null http://127.0.0.1:3002/api/health && { echo 'candidate up on 127.0.0.1:3002'; exit 0; }; sleep 1; done
      echo 'candidate did not start' >&2; sudo -n journalctl -u jurassic-candidate -n 30 --no-pager >&2; exit 1"
    ;;
  probe)
    NAME="${2:?release name}"; PATHS="${3:?paths.json}"; OUT="${4:?out.json}"; name_ok "$NAME"
    ssh_ "cat > /tmp/parity-paths.json" < "$PATHS"
    ssh_ "$NODE_BIN/node $ROOT/releases/$NAME/scripts/host/parity-probe.mjs --paths /tmp/parity-paths.json \
      --base http://127.0.0.1:3002 --host jurassicenglish.com --mode header --delay 50 --out /tmp/parity-candidate.json >&2 && cat /tmp/parity-candidate.json" > "$OUT"
    echo "probe -> $OUT"
    ;;
  activate)
    NAME="${2:?release name}"; EXPECT="${3:?expected current release name}"; name_ok "$NAME"
    ssh_ "set -euo pipefail; cur=\$(basename \"\$(readlink -f $ROOT/current)\")
      [ \"\$cur\" = '$EXPECT' ] || { echo \"STOP: current is \$cur, expected $EXPECT (someone else deployed?)\" >&2; exit 2; }
      [ -f $ROOT/releases/$NAME/RELEASE_SHA ] || { echo 'STOP: release not built' >&2; exit 2; }
      sudo -n ln -sfn $ROOT/releases/$NAME $ROOT/current.next && sudo -n mv -T $ROOT/current.next $ROOT/current
      sudo -n systemctl restart jurassic-staging
      for i in \$(seq 1 30); do curl -fsS -o /dev/null http://127.0.0.1:3001/api/health && break; sleep 1; done
      echo \"current -> \$(basename \"\$(readlink -f $ROOT/current)\") (\$(cat $ROOT/current/RELEASE_SHA)), service \$(systemctl is-active jurassic-staging)\""
    ;;
  stop-candidate) ssh_ "sudo -n systemctl stop jurassic-candidate 2>/dev/null; echo stopped" ;;
  *) sed -n 2,14p "$0"; exit 2 ;;
esac
