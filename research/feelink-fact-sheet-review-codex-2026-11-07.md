# Codex check of the FeelInk fact sheet, Sat Nov 7 2026, about 14:15 PT

Different-vendor review (Codex CLI, gpt-6.1-sol, read-only sandbox) of `research/feelink-fact-sheet-2026-11-07.md` against main `4e0068d`, run on Reeve's laptop with the prompt from the sheet's last section plus a note about PR #54. Codex's final answer is below, unedited. Its URL checks are its own: spot-check before quoting any number. The fact sheet is Nathan's file; apply fixes there.

Reviewed local and GitHub `main` at **`4e0068d`**, including PR #54 (`fe7ab64`). **The sheet needs corrections before deck use.** No files were changed, created, or deleted; no git write commands were run.

All four requested `gh issue view N --comments` calls failed because shell network access was blocked. I read issues **#1, #33, #34, and #37**, including their comments, through the GitHub connector instead.

Row references below are line numbers in [the fact sheet](C:/Users/reeve/dev/capital-hacks-5/research/feelink-fact-sheet-2026-11-07.md).

1. **L46, L57, pending L115, conflict L120 — obsolete hold duration and design explanation.** Current code requests **5,000 ms**, re-armed at **4,500 ms**. “Every buzz is ≤1 s,” “longest 864 ms,” and the pending 800 ms strength check are obsolete.  
   **Evidence:** `feelink/feel.html:71–92`; `STATUS.md:9,13`.  
   **Fix:** State the current timings as **Read/code**. Separately record the measured platform scale and Reeve’s steady-hum report. Keep the **4.5 s re-arm’s perceptual behavior untested**.

2. **L43–45, prohibition L97, pending L108, conflict L122 — “not felt/not tuned” is stale.** Reeve reported distinct, noticeable fade steps, a stronger line, and no buzz after lift at **core 6 / fade 6**. The pulse values did not change. Nathan’s participation in feeling them is unrecorded.  
   **Evidence:** `STATUS.md:9`; [team-log tuning report](https://github.com/reeve25/capital-hacks-5/issues/1#issuecomment-6713341908).  
   **Fix:** Retain **Read** for code values; add a separately labelled **real-device subjective report from Reeve**. Do not turn it into measured discrimination accuracy or attribute it to Nathan.

3. **L56 and honest limit L88 — historical strength settings are presented too much like current settings.** The morning result used **Media=1, Touch=3**. Current Media is **3**, and the 5 s holds were reported at `scale NONE (1.00)`. “51% here” is stale.  
   **Evidence:** `STATUS.md:9,13`.  
   **Fix:** Timestamp both configurations. Say **platform-reported scale 0.51/1.00**, rather than implying measured motor acceleration, calibrated amplitude, or perceived strength. The 93/94 group assignment remains unknown; omit the counts or preserve that uncertainty.

4. **L64 — “only real-device metrics so far” is stale.** Additional recorded observations include 5 s holds at scale 1.00, approximately 600 ms cancel/restart behavior on the old hold, nine fade on-steps, and roughly 5 ms extra per on/off cycle.  
   **Evidence:** `STATUS.md:9,13`.  
   **Fix:** Update the inventory, keeping instrument observations separate from subjective reports.

5. **Honest limit L89 and pending L116 — the truncation concern has already been partly settled.** Current Chromium still sets `kVibrationPatternLengthMax = 99`; the W3C editor’s draft specifies **10 entries**. The Pixel’s **at least nine on-steps** rule out truncation to five on-steps in that run. They do **not** prove uninterrupted completion of all 24 entries.  
   **Evidence:** `STATUS.md:13`; [current Chromium source](https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/renderer/modules/vibration/vibration_controller.cc); [W3C draft](https://w3c.github.io/vibration/).  
   **Fix:** Replace the old snippet and pending binary question with those three distinct facts.

6. **Pending L112 — matching requests directly to platform-vibration counts would be wrong.** Chromium submits individual on-steps separately; one FADE request can produce multiple `dumpsys` entries.  
   **Evidence:** [#34 decision and measured pattern behavior](https://github.com/reeve25/capital-hacks-5/issues/34#issuecomment-6713341360); Chromium source above.  
   **Fix:** Match expanded on-steps, accounting for superseding requests and re-arms. Do not expect one request to equal one platform entry.

7. **L35 — two USB disconnects is stale.** STATUS records **three**: approximately 11:55, 12:22, and just before 13:30.  
   **Evidence:** `STATUS.md:12`.  
   **Fix:** “At least three recorded disconnects by 13:30; mappings restored after reconnect.”

8. **L29 — 137 lines is stale.** Current `server.py` has **139 newline-terminated lines**. Stdlib-only remains correct.  
   **Evidence:** `feelink/server.py:17–24,139`; fresh file count.  
   **Fix:** Remove the fragile size claim, or say “139 lines at `4e0068d`.” A fresh command count legitimately qualifies as **Measured**.

9. **L55 — “2.1 s late” confuses total duration with stopping delay.** **2,091 ms** is total vibration duration. **311−300=11 ms** is the new overshoot. The cited STATUS sentence does not explicitly establish the old stop request’s timestamp.  
   **Evidence:** `STATUS.md:13`.  
   **Fix:** “Total duration changed from 2,091 to 311 ms; the replacement stop was requested at 300 ms.” Old overshoot would be **1,791 ms only if its stop was also requested at 300 ms**.

10. **L54 — “0 of 132 … ever cancelled” needs a sample boundary.** It describes the pre-fix observation, not all subsequent Chrome vibrations; later cancel/restart behavior was observed.  
    **Evidence:** `STATUS.md:9,13`.  
    **Fix:** “In the sampled pre-fix history, zero of 132 Chrome vibrations were marked cancelled.”

11. **L65 — the raw warm-up log contradicts “two were 0.06 s.”** The last two durations are **61 ms and 93 ms**, not two approximately 60 ms trials. The correct trial was **35,311 ms**, so “35 s” is rounded. Ten trials and one correct match.  
    **Evidence:** `feelink/results.jsonl:3,9,10`.  
    **Fix:** Use “two very short trials, 0.061 and 0.093 s.” Correct STATUS’s same error. Keep the existing prohibition against presenting this as a valid recognition result.

12. **L66 — “four of seven closed shapes” is false.** The pool includes **plus, T, L, and Z**, which are open figures. The misleading code variable is named `closed`.  
    **Evidence:** `feelink/feel.html:213–215`; `feelink/tactile.js:185–196`.  
    **Fix:** “Four figures selected from square, triangle, circle, plus, T, L, Z, plus one open square with a randomized missing side.”

13. **L32–33 — arithmetic is correct; “true size” is too strong.** The mapping assumes the viewport corresponds to the calculated screen width. It has no physical calibration supporting exact millimetres.  
    **Evidence:** `feelink/feel.html:62,117–126`.  
    **Fix:** “Nominal physical scale based on an estimated 64.6 mm screen width; approximately 4.3 mm side margins. Physical scale not measured.” **Reasoned**, not Measured.

14. **L49 — the circle and corner-window claims exceed their evidence.** One synthetic circle fixture produces no corner nodes. That does not establish that arbitrary drawn circles never produce false corners. The algorithm walks at least **5 mm in each direction**, with possible overshoot between sampled points.  
    **Evidence:** `feelink/tactile.js:44–51,62–76`; `feelink/tactile.test.cjs:75–81`.  
    **Fix:** “No false corners on the test-circle fixture; turns ≥40° estimated using points at least 5 mm along each side.”

15. **L51 — “is felt” is not established by the unit test.** The test asserts a renderer command, not actual vibration or human perception. Its “unit-tested only” caveat does not make the literal sentence safe.  
    **Evidence:** `feelink/tactile.test.cjs:42–49`; `feelink/feel.html:188–192`.  
    **Fix:** “The renderer emits the appropriate haptic command when a line appears beneath a stationary finger; unit-tested.”

16. **L71, honest limit L87, prohibition L98 — rings are not one-to-one vibration requests.** The stage synthesizes recurring rings from held state, and a burst produces two visual rings. Current phone code emits no `haptic` events yet.  
    **Evidence:** `feelink/board.js:105–143`; `feelink/stage.html:95–103,272`; `feelink/feel.html:278,296–297`.  
    **Fix:** “Rings illustrate reported haptic-request state; they are neither per-call counters nor motor traces.” Until real events arrive, there are no verified live rings.

17. **Missing PR #54 conflict — stage state expires before the next hold re-arm.** `HapticRings` expires after **1,000 ms**, while the line now re-arms after **4,500 ms**. A read-only reproduction generated rings at 0/450/900 ms, then none at 1,000/1,500/4,499 ms.  
    **Evidence:** `feelink/board.js:105–112,130–143`; `feelink/stage.html:96`; `feelink/feel.html:88`.  
    **Fix:** Add this unresolved integration issue to the sheet. The visualization needs duration-aware behavior before its continuous-line representation is trusted.

18. **Honest limit L87 — “false only for invalid parameters” is incorrect.** The current draft and Chromium source include refusal for missing activation or invisibility; Chromium has additional refusal paths. A true result still does not prove motor output.  
    **Evidence:** [W3C processing rules](https://w3c.github.io/vibration/); [Chromium implementation](https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/renderer/modules/vibration/vibration_controller.cc).  
    **Fix:** Replace “only” with documented refusal conditions. Retain the pending Pixel-specific return-value check.

19. **L15 — 73,505 matches, but the population needs qualification.** The report includes registrations in **the U.S. and outlying areas**, including adult rehabilitation registrations. It is not simply a count of U.S. schoolchildren.  
    **Evidence:** [APH FY2025 report, PDF p.5](https://media.aph.org/app/uploads/2026/05/FY2025-Annual-Report.pdf).  
    **Fix:** “APH’s FY2025 report lists 73,505 eligible students registered in the U.S. and outlying areas.” The sheet correctly avoids choosing between the report’s inconsistent census-year headings.

20. **L17 — unsupported demand claim; Wing It’s evidence label and caveat are stale.** A product existing does not show that teachers want FeelInk. APH explicitly describes **real-time drawing** from iPhone/iPad to Monarch.  
    **Evidence:** [APH Wing It product description](https://www.aph.org/product/wing-it/).  
    **Fix:** Remove “Teachers already want this.” Change Wing It to **Read**, and acknowledge the existing real-time teacher-to-tactile workflow.

21. **L67 — numbers match, but the recognition benchmark needs its method attached.** The experiment used a limited six-letter set and allowed a second learning period before an answer counted as a miss. It used three blind and twelve blindfolded sighted participants. **No audio cues were used in this letter experiment**, despite the system’s vibro-audio name.  
    **Evidence:** [Giudice et al., §§4.1 and 5](https://umaine.edu/vemi/wp-content/uploads/sites/220/2016/08/Giudice-etal2012-vibro-audio-interface-ASSETS12.pdf).  
    **Fix:** Keep the percentages as **Read/prior research**, but specify the small sample and up-to-two learning attempts. Do not imply first-attempt recognition or FeelInk performance.

22. **L48, L68–70 — improve attribution and separate unlike findings.** The CHI 2025 paper reports earlier empirical observations; its own contribution is a computational model. Palani’s **46 participants span three studies**. Gorlewicz’s poster separates shape identification from the screen-size/pattern-matching result. Lin/Rugama’s 32 participants span four experiments.  
    **Evidence:** [CHI paper §5](https://shape.stanford.edu/research/modelTouchscreen/modelTouchscreen.pdf), [Palani author abstract](https://umaine.edu/vemi/publication/touchscreen-based-haptic-information-access-assisting-blind-visually-impaired-users-perceptual-parameters-design-guidelines/), [Gorlewicz poster](https://cadrek12.org/sites/default/files/Wed_Gorlewicz_Multimodal.pdf), [Lin/Rugama abstract](https://pubmed.ncbi.nlm.nih.gov/26099504/).  
    **Fix:** Add these direct citations. The **1/4 mm**, **>78%/47%**, and **32** figures match. Those verified passages can now be **Read**, with abstract/poster scope identified. “Strongest evidence against” and the cue-design rationale remain **Reasoned**.

23. **L78 — reseller prices lack traceable sources.** RIVALS supplies no seller names, URLs, dates, or promotion terms for **$17,995/$12,900**. Adding “reported” does not repair that gap.  
    **Evidence:** `research/feelink-rivals-claude-2026-11-06.md:8`.  
    **Fix:** Omit both prices unless actual listings are supplied.

24. **L77 and L80 — distinguish sourced specifications from comparative judgment.** Monarch’s price/specifications are Read; “closest product” is a **Reasoned comparison**. The limited hackathon scan cannot establish an open market or first-of-its-kind interaction, especially given Wing It.  
    **Evidence:** RIVALS `:20–26`; `CLAUDE.md:58`; APH Wing It above.  
    **Fix:** Label the comparison separately and restrict novelty wording to “Our limited scan found no matching hackathon project.”

25. **L30 and L58 — cost and build-time claims have weaker support than their wording suggests.** An under-$50 constraint does not establish $0 expenditure. The selection log establishes a Friday-night start, not measured development effort. From approximately 21:35 Friday to the sheet’s 13:20 Saturday is **15 h 45 min elapsed**.  
    **Evidence:** `CLAUDE.md:29`; [selection log](https://github.com/reeve25/capital-hacks-5/issues/1#issuecomment-6702842057); fact-sheet `:3`.  
    **Fix:** “Requires no additional specialized haptic hardware, assuming the existing phone/laptop/USB setup.” Prefer “Built from Friday night into Saturday”; label any elapsed-time calculation **Reasoned**.

26. **L27–28 and L81 — keep implementation, demonstrated operation, and compatibility distinct.** “Yes, once recorded” is future-conditional approval under a column defined as safe now. No phone app installation is required, but the tested venue setup requires laptop-side adb, Android Chrome, activation, and suitable vibration settings.  
    **Evidence:** `STATUS.md:9–13`; `feelink/feel.html:79,175–194`; [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate).  
    **Fix:** Mark the live tutor-to-phone claim **built; real live-step verification pending**. State tested hardware separately from browser API compatibility.

27. **L18, honest limit L91, prohibition L95 — distinguish absent records from proof nobody participated.** `USERS.md` contains no validation entries. That supports “no target-user validation documented,” rather than an independently established history of everyone who has tried it.  
    **Evidence:** `USERS.md:1–3`; `STATUS.md:37`.  
    **Fix:** Use the documented-evidence wording. Retain the consent gate: Reeve’s consent does not cover Nathan or another identifiable person. See `CLAUDE.md:33,62–63` and PLAN `:57`.

28. **Additional unlisted STATUS/PLAN conflicts and deck gaps.** STATUS’s old “Nobody has felt it on a real motor” is superseded. PLAN still says routes are needed, stage is planned, and recording has no ffmpeg, although those pieces are merged and mock-tested. The stage also does not recognize the agreed `phoneconfig` presence event.  
    **Evidence:** `STATUS.md:7,9–14`; PLAN `:31,35–38`; `feelink/server.py:22–23`; `feelink/stage.html:116`.  
    **Fix:** Replace stale state descriptions and explicitly list real-device integration as pending. Add that **“found by touch” is geometric proximity**, not confirmed perception: `board.js:4–5,67–70` and `stage.html:87–88`. Preserve the pending blind-run bar/results, live latency, event matching, and footage consent. The deck also needs the required AI/open-source disclosure (`CLAUDE.md:46`).

The requested calculations independently recompute as follows:

| Quantity | Result | Meaning |
|---|---:|---|
| `6.2 × 25.4 × 9 / √481` | **64.624229 mm → 64.6 mm** | Calculated screen width |
| `(64.624229 − 56) / 2` | **4.312115 mm** | Nominal side margin |
| FADE array sums | **864 / 660 / 540 ms** | Correct |
| FADE sums × 0.75 | **648 / 495 / 405 ms** | Correct scheduled re-arms |
| Old hold: `800 × 0.75` | **600 ms** | Historical build |
| Current hold: `5000 × 0.9` | **4,500 ms** | Current main |
| Span through final on-step | **804 / 625 / 525 ms** | Chromium removes trailing pause; these are nominal spans, not measured playback |

The remaining principal checks matched: WHO’s **at least 2.2 billion**, dated **10 February 2026**; APH’s **5.63%** category and its warning against literacy claims; Monarch’s **$15,500**, **10×32 cells**, **3,840 pins**; no intensity parameter in the Vibration API; and no iOS Safari support. Sources: [WHO](https://www.who.int/news-room/fact-sheets/detail/blindness-and-visual-impairment), [APH report](https://media.aph.org/app/uploads/2026/05/FY2025-Annual-Report.pdf), [Monarch](https://www.aph.org/product/monarch/), [W3C](https://w3c.github.io/vibration/), [Can I Use](https://caniuse.com/vibration), [MDN compatibility data](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/Navigator.json).

The board dimensions, designed corner/end/tick patterns, scoped swept-path claim, and **10/10 tactile unit-test result** also checked out. The independent code review reran those tests successfully. No new Pixel experiment was performed during this review.


