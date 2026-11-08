# Decision board: what Reeve and Nathan need to decide or do

Kept by the lead (engineering manager) session. A separate "decision desk" chat reads this file, explains each item to Reeve in plain English, and records his answers by posting `DECISION: <item id> ...` to the team log (`gh issue comment 1`). The lead folds answers into this file and acts on them. Only the lead edits this file. Times are from `date`, Pacific.

Labels: **Decide** = Level 3, the humans' call. **Do** = an action only a human can take. **FYI** = no action, just know it.

## Open, in order of urgency (Sat Nov 7, 17:50). Product critical path first; presentation items run in parallel on Nathan's lane (Reeve reopened them at about 17:45).

### A5. Reeve, Do (3 minutes with the phone): test #107 on the Pixel
The relay runs main `c64269c` and the test route is posted (Classroom is the start point). On the stage: type an instruction such as "Follow the line from the classroom to the library" and press Enter; on the phone: tap Connect, hear the instruction, two-finger double tap to hear "Start: Classroom" then the instruction again, trace the route and check the landmarks still arrive clearly, press Android Back. On the stage: the entry flips from "Sent, not heard yet" to "Heard", the finger cursor and trail are obvious, and after Back the status reads disconnected. Report what failed, if anything. Passing this is what tags the recording build.

### D5. Decide: who appears in footage (consent)
Anyone in frame gives their own yes, hands included. The Pixel is Nathan's phone, so his hand on it needs his yes. Reeve's consent covers only Reeve. Needed: who is in frame for the shape run and for the route take, and each person's yes, logged in `USERS.md` if a name or face is used.

### A2. Do: confirm the recording session with Nathan
On Reeve's laptop (the only one with adb), on the `demo-N` tag made after A5 passes. Reeve's iPhone shoots the overhead at 1080p60 with Settings > Camera > Formats > Most Compatible and HDR Video off; propped, nothing built. Each take starts with one student tap on the Pixel for sync. Runbook: `tools/record/README.md`. No build changes between the tag and the takes.

### A1. Nathan, Do (outward): ask the organizers
The nine questions in `research/pitch-format-2026-11-07.md`, "Ask the organizers". The ones that change our work most: slide deadline, file format, whose laptop we present from, whether an MP4 with sound is allowed, whether a public repo is required. Tell the lead the answers.

### A4. Nathan, Do: fact-sheet corrections
Codex's 28 findings in `research/feelink-fact-sheet-review-codex-2026-11-07.md`, plus the "claims we must not make" list in the direction update and the four validation categories in STATUS.md, before any number goes on a slide. The metrics tool (`python -I tools/metrics.py --label "<run>" --results feelink/results.jsonl`) prints labeled numbers with n. Also needed from Reeve: the visual status of blind-run tester RM (not recorded anywhere).

### D2. Decide (Nathan's lane, with Reeve): deck shape
Story order Reeve set at 17:45: the genuine educational access problem; what FeelInk physically is and how tutor and student use it; a real demonstration; what the team actually built and measured; honest limitations and real-world potential. Strongest example: guided spatial learning through routes; the product stays a general-purpose interactive spatial teaching tool. No claim of educational effectiveness or target-user validation without evidence.
Option A: that order straight through, one slide each, GIF 1 freehand hero take and GIF 2 route with landmarks inside the demonstration slide.
Option B: cold open with the route GIF alone for about 10 s, then the same order.
Lead's lean: B, since every rubric line still follows in order. Eight slides at about 30 s each fits 4 minutes.

### D3. Decide (Nathan's lane): deck tool
Option 1: Google Slides as the working copy (both edit live, GIFs animate when presenting), exported to PPTX and PDF at the end as fallbacks. Option 2: a PPTX built directly (offline-safe, harder to co-edit). Lead's lean: Option 1. Fact needed from Reeve: is PowerPoint installed on his laptop? The organizers' answers (A1) decide the final export.

### FYI
- The Pixel stays on the USB cable. While an agent check runs, nobody touches it. Media vibration must stay at 3 (at 1 long buzzes play at half strength).
- The relay (restarted 17:44 on `c64269c`) and keep-alive run under nohup from the main checkout (logs in `.tmp/`); the lead watches port 8765 every 60 s and restarts the relay after any `server.py` change.
- #111 (step-through reveal) is P2: two agents are building it, and it lands only after a Pixel re-check, never as a last-minute change to the recording build.
- TalkBack is deferred and unverified; the connection is USB/adb only and classroom deployment over a network is not demonstrated. Both go on the limitations slide, not in the claims.
- Both leads' time stamps ran fast earlier today; the lead now runs `date` before writing a time.

## Decided (newest first)
- Sat 17:45, Reeve: documentation and priority cleanup (STATUS.md as a snapshot, history archived, CLAUDE.md current-product section and concise reporting rule, validation kept in four categories, TalkBack and USB limits stated). Presentation planning reopened for Nathan's lane in parallel with the product lead's implementation and recording; D2, D3, A1, A2 back on the open list. #107 and reliable real-phone behaviour first; recording, consent, organizer requirements and fact-sheet corrections are immediate; #111 must not delay the recording; a known-good demo build is tagged once it passes on the Pixel.
- Sat 17:32, Reeve: D9 yes to the step-through reveal, not named steps; P2 after #107, reliable phone behaviour and the recorded end-to-end demonstration; details on #111 (hidden parts faint for the tutor and silent on the phone, stroke-order steps, Reveal Next/All and Previous if easy, landmarks follow their geometry, one 'Drawing updated' cue, Undo keeps a sensible state, Clear resets, no step authoring).
- Sat 17:14, Reeve: next cycle = guided learning (landmarks, start/end points, live student feedback, sequential diagram presentation) on the existing drawing interface.
- Sat 17:10, Reeve: A0c passed (landmark arrival clear and spoken; Back and two-finger double tap work). Tutor-interaction brief: spoken instructions to the phone, live finger visibility, collapsed heard-log distinguishing sent from heard, clear link states, a start point; keep layout and ownership; filed and shipped as #107.
- Sat 17:02, Reeve: TalkBack dropped (no mode, no Pixel session; #91 closed as parked, research stays on main). Other D7 items stand.
- Sat 16:46: phone product build (#90), undoable Clear, TalkBack research (#91) and the stage product pass (#92) are on main; phone and laptop pages reloaded.
- Sat 16:23, Reeve: the lead on Reeve's laptop owns all product work (phone, stage, relay, UI) unless Nathan's lead posts otherwise; Nathan's lane is outreach and validation. A0b: cue stands out but must be unmistakable on-path (now a landmark state, see A0c).
- Sat 16:21, Reeve: the lead's agents do ALL UI, stage included (#92 running); Nathan's lane otherwise unchanged. #13-#23 closed. Default core 4 mm; fade derives from core (lead's ratio 1.5), not a student setting.
- Sat 16:16, Reeve: D7 UI plan GO with changes: tutor controls the lesson, student controls exploration; phone home = Connect + status + collapsed advanced settings, testing tools moved out of the student home, spoken confirmations, Back as the accessible exit, TalkBack verification before polish; stage keeps canvas central with obvious controls, Shift straight lines, generic labels, undoable Clear, confirmed spoken log. Full text on the team log 16:16.
- Sat 15:43-15:47, Reeve: product priority is a UI and usability pass on /feel and /stage (end-to-end flow, not just visuals); plan first, then edits.
- Sat 15:33, Reeve: A0 passed on main 41f4576; landmark cue must stand out more (fixed as a leading silence plus two long buzzes, re-feel pending).
- Sat 15:12, Reeve: product first; no deck or presentation planning until he reopens it (reopened 17:45 for Nathan's lane).
- Sat 15:00, Reeve: D1 blind run accepted as done (4 of 5, median 49.9 s, old 14 mm build). Line width: strong core 1-5 mm, never 14; fade proportionate (shipped as slider 1-5 default 4, fade 0-8, PR on main 41f4576; fade later derived from core).
- Sat 15:00, Reeve: always reload phone AND laptop pages to current main before any test.
- Sat 14:20, Reeve: direction update, lead with education, demonstrate with routes (`.plans/feelink-direction-update-2026-11-07.md`).
