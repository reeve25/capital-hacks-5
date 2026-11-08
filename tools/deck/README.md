# Deck generator

Builds `recordings/out/FeelInk-deck-draft-2026-11-08.pptx` from the simulation assets in `recordings/out/` (run `node tools/record/sim_take.mjs` first). Slide text and speaker notes live in `build.js`; the script per slide is the notes.

```
cd tools/deck && npm install pptxgenjs@3.12.0 && node build.js
powershell -NoProfile -ExecutionPolicy Bypass -File export_png.ps1 ..\..ecordings\out\FeelInk-deck-draft-2026-11-08.pptx ..\..ecordings\out\deck-png
```

`export_png.ps1` renders every slide to PNG through PowerPoint (COM) so the result can be inspected; the pptx skill's `validate.py` checks the file. Import the result into the Google Slides deck with File > Import slides, or present it as is (GIFs animate in PowerPoint and Google Slides, not in PDF).
