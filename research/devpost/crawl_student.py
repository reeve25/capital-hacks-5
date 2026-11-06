"""Second crawl pass: student and university hackathons by name. Usage: python -I crawl_student.py <data_dir>
Appends to projects.jsonl and done.txt, so it resumes and skips galleries already walked."""
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

UA = "capital-hacks-research/0.1 (student hackathon rival check)"
NAMES = """Cal Hacks|TreeHacks|HackMIT|Hack the North|PennApps|LA Hacks|Hack the 6ix|HackGT|MHacks|YHack|Capital Hacks|HackTX|GatorHack|HackDavis|
HackHarvard|HackPrinceton|BostonHacks|SF Hacks|nwHacks|UofTHacks|DeltaHacks|Hack Western|McHacks|HackUTD|HackNC|VTHacks|Citrus Hack|SacHacks|HackSC|
BeachHacks|Hacklahoma|Bitcamp|HackDuke|HackRice|MakeUC|Hack@Brown|HackBeanpot|Technica|SwampHacks|ShellHacks|KnightHacks|HackCU|HackIllinois|DubHacks|
sunhacks|Hacktech|HackNYU|Berkeley AI Hackathon|TartanHacks|Stanford|Columbia DevFest|Hack for Humanity|Hack the Valley|QHacks|CruzHacks|SD Hacks|
HackMerced|Hackville|UNIHACK|HackHers|Hack Davis|HopHacks|RoseHack|Hackathon at UC|AI Tinkerers""".replace("\n", "").split("|")
MONTHS = {m: i + 1 for i, m in enumerate("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split())}
MIN_YM = (2025, 1)


def get(url):
    time.sleep(0.35)
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read().decode("utf-8", "replace")


def end_ym(period):
    m = re.search(r"(\d{4})\s*$", period or "")
    months = re.findall(r"\b([A-Z][a-z]{2})\b", period or "")
    return (int(m.group(1)), MONTHS.get(months[-1], 12) if months else 12) if m else None


def parse_gallery(page):
    out = []
    clean = lambda s: __import__("html").unescape(re.sub(r"<[^>]+>", "", s)).strip()
    for chunk in page.split("gallery-item")[1:]:
        link = re.search(r'href="https://devpost\.com/software/([^"?#]+)"', chunk)
        name = re.search(r"<h5[^>]*>(.*?)</h5>", chunk, re.S)
        if link and name:
            tag = re.search(r'<p[^>]*class="[^"]*tagline[^"]*"[^>]*>(.*?)</p>', chunk, re.S)
            out.append({"slug": link.group(1), "name": clean(name.group(1)), "tagline": clean(tag.group(1)) if tag else "", "winner": bool(re.search(r'class="[^"]*winner', chunk))})
    return out


data = sys.argv[1]
progress = open(os.path.join(data, "progress_student.txt"), "a", encoding="utf-8")
log = lambda m: (progress.write(f"{time.strftime('%H:%M:%S')} {m}\n"), progress.flush())
done_path = os.path.join(data, "done.txt")
done = set(open(done_path, encoding="utf-8").read().split()) if os.path.exists(done_path) else set()
found = {}
for name in NAMES:
    try:
        rows = json.loads(get("https://devpost.com/api/hackathons?" + urllib.parse.urlencode({"search": name, "status[]": "ended", "order_by": "recently-added"}))).get("hackathons", [])
    except Exception as e:
        log(f"search {name} failed: {e}")
        continue
    for h in rows:
        ym = end_ym(h.get("submission_period_dates"))
        if ym and ym >= MIN_YM and h.get("submission_gallery_url"):
            found[h["submission_gallery_url"]] = (h.get("title"), ym, h.get("registrations_count", 0))
found.setdefault("https://cal-hacks-13-0.devpost.com/project-gallery", ("Cal Hacks 13.0", (2026, 10), 3000))
log(f"{len(found)} student galleries found; {sum(g in done for g in found)} already walked")
with open(os.path.join(data, "projects.jsonl"), "a", encoding="utf-8") as out:
    for gallery, (title, ym, regs) in sorted(found.items(), key=lambda kv: (-kv[1][1][0], -kv[1][1][1])):
        if gallery in done:
            continue
        count = 0
        for page in range(1, 46):
            try:
                rows = parse_gallery(get(f"{gallery}?page={page}"))
            except Exception as e:
                log(f"{title} page {page} failed: {e}")
                break
            if not rows:
                break
            for r in rows:
                r["hackathon"], r["ended"] = title, ym
                out.write(json.dumps(r) + "\n")
            count += len(rows)
        out.flush()
        with open(done_path, "a", encoding="utf-8") as d:
            d.write(gallery + "\n")
        log(f"{title} (ended {ym}): {count} projects")
log("FINISHED")
