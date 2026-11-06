# Capital Hacks 5.0 status

Current state only. Full Silent Voice history: `C:\Users\reeve\dev\_old-silent-voice\STATUS.md`.

## Now (Nov 6, 14:10 PT)
- **No project chosen; Reeve and Nathan's call.** Silent Voice stopped 13:15 after `thaimtl/Silent-Voice` (Cal Hacks 13.0, 2nd overall) turned up. Nothing is being built.
- **Cleanup done with Reeve's go.** Old material moved, not deleted, to `_old-silent-voice` (about 23 GB); its repo is clean and fully pushed at `f5a2d1a`. The chain and its `STOP` flag moved with it, and no process or scheduled task runs it.
- **Skills installed** in `.claude/skills/`: interview, ste, codex, better-ui, animate. Agentation waits for the UI choice.
- **10 wild demos delivered 14:35, not chosen:** `research/wild-demos-2026-11-06.md`. Reeve and Nathan pick through `/interview`. Codex's check finished 14:45 and killed 5 of the 10; the demo file's top section has the correction, sources not yet spot-checked. The Claude check was still running and writes `research/wild-demos-rivals-claude-2026-11-06.md`. Corpus and scripts: `research/devpost/` (keep the JSONL out of git).

- **14:50: Reeve rejected the whole wild-demo list ("none of these are exciting").** New round: Health + Accessibility only, must blow judges away, no physical building. Options presented about 14:55, awaiting their pick: `research/health-round-2026-11-06.md` (Still Here, Tongue X-Ray, Last Muscle; advisor lean Still Here, not a decision). This supersedes the wild-demos lean.
- **Reeve rejected all three health options:** Still Here and Tongue X-Ray are too complicated to show instant impact; Last Muscle looks infeasible and not fully demoable. The bar is now CLAUDE.md "What wins": what Silent Voice had, with hardware open. **Next: run `/interview` with Reeve and Nathan on what they want, then generate ideas with Codex checking rivals before they are shown.** No lean stands.

## Pending
- **User contact, today only if possible:** Sac State AT Lab, AIRC 2011, M-F 8-5, 916-278-3409 (not reconfirmed). Maryjane Rees Audiology Clinic, Folsom Hall Suite 1000, weekdays 8-5 per a 2022 story (confirm first). Nobody has been contacted; no target user has confirmed anything.
- CI failed at startup on all 13 `silent-voice` runs and on the new repo's two-line workflow. Suspected cause, not proven: GitHub budgets page shows Actions at $0.00 / $0.00, "Usage blocked", while the public repo passes. Reeve wants CI on, but GitHub requires a payment method to edit or delete that budget (delete attempt returned 400, Nov 6). The workflow stays disabled until Reeve adds a card; then cap Actions at $1, enable it and test a run. Local checks are the gate.
- Unconfirmed: deadline, pitch length, platform, prize stacking, Reeve's Claude plan upgrade (the CLI reports `pro`).
- Team setup per Reeve, Nov 6: both laptops and the one Claude account are his, and Nathan borrows one. Nathan is newer to coding and the laptop runs Windows. Lanes not agreed yet. Repo `reeve25/capital-hacks-5` is live and passed a two-clone test on Reeve's laptop. The `nathanjeevs` invite is pending, and the second laptop is not set up or tested.

## Idea material
- `research/wild-demos-2026-11-06.md`: the 10 demos with rival flags.
- `research/ideas-pivot-2026-11-06.md`: earlier agent's five ideas (Caught, Lapsit, Mother Tongue, Faceline, Lowband), unverified, and what it dropped.
- `research/cal-hacks-13-rivals-2026-11-06.md`, `research/rivals-pivot-2026-11-06.md`, `OPTIONS.md`: earlier rivals and options.
- `research/johnathan-mo-hackathon-workflow-2026-11-06.md`: video findings and tool checks.
- `research/hackathon-workflow-audit-2026-11-06.md`: 15:10 PT chat/repo/live-GitHub audit; tooling sensible, execution partial. Actual `/interview` started 15:03:56 in session `e51699a9`; spec pending. Guide/rules PRs merged, local workflow checks pass; second laptop/user validation/live replacement demo remain unverified. CI API confirms disabled workflow and startup failures, not green CI. Finish the interview already running; no new product chosen by the audit.

## Already rejected or parked
Rejected by Reeve: CheckIn evacuation voice agent (uninspiring), talking hard hat, eyebrow-to-speech (not impressive enough). Parked on hardware limits: robot arm, haptic wristband (he loves the idea). Lip-reading space looks crowded after Cal Hacks 13.
