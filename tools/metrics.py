#!/usr/bin/env python3
"""FeelInk validation numbers for the slides: results.jsonl (plus optional dumpsys and stage event log) -> labeled table.

  python tools/metrics.py --label "warm-up, pre-fix build, Sat 11:41-11:48, 1 blindfolded sighted tester"
  python tools/metrics.py --label "..." --since 2026-11-07T14:00 --dumpsys dump.txt --events stage-events.txt --json out.json
  python tools/metrics.py --selftest

Inputs
  --results  feelink/results.jsonl as feel.html's /log writes it, one trial per line: who, shape, ms (first touch to
             the two-finger tap), correct, widthMm, fadeMm (older builds: shoulder), pathMm, plus `at` from the relay.
             --since (inclusive) and --until (exclusive) pick one run out of a file that holds several.
  --dumpsys  saved `adb shell dumpsys vibrator_manager` text, taken right after the take, since it keeps only about
             20 recent entries per usage. UTF-8, or the UTF-16 that PowerShell 5.1's `>` writes.
  --events   the stage's haptic and finger events. stage.html saves no log yet, so this takes the relay's event stream
             as JSON lines: raw events ({"type": "haptic", ...} per line) or a capture of the SSE stream, whose lines
             start with "data: ", e.g. `curl -sN http://localhost:8765/events > stage-events.txt` during the take.
             Only `haptic` (feel.html's vibrate(): kind, pattern, ok, t = phone Date.now() in ms; Live mode only) and
             `finger` (x, y, down) are read; everything else is skipped.

Every printed number carries the --label and a tag: Measured (counted or timed from these files) or Reasoned (from the
code or an assumption, not measured). Trials under 0.5 s are flagged aborted and left out of accuracy and times, and the
table says so. A rate always reads "k of n"; a percentage is added only when n >= 5.
pixel_e2e.analyse needs a pixel_e2e run record (injected touch windows, laptop clock sync) that a stage take does not
have, so this reuses pixel_e2e's dumpsys parser, step expansion and call matcher by import instead. Stdlib only.
"""
import argparse
import bisect
import contextlib
import io
import json
import re
import statistics
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pixel_e2e import CHROME, match_haptics, on_steps, parse_tz_year, parse_vibrations, phone_epoch  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
ABORT_MS = 500  # under this a trial was a stray or double gesture, not an answer
PCT_MIN_N = 5
SLACK_MS = 10  # pixel_e2e.match_haptics' default: how early a dumpsys entry may look against its call (ms rounding)
TAGS = ("Measured", "Reasoned", "Not measured")


def read_text(path):
    """Decode by BOM: PowerShell 5.1's `>` writes UTF-16 LE, everything else here writes UTF-8."""
    raw = Path(path).read_bytes()
    return raw.decode("utf-16") if raw[:2] in (b"\xff\xfe", b"\xfe\xff") else raw.decode("utf-8-sig")


def num(x, digits=1):
    return f"{x:.{digits}f}".rstrip("0").rstrip(".") if digits else f"{x:.0f}"


def rate(k, n):
    """'k of n', with a percentage only once n is big enough for one to mean something."""
    if n == 0:
        return "none scored"
    return f"{k} of {n}" + (f" ({num(100 * k / n)}%)" if n >= PCT_MIN_N else "")


def spread(values, unit, digits=1):
    if not values:
        return "none", None
    lo, hi, med = min(values), max(values), statistics.median(values)
    value = {"median": med, "min": lo, "max": hi, "unit": unit}
    if len(values) == 1:
        return f"{num(med, digits)} {unit}", value
    return f"median {num(med, digits)} {unit}, range {num(lo, digits)}-{num(hi, digits)} {unit}", value


def row(metric, display, n, tag="Measured", value=None, note=""):
    assert tag in TAGS, tag
    return {"metric": metric, "display": display, "n": n, "tag": tag, "value": value, "note": note}


# ---- Trials ----

def load_trials(path, since=None, until=None):
    trials = []
    for i, line in enumerate(read_text(path).splitlines(), 1):
        if not line.strip():
            continue
        try:
            t = json.loads(line)
        except ValueError:
            raise SystemExit(f"{path}:{i}: not a JSON line")
        at = datetime.fromisoformat(t["at"]) if t.get("at") else None
        if (since and (at is None or at < since)) or (until and (at is None or at >= until)):
            continue
        trials.append(t)
    return trials


def setting(t):
    s = f"width {num(t.get('widthMm', 0))} mm"
    if "fadeMm" in t:
        s += f", fade {num(t['fadeMm'])} mm"
    if t.get("shoulder"):
        s += ", shoulder on"
    return s


def shape_set_size():
    """How many shapes a test can draw, read from feelink/tactile.js's SHAPES so it can't drift."""
    try:
        src = (ROOT / "feelink/tactile.js").read_text(encoding="utf-8")
    except OSError:
        return None
    m = re.search(r"const SHAPES = \{(.*?)\n\s*\};", src, re.S)
    return len(re.findall(r"^\s*(?:'[^']+'|\w+):\s*\[", m.group(1), re.M)) if m else None


def trial_rows(trials):
    scored = [t for t in trials if t["ms"] >= ABORT_MS]
    aborted = [t for t in trials if t["ms"] < ABORT_MS]
    right = [t for t in scored if t["correct"]]
    rows = [row("Trials logged", str(len(trials)), len(trials), value=len(trials))]
    ab = ", ".join(f"{t['ms'] / 1000:.3f} s ({t['shape']})" for t in aborted)
    rows.append(row(f"Aborted (under {ABORT_MS / 1000:g} s): left out of accuracy and times",
                    f"{len(aborted)}" + (f": {ab}" if ab else ""), len(trials),
                    value=[{"shape": t["shape"], "ms": t["ms"]} for t in aborted]))
    rows.append(row("Correct, overall (scored trials)", rate(len(right), len(scored)), len(scored),
                    value={"correct": len(right), "scored": len(scored)}))
    rows.append(row("Correct trials", "; ".join(f"{t['shape']}, {t['ms'] / 1000:.1f} s" for t in right) or "none",
                    len(right), value=[{"shape": t["shape"], "ms": t["ms"]} for t in right]))
    k = shape_set_size()
    if k:
        rows.append(row(f"Chance, guessing among the {k} test shapes", f"1 in {k} ({num(100 / k)}%)", "-", "Reasoned",
                        value=1 / k, note="assumes the tester knows the set and guesses uniformly; free answers make "
                                          "chance lower (feelink/tactile.js SHAPES)"))
    disp, val = spread([t["ms"] / 1000 for t in scored], "s")
    rows.append(row("Time to answer, scored trials (first touch to two-finger tap)", disp, len(scored), value=val))
    disp, val = spread([t["ms"] / 1000 for t in right], "s")
    rows.append(row("Time to a correct answer", disp, len(right), value=val))
    disp, val = spread([t["pathMm"] for t in scored if "pathMm" in t], "mm", 0)
    rows.append(row("Finger path explored, scored trials", disp, sum("pathMm" in t for t in scored), value=val))
    for label, key in (("Shape", lambda t: t["shape"]), ("Setting", setting)):
        for name in sorted({key(t) for t in trials}):
            group = [t for t in trials if key(t) == name]
            s = [t for t in group if t["ms"] >= ABORT_MS]
            c = sum(t["correct"] for t in s)
            gone = len(group) - len(s)
            disp = rate(c, len(s)) + (f" ({gone} aborted, left out)" if gone else "")
            rows.append(row(f"{label}: {name}", disp, len(s), value={"correct": c, "scored": len(s), "aborted": gone}))
    ats = sorted(t["at"] for t in trials if t.get("at"))
    if ats:
        rows.append(row("Logged span (relay clock)", f"{ats[0].replace('T', ' ')} to {ats[-1][11:]}", len(ats),
                        value=[ats[0], ats[-1]]))
    who = {t.get("who", "") for t in trials} - {""}
    blank = sum(not t.get("who") for t in trials)
    rows.append(row("Testers named in the file (distinct who)", f"{len(who)}" + (f", who blank on {blank}" if blank else ""),
                    len(trials), value=sorted(who), note="a blank who means the tester count comes from the run label"))
    return rows


# ---- Stage events and dumpsys ----

def load_events(path):
    """Stage event log -> event dicts in log order. Takes raw JSON lines or an SSE capture ('data: {...}')."""
    events, skipped = [], 0
    for line in read_text(path).splitlines():
        s = line.strip()
        if s.startswith("data:"):
            s = s[5:].strip()
        if not s or s.startswith(":") or re.match(r"(event|id|retry):", s):  # blank line or another SSE field
            continue
        try:
            ev = json.loads(s)
        except ValueError:
            skipped += 1
            continue
        if isinstance(ev, dict):
            events.append(ev)
    return events, skipped


def count_touches(events):
    down, n = False, 0
    for e in events:
        if e.get("type") == "finger":
            n += bool(e.get("down")) and not down
            down = bool(e.get("down"))
    return n


VIB_START = re.compile(
    r"^\s*(?P<created>\d\d-\d\d \d\d:\d\d:\d\d\.\d{3}) \|.*?\| start:\s*(?P<start>\d\d:\d\d:\d\d\.\d{3})?\s*\|"
    r".*?\| usage: (?P<usage>\w+) \|(?: audioUsage=\w+ \|)? (?P<pkg>[\w.]+) \(uid=")


def vib_starts(text):
    """dumpsys's `start` column (when the vibrator began playing), which pixel_e2e.parse_vibrations leaves out.
    Same key as parse_vibrations; None when the entry never started (e.g. superseded first)."""
    return {(m["created"], m["pkg"], m["usage"]): m["start"] for m in map(VIB_START.match, text.splitlines()) if m}


def total_ms(pattern):
    return sum([pattern] if isinstance(pattern, (int, float)) else list(pattern or []))


def latency_rows(haptics, dump_text, tz_arg=None):
    """Page vibrate() calls vs Chrome's dumpsys entries. Both are on the phone's own wall clock (the page's Date.now()
    and Android's log time), so no laptop clock sync is needed, only the phone's UTC offset for dumpsys's local times."""
    calls = sorted((h for h in haptics if isinstance(h.get("t"), (int, float))), key=lambda h: h["t"])
    if not calls:
        return [row("Buzz latency", "not measured (the event log has no timed haptic events)", 0, "Not measured")], {}
    if tz_arg:
        tz, _ = parse_tz_year(f"{tz_arg} 2000")
        tz_src = f"--phone-tz {tz_arg}"
    else:  # the phone sits next to the laptop, so the laptop's offset at the time of the take
        tz = datetime.fromtimestamp(calls[0]["t"] / 1000).astimezone().utcoffset().total_seconds()
        tz_src = "laptop's local UTC offset (assumed same as the phone; override with --phone-tz)"
    sync = {"tz": tz, "year": datetime.fromtimestamp(calls[0]["t"] / 1000, timezone(timedelta(seconds=tz))).year}

    starts = vib_starts(dump_text)
    chrome = [v for k, v in parse_vibrations(dump_text).items() if v["pkg"] == CHROME]
    for v in chrome:
        v["phone_ms"] = phone_epoch(v["created"], sync) * 1000
        st = starts.get((v["created"], v["pkg"], v["usage"]))
        v["start_ms"] = phone_epoch(v["created"][:6] + st, sync) * 1000 if st else None
        if v["start_ms"] is not None and v["start_ms"] < v["phone_ms"] - 12 * 3600e3:
            v["start_ms"] += 24 * 3600e3  # started just after midnight
    lo = calls[0]["t"] - SLACK_MS
    hi = max(h["t"] + total_ms(h.get("pattern")) for h in calls) + SLACK_MS
    entries = sorted((v for v in chrome if lo <= v["phone_ms"] <= hi), key=lambda v: v["phone_ms"])
    outside = len(chrome) - len(entries)

    # A buzz starts from an idle motor when no accepted call came before, the last one was the stop, or its pattern
    # had already run out. Every other call replaces a running buzz (re-arm, fade step, corner or end).
    ok_all = [h for h in calls if h.get("ok") is not False]
    for i, h in enumerate(ok_all):
        p = ok_all[i - 1] if i else None
        h["_idle"] = p is None or p.get("kind") == "stop" or h["t"] >= p["t"] + total_ms(p.get("pattern"))
    # dumpsys drops old entries, so compare only calls from its earliest entry on.
    first_entry = entries[0]["phone_ms"] if entries else hi
    window = [h for h in calls if h["t"] >= first_entry - SLACK_MS]
    before = len(calls) - len(window)
    m = match_haptics(window, [(v["phone_ms"], v["step"]) for v in entries], SLACK_MS)

    # Per call: its first entry, by match_haptics' rule (an entry belongs to the latest accepted call before it).
    ok = [h for h in window if h.get("ok") is not False]
    t_ok = [h["t"] for h in ok]
    got = [[] for _ in ok]
    for v in entries:
        i = bisect.bisect_right(t_ok, v["phone_ms"] + SLACK_MS) - 1
        if i >= 0:
            got[i].append(v)
    lat = {(idle, end): [] for idle in (True, False) for end in ("created", "start")}
    no_entry = ambiguous = 0
    for i, h in enumerate(ok):
        if h.get("kind") == "stop":
            continue
        steps = on_steps(h.get("pattern"), h["t"], t_ok[i + 1] if i + 1 < len(ok) else float("inf"))
        if not got[i] or not steps:
            no_entry += 1
            continue
        v = got[i][0]
        # Chrome logs one entry per on-step: an entry at or past the 2nd step's start, or of another length,
        # can't be pinned to the 1st step.
        if (len(steps) > 1 and v["phone_ms"] >= steps[1][0] - SLACK_MS) or v["step"] not in (None, steps[0][1]):
            ambiguous += 1
            continue
        lat[h["_idle"], "created"].append(v["phone_ms"] - h["t"])
        if v["start_ms"] is not None:
            lat[h["_idle"], "start"].append(v["start_ms"] - h["t"])

    refused = sum(h.get("ok") is False for h in calls)
    rows = [row("Chrome dumpsys entries compared", str(len(entries)), len(entries), value=len(entries),
                note=f"{outside} outside the event log's time span ignored; dumpsys times read with the {tz_src}"),
            row("Page calls vs dumpsys", f"{m['silent_calls']} accepted calls with no entry, {m['unreported']} entries "
                f"no call explains, {m['mismatched']} entries of a length not in their call's pattern",
                m["calls"], value=m, note=f"{before} calls before the earliest dumpsys entry not compared" if before else "")]
    names = {True: "first buzz from an idle motor (touch-down or re-entering the line)",
             False: "call replacing a running buzz (re-arm, fade, corner, end)"}
    for end, what in (("created", "Android logs the request (dumpsys created)"),
                      ("start", "vibrator starts (dumpsys start)")):
        for idle in (True, False):
            disp, val = spread(lat[idle, end], "ms", 0)
            rows.append(row(f"Buzz latency, {names[idle]}: vibrate() -> {what}", disp, len(lat[idle, end]), value=val))
    if no_entry or ambiguous:
        rows.append(row("Calls left out of buzz latency", f"{no_entry} with no dumpsys entry, {ambiguous} whose first "
                        "entry can't be pinned to the pattern's first step", no_entry + ambiguous))
    rows.append(row("Touch -> vibrate() call", "same pointer event handler as the touch (feel.html feel()); "
                    "touchscreen-to-page delay not measured", "-", "Reasoned"))
    return rows, {"tz_seconds": tz, "tz_source": tz_src, "refused": refused, "calls_before_dumpsys": before}


def event_rows(events, dump_text, tz_arg):
    rows, info = [], {}
    if events is not None:
        hap = [e for e in events if e.get("type") == "haptic"]
        refused = sum(e.get("ok") is False for e in hap)
        rows.append(row("Page vibrate() calls in the event log", f"{len(hap)} ({refused} refused by Chrome)", len(hap),
                        value={"calls": len(hap), "refused": refused}, note="the page's own report, Live mode only"))
        rows.append(row("Touches in the event log", str(count_touches(events)), "-", value=count_touches(events),
                        note="finger reports are latest-only, so a quick tap can be missed: a lower bound"))
    if dump_text is not None and events is None:
        n = sum(v["pkg"] == CHROME for v in parse_vibrations(dump_text).values())
        rows.append(row("Chrome dumpsys entries", str(n), n, value=n))
    if events is not None and dump_text is not None:
        more, info = latency_rows([e for e in events if e.get("type") == "haptic"], dump_text, tz_arg)
        rows += more
    else:
        need = "--dumpsys" if events is not None else "--events" if dump_text is not None else "--dumpsys and --events"
        rows.append(row("Buzz latency", f"not measured (needs {need})", "-", "Not measured"))
    return rows, info


# ---- Output ----

def cell(x):
    return str(x).replace("|", "\\|").replace("\n", " ")


def markdown(label, rows, header):
    out = [f"## FeelInk validation: {label}", "", *header, "",
           "| Metric | Value | n | Tag | Run |", "|---|---|---|---|---|"]
    out += [f"| {cell(r['metric'])} | {cell(r['display'])} | {cell(r['n'])} | {r['tag']} | {cell(label)} |" for r in rows]
    notes = [f"- {r['metric']}: {r['note']}" for r in rows if r["note"]]
    if notes:
        out += ["", "Notes:", *notes]
    out += ["", "Measured = counted or timed from the files above. Reasoned = from the code or an assumption, not "
            f"measured. Percentages appear only when n >= {PCT_MIN_N}."]
    return "\n".join(out)


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--label", help="run name printed beside every number, e.g. 'warm-up, pre-fix build, 1 tester'")
    ap.add_argument("--results", default=str(ROOT / "feelink/results.jsonl"))
    ap.add_argument("--since", type=datetime.fromisoformat, help="keep trials with at >= this (ISO, relay local time)")
    ap.add_argument("--until", type=datetime.fromisoformat, help="keep trials with at < this")
    ap.add_argument("--dumpsys", help="saved `adb shell dumpsys vibrator_manager` output")
    ap.add_argument("--events", help="stage event log: JSON lines or an SSE capture of /events")
    ap.add_argument("--phone-tz", help="phone UTC offset as +HHMM/-HHMM (default: the laptop's)")
    ap.add_argument("--json", help="also write the rows and per-trial flags here")
    ap.add_argument("--selftest", action="store_true")
    a = ap.parse_args(argv)
    if a.selftest:
        return selftest()
    if not a.label or not a.label.strip():
        ap.error("--label is required: every number is printed beside it")
    trials = load_trials(a.results, a.since, a.until)
    if not trials:
        raise SystemExit(f"no trials in {a.results}" + (" for that --since/--until" if a.since or a.until else ""))
    rows = trial_rows(trials)
    events, skipped = load_events(a.events) if a.events else (None, 0)
    dump_text = read_text(a.dumpsys) if a.dumpsys else None
    more, info = event_rows(events, dump_text, a.phone_tz)
    rows += more
    for r in rows:
        r["run"] = a.label
    window = f"; at from {a.since or 'start'} until {a.until or 'end'}" if a.since or a.until else ""
    header = [f"Source: {Path(a.results).name}, {len(trials)} trials{window}."
              + (f" Events: {Path(a.events).name}." if a.events else "")
              + (f" dumpsys: {Path(a.dumpsys).name}." if a.dumpsys else "")]
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")  # labels may hold non-ASCII; a cp1252 pipe would crash on them
    print(markdown(a.label, rows, header))
    if a.json:
        doc = {"run": a.label, "generated": datetime.now().isoformat(timespec="seconds"),
               "inputs": {"results": a.results, "since": a.since and a.since.isoformat(),
                          "until": a.until and a.until.isoformat(), "events": a.events,
                          "events_lines_skipped": skipped, "dumpsys": a.dumpsys, **info},
               "rows": rows,
               "trials": [{**t, "aborted": t["ms"] < ABORT_MS, "run": a.label} for t in trials]}
        Path(a.json).write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return 0


# ---- Selftest ----

def selftest():
    assert rate(1, 4) == "1 of 4" and rate(1, 8) == "1 of 8 (12.5%)" and rate(3, 6) == "3 of 6 (50%)"
    assert rate(0, 0) == "none scored" and spread([], "s") == ("none", None)
    assert spread([3, 1, 2], "s")[0] == "median 2 s, range 1-3 s" and spread([35.311], "s")[0] == "35.3 s"
    assert (shape_set_size() or 0) >= 2, shape_set_size()
    assert load_events.__doc__ and count_touches([{"type": "finger", "down": True}, {"type": "finger", "down": True},
                                                  {"type": "finger", "down": False}, {"type": "finger", "down": True}]) == 2

    # Trials: circle 3 of 6 (a percentage), square 1 of 1 at exactly 0.5 s (no percentage), 0.499 s and 0 s aborted,
    # and one later trial that --until leaves out.
    trial = lambda shape, ms, ok, at, **kw: {"who": "", "shape": shape, "ms": ms, "correct": ok, "widthMm": 9,
                                             "fadeMm": 6, "pathMm": ms // 10, "at": f"2026-11-07T{at}", **kw}
    trials = [trial("circle", 1000 * s, s % 4 == 3, f"14:00:{s:02d}") for s in (3, 5, 7, 9, 11, 13)]
    trials += [trial("square", 499, False, "14:01:00"), trial("square", 500, True, "14:01:10"),
               trial("T", 0, False, "14:01:20", widthMm=2), trial("open at left", 20000, False, "15:30:00")]
    trials[-1].pop("fadeMm")  # an older-build line: shoulder instead of fadeMm
    trials[-1]["shoulder"] = False

    # Stage events (an SSE capture) and dumpsys on the phone clock: B is 13:00:00.000 at -0800.
    B = datetime(2026, 11, 7, 21, 0, tzinfo=timezone.utc).timestamp() * 1000
    hap = lambda kind, pattern, dt, ok=True: {"type": "haptic", "kind": kind, "level": 3, "top": 3,
                                              "pattern": pattern, "ok": ok, "t": B + dt}
    fing = lambda down: {"type": "finger", "x": 28, "y": 60, "down": down, "pen": False, "level": 3}
    events = [{"type": "sync", "strokes": []}, fing(True), hap("hold", [5000], 0), fing(True),
              hap("fade", [12, 60, 12, 60], 4500), hap("stop", [1], 4700), fing(False), fing(True),
              hap("hold", [5000], 6000), hap("tick", [25], 7000, ok=False), hap("corner", [30, 40, 30], 8000), fing(False)]
    sse = "".join(f"data: {json.dumps(e)}\n\n" for e in events) + ": keep-alive\n\nnot json\n"

    def clock(dt):
        return (datetime(2026, 11, 7, 13, 0) + timedelta(milliseconds=dt)).strftime("%H:%M:%S.%f")[:12]

    def dline(dt, step, start=None, pkg=CHROME):
        return (f"      11-07 {clock(dt)} |   effect |             finished | duration: {step:>5}ms | start: "
                f"{clock(start) if start is not None else '':>12} | end: 13:00:30.000 | scale:      NONE (1.00) | "
                f"adaptiveScale=1.00 | flags:    0 | usage: TOUCH | {pkg} (uid=10201, deviceId=0) | reason: null | "
                f"played: Step={step}ms(amplitude=-1.00, startTime=-1) | original: null")
    # Calls: hold@0 (idle) logged +8, started +15; fade@4500 (replaces the hold) +3/+5, 2nd step +76; stop@4700;
    # hold@6000 (idle after the stop) +20/+30; tick@7000 refused; corner@8000 (replaces the hold) only an entry at
    # +75, past its 2nd step's start at +70, so ambiguous. Two Chrome entries outside the log's span, one launcher.
    dump = "\n".join(["  Recent vibrations:", "    TOUCH:", dline(-60000, 30), dline(0 + 8, 5000, 15),
                      dline(4503, 12, 4505), dline(4576, 12, 4577), dline(4702, 1, 4702), dline(6020, 5000, 6030),
                      dline(8075, 30, 8076), dline(20000, 30, 20001),
                      dline(5000, 32, 5001, pkg="com.google.android.apps.nexuslauncher")]) + "\n"

    with tempfile.TemporaryDirectory() as d:
        d = Path(d)
        (d / "results.jsonl").write_text("".join(json.dumps(t) + "\n" for t in trials) + "\n", encoding="utf-8")
        (d / "events.txt").write_text(sse, encoding="utf-8")
        (d / "dump.txt").write_bytes(dump.encode("utf-16"))  # as PowerShell 5.1's `>` would save it
        label = "selftest run, 0 testers"
        common = ["--label", label, "--results", str(d / "results.jsonl"), "--json", str(d / "out.json")]

        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            main(common + ["--until", "2026-11-07T15:00", "--events", str(d / "events.txt"),
                           "--dumpsys", str(d / "dump.txt"), "--phone-tz", "-0800"])
        md = out.getvalue()
        doc = json.loads((d / "out.json").read_text(encoding="utf-8"))
        r = {x["metric"]: x for x in doc["rows"]}
        table = [ln for ln in md.splitlines() if ln.startswith("| ") and not ln.startswith("| Metric")]
        assert len(table) == len(doc["rows"]) and all(label in ln and any(f"| {g} |" in ln for g in TAGS)
                                                      for ln in table), md
        assert all(x["run"] == label and x["tag"] in TAGS for x in doc["rows"]), doc["rows"]
        assert r["Trials logged"]["value"] == 9 and len(doc["trials"]) == 9, r["Trials logged"]
        assert [t["aborted"] for t in doc["trials"]].count(True) == 2
        ab = r["Aborted (under 0.5 s): left out of accuracy and times"]["display"]
        assert ab == "2: 0.499 s (square), 0.000 s (T)", ab
        assert r["Correct, overall (scored trials)"]["display"] == "4 of 7 (57.1%)", r["Correct, overall (scored trials)"]
        assert r["Shape: circle"]["display"] == "3 of 6 (50%)" and r["Shape: circle"]["n"] == 6
        assert r["Shape: square"]["display"] == "1 of 1 (1 aborted, left out)", r["Shape: square"]  # no % at n=1
        assert r["Shape: T"]["display"] == "none scored (1 aborted, left out)", r["Shape: T"]
        assert r["Setting: width 9 mm, fade 6 mm"]["display"] == "4 of 7 (57.1%) (1 aborted, left out)"
        t = r["Time to answer, scored trials (first touch to two-finger tap)"]
        assert t["display"] == "median 7 s, range 0.5-13 s" and t["n"] == 7, t
        assert r["Correct trials"]["display"] == "circle, 3.0 s; circle, 7.0 s; circle, 11.0 s; square, 0.5 s"
        assert r["Logged span (relay clock)"]["display"] == "2026-11-07 14:00:03 to 14:01:20"
        for ln in table:  # never a percentage beside an n under 5
            n = ln.split(" | ")[2]
            assert "%" not in ln or not n.isdigit() or int(n) >= PCT_MIN_N or "Chance" in ln, ln

        assert r["Page vibrate() calls in the event log"]["display"] == "6 (1 refused by Chrome)"
        assert r["Touches in the event log"]["value"] == 2
        assert doc["inputs"]["events_lines_skipped"] == 1
        assert r["Chrome dumpsys entries compared"]["value"] == 6, r["Chrome dumpsys entries compared"]
        assert "2 outside" in r["Chrome dumpsys entries compared"]["note"]
        m = r["Page calls vs dumpsys"]["value"]
        assert (m["calls"], m["refused"], m["expected"], m["logged"], m["silent_calls"], m["unreported"],
                m["mismatched"]) == (6, 1, 7, 6, 0, 0, 0), m
        idle = "first buzz from an idle motor (touch-down or re-entering the line)"
        run = "call replacing a running buzz (re-arm, fade, corner, end)"
        lat = lambda who, what: r[f"Buzz latency, {who}: vibrate() -> {what}"]
        assert lat(idle, "Android logs the request (dumpsys created)")["display"] == "median 14 ms, range 8-20 ms"
        assert lat(idle, "vibrator starts (dumpsys start)")["value"]["median"] == 22.5
        assert lat(run, "Android logs the request (dumpsys created)")["display"] == "3 ms"
        assert lat(run, "vibrator starts (dumpsys start)")["n"] == 1
        assert r["Calls left out of buzz latency"]["display"].startswith("0 with no dumpsys entry, 1 whose")
        assert r["Touch -> vibrate() call"]["tag"] == "Reasoned"

        # No event log or dumpsys: latency says so instead of printing a number; --since keeps only the late trial.
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            main(common + ["--since", "2026-11-07T15:00"])
        doc = json.loads((d / "out.json").read_text(encoding="utf-8"))
        r = {x["metric"]: x for x in doc["rows"]}
        assert r["Trials logged"]["value"] == 1 and r["Correct, overall (scored trials)"]["display"] == "0 of 1"
        assert r["Setting: width 9 mm"]["n"] == 1  # the shoulder-era line, shoulder off
        assert r["Buzz latency"]["tag"] == "Not measured" and "--dumpsys and --events" in r["Buzz latency"]["display"]
        try:
            with contextlib.redirect_stderr(io.StringIO()):
                main(["--results", str(d / "results.jsonl")])
            raise AssertionError("ran without --label")
        except SystemExit as e:
            assert e.code == 2, e
    print("selftest: ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
