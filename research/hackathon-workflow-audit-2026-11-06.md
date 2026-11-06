# Capital Hacks workflow audit against Johnathan Mo

Snapshot: November 6, 2026, approximately 15:10 PT. This is an audit, not a new project choice or build authorization. Other chats were active during the audit; the final checks below supersede earlier observations.

## Verdict

**Partially following the advice. The current tool selection is appropriate; earlier execution drifted from the intended demo and delayed proof of the central interaction. The newly started interview and shared repo correct real problems, but do not yet establish a working product or two-laptop operation.**

Silent Voice is stopped. No replacement project is selected. Do not restart the retired agent chain or treat the old Silent Voice application section in the video notes as current direction.

## Evidence inspected

- Indexed 30 relevant local Claude session logs at the latest refresh: 20 in the project directory and 10 hackathon-related conversations in the global-root directory. Two additional matches concerned conference/school matters and were excluded from the hackathon assessment. Reviewed human exchanges, key assistant conclusions, skill tool invocations and selected original records; this does not mean every tool output or screenshot was independently reproduced.
- Indexed 46 project-related Codex session logs for November 6 and extracted requests/final messages; 31 had recorded final-answer messages. Interrupted sessions are not counted as completed work.
- Read current CLAUDE.md, STATUS.md, TEAM.md, the video notes, installed skill definitions/provenance, shell workflow, tests and CI configuration; spot-checked archived Silent Voice state and prior admissions against original chat records.
- Two independent reviewers assessed tooling and strategy. Root verified their consequential findings against source records and refreshed live state.
- Read-only GitHub checks: current private repository, issue board, team-log comments, merged PRs, workflow runs and workflow state.
- Rechecked primary sources: [Mo's skills repository](https://github.com/23jmo/jmo-skills), [Paradev/Superset](https://github.com/ParadevAI/Paradev), Claude documentation through Context7, [official event page](https://www.csus.edu/center/carlsen/center-spotlights/capital-hacks.html), and [Luma](https://luma.com/lbe0msby).
- Nathan's laptop was not accessible in this session. Its setup, effective skills, hooks and live demo performance remain unverified.

## Advice versus observed behavior

| Advice | Assessment | Evidence and implication |
|---|---|---|
| Work backward from a memorable, feasible demo | Partial, improving | Current "What wins" criteria match this. Earlier Silent Voice drift weakened the intended transformation; later ideas required scores or explanations before their benefit was apparent. The new interview is explicitly using Silent Voice's immediate payoff as the reference. |
| Clarify the vision and save a spec | In progress | A real `Skill: interview` invocation occurred at 15:03:56 PT in session `e51699a9-2f23-4a1a-858b-acd59f59445f`. Its questions address the desired transformation, prior appeal, team agreement and reachable users. No `.plans/*.md` spec existed at the final check. Finish this interview; do not start another competing one. |
| Give agents independent tasks with clear ownership | Partial | Actual Claude/Codex research, implementation and independent reviews occurred. Current repo has one local worktree; team lanes are not agreed and the second laptop is not set up/tested. Worktrees alone do not prevent shared-interface conflicts. |
| Use concrete UI references and targeted feedback | Appropriate rule; execution pending | Current instructions require a reference and defer UI polish until interaction works. No replacement product or UI exists, so not using animation yet is appropriate. |
| Add only tools the task needs | Mostly followed | Five relevant skills are installed with pinned provenance. Agentation and database/payment MCPs are deferred. The remaining bottleneck is applying the workflow to a chosen demo, rather than another installation. |
| Show a real working live demo | Unmet for the retired free-form direction; pending for replacement | The old final free-form page had not been observed in a browser with a real model or audible output; cloned speech was not integrated. Unit and fixture checks did not establish that stage moment. Reeve also paused the silent trial to review the idea; absence of human testing is not solely an agent execution failure. |
| Match an actual user's need | Major evidence gap | STATUS and issue #3 record no user contact or validation; USERS.md is absent. This requirement comes from Reeve's report about Capital Hacks judging, not a user-research method taught in Mo's video. |
| Present clearly and rehearse | Pending | No selected replacement project, pitch or repeated live-demo result. Deadline, pitch length, platform and prize stacking remain unresolved. |

## Most consequential historical mistakes

### The intended demo changed without a product decision

Original source: `C:\Users\reeve\.claude\projects\C--Users-reeve\b0097222-0d5a-4e0b-a67c-59426dbe6832.jsonl`, line 920. The assistant explicitly acknowledged that the chosen cloned voice was dropped, the build became six fixed phrases in a generic voice, and a model was favored because its terms were easier to read rather than because it best served the intended demo.

This is a failure to preserve the product specification. Future workers must keep the exact stage transformation and acceptance criteria in the shared spec. An easier implementation that changes that transformation requires Reeve and Nathan's decision.

### Rival research made stronger claims than its method supported

- The same source session, line 978, described speaking aloud in the person's voice as the innovation gap after checking Chaplin and Hushkey. The later near-exact Silent Voice rival overturned that conclusion.
- Session `6f93746c-bad1-4c47-8ff6-2afc18054c23.jsonl`, line 609, retracts five of ten initial demo assessments after Codex found closer rivals.
- `research/wild-demos-rivals-claude-2026-11-06.md` records a quoted-search bug and exposure to the other reviewer's report. Those findings improve transparency but limit the independence of the combined result.

Correction: independently search and read the closest actual projects before presenting novelty as a reason to build. Then compare the user, mechanism and live payoff. A large scraped corpus or a "Winner" flag is not comprehensive novelty verification. Existing research alone is not a reason to discard a strong differentiated demo: Reeve explicitly allowed prior ideas/research and later objected to filtering by absolute originality and no hardware.

### Engineering checks advanced faster than central-demo proof

The archived final state records 168 passing tests on both Python versions, yet the newest free-form browser/model/audio path remained unobserved and the own-voice integration was incomplete. Those tests are useful evidence about the checked components. They do not prove silent recognition, a familiar voice, patient benefit or stage reliability.

After selection, the next major proof should exercise the hardest mechanism through the intended interaction on the actual demo hardware. Add checks where they protect that path; avoid letting peripheral completeness displace it.

## Step 5: what to use and when

| Tool | Recommendation |
|---|---|
| `interview` | Use now to finish the idea criteria; after selection, save a concise implementation/demo spec. Do not repeatedly ask settled questions or turn the interview into another long research phase. |
| Codex review | Continue using focused independent review for rival claims, risky implementation and final evidence. The installed `/codex` wrapper is manual-only (`disable-model-invocation: true`); it is not automatically invoked because a prompt says "use skills." Direct Codex tasks already provide real cross-model work. |
| `ste` | Use for clear explanations, instructions and pitch writing throughout. It does not have to wait until Sunday. |
| `better-ui` | Apply after a working interaction, using a concrete reference and specific feedback. |
| `animate` | Apply only where motion makes progress, state changes or the demo clearer. |
| Agentation | Reconsider after selecting a compatible UI if repeated visual feedback is consuming time. Not needed before there is an interface. |
| Supabase / Neon / Stripe MCPs | Add only if the chosen build actually requires the corresponding database or payment service. No current need is established. Mo's own README makes these optional. |
| Superset / Paradev | Its current official README says Windows is not available. Claude worktrees plus VS Code provide the relevant separation/review mechanism on these laptops. No reason to migrate tools during this decision. |

The five skills are installed, not all continuously running. An exact tool invocation is not required for every useful behavior: independent reviews happened before the wrapper existed. Conversely, availability alone does not establish application.

## Verified current setup and checks

- Actual Git Bash `C:/Program Files/Git/bin/bash.exe`: `bash tools/check.sh` exited **0**, with `test_team_feed: ok`, `test_check: ok`, `check: ok`. Shell syntax checks passed for seven shell files.
- These are infrastructure checks. `tools/check.sh` explicitly defers product tests until a stack is selected.
- During this audit, PR #5 (team guide) and PR #6 (team rules) merged at 15:03:21 and 15:04:04 PT. Current checked main: `1e90044`; working tree was clean before this report was written. Thus earlier untracked-guide observations are retired.
- Setup session `40ecdaeb-4406-4e33-918f-ec18420994ee` and STATUS report a two-clone test on Reeve's machine. This is not a test on Nathan's laptop. The new repository's Nathan invite remains pending in current project state.
- Issues #2, #3 and #4 are open and unassigned: project selection, target-user work and event details. Team-log issue #1 contains real setup/direction updates.
- Live GitHub API: `checks` workflow is **disabled_manually**. The two listed new-repo runs ended **startup_failure**; run 42308918872 has **zero jobs**. No observed green CI. Current notes identify a $0 Actions budget as a likely cause after a signed-in account check; this audit did not independently establish that cause.
- `tools/ship.sh` merges after local checks without waiting for remote CI. That behavior is consistent with the newly documented local-gate setup; successful shipping is not proof of green CI or a successful product demo.

## Recommended next sequence

1. Finish the interview already running with Reeve and Nathan. Capture who benefits, the visible before/after, acceptable hardware/time/cost and the one hardest technical uncertainty. Save the agreed criteria; product selection remains theirs.
2. Present a small set of options against those criteria, each with the closest actual rival and a concrete feasibility experiment. Do not launch another broad search based on new filters nobody agreed to.
3. Once selected, prove the riskiest mechanism and complete live interaction before expanding the product. Record actual attempts, outcomes and end-to-end latency. Keep staged/rehearsed results separate from unseen or new-user results.
4. Assign one owner per shared interface and independent supporting tasks. Exercise one real task/ship/update cycle on each laptop as part of useful work; the setup is not fully deployed until that evidence exists.
5. Prioritize actual user input and verified event requirements alongside the build. Public pages confirm the four judging criteria and Sunday pitching, but do not settle exact submission time, pitch length, submission platform or stacking. Do not invent validation, send outreach or submit anything as part of this audit.
6. Polish the demonstrated interaction and rehearse the pitch from observed results. Mo's sleep-loss and judge-monopolizing tactics are personal choices, not requirements to copy.

No product was chosen, application code changed, settings modified, retired chain restarted, or outward message sent by this audit. Local report/status documentation only.
