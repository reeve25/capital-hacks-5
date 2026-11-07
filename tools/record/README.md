# Recording runbook: stage capture + overhead phone -> slide GIF and MP4

Turns two raw takes into one side-by-side clip for the deck. The **left** panel is the stage page, captured on Reeve's laptop. The **right** panel is the overhead iPhone video of a hand on the Pixel. Both panels are portrait, letterboxed in the stage surround `#0e1620`, and fill 1920x1080 (16:9). Outputs:

- `NAME.mp4`: H.264, yuv420p, 1920x1080, 30 fps, faststart, no audio.
- `NAME.gif`: 960x540, 15 fps, 128-colour palette, Bayer dither (good for flat colours), loops forever.

All raw files and outputs go in `recordings/`, which git ignores. Never commit video.

## Size limits for the deck
- **Google Slides: under 50 MB and at most 25 megapixels per image, PNG, JPEG or GIF.** Source: Google Slides API guide "Add images to a slide", https://developers.google.com/slides/how-tos/add-image ("Images must be less than 50 MB in size, cannot exceed 25 megapixels, and must be in one of PNG, JPEG, or GIF formats"). That page documents the API. Google's help centre gives no separate number for the Slides UI, so we assume the same limit applies there. A 960x540 GIF is 0.5 MP, far inside the limit.
- **Our own target: under 10 MB per GIF**, so the deck loads fast and plays smoothly. compose prints a warning above that. PowerPoint has no fixed GIF limit, but large GIFs make the file heavy.
- A PDF export freezes GIFs. Present from Slides or PowerPoint.

## 0. One-time setup (Reeve's laptop)
1. Open a terminal and run `winget install Gyan.FFmpeg`. Then open a **new** Git Bash window so the updated PATH loads.
2. Check: `python tools/record/compose.py probe --help`. The script finds ffmpeg on PATH, in WinGet's Links folder, or in `%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg*\*\bin`. If it still can't, point it at the exe: `export FFMPEG="/c/path/to/ffmpeg.exe"` (or at the `bin` folder).
3. Optional mock test, about 1 minute: `bash tools/record/selftest.sh`. It must end with `selftest: ok`.

Use Git Bash. In this repo, PowerShell's `bash` is WSL and hangs.

## 1. Stage screen capture: Xbox Game Bar (Snipping Tool as fallback)
Game Bar records one app window, and a browser counts as an app, so it works for the stage page. Its frame rate is adjustable, and Snipping Tool's is not.

1. Settings > Gaming > Captures:
   - Recorded video frame rate: **60 fps**.
   - Video quality: **High**.
   - Capture audio when recording a game: **Off**.
   - Capture mouse cursor: **On**. The tutor's pointer is part of the story.
   - Files are saved to `Videos\Captures`.
2. Set display scale and resolution as usual. Open the stage page in Chrome or Edge and press **F11** for full screen, so no browser chrome shows.
3. Click the page so the browser is the active window. Press **Win+Alt+R** to start and **Win+Alt+R** again to stop. A small timer confirms the recording.
4. Fallback if Game Bar is missing or blocked: press **Win+Shift+R** (Snipping Tool screen recording), drag a box over the board area, then click Start. The file goes to `Videos\Screen Recordings`. Its frame rate is fixed, and compose resamples to 30 fps anyway.

compose finds the bright board on the dark surround automatically (`--stage-crop auto`) and prints the crop it used. Pin that value with `--stage-crop W:H:X:Y` for every later take from the same setup.

## 2. iPhone overhead video
1. Settings > Camera > Formats > **Most Compatible**. This records H.264 instead of HEVC.
2. Settings > Camera > Record Video:
   - **1080p at 60 fps**. 30 fps also works.
   - **HDR Video: Off**. HDR clips also work, because compose tone-maps them, but SDR looks more predictable.
   - Turn off Action Mode and Enhanced Stabilization if your model shows them.
3. Settings > Photos > Transfer to Mac or PC > **Keep Originals**. This stops conversion during the copy.
4. Prop the phone straight above the Pixel, using the **1x** lens and portrait orientation. Frame the Pixel plus a hand's width of margin. Avoid ceiling-light reflections on the Pixel glass; tilt the Pixel slightly if needed.
5. Lock exposure: with the hand over the dark Pixel, press and hold on the hand until **AE/AF LOCK** shows. Drag the sun slider down a little so skin does not blow out.
6. Rotation metadata, portrait or landscape: compose handles both. If a clip comes out sideways anyway, add `--phone-rotate 90` (or 180 or 270, clockwise).

## 3. The sync tap
The tutor's first stroke cannot be seen in the overhead video, because the Pixel screen is dark. So both clips are synced on a **sync tap** that both cameras can see.

1. Start the stage capture (Win+Alt+R), then start the iPhone recording.
2. The student taps the Pixel screen once with one fingertip, lifts, and keeps still for 2 seconds. The stage cursor appears at that instant (the finger event over `adb reverse`), and the iPhone sees the fingertip touch down.
3. Then do the take as planned. Stop both recordings.

To find the tap in each clip, first find the rough second by scrubbing in Photos or Media Player. Then print every frame around it:

```bash
python tools/record/compose.py strip recordings/raw/20261107-take01-stage.mp4 --at 4 --dur 2
python tools/record/compose.py strip recordings/raw/20261107-take01-phone.mov --at 6 --dur 2
```

Each sheet in `recordings/strips/` labels every tile with its clip time and frame number. Pick the **first** frame where the stage cursor shows, and the first frame where the fingertip touches the glass. Those two times are the sync pair.

## 4. Transfer the iPhone file to Windows (AirDrop does not work)
**USB cable plus File Explorer** is the most reliable way.
1. Plug the iPhone into the laptop. Unlock it and tap **Trust**.
2. File Explorer > Apple iPhone > Internal Storage > DCIM > the newest `1xxAPPLE` folder. Copy the `IMG_xxxx.MOV` to `recordings/raw/`, then rename it (see naming below).
3. If File Explorer shows no files or stalls, use the Windows **Photos** app > Import > the iPhone. The last resort is icloud.com/photos > select the clip > Download, which is slow because it uploads first.

## 5. Naming
- Raw files: `recordings/raw/YYYYMMDD-takeNN-stage.mp4` and `recordings/raw/YYYYMMDD-takeNN-phone.mov`.
- Outputs: `recordings/out/takeNN-<what>.mp4` and `.gif`, for example `take03-square.gif`.
- Strips: `recordings/strips/`.

## 6. Compose
```bash
python tools/record/compose.py compose \
  --stage recordings/raw/20261107-take01-stage.mp4 \
  --phone recordings/raw/20261107-take01-phone.mov \
  --sync 4.733 6.517 --start 7.0 --dur 8 \
  --name take01-square
```

- `--sync STAGE_T PHONE_T` is the sync pair from step 3. `--start` is where the clip begins, in **stage** time (the default is the tap itself). `--dur` is the length in seconds.
- Instead of `--sync`, you can give `--stage-start` and `--phone-start` directly.
- `--stage-crop auto|none|W:H:X:Y`: auto finds the board and widens the crop to the panel shape.
- `--phone-crop W:H:X:Y`: tightens on the Pixel. It applies after rotation.
- `--phone-rotate`, `--phone-hflip` and `--swap` (puts the phone on the left) fix framing.
- `--hdr auto|on|off`: auto tone-maps HLG or PQ clips to SDR with zscale, and falls back to a plain colour conversion.
- **If the GIF is over 10 MB**, try these in order: `--denoise` (camera grain is what bloats it), a shorter `--dur` (a GIF should read in one second, so 4-8 s is plenty), `--gif-fps 12`, `--colors 96`, `--gif-width 800`.
- The script prints the stage and phone details, the window and crop it used, and the MP4 and GIF sizes.

Captions go on the slide, not in the clip.

## 7. Check before the deck
Open the GIF in a browser and watch it loop. Insert it into a scratch Google Slides or PowerPoint deck and play the slide. Plan acceptance is a real-take GIF playing in Slides or PowerPoint.
