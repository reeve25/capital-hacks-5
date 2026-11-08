#!/usr/bin/env python3
"""FeelInk recording pipeline: stage capture + overhead phone video -> side-by-side MP4 and GIF.

Python stdlib only; runs from Git Bash on Windows (python tools/record/compose.py ...).
Subcommands:
  probe   CLIP...                      size, rotation, fps, codec, HDR flag
  strip   CLIP --at T [--dur 2]        contact sheet of every frame, labelled with clip time, to find the sync tap
  compose --stage S --phone P ...      1920x1080 30 fps H.264 MP4, then a looping slide-size GIF from it
  story   SPEC.json                    the annotated take: role headers and simulation tags inside each panel, step
                                       captions at logged event times, tutor-control insets, legend, phone frame, stills
See tools/record/README.md for the take-day runbook.
"""
import argparse
import glob
import json
import math
import os
import shutil
import struct
import subprocess
import sys
import tempfile
import zlib

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


# ---------- story: the annotated take ----------
# A judge sees the clip for a few seconds, often cropped onto a slide, so every panel carries its own role header and
# its own simulation tag. The interaction gets the space: the middle column holds one short sentence per beat (at the
# times the take logged) and, only while the tutor uses a control, a live inset of it.

FACES = {
    "bold": ("C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
    "semi": ("C:/Windows/Fonts/seguisb.ttf", "C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf",
             "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
    "reg": ("C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/arial.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
}
# The layout's text, tag and frame colours (teal and amber are the stage's own, feelink/stage-board.js COL).
C = {"bg": (14, 22, 32), "text": (232, 237, 242), "muted": (150, 166, 181), "teal": (43, 179, 163), "amber": (255, 176, 32),
     "rule": (38, 51, 63), "card": (23, 34, 48), "tag": (36, 27, 8), "bezel": (30, 40, 52), "edge": (70, 86, 104),
     "tutor": (124, 196, 255), "student": (196, 178, 255)}
PANELS = {"stage": (0, 680), "mid": (680, 1240), "phone": (1240, 1920)}  # x ranges of the three columns
# Rows, top to bottom. The board window and phone screen are height-bound, so they get every row the text does not need:
# header (30 px) and subheader (20 px) above DEV_Y; below, the phone's speech bubble, then each side panel's simulation
# tag (head plus one qualifier line) ending TAG_BOTTOM. The board has no bubble under it, so it runs down to the bubble's
# bottom edge; the phone screen stops above the bubble.
DEV_Y, BUB_H, TAG_BOTTOM = 88, 40, OUT_H - 10
TAG = dict(size=17, head=19, pad=8)  # tag_box sizes for the story's side panels
SLOT = (712, 262, 496, 340)  # inset slot in the middle column: x, y, w, h
CAP = 32  # caption size in the 1920 master (about 21 px in the 1280 GIF); each caption may wrap to two lines at most


def hexc(c):
    return "0x%02x%02x%02x" % tuple(c[:3])


def _extent(x, y, w, h, r, sy):
    """Horizontal extent [a, b) of a rounded rectangle at height sy, or None."""
    if sy < y or sy > y + h:
        return None
    dy = max(0.0, y + r - sy, sy - (y + h - r))
    ins = r - math.sqrt(max(0.0, r * r - dy * dy)) if dy > 0 else 0.0
    return x + ins, x + w - ins


def _cover(px, span):
    return 0.0 if span is None else max(0.0, min(px + 1.0, span[1]) - max(float(px), span[0]))


class Plate:
    """An RGBA picture drawn in plain Python and saved as PNG: the rounded shapes ffmpeg's drawbox cannot draw (phone
    frame, tag boxes, legend swatches). Edges are smoothed with four sub-rows per pixel row."""

    def __init__(self, w, h, fill=(0, 0, 0, 0)):
        self.w, self.h = w, h
        self.px = bytearray(bytes(tuple(fill) + (255,) * (4 - len(fill))) * (w * h))

    def rect(self, x, y, w, h, col, r=0, hole=None, clear=False):
        """Fill a rounded rectangle, minus an optional hole (x, y, w, h, r); clear=True erases instead of painting."""
        col = tuple(col) + (255,) * (4 - len(col))
        for row in range(max(0, int(y)), min(self.h, math.ceil(y + h))):
            subs = [row + (k + 0.5) / 4 for k in range(4)]
            outer = [_extent(x, y, w, h, r, s) for s in subs]
            inner = [_extent(*hole, s) for s in subs] if hole else [None] * 4
            spans = [o for o in outer if o]
            if not spans:
                continue
            ins = [i for i in inner if i]
            void = (math.ceil(max(a for a, _ in ins)), math.floor(min(b for _, b in ins))) if len(ins) == 4 else (0, 0)
            for px in range(max(0, int(min(a for a, _ in spans))), min(self.w, math.ceil(max(b for _, b in spans)))):
                if void[0] <= px < void[1]:
                    continue
                cov = sum(_cover(px, o) - _cover(px, i) for o, i in zip(outer, inner)) / 4
                if cov > 0.001:
                    self._paint(row, px, col, min(1.0, cov), clear)

    def outline(self, x, y, w, h, r, t, col):
        self.rect(x, y, w, h, col, r, hole=(x + t, y + t, w - 2 * t, h - 2 * t, max(0, r - t)))

    def _paint(self, row, px, col, cov, clear):
        p, i = self.px, (row * self.w + px) * 4
        if clear:
            p[i + 3] = round(p[i + 3] * (1 - cov))
            return
        a, da = col[3] / 255 * cov, p[i + 3] / 255
        oa = a + da * (1 - a)
        if oa <= 0:
            return
        for k in range(3):
            p[i + k] = min(255, round((col[k] * a + p[i + k] * da * (1 - a)) / oa))
        p[i + 3] = round(oa * 255)

    def save(self, path):
        stride = self.w * 4
        raw = b"".join(b"\x00" + bytes(self.px[r * stride:(r + 1) * stride]) for r in range(self.h))

        def chunk(tag, data):
            return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        with open(path, "wb") as f:
            f.write(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", self.w, self.h, 8, 6, 0, 0, 0))
                    + chunk(b"IDAT", zlib.compress(raw, 6)) + chunk(b"IEND", b""))


def text_w(s, size, face="reg"):
    """Rough rendered width (Segoe UI-like metrics); wrapping only needs to be safe, not exact."""
    em = 0.0
    for ch in s:
        em += (0.27 if ch in " .,:;'\u2019!|il()[]" else 0.34 if ch in "fjtrI\u201c\u201d\"" else
               0.86 if ch in "mwMW" else 0.64 if ch.isupper() else 0.56 if ch.isdigit() else 0.53)
    return em * size * (1.0 if face == "reg" else 1.06)


def wrap(text, size, width, face="reg"):
    lines, cur = [], ""
    for word in text.split():
        t = f"{cur} {word}" if cur else word
        if cur and text_w(t, size, face) > width:
            lines.append(cur)
            cur = word
        else:
            cur = t
    return lines + ([cur] if cur else [])


class Texts:
    """drawtext filters reading their text from files (no filtergraph escaping of quotes, colons or commas)."""

    def __init__(self, tmp):
        self.tmp, self.filters = tmp, []
        self.fonts = {}
        for face, cands in FACES.items():
            hit = next((f for f in cands if os.path.isfile(f)), None)
            if not hit:
                sys.exit(f"story needs a {face} font; none of {cands} exists")
            self.fonts[face] = hit.replace(":", "\\:")

    def add(self, text, x, y, size, col, face="reg", when=None):
        name = f"t{len(self.filters):03d}.txt"
        with open(os.path.join(self.tmp, name), "w", encoding="utf-8", newline="") as f:
            f.write(text)
        s = (f"drawtext=fontfile='{self.fonts[face]}':textfile={name}:expansion=none:fontsize={size}:"
             f"fontcolor={hexc(col)}:x={x}:y={y}")
        if when:
            s += f":enable='between(t,{when[0]:.3f},{when[1]:.3f})'"
        self.filters.append(s)

    def block(self, lines, x0, x1, y, size, col, face="reg", lh=None, when=None, center=False):
        """Lines, wrapped to fit x0..x1, left-aligned (or centred); returns the y below the block."""
        lh = lh or round(size * 1.3)
        for raw in lines:
            for line in wrap(raw, size, x1 - x0, face):
                self.add(line, f"{(x0 + x1) // 2}-tw/2" if center else x0, y, size, col, face, when)
                y += lh
        return y


def tag_box(plate, texts, x, y, w, lines, size=18, head=22, bottom=None, pad=12):
    """The simulation tag: an amber-edged box, the first line in amber capitals, the rest in body text. With bottom, the
    box grows upward from there, so a longer tag never runs off the frame. Returns the box height."""
    body = [ln for raw in lines[1:] for ln in wrap(raw, size, w - 32)]
    lh = round(size * 1.35)
    h = 2 * pad + head + 10 + len(body) * lh
    if bottom is not None:
        y = bottom - h
    plate.rect(x, y, w, h, C["tag"], 10)
    plate.outline(x, y, w, h, 10, 2, C["amber"])
    texts.add(lines[0], x + 16, y + pad, head, C["amber"], "bold")
    texts.block(body, x + 16, x + w - 16, y + pad + head + 10, size, C["text"], lh=lh)
    return h


def check_inside(what, box, x0, x1):
    """A header or tag must sit wholly inside its own panel, so a crop of that panel alone keeps it."""
    bx, _, bw, _ = box
    assert x0 <= bx and bx + bw <= x1, f"{what} at x {bx}..{bx + bw} leaves its panel {x0}..{x1}"


def story_plates(spec, tmp, texts, crop, phone_wh):
    """The layout, the base plate (under the video) and the top plate (phone frame over the screen's corners). Returns
    the board window, phone screen and speech bubble rectangles."""
    base, top = Plate(OUT_W, OUT_H, C["bg"]), Plate(OUT_W, OUT_H)
    for x in (PANELS["mid"][0], PANELS["mid"][1]):
        base.rect(x, 24, 1, OUT_H - 48, C["rule"])
    # Headers and tags inside the two side panels. A tag is its head plus one qualifier line, so it stays short.
    tag_top = OUT_H
    for key in ("stage", "phone"):
        x0, x1 = PANELS[key]
        title, sub = spec["headers"][key]
        for what, t, size, face in (("header", title, 30, "bold"), ("subheader", sub, 20, "reg")):
            check_inside(f"{key} {what}", ((x0 + x1) / 2 - text_w(t, size, face) / 2, 0, text_w(t, size, face), 0), x0, x1)
        texts.add(title, f"{(x0 + x1) // 2}-tw/2", 10, 30, C["text"], "bold")
        texts.add(sub, f"{(x0 + x1) // 2}-tw/2", 46, 20, C["muted"])
        box = (x0 + 16, 0, x1 - x0 - 32, 0)
        check_inside(f"{key} tag", box, x0, x1)
        tag = spec["tags"][key]
        assert len(tag) == 2 and len(wrap(tag[1], TAG["size"], box[2] - 32)) == 1, \
            f"{key} tag must be a head and one qualifier line; shorten {tag[1:]}"
        tag_top = min(tag_top, TAG_BOTTOM - tag_box(base, texts, box[0], 0, box[2], tag, bottom=TAG_BOTTOM, **TAG))
    # The phone screen stops above the speech bubble; the board, with nothing under it, runs down to the bubble's bottom.
    bz = 12  # phone bezel
    assert DEV_Y - bz >= 46 + round(20 * 1.35), "the subheader would touch the phone frame"
    bub = (PANELS["phone"][0] + 24, tag_top - 8 - BUB_H, PANELS["phone"][1] - PANELS["phone"][0] - 48, BUB_H)
    bw, bh = fit(crop[2], crop[3], PANELS["stage"][1] - PANELS["stage"][0] - 48, bub[1] + BUB_H - 4 - DEV_Y)
    board_win = (sum(PANELS["stage"]) // 2 - bw // 2, DEV_Y, bw, bh)
    sw, sh = fit(*phone_wh, PANELS["phone"][1] - PANELS["phone"][0] - 48 - 2 * bz, bub[1] - 8 - bz - DEV_Y)
    screen = (sum(PANELS["phone"]) // 2 - sw // 2, DEV_Y, sw, sh)
    # The board window's edge, and the phone: a frame with rounded screen corners, camera hole and side buttons.
    top.outline(board_win[0] - 4, DEV_Y - 4, bw + 8, bh + 8, 14, 2, C["edge"])
    sx, sy = screen[:2]
    top.rect(sx - bz, sy - bz, sw + 2 * bz, sh + 2 * bz, C["bezel"], 46, hole=(sx, sy, sw, sh, 32))
    top.outline(sx - bz, sy - bz, sw + 2 * bz, sh + 2 * bz, 46, 2, C["edge"])
    top.rect(sx + sw / 2 - 7, sy + 12, 14, 14, (5, 8, 11), 7)
    top.outline(sx + sw / 2 - 8, sy + 11, 16, 16, 8, 2, (40, 50, 62))
    for y0, h in ((150, 70), (250, 110)):
        top.rect(sx + sw + bz, sy + y0, 5, h, C["edge"], 2)
    # Middle column: its heading. The captions and insets are timed, so cmd_story adds them.
    texts.add("WHAT HAPPENS", SLOT[0], 14, 20, C["muted"], "bold")
    base.save(os.path.join(tmp, "base.png"))
    top.save(os.path.join(tmp, "top.png"))
    return board_win, screen, bub


def fit(w, h, bw, bh):
    s = min(bw / w, bh / h)
    return int(w * s) // 2 * 2, int(h * s) // 2 * 2


def from_caption(spec, n):
    """The same take cut to start 0.8 s before caption n (1-based): the clips seek later and every time shifts; earlier
    captions, and insets and speech over by then, are dropped, so the step counter restarts at 1. No stills."""
    t = max(0.0, spec["captions"][n - 1]["t0"] - 0.8)

    def shift(items):
        return [dict(k, t0=round(max(0.0, k["t0"] - t), 3), t1=round(k["t1"] - t, 3)) for k in items if k["t1"] > t]
    caps = shift(spec["captions"][n - 1:])
    caps[0]["t0"] = 0.0  # the first caption is up from the first frame
    return dict(spec, dur=round(float(spec["dur"]) - t, 3), stage_start=spec.get("stage_start", 0) + t,
                phone_start=spec.get("phone_start", 0) + t, captions=caps, insets=shift(spec["insets"]),
                speech=shift(spec["speech"]), stills=[])


def cmd_story(a):
    ffmpeg, _ = tools()
    with open(a.spec, encoding="utf-8") as f:
        spec = json.load(f)
    if a.from_caption:
        spec = from_caption(spec, a.from_caption)
    stage, phone = probe(spec["stage"]), probe(spec["phone"])
    dur = float(spec["dur"])
    for k in spec["captions"] + spec["insets"] + spec["speech"]:
        assert 0 <= k["t0"] < k["t1"] <= dur + 0.01, f"{k} is not inside the take's 0..{dur} s"
    os.makedirs(a.out_dir, exist_ok=True)
    out_dir = os.path.abspath(a.out_dir)
    tmp = tempfile.mkdtemp(prefix="feelink-story-")
    texts = Texts(tmp)

    # Board window: the board plus a 12 px rim, scaled to the height the layout leaves and centred in the stage panel.
    x, y, w, h = spec["board"]
    m = 12
    crop = (max(0, x - m), max(0, y - m), w + 2 * m, h + 2 * m)
    board_win, screen, bub = story_plates(spec, tmp, texts, crop, (phone["display_w"], phone["display_h"]))
    bw, bh, sw, sh = board_win[2], board_win[3], screen[2], screen[3]
    print(f"layout: board window {bw}x{bh}, phone screen {sw}x{sh}")

    # Captions at the logged times: who acts, then one short sentence (the bubble under the phone shows what it said).
    x0, x1 = SLOT[0], SLOT[0] + SLOT[2]
    n = len(spec["captions"])
    for i, c in enumerate(spec["captions"]):
        when = (c["t0"], c["t1"])
        assert len(wrap(c["text"], CAP, x1 - x0, "semi")) <= 2, f"caption {i + 1} runs past two lines: {c['text']}"
        texts.add(f"STEP {i + 1} OF {n}", f"{x1}-tw", 14, 20, C["muted"], "bold", when)
        who = "TUTOR" if c["who"] == "tutor" else "STUDENT (SCRIPTED FINGER)"
        texts.add(who, x0, 56, 24, C[c["who"]], "bold", when)
        texts.block([c["text"]], x0, x1, 96, CAP, C["text"], "semi", lh=42, when=when)
    # Insets: a live crop of the tutor control, only while it is in use, from the same stage frames.
    insets = []
    for k in spec["insets"]:
        # A 10 px margin, so the control's own edge and heading are not cut by the crop.
        rx, ry, rw, rh = k["rect"]
        x_, y_ = max(0, rx - 10), max(0, ry - 10)
        k = dict(k, rect=[x_, y_, min(stage["display_w"], rx + rw + 10) - x_, min(stage["display_h"], ry + rh + 10) - y_])
        iw, ih = fit(k["rect"][2], k["rect"][3], SLOT[2], SLOT[3])
        ix, iy = SLOT[0] + (SLOT[2] - iw) // 2, SLOT[1] + (SLOT[3] - ih) // 2
        insets.append((k, iw, ih, ix, iy))
        texts.add(k["title"], x0, SLOT[1] - 32, 18, C["muted"], "bold", (k["t0"], k["t1"]))
    # What the phone said, in a bubble under the phone: speech is sound, so it stays off the dark screen.
    draws = []
    for s in spec["speech"]:
        when = f"enable='between(t,{s['t0']:.3f},{s['t1']:.3f})'"
        draws.append(f"drawbox=x={bub[0]}:y={bub[1]}:w={bub[2]}:h={bub[3]}:color={hexc(C['card'])}:t=fill:{when}")
        draws.append(f"drawbox=x={bub[0]}:y={bub[1]}:w={bub[2]}:h={bub[3]}:color={hexc(C['teal'])}:t=2:{when}")
        line = f"Spoken (emulated): \u201c{s['text']}\u201d"
        size = max(14, min(24, int(24 * (bub[2] - 28) / text_w(line, 24, "semi"))))  # long phrases shrink to fit
        texts.add(line, f"{bub[0] + bub[2] // 2}-tw/2", f"{bub[1] + bub[3] // 2}-th/2", size, C["text"], "semi",
                  (s["t0"], s["t1"]))
    for k, iw, ih, ix, iy in insets:
        draws.append(f"drawbox=x={ix - 3}:y={iy - 3}:w={iw + 6}:h={ih + 6}:color={hexc(C['edge'])}:t=2:"
                     f"enable='between(t,{k['t0']:.3f},{k['t1']:.3f})'")

    fc = [f"[1:v]fps={OUT_FPS},setpts=PTS-STARTPTS,split={1 + len(insets)}" + "".join(f"[s{i}]" for i in range(1 + len(insets))),
          f"[s0]crop={crop[2]}:{crop[3]}:{crop[0]}:{crop[1]},scale={bw}:{bh}:flags=lanczos[board]",
          f"[2:v]fps={OUT_FPS},setpts=PTS-STARTPTS,scale={sw}:{sh}:flags=lanczos[ph]",
          f"[0:v][board]overlay={board_win[0]}:{board_win[1]}[c0]", f"[c0][ph]overlay={screen[0]}:{screen[1]}[c1]"]
    last = "c1"
    for i, (k, iw, ih, ix, iy) in enumerate(insets, 1):
        r = [round(v) for v in k["rect"]]
        fc.append(f"[s{i}]crop={r[2]}:{r[3]}:{r[0]}:{r[1]},scale={iw}:{ih}:flags=lanczos[i{i}]")
        fc.append(f"[{last}][i{i}]overlay={ix}:{iy}:enable='between(t,{k['t0']:.3f},{k['t1']:.3f})'[c{i + 1}]")
        last = f"c{i + 1}"
    stills = spec.get("stills", [])
    frames = [min(round(s["t"] * OUT_FPS), int(dur * OUT_FPS) - 1) for s in stills]
    fc.append(f"[{last}][3:v]overlay=0:0," + ",".join(draws + texts.filters)
              + f",trim=duration={dur:.3f},setpts=PTS-STARTPTS,format=yuv420p,split=2[v][vs]")
    fc.append("[vs]select='" + "+".join(f"eq(n,{n_})" for n_ in frames) + "'[st]" if frames else "[vs]nullsink")
    with open(os.path.join(tmp, "graph.txt"), "w", encoding="utf-8") as f:
        f.write(";\n".join(fc))
    mp4 = os.path.join(out_dir, a.name + ".mp4")
    loop = ["-loop", "1", "-framerate", str(OUT_FPS), "-t", f"{dur + 0.5:.3f}"]
    cmd = [ffmpeg, "-hide_banner", "-y", *loop, "-i", "base.png",
           "-ss", f"{spec.get('stage_start', 0):.3f}", "-t", f"{dur + 1:.3f}", "-i", os.path.abspath(spec["stage"]),
           "-ss", f"{spec.get('phone_start', 0):.3f}", "-t", f"{dur + 1:.3f}", "-i", os.path.abspath(spec["phone"]),
           *loop, "-i", "top.png", "-/filter_complex", "graph.txt",
           "-map", "[v]", "-an", "-c:v", "libx264", "-preset", "medium", "-crf", str(a.crf), "-pix_fmt", "yuv420p",
           "-r", str(OUT_FPS), "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
           "-movflags", "+faststart", mp4]
    if frames:
        cmd += ["-map", "[st]", "-fps_mode", "passthrough", "-frames:v", str(len(frames)), "still-%02d.png"]
    r = subprocess.run(cmd, cwd=tmp, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        sys.exit(f"story failed:\n{r.stderr[-2500:]}")
    for i, s in enumerate(stills, 1):
        dst = os.path.join(out_dir, f"{a.name}-still-{s['name']}.png")
        shutil.move(os.path.join(tmp, f"still-{i:02d}.png"), dst)
        print(f"still {dst} at {s['t']:.2f} s")
    make_gif(mp4, os.path.join(out_dir, a.name + ".gif"), a)
    if not a.from_caption:  # the whole-stage cut and the session still come from the full take only
        story_stage_cut(spec, a, out_dir)
        if spec.get("session_rect"):
            story_session_still(spec, a, out_dir)
    shutil.rmtree(tmp, ignore_errors=True)


def story_session_still(spec, a, out_dir):
    """NAME-still-6-session-panel.png: the tutor's view of the student at twice its size, for its own slide (the stage
    GIF shrinks this text to 8-9 px), with its own header and tag."""
    ffmpeg, _ = tools()
    x, y, w, h = (round(v) for v in spec["session_rect"])
    s, m, head = 2, 32, 104
    cw = w * s + 2 * m
    tmp = tempfile.mkdtemp(prefix="feelink-session-")
    texts = Texts(tmp)
    tag_h = tag_box(Plate(1, 1), Texts(tmp), 0, 0, cw - 2 * m, spec["tags"]["whole"])  # measure only
    ch = head + h * s + 24 + tag_h + 24
    plate = Plate(cw, ch, C["bg"])
    tag_box(plate, texts, m, head + h * s + 24, cw - 2 * m, spec["tags"]["whole"])
    texts.add("Tutor's laptop: session panel", m, 22, 32, C["text"], "bold")
    texts.add("The tutor's view of the student, live", m, 64, 22, C["muted"])
    plate.save(os.path.join(tmp, "plate.png"))
    with open(os.path.join(tmp, "graph.txt"), "w", encoding="utf-8") as f:
        f.write(f"[1:v]setpts=PTS-STARTPTS,crop={w}:{h}:{x}:{y},scale={w * s}:{h * s}:flags=lanczos[c];[0:v][c]overlay={m}:{head},"
                + ",".join(texts.filters) + "[v]")
    out = os.path.join(out_dir, f"{a.name}-still-6-session-panel.png")
    r = subprocess.run([ffmpeg, "-hide_banner", "-y", "-i", "plate.png",
                        "-ss", f"{spec.get('stage_start', 0) + spec['establish_t']:.3f}", "-i", os.path.abspath(spec["stage"]),
                        "-/filter_complex", "graph.txt", "-map", "[v]", "-frames:v", "1", out],
                       cwd=tmp, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        sys.exit(f"session still failed:\n{r.stderr[-2500:]}")
    print(f"still {out} at {spec['establish_t']:.2f} s (session panel, {s}x)")
    shutil.rmtree(tmp, ignore_errors=True)


def stage_cut_plate(spec, texts, callouts=False):
    """Over the whole stage window: a role header in the gutter left of the board, and the simulation tag inside the
    tools panel, inside the board and inside the session panel, so a crop of any one of them keeps it. With callouts,
    each region is outlined and named (the establishing still)."""
    plate = Plate(OUT_W, OUT_H)
    bx, by, bw, bh = spec["board"]
    tx, ty, tw_, th = spec["tools"]
    px_, py_, pw, ph = spec["session"]
    gx0, gx1 = tx + tw_ + 20, bx - 20
    texts.add(spec["headers"]["stage"][0], gx0, 24, 28, C["text"], "bold")
    texts.block([spec["headers"]["stage"][1] + ".", "This is the whole screen."], gx0, gx1, 62, 20, C["muted"])
    short = spec["tags"]["whole"]
    tag_box(plate, texts, tx + 16, 0, tw_ - 32, short, bottom=ty + th - 12)
    tag_box(plate, texts, bx + 16, 0, bw - 32, short, bottom=by + bh - 12)
    tag_box(plate, texts, px_ + 16, 0, pw - 32, short, bottom=py_ + ph - 96)  # above the "Spoken on their phone" drawer
    if callouts:
        for c in spec["callouts"]:
            x, y, w, h = c["rect"]
            plate.outline(x - 6, y - 6, w + 12, h + 12, 12, 3, C["amber"])
            cx, cy, cw = c["at"]
            lines = [ln for raw in c["lines"] for ln in wrap(raw, 21, cw - 32)]
            chh = 20 + 30 + len(lines) * 28 + 12
            plate.rect(cx, cy, cw, chh, C["card"], 12)
            plate.outline(cx, cy, cw, chh, 12, 2, C["amber"])
            texts.add(c["title"], cx + 16, cy + 14, 24, C["amber"], "bold")
            texts.block(lines, cx + 16, cx + cw - 16, cy + 50, 21, C["text"], lh=28)
    return plate


def story_stage_cut(spec, a, out_dir):
    """NAME-stage.mp4/.gif: the whole stage window with header and tags; NAME-still-0-establishing.png: one frame of it
    with every region outlined and named."""
    ffmpeg, _ = tools()
    dur = float(spec["dur"])
    for est in (False, True):
        tmp = tempfile.mkdtemp(prefix="feelink-cut-")
        texts = Texts(tmp)
        stage_cut_plate(spec, texts, est).save(os.path.join(tmp, "plate.png"))
        with open(os.path.join(tmp, "graph.txt"), "w", encoding="utf-8") as f:
            f.write(f"[0:v]fps={OUT_FPS},setpts=PTS-STARTPTS,scale={OUT_W}:{OUT_H}[s];[s][1:v]overlay=0:0,"
                    + ",".join(texts.filters) + ",format=yuv420p[v]")
        src = ["-ss", f"{spec.get('stage_start', 0) + (spec['establish_t'] if est else 0):.3f}",
               "-t", f"{dur:.3f}", "-i", os.path.abspath(spec["stage"]), "-i", "plate.png"]
        if est:
            out = os.path.join(out_dir, f"{a.name}-still-0-establishing.png")
            cmd = [ffmpeg, "-hide_banner", "-y", *src, "-/filter_complex", "graph.txt", "-map", "[v]",
                   "-frames:v", "1", out]
        else:
            out = os.path.join(out_dir, f"{a.name}-stage.mp4")
            cmd = [ffmpeg, "-hide_banner", "-y", *src, "-/filter_complex", "graph.txt", "-map", "[v]", "-an",
                   "-c:v", "libx264", "-preset", "medium", "-crf", str(a.crf), "-pix_fmt", "yuv420p", "-r", str(OUT_FPS),
                   "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart", out]
        r = subprocess.run(cmd, cwd=tmp, capture_output=True, text=True, encoding="utf-8", errors="replace")
        if r.returncode != 0:
            sys.exit(f"stage cut failed:\n{r.stderr[-2500:]}")
        if est:
            print(f"still {out} at {spec['establish_t']:.2f} s (establishing, whole stage)")
        else:
            make_gif(out, os.path.join(out_dir, f"{a.name}-stage.gif"), a)
        shutil.rmtree(tmp, ignore_errors=True)


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

    t = sub.add_parser("story", help="annotated take (headers, tags, captions, insets, stills) from a spec JSON")
    t.add_argument("spec", help="JSON written by tools/record/sim_take.mjs (see README section 8)")
    t.add_argument("--from-caption", type=int, metavar="N",
                   help="pitch cut: start 0.8 s before caption N, renumber the steps, no stills or stage cut")
    output_args(t)
    t.set_defaults(fn=cmd_story)

    f = sub.add_parser("frames", help="unevenly timed frames (ffconcat list) -> constant 30 fps MP4")
    f.add_argument("list")
    f.add_argument("out")
    f.set_defaults(fn=cmd_frames)

    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
