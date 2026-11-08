const test = require('node:test');
const assert = require('node:assert/strict');
const { Renderer, SHAPES, LANDMARK_MM, buildScene, simplify, guideInterval, poster, sendQueue, drawingKey, doubleTapper,
  landmarkLine, startMark, replayLine, landmarkVoice, speechCut, revealUpto, nextSeq, revealed, revealChanged } = require('./tactile.js');

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

test('stamped reports get a strictly increasing t, even within one millisecond', async () => {
  const sent = [];
  const q = sendQueue(async (m) => { sent.push(m); }, { stamp: true });
  [1000, 1000, 1000, 999, 2000].forEach((t, i) => q.push({ type: 'haptic', kind: 'tick', level: 0, t, i }));
  await pause(20);
  assert.deepEqual(sent.map((m) => m.t), [1000, 1001, 1002, 1003, 2000]);
  assert.deepEqual(sent.map((m) => m.i), [0, 1, 2, 3, 4]);
  assert.deepEqual(Object.keys(sent[0]), ['type', 'kind', 'level', 't', 'i', 'age', 'dropped']);
});

test('age is measured when each attempt goes out, and a retry keeps its t', async () => {
  const tries = [];
  let failures = 2;
  const q = sendQueue(async (m) => { tries.push(m); if (failures-- > 0) throw new Error('link down'); }, { stamp: true, retryMs: 40 });
  const t = Date.now();
  q.push({ type: 'haptic', kind: 'corner', t });
  await pause(150);
  assert.equal(tries.length, 3);
  assert.ok(tries.every((m) => m.t === t));
  assert.ok(tries[0].age < 20, `first attempt age ${tries[0].age}`);
  assert.ok(tries[1].age >= 35 && tries[2].age >= tries[1].age + 35, `ages ${tries.map((m) => m.age)}`);
  assert.equal(q.failed, 2);
});

test('dropped rides on the next successful send and resets after it', async () => {
  let up = false;
  const sent = [];
  const q = sendQueue(async (m) => { if (!up) throw new Error('link down'); sent.push(m); }, { cap: 2, retryMs: 1, stamp: true });
  for (let i = 1; i <= 5; i++) q.push({ i, t: Date.now() });
  await pause(20);
  assert.equal(q.dropped, 3);
  up = true;
  await pause(50);
  q.push({ i: 6, t: Date.now() });
  await pause(20);
  assert.deepEqual(sent.map((m) => [m.i, m.dropped]), [[4, 3], [5, 0], [6, 0]]);
});

test('a drop made while a report is in flight is reported on the next one, not lost', async () => {
  const sent = [];
  let land;
  const q = sendQueue((m) => { sent.push(m); return m.i === 1 ? new Promise((r) => { land = r; }) : Promise.resolve(); }, { cap: 1, stamp: true });
  [1, 2, 3].forEach((i) => q.push({ i, t: Date.now() }));
  await pause(5);
  land();
  await pause(5);
  q.push({ i: 4, t: Date.now() });
  await pause(5);
  assert.deepEqual(sent.map((m) => [m.i, m.dropped]), [[1, 0], [3, 1], [4, 0]]);
});

// A fake fetch: each call takes the next scripted reply; 'hang' never settles, a number is the HTTP status.
function fakeFetch(script) {
  const calls = [];
  const fn = (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    const reply = script.length ? script.shift() : 200;
    return reply === 'hang' ? new Promise(() => {}) : Promise.resolve({ ok: reply >= 200 && reply < 300, status: reply });
  };
  return { fn, calls };
}

test('a POST that never answers fails after the timeout, and the queue retries and carries on', async () => {
  const f = fakeFetch(['hang']);
  const q = sendQueue(poster('/event', { fetch: f.fn, timeoutMs: 30 }), { retryMs: 1, stamp: true });
  q.push({ kind: 'tick', t: Date.now() });
  q.push({ kind: 'corner', t: Date.now() });
  await pause(15);
  assert.equal(f.calls.length, 1, 'still waiting on the hung POST');
  await pause(100);
  assert.deepEqual(f.calls.map((c) => c.body.kind), ['tick', 'tick', 'corner']);
  assert.equal(f.calls[0].url, '/event');
  assert.equal(f.calls[0].init.method, 'POST');
  assert.equal(f.calls[0].init.signal.aborted, true);
  assert.equal(f.calls[1].init.signal.aborted, false);
  assert.equal(f.calls[1].body.t, f.calls[0].body.t);
  assert.equal(q.failed, 1);
  assert.equal(q.waiting, 0);
});

test('an HTTP error counts as a failed send and is retried', async () => {
  const f = fakeFetch([500, 503]);
  const q = sendQueue(poster('/event', { fetch: f.fn, timeoutMs: 1000 }), { retryMs: 1, stamp: true });
  q.push({ kind: 'tick', t: Date.now() });
  q.push({ kind: 'end', t: Date.now() });
  await pause(50);
  assert.deepEqual(f.calls.map((c) => c.body.kind), ['tick', 'tick', 'tick', 'end']);
  assert.equal(q.failed, 2);
  assert.equal(q.waiting, 0);
  await assert.rejects(poster('/x', { fetch: fakeFetch([404]).fn })({}), /HTTP 404/);
});

test('drawingKey: the tutor drawing or a landmark changing is a change; a stroke the student draws is not', () => {
  const tutor = { id: 't1', by: 'tutor', pts: [{ x: 5, y: 60 }, { x: 30, y: 60 }] };
  const mark = { id: 'm1', x: 30, y: 60, name: 'Library' };
  const phone = (n) => ({ id: 'phone-1', by: 'phone', pts: Array.from({ length: n }, (_, i) => ({ x: i, y: 10 })) });
  const base = drawingKey([tutor, phone(2)], [mark]);
  assert.equal(drawingKey([phone(9), tutor], [mark]), base, 'own stroke growing, or arrival order, is no change');
  assert.notEqual(drawingKey([{ ...tutor, pts: [...tutor.pts, { x: 40, y: 60 }] }, phone(2)], [mark]), base, 'tutor stroke grew');
  assert.notEqual(drawingKey([tutor, phone(2)], [{ ...mark, name: 'Gym' }]), base, 'landmark renamed');
  assert.notEqual(drawingKey([tutor, phone(2)], [{ ...mark, x: 31 }]), base, 'landmark moved');
  assert.notEqual(drawingKey([tutor], [mark]), base, 'tutor removed the phone stroke');
  assert.notEqual(drawingKey([], []), base, 'board cleared');
  assert.equal(drawingKey(undefined, undefined), drawingKey([], []));
});

test('doubleTapper: two quick still two-finger taps repeat; drawing, a third finger, a slow tap or a long gap do not', () => {
  const tap = (start, end, extra = {}) => ({ start, end, fingers: 2, drew: false, ...extra });
  let d = doubleTapper();
  assert.equal(d(tap(0, 150)), false);
  assert.equal(d(tap(400, 550)), true, 'second tap 250 ms after the first');
  assert.equal(d(tap(700, 850)), false, 'a third tap starts a new pair');
  assert.equal(d(tap(1000, 1150)), true);

  d = doubleTapper();
  assert.equal(d(tap(0, 150)), false);
  assert.equal(d(tap(800, 950)), false, '650 ms gap is too long');
  assert.equal(d(tap(1200, 1350)), true, 'but that tap can open the next pair');

  d = doubleTapper();
  d(tap(0, 150));
  assert.equal(d(tap(300, 450, { drew: true })), false, 'a two-finger draw is never a tap');
  assert.equal(d(tap(500, 650)), false, 'and it breaks the pair');

  d = doubleTapper();
  d(tap(0, 150));
  assert.equal(d(tap(300, 450, { fingers: 3 })), false, 'three fingers');
  d = doubleTapper();
  d(tap(0, 150));
  assert.equal(d(tap(300, 900)), false, 'held 600 ms is not a tap');
  d = doubleTapper();
  d(tap(0, 150, { fingers: 1 }));
  assert.equal(d(tap(300, 450)), false, 'one finger then two is not a double tap');
});

test('the start point is announced as "Start: <name>", and a replay of the instruction leads with it (#107)', () => {
  const r = rendererWith([hline]);
  r.setLandmarks([{ id: 'm', x: 20, y: 50, name: 'School', start: true }, { id: 'n', x: 40, y: 50, name: 'Library' }]);
  r.move({ x: 20, y: 30 });
  const school = r.move({ x: 20, y: 50 });
  assert.deepEqual(school, { type: 'node', kind: 'landmark', level: r.top, name: 'School', start: true });
  assert.equal(landmarkLine(school.name, school.start), 'Start: School');
  const library = r.move({ x: 40, y: 50 });
  assert.deepEqual(library, { type: 'node', kind: 'landmark', level: r.top, name: 'Library' }, 'other landmarks as before');
  assert.equal(landmarkLine(library.name, library.start), 'Library');
  // Marking the start under a resting finger is not a new arrival, so nothing is announced.
  const moved = [{ id: 'm', x: 20, y: 50, name: 'School' }, { id: 'n', x: 40, y: 50, name: 'Library', start: true }];
  r.setLandmarks(moved);
  assert.equal(r.refresh(), null);
  assert.equal(startMark(moved).id, 'n');
  assert.equal(startMark([{ id: 'x', name: '  ', start: true }]), null, 'an unnamed point cannot be announced');
  assert.equal(startMark([]), null);
  const ins = { id: 'i1', text: 'Follow the line to the library.' };
  assert.deepEqual(replayLine(ins, startMark(moved), { text: 'School', kind: 'landmark' }),
    { text: 'Start: Library. Follow the line to the library.', kind: 'instruction', id: 'i1' }, 'the instruction wins over the last line');
  assert.deepEqual(replayLine(ins, null, null), { text: ins.text, kind: 'instruction', id: 'i1' });
  assert.deepEqual(replayLine(null, startMark(moved), { text: 'Drawing changed.', kind: 'status' }), { text: 'Drawing changed.', kind: 'status' });
  assert.equal(replayLine(null, null, null), null);
});

test('a landmark is not re-announced when the finger comes back within 3 s of leaving it (#107)', () => {
  const v = landmarkVoice({ reMs: 3000 });
  assert.equal(v.enter('m|School', 0), true, 'first arrival speaks');
  v.leave('m|School', 1000);
  assert.equal(v.enter('m|School', 3999), false, 'back 2.999 s after leaving: buzz only');
  v.leave('m|School', 4500);
  assert.equal(v.enter('n|Library', 5000), true, 'another landmark speaks');
  v.leave('n|Library', 5200);
  assert.equal(v.enter('m|School', 7500), true, 'back 3 s after leaving: said again');
  v.leave('m|School', 8000);
  assert.equal(v.enter('m|Main school', 8100), true, 'renamed: said');
  // As feel.html runs it: a finger wobbling across the 5 mm leave edge arrives three times.
  const r = rendererWith([hline]);
  r.setLandmarks([{ id: 'm', x: 28, y: 50, name: 'School' }]);
  const voice = landmarkVoice();
  let at = null, t = 0;
  const said = [], arrived = [];
  for (const x of [10, 26, 22.8, 25, 22.8, 25.5]) {
    t += 400;
    const cmd = r.move({ x, y: 50 });
    if (at && r.node !== at) { voice.leave('m|School', t); at = null; }
    if (cmd && cmd.type === 'node' && cmd.kind === 'landmark') { at = r.node; arrived.push(t); if (voice.enter('m|School', t)) said.push(t); }
  }
  assert.deepEqual(arrived, [800, 1600, 2400], 'three arrivals, each felt with the buzzes');
  assert.deepEqual(said, [800], 'only the first is said');
});

test('speech priority: a name cuts anything and re-queues a cut instruction; instructions and status wait (#107)', () => {
  assert.deepEqual(speechCut([], 'landmark'), { cancel: true, resay: -1 });
  assert.deepEqual(speechCut(['instruction'], 'landmark'), { cancel: true, resay: 0 }, 'the tutor\'s words come back whole');
  assert.deepEqual(speechCut(['status', 'instruction', 'status'], 'landmark'), { cancel: true, resay: 1 });
  assert.deepEqual(speechCut(['landmark', 'status'], 'landmark'), { cancel: true, resay: -1 });
  assert.deepEqual(speechCut(['landmark'], 'instruction'), { cancel: false, resay: -1 }, 'never cuts a name mid-word: queued after it');
  assert.deepEqual(speechCut(['status'], 'instruction'), { cancel: false, resay: -1 }, 'the welcome finishes first');
  assert.deepEqual(speechCut(['instruction'], 'instruction'), { cancel: true, resay: -1 }, 'a newer instruction or a replay replaces the old');
  assert.deepEqual(speechCut(['instruction'], 'status'), { cancel: false, resay: -1 }, '"Drawing changed." waits behind the tutor');
  assert.deepEqual(speechCut(['landmark'], 'status'), { cancel: false, resay: -1 });
  assert.deepEqual(speechCut(['status'], 'status'), { cancel: true, resay: -1 }, 'as before: a status line replaces an older one');
  assert.deepEqual(speechCut([], 'status'), { cancel: true, resay: -1 });
});

// Step-through reveal (#111). A route drawn as three straight two-point strokes (as the stage's straight tool sends
// them), with landmarks on them and off them. seq is the relay's arrival order: n0, s1, m0, n1, s2, m1, s3, m3, n2.
const tutor = (id, seq, a, b) => ({ id, by: 'tutor', seq, pts: [a, b] });
const s1 = tutor('s1', 1, { x: 10, y: 20 }, { x: 10, y: 60 });
const s2 = tutor('s2', 4, { x: 10, y: 60 }, { x: 46, y: 60 });
const s3 = tutor('s3', 6, { x: 46, y: 60 }, { x: 46, y: 100 });
const n0 = { id: 'n0', seq: 0, x: 30, y: 10, name: 'North' }; // off every line, placed before any stroke
const m0 = { id: 'm0', seq: 2, x: 10, y: 60, name: 'School' }; // where s1 meets s2
const n1 = { id: 'n1', seq: 3, x: 30, y: 30, name: 'Pond' }; // off every line, placed after s1
const m1 = { id: 'm1', seq: 5, x: 28, y: 60, name: 'Library' }; // half way along s2: 18 mm from both its points
const m3 = { id: 'm3', seq: 7, x: 46, y: 80, name: 'Park' };
const n2 = { id: 'n2', seq: 8, x: 30, y: 90, name: 'Lake' }; // off every line, placed last
const route = [s1, s2, s3], marks = [n0, m0, n1, m1, m3, n2];
const bare = (x) => { const { seq, ...rest } = x; return rest; }; // as an older relay's sync sends it
const ids = (v) => [v.strokes.map((s) => s.id), v.landmarks.map((l) => l.id)];

test('reveal: anything but a whole upto >= 0 shows everything, the same lists, so the phone is unchanged (#111)', () => {
  for (const upto of [null, undefined, 'all', '2', NaN, Infinity, 2.5, -1, 3, 7]) {
    const v = revealed(route, marks, upto);
    assert.ok(v.strokes === route && v.landmarks === marks, `upto ${upto}`);
  }
  assert.deepEqual([revealUpto(0), revealUpto(2), revealUpto(2.5), revealUpto(-1), revealUpto('2'), revealUpto(null)], [0, 2, null, null, null, null]);
  assert.deepEqual(revealed(undefined, undefined, 1), { strokes: [], landmarks: [] });
});

test('reveal: tutor strokes show in seq order; a landmark follows its stroke\'s segments, or its seq on none (#111)', () => {
  assert.deepEqual(ids(revealed(route, marks, 0)), [[], ['n0']], 'only the landmark placed before any stroke');
  assert.deepEqual(ids(revealed(route, marks, 1)), [['s1'], ['n0', 'm0', 'n1']], 'School is on s1; Pond came before s2');
  assert.deepEqual(ids(revealed(route, marks, 2)), [['s1', 's2'], ['n0', 'm0', 'n1', 'm1']], 'Library is on s2\'s segment, far from its points');
  // seq decides, not the list: listed out of order, s1 is still the first step.
  assert.deepEqual(ids(revealed([s3, s1, s2], marks, 1)), [['s1'], ['n0', 'm0', 'n1']]);
  // A landmark on a hidden stroke stays hidden even if it arrived first.
  assert.deepEqual(ids(revealed(route, [{ id: 'e', seq: 0, x: 46, y: 90, name: 'Gate' }], 2)), [['s1', 's2'], []]);
  // Within 4 mm of a shown segment counts as on it; just past that it lies on none, and it arrived last.
  assert.deepEqual(ids(revealed(route, [{ id: 'k', seq: 9, x: 14, y: 40 }, { id: 'f', seq: 9, x: 14.1, y: 40 }], 1)), [['s1'], ['k']]);
});

test('reveal: only tutor strokes are steps; anyone else\'s are always shown and count toward nothing (#111)', () => {
  const own = { id: 'phone-1', by: 'phone', seq: 5.5, pts: [{ x: 20, y: 100 }, { x: 40, y: 100 }] }; // the student's
  const laptop = { id: 'laptop-1', by: 'laptop', seq: 0.5, pts: [{ x: 5, y: 5 }, { x: 50, y: 5 }] };
  const drawn = [s1, laptop, s2, own, s3];
  assert.deepEqual(ids(revealed(drawn, marks, 0)), [['laptop-1', 'phone-1'], ['n0']]);
  assert.deepEqual(ids(revealed(drawn, marks, 1)), [['s1', 'laptop-1', 'phone-1'], ['n0', 'm0', 'n1']], 'upto counts tutor strokes only');
  assert.deepEqual(ids(revealed(drawn, marks, 2)), [['s1', 'laptop-1', 's2', 'phone-1'], ['n0', 'm0', 'n1', 'm1']]);
  const all = revealed(drawn, marks, 3);
  assert.ok(all.strokes === drawn && all.landmarks === marks, '3 tutor strokes shown: nothing hidden');
  // A student stroke over a hidden landmark does not give it away: landmarks follow the tutor's geometry.
  const over = { ...own, pts: [{ x: 40, y: 80 }, { x: 52, y: 80 }] };
  assert.deepEqual(ids(revealed([s1, s2, s3, over], [m3], 2)), [['s1', 's2', 'phone-1'], []]);
  assert.equal(revealChanged([s1, own], [], 1, null), false, 'the student drawing is not a step: nothing to reveal');
});

test('reveal: with no seq (an older relay) strokes keep sync order and a landmark of unknown order waits (#111)', () => {
  const old = route.map(bare), oldMarks = marks.map(bare);
  assert.deepEqual(ids(revealed(old, oldMarks, 1)), [['s1'], ['m0']], 'North and Pond wait: their order is unknown');
  assert.deepEqual(ids(revealed(old, oldMarks, 2)), [['s1', 's2'], ['m0', 'm1']]);
  assert.equal(revealed(old, oldMarks, null).landmarks, oldMarks, 'all shown: nothing waits');
  // Live events after that sync get the next seq after the highest known (none here, so from 0), so their order is
  // known: a landmark placed live still waits for a hidden stroke from the sync, but not for a later live one.
  const s4 = tutor('s4', nextSeq(old, oldMarks), { x: 5, y: 110 }, { x: 50, y: 110 });
  const pin = { id: 'pin', seq: nextSeq([...old, s4], oldMarks), x: 30, y: 45, name: 'Bench' }; // on no stroke
  const s5 = tutor('s5', nextSeq([...old, s4], [...oldMarks, pin]), { x: 5, y: 115 }, { x: 50, y: 115 });
  assert.deepEqual([s4.seq, pin.seq, s5.seq], [0, 1, 2]);
  assert.deepEqual(ids(revealed([...old, s4, s5], [pin], 2)), [['s1', 's2'], []], 's3, the first hidden, came in the sync');
  assert.deepEqual(ids(revealed([...old, s4, s5], [pin], 4)), [['s1', 's2', 's3', 's4'], ['pin']], 'placed before s5');
  // With the relay's seqs, a live item goes after the highest, landmarks included.
  assert.equal(nextSeq(route, marks), 9);
  assert.equal(nextSeq(undefined, []), 0);
});

test('reveal: "Drawing updated." once per change that can be felt; never again for the same upto (#111)', () => {
  let upto = null;
  const said = [];
  // As feel.html runs it: every reveal event or sync moves upto, and only a felt change speaks.
  const arrive = (next, strokes = route, landmarks = marks) => {
    const to = revealUpto(next);
    if (revealChanged(strokes, landmarks, upto, to)) said.push(to);
    upto = to;
  };
  arrive(1);
  arrive(1); // the same upto again, as a resent event
  arrive(1); // an undo's sync that reproduces the current state
  arrive(2);
  arrive(null); // revealing the last stroke arrives as null
  arrive(null);
  arrive(3); // 3 of 3: everything was shown already
  arrive(1);
  arrive(2.5); // not a whole number: everything
  arrive(undefined); // a sync with no reveal: everything, as it already is
  assert.deepEqual(said, [1, 2, null, 1, null]);
  // A hidden stroke undone, or a new one drawn while hidden, leaves the felt drawing as it was: no "Drawing changed." either.
  const felt = (strokes, landmarks, u) => { const v = revealed(strokes, landmarks, u); return drawingKey(v.strokes, v.landmarks); };
  // Undo pops the newest first: Lake, then Park, then s3, all hidden at upto 2.
  assert.equal(felt(route, [n0, m0, n1, m1, m3], 2), felt(route, marks, 2));
  assert.equal(felt(route, [n0, m0, n1, m1], 2), felt(route, marks, 2));
  assert.equal(felt([s1, s2], [n0, m0, n1, m1], 2), felt(route, marks, 2));
  assert.equal(felt([...route, tutor('s4', 9, { x: 5, y: 5 }, { x: 50, y: 5 })], marks, 2), felt(route, marks, 2));
  assert.notEqual(felt([s1], marks, 2), felt(route, marks, 2), 'undoing a shown stroke is a change');
});

test('reveal: hidden geometry is blank glass, and a part hidden under a resting finger goes quiet (#111)', () => {
  const at = (upto) => {
    const v = revealed(route, marks, upto);
    const r = rendererWith(v.strokes);
    r.setLandmarks(v.landmarks);
    return r;
  };
  // On hidden s3 and its landmark Park: no hum, no landmark, and a fast swipe across it gives no tick.
  const one = at(1);
  assert.equal(one.move({ x: 46, y: 80 }), null);
  assert.equal(one.level, 0);
  assert.equal(one.move({ x: 30, y: 80 }), null);
  assert.equal(one.move({ x: 54, y: 80 }), null, 'no tick crossing a hidden line');
  const all = at(null);
  all.move({ x: 30, y: 80 });
  assert.deepEqual(all.move({ x: 54, y: 80 }), { type: 'tick' }, 'the same swipe ticks once s3 is shown');
  // A T whose stem is hidden: the bar has no junction corner where the stem would join, only its two ends.
  const [bar, stem] = SHAPES.T.map((s, i) => ({ id: 't' + i, by: 'tutor', seq: i, ...s }));
  const bars = (upto) => trace(rendererWith(revealed([bar, stem], [], upto).strokes), bar.pts);
  assert.deepEqual(bars(null), ['end', 'corner', 'end']);
  assert.deepEqual(bars(1), ['end', 'end']);
  // Hidden Library half way along hidden s2: nothing at all.
  assert.equal(at(1).move({ x: 28, y: 60 }), null);
  assert.deepEqual(at(2).move({ x: 28, y: 60 }), { type: 'node', kind: 'landmark', level: at(2).top, name: 'Library' });
  // Resting on s2, then Previous step hides it: the same stop as moving off the line.
  const r = rendererWith(revealed(route, marks, 2).strokes);
  r.move({ x: 20, y: 60 });
  assert.equal(r.level, r.top);
  r.setStrokes(revealed(route, marks, 1).strokes);
  r.setLandmarks(revealed(route, marks, 1).landmarks);
  const moved = rendererWith(revealed(route, marks, 2).strokes);
  moved.move({ x: 20, y: 60 });
  assert.deepEqual(r.refresh(), moved.move({ x: 20, y: 70 }));
  assert.deepEqual(r.refresh(), null);
  // Resting on Library when it is hidden: the landmark state ends and the line under it is gone too.
  const lib = at(2);
  lib.move({ x: 28, y: 60 });
  assert.equal(lib.node.name, 'Library');
  const v1 = revealed(route, marks, 1);
  lib.setStrokes(v1.strokes);
  lib.setLandmarks(v1.landmarks);
  assert.deepEqual(lib.refresh(), { type: 'level', level: 0 });
  assert.equal(lib.node, null);
  // The start point is not named while hidden.
  const start = { ...m3, start: true };
  assert.equal(startMark(revealed(route, [start], 2).landmarks), null);
  assert.equal(startMark(revealed(route, [start], null).landmarks), start);
});

test('guide: off the ink the taps quicken nearer the line, silent inside the fade band and beyond 20 mm', () => {
  const edge = 8; // the default phone: core 4 mm (halfWidth 2) plus a 6 mm fade
  // Inside the band (the fade handles it), past `far`, an empty board (Infinity) and a bad distance: no guide.
  for (const d of [0, 3, edge, 20.001, 25, Infinity, NaN]) assert.equal(guideInterval(d, { edge }), null, `d=${d}`);
  // The two ends of the range: `near` just past the edge, `farMs` at `far` itself.
  assert.equal(guideInterval(edge + 1e-9, { edge }), 250);
  assert.equal(guideInterval(20, { edge }), 900);
  assert.equal(guideInterval(30, { edge, far: 30, near: 100, farMs: 1000 }), 1000);
  // Linear and whole: 12 mm is a third of the way from 8 to 20, so 250 + 650 / 3.
  assert.equal(guideInterval(12, { edge }), 467);
  let prev = -Infinity;
  for (let d = edge + 0.1; d <= 20; d += 0.1) {
    const ms = guideInterval(d, { edge });
    assert.ok(Number.isInteger(ms), `integer at d=${d}`);
    assert.ok(ms >= prev, `farther is never faster: d=${d}`);
    prev = ms;
  }
  assert.ok(guideInterval(10, { edge }) < guideInterval(18, { edge }));
  // An edge at or past `far` leaves no range, and never divides by zero.
  assert.equal(guideInterval(20, { edge: 20 }), null);
  assert.equal(guideInterval(25, { edge: 30 }), null);
});

test('guide: Renderer.guideAt measures from the nearest stroke with its own line and fade widths', () => {
  const r = rendererWith([hline], { halfWidth: 2, fade: 6 }); // line at y = 50, band edge 8 mm
  assert.equal(r.guideAt({ x: 28, y: 50 }), null);
  assert.equal(r.guideAt({ x: 28, y: 58 }), null);
  assert.equal(r.guideAt({ x: 28, y: 62 }), guideInterval(12, { edge: 8 }));
  assert.equal(r.guideAt({ x: 28, y: 38 }), 467); // either side of the line
  assert.equal(r.guideAt({ x: 28, y: 80 }), null);
  // A wider line moves the edge out, so the same spot is nearer the band and taps faster.
  const wide = rendererWith([hline], { halfWidth: 4, fade: 6 });
  assert.equal(wide.guideAt({ x: 28, y: 62 }), guideInterval(12, { edge: 10 }));
  assert.ok(wide.guideAt({ x: 28, y: 62 }) < r.guideAt({ x: 28, y: 62 }));
  // No ink, no guide: an empty board is silent.
  assert.equal(new Renderer({ halfWidth: 2, fade: 6 }).guideAt({ x: 28, y: 50 }), null);
  // It reads, never moves: the level and node are untouched.
  r.move({ x: 28, y: 62 });
  r.guideAt({ x: 28, y: 50 });
  assert.equal(r.level, 0);
  assert.equal(r.move({ x: 28, y: 63 }), null);
});
