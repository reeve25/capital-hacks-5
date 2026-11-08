# Capital Hacks 5.0 status

Current state only, kept by the lead session; replace stale lines, do not append a log. History: `research/status-history-2026-11-06-07.md` (Nov 6-7 chronology, verbatim) and `C:\Users\reeve\dev\_old-silent-voice\STATUS.md` (Silent Voice). Decisions and open human items: `DECISIONS.md`. Labels: **Told** = from Reeve or Nathan, **Measured**, **Built**, **Reasoned**.

## Snapshot (Sat Nov 7, 18:05 PT)

### Direction and scope (Told)
- **FeelInk**: interactive spatial education for blind students. A sighted tutor draws on the laptop stage (`/stage`), the student feels the drawing as vibration on an ordinary Android phone (`/feel`) and hears landmark names and the tutor's spoken instructions. General-purpose spatial teaching tool (routes, diagrams, graphs, circuits), first demonstrated through route learning. Not a navigation app: no location, no obstacles, never "safe for real navigation". Direction: `.plans/feelink-direction-update-2026-11-07.md`; UI brief: team log 16:16 (D7); tutor-interaction brief: team log 17:10 (#107).
- **Principle (Reeve, 16:16):** the tutor controls the lesson and its content, the student controls their own exploration. Freehand drawing stays the core; capabilities are reusable primitives (landmarks, spoken labels, instructions, start point, step-through reveal), not separate apps.
- **Ownership (Reeve, 16:23):** the lead session on Reeve's laptop owns all product work (phone, stage, relay, UI) and runs the implementation agents. Nathan's lane: outreach, validation and, since 17:45, presentation planning in parallel (deck narrative, organizer questions, fact-sheet corrections, media slots). Deck and presentation items are back on `DECISIONS.md`.
- **Pitch:** 4-minute slide pitch Sunday, no live demo, GIFs and images allowed (organizers, Sat). Planning on an 11 AM Sunday slide deadline (last edition's); deadline, format, template and prize stacking unconfirmed (`research/pitch-format-2026-11-07.md`). Plan for the recorded takes: `.plans/feelink-demo-plan-2026-11-07.md`.

### Latest build and real-device test
- **main `c64269c`** (17:43): #107 merged. Tutor instruction box (phone speaks it, stage shows "Sent, not heard yet" until the phone's `spoken` confirms "Heard"), larger finger cursor with a subtle trail, folded "Student heard" log (latest large, "Earlier (n)", same line within 10 s merged), link states Connected / Reconnecting (5 s) / Disconnected (15 s) with "Not receiving drawings", start point (S or checkbox; phone says "Start: <name>"; replay says the start first). Landmark names are not re-spoken within 3 s of leaving. Built and emulated (17/17 checks, 35 board + 29 tactile tests, relay selftest, `check.sh`); **not yet tested on the real Pixel.**
- **Latest real-Pixel pass: A5, Reeve, 17:59, build `c64269c` = tag `demo-1`:** "it worked, it's decent. It still overall looks incomplete." Lead measured the same session: instruction sent 17:59:38 confirmed heard 17:59:41 by the phone's `spoken` event; Reeve's own instructions heard, a superseded one shown "Replaced, never heard"; landmark names, Connected and Back-to-menu lines all logged on the stage. Earlier pass 17:10 (#90 build): landmark arrival clear and spoken, Back exits Live, two-finger double tap repeats.
- **Services (main checkout, logs in `.tmp/`):** relay `python -I -u feelink/server.py` restarted 17:44 on `c64269c` under nohup; test route (Classroom start, two turns, Library) reposted 17:44; keep-alive `python -I -u tools/pixel_keepalive.py --serial 38300DLJH0058Y` running since 16:07 (restores `adb reverse tcp:8765` and the DevTools forward after each USB drop). Reload the phone with `node tools/pixel_tab.mjs "<expr>" reload` (Live needs a real tap afterwards); the laptop `/stage` tab is reloaded by hand (F5). Always reload phone AND laptop pages to current main before any test (Reeve, 15:00). Restart the relay after any `server.py` change.
- **Pixel:** on USB (drops heal in seconds via the keep-alive). `/feel` tab confirmed on `c64269c` at 17:55 (home screen, instruction handler present). The recording build is tag `demo-1`; no code changes to it without a Pixel re-check.

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

### Immediate priorities (critical path, in order; Reeve 17:59: finish the product, basic functionality complete, professional look, no more validation bookkeeping)
1. **#111 step-through reveal lands** (two agents finishing the `seq` and student-stroke conventions), then a Pixel re-check of drawing, landmarks, speech, connection and vibration.
2. **Completeness and professional-look pass on both pages** (D10 on DECISIONS.md: Reeve's specifics wanted; otherwise the lead's list), one UI agent per page, impeccable skill, no new features.
3. **Recording and footage:** Reeve and Nathan, on `demo-1` or a later re-checked tag; runbook `tools/record/README.md`.
4. **Nathan's lane, outside the agents' board:** organizer questions, fact sheet, deck.
5. **Re-tag** `demo-2` when #111 and the polish pass have passed on the Pixel.

### Outstanding human decisions (development only, Reeve 17:59)
See `DECISIONS.md`: D10, what still looks incomplete to Reeve. Recording, consent, organizer questions, fact sheet and deck are Reeve's and Nathan's, off the board.

### Evidence and validation (keep the four kinds apart)
1. **Verified device and engineering behaviour (Measured):** stroke delivery and latency, corner cues, `vibrate(0)` finding, USB drop recovery, landmark arrival and speech heard by Reeve on the Pixel, #107 emulated run. Reproduce run numbers with `python -I tools/metrics.py --label "<run>" --results feelink/results.jsonl`.
2. **Blindfolded or prototype usability testing (Measured):** blind run 1, Sat 14:49-14:54, tester Reeve (sighted, eyes closed), 5 trials, 4 of 5 shapes named, median 49.9 s, older build (core 14 mm, fade 6). Reeve, 17:59: no further test-run bookkeeping; this stays as the one prototype result.
3. **Feedback from actual target users:** none. `USERS.md` is empty; 38 outreach emails sent by Nathan, no reply recorded. Present no user validation unless logged there with consent.
4. **Evidence that FeelInk improves educational understanding:** none. Say "testable hypothesis", never "shown".
- **Claims we must not make** (direction update): that blind students cannot understand basic shapes; validated by blind students; improves learning outcomes; reliably teaches navigation; replaces tactile equipment; phone vibration conveys diagrams as well as raised-line graphics. Fact sheet: `research/feelink-fact-sheet-2026-11-07.md`, pending corrections in `research/feelink-fact-sheet-review-codex-2026-11-07.md`.

## Pending (non-product)
- CI works (run `42312250483` passed Nov 6 once the Actions budget was set). Say CI is green only after seeing it pass.
- Both laptops and the one Claude account are Reeve's; Nathan borrows one (Windows). Reeve's Claude plan: Max 20x (Reeve, Sat).
- Hardware order cancelled (Reeve's report); physical projects are out. Old ideation: `OPTIONS.md` and `research/*2026-11-06*` carry a superseded banner; the rival check that still applies is `research/feelink-rivals-claude-2026-11-06.md` (closest product the $15,500 Monarch-class tactile display).
