#!/usr/bin/env bash
# The gate on every push: the pre-push hook runs it locally and CI runs it again.
# Lists file names only, so a found secret never lands in a terminal or Claude's context.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
fail=0

# Python selftests print only on failure. The e2e one is about 10 s of sleeps, so it runs alongside the rest.
py=python
command -v python >/dev/null 2>&1 || py=python3
"$py" -I tools/pixel_e2e.py --selftest >/dev/null &
e2e=$!
trap 'kill "$e2e" 2>/dev/null || true' EXIT

pattern='AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{35}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----'
if hits=$(git grep -lIE "$pattern" HEAD -- ':!tools/check.sh' ':!tests/test_check.sh'); then
  printf 'check: possible secret in:\n%s\n' "$hits" >&2
  fail=1
fi

if hits=$(git ls-files | grep -E '(^|/)\.env(\.|$)' | grep -vE '\.env\.example$'); then
  printf 'check: env file tracked:\n%s\n' "$hits" >&2
  fail=1
fi

hits=$(git ls-tree -r -l HEAD | awk '$4 > 25000000')
if [ -n "$hits" ]; then
  printf 'check: tracked file over 25 MB:\n%s\n' "$hits" >&2
  fail=1
fi

# gitleaks also covers the branch's history, where a later commit may have removed a secret.
if command -v gitleaks >/dev/null 2>&1 && git rev-parse -q --verify origin/main >/dev/null; then
  if [ "$(git rev-list --count origin/main..HEAD)" -gt 0 ]; then
    gitleaks git --redact --no-banner --log-level error --log-opts="origin/main..HEAD" . >&2 || fail=1
  fi
fi

bash tests/test_team_feed.sh
bash tests/test_check.sh
node --test feelink/tactile.test.cjs >/dev/null
node --test feelink/board.test.cjs >/dev/null
node --test feelink/presets.test.cjs >/dev/null
for t in feelink/server.py tools/metrics.py; do
  "$py" -I "$t" --selftest >/dev/null || { echo "check: $t --selftest failed" >&2; fail=1; }
done
wait "$e2e" || { echo "check: tools/pixel_e2e.py --selftest failed" >&2; fail=1; }

[ "$fail" -eq 0 ] && echo "check: ok"
exit "$fail"
