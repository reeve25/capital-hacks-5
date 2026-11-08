# FeelInk explainer video: how it is built

A narrated 1280x720 video made entirely on the laptop: an HTML/SVG animation rendered frame by frame with headless Chrome, plus Windows text-to-speech. First version made Sat Nov 7 2026, 99 s, 1.6 MB, at `recordings/feelink-explainer.mp4` (git ignores `recordings/`; never commit video).

Honesty rule (CLAUDE.md "Evidence"): every scene that looks like the product must say it is a simulation. Real-device footage comes only from the Pixel 8 through `tools/record/`.

## Files
- `narration.txt`: one line per scene. Seven scenes.
- `tts.ps1`: reads `narration.txt`, writes `seg_N.wav` per line with the Windows "Microsoft Zira Desktop" voice, rate -1.
- `explainer.html`: the animation. `render(t)` draws the frame for time `t` seconds. Scene start times come from the URL `?b=s0,s1,...,s6,end`.
- `render.mjs`: launches headless Chrome on a DevTools port, calls `render(t)` for every frame, saves PNGs. Node 25 (needs the global `WebSocket` and `fetch`, so Node 22 or newer).

## Rebuild, from Git Bash, in a scratch folder
```bash
W=/c/path/to/work && mkdir -p "$W" && cp tools/explainer/* "$W" && cd "$W"
# 1. voice
powershell -NoProfile -ExecutionPolicy Bypass -File tts.ps1 -Dir "$(pwd -W)"
for f in seg_*.wav; do printf "%s " $f; ffprobe -v error -show_entries format=duration -of csv=p=0 $f; done
# 2. scene start times: 0.8 lead, each start = previous start + previous duration + 0.6 gap; end = last start + last duration + 1.5
# 3. frames (about 90 s for 1500 frames)
node render.mjs "$(pwd -W)/explainer.html" "0.8,12.99,27.36,44.04,59.54,74.45,90.91,99.0" 99.0 15 frames
# 4. audio track: one adelay per segment, in ms, same start times
ffmpeg -y -i seg_0.wav -i seg_1.wav -i seg_2.wav -i seg_3.wav -i seg_4.wav -i seg_5.wav -i seg_6.wav \
  -filter_complex "[0]adelay=800|800[a0];[1]adelay=12990|12990[a1];[2]adelay=27360|27360[a2];[3]adelay=44040|44040[a3];[4]adelay=59540|59540[a4];[5]adelay=74450|74450[a5];[6]adelay=90910|90910[a6];[a0][a1][a2][a3][a4][a5][a6]amix=inputs=7:normalize=0,apad=whole_dur=99,aresample=48000[out]" \
  -map "[out]" -ac 1 narration.wav
# 5. encode
ffmpeg -y -framerate 15 -i frames/f_%05d.png -i narration.wav -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p -r 30 -c:a aac -b:a 96k -shortest -movflags +faststart feelink-explainer.mp4
```
ffmpeg lives in WinGet's folder; `tools/record/compose.py` shows how to find it if it is not on PATH.

## Gotchas found
- Chrome's `--user-data-dir` must be an absolute path or Chrome exits silently.
- Kill stale headless Chromes before a rerun (they hold the debugging port): in PowerShell, stop every `chrome.exe` whose command line contains `remote-debugging-port`.
- `pgrep` does not exist in Git Bash on this laptop.
- Gmail attachments must stay under 25 MB total.
