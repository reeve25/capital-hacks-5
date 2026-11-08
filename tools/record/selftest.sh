#!/usr/bin/env bash
# Mock test of compose.py on synthetic clips (no real footage): a stage capture with a
# portrait board, an iPhone-style rotated HEVC 60 fps clip, and an HLG HDR 10-bit HEVC clip.
# Each clip has a one-off bright flash standing in for the sync tap: stage 3.0 s, phones 4.5 s.
# Usage: bash tools/record/selftest.sh   (outputs in recordings/selftest/, which git ignores)
set -euo pipefail
cd "$(dirname "$0")/../.."
here=tools/record
out=recordings/selftest
mkdir -p "$out"

if [ -n "${FFMPEG:-}" ]; then F="$FFMPEG"
elif command -v ffmpeg >/dev/null 2>&1; then F=ffmpeg
else
  F=$(ls -d "${LOCALAPPDATA:-/nonexistent}"/Microsoft/WinGet/Packages/Gyan.FFmpeg*/*/bin/ffmpeg.exe 2>/dev/null | tail -1)
fi
[ -n "$F" ] || { echo "ffmpeg not found; set FFMPEG" >&2; exit 1; }
[ -d "$F" ] && F="$F/ffmpeg.exe"
export FFMPEG="$F"
ff() { "$F" -hide_banner -loglevel error -y "$@"; }
PY=$(command -v python || command -v python3)

echo "== making synthetic clips"
ff -f lavfi -i "color=c=0x0e1620:s=1920x1080:r=60:d=12" -f lavfi -i "color=c=0xf3efe6:s=420x900:r=60:d=12" \
   -f lavfi -i "color=c=0x1aa39a:s=40x40:r=60:d=12" \
   -filter_complex "[0][1]overlay=750:90[b];[b][2]overlay=x='940+150*sin(t*2)':y='500+300*sin(t)',drawbox=x=900:y=480:w=120:h=120:c=0xe8a33d:t=fill:enable='between(t,3.0,3.15)'" \
   -c:v libx264 -pix_fmt yuv420p "$out/stage.mp4"
ff -f lavfi -i "testsrc2=s=1920x1080:r=60:d=14" \
   -vf "drawbox=x=800:y=400:w=300:h=300:c=white:t=fill:enable='between(t,4.5,4.6)'" \
   -c:v libx265 -x265-params log-level=error -pix_fmt yuv420p -tag:v hvc1 "$out/phoneA_raw.mov"
ff -display_rotation:v 90 -i "$out/phoneA_raw.mov" -c copy "$out/phoneA_rot.mov"
ff -f lavfi -i "testsrc2=s=1080x1920:r=30:d=14" \
   -vf "drawbox=x=400:y=800:w=300:h=300:c=white:t=fill:enable='between(t,4.5,4.6)',format=yuv420p10le" \
   -c:v libx265 -x265-params "log-level=error:colorprim=bt2020:transfer=arib-std-b67:colormatrix=bt2020nc" \
   -color_primaries bt2020 -color_trc arib-std-b67 -colorspace bt2020nc -tag:v hvc1 "$out/phoneB_hdr.mov"

echo "== probe"
"$PY" "$here/compose.py" probe "$out/stage.mp4" "$out/phoneA_rot.mov" "$out/phoneB_hdr.mov"
echo "== strip"
"$PY" "$here/compose.py" strip "$out/phoneA_rot.mov" --at 4.3 --dur 0.5 --out-dir "$out/strips"
echo "== compose A (rotated HEVC 60 fps, sync 3.0/4.5, start 2.5 s, 8 s)"
"$PY" "$here/compose.py" compose --stage "$out/stage.mp4" --phone "$out/phoneA_rot.mov" \
   --sync 3.0 4.5 --start 2.5 --dur 8 --name selftestA --out-dir "$out"
echo "== compose B (HLG HDR 10-bit HEVC 30 fps)"
"$PY" "$here/compose.py" compose --stage "$out/stage.mp4" --phone "$out/phoneB_hdr.mov" \
   --sync 3.0 4.5 --dur 8 --name selftestB --out-dir "$out"

echo "== verify"
FP="$(dirname "$F")/ffprobe"
[ "$F" = ffmpeg ] && FP=ffprobe
fail=0
for n in A B; do
  mp4="$out/selftest$n.mp4"; gif="$out/selftest$n.gif"
  m=$("$FP" -v error -select_streams v:0 -show_entries stream=codec_name,width,height,pix_fmt,r_frame_rate -of csv=p=0 "$mp4" | tr -d '\r')
  g=$("$FP" -v error -select_streams v:0 -count_frames -show_entries stream=width,height,nb_read_frames -of csv=p=0 "$gif" | tr -d '\r')
  audio=$("$FP" -v error -select_streams a -show_entries stream=index -of csv=p=0 "$mp4" | wc -l)
  loop=$(grep -c NETSCAPE2.0 "$gif" || true)
  # faststart: the moov atom comes before mdat
  order=$(head -c 200000 "$mp4" | od -An -c | tr -d ' \n' | grep -o 'moov\|mdat' | head -1)
  echo "selftest$n.mp4: $m, audio streams $audio, first atom $order"
  echo "selftest$n.gif: $g (w,h,frames), loop ext $loop"
  [ "$m" = "h264,1920,1080,yuv420p,30/1" ] || { echo "FAIL mp4 format"; fail=1; }
  { [ "$audio" -eq 0 ] && [ "$order" = moov ]; } || { echo "FAIL audio/faststart"; fail=1; }
  { [ "$g" = "960,540,120" ] && [ "$loop" -ge 1 ]; } || { echo "FAIL gif format/loop"; fail=1; }
  # sync: both flashes should be lit in the same output frame (A: 0.5 s, B: 0.0 s)
  t=0.03; [ "$n" = A ] && t=0.53
  ff -ss "$t" -i "$mp4" -frames:v 1 "$out/sync$n.png"
done

echo "== story (annotated take from a spec: headers, tags, captions, inset, speech line, stills)"
ff -f lavfi -i "color=c=black:s=412x914:r=30:d=8" -c:v libx264 -pix_fmt yuv420p "$out/phone_sim.mp4"
printf '%s\n' '{"stage":"recordings/selftest/stage.mp4","phone":"recordings/selftest/phone_sim.mp4","dur":6,
 "board":[750,90,420,900],"tools":[0,0,360,1080],"session":[1560,0,360,1080],"session_rect":[1560,0,360,290],
 "headers":{"stage":["Tutor laptop","mock"],"phone":["Student phone","mock"]},
 "tags":{"stage":["MOCK","synthetic clip"],"phone":["MOCK","synthetic clip"],"whole":["MOCK","synthetic clip"]},
 "captions":[{"t0":0,"t1":3,"who":"tutor","cause":"Cause one.","effect":"Effect one."},
  {"t0":3,"t1":6,"who":"student","cause":"Cause two.","effect":"Effect two."}],
 "insets":[{"t0":1,"t1":4,"title":"INSET","rect":[700,400,300,200]}],"speech":[{"t0":2,"t1":3,"text":"Hello"}],
 "stills":[{"t":1.5,"name":"a"},{"t":4.5,"name":"b"}],"establish_t":5,
 "callouts":[{"rect":[750,90,420,900],"at":[380,380,320],"title":"BOARD","lines":["mock"]}]}' > "$out/story-spec.json"
"$PY" "$here/compose.py" story "$out/story-spec.json" --name selftestS --out-dir "$out"
m=$("$FP" -v error -select_streams v:0 -show_entries stream=codec_name,width,height,pix_fmt,r_frame_rate -of csv=p=0 "$out/selftestS.mp4" | tr -d '\r')
echo "selftestS.mp4: $m"
[ "$m" = "h264,1920,1080,yuv420p,30/1" ] || { echo "FAIL story mp4 format"; fail=1; }
for f in selftestS.gif selftestS-stage.mp4 selftestS-stage.gif selftestS-still-a.png selftestS-still-b.png \
         selftestS-still-0-establishing.png selftestS-still-6-session-panel.png; do
  [ -s "$out/$f" ] || { echo "FAIL story output $f missing"; fail=1; }
done
[ "$fail" -eq 0 ] && echo "selftest: ok (mock: synthetic clips, not real footage)"
exit "$fail"
