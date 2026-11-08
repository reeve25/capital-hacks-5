// FeelInk phone, the touch surface: Live and the /dev practice and blind test that share it. Haptics, speech priority,
// the renderer, relay events in and posts out, touch and gestures, and the page-lifecycle stops. Loaded first.

const { BOARD, SHAPES, Renderer, poster, sendQueue, drawingKey, doubleTapper, landmarkLine, startMark, replayLine, landmarkVoice, speechCut,
  revealUpto, nextSeq, revealed, revealChanged, changeLine } = Tactile;
const $ = (id) => document.getElementById(id);
const canvas = $('board'), ctx = canvas.getContext('2d');
const SCREEN_WIDTH_MM = 64.6; // Pixel 8: 6.2 in at 20:9, calculated from the spec, not measured.
const TRIALS = 5;

// Haptics. No amplitude control in the web API, so shorter, sparser pulses stand in for a weaker buzz.
// The line is one long hold: re-arming an 800 ms hold every 600 ms restarted the motor each time, which
// Reeve felt as ringing (Nov 7). Android plays buzzes over 1 s at the Media vibration intensity, so keep it
// at max: at 3 the 5 s hold played at 100%, at 1 a 2 s buzz played at 51% (dumpsys vibrator_manager).
const HOLD_MS = 5000, TICK_MS = 25;
const FADE = [[12, 60], [20, 35], [30, 15]] // [on, off] ms per fade step, faintest first
  .map(([on, off]) => Array.from({ length: 24 }, (_, i) => (i % 2 ? off : on)));
// Corner and end are even trains of 30 ms pulses that differ only in count.
const NODE = { corner: [30, 40, 30], end: [30, 30, 30, 30, 30] };
// A landmark is a state, not a one-off cue. Two cues blended into the line hold when the landmark sat on the path
// (long-short, then Reeve at 15:33; then 1 ms + 150 ms silence + two 200 ms buzzes, Reeve at 16:23 on the Pixel,
// as the lead relayed it: "the landmark cue still blends with the line when the landmark sits on the path; arriving
// must be unmistakable"). The lead's spec: on arrival the hold stops (a 1 ms call; Chrome ignores 0), 400 ms of
// silence while the name starts, then three 220 ms pulses 130 ms apart, the only triple of long pulses; then, while
// the finger stays on the landmark, no line hum at all, only a 70 ms heartbeat every 1200 ms. The first beat comes
// a beat's silence (1130 ms) after the triple. Leaving hands back to setBuzz. Not yet felt on the Pixel.
const MARK = { quietMs: 400, cue: [220, 130, 220, 130, 220], beatMs: 70, everyMs: 1200 };
let level = 0, rearm = null, resume = null, atMark = null; // atMark: the landmark the finger is resting on
const canVibrate = typeof navigator.vibrate === 'function';

// Landmark names and short status lines in the browser's own voice. Chrome speaks only after a user gesture on the
// page; the Connect tap is one, and it lasts. Without speechSynthesis, or if it throws, the buzz alone marks a
// landmark and nothing is reported as spoken.
// Who cuts whom is tactile.js speechCut: a name is about where the finger is now, so it cuts off anything still
// talking, but a tutor's instruction it cuts is said again right after it (#107). An instruction or a status line
// never cuts off another kind (it waits behind it), only an older line of its own kind. The stage gets
// {type:'spoken', text, kind, t} (plus the instruction's id) from onend, so its log shows what the phone finished
// saying, not what it asked for; speech that was cut off is never sent.
// Each utterance stays referenced until it ends: Chrome can collect an unreferenced one and never fire onend.
const canSpeak = typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance === 'function';
const talking = new Set();
let lastSaid = null; // what a two-finger double tap repeats when the tutor has sent no instruction
// The tutor's latest instruction {id, text} from the relay (#107), and the id last said through to its end.
let instruction = null, instructionDone = null;
function hush() {
  for (const u of talking) u.cut = true;
  talking.clear();
  if (canSpeak) try { speechSynthesis.cancel(); } catch {}
}
function speak(text, kind, id) {
  const u = new SpeechSynthesisUtterance(text);
  u.kind = kind;
  u.lineId = id;
  u.onend = () => {
    talking.delete(u);
    if (u.cut) return;
    if (kind === 'instruction') instructionDone = id;
    haptics.push({ type: 'spoken', text, kind, ...(id ? { id } : {}), t: Date.now() });
  };
  u.onerror = () => { talking.delete(u); };
  talking.add(u);
  speechSynthesis.speak(u);
}
function say(text, kind, id) {
  if (!text) return;
  lastSaid = { text, kind, id };
  if (!canSpeak) return;
  try {
    const queued = [...talking];
    const plan = speechCut(queued.map((u) => u.kind), kind);
    const again = queued[plan.resay];
    if (plan.cancel) hush();
    speak(text, kind, id);
    if (again) speak(again.text, again.kind, again.lineId);
  } catch {}
}
// An instruction is said once: on arrival in Live, on entering Live, or after a reconnect's sync. Every undo sends a
// sync too, so the id guards against saying it again; the student asks for a repeat with a two-finger double tap.
function sayInstructionIfNew() {
  if (mode !== 'live' || !instruction) return;
  if (instruction.id === instructionDone || [...talking].some((u) => u.lineId === instruction.id)) return;
  say(instruction.text, 'instruction', instruction.id);
}
function onInstruction(ins) {
  const text = ins && typeof ins.text === 'string' ? ins.text.replace(/\s+/g, ' ').trim() : '';
  if (!text) return;
  instruction = { id: String(ins.id), text };
  sayInstructionIfNew();
}

// In live mode every call is reported to the stage, re-arms included, so a take can be matched against
// dumpsys vibrator_manager. Chrome plays a pattern as one platform vibration per on-step (measured Nov 7).
// `extra` adds fields, such as a landmark's name for the stage caption.
function vibrate(kind, pattern, extra) {
  const ok = navigator.vibrate(pattern);
  if (mode === 'live') haptics.push({ type: 'haptic', kind, ...extra, level, top: renderer.top, pattern: [].concat(pattern), ok, t: Date.now() });
}

function setBuzz(next) {
  level = next;
  clearTimeout(rearm);
  clearTimeout(resume);
  if (!canVibrate) return;
  if (next === renderer.top) {
    vibrate('hold', HOLD_MS);
    rearm = setTimeout(() => setBuzz(next), HOLD_MS * 0.9);
  } else if (next > 0) {
    const pattern = FADE[next - 1];
    vibrate('fade', pattern);
    rearm = setTimeout(() => setBuzz(next), pattern.reduce((a, b) => a + b, 0) * 0.75);
  } else {
    // Chrome on the Pixel 8 ignores vibrate(0): a 2 s buzz ran to the end (dumpsys vibrator_manager, Nov 7).
    // A new call does replace the running one, so a 1 ms buzz is the stop.
    vibrate('stop', 1);
  }
}

function apply(cmd) {
  // Off the landmark (moved away, lifted, or it was removed) the line comes back, unless the command that comes
  // with it starts a cue of its own. The renderer keeps its node across a resent scene by value, so compare by value.
  if (atMark && !stillAtMark()) { leaveMark(); if (!cmd || cmd.type === 'tick') return setBuzz(renderer.level); }
  if (!cmd) return;
  if (cmd.type === 'node' && cmd.kind === 'landmark') return enterMark(cmd);
  if (atMark) { if (cmd.type === 'level') level = cmd.level; return; } // on a landmark: only its heartbeat
  if (cmd.type === 'level') return setBuzz(cmd.level);
  if (cmd.type === 'tick') { clearTimeout(rearm); stopGuide(); if (canVibrate) vibrate('tick', TICK_MS); return; }
  if (cmd.type === 'node') {
    const pattern = NODE[cmd.kind];
    clearTimeout(rearm);
    clearTimeout(resume);
    level = cmd.level;
    if (canVibrate) vibrate(cmd.kind, pattern);
    // When the cue ends, back to the hold: corners and ends fire only on the line.
    // Any level change before then goes through setBuzz, which cancels this.
    resume = setTimeout(() => { if (renderer.level > 0) setBuzz(renderer.level); }, pattern.reduce((a, b) => a + b, 0));
  }
}
function stillAtMark() {
  const n = renderer.node;
  return !!n && n.kind === 'landmark' && n.id === atMark.id && n.x === atMark.x && n.y === atMark.y && n.name === atMark.name;
}
// The name is not said again when the finger comes back to the same landmark within 3 s of leaving it (#107): the
// 5 mm leave edge stops a resting finger repeating it, and this stops a finger wobbling across that edge, or lifting
// and landing on it again, from hearing it over and over. The buzzes still play every time.
const voice = landmarkVoice({ reMs: 3000 });
const markKey = (n) => n.id + '|' + n.name;
function leaveMark() { voice.leave(markKey(atMark), performance.now()); atMark = null; }
// Arrival: stop, the name ("Start: <name>" on the tutor's start point), silence, the triple, then the heartbeat for
// as long as the finger stays. The whole chain runs on `rearm`, so setBuzz (leaving) or another arrival cancels it.
// A quiet arrival's buzz report carries no name, so the stage shows no caption for words the phone did not say.
function enterMark(cmd) {
  clearTimeout(rearm);
  clearTimeout(resume);
  atMark = renderer.node;
  level = cmd.level;
  const named = !!cmd.name && voice.enter(markKey(atMark), performance.now());
  if (canVibrate) vibrate('stop', 1);
  if (named) say(landmarkLine(cmd.name, cmd.start), 'landmark');
  if (!canVibrate) return;
  const beat = () => { vibrate('landmark-rest', MARK.beatMs); rearm = setTimeout(beat, MARK.everyMs); };
  rearm = setTimeout(() => {
    vibrate('landmark', MARK.cue, named ? { name: cmd.name } : undefined);
    rearm = setTimeout(beat, MARK.cue.reduce((a, b) => a + b, 0) + MARK.everyMs - MARK.beatMs);
  }, MARK.quietMs);
}

// Guide back to the line. A blind student's critique: "once a finger slips off the line, there is no way to know which
// direction to search." While the finger is down off the ink (level 0, past the fade band), on no label, and has been
// off for OFF_MS: one 15 ms tap, then the next renderer.guideAt ms after it, read again from the latest finger position
// at every tap and every move, so the cadence quickens as the finger nears the closest line (tactile.js
// guideInterval). Over 20 mm from any ink it is silent, and the tutor talks. It runs only while nothing else buzzes:
// any level above 0, a label, a lift or leaving Live stops it, and a tick (the finger just crossed a line) restarts the
// wait. Live only, so the /dev blind test keeps its protocol. Chosen values, not yet felt on the Pixel.
const GUIDE_MS = 15, OFF_MS = 600;
let guideOn = true; // the Advanced setting, read at setup below
let guideTimer = null, guideDue = 0, offSince = null, lastGuide = -Infinity;
const offInk = () => canVibrate && guideOn && mode === 'live' && primary !== null && !!fingerAt && level === 0 && !renderer.node && !atMark;
function stopGuide() { clearTimeout(guideTimer); guideTimer = null; offSince = null; }
// Call after anything that can move the finger or the ink; `fire` is the timer's own call, which taps first.
function guide(fire) {
  if (!offInk()) return stopGuide();
  const now = performance.now();
  if (offSince === null) offSince = now;
  const every = renderer.guideAt(fingerAt);
  if (every === null) { clearTimeout(guideTimer); guideTimer = null; return; } // too far: silent, though still off the line
  if (fire) { lastGuide = now; vibrate('guide', GUIDE_MS); }
  // A finger moving closer brings the next tap forward; one moving away waits for the tap already coming.
  const due = Math.max(offSince + OFF_MS, lastGuide + every);
  if (guideTimer && due >= guideDue) return;
  clearTimeout(guideTimer);
  guideDue = due;
  guideTimer = setTimeout(() => { guideTimer = null; guide(true); }, due - now);
}

// Board placement: same millimetre scale as the screen, centred.
let pxPerMm = 6.4, originX = 0, originY = 0;
function layout() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  pxPerMm = innerWidth / SCREEN_WIDTH_MM;
  originX = (innerWidth - BOARD.w * pxPerMm) / 2;
  originY = (innerHeight - BOARD.h * pxPerMm) / 2;
  draw();
}
const toMm = (e) => ({ x: (e.clientX - originX) / pxPerMm, y: (e.clientY - originY) / pxPerMm });
const toPx = (p) => [originX + p.x * pxPerMm, originY + p.y * pxPerMm];

// App state
let mode = 'home', strokes = [], remote = [], remoteMarks = [], path = [], showInk = false;
// Step-through reveal (#111): `reveal` is the relay's upto (null shows everything). Hidden strokes and landmarks are
// blank glass: the renderer, "Drawing changed." and the start point all work from what is shown.
let reveal = null;
const shownNow = () => revealed(remote, remoteMarks, reveal);
const shownKey = () => { const v = shownNow(); return drawingKey(v.strokes, v.landmarks); };
let renderer = new Renderer({});
let queueShapes = [], current = null, startedAt = null, results = [];
let fingers = new Map(), primary = null, pen = null;

function widthMm() { return Number($('width').value); }
// One setting: the fade follows the core. The lead's call under Reeve's "fade should change with the core width"
// (Nov 7 16:21): 1.5 x the core, rounded, kept to 2-8 mm, so the default core 4 mm gives the tuned 6 mm (#33).
function fadeMm() { return Math.min(8, Math.max(2, Math.round(widthMm() * 1.5))); }
function makeRenderer() {
  renderer = new Renderer({ halfWidth: widthMm() / 2, fade: fadeMm(), steps: FADE.length });
  renderer.setStrokes(strokes);
  renderer.setLandmarks(mode === 'live' ? shownNow().landmarks : []); // only the tutor's board has landmarks
}

function drawPoly(pts, style, width) {
  if (!pts.length) return;
  ctx.strokeStyle = style;
  ctx.lineWidth = width;
  ctx.lineCap = ctx.lineJoin = 'round';
  ctx.beginPath();
  pts.forEach((p, i) => { const [x, y] = toPx(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
  ctx.stroke();
}

function draw() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  if (showInk) strokes.forEach((s) => drawPoly(s.pts, 'rgba(43, 179, 163, 0.25)', (widthMm() + 2 * fadeMm()) * pxPerMm));
  if (showInk) strokes.forEach((s) => drawPoly(s.pts, '#2bb3a3', widthMm() * pxPerMm));
  if (mode === 'reveal') { drawPoly(path, '#1b222b', 7); drawPoly(path, '#ffb020', 3); }
}

function show(panel) {
  ['home', 'reveal', 'done'].forEach((id) => { $(id).hidden = id !== panel; });
}
function hint(text) { $('hint').hidden = !text; $('hint').textContent = text || ''; $('hint').dataset.mode = mode; }

// Network: the finger position is latest-only, so a slow network drops samples rather than lagging.
let es = null, pendingFinger = null, fingerBusy = false;
// Every POST gives up after 3 s and counts an HTTP error as a failure, so a stalled relay frees the finger
// sender for the newest sample and the queues retry.
const post = poster('/event');
// Haptic reports queue instead, so a quick tick or corner is never overwritten. 200 waiting is about a minute
// at the 2-4 reports a second that buzzing makes, and a few seconds to flush once the link is back.
// Stamped: a unique t lets the stage skip a retried duplicate, age lets it skip a buzz that waited too long to
// draw live, and dropped tells it reports were lost, so the take is incomplete.
const haptics = sendQueue(post, { cap: 200, stamp: true });
// Only the newest config matters: one in flight plus the latest waiting. `live` tells the stage whether the student
// can feel the board (#107): a config from the menu is not presence, and leaving Live sends one at once.
const configs = sendQueue(post, { cap: 1 });
const sendConfig = () => configs.push({ type: 'phoneconfig', live: mode === 'live', coreMm: widthMm(), fadeMm: fadeMm(), steps: FADE.length, screenWidthMm: SCREEN_WIDTH_MM });
// A phone stroke is re-posted whole on every move, so a failed post is caught and counted like the queues'
// `failed`, not retried: the next move resends it, and only a failed last post loses the stroke's tail.
let strokeFailed = 0;
function sendFinger(msg) {
  pendingFinger = msg;
  if (fingerBusy) return;
  fingerBusy = true;
  const m = pendingFinger;
  pendingFinger = null;
  post(m).catch(() => {}).finally(() => { fingerBusy = false; if (pendingFinger) sendFinger(pendingFinger); });
}
// "Drawing changed." once the tutor has paused for 1.5 s, so a stroke being drawn (re-posted on every move) is one
// change, not one per move. `heard` is the drawing as the student was last told it, so a change undone within the
// pause, or a reconnect's sync of the same board, says nothing. The student's own two-finger stroke is their doing:
// it is absorbed unless a tutor change is already waiting. With no baseline yet (Live opened before the link), the
// first sync is the starting drawing. A change that leaves nothing to feel says "Drawing cleared." (tactile.js changeLine).
const CHANGE_MS = 1500;
let heard = null, changeTimer = null, synced = false;
function noteDrawing(ev) {
  if (heard === null || (ev.type === 'stroke' && ev.by === 'phone' && !changeTimer)) { heard = shownKey(); return; }
  clearTimeout(changeTimer);
  changeTimer = setTimeout(() => {
    changeTimer = null;
    const now = shownKey(), line = changeLine(heard, now);
    if (line) { heard = now; say(line, 'status'); }
  }, CHANGE_MS);
}
// "Drawing updated." when a reveal changes what the student can feel (#111): said at once, as a status line, and it
// stands in for "Drawing changed." on that change (heard moves on, a waiting one is dropped), so the student never
// hears both. With no baseline yet the reveal is part of the starting drawing, as a first sync is above.
function noteReveal() {
  clearTimeout(changeTimer);
  changeTimer = null;
  const first = heard === null;
  heard = shownKey();
  if (!first) say('Drawing updated.', 'status');
}
function connect() {
  if (es) return;
  es = new EventSource('/events');
  es.onopen = () => setLink('on');
  es.onerror = () => {
    setLink(link === 'on' || link === 'lost' ? 'lost' : 'waiting');
    // EventSource retries a dropped link by itself but gives up for good on a bad reply; start over then.
    if (es.readyState === EventSource.CLOSED) { es = null; setTimeout(connect, 2000); }
  };
  es.onmessage = (m) => {
    const ev = JSON.parse(m.data);
    const was = reveal;
    // A sync carries the relay's reveal (absent means all shown) and each item's seq; after Undo or Clear it is the
    // relay's word, so it is trusted as is. Live events carry no seq: a new item goes after the highest known one and
    // an update keeps its own.
    if (ev.type === 'sync') { remote = ev.strokes; remoteMarks = ev.landmarks || []; reveal = revealUpto(ev.reveal); synced = true; if (ev.instruction) onInstruction(ev.instruction); }
    else if (ev.type === 'stroke') {
      const i = remote.findIndex((s) => s.id === ev.id);
      const item = { ...ev, seq: i >= 0 ? remote[i].seq : nextSeq(remote, remoteMarks) };
      if (i >= 0) remote[i] = item; else remote.push(item);
    } else if (ev.type === 'landmark') {
      const i = remoteMarks.findIndex((l) => l.id === ev.id);
      const item = { ...ev, seq: i >= 0 ? remoteMarks[i].seq : nextSeq(remote, remoteMarks) };
      if (i >= 0) remoteMarks[i] = item; else remoteMarks.push(item);
    } else if (ev.type === 'clear') { remote = []; remoteMarks = []; reveal = null; } // the relay resets the reveal too
    else if (ev.type === 'reveal') reveal = revealUpto(ev.upto);
    else if (ev.type === 'instruction') return onInstruction(ev);
    else return;
    // A reveal that changes nothing the student can feel (the same upto again, a step past the end) is no event.
    const updated = revealChanged(remote, remoteMarks, was, reveal);
    if (ev.type === 'reveal' && !updated) return;
    if (mode === 'live') {
      const shown = shownNow();
      strokes = shown.strokes;
      renderer.setStrokes(strokes);
      renderer.setLandmarks(shown.landmarks);
      // A part hidden under a resting finger goes quiet exactly as if the finger had moved off it.
      apply(renderer.refresh());
      guide();
      draw();
      if (updated) noteReveal(); else noteDrawing(ev);
    }
  };
}

// Modes
function startPractice() {
  mode = 'practice'; showInk = true; show(null);
  const names = Object.keys(SHAPES);
  let i = 0;
  const next = () => { strokes = SHAPES[names[i++ % names.length]]; makeRenderer(); hint('Eyes open. Two-finger tap: next shape. Hold 2 fingers 1 s: back.'); draw(); };
  practiceNext = next;
  next();
}
let practiceNext = null;

function shuffled(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function startTest() {
  mode = 'test'; showInk = false; results = []; show(null);
  // One open square at most, with a random open side, so the test includes the missing-connection task.
  const closed = ['square', 'triangle', 'circle', 'plus', 'T', 'L', 'Z'];
  const open = shuffled(['open at top', 'open at right', 'open at bottom', 'open at left'])[0];
  queueShapes = shuffled(shuffled(closed).slice(0, TRIALS - 1).concat(open));
  nextTrial();
}
function nextTrial() {
  if (!queueShapes.length) return finishTest();
  current = queueShapes.pop();
  strokes = SHAPES[current];
  makeRenderer();
  path = []; startedAt = null; mode = 'test';
  show(null);
  hint(`Shape ${results.length + 1} of ${TRIALS}. Eyes closed. Explore, say the shape, then two-finger tap.`);
  draw();
}
function endTrial() {
  apply(renderer.lift());
  setBuzz(0);
  const ms = startedAt ? Math.round(performance.now() - startedAt) : 0;
  current = { name: current, ms };
  mode = 'reveal'; showInk = true; hint(''); show('reveal');
  $('reveal').style.background = 'transparent';
  $('rtitle').textContent = current.name;
  $('rtime').textContent = `${(ms / 1000).toFixed(1)} s from first touch`;
  draw();
}
function mark(correct) {
  const rec = { who: $('who').value, shape: current.name, ms: current.ms, correct, widthMm: widthMm(), fadeMm: fadeMm(), pathMm: Math.round(pathLen()) };
  results.push(rec);
  fetch('/log', { method: 'POST', body: JSON.stringify(rec) }).catch(() => {});
  showInk = false;
  nextTrial();
}
function pathLen() { let d = 0; for (let i = 1; i < path.length; i++) d += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y); return d; }
function finishTest() {
  mode = 'done'; hint(''); show('done'); draw();
  const right = results.filter((r) => r.correct).length;
  const times = results.map((r) => r.ms).sort((a, b) => a - b);
  const median = times[Math.floor(times.length / 2)] / 1000;
  $('summary').innerHTML = `${right} of ${results.length} right. Median ${median.toFixed(1)} s.<br>` + results.map((r) => `${r.correct ? 'Right' : 'Wrong'}: ${r.shape}, ${(r.ms / 1000).toFixed(1)} s`).join('<br>');
}
// Live is a pure black surface with nothing on it: the spoken welcome replaced the old dim hint line (#90).
function startLive() {
  mode = 'live'; showInk = false; show(null);
  connect();
  strokes = shownNow().strokes;
  makeRenderer();
  sendConfig();
  draw();
  heard = synced ? shownKey() : null;
  welcomed = link === 'on';
  say(welcomed ? WELCOME : linkLine(link), 'status');
  sayInstructionIfNew(); // waits behind the welcome
  // Android Back returns to the menu: Live is its own history entry.
  if (!(history.state && history.state.feelLive)) history.pushState({ feelLive: true }, '');
}
// Every way out of Live (the 3-finger hold, leaving fullscreen) pops that entry, so Back never lands on a stale one.
function leaveLive() { if (history.state && history.state.feelLive) history.back(); else goHome(); }
function goHome() {
  const wasLive = mode === 'live';
  apply(renderer.lift()); stopGuide(); setBuzz(0); // before leaving live mode, so the stage hears the stop
  clearTimeout(changeTimer); changeTimer = null;
  mode = 'home'; hint(''); showInk = false; strokes = []; show('home'); draw();
  if (wasLive) { hush(); say('Back to menu.', 'status'); sendConfig(); leftLive = true; showLink(); }
}
addEventListener('popstate', () => { if (mode === 'live') goHome(); });
// Chrome on Android may spend a Back press in fullscreen on leaving fullscreen only, without touching history
// (reasoned, not seen on the Pixel). So a fullscreen exit in a visible Live page counts as Back, after 300 ms in
// which a real popstate would already have taken the page home; waiting avoids popping history twice.
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement || mode !== 'live' || document.hidden) return;
  setTimeout(() => { if (mode === 'live' && !document.fullscreenElement) leaveLive(); }, 300);
});

// Touch
let fingerAt = null; // the feeling finger's last board position
function feel(p) { fingerAt = p; apply(renderer.move(p)); guide(); }
// Two fingers draw only once the feeling finger has moved 3 mm, so a two-finger tap (which barely moves) leaves no
// ink. The stroke then starts where the finger was when the second finger landed, so no ink is lost.
const DRAW_START_MM = 3;
let penFrom = null;
// A two-finger double tap in Live repeats the tutor's instruction, led by the start point if one is marked, or with
// no instruction the last thing said (#107). A touch runs from the first finger down to the last one up;
// doubleTapper decides from whole touches (tactile.js).
const isDoubleTap = doubleTapper();
let touch = null;
function repeatLast() {
  const line = replayLine(instruction, startMark(shownNow().landmarks), lastSaid); // a hidden start point is not named
  if (line) say(line.text, line.kind, line.id);
}
// Chrome's long-press fires a click about 0.5 s into a resting touch, and that click replaced the 5 s hold
// (measured on the Pixel, Nov 7: 11 of 11 held touches lost the buzz after about 0.3 s). Cancelling touchstart
// stops the click and the compatibility mouse events; pointer events still fire. touch-action alone did not.
canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  canvas.setPointerCapture(e.pointerId);
  fingers.set(e.pointerId, performance.now());
  if (fingers.size === 1) touch = { start: performance.now(), fingers: 1, drew: false };
  else if (touch) touch.fingers = Math.max(touch.fingers, fingers.size);
  if (primary === null) {
    primary = e.pointerId;
    if (mode === 'test' && startedAt === null) startedAt = performance.now();
    const p = toMm(e);
    if (mode === 'test') path.push(p);
    feel(p);
    if (mode === 'live') sendFinger({ type: 'finger', x: p.x, y: p.y, down: true, pen: false, level });
  } else if (mode === 'live' && !pen && fingers.size === 2) {
    penFrom = fingerAt;
  }
  checkGestures();
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerId !== primary) return;
  e.preventDefault();
  const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
  for (const ev of events.length ? events : [e]) {
    const p = toMm(ev);
    if (mode === 'test') path.push(p);
    feel(p);
    if (penFrom && !pen && Math.hypot(p.x - penFrom.x, p.y - penFrom.y) >= DRAW_START_MM) {
      pen = { id: 'phone-' + Date.now(), by: 'phone', pts: [penFrom] };
      if (touch) touch.drew = true;
    }
    if (pen) pen.pts.push(p);
  }
  if (mode === 'live') {
    const p = toMm(e);
    sendFinger({ type: 'finger', x: p.x, y: p.y, down: true, pen: !!pen, level });
    if (pen && pen.pts.length) post({ type: 'stroke', ...pen, pts: pen.pts }).catch(() => { strokeFailed++; });
  }
});
function release(e) {
  const heldFor = performance.now() - (fingers.get(e.pointerId) ?? 0);
  const countBefore = fingers.size;
  fingers.delete(e.pointerId);
  clearTimeout(backTimer);
  if (mode === 'test' && countBefore >= 2 && heldFor < 700) { primary = null; fingers.clear(); return endTrial(); }
  if (mode === 'practice' && countBefore >= 2 && heldFor < 700) { fingers.clear(); primary = null; apply(renderer.lift()); return practiceNext(); }
  if (fingers.size < 2) { pen = null; penFrom = null; }
  if (e.pointerId === primary) {
    primary = null;
    apply(renderer.lift());
    stopGuide();
    if (mode === 'live') sendFinger({ type: 'finger', down: false, level });
  }
  if (!fingers.size && touch) {
    const done = { ...touch, end: performance.now() };
    touch = null;
    if (mode === 'live' && isDoubleTap(done)) repeatLast();
  }
}
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);

let backTimer = null;
function checkGestures() {
  clearTimeout(backTimer);
  if ((mode === 'practice' && fingers.size === 2) || (mode === 'live' && fingers.size === 3)) {
    backTimer = setTimeout(() => { fingers.clear(); primary = null; pen = null; penFrom = null; touch = null; if (mode === 'live') leaveLive(); else goHome(); }, 1000);
  }
}

// Setup, Live's part: its history mark and the page-lifecycle stops. The home screen's setup is in feel-home.js.
// A reload keeps the history entry Live pushed; drop its mark so the menu doesn't count as Live.
if (history.state && history.state.feelLive) history.replaceState(null, '');
// A hidden page must not keep re-arming the hold. Chrome refuses vibrate() once the page is hidden
// (Blink checks visibility before the visibilitychange event runs), so that stop may report ok: false.
// Lifting the renderer makes the next touch buzz again. A hidden page stops talking too.
function stopForHide() { renderer.lift(); if (atMark) leaveMark(); stopGuide(); setBuzz(0); hush(); }
document.addEventListener('visibilitychange', () => { if (document.hidden) stopForHide(); });
addEventListener('pagehide', stopForHide);
// "Guide back to the line" in Advanced settings: on unless turned off, kept on this phone like the line width. Wired
// here beside the guide it switches; feel-home.js's store loads after this file, so the storage calls are its own.
try { guideOn = localStorage.getItem('fi.guide') !== 'off'; } catch {}
$('guide').checked = guideOn;
$('guide-help').hidden = !guideOn; // the home screen's help line about the taps, only while there are taps
$('guide').onchange = () => {
  guideOn = $('guide').checked;
  $('guide-help').hidden = !guideOn;
  try { localStorage.setItem('fi.guide', guideOn ? 'on' : 'off'); } catch {}
  if (!guideOn) stopGuide();
};
// The relay replays only the drawing (strokes and landmarks), so the config repeats; 2 s is a chosen default, not measured. Doubles as presence.
setInterval(() => { if (mode === 'live' && !document.hidden) sendConfig(); }, 2000);
addEventListener('resize', layout);
