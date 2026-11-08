# Handoff: remake the FeelInk explainer video (for a new chat)

Paste this file's path to the new chat, or paste the text. Written Sat Nov 7 2026 about 16:30 PT by the outreach chat on Nathan's laptop.

## Who and why
Reeve and Nathan, Sacramento State, Capital Hacks 5.0 (Nov 6-8, 2026). Pitch is Sunday, slides due about 11 AM. The video is for an email going to about 40 blind-community contacts, students, parents, teachers and researchers asking for their opinion of FeelInk. Drafts will be created in Reeve's Gmail by the outreach chat once the new video exists, so the video must be an .mp4 under 25 MB (ideally under 10 MB).

## What FeelInk is (say exactly this much, no more)
A tutoring tool. A sighted tutor draws in a web browser on a laptop. A blind student rests one finger on their own Android phone. As each stroke is drawn, the phone buzzes steadily while the finger is on the line, taps twice at a corner, taps three times at the end of a line, and goes quiet off the line, so the finger learns to follow the shape. No app, no hardware: a web page in Chrome using the phone's vibration motor. Uses: shapes in geometry (triangle, square, circle), graphs (a line on an axis, a curve), and following a line as a route to practise directions. Closest product: a $15,500 tactile display (APH Monarch). Tested only on one Pixel 8 over USB. No blind person has tried it yet.

## Audience of the video
Mostly blind or low-vision people using screen readers, plus sighted teachers and parents. So: narration must carry everything; nothing may exist only as a picture. Captions should match the narration. Keep it 60 to 100 seconds.

## Rules that cannot be broken (from CLAUDE.md)
- Label what is real and what is not. Anything drawn on the laptop is a simulation and the video must say so on screen and in the narration. Only footage shot of the actual Pixel 8 is real. Never pass saved or mocked output off as live.
- Only Reeve's face, voice and demo are covered by consent. Nathan appearing or speaking needs Nathan's own yes. Nobody else appears without theirs.
- Never claim: webcam whiteboard, draw-it-back, touch-to-hear (not built); any user validation; a recognition rate; that it works on iPhone or Wi-Fi; latency numbers.
- Disclose AI tools were used to build it (a line at the end is enough).
- Never commit video. Output goes in `recordings/`, which git ignores.

## What exists already
- Version 1: `recordings/feelink-explainer.mp4`, 99 s, 1.6 MB, 1280x720, computer voice (Windows Zira). Seven scenes: title; the problem (teacher draws a triangle, student gets it "in words, later as a tactile sheet, or not at all"); how it works (browser board on the left, phone with a finger following the line on the right); the three cues on a phone (steady buzz, double tap, triple tap, silence off the line); "No app. No hardware." with $15,500 vs the phone; honesty scene ("drawn on a laptop, real test on a Pixel 8, no blind person has tried it yet"); "Reply to our email, or ask for a short call."
- Source and rebuild steps: `tools/explainer/README.md` (HTML/SVG animation rendered by headless Chrome, narration by PowerShell text-to-speech, assembled with ffmpeg). All of it works on this laptop today.
- Real-footage pipeline: `tools/record/README.md` and `compose.py` make a side-by-side of the stage page capture and an overhead phone video of a hand on the Pixel, for the deck. That footage is the strongest possible content for the email too.
- Facts a slide or video may state, with sources: `research/feelink-fact-sheet-2026-11-07.md`. Current state: `STATUS.md`.

## What "better" could mean (Nathan and Reeve decide)
1. Real footage of the Pixel 8 buzzing under a finger while Reeve draws, shot on a phone, with Reeve narrating live. This beats any animation for credibility. Needs the USB link (`adb reverse`, see `STATUS.md`) and a quiet room so the buzz is audible.
2. A human voice instead of the computer voice. Reeve recording the narration over the existing animation is a 10-minute job: record a WAV per scene, drop them in as `seg_N.wav`, recompute the start times, rebuild.
3. Visual polish of the animation: show a graph scene and a route scene, not just the triangle; show the real stage page look (`feelink/stage.html`) rather than the generic board.
4. Shorter. 60 to 75 seconds would hold attention better in an email.

## When the video is done
Put it at `recordings/feelink-explainer.mp4` (or tell the outreach chat the new path), then tell the outreach chat. It will attach it to the Gmail drafts with a file reference and the file's SHA-256, which it computes itself. The email text already says "Attached is a short narrated video that shows how it works", so the video needs no particular wording to match.
