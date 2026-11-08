# #141 tutor tools visible, grouped by action: implementation report (Sat Nov 7, 20:09 PT)

Agent: Opus 5.5 implementation agent, branch `tools-visible-141` (worktree `.claude/worktrees/tools-visible-141`), from
main `86b1af4`. Brief: Reeve's 19:43 note (`.plans/feelink-tools-visible-2026-11-07.md`, untracked on main), under the
18:55 human-led note. PR open for the lead's review, not merged.

## UX problems found (baseline: main `86b1af4` rendered at 1600x1000, Measured)
1. **Half-empty left panel that read as two loose clusters.** Content ended about 40% down the panel. The group titles
   ("Shape the lesson", "Reveal in steps") were 13 px grey sentence case, weaker than the button labels under them.
2. **Create and edit mixed.** Draw/Label sat in the same group as Undo/Clear, so a viewer couldn't tell what makes
   things and what corrects them.
3. **The start point had no visible control.** It existed only as the S key over a label and a checkbox in the name box.
   It showed up in the panel only once Label was armed, as hint text.
4. **Rename was invisible.** A Label click on an existing label renames it, but nothing said so in Draw mode.
5. **The reveal stepper's P and N were bare media icons.** The meter text sat between them, centred, in 13 px grey.
6. **Nothing said what the next click on the board does.** The only line under the tools was "Hold Shift for a straight line."
7. **Faint keycaps.** Their border (`--line`) vanished on the control fill, so a key read as a stray letter.
8. **The right panel had no title.** It didn't read as part of the same structure as the tools.

## Design decisions and why
- **Three groups on the left, by tutor action: Create, Edit, Present; the right panel titled Session.** These are the
  brief's suggested labels. I kept them because each one names a verb a judge can map to a capability in one glance.
  I rejected "Teach" for Present (the human teaches, not the software) and "Reveal" (it repeats the buttons inside).
  Titles are short uppercase grey labels (13 px, 0.07 em tracking). They organise the panels without competing with
  the controls or the board.
- **Modes look different from commands.** Draw, Label and Start point are the one choice of what the next board click
  does. They are 80 px icon tiles in one segmented control, with the current tile lit. Undo, Clear, Previous, Next and
  Reveal all are plain 44 px buttons. A mode never looks like an action, and switching tools looks easy (brief point 4).
- **Start point is a real tool, not a new capability.** Arming it, then clicking a label, toggles that label as the
  start, within the same 10 mm reach the S key uses. Clicking bare paper opens the name box with "Start point" already
  ticked, and that box already existed. Then it's back to Draw, as Label does. **The S key is unchanged** (lead's rule:
  no shortcut behaviour changes). It still acts at the pointer at once. The tile shows S as its key because S is the
  start shortcut. Its tooltip and the readout say "S over a label does the same".
  "Start point" rather than "Start", because a bare "Start" button reads as "start the lesson".
- **Tool readout (the lead's suggestion), two lines under the tiles.** Line 1 says what the next click does. Line 2
  names the one key that changes it, and Shift still lights while held. The copy is precise and minimal (Reeve 19:35):
  - Draw: "Drag on the board to draw." / "Hold Shift for a straight line."
  - Label: "Click the board to add a label." / "Click a label to rename it."
  - Start point: "Click a label to make it the start." / "S over a label does the same."

  This puts rename on screen without a duplicate Rename mode. The readout keeps a fixed two-line height, so switching
  tools never moves Edit or Present.
- **Clear's toast swaps in place of the Edit row, at the same 44 px.** Nothing below it moves. I measured its box
  identical to the row's. Keyboard focus on Clear moves to the toast's Undo and returns to Clear afterwards. Before,
  the toast replaced the hint line under the tools, away from the Clear button that caused it.
- **Present: status first, then the controls.** The meter line ("All 2 lines shown", or "Shown 1 of 2 lines" in bold
  white while hiding) leads, over full-width segments, one per line in the order the student gets them, teal where
  feelable. Then labelled Previous (P) and Next (N), then Reveal all (Shift N). The "Dashed lines are hidden from the
  student." note stays under them. Tooltips: "Hide the last line shown", "Show the next line".
- **Keycaps legible but secondary.** All keycaps get an `--edge` border with `--faint` text, so they read as keys
  without outweighing the labels.
- **Nothing added to fill the empty lower-left.** The old "On the board" legend was removed on purpose in the human-led
  pass, because the Session glyphs double as the board's key. A keys card would repeat the keycaps already on every
  control. The space stays quiet around the board, which stays the hero. A real candidate is listed under Deferred.
- **Board and crop untouched.** `board.js` (`sidePanels`, `cropZone`) is not modified. The panels keep their geometry,
  and the GIF crop is board-only, identical before and after.

## What changed
- `feelink/stage.html`: the left panel restructured into Create (tiles, plus the new `#toolStart` and `#readout`), Edit
  (`#editRow` and the toast) and Present (meter, the Previous/Next pair, Reveal all). The right panel gets the
  `Session` title, which labels the three-line list. Its content is unchanged: link header, Touch, last point spoken,
  felt lines and bars, the folded "Spoken on their phone" history.
- `feelink/stage-tools.js`: a three-way tool state (`draw` / `label` / `start`, as `body[data-tool]` for the cursor)
  replaces the `placing` boolean. It adds the `READOUT` copy, the Start point click (`setStart` on a label, or
  `openName(..., start)` on bare paper), and the toast taking the Edit row's place with focus hand-off. Key handling
  is unchanged in behaviour: L still toggles Label and Draw, D and Escape go to Draw, S is untouched.
- `feelink/stage.css`: group titles, tiles, readout, the in-place toast, the Present meter layout, the Session title,
  44 px buttons, keycap borders, and the reduced-motion list.
- `feelink/stage-session.js`: no change was needed.
- `tools/stage_tools_check.mjs` (new): the runnable CDP check below. It posts its own test route and refuses port 8765.
- `docs/stage-tools-1600.png`, `docs/stage-tools-1920.png`: the stage connected, student Exploring, "Start: Classroom"
  spoken. **The connected state comes from synthetic phone events** posted to the 8766 test relay by a scratch
  simulator (presence, finger along the first leg, the landmark buzz and its spoken report). It is not a real Pixel
  session. Retake on a real session before the deck shows it as one.

## Verification (commands and observed results)
- `bash tools/check.sh` -> `check: ok` (board and tactile tests, relay and metrics selftests, e2e selftest, secret scan).
- Test relay `python -I -u feelink/server.py 8766` from the worktree, and headless Chrome 156 on CDP 9333 with a scratch
  profile. The live relay on 8765 and the Pixel were never touched.
- `node tools/stage_tools_check.mjs 8766` -> **41/41 passed, console errors: none**. It covers:
  - Tool switching: Label, L and L again, D, Escape.
  - Start point: the tile arms it; L switches from it to Label; on Library it moves the start; S over Classroom moves
    it back; S on bare paper does nothing; on bare paper it opens the name box ticked, and "Gym" saves as the start.
  - Labels: a Label click on Library opens rename and Escape cancels it; Label adds Office.
  - Undo button and U, a drag drawing a stroke, Shift lighting the readout key.
  - Present: Previous/Next/Reveal all disabled states; P, the Previous button, the "Everything is hidden" note; N, the
    Next button, Shift+N, the Reveal all button.
  - Clear and its toast: the toast at the Edit row's exact box, toast Undo, C and then U, the toast leaving after 3 s.
  - Focus: Tab from a fresh load reaches Draw first; Enter on Clear moves focus to the toast's Undo and back.
  - The board `view` JSON is identical at the start and the end.
- Tab order from a fresh load (Measured): toolDraw > toolMark > toolStart > undo > clear > revealPrev > revealNext >
  revealAll. The white 2 px focus ring shows on the tiles.
- GIF crop invariant, using compose.py's own `cropdetect=limit=0.25:round=2:reset=0`:
  - 1600x1000: `432:924:584:58` before (main) and after, idle and connected.
  - 1920x1080: `468:1004:726:58`, idle and connected.

  The panels (0-355 and 1245-1600 at 1600 wide) sit outside the zone, as before.
- Smaller window, 1280x720: the panel is 320 px wide, no overflow (the last line ends at 650 of 720 px), no truncated
  labels.
- States checked by eye:
  - Idle "Waiting for the student", grey Session lines.
  - Connected (Exploring and Resting).
  - Reconnecting.
  - Start mode lit with its readout.
  - Hiding, with the dashed line, the bold meter and the note.
  - The toast in place.
  - The keyboard focus ring.
- Evidence images (scratch, `C:\Users\reeve\AppData\Local\Temp\claude\C--Users-reeve\bf59130b-b5d6-4cd1-9174-7a08914519a7\scratchpad\t141\`):
  - `before-1600.png`: main.
  - `final-idle-1600.png`, `final-idle-1920.png`.
  - `states-1600.png`: a review-only composite of Start mode, hiding and the toast, set through evaluate.
  - `focus-start.png`, `small-1280.png`.
- Cleanup: my headless Chrome and the 8766 relay were stopped with PowerShell `Stop-Process`, by command-line match.
  Afterwards only the live 8765 listener (pid 26516) remained.

## Limitations and deferred
- **Not felt on the Pixel and not seen in a real session.** This is a stage-only change; phone, relay and protocol are
  untouched. Reeve's pending re-check is of main, so merge this only after his re-check and `demo-2` tag, or re-check
  again.
- **The docs screenshots use simulated phone events** (see above). The README still shows the old
  `docs/stage-route-lesson.png` and `docs/stage-step-reveal.png` (old 'Landmark' and cue tool). Swapping them is a
  README edit, outside my files.
- **With the one-line test route, Next and Reveal all are disabled** (the true state), so they look dimmed in the docs
  shots. A multi-line lesson mid-reveal shows all three active (`states-1600.png`).
- **The S key on the Start point tile** acts at the pointer, while the tile arms a click. That is by design, given the
  no-shortcut-change rule. If Reeve wants S to arm the tool when the pointer is not over a label, that is a one-line
  change, but it changes a key's behaviour.
- **No hover highlight on labels in Label or Start point mode.** It needs `stage-board.js`, which is not mine.
- **Deferred, needs Reeve's call:** a "Steps" list in Present (Keynote build-order style). It would have one row per
  line in reveal order with a small outline of its shape and its shown/hidden state. It would fill the lower-left with
  real state and make progressive reveal unmistakable in a screenshot. The human-led note warns against panels that
  describe a lesson, so I did not add it.
- The slide GIF crops to the board only, so this panel work shows in screenshots and full-stage captures, not in the
  board GIF.
