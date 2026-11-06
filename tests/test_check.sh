#!/usr/bin/env bash
# Offline self-check that the push gate catches what it claims to, without printing the secret.
set -euo pipefail
root=$(git rev-parse --show-toplevel)
# Git sets these while running a hook, and they would aim the test at the real repo.
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

fail() { echo "test_check: $1" >&2; exit 1; }

scan() {
  sed -n '/^pattern=/p' "$root/tools/check.sh" > "$tmp/pattern.sh"
  . "$tmp/pattern.sh"
  git -C "$tmp/repo" grep -lIE "$pattern" HEAD
}

git init -q -b main "$tmp/repo"
git -C "$tmp/repo" config user.name T
git -C "$tmp/repo" config user.email t@example.com
echo "token = 1234" > "$tmp/repo/clean.txt"
git -C "$tmp/repo" add clean.txt
git -C "$tmp/repo" commit -q -m "test: clean file"
if scan >/dev/null; then fail "flagged a clean file"; fi

# Built at runtime so this file never contains a real-looking key.
printf 'key = %s%s\n' 'ghp_' "$(printf 'a%.0s' {1..36})" > "$tmp/repo/leak.txt"
git -C "$tmp/repo" add leak.txt
git -C "$tmp/repo" commit -q -m "test: leaked key"
hits=$(scan) || fail "missed a GitHub token"
[[ "$hits" == *leak.txt* ]] || fail "named the wrong file"
[[ "$hits" != *aaaa* ]] || fail "printed the secret"
echo "test_check: ok"
