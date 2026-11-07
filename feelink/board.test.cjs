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
    { burst: false, kind: 'hold', level: 4, top: 4, strength: 1 });
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

test('HapticRings: level change rings, bursts ring, stop and silence end the state', () => {
  const r = new B.HapticRings();
  const lv = (level) => B.parseHaptic({ type: 'haptic', kind: level === 4 ? 'hold' : 'fade', level, top: 4 });
  assert.equal(r.onHaptic(lv(1), 0)[0].strength, 0.25);
  assert.equal(r.onHaptic(lv(4), 100).length, 1, 'new level rings');
  const burst = r.onHaptic(B.parseHaptic({ type: 'haptic', kind: 'corner', level: 4, top: 4 }), 200);
  assert.deepEqual(burst, [{ strength: 1, burst: true }]);
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
