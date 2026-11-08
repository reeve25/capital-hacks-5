# Coordinate plane preset (#143): implementation report

Implementation agent (Opus 5.5), Sat Nov 7, 20:01 to 20:16 PT by `date`. Branch `coord-preset-143`, worktree
`.claude/worktrees/coord-preset-143`. Design followed: `.plans/feelink-coordinate-plane-2026-11-07.md`.

## What changed
- `feelink/presets.js` (new): pure geometry, the same UMD/global style as `tactile.js` (global `Presets` on the stage,
  `require` in node). `coordinatePlane(opts)` returns `{strokes, landmarks}` in board mm: two tutor strokes
  `preset-plane-x-axis` and `preset-plane-y-axis`, and three landmarks: `Origin` (start), `x axis` at the x axis end,
  `y axis` at the y axis end (ids `preset-plane-origin`, `preset-plane-x-end`, `preset-plane-y-end`). Landmarks carry
  `by: 'tutor'` like the Label tool's. Fixed ids, so loading it again replaces the plane.
- `feelink/presets.test.cjs` (new): 6 `node --test` tests, below.
- `feelink/stage-presets.js` (new): wires `#presetPlane` if present. Mousedown never takes focus; a click first saves an
  open name box (`closeName(true)`, as every other tool button does), then upserts and posts each stroke, posts each
  landmark and updates local landmarks with `setLandmarks(B.upsertById(landmarks, l))`, then calls `setStart` on Origin
  so it is the one start point (#107 rule, as the Label tool does).
- Wiring, after #141 merged (PR #145, 20:11 PT): `feelink/stage.html` one `<button class="tool" id="presetPlane">`
  with an axes-and-ticks icon, under the Create tiles and readout; `presets.js` loaded after `board.js`,
  `stage-presets.js` after `stage-tools.js`. `feelink/server.py` two PAGES entries (the relay serves only listed
  files). `tools/check.sh` one `node --test feelink/presets.test.cjs` line.
- Deviations from the brief, each deliberate: class `tool`, not `tool quiet` (#141 removed `quiet` from stage.css and
  its Edit buttons use plain `tool`); `stage-presets.js` loads after `stage-tools.js`, not before, because its click
  calls `closeName` and `setStart` and the page's rule is that files use only what loads above them; the x axis is
  0..3, not 0..4 (next section).

## Geometry chosen and why
- Board 56 x 120 mm, 8 mm margin: 40 mm of width to use. **Unit 11 mm, x 0..3, y 0..8.** x 0..4 needs 4 x 10 = 40 mm
  with no room for the axis to run past its last tick, so tick 4 and the axis end would share one cue zone. 11 mm rather
  than 10: tick tips 10 mm apart have 5 mm corner zones that touch; at 11 they don't, and plotted points' 4 mm landmark
  zones keep a 3 mm gap. 12 mm does not fit (a mutation test fails the margin check).
- **Origin** at (8.5, 104), plane centred: x axis 8.5..47.5 at y 104, y axis 10..110 at x 8.5 (6 mm stub below the
  origin). Every point lies in x 8.5..47.5, y 10..110.
- **Ticks: a narrow tooth inside the axis polyline**, pointing into the quadrant: feet 0.5 mm either side of the unit
  mark, tip 3 mm off the axis. Straight runs carry a point every 1 mm; the tooth legs carry none.
- **Axes overhang 6 mm** past their last tick, and the y axis 6 mm below the origin, so the x axis starts *on* the y axis:
  buildScene marks one junction at the origin. Two axes that both start at the origin give two `end` nodes 0 mm apart.

## The measurements that decided the tick (Measured, `node`, Nov 7 ~20:05-20:12)
Scene check, `Tactile.buildScene(strokes, {})` (phone defaults), on one x axis with 3 ticks:

| Candidate | Result |
|---|---|
| Tooth 4 mm wide x 3 mm, dense runs | 1 corner per tick, min gap 6.71 mm |
| Same tooth, only waypoints (no dense runs) | ticks 1 and 2 give no node at all |
| Up-and-back spike 3 or 4 mm (x axis) | 1 corner per tick |
| Up-and-back spike on the **y axis** | 26 nodes for 8 ticks, two at 0 mm (base twice + tip) |
| Separate crossing tick strokes, 3 mm each side | end+end+corner per tick, min gap 3.0 mm |
| Separate one-sided tick strokes, 4 mm | corner+end per tick, min gap 4.0 mm |
| Two axes meeting at the origin, no stub | two `end` nodes 0 mm apart |

The up-and-back spike passes on the x axis only by accident: buildScene's corner window lands back on the base, the
zero-length direction reads as 0 degrees, which matches a rightward axis and not a vertical one.

Finger check, `Tactile.Renderer` with the phone's settings (`halfWidth = core/2`, `fade = round(core x 1.5)`), finger
sweeping straight along each axis from the origin at lateral offsets, counting corner cues (want x 3, y 8):

| Tooth width | Default core 4 mm, offsets -1.9..+1.9 mm | Core 3 mm |
|---|---|---|
| 4 mm (feet +-2) | offset 0: 4 and 9 (an extra cue: simplify dropped the last foot); +1 and +1.5: 5 and 15 | doubles at 0, +1, +1.5 |
| 2 mm (feet +-1) | all right except +1.9: 6 and 16 | doubles at +1.5 |
| **1 mm (feet +-0.5), shipped** | **3 and 8 at every offset, never off the line** | right except at its core edge (+1.5) |

Doubles come from a gap in the axis at the tooth: a finger on the far side of the line leaves the core, the corner
cue resets, and it fires again on the way back. Core 1 and 2 mm settings still double at the very edge of their core.

The final scene (shipped geometry): 15 nodes = 11 tick corners at the tips + the origin junction + 3 ends (x end,
y end, y stub), closest pair 6.00 mm (stub end to origin).

## Tests and checks (Measured)
- `node --test feelink/presets.test.cjs`: 6/6 pass. They prove (a) each tick is exactly one corner in buildScene, at the
  tip, and no two scene nodes lie within 5 mm; plus the Renderer sweep: a finger anywhere from -1.9 to +1.9 mm off
  either axis on the default core hears Origin, gets exactly one corner per unit, never leaves the line, and hears the
  axis name at the end; (b) every stroke point and landmark is 8 mm inside the board; (c) Origin within 1 mm of both
  axes, each axis label within 1 mm of its axis and more than 5 mm from the last tick; (d) two calls give identical
  output, ids unique and prefixed `preset-`. Mutations caught: a 4 mm tooth fails (a), a 4 mm overhang fails (a) and
  (c), a 12 mm unit fails (b).
- `python -I feelink/server.py --selftest`: `server selftest: ok`. `bash tools/check.sh`: `check: ok` (after wiring).
- Headless, test relay `python -I -u feelink/server.py 8799` and headless Chrome over CDP on 9347 (the live relay on
  8765, pid 26516, untouched; both test processes stopped with `Stop-Process`):
  - #141's own `tools/stage_tools_check.mjs` (port swapped to 9347): 41/41 pass, no console errors, with the new button
    in the panel.
  - Preset script: button inside Create; one click puts both axes on the board (44 and 110 points); with a Classroom
    start already on the board, Origin becomes the one start point (`Classroom,Origin*,x axis,y axis`); the button keeps
    no focus; a second click adds nothing; a fresh page load re-syncs the same plane from the relay; at 1280x720 the left
    panel ends at 702 of 720 px with no scrolling. 7/7, no console errors.
- Screenshots (git-ignored): `.tmp/stage-coordinate-plane-1600.png` (1600x1000, preset loaded) and
  `.tmp/stage-coordinate-plane-1280.png` in the worktree.

## Found on the way, outside this task's files (Measured)
**Stage labels ignore the ink.** In `stage-board.js` `drawLandmarks`, `const l = landmarks[n], ink = rv.mark[n] ?
COL.ink : COL.hidden;` shadows the outer `ink` sample array with a colour string (since 27eaa6b, 19:00), so
`B.labelPlace` gets a string, counts no hits anywhere and always puts a label to the right when it fits. In the
screenshot "Origin" sits over x tick 1 and "x axis" over tick 3. Renaming the inner colour (e.g. `color`) and its uses
fixes it; with real ink, labelPlace would put Origin below, x axis above and y axis right (Reasoned from labelPlace's
rule, not rendered). Not fixed here: `stage-board.js` is outside this task. Phone feel is unaffected.

## What remains uncertain
- **Pixel feel: not tried (Reasoned only).** Everything above is the phone's own JS run in node, not the Pixel's
  vibration. Whether a 3 mm tooth reads as a distinct bump next to the line's own buzz, and whether 11 mm units are
  countable at a student's pace, needs the 2-minute Pixel check the plan calls for (axes bumps, "Start: Origin" spoken,
  a plotted point spoken).
- **Narrow cores (Measured in node):** at the 1 to 3 mm core settings a finger right at the core's edge, on the side
  away from the ticks, can get two cues per tick. Default 4 mm and 5 mm are clean.
- **Stage look (Measured, screenshot):** at 2.4 mm stage ink the 1 mm tooth draws as a rounded nub, readable as a tick.
- **Relay restart needed:** the running relay (8765) only serves files in its PAGES dict as loaded at start, so after
  merging, `/presets.js` and `/stage-presets.js` 404 on it until it is restarted: the stage shows the button but it does
  nothing. Restart the relay before demoing the preset.
- Undo removes the preset a piece at a time (labels, then axes), as with any strokes and labels (by design: Clear and
  Undo behave as today). Loading it while steps are hidden adds the axes as hidden steps, like any new stroke.
