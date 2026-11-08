# Capital Hacks 5.0 status

Current state only, kept by the lead session; replace stale lines, do not append a log. History: `research/status-history-2026-11-06-07.md` (Nov 6-7 chronology, verbatim) and `C:\Users\reeve\dev\_old-silent-voice\STATUS.md` (Silent Voice). Decisions and open human items: `DECISIONS.md`. Labels: **Told** = from Reeve or Nathan, **Measured**, **Built**, **Reasoned**.

## Snapshot (Sat Nov 7, 17:50 PT)

### Direction and scope (Told)
- **FeelInk**: interactive spatial education for blind students. A sighted tutor draws on the laptop stage (`/stage`), the student feels the drawing as vibration on an ordinary Android phone (`/feel`) and hears landmark names and the tutor's spoken instructions. General-purpose spatial teaching tool (routes, diagrams, graphs, circuits), first demonstrated through route learning. Not a navigation app: no location, no obstacles, never "safe for real navigation". Direction: `.plans/feelink-direction-update-2026-11-07.md`; UI brief: team log 16:16 (D7); tutor-interaction brief: team log 17:10 (#107).
- **Principle (Reeve, 16:16):** the tutor controls the lesson and its content, the student controls their own exploration. Freehand drawing stays the core; capabilities are reusable primitives (landmarks, spoken labels, instructions, start point, step-through reveal), not separate apps.
- **Ownership (Reeve, 16:23):** the lead session on Reeve's laptop owns all product work (phone, stage, relay, UI) and runs the implementation agents. Nathan's lane: outreach, validation and, since 17:45, presentation planning in parallel (deck narrative, organizer questions, fact-sheet corrections, media slots). Deck and presentation items are back on `DECISIONS.md`.
- **Pitch:** 4-minute slide pitch Sunday, no live demo, GIFs and images allowed (organizers, Sat). Planning on an 11 AM Sunday slide deadline (last edition's); deadline, format, template and prize stacking unconfirmed (`research/pitch-format-2026-11-07.md`). Plan for the recorded takes: `.plans/feelink-demo-plan-2026-11-07.md`.

### Latest build and real-device test
- **main `c64269c`** (17:43): #107 merged. Tutor instruction box (phone speaks it, stage shows "Sent, not heard yet" until the phone's `spoken` confirms "Heard"), larger finger cursor with a subtle trail, folded "Student heard" log (latest large, "Earlier (n)", same line within 10 s merged), link states Connected / Reconnecting (5 s) / Disconnected (15 s) with "Not receiving drawings", start point (S or checkbox; phone says "Start: <name>"; replay says the start first). Landmark names are not re-spoken within 3 s of leaving. Built and emulated (17/17 checks, 35 board + 29 tactile tests, relay selftest, `check.sh`); **not yet tested on the real Pixel.**
- **Latest real-Pixel pass (Measured by feel, Reeve, 17:10, build `7a61076` / #90):** landmark arrival is clear and spoken (hum stops, 400 ms silence with the name, three 220 ms pulses, then a 70 ms heartbeat every 1.2 s while resting); Android Back exits Live; two-finger double tap repeats the last line. Earlier passes on the Pixel: A0 (landmarks on main `41f4576`, 15:33), stage view v1 (#44, 13:52-14:13: 151/151 stroke updates reached the phone, relay-to-phone median 4-5 ms, 10/10 corner cues).
- **Services (main checkout, logs in `.tmp/`):** relay `python -I -u feelink/server.py` restarted 17:44 on `c64269c` under nohup; test route (Classroom start, two turns, Library) reposted 17:44; keep-alive `python -I -u tools/pixel_keepalive.py --serial 38300DLJH0058Y` running since 16:07 (restores `adb reverse tcp:8765` and the DevTools forward after each USB drop). Reload the phone with `node tools/pixel_tab.mjs "<expr>" reload` (Live needs a real tap afterwards); the laptop `/stage` tab is reloaded by hand (F5). Always reload phone AND laptop pages to current main before any test (Reeve, 15:00). Restart the relay after any `server.py` change.
- **Pixel:** on USB since 17:03 (USB drops today healed in seconds by the keep-alive). The `/feel` tab was reloaded at 17:44 onto `c64269c`; the lead's build probe is being re-run.

### Settings and known technical limits
- **Haptics (Built, tuned by feel):** core width 1-5 mm, default 4 mm, under the phone's collapsed Advanced settings (not a student-facing setting); fade = 1.5 x core (core 4 gives 6 mm each side), no separate fade control. Fade pulses 12/60, 20/35, 30/15 ms on/off. The line is one 5 s hold re-armed at 4.5 s. Corner and end cues on stage-smoothed corners. Media vibration on the Pixel must stay at 3 (at 1 long buzzes play at half strength).
- **Chrome on the Pixel 8 ignores `navigator.vibrate(0)` (Measured, dumpsys): `vibrate(1)` is the stop. Every buzz asked over 1000 ms is capped by Chrome.**
- **Connection is USB only:** the phone reaches the relay through `adb reverse tcp:8765 tcp:8765` on Reeve's laptop. Venue Wi-Fi (SacState-Event) and the Pixel hotspot both failed, cause not found. **Ordinary classroom deployment (phone and laptop on a shared network) is not demonstrated.**
- **Speech:** browser `speechSynthesis` on Android Chrome; needs a prior user gesture (the Connect tap). Landmark names and the welcome line are heard on the Pixel (Reeve, 17:10). Instruction speech, the cut-and-resay rule and end-of-speech reliability for long lines are emulated only.
- **TalkBack: deliberately deferred (Reeve, 17:02), unverified.** Reasoned from AOSP sources that one-finger exploring never reaches the page with TalkBack on; never measured. #91 parked; notes `research/talkback-2026-11-07.md`, probe `tools/talkback_probe.mjs`. Do not present FeelInk as TalkBack-compatible.
- **One phone, one laptop.** The Pixel is Nathan's phone. Events: `{type:'haptic'|'spoken'|'phoneconfig'|'instruction'|'landmark'|'stroke'|'reveal'|...}` through the relay; `results.jsonl` is git-ignored.

### Active issues, owners, dependencies
- **#111 step-through reveal (lead; P2):** two Opus agents since 17:44, phone half and stage+relay half, frozen protocol on the issue. Lands only after a Pixel re-check of drawing, landmarks, speech, connection and vibration; never a last-minute change to the recording build.
- **#44 stage view for recording, #45 recording pipeline (capture, side-by-side compose, GIF/MP4), #47 rehearsal and Q&A:** Nathan. Runbook `tools/record/README.md`, compose `tools/record/compose.py`. The recording session (A2) needs Reeve's laptop (the only one with adb) and a demo-tagged build.
- **#3 reach target users, log in `USERS.md`:** unassigned. Nathan sent 38 outreach emails (`.plans/outreach-2026-11-07.md`, PR #112); replies: none recorded.
- **Closed or parked:** #107 merged; #90 #92 #64 #66 #71 #33 #34 shipped; #91 TalkBack parked; #13-#23 hardware closed; #65 superseded by #92.

### Immediate priorities (critical path, in order)
1. **#107 on the real Pixel (Reeve, about 3 minutes):** send an instruction from the stage and hear it; two-finger double tap replays it with "Start: Classroom" first; trace the route, landmarks still arrive clearly; stage shows Sent then Heard, finger cursor and trail visible; Android Back shows Disconnected on the stage. Fix anything broken before anything else.
2. **Tag the known-good demo build** (`git tag demo-N && git push origin demo-N`) once drawing, landmarks, speech, connection and vibration all pass on the Pixel. The recording runs on that tag.
3. **Recording** (A2, Nathan and Reeve, Reeve's laptop): freehand hero take and the route take with landmarks and an instruction; consent for everyone in frame (D5) first.
4. **In parallel, Nathan's lane:** organizer questions (A1), fact-sheet corrections (A4, Codex's 28 findings), deck narrative and media slots (D2, D3).
5. **Then** #111 lands after a Pixel re-check, if it fits safely; otherwise it is documented as the next feature.

### Outstanding human decisions and actions
See `DECISIONS.md`: D5 consent for footage; A1 organizer answers; A2 recording session; A4 fact-sheet corrections; D2 deck shape and D3 deck tool (Nathan's lane with Reeve); the visual status of blind-run tester RM (not recorded; confirm with Reeve).

### Evidence and validation (keep the four kinds apart)
1. **Verified device and engineering behaviour (Measured):** stroke delivery and latency, corner cues, `vibrate(0)` finding, USB drop recovery, landmark arrival and speech heard by Reeve on the Pixel, #107 emulated run. Reproduce run numbers with `python -I tools/metrics.py --label "<run>" --results feelink/results.jsonl`.
2. **Blindfolded or prototype usability testing (Measured):** blind run 1, Sat 14:49-14:54, tester RM, 5 trials, 4 of 5 shapes named correctly, median 49.9 s, no aborts, **on the older build (core 14 mm, fade 6)**. Tester's visual status not recorded; confirm with Reeve. Eyes-closed shape naming by one person on an old width setting: it does not validate the current 4 mm build, route learning, or any educational effect. The 10-trial warm-up (1 of 10, pre-fix build) is not a result.
3. **Feedback from actual target users:** none. `USERS.md` is empty; 38 outreach emails sent by Nathan, no reply recorded. Present no user validation unless logged there with consent.
4. **Evidence that FeelInk improves educational understanding:** none. Say "testable hypothesis", never "shown".
- **Claims we must not make** (direction update): that blind students cannot understand basic shapes; validated by blind students; improves learning outcomes; reliably teaches navigation; replaces tactile equipment; phone vibration conveys diagrams as well as raised-line graphics. Fact sheet: `research/feelink-fact-sheet-2026-11-07.md`, pending corrections in `research/feelink-fact-sheet-review-codex-2026-11-07.md`.

## Pending (non-product)
- CI works (run `42312250483` passed Nov 6 once the Actions budget was set). Say CI is green only after seeing it pass.
- Both laptops and the one Claude account are Reeve's; Nathan borrows one (Windows). Reeve's Claude plan: Max 20x (Reeve, Sat).
- Hardware order cancelled (Reeve's report); physical projects are out. Old ideation: `OPTIONS.md` and `research/*2026-11-06*` carry a superseded banner; the rival check that still applies is `research/feelink-rivals-claude-2026-11-06.md` (closest product the $15,500 Monarch-class tactile display).
