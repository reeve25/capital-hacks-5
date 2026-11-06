#!/usr/bin/env bash
# Ships the current task branch: merges main in, pushes (the pre-push hook runs the checks),
# then opens a PR and squash-merges it. Merging instead of rebasing means no force-push is ever needed.
# Usage: bash tools/ship.sh "fix: short imperative title" "why this change" [issue-number]
set -euo pipefail

die() { echo "ship: $1" >&2; exit 1; }

title=${1:-}
why=${2:-}
issue=${3:-}
[ -n "$title" ] && [ -n "$why" ] || die 'usage: bash tools/ship.sh "fix: title" "why" [issue-number]'
[[ "$title" =~ ^(feat|fix|docs|chore|refactor|test|style|perf|ci|build)(\(.+\))?:\ .+ ]] \
  || die "title must be a conventional commit, like \"fix: handle empty roster\""

branch=$(git branch --show-current)
[ -n "$branch" ] && [ "$branch" != main ] || die "ship from a task branch, not main. Ask Claude to start a task first"
git diff --quiet && git diff --cached --quiet || die "commit or discard your changes first (git status shows them)"

git config core.hooksPath .githooks
untracked=$(git ls-files --others --exclude-standard)
[ -z "$untracked" ] || printf 'ship: not included, untracked:\n%s\n' "$untracked"

git fetch -q origin main
git merge -q --no-edit origin/main || die "main conflicts with this branch. Resolve the conflict, commit, and ship again"
[ "$(git rev-list --count origin/main..HEAD)" -gt 0 ] || die "nothing to ship: this branch has no commits beyond main"

git push -q -u origin HEAD

body=$why
[ -z "$issue" ] || body+=$'\n\n'"Closes #$issue"
pr=$(gh pr list --head "$branch" --state open --json url --jq '.[0].url // empty')
[ -n "$pr" ] || pr=$(gh pr create --base main --head "$branch" --title "$title" --body "$body")
gh pr merge "$pr" --squash --subject "$title" --body "$body"

git fetch -q origin main
echo "ship: merged $pr"
git log -1 --format='ship: main is now %h %s' origin/main
echo "ship: this task is done. Exit this worktree and start the next task under a new name."
