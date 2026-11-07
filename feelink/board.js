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

  // The one place that reads phone haptic events (protocol still open in issue #34). Nathan's
  // proposal: {type:'haptic', level, top, kind:'hold'|'fade'|'corner'|'end'|'tick'|'stop', pattern, t, ok?}.
  // Returns null for anything that should not draw a ring, else {burst, level, top, strength 0..1}.
  // burst: a one-off cue (corner, end, tick). Otherwise a held level state (0 means off).
  const BURSTS = { corner: 1, end: 1, tick: 1, node: 1 };
  function parseHaptic(ev) {
    if (!ev || ev.type !== 'haptic' || ev.ok === false) return null;
    const kind = typeof ev.kind === 'string' ? ev.kind : '';
    if (kind === 'stop') return { burst: false, kind, level: 0, top: 1, strength: 0 };
    const top = Number(ev.top) > 0 ? Number(ev.top) : 4;
    let level = Number(ev.level);
    if (!Number.isFinite(level)) level = BURSTS[kind] || kind === 'hold' ? top : 0;
    level = Math.max(0, Math.min(top, level));
    const burst = !!BURSTS[kind];
    if (!burst && level === 0) return { burst: false, kind, level: 0, top, strength: 0 };
    return { burst, kind: kind || 'hold', level, top, strength: burst ? 1 : level / top };
  }

  // Turns parsed haptic events into ring spawns. A level is a state: the phone re-arms the same level
  // every 0.4-0.65 s, so re-arms keep the state alive instead of each drawing a new burst. While a level
  // is held, rings pulse at a cadence tied to the level. The state lapses if no re-arm comes in time.
  class HapticRings {
    constructor(opts = {}) {
      this.holdMs = opts.holdMs ?? 1000;        // longer than the slowest re-arm, so a held line keeps pulsing
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
        return [{ strength: 1, burst: true }];
      }
      if (h.level === 0) { this.state = null; return []; }
      const same = this.state && this.state.level === h.level && now < this.state.until;
      if (same) { this.state.until = now + this.holdMs; this.state.top = h.top; return []; }
      this.state = { level: h.level, top: h.top, until: now + this.holdMs, next: now + this.period(h.level, h.top) };
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

  const api = { FELT_MM, RESAMPLE_MM, RING_MS, SETTLE_MS, TRAIL_STEPS, fit, toMm, clampToBoard, smooth, resample, distPointSeg,
    markFelt, feltRuns, parseHaptic, HapticRings, mixHex, follow, cubicBezier, easeOut, ringAt, cursorScale, settle, trailStep };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Board = api;
})(this);
