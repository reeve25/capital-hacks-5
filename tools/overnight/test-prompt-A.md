CONTINUITY TEST, session A (supervised, headless). Working directory {{REPO}}. Do exactly these steps with the Bash tool and the Claude in Chrome tools, append each result as one line to .tmp/overnight-state/test-checkpoint.md, and then end your turn. Edit nothing else; do not commit.
1. Append: `A: session $CLAUDE_CODE_SESSION_ID started {{NOW}}` (expand the environment variable with Bash).
2. Run `codex exec --sandbox read-only --cd "{{REPO}}" "Read tools/overnight/supervisor.ps1 and reply with one sentence: what stops it from restarting forever?"` with a 120 s timeout; append `A codex: <its final answer line>` (or `A codex: FAILED <reason>`).
3. Append `A file: <first line of STATUS.md>`.
4. With the Claude in Chrome tools: get tab context (createIfEmpty true), navigate to https://docs.google.com/presentation/d/1056SUeRRlxASAS6Sz-2Wr05TLDUp538p2jijT9DjrKg/edit, wait 4 s, take a screenshot at scale 0.4, append `A browser: <tab title> | edit access visible: yes/no (a Share button or editing toolbar)`; on any failure append `A browser: FAILED <error text>`. Close the tab you used.
5. Append `A: exiting at <HH:MM:SS>` and end the turn with a one-line summary.
