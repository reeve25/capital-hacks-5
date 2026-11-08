# Working together

You don't need to remember any commands. Start Claude in the repo folder, then say what you want in plain English.

```
cd C:\Users\reeve\dev\capital-hacks-5
claude
```

Start it in this folder, not your home folder: only then does Claude load the team rules, the team feed and the project skills. Reeve's lead session runs `claude --model fable`.

| You want to | Say | What Claude does |
|---|---|---|
| See what's going on | "What's the team status?" | Reads STATUS.md and the team feed |
| Fix or change something small | "Fix the label wording" | Makes the change, runs it, commits and pushes to main; the checks run on every push |
| Build something bigger | "Build the recording export" | Gives it to one agent that builds and tests it, in its own copy of the code (a worktree) when other work is going on, then merges it to main |
| Tell the other person something | "Tell the team we're using Next.js" | Posts one line to the team log (issue #1) |
| Hand work to the other person | "Add a task for the deck timing and assign it to Nathan" | Opens an issue. Optional: small work needs no issue |
| Mark a working demo | "Tag this as a good demo" | `git tag demo-N` on main |

## Lanes
- Reeve: the product and the phone (FeelInk code, the Pixel, recording takes).
- Nathan: the presentation (deck, pitch, organizer questions, fact sheet).
- Each lane keeps moving on its own. Before editing a file the other lane is working on, post a note to the team log first.

## Where things live
- `CLAUDE.md`: the rules both Claudes follow.
- `STATUS.md`: what works, what was tested, what is broken, right now.
- `DECISIONS.md`: Reeve's and Nathan's decisions, newest first.
- GitHub Issues: optional tasks. Issue #1 is the live team log.
- `CLAUDE.local.md`: who is at this laptop. It is never committed.

## If something goes wrong
- **A push was refused by the checks**: expected. Ask Claude to fix what `tools/check.sh` reported, then push again.
- **A push was rejected because main moved**: Claude pulls the new main in (`git pull --rebase`) and pushes again.
- **Merge conflict**: ask Claude to resolve it and show you what it chose.
- **Wifi is down**: work continues locally and the team feed goes quiet. Use a phone hotspot to push.
- **Demo broke on main**: ask Claude to revert the change that broke it. `demo-N` tags mark the last good versions.
