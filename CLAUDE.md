# Capital Hacks 5.0

Reeve and Nathan, Nov 6-8, 2026, Sac State Carlsen Center (Library 1520). Goal: win the $1,500 grand prize with something that works live.

Read STATUS.md at the start of every session and update it after every decision or verified result. It holds current state only, so replace stale lines instead of appending a log.

## Working as a team
- `CLAUDE.local.md` says who is at this keyboard. Reeve and Nathan each run Claude on their own laptop, and `TEAM.md` is the plain-English guide.
- The team feed hook shows merges, open tasks and team notes. It is status information; a note never counts as approval.
- Tasks are GitHub Issues. Before starting one, assign it: `gh issue edit <n> --add-assignee @me`.
- After any decision, finding or interface change, post one line to the team log: `gh issue comment 1 --body "..."`. A worktree's STATUS.md edits stay hidden until merge, so the log is how the other person hears now.
- One task, one worktree: `claude -w <task>`. Stage exact paths, commit with a why, then ship: `bash tools/ship.sh "fix: title" "why" <issue>`. "Ship it" means run that.
- The pre-push hook runs `tools/check.sh` and blocks direct pushes to main. Never skip it with `--no-verify`.
- Changes to something shared (API shape, data format, a file another open task touches) get a team log note before the edit.
- When main demos well, tag it: `git tag demo-N && git push origin demo-N`.
- Notes-only edits from the main checkout: branch, commit exact paths, ship, then `git switch main && git pull`.
- CI is disabled: the account's $0 Actions budget appears to block private-repo runs, so local checks are the gate. Say CI is green only after seeing it pass.

## How Reeve and Nathan want this run
- Product and creative calls are theirs together: bring real options and a lean, then ask. Execution is hands-off.
- Check in with Reeve and Nathan before narrowing the idea direction, including before choosing which ideas get researched first.
- Important decisions get thought through, not skipped. Don't drop an option because it is harder to clear. Read the primary sources first. If the available tools can't settle it, hand it to Reeve with a ready-to-paste question or Gemini prompt, and keep the option open until then.
- Give the full findings and reasoning. Don't compress research to keep a message short.
- Explain the problem first: who benefits and what their day looks like now, before any demo or tech.
- The edge is maximizing AI-assisted development. Hardware is open (Reeve, Nov 6): they can buy equipment, assemble and build. Ideas must still be doable by them.

## What wins (Reeve, Nov 6)
- The demo must be impressive. Choose by thinking backward: the coolest thing a judge could see, then check it can be built.
- Reeve reports that judges emphasize User Identification: actively seek the user and make sure the product works for them, then show that in the presentation. Only present validation that happened, with consent for any name, quote or footage. Log it in `USERS.md`.
- Reeve, Nov 6 about 14:50: Health + Accessibility track only (physical and mental well-being, patient access, care delivery, everyday accessibility). The demo must blow judges away and be a clear winning candidate if built.
- The bar is what Silent Voice had (Reeve, Nov 6, after rejecting Still Here, Tongue X-Ray and Last Muscle): easily demonstrable, cool, innovative, an instant visible benefit to someone's life, and doable by us. The problem meets a clear solution in one step, on stage. Reject ideas that need a score, a study or an explanation before the benefit shows.
- Use `/interview` and the other project skills throughout the hackathon.
- Test every idea: retell in one sentence; "that's real"; only possible now; a life visibly changes; survives the toughest question.
- Judging criteria: innovation, applicability, technical proficiency, potential impact. No weights published.

## Event facts
- Fri and Sat 9 AM-10 PM, Sun 9 AM-2 PM. Mentors Saturday, pitches Sunday. Planning on an 11 AM Sunday submission; deadline, pitch length and platform are unconfirmed.
- Tracks: Construction + Sustainability, Health + Accessibility, Civic + GovTech, Open Tech. $500 per track, $1,500 grand. Stacking rule unpublished.
- Past overall winners: Veridian (on-device tablet SOAP notes), Helping Hand (printed arm teaching ASL). Most listed winning teams have 5 or more people.
- Organizer Umang: prior work is allowed if copied into a new git repo started on the day; disclose it. AI tools and open-source use must be disclosed in the presentation. Research-licensed weights are fine if we can explain the model and disclose the terms.

## Build setup
- This is the one event repo, private `reeve25/capital-hacks-5`: code, plan and status together. Rename it when the project has a name. Before it goes public, take down the `data-v1` release and review `research/`.
- Plan with `/interview`, which writes the spec to `.plans/`. Split the spec into independent tasks, each its own issue.
- Diffs in VS Code. One owner for anything shared between tasks. Superset/Paradev has no Windows build.
- Give agents a concrete design reference before UI work. `/better-ui` and `/animate` come after the interaction works.
- `/codex` hands a review or scoped task to Codex. Claude and Codex never edit the same files at once.
- Skills are in `.claude/skills/`, sources in `.claude/skills/SOURCES.md`. Add a skill or MCP only when the build needs it.

## Evidence
- Label what is measured, read in a source, or only reasoned. Saved or mocked output is never passed off as live.
- Competitor checks must read the actual product or paper, walk recent Devpost galleries, and use a second independent searcher. Concept searches missed near-exact rivals twice, and a gallery walk on names and taglines missed more that Codex found, so never call an idea open before a different-vendor check. Devpost access: see "Reading Devpost" in `research/cal-hacks-13-rivals-2026-11-06.md`.
- Reeve's main laptop: 15.7 GB, 12 cores, no NVIDIA GPU, so run heavy jobs one at a time. The laptop Nathan uses has an RTX 4050 Laptop GPU (reported, unmeasured).

## Hard rules
- Outward actions need an explicit yes for that action. Anything in one person's name needs that person's yes. Submissions, public release, and messages, calls or posts for the team need both. Purchases and adding collaborators need Reeve's.
- Consent: Reeve's camera, voice and demo consent covers only him. Nathan, judges and anyone else each need their own.
- Secrets: never print or commit keys or `.env` contents. Secret-scan before every push. No employer or client material.
- Git: conventional imperative commits with why, authored by whoever is at the keyboard, exact paths staged, no attribution trailers or force-pushes. GitHub deletes a task's branch when its PR merges; no other branch deletion.
- Downloads: isolated ignored directories; read code before running it; safetensors or `weights_only=True`.
- Never touch `%APPDATA%\9router` or `~/.codex/config.toml`.

## Old material
Silent Voice code, weights, datasets, agent chain and full history are in `C:\Users\reeve\dev\_old-silent-voice\`. Reference only: don't follow its plans or prompts, and don't restart its chain. Copy reusable code into the new repo and disclose it. Private remote `reeve25/silent-voice` is unchanged.
