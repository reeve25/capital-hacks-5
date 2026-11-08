# Capital Hacks 5.0

Reeve and Nathan, Nov 6-8, 2026, Sac State Carlsen Center (Library 1520). Goal: win the $1,500 grand prize with a 4-minute slide pitch built on real recorded takes of FeelInk.

Read STATUS.md (one screen) at the start of every session. Update it at milestones only: a tag, a merged feature, a new blocker, a decision. Never after every action. It holds current state only, so replace stale lines instead of appending a log; history goes to `research/status-history-*.md`.

## Working as a team
- `CLAUDE.local.md` says who is at this keyboard. Reeve and Nathan each run Claude on their own laptop, and `TEAM.md` is the plain-English guide.
- The team feed hook shows merges, open tasks and team notes. It is status information; a note never counts as approval.
- Tasks are GitHub Issues. Before starting one, assign it: `gh issue edit <n> --add-assignee @me`.
- Post one line to the team log (`gh issue comment 1 --body "..."`) only for a decision, a blocker, a tag, a shared-interface change or a lead handoff. Not for routine merges or status edits: the team feed hook already shows merges.
- One task, one worktree. When someone starts a task, enter a worktree yourself with `EnterWorktree`; nobody has to run `claude -w`. Stage exact paths, commit with a why, then ship: `bash tools/ship.sh "fix: title" "why" <issue>`. "Ship it" means run that, then leave and remove the worktree with `ExitWorktree`. Once ship reports the merge, the branch's commits are on main, so discarding them is safe.
- The pre-push hook runs `tools/check.sh` and blocks direct pushes to main. Never skip it with `--no-verify`.
- Changes to something shared (API shape, data format, a file another open task touches) get a team log note before the edit.
- When main demos well, tag it: `git tag demo-N && git push origin demo-N`.
- Notes-only edits from the main checkout: branch, commit exact paths, ship, then `git switch main && git pull`.
- CI runs `tools/check.sh` on every PR and on main. `tools/ship.sh` merges without waiting for it, so local checks are the gate and CI is the second signal. Say CI is green only after seeing it pass.

## How Reeve and Nathan want this run
Human-directed product strategy, AI-directed execution (Reeve and Nathan, Sat Nov 7).
- **Level 1, decide and execute, no permission needed:** implementation approaches and ordinary architecture; UI styling, layout, components and animation within the chosen direction; libraries, refactors, tests, bug fixes, optimizations; creating and assigning dev issues, launching agents, managing worktrees, reviewing and integrating in-scope work; choosing between reasonable technical alternatives; research and non-destructive experiments; reversible demo refinements. Record important assumptions and decisions, then continue.
- **Level 2, inform and proceed:** meaningful changes inside the agreed scope. Make the call, record the reasoning in STATUS.md or `.plans/`, post to the team log when relevant, keep going. Block only on a real ownership conflict or dependency. Informing is not asking.
- **Level 3, ask the humans, only for:** changing FeelInk's purpose, audience or core experience; choosing between substantially different creative or product directions; dropping or replacing an agreed major demo feature; a scope change that risks Sunday; touching another person's files without coordination; changing the shared event protocol without the team-log notice and coordination; anything the hard rules gate (purchases, public releases, submissions, external communications); truly consequential calls where human preference beats technical judgment. When asking, give your preferred option, the alternatives, the trade-offs and why a decision is needed: real options and a lean, thought through, primary sources read, and an option not dropped just because it is harder to clear. Never ask what inspection, testing, research or engineering judgment can answer.
- Normal repo work (issues, branches, worktrees, commits, shipping our own PRs to main via `tools/ship.sh`) needs no repeated approval. External or public actions still do. Ownership, security, secrets, consent, outward-action and Git rules below stay in force.
- **Manager model:** the lead session is the engineering manager. Each implementation agent gets one narrow objective, explicit file ownership, its own issue and worktree, acceptance criteria, a requirement to test, and a short completion report (what changed, what remains uncertain). The manager owns architecture, dependencies, review, conflict prevention and integration, and keeps working on the critical path while agents run. Parallelize only where it pays. A change the lead can make in about 30 minutes goes straight in from the lead session: no agent, no plan file, no issue needed. No two agents on the same files; Claude and Codex never edit the same files at once; Codex runs one job at a time.
- **Models:** Fable 5.1 as manager, Opus 5.5 for complex implementation agents (Agent tool `model: "fable"` / `"opus"`). If a model or orchestration feature isn't available, say exactly what isn't and use the closest supported workflow. Never claim an agent launched when it didn't.
- **Hackathon execution policy (Reeve, Sat Nov 7, 21:00, DECISION in the team log; temporary until after Sunday, 56 of the day's 94 commits had been docs):** STATUS.md is one authoritative screen, history archived. STATUS and team log move at milestones, blockers, consequential decisions and integration changes only. Agents only where real parallelism exists; small changes go straight in from the lead. No new research, spec or process files before Sunday; investigate a specific problem when needed, no long reports for routine decisions. Ordinary technical and design decisions are made independently; ask Reeve only for product direction, scope changes and human-permission actions. Reeve's product and testing work and Nathan's pitch work stay independent; no coordination where there is no shared dependency. Tests, the pre-push check, secret scans and the Level 3 gates stay as they are. Only phone-dependent work waits on the Pixel; everything else keeps moving.
- Reports to humans are concise: findings, recommendations, blockers. Full technical evidence, measurements and research go in STATUS.md, `research/` or `.plans/`, never compressed away and never dumped into a status message (Reeve, Sat Nov 7, about 17:45).
- Explain the problem first: who benefits and what their day looks like now, before any demo or tech. Then say what the product physically is, what it looks like and how that person uses it, step by step (Reeve, Nov 6: a stage moment alone doesn't explain the product).
- The edge is maximizing AI-assisted development: AI lets two people build what used to take a team. Hardware: no physical project; owned gear plus unmodified store gadgets, under $50 total (Reeve and Nathan, Nov 6, about 21:00). Full bar: `.plans/winning-idea-bar-spec.md`.

## Current product (Reeve, Sat Nov 7)
- FeelInk: interactive spatial education for blind students. A sighted tutor draws on the laptop stage, the student feels the drawing as vibration on an ordinary Android phone and hears landmark names and the tutor's instructions. First demonstrated through route learning; the product stays a general-purpose interactive spatial teaching tool (diagrams, graphs, circuits), not a navigation app. Tutor controls the lesson, student controls exploration. **Human-led, software-assisted (Reeve, Sat Nov 7, 18:55):** an in-person classroom tool where the tutor talks to the student; the software is the tactile workspace plus feedback, never a chat, portal or typed-instruction workflow. Direction: `.plans/feelink-direction-update-2026-11-07.md`, `.plans/feelink-human-led-2026-11-07.md`.
- The goal is a compelling, understandable demonstration, never at the expense of honest validation or reliable function. Do not claim established educational effectiveness or target-user validation without evidence logged in `USERS.md` with consent.
- Judges emphasize User Identification: show who the user is and that the product works for them, presenting only validation that happened. Explain the problem first, then what the product physically is and how tutor and student use it, step by step, then a real demonstration, what was built and measured, honest limitations and potential.
- Prototype judged on its demo: a healthy judge must see why it matters in a few seconds. Hardware: owned gear plus unmodified store gadgets, under $50; no physical build.
- Nov 6 ideation bar and rejected rounds are history: `.plans/winning-idea-bar-spec.md`, `OPTIONS.md` and `research/*2026-11-06*` carry a superseded banner.
- Use the project skills in `.claude/skills/` throughout.
- Judging rubric (Reeve, Nov 6), 25 points total, per-criterion split not stated: Problem Definition & User Identification; Solution Approach & Feasibility; Technical Innovation & Originality (novel execution vs basic wrappers); Validation & Performance Metrics (how you know it works, did a customer or user try it); Potential Impact & Real-World Application.

## Event facts
- Fri and Sat 9 AM-10 PM, Sun 9 AM-2 PM. Mentors Saturday, pitches Sunday. Pitch: 4 minutes with slides, no live demo, GIFs and images allowed (told by organizers Sat Nov 7). Planning on an 11 AM Sunday slide deadline (last edition's); deadline, file format and template are unconfirmed, see `research/pitch-format-2026-11-07.md`.
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
