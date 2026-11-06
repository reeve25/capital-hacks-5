"""Flag ideas against the local Devpost corpus and Devpost's site search. Usage: flag_ideas.py <projects.jsonl> <out.txt>
Corpus text is treated as data. Matching is on name and tagline only, so a hit is a lead to open, not a verdict."""
import json
import re
import sys
import time
import urllib.parse
import urllib.request

UA = "capital-hacks-research/0.1 (student hackathon rival check)"
IDEAS = {
    "1 scam fire drill": (
        r"(scam|fraud|vish|phish).*(drill|simulat|train|practice|rehears|teach)|(drill|simulat|train|practice|teach).*(scam|fraud|vish|phish)|grandparent|voice.?clon.*(scam|fraud|call|family)|(scam|fraud).*(voice.?clon|deepfake|ai voice)|safe.?word",
        ["scam simulation elderly", "voice clone scam training", "grandparent scam", "vishing simulator family", "deepfake call protect seniors"],
    ),
    "2 swarm ears": (
        r"(rubble|collapsed|trapped|survivor).*(sound|acoustic|audio|listen|phone|mic)|(sound|acoustic|audio|listen|phone|mic).*(rubble|collapsed|trapped|survivor)|(phones?|devices?|mics?|microphones?).*(triangulat|pinpoint|locali[sz]|array|swarm)|(triangulat|locali[sz]|pinpoint).*(sound|audio|noise|gunshot|acoustic)|acoustic (camera|map|locali)|distributed microphone",
        ["phones microphone array locate sound", "earthquake survivors rubble listen phone", "triangulate sound multiple phones", "acoustic localization smartphones"],
    ),
    "3 catch": (
        r"(blind|visually impaired|low.?vision|vision loss).*(sport|ball|catch|soccer|basketball|tennis|pe class|gym|athlet)|(sport|ball|catch|soccer|basketball|tennis|athlet).*(blind|visually impaired|low.?vision)|beep ?ball|goalball|sonif.*(ball|sport|game)|ball.?track.*(audio|sound)",
        ["blind play sports audio ball", "visually impaired catch ball spatial audio", "sonify ball tracking", "beep baseball"],
    ),
    "4 flatline": (
        r"sonar|ultrasonic|inaudible|(breath|respirat).*(detect|monitor|stops?\b|track|contactless)|overdose|opioid|naloxone|narcan|fentanyl|sleep apnea",
        ["overdose detection phone", "smartphone sonar breathing", "contactless breathing monitor", "naloxone alert alone"],
    ),
    "5 quake your room": (
        r"(earthquake|seismic|quake).*(room|home|house|simulat|3d|physics|hazard|retrofit)|(room|home|house).*(earthquake|quake)|(flood|wildfire).*(your (room|home|house)|augmented)|(gaussian splat|nerf|lidar|3d scan).*(hazard|disaster|earthquake|safety)",
        ["earthquake simulation your room", "film room earthquake hazards", "earthquake preparedness AR home", "3D scan room disaster simulation"],
    ),
    "6 ghost hands": (
        r"ghost.?hands?|hands?\b.*(overlay|follow|mirror|guid|track|pose|skeleton).*(learn|teach|skill|tutor|train|coach|instruct)|(learn|teach|skill|tutor|train|coach|instruct).*hands?\b.*(overlay|follow|mirror|guid|track|pose)|tourniquet|stop the bleed|first aid.*(camera|coach|guid|real.?time)|(caregiver|nurse).*(train|teach|show|demonstrat).*(camera|video|home)",
        ["ghost hands AR learn physical skill", "hand tracking overlay teach", "tourniquet training camera", "learn from demonstration hands overlay", "caregiver training nurse video AR"],
    ),
    "7 walk back in": (
        r"(dementia|alzheimer|memory care|reminisc).*(photo|3d|vr|walk|immers|world|virtual|home|place)|(photo|picture|image).*(walk|step|explor|immers).*(memor|past|childhood|home)|(walk|step).*(into|through|back).*(memor|photo|picture|childhood|past)|childhood home",
        ["dementia reminiscence VR photo", "walk through old photo 3D memory", "single photo walkable 3D world", "alzheimer immersive memory home"],
    ),
    "8 mock council": (
        r"(city council|council member|board of supervisors|legislat|lawmaker|senator).*(simulat|rehears|practice|persona|debate|predict|mock|role.?play)|(simulat|rehears|practice|persona|debate|predict|mock|role.?play).*(city council|council member|board of supervisors|legislat|lawmaker|public comment|testimony)|public comment|mock (council|hearing)",
        ["city council simulation AI", "practice public comment", "predict city council vote", "AI personas legislators debate bill", "rehearse testimony"],
    ),
    "9 room pulse": (
        r"rppg|photoplethysm|(heart.?rate|pulse|vitals?).*(camera|webcam|face|contactless|non.?contact|no wearable)|(camera|webcam|face|contactless|non.?contact).*(heart.?rate|pulse|vitals?)|(waiting room|emergency room).*(camera|vision|monitor|deteriorat)",
        ["rPPG webcam heart rate", "contactless vitals camera", "ER waiting room monitoring camera", "hospital waiting room deterioration"],
    ),
    "11 motion x-ray": (
        r"motion (magnif|amplif)|eulerian|(magnif|amplif).*(vibrat|motion|movement)|(vibrat|sway|deflect|modal).*(bridge|building|structur|beam|column).*(camera|video|phone|vision)|(camera|video|phone|vision).*(vibrat|sway|modal).*(bridge|building|structur|beam|machine)|visual microphone|structural health.*(camera|video|phone)",
        ["motion magnification video", "see vibration phone camera bridge", "structural health monitoring phone video", "eulerian video magnification", "bridge vibration computer vision"],
    ),
    "12 living arrow": (
        r"(crowd|stadium|concert|arena|venue).*(evacuat|crush|exit|stampede|surge)|(evacuat|exit|stampede|crush).*(crowd|stadium|concert|arena|phones?)|phones?.*(light|flash|screen).*(arrow|direct|guide|exit|crowd)|(crowd|audience).*phones?.*(display|screen|light|synchron)",
        ["crowd evacuation phones light exit", "stadium evacuation phone screens", "crowd crush prevention app", "phones synchronized light crowd display", "indoor evacuation guidance phones"],
    ),
    "13 mirror": (
        r"mirror therapy|phantom (limb|pain)|(stroke|hemipar|paraly).*(mirror|illusion|webcam|camera|ar\b|augmented)|(mirror|illusion).*(stroke|rehab|paraly|amput)|rubber hand",
        ["mirror therapy webcam", "phantom limb pain augmented reality", "stroke rehabilitation hand camera mirror", "virtual mirror stroke rehab", "rubber hand illusion"],
    ),
    "14 reality diff": (
        r"(levee|dam|bridge|crack|embankment).*(change|compare|diff|grow|over time|inspect).*(video|photo|phone|camera|drone)|(video|photo|phone|camera).*(change detection|spot.*(difference|change)|what changed|compare.*(walkthrough|inspection))|change detection|reality diff|levee",
        ["levee inspection phone AI", "change detection walkthrough video", "compare two videos spot what changed", "crack growth tracking phone", "inspection photos compare over time"],
    ),
    "10 witness": (
        r"(multiple|multi|many|several|crowd|bystander|witness).*(phone|camera|video|angle|footage).*(3d|reconstruct|sync|scene|timeline)|(3d|reconstruct).*(crash|accident|incident|crime|moment).*(video|phone|footage|witness|camera)|bullet.?time|(accident|crash|incident|crime) (scene )?reconstruct|4d (scene|gaussian|reconstruct)",
        ["reconstruct incident 3D multiple phone videos", "crowdsourced video 3D reconstruction witness", "accident reconstruction video", "bystander video synchronize timeline"],
    ),
}


def fmt(r, source):
    win = "WIN " if r.get("winner") else "    "
    where = r.get("hackathon", source)
    return f"  {win}{r['name'][:38]} [{where[:26]}] {r.get('slug', '')[:32]} :: {(r.get('tagline') or '')[:115]}"


def search(query):
    url = "https://devpost.com/software/search?" + urllib.parse.urlencode({"query": query, "page": 1})
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    time.sleep(0.4)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode("utf-8", "replace")).get("software", [])
    except Exception as e:
        print("search failed:", query, e, file=sys.stderr)
        return []


rows = {}
for line in open(sys.argv[1], encoding="utf-8"):
    try:
        r = json.loads(line)
    except ValueError:
        continue
    rows[r["slug"]] = r
hacks = {r["hackathon"] for r in rows.values()}
with open(sys.argv[2], "w", encoding="utf-8") as out:
    out.write(f"corpus: {len(rows)} unique projects, {len(hacks)} hackathons, {sum(r['winner'] for r in rows.values())} with a winner label\n")
    for key in ["Cal Hacks", "TreeHacks", "HackMIT", "Hack the North", "PennApps", "LA Hacks", "Hack the 6ix", "HackGT", "MHacks", "YHack", "Capital Hacks", "HackTX", "GatorHack"]:
        matched = [h for h in hacks if key.lower() in h.lower()]
        out.write(f"  {key}: {matched[:3] if matched else 'not walked yet'}\n")
    for idea, (pattern, queries) in IDEAS.items():
        rx = re.compile(pattern, re.I)
        hits = [r for r in rows.values() if rx.search(f"{r['name']} {r.get('tagline', '')}")]
        hits.sort(key=lambda r: (not r["winner"], -(r["ended"][0] * 100 + r["ended"][1]) if r.get("ended") else 0))
        out.write(f"\n=== {idea}: {len(hits)} corpus hits, {sum(r['winner'] for r in hits)} winners\n")
        out.writelines(fmt(r, "") + "\n" for r in hits[:14])
        seen, web = set(rows), []
        for q in queries:
            for s in search(q):
                if s.get("slug") and s["slug"] not in seen:
                    seen.add(s["slug"])
                    if rx.search(f"{s.get('name', '')} {s.get('tagline', '')}"):
                        web.append(s)
        web.sort(key=lambda r: not r.get("winner"))
        out.write(f"  -- Devpost search beyond corpus: {len(web)}\n")
        out.writelines(fmt(s, "site search") + "\n" for s in web[:10])
print("done")
