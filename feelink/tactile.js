// Geometry and haptic rendering for FeelInk. All coordinates are millimetres on the board.
// Pure logic with no browser calls, so `node --test feelink/tactile.test.cjs` can check it.
(function (root) {
  const BOARD = { w: 56, h: 120 };
  // A landmark (a named point such as "Library") is found within this many mm of the finger, on the line or off it.
  const LANDMARK_MM = 4;

  function distPointSeg(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    const t = len2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2)) : 0;
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  }

  function cross(o, a, b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  }

  function segsIntersect(a, b, c, d) {
    return cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0;
  }

  function distSegSeg(a, b, c, d) {
    if (segsIntersect(a, b, c, d)) return 0;
    return Math.min(distPointSeg(a, c, d), distPointSeg(b, c, d), distPointSeg(c, a, b), distPointSeg(d, a, b));
  }

  // Ramer-Douglas-Peucker: hand-drawn strokes need this, or every wobble reads as a corner.
  function simplify(pts, eps) {
    if (pts.length < 3) return pts.slice();
    let maxD = -1, idx = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      const d = distPointSeg(pts[i], pts[0], pts[pts.length - 1]);
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD <= eps) return [pts[0], pts[pts.length - 1]];
    return simplify(pts.slice(0, idx + 1), eps).slice(0, -1).concat(simplify(pts.slice(idx), eps));
  }

  function turnDegrees(a, b, c) {
    const a1 = Math.atan2(b.y - a.y, b.x - a.x), a2 = Math.atan2(c.y - b.y, c.x - b.x);
    let d = Math.abs(a1 - a2) * 180 / Math.PI;
    return d > 180 ? 360 - d : d;
  }

  // The point at least `minDist` along the stroke from index i, walking in direction `step`.
  function walk(pts, i, step, minDist) {
    let j = i, d = 0;
    while (j + step >= 0 && j + step < pts.length && d < minDist) {
      d += Math.hypot(pts[j + step].x - pts[j].x, pts[j + step].y - pts[j].y);
      j += step;
    }
    return pts[j];
  }

  function intersection(a, b, c, d) {
    const r = { x: b.x - a.x, y: b.y - a.y }, s = { x: d.x - c.x, y: d.y - c.y };
    const t = ((c.x - a.x) * s.y - (c.y - a.y) * s.x) / (r.x * s.y - r.y * s.x);
    return { x: a.x + t * r.x, y: a.y + t * r.y };
  }

  // Finds the places worth a distinct cue: research reports people dwell on vertices when reading shapes.
  function buildScene(strokes, opts) {
    const closeMm = opts.closeMm ?? 4, cornerDeg = opts.cornerDeg ?? 40, eps = opts.simplifyMm ?? 2;
    const windowMm = opts.cornerWindowMm ?? 5;
    const segs = [], nodes = [];
    strokes.filter((s) => s.pts.length).forEach((stroke, si) => {
      const pts = stroke.pts, poly = simplify(pts, eps);
      for (let i = 0; i + 1 < poly.length; i++) segs.push({ a: poly[i], b: poly[i + 1], si });
      if (poly.length === 1) segs.push({ a: poly[0], b: poly[0], si });
      // Measured on the original stroke over a fixed length: simplifying turns a circle into an octagon.
      for (let i = 1; i + 1 < poly.length; i++) {
        const at = pts.indexOf(poly[i]);
        if (turnDegrees(walk(pts, at, -1, windowMm), poly[i], walk(pts, at, 1, windowMm)) >= cornerDeg) nodes.push({ ...poly[i], kind: 'corner' });
      }
      const first = poly[0], last = poly[poly.length - 1];
      if (pts.length > 2 && Math.hypot(first.x - last.x, first.y - last.y) <= closeMm) {
        if (turnDegrees(walk(pts, pts.length - 1, -1, windowMm), first, walk(pts, 0, 1, windowMm)) >= cornerDeg) nodes.push({ ...first, kind: 'corner' });
      } else {
        nodes.push({ ...first, kind: 'end' }, { ...last, kind: 'end' });
      }
    });
    for (let i = 0; i < segs.length; i++) {
      for (let j = i + 1; j < segs.length; j++) {
        if (segs[i].si !== segs[j].si && segsIntersect(segs[i].a, segs[i].b, segs[j].a, segs[j].b)) {
          nodes.push({ ...intersection(segs[i].a, segs[i].b, segs[j].a, segs[j].b), kind: 'corner' });
        }
      }
    }
    // A stroke ending on another stroke is a junction, not a dead end.
    for (const n of nodes) {
      if (n.kind === 'end' && segs.some((s) => distPointSeg(n, s.a, s.b) < 1 && !(s.a.x === n.x && s.a.y === n.y) && !(s.b.x === n.x && s.b.y === n.y))) n.kind = 'corner';
    }
    return { segs, nodes };
  }

  // Levels: 0 off the line, 1..steps in the fade beside it (1 faintest), top on it.
  class Renderer {
    constructor(opts) {
      this.halfWidth = opts.halfWidth ?? 4.5;
      this.fade = opts.fade ?? 0;
      this.steps = opts.steps ?? 3;
      this.top = this.steps + 1;
      this.nodeRadius = opts.nodeRadius ?? 5;
      this.landmarkRadius = opts.landmarkRadius ?? LANDMARK_MM;
      this.sceneOpts = opts;
      this.scene = { segs: [], nodes: [] };
      this.landmarks = [];
      this.last = null;
      this.level = 0;
      this.node = null;
    }

    setStrokes(strokes) {
      this.scene = buildScene(strokes, this.sceneOpts);
      this.keepNode();
    }

    // Landmarks as the relay sends them: {id, x, y, name}. Each becomes a node of kind 'landmark'.
    setLandmarks(list) {
      this.landmarks = (list || []).filter((l) => l && Number.isFinite(l.x) && Number.isFinite(l.y))
        .map((l) => ({ x: l.x, y: l.y, kind: 'landmark', id: l.id, name: typeof l.name === 'string' ? l.name : '' }));
      this.keepNode();
    }

    // The relay resends the scene on every edit, so the node under a resting finger is kept if it is still
    // there; otherwise the next refresh would cue it (and speak a landmark) again with no movement.
    keepNode() {
      const n = this.node;
      if (!n) return;
      this.node = (n.kind === 'landmark'
        ? this.landmarks.find((m) => m.id === n.id && m.x === n.x && m.y === n.y && m.name === n.name)
        : this.scene.nodes.find((m) => m.x === n.x && m.y === n.y)) || null;
    }

    nearest(p) {
      let best = Infinity;
      for (const s of this.scene.segs) best = Math.min(best, distPointSeg(p, s.a, s.b));
      return best;
    }

    sweptNearest(a, b) {
      let best = Infinity;
      for (const s of this.scene.segs) best = Math.min(best, distSegSeg(a, b, s.a, s.b));
      return best;
    }

    levelAt(p) {
      const d = this.nearest(p);
      if (d <= this.halfWidth) return this.top;
      if (d > this.halfWidth + this.fade) return 0;
      // Strongest just off the line, faintest at the outer edge, so drifting away reads as fading.
      return Math.ceil((this.halfWidth + this.fade - d) / this.fade * this.steps);
    }

    // Corners and ends. One a landmark sits on is skipped: the landmark replaces its cue, so the finger
    // does not get a corner buzz at 5 mm and then a landmark buzz at 4 mm for the same spot.
    nodeAt(p) {
      let best = null, bestD = this.nodeRadius;
      for (const n of this.scene.nodes) {
        const d = Math.hypot(n.x - p.x, n.y - p.y);
        if (d <= bestD && !this.landmarks.some((l) => Math.hypot(l.x - n.x, l.y - n.y) <= this.landmarkRadius)) { best = n; bestD = d; }
      }
      return best;
    }

    // Leaving takes a quarter more distance than entering, so a finger resting on the edge of a landmark
    // does not repeat its buzz and name. Scales with the one radius constant.
    landmarkAt(p) {
      const cur = this.node && this.node.kind === 'landmark' ? this.node : null;
      if (cur && Math.hypot(cur.x - p.x, cur.y - p.y) <= this.landmarkRadius * 1.25) return cur;
      let best = null, bestD = this.landmarkRadius;
      for (const n of this.landmarks) {
        const d = Math.hypot(n.x - p.x, n.y - p.y);
        if (d <= bestD) { best = n; bestD = d; }
      }
      return best;
    }

    // A landmark counts on the line or off it, and wins over a corner or end: its name says more.
    // Corners and ends count only on the line.
    nodeFor(p, level) {
      return this.landmarkAt(p) || (level === this.top ? this.nodeAt(p) : null);
    }

    nodeCommand(node, level) {
      if (node.kind === 'landmark') return { type: 'node', kind: 'landmark', level, name: node.name };
      return { type: 'node', kind: node.kind, level };
    }

    // Returns one command or null: {type:'level',level}, {type:'tick'} or {type:'node',kind,level},
    // plus name when kind is 'landmark'.
    move(p) {
      const prev = this.last;
      const prevLevel = this.level;
      const level = this.levelAt(p);
      const node = this.nodeFor(p, level);
      const nodeChanged = node !== this.node;
      this.last = p;
      this.level = level;
      this.node = node;
      if (node && nodeChanged) return this.nodeCommand(node, level);
      if (level !== prevLevel) return { type: 'level', level };
      // A fast finger can jump a line between samples, so test the path, not just the endpoints.
      if (level === 0 && prev && this.sweptNearest(prev, p) <= this.halfWidth) return { type: 'tick' };
      return null;
    }

    // A line that appears or vanishes under a resting finger has to be felt without any movement.
    refresh() {
      if (!this.last) return null;
      const prevLevel = this.level, prevNode = this.node;
      this.level = this.levelAt(this.last);
      this.node = this.nodeFor(this.last, this.level);
      if (this.node && this.node !== prevNode) return this.nodeCommand(this.node, this.level);
      return this.level !== prevLevel ? { type: 'level', level: this.level } : null;
    }

    lift() {
      this.last = null;
      this.node = null;
      if (this.level === 0) return null;
      this.level = 0;
      return { type: 'level', level: 0 };
    }
  }

  // One JSON POST that always settles: it aborts after `timeoutMs` and rejects on a non-2xx reply, so a stalled
  // or erroring relay fails the send (and a queue retries it) instead of holding its sender forever. A POST to the
  // laptop normally lands in milliseconds (finger to stage median 14 ms on the Pixel, Nov 7), so 3 s trips only on
  // a stall. Racing a timer also covers a fetch that ignores the abort.
  function poster(url, opts = {}) {
    const timeoutMs = opts.timeoutMs ?? 3000, fetchFn = opts.fetch || ((...a) => fetch(...a));
    return (body) => {
      const ctl = new AbortController();
      let timer;
      const timeout = new Promise((_, reject) => { timer = setTimeout(() => { ctl.abort(); reject(new Error('timeout')); }, timeoutMs); });
      const reply = fetchFn(url, { method: 'POST', body: JSON.stringify(body), signal: ctl.signal })
        .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r; });
      return Promise.race([reply, timeout]).finally(() => clearTimeout(timer));
    };
  }

  // First in, first out, one send in flight, so quick tick and corner reports all arrive, in order.
  // A failed send is retried before anything newer; past `cap` waiting messages the oldest is dropped,
  // so a dead link can't grow it forever. `send` returns a promise that rejects when the link is down.
  // With `stamp`, messages are objects with a time `t` (ms). The queue keeps t strictly increasing, so a retry the
  // relay already published can be recognised by (kind, t), and each attempt goes out with `age` (ms since t, at
  // that attempt) and `dropped` (messages the cap discarded since the last successful send).
  function sendQueue(send, opts = {}) {
    const cap = opts.cap ?? 200, retryMs = opts.retryMs ?? 1000, stamp = !!opts.stamp;
    const waiting = [];
    let busy = false, dropped = 0, unreported = 0, failed = 0, lastT = -Infinity;
    const trim = () => { while (waiting.length > cap) { waiting.shift(); dropped++; unreported++; } };
    function pump() {
      if (busy || !waiting.length) return;
      busy = true;
      const msg = waiting.shift();
      // Only the drops this message reports are cleared; any made while it is in flight go on the next one.
      const gap = unreported;
      const out = stamp ? { ...msg, age: Math.max(0, Date.now() - msg.t), dropped: gap } : msg;
      Promise.resolve(out).then(send).then(
        () => { unreported -= gap; busy = false; pump(); },
        () => { failed++; waiting.unshift(msg); trim(); setTimeout(() => { busy = false; pump(); }, retryMs); });
    }
    return {
      push(msg) {
        if (stamp) { lastT = msg.t > lastT ? msg.t : lastT + 1; msg = { ...msg, t: lastT }; }
        waiting.push(msg); trim(); pump();
      },
      get waiting() { return waiting.length; },
      get dropped() { return dropped; },
      get failed() { return failed; },
    };
  }

  // Test shapes, 46 mm across, centred on the board.
  const C = { x: BOARD.w / 2, y: BOARD.h / 2 }, R = 23;
  const at = (u, v) => ({ x: C.x + u * R, y: C.y + v * R });
  const line = (...uv) => ({ pts: uv.map(([u, v]) => at(u, v)) });
  const circle = Array.from({ length: 41 }, (_, i) => [Math.cos(i / 40 * 2 * Math.PI), Math.sin(i / 40 * 2 * Math.PI)]);
  const SHAPES = {
    square: [line([-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1])],
    triangle: [line([0, -1], [1, 1], [-1, 1], [0, -1])],
    circle: [line(...circle)],
    plus: [line([0, -1], [0, 1]), line([-1, 0], [1, 0])],
    T: [line([-1, -1], [1, -1]), line([0, -1], [0, 1])],
    L: [line([-1, -1], [-1, 1], [1, 1])],
    Z: [line([-1, -1], [1, -1], [-1, 1], [1, 1])],
    'open at top': [line([-1, -1], [-1, 1], [1, 1], [1, -1])],
    'open at right': [line([1, -1], [-1, -1], [-1, 1], [1, 1])],
    'open at bottom': [line([-1, 1], [-1, -1], [1, -1], [1, 1])],
    'open at left': [line([-1, -1], [1, -1], [1, 1], [-1, 1])],
  };

  const api = { BOARD, LANDMARK_MM, SHAPES, distPointSeg, distSegSeg, simplify, buildScene, Renderer, poster, sendQueue };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Tactile = api;
})(this);
