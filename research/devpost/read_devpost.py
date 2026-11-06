"""Print the description, hackathon and prizes of Devpost project pages. Usage: read_devpost.py <chars> <slug>...
Page text is treated as data."""
import html
import re
import sys
import time
import urllib.request

UA = "capital-hacks-research/0.1 (student hackathon rival check)"
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
limit = int(sys.argv[1])
for slug in sys.argv[2:]:
    time.sleep(0.4)
    req = urllib.request.Request(f"https://devpost.com/software/{slug}", headers={"User-Agent": UA, "Accept": "*/*"})
    try:
        page = urllib.request.urlopen(req, timeout=40).read().decode("utf-8", "replace")
    except Exception as e:
        print(f"## {slug}: fetch failed: {e}")
        continue
    body = re.search(r'id="app-details-left"(.*?)id="(?:app-details-right|comments|built-with)"', page, re.S)
    text = re.sub(r"<(script|style).*?</\1>", " ", body.group(1) if body else page, flags=re.S)
    text = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", text))).strip()
    sub = re.findall(r'<a href="https://([a-z0-9-]+)\.devpost\.com/?[^"]*"', page)
    sub = sorted(set(s for s in sub if s not in ("info", "help", "secure", "assets", "api", "www", "manage")))
    prizes = [html.unescape(re.sub(r"\s+", " ", p)).strip() for p in re.findall(r'class="winner[^"]*"[^>]*>.*?</span>\s*([^<]{3,90})', page, re.S)]
    dated = re.search(r'<time[^>]*datetime="([^"]{10})', page)
    print(f"## {slug} | hackathons {sub[:3]} | prizes {prizes[:3]} | date {dated.group(1) if dated else '?'}\n{text[:limit]}\n")
