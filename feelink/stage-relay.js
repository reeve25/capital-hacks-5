// FeelInk stage, the live loop, loaded last: the relay's events in (EventSource) and the frame that redraws the board
// and refreshes both panels. Both call into stage-board.js, stage-session.js and stage-tools.js, so keep it last.

// Relay.
let tutorOnline = false, everOnline = false, synced = false;
// Each phone report is used once, and a buzz that waited over a second draws nothing (#92).
const reports = new B.PhoneReports();
const es = new EventSource('/events');
es.onopen = () => { tutorOnline = everOnline = true; };
es.onerror = () => { tutorOnline = false; };
es.onmessage = (m) => {
  let ev;
  try { ev = JSON.parse(m.data); } catch { return; }
  const now = performance.now();
  // phoneconfig repeats every 2 s while the phone is live and is its presence signal (#34). One sent from the phone's
  // menu (live: false) is not: the student feels nothing there, and one sent on leaving Live marks the phone gone at
  // once (#107). A spoken report is not presence either: "Back to menu." lands after the phone has left.
  if (ev.type === 'phoneconfig' && ev.live === false) { if (Number.isFinite(lastPhoneAt)) phoneLeft = true; }
  else if (ev.type === 'finger' || ev.type === 'phoneconfig' || ev.type === 'haptic' || ev.type === 'hello' || ev.type === 'presence') {
    lastPhoneAt = now;
    if (ev.type !== 'haptic') phoneLeft = false; // the stop buzz sent on leaving can land after the leaving config
  }
  if (ev.type === 'sync') {
    synced = true;
    // In the relay's arrival order (seq). The stroke being drawn keeps the relay's place for it (reveal steps count in
    // that order), or goes last if the relay has not got it yet.
    const relayStrokes = B.bySeq(ev.strokes), relayMarks = B.bySeq(ev.landmarks);
    const list = !mine ? relayStrokes : relayStrokes.some((s) => s.id === mine.id) ? relayStrokes.map((s) => (s.id === mine.id ? mine : s))
      : relayStrokes.concat([mine]);
    arrivals.sync(relayStrokes, relayMarks); // the relay's numbers; setStrokes then adds a stroke it has not got yet
    setStrokes(list);
    setLandmarks(relayMarks);
    reveal = B.cleanReveal(ev.reveal); // absent = all
    if (ev.instruction) onInstruction(ev.instruction);
  }
  else if (ev.type === 'stroke') { if (!mine || ev.id !== mine.id) upsert({ id: ev.id, by: ev.by, pts: ev.pts || [] }); }
  else if (ev.type === 'landmark') { if (B.validLandmark(ev)) setLandmarks(B.upsertById(landmarks, landmarkOf(ev))); }
  else if (ev.type === 'instruction') onInstruction(ev);
  else if (ev.type === 'reveal') reveal = B.cleanReveal(ev.upto);
  // Clear resets the reveal too (#111). Undo needs nothing here: the relay clamps upto and sends a sync right after.
  else if (ev.type === 'clear') { arrivals.clear(); reveal = null; setStrokes(mine ? [mine] : []); setLandmarks([]); caption = null; }
  else if (ev.type === 'finger') onFinger(ev);
  else if (ev.type === 'haptic') {
    const h = reports.haptic(ev);
    // An accepted vibrate() replaces the rest of the previous pattern, so its unstarted rings go too.
    if (h) rings = B.dropPending(rings, now);
    if (h && h.kind === 'landmark') onLandmarkCue(h, now);
    spawnRings(haptics.onHaptic(h, now), now);
  }
  else if (ev.type === 'spoken') onSpoken(ev);
  else if (ev.type === 'phoneconfig') feltMm = B.feltFromConfig(ev, feltMm);
};

let prevFrame = performance.now();
function frame(now) {
  const dt = Math.min(100, now - prevFrame);
  prevFrame = now;
  showStatus(now);
  const rv = revealNow();
  showReveal(rv);

  if (finger.down && finger.last && finger.cur) {
    finger.cur.x = B.follow(finger.cur.x, finger.last.x, dt, CURSOR_TAU_MS);
    finger.cur.y = B.follow(finger.cur.y, finger.last.y, dt, CURSOR_TAU_MS);
    trail.push({ x: finger.cur.x, y: finger.cur.y, t: now });
  }
  spawnRings(haptics.tick(now), now);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = COL.surround;
  ctx.fillRect(0, 0, c.width, c.height);
  const s = view.scale * dpr;
  ctx.setTransform(s, 0, 0, s, view.x * dpr, view.y * dpr);
  roundRect(0, 0, BOARD.w, BOARD.h, 3);
  ctx.fillStyle = COL.paper;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.lineCap = ctx.lineJoin = 'round';
  drawTrail(now);
  drawInk(now, rv);
  ctx.restore();
  drawLandmarks(rv);
  drawPending();
  // Rings, cursor and caption may spill past the paper edge onto the surround instead of being cut off.
  drawRings(now);
  drawCursor(now);
  drawCaption(now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
