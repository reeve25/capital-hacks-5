const test = require('node:test');
const assert = require('node:assert/strict');
const { Renderer, SHAPES, buildScene, simplify } = require('./tactile.js');

const hline = { pts: [{ x: 10, y: 50 }, { x: 46, y: 50 }] };
const rendererWith = (strokes, opts = {}) => {
  const r = new Renderer({ halfWidth: 4.5, ...opts });
  r.setStrokes(strokes);
  return r;
};

test('entering and leaving a line switches the level', () => {
  const r = rendererWith([hline]);
  assert.equal(r.move({ x: 28, y: 20 }), null);
  assert.deepEqual(r.move({ x: 28, y: 48 }), { type: 'level', level: 2 });
  assert.equal(r.move({ x: 30, y: 49 }), null);
  assert.deepEqual(r.move({ x: 30, y: 60 }), { type: 'level', level: 0 });
});

test('a fast finger that jumps the line between samples still gets a tick', () => {
  const r = rendererWith([hline]);
  r.move({ x: 28, y: 20 });
  assert.deepEqual(r.move({ x: 28, y: 80 }), { type: 'tick' });
  assert.equal(r.move({ x: 28, y: 90 }), null);
});

test('the shoulder gives a soft level before the line', () => {
  const r = rendererWith([hline], { shoulder: 4 });
  r.move({ x: 28, y: 20 });
  assert.deepEqual(r.move({ x: 28, y: 43 }), { type: 'level', level: 1 });
  assert.deepEqual(r.move({ x: 28, y: 47 }), { type: 'level', level: 2 });
});

test('a line drawn under a resting finger is felt with no movement, and so is its removal', () => {
  const r = rendererWith([]);
  r.move({ x: 28, y: 50 });
  r.setStrokes([hline]);
  assert.deepEqual(r.refresh(), { type: 'level', level: 2 });
  assert.equal(r.refresh(), null);
  r.setStrokes([]);
  assert.deepEqual(r.refresh(), { type: 'level', level: 0 });
});

test('endpoints and corners give their own cues', () => {
  const r = rendererWith(SHAPES.L);
  const { nodes } = buildScene(SHAPES.L, {});
  assert.deepEqual(nodes.map((n) => n.kind).sort(), ['corner', 'end', 'end']);
  const end = nodes.find((n) => n.kind === 'end');
  assert.deepEqual(r.move(end), { type: 'node', kind: 'end', level: 2 });
  const corner = nodes.find((n) => n.kind === 'corner');
  assert.deepEqual(r.move(corner), { type: 'node', kind: 'corner', level: 2 });
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
