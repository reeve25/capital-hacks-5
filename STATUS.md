# Capital Hacks 5.0 status

One screen, current state only; replace lines, never append. Updated at milestones (tag, newly working interaction, blocker, decision). History: `research/status-history-2026-11-06-07.md`. Decisions: `DECISIONS.md`.

## Snapshot (Sat Nov 7, 21:15 PT)
- **Product:** FeelInk. A sighted tutor draws on the laptop stage (`/stage`); a blind student feels the drawing as vibration on an ordinary Android phone (`/feel`) and hears label names and the tutor's spoken instructions. Human-led, in-person. Pitch Sunday: 4-minute slides, no live demo, recorded takes (plan `.plans/feelink-demo-plan-2026-11-07.md`).
- **Build:** origin/main code `66d9ef2` (felt-share wording) on top of `bbec5eb` (grouped tutor tools #145, label fix #148, Coordinate plane preset #147). Known-good: **tag `demo-2` = `54e8d50`**; `demo-1` = `c64269c`.
- **Services (main checkout, logs in `.tmp/`):** relay `python -I -u feelink/server.py` pid 56416 (log `relay-20341107.log`), keepalive `tools/pixel_keepalive.py` pid 58376. Before any test, `netstat -ano | findstr :8765` shows one PID. Kill with PowerShell `Stop-Process -Id <pid> -Force`; `taskkill` from Git Bash never kills. Reload the Pixel tab: `adb forward tcp:9222 localabstract:chrome_devtools_remote`, then `node tools/pixel_tab.mjs location.href reload`.

## Can demonstrate
- Tutor draws on the stage, the student feels it on the Pixel and hears labels: `demo-2`, Reeve's real-Pixel re-check passed 20:33.

## Tested
- Real Pixel (Nathan's Pixel 8, USB `adb reverse`): `demo-2` re-check passed 20:33 (Reeve); `demo-1` A5 pass 17:59 ("worked, decent, looks incomplete").
- Blind run 1 (Reeve, eyes closed, old build): 4 of 5 shapes, median 49.9 s. The one prototype result.
- Measured on the Pixel: Chrome ignores `vibrate(0)`, `vibrate(1)` stops; buzzes capped at 1000 ms.
- Desktop only, no Pixel: README stage screenshots (grouped stage, step reveal, coordinate plane) on a scripted test relay.

## Broken or unverified
- Coordinate plane preset and the felt-share wording: on main, not yet seen on the Pixel.
- Pixel USB drops a few times an hour (115 at 20:45-20:53 while the cable was handled), cause unknown; back on adb at 21:13. `adb reverse` is lost on every reconnect.
- TalkBack untested, never claim it. Same-network (non-USB) deployment not demonstrated.
- No target-user feedback (`USERS.md` empty, 38 outreach emails, no reply); educational benefit is a testable hypothesis, never "shown".

## Next
1. Real-Pixel Coordinate plane check (axis bumps, "Start: Origin", a plotted label spoken); tag `demo-3` if it passes.
2. Reeve and Nathan record takes (`tools/record/README.md`, compose `tools/record/compose.py`).
3. Nathan: deck, organizer questions, fact sheet (his lane).

## Open
- D10 in `DECISIONS.md`: what still looks incomplete to Reeve. His 19:56 message was cut off after "We want to demonstrate that user".
