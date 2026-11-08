# Deck generator

Builds `recordings/out/FeelInk-deck-draft-2026-11-08.pptx` from the simulation assets in `recordings/out/` (run `node tools/record/sim_take.mjs` first). Slide text and speaker notes live in `build.js`; the script per slide is the notes.

```
cd tools/deck && npm install pptxgenjs@3.12.0 && node build.js
powershell -NoProfile -ExecutionPolicy Bypass -File export_png.ps1 ..\..\recordings\out\FeelInk-deck-draft-2026-11-08.pptx ..\..\recordings\out\deck-png
```

`build_pitch3.js` builds the 3-minute deck (7 slides, dark title/demo/close slides, notes = `.tmp/pitch-script-3min-2026-11-08.md`): `node build_pitch3.js` writes `recordings/out/FeelInk-deck-3min-2026-11-08.pptx`. The older `build_template.js` builds the 12-slide deck in the organizers' template style (white, Poppins, 10 x 5.625 in, the Google Slides size, 12 slides in the template's order, notes = the timed pitch script): `node build_template.js` writes `recordings/out/FeelInk-deck-template-2026-11-08.pptx`.

`export_png.ps1` renders every slide to PNG through PowerPoint (COM) so the result can be inspected (run it bare with absolute paths; piping its output into `Select-Object -First` ends the pipeline before `Export` runs and leaves the folder empty, seen Nov 8; stop stray `POWERPNT` processes before and after); the pptx skill's `validate.py` checks the file. Import the result into the Google Slides deck with File > Import slides, or present it as is (GIFs animate in PowerPoint and Google Slides, not in PDF).
