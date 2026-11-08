// FeelInk stage, the board: shared constants, the canvas and post(), the tutor's strokes and what the student has felt,
// the finger, trail, haptic rings, landmarks, captions, layout and the draw functions. Loaded first: the others use it.

const { BOARD } = Tactile;
const B = Board;
const HEADER_PX = 52, PAD_PX = 12;
const COL = { surround: '#0e1620', paper: '#fbfaf6', ink: '#1b222b', unfelt: '#b3b9c1', felt: '#0d7064', trail: '#2bb3a3', amber: '#ffb020', white: '#ffffff',
  hidden: B.mixHex('#1b222b', '#fbfaf6', 0.75) }; // 25% ink, flat (#c3c4c3), for what the student cannot feel yet (#111)
// Hidden ink is also dashed (butt caps, mm): solid 25% ink would read as the unfelt grey of ink the student can feel.
const HIDDEN_DASH = [3, 2];
// Sizes in board millimetres (about 8 px/mm when the page is 1000 px tall, about 4 px/mm in the GIF).
// The finger is the thing to watch (#107): a large amber dot in a white ring with a heavy ink edge, readable over ink
// and paper alike, while the trail behind it stays thin and starts already part-faded toward the paper.
const INK_MM = 2.4, SETTLE_GAIN = 0.75, TRAIL_MM = 2.2, TRAIL_TAIL_MM = 0.5, TRAIL_MS = 3000, TRAIL_FADE0 = 0.3;
const CURSOR_MM = 4.4, CURSOR_BORDER_MM = 1.1, CURSOR_EDGE_MM = 0.75, CURSOR_TAU_MS = 35;
// Found-by-touch radius: half the phone's core width, updated from its phoneconfig (default 3 mm).
let feltMm = Board.FELT_MM;
// Movement-only polish (touch-down pop, lift shrink, ink settle) is skipped under reduced motion.
// Rings stay: they are the haptic signal itself. The capture browser does not set this preference.
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
// Felt arrays hold the time each ink sample was found (0 = not yet), so fresh ink can settle.
const stamp = (now) => Math.max(1, now);

const c = document.getElementById('c'), ctx = c.getContext('2d');
let dpr = 1, view = { scale: 1, x: 0, y: 0, w: 0, h: 0 };
const post = (body) => fetch('/event', { method: 'POST', body: JSON.stringify(body) }).catch(() => {});

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
// They stay centred on the cursor, so each one reads as "the fingertip buzzed", even mid-swipe.
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
let caption = null; // {name, t0}: what the phone just spoke, shown by the cursor for the silent GIF
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
function drawTrail(now) {
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
    const g = B.ringAt(now - r.t0, r.strength, r.burst, CURSOR_MM);
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
  ctx.arc(x, y, (CURSOR_MM + CURSOR_BORDER_MM + CURSOR_EDGE_MM) * k, 0, Math.PI * 2);
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
const LM_DOT_MM = 1.9, LM_FONT_MM = 3.6, CAP_FONT_MM = 4.4;
const FONT = (mm) => `700 ${mm}px 'Atkinson Hyperlegible', system-ui, sans-serif`;
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
let names = [];
function drawLandmarks(rv) {
  names = [];
  if (!landmarks.length) return;
  ctx.textBaseline = 'middle';
  ctx.font = FONT(LM_FONT_MM);
  const ink = [];
  for (const st of strokes) if (st.pts.length) for (const p of inkState(st).samples) ink.push(p);
  for (let n = 0; n < landmarks.length; n++) {
    const l = landmarks[n], tone = rv.mark[n] ? COL.ink : COL.hidden;
    ctx.lineWidth = 0.35;
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
    const name = B.cleanName(l.name);
    if (!name) continue;
    const w = ctx.measureText(name).width, gap = B.LANDMARK_MM + 0.8;
    names.push({ name, tone, at: B.labelPlace(l, w, BOARD, gap, LM_FONT_MM, l.start ? ink.concat(flagPoints(l)) : ink) });
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
// Caption: what the phone just said, in a bubble beside the cursor, for the silent GIF.
function drawCaption(now) {
  if (!caption || !finger.cur) return;
  const age = now - caption.t0;
  const k = REDUCE ? (age >= 0 && age < B.CAPTION_MS ? 1 : 0) : B.captionScale(age);
  if (k <= 0) { if (age >= B.CAPTION_MS) caption = null; return; }
  ctx.font = FONT(CAP_FONT_MM);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const text = '“' + caption.name + '”';
  const pad = 2, w = ctx.measureText(text).width + pad * 2, h = CAP_FONT_MM + pad * 1.6;
  const off = CURSOR_MM + CURSOR_BORDER_MM + 2.5;
  // Kept inside the board (#136): a long caption used to flip left and run under the tools panel.
  const { x0, tail } = B.captionPlace(finger.cur.x, w, BOARD, off);
  const ay = finger.cur.y - off;
  ctx.save();
  ctx.translate(tail, ay); // the pop scales about the tail, which stays by the fingertip
  ctx.scale(k, k);
  roundRect(x0 - tail, -h, w, h, 1.6);
  ctx.fillStyle = COL.ink;
  ctx.fill();
  ctx.beginPath(); // tail toward the fingertip
  const dx = Math.min(Math.max(finger.cur.x - tail, -2.6), 2.6);
  ctx.moveTo(-1.5, -0.2);
  ctx.lineTo(dx, 1.6);
  ctx.lineTo(1.5, -0.2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COL.white;
  ctx.fillText(text, x0 - tail + pad, -h / 2);
  ctx.restore();
}
