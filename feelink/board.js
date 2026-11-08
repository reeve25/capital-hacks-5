// Pure logic for the FeelInk stage view (stage.html). All coordinates are board millimetres
// unless a name says px. No browser calls, so `node --test feelink/board.test.cjs` can check it.
(function (root) {
  // Half the phone's 6 mm core: a piece of ink counts as found once the finger passes this close.
  const FELT_MM = 3;
  // Ink is resampled at this spacing so a long straight segment is revealed piece by piece, not all at once.
  const RESAMPLE_MM = 1;

  // Letterbox the board into a box: uniform scale, never stretched, centred.
  function fit(boxW, boxH, board, pad = 0) {
    const scale = Math.max(0, Math.min((boxW - 2 * pad) / board.w, (boxH - 2 * pad) / board.h));
    const w = board.w * scale, h = board.h * scale;
    return { scale, x: (boxW - w) / 2, y: (boxH - h) / 2, w, h };
  }

  const toMm = (f, px, py) => ({ x: (px - f.x) / f.scale, y: (py - f.y) / f.scale });
  const clampToBoard = (p, board) => ({ x: Math.max(0, Math.min(board.w, p.x)), y: Math.max(0, Math.min(board.h, p.y)) });

  // Light smoothing for hand-drawn input: drop jitter closer than minStep, then a centred moving
  // average. Endpoints stay put so a stroke starts and ends where the tutor put the pen down and up.
  function smooth(pts, opts = {}) {
    const minStep = opts.minStep ?? 0.4, radius = opts.radius ?? 2;
    const kept = [];
    for (const p of pts) {
      const last = kept[kept.length - 1];
      if (!last || Math.hypot(p.x - last.x, p.y - last.y) >= minStep) kept.push({ x: p.x, y: p.y });
    }
    const lastRaw = pts[pts.length - 1];
    const tail = kept[kept.length - 1];
    if (tail && (tail.x !== lastRaw.x || tail.y !== lastRaw.y)) {
      // The pen-up point always survives, replacing a kept point that sits within minStep of it.
      if (kept.length > 1) kept[kept.length - 1] = { x: lastRaw.x, y: lastRaw.y };
      else kept.push({ x: lastRaw.x, y: lastRaw.y });
    }
    if (kept.length < 3 || radius < 1) return kept;
    return kept.map((p, i) => {
      if (i === 0 || i === kept.length - 1) return p;
      const r = Math.min(radius, i, kept.length - 1 - i);
      let sx = 0, sy = 0;
      for (let j = i - r; j <= i + r; j++) { sx += kept[j].x; sy += kept[j].y; }
      const n = 2 * r + 1;
      return { x: Math.round(sx / n * 100) / 100, y: Math.round(sy / n * 100) / 100 };
    });
  }

  // The tutor's stroke from raw pointer samples (#92): smoothed freehand, or while Shift is held, the straight
  // line from the stroke's first sample to the latest one. Releasing Shift mid-stroke goes back to freehand.
  function strokePoints(raw, straight = false) {
    if (!straight) return smooth(raw);
    if (!raw.length) return [];
    const a = raw[0], b = raw[raw.length - 1];
    if (a.x === b.x && a.y === b.y) return [{ x: a.x, y: a.y }];
    return [{ x: a.x, y: a.y }, { x: b.x, y: b.y }];
  }

  // Points along the polyline at most `step` apart, always including every original vertex.
  function resample(pts, step = RESAMPLE_MM) {
    if (!pts.length) return [];
    const out = [{ x: pts[0].x, y: pts[0].y }];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / step));
      for (let k = 1; k <= n; k++) out.push({ x: a.x + (b.x - a.x) * k / n, y: a.y + (b.y - a.y) * k / n });
    }
    return out;
  }

  function distPointSeg(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    const t = len2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2)) : 0;
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  }

  // Found by touch: marks ink samples within `radius` of the finger's path from a to b (a may equal b).
  // Uses the swept path so a fast finger still reveals what it crossed. Returns how many were newly found.
  // `mark` is what gets stored (the stage stores the time found, so fresh ink can settle); it must be truthy.
  function markFelt(samples, felt, a, b, radius = FELT_MM, mark = 1) {
    let found = 0;
    for (let i = 0; i < samples.length; i++) {
      if (!felt[i] && distPointSeg(samples[i], a, b) <= radius) { felt[i] = mark; found++; }
    }
    return found;
  }

  // Index ranges [start, end] of consecutive felt samples, for drawing found ink as solid runs.
  function feltRuns(felt, n = felt.length) {
    const runs = [];
    let start = -1;
    for (let i = 0; i <= n; i++) {
      const on = i < n && felt[i];
      if (on && start < 0) start = i;
      if (!on && start >= 0) { runs.push([start, i - 1]); start = -1; }
    }
    return runs;
  }

  // The one place that reads phone haptic events (format decided by Reeve on issue #34, shipped in
  // feel.html): {type:'haptic', kind:'hold'|'fade'|'corner'|'end'|'tick'|'guide'|'stop', level, top, pattern, ok, t}.
  // Returns null for anything that should not draw a ring, else {burst, level, top, strength 0..1, ms}.
  // burst: a one-off cue (corner, end, tick). Otherwise a held level state (0 means off).
  // ms: how long the phone's vibration runs (pattern total), 0 when unknown.
  // landmark: the phone's arrival cue (three 220 ms buzzes since #90) plus the spoken name; the event carries `name`.
  // landmark-rest: the 70 ms heartbeat every 1.2 s while the finger rests on a landmark (#90). It is a soft cue:
  // a small ring at this strength, and like every burst it leaves a held line's state alone.
  const BURSTS = { corner: 1, end: 1, tick: 1, node: 1, landmark: 1, 'landmark-rest': 1, guide: 1 };
  const SOFT = { 'landmark-rest': 0.3, guide: 0.3 }; // guide: the 15 ms off-line tap, a small faint ring
  function patternMs(p) {
    const list = Array.isArray(p) ? p : [p];
    let total = 0;
    for (const v of list) { const n = Number(v); if (Number.isFinite(n) && n > 0) total += n; }
    return total;
  }
  // Start times (ms) of each on-step in a vibrate pattern, at most `max`: [25] -> [0],
  // corner [30,40,30] -> [0,70], end [30,30,30,30,30] -> [0,60,120]. One ring per real pulse.
  function pulseStarts(p, max = 3) {
    const list = Array.isArray(p) ? p : [p];
    const out = [];
    let at = 0;
    for (let i = 0; i < list.length && out.length < max; i++) {
      const n = Math.max(0, Number(list[i]) || 0);
      if (i % 2 === 0 && n > 0) out.push(at);
      at += n;
    }
    return out.length ? out : [0];
  }
  // A new vibrate() call replaces whatever the motor was still playing, so rings scheduled for
  // pulses that have not started yet are dropped when any accepted haptic event arrives.
  const dropPending = (rings, now) => rings.filter((r) => r.t0 <= now);

  // Found-by-touch radius from the phone's phoneconfig: half its core width, else the 3 mm default.
  function feltFromConfig(ev, fallback = FELT_MM) {
    const core = Number(ev && ev.coreMm);
    return Number.isFinite(core) && core >= 1 && core <= 30 ? core / 2 : fallback;
  }

  function parseHaptic(ev) {
    if (!ev || ev.type !== 'haptic' || ev.ok === false) return null;
    const kind = typeof ev.kind === 'string' ? ev.kind : '';
    if (kind === 'stop') return { burst: false, kind, level: 0, top: 1, strength: 0 };
    const top = Number(ev.top) > 0 ? Number(ev.top) : 4;
    let level = Number(ev.level);
    if (!Number.isFinite(level)) level = BURSTS[kind] || kind === 'hold' ? top : 0;
    level = Math.max(0, Math.min(top, level));
    const burst = !!BURSTS[kind];
    if (!burst && level === 0) return { burst: false, kind, level: 0, top, strength: 0, ms: 0 };
    const out = { burst, kind: kind || 'hold', level, top, strength: burst ? SOFT[kind] || 1 : level / top, ms: patternMs(ev.pattern),
      pulses: burst ? pulseStarts(ev.pattern) : [0] };
    if (SOFT[kind]) out.soft = true;
    if (kind === 'landmark') out.name = cleanName(ev.name);
    return out;
  }

  // What the phone actually said aloud (#90): {type:'spoken', text, kind:'landmark'|'status'|'instruction', t}, plus
  // the instruction's id for kind 'instruction' (#107). The stage's "Student heard" log confirms only from these,
  // never from a haptic event. Returns {text, kind} (and id when given) or null.
  const SPOKEN_MAX = 80;
  // The tutor's instruction box takes this many characters; a replay adds "Start: <name>. " in front.
  const INSTRUCTION_MAX = 120, SPOKEN_INSTRUCTION_MAX = 160;
  const KINDS = { landmark: 1, instruction: 1 };
  function parseSpoken(ev) {
    if (!ev || ev.type !== 'spoken' || typeof ev.text !== 'string') return null;
    const kind = KINDS[ev.kind] ? ev.kind : 'status';
    const text = ev.text.replace(/\s+/g, ' ').trim().slice(0, kind === 'instruction' ? SPOKEN_INSTRUCTION_MAX : SPOKEN_MAX);
    if (!text) return null;
    return kind === 'instruction' && typeof ev.id === 'string' ? { text, kind, id: ev.id } : { text, kind };
  }
  const cleanInstruction = (s) => (typeof s === 'string' ? s.replace(/\s+/g, ' ').trim().slice(0, INSTRUCTION_MAX) : '');
  // The landmark a spoken line names: the phone says "Start: School" on the start point (tactile.js landmarkLine).
  const markName = (text) => cleanName(String(text || '').replace(/^Start:\s*/, ''));

  // "Student heard" (#107), newest first. A line the phone says again within mergeMs of the same line (a landmark
  // the finger keeps finding, a repeated status) bumps that entry to the top and counts it, instead of adding one.
  // Instructions are the tutor's: 'sent' when posted, 'heard' once the phone reports it finished saying it (by id),
  // and a replay counts on the same entry. A newer instruction leaves an unheard one 'replaced': the relay keeps only
  // the latest, so the phone will never say the old one. Entries: {kind, key, id, text, state, at, n} (n = times heard).
  const HEARD_MERGE_MS = 10000;
  class HeardLog {
    constructor(opts = {}) {
      this.mergeMs = opts.mergeMs ?? HEARD_MERGE_MS;
      this.max = opts.max ?? 30;
      this.items = [];
    }

    top(item) {
      this.items = [item].concat(this.items.filter((x) => x !== item)).slice(0, this.max);
      return item;
    }

    // An instruction the tutor posted (or the relay's sync holds): {id, text, heard?}. Returns its entry or null.
    sent(ins, at) {
      const text = cleanInstruction(ins && ins.text);
      if (!text || typeof ins.id !== 'string') return null;
      const had = this.items.find((x) => x.kind === 'instruction' && x.id === ins.id);
      if (had) {
        // The relay marks it heard once the phone confirms, so a stage that joined late still shows Heard.
        if (ins.heard && had.state !== 'heard') { had.state = 'heard'; had.n = Math.max(1, had.n); }
        return had;
      }
      for (const x of this.items) if (x.kind === 'instruction' && x.state === 'sent') x.state = 'replaced';
      return this.top({ kind: 'instruction', key: ins.id, id: ins.id, text, state: ins.heard ? 'heard' : 'sent', at, n: ins.heard ? 1 : 0 });
    }

    // A line the phone said, as parseSpoken returns it. Returns the entry it made or bumped, or null.
    heard(s, at) {
      if (!s) return null;
      if (s.kind === 'instruction') {
        const had = this.items.find((x) => x.kind === 'instruction' && (s.id ? x.id === s.id : x.text === s.text || s.text.endsWith('. ' + x.text)));
        if (had) { had.state = 'heard'; had.n++; had.at = at; return this.top(had); }
        return this.top({ kind: 'instruction', key: s.id || s.text, id: s.id || null, text: s.text, state: 'heard', at, n: 1 });
      }
      const key = s.kind === 'landmark' ? markName(s.text) : s.text;
      const had = this.items.find((x) => x.kind === s.kind && x.key === key && at - x.at <= this.mergeMs);
      if (had) { had.n++; had.at = at; had.text = s.text; return this.top(had); }
      return this.top({ kind: s.kind, key, id: null, text: s.text, state: 'heard', at, n: 1 });
    }

    get latest() { return this.items[0] || null; }
    get earlier() { return this.items.slice(1); }
  }

  // Phone reports (#71) carry t (ms on the phone's clock, strictly increasing) and age (ms the report waited
  // before this send). The phone retries a POST whose reply was lost, so the relay can publish one report twice:
  // each (type, kind, t) is used once (#92). A buzz that waited over maxAgeMs is history, not something to draw
  // live, so it draws nothing. A late report that only ends a buzz (stop, or level 0) still applies, or a held
  // line would keep pulsing on the stage after the phone went quiet. Reports without a t always pass.
  const REPORT_MAX_AGE_MS = 1000;
  class PhoneReports {
    constructor(opts = {}) {
      this.maxAgeMs = opts.maxAgeMs ?? REPORT_MAX_AGE_MS;
      this.keep = opts.keep ?? 500; // remembered keys; far more than one retry window holds
      this.seen = new Set();
    }

    first(ev) {
      if (ev.t == null || !Number.isFinite(Number(ev.t))) return true;
      const key = `${ev.type}|${ev.kind}|${Number(ev.t)}`;
      if (this.seen.has(key)) return false;
      this.seen.add(key);
      if (this.seen.size > this.keep) this.seen.delete(this.seen.values().next().value);
      return true;
    }

    stale(ev) { return ev.age != null && Number(ev.age) > this.maxAgeMs; }

    // The parsed haptic to act on (as parseHaptic returns it), or null for a repeat, a refusal or a late buzz.
    haptic(ev) {
      if (!ev || ev.type !== 'haptic' || !this.first(ev)) return null;
      const h = parseHaptic(ev);
      if (h && this.stale(ev) && (h.burst || h.level > 0)) return null;
      return h;
    }

    // A spoken line to log ({text, kind}), or null for a repeat or an empty one. Late lines still count:
    // the student did hear them.
    spoken(ev) {
      if (!ev || ev.type !== 'spoken' || !this.first(ev)) return null;
      return parseSpoken(ev);
    }
  }

  // Landmarks: named points the tutor places, {id, x, y, name, by} in board mm (#64, #65).
  const LANDMARK_MM = 4;          // the phone's landmark radius (tactile.js LANDMARK_MM)
  const NAME_MAX = 24;
  const cleanName = (s) => (typeof s === 'string' ? s.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX) : '');
  const validLandmark = (l) => !!l && typeof l.id === 'string' && Number.isFinite(l.x) && Number.isFinite(l.y);

  // Insert or replace by id, keeping first-arrival order (as the relay does).
  function upsertById(list, item) {
    const i = list.findIndex((x) => x.id === item.id);
    if (i < 0) return list.concat([item]);
    const out = list.slice();
    out[i] = item;
    return out;
  }

  // The landmark a spoken name refers to: same name, nearest to the finger (names can repeat).
  function landmarkFor(list, name, p) {
    let best = null, bestD = Infinity;
    for (const l of list) {
      if (cleanName(l.name) !== name) continue;
      const d = p ? Math.hypot(l.x - p.x, l.y - p.y) : 0;
      if (d < bestD) { best = l; bestD = d; }
    }
    return best;
  }

  // An existing landmark under a click, within its zone, else null.
  function landmarkAt(list, p, radius = LANDMARK_MM) {
    let best = null, bestD = radius;
    for (const l of list) { const d = Math.hypot(l.x - p.x, l.y - p.y); if (d <= bestD) { best = l; bestD = d; } }
    return best;
  }

  // Step-through reveal (#111). The relay holds `upto`: how many of the tutor's strokes, in first-arrival order, the
  // student may feel, null for all (the default); anything but a whole number >= 0 means all. Only by:'tutor' strokes are
  // steps: anyone else's (the student's) are always shown and never counted. The same rule runs on the phone (tactile.js):
  // a tutor stroke is shown when its index among the tutor's strokes < upto. A landmark within LANDMARK_MM of a shown
  // tutor stroke's segments is shown; one near only hidden tutor strokes is hidden; one on no tutor stroke is shown when
  // it arrived before the first hidden stroke. Anyone else's line (the phone's by:'phone', draw.html's by:'laptop')
  // never decides a landmark, so one crossing a hidden point does not reveal it. Hidden means faint on the stage, blank
  // glass on the phone.
  const cleanReveal = (v) => (Number.isFinite(v) && v >= 0 ? Math.floor(v) : null);
  const isStep = (st) => !!st && st.by === 'tutor';

  // Strokes alone: {stroke: [bool by index], total: the tutor's strokes, shown: how many of those are shown}.
  function revealStrokes(strokes, upto) {
    const u = cleanReveal(upto);
    let step = 0;
    const stroke = strokes.map((st) => !isStep(st) || u == null || step++ < u);
    const total = strokes.filter(isStep).length;
    return { stroke, total, shown: u == null ? total : Math.min(total, u) };
  }

  function nearStroke(p, pts, radius) {
    if (pts.length === 1) return Math.hypot(p.x - pts[0].x, p.y - pts[0].y) <= radius;
    for (let i = 1; i < pts.length; i++) if (distPointSeg(p, pts[i - 1], pts[i]) <= radius) return true;
    return false;
  }

  // strokes in first-arrival order (the relay's sync order); seqOf(kind, id) is the arrival number of a stroke or
  // landmark (Arrivals.of). Returns {total, shown, hiding, stroke: [bool by index], mark: [bool by index]}, with total
  // and shown counting the tutor's strokes only.
  function revealView(strokes, landmarks, upto, seqOf = () => Infinity, radius = LANDMARK_MM) {
    const { stroke, total, shown } = revealStrokes(strokes, upto);
    if (shown >= total) return { total, shown, hiding: false, stroke, mark: landmarks.map(() => true) };
    const cut = seqOf('stroke', strokes[stroke.indexOf(false)].id); // the first hidden stroke
    const mark = landmarks.map((l) => {
      let onHidden = false;
      for (let i = 0; i < strokes.length; i++) {
        if (!isStep(strokes[i])) continue;
        const pts = strokes[i].pts || [];
        if (!pts.length || !nearStroke(l, pts, radius)) continue;
        if (stroke[i]) return true;
        onHidden = true;
      }
      return !onHidden && seqOf('landmark', l.id) < cut;
    });
    return { total, shown, hiding: true, stroke, mark };
  }

  // First-arrival numbers across strokes and landmarks, which the off-stroke landmark rule needs. Live events come in
  // arrival order, so add() numbers them as they come; re-posting an item keeps its number. A sync lists the two kinds
  // apart, but the relay stamps each item with `seq`, its own arrival counter: those numbers are taken as they are, and
  // an item without one (the stroke being drawn, not yet at the relay) goes after them. A sync without seq (an older
  // relay) cannot say, so items first met there are numbered strokes first, then landmarks: an off-stroke landmark of
  // unknown age is hidden while anything is, the cautious side. Clear keeps the old numbers for the undo that restores it.
  class Arrivals {
    constructor() { this.seq = new Map(); this.cleared = new Map(); this.n = 0; }
    add(kind, id) { const k = kind + ':' + id; if (!this.seq.has(k)) this.seq.set(k, this.n++); }
    sync(strokes, landmarks) {
      const items = [];
      for (const st of strokes || []) if (st && st.id != null) items.push(['stroke:' + st.id, st.seq]);
      for (const l of landmarks || []) if (l && l.id != null) items.push(['landmark:' + l.id, l.seq]);
      const next = new Map();
      if (items.some(([, seq]) => Number.isFinite(seq))) {
        let top = -1;
        for (const [k, seq] of items) if (Number.isFinite(seq)) { next.set(k, seq); top = Math.max(top, seq); }
        this.n = top + 1;
        for (const [k, seq] of items) if (!Number.isFinite(seq)) next.set(k, this.n++);
      } else {
        for (const [k] of items) next.set(k, this.seq.has(k) ? this.seq.get(k) : this.cleared.has(k) ? this.cleared.get(k) : this.n++);
      }
      this.seq = next;
    }
    clear() { if (this.seq.size) this.cleared = this.seq; this.seq = new Map(); }
    of(kind, id) { const v = this.seq.get(kind + ':' + id); return v == null ? Infinity : v; }
  }

  // A sync's list in the relay's arrival order when every item carries seq (the relay already lists them so; this keeps
  // the stroke index true whatever the list order). Without seq, the list as it came.
  const bySeq = (list) => {
    const xs = Array.isArray(list) ? list : [];
    return xs.length && xs.every((x) => x && Number.isFinite(x.seq)) ? xs.slice().sort((a, b) => a.seq - b.seq) : xs;
  };

  // The tutor's step buttons. Reveal next shows one more stroke; showing the last one returns to null (all), so the
  // board is back to the default and a stroke drawn afterwards is felt at once. With everything shown it does nothing
  // and says so, rather than hiding the whole drawing as a surprise: the tutor steps back with Previous step (from all,
  // that hides the newest stroke). Reveal all returns to null. Steps are the tutor's strokes only (isStep), from the
  // board's strokes in first-arrival order. Returns {upto, changed, note}; note names a hint.
  function revealStep(upto, strokes, action) {
    const total = (strokes || []).filter(isStep).length;
    const u = cleanReveal(upto), all = u == null || u >= total;
    if (action === 'all') return u == null ? { upto: null, changed: false, note: 'all' } : { upto: null, changed: true, note: '' };
    if (action === 'next') {
      if (all) return { upto: u, changed: false, note: 'all' };
      return { upto: u + 1 >= total ? null : u + 1, changed: true, note: '' };
    }
    if (action === 'prev') {
      if (!total) return { upto: u, changed: false, note: 'empty' };
      const cur = all ? total : u;
      if (cur <= 0) return { upto: u, changed: false, note: 'none' };
      return { upto: cur - 1, changed: true, note: '' };
    }
    return { upto: u, changed: false, note: '' };
  }

  // The legend line, only while something is hidden: the tutor's strokes, as revealView counts them. The stage says
  // "lines", the tutor's word for them, as the session panel's felt line does.
  const revealLegend = (shown, total) => (shown < total ? `Shown ${shown} of ${total} line${total === 1 ? '' : 's'}` : '');
  // The step-through control's own line, in every state (Studio, D10): never blank, so the control explains itself.
  function revealMeter(shown, total) {
    if (!(total > 0)) return 'Nothing to reveal yet';
    if (shown < total) return revealLegend(shown, total);
    return total === 1 ? 'The line is shown' : `All ${total} lines shown`;
  }

  // Where a landmark's label goes: right, left, above or below the dot. Spots that run off the board are
  // out; of the rest, the one crossing the fewest ink samples wins (so the route leaving a landmark doesn't
  // sit under its name), in that preference order on a tie. Returns {side, x, y, align} with (x, y) the
  // text anchor for textBaseline 'middle'. widthMm is the measured text width; inkSamples are mm points.
  function labelPlace(l, widthMm, board, gapMm, heightMm = 4, inkSamples = []) {
    const vGap = gapMm - 0.6 + heightMm / 2;
    const spots = [
      { side: 'right', x: l.x + gapMm, y: l.y, align: 'left', x0: l.x + gapMm },
      { side: 'left', x: l.x - gapMm, y: l.y, align: 'right', x0: l.x - gapMm - widthMm },
      { side: 'above', x: l.x, y: l.y - vGap, align: 'center', x0: l.x - widthMm / 2 },
      { side: 'below', x: l.x, y: l.y + vGap, align: 'center', x0: l.x - widthMm / 2 },
    ];
    let best = null, bestHits = Infinity;
    for (const s of spots) {
      const x0 = s.x0 - 0.5, x1 = s.x0 + widthMm + 0.5, y0 = s.y - heightMm / 2 - 0.5, y1 = s.y + heightMm / 2 + 0.5;
      if (x0 < 0.5 || x1 > board.w - 0.5 || y0 < 0.5 || y1 > board.h - 0.5) continue;
      let n = 0;
      for (const p of inkSamples) if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1) n++;
      if (n < bestHits) { best = s; bestHits = n; }
    }
    const { side, x, y, align } = best || spots[0];
    return { side, x, y, align };
  }

  // Where the caption bubble sits for a finger at fx: to the right of the cursor when that fits inside the board,
  // else to the left, else (a caption wider than the room on either side of a 56 mm board) centred on the finger and
  // held inside the board. `margin` is how far it may hang over the board's edge: the docked panels start 16 px out,
  // so the bubble never slides under them. Returns the body's left edge and the tail's base x, both in board mm; the
  // tail base stays inside the body, so a clamped bubble still points at the finger.
  function captionPlace(fx, widthMm, board, offMm, margin = 1) {
    const lo = -margin, hi = board.w + margin - widthMm;
    let x0 = fx + offMm;
    if (x0 > hi) x0 = fx - offMm - widthMm;
    if (x0 < lo) x0 = Math.min(Math.max(fx - widthMm / 2, lo), hi);
    const tail = Math.min(Math.max(fx, x0 + 2.5), x0 + widthMm - 2.5);
    return { x0, tail };
  }

  // Caption bubble scale over its life: pops in, holds, shrinks away. 0 means hidden.
  const CAPTION_MS = 1600, CAPTION_IN_MS = 160, CAPTION_OUT_MS = 140;
  function captionScale(ageMs) {
    if (ageMs < 0 || ageMs >= CAPTION_MS) return 0;
    if (ageMs < CAPTION_IN_MS) return 0.85 + 0.15 * easeOut(ageMs / CAPTION_IN_MS);
    const out = CAPTION_MS - ageMs;
    if (out < CAPTION_OUT_MS) return 0.6 + 0.4 * easeOut(out / CAPTION_OUT_MS);
    return 1;
  }

  // Turns parsed haptic events into ring spawns. A level is a state: the phone re-arms the same level
  // (fades every 0.4-0.65 s, the line's 5 s hold every 4.5 s), so re-arms keep the state alive instead of
  // each drawing a new burst. While a level is held, rings pulse at a cadence tied to the level. The state
  // lasts as long as the phone's own vibration (plus a margin), so it ends on 'stop' or when the buzz runs out.
  class HapticRings {
    constructor(opts = {}) {
      this.holdMs = opts.holdMs ?? 1000;        // minimum lifetime, longer than the slowest fade re-arm
      this.marginMs = opts.marginMs ?? 250;     // added to the phone's own vibration length
      this.periodTopMs = opts.periodTopMs ?? 450;
      this.periodLowMs = opts.periodLowMs ?? 900;
      this.state = null; // {level, top, until, next}
    }

    period(level, top) {
      if (top <= 1) return this.periodTopMs;
      const f = (level - 1) / (top - 1); // 0 faintest .. 1 on the line
      return this.periodLowMs + (this.periodTopMs - this.periodLowMs) * f;
    }

    // Returns rings to spawn now: [{strength, burst}].
    onHaptic(h, now) {
      if (!h) return [];
      if (h.burst) {
        if (this.state) this.state.next = now + this.period(this.state.level, this.state.top);
        // A soft cue draws a small ring (the held-level style at its strength), a full burst the heavy one.
        return (h.pulses || [0]).map((delay) => (h.soft ? { strength: h.strength, burst: false, delay } : { strength: 1, burst: true, delay }));
      }
      if (h.level === 0) { this.state = null; return []; }
      const life = Math.max(this.holdMs, (h.ms || 0) + this.marginMs);
      const same = this.state && this.state.level === h.level && now < this.state.until;
      if (same) { this.state.until = now + life; this.state.top = h.top; return []; }
      this.state = { level: h.level, top: h.top, until: now + life, next: now + this.period(h.level, h.top) };
      return [{ strength: h.strength, burst: false }];
    }

    // Called every frame: pulse rings for a held level, at most one per call.
    tick(now) {
      const s = this.state;
      if (!s) return [];
      if (now >= s.until) { this.state = null; return []; }
      if (now < s.next) return [];
      s.next = now + this.period(s.level, s.top);
      return [{ strength: s.level / s.top, burst: false }];
    }

    reset() { this.state = null; }
  }

  // Linear mix of two #rrggbb colours, t=0 gives a. Used to fade the trail into the paper without alpha,
  // so overlapping segments never darken and the GIF palette stays small.
  function mixHex(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ch = (s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
    return '#' + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
  }

  // Exponential approach toward a target, frame-rate independent.
  const follow = (cur, target, dtMs, tauMs) => cur + (target - cur) * (1 - Math.exp(-dtMs / tauMs));

  // CSS-style cubic-bezier timing function (x1, y1, x2, y2), solved for y at a given x in 0..1.
  function cubicBezier(x1, y1, x2, y2) {
    const bz = (t, a, b) => 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t;
    return (x) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let lo = 0, hi = 1, t = x;
      for (let i = 0; i < 30; i++) { t = (lo + hi) / 2; if (bz(t, x1, x2) < x) lo = t; else hi = t; }
      return bz(t, y1, y2);
    };
  }
  // Strong ease-out: the ring pops out in the first few frames, so even a 15 fps GIF catches it.
  const easeOut = cubicBezier(0.23, 1, 0.32, 1);

  // GIF-safe motion. A 128-colour Bayer palette turns fading alpha into speckle and pale bands, so the
  // stage animates size and stroke width with flat colours instead: no alpha, no colour ramps.
  const RING_MS = 700, RING_MIN_W = 0.3;
  // Ring geometry `ageMs` after a haptic event: {r, w} in mm, or null once it has thinned away.
  // Strength 0..1 (a fade level) sets weight and reach; bursts (corner, end, tick) are the heaviest.
  function ringAt(ageMs, strength, burst, baseR) {
    if (ageMs < 0 || ageMs >= RING_MS) return null;
    const p = ageMs / RING_MS;
    const w0 = burst ? 2.0 : 1.0 + 0.8 * strength;
    const reach = burst ? 13 : 6 + 6 * strength;
    const w = w0 * (1 - p);
    if (w < RING_MIN_W) return null;
    return { r: baseR + reach * easeOut(p), w };
  }

  // Cursor size factor: a fingertip lands slightly large and settles, and shrinks away on lift
  // (exit faster than entrance). 0 means hidden. upAt is null while the finger is down.
  const TOUCH_MS = 180, LIFT_MS = 140, TOUCH_GROW = 0.3, LIFT_TO = 0.5;
  function cursorScale(now, downAt, upAt) {
    if (upAt == null) return 1 + TOUCH_GROW * (1 - easeOut(Math.min(1, Math.max(0, (now - downAt) / TOUCH_MS))));
    const p = (now - upAt) / LIFT_MS;
    if (p >= 1) return 0;
    return 1 - (1 - LIFT_TO) * easeOut(Math.max(0, p));
  }

  // Found ink settles: drawn wider when found, easing back to normal width. Returns the extra width
  // factor 0..1 for ink found at `foundAt` (0 when settled or never found).
  const SETTLE_MS = 450;
  function settle(foundAt, now) {
    if (!foundAt) return 0;
    const p = (now - foundAt) / SETTLE_MS;
    return p >= 1 || p < 0 ? 0 : 1 - easeOut(p);
  }

  // Trail fade 0..1 quantised to a few flat steps, so the GIF palette sees 4 trail colours, not dozens.
  const TRAIL_STEPS = 4;
  const trailStep = (age) => Math.min(TRAIL_STEPS, Math.floor(Math.max(0, age) * TRAIL_STEPS)) / TRAIL_STEPS;

  // The student's link (#107), from how long ago the phone last reported while in Live: it posts phoneconfig every
  // 2 s there, so 5 s is two missed beats (reconnecting) and 15 s means it is gone (disconnected). `left` is the phone
  // saying it went back to its menu, where it feels nothing. Never heard from: waiting.
  const LINK_RECONNECTING_MS = 5000, LINK_DISCONNECTED_MS = 15000;
  function phoneLink(ageMs, left = false) {
    if (left) return 'disconnected';
    if (!(ageMs >= 0) || !Number.isFinite(ageMs)) return 'waiting';
    if (ageMs < LINK_RECONNECTING_MS) return 'connected';
    return ageMs < LINK_DISCONNECTED_MS ? 'reconnecting' : 'disconnected';
  }

  // The tutor's connection line, in words (#92, #107; Studio copy, D10). The board's own link comes first: without it
  // nothing the tutor draws reaches the phone. `link` is phoneLink's answer. What the finger is doing has its own line
  // in the session panel (touchState), so the header only names the link; a finger on the glass gives the dot its
  // ripple ('live'). `receiving` (the student can feel what is drawn right now) is true only when both links are up.
  const LINKS = {
    waiting: { tone: 'wait', text: 'Waiting for the student', sub: 'Open FeelInk on their phone' },
    reconnecting: { tone: 'warn', text: 'Phone reconnecting…', sub: "Your changes reach it once it's back" },
    disconnected: { tone: 'off', text: 'Phone disconnected', sub: 'Your changes reach it when it rejoins' },
  };
  // `unsent`: '' normally, 'reloading' while the board waits for the relay's state after a change it did not take, then
  // 'reloaded' for a few seconds, so a change that vanishes from the board is never a mystery (review, Nov 8).
  function connectionStatus(relayUp, link, touching, unsent = '') {
    if (!relayUp) return { tone: 'off', text: 'Studio offline', sub: 'Reconnecting…', receiving: false };
    if (unsent) return { tone: 'off', text: 'Not sent to the phone', sub: unsent === 'reloading' ? 'Reloading the board…' : 'Board matches the phone again', receiving: false };
    if (link !== 'connected') return { ...(LINKS[link] || LINKS.waiting), receiving: false };
    return { tone: touching ? 'live' : 'on', text: 'Student connected', sub: '', receiving: true };
  }

  // The student's finger in words, for the session panel (human-led note, Nov 7). Only what the phone reports: whether a
  // finger is on the glass and whether it has moved in the last TOUCH_REST_MS. Where it is against the ink and which
  // point it sits on are the board's to show (cursor, teal, caption), so the line says nothing about them (#138).
  // A lift shorter than TOUCH_LIFT_MS (a finger hopping between touches) keeps the line as it was, like the cursor's
  // lift shrink, so it never flickers "Not touching" between two touches. `liftMs` is how long ago the finger lifted.
  // Returns {state: 'none'|'lifted'|'exploring'|'resting', text}.
  const TOUCH_MOVE_MM = 1.5, TOUCH_REST_MS = 1000, TOUCH_LIFT_MS = 350;
  function touchState({ live = false, ever = false, down = false, liftMs = Infinity, stillMs = 0 } = {}) {
    if (!live) return { state: 'none', text: ever ? 'Not touching' : 'No touch yet' };
    if (!down && !(liftMs < TOUCH_LIFT_MS)) return { state: 'lifted', text: 'Not touching' };
    const resting = stillMs >= TOUCH_REST_MS;
    return { state: resting ? 'resting' : 'exploring', text: resting ? 'Resting' : 'Exploring' };
  }

  // How long ago, in the words a tutor glancing over would use: "just now" under 5 s, then seconds, minutes, hours.
  function ago(ms) {
    const s = Math.floor(Math.max(0, Number(ms) || 0) / 1000);
    if (s < 5) return 'just now';
    if (s < 60) return `${s} s ago`;
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    return `${Math.floor(s / 3600)} h ago`;
  }

  // How much of the tutor's shown lines the student's finger has covered, from the teal the board draws: `fractions` holds
  // each line's felt share (felt samples over all of its 1 mm samples). The words say "covered", never "felt": the share
  // is finger geometry against the ink, not a report of what the student perceived or learned (review, Nov 8).
  // Partial progress is said as the mean share ("about 70%"),
  // because a finger following the buzz almost never covers every millimetre, so "lines felt in full" read 0 after a
  // good trace (Reeve, Nov 7 20:50). A whole line still needs all of it teal, so the words never claim more than the
  // board shows; the session panel's bars carry each line. While a step-through reveal hides some (`hiding`), the
  // words are about the shown lines and say so, so they never read as the whole drawing.
  function feltLine(fractions, hiding = false) {
    const n = (fractions || []).length;
    if (!n) return hiding ? 'Nothing shown yet' : 'Nothing drawn yet';
    if (!fractions.some((f) => f > 0)) return 'Nothing covered yet';
    const shown = hiding ? 'shown ' : '';
    if (fractions.every((f) => f >= 1)) return n === 1 ? `Covered the whole ${shown}line` : n === 2 ? `Covered both ${shown}lines` : `Covered all ${n} ${shown}lines`;
    const mean = fractions.reduce((a, f) => a + Math.min(1, Math.max(0, f)), 0) / n;
    const pct = Math.min(99, Math.max(1, Math.round(mean * 100)));
    if (n === 1) return `Covered about ${pct}% of the ${shown}line`;
    return `Covered about ${pct}% of ${hiding ? 'what is shown' : 'the drawing'}`;
  }

  // Studio side panels (D10). The GIF pipeline (tools/record/compose.py detect_board) crops the stage video to the board
  // plus 40 video px, then widens that about the board's centre to its 960x1080 panel shape, so anything in that zone
  // lands in the slide clip. The panels dock to the window edges outside it (plus `safe`), at most `max` wide; a window
  // too narrow for `min` lets them into the zone, never onto the board (`gap`). view: the board in CSS px, as fit gives.
  const CROP_MARGIN_PX = 40, CROP_ASPECT = 960 / 1080;
  function cropZone(view, winW, winH, dpr = 1) {
    const m = CROP_MARGIN_PX / dpr;
    const h = Math.min(winH, view.y + view.h + m) - Math.max(0, view.y - m);
    const w = Math.min(winW, Math.max(view.w + 2 * m, h * CROP_ASPECT));
    const x0 = Math.min(Math.max(0, view.x + view.w / 2 - w / 2), winW - w);
    return { x0, x1: x0 + w };
  }
  function sidePanels(view, winW, winH, dpr = 1, opts = {}) {
    const { min = 272, max = 360, safe = 8, gap = 16 } = opts;
    const zone = cropZone(view, winW, winH, dpr);
    const width = (room, limit) => Math.max(0, Math.min(limit, Math.max(min, Math.min(max, room))));
    const lw = width(zone.x0 - safe, view.x - gap);
    const rw = width(winW - zone.x1 - safe, winW - view.x - view.w - gap);
    return { lw, rx: winW - rw, rw, zone };
  }

  const api = { FELT_MM, RESAMPLE_MM, RING_MS, SETTLE_MS, TRAIL_STEPS, fit, toMm, clampToBoard, smooth, strokePoints, resample, distPointSeg,
    markFelt, feltRuns, parseHaptic, pulseStarts, dropPending, feltFromConfig, HapticRings,
    SPOKEN_MAX, REPORT_MAX_AGE_MS, parseSpoken, PhoneReports, connectionStatus, TOUCH_MOVE_MM, TOUCH_REST_MS, TOUCH_LIFT_MS, touchState, ago, feltLine,
    INSTRUCTION_MAX, HEARD_MERGE_MS, LINK_RECONNECTING_MS, LINK_DISCONNECTED_MS, cleanInstruction, markName, HeardLog, phoneLink,
    cleanReveal, isStep, revealStrokes, revealView, Arrivals, bySeq, revealStep, revealLegend, revealMeter, cropZone, sidePanels,
    LANDMARK_MM, NAME_MAX, CAPTION_MS, cleanName, validLandmark, upsertById, landmarkFor, landmarkAt, labelPlace, captionPlace, captionScale, mixHex, follow, cubicBezier, easeOut, ringAt, cursorScale, settle, trailStep };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Board = api;
})(this);
