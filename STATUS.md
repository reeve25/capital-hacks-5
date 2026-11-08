# Capital Hacks 5.0 status

One screen, current state only; replace lines, never append. Updated at milestones (tag, newly working interaction, blocker). History: `research/status-history-2026-11-06-07.md`. Decisions: `DECISIONS.md`.

## Snapshot (Sat Nov 7, 21:45 PT)
- **Product:** FeelInk. A sighted tutor draws on the laptop stage (`/stage`); a blind student feels the drawing as vibration on an ordinary Android phone (`/feel`) and hears label names and the tutor's spoken instructions. Human-led, in-person. Pitch Sunday: 4-minute slides, no live demo, recorded takes (plan `.plans/feelink-demo-plan-2026-11-07.md`; its process notes are superseded by CLAUDE.md).
- **Build:** FeelInk code on main is `66d9ef2` (felt-share wording) on top of `bbec5eb` (grouped tutor tools #145, label fix #148, Coordinate plane preset #147). Known-good: **tag `demo-2` = `54e8d50`**; `demo-1` = `c64269c`.
- **Lead:** Fable session `reeve-41` on Reeve's laptop. It owns `feelink/`, the relay, the keepalive and the Pixel.
- **Services (main checkout, logs in `.tmp/`):** relay `python -I -u feelink/server.py` pid 56416 (log `relay-20341107.log`), keepalive `tools/pixel_keepalive.py` pid 58376. Before any test, `netstat -ano | findstr :8765` shows one PID. Kill with PowerShell `Stop-Process -Id <pid> -Force`; `taskkill` from Git Bash never kills. Reload the Pixel tab: `adb forward tcp:9222 localabstract:chrome_devtools_remote`, then `node tools/pixel_tab.mjs location.href reload`.

## Can demonstrate
- Tutor draws on the stage, the student feels it on the Pixel and hears labels: `demo-2`, Reeve's real-Pixel re-check passed 20:33.

## Tested
- Real Pixel (Nathan's Pixel 8, USB `adb reverse`): `demo-2` re-check passed 20:33 (Reeve); `demo-1` A5 pass 17:59 ("worked, decent, looks incomplete").
- Blind run 1 (Reeve, eyes closed, old build): 4 of 5 shapes, median 49.9 s. The one prototype result.
- Measured on the Pixel: Chrome ignores `vibrate(0)`, `vibrate(1)` stops; buzzes capped at 1000 ms.
- Desktop only, no Pixel: the felt row (`66d9ef2`) shows the mean felt share, checked in the running stage over headless Chrome against a test relay, 41 of 41 stage steps pass, screenshot checked 21:12. README stage screenshots came from a scripted test relay.

## Broken or unverified
- Pixel off USB since 21:17:11 (adb and Windows both lost it); it drops a few times an hour, cause unknown, and `tools/usb_watch.ps1` (b1346dc) should log the next drop (unverified: its first version missed the 21:17 drop). The Coordinate plane real-device check and the recording wait on it.
- TalkBack compatibility: untested. Educational effectiveness: unverified, a testable hypothesis. Same-network (non-USB) deployment: not demonstrated.
- Outside feedback: substantive critical feedback from Ricardo (ACB Students, email reply to outreach) and public Reddit respondents (Reeve, 21:20). It is critique, not validation; no user trial is logged in `USERS.md`.

## Next
1. Pixel back on USB, then the real-Pixel Coordinate plane check (axis bumps, "Start: Origin", a plotted label spoken); tag `demo-3` if it passes. Needs the Pixel.
2. Reeve and Nathan record takes (`tools/record/README.md`, compose `tools/record/compose.py`). Needs the Pixel.
3. Nathan: deck, organizer questions, fact sheet. Doesn't need the Pixel.

## Open
- Reeve's 19:56 message was cut off after "We want to demonstrate that user"; the rest is still wanted.
- What still looks incomplete to Reeve since his 17:59 note: the Studio pass (18:10) and the tools pass (19:43) answered it, and he hasn't been re-asked.
- Nathan's open issues #44 (stage view v1) and #45 (recording pipeline) look superseded or done; his call to close.
