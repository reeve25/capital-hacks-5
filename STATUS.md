# Capital Hacks 5.0 status

One screen, current state only; replace lines, never append. Updated at milestones (tag, newly working interaction, blocker). History: `research/status-history-2026-11-06-07.md`. Decisions: `DECISIONS.md`.

## Snapshot (Sun Nov 8, 02:35 PT)
- **Product:** FeelInk. A sighted tutor draws on the laptop stage (`/stage`); a blind student feels the drawing as vibration on an ordinary Android phone (`/feel`) and hears label names and the tutor's spoken instructions. Human-led, in-person. Pitch Sunday: 4-minute slides, no live demo, recorded takes (plan `.plans/feelink-demo-plan-2026-11-07.md`; its process notes are superseded by CLAUDE.md).
- **Build:** main is `34c3de4`, the Nov 8 overnight cycle on top of `58c6810`: a click in Draw leaves no line (`72bc799`); the phone says what changed ("Line added.", "Label added.", "Line and label added.", "Line removed.", "Drawing cleared.") and claims only what it knows (`02ba020`); stage composed for the footage and for the tutor (finger 8.6 mm, one thin ring at a time, fixed caption slot, quiet in-board legend, session panel at working size, "Student's touch surface" label: `f57300e`, `6193aa7`, `34c3de4`); annotated story take pipeline (`399079a`, `a5443dd`). Known-good: **tag `demo-2` = `54e8d50`** (older UI); `demo-1` = `c64269c`. No `demo-3` until a Pixel pass.
- **Lead:** one Fable session on Reeve's laptop; handoff in `.tmp/lead-handoff.md`. It owns `feelink/`, the relay, the keepalive and the Pixel.
- **Services (main checkout, logs in `.tmp/`):** relay `python -I -u feelink/server.py` pid 56416 (log `relay-20341107.log`), keepalive `tools/pixel_keepalive.py` pid 58376; both under `nohup`, so closing a Claude session does not kill them. Before any test, `netstat -ano | findstr :8765` shows one PID. Kill with PowerShell `Stop-Process -Id <pid> -Force`; `taskkill` from Git Bash never kills. Reload the Pixel tab: `adb forward tcp:9222 localabstract:chrome_devtools_remote`, then `node tools/pixel_tab.mjs location.href reload`. Scratch tests: relay on 8766 plus headless Chrome on 9333 behind the mkdir lock `.tmp/chrome.lock` (one Chrome at a time; RAM ~4 GB free after closing Chrome, Discord, Codex app and idle sessions).

## Can demonstrate
- Tutor draws on the stage, the student feels it on the Pixel and hears labels: `demo-2`, Reeve's real-Pixel re-check passed Sat 20:33. The `34c3de4` UI has not been on the Pixel.

## Tested
- Real Pixel (Nathan's Pixel 8, USB `adb reverse`): `demo-2` re-check passed Sat 20:33 (Reeve); `demo-1` A5 pass 17:59 ("worked, decent, looks incomplete").
- Blind run 1 (Reeve, eyes closed, old build): 4 of 5 shapes, median 49.9 s. The one prototype result.
- Measured on the Pixel: Chrome ignores `vibrate(0)`, `vibrate(1)` stops; buzzes capped at 1000 ms.
- Desktop only, no Pixel (Sun 02:20, main `34c3de4`): `node tools/stage_tools_check.mjs` 61 of 61 in headless Chrome against a scratch relay, no console errors (steps cover click-in-Draw, the change lines, "Drawing cleared.", home screen not counted as presence, the unsent and offline notices); `node tools/feel_guide_check.mjs` 19 of 19 (wording agent, `02ba020` tree); 92 unit tests; `tools/check.sh` ok on every push. The reviewer's "Student connected before Connect" did not reproduce: nothing sends `hello`, the home screen sends `live:false`.
- Desktop simulation, no Pixel (Sun 02:25, `34c3de4`): `node tools/record/sim_take.mjs` exit 0, the phone said Start: Classroom, Line and label added, Office, Line added, Label added, Library. Assets in `recordings/out/` (git-ignored), every panel and still carrying its own role header and "DESKTOP SIMULATION" tag that survives a crop: `sim-route-lesson.mp4` (1.57 MB) / `.gif` (3.09 MB, 1280 wide): board, caption column (cause then effect, finger marked scripted, guide taps marked untested), live inset of the control in use, key, phone in a frame with "Spoken (emulated)"; `sim-route-lesson-stage.mp4/.gif` (whole stage); stills `-still-0-establishing` (annotated workspace), `-1-start` to `-5-library`, `-6-session-panel` (2x). Older exports with "Felt" are gone.
- Stage composition reviewed by Reeve's outside advisor on live screenshots (Sun ~02:00): approved after the composition pass, with the ring adjustment now in `34c3de4`. Review notes and critic audit: `.tmp/critic-2026-11-08.md`, `.tmp/review-xhigh-2026-11-08.md`.
- Desktop only, no Pixel: "Guide back to the line" (`dc98e4a`): off the ink the phone taps every 250-900 ms, quicker nearer the nearest stroke, silent past 20 mm. Whether a 15 ms tap is felt at all is open; the take captions it as untested.

## Broken or unverified
- Pixel off USB since Sat 21:17:11; it drops a few times an hour, cause unknown (`tools/usb_watch.ps1` should log the next drop, unverified). Everything since `demo-2` is desktop simulation: the new spoken lines over real speech/TalkBack, the wake lock on entering Live (`02ba020`, guarded, unverified), whether rings line up with felt buzzes, the Coordinate plane, and the recording of real footage all wait on it.
- TalkBack compatibility: untested. Educational effectiveness: unverified. Same-network (non-USB) deployment: not demonstrated.
- Outside feedback: one critical email reply logged anonymously in `USERS.md` (critique, not validation; no user trial). The r/AskABlindPerson replies could not be fetched automatically; Reeve pastes them.
- Minor, known: `docs/stage-step-reveal.png` and README lines 30-31 still describe the old "Drawing updated." history; the session list shifts ~38 px when the helper line shows; the in-board legend is ~7.5 px in a 960 GIF (explain colours in narration or the close-up, not by enlarging it).

## Next
1. Deck: use the `recordings/out/` assets from `34c3de4`: establishing still briefly, then the composite for the student interaction, the stage cut or `-still-4-tutor-draws` for the tutor's live addition, `-still-6-session-panel` for the tutor's view. Explain teal/grey/dashed in narration.
2. When the Pixel is back on USB: one focused device check of `34c3de4` (demo-2 flow, new spoken lines, wake lock, Coordinate plane, guide cue), tag `demo-3` if it passes, then real takes via `tools/record/README.md` sections 1-7.
3. Deck: Reeve and Nathan, separately; outline `.plans/feelink-deck-2026-11-07.md`, Google Slides "FeelInk Presentation" in Reeve's Drive.

## Open
- Reeve's Sat 19:56 message was cut off after "We want to demonstrate that user"; the rest is still wanted.
- Nathan's open issues #44 (stage view v1) and #45 (recording pipeline) look superseded or done; his call to close.
