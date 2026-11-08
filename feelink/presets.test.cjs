const test = require('node:test');
const assert = require('node:assert/strict');
const { BOARD, Renderer, buildScene, distPointSeg } = require('./tactile.js');
const { PLANE, TICK_MM, coordinatePlane } = require('./presets.js');

const MARGIN_MM = 8;
const plane = coordinatePlane();
const [xAxis, yAxis] = plane.strokes;
const [origin, xEnd, yEnd] = plane.landmarks;
// Where each unit tick sits on its axis: x = 1..xMax along the x axis, y = 1..yMax up the y axis (board y grows down).
const xTicks = Array.from({ length: PLANE.xMax }, (_, i) => ({ x: origin.x + (i + 1) * PLANE.unit, y: origin.y }));
const yTicks = Array.from({ length: PLANE.yMax }, (_, i) => ({ x: origin.x, y: origin.y - (i + 1) * PLANE.unit }));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const distToStroke = (p, st) => Math.min(...st.pts.slice(1).map((b, i) => distPointSeg(p, st.pts[i], b)));

test('the plane is the first quadrant with one unit size of at least 10 mm', () => {
  assert.ok(PLANE.unit >= 10);
  assert.ok(PLANE.xMax >= 3 && PLANE.yMax >= 3);
  assert.deepEqual(plane.strokes.map((s) => s.by), ['tutor', 'tutor']);
  assert.ok(xAxis.pts.every((p) => p.y <= origin.y + 1e-9 && p.x >= origin.x), 'x axis: right of the origin, ticks up');
  assert.ok(yAxis.pts.every((p) => p.x >= origin.x), 'y axis: ticks point right, into the quadrant');
});

test('each tick is exactly one corner in the phone scene, and no two cues lie within 5 mm', () => {
  const { nodes } = buildScene(plane.strokes, {});
  for (const t of [...xTicks, ...yTicks]) {
    const near = nodes.filter((n) => dist(n, t) <= 5);
    assert.equal(near.length, 1, `tick at ${t.x},${t.y}`);
    assert.equal(near[0].kind, 'corner');
    assert.ok(Math.abs(dist(near[0], t) - TICK_MM) < 0.01, 'the cue is the tick tip');
  }
  // Besides the ticks: the origin junction (the x axis starts on the y axis) and three axis ends.
  const others = nodes.filter((n) => ![...xTicks, ...yTicks].some((t) => dist(n, t) <= 5));
  assert.deepEqual(others.map((n) => n.kind).sort(), ['corner', 'end', 'end', 'end']);
  assert.ok(others.some((n) => n.kind === 'corner' && dist(n, origin) < 0.01), 'a junction at the origin, not two dead ends');
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) assert.ok(dist(nodes[i], nodes[j]) > 5, `${JSON.stringify(nodes[i])} vs ${JSON.stringify(nodes[j])}`);
  }
});

// The student's job: from the origin, count the bumps along an axis. A finger running straight along the axis, on the
// phone's default 4 mm core (feel-home.js) and its fade (feel-live.js fadeMm), hears Origin, feels one corner per unit,
// stays on the line the whole way and hears the axis name at its end. `side` mm off the axis, > 0 away from the ticks.
const CORE_MM = 4;
function sweep(from, to, side) {
  const r = new Renderer({ halfWidth: CORE_MM / 2, fade: Math.min(8, Math.max(2, Math.round(CORE_MM * 1.5))), steps: 3 });
  r.setStrokes(plane.strokes);
  r.setLandmarks(plane.landmarks);
  const off = from.y === to.y ? { x: 0, y: side } : { x: -side, y: 0 };
  const cues = [];
  let offLine = 0;
  for (let s = 0; s <= 2000; s++) {
    const p = { x: from.x + (to.x - from.x) * s / 2000 + off.x, y: from.y + (to.y - from.y) * s / 2000 + off.y };
    const c = r.move(p);
    if (r.level !== r.top) offLine++;
    if (c && c.type === 'node') cues.push(c.kind === 'landmark' ? c.name : c.kind);
  }
  return { cues, offLine };
}

test('counting along each axis from the origin: one bump per unit, anywhere on the core, never off the line', () => {
  for (const side of [-1.9, -1, 0, 1, 1.9]) {
    const along = sweep(origin, xEnd, side);
    assert.deepEqual(along.cues, ['Origin', ...xTicks.map(() => 'corner'), 'x axis'], `x axis, ${side} mm`);
    assert.equal(along.offLine, 0, `x axis, ${side} mm`);
    const up = sweep(origin, yEnd, side);
    assert.deepEqual(up.cues, ['Origin', ...yTicks.map(() => 'corner'), 'y axis'], `y axis, ${side} mm`);
    assert.equal(up.offLine, 0, `y axis, ${side} mm`);
  }
});

test('every point stays on the board with the 8 mm margin', () => {
  const pts = [...plane.strokes.flatMap((s) => s.pts), ...plane.landmarks];
  for (const p of pts) {
    assert.ok(p.x >= MARGIN_MM && p.x <= BOARD.w - MARGIN_MM, `x ${p.x}`);
    assert.ok(p.y >= MARGIN_MM && p.y <= BOARD.h - MARGIN_MM, `y ${p.y}`);
  }
});

test('Origin is the start point on both axes, and each axis label sits on its axis end', () => {
  assert.deepEqual(plane.landmarks.map((l) => l.name), ['Origin', 'x axis', 'y axis']);
  assert.deepEqual(plane.landmarks.map((l) => !!l.start), [true, false, false]);
  assert.ok(distToStroke(origin, xAxis) <= 1 && distToStroke(origin, yAxis) <= 1);
  assert.ok(distToStroke(xEnd, xAxis) <= 1);
  assert.ok(distToStroke(yEnd, yAxis) <= 1);
  assert.ok(dist(xEnd, xTicks[xTicks.length - 1]) > 5 && dist(yEnd, yTicks[yTicks.length - 1]) > 5, 'labels clear of the last tick');
});

test('ids are fixed and prefixed, so loading the preset again replaces it', () => {
  assert.deepEqual(coordinatePlane(), plane);
  const ids = [...plane.strokes, ...plane.landmarks].map((x) => x.id);
  assert.ok(ids.every((id) => id.startsWith('preset-')));
  assert.equal(new Set(ids).size, ids.length);
});
