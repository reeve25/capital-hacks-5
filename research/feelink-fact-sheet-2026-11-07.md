# FeelInk fact sheet for the 4-minute deck, Sat Nov 7 2026 (issue #46)

Every number or claim a slide might use. One row per claim. Built from main at `cbb11c7` on Nathan's laptop, about 13:20 PT.

**Labels.** **Measured** = from a real Pixel 8 run, or a command run for this sheet. **Read** = read in the cited file, page or paper. **Reasoned** = inference or calculation, nobody measured it.
**Safe?** = whether a slide can say it as written. "yes" means only in the wording given.

Source shorthand: `STATUS` = STATUS.md "Now" section. `PLAN` = `.plans/feelink-demo-plan-2026-11-07.md`. `RIVALS` = `research/feelink-rivals-claude-2026-11-06.md`. `LOG` = team log, issue #1.

## 1. Problem and user

| Claim as a slide could say it | Label | Source | Safe? |
|---|---|---|---|
| At least 2.2 billion people worldwide have a near or distance vision impairment. | Read | WHO fact sheet "Blindness and vision impairment", dated 10 Feb 2026, https://www.who.int/news-room/fact-sheets/detail/blindness-and-visual-impairment | yes, cite WHO. This is all vision impairment, not blindness, so don't call it "2.2 billion blind people". |
| 73,505 US students were registered as legally blind with APH's Federal Quota census. | Read | APH FY2025 Annual Report, p. "Total Students Registered", https://media.aph.org/app/uploads/2026/05/FY2025-Annual-Report.pdf | yes, as "registered with APH". The report gives both "2024 census" and "census of January 2, 2025" near this number, so cite it as the FY2025 report, not a census year. A web snippet also showed 55,382 for the FY2024 report; use only the one read. |
| Share of those students who read braille (5.63% primary). | Read | same report, "Student Percentages by Primary Reading Medium" | **no.** APH says its registration data cannot support statements about literacy or learning media. |
| Teachers already want this: APH sells a teacher-to-tactile-display workflow (Monarch with the Wing It app). | Read (Monarch page) / Snippet (Wing It) | RIVALS "Closest product" | only as "a $15,500 device exists for this"; don't claim Wing It draws live, that was not confirmed. |
| The target user: a blind student and a sighted tutor drawing a shape, graph or diagram in a lesson. | Reasoned | PLAN "Product" | yes, as the user we designed for. No blind user has tried it (see Never claim). |
| A user, teacher or blind student has said they want this. | none | `USERS.md` is empty (header only) | **no**, until something is logged there with consent. |

No other problem statistics are in the repo. The two above are deliberately few.

## 2. Solution and feasibility

| Claim as a slide could say it | Label | Source | Safe? |
|---|---|---|---|
| Tutor draws in a browser; the student feels each stroke through the vibration motor of a phone they already own. | Read (code) | `feelink/server.py`, `feelink/feel.html` live mode, PLAN "Product" | yes, for the live path once #33 step 4 records it working. Today: built, not recorded. |
| No app install: a web page in Chrome on Android. | Read (code) | `feelink/feel.html` (plain HTML, `navigator.vibrate`) | yes |
| Laptop relay is one stdlib-only Python file (137 lines). | Measured (line count) | `feelink/server.py` docstring "Stdlib only"; `wc -l` | yes |
| Hardware cost: $0 beyond a phone and laptop people own. | Reasoned | CLAUDE.md "under $50"; nothing bought for FeelInk | yes, as "runs on a phone you already own". |
| Board is a 56 x 120 mm portrait sheet, same millimetre geometry on phone and laptop. | Read (code) | `feelink/tactile.js` `BOARD = { w: 56, h: 120 }`; `draw.html` maps to mm | yes |
| Phone screen width used for mapping: 64.6 mm. | Reasoned (calculated) | `feel.html` `SCREEN_WIDTH_MM = 64.6` ("6.2 in at 20:9, calculated from the spec, not measured"); 157.48 mm x 9/sqrt(481) = 64.6 mm, rechecked here | only as "calculated". Not measured with a ruler. |
| So the board is drawn at true size on the phone, about 4.3 mm margin each side. | Reasoned | (64.6 - 56) / 2 | yes, if worded "at true scale, by calculation". |
| Works today on Pixel 8 over USB (`adb reverse`); venue Wi-Fi and the Pixel hotspot did not connect phone to laptop. | Measured | STATUS "About 11:55 Sat"; PLAN "Constraints" | yes, as "tested over USB". Cause of the Wi-Fi failure not found. |
| Pixel dropped off USB twice Saturday (about 11:55 and 12:22) and needed `adb reverse` redone. | Measured | STATUS; issue #37 | slide: no (internal); Q&A: yes. |
| Tested devices: one Pixel 8 with Chrome, Reeve's laptop. | Measured | STATUS, PLAN "Claim only devices actually tested" | yes, and no other device. |

## 3. Technical innovation

| Claim as a slide could say it | Label | Source | Safe? |
|---|---|---|---|
| The web Vibration API has no strength control: only on/off durations in ms. | Read | W3C Vibration API editor's draft, `VibratePattern = (unsigned long or sequence<unsigned long>)`, "Use cases requiring more fine-grained control are out of scope", https://w3c.github.io/vibration/ ; MDN `Navigator.vibrate()` | yes |
| So FeelInk fakes strength with pulse rhythm: shorter, sparser pulses feel weaker. | Read (code) / Reasoned (that it feels weaker) | `feel.html` "Haptics" comment, `FADE` | yes for the method. "Feels weaker" is **not until #33 practice step** reports it. |
| Strong core 6 mm wide; fade 6 mm each side in 3 steps of 2 mm. | Read (code), reasoned defaults, not felt | `feel.html` sliders default `fi.core` 6, `fi.fade` 6; `tactile.js` `levelAt`; test "the buzz fades in steps" | only as "default settings". Not tuned by feel yet (#33). |
| Fade pulses (on/off ms), faintest first: 12/60, 20/35, 30/15. | Read (code), reasoned defaults, not felt | `feel.html` `FADE` | as defaults only. |
| On the line: 800 ms buzz, re-armed every 600 ms. | Read (code) | `feel.html` `HOLD_MS = 800`, re-arm at 0.75; issue #34 review notes | yes |
| Corners: 30-40-30 ms double pulse; dead ends: triple 30 ms pulse; fast finger jumping a line: 25 ms tick. | Read (code) | `feel.html` `NODE`, `TICK_MS` | yes, as designed cues. |
| Corners and ends get their own cue because people reading vibrotactile shapes spend most time at vertices. | Read | RIVALS, CHI 2025 vibrotactile exploration model (excerpts) | yes, cite the CHI 2025 paper. |
| Hand-drawn strokes are cleaned (Ramer-Douglas-Peucker, 2 mm) so wobbles don't read as corners; corners at 40 degrees or more over a 5 mm window; circles get no false corners. | Read (code) + Measured (unit tests) | `tactile.js` `simplify`, `buildScene`; `tactile.test.cjs` | yes |
| A finger moving fast enough to jump a line between touch samples still gets a tick (swept-path test). | Read (code) + Measured (unit test) | `tactile.js` `Renderer.move`; test "a fast finger..." | yes, as "handled in code, unit-tested"; not felt. |
| A line drawn under a resting finger is felt without moving. | Read (code) + Measured (unit test) | `Renderer.refresh`; test "a line drawn under a resting finger" | yes, unit-tested only. |
| 10 of 10 tactile logic unit tests pass. | Measured | `node --test feelink/tactile.test.cjs`, run for this sheet, 13:20 Sat | yes, as "unit tests". |
| Found on the real phone: Chrome on Pixel 8 ignores `navigator.vibrate(0)`, the standard stop. | Measured | STATUS "Fixed in 9ebc0b6 and measured"; `feel.html` comment | yes. Strong slide fact. The standard says 0 cancels (MDN; W3C examples). |
| `dumpsys vibrator_manager`: 0 of 132 Chrome vibrations were ever cancelled. | Measured | STATUS | yes |
| A 2 s buzz "stopped" with `vibrate(0)` ran 2091 ms; replacing it with `vibrate(1)` stopped it at 311 ms when called at 300 ms. | Measured | STATUS; LOG 19:53Z ("stops in ~10 ms") | yes: "stop went from 2.1 s late to about 11 ms". |
| Android played every Chrome buzz over 1000 ms at 51% strength and every one of 1000 ms or less at 100%. | Measured | STATUS ("93 vs 94 entries"; settings `media_vibration_intensity=1`, `haptic_feedback_intensity=3`) | yes, as "on this Pixel, with these settings". STATUS does not say which count is which; say "about 90 of each". |
| So every FeelInk buzz is 1 s or less (longest 864 ms) to stay at full strength. | Read (code) / Reasoned (for 864) | `feel.html` comment, `HOLD_MS`; fade-1 pattern 12 x 72 = 864 ms | yes for the design; full strength on the new build is **not until a dumpsys check**. |
| Built by two people in about a day with AI agents. | Read | LOG 05:31Z (FeelInk chosen ~21:35 Fri), PR #31 Sat | yes, with the disclosure slide (CLAUDE.md "Event facts"). |

## 4. Validation and metrics

| Claim as a slide could say it | Label | Source | Safe? |
|---|---|---|---|
| Pixel findings above (vibrate(0) ignored, 2091 vs 311 ms, 51% vs 100%, 0 of 132). | Measured | STATUS | yes. These are the only real-device metrics so far. |
| Kill test warm-up: 10 blind trials 11:41-11:48, 1 right ("open at right", 35 s); two were 0.06 s skips. | Measured, but pre-fix | STATUS "Kill-test results so far"; LOG 20:05Z | **no as a result.** All ran with the lingering-buzz bug. Q&A only, as "warm-up before the stop fix". `results.jsonl` is on Reeve's laptop, not checked here. |
| Blind test design: 5 shapes per run, drawn 46 mm across, 4 of 7 closed shapes plus 1 open square with a random open side; time from first touch; right/wrong logged with core and fade. | Read (code) | `feel.html` `startTest`, `mark`; `tactile.js` `SHAPES` | yes, as method. |
| Research benchmark: blind participants identified letters on a vibrating 7-inch tablet without error (3 people), sighted about 89%, against 100% for hardcopy braille; learning was slower than hardcopy. | Read | RIVALS, Giudice et al., ASSETS 2012 | yes, cite it as prior research, not ours. Small n (3). |
| Minimum detectable line 1 mm; 4 mm gap between parallel lines (46 blind or VI participants). | Snippet | RIVALS, Palani et al. 2018 | only as "reported"; source not read in full. |
| Shape identification above 78% (pentagon 47%), phones comparable and quicker. | Snippet | RIVALS, Gorlewicz et al. slides | only as "reported". |
| Strongest evidence against: a vibration-only smartphone study (32 blindfolded students) found little information transmitted, especially for shapes. | Snippet | RIVALS, Ergonomics study | Q&A prep, as "reported". |
| A ring on the stage view = the phone **asked** Chrome for a buzz. | Reasoned | issue #34 ("Refused calls", `ok` value) | caption must say "phone requested a buzz", not "motor ran", until #34 matching. |

## 5. Impact

| Claim as a slide could say it | Label | Source | Safe? |
|---|---|---|---|
| Closest product: APH Monarch, $15,500, a 10-line by 32-cell refreshable display with 3,840 pins. | Read | https://www.aph.org/product/monarch/ (fetched 13:20 Sat, catalog 1-00420-00). RIVALS had it as Snippet; now read. | yes |
| Other sellers $17,995; a $12,900 promotion. | Snippet | RIVALS | only as "reported", or leave out. |
| FeelInk is far lower fidelity than a Monarch: one fingertip, no raised dots, no braille. | Reasoned | RIVALS | yes. Say it before a judge does. |
| Live co-drawing to an ordinary phone looks open at hackathons. | Tagline / Snippet | RIVALS "Hackathons" | only as "we found no hackathon project doing this"; absence from a scan isn't proof. |
| Works on Android Chrome; not on iPhone. | Read | caniuse "Vibration API": Safari on iOS 3.2-27.2 not supported, https://caniuse.com/vibration ; W3C draft: WebKit opposes, Firefox removed it in 129 | yes, as a stated limit. |
| Roadmap: webcam whiteboard, draw-it-back, touch-to-hear. | Planned | PLAN "Product" | roadmap slide only, labelled future. |

## Honest limits (for the deck or Q&A)
- **No amplitude control** in the web API (W3C draft, MDN). Strength is rhythm only. Read.
- **No iPhone.** iOS Safari has never supported `navigator.vibrate` (caniuse); `feel.html` warns "iPhone Safari has no vibration API". Read.
- **A ring is a request, not proof the motor ran.** `vibrate()` returns a boolean; MDN says it returns false only for invalid parameters, and it needs sticky user activation. Whether Chrome returns false when it blocks a call is unchecked (#34). Proof is a match against `dumpsys vibrator_manager` (#34). Read / Reasoned.
- **Android settings change strength.** Over 1 s plays at media intensity (51% here), so another phone or setting can feel different. Measured on one Pixel.
- **Pattern length.** FADE patterns have 24 entries. The W3C editor's draft truncates patterns to 10 entries; Chromium's Blink source caps at 99 (`kVibrationPatternLengthMax`, read via search snippet of `NavigatorVibration.cpp`, 2015-era code). If Chrome followed the draft, fade pulses would stop after 5 on/off pairs and leave gaps before the re-arm. Reasoned risk; check pattern lengths in `dumpsys` once.
- **USB only** at the venue; no Wi-Fi path found. Measured.
- **One phone, one laptop, no blind user yet.** Read (STATUS, `USERS.md`).

## Never claim
- Webcam whiteboard, draw-it-back, touch-to-hear working (not built).
- Any user, teacher or blind student validation, quote or name not logged in `USERS.md` with consent (it is empty).
- The 1/10 warm-up as a recognition rate, or any recognition rate before #33's blind run.
- That fade steps feel different, or that defaults are tuned (not felt yet, #33).
- That a ring means the motor vibrated (until #34 matching).
- Anything only mock-tested: the emulated Pixel run, a second browser tab on Nathan's laptop, laptop-estimated rings.
- Latency numbers (none measured).
- Works on iPhone, Wi-Fi, or any device besides the Pixel 8.
- "2.2 billion blind people", or braille literacy figures from APH registration data.
- Live strokes reaching a Monarch-class experience, or clinical or educational benefit.

## Pending, fill after the session
| Number | Comes from | Value |
|---|---|---|
| Tuned core and fade, and who felt each change | #33 step 1 | |
| Pass bar for the blind run, set before it | #33 step 2 (Reeve and Nathan) | |
| Blind 5-shape run: right of 5, median seconds, per shape, core/fade, initials | #33 step 3, `results.jsonl` | |
| Stroke drawn to first feel on the phone (live step) | #33 step 4 | |
| Reported vibrations vs `dumpsys` entries: matched / unmatched | #34 | |
| Phone event post rate and latency (laptop receive clock) | #34 | |
| Tutor-to-phone and phone-to-laptop latency; mm mapping error of injected swipes | #37 | |
| Full strength confirmed on the 800 ms build (dumpsys intensity) | #33/#34 session | |
| Pattern length Chrome actually plays (24 entries or truncated) | one `dumpsys` read | |
| Who appears in footage, and their consent | Reeve and Nathan | |

## Conflicts between STATUS.md and code
- STATUS "Fixed in 9ebc0b6" line says lines use a "2 s hold" at half strength and "shortening the hold to 1 s or less is offered, not done". Code on main has `HOLD_MS = 800`, and STATUS's own "Haptics state" line says all buzzes are 1 s or less. The 2 s line is stale; code wins.
- `tactile.js` `Renderer` defaults are a 9 mm core (`halfWidth 4.5`) and no fade; `feel.html` overrides them with slider defaults 6 mm and 6 mm. The page values are what run, but the Pixel keeps slider values in `localStorage`, so the felt values are whatever each trial row logs (`widthMm`, `fadeMm`), not necessarily 6/6.
- PLAN table says the gradient is "being felt and tuned (Reeve, #33)"; STATUS says not yet felt. No felt result is recorded anywhere, so treat it as not felt.
- STATUS "93 vs 94 entries" does not say which group is which. Not a code conflict, but don't put either number on a slide.
- LOG says `vibrate(1)` "stops in ~10 ms"; STATUS gives 311 ms when called at 300 ms. Consistent (about 11 ms).

## Codex check: not run yet (Codex is on Reeve's laptop)

Ready-to-paste prompt, read-only:

```
Read-only review. Do not edit, create or delete any file, and do not run git write commands.
Check research/feelink-fact-sheet-2026-11-07.md in reeve25/capital-hacks-5 (main) against its sources.
For every table row: open the cited source (STATUS.md, .plans/feelink-demo-plan-2026-11-07.md,
research/feelink-rivals-claude-2026-11-06.md, feelink/feel.html, feelink/tactile.js,
feelink/tactile.test.cjs, feelink/server.py, USERS.md, GitHub issues #1 #33 #34 #37 via
`gh issue view N --comments`, and the URLs given) and report:
1. Any number that does not match its source exactly, or has no source.
2. Any label that is wrong (Measured / Read / Reasoned / Snippet), especially anything marked
   Measured that was not from a real Pixel run or a command.
3. Any "Safe?" verdict that is too generous for CLAUDE.md "Evidence" and the consent rules.
4. Any claim the deck might need that is missing, and any STATUS.md vs code conflict not listed.
5. Recompute: 64.6 mm from a 6.2 in 20:9 screen; FADE pattern totals 864/660/540 ms and
   re-arm times 648/495/405 ms; HOLD_MS re-arm 600 ms.
6. Verify the honest limits online: W3C Vibration API has no intensity parameter and its draft
   max pattern length; Chromium's kVibrationPatternLengthMax today; iOS Safari support (caniuse/MDN);
   APH Monarch price on aph.org; WHO 2.2 billion figure; APH 73,505 registered students.
Output a list of findings, each with row, problem, evidence (file:line or URL) and suggested fix.
```
