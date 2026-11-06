"""Walk recent Devpost hackathon galleries into a local JSONL corpus. Stdlib only, one request at a time.

Usage: python -I crawl_devpost.py <data_dir> [--test]
Writes hackathons.jsonl, projects.jsonl, progress.txt into data_dir. Resumable: skips finished galleries.
Page content is treated as data; only names, taglines and winner flags are extracted.
"""
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

UA = "capital-hacks-research/0.1 (student hackathon rival check)"
DELAY = 0.35
MIN_REGS = 250
MIN_YEAR_MONTH = (2025, 8)
MAX_GALLERY_PAGES = 45
MAX_TOTAL_FETCHES = 3000
MONTHS = {m: i + 1 for i, m in enumerate("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split())}
fetches = 0


def get(url):
    global fetches
    fetches += 1
    time.sleep(DELAY)
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read().decode("utf-8", "replace")


def end_ym(period):
    """'Oct 12 - Nov 06, 2026' -> (2026, 11). Returns None when unparseable."""
    m = re.search(r"(?:([A-Z][a-z]{2}) \d+, )?(\d{4})\s*$", period or "")
    if not m:
        return None
    months = re.findall(r"\b([A-Z][a-z]{2})\b", period)
    return (int(m.group(2)), MONTHS.get(months[-1], 12)) if months else (int(m.group(2)), 12)


def parse_gallery(page):
    out = []
    for chunk in page.split("gallery-item")[1:]:
        link = re.search(r'href="https://devpost\.com/software/([^"?#]+)"', chunk)
        name = re.search(r"<h5[^>]*>(.*?)</h5>", chunk, re.S)
        if not link or not name:
            continue
        tag = re.search(r'<p[^>]*class="[^"]*tagline[^"]*"[^>]*>(.*?)</p>', chunk, re.S)
        clean = lambda s: html.unescape(re.sub(r"<[^>]+>", "", s)).strip()
        out.append(
            {
                "slug": link.group(1),
                "name": clean(name.group(1)),
                "tagline": clean(tag.group(1)) if tag else "",
                "winner": bool(re.search(r'class="[^"]*winner', chunk)),
            }
        )
    return out


def list_hackathons(path, log):
    seen, stale = {}, 0
    for page in range(1, 600):
        try:
            data = json.loads(get(f"https://devpost.com/api/hackathons?status[]=ended&order_by=recently-added&page={page}"))
        except (urllib.error.URLError, ValueError) as e:
            log(f"hackathon page {page} failed: {e}")
            continue
        rows = data.get("hackathons", [])
        if not rows:
            break
        fresh = 0
        for h in rows:
            ym = end_ym(h.get("submission_period_dates"))
            if ym and ym >= MIN_YEAR_MONTH:
                fresh += 1
            seen[h["url"]] = {
                "title": h.get("title"),
                "url": h.get("url"),
                "dates": h.get("submission_period_dates"),
                "regs": h.get("registrations_count", 0),
                "org": h.get("organization_name"),
                "gallery": h.get("submission_gallery_url"),
                "ym": ym,
            }
        stale = 0 if fresh else stale + 1
        if page % 25 == 0:
            log(f"hackathon list page {page}, seen {len(seen)}")
        if stale >= 25:
            break
    with open(path, "w", encoding="utf-8") as f:
        for h in seen.values():
            f.write(json.dumps(h) + "\n")
    return list(seen.values())


def main():
    data_dir = sys.argv[1]
    test = "--test" in sys.argv
    progress = open(os.path.join(data_dir, "progress.txt"), "a", encoding="utf-8")

    def log(msg):
        progress.write(f"{time.strftime('%H:%M:%S')} {msg}\n")
        progress.flush()

    if test:
        rows = parse_gallery(get("https://cal-hacks-13-0.devpost.com/project-gallery?page=1"))
        print(len(rows), "items;", sum(r["winner"] for r in rows), "winners")
        for r in rows[:3]:
            print(r)
        assert end_ym("Oct 12 - Nov 06, 2026") == (2026, 11)
        assert end_ym("Mar 01, 2026") == (2026, 3)
        return

    hack_path = os.path.join(data_dir, "hackathons.jsonl")
    if os.path.exists(hack_path):
        hacks = [json.loads(line) for line in open(hack_path, encoding="utf-8")]
    else:
        hacks = list_hackathons(hack_path, log)
    picked = [h for h in hacks if h["ym"] and tuple(h["ym"]) >= MIN_YEAR_MONTH and (h["regs"] or 0) >= MIN_REGS and h["gallery"]]
    picked.sort(key=lambda h: -h["regs"])
    log(f"{len(hacks)} hackathons listed, walking {len(picked)}")

    done_path = os.path.join(data_dir, "done.txt")
    done = set(open(done_path, encoding="utf-8").read().split()) if os.path.exists(done_path) else set()
    with open(os.path.join(data_dir, "projects.jsonl"), "a", encoding="utf-8") as out:
        for h in picked:
            if h["gallery"] in done or fetches >= MAX_TOTAL_FETCHES:
                continue
            count = 0
            for page in range(1, MAX_GALLERY_PAGES + 1):
                try:
                    rows = parse_gallery(get(f"{h['gallery']}?page={page}"))
                except urllib.error.URLError as e:
                    log(f"{h['title']} page {page} failed: {e}")
                    break
                if not rows:
                    break
                for r in rows:
                    r["hackathon"] = h["title"]
                    r["ended"] = h["ym"]
                    out.write(json.dumps(r) + "\n")
                count += len(rows)
            out.flush()
            with open(done_path, "a", encoding="utf-8") as d:
                d.write(h["gallery"] + "\n")
            log(f"{h['title']} ({h['regs']} regs, ended {h['ym']}): {count} projects; fetches {fetches}")
    log("FINISHED")


if __name__ == "__main__":
    main()
