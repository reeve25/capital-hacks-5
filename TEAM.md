# Working together

You don't need to remember any commands. Say these to Claude in plain English.

| You want to | Say |
|---|---|
| See what's going on | "What's the team status?" |
| Pick up work | "What should I work on?" or "Take issue 4" |
| Add a task | "Add a task for the mic bug and assign it to me" |
| Tell the other person something | "Tell the team we're using Next.js" |
| Finish a task | "Ship it" |
| Mark a working demo | "Tag this as a good demo" |

## Starting a task
Run `claude` once in the repo folder, then say what you want, like "start a task for the mic bug." Claude gives the task its own copy of the code, so it can't collide with other work, and cleans that copy up after it ships. To run two tasks at once, open a second terminal and do the same there.

## Where things live
- `CLAUDE.md`: the rules both Claudes follow.
- `STATUS.md`: what is true right now.
- GitHub Issues: who is doing what. Issue #1 is the live team log.
- `CLAUDE.local.md`: who is at this laptop. It is never committed.

## If something goes wrong
- **A push was refused by the checks**: expected. Ask Claude to fix what `tools/check.sh` reported, then push again.
- **Merge conflict**: ask Claude to resolve it and show you what it chose.
- **Wifi is down**: work continues locally, and the team feed goes quiet. Use a phone hotspot to ship.
- **Demo broke on main**: ask Claude to revert the last shipped task. Each task is one commit, and `demo-N` tags mark the last good versions.
