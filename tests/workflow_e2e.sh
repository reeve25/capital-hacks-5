#!/usr/bin/env bash
# Slow end-to-end check of the team workflow, run by hand (not from tools/check.sh): about 70 seconds.
#   bash tests/workflow_e2e.sh
# Clones this repo's committed main into a temp dir with a local bare origin and a `gh` stub that does GitHub's
# squash merge, then exercises: a direct small change to main, the secret gates, the agent worktree + tools/ship.sh
# path, and stale or conflicting pushes. Nothing reaches GitHub. The synthetic token is never printed.
set -uo pipefail
REPO=$(git rev-parse --show-toplevel)
T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT
fails=0
pass() { echo "PASS $1"; }
fail() { echo "FAIL $1"; fails=$((fails + 1)); }

git clone -q --bare "$REPO" "$T/origin.git"
for c in a b; do
  git clone -q "$T/origin.git" "$T/$c"
  git -C "$T/$c" config user.name wf-test
  git -C "$T/$c" config user.email wf@test.invalid
  git -C "$T/$c" config core.hooksPath .githooks
  git -C "$T/$c" config core.longpaths true
done
A=$T/a B=$T/b

# 1. A small change goes straight to main: no issue, branch or PR, and the pre-push check really runs.
echo "wf-test line" >> "$A/README.md"
git -C "$A" add README.md
git -C "$A" commit -q -m "docs: wf test small change"
out=$(cd "$A" && git push origin main 2>&1); rc=$?
if [ $rc -eq 0 ] && grep -q "check: ok" <<< "$out" && [ "$(git -C "$A" rev-parse HEAD)" = "$(git -C "$T/origin.git" rev-parse main)" ]; then
  pass "1 direct push to main ran tools/check.sh (check: ok) and landed"
else fail "1 direct push rc=$rc"; tail -5 <<< "$out"; fi

# 2. Secret gates. The token matches tools/check.sh's GitHub-token pattern and gitleaks' rule.
tok="ghp_$(head -c 4000 /dev/urandom | tr -dc 'A-Za-z0-9' | head -c 36)"
printf 'token=%s\n' "$tok" > "$A/leak.txt"
git -C "$A" add leak.txt
if git -C "$A" commit -q -m "chore: leak" >/dev/null 2>&1; then fail "2a pre-commit let a staged token through"
else pass "2a pre-commit (gitleaks) blocked the staged token"; fi
# Build the bad commit with --no-verify, only here in the throwaway clone, to test the push gate on its own.
git -C "$A" commit --no-verify -q -m "chore: synthetic leak fixture"
if git -C "$A" grep -qIE 'gh[pousr]_[A-Za-z0-9]{36}' HEAD -- leak.txt; then pass "2b fixture: the token is in the committed tree"
else fail "2b fixture: the token is not in HEAD"; fi
out=$(cd "$A" && git push origin main 2>&1); rc=$?
if [ $rc -ne 0 ] && grep -q "check: possible secret in:" <<< "$out" && grep -q "leak.txt" <<< "$out" \
   && ! grep -qE "non-fast-forward|fetch first|rejected" <<< "$out" \
   && [ "$(git -C "$T/origin.git" rev-parse main)" != "$(git -C "$A" rev-parse HEAD)" ]; then
  pass "2c pre-push ran check.sh and refused the push for the token alone; origin unchanged"
else fail "2c push gate rc=$rc"; grep -v "$tok" <<< "$out" | tail -5; fi
grep -q "$tok" <<< "$out" && fail "2d the token appeared in hook output" || pass "2d hook output never printed the token"
git -C "$A" reset -q --hard origin/main

# 3. Agent path: a worktree, a commit, tools/ship.sh merging main in, then the worktree removed.
mkdir -p "$T/bin"
cat > "$T/bin/gh" <<'EOF'
#!/usr/bin/env bash
# Stub of GitHub for ship.sh: the squash merge happens server-side there, so no local hook runs (--no-verify).
case "$1 $2" in
  "pr list") exit 0 ;;
  "pr create") echo "https://example.invalid/pr/1" ;;
  "pr merge") shift 3; subj=""; while [ $# -gt 0 ]; do [ "$1" = --subject ] && subj=$2; shift; done
    git fetch -q origin main
    git push -q --no-verify origin "$(git commit-tree "HEAD^{tree}" -p origin/main -m "$subj"):refs/heads/main" ;;
  *) echo "gh stub: unexpected $*" >&2; exit 1 ;;
esac
EOF
chmod +x "$T/bin/gh"
git -C "$B" pull -q --rebase
W=$B/.claude/worktrees/agent-test
git -C "$B" worktree add -q "$W" -b worktree-agent-test
if [ "$(git -C "$W" rev-parse --git-path hooks)" = .githooks ] && [ -x "$W/.githooks/pre-push" ]; then pass "3a worktree uses its own .githooks"
else fail "3a worktree hooks path: $(git -C "$W" rev-parse --git-path hooks)"; fi
echo "agent feature line" >> "$W/TEAM.md"
git -C "$W" commit -qam "feat: agent test"
echo "concurrent small change" >> "$A/STATUS.md"   # main moves meanwhile, so ship.sh has to merge it in
git -C "$A" commit -qam "docs: concurrent"
(cd "$A" && git push -q origin main >/dev/null 2>&1)
out=$(cd "$W" && PATH="$T/bin:$PATH" bash tools/ship.sh "feat: agent test" "workflow test" 2>&1); rc=$?
git -C "$B" fetch -q origin main
if [ $rc -eq 0 ] && grep -q "ship: merged" <<< "$out" && git -C "$B" show origin/main:TEAM.md | grep -q "agent feature line" \
   && git -C "$B" show origin/main:STATUS.md | grep -q "concurrent small change"; then
  pass "3b ship.sh merged main in, its push ran check.sh, and the squash landed both changes"
else fail "3b ship rc=$rc"; tail -6 <<< "$out"; fi
if git -C "$B" worktree remove "$W" && [ "$(git -C "$B" worktree list | wc -l)" -eq 1 ] && git -C "$B" rev-parse -q --verify worktree-agent-test >/dev/null; then
  pass "3c worktree removed after the merge, branch kept"
else fail "3c worktree removal"; fi

# 3d. The lead's no-PR integration: squash an agent branch into main from the main checkout, then push.
git -C "$B" pull -q --rebase
W2=$B/.claude/worktrees/agent-squash
git -C "$B" worktree add -q "$W2" -b worktree-agent-squash
echo "squash feature line" >> "$W2/TEAM.md"
git -C "$W2" commit -qam "feat: squash test"
git -C "$B" merge -q --squash worktree-agent-squash && git -C "$B" commit -q -m "feat: squash test"
out=$(cd "$B" && git push origin main 2>&1); rc=$?
if [ $rc -eq 0 ] && grep -q "check: ok" <<< "$out" && git -C "$T/origin.git" show main:TEAM.md | grep -q "squash feature line"; then
  pass "3d lead squash-merged the agent branch on main and the push ran check.sh"
else fail "3d squash integration rc=$rc"; tail -5 <<< "$out"; fi
git -C "$B" worktree remove "$W2"

# 4. Shared files: a stale clone can't overwrite main, and a same-line edit stops as a conflict.
git -C "$A" pull -q --rebase
sed -i '1s/.*/# status (edit A)/' "$A/STATUS.md"; git -C "$A" commit -qam "docs: edit A"; (cd "$A" && git push -q origin main >/dev/null 2>&1)
sed -i '1s/.*/# status (edit B)/' "$B/STATUS.md"; git -C "$B" commit -qam "docs: edit B"
if (cd "$B" && git push -q origin main >/dev/null 2>&1); then fail "4a stale push overwrote main"; else pass "4a stale push to main rejected"; fi
if git -C "$B" pull -q --rebase >/dev/null 2>&1; then fail "4b same-line edit merged silently"
else pass "4b pull --rebase stops on the same-line conflict"; git -C "$B" rebase --abort; fi

[ "$fails" -eq 0 ] && echo "workflow_e2e: ok" || echo "workflow_e2e: $fails failed"
exit "$fails"
