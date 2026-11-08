# FeelInk deck: outline and script, Sat Nov 7 2026, 22:20 PT (lead, deck lane taken over from Nathan at Reeve's request)

Target: the 4-minute slide pitch Sunday (slides about 11 AM, unconfirmed; format questions in `research/pitch-format-2026-11-07.md`). Builds on the existing Google Slides deck "FeelInk Presentation" (Reeve's Drive, created 13:51, last edited 21:48), which follows the organizers' template order: Title, Starting Point, Problem Space, Solution, Value Proposition, Competitive Landscape, How It Works, Validation, Impact & Benefit, Team. This outline keeps that order where it helps the rubric and merges two template slides (Value Proposition into Solution, Competitive Landscape into Impact) to buy time for the demonstration and for honest validation.

Labels: **Measured** = real Pixel 8 or a command; **Emulated** = headless browser on a test relay; **Read** = cited source; **Reasoned** = inference. Every number here traces to README "Design decisions, and what we measured", STATUS.md or `USERS.md`.

Rubric (25 points, split unpublished): Problem & User, Solution & Feasibility, Technical Innovation, Validation & Metrics, Impact. Each slide names the criterion it serves.

Speaking budget: about 150 words per minute, 600 words total. Per-slide seconds below add to 4:00 with no slack; cut the Team slide to a single breath if a rehearsal runs over.

## Slide by slide

### 1. Title (10 s) — all criteria, first impression
- On the slide: FeelInk. "Feel the lesson as it is drawn." Health + Accessibility track. Capital Hacks 5.0. Reeve and Nathan, Sacramento State.
- Visual: the side-by-side still from the hero take (stage left, hand on the dark Pixel right). Until a take exists: `docs/stage-route-lesson.png`, captioned as a scripted test relay.
- Say: "FeelInk lets a blind student feel what a tutor is drawing, live, on a phone they already own."

### 2. Problem (40 s) — Problem Definition & User Identification
- On the slide, three beats: (1) A teacher sketches a route, graph or circuit on the board; sighted students see it at once. (2) The blind student gets words, a tactile sheet later, or nothing; when the teacher changes the drawing, they wait again. (3) The dedicated fix is a refreshable tactile display; APH's Monarch lists at $15,500 (Read, aph.org, fetched Sat 13:20).
- Who: blind and low-vision students and the tutors who teach them one to one. Scale, only as context: 73,505 US students registered with APH (Read, FY2025 report); at least 2.2 billion people with a vision impairment (Read, WHO 2026; never "2.2 billion blind people").
- Visual: a whiteboard sketch on the left, a blank phone on the right, the $15,500 figure large.
- Say: who, what their day looks like now, why the gap exists (cost, preparation time). No product yet.

### 3. What FeelInk is (35 s) — Solution Approach & Feasibility (absorbs the template's Value Proposition)
- On the slide: a laptop web page for the tutor, a web page in Chrome on an ordinary Android phone for the student, a 139-line stdlib Python relay between them. Nothing to install, nothing to buy.
- The three things the student gets: lines as vibration under one finger, corners and ends as short cues, labels spoken by name ("Start: Classroom"). The tutor talks, watches the student's finger live, and reveals the drawing one step at a time.
- Human-led: an in-person classroom tool. The software is the tactile workspace plus feedback; the tutor is the teacher.
- Visual: `docs/stage-tools-1920.png` (the Studio stage) next to `docs/phone-home.png`.
- Say: "The tutor draws. The student explores. The tutor sees where the finger is and talks them through it, like any lesson."

### 4. How a lesson goes (30 s) — Solution & Feasibility
- On the slide, six steps as a numbered strip, from README "How a lesson goes": tutor draws (Shift for straight lines), places labels and a start point; student taps Connect, the board maps onto the screen at true scale (Reasoned: 64.6 mm screen width is calculated, not measured); student slides one finger, lines buzz, labels speak; tutor watches finger, last label heard and the felt share; tutor reveals stroke by stroke, hidden parts silent and dashed; Back exits.
- Visual: `docs/stage-step-reveal.png`.
- Say the steps in the tutor's and the student's voice, one sentence each.

### 5. Demonstration (50 s) — the real thing; serves Validation and Solution
- Two GIFs, side by side format from `tools/record/README.md` (stage capture left, overhead iPhone of the hand on the Pixel right, sync tap at the start, 960x540, under 10 MB).
  - GIF A, route lesson: classroom to library, "Start: Classroom", a corner cue, a label spoken, the felt share rising on the stage.
  - GIF B, coordinate plane: the one-click axes, the student counting tick bumps from the origin, "A (2, 1)" spoken, a Shift guide line from the tick to the point.
- Captions on the slide, not in the GIF: "Real Pixel 8, USB. Left: tutor stage. Right: the student's hand." If a take is not real-device footage, the caption says so; no emulated footage is ever presented as a take.
- Status: GIF A and GIF B need the Pixel (recording blocked while it is off USB). Fallback if no takes exist by Sunday morning: the three README screenshots with the scripted-relay caption, and say plainly that the device run passed but was not filmed.
- Say almost nothing: name what the judge is looking at, then let it play.

### 6. What we built and measured (35 s) — Technical Innovation & Originality
- On the slide, four findings, each Measured on the Pixel 8 unless marked:
  - Chrome on Android ignores the standard stop, `vibrate(0)`: 0 of 132 pre-fix vibrations were cancelled, a 2 s buzz ran 2091 ms. FeelInk stops with a 1 ms buzz instead: 311 ms when called at 300 ms.
  - The Web Vibration API has no amplitude (Read, W3C draft), so line strength is rhythm: one continuous 5 s hold, re-armed at 4.5 s, with three sparser fade steps beside it. Buzzes over 1 s play at the phone's media vibration setting (51% at 1, 100% at 3).
  - A label is a state, not a one-off cue: silence, the spoken name, three long pulses, then a heartbeat at rest. Reeve on the Pixel: arrival is clear.
  - End-to-end on an earlier build: 151 of 151 strokes reached the phone, relay to phone median 4-5 ms; 192 of 192 finger samples back, median 14 ms; mapping error 0.03-0.04 mm; first buzz of a touch 93-196 ms after the request (cause unknown).
- One line on the engineering: strokes simplified (RDP 2 mm), corners at 40 degrees over 5 mm, a swept-path tick for a fast finger, sequence-stamped reveal (Emulated: 13 of 13 phases), one relay per port after a stacked-relay bug (Measured).
- Say: "Nobody we found does live co-drawing to an unmodified phone. Getting a phone motor to behave took real measurement; here is what we learned."

### 7. Validation, exactly what happened (35 s) — Validation & Performance Metrics
- Keep the four categories apart on the slide, as in README "What we have shown":
  1. Device and engineering behaviour: Measured, above; `demo-2` passed a real-Pixel re-check at 20:33 Sat (Connect, route trace, labels spoken, step reveal).
  2. Prototype usability, one session: a sighted tester, eyes closed, named 4 of 5 shapes, median 49.9 s, on an older 14 mm build. Does not validate the current build or any learning effect.
  3. Target-user feedback: one written reply from a blind student with tactile-graph experience, reached by email (Sat, logged anonymously in `USERS.md`). Their verdict: this approach won't work in practice, for three reasons: a single vibrating point on flat glass gives no spatial context once the finger slips off; TalkBack intercepts single-finger gestures; motor latency and fingertip numbness turn the lesson into chasing a buzz. They suggested audio sonification (pitch and stereo) or low-cost raised-line boards. [Reddit replies: Reeve posted in r/AskABlindPerson Sat; themes still to be logged in `USERS.md`; fill in count and themes before the deck is final.]
  4. Evidence that FeelInk helps students learn: none. A hypothesis to test.
- Say: "We asked the people it is for, and the first answer was no. Here is why, and here is what in the design already answers part of it and what does not." Then the next slide.
- Hard rule: the respondent's name and organization stay off the slide (the outreach email promised anonymity unless they say otherwise; they did not).

### 8. Limitations and what the critique changes (20 s) — Validation, honesty
- On the slide, in two columns.
  - Already in the design: the tutor sees the finger live and talks, so "which way to search" is answered by a person, not the phone (human-led); the fade band gives a weaker signal beside the line before it goes silent; labels are spoken so the student is never only chasing a buzz.
  - Not answered: TalkBack untested, and reading the Android sources suggests one-finger exploring may not reach the page with it on; USB only, no classroom network path shown; one phone tested; iPhone impossible (no Vibration API in Safari); far lower fidelity than a tactile display; no evidence of learning.
- Say: "Half the critique is why the tutor is in the loop. The other half is open, and we say so."

### 9. Impact and what's next (20 s) — Potential Impact & Real-World Application (absorbs Competitive Landscape)
- On the slide: cost (a phone the student owns against a $15,500 display; a supplement, not a replacement for tactile graphics, braille or O&M); reach (the same lines, labels and reveal steps carry graphs, geometry, circuits: the coordinate plane is the first); the edge (two people, one weekend, AI-assisted development).
- Next, in order: put it in front of blind students and teachers with consent, before building more; test audio sonification beside vibration, as the respondent suggested [Reeve to confirm this is the direction before it goes on a slide]; TalkBack on a real device; a classroom network path.
- Say: "If the students say yes, it costs nothing to put in every classroom with an Android phone. If they say no, we will have learned that for the price of a weekend."

### 10. Team and disclosure (10 s) — organizer requirement
- Reeve Masilamani and Nathan Jeevamani, Sacramento State. Fix the template placeholders ("Barista-turned CEO", "Another unrelated skill") before any export.
- Disclosure line, required by the organizers: built with Claude Code (Anthropic) and Codex (OpenAI) agents doing implementation under our direction; impeccable design skill (Apache 2.0); Atkinson Hyperlegible typeface; FFmpeg for the clips. Repo started on day one; all FeelInk code written during the event.

## Never say
- That a blind person has tried FeelInk, or any name or quote from a respondent without written consent.
- "2.2 billion blind people"; APH braille-literacy percentages (APH says its registration data can't support them).
- That the 4 of 5 blind run validates the current build or shows learning.
- TalkBack works; Wi-Fi works; any device beyond the one Pixel 8.
- That a ring on the stage means the motor ran (it means the phone asked Chrome for a buzz).
- Anything emulated or scripted as a device result. README stage screenshots are from a scripted test relay and are captioned so.
- The Coordinate plane, grouped tutor tools, label-placement fix and felt-share row as Pixel-checked (they are on main after `demo-2` and have not been felt on the phone).

## Open before the deck is final
1. GIF A and GIF B: need the Pixel back on USB, then a recording session (runbook `tools/record/README.md`; `selftest.sh` passed on Reeve's laptop 22:05 Sat).
2. Reddit replies: count, themes, dates, logged anonymously in `USERS.md`.
3. Reeve: is "test audio sonification beside vibration" the direction, or stays a respondent suggestion on the limitations slide?
4. Organizer answers: deadline, file format (GIFs freeze in PDF), template, Q&A.
5. Footage consent: Nathan said yes to his hand on the Pixel (Sat 18:10, Reeve agreed). Anyone else in frame needs their own yes.
