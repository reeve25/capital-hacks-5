# Capital Hacks 5.0 status

One screen, current state only; replace lines, never append. Updated at milestones (tag, newly working interaction, blocker). History: `research/status-history-2026-11-06-07.md`. Decisions: `DECISIONS.md`.

## Snapshot (Sun Nov 8, 01:00 PT)
- **Product:** FeelInk. A sighted tutor draws on the laptop stage (`/stage`); a blind student feels the drawing as vibration on an ordinary Android phone (`/feel`) and hears label names and the tutor's spoken instructions. Human-led, in-person. Pitch Sunday: 4-minute slides, no live demo, recorded takes (plan `.plans/feelink-demo-plan-2026-11-07.md`; its process notes are superseded by CLAUDE.md).
- **Build:** FeelInk code on main is `f0901b1` (a tutor change the relay did not take is announced and the board reloads; edits pause while the relay is out of reach) on `34b9df7` (session row says "Covered about N%", not "Felt"; phone no longer claims "Most students do best" at 4 mm), on `d0cb719` (guide setting drawn as a switch, "Find the line again" help) on `c692a80` (label names drawn over the finger, "Drawing updated" caption on the stage) and `dc98e4a` (guide-back taps); before those `66d9ef2` and `bbec5eb` (grouped tutor tools, label fix, Coordinate plane). Known-good: **tag `demo-2` = `54e8d50`**; `demo-1` = `c64269c`.
- **Lead:** one Fable session on Reeve's laptop; handoff in `.tmp/lead-handoff.md`. Mission (Reeve, late Sat): product and demonstration assets only; the deck is assembled separately. It owns `feelink/`, the relay, the keepalive and the Pixel.
- **Services (main checkout, logs in `.tmp/`):** relay `python -I -u feelink/server.py` pid 56416 (log `relay-20341107.log`), keepalive `tools/pixel_keepalive.py` pid 58376. Before any test, `netstat -ano | findstr :8765` shows one PID. Kill with PowerShell `Stop-Process -Id <pid> -Force`; `taskkill` from Git Bash never kills. Reload the Pixel tab: `adb forward tcp:9222 localabstract:chrome_devtools_remote`, then `node tools/pixel_tab.mjs location.href reload`.

## Can demonstrate
- Tutor draws on the stage, the student feels it on the Pixel and hears labels: `demo-2`, Reeve's real-Pixel re-check passed 20:33.

## Tested
- Real Pixel (Nathan's Pixel 8, USB `adb reverse`): `demo-2` re-check passed 20:33 (Reeve); `demo-1` A5 pass 17:59 ("worked, decent, looks incomplete").
- Blind run 1 (Reeve, eyes closed, old build): 4 of 5 shapes, median 49.9 s. The one prototype result.
- Measured on the Pixel: Chrome ignores `vibrate(0)`, `vibrate(1)` stops; buzzes capped at 1000 ms.
- Desktop only, no Pixel (00:55 Sun): a failed tutor post shows "Not sent to the phone" and a notice over the board, then the relay's state is reloaded; relay unreachable shows "Studio offline" over the board with tools inert and keys ignored. `node tools/stage_tools_check.mjs` 49 of 49 in headless Chrome, both notices screenshot-checked. The exported takes in `recordings/out/` predate this and `34b9df7` (they still show "Felt about 68%"); re-export before use.
- Desktop only, no Pixel: "Guide back to the line" (`dc98e4a`): off the ink the phone taps every 250-900 ms, quicker nearer the nearest stroke, silent past 20 mm, Advanced-settings toggle, faint stage ring per tap. 37 tactile unit tests; `node tools/feel_guide_check.mjs` 19 of 19 in headless Chrome against a test relay (about 20 s). Not felt on the Pixel; whether a 15 ms tap is felt at all is the open question.
- Desktop simulation, no Pixel: the route lesson (finger guided onto the line, "Start: Classroom", Next and "Drawing updated", "Office", the tutor draws and labels the last leg live, "Library") plays end to end against a test relay in headless Chrome with stubbed vibrate and speech: `node tools/record/sim_take.mjs`, 23:49, 30.6 s take. Assets in `recordings/out/` (git-ignored), every one tagged "Desktop simulation" in the picture: `sim-route-lesson.mp4/.gif` (board + emulated phone, GIF 3.1 MB), `sim-route-lesson-stage.mp4/.gif` (whole stage window), seven stills `sim-route-lesson-*still*.png`. Recording selftest ok; stage_tools_check 41 of 41.
- Desktop only, no Pixel: the felt row (`66d9ef2`) shows the mean felt share, checked in the running stage over headless Chrome against a test relay, 41 of 41 stage steps pass, screenshot checked 21:12. README stage screenshots came from a scripted test relay.

## Broken or unverified
- Pixel off USB since 21:17:11 (adb and Windows both lost it); it drops a few times an hour, cause unknown, and `tools/usb_watch.ps1` (b1346dc) should log the next drop (unverified: its first version missed the 21:17 drop). The Coordinate plane real-device check and the recording wait on it.
- TalkBack compatibility: untested. Educational effectiveness: unverified, a testable hypothesis. Same-network (non-USB) deployment: not demonstrated.
- Outside feedback: one critical email reply logged anonymously in `USERS.md` (critique, not validation; no user trial). The r/AskABlindPerson replies could not be fetched automatically (reddit.com 403, old.reddit 404, mirror 502); Reeve pastes them.

## Next
1. Product-first: the route-lesson desktop simulation is exported (`tools/record/sim_take.mjs`, section 8 of `tools/record/README.md`). Next: keep polishing from what the take shows; a Coordinate plane take only if it earns a slide.
2. When the Pixel is back on USB: one focused device check (demo-2 flow, Coordinate plane, guide cue: steps in the `dc98e4a` commit's agent report, summarised in README), tag `demo-3` if it passes, then the real takes.
3. Deck: Reeve and Nathan, separately; outline `.plans/feelink-deck-2026-11-07.md`, Google Slides "FeelInk Presentation" in Reeve's Drive.

## Open
- Reeve's 19:56 message was cut off after "We want to demonstrate that user"; the rest is still wanted.
- What still looks incomplete to Reeve since his 17:59 note: the Studio pass (18:10) and the tools pass (19:43) answered it, and he hasn't been re-asked.
- Nathan's open issues #44 (stage view v1) and #45 (recording pipeline) look superseded or done; his call to close.
