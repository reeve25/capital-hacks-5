const test = require('node:test');
const assert = require('node:assert/strict');
const B = require('./board.js');
const { BOARD } = require('./tactile.js');

test('fit letterboxes the portrait board without stretching', () => {
  const wide = B.fit(1920, 1080, BOARD);
  assert.equal(wide.scale, 9); // height-limited: 1080 / 120
  assert.equal(wide.h, 1080);
  assert.equal(wide.w, 504);
  assert.equal(wide.x, (1920 - 504) / 2);
  assert.equal(wide.y, 0);
  const narrow = B.fit(280, 1200, BOARD);
  assert.equal(narrow.scale, 5); // width-limited: 280 / 56
  assert.equal(narrow.y, (1200 - 600) / 2);
  assert.ok(Math.abs(narrow.w / narrow.h - BOARD.w / BOARD.h) < 1e-9);
  const padded = B.fit(1000, 1000, BOARD, 20);
  assert.equal(padded.scale, 960 / 120);
});

test('toMm inverts the fit', () => {
  const f = B.fit(1920, 1080, BOARD);
  const p = B.toMm(f, f.x + 28 * f.scale, f.y + 60 * f.scale);
  assert.deepEqual(p, { x: 28, y: 60 });
  assert.deepEqual(B.clampToBoard({ x: -3, y: 130 }, BOARD), { x: 0, y: 120 });
});

test('smoothing keeps endpoints, drops jitter and flattens a wobble', () => {
  const wobble = Array.from({ length: 40 }, (_, i) => ({ x: 10 + i, y: 50 + (i % 2 ? 0.6 : -0.6) }));
  const out = B.smooth(wobble);
  assert.deepEqual(out[0], wobble[0]);
  assert.deepEqual(out[out.length - 1], wobble[wobble.length - 1]);
  const inner = out.slice(3, -3);
  assert.ok(inner.every((p) => Math.abs(p.y - 50) < 0.2), 'wobble reduced');
  const jitter = [{ x: 0, y: 0 }, { x: 0.1, y: 0 }, { x: 0.2, y: 0.1 }, { x: 5, y: 0 }];
  assert.equal(B.smooth(jitter, { radius: 0 }).length, 2);
  assert.deepEqual(B.smooth([{ x: 1, y: 2 }]), [{ x: 1, y: 2 }]);
  assert.deepEqual(B.smooth([]), []);
});

test('smoothing a growing stroke only moves its tail, so re-sends stay stable', () => {
  const raw = Array.from({ length: 30 }, (_, i) => ({ x: i, y: Math.sin(i / 3) * 4 + 60 }));
  const early = B.smooth(raw.slice(0, 20)), late = B.smooth(raw);
  assert.deepEqual(late.slice(0, 17), early.slice(0, 17));
});

test('resample keeps vertices and spaces samples at most 1 mm', () => {
  const s = B.resample([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 2.5 }]);
  assert.equal(s.length, 1 + 10 + 3);
  for (let i = 1; i < s.length; i++) assert.ok(Math.hypot(s[i].x - s[i - 1].x, s[i].y - s[i - 1].y) <= 1 + 1e-9);
  assert.deepEqual(s[10], { x: 10, y: 0 });
});

test('found by touch reveals only ink within the 3 mm half-core', () => {
  const samples = B.resample([{ x: 10, y: 50 }, { x: 46, y: 50 }]);
  const felt = new Uint8Array(samples.length);
  assert.equal(B.markFelt(samples, felt, { x: 28, y: 53.5 }, { x: 28, y: 53.5 }), 0); // 3.5 mm away
  const n = B.markFelt(samples, felt, { x: 28, y: 52.9 }, { x: 28, y: 52.9 });
  assert.ok(n > 0 && n <= 3, `only ink right under the finger, got ${n}`);
  assert.deepEqual(B.feltRuns(felt).length, 1);
  assert.equal(B.markFelt(samples, felt, { x: 28, y: 52.9 }, { x: 28, y: 52.9 }), 0, 'already found');
});

test('a fast swipe across the line still finds what it crossed', () => {
  const samples = B.resample([{ x: 10, y: 50 }, { x: 46, y: 50 }]);
  const felt = new Uint8Array(samples.length);
  B.markFelt(samples, felt, { x: 20, y: 20 }, { x: 20, y: 90 });
  const runs = B.feltRuns(felt);
  assert.equal(runs.length, 1);
  const [a, b] = runs[0];
  assert.ok(samples[a].x >= 17 && samples[b].x <= 23);
});

test('feltRuns groups consecutive samples', () => {
  assert.deepEqual(B.feltRuns(Uint8Array.from([0, 1, 1, 0, 1, 0, 0, 1])), [[1, 2], [4, 4], [7, 7]]);
  assert.deepEqual(B.feltRuns(new Uint8Array(3)), []);
});

test('parseHaptic: rings only for real, successful, non-stop buzzes', () => {
  assert.equal(B.parseHaptic({ type: 'finger', x: 1, y: 2, down: true }), null);
  assert.equal(B.parseHaptic({ type: 'haptic', kind: 'hold', level: 4, top: 4, ok: false }), null);
  assert.equal(B.parseHaptic(null), null);
  assert.equal(B.parseHaptic({ type: 'haptic', kind: 'stop' }).level, 0);
  assert.deepEqual(B.parseHaptic({ type: 'haptic', kind: 'hold', level: 4, top: 4, pattern: [40, 20], t: 1 }),
    { burst: false, kind: 'hold', level: 4, top: 4, strength: 1, ms: 60, pulses: [0] });
  // feel.html sends the hold as a bare number and fades as on/off arrays.
  assert.equal(B.parseHaptic({ type: 'haptic', kind: 'hold', level: 4, top: 4, pattern: 5000, ok: true }).ms, 5000);
  assert.equal(B.parseHaptic({ type: 'haptic', kind: 'fade', level: 1, top: 4, pattern: [12, 60, 12, 60] }).ms, 144);
  assert.equal(B.parseHaptic({ type: 'haptic', kind: 'fade', level: 1, top: 4 }).ms, 0);
  const fade = B.parseHaptic({ type: 'haptic', kind: 'fade', level: 2, top: 4 });
  assert.equal(fade.burst, false);
  assert.equal(fade.strength, 0.5);
  for (const kind of ['corner', 'end', 'tick']) assert.equal(B.parseHaptic({ type: 'haptic', kind, level: 4, top: 4 }).burst, true);
  // Missing fields degrade sensibly rather than throwing.
  assert.equal(B.parseHaptic({ type: 'haptic', kind: 'tick' }).burst, true);
  assert.equal(B.parseHaptic({ type: 'haptic', level: 9, top: 4 }).level, 4);
  assert.equal(B.parseHaptic({ type: 'haptic', kind: 'fade', level: 0, top: 4 }).level, 0);
});

test('HapticRings: a held level re-armed by the phone pulses at a cadence, not per re-arm', () => {
  const r = new B.HapticRings({ holdMs: 1000, periodTopMs: 450, periodLowMs: 900 });
  const hold = B.parseHaptic({ type: 'haptic', kind: 'hold', level: 4, top: 4 });
  assert.equal(r.onHaptic(hold, 0).length, 1, 'first event rings at once');
  let rings = 0;
  for (let t = 0; t <= 3000; t += 16) {
    if (t > 0 && t % 400 < 16) rings += r.onHaptic(hold, t).length; // re-arm every ~0.4 s
    rings += r.tick(t).length;
  }
  // 3 s at a 450 ms cadence is about 6 rings after the first, all from tick(); re-arms add none.
  assert.ok(rings >= 5 && rings <= 7, `cadence rings ${rings}`);
  assert.equal(r.onHaptic(hold, 3010).length, 0, 're-arm of the same level does not ring');
});

test('HapticRings: the line\'s 5 s hold re-armed at 4.5 s keeps pulsing, and stop ends it', () => {
  // Matches feel.html's setBuzz: vibrate('hold', 5000), re-armed at HOLD_MS * 0.9.
  const r = new B.HapticRings({ holdMs: 1000, periodTopMs: 450, periodLowMs: 900 });
  const hold = B.parseHaptic({ type: 'haptic', kind: 'hold', level: 4, top: 4, pattern: 5000, ok: true });
  r.onHaptic(hold, 0);
  let rings = 0, lastRingAt = 0;
  for (let t = 16; t <= 10000; t += 16) {
    if (t % 4500 < 16) r.onHaptic(hold, t);
    const n = r.tick(t).length;
    if (n) lastRingAt = t;
    rings += n;
  }
  assert.ok(rings >= 20, `a 10 s hold keeps pulsing, got ${rings} rings`);
  assert.ok(lastRingAt > 9400, `still pulsing near the end, last ring at ${lastRingAt}`);
  r.onHaptic(B.parseHaptic({ type: 'haptic', kind: 'stop', pattern: 1, ok: true }), 10010);
  assert.deepEqual(r.tick(10500), []);
  // Without a re-arm or stop, the state lapses once the phone's own 5 s buzz has run out.
  r.onHaptic(hold, 20000);
  assert.ok(r.tick(24900).length <= 1);
  assert.equal(r.state && r.state.level, 4, 'still held inside the 5 s buzz');
  r.tick(25300);
  assert.equal(r.state, null, 'lapsed after the buzz ran out');
});

test('HapticRings: level change rings, bursts ring, stop and silence end the state', () => {
  const r = new B.HapticRings();
  const lv = (level) => B.parseHaptic({ type: 'haptic', kind: level === 4 ? 'hold' : 'fade', level, top: 4 });
  assert.equal(r.onHaptic(lv(1), 0)[0].strength, 0.25);
  assert.equal(r.onHaptic(lv(4), 100).length, 1, 'new level rings');
  const burst = r.onHaptic(B.parseHaptic({ type: 'haptic', kind: 'corner', level: 4, top: 4 }), 200);
  assert.deepEqual(burst, [{ strength: 1, burst: true, delay: 0 }]);
  assert.deepEqual(r.onHaptic(B.parseHaptic({ type: 'haptic', kind: 'stop' }), 300), []);
  assert.deepEqual(r.tick(1000), []);
  r.onHaptic(lv(4), 2000);
  assert.deepEqual(r.tick(3100), [], 'state lapses without re-arms');
  assert.equal(r.state, null);
});

test('HapticRings: no haptic events means no rings ever', () => {
  const r = new B.HapticRings();
  let n = 0;
  for (let t = 0; t < 5000; t += 16) n += r.tick(t).length + r.onHaptic(null, t).length;
  assert.equal(n, 0);
});

test('mixHex and follow', () => {
  assert.equal(B.mixHex('#2bb3a3', '#fbfaf6', 0), '#2bb3a3');
  assert.equal(B.mixHex('#2bb3a3', '#fbfaf6', 1), '#fbfaf6');
  assert.equal(B.mixHex('#000000', '#ffffff', 0.5), '#808080');
  assert.ok(B.follow(0, 10, 16, 35) > 0 && B.follow(0, 10, 16, 35) < 10);
  assert.equal(B.follow(3, 3, 16, 35), 3);
});

test('markFelt stores a caller mark (the time found) and keeps the first one', () => {
  const samples = B.resample([{ x: 10, y: 50 }, { x: 20, y: 50 }]);
  const felt = new Float64Array(samples.length);
  B.markFelt(samples, felt, { x: 12, y: 50 }, { x: 12, y: 50 }, B.FELT_MM, 1234);
  assert.ok(felt.includes(1234));
  B.markFelt(samples, felt, { x: 12, y: 50 }, { x: 14, y: 50 }, B.FELT_MM, 2000);
  assert.equal(felt[2], 1234, 'already-found ink keeps its first time');
  assert.equal(B.feltRuns(felt).length, 1);
});

test('cubicBezier easing matches its endpoints and is a strong ease-out', () => {
  const e = B.cubicBezier(0.23, 1, 0.32, 1);
  assert.equal(e(0), 0);
  assert.equal(e(1), 1);
  assert.ok(e(0.2) > 0.6, `most of the move lands early, got ${e(0.2)}`);
  let prev = 0;
  for (let x = 0.05; x <= 1; x += 0.05) { const y = e(x); assert.ok(y >= prev - 1e-9); prev = y; }
  const lin = B.cubicBezier(0, 0, 1, 1);
  assert.ok(Math.abs(lin(0.37) - 0.37) < 1e-3);
});

test('ringAt: flat ring that grows and thins, never alpha, gone by RING_MS', () => {
  assert.equal(B.ringAt(-1, 1, false, 3.4), null, 'a delayed burst ring waits');
  assert.equal(B.ringAt(B.RING_MS, 1, false, 3.4), null);
  const a = B.ringAt(0, 1, false, 3.4), b = B.ringAt(200, 1, false, 3.4), c = B.ringAt(500, 1, false, 3.4);
  assert.deepEqual(Object.keys(a).sort(), ['r', 'w']);
  assert.equal(a.r, 3.4);
  assert.ok(b.r > a.r && c.r > b.r && c.w < b.w && b.w < a.w);
  // At 15 fps (66.7 ms per frame) the ring is visible for at least 8 GIF frames.
  let frames = 0;
  for (let t = 0; t < B.RING_MS; t += 1000 / 15) if (B.ringAt(t, 1, false, 3.4)) frames++;
  assert.ok(frames >= 8, `frames ${frames}`);
  // Stronger buzzes draw heavier, wider rings; bursts are the heaviest.
  const faint = B.ringAt(300, 0.25, false, 3.4), strong = B.ringAt(300, 1, false, 3.4), burst = B.ringAt(300, 1, true, 3.4);
  assert.ok(faint.w < strong.w && strong.w < burst.w);
  assert.ok(faint.r < strong.r && strong.r < burst.r);
  // Every visible ring is at least ~1.2 GIF px wide (about 4 px/mm in the GIF panel).
  for (let t = 0; t < B.RING_MS; t += 10) { const g = B.ringAt(t, 0.25, false, 3.4); if (g) assert.ok(g.w >= 0.3); }
});

test('cursorScale: lands large and settles, shrinks then hides on lift', () => {
  assert.ok(B.cursorScale(0, 0, null) > 1.25);
  assert.ok(Math.abs(B.cursorScale(400, 0, null) - 1) < 1e-9);
  assert.ok(B.cursorScale(60, 0, null) < B.cursorScale(20, 0, null));
  assert.equal(B.cursorScale(1000, 0, 1000), 1);
  const mid = B.cursorScale(1070, 0, 1000);
  assert.ok(mid < 1 && mid >= 0.5);
  assert.equal(B.cursorScale(1140, 0, 1000), 0);
  assert.equal(B.cursorScale(5000, 0, 1000), 0);
});

test('settle: fresh ink is extra wide, settles within SETTLE_MS, never-found ink never settles', () => {
  assert.equal(B.settle(0, 500), 0);
  assert.equal(B.settle(1000, 1000), 1);
  assert.ok(B.settle(1000, 1100) > 0 && B.settle(1000, 1100) < 1);
  assert.equal(B.settle(1000, 1000 + B.SETTLE_MS), 0);
  assert.equal(B.settle(2000, 1000), 0, 'future stamps do nothing');
});

test('trailStep quantises the fade to a few flat colours', () => {
  const seen = new Set();
  for (let i = 0; i <= 1000; i++) seen.add(B.trailStep(i / 1000));
  assert.equal(seen.size, B.TRAIL_STEPS + 1);
  assert.equal(B.trailStep(0), 0);
  assert.equal(B.trailStep(1), 1);
  assert.equal(B.trailStep(-0.2), 0);
});

test('bursts ring once per real pulse at the pattern timing (Codex #8 on #34)', () => {
  assert.deepEqual(B.pulseStarts(25), [0], 'tick is one 25 ms pulse');
  assert.deepEqual(B.pulseStarts([30, 40, 30]), [0, 70], 'corner');
  assert.deepEqual(B.pulseStarts([30, 30, 30, 30, 30]), [0, 60, 120], 'end');
  assert.deepEqual(B.pulseStarts([]), [0]);
  assert.deepEqual(B.pulseStarts([0, 10, 20]), [10], 'zero-length on-steps are not pulses');
  const r = new B.HapticRings();
  const tick = r.onHaptic(B.parseHaptic({ type: 'haptic', kind: 'tick', level: 0, top: 4, pattern: 25, ok: true }), 0);
  assert.equal(tick.length, 1);
  const corner = r.onHaptic(B.parseHaptic({ type: 'haptic', kind: 'corner', level: 4, top: 4, pattern: [30, 40, 30], ok: true }), 0);
  assert.deepEqual(corner.map((x) => x.delay), [0, 70]);
});

test('an accepted buzz drops rings whose pulse has not started', () => {
  assert.deepEqual(B.dropPending([{ t0: 0 }, { t0: 100 }, { t0: 170 }], 120), [{ t0: 0 }, { t0: 100 }]);
  assert.deepEqual(B.dropPending([], 5), []);
});

test('feltFromConfig: half the phone core width, else keep the fallback (Codex #7 on #34)', () => {
  assert.equal(B.feltFromConfig({ type: 'phoneconfig', coreMm: 6 }), 3);
  assert.equal(B.feltFromConfig({ type: 'phoneconfig', coreMm: 8 }), 4);
  assert.equal(B.feltFromConfig({ type: 'phoneconfig' }, 3.5), 3.5);
  assert.equal(B.feltFromConfig({ type: 'phoneconfig', coreMm: 'x' }), B.FELT_MM);
  assert.equal(B.feltFromConfig({ type: 'phoneconfig', coreMm: 0 }), B.FELT_MM);
});

test('landmark haptic is a one-off cue with its name, and does not end a held line (#65)', () => {
  // As feel.html sends it (#64): NODE.landmark = [120, 60, 40, 80], name added for the stage caption.
  const ev = { type: 'haptic', kind: 'landmark', name: '  Main   library ', level: 0, top: 4, pattern: [120, 60, 40, 80], ok: true, t: 1 };
  const h = B.parseHaptic(ev);
  assert.equal(h.burst, true);
  assert.equal(h.name, 'Main library');
  assert.deepEqual(h.pulses, [0, 180], 'long-short: two rings');
  const r = new B.HapticRings({ holdMs: 1000, periodTopMs: 450, periodLowMs: 900 });
  r.onHaptic(B.parseHaptic({ type: 'haptic', kind: 'hold', level: 4, top: 4, pattern: 5000, ok: true }), 0);
  assert.equal(r.onHaptic(h, 100).length, 2);
  assert.equal(r.state && r.state.level, 4, 'an off-line landmark (level 0) does not clear the held line');
  assert.equal(B.parseHaptic({ ...ev, ok: false }), null, 'a refused buzz shows nothing');
  assert.equal(B.parseHaptic({ ...ev, name: 42 }).name, '');
});

test('landmark helpers: upsert keeps order, lookup by name picks the nearest, clicks hit the zone', () => {
  const a = { id: 'a', x: 5, y: 10, name: 'Library' }, b = { id: 'b', x: 40, y: 100, name: 'Library' }, c = { id: 'c', x: 30, y: 50, name: 'Gym' };
  let list = B.upsertById([], a);
  list = B.upsertById(list, b);
  list = B.upsertById(list, { ...a, name: 'Main library' });
  assert.deepEqual(list.map((l) => l.id + ':' + l.name), ['a:Main library', 'b:Library'], 'rename keeps its place');
  list = B.upsertById(B.upsertById([], a), b).concat([c]);
  assert.equal(B.landmarkFor(list, 'Library', { x: 38, y: 98 }).id, 'b');
  assert.equal(B.landmarkFor(list, 'Library', { x: 6, y: 9 }).id, 'a');
  assert.equal(B.landmarkFor(list, 'Pool', { x: 0, y: 0 }), null);
  assert.equal(B.landmarkAt(list, { x: 31, y: 52 }).id, 'c');
  assert.equal(B.landmarkAt(list, { x: 31, y: 56 }), null, 'outside the 4 mm zone');
  assert.equal(B.validLandmark({ id: 'x', x: 1, y: 2 }), true);
  assert.equal(B.validLandmark({ id: 'x', x: 'a', y: 2 }), false);
  assert.equal(B.cleanName('x'.repeat(40)).length, B.NAME_MAX);
});

test('landmark label avoids the board edge and the ink; caption pops, holds and goes', () => {
  const board = { w: 56, h: 120 };
  const side = (...a) => B.labelPlace(...a).side;
  assert.equal(side({ x: 10, y: 10 }, 20, board, 4.8), 'right');
  assert.equal(side({ x: 45, y: 30 }, 20, board, 4.8), 'left', 'no room on the right');
  assert.equal(side({ x: 20, y: 50 }, 12, board, 4.8, 3.6, []), 'right', 'right on a tie');
  // A route leaving to the right pushes the label left, if it fits there.
  const toRight = (x0) => Array.from({ length: 30 }, (_, i) => ({ x: x0 + i, y: 50 }));
  assert.equal(side({ x: 20, y: 50 }, 12, board, 4.8, 3.6, toRight(20)), 'left');
  // Near the left edge with the route going right and down (the Library case): above is clear.
  const down = Array.from({ length: 30 }, (_, i) => ({ x: 12, y: 62 + i }));
  assert.equal(side({ x: 12, y: 62 }, 13, board, 4.8, 3.6, toRight(12).map((p) => ({ x: p.x, y: 62 })).concat(down)), 'above');
  const at = B.labelPlace({ x: 12, y: 62 }, 13, board, 4.8, 3.6, []);
  assert.deepEqual([at.x, at.y, at.align], [16.8, 62, 'left']);
  assert.equal(B.captionScale(-1), 0);
  assert.ok(B.captionScale(0) >= 0.85 && B.captionScale(0) < 1);
  assert.equal(B.captionScale(800), 1);
  assert.ok(B.captionScale(B.CAPTION_MS - 10) < 1);
  assert.equal(B.captionScale(B.CAPTION_MS), 0);
});

test('Shift snaps the tutor stroke to the straight line from its first point (#92)', () => {
  const raw = Array.from({ length: 30 }, (_, i) => ({ x: 8 + i, y: 40 + Math.sin(i) * 2 + i * 0.5 }));
  const line = B.strokePoints(raw, true);
  assert.deepEqual(line, [raw[0], raw[raw.length - 1]], 'first point to the latest, nothing in between');
  assert.ok(raw.slice(1, -1).every((p) => !line.includes(p)), 'the wobble is gone');
  // Moving on with Shift still held keeps the start and follows the pointer.
  const more = raw.concat([{ x: 50, y: 100 }]);
  assert.deepEqual(B.strokePoints(more, true), [raw[0], { x: 50, y: 100 }]);
  // Releasing Shift mid-stroke goes back to the smoothed freehand path of the same samples.
  assert.deepEqual(B.strokePoints(raw, false), B.smooth(raw));
  assert.deepEqual(B.strokePoints([{ x: 3, y: 4 }], true), [{ x: 3, y: 4 }], 'a click stays a dot');
  assert.deepEqual(B.strokePoints([{ x: 3, y: 4 }, { x: 3, y: 4 }], true), [{ x: 3, y: 4 }]);
  assert.deepEqual(B.strokePoints([], true), []);
  // The snapped copy is new objects, so later edits to raw cannot move a sent stroke.
  assert.notEqual(line[0], raw[0]);
});

test('haptic reports: a retried (kind, t) is used once, reports without t always pass (#92)', () => {
  const r = new B.PhoneReports();
  const hold = { type: 'haptic', kind: 'hold', level: 4, top: 4, pattern: 5000, ok: true, t: 1000, age: 12, dropped: 0 };
  assert.equal(r.haptic(hold).level, 4);
  assert.equal(r.haptic({ ...hold, age: 1012 }), null, 'the retry of a published report');
  assert.equal(r.haptic({ ...hold }), null, 'an exact repeat');
  assert.equal(r.haptic({ ...hold, t: 1001 }).level, 4, 'the next report has a new t');
  // The key is (kind, t): a different kind at the same t is a different report.
  assert.equal(r.haptic({ type: 'haptic', kind: 'corner', level: 4, top: 4, pattern: [30, 40, 30], ok: true, t: 1000, age: 5 }).burst, true);
  // Older phone builds send no t: nothing to dedupe on, so every report is drawn.
  const bare = { type: 'haptic', kind: 'tick', level: 0, top: 4, pattern: 25, ok: true };
  assert.ok(r.haptic(bare) && r.haptic(bare));
  assert.equal(r.haptic({ ...hold, t: 2000, ok: false }), null, 'a refused buzz still draws nothing');
  assert.equal(r.haptic({ type: 'finger', t: 3000 }), null);
  // The memory is bounded: the oldest keys are forgotten first.
  const small = new B.PhoneReports({ keep: 3 });
  for (let t = 1; t <= 5; t++) small.haptic({ ...hold, t });
  assert.equal(small.seen.size, 3);
  assert.equal(small.haptic({ ...hold, t: 5 }), null, 'recent keys are still remembered');
});

test('haptic reports older than 1000 ms draw nothing, but a late stop still ends the buzz (#92)', () => {
  const r = new B.PhoneReports();
  assert.equal(B.REPORT_MAX_AGE_MS, 1000);
  const ev = (kind, t, age, extra = {}) => ({ type: 'haptic', kind, level: 4, top: 4, pattern: [30, 40, 30], ok: true, t, age, dropped: 0, ...extra });
  assert.equal(r.haptic(ev('corner', 1, 1000)).burst, true, '1000 ms is still live');
  assert.equal(r.haptic(ev('corner', 2, 1001)), null, 'a buzz that waited over a second is not drawn');
  assert.equal(r.haptic(ev('hold', 3, 4000, { pattern: 5000 })), null, 'nor is a late hold');
  assert.equal(r.haptic(ev('landmark', 4, 2500, { name: 'Gate', level: 0 })), null, 'nor a late landmark cue');
  // A late stop or fade-to-zero draws nothing anyway; it ends the held state, so stale rings stop.
  const stop = r.haptic(ev('stop', 5, 3000, { pattern: 1 }));
  assert.equal(stop.kind, 'stop');
  assert.equal(stop.level, 0);
  assert.equal(r.haptic(ev('fade', 6, 3000, { level: 0 })).level, 0);
  const rings = new B.HapticRings();
  rings.onHaptic(r.haptic(ev('hold', 7, 20, { pattern: 5000 })), 0);
  rings.onHaptic(r.haptic(ev('stop', 8, 1800, { pattern: 1 })), 100);
  assert.equal(rings.state, null, 'the late stop cleared the held line');
  assert.ok(r.haptic(ev('corner', 9, undefined)), 'no age field: treated as live');
});

test('spoken reports: only real spoken lines are logged, once each (#90, #92)', () => {
  assert.deepEqual(B.parseSpoken({ type: 'spoken', text: '  Main   library ', kind: 'landmark', t: 5 }), { text: 'Main library', kind: 'landmark' });
  assert.deepEqual(B.parseSpoken({ type: 'spoken', text: 'Drawing changed', kind: 'status', t: 6 }), { text: 'Drawing changed', kind: 'status' });
  assert.equal(B.parseSpoken({ type: 'spoken', text: 'x', kind: 'other' }).kind, 'status');
  assert.equal(B.parseSpoken({ type: 'spoken', text: '   ' }), null);
  assert.equal(B.parseSpoken({ type: 'spoken', text: 42 }), null);
  assert.equal(B.parseSpoken({ type: 'spoken', text: 'y'.repeat(200) }).text.length, B.SPOKEN_MAX);
  // A landmark haptic carries a name, but it is not proof the phone spoke: it never becomes a spoken line.
  assert.equal(B.parseSpoken({ type: 'haptic', kind: 'landmark', name: 'Gate', t: 7 }), null);
  const r = new B.PhoneReports();
  const said = { type: 'spoken', text: 'Gate', kind: 'landmark', t: 9 };
  assert.deepEqual(r.spoken(said), { text: 'Gate', kind: 'landmark' });
  assert.equal(r.spoken({ ...said }), null, 'a retried line is logged once');
  assert.ok(r.spoken({ ...said, t: 10, age: 5000 }), 'a late line is still logged: the student did hear it');
  assert.equal(r.spoken({ type: 'haptic', kind: 'landmark', name: 'Gate', t: 11 }), null);
});

test('connection status is in words, board link first, then the phone and its finger (#92)', () => {
  assert.deepEqual(B.connectionStatus(false, true, true), { tone: 'off', text: 'Board offline', sub: 'Reconnecting…' });
  assert.equal(B.connectionStatus(true, false, false).text, "Waiting for the student's phone");
  assert.equal(B.connectionStatus(true, false, true).tone, 'wait', 'a stale finger is not a live phone');
  assert.equal(B.connectionStatus(true, true, false).sub, 'Not touching the board');
  assert.deepEqual(B.connectionStatus(true, true, true), { tone: 'on', text: "Student's phone connected", sub: 'Touching the board' });
});

test('landmark-rest heartbeat is a small one-off ring that leaves a held line alone (#90)', () => {
  // As feel.html sends it: vibrate('landmark-rest', 70) every 1200 ms while the finger rests on a landmark.
  const h = B.parseHaptic({ type: 'haptic', kind: 'landmark-rest', level: 4, top: 4, pattern: [70], ok: true, t: 1, age: 4 });
  assert.equal(h.burst, true);
  assert.equal(h.soft, true);
  assert.ok(h.strength > 0 && h.strength < 0.5);
  const r = new B.HapticRings();
  r.onHaptic(B.parseHaptic({ type: 'haptic', kind: 'hold', level: 4, top: 4, pattern: 5000, ok: true }), 0);
  const rings = r.onHaptic(h, 100);
  assert.deepEqual(rings, [{ strength: h.strength, burst: false, delay: 0 }]);
  assert.equal(r.state && r.state.level, 4, 'not read as a level: the held line is untouched');
  const small = B.ringAt(150, rings[0].strength, rings[0].burst, 3.4), full = B.ringAt(150, 1, true, 3.4);
  assert.ok(small.r < full.r && small.w < full.w, 'smaller and thinner than a corner');
  assert.equal(new B.PhoneReports().haptic({ type: 'haptic', kind: 'landmark-rest', pattern: 70, ok: true, t: 2, age: 1300 }), null, 'a late beat draws nothing');
  // The arrival cue since #90: three 220 ms buzzes, one ring each, with the name for the caption.
  const cue = B.parseHaptic({ type: 'haptic', kind: 'landmark', name: 'Gate', level: 4, top: 4, pattern: [220, 130, 220, 130, 220], ok: true });
  assert.deepEqual([cue.pulses, cue.name, cue.soft], [[0, 350, 700], 'Gate', undefined]);
});
