# Decision board: what Reeve and Nathan need to decide or do

Kept by the lead (engineering manager) session. A separate "decision desk" chat reads this file, explains each item to Reeve in plain English, and records his answers by posting `DECISION: <item id> ...` to the team log (`gh issue comment 1`). The lead folds answers into this file and acts on them. Only the lead edits this file. Times are from `date`, Pacific.

Labels: **Decide** = Level 3, the humans' call. **Do** = an action only a human can take. **FYI** = no action, just know it.

## Open, in order of urgency (Sat Nov 7, 16:35). Product first: deck and presentation items are parked below until Reeve reopens them (his 15:12 decision).

### A1b. Reeve or Nathan, Do (when the lead asks): TalkBack session on the Pixel
Reeve made TalkBack the top accessibility check. The lead's agent first writes the research and a measuring script (off-phone). Then, for about 10 minutes, a human turns TalkBack on in Settings > Accessibility on Nathan's phone, explores a line with one finger and with two fingers while the lead records what the page receives, and turns TalkBack off again. Nathan's phone, so Nathan's yes for the setting change.

### A0c. Reeve, Do (after the next phone build ships): re-feel landmark arrival
Per his 16:23 note the landmark becomes a state: the line hum stops, 400 ms silence while the name is spoken, three long pulses, then only a slow heartbeat while the finger rests on the landmark; the hum returns when the finger leaves. Ships inside the phone product build (#90); the lead posts when the Pixel is reloaded.

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

## Parked until Reeve reopens them (deck and presentation)
### D2. Decide: deck shape
Option A: rubric order. Problem and user; the product (what it physically is, how the student uses it step by step); GIF 1 freehand hero take; GIF 2 route with landmarks; technical innovation and AI-build disclosure; validation numbers; impact and roadmap; honest limitations.
Option B: cold open. The route GIF alone on slide 1 for about 10 s with no words, then the same rubric order.
Lead's lean: B, because the stated bar is "one second, no explaining" and every rubric line still follows in order. Eight slides at about 30 s each fits 4 minutes.

### D3. Decide: deck tool
Option 1: Google Slides as the working copy (both edit live, GIFs animate when presenting, the lead can drive it through the Google connector), exported to PPTX and PDF at the end as fallbacks.
Option 2: a PPTX built directly (offline-safe, harder to co-edit).
Lead's lean: Option 1. Fact needed from Reeve: is PowerPoint installed on his laptop? The organizers' answers (A1) decide the final export.

Also parked: A1 organizer questions timing is theirs; A2 recording session confirmation.

## Decided (newest first)
- Sat 16:23, Reeve: the lead on Reeve's laptop owns all product work (phone, stage, relay, UI) unless Nathan's lead posts otherwise; Nathan's lane is outreach and validation. A0b: cue stands out but must be unmistakable on-path (now a landmark state, see A0c).
- Sat 16:21, Reeve: the lead's agents do ALL UI, stage included (#92 running); Nathan's lane otherwise unchanged. #13-#23 closed. Default core 4 mm; fade derives from core (lead's ratio 1.5), not a student setting.
- Sat 16:16, Reeve: D7 UI plan GO with changes: tutor controls the lesson, student controls exploration; phone home = Connect + status + collapsed advanced settings, testing tools moved out of the student home, spoken confirmations, Back as the accessible exit, TalkBack verification before polish; stage keeps canvas central with obvious controls, Shift straight lines, generic labels, undoable Clear, confirmed spoken log. Full text on the team log 16:16.
- Sat 15:43-15:47, Reeve: product priority is a UI and usability pass on /feel and /stage (end-to-end flow, not just visuals); plan first, then edits.
- Sat 15:33, Reeve: A0 passed on main 41f4576; landmark cue must stand out more (fixed as a leading silence plus two long buzzes, re-feel pending).
- Sat 15:12, Reeve: product first; no deck or presentation planning until he reopens it.
- Sat 15:00, Reeve: D1 blind run accepted as done (4 of 5, median 49.9 s, see D1). Line width: strong core 1-5 mm, never 14; fade proportionate (shipped as slider 1-5 default 4, fade 0-8, PR on main 41f4576).
- Sat 15:00, Reeve: always reload phone AND laptop pages to current main before any test.
- Sat 14:20, Reeve: direction update, lead with education, demonstrate with routes (`.plans/feelink-direction-update-2026-11-07.md`).
