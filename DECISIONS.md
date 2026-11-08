# Decision board: what Reeve and Nathan need to decide or do

Kept by the lead (engineering manager) session. A separate "decision desk" chat reads this file, explains each item to Reeve in plain English, and records his answers by posting `DECISION: <item id> ...` to the team log (`gh issue comment 1`). The lead folds answers into this file and acts on them. Only the lead edits this file. Times are from `date`, Pacific.

Labels: **Decide** = Level 3, the humans' call. **Do** = an action only a human can take. **FYI** = no action, just know it.

## Open, in order of urgency (Sat Nov 7, 17:22). Product first: deck and presentation items are parked below until Reeve reopens them (his 15:12 decision).

### D9. Decide: how "sequential diagram presentation" works (Reeve's 17:14 phrase)
The lead's proposal, not yet built: **step-through reveal.** Strokes and landmarks already reach the relay in the order the tutor drew them, so the tutor draws the whole diagram first, then presses "Reveal next" (N) or "Reveal all"; the phone renders and buzzes only the parts revealed so far and says "New part of the drawing." on each step; the stage draws hidden parts faint so the tutor still sees the whole plan. Default is everything revealed, so today's behaviour is unchanged. Undo and Clear reset it. Fits items 1-5 of #107 (an instruction can accompany each step) and is general: a circuit, a flowchart or a route all reveal one part at a time.
Alternative B: the tutor groups strokes into named steps (a "Step 2: ..." label box) and the phone announces the step name on reveal. More typing for the tutor mid-lesson; the lead's lean is the plain reveal first and names later if wanted.
Needed: yes to the step-through reveal (then it is filed as the next issue after #107 lands), or a different reading of "sequential presentation".

### D5. Decide: who appears in footage (consent)
Anyone in frame gives their own yes, hands included. The Pixel is Nathan's phone, so his hand on it needs his yes. Reeve's consent covers only Reeve. Needed: who is in frame for the shape run and for the route take, and each person's yes, logged in `USERS.md` if a name or face is used.

### A1. Do (outward): ask the organizers
The nine questions in `research/pitch-format-2026-11-07.md`, "Ask the organizers". The ones that change our work most: slide deadline, file format, whose laptop we present from, whether an MP4 with sound is allowed, whether a public repo is required. Tell the lead the answers.

### A2. Do: confirm the recording session with Nathan
Planned 17:00-20:00 on Reeve's laptop (the only one with adb). Reeve's iPhone shoots the overhead at 1080p60 with Settings > Camera > Formats > Most Compatible and HDR Video off; propped, nothing built. Each take starts with one student tap on the Pixel for sync. Runbook: `tools/record/README.md`.

### A4. Nathan, Do: fact-sheet corrections
Codex's 28 findings in `research/feelink-fact-sheet-review-codex-2026-11-07.md`, plus the "claims we must not make" list in the direction update, before any number goes on a slide. The metrics tool (`python -I tools/metrics.py --label "<run>" --results feelink/results.jsonl`) prints labeled numbers with n.

### FYI
- The Pixel stays on the USB cable. While an agent check runs, nobody touches it. Media vibration must stay at 3 (at 1 long buzzes play at half strength).
- The relay (started 16:40:09, current server.py) and keep-alive still run under nohup from the first Fable window (logs in `.tmp/`). The new lead watches port 8765 every 60 s and restarts both from main if they die or when #107 changes server.py.
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
- Sat 17:14, Reeve: next cycle = guided learning (landmarks, start/end points, live student feedback, sequential diagram presentation) on the existing drawing interface. Step-through reveal proposed on #107 as item 6 (reveal pointer on the relay).
- Sat 17:10, Reeve: A0c passed (landmark arrival clear and spoken; Back and two-finger double tap work). Tutor-interaction brief: spoken instructions to the phone, live finger visibility, collapsed heard-log distinguishing sent from heard, clear link states, a start point; keep layout and ownership; filed as the 'Tutor guides the student' issue for the next lead to launch.
- Sat 17:02, Reeve: TalkBack dropped (no mode, no Pixel session; #91 closed as parked, research stays on main). Other D7 items stand.
- Sat 16:46: phone product build (#90), undoable Clear, TalkBack research (#91) and the stage product pass (#92) are on main; phone and laptop pages reloaded. Deck still parked.
- Sat 16:23, Reeve: the lead on Reeve's laptop owns all product work (phone, stage, relay, UI) unless Nathan's lead posts otherwise; Nathan's lane is outreach and validation. A0b: cue stands out but must be unmistakable on-path (now a landmark state, see A0c).
- Sat 16:21, Reeve: the lead's agents do ALL UI, stage included (#92 running); Nathan's lane otherwise unchanged. #13-#23 closed. Default core 4 mm; fade derives from core (lead's ratio 1.5), not a student setting.
- Sat 16:16, Reeve: D7 UI plan GO with changes: tutor controls the lesson, student controls exploration; phone home = Connect + status + collapsed advanced settings, testing tools moved out of the student home, spoken confirmations, Back as the accessible exit, TalkBack verification before polish; stage keeps canvas central with obvious controls, Shift straight lines, generic labels, undoable Clear, confirmed spoken log. Full text on the team log 16:16.
- Sat 15:43-15:47, Reeve: product priority is a UI and usability pass on /feel and /stage (end-to-end flow, not just visuals); plan first, then edits.
- Sat 15:33, Reeve: A0 passed on main 41f4576; landmark cue must stand out more (fixed as a leading silence plus two long buzzes, re-feel pending).
- Sat 15:12, Reeve: product first; no deck or presentation planning until he reopens it.
- Sat 15:00, Reeve: D1 blind run accepted as done (4 of 5, median 49.9 s, see D1). Line width: strong core 1-5 mm, never 14; fade proportionate (shipped as slider 1-5 default 4, fade 0-8, PR on main 41f4576).
- Sat 15:00, Reeve: always reload phone AND laptop pages to current main before any test.
- Sat 14:20, Reeve: direction update, lead with education, demonstrate with routes (`.plans/feelink-direction-update-2026-11-07.md`).
