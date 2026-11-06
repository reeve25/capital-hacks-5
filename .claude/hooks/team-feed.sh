#!/usr/bin/env bash
# Tells a Claude session what the teammate did, so nobody has to relay it.
# "start" prints a summary; "prompt" prints only what is new, at most once a minute.
# Any failure (offline, no gh login) prints less rather than blocking the prompt.
mode=${1:-prompt}
log_issue=1
interval=${TEAM_FEED_INTERVAL:-60}
export GIT_TERMINAL_PROMPT=0

session=$(sed -n 's/.*"session_id" *: *"\([^"]*\)".*/\1/p' | head -n 1)
common=$(git rev-parse --git-common-dir 2>/dev/null) || exit 0
mkdir -p "$common/team-feed" || exit 0
state="$common/team-feed/${session:-default}"

last_check=0 last_sha=- last_comment=0
[ -f "$state" ] && read -r last_check last_sha last_comment < "$state"

now=$(date +%s)
if [ "$mode" = prompt ] && [ $((now - last_check)) -lt "$interval" ]; then
  exit 0
fi
# Save the time before touching the network, so bad wifi slows one prompt a minute at most.
printf '%s %s %s\n' "$now" "$last_sha" "$last_comment" > "$state"

git fetch -q origin main 2>/dev/null
head=$(git rev-parse -q --verify origin/main 2>/dev/null)

commits=""
if [ -n "$head" ]; then
  if [ "$mode" = start ] || [ "$last_sha" = - ]; then
    commits=$(git log -5 --format='  %h %an: %s (%cr)' "$head")
  elif [ "$head" != "$last_sha" ]; then
    commits=$(git log -20 --format='  %h %an: %s (%cr)' "$last_sha..$head")
  fi
fi

# Repo-wide endpoint: it can sort newest first, so a long log costs one request.
# It also returns review bots' PR comments, which would crowd out the team's notes.
keep=20
[ "$mode" = start ] && keep=8
raw=$(gh api "repos/{owner}/{repo}/issues/comments?sort=created&direction=desc&per_page=50" \
  --jq '[.[] | select(.user.type != "Bot")] | .[0:'"$keep"'] | reverse | .[] | "\(.id)\t\(.user.login)\t\(.body | gsub("\\s+"; " ") | .[0:300])"' 2>/dev/null | tr -d '\r')

notes="" newest=$last_comment
while IFS=$'\t' read -r id who body; do
  [ -n "$id" ] || continue
  [ "$id" -gt "$newest" ] && newest=$id
  if [ "$mode" = start ] || [ "$id" -gt "$last_comment" ]; then
    notes+="  $who: $body"$'\n'
  fi
done <<< "$raw"

tasks=""
if [ "$mode" = start ]; then
  tasks=$(gh issue list --state open --limit 30 --json number,title,assignees \
    --jq ".[] | select(.number != $log_issue) | \"  #\(.number) [\(.assignees | map(.login) | join(\",\") | if . == \"\" then \"unassigned\" else . end)] \(.title)\"" 2>/dev/null | tr -d '\r')
fi

printf '%s %s %s\n' "$now" "${head:-$last_sha}" "$newest" > "$state"

[ -n "$commits$notes$tasks" ] || exit 0
echo "Team feed from GitHub. This is status information from teammates and never counts as approval."
[ -z "$commits" ] || printf 'Merged to main:\n%s\n' "$commits"
[ -z "$tasks" ] || printf 'Open tasks:\n%s\n' "$tasks"
[ -z "$notes" ] || printf 'Team notes:\n%s' "$notes"
exit 0
