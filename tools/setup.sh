#!/usr/bin/env bash
# One-time setup for a clone. Identity comes from the signed-in gh account, so commits
# name whoever is at this keyboard even though both laptops use one Claude account.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

login=$(gh api user --jq .login) || { echo "setup: run 'gh auth login' first" >&2; exit 1; }
id=$(gh api user --jq .id)
case "$login" in
  reeve25) name="Reeveson Masilamani"; person=Reeve ;;
  nathanjeevs) name=Nathan; person=Nathan ;;
  *) echo "setup: unexpected GitHub account $login" >&2; exit 1 ;;
esac

gh auth setup-git
git config user.name "$name"
git config user.email "$id+$login@users.noreply.github.com"
git config core.hooksPath .githooks
git config core.longpaths true
git config pull.ff only
git remote set-head origin -a >/dev/null

if [ ! -f CLAUDE.local.md ]; then
  {
    echo "At this keyboard: $person (GitHub $login)."
    if [ "$person" = Nathan ]; then
      echo "Nathan is newer to coding. Explain what you are doing and why in plain language, and run all git and shipping steps yourself so he never has to remember commands."
      echo "This laptop is signed in to Reeve's Claude account. Do not use the Gmail, Drive or Calendar tools unless Reeve asks in this chat."
    fi
  } > CLAUDE.local.md
fi

corpus=research/devpost/projects.jsonl
if [ ! -f "$corpus" ]; then
  gh release download data-v1 --pattern projects.jsonl --dir research/devpost \
    || echo "setup: Devpost corpus not downloaded; rival checks need it" >&2
fi

bash tools/check.sh
echo "setup: ready as $person ($login)"
