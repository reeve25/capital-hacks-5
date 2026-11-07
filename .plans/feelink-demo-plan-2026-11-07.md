# FeelInk Sunday demo plan (Nathan's lane), Sat Nov 7 2026

Written by Claude on Nathan's laptop from Nathan's direction brief (pasted in chat, Sat afternoon). Labels: **Measured** = in STATUS.md from a real Pixel run. **Built** = code on main `7c3cee6`, not necessarily felt. **Planned** = not built. **Assumption** = a value nobody has measured yet.

## Direction (Nathan's brief, summarized)
- Product: a tutor draws on a browser whiteboard; a blind student feels the strokes live through the phone's own vibration motor. Proximity is pulse cadence and duty cycle, not amplitude (no amplitude control in the web API).
- Main differentiator: the projector shows the audience what the student is doing: the drawing, the live fingertip, an exploration trail and a haptic indicator. Far / approaching / on the line must look different.
- Truth rule: animate "the phone buzzed" only from real events sent by the phone. Anything the laptop computes is labelled as an estimate.
- Not now: webcam whiteboard, draw-it-back, touch-to-hear. Keep the stroke format open for a webcam source later (`by: "webcam"`), build nothing for it.
- One-second wow: the tutor draws a stroke and someone immediately feels it through plain glass. Full-shape recognition can take much longer; never promise it is instant.
- Priorities: P0 real interaction, P1 projected UI, P2 demo polish, P3 extensions.
- Ownership: Nathan owns plan, demo, laptop/projector UI, `feelink/draw.html` and new UI files. Reeve owns `feel.html`, `tactile.js` and Pixel tuning. `server.py` and its event format are shared: team-log note and Reeve's agreement first.

## What exists vs what is needed

| Piece | State |
|---|---|
| Relay `server.py`: SSE fan-out, stroke store, undo, clear, sync on connect, `/log` | Built. Relays any event type unchanged, so new event types need no server change. Pages are a fixed route list, so a new file needs a new route. |
| Board geometry: everything in mm on a 56 x 120 mm portrait board | Built. Phone and laptop both map to mm, so finger position on the laptop is exact by construction (phone screen width 64.6 mm is calculated from the spec, not measured). |
| Phone haptics: core 6 mm, 3-step fade 6 mm each side, corner and end cues, swept-line tick, `vibrate(1)` stop | Built, unit-tested. `vibrate(0)` bug measured and fixed. Gradient not yet felt (Reeve's lane). |
| Phone live mode: strokes arrive by SSE, finger sent back as `{type:"finger", x, y, down, pen}`, latest-only | Built. **The finger event carries no haptic state**, so the laptop cannot truthfully show buzzes yet. |
| Tutor canvas `draw.html`: draws, partial strokes every 40 ms, undo, clear, red finger dot | Built, debug-looking. Mouse/touch/pen all come through pointer events; no smoothing, no presence, no examples. |
| Projector view, trail, haptic indicator, loupe, presentation mode, reset, examples, device status | Planned. |
| Phone presence (is the phone connected when no finger is down?) | Missing. SSE has no client identity. |

## Hard constraints found
1. **One host laptop.** Venue Wi-Fi and the Pixel hotspot both blocked device-to-device traffic (Measured, cause not found). The Pixel reaches the server only over USB `adb reverse`. So server, Pixel, tutor input and projector all hang off one laptop. A separate iPad as the tutor device needs a network path that has not worked yet; test an iPhone hotspot once, otherwise the tutor draws on the host laptop (touchscreen/stylus if it has one, else mouse).
2. **The Pixel is on Reeve's laptop.** Nathan's laptop has no adb (checked). Real-system tests of Nathan's UI run on Reeve's laptop after merge, or adb gets installed here and the Pixel moves. Agents can test layout against a second browser tab, but that is a mock and must be reported as one.
3. **Haptic settings live on the phone** (core and fade sliders in its localStorage). The laptop cannot reproduce the phone's levels without being told them.
4. **Portrait board, landscape projector.** A 56 x 120 board fit to a 16:9 screen uses about a quarter of the width. The free space is where the explanation goes.

## Design options (Nathan and Reeve pick)

### A. Split stage (recommended)
Landscape stage page. Left two-thirds: the board as a large phone-shaped whiteboard (Excalidraw / tldraw look: off-white paper, dark ink, rounded strokes). Right third, a rail with:
- **Loupe**: 4x zoom around the fingertip, showing the nearest line, the core and fade bands drawn to the phone's real widths, and a distance readout labelled "distance (laptop estimate)".
- **Haptic strip**: a scrolling timeline of the actual `navigator.vibrate` calls the phone made, drawn as on/off bars (like an oscilloscope or Apple's Core Haptics timeline). Corners and ends get their own glyph. Labelled "phone buzz".
- Status chips: phone connected, tutor connected, latency.
On the board: the student's cursor (labelled "Student", like a Figma multiplayer cursor), sonar rings that fire only on real buzz events and scale with the level, a fading comet trail, and **"found by touch"**: line segments the student has passed over at the top level turn from grey to full ink. The drawing visibly reveals itself as the student feels it.
Why: uses the empty projector width, keeps the board as the centrepiece, and the strip is the truth layer judges can read without a word of explanation. Cost: the most work of the three.

### B. One canvas, sonar cursor
Full-screen board only. Same cursor, rings, trail and "found by touch", plus a soft spotlight halo of the fade band near the finger. No rail. Status in a thin top bar.
Why: cleanest and most cinematic; least to build. Risk: the empty sides of the projector, and less room to show the haptic truth explicitly.

### C. Board plus live phone mirror
Left: board. Right: a life-size phone frame showing the black screen and the fingertip as the student experiences it, with the haptic strip under it.
Why: makes "she can't see it" obvious. Risk: two copies of the same geometry compete for attention, and the phone mirror says less than the loupe.

**Recommendation: A, built in the order B-then-rail.** Everything in B is A's board, so the first shippable stage is B, and the rail is added after it works on the real Pixel. If time runs out, B is the demo.

The signature moment both A and B add beyond "a vibrating whiteboard": **found by touch** (the shape fills in as the student feels it) is also the real product story: a tutor can see which part of the drawing the student hasn't found yet.

## Answers to the design questions
- **Drawing device + projector, no new architecture:** one new page `stage.html` served by the same server, opened full-screen on the projector. It also accepts drawing, so the host laptop can be tutor and stage at once. `draw.html` stays the tutor page for a second device if a network path exists. Shared drawing and mapping code goes in a new `board.js`.
- **Coordinate mapping:** keep everything in board mm (already the protocol). Each page fits the 56 x 120 board into its own area with a uniform scale and letterbox (`scale = min(w/56, h/120)`), never stretching. Phone mm to stage mm is then identity. The finger cursor is interpolated toward the latest sample each frame so it moves smoothly between network updates.
- **Trail:** a comet of the last ~3 s (Assumption) fading to zero, drawn under the ink so it never hides the shape, plus a very faint permanent "explored" layer. Trail points take their colour from the real level at that moment.
- **Continuous proximity vs discrete levels:** continuous distance appears only in the loupe and is labelled as a laptop estimate. Discrete levels (0, fade 1-3, on-line, corner, end) come from the phone's own events and drive the rings, trail colour and strip.
- **Truthful haptic activity:** needs one additive event from the phone (below). Without it, the stage shows the finger and trail only and labels any computed level "estimated", with no rings.
- **Impressive yet usable:** one page with a presentation toggle (P key) that hides tools; the tutor tools are a small floating toolbar (pen, undo, clear, example, reset).
- **Input and reliability:** pointer events cover mouse, touch and pen; light smoothing before sending so the phone and the screen use the same geometry; partial strokes keep streaming every 40 ms as now. SSE already reconnects and the server re-sends `sync`; the stage shows "reconnecting" and keeps the last drawing. Latency over USB is not measured; show it only once measured.
- **Minimal compelling interaction:** found by touch, above.

## Coordination needed with Reeve (before building the parts that depend on it)
1. **New event `haptic`** sent by `feel.html` every time it calls `navigator.vibrate`, posted through the existing `/event` (server unchanged), latest-only like the finger:
   `{type:"haptic", level, top, kind: "hold"|"fade"|"corner"|"end"|"tick"|"stop", pattern:[ms...], t}`.
   Honest wording on stage: "phone requested a buzz". Reeve's `dumpsys` measurement showed Chrome plays these calls, but a call is not proof the motor ran.
2. **Finger event gains `level`** (same value), so trail colour lines up with position without matching two streams.
3. **Phone settings event** on connect and on slider change: `{type:"phoneconfig", coreMm, fadeMm, steps, screenWidthMm}`, so the loupe draws the real bands.
4. **Presence**: the phone posts `{type:"hello", who:"phone"}` on connect and every 2 s (Assumption) so the stage can show "phone connected".
5. **Server routes** for `/stage` and `/board.js` (and later static assets). This touches `server.py` but not the event format.
6. Who owns the demo's host laptop and the USB Pixel during rehearsals.

## Roadmap to Sunday (pitch about 11 AM Sun, Assumption from CLAUDE.md)
| When | Work | Gate |
|---|---|---|
| Sat afternoon | Reeve: gradient felt and tuned, blind 5-shape run. Nathan: pick design; server routes; `board.js`; stage B on the board (cursor, trail, rings wired to events, found by touch) | Reeve agrees the event format |
| Sat evening | Reeve adds the `haptic`/`hello`/`phoneconfig` events. Nathan: tutor toolbar and smoothing, presentation mode, reset, labelled examples. **First real run on Reeve's laptop with the Pixel.** | Stage follows the real Pixel; no stuck buzz |
| Sat night | Rail (loupe + haptic strip), status chips, reconnect behaviour. Codex review of truthfulness and failure modes. | Codex review |
| Sun morning | Rehearse the 6-step demo twice on the host laptop and projector resolution; preflight checklist; tag `demo-N`. | Two clean rehearsals |

## Issues (Nathan's lane unless noted)
1. Server routes for the stage page and shared JS (shared file; team-log note first).
2. `board.js`: board fit/letterbox mapping, stroke rendering, smoothing, event client.
3. `stage.html` v1 (design B): board, student cursor, trail, rings and found by touch from real events, labelled fallback without them.
4. Tutor input upgrade in `draw.html` and the stage toolbar: smoothing, pen/touch/mouse, undo, clear, reset, labelled examples, presentation mode.
5. Stage rail (design A): loupe and haptic strip, status chips.
6. Demo runbook and preflight: host laptop setup, adb reverse, reset, fallback, judge onboarding script.
7. (Reeve) Phone events: `haptic`, `level` on finger, `phoneconfig`, `hello`.
8. Codex review of the stage once 3 and 7 are on main.
