# FeelInk Sunday plan (Nathan's lane), Sat Nov 7 2026: 4-minute slide pitch with recorded GIFs

Rewritten Sat afternoon after the organizers changed the format (no live demo). Decisions below come from Nathan's interview on his laptop, Sat afternoon. Labels: **Measured** = from a real Pixel run (STATUS.md). **Built** = code on main, not necessarily felt. **Planned** = not built. **Assumption** = nobody has measured it.

## Format (Told by organizers, recorded by Reeve on main)
Sunday is a **4-minute slide pitch, no live demo, GIFs and images allowed**. Unconfirmed: deadline (planning on 11 AM Sun), file format, template, video with sound, Q&A, public repo. Questions: `research/pitch-format-2026-11-07.md`; Nathan and Reeve are asking.

## Product (unchanged)
A tutor draws on a browser whiteboard; a blind student feels the strokes live through their phone's own vibration motor. Proximity is pulse cadence and duty cycle (the web vibration API has no amplitude control). The tutor-side **stage view** shows the student's fingertip, the exploration trail, a ring on each real buzz, and **found by touch** (parts the student has felt turn solid). Webcam whiteboard, draw-it-back and touch-to-hear are future work: roadmap slide only, never shown as working.

## New goal
Everything serves a 4-minute deck plus recorded GIFs (and a ~60 s MP4 from the same takes if video is allowed), done by Sunday morning. The room can't feel vibration and GIFs are silent, so the stage view is the only way judges see the haptics, and it is the centrepiece of every GIF. **A GIF must read in one second with no narration: a real hand on a dark phone, a line, a ring when the finger hits it.**

Nothing has to survive a live room, only a take. We can retake.

## Decisions (Nathan's interview, Sat afternoon)
- **GIF framing: side by side.** Left: stage screen capture. Right: overhead iPhone video (Reeve's iPhone, propped, nothing built) of the real hand on the Pixel's dark screen. Two portrait panels fill 16:9.
- **Stage style: dark stage, paper board.** Near-black surround, off-white board, dark ink, teal trail, amber rings, Atkinson Hyperlegible, as in Reeve's mockups (https://claude.ai/artifact/VQciFrAWL3nRz437mH57PL). Designed for GIFs: flat colours, thick strokes, big cursor and rings, readable at about 960 px wide, no soft glows (they band in a GIF palette).
- **Stage design: B.** One board: student cursor, trail, rings, found by touch. Portrait 56 x 120 mm board as today. No rail, loupe or phone mirror.
- **Tutor input: draw on the stage page itself** on Reeve's laptop (mouse or trackpad, light smoothing). One page, one capture, no network. Claim only devices actually tested. ("Projector" in older briefs now means the stage view captured for GIFs.)
- **Ring truth: the hero take waits for #34's real phone buzz events.** Meanwhile build and test cursor, trail and found by touch. No laptop-estimated rings in any take.
- **Captions: on the slide or in the GIF composition.** The stage shows only a small header: FeelInk plus phone and tutor status dots.
- **Agentation: skipped.** UI stays plain HTML, no build step.
- **Level 1 (decided by Claude, recorded as it goes):** cursor, trail, found-by-touch visuals and animation timings (`/animate` after the interaction works, `/better-ui` last), recording pipeline details.
- **Level 3, later:** deck shape (lean: rubric order plus 2 GIFs) and deck tool (Google Slides or PowerPoint; a PDF freezes GIFs, so PDF only as fallback). Raised once organizers answer.

## What exists vs what is needed

| Piece | State |
|---|---|
| Relay `server.py`: SSE fan-out, stroke store, undo, clear, sync on connect, `/log` | Built. Relays any event type unchanged. Pages are a fixed route list, so `/stage` and `/board.js` need new routes. |
| Board geometry in mm on a 56 x 120 mm portrait board | Built. Phone and laptop both map to mm, so finger position is exact by construction (phone width 64.6 mm calculated, not measured). |
| Phone haptics: core 6 mm, 3-step fade, corner/end cues, tick, `vibrate(1)` stop | Built, unit-tested, `vibrate(0)` bug measured and fixed. Gradient being felt and tuned (Reeve, #33). |
| Phone live mode: strokes by SSE, finger sent back latest-only | Built. Finger event carries no haptic state. |
| Phone buzz events (`haptic`, `level` on finger, presence) | Proposed, Reeve decides (#34). **Required for rings.** |
| Tutor canvas `draw.html` | Built, debug look. Stays as-is; the stage page replaces it for takes. |
| Stage view B (`stage.html` + `board.js`) | Planned, issue below. |
| Recording pipeline (capture, compose, export) | Planned. No ffmpeg on the host laptop yet. |

## Priorities
- **P0 (appears in the recording):** drawing reaches the phone; finger returns; haptics feel right (Reeve); real haptic events (#34); stage view B.
- **P1:** recording pipeline; fact sheet; rehearsal; deck later.
- **P2 only if time:** haptic strip (phone-buzz timeline) if it reads in a GIF; iPad only if a network path works.
- **CUT:** judge onboarding, reconnect and latency chips, presentation-mode toggle, reset flows, examples library, the loupe, the iPad network chase.

## Stage view B: design notes (Level 1, may change after real takes)
- One page `feelink/stage.html`, shared code in `feelink/board.js` (fit/letterbox with `scale = min(w/56, h/120)`, stroke rendering, smoothing, SSE client). Plain HTML and JS, no build step.
- Tutor draws on the board with pointer events; light smoothing before sending, so phone and stage use the same geometry; partial strokes every 40 ms as `draw.html` does.
- Student cursor interpolated toward the latest finger sample each frame. Trail: last ~3 s comet in teal (Assumption), under the ink. Found by touch: segments the finger has passed within the core band turn from grey to full ink; until #34 lands, "passed within the core" is computed on the laptop from finger position, which is honest because it shows where the finger went, not a buzz. Rings: amber, only on #34 `haptic` events; none otherwise.
- Header: "FeelInk", phone dot (green while finger or presence events arrive), tutor dot.

## Recording pipeline (Planned)
ffmpeg on the host laptop (`winget install Gyan.FFmpeg`), stage screen capture (Game Bar or Snipping Tool), overhead iPhone video, sync on the first stroke, side-by-side compose, GIF and MP4 export at slide size. A test GIF from a real take must play in Google Slides or PowerPoint.

## Constraints
- **One host laptop: Reeve's.** The Pixel reaches the server only over USB `adb reverse tcp:8765 tcp:8765` (Measured: venue Wi-Fi and the Pixel hotspot blocked device-to-device traffic). Nathan's laptop has no adb. Every real test and every take runs on Reeve's laptop; anything tested only in a second browser tab on Nathan's laptop is a mock and is reported as one. Session times are agreed with Reeve over the team log.
- **Consent:** anyone who appears in footage (hands included, if identifiable) gives their own yes. Who appears is to be asked of Reeve and Nathan before the real session.
- **Ownership:** Nathan's lane: plan, stage, recording, fact sheet, rehearsal. Reeve's lane (don't edit): `feel.html`, `tactile.js`, Pixel tuning, #33, #34, #37. `server.py` is shared: team-log note first, routes only, no event-format change.

## Work (issues filed by Nathan's session)
1. Stage view v1 for recording: `feelink/stage.html`, `feelink/board.js`, `/stage` and `/board.js` routes in `server.py`. Accept: on Reeve's laptop with the real Pixel, cursor and trail follow the finger, drawing on the stage reaches the phone, rings only from #34 events.
2. Recording pipeline: tools, recipe and a compose script. Accept: one test GIF from a real take plays in Google Slides or PowerPoint.
3. Fact sheet: every number and claim for the slides with source and label (Measured / Read / Reasoned), then one Codex check.
4. Rehearsal and Q&A prep (later, with the deck): why not a Monarch, why not iPhone, speed of recognition.
Reeve's lane: #34 phone haptic events (now required for truthful rings), #33 blind shape run (record it: validation data and footage), #37 only needs to survive a recording session.

## Timeline (assumed slide deadline 11 AM Sun; venue closes 10 PM Sat)
| When | Work |
|---|---|
| Now to 5 PM | CLAUDE.md and plan shipped; stage v1 merged; first test take on Reeve's laptop; blind shape run recorded (Reeve) |
| 5-8 PM | Real recording session, compose GIFs |
| 8-10 PM | Fact sheet plus Codex check; deck draft once its Level 3 calls are made |
| Sun 9-10:30 AM | Retakes only if needed, rehearsals, export. Submit only with both Nathan's and Reeve's yes |
