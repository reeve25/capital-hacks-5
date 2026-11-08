// FeelInk stage, the board: shared constants, the canvas and post(), the tutor's strokes and what the student has felt,
// the finger, trail, haptic rings, landmarks, captions, layout and the draw functions. Loaded first: the others use it.

const { BOARD } = Tactile;
const B = Board;
const HEADER_PX = 52, PAD_PX = 12;
const COL = { surround: '#0e1620', paper: '#fbfaf6', ink: '#1b222b', inkSoft: '#545e6b', unfelt: '#b3b9c1', felt: '#0d7064', trail: '#2bb3a3', amber: '#ffb020', white: '#ffffff',
  hidden: B.mixHex('#1b222b', '#fbfaf6', 0.75), // 25% ink, flat (#c3c4c3), for what the student cannot feel yet (#111)
  key: B.mixHex('#fbfaf6', '#1b222b', 0.035), // the key's panel: a step off the paper, so it never reads as drawing
  keyText: B.mixHex('#1b222b', '#fbfaf6', 0.35) }; // the key's words, quieter than soft ink: #696e72, 4.6:1 on its panel
// Hidden ink is also dashed (butt caps, mm): solid 25% ink would read as the unfelt grey of ink the student can feel.
const HIDDEN_DASH = [3, 2];
// Sizes in board millimetres (about 8.4 px/mm on a 1080 px tall stage, about 4.2 px/mm in its 960 px wide GIF).
// The finger is the thing to watch (#107): an amber dot in a white ring with an ink edge, readable over ink and paper
// alike, while the trail behind it stays thin and starts already part-faded toward the paper. 8.6 mm across, about
// 72 px at 1080p and 36 px in the GIF (it was 12.5 mm and hid the route's junctions, review Nov 8): still the largest
// mark on the board. Its amber core is the phone's default 3 mm found-by-touch radius (Board.FELT_MM), so the teal ink
// is what passed under the amber.
const INK_MM = 2.4, SETTLE_GAIN = 0.75, TRAIL_MM = 2.2, TRAIL_TAIL_MM = 0.5, TRAIL_MS = 3000, TRAIL_FADE0 = 0.3;
const CURSOR_MM = 3, CURSOR_BORDER_MM = 0.8, CURSOR_EDGE_MM = 0.5, CURSOR_TAU_MS = 35;
const CURSOR_R_MM = CURSOR_MM + CURSOR_BORDER_MM + CURSOR_EDGE_MM; // 4.3, the finger's edge, where a ring starts
// Found-by-touch radius: half the phone's core width, updated from its phoneconfig (default 3 mm).
let feltMm = Board.FELT_MM;
// Movement-only polish (touch-down pop, lift shrink, ink settle) is skipped under reduced motion.
// Rings stay: they are the haptic signal itself. The capture browser does not set this preference.
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
// Felt arrays hold the time each ink sample was found (0 = not yet), so fresh ink can settle.
const stamp = (now) => Math.max(1, now);

const c = document.getElementById('c'), ctx = c.getContext('2d');
let dpr = 1, view = { scale: 1, x: 0, y: 0, w: 0, h: 0 };
// A change shows here at once and is posted. One the relay did not take never reached the phone: unsent() (stage-relay.js)
// says so and reloads the relay's state, so the board never keeps ink the student cannot feel (review, Nov 8).
const post = (body) => fetch('/event', { method: 'POST', body: JSON.stringify(body) })
  .then((r) => { if (!r.ok) throw new Error('relay ' + r.status); }).catch(() => unsent());

// Strokes plus their found-by-touch state: id -> {stroke, samples, felt}.
let strokes = [];
// Step-through reveal (#111): `reveal` is the relay's upto, how many of the tutor's strokes in first-arrival order the
// student may feel (null = all, the default); the student's own strokes are never hidden. Arrival numbers place a
// landmark that lies on no stroke (board.js revealView).
let reveal = null;
const arrivals = new B.Arrivals();
const seqOf = (kind, id) => arrivals.of(kind, id);
const revealNow = () => B.revealView(strokes, landmarks, reveal, seqOf);
const feltById = new Map();
function inkState(st) {
  let s = feltById.get(st.id);
  if (s && s.pts === st.pts) return s;
  const samples = B.resample(st.pts);
  const felt = new Float64Array(samples.length);
  if (s) felt.set(s.felt.subarray(0, Math.min(s.felt.length, felt.length)));
  s = { pts: st.pts, samples, felt };
  feltById.set(st.id, s);
  // Ink that appears under a resting finger is found straight away, unless the student cannot feel it yet (#111).
  if (finger.down && finger.last && B.revealStrokes(strokes, reveal).stroke[strokes.indexOf(st)] !== false) B.markFelt(samples, felt, finger.last, finger.last, feltMm, stamp(performance.now()));
  return s;
}
function setStrokes(list) {
  strokes = list.filter((s) => s && Array.isArray(s.pts));
  const ids = new Set(strokes.map((s) => s.id));
  for (const id of feltById.keys()) if (!ids.has(id)) feltById.delete(id);
  for (const st of strokes) arrivals.add('stroke', st.id);
  strokes.forEach(inkState);
}
function upsert(st) {
  arrivals.add('stroke', st.id);
  const i = strokes.findIndex((s) => s.id === st.id);
  if (i >= 0) strokes[i] = st; else strokes.push(st);
  inkState(st);
}

// Student finger: `last` is the latest real sample, `cur` the drawn cursor that eases toward it.
// downAt/upAt drive the touch-down pop and the lift shrink; upAt is null while the finger is down.
// For the session panel: `level` is the buzz the phone reports playing (NaN when it says nothing), and movedAt is when
// the finger last moved TOUCH_MOVE_MM from where it had settled, so a still finger reads as resting.
const finger = { down: false, last: null, cur: null, downAt: -Infinity, upAt: -Infinity, lastAt: 0, level: NaN, anchor: null, movedAt: 0 };
// The phone's level on the line: its fade steps plus one (tactile.js), from phoneconfig; 4 is the shipped 3-step fade.
let phoneTop = 4;
let trail = []; // {x, y, t} or {gap: true, t}
let lastPhoneAt = -Infinity, phoneLeft = false;
function onFinger(ev) {
  const now = performance.now();
  finger.level = Number.isFinite(ev.level) ? ev.level : NaN;
  if (!ev.down || !Number.isFinite(ev.x) || !Number.isFinite(ev.y)) {
    if (finger.down) { trail.push({ gap: true, t: now }); finger.upAt = now; }
    finger.down = false;
    finger.last = null;
    finger.anchor = null;
    return;
  }
  const p = { x: ev.x, y: ev.y };
  const from = finger.down && finger.last ? finger.last : p;
  // Hidden strokes (#111) are blank glass on the phone, so the finger never finds them.
  const shown = B.revealStrokes(strokes, reveal).stroke;
  strokes.forEach((st, i) => {
    if (!shown[i]) return;
    const s = inkState(st);
    B.markFelt(s.samples, s.felt, from, p, feltMm, stamp(now));
  });
  if (!finger.down) { finger.cur = { ...p }; finger.downAt = now; finger.upAt = null; }
  if (!finger.anchor || Math.hypot(p.x - finger.anchor.x, p.y - finger.anchor.y) >= B.TOUCH_MOVE_MM) { finger.anchor = p; finger.movedAt = now; }
  finger.down = true;
  finger.last = p;
  finger.lastAt = now;
}

// Rings come only from real phone haptic events. No events, no rings.
// They stay centred on the cursor, so each one reads as "the fingertip buzzed", even mid-swipe. They start at the
// finger's edge, so all of their short reach (board.js ringAt) shows outside it.
const haptics = new B.HapticRings();
let rings = []; // {t0, strength, burst}
// One ring per real pulse, at the pattern's own timing. Rings are kept even before the first finger
// sample arrives (the haptic POST can beat the finger POST); they draw once the cursor exists.
function spawnRings(list, now) {
  for (const r of list) rings.push({ t0: now + (r.delay || 0), strength: r.strength, burst: r.burst });
}

// Landmarks (#64, #65): named points, kept in relay order. `found` holds ids the phone has announced.
// `start` marks the tutor's start point (#107); the relay stores it only when set.
let landmarks = [];
const landmarkOf = (ev) => ({ id: ev.id, x: ev.x, y: ev.y, name: ev.name, by: ev.by, ...(ev.start ? { start: true } : {}) });
const foundMarks = new Set();
let caption = null; // {name, t0}: what the phone just spoke, shown in the caption slot for the silent GIF
function setLandmarks(list) {
  landmarks = (list || []).filter(B.validLandmark);
  for (const l of landmarks) arrivals.add('landmark', l.id);
  const ids = new Set(landmarks.map((l) => l.id));
  for (const id of foundMarks) if (!ids.has(id)) foundMarks.delete(id);
}
// A hidden landmark (#111) is never marked found or captioned: the phone gives it no cue, and should one still name it,
// the stage keeps it faint rather than show the tutor something the student was not meant to get yet.
function markFound(name) {
  const rv = revealNow();
  const l = B.landmarkFor(landmarks.filter((_, i) => rv.mark[i]), name, finger.last || finger.cur);
  if (l) foundMarks.add(l.id);
  return l;
}
// The caption repeats what the phone says, "Start: <name>" on the start point (tactile.js landmarkLine).
function onLandmarkCue(h, now) {
  if (!h.name) return;
  const l = markFound(h.name);
  if (!l && B.landmarkFor(landmarks, h.name)) return; // only a hidden point has that name
  caption = { name: l && l.start ? 'Start: ' + h.name : h.name, t0: now };
}

// Layout: the board as before, then the side columns and the guide placed from it.
const rootStyle = document.documentElement.style;
function layout() {
  dpr = window.devicePixelRatio || 1;
  const w = innerWidth, h = innerHeight;
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const f = B.fit(w, h - HEADER_PX, BOARD, PAD_PX);
  view = { ...f, y: f.y + HEADER_PX - PAD_PX / 2 };
  const { lw, rx, rw } = B.sidePanels(view, w, h, dpr);
  const vars = { '--bx': view.x, '--by': view.y, '--bw': view.w, '--bh': view.h, '--bb': h - view.y - view.h, '--lw': lw, '--rx': rx, '--rw': rw };
  for (const k in vars) rootStyle.setProperty(k, Math.round(vars[k]) + 'px');
}
addEventListener('resize', layout);
layout();

// Drawing, in board millimetres after the transform.
function polyline(pts, from = 0, to = pts.length - 1) {
  ctx.beginPath();
  ctx.moveTo(pts[from].x, pts[from].y);
  if (from === to) ctx.lineTo(pts[from].x + 0.001, pts[from].y);
  for (let i = from + 1; i <= to; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
}
function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
// The board's key (review, Nov 8: teal, grey, dashed and the amber rings went unexplained in the footage), on its own
// panel inside the paper's foot, so any crop of the board keeps it. Under the trail and the ink: the lowest thing on
// the board. Quiet (Reeve's review of the empty stage, Nov 8: five lines of 2.5 mm bold crowded the drawing's foot and
// "Phone asked to buzz" read as debugging): two short centred rows of 1.8 mm regular type in grey, the ink's states over
// the student's marks. A ring says what the stage knows, that the phone page requested a vibration, never that the
// student felt it.
const LEGEND = { font: 1.8, pitch: 2.6, swatch: 3, gap: 0.8, col: 2.2, padX: 1.2, padY: 0.5, foot: 1, margin: 1.5 };
const LEGEND_ROWS = [
  [['felt', 'Covered'], ['unfelt', 'Unexplored'], ['hidden', 'Hidden by tutor']],
  [['finger', 'Student’s finger (live)'], ['ring', 'Vibration requested']]];
const legendTop = () => BOARD.h - LEGEND.foot - LEGEND_ROWS.length * LEGEND.pitch - 2 * LEGEND.padY;
// Each mark at swatch size `s`, its left edge at x, centred on y.
function legendSwatch(kind, x, y) {
  const s = LEGEND.swatch, cx = x + s / 2;
  if (kind === 'finger') { // the cursor in small
    for (const [r, fill] of [[0.375, COL.ink], [0.3, COL.white], [0.21, COL.amber]]) { ctx.beginPath(); ctx.arc(cx, y, r * s, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); }
    return;
  }
  ctx.beginPath();
  if (kind === 'ring') { ctx.arc(cx, y, 0.33 * s, 0, Math.PI * 2); ctx.lineWidth = 0.3; ctx.strokeStyle = COL.amber; ctx.stroke(); return; }
  ctx.lineWidth = 0.3 * s;
  ctx.strokeStyle = COL[kind];
  ctx.lineCap = kind === 'hidden' ? 'butt' : 'round';
  ctx.setLineDash(kind === 'hidden' ? [0.375 * s, 0.25 * s] : []); // the board's 3/2 dash to its 2.4 mm width, scaled
  const inset = kind === 'hidden' ? 0 : ctx.lineWidth / 2;
  ctx.moveTo(x + inset, y);
  ctx.lineTo(x + s - inset, y);
  ctx.stroke();
  ctx.setLineDash([]);
}
function drawLegend() {
  const L = LEGEND;
  ctx.save();
  ctx.font = FONT(L.font, 400);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const itemW = ([, text]) => L.swatch + L.gap + ctx.measureText(text).width;
  const rowW = LEGEND_ROWS.map((row) => row.reduce((w, it) => w + itemW(it), 0) + (row.length - 1) * L.col);
  const w = Math.max(...rowW) + 2 * L.padX, h = LEGEND_ROWS.length * L.pitch + 2 * L.padY;
  // Whatever font loaded, the key keeps a margin inside the paper: a wider one shrinks about the foot's centre.
  const k = Math.min(1, (BOARD.w - 2 * L.margin) / w);
  ctx.translate(BOARD.w / 2, BOARD.h - L.foot);
  ctx.scale(k, k);
  roundRect(-w / 2, -h, w, h, 1.2);
  ctx.fillStyle = COL.key;
  ctx.fill();
  LEGEND_ROWS.forEach((row, i) => {
    const y = -h + L.padY + (i + 0.5) * L.pitch;
    let x = -rowW[i] / 2;
    for (const it of row) {
      legendSwatch(it[0], x, y);
      ctx.fillStyle = COL.keyText;
      ctx.fillText(it[1], x + L.swatch + L.gap, y);
      x += itemW(it) + L.col;
    }
  });
  ctx.restore();
}
function drawTrail(now) {
  // The key goes down first, under everything: frame() (stage-relay.js) draws the trail first, inside the paper's clip.
  drawLegend();
  while (trail.length && now - trail[0].t > TRAIL_MS) trail.shift();
  for (let i = 1; i < trail.length; i++) {
    const a = trail[i - 1], b = trail[i];
    if (a.gap || b.gap) continue;
    const age = Math.min(1, (now - b.t) / TRAIL_MS);
    const step = B.trailStep(age);
    ctx.strokeStyle = B.mixHex(COL.trail, COL.paper, TRAIL_FADE0 + (1 - TRAIL_FADE0) * step * step);
    ctx.lineWidth = TRAIL_MM + (TRAIL_TAIL_MM - TRAIL_MM) * age;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}
function drawInk(now, rv) {
  ctx.lineWidth = INK_MM;
  // Hidden strokes first, faint and dashed with nothing felt on them, so shown ink crossing them stays on top.
  if (rv.hiding) {
    ctx.strokeStyle = COL.hidden;
    ctx.lineCap = 'butt';
    ctx.setLineDash(HIDDEN_DASH);
    strokes.forEach((st, i) => { if (!rv.stroke[i] && st.pts.length) polyline(inkState(st).samples); });
    ctx.setLineDash([]);
    ctx.lineCap = 'round';
  }
  for (let n = 0; n < strokes.length; n++) {
    const st = strokes[n];
    if (!st.pts.length || !rv.stroke[n]) continue;
    const s = inkState(st);
    ctx.strokeStyle = COL.unfelt;
    polyline(s.samples);
    ctx.strokeStyle = COL.felt;
    for (const [a, b] of B.feltRuns(s.felt)) polyline(s.samples, a, b);
    if (REDUCE) continue;
    // Freshly found ink lands thick and settles to normal width: flat ink, no glow.
    for (let i = 0; i < s.samples.length; i++) {
      const k = B.settle(s.felt[i], now);
      if (!k) continue;
      ctx.lineWidth = INK_MM * (1 + SETTLE_GAIN * k);
      polyline(s.samples, i > 0 && s.felt[i - 1] ? i - 1 : i, i);
    }
    ctx.lineWidth = INK_MM;
  }
}
function drawRings(now) {
  rings = rings.filter((r) => now - r.t0 < B.RING_MS);
  if (!finger.cur) return;
  const { x, y } = finger.cur;
  ctx.strokeStyle = COL.amber;
  for (const r of rings) {
    const g = B.ringAt(now - r.t0, r.strength, r.burst, CURSOR_R_MM);
    if (!g) continue;
    ctx.lineWidth = g.w;
    ctx.beginPath();
    ctx.arc(x, y, g.r, 0, Math.PI * 2);
    ctx.stroke();
  }
}
function drawCursor(now) {
  if (!finger.cur) return;
  const k = REDUCE ? (finger.down ? 1 : 0) : B.cursorScale(now, finger.downAt, finger.upAt);
  if (k <= 0) return;
  const { x, y } = finger.cur;
  ctx.beginPath();
  ctx.arc(x, y, CURSOR_R_MM * k, 0, Math.PI * 2);
  ctx.fillStyle = COL.ink;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, (CURSOR_MM + CURSOR_BORDER_MM) * k, 0, Math.PI * 2);
  ctx.fillStyle = COL.white;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, CURSOR_MM * k, 0, Math.PI * 2);
  ctx.fillStyle = COL.amber;
  ctx.fill();
}
// Landmarks: a faint ring for the phone's 4 mm zone, a dot (hollow until the phone has announced it,
// then filled), and the name beside it with a paper halo so it stays readable over ink. Flat colours only.
// Names 4.4 mm and captions 4.8 mm (18 and 20 px in the GIF, critic's pass, Nov 8): names are what the student hears,
// and 3.6 mm was the smallest text on the board. A caption's longest lesson line still fits the 56 mm board.
const LM_DOT_MM = 1.9, LM_FONT_MM = 4.4, CAP_FONT_MM = 4.8;
const FONT = (mm, weight = 700) => `${weight} ${mm}px 'Atkinson Hyperlegible', system-ui, sans-serif`;
// The start point (#107) carries a small ink pennant on its dot, a map's start flag. Its outline counts as ink when the
// name's side is chosen, so the name never sits on the flag.
const FLAG = { pole: 4.6, w: 3.6, h: 2.8 };
function flagPoints(l) {
  const top = l.y - LM_DOT_MM - FLAG.pole, out = [];
  for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) out.push({ x: l.x + FLAG.w * i / 4, y: top + FLAG.h * j / 4 });
  for (let j = 0; j <= 4; j++) out.push({ x: l.x, y: top + FLAG.pole * j / 4 });
  return out;
}
function drawFlag(l, ink = COL.ink) {
  const y0 = l.y - LM_DOT_MM, top = y0 - FLAG.pole;
  const shape = () => { ctx.beginPath(); ctx.moveTo(l.x, top); ctx.lineTo(l.x + FLAG.w, top + FLAG.h / 2); ctx.lineTo(l.x, top + FLAG.h); ctx.closePath(); };
  ctx.lineJoin = 'round';
  ctx.strokeStyle = COL.paper; // halo, so the flag reads over ink
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(l.x, y0 - 0.8); ctx.lineTo(l.x, top); ctx.stroke(); // clear of the dot's outline
  shape(); ctx.stroke();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(l.x, y0); ctx.lineTo(l.x, top); ctx.stroke();
  shape(); ctx.fillStyle = ink; ctx.fill();
}
// A hidden landmark (#111) draws all in 25% ink, never filled as announced: the phone gives it no cue yet.
// Names are placed here and painted by drawNames after the cursor: the finger rests on a point exactly while its name
// is spoken, and the cursor drawn over the name hid its first letters then.
// capMarks: what a caption must not cover (board.js captionSlot), the ink, each point's zone and flag, and each name,
// as mm points.
let names = [], capMarks = [];
function drawLandmarks(rv) {
  names = [];
  const ink = [];
  for (const st of strokes) if (st.pts.length) for (const p of inkState(st).samples) ink.push(p);
  capMarks = ink.slice();
  if (!landmarks.length) return;
  ctx.textBaseline = 'middle';
  ctx.font = FONT(LM_FONT_MM);
  for (let n = 0; n < landmarks.length; n++) {
    const l = landmarks[n], tone = rv.mark[n] ? COL.ink : COL.hidden;
    ctx.lineWidth = 0.5; // 0.35 mm (1.5 GIF px) of light grey speckled away in the GIF's palette
    ctx.strokeStyle = rv.mark[n] ? COL.unfelt : COL.hidden;
    ctx.beginPath();
    ctx.arc(l.x, l.y, B.LANDMARK_MM, 0, Math.PI * 2);
    ctx.stroke();
    const found = rv.mark[n] && foundMarks.has(l.id);
    ctx.beginPath();
    ctx.arc(l.x, l.y, LM_DOT_MM, 0, Math.PI * 2);
    ctx.fillStyle = found ? COL.felt : COL.paper;
    ctx.fill();
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = tone;
    ctx.stroke();
    if (found) {
      ctx.beginPath();
      ctx.arc(l.x, l.y, 0.7, 0, Math.PI * 2);
      ctx.fillStyle = COL.paper;
      ctx.fill();
    }
    if (l.start) drawFlag(l, tone);
    capMarks.push(l);
    for (let a = 0; a < 16; a++) capMarks.push({ x: l.x + B.LANDMARK_MM * Math.cos(a * Math.PI / 8), y: l.y + B.LANDMARK_MM * Math.sin(a * Math.PI / 8) });
    if (l.start) capMarks.push(...flagPoints(l));
    const name = B.cleanName(l.name);
    if (!name) continue;
    const w = ctx.measureText(name).width, gap = B.LANDMARK_MM + 0.8;
    const at = B.labelPlace(l, w, BOARD, gap, LM_FONT_MM, l.start ? ink.concat(flagPoints(l)) : ink);
    names.push({ name, tone, at });
    const x0 = at.align === 'left' ? at.x : at.align === 'right' ? at.x - w : at.x - w / 2;
    for (let x = x0; x <= x0 + w; x += 1) for (const dy of [-LM_FONT_MM / 2, 0, LM_FONT_MM / 2]) capMarks.push({ x, y: at.y + dy });
  }
}
function drawNames() {
  ctx.textBaseline = 'middle';
  ctx.font = FONT(LM_FONT_MM);
  ctx.lineWidth = 1.4;
  for (const { name, tone, at } of names) {
    ctx.textAlign = at.align;
    ctx.strokeStyle = COL.paper;
    ctx.strokeText(name, at.x, at.y);
    ctx.fillStyle = tone;
    ctx.fillText(name, at.x, at.y);
  }
}
// The spot a point being named will take: a dashed ring in soft ink, so the tutor sees where it goes.
function drawPending() {
  if (!pending) return;
  ctx.save();
  ctx.setLineDash([1.2, 1]);
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = '#545e6b';
  ctx.beginPath();
  ctx.arc(pending.x, pending.y, B.LANDMARK_MM, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(pending.x, pending.y, LM_DOT_MM, 0, Math.PI * 2);
  ctx.fillStyle = COL.paper;
  ctx.fill();
  ctx.lineWidth = 0.6;
  ctx.stroke();
  ctx.restore();
}
// A speaker with two sound waves, `s` mm wide, left edge at x, centred on y: the caption is what the phone said aloud.
function drawSpeaker(x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y - 0.16 * s); ctx.lineTo(x + 0.22 * s, y - 0.16 * s); ctx.lineTo(x + 0.5 * s, y - 0.4 * s);
  ctx.lineTo(x + 0.5 * s, y + 0.4 * s); ctx.lineTo(x + 0.22 * s, y + 0.16 * s); ctx.lineTo(x, y + 0.16 * s);
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = 0.09 * s;
  ctx.lineCap = 'round';
  for (const r of [0.2, 0.4]) { ctx.beginPath(); ctx.arc(x + 0.5 * s, y, r * s, -Math.PI / 4, Math.PI / 4); ctx.stroke(); }
}
// Caption: what the phone just said, for the silent GIF, in a fixed slot inside the board (review, Nov 8: in a bubble
// beside the cursor it covered the route and the Office label). The slot is picked once per caption, the top unless
// the drawing fills it more than the bottom one above the key (board.js captionSlot), so it never jumps or covers a
// line. It no longer waits for a finger: "Drawing updated" often comes while the student's finger is lifted.
function drawCaption(now) {
  if (!caption) return;
  const age = now - caption.t0;
  const k = REDUCE ? (age >= 0 && age < B.CAPTION_MS ? 1 : 0) : B.captionScale(age);
  if (k <= 0) { if (age >= B.CAPTION_MS) caption = null; return; }
  ctx.font = FONT(CAP_FONT_MM);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const text = '“' + caption.name + '”';
  const pad = 1.8, icon = CAP_FONT_MM * 0.85, h = CAP_FONT_MM + pad * 1.6;
  const w = pad + icon + 1 + ctx.measureText(text).width + pad;
  if (!caption.slot) caption.slot = B.captionSlot(w, h, BOARD, capMarks, { bottom: legendTop() - 0.5 });
  const { x0, y0, scale } = caption.slot;
  ctx.save();
  ctx.translate(x0 + w * scale / 2, y0 + h * scale / 2); // the pop scales about the slot's centre
  ctx.scale(k * scale, k * scale);
  roundRect(-w / 2, -h / 2, w, h, 1.6);
  ctx.fillStyle = COL.ink;
  ctx.fill();
  ctx.fillStyle = ctx.strokeStyle = COL.white;
  drawSpeaker(-w / 2 + pad, 0, icon);
  ctx.fillText(text, -w / 2 + pad + icon + 1, 0);
  ctx.restore();
}
