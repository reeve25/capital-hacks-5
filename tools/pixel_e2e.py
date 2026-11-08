#!/usr/bin/env python3
"""FeelInk end-to-end check on the USB Pixel: tutor stroke -> phone buzz -> finger back to the laptop.

  python tools/pixel_e2e.py                    real run: relay on :8765, /feel open in Live mode on the Pixel
  python tools/pixel_e2e.py --simulate --relay http://127.0.0.1:8799
                                               no phone: this script posts the finger events, labelled SIMULATED
  python tools/pixel_e2e.py --selftest         offline checks of the maths and parsing, plus a simulated relay run

A real run draws a test stroke on the live board and injects touches with `adb shell input`, so run it only
while nobody is using the phone. /feel must already be in Live mode: if the first (held) touch sends no finger
event, it stops there. Afterwards it sends Undo, the same event as draw.html's button, but only while its stroke
is still the newest item, since Undo removes the newest stroke or landmark; then it checks the relay's sync that the
Undo took its stroke. Stdlib only.
"""
import argparse
import bisect
import http.client
import importlib.util
import json
import math
import os
import re
import shutil
import statistics
import subprocess
import sys
import threading
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlsplit

# Copied from feelink/tactile.js (BOARD) and feelink/feel.html (SCREEN_WIDTH_MM); keep them in sync.
BOARD_W, BOARD_H, SCREEN_WIDTH_MM = 56, 120, 64.6
STROKE = [(10 + 3 * i, 60) for i in range(13)]  # horizontal test line across the middle of the board
ON_LINE = (28, 60)  # its midpoint, far from both ends, so the page plays the plain hold and not an end pattern
SWIPE = ((28, 40), (28, 80))  # vertical, crossing the line at ON_LINE
TAPS = 3
CHROME = "com.android.chrome"
DEFAULT_ADB = Path.home() / "AppData/Local/Android/platform-tools/adb.exe"

# Python 3.12's time.time() ticks every 15.6 ms on Windows, so laptop times are one anchor plus perf_counter.
_ANCHOR = (time.time(), time.perf_counter())


def now():
    return _ANCHOR[0] + time.perf_counter() - _ANCHOR[1]


def find_adb():
    adb = os.environ.get("ADB") or shutil.which("adb") or (str(DEFAULT_ADB) if DEFAULT_ADB.exists() else None)
    if not adb:
        raise SystemExit("adb not found: set ADB, put it on PATH, or install Android platform-tools")
    return adb


# ---- Geometry: device px <-> board mm, the way feel.html does it ----

def parse_wm(size_text, density_text):
    """`wm size` and `wm density` output -> (width px, height px, dpi). An Override line, if any, is what apps get."""
    size = re.findall(r"(?:Physical|Override) size: (\d+)x(\d+)", size_text)
    dens = re.findall(r"(?:Physical|Override) density: (\d+)", density_text)
    if not size or not dens:
        raise ValueError(f"unexpected wm output: {size_text!r} {density_text!r}")
    return int(size[-1][0]), int(size[-1][1]), int(dens[-1])


def geometry(width_px, height_px, dpi, viewport=None, top=0.0, screen_mm=SCREEN_WIDTH_MM):
    """feel.html's board placement in CSS px. By default assumes the page is fullscreen (Live mode requests it):
    CSS (0,0) is the screen's top-left and the viewport is the whole screen. `viewport` (CSS px, w x h) and
    `top` (CSS px of browser UI above the page) describe a page that is not fullscreen."""
    dpr = dpi / 160
    vw, vh = viewport or (width_px / dpr, height_px / dpr)
    ppm = vw / screen_mm
    return {"dpr": dpr, "top": top, "vw": vw, "vh": vh, "ppm": ppm,
            "ox": (vw - BOARD_W * ppm) / 2, "oy": (vh - BOARD_H * ppm) / 2}


def px_to_mm(g, x, y):
    """Device px / dpr is Chrome's clientX/Y; the rest is feel.html's toMm."""
    return (x / g["dpr"] - g["ox"]) / g["ppm"], (y / g["dpr"] - g["top"] - g["oy"]) / g["ppm"]


def mm_to_px(g, x, y):
    return round((g["ox"] + x * g["ppm"]) * g["dpr"]), round((g["top"] + g["oy"] + y * g["ppm"]) * g["dpr"])


def dist_to_segment(p, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    t = max(0.0, min(1.0, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)))
    return math.dist(p, (a[0] + t * dx, a[1] + t * dy))


# ---- dumpsys vibrator_manager and the phone clock ----

VIB_LINE = re.compile(
    r"^\s*(?P<created>\d\d-\d\d \d\d:\d\d:\d\d\.\d{3}) \|\s*\w+ \|\s*(?P<status>\w+) \| duration:\s*(?P<ms>\d+)ms"
    r".*?\| usage: (?P<usage>\w+) \|(?: audioUsage=\w+ \|)? (?P<pkg>[\w.]+) \(uid="
    r"(?:.*\| played: (?P<played>.*?) \| original: (?P<original>.*?)\s*$)?")


def parse_vibrations(text):
    """dumpsys vibrator_manager -> {key: entry} for every vibration it lists, deduplicated across its sections."""
    out = {}
    for line in text.splitlines():
        m = VIB_LINE.match(line)
        if not m:
            continue
        d = m.groupdict()
        steps = re.findall(r"Step=(\d+)ms", d["original"] if d["original"] not in (None, "null") else d["played"] or "")
        # Chrome logs one entry per on-step of a pattern (measured Nov 7), so a Chrome entry has a single step.
        d["step"] = int(steps[0]) if len(steps) == 1 else None
        d["stop"] = d["step"] == 1  # feel.html's stop is vibrate(1), because Chrome on the Pixel ignores vibrate(0)
        d["ms"] = int(d["ms"])
        out[(d["created"], d["pkg"], d["usage"])] = d
    return out


def new_chrome_vibrations(before_text, after_text):
    before = parse_vibrations(before_text)
    new = [e for k, e in parse_vibrations(after_text).items() if k not in before and e["pkg"] == CHROME]
    return sorted(new, key=lambda e: e["created"])


def parse_tz_year(line):
    """`date '+%z %Y'` on the phone -> (UTC offset s, year), to read dumpsys's local, yearless times."""
    tz, year = line.split()
    sign = -1 if tz.startswith("-") else 1
    return sign * (int(tz[1:3]) * 3600 + int(tz[3:5]) * 60), int(year)


def phone_epoch(created, sync):
    """A dumpsys time ('MM-DD HH:MM:SS.mmm', phone local time, no year) -> phone epoch seconds."""
    dt = datetime.strptime(f"{sync['year']}-{created}", "%Y-%m-%d %H:%M:%S.%f")
    return dt.replace(tzinfo=timezone(timedelta(seconds=sync["tz"]))).timestamp()


def phone_to_laptop(created, sync):
    return phone_epoch(created, sync) - sync["offset"]


# ---- The page's own haptic events (#34), when its build sends them ----

def on_steps(pattern, start=0.0, end=math.inf):
    """vibrate(pattern) -> [(start ms, length ms)] for its on-steps that begin before `end`."""
    pattern = [pattern] if isinstance(pattern, (int, float)) else list(pattern or [])
    out, at = [], start
    for i, ms in enumerate(pattern):
        if at >= end:
            break
        if i % 2 == 0 and ms > 0:
            out.append((at, ms))
        at += ms
    return out


def match_haptics(haptics, entries, slack_ms=10):
    """Page vibrate calls vs Chrome's dumpsys entries, both on the phone clock in ms.
    haptics: the page's haptic events ({pattern, ok, t}); entries: [(phone ms, step ms or None)].
    A new vibrate call replaces the running one, so each entry belongs to the latest accepted call before it,
    and a call's expected on-steps end where the next call starts (nominal timing, so an upper bound)."""
    calls = sorted((h for h in haptics if "t" in h), key=lambda h: h["t"])
    ok = [h for h in calls if h.get("ok") is not False]
    starts = [h["t"] for h in ok]
    res = {"calls": len(calls), "refused": len(calls) - len(ok), "expected": 0, "logged": len(entries),
           "unreported": 0, "mismatched": 0, "silent_calls": 0}
    got = [0] * len(ok)
    for at, step in entries:
        i = bisect.bisect_right(starts, at + slack_ms) - 1
        if i < 0:
            res["unreported"] += 1
            continue
        got[i] += 1
        if step is not None and step not in {ms for _, ms in on_steps(ok[i].get("pattern"))}:
            res["mismatched"] += 1
    for i, h in enumerate(ok):
        res["expected"] += len(on_steps(h.get("pattern"), h["t"], starts[i + 1] if i + 1 < len(ok) else math.inf))
        res["silent_calls"] += got[i] == 0
    return res


def clock_sync(adb, samples=8):
    """Phone clock minus laptop clock. One long-lived shell, so a sample's round trip skips adb's ~200 ms process
    start, and $EPOCHREALTIME is a shell builtin, so it skips a `date` process too (~30 ms vs ~2 ms measured).
    The fastest sample wins and half its round trip is the uncertainty."""
    p = subprocess.Popen(adb + ["shell", "-T", "date '+%z %Y'; while read x; do echo $EPOCHREALTIME; done"],
                         stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    best = None
    try:
        tz, year = parse_tz_year(p.stdout.readline().decode())
        for _ in range(samples):
            t0 = now()
            p.stdin.write(b"\n")
            p.stdin.flush()
            line = p.stdout.readline().decode()
            t1 = now()
            if best is None or t1 - t0 < best["rtt"]:
                best = {"rtt": t1 - t0, "offset": float(line) - (t0 + t1) / 2, "tz": tz, "year": year}
    finally:
        p.kill()
    best["unc"] = best["rtt"] / 2
    return best


# ---- Relay ----

def post(relay, body):
    u = urlsplit(relay)
    c = http.client.HTTPConnection(u.hostname, u.port or 80, timeout=5)
    try:
        c.request("POST", "/event", json.dumps(body), {"Content-Type": "application/json"})
        r = c.getresponse()
        r.read()
        if r.status != 200:
            raise RuntimeError(f"relay answered {r.status} to {body.get('type')}")
    finally:
        c.close()


class Listener(threading.Thread):
    """Reads the relay's /events stream and records every event with the laptop time it arrived."""

    def __init__(self, relay):
        super().__init__(daemon=True)
        u = urlsplit(relay)
        self.conn = http.client.HTTPConnection(u.hostname, u.port or 80, timeout=30)
        self.conn.request("GET", "/events")
        self.sock = self.conn.sock  # getresponse() hands the socket to the response, so keep it to close later
        self.resp = self.conn.getresponse()
        self.events = []

    def run(self):
        try:
            for line in iter(self.resp.readline, b""):
                if line.startswith(b"data: "):
                    self.events.append((now(), json.loads(line[6:])))
        except (OSError, ValueError):
            pass

    def wait_for(self, pred, after, timeout):
        end = time.monotonic() + timeout
        while time.monotonic() < end:
            if any(t >= after and pred(ev) for t, ev in list(self.events)):
                return True
            time.sleep(0.01)
        return False

    def close(self):
        try:
            self.sock.shutdown(2)
        except OSError:
            pass
        self.sock.close()


def board_items(events):
    """(kind, id) of every stroke and landmark on the relay, oldest first, replayed from the events it sent.
    Undo pops the newest of either kind (feelink/server.py). A sync lists the two kinds apart, so items already
    known keep their order and new ones go last; only items on the board before the run lose their cross-kind
    order, and those are all older than the test stroke."""
    items = []
    for _, ev in events:
        kind = ev.get("type")
        if kind == "sync":
            on = [("stroke", s["id"]) for s in ev.get("strokes", [])] + \
                 [("landmark", m["id"]) for m in ev.get("landmarks", [])]
            items = [i for i in items if i in on] + [i for i in on if i not in items]
        elif kind in ("stroke", "landmark") and (kind, ev.get("id")) not in items:
            items.append((kind, ev["id"]))
        elif kind == "clear":
            items = []
        elif kind == "undo" and items:
            items.pop()
    return items


def board_now(relay):
    """The board as the relay holds it now: a new /events subscriber starts with a sync of it. None if none came."""
    fresh = Listener(relay)
    fresh.start()
    try:
        return board_items(fresh.events[:1]) if fresh.wait_for(lambda ev: ev.get("type") == "sync", 0, 3) else None
    finally:
        fresh.close()


def remove_stroke(relay, listener, sid):
    """Undo the test stroke only while it is the newest item, then confirm from the relay that Undo took it."""
    mine = ("stroke", sid)
    listener.wait_for(lambda ev: ev.get("id") == sid, 0, 1)  # our own stroke event may still be on its way
    items = board_items(listener.events)
    if mine not in items:
        return "test stroke already gone"
    newer = items[items.index(mine) + 1:]
    if newer:
        names = ", ".join(f"{kind} {item_id}" for kind, item_id in newer)
        return f"test stroke {sid} NOT removed: {names} came after it, and Undo would remove the newest instead"
    post(relay, {"type": "undo"})
    # The relay applies an event before answering its POST, so a fresh sync shows what this Undo took. A sync on the
    # old stream could still be an earlier Undo's, in flight.
    left = board_now(relay)
    if left is None:
        return "Undo sent, but the relay did not confirm it"
    if mine not in left:
        return "test stroke removed with Undo"
    return (f"test stroke {sid} NOT removed: an item reached the relay just before the Undo, which removed that "
            "instead; check the board")


# ---- Phones: the real one over adb, and a stand-in for testing without it ----

class AdbPhone:
    simulated = False

    def __init__(self, adb):
        self.adb = adb

    def touch(self, *args):
        """`input tap x y` or `input swipe x1 y1 x2 y2 ms`, in device px; returns the running process."""
        return subprocess.Popen(self.adb + ["shell", "input", *map(str, args)],
                                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    def dumpsys(self):
        return subprocess.run(self.adb + ["shell", "dumpsys", "vibrator_manager"],
                              capture_output=True, text=True, timeout=20).stdout

    def clock(self):
        return clock_sync(self.adb)


class _Touch(threading.Thread):
    """A simulated touch that quacks like the Popen an AdbPhone returns."""

    def __init__(self, play):
        super().__init__(daemon=True)
        self.play, self.stop = play, threading.Event()
        self.start()

    def run(self):
        self.play(self.stop)

    def wait(self, timeout=None):
        self.join(timeout)

    def poll(self):
        return None if self.is_alive() else 0

    def kill(self):
        self.stop.set()


class FakePhone:
    """No device: posts the finger events feel.html would send for each touch, mapped with the same sums plus an
    optional error in mm. It has no vibrator and no clock, so those results stay empty."""
    simulated = True

    def __init__(self, relay, g, error=(0.0, 0.0)):
        self.relay, self.g, self.error = relay, g, error

    def touch(self, kind, *a):
        x1, y1, x2, y2, ms = (*a, *a, 0) if kind == "tap" else a

        def play(stop):
            start = time.monotonic()
            while True:
                f = min(1.0, (time.monotonic() - start) * 1000 / ms) if ms else 1.0
                x, y = px_to_mm(self.g, x1 + (x2 - x1) * f, y1 + (y2 - y1) * f)
                post(self.relay, {"type": "finger", "x": x + self.error[0], "y": y + self.error[1],
                                  "down": True, "pen": False})
                if f >= 1.0 or stop.is_set():
                    break
                time.sleep(0.016)
            post(self.relay, {"type": "finger", "down": False})
        return _Touch(play)

    def dumpsys(self):
        return ""

    def clock(self):
        return None


# ---- The run ----

def run(relay, phone, geo):
    """Three probes: a held finger that the stroke lands under, taps on the line, and a swipe across it.
    `geo` holds geometry()'s inputs, so the analysis can redo the mapping with the page's own screen width."""
    g = geometry(**geo)
    listener = Listener(relay)
    listener.start()
    if not listener.wait_for(lambda ev: ev.get("type") == "sync", 0, 3):
        raise SystemExit("relay sent no sync event")
    rec = {"simulated": phone.simulated, "sync": None, "taps": [], "geo": geo,
           "board_before": len(board_items(listener.events))}
    if not phone.simulated:
        try:
            rec["sync"] = phone.clock()
        except (OSError, ValueError, TypeError) as e:
            rec["sync_error"] = str(e) or type(e).__name__
    before = phone.dumpsys()
    stroke = {"type": "stroke", "id": f"e2e-{int(now() * 1000)}", "by": "laptop",
              "pts": [{"x": x, "y": y} for x, y in STROKE]}
    hx, hy = mm_to_px(g, *ON_LINE)
    (ax, ay), (bx, by) = (mm_to_px(g, *p) for p in SWIPE)
    rec["inject_px"] = {"on_line": (hx, hy), "swipe": (ax, ay, bx, by)}
    procs = []
    is_down = lambda ev: ev.get("type") == "finger" and ev.get("down")
    try:
        # 1. Tutor -> phone: hold a finger where the line will appear, then draw it; the buzz marks its arrival.
        t = now()
        procs.append(phone.touch("swipe", hx, hy, hx, hy, 2500))
        if not listener.wait_for(is_down, t, 2.0):
            procs[-1].wait(15)
            raise SystemExit("No finger event from the held touch, so /feel is not open in Live mode. Stopped "
                             "before the taps and swipe, which could press buttons on its home screen.")
        time.sleep(0.3)
        rec["post"] = now()
        post(relay, stroke)
        procs[-1].wait(15)
        time.sleep(0.4)
        rec["hold"] = (t, now())
        # 2. Phone -> laptop: taps on the line. feel.html calls vibrate() and posts the finger in one handler.
        for _ in range(TAPS):
            t = now()
            procs.append(phone.touch("tap", hx, hy))
            procs[-1].wait(15)
            time.sleep(0.4)
            rec["taps"].append((t, now()))
        # 3. Mapping: one swipe across the line.
        t = now()
        procs.append(phone.touch("swipe", ax, ay, bx, by, 1500))
        procs[-1].wait(15)
        time.sleep(0.4)
        rec["swipe"] = (t, now())
        time.sleep(0.6)  # dumpsys lists a vibration once it has ended
        after = phone.dumpsys()
    finally:
        for p in procs:
            if p.poll() is None:
                p.kill()
        rec["cleanup"] = remove_stroke(relay, listener, stroke["id"]) if "post" in rec else "no test stroke was posted"
        listener.close()
    rec["events"] = listener.events
    if phone.simulated:
        rec["vibs"] = None
    else:
        sync = rec["sync"]
        rec["vibs"] = [(phone_to_laptop(e["created"], sync) if sync else None, e)
                       for e in new_chrome_vibrations(before, after)]
        for _, e in rec["vibs"]:
            e["phone_ms"] = phone_epoch(e["created"], sync) * 1000 if sync else None
    return rec


# ---- The report ----

def _ms(seconds):
    return f"{seconds * 1000:.0f} ms"


def analyse(rec):
    """Recorded run -> (report lines, numbers for the selftest)."""
    ev = rec["events"]
    fingers = [(t, e) for t, e in ev if e.get("type") == "finger"]
    haptics = [(t, e) for t, e in ev if e.get("type") == "haptic"]
    configs = [e for _, e in ev if e.get("type") == "phoneconfig"]
    cfg = configs[-1] if configs else {}
    g = geometry(**rec["geo"], screen_mm=cfg.get("screenWidthMm") or SCREEN_WIDTH_MM)
    on_line = px_to_mm(g, *rec["inject_px"]["on_line"])
    ax, ay, bx, by = rec["inject_px"]["swipe"]
    swipe_mm = (px_to_mm(g, ax, ay), px_to_mm(g, bx, by))
    vibs, sync = rec["vibs"], rec["sync"]
    timed = vibs is not None and sync is not None
    unc = f" +/- {sync['unc'] * 1000:.0f} ms clock sync" if sync else ""
    # The page's haptic events carry its Date.now(), the same wall clock as dumpsys; move them to the laptop clock.
    hap_l = [(t, e, e["t"] / 1000 - sync["offset"]) for t, e in haptics if "t" in e] if sync else []
    windows = [("hold", rec["hold"])] + [(f"tap {i + 1}", w) for i, w in enumerate(rec["taps"])] + [("swipe", rec["swipe"])]
    downs = lambda a, b: [(t, e) for t, e in fingers if a <= t <= b and e.get("down") and "x" in e]
    buzzes = lambda a, b: [(t, v) for t, v in vibs if a <= t <= b and not v["stop"]] if timed else []
    stats = {"map": [], "taps_ms": [], "swipe_mm": swipe_mm}
    out = ["RESULTS: SIMULATED (no phone: this script posted the finger events; checks plumbing and maths only)"
           if rec["simulated"] else "RESULTS: REAL DEVICE"]
    if cfg:
        out.append(f"Page config: core {cfg.get('coreMm')} mm, fade {cfg.get('fadeMm')} mm, {cfg.get('steps')} fade "
                   f"steps, screen width {cfg.get('screenWidthMm')} mm (used for the mapping)")
    else:
        out.append(f"Page config: none sent (build without phoneconfig); mapping uses feel.html's {SCREEN_WIDTH_MM} mm")

    out.append("Mapping: injected touch vs the mm the page reported")
    for name, (a, b) in windows:
        d = downs(a, b)
        want = swipe_mm[0] if name == "swipe" else on_line
        if not d:
            out.append(f"  {name:<6} no finger event")
            continue
        x, y = d[0][1]["x"], d[0][1]["y"]
        err = (x - want[0], y - want[1])
        stats["map"].append(err)
        out.append(f"  {name:<6} expected ({want[0]:.1f}, {want[1]:.1f}) got ({x:.1f}, {y:.1f}) mm: "
                   f"error {math.hypot(*err):.2f} mm (dx {err[0]:+.2f}, dy {err[1]:+.2f})")
    if not fingers:
        out.append("  No finger events reached the relay: is /feel open in Live mode, and is adb reverse in place?")
    sw = downs(*rec["swipe"])
    if sw:
        cross = [dist_to_segment((e["x"], e["y"]), *swipe_mm) for _, e in sw]
        stats["cross"] = statistics.mean(cross)
        out.append(f"  swipe: {len(cross)} finger events, distance from the injected path mean "
                   f"{stats['cross']:.2f} mm, max {max(cross):.2f} mm")
    if stats["map"]:
        dy = statistics.mean(e[1] for e in stats["map"])
        out.append(f"  mean dy {dy:+.2f} mm = {round(-dy * g['ppm'], 1) + 0.0:+.1f} CSS px of page offset the model lacks "
                   "(0 expected when fullscreen; --top/--viewport describe a page that is not)")

    out.append("Latency")
    if hap_l:  # the page's own vibrate times (#34): no pairing needed
        a, b = rec["hold"]
        cut = rec["post"] - sync["unc"]
        early = [tl for _, e, tl in hap_l if a <= tl < cut and e.get("kind") != "stop"]
        late = [tl for _, e, tl in hap_l if cut <= tl <= b and e.get("kind") != "stop"]
        if early:
            out.append("  tutor -> phone: not measurable, the held finger was already buzzing before the stroke")
        elif late:
            stats["tutor_ms"] = (late[0] - rec["post"]) * 1000
            out.append(f"  tutor -> phone: {_ms(late[0] - rec['post'])} (stroke posted -> page calls vibrate, "
                       f"by its haptic event's clock{unc})")
        else:
            out.append("  tutor -> phone: no haptic event after the stroke reached the held finger")
        p2l = sorted((t - tl) * 1000 for t, _, tl in hap_l)
        stats["p2l_ms"] = statistics.median(p2l)
        out.append(f"  phone -> laptop: median {stats['p2l_ms']:.0f} ms, range {p2l[0]:.0f}-{p2l[-1]:.0f} ms over "
                   f"{len(p2l)} haptic events (page's vibrate time -> event reaches the laptop{unc})")
    elif timed:
        a, b = rec["hold"]
        early = buzzes(a, rec["post"] - rec["sync"]["unc"])
        late = buzzes(rec["post"] - rec["sync"]["unc"], b)
        if early:
            out.append("  tutor -> phone: not measurable, the held finger was already buzzing before the stroke")
        elif late:
            stats["tutor_ms"] = (late[0][0] - rec["post"]) * 1000
            out.append(f"  tutor -> phone: {_ms(late[0][0] - rec['post'])} (stroke posted -> Android logs Chrome's vibrate request{unc})")
        else:
            out.append("  tutor -> phone: no Chrome buzz after the stroke reached the held finger")
        for a, b in rec["taps"]:
            v, d = buzzes(a, b), downs(a, b)
            if v and d:
                stats["taps_ms"].append((d[0][0] - v[0][0]) * 1000)
        if stats["taps_ms"]:
            out.append(f"  phone -> laptop: {', '.join(f'{m:.0f}' for m in stats['taps_ms'])} ms over {TAPS} taps "
                       f"(Android logs the tap's vibrate request -> its finger event reaches the laptop{unc})")
        else:
            out.append("  phone -> laptop: no tap had both a Chrome buzz and a finger event to pair")
    else:
        why = "simulated" if rec["simulated"] else f"no clock sync ({rec.get('sync_error', 'failed')})"
        out.append(f"  tutor -> phone and phone -> laptop: not measured ({why})")
    if len(sw) > 1:
        gaps = [(sw[i][0] - sw[i - 1][0]) * 1000 for i in range(1, len(sw))]
        out.append(f"  finger updates during the swipe: median every {statistics.median(gaps):.0f} ms")
    if sw and not rec["simulated"]:
        out.append(f"  swipe start -> first finger event: {_ms(sw[0][0] - rec['swipe'][0])} "
                   "(includes adb and `input` start-up, so an upper bound)")
    hap = [t for t, e in haptics if rec["post"] <= t <= rec["hold"][1] and e.get("kind") != "stop"]
    if hap and not hap_l:
        out.append(f"  tutor -> phone -> laptop: {_ms(hap[0] - rec['post'])} (to the page's first haptic event)")

    out.append("Vibrations: dumpsys vs what the page reported")
    if vibs is None:
        out.append("  not measured (simulated: no vibrator)")
    else:
        for name, (a, b) in windows if timed else [("whole run", (0, float("inf")))]:
            got = [v for t, v in vibs if not timed or a <= t <= b]
            stops = sum(v["stop"] for v in got)
            status = ", ".join(f"{s} {n}" for s, n in sorted(_count(v["status"] for v in got).items()))
            page = sum(1 for t, _ in haptics if a <= t <= b)
            out.append(f"  {name:<9} dumpsys {len(got)} Chrome ({len(got) - stops} buzz, {stops} stop)"
                       f"{'; ' + status if status else ''}; page haptic events {page}")
        if not haptics:
            out.append("  The page sent no haptic events (build without #34), so there is nothing to compare against.")
        elif sync:
            m = stats["match"] = match_haptics([e for _, e in haptics], [(v["phone_ms"], v["step"]) for _, v in vibs])
            out.append(f"  page: {m['calls']} vibrate calls, {m['refused']} refused by Chrome, up to {m['expected']} "
                       f"on-steps expected (Chrome logs one entry per on-step); dumpsys: {m['logged']} Chrome entries")
            out.append(f"  calls with no dumpsys entry {m['silent_calls']}; entries no page call explains "
                       f"{m['unreported']}; entries whose length isn't in their call's pattern {m['mismatched']}")
        else:
            out.append("  The page sent haptic events, but without a clock sync dumpsys times can't be matched to them.")
        if len(vibs) >= 20:
            out.append("  Note: dumpsys holds 20 recent entries per usage plus an older section whose limit wasn't "
                       "measured, so a run this busy may have lost its earliest entries.")
        injected = [v for t, v in vibs if timed and any(a <= t <= b for a, b in rec["taps"] + [rec["swipe"]])]
        calls = [e for _, e, tl in hap_l if any(a <= tl <= b for a, b in rec["taps"] + [rec["swipe"]]) and "ok" in e]
        if calls:
            refused = sum(e["ok"] is False for e in calls)
            out.append(f"  Gesture: vibrate() returned true for {len(calls) - refused} of {len(calls)} page calls during "
                       "injected taps and swipe. Chrome needs one past real tap on the page (sticky activation): if "
                       "someone tapped Live since it loaded, that tap may be what allowed them.")
        elif injected:
            out.append(f"  Gesture: Chrome logged {len(injected)} vibrate calls during injected taps and swipe. Chrome "
                       "needs one past real tap on the page (sticky activation): if someone tapped Live since it "
                       "loaded, this shows injected touches don't block vibrate, not that they unlock it alone.")
        elif timed:
            out.append("  Gesture: no Chrome vibrations during injected touches (no user activation, page not in "
                       "Live, or the touch missed the line).")
    out.append(f"Cleanup: {rec['cleanup']}" + (f"; the board had {rec['board_before']} other strokes or landmarks "
                                                "before the run" if rec["board_before"] else ""))
    return out, stats


def _count(items):
    c = {}
    for i in items:
        c[i] = c.get(i, 0) + 1
    return c


# ---- Selftest ----

SAMPLE_DUMP = """\
  Recent vibrations:
    TOUCH:
      11-07 12:59:08.213 |   effect | cancelled_superseded | duration:    12ms | start:              | end: 12:59:08.225 | scale:      NONE (1.00) | adaptiveScale=1.00 | flags:    0 | usage: TOUCH | com.android.chrome (uid=10201, deviceId=0) | reason: null | played: Step=30ms(amplitude=-1.00, startTime=-1) | original: null
      11-07 12:59:08.411 |   effect |             finished | duration:   145ms | start: 12:59:08.419 | end: 12:59:08.556 | scale:      NONE (1.00) | adaptiveScale=1.00 | flags:    0 | usage: TOUCH | com.android.chrome (uid=10201, deviceId=0) | reason: null | played: Step=1ms(amplitude=1.00, startTime=-1) | original: Step=1ms(amplitude=-1.00, startTime=-1)
      11-07 13:21:31.150 |   effect |             finished | duration:    32ms | start: 13:21:31.151 | end: 13:21:31.182 | scale:      NONE (1.00) | adaptiveScale=1.00 | flags:    0 | usage: TOUCH | audioUsage=USAGE_ASSISTANCE_SONIFICATION | com.google.android.apps.nexuslauncher (uid=10237, deviceId=0) | reason: null | played: Primitive=LOW_TICK(scale=0.60, pause=0ms) | original: null
  Aggregated vibration history:
    TOUCH:
      11-07 12:59:08.213 |   effect | cancelled_superseded | duration:    12ms | start:              | end: 12:59:08.225 | scale:      NONE (1.00) | adaptiveScale=1.00 | flags:    0 | usage: TOUCH | com.android.chrome (uid=10201, deviceId=0) | reason: null | played: Step=30ms(amplitude=-1.00, startTime=-1) | original: null
      11-07 12:42:13.653 |   effect | ignored_for_settings | duration:     0ms | start:              | end: 12:42:13.653 | scale:      NONE (1.00) | adaptiveScale=1.00 | flags:    0 | usage: NOTIFICATION | audioUsage=USAGE_NOTIFICATION | android (uid=1000, deviceId=0) | reason: Notification (x 1) (Delayed) | played: [Step=0ms(amplitude=0.00, startTime=-1),Step=250ms(amplitude=-1.00, startTime=-1)] | original: null
"""


def selftest():
    # Geometry, against numbers worked out by hand: the screen is 64.6 mm wide and 64.6 * 2400 / 1080 = 143.56 mm
    # tall, so the 56 x 120 board leaves 4.3 mm each side and 11.78 mm above and below.
    w, h, dpi = parse_wm("Physical size: 1080x2400\n", "Physical density: 420\n")
    assert (w, h, dpi) == (1080, 2400, 420)
    assert parse_wm("Physical size: 1080x2400\nOverride size: 900x2000\n", "Physical density: 420\nOverride density: 360\n") == (900, 2000, 360)
    g = geometry(w, h, dpi)
    assert math.dist(px_to_mm(g, 0, 0), (-4.3, -(143.5556 - 120) / 2)) < 1e-3, px_to_mm(g, 0, 0)
    assert math.dist(px_to_mm(g, 540, 1200), (28, 60)) < 1e-9 and mm_to_px(g, 28, 60) == (540, 1200)
    for mm in [(0, 0), (56, 120), *STROKE, *SWIPE]:  # round trip within half a device px
        assert math.dist(px_to_mm(g, *mm_to_px(g, *mm)), mm) < 0.71 / (g["ppm"] * g["dpr"]), mm
    shifted = geometry(w, h, dpi, top=24)  # 24 CSS px of browser UI moves the same touch up by 24 / ppm mm
    assert abs(px_to_mm(shifted, 540, 1200)[1] - (60 - 24 / g["ppm"])) < 1e-9
    assert abs(dist_to_segment((1, 5), (0, 0), (0, 10)) - 1) < 1e-12 and dist_to_segment((0, -2), (0, 0), (0, 10)) == 2

    # dumpsys parsing, on lines copied from the Pixel's own output.
    vibs = parse_vibrations(SAMPLE_DUMP)
    assert len(vibs) == 4, len(vibs)  # the repeated line counts once
    chrome = [v for v in vibs.values() if v["pkg"] == CHROME]
    assert [v["stop"] for v in chrome] == [False, True] and chrome[1]["ms"] == 145
    assert vibs[("11-07 12:42:13.653", "android", "NOTIFICATION")]["status"] == "ignored_for_settings"
    later = SAMPLE_DUMP + SAMPLE_DUMP.splitlines()[2].replace("12:59:08.213", "13:30:00.001") + "\n"
    assert [v["created"] for v in new_chrome_vibrations(SAMPLE_DUMP, later)] == ["11-07 13:30:00.001"]
    tz, year = parse_tz_year("-0800 2026\n")
    assert (tz, year) == (-8 * 3600, 2026) and parse_tz_year("+0530 2026")[0] == 5.5 * 3600
    sync = {"offset": -2.0, "tz": tz, "year": year, "unc": 0.004}  # phone 2 s behind the laptop, as measured
    t = phone_to_laptop("11-07 13:23:10.131", sync)
    assert abs(t - (datetime(2026, 11, 7, 21, 23, 10, 131000, tzinfo=timezone.utc).timestamp() + 2.0)) < 1e-6

    # Latency pairing on a hand-made timeline (laptop seconds) with today's finger-only page:
    # the buzz 25 ms after the post, taps 30/31/32 ms phone -> laptop.
    def vib(tt, step=600):
        return (tt, {"stop": step == 1, "step": step, "status": "finished", "ms": step, "phone_ms": (tt - 2.0) * 1000})
    fing = lambda tt, x, y: (tt, {"type": "finger", "x": x, "y": y, "down": True})
    geo = {"width_px": w, "height_px": h, "dpi": dpi, "viewport": None, "top": 0.0}
    rec = {"simulated": False, "sync": sync, "board_before": 0, "cleanup": "test", "geo": geo,
           "inject_px": {"on_line": (540, 1200), "swipe": (540, 866, 540, 1534)},
           "hold": (10.0, 13.0), "post": 11.0, "taps": [(14.0, 14.6), (15.0, 15.6), (16.0, 16.6)], "swipe": (17.0, 19.0),
           "events": [fing(10.5, 28.0, 60.0), fing(14.33, 28.5, 60.0), fing(15.331, 28.0, 60.0), fing(16.332, 28.0, 60.0),
                      fing(17.4, 28.2, 40.0), fing(17.5, 28.2, 50.0), fing(17.6, 27.8, 70.0)],
           "vibs": [vib(11.025), vib(14.299, 1), vib(14.30), vib(15.30), vib(16.30), vib(16.35, 1), vib(17.5, 12)]}
    lines, st = analyse(rec)
    assert abs(st["tutor_ms"] - 25) < 1e-6, st
    assert [round(m) for m in st["taps_ms"]] == [30, 31, 32], st
    assert abs(st["map"][1][0] - 0.5) < 1e-9 and abs(st["cross"] - 0.2) < 0.002, st
    assert any("hold" in s and "1 Chrome (1 buzz" in s for s in lines), lines
    assert any("nothing to compare against" in s for s in lines), lines

    # The same with the page's #34 events: its own vibrate times (phone clock, 2 s behind), one refused tick,
    # and phoneconfig's screen width replacing feel.html's 64.6 mm.
    hap = lambda arrive, at, pattern, ok=True: (arrive, {"type": "haptic", "kind": "x", "pattern": pattern, "ok": ok,
                                                         "t": (at - 2.0) * 1000})
    rec["events"] += [(10.2, {"type": "phoneconfig", "coreMm": 6, "fadeMm": 6, "steps": 3, "screenWidthMm": 64.1}),
                      hap(11.045, 11.020, 600), hap(14.330, 14.300, 600), hap(17.520, 17.500, 25, ok=False)]
    rec["vibs"] = [vib(11.025), vib(14.302)]
    lines, st = analyse(rec)
    assert abs(st["tutor_ms"] - 20) < 1e-6 and abs(st["p2l_ms"] - 25) < 1e-6, st
    assert abs(st["swipe_mm"][0][1] - 40.176) < 0.001, st["swipe_mm"]  # (866 / 2.625 - 72.03) / (411.43 / 64.1)
    m = st["match"]
    assert (m["calls"], m["refused"], m["expected"], m["logged"], m["silent_calls"], m["unreported"], m["mismatched"]) \
        == (3, 1, 2, 2, 0, 0, 0), m
    assert any("returned true for 1 of 2" in s for s in lines), lines  # the tap's call, and the refused tick

    # Matching page calls to dumpsys entries: Chrome logs one entry per on-step, a new call cuts the old one off,
    # a refused call plays nothing, and an entry before any call is one the page never reported.
    assert on_steps([12, 60, 12, 60, 12, 60], 1500, 1600) == [(1500, 12), (1572, 12)] and on_steps(800) == [(0, 800)]
    calls = [{"pattern": 800, "ok": True, "t": 1000}, {"pattern": [12, 60, 12, 60, 12, 60], "ok": True, "t": 1500},
             {"pattern": 1, "ok": True, "t": 1700}, {"pattern": 25, "ok": False, "t": 1800}]
    m = match_haptics(calls, [(900, 30), (1003, 800), (1502, 12), (1580, 12), (1702, 1), (1900, 30)])
    assert m == {"calls": 4, "refused": 1, "expected": 5, "logged": 6, "unreported": 1, "mismatched": 1,
                 "silent_calls": 0}, m

    # The relay side end to end: an in-process copy of feelink/server.py and a fake phone that is 1.5 mm off in x.
    from http.server import ThreadingHTTPServer
    spec = importlib.util.spec_from_file_location("feelink_server", Path(__file__).resolve().parents[1] / "feelink/server.py")
    server = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(server)
    httpd = ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    relay = f"http://127.0.0.1:{httpd.server_address[1]}"
    try:
        rec = run(relay, FakePhone(relay, g, error=(1.5, 0.0)), geo)
        lines, st = analyse(rec)
        assert lines[0].startswith("RESULTS: SIMULATED"), lines[0]
        assert len(st["map"]) == 2 + TAPS and all(abs(dx - 1.5) < 0.01 and abs(dy) < 0.01 for dx, dy in st["map"]), st
        assert abs(st["cross"] - 1.5) < 0.01, st
        assert rec["cleanup"] == "test stroke removed with Undo" and not server.Handler.relay.strokes, rec["cleanup"]
        # A page that is not in Live mode sends no finger events: the run stops before drawing or tapping.
        silent = FakePhone(relay, g)
        silent.touch = lambda *a: _Touch(lambda stop: None)
        try:
            run(relay, silent, geo)
            raise AssertionError("run went on without finger events")
        except SystemExit as e:
            assert "not open in Live mode" in str(e) and not server.Handler.relay.strokes, e

        # Cleanup with landmarks on the board, since Undo pops the newest stroke or landmark.
        ev = lambda **e: (0.0, e)
        assert board_items([ev(type="sync", strokes=[{"id": "a"}], landmarks=[{"id": "m"}]), ev(type="stroke", id="b"),
                            ev(type="landmark", id="n"), ev(type="stroke", id="a"), ev(type="undo"),
                            ev(type="sync", strokes=[{"id": "a"}, {"id": "b"}], landmarks=[{"id": "m"}])]) \
            == [("stroke", "a"), ("landmark", "m"), ("stroke", "b")]
        board = server.Handler.relay
        line = {"type": "stroke", "id": "t1", "by": "laptop", "pts": [{"x": x, "y": y} for x, y in STROKE]}
        door = {"type": "landmark", "id": "door", "x": 5, "y": 5, "name": "Door", "by": "tutor"}
        listener = Listener(relay)
        listener.start()
        try:
            # A landmark placed after the test stroke: no Undo, and the report names it.
            post(relay, line)
            post(relay, door)
            listener.wait_for(lambda e: e.get("id") == "door", 0, 2)
            msg = remove_stroke(relay, listener, "t1")
            assert msg.startswith("test stroke t1 NOT removed: landmark door came after it") \
                and list(board.strokes) == ["t1"] and list(board.landmarks) == ["door"], msg
            synced = lambda after: listener.wait_for(lambda e: e.get("type") == "sync", after, 2)
            t = now()
            post(relay, {"type": "undo"})  # takes the landmark off
            assert synced(t)
            # A landmark that reaches the relay just before the Undo, so the Undo takes it and the stroke stays.
            publish = board.publish

            def landmark_first(event):
                if event.get("type") == "undo":
                    publish({**door, "id": "exit", "name": "Exit"})
                publish(event)
            board.publish = landmark_first
            t = now()
            try:
                msg = remove_stroke(relay, listener, "t1")
            finally:
                del board.publish
            assert msg.startswith("test stroke t1 NOT removed: an item reached the relay just before the Undo") \
                and list(board.strokes) == ["t1"] and not board.landmarks, msg
            # Then a plain Undo, once this stream has caught up with the last one.
            msg =remove_stroke(relay, listener, "t1") if synced(t) else "no sync"
            assert msg == "test stroke removed with Undo" and not board.strokes and not board.landmarks, msg
        finally:
            listener.close()
    finally:
        httpd.shutdown()
    print("selftest: ok")


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--relay", default="http://localhost:8765")
    ap.add_argument("--serial", default=os.environ.get("ANDROID_SERIAL"), help="device serial (default: $ANDROID_SERIAL or the only device)")
    ap.add_argument("--top", type=float, default=0.0, help="CSS px of browser UI above the page (0 when fullscreen)")
    ap.add_argument("--viewport", help="page size in CSS px as WxH, if not the whole screen")
    ap.add_argument("--simulate", action="store_true", help="no phone: post fake finger events to a test relay")
    ap.add_argument("--selftest", action="store_true")
    a = ap.parse_args()
    if a.selftest:
        return selftest()
    viewport = tuple(float(v) for v in a.viewport.lower().split("x")) if a.viewport else None
    port = urlsplit(a.relay).port or 80
    if a.simulate:
        if port == 8765:
            raise SystemExit("--simulate posts fake finger events; point --relay at a test relay, not the live one")
        w, h, dpi = 1080, 2400, 420  # the Pixel 8's `wm size` and `wm density`, read Nov 7
        geo = {"width_px": w, "height_px": h, "dpi": dpi, "viewport": viewport, "top": a.top}
        g = geometry(**geo)
        phone = FakePhone(a.relay, g)
        print(f"SIMULATED: no adb; Pixel 8 screen {w}x{h} px at {dpi} dpi assumed")
    else:
        adb = [find_adb()] + (["-s", a.serial] if a.serial else [])
        sh = lambda *c: subprocess.run(adb + list(c), capture_output=True, text=True, timeout=20)
        state = sh("get-state")
        if state.stdout.strip() != "device":
            raise SystemExit(f"no device: {(state.stdout + state.stderr).strip()}")
        w, h, dpi = parse_wm(sh("shell", "wm", "size").stdout, sh("shell", "wm", "density").stdout)
        geo = {"width_px": w, "height_px": h, "dpi": dpi, "viewport": viewport, "top": a.top}
        g = geometry(**geo)
        reverses = sh("reverse", "--list").stdout
        if urlsplit(a.relay).hostname in ("localhost", "127.0.0.1") and f"tcp:{port} tcp:{port}" not in reverses:
            print(f"WARNING: no `adb reverse tcp:{port} tcp:{port}`; the phone can't reach the relay over USB")
        phone = AdbPhone(adb)
        print(f"Device: screen {w}x{h} px, {dpi} dpi -> devicePixelRatio {g['dpr']:g}")
    if viewport or a.top:
        print(f"Page model: viewport {g['vw']:.1f} x {g['vh']:.1f} CSS px, starting {a.top:g} CSS px below the screen top")
    else:
        print(f"Assumes /feel is fullscreen (Live requests it): page top-left = screen top-left, viewport "
              f"{g['vw']:.1f} x {g['vh']:.1f} CSS px. Chrome rounds innerWidth/innerHeight to whole px: ~0.1 mm.")
    rec = run(a.relay, phone, geo)
    print(f"Injected (device px): hold and taps at {rec['inject_px']['on_line']}, swipe {rec['inject_px']['swipe']}")
    if rec["sync"]:
        print(f"Clock: phone minus laptop {rec['sync']['offset'] * 1000:+.0f} ms, +/- {rec['sync']['unc'] * 1000:.0f} ms")
    lines, _ = analyse(rec)
    print("\n".join(lines))


if __name__ == "__main__":
    sys.exit(main())
