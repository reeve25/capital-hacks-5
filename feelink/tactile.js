// Geometry and haptic rendering for FeelInk. All coordinates are millimetres on the board.
// Pure logic with no browser calls, so `node --test feelink/tactile.test.cjs` can check it.
(function (root) {
  const BOARD = { w: 56, h: 120 };

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
      this.sceneOpts = opts;
      this.scene = { segs: [], nodes: [] };
      this.last = null;
      this.level = 0;
      this.node = null;
    }

    setStrokes(strokes) {
      this.scene = buildScene(strokes, this.sceneOpts);
      this.node = this.node && this.scene.nodes.find((n) => n.x === this.node.x && n.y === this.node.y) || null;
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

    nodeAt(p) {
      let best = null, bestD = this.nodeRadius;
      for (const n of this.scene.nodes) {
        const d = Math.hypot(n.x - p.x, n.y - p.y);
        if (d <= bestD) { best = n; bestD = d; }
      }
      return best;
    }

    // Returns one command or null: {type:'level',level}, {type:'tick'} or {type:'node',kind,level}.
    move(p) {
      const prev = this.last;
      const prevLevel = this.level;
      const level = this.levelAt(p);
      const node = level === this.top ? this.nodeAt(p) : null;
      const nodeChanged = node !== this.node;
      this.last = p;
      this.level = level;
      this.node = node;
      if (node && nodeChanged) return { type: 'node', kind: node.kind, level };
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
      this.node = this.level === this.top ? this.nodeAt(this.last) : null;
      if (this.node && this.node !== prevNode) return { type: 'node', kind: this.node.kind, level: this.level };
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

  const api = { BOARD, SHAPES, distPointSeg, distSegSeg, simplify, buildScene, Renderer };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Tactile = api;
})(this);
