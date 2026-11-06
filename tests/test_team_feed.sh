#!/usr/bin/env bash
# Offline self-check of the team feed: a local bare remote and a stubbed gh.
set -euo pipefail
hook="$(git rev-parse --show-toplevel)/.claude/hooks/team-feed.sh"
# Git sets these while running a hook, and they would aim the test at the real repo.
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

fail() { echo "test_team_feed: $1" >&2; exit 1; }

mkdir "$tmp/bin"
cat > "$tmp/bin/gh" <<'STUB'
#!/usr/bin/env bash
case "$*" in
  *issues/comments*) cat "$GH_STUB_COMMENTS" ;;
  *"issue list"*) echo '  #2 [nathanjeevs] build the demo' ;;
esac
STUB
chmod +x "$tmp/bin/gh"
export GH_STUB_COMMENTS="$tmp/comments"
printf '100\treeve25\tpicked the idea\n' > "$GH_STUB_COMMENTS"

git init -q --bare -b main "$tmp/origin.git"
git clone -q "$tmp/origin.git" "$tmp/a" 2>/dev/null
commit() {
  git -C "$tmp/a" -c user.name=A -c user.email=a@example.com commit -q --allow-empty -m "$1"
  git -C "$tmp/a" push -q origin HEAD:main
}
commit "feat: first"
git clone -q "$tmp/origin.git" "$tmp/b" 2>/dev/null

feed() { (cd "$tmp/b" && printf '{"session_id":"s1"}' | PATH="$tmp/bin:$PATH" bash "$hook" "$1"); }

out=$(feed start)
[[ "$out" == *"feat: first"* ]] || fail "start missed the commit"
[[ "$out" == *"build the demo"* ]] || fail "start missed the task"
[[ "$out" == *"picked the idea"* ]] || fail "start missed the note"

commit "feat: second"
[ -z "$(feed prompt)" ] || fail "prompt ignored the one-minute throttle"

export TEAM_FEED_INTERVAL=0
out=$(feed prompt)
[[ "$out" == *"feat: second"* ]] || fail "prompt missed the new commit"
[[ "$out" != *"feat: first"* ]] || fail "prompt repeated an old commit"
[[ "$out" != *"picked the idea"* ]] || fail "prompt repeated an old note"

printf '100\treeve25\tpicked the idea\n101\tnathanjeevs\tmic works\n' > "$GH_STUB_COMMENTS"
out=$(feed prompt)
[[ "$out" == *"mic works"* ]] || fail "prompt missed the new note"
[[ "$out" != *"picked the idea"* ]] || fail "prompt repeated an old note"

[ -z "$(feed prompt)" ] || fail "prompt repeated with nothing new"
echo "test_team_feed: ok"
