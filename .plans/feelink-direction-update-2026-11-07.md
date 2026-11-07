# FeelInk direction update: lead with education, demonstrate with routes (Sat Nov 7 2026, 14:20 PT)

Source: Reeve pasted a product-direction update into the Fable lead session at about 14:20 (his words: "NOT a reset"). Whether Nathan has read it is not recorded; asked on the team log. Labels as in STATUS.md: **Told** = from Reeve or Nathan, **Measured**, **Built**, **Planned**, **Reasoned** = the lead's inference.

## The update in brief (Told)
- Shape recognition is not the most compelling educational problem: blind students already learn shapes through objects and tactile graphics. The compelling problem is timely access to **spatial information created or changed during instruction**.
- Positioning: *FeelInk is an accessible, interactive spatial-learning tool that lets educators communicate diagrams, routes and spatial relationships through touch and sound using ordinary hardware.* A supplementary channel, not a replacement for tactile graphics, Braille, O&M instruction or dedicated hardware.
- Lead with education; demonstrate with **route learning and spatial orientation**: a tutor draws a route (classroom to library) with turns, an intersection and named landmarks; the student traces it, hears landmark names, and explores what changed when the tutor edits the route. **Not a navigation app**: no location tracking, no obstacles, never suggest it is safe for real navigation.
- Build on the existing engine; do not rewrite. Priorities: A paths and landmarks (start, end, turns, intersections, named points); B optional spoken labels via browser-native speech, tested rather than assumed; C guided exploration and tutor changes; D reusable primitives, not a diagram framework.
- Ownership unchanged (Nathan: plan, demo flow, stage; Reeve: `feel.html`, `tactile.js`). Keep the freehand drawing demo intact. Escalate only product trade-offs, scope changes or demo risk.
- Hackathon order: P0 working core and recording; P1 a minimal route-learning demo with a few landmarks and, if reliable, spoken labels; P2 evidence (finish the post-fix shape test; if feasible, whether a participant can follow or remember a route; record accuracy, time, failures, sample size; blindfolded sighted testers are not blind users); P3 other subjects, deferred.

### Claims we must not make without evidence (Told, for the fact sheet and deck)
That blind students cannot understand basic shapes; that FeelInk has been validated by blind students; that it improves learning outcomes; that it reliably teaches navigation; that it replaces specialized tactile equipment; that phone vibration communicates diagrams as effectively as raised-line graphics.

### What we can emphasize (Told)
A genuine problem of access to changing spatial information; an inexpensive hardware approach; a working real-time interaction; measured device-specific engineering improvements; a broad educational vision from reusable spatial concepts; a testable hypothesis about educational usefulness. Prior art to acknowledge, as named in the update and **not yet read by the lead**: Perkins O&M and tactile-map teaching, AFB on spontaneous classroom information, APH Monarch and "Wing It", audio-haptic map research. Read before any deck claim cites them.

### Story (Told)
Problem: spontaneous or changed diagrams need time, materials or preparation to make accessible. Opportunity: explore a simplified version on an ordinary phone right away. Solution: tutor drawing to interactive haptics, with optional audio naming meaningful elements. Demonstration: a route through a school with landmarks and turns, then the tutor changes it. Potential: diagrams, graphs, circuits, maps. Honest limitation: feasibility shown on one device; educational effectiveness and target-user suitability unvalidated.

## Integration assessment (Reasoned, Fable lead, 14:20)

**Stays unchanged:** the haptic engine (core, fade, corner and end cues, tick, `vibrate(1)` stop), the relay, stage design B and the dark-stage GIF style, side-by-side framing, the recording pipeline, #34 phone events (shipped, real-Pixel check pending), #33 blind 5-shape run as the measured validation, #45 and #47, Codex's fact-sheet findings, the 4-minute deck as the judged artifact.

**Changes:** the pitch story and slide order (problem is changing spatial information, not shape recognition); the second recorded take becomes a route with landmarks instead of a second shape; the fact sheet gains the must-not-claim list and loses any "teaches shapes" framing; the blind run gains one short route task at the end if time allows.

**Smallest build before Sunday (Reasoned, two issues):**
1. **Landmark primitive, phone and relay** (Reeve's lane): a new event `{type:'landmark', id, x, y, name, by}` stored by the relay like strokes (included in `sync`, cleared by `clear`, removed by `undo` when newest) and relayed unchanged. On the phone, a landmark within about 4 mm of the finger is a node of kind `landmark`: a distinct short buzz and `speechSynthesis.speak(name)` once per entry, reported as a `haptic` event with `kind:'landmark'` and the name so the stage can caption it. End cues already act as destination cues; junctions already fire the corner cue, so no new intersection pattern (more patterns is exactly what the update warns against).
2. **Stage: draw and show landmarks** (Nathan's lane): a key plus click places a landmark and asks its name; render as a labelled dot; on a `haptic` of kind `landmark`, show the name as a caption bubble so the GIF shows what the phone said, since GIFs are silent. Also the P1 from Codex's review: rings expire at 1000 ms while the hold runs 5 s (`board.js:111`).

**Deferred:** comparing an earlier and a revised diagram; guidance to find the start point; subject-specific examples beyond one route; any audio beyond landmark names; generic diagram framework; iPad or second-device paths.

**Risks and conflicts:**
- Time: venue closes 22:00; the recording session is planned 17:00-20:00. The route take only happens if the landmark build is on the phone and checked by about 17:30. Phone work stays serialized: #34 check, blind run, then landmark check, then takes.
- Speech: Android Chrome `speechSynthesis` needs a prior user gesture, may start late and can overlap the motor; it must be measured on the Pixel, and reported as Built until then. Audio is invisible in a GIF: the caption carries it; an MP4 with sound only if the organizers allow it.
- Validation: the shape run is still the only measured evidence; the route task must not eat its time. A route task has no established pass bar; propose "names the landmarks in order and counts the turns" as a descriptive result, not a score.
- Ownership: the plan, stage and fact sheet are Nathan's lane; the second issue and the story change wait for his read. The relay store change is shared and gets a team-log note before the edit.
- Fact sheet already has 28 pending corrections; the new claims list adds to Nathan's queue, not to the code.
