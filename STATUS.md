# Capital Hacks 5.0 status

One screen, current state only, kept by the lead session; replace lines, never append. Updated at milestones (tag, merged feature, blocker, decision), not after every action. History verbatim: `research/status-history-2026-11-06-07.md`. Decisions: `DECISIONS.md`.

## Snapshot (Sat Nov 7, 21:05 PT)
- **Product:** FeelInk. A sighted tutor draws on the laptop stage (`/stage`); a blind student feels the drawing as vibration on an ordinary Android phone (`/feel`) and hears label names and the tutor's spoken instructions. Human-led, in-person; freehand drawing is the core, presets (route, coordinate plane) are reusable primitives. Pitch Sunday: 4-minute slides, no live demo, recorded takes (plan `.plans/feelink-demo-plan-2026-11-07.md`).
- **Build:** origin/main `7dc5b95` (code `bbec5eb`: grouped tutor tools #145, label fix #148, Coordinate plane preset #147). **Tag `demo-2` = `54e8d50`**, Reeve's Pixel re-check passed 20:33. `demo-1` = `c64269c` (A5 pass 17:59: "worked, decent, looks incomplete").
- **Services (main checkout, logs in `.tmp/`):** one relay `python -I -u feelink/server.py` (pid 56416, on `81bd770`+, log `relay-20341107.log`); keepalive `tools/pixel_keepalive.py` pid 58376. Before any test: `netstat -ano | findstr :8765` shows one PID. Kill with PowerShell `Stop-Process -Id <pid> -Force`; `taskkill` from Git Bash never kills.
- **Pixel (Nathan's, USB only via `adb reverse`; Wi-Fi paths failed):** absent from adb and from Windows USB since 20:53:28, cause unknown; a few drops per hour all day, 115 in 20:45-20:53 while the cable was handled. `/feel` was reloaded on main at 20:45 (`node tools/pixel_tab.mjs location.href reload`, needs `adb forward tcp:9222 localabstract:chrome_devtools_remote`). Reeve reloads his own stage tab.
- **Limits (Measured):** Chrome on the Pixel ignores `vibrate(0)`, `vibrate(1)` is the stop; buzzes capped at 1000 ms. TalkBack unverified, never claim it. Ordinary same-network deployment not demonstrated.
- **Evidence rules:** no target-user feedback yet (`USERS.md` empty, 38 outreach emails, no reply); educational benefit is a "testable hypothesis", never "shown"; blind run 1 (Reeve, eyes closed, 4 of 5 shapes, median 49.9 s, old build) is the one prototype result. No further test bookkeeping (Reeve, 17:59).
- **Process (Reeve, 21:00):** 56 of today's 94 commits were docs. Status and team log at milestones only; small fixes go straight in from the lead; no new `.plans/` or `research/` files before Sunday unless they change a slide. One lead session, no agents running.

## Next, in order
1. Pixel back on adb and stable: reload `/feel` and the stage, then the 2-minute Coordinate plane feel (axis bumps, "Start: Origin", a plotted label spoken).
2. "Felt 0 of 1 line in full" wording in the session panel (`feelink/board.js` feltLine): Reeve to pick; lean is to say the felt share. Ship as a fix.
3. Reeve and Nathan record takes on `demo-2` (`tools/record/README.md`, compose `tools/record/compose.py`).
4. Nathan: deck, organizer questions, fact sheet (off the agents' board).

## Open
- D10 in `DECISIONS.md`: what still looks incomplete to Reeve. Reeve's 19:56 message was cut off after "We want to demonstrate that user".
- CI: say green only after seeing it pass. Hardware and physical projects are out; old ideation files carry a superseded banner.
