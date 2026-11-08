#!/usr/bin/env python3
"""FeelInk recording pipeline: stage capture + overhead phone video -> side-by-side MP4 and GIF.

Python stdlib only; runs from Git Bash on Windows (python tools/record/compose.py ...).
Subcommands:
  probe   CLIP...                      size, rotation, fps, codec, HDR flag
  strip   CLIP --at T [--dur 2]        contact sheet of every frame, labelled with clip time, to find the sync tap
  compose --stage S --phone P ...      1920x1080 30 fps H.264 MP4, then a looping slide-size GIF from it
See tools/record/README.md for the take-day runbook.
"""
import argparse
import glob
import json
import os
import shutil
import subprocess
import sys

SURROUND = "0x0e1620"  # stage page surround; every panel is letterboxed with it
OUT_W, OUT_H, OUT_FPS = 1920, 1080, 30
PANEL_W = OUT_W // 2
HDR_TRC = {"smpte2084", "arib-std-b67"}
GIF_LIMIT_MB = 10.0


# ---------- finding ffmpeg ----------

def find_tool(name):
    """FFMPEG env var (path to ffmpeg.exe or its folder) > PATH > WinGet Links > WinGet Packages."""
    env = os.environ.get("FFMPEG")
    if env:
        base = env if os.path.isdir(env) else os.path.dirname(env)
        for cand in (os.path.join(base, name + ".exe"), os.path.join(base, name)):
            if os.path.isfile(cand):
                return cand
    hit = shutil.which(name)
    if hit:
        return hit
    local = os.environ.get("LOCALAPPDATA", "")
    pats = [
        os.path.join(local, "Microsoft", "WinGet", "Links", name + ".exe"),
        os.path.join(local, "Microsoft", "WinGet", "Packages", "Gyan.FFmpeg*", "*", "bin", name + ".exe"),
        os.path.join("C:\\", "ffmpeg", "bin", name + ".exe"),
    ]
    for pat in pats:
        hits = sorted(glob.glob(pat))
        if hits:
            return hits[-1]
    sys.exit(f"{name} not found. Install with `winget install Gyan.FFmpeg`, or set FFMPEG to ffmpeg.exe's path.")


FFMPEG = None
FFPROBE = None


def tools():
    global FFMPEG, FFPROBE
    if FFMPEG is None:
        FFMPEG, FFPROBE = find_tool("ffmpeg"), find_tool("ffprobe")
    return FFMPEG, FFPROBE


def run(cmd, quiet=True):
    if not quiet:
        print("+", " ".join(cmd))
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    return r


# ---------- probing ----------

def probe(path):
    _, ffprobe = tools()
    r = run([ffprobe, "-v", "error", "-select_streams", "v:0", "-show_streams", "-show_format", "-of", "json", path])
    if r.returncode != 0:
        sys.exit(f"ffprobe failed on {path}:\n{r.stderr.strip()}")
    data = json.loads(r.stdout)
    if not data.get("streams"):
        sys.exit(f"no video stream in {path}")
    s = data["streams"][0]
    rot = 0
    for sd in s.get("side_data_list", []) or []:
        if "rotation" in sd:
            rot = int(round(float(sd["rotation"])))
    if "rotate" in (s.get("tags") or {}):
        rot = -int(s["tags"]["rotate"])  # old-style tag is clockwise; side data is counter-clockwise
    rot %= 360
    w, h = int(s["width"]), int(s["height"])
    dw, dh = (h, w) if rot in (90, 270) else (w, h)
    num, den = (s.get("avg_frame_rate") or "0/1").split("/")
    fps = float(num) / float(den) if float(den) else 0.0
    trc = s.get("color_transfer", "") or ""
    return {
        "path": path, "codec": s.get("codec_name"), "pix_fmt": s.get("pix_fmt"),
        "width": w, "height": h, "rotation": rot, "display_w": dw, "display_h": dh,
        "fps": fps, "duration": float(data["format"].get("duration") or s.get("duration") or 0),
        "color_transfer": trc, "color_primaries": s.get("color_primaries", ""), "hdr": trc in HDR_TRC,
    }


def describe(info):
    orient = "portrait" if info["display_h"] > info["display_w"] else "landscape"
    hdr = f"HDR ({info['color_transfer']})" if info["hdr"] else "SDR"
    return (f"{info['path']}: {info['codec']} {info['pix_fmt']} {info['width']}x{info['height']}, "
            f"rotation {info['rotation']} -> shown {info['display_w']}x{info['display_h']} {orient}, "
            f"{info['fps']:.2f} fps, {info['duration']:.2f} s, {hdr}")


def cmd_probe(a):
    for p in a.clips:
        print(describe(probe(p)))


# ---------- contact strip ----------

def font_file(faces=("C:/Windows/Fonts/consola.ttf", "C:/Windows/Fonts/arial.ttf",
                      "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf")):
    for f in faces:
        if os.path.isfile(f):
            return f.replace(":", "\\:")
    return None


def label_filter(text, x="32"):
    """A tag burned in at the bottom, e.g. "Desktop simulation": a GIF travels without its slide caption, so a take that
    is not device footage says so in the picture itself. Bottom-left by default; compose centres it between the panels."""
    ff = font_file(("C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf",
                    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
    if not ff:
        sys.exit("--label needs a font and none was found")
    safe = text.replace("\\", "\\\\").replace("'", "\u2019").replace(":", "\\:").replace("%", "\\%")
    return (f"drawtext=fontfile='{ff}':text='{safe}':fontsize=34:fontcolor=0xe8edf2:"
            f"box=1:boxcolor=0x172230@0.92:boxborderw=16:x={x}:y=h-th-32")


def cmd_strip(a):
    ffmpeg, _ = tools()
    info = probe(a.clip)
    os.makedirs(a.out_dir, exist_ok=True)
    stem = os.path.splitext(os.path.basename(a.clip))[0]
    pattern = os.path.join(a.out_dir, f"{stem}-strip-{a.at:.2f}s-%02d.png")
    tile = f"tile={a.cols}x{a.rows}:padding=4:margin=4:color={SURROUND}"
    base = f"trim=start={a.at}:duration={a.dur},scale={a.thumb}:-2"
    ff = font_file()
    vf_text = None
    if ff:
        # pts stays in source-clip time after trim, so labels are the numbers compose wants
        vf_text = (f"{base},drawtext=fontfile='{ff}':text='%{{pts\\:flt}}s  f%{{n}}':"
                   f"x=6:y=6:fontsize={max(12, a.thumb // 12)}:fontcolor=yellow:box=1:boxcolor=black@0.7,{tile}")
    for vf in ([vf_text] if vf_text else []) + [f"{base},{tile}"]:
        r = run([ffmpeg, "-hide_banner", "-y", "-i", a.clip, "-vf", vf, "-fps_mode", "passthrough", pattern])
        if r.returncode == 0:
            break
        print("strip: labelled sheet failed, retrying without labels", file=sys.stderr)
    else:
        sys.exit(r.stderr[-2000:])
    sheets = sorted(glob.glob(pattern.replace("%02d", "??")))
    per = a.cols * a.rows
    print(describe(info))
    print(f"frames from {a.at:.3f} s, {a.cols} per row, {per} per sheet, read left-to-right then down:")
    for i, s in enumerate(sheets):
        t0 = a.at + i * per / (info["fps"] or 30)
        print(f"  {s}  (first tile about {t0:.3f} s)")
    if not vf_text:
        print("  no font found: tile k on sheet i is at about AT + (i*per + k) / fps")


# ---------- compose ----------

def tonemap_chain(mode, trc="arib-std-b67"):
    if mode == "zscale":
        tin = trc if trc in HDR_TRC else "arib-std-b67"  # iPhone HDR video is HLG
        return (f"zscale=tin={tin}:pin=bt2020:min=bt2020nc:t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,"
                "tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p")
    if mode == "simple":  # fallback when zscale is missing: just reinterpret as bt709 (looks flat/washed but works)
        return "colorspace=all=bt709:iall=bt2020:fast=1:format=yuv420p"
    return "format=yuv420p"


def panel_chain(label, crop, rotate_fix, tonemap, hflip=False, denoise=False):
    """Fit one source into a PANEL_W x OUT_H panel, letterboxed with the surround colour."""
    parts = []
    if rotate_fix:
        parts.append(rotate_fix)
    if tonemap:
        parts.append(tonemap)
    if crop:
        parts.append(f"crop={crop}")
    if hflip:
        parts.append("hflip")
    if denoise:  # camera grain is what bloats a GIF; this smooths it before the palette sees it
        parts.append("hqdn3d=4:3:8:6")
    parts += [
        f"fps={OUT_FPS}",
        f"scale={PANEL_W}:{OUT_H}:force_original_aspect_ratio=decrease:flags=lanczos",
        f"pad={PANEL_W}:{OUT_H}:(ow-iw)/2:(oh-ih)/2:color={SURROUND}",
        "setsar=1", "format=yuv420p",
    ]
    return f"[{label}]" + ",".join(parts)


def detect_board(clip, start, dur, margin):
    """Find the bright board on the dark surround with cropdetect; returns w:h:x:y or None."""
    ffmpeg, _ = tools()
    r = run([ffmpeg, "-hide_banner", "-ss", str(start), "-t", str(min(dur, 3)), "-i", clip,
             "-vf", "cropdetect=limit=0.25:round=2:reset=0", "-f", "null", "-"])
    last = None
    for line in r.stderr.splitlines():
        if "crop=" in line:
            last = line.rsplit("crop=", 1)[1].split()[0]
    if not last:
        return None
    w, h, x, y = (int(v) for v in last.split(":"))
    info = probe(clip)
    W, H = info["display_w"], info["display_h"]
    x0, y0 = max(0, x - margin), max(0, y - margin)
    x1, y1 = min(W, x + w + margin), min(H, y + h + margin)
    w, h = x1 - x0, y1 - y0
    if w < 64 or h < 64 or (w >= W - 4 and h >= H - 4):
        return None
    # Grow to the panel's aspect so real surround fills the panel; padding instead leaves a faint
    # seam because the captured surround never lands exactly on 0x0e1620 after encoding.
    aspect = PANEL_W / OUT_H
    cx, cy = x0 + w / 2, y0 + h / 2
    if w / h < aspect:
        w = min(W, round(h * aspect))
    else:
        h = min(H, round(w / aspect))
    w, h = w // 2 * 2, h // 2 * 2
    x0 = int(min(max(0, cx - w / 2), W - w))
    y0 = int(min(max(0, cy - h / 2), H - h))
    return f"{w}:{h}:{x0}:{y0}"


ROT_FIX = {90: "transpose=clock", 180: "hflip,vflip", 270: "transpose=cclock"}


def mb(path):
    return os.path.getsize(path) / 1e6


def cmd_compose(a):
    ffmpeg, _ = tools()
    stage, phone = probe(a.stage), probe(a.phone)
    print("stage:", describe(stage))
    print("phone:", describe(phone))

    if a.sync:
        s_sync, p_sync = a.sync
        s_start = a.start if a.start is not None else s_sync
        p_start = s_start + (p_sync - s_sync)
    else:
        if a.stage_start is None or a.phone_start is None:
            sys.exit("give --sync STAGE_T PHONE_T [--start T], or both --stage-start and --phone-start")
        s_start, p_start = a.stage_start, a.phone_start
    if s_start < 0 or p_start < 0:
        sys.exit(f"start before clip begins (stage {s_start:.3f}, phone {p_start:.3f}); move --start later")
    dur = a.dur
    room = min(stage["duration"] - s_start, phone["duration"] - p_start)
    if room <= 0:
        sys.exit("start is past the end of a clip")
    if dur > room:
        print(f"note: --dur {dur} longer than the clips allow, using {room:.2f} s")
        dur = room
    print(f"window: stage {s_start:.3f}-{s_start + dur:.3f} s, phone {p_start:.3f}-{p_start + dur:.3f} s ({dur:.2f} s)")

    crop = a.stage_crop
    if crop == "auto":
        crop = detect_board(a.stage, s_start, dur, a.crop_margin)
        print(f"stage crop (auto): {crop or 'none found, using full frame'}"
              + (f"  -> pin it with --stage-crop {crop}" if crop else ""))
    elif crop == "none":
        crop = None

    # Rotation: ffmpeg autorotates from the display matrix by default; --phone-rotate replaces that.
    phone_in = ["-noautorotate"] if a.phone_rotate is not None else []
    rot_fix = ROT_FIX.get(a.phone_rotate or 0) if a.phone_rotate is not None else None

    hdr_modes = ["zscale", "simple"] if (phone["hdr"] and a.hdr != "off") or a.hdr == "on" else [None]
    os.makedirs(a.out_dir, exist_ok=True)
    mp4 = os.path.join(a.out_dir, a.name + ".mp4")
    gif = os.path.join(a.out_dir, a.name + ".gif")
    left, right = ("0:v", "1:v") if not a.swap else ("1:v", "0:v")

    for mode in hdr_modes:
        tm = tonemap_chain(mode, phone["color_transfer"]) if mode else None
        if mode:
            print(f"phone HDR -> SDR tone-map: {mode}")
        chains = {
            "0:v": panel_chain("0:v", crop, None, None) + "[st]",
            "1:v": panel_chain("1:v", a.phone_crop, rot_fix, tm, a.phone_hflip, a.denoise) + "[ph]",
        }
        fc = ";".join([chains["0:v"], chains["1:v"]]) + ";"
        fc += ("[st][ph]" if left == "0:v" else "[ph][st]") + f"hstack=inputs=2,trim=duration={dur},setpts=PTS-STARTPTS"
        fc += ("," + label_filter(a.label, "(w-tw)/2") if a.label else "") + "[v]"
        cmd = [ffmpeg, "-hide_banner", "-y",
               "-ss", f"{s_start:.3f}", "-t", f"{dur + 1:.3f}", "-i", a.stage,
               *phone_in, "-ss", f"{p_start:.3f}", "-t", f"{dur + 1:.3f}", "-i", a.phone,
               "-filter_complex", fc, "-map", "[v]", "-an",
               "-c:v", "libx264", "-preset", "medium", "-crf", str(a.crf), "-pix_fmt", "yuv420p",
               "-r", str(OUT_FPS), "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
               "-movflags", "+faststart", mp4]
        r = run(cmd, quiet=not a.verbose)
        if r.returncode == 0:
            break
        print(f"compose failed{' with ' + mode if mode else ''}:\n{r.stderr[-1500:]}", file=sys.stderr)
    else:
        sys.exit("compose failed")
    make_gif(mp4, gif, a)


def make_gif(mp4, gif, a):
    ffmpeg, _ = tools()
    gif_h = round(a.gif_width * OUT_H / OUT_W / 2) * 2
    gvf = (f"fps={a.gif_fps},scale={a.gif_width}:{gif_h}:flags=lanczos,split[a][b];"
           f"[a]palettegen=max_colors={a.colors}:stats_mode=full:reserve_transparent=0[p];"
           f"[b][p]paletteuse=dither={a.dither}" + (":bayer_scale=5" if a.dither == "bayer" else "")
           + ":diff_mode=rectangle")
    r = run([ffmpeg, "-hide_banner", "-y", "-i", mp4, "-filter_complex", gvf, "-loop", "0", gif],
            quiet=not a.verbose)
    if r.returncode != 0:
        sys.exit(f"GIF failed:\n{r.stderr[-1500:]}")

    print(f"MP4 {mp4}: {mb(mp4):.2f} MB, {OUT_W}x{OUT_H} {OUT_FPS} fps")
    g = mb(gif)
    print(f"GIF {gif}: {g:.2f} MB, {a.gif_width}x{gif_h} {a.gif_fps} fps, {a.colors} colours, loops forever")
    if g > GIF_LIMIT_MB:
        print(f"WARNING: GIF over {GIF_LIMIT_MB:.0f} MB target. Try --denoise, a shorter --dur, --gif-fps 12, "
              f"--gif-width 800, --colors 96, or --dither none.")


def cmd_single(a):
    """One clip on its own, e.g. the whole stage window of a take: fitted to 1920x1080, then the same MP4 and GIF."""
    ffmpeg, _ = tools()
    info = probe(a.clip)
    print("clip:", describe(info))
    dur = min(a.dur, info["duration"] - a.start) if a.dur else info["duration"] - a.start
    vf = (f"fps={OUT_FPS},scale={OUT_W}:{OUT_H}:force_original_aspect_ratio=decrease:flags=lanczos,"
          f"pad={OUT_W}:{OUT_H}:(ow-iw)/2:(oh-ih)/2:color={SURROUND},setsar=1,format=yuv420p")
    if a.label:
        vf += "," + label_filter(a.label)
    os.makedirs(a.out_dir, exist_ok=True)
    mp4 = os.path.join(a.out_dir, a.name + ".mp4")
    r = run([ffmpeg, "-hide_banner", "-y", "-ss", f"{a.start:.3f}", "-t", f"{dur:.3f}", "-i", a.clip, "-vf", vf, "-an",
             "-c:v", "libx264", "-preset", "medium", "-crf", str(a.crf), "-pix_fmt", "yuv420p", "-r", str(OUT_FPS),
             "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart", mp4],
            quiet=not a.verbose)
    if r.returncode != 0:
        sys.exit(f"single failed:\n{r.stderr[-1500:]}")
    make_gif(mp4, os.path.join(a.out_dir, a.name + ".gif"), a)


def cmd_frames(a):
    """Frames captured at uneven times (a headless browser's screencast) -> a constant 30 fps MP4. LIST is an ffconcat
    file naming each frame with how long it stayed on screen, as tools/record/sim_take.mjs writes it."""
    ffmpeg, _ = tools()
    r = run([ffmpeg, "-hide_banner", "-y", "-f", "concat", "-safe", "0", "-i", a.list,
             "-vf", f"fps={OUT_FPS},scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p", "-an",
             "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-pix_fmt", "yuv420p",
             "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", a.out])
    if r.returncode != 0:
        sys.exit(f"frames failed:\n{r.stderr[-1500:]}")
    print(f"{a.out}: {describe(probe(a.out))}")


def output_args(c):
    c.add_argument("--label", help='text burned into the bottom-left corner, e.g. "Desktop simulation"')
    c.add_argument("--crf", type=int, default=18)
    c.add_argument("--gif-width", type=int, default=960)
    c.add_argument("--gif-fps", type=int, default=15)
    c.add_argument("--colors", type=int, default=128)
    c.add_argument("--dither", default="bayer", choices=["bayer", "none", "floyd_steinberg", "sierra2_4a"])
    c.add_argument("--name", default="take", help="output basename (default take)")
    c.add_argument("--out-dir", default="recordings/out")
    c.add_argument("-v", "--verbose", action="store_true")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    q = sub.add_parser("probe", help="print size, rotation, fps, HDR flag")
    q.add_argument("clips", nargs="+")
    q.set_defaults(fn=cmd_probe)

    s = sub.add_parser("strip", help="contact sheet of every frame around a time, labelled with clip time")
    s.add_argument("clip")
    s.add_argument("--at", type=float, default=0.0, help="start time in seconds (default 0)")
    s.add_argument("--dur", type=float, default=2.0, help="seconds to show (default 2)")
    s.add_argument("--cols", type=int, default=10)
    s.add_argument("--rows", type=int, default=6)
    s.add_argument("--thumb", type=int, default=240, help="tile width px")
    s.add_argument("--out-dir", default="recordings/strips")
    s.set_defaults(fn=cmd_strip)

    c = sub.add_parser("compose", help="side-by-side MP4 + GIF")
    c.add_argument("--stage", required=True, help="screen capture of the stage page (left panel)")
    c.add_argument("--phone", required=True, help="overhead iPhone video (right panel)")
    c.add_argument("--sync", nargs=2, type=float, metavar=("STAGE_T", "PHONE_T"),
                   help="time of the sync tap in each clip (seconds, from `strip`)")
    c.add_argument("--start", type=float, help="with --sync: window start in STAGE time (default: the sync tap)")
    c.add_argument("--stage-start", type=float, help="instead of --sync: window start in the stage clip")
    c.add_argument("--phone-start", type=float, help="instead of --sync: window start in the phone clip")
    c.add_argument("--dur", type=float, default=8.0, help="seconds (default 8)")
    c.add_argument("--stage-crop", default="auto", help="auto (find the board), none, or w:h:x:y in pixels")
    c.add_argument("--crop-margin", type=int, default=40, help="px kept around the auto-detected board")
    c.add_argument("--phone-crop", help="w:h:x:y crop of the phone clip, after rotation")
    c.add_argument("--phone-rotate", type=int, choices=[0, 90, 180, 270],
                   help="ignore rotation metadata and rotate clockwise by this much")
    c.add_argument("--phone-hflip", action="store_true", help="mirror the phone clip")
    c.add_argument("--denoise", action="store_true", help="smooth phone-camera grain (smaller GIF)")
    c.add_argument("--hdr", choices=["auto", "on", "off"], default="auto", help="tone-map the phone clip")
    c.add_argument("--swap", action="store_true", help="phone on the left")
    output_args(c)
    c.set_defaults(fn=cmd_compose)

    g = sub.add_parser("single", help="one clip alone (e.g. the whole stage window) -> MP4 + GIF")
    g.add_argument("clip")
    g.add_argument("--start", type=float, default=0.0, help="seconds into the clip (default 0)")
    g.add_argument("--dur", type=float, help="seconds (default: to the end)")
    output_args(g)
    g.set_defaults(fn=cmd_single)

    f = sub.add_parser("frames", help="unevenly timed frames (ffconcat list) -> constant 30 fps MP4")
    f.add_argument("list")
    f.add_argument("out")
    f.set_defaults(fn=cmd_frames)

    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
