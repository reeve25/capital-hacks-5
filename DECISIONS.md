# Decision board: what Reeve and Nathan need to decide or do

Kept by the lead (engineering manager) session. A separate "decision desk" chat reads this file, explains each item to Reeve in plain English, and records his answers by posting `DECISION: <item id> ...` to the team log (`gh issue comment 1`). The lead folds answers into this file and acts on them. Only the lead edits this file. Times are from `date`, Pacific.

Labels: **Decide** = Level 3, the humans' call. **Do** = an action only a human can take. **FYI** = no action, just know it.

## Open, in order of urgency (Sat Nov 7, 14:50)

### A0. Reeve, Do first (5 minutes with the phone): tell the lead when the Pixel is free
The #34 check found that Chrome's long-press click cut the line buzz after about 0.3 s of a resting finger (11 of 11). The fix is on main (4731746) but the phone tab still runs old code. When the phone is free the lead restarts the relay (so it stores landmarks), reloads `/feel` and taps Live; then Reeve feels, in this order: a still finger on a line keeps buzzing for the whole hold; 2-finger draw and 3-finger home still work; the landmark cue is distinct from the corner cue; the phone speaks the landmark name, and how long after the buzz. Report in plain words. The blind run (D1) happens only after this passes. Someone used the phone at 14:42, so the agent stopped touching it.


### D1. Decide: blind 5-shape run, pass bar and roles (#33)
Blocked on A0 (the long-press fix must be on the phone first).
Why it matters: it is the only measured validation for the "Validation & Performance Metrics" rubric line, and it needs the phone, which is the bottleneck. The 11:41 warm-up (1 of 8 right) ran on the buggy build and does not count.
Proposal (lead, posted on #33): phone test mode, 5 shuffled shapes, eyes closed, initials typed in the "who" field, 90 s cap then "don't know" counts as wrong. Pass bar: 3 of 5 correct with median time under 45 s counts as "works" for the deck; anything else is reported in full, never hidden. Roles: the tester must not have watched the queue, so one person tests and the other runs the laptop.
Needed: yes to the bar or your own numbers; who tests, who draws; when (the phone is free once the #34 check reports; the lead posts the time).
Then, if the landmark build is on the phone: one route task (3 segments, 2 named landmarks, tester names the landmarks in order and counts the turns), descriptive only, no pass bar.

### D2. Decide: deck shape
Option A: rubric order. Problem and user; the product (what it physically is, how the student uses it step by step); GIF 1 freehand hero take; GIF 2 route with landmarks; technical innovation and AI-build disclosure; validation numbers; impact and roadmap; honest limitations.
Option B: cold open. The route GIF alone on slide 1 for about 10 s with no words, then the same rubric order.
Lead's lean: B, because the stated bar is "one second, no explaining" and every rubric line still follows in order. Eight slides at about 30 s each fits 4 minutes.

### D3. Decide: deck tool
Option 1: Google Slides as the working copy (both edit live, GIFs animate when presenting, the lead can drive it through the Google connector), exported to PPTX and PDF at the end as fallbacks.
Option 2: a PPTX built directly (offline-safe, harder to co-edit).
Lead's lean: Option 1. Fact needed from Reeve: is PowerPoint installed on his laptop? The organizers' answers (A1) decide the final export.

### D4. Decide: close the dead hand-leash issues #13 to #23
They belong to the hand-leash plan dropped on Nov 6 ("a physical project is not going to work"). Closing them cleans the open-issue list the team feed shows. Needs Reeve's yes.

### D5. Decide: who appears in footage (consent)
Anyone in frame gives their own yes, hands included. The Pixel is Nathan's phone, so his hand on it needs his yes. Reeve's consent covers only Reeve. Needed: who is in frame for the shape run and for the route take, and each person's yes, logged in `USERS.md` if a name or face is used.

### D6. Nathan, Do: read the direction update and take #65
`.plans/feelink-direction-update-2026-11-07.md` reframes the pitch around spatial information that changes during instruction, demonstrated with a route and named landmarks. #65 is the stage half (L plus click places a landmark, a caption bubble shows what the phone spoke, and `board.js` must treat `haptic` kind `landmark` as a one-off cue, not a held level). The lead does not edit stage files; Nathan's yes or a handover is needed before anyone does.

### A1. Do (outward): ask the organizers
The nine questions in `research/pitch-format-2026-11-07.md`, "Ask the organizers". The ones that change our work most: slide deadline, file format, whose laptop we present from, whether an MP4 with sound is allowed, whether a public repo is required. Tell the lead the answers.

### A2. Do: confirm the recording session with Nathan
Planned 17:00-20:00 on Reeve's laptop (the only one with adb). Reeve's iPhone shoots the overhead at 1080p60 with Settings > Camera > Formats > Most Compatible and HDR Video off; propped, nothing built. Each take starts with one student tap on the Pixel for sync. Runbook: `tools/record/README.md`.

### A3. Reeve, Do (2 minutes with the phone): feel the landmark cue and hear the name
After the lead restarts the relay for the landmark build and reloads `/feel`, touch a landmark on a test route and report: is the long-short cue distinct from the corner cue, does the phone speak the name, how long after the buzz, does speech overlap the motor. Nobody has felt or heard it yet. The lead posts when the phone is ready.

### A4. Nathan, Do: fact-sheet corrections
Codex's 28 findings in `research/feelink-fact-sheet-review-codex-2026-11-07.md`, plus the "claims we must not make" list in the direction update, before any number goes on a slide. The metrics tool (`python -I tools/metrics.py --label "<run>" --results feelink/results.jsonl`) prints labeled numbers with n.

### FYI
- The Pixel stays on the USB cable. While an agent check runs, nobody touches it. Media vibration must stay at 3 (at 1 long buzzes play at half strength).
- The relay, keep-alive and DevTools forward run from the Fable lead's window (logs in `.tmp/`); closing that window stops them.
- Both leads' time stamps have run fast today (the Opus lead by about 30 min, Nathan's lead by about an hour). The lead now runs `date` before writing a time.

## Decided (newest first)
- Sat 14:20, Reeve: direction update, lead with education, demonstrate with routes (`.plans/feelink-direction-update-2026-11-07.md`).
