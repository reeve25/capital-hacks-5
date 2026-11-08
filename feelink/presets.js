// Ready-made scenes the tutor loads in one click (#143). Pure geometry in board millimetres with no browser calls, so
// `node --test feelink/presets.test.cjs` checks it against the phone's own scene builder (tactile.js buildScene).
(function (root) {
  const Tactile = typeof module !== 'undefined' && module.exports ? require('./tactile.js') : root.Tactile;
  const { BOARD } = Tactile;

  // First quadrant, one unit on both axes so distances are true. 11 mm: two ticks' 5 mm corner zones never meet (at 10
  // they would touch), and 3 x units plus the overhang still fit the 56 mm board inside its 8 mm margins (4 would not).
  const PLANE = { xMax: 3, yMax: 8, unit: 11 };
  // A tick is a narrow tooth in the axis itself, pointing into the quadrant. 3 mm high: the tip survives buildScene's
  // 2 mm simplify and lies within the 5 mm corner zone from anywhere on the phone's default 4 mm core. 1 mm wide: the
  // axis keeps no gap a finger on that core falls through (a 4 mm tooth leaves one, and a finger there feels two bumps
  // per tick). Its feet turn 0 degrees over the 5 mm corner window, so each tick is one corner, at its tip; a plain
  // up-and-back spike reads as three corners on the vertical axis. presets.test.cjs measures this.
  const TICK_MM = 3, TICK_HALF_MM = 0.5;
  // Each axis runs this far past its last tick, and the y axis this far below the origin, so the axis ends sit more than
  // 5 mm from any tick and the x axis starts on the y axis: one junction at the origin, not two dead ends on one spot.
  const OVERHANG_MM = 6;
  const STEP_MM = 1; // straight runs carry a point per mm, so the corner window measures a tip over a true 5 mm

  const r2 = (v) => Math.round(v * 100) / 100;

  // Appends the straight run from the last point to (x, y), one point per STEP_MM.
  function runTo(pts, x, y) {
    const a = pts[pts.length - 1];
    const n = Math.max(1, Math.ceil(Math.hypot(x - a.x, y - a.y) / STEP_MM));
    for (let k = 1; k <= n; k++) pts.push({ x: r2(a.x + (x - a.x) * k / n), y: r2(a.y + (y - a.y) * k / n) });
  }

  // Strokes as the stage posts them ({id, by, pts}) and landmarks as the Label tool does ({id, x, y, name, by, start?}).
  // Fixed ids, so loading the preset again replaces the plane instead of adding a second one.
  function coordinatePlane(opts = {}) {
    const { xMax, yMax, unit } = { ...PLANE, ...opts };
    const xLen = xMax * unit + OVERHANG_MM, yLen = yMax * unit + OVERHANG_MM;
    // Centred: the plane spans the y axis to the x axis end across, the y axis end to the stub below the origin down.
    const ox = r2((BOARD.w - xLen) / 2), oy = r2((BOARD.h - yLen - OVERHANG_MM) / 2 + yLen);

    const xs = [{ x: ox, y: oy }];
    for (let k = 1; k <= xMax; k++) {
      const x = ox + k * unit;
      runTo(xs, x - TICK_HALF_MM, oy);
      xs.push({ x: r2(x), y: r2(oy - TICK_MM) }, { x: r2(x + TICK_HALF_MM), y: oy });
    }
    runTo(xs, ox + xLen, oy);

    const ys = [{ x: ox, y: r2(oy + OVERHANG_MM) }];
    for (let k = 1; k <= yMax; k++) {
      const y = oy - k * unit;
      runTo(ys, ox, y + TICK_HALF_MM);
      ys.push({ x: r2(ox + TICK_MM), y: r2(y) }, { x: ox, y: r2(y - TICK_HALF_MM) });
    }
    runTo(ys, ox, oy - yLen);

    const xEnd = xs[xs.length - 1], yEnd = ys[ys.length - 1];
    return {
      strokes: [{ id: 'preset-plane-x-axis', by: 'tutor', pts: xs }, { id: 'preset-plane-y-axis', by: 'tutor', pts: ys }],
      landmarks: [
        { id: 'preset-plane-origin', x: ox, y: oy, name: 'Origin', by: 'tutor', start: true },
        { id: 'preset-plane-x-end', x: xEnd.x, y: xEnd.y, name: 'x axis', by: 'tutor' },
        { id: 'preset-plane-y-end', x: yEnd.x, y: yEnd.y, name: 'y axis', by: 'tutor' },
      ],
    };
  }

  const api = { PLANE, TICK_MM, OVERHANG_MM, coordinatePlane };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Presets = api;
})(this);
