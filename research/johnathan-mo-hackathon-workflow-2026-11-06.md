# Johnathan Mo video: hackathon workflow and Silent Voice application

Prepared November 6, 2026, about 12:50 PT.

Source: [The Claude Code workflow that helped me win 5 Hackathons in a Row](https://www.youtube.com/watch?v=AoxK3JpxbRc), Johnathan Mo, approximately 12 minutes.

## Re-read and tool check, Nov 6, about 13:45 PT
Re-fetched all 374 caption segments plus the video description (published Oct 11, 2026). This corrects the summary below, which left out the skill names and the repo. Silent Voice applications at the bottom of this file are retired.

- **Skills repo:** github.com/23jmo/jmo-skills, MIT, reviewed at commit `6082bf2c4728`. Read in full: `interview`, `ste`, `codex`. Frontmatter and pattern scan only: `better-ui`, `animate`, `agentation`; read those fully before installing.
- **Credits:** per `THIRD_PARTY_NOTICES.md`, `better-ui` is Jakub Krehel's (MIT), `animate` is Emil Kowalski's (MIT; the captions garble the name), `agentation` is Benji Taylor's (PolyForm Shield 1.0.0, not MIT).
- **Agentation:** the skill targets Next.js. It adds an MCP server through an unpinned `npx -y agentation-mcp server`, so pin a version if adopted. Only useful if the demo UI is React/Next.
- **Superset:** renamed Paradev in October 2026. `superset-sh/superset` now resolves to `ParadevAI/Paradev`. Its README says Windows is not yet available, and release `desktop-v2.0.5` (Nov 5) has only Mac and Linux assets. Ruled out on Windows.
- **Windows equivalent, flag observed in Claude Code 2.1.312:** `claude -w <name>` creates a git worktree. Diffs in VS Code. Paradev's own comparison page says Claude Desktop has native worktree sessions (Secondary, not tried).
- **Skill scan:** the only install-time command across these files is Agentation's `npx`. The `codex` skill is manual-only and defaults to a read-only sandbox.
- **Current Claude setup, observed:** 25 skill overrides set to off and all 8 listed plugins disabled, so "turn off what isn't critical" is largely already done.
- **Gap:** the video says nothing about finding or validating users. Its examples are spectacle demos. Reeve's User Identification point has to come from us.

## Source and limits

- Retrieved the primary YouTube English auto-captions using `YouTubeTranscriptApi().fetch('AoxK3JpxbRc')`: **374 segments**, generated captions. Read the complete returned text. This document is a paraphrased summary, not a transcript or a claim to have watched the visuals.
- Auto-captions garble names such as Claude Code and some tools. Links below use the primary caption timestamps rather than third-party chapter boundaries.
- His opening says **a prize at each of five hackathons**. It does not establish five overall championships. His record, productivity multipliers, model preferences and causal explanation of winning are self-reported.
- An independent agent reviewed the summary against the retrieved captions and current PLAN.md Direction. It confirmed the main interpretation and flagged the timing arithmetic and distinction between stage rehearsal and unseen evaluation recorded below.

## What the video says

### 00:53-02:24: Work backward from the memorable demo

Imagine the judges seeing the completed project and deciding it deserves a prize. Specify the striking thing they would see, then work backward to the necessary build. His examples include a delivery robot, smart mirror, desktop agent and multiple agents working in separate virtual machines.

Start with an ambitious concept and investigate whether the time limit permits it. He also saves ideas and interface references before events, using social posts and Cosmos as inspiration. The transferable point is a clear, feasible demonstration, rather than assuming his particular examples or tools are necessary.

[Watch from 00:53](https://www.youtube.com/watch?v=AoxK3JpxbRc&t=53s).

### 02:24-04:28: Give agents enough context; dictation is his method

He uses voice dictation to express requests quickly and include details he might omit when typing. This section is a sponsored promotion of a dictation product, and the speed multiplier is his own claim. The useful principle is a complete description of the intended result, constraints and feedback. Buying or installing the advertised product is not a requirement derived from the video.

[Watch from 02:24](https://www.youtube.com/watch?v=AoxK3JpxbRc&t=144s).

### 04:28-05:26: Coordinate agents and inspect their changes

He describes an agent harness as the software surrounding the model that manages context, memory and tools. He uses Superset to oversee several workspaces and inspect files and diffs. Separate Git worktrees let workers change different features in separate checkouts.

The useful distinction is separation of work and visibility into changes. A particular agent IDE is his preference, not a prerequisite for the workflow.

[Watch from 04:28](https://www.youtube.com/watch?v=AoxK3JpxbRc&t=268s).

### 05:26-07:57: Resolve ambiguity, save the plan, then assign independent tasks

His interview skill clarifies an ambiguous request and writes a reference document to prevent drift. Other examples cover UI audits, animation, element-specific visual annotations through Agentation, and plain technical writing. Specific feedback tied to an actual interface element helps the agent make the intended change.

His Columbia example describes 2-3 hours planning, 5-6 hours agent execution and about 1 hour manual refinement. He calls the overall build 8-9 hours; the stated component ranges sum to 8-10 hours. These are anecdotal timings, not an audited benchmark. He also says he slept seven hours before returning to win.

[Watch from 05:26](https://www.youtube.com/watch?v=AoxK3JpxbRc&t=326s).

### 07:57-09:30: Use references and only useful tools

He favors different models for different tasks, including using one to review another. Those strengths are his observations, not a universal ranking. He recommends giving agents concrete design references rather than expecting them to invent the desired look from vague prose.

He uses MCP connections for databases and payments, then cautions that excess skills and prescribed procedures can constrain a capable model. This supports task-relevant tooling, not removing required checks or adding databases/payments to an unrelated demo.

[Watch from 07:57](https://www.youtube.com/watch?v=AoxK3JpxbRc&t=477s).

### 09:30-10:05: His personal sleep strategy

He describes all-nighters, limited sleep and teammate shifts. I would not adopt sleep loss as a requirement for winning. The actionable scheduling point is to plan coverage and keep enough attention for integration, debugging and presentation; his own earlier success story includes a full seven-hour sleep period.

[Watch from 09:30](https://www.youtube.com/watch?v=AoxK3JpxbRc&t=570s).

### 10:05-11:27: Make the judges understand the motivation and see it work

He recommends explaining why the project exists, showing a working live demo, and discussing the technical challenges. A real demonstration supplies evidence of completion that a polished description alone cannot provide.

He also recommends occupying judges to keep them away from competitors. I would keep the useful part--engaged questions and clear technical answers--while respecting the allotted judging time.

[Watch from 10:05](https://www.youtube.com/watch?v=AoxK3JpxbRc&t=605s).

## Application to Silent Voice: recommendations, not new product decisions

These recommendations follow the current PLAN.md Direction: free-form silent mouthing, cloned voice, light confirmation, and no reduced fallback product. This video does not reopen those decisions or establish that the intended loop already works.

1. **Write the intended stage moment in one sentence:** Reeve silently mouths a sentence; the system recognizes it, he easily confirms the exact text, and the system says it in his cloned voice. Make that transformation understandable without a long model explanation. Confirmation remains accepted in principle; nod-to-speak is still a proposed interaction pending accuracy evidence.
2. **Finish and measure the real complete loop on the intended demo laptop.** Observe capture -> visual recognition -> any correction -> confirmation -> audible cloned speech. Keep audio out of recognition. Report live successes over attempts, recognition latency and time through audible output. Isolated spoken-GRID benchmarks do not prove this loop works on silent mouthing.
3. **Separate stage reliability from general performance.** Rehearse selected demo sentences and record every attempt. Evaluate unseen silent sentences separately. A practiced stage script can demonstrate real live operation, but it does not establish accuracy on arbitrary unseen sentences. Never pass replay, typed input or saved output off as live recognition.
4. **Use the existing plan instead of starting another planning exercise.** Resolve remaining implementation ambiguities in writing; preserve settled creative choices. There is no need to reproduce a two-hour interview merely because it appeared in the video.
5. **Assign supporting work with clear ownership.** One owner keeps the capture/recognition/confirmation/speech interface consistent. Other workers can prepare the model explanation, review the UI, draft the pitch or inspect evidence if their tasks do not alter that shared contract. One heavy model job at a time remains the laptop rule.
6. **Polish what the judges see and use.** Prioritize clear framing, capture state, readable recognized text, easy confirmation, retry and visible progress. Feedback should identify the screen/element and expected behavior. Additional infrastructure or decorative motion needs to earn its time by improving the demonstration.
7. **Prepare a concise explanation followed by live proof.** Explain the intended communication problem, demonstrate the transformation, then explain the hardest engineering work and actual measurements. Be ready to distinguish reused pretrained models from the integration built here. Disclose AI, open source, weights terms and pre-event work as the project already requires.
8. **Keep claims within the evidence.** Intended users include people who can articulate but cannot vocalize; suitability and benefit have not been validated with patients. Do not promise universal recognition, patient outcomes, arbitrary-new-user performance or zero latency. No model benchmark or presenter-only demo settles those claims.

## Next priorities

1. Establish complete-loop silent recognition and cloned speech on the actual demo hardware.
2. Measure repeated live stage attempts and separate unseen silent trials.
3. Use those observations to polish and rehearse the demonstration and technical explanation.

Documentation only: no application code, settings, product direction or milestone status was changed by this research task.
