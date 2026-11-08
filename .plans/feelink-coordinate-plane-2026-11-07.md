# Coordinate-plane preset: evaluation and plan (lead, Sat Nov 7, 20:00 PT)

Reeve's request (pasted 19:56, his message was cut off after "We want to demonstrate that user"): evaluate a narrowly scoped coordinate-graphing demonstration alongside route learning, reusing the engine, human-led, no graphing calculator, Pixel demo and recording first; build it if it fits, otherwise a grounded future-use concept. Source of the idea: a respondent in r/AskABlindPerson (Told by Reeve) described trouble plotting points and keeping orientation on graphs in school and suggested direction-coded vibration. That is community feedback from a public post: it names a real difficulty, it is not a user trial of FeelInk and goes in `research/`, not `USERS.md`. Do not name the respondent on a slide.

## Verdict: build it as a stage-side preset, additive, after #141 and demo-2

Simplest meaningful version = one **Coordinate plane** button in the tutor's Create group that posts a small, fixed scene through the existing protocol: two axis strokes with unit ticks, plus labels for the origin (start point), the x axis and the y axis. Everything else the demo needs already exists: the tutor plots points with the Label tool (a label named "A (2, 1)" is a landmark; the phone speaks its name on arrival), traces guide lines with Shift, hides and reveals in steps, undoes a point and places it again. No phone, relay or protocol change. The phone treats the preset as ordinary strokes and landmarks, so the one Pixel check it needs is a 2-minute feel, not a new haptic design.

## Engine facts the design rests on (read in code, Nov 7)
- Board = phone screen, 56 x 120 mm (`tactile.js` BOARD). A line is felt in a 4 mm core plus a 6 mm fade each side, about 16 mm per line. A landmark is found within 4 mm; a corner, end or stroke crossing cues within 5 mm (`tactile.js` buildScene, nodeAt). So at most three parallel lines can be told apart across the board's width: **gridlines are out**. Axes plus unit ticks are the whole tactile plane.
- Stroke crossings and sharp turns already produce the corner cue, so a 3 to 4 mm tick excursion inside the axis polyline (or a short crossing stroke) reads as one bump per unit. Counting bumps from the origin is how raised-line graphs are read; no new haptics needed.
- Landmarks speak their name on arrival and give a 70 ms heartbeat at rest; the start point is spoken as "Start: <name>". A plotted point named "A (2, 1)" is therefore a spoken coordinate label for free.
- Reveal (#111) hides strokes by arrival order; landmarks on hidden strokes stay hidden. Axes first, then points, is a natural step order.
- Protocol: `{type:'stroke', id, by:'tutor', pts}` and `{type:'landmark', id, x, y, name, start?}` posted to `/event`; the relay stamps `seq` and re-syncs every client. Stage scripts are classic scripts sharing `post`, `upsert`, `landmarks`, `setLandmarks`, `B`, `BOARD`.

## Design answers to Reeve's questions
- **Preset, not editor.** First quadrant only, x 0..4 and y 0..8 (or similar) with one unit size on both axes so distances are true. Unit at least 10 mm so two ticks never share one 5 mm cue zone; axes at least 8 mm from the board edge so the felt band is not clipped. Fully revealed when loaded; Clear and Undo behave as today.
- **Axes vs points vs drawn lines.** Axes are the only strokes with ticks and are labelled at their ends ("x axis", "y axis"); points are landmarks (spoken name, heartbeat at rest); anything the tutor draws afterwards is a plain line. Three distinct feels, all existing.
- **Direction-sensitive patterns: not now.** The engine has one line texture; orientation-coded pulses are a phone-side haptic change on the one Pixel, with no evidence it helps and a real chance it muddies the line feel that passed on the Pixel. Orientation comes from the ticks and the spoken axis labels instead. Keep the respondent's idea as a future-use hypothesis on the slide, labelled as such.
- **Points without blind searching.** The tutor says "from the origin, count two ticks right, then go straight up"; if the student loses the line, the tutor drops a straight guide line (Shift) from the tick to the point, which is also the teaching move that shows A and B share x = 2. Reveal steps let the tutor show the axes before any point.
- **Changing a point.** Undo removes the last label; the tutor places the new one and the conversation covers what moved. Renaming by clicking the point exists. No move tool.
- **Phone interaction and TalkBack.** Unchanged: one-finger exploring, Back, two-finger double tap. TalkBack stays an unverified limitation.
- **Human-led.** No scripts, no typed instructions; the tutor talks. The preset only saves the tutor from hand-drawing straight axes.

## Task #143, ownership and sequencing
- Files (new): `feelink/presets.js` (pure geometry, node-testable), `feelink/presets.test.cjs`, `feelink/stage-presets.js` (button handler, posts the scene). One `<script>` tag and one button in `feelink/stage.html`, one test line in `tools/check.sh`, added only after #141 merges (the agent rebases on it). Nothing else.
- Agent: one Opus implementation agent in a worktree, PR held for the lead's review and smoke check, never merged by the agent. Lands after demo-2 is tagged, then its own quick Pixel feel (axes bumps, origin spoken, a plotted point spoken), then footage of the second demonstration.
- Must stay out: gridlines, snap-to-grid, a graph editor, subject categories in the sidebar, any phone or relay change.
