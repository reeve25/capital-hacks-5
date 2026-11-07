#!/usr/bin/env python3
"""Keep the Pixel's USB link to the FeelInk relay up: redo `adb reverse` after every reconnect.

Usage: python tools/pixel_keepalive.py [--serial SERIAL] [--port 8765]
       python tools/pixel_keepalive.py --selftest
Prints a timestamped line for every drop and restore, since drop times are evidence.
Ctrl+C stops it and leaves the reverse in place. Stdlib only.
adb comes from $ADB, then PATH, then the Android Studio default install.
"""
import argparse
import contextlib
import io
import os
import shutil
import subprocess
import time
from datetime import datetime
from pathlib import Path

DEFAULT_ADB = Path.home() / "AppData/Local/Android/platform-tools/adb.exe"


def find_adb():
    adb = os.environ.get("ADB") or shutil.which("adb") or (str(DEFAULT_ADB) if DEFAULT_ADB.exists() else None)
    if not adb:
        raise SystemExit("adb not found: set ADB, put it on PATH, or install Android platform-tools")
    return adb


def say(text):
    print(f"{datetime.now():%Y-%m-%d %H:%M:%S} {text}", flush=True)


def took(seconds):
    m, s = divmod(int(seconds), 60)
    return f"{m}m{s:02d}s" if m else f"{s}s"


def adb_run(cmd, *args):
    """Returns (ok, output). A stuck USB link can hang adb, so every call has a timeout."""
    try:
        p = subprocess.run(cmd + list(args), capture_output=True, text=True, timeout=10)
    except subprocess.TimeoutExpired:
        return False, "adb timed out"
    return p.returncode == 0, (p.stdout + p.stderr).strip()


def has_reverse(listing, port):
    want = [f"tcp:{port}", f"tcp:{port}"]
    return any(line.split()[-2:] == want for line in listing.splitlines())


def watch(cmd, port, adb=adb_run, sleep=time.sleep):
    up, since = None, time.monotonic()  # up: None before the first answer, then True or False
    while True:
        # One call covers both cases: it fails while the device is gone, offline or unauthorized,
        # and its listing shows whether a reconnect cleared the reverse.
        ok, out = adb(cmd, "reverse", "--list")
        was = "connected" if up is None else f"back after {took(time.monotonic() - since)} down" if up is False else ""
        if ok and not has_reverse(out, port):
            ok, out = adb(cmd, "reverse", f"tcp:{port}", f"tcp:{port}")
            if ok:
                say(f"{was or 'reverse was cleared'}; reverse tcp:{port} {'applied' if up is None else 'restored'}")
            else:
                out = f"adb reverse failed: {out}"
        elif ok and up is not True:
            say(f"{was}; reverse tcp:{port} already in place")
        if ok and up is not True:
            up, since = True, time.monotonic()
        elif not ok and up is not False:
            reason = out.splitlines()[0] if out else "no output"
            say(f"DROPPED after {took(time.monotonic() - since)} up: {reason}" if up else f"no device yet: {reason}")
            up, since = False, time.monotonic()
        sleep(1)


def selftest():
    # A scripted device, one state per poll: unplugged twice, back with the reverse cleared by the reconnect,
    # cleared again while connected, then offline.
    ticks = ["rev", "gone", "gone", "bare", "rev", "bare", "offline"]
    state = {"i": 0, "rev": False}

    def fake_adb(cmd, *args):
        tick = ticks[state["i"]]
        if tick == "gone":
            return False, "adb.exe: device 'X' not found"
        if tick == "offline":
            return False, "adb.exe: device offline"
        if args == ("reverse", "--list"):
            return True, "UsbFfs tcp:8765 tcp:8765" if tick == "rev" or state["rev"] else ""
        state["rev"] = True
        return True, ""

    def fake_sleep(_):
        state["i"] += 1
        state["rev"] = False
        if state["i"] == len(ticks):
            raise KeyboardInterrupt

    buf = io.StringIO()
    with contextlib.redirect_stdout(buf), contextlib.suppress(KeyboardInterrupt):
        watch(["adb"], 8765, fake_adb, fake_sleep)
    got = [line[20:] for line in buf.getvalue().splitlines()]  # drop the timestamp
    want = ["connected; reverse tcp:8765 already in place",
            "DROPPED after 0s up: adb.exe: device 'X' not found",
            "back after 0s down; reverse tcp:8765 restored",
            "reverse was cleared; reverse tcp:8765 restored",
            "DROPPED after 0s up: adb.exe: device offline"]
    assert got == want, got
    assert has_reverse("UsbFfs tcp:8765 tcp:8765\n", 8765) and not has_reverse("UsbFfs tcp:18765 tcp:18765\n", 8765)
    print("selftest: ok")


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--serial", default=os.environ.get("ANDROID_SERIAL"), help="device serial (default: $ANDROID_SERIAL or the only device)")
    ap.add_argument("--port", type=int, default=8765)
    ap.add_argument("--selftest", action="store_true")
    args = ap.parse_args()
    if args.selftest:
        return selftest()
    cmd = [find_adb()] + (["-s", args.serial] if args.serial else [])
    say(f"watching {args.serial or 'the attached device'} for tcp:{args.port}; Ctrl+C to stop")
    try:
        watch(cmd, args.port)
    except KeyboardInterrupt:
        say("stopped; reverse left as it was")


if __name__ == "__main__":
    main()
