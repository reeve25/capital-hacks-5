const test = require('node:test');
const assert = require('node:assert/strict');
const { Renderer, SHAPES, LANDMARK_MM, buildScene, simplify, sendQueue } = require('./tactile.js');

const hline = { pts: [{ x: 10, y: 50 }, { x: 46, y: 50 }] };
const rendererWith = (strokes, opts = {}) => {
  const r = new Renderer({ halfWidth: 4.5, ...opts });
  r.setStrokes(strokes);
  return r;
};

test('entering and leaving a line switches the level', () => {
  const r = rendererWith([hline]);
  assert.equal(r.move({ x: 28, y: 20 }), null);
  assert.deepEqual(r.move({ x: 28, y: 48 }), { type: 'level', level: r.top });
  assert.equal(r.move({ x: 30, y: 49 }), null);
  assert.deepEqual(r.move({ x: 30, y: 60 }), { type: 'level', level: 0 });
});

test('a fast finger that jumps the line between samples still gets a tick', () => {
  const r = rendererWith([hline]);
  r.move({ x: 28, y: 20 });
  assert.deepEqual(r.move({ x: 28, y: 80 }), { type: 'tick' });
  assert.equal(r.move({ x: 28, y: 90 }), null);
});

test('the buzz fades in steps as the finger drifts off the line', () => {
  const r = rendererWith([hline], { halfWidth: 3, fade: 6, steps: 3 });
  // Line at y = 50: core to 3 mm away, fade from 3 to 9 mm, two millimetres per step.
  const levels = [50, 52.9, 53.5, 55.5, 57.5, 59.5].map((y) => r.levelAt({ x: 28, y }));
  assert.deepEqual(levels, [r.top, r.top, 3, 2, 1, 0]);
  r.move({ x: 28, y: 20 });
  assert.deepEqual(r.move({ x: 28, y: 58 }), { type: 'level', level: 1 });
  assert.deepEqual(r.move({ x: 28, y: 50 }), { type: 'level', level: r.top });
});

test('no fade means the line is simply on or off', () => {
  const r = rendererWith([hline]);
  assert.equal(r.levelAt({ x: 28, y: 55 }), 0);
});

test('a line drawn under a resting finger is felt with no movement, and so is its removal', () => {
  const r = rendererWith([]);
  r.move({ x: 28, y: 50 });
  r.setStrokes([hline]);
  assert.deepEqual(r.refresh(), { type: 'level', level: r.top });
  assert.equal(r.refresh(), null);
  r.setStrokes([]);
  assert.deepEqual(r.refresh(), { type: 'level', level: 0 });
});

test('endpoints and corners give their own cues', () => {
  const r = rendererWith(SHAPES.L);
  const { nodes } = buildScene(SHAPES.L, {});
  assert.deepEqual(nodes.map((n) => n.kind).sort(), ['corner', 'end', 'end']);
  const end = nodes.find((n) => n.kind === 'end');
  assert.deepEqual(r.move(end), { type: 'node', kind: 'end', level: r.top });
  const corner = nodes.find((n) => n.kind === 'corner');
  assert.deepEqual(r.move(corner), { type: 'node', kind: 'corner', level: r.top });
});

test('a closed square has four corners and no dead ends', () => {
  const kinds = buildScene(SHAPES.square, {}).nodes.map((n) => n.kind);
  assert.deepEqual(kinds, ['corner', 'corner', 'corner', 'corner']);
});

test('crossing strokes and T junctions read as corners', () => {
  const plus = buildScene(SHAPES.plus, {}).nodes;
  assert.equal(plus.filter((n) => n.kind === 'corner').length, 1);
  assert.equal(plus.filter((n) => n.kind === 'end').length, 4);
  const t = buildScene(SHAPES.T, {}).nodes;
  assert.equal(t.filter((n) => n.kind === 'end').length, 3);
});

test('a circle has no false corners', () => {
  assert.equal(buildScene(SHAPES.circle, {}).nodes.length, 0);
});

test('a wobbly hand-drawn straight line simplifies to two points', () => {
  const wobble = Array.from({ length: 30 }, (_, i) => ({ x: 10 + i, y: 50 + (i % 2 ? 0.8 : -0.8) }));
  assert.equal(simplify(wobble, 2).length, 2);
});

const library = { id: 'lm1', x: 28, y: 50, name: 'Library', by: 'tutor' };

test('a landmark is found within 4 mm of the finger, on the line or off it, with its name', () => {
  assert.equal(LANDMARK_MM, 4);
  const door = { id: 'lm2', x: 28, y: 20, name: 'Door' };
  const r = rendererWith([hline]);
  r.setLandmarks([library, door]);
  assert.equal(r.move({ x: 28, y: 30 }), null);
  assert.deepEqual(r.move({ x: 28, y: 23.9 }), { type: 'node', kind: 'landmark', level: 0, name: 'Door' });
  assert.equal(r.move({ x: 28, y: 35 }), null);
  assert.deepEqual(r.move({ x: 28, y: 46 }), { type: 'node', kind: 'landmark', level: r.top, name: 'Library' });
  const far = rendererWith([hline]);
  far.setLandmarks([library]);
  assert.deepEqual(far.move({ x: 32.1, y: 50 }), { type: 'level', level: far.top });
});

// The cues met tracing a polyline end to end in 0.5 mm steps, as kind or kind:name.
function trace(r, pts) {
  const samples = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1], n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 0.5);
    for (let k = 0; k < n; k++) samples.push({ x: a.x + (b.x - a.x) * k / n, y: a.y + (b.y - a.y) * k / n });
  }
  samples.push(pts[pts.length - 1]);
  return samples.map((p) => r.move(p)).filter((c) => c && c.type === 'node').map((c) => (c.name ? `${c.kind}:${c.name}` : c.kind));
}

test('a landmark on a corner or end replaces that cue, and a route reads in order', () => {
  const route = SHAPES.L[0].pts; // (5,37) down to the corner (5,83), then right to (51,83)
  const cues = (landmarks) => { const r = rendererWith(SHAPES.L); r.setLandmarks(landmarks); return trace(r, route); };
  assert.deepEqual(cues([]), ['end', 'corner', 'end']);
  assert.deepEqual(cues([{ id: 'a', x: 28, y: 83, name: 'Fountain' }]), ['end', 'corner', 'landmark:Fountain', 'end']);
  assert.deepEqual(cues([{ id: 'b', x: 5, y: 83, name: 'Office' }]), ['end', 'landmark:Office', 'end']);
  assert.deepEqual(cues([{ id: 'c', x: 51, y: 83, name: 'Library' }]), ['end', 'corner', 'landmark:Library']);
  // At the corner itself, with a landmark there, the landmark wins.
  const r = rendererWith(SHAPES.L);
  r.setLandmarks([{ id: 'b', x: 5, y: 83, name: 'Office' }]);
  r.move({ x: 5, y: 60 });
  assert.deepEqual(r.move({ x: 5, y: 83 }), { type: 'node', kind: 'landmark', level: r.top, name: 'Office' });
});

test('a landmark cues once per entry: resting on its edge or a resent scene does not repeat it', () => {
  const r = rendererWith([hline]);
  r.setLandmarks([library]);
  const enter = { type: 'node', kind: 'landmark', level: r.top, name: 'Library' };
  assert.equal(r.move({ x: 28, y: 20 }), null);
  assert.deepEqual(r.move({ x: 25, y: 50 }), enter);
  assert.equal(r.move({ x: 23.5, y: 50 }), null); // 4.5 mm: past the 4 mm entry radius, inside the 5 mm exit
  assert.equal(r.move({ x: 24.5, y: 50 }), null);
  r.setStrokes([hline]);
  r.setLandmarks([{ ...library }]);
  assert.equal(r.refresh(), null);
  assert.equal(r.move({ x: 22, y: 50 }), null); // 6 mm: left, still on the line, so no cue
  assert.deepEqual(r.move({ x: 24.5, y: 50 }), enter);
  assert.equal(r.lift().level, 0);
  assert.deepEqual(r.move({ x: 28, y: 50 }), enter); // a new touch is a new entry
});

test('a landmark placed or removed under a resting finger is felt with no movement', () => {
  const r = rendererWith([hline]);
  r.move({ x: 28, y: 50 });
  r.setLandmarks([library]);
  assert.deepEqual(r.refresh(), { type: 'node', kind: 'landmark', level: r.top, name: 'Library' });
  assert.equal(r.refresh(), null);
  r.setLandmarks([]); // undo
  assert.equal(r.refresh(), null);
  r.setLandmarks([library]);
  assert.deepEqual(r.refresh(), { type: 'node', kind: 'landmark', level: r.top, name: 'Library' });
});

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

test('queued reports go out one at a time, in order, with none dropped', async () => {
  const sent = [];
  let inFlight = 0, most = 0;
  const q = sendQueue(async (m) => { most = Math.max(most, ++inFlight); await new Promise(setImmediate); sent.push(m); inFlight--; });
  for (let i = 0; i < 20; i++) q.push(i);
  await pause(50);
  assert.deepEqual(sent, Array.from({ length: 20 }, (_, i) => i));
  assert.equal(most, 1);
  assert.equal(q.dropped, 0);
});

test('a failed send is retried before anything newer', async () => {
  const tries = [];
  let failures = 2;
  const q = sendQueue(async (m) => { tries.push(m); if (m === 'a' && failures-- > 0) throw new Error('link down'); }, { retryMs: 1 });
  ['a', 'b', 'c'].forEach((m) => q.push(m));
  await pause(150);
  assert.deepEqual(tries, ['a', 'a', 'a', 'b', 'c']);
});

test('a dead link keeps only the newest messages up to the cap', async () => {
  let up = false;
  const sent = [];
  const q = sendQueue(async (m) => { if (!up) throw new Error('link down'); sent.push(m); }, { cap: 3, retryMs: 1 });
  for (let i = 1; i <= 6; i++) q.push(i);
  await pause(20);
  assert.equal(q.waiting, 3);
  assert.equal(q.dropped, 3);
  up = true;
  await pause(150);
  assert.deepEqual(sent, [4, 5, 6]);
});

test('cap 1 sends the newest message once the one in flight lands', async () => {
  const sent = [];
  let land;
  const q = sendQueue((m) => { sent.push(m); return m === 'a' ? new Promise((r) => { land = r; }) : Promise.resolve(); }, { cap: 1 });
  ['a', 'b', 'c'].forEach((m) => q.push(m));
  await pause(5);
  land();
  await pause(5);
  assert.deepEqual(sent, ['a', 'c']);
});
