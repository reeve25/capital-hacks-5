# FeelInk submission materials, Capital Hacks 5.0, Sun Nov 8 2026

Drafted overnight (02:55 PST) against the requirements we have actually verified. Nothing here has been submitted; submitting needs both Reeve's and Nathan's yes (hard rule). Labels: **Told** = organizers said it to the team; **Read** = read on the linked page; **Precedent** = last edition's rule, not confirmed for this one.

## Requirements, verified vs precedent
| Requirement | Status | Source |
|---|---|---|
| 4-minute pitch with slides, no live demo, GIFs and images allowed | Told, Sat Nov 7 (organizers) | CLAUDE.md event facts; `research/pitch-format-2026-11-07.md` |
| Share the deck with csuscarlsencenter@gmail.com as editor | Done, verified 02:05 Sun via Drive permissions | overnight brief |
| Disclose AI tools and open-source use in the presentation | Told (Umang) and Read (hornet-hacks.pages.dev) | Team slide carries it |
| Prior work allowed only in a repo started on the day, disclosed | Told (Umang) | repo created Fri Nov 6; no code carried over |
| Pitches Sunday 9:00-14:00, Carlsen Center | Read (event listing) | `research/pitch-format-2026-11-07.md` |
| Slides by 11 AM Sunday, PDF or PPT, to the organizers | Precedent (Hornet Hacks 3.0 rules); unconfirmed | ask at check-in; we are sharing a Google deck already |
| 1-minute demo video "optional but recommended" | Precedent (Hornet Hacks 3.0); unconfirmed | not produced; the pitch clip can stand in if asked |
| Public GitHub repository | Precedent (Hornet Hacks 3.0); unconfirmed | repo is private; making it public needs both yeses and the pre-public checklist (`data-v1` release down, `research/` reviewed) |
| A team member must attend the pitch to submit | Precedent | both attending |

## Project description

**One line.** FeelInk: a tutor draws on a laptop, a blind student feels the drawing as vibration on an ordinary Android phone and hears the labels, live, as it is drawn.

**Short (about 60 words).** FeelInk is interactive spatial education for blind students. A sighted tutor draws routes, graphs or circuits on a laptop web page; the student explores the same drawing on their own Android phone in Chrome, with lines as vibration under one finger, corners as short cues and labels spoken by name. The tutor sees the student's finger live and reveals the drawing step by step. Nothing to buy. Prototype: one Pixel 8 over USB; the current demonstration is a desktop simulation; no target-user trial yet.

**Long.** Diagrams drawn in the middle of a lesson reach blind students late or never: a verbal description, a tactile sheet days later, or nothing, and when the drawing changes they wait again. The dedicated fix, a refreshable tactile display such as the APH Monarch, lists at $15,500 (aph.org, read Nov 7). FeelInk uses what the student already carries. The tutor's page (FeelInk Studio) has Draw, Label and Start point tools, a one-click coordinate plane, Undo and Clear, and a step-through reveal (Previous, Next, Reveal all). The student's page maps the whole board onto the phone screen (scale computed from the screen's specs, not measured); sliding one finger buzzes while on ink, fainter toward the edge, with corners and ends as their own cues; a label is a state: silence, the spoken name, three long pulses, then a soft heartbeat while the finger rests. Off the ink, light taps quicken toward the nearest line. The tutor sees the finger live, the last label the phone spoke and how much of the drawing has been covered, and the phone says what changed when the tutor edits ("Line added.", "Drawing cleared."). It is human-led: an in-person classroom tool where the tutor talks and the software is the tactile workspace plus feedback.

**Track.** Health + Accessibility Tech. **Team.** Reeve Masilamani (UC Davis) and Nathan Jeevamani.

## Links
- Shared Google Slides deck "FeelInk Presentation": https://docs.google.com/presentation/d/1056SUeRRlxASAS6Sz-2Wr05TLDUp538p2jijT9DjrKg/edit (editor: csuscarlsencenter@gmail.com, confirmed Sun 02:05)
- Repository: https://github.com/reeve25/capital-hacks-5 (private as of Sun 02:55; public only after both agree and the pre-public checklist runs)
- Demo clip: deck slide 7 (desktop simulation, labelled); files in `recordings/out/final/` (not in git)

## What is built, measured and shown (for the form fields)
- **Built:** Python standard-library relay (`feelink/server.py`), tutor stage (`feelink/stage.html`, `board.js`), student page (`feelink/feel.html`, `tactile.js`), 92 unit tests, headless-Chrome checks for the stage tools (61 steps) and the guide taps (19 checks), a recording pipeline and a desktop simulation of the route lesson.
- **Measured on one Pixel 8 (earlier build, USB):** Chrome on Android ignores `vibrate(0)` (0 of 132 stops), a 1 ms buzz stops it (311 ms when stopped at 300 ms); relay to phone median 4-5 ms over 151 of 151 strokes; finger samples back median 14 ms over 192 of 192; mapping error 0.03-0.04 mm; first buzz 93-196 ms after the request (cause unknown); buzzes over 1 s follow the phone's media vibration setting.
- **Device check:** tag `demo-2` (commit `54e8d50`) passed a hands-on Pixel 8 check Sat 20:33 (Connect, route trace, labels spoken, step reveal). Everything after it is desktop-verified only.
- **Validation statement (exact wording):** One critical written response; no target-user trial. A blind student with tactile-graph experience replied to our outreach email that the approach won't work in practice (no spatial context from a single vibrating point, TalkBack intercepts one-finger gestures, latency and numbness). Logged anonymously in `USERS.md`. No blind user has tried FeelInk. No evidence of learning.
- **Limitations:** USB only (venue Wi-Fi and hotspot failed), one phone, Android Chrome only (no Vibration API in iOS Safari), TalkBack unverified, far lower fidelity than a tactile display, no authentication.

## Disclosure (AI tools, open source, hardware, prior work)
Say this on the Team slide and in any form field that asks.
- **AI tools:** Claude Code (Anthropic): a Fable 5.1 lead session and Opus 5.5 implementation agents in git worktrees with tests; Codex (OpenAI) for independent reviews. They did the implementation under our direction; we set the product direction, made the product calls and checked the two tagged demo builds on a Pixel 8 by hand (later builds have desktop checks only). Claude Code agents also drafted the deck, this document and the overnight work.
- **Open source and third-party:** impeccable design skill (Paul Bakaus, Apache 2.0); agent skills `interview`, `ste`, `codex` (Johnathan Mo, MIT), `better-ui` (Jakub Krehel, MIT), `animate` (Emil Kowalski, MIT), all listed in `.claude/skills/SOURCES.md`; Atkinson Hyperlegible typeface (Braille Institute, via Google Fonts); Poppins typeface (Google Fonts, OFL) in the deck; FFmpeg (composes the clips, not bundled); pptxgenjs 3.12.0 (MIT) to generate the PPTX; Android platform-tools (`adb`); Chrome DevTools Protocol for the headless checks and the simulation. The app itself is Python standard library plus plain browser APIs (Web Vibration, Web Speech, Canvas), no frameworks.
- **Hardware:** owned gear only, an unmodified Pixel 8 (Nathan's), a laptop and a USB cable. No physical build. $0 spent.
- **Prior work:** the repository was created at the event on Friday Nov 6; all FeelInk code was written during the event; no code was carried over from earlier projects.
- **Footage and consent:** the demonstration clips are desktop simulations (scripted finger, vibration and speech stubbed) and are labelled as such on every frame. No person appears in them.

## Devpost-style fields (ready to paste if a form appears)
- **Inspiration:** a diagram drawn mid-lesson is the one thing a blind student in the room cannot share at the moment it matters, and the dedicated hardware costs $15,500.
- **What it does:** see the short description.
- **How we built it:** a 139-line stdlib Python relay; two static web pages; the Web Vibration API with rhythm standing in for the strength it lacks; a stroke simplifier (2 mm), corner detection (40 degrees over 5 mm), a swept-path tick for fast fingers, a sequence-stamped step reveal; headless-Chrome checks for the tutor tools and the guide taps; AI-assisted development as disclosed above.
- **Challenges:** Chrome on Android ignores `vibrate(0)`; the API has no amplitude; venue Wi-Fi and a hotspot both failed so the demo path is USB; the Pixel dropped off USB repeatedly on Saturday night, so the current build is desktop-verified only.
- **Accomplishments:** a working tutor-to-phone channel measured at 4-5 ms median; a label that is felt and heard, not a blip; a tutor view that shows the student's finger live; honest validation.
- **What we learned:** the first target-user answer was a reasoned no, and half of it is why the tutor is in the loop; the other half (TalkBack, fidelity) is open.
- **What's next:** blind students and teachers try it with consent before we build more; TalkBack on a real device; a classroom network path; audio sonification as a candidate beside vibration (respondent's suggestion; Reeve to confirm).
- **Built with:** Python, JavaScript, HTML/CSS, Web Vibration API, Web Speech API, Chrome DevTools Protocol, adb, FFmpeg, pptxgenjs, Claude Code, Codex.

## Still open before anything is submitted
1. Confirm with the organizers at check-in: slide deadline and format (Google link vs PPTX vs PDF; a PDF freezes the GIF), whether a public repo or a demo video is required, Q&A format.
2. Both team members agree to the final deck text, the disclosure lines and the Team slide contribution lines (Nathan's line is written from evidence only; he should confirm it).
3. If a public repo is required: take down the `data-v1` release, review `research/`, secret-scan, then flip visibility (Reeve's and Nathan's yes).
