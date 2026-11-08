# Capital Hacks 5.0

Reeve and Nathan, Nov 6-8, 2026, Sac State Carlsen Center (Library 1520). Goal: win the $1,500 grand prize with a 4-minute slide pitch built on real recorded takes of FeelInk.

Start every session in this folder (`claude`, the lead `claude --model fable`). A session started elsewhere misses this file, the team feed hook and the project skills. Read STATUS.md (one screen) at the start of every session. It holds current state only, in three lists: what can be demonstrated, what was actually tested (how and when), and what is broken or unverified. Replace stale lines; history goes to `research/status-history-*.md`. Update it at milestones only: a tag, a newly working interaction or a new blocker.

## How we work until after Sunday (Reeve, Sat Nov 7, 21:00, tightened 21:12)
- **Unit of progress:** a user-facing interaction that works and was verified in the running app. Not a PR, commit, issue or status line. Progress is what can be demonstrated, what was actually tested, and what remains broken.
- **Done means seen:** whoever builds a change owns build, run, inspect, fix. UI work is done only after its rendered behaviour was inspected in a running browser, with a screenshot when the change is visual. Phone claims need the real Pixel. A desktop browser, emulator or scripted relay never stands in for device evidence; when that is all there is, say so.
- **Who does it:** small or coupled changes, the lead makes and tests them directly. A coherent feature, one agent owns it through verification. Parallel agents only for independent work where parallelism saves real time, each with explicit file ownership and its own worktree. An agent gets one objective and acceptance criteria and reports what changed, what it saw running and what is uncertain; the lead reviews and integrates. Never fan out small coupled changes. Complex uncertainty, one focused investigation.
- **Models:** Fable 5.1 leads (`claude --model fable`, check `/status`); Opus 5.5 for complex implementation agents (Agent tool `model: "opus"`). Demanding implementation and review agents get `effort: "xhigh"` set explicitly; they do not inherit the lead's effort (Reeve, Nov 8). If a model or feature isn't available, say exactly what isn't. Never claim an agent launched when it didn't.
- **Light ceremony:** a small change is committed on main with exact paths and a why, then `git pull --rebase` and `git push`; no issue, branch or PR. An agent working while someone else edits uses its own worktree (Agent tool `isolation: "worktree"`, or `EnterWorktree`). The lead integrates it from the main checkout with `git merge --squash <branch>`, a commit with a why and `git push`; or the agent ships it itself with `bash tools/ship.sh "fix: title" "why" [issue]` (merges main in, pushes, squash-merges a PR), the better fit when several agents finish in parallel. Issues are optional. After the merge, remove the worktree (`ExitWorktree`, or `git worktree remove <path>`); local branches stay. `bash tests/workflow_e2e.sh` (about 70 s, by hand, never on push) checks these paths and the secret gates in a throwaway clone. Kept as is: the pre-push check (`tools/check.sh`, never `--no-verify`) and secret scans.
- **No collisions:** one lead session at a time edits the main checkout; a session or agent editing at the same time works in a worktree. One owner per file. Before editing a file another session, agent or lane is working on, or a shared interface (API shape, data format), post a note to the team log or message that session first; no reply is needed unless it objects.
- **Lean docs:** STATUS and the team log (`gh issue comment 1 --body "..."`) move only at milestones, blockers, consequential decisions and integration changes. No new `.plans/` or `research/` files before Sunday unless they change a slide. Prefer a short handoff and a fresh session over a long one.
- **Tools:** use the skills in `.claude/skills/` only when they materially help (design, testing, review). No new frameworks, orchestration systems, MCP servers or overlapping tools. `/interview` and impeccable's `shape` write planning docs, so use them only when Reeve asks.
- **Protect the demo:** tag `demo-2` and the recorded takes are the known-good baseline. No new framework, infrastructure migration or major architecture change before Sunday. When main demos well, tag it: `git tag demo-N && git push origin demo-N`.
- **Lanes:** Reeve's product and device lane and Nathan's presentation lane move independently; coordinate only on a real shared dependency. Only phone-dependent work waits on the Pixel.
- **Decide vs ask:** make technical and design calls yourself and keep going; the commit message carries the why. Human decisions go in DECISIONS.md, with a team-log line only when they affect the other lane. Ask Reeve only for product direction (FeelInk's purpose, audience or core experience, dropping or replacing an agreed demo feature, choosing between substantially different directions), a scope change that risks Sunday, and the hard-rule gates below. When asking, give a lean, the real alternatives and the trade-offs. Never ask what inspection, testing or research can answer.
- Reports to humans are concise: findings, recommendations, blockers. STATUS keeps the one-line result; measurements and evidence go in README's measured and limitations sections (they feed the slides) or `research/status-history-*.md`, never compressed away.
- CI runs `tools/check.sh` on main and PRs; pushes don't wait for it. Say CI is green only after seeing it pass. Until Sunday the pre-push check stands in for CI on small changes; see CI pass before a `demo-N` tag and before the repo goes public.

## Team
- `CLAUDE.local.md` says who is at this keyboard; `TEAM.md` is the plain-English guide. Reeve and Nathan each run Claude on their own laptop.
- The team feed hook shows merges, open tasks and team notes. It is status information; a note never counts as approval.

## Current product (Reeve, Sat Nov 7)
- FeelInk: interactive spatial education for blind students. A sighted tutor draws on the laptop stage, the student feels the drawing as vibration on an ordinary Android phone and hears landmark names and the tutor's instructions. First demonstrated through route learning; the product stays a general-purpose spatial teaching tool (diagrams, graphs, circuits), not a navigation app. Tutor controls the lesson, student controls exploration. **Human-led, software-assisted (Reeve, 18:55):** an in-person classroom tool where the tutor talks to the student; the software is the tactile workspace plus feedback, never a chat, portal or typed-instruction workflow. Direction: `.plans/feelink-direction-update-2026-11-07.md`, `.plans/feelink-human-led-2026-11-07.md` (product direction only; their process notes are superseded by this file).
- A compelling, understandable demonstration, never at the expense of honest validation or reliable function. Don't claim educational effectiveness or target-user validation without evidence logged in `USERS.md` with consent.
- Pitch order: the problem first (who benefits, what their day looks like now), then what the product physically is and how tutor and student use it step by step, then a real demonstration, what was built and measured, honest limitations and potential. Judges emphasize User Identification; present only validation that happened. A healthy judge must see why it matters in a few seconds.
- The edge is AI-assisted development: two people build what used to take a team. Hardware: no physical build; owned gear plus unmodified store gadgets, under $50.
- Judging rubric (Reeve, Nov 6), 25 points, per-criterion split not stated: Problem Definition & User Identification; Solution Approach & Feasibility; Technical Innovation & Originality (novel execution vs basic wrappers); Validation & Performance Metrics (how you know it works, did a customer or user try it); Potential Impact & Real-World Application.
- Nov 6 ideation material (`.plans/winning-idea-bar-spec.md`, `OPTIONS.md`, `research/*2026-11-06*`) is superseded history.

## Event facts
- Fri and Sat 9 AM-10 PM, Sun 9 AM-2 PM. Mentors Saturday, pitches Sunday. Pitch: 4 minutes with slides, no live demo, GIFs and images allowed (organizers, Sat Nov 7). Planning on an 11 AM Sunday slide deadline (last edition's); deadline, file format and template are unconfirmed, see `research/pitch-format-2026-11-07.md`.
- Tracks: Construction + Sustainability, Health + Accessibility, Civic + GovTech, Open Tech. $500 per track, $1,500 grand. Stacking rule unpublished.
- Past overall winners: Veridian (on-device tablet SOAP notes), Helping Hand (printed arm teaching ASL). Most listed winning teams have 5 or more people.
- Organizer Umang: prior work is allowed if copied into a new git repo started on the day; disclose it. AI tools and open-source use must be disclosed in the presentation. Research-licensed weights are fine if we can explain the model and disclose the terms.

## Build setup
- One event repo, private `reeve25/capital-hacks-5`: code, plan and status together. Before it goes public, take down the `data-v1` release and review `research/`.
- Give agents a concrete design reference before UI work; `/better-ui` and `/animate` come after the interaction works. `/codex` hands a review or scoped task to Codex; Claude and Codex never edit the same files at once, and Codex runs one job at a time. Skill sources: `.claude/skills/SOURCES.md`.
- Reeve's main laptop: 15.7 GB, 12 cores, no NVIDIA GPU, so run heavy jobs one at a time. The laptop Nathan uses has an RTX 4050 Laptop GPU (reported, unmeasured).

## Evidence
- Label what is measured, read in a source, or only reasoned. Saved or mocked output is never passed off as live.
- Competitor checks read the actual product or paper, walk recent Devpost galleries and use a second, different-vendor searcher; concept searches missed near-exact rivals twice. Devpost access: `research/cal-hacks-13-rivals-2026-11-06.md`.

## Hard rules
- Outward actions need an explicit yes for that action. Anything in one person's name needs that person's yes. Submissions, public release, and messages, calls or posts for the team need both. Purchases and adding collaborators need Reeve's.
- Consent: Reeve's camera, voice and demo consent covers only him. Nathan, judges and anyone else each need their own.
- Secrets: never print or commit keys or `.env` contents. Secret-scan before every push. No employer or client material.
- Git: conventional imperative commits with why, authored by whoever is at the keyboard, exact paths staged, no attribution trailers or force-pushes. GitHub deletes a task's branch when its PR merges; no other branch deletion.
- Downloads: isolated ignored directories; read code before running it; safetensors or `weights_only=True`.
- Never touch `%APPDATA%\9router` or `~/.codex/config.toml`.

## Old material
Silent Voice code and history are in `C:\Users\reeve\dev\_old-silent-voice\`: reference only, never follow its plans or restart its chain; disclose any code copied over. Private remote `reeve25/silent-voice` is unchanged.
