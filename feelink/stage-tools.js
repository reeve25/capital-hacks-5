// FeelInk stage, left panel (the tutor's tools) and the tutor's input on the board: Draw/Landmark, the pen and Shift line,
// the name box and start point, Undo/Clear and its toast, the reveal stepper, hints, keys and buttons.

// Tutor input: pointer on the board, smoothed before sending so phone and stage share one geometry.
let raw = [], lastSend = 0;
let mine = null; // the tutor's stroke in progress; the relay's sync and clear keep it (stage-relay.js)
const boardPoint = (e) => B.clampToBoard(B.toMm(view, e.clientX, e.clientY), BOARD);
function inBoard(e) {
  const p = B.toMm(view, e.clientX, e.clientY);
  return p.x >= -2 && p.y >= -2 && p.x <= BOARD.w + 2 && p.y <= BOARD.h + 2;
}
function sendMine() { post({ type: 'stroke', ...mine }); lastSend = performance.now(); }
// Placing a landmark: L (or the Landmark button) arms it, the next click on the board opens the name box there
// (or on the point clicked, to rename it). Enter posts it, Escape or clicking away cancels. Then back to Draw.
const nameBox = document.getElementById('name'), nameWrap = document.getElementById('namebox'), nameStart = document.getElementById('nameStart');
const hint = document.getElementById('hint');
const toolDraw = document.getElementById('toolDraw'), toolMark = document.getElementById('toolMark');
const HINT_DRAW = 'Hold <kbd>Shift</kbd> for a straight line.';
const HINT_PLACE = 'Click the board to place a point, or click a point to rename it. <kbd>Esc</kbd> cancels.';
// The reveal group's line. While something is hidden (#111), a new stroke arrives last and stays hidden until revealed.
const STEP_HIDING = 'Dashed strokes are hidden from the student. New ones stay hidden until revealed.';
const STEP_READY = 'Press <kbd>P</kbd> to hide the last stroke, then <kbd>N</kbd> to bring it back.';
// What a step key that changes nothing says, for NOTE_MS. Reveal next never hides the drawing (board.js revealStep).
const NOTES = { all: 'Everything is shown. Press <kbd>P</kbd> to step back.',
  none: 'Nothing is shown yet. Press <kbd>N</kbd> to reveal the first stroke.',
  empty: 'Draw first, then reveal it one stroke at a time.' };
const NOTE_MS = 3500;
const stepNote = document.getElementById('stepNote');
let placing = false, straight = false, pending = null; // pending: {id, x, y} while the name box is open
let note = '', noteTimer = 0, hiding = false, steps = 0, hintHtml = '', stepHtml = '';
function renderHint() {
  const html = placing ? HINT_PLACE : HINT_DRAW;
  if (html !== hintHtml) { hintHtml = html; hint.innerHTML = html; } // aria-live: only real changes are announced
  hint.classList.toggle('on', straight && !placing);
  const step = note ? NOTES[note] : hiding ? STEP_HIDING : steps > 0 ? STEP_READY : NOTES.empty;
  if (step !== stepHtml) { stepHtml = step; stepNote.innerHTML = step; }
}
function flashNote(key) {
  clearTimeout(noteTimer);
  note = key;
  renderHint();
  if (key) noteTimer = setTimeout(() => { note = ''; renderHint(); }, NOTE_MS);
}
function setPlacing(on) {
  placing = on;
  document.body.classList.toggle('placing', on);
  toolDraw.setAttribute('aria-pressed', String(!on));
  toolMark.setAttribute('aria-pressed', String(on));
  renderHint();
}
// Shift held: the stroke in progress becomes the straight line from its first point (#92), redrawn and re-sent
// at once, so the phone never feels the freehand wobble. Releasing Shift goes back to freehand.
function setStraight(on) {
  if (on === straight) return;
  straight = on;
  renderHint();
  if (mine) { mine = { ...mine, pts: B.strokePoints(raw, straight) }; upsert(mine); sendMine(); }
}
setPlacing(false);
function openName(p, existing) {
  pending = existing ? { id: existing.id, x: existing.x, y: existing.y } : { id: 'mark-' + Date.now(), x: p.x, y: p.y };
  const px = view.x + pending.x * view.scale, py = view.y + pending.y * view.scale;
  nameWrap.style.left = Math.max(8, Math.min(innerWidth - 228, px + 14)) + 'px';
  nameWrap.style.top = Math.max(8, Math.min(innerHeight - 76, py - 22)) + 'px';
  nameBox.value = existing ? existing.name || '' : '';
  nameStart.checked = !!(existing && existing.start);
  nameWrap.style.display = 'block';
  // After the click finishes, so the click's own focus change cannot pull focus back off the box.
  setTimeout(() => { if (pending) { nameBox.focus(); nameBox.select(); } }, 0);
}
function closeName(save) {
  if (!pending) return;
  const name = B.cleanName(nameBox.value);
  if (save && name) {
    const mark = { type: 'landmark', id: pending.id, x: +pending.x.toFixed(2), y: +pending.y.toFixed(2), name, by: 'tutor',
      ...(nameStart.checked ? { start: true } : {}) };
    setLandmarks(B.upsertById(landmarks, mark));
    post(mark);
    if (mark.start) setStart(mark.id, true); // unmarks any other start point
  }
  pending = null;
  nameWrap.style.display = 'none';
  if (nameWrap.contains(document.activeElement)) document.activeElement.blur();
}
nameWrap.addEventListener('keydown', (e) => {
  e.stopPropagation();
  if (e.key === 'Enter') closeName(true);
  else if (e.key === 'Escape') closeName(false);
});
// Leaving the box saves it, as before; moving between the name and the checkbox does not.
nameWrap.addEventListener('focusout', (e) => { if (!nameWrap.contains(e.relatedTarget)) closeName(true); });
// A click on the checkbox's label would blur the name first and close the box; keep focus in the name instead.
nameWrap.querySelector('label').addEventListener('mousedown', (e) => e.preventDefault());

// The start point (#107): one at a time, so marking one unmarks any other. A change is the landmark re-posted with its
// id, so it keeps its place in the undo order, as a rename does. S toggles it on the point nearest the pointer.
const START_PICK_MM = 10;
let pointerAt = null; // the mouse over the page, client px
function setStart(id, on) {
  const changed = landmarks.filter((l) => !!l.start !== (on && l.id === id)).map((l) => {
    const { start, ...rest } = landmarkOf(l);
    return { type: 'landmark', ...rest, ...(on && l.id === id ? { start: true } : {}) };
  });
  for (const mark of changed) { setLandmarks(B.upsertById(landmarks, mark)); post(mark); }
}
function toggleStartNear() {
  if (!pointerAt) return;
  const l = B.landmarkAt(landmarks, B.toMm(view, pointerAt.x, pointerAt.y), START_PICK_MM);
  if (l) setStart(l.id, !l.start);
}

c.addEventListener('pointerdown', (e) => {
  if (pending) { closeName(true); return; }
  if (placing) {
    setPlacing(false);
    if (!inBoard(e)) return;
    const p = boardPoint(e);
    openName(p, B.landmarkAt(landmarks, p));
    e.preventDefault(); // keep focus in the name box
    return;
  }
  if (!inBoard(e) || mine) return;
  c.setPointerCapture(e.pointerId);
  setStraight(e.shiftKey);
  raw = [boardPoint(e)];
  mine = { id: 'tutor-' + Date.now(), by: 'tutor', pts: B.strokePoints(raw, straight) };
  upsert(mine);
  sendMine();
});
addEventListener('pointermove', (e) => { pointerAt = { x: e.clientX, y: e.clientY }; });
c.addEventListener('pointermove', (e) => {
  if (!mine) return;
  const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
  for (const ce of events.length ? events : [e]) raw.push(boardPoint(ce));
  if (e.shiftKey !== straight) { setStraight(e.shiftKey); return; } // redraws and sends with these samples
  mine = { ...mine, pts: B.strokePoints(raw, straight) };
  upsert(mine);
  if (performance.now() - lastSend > 40) sendMine();
});
const finish = () => {
  if (!mine) return;
  sendMine();
  mine = null;
  raw = [];
};
c.addEventListener('pointerup', finish);
c.addEventListener('pointercancel', finish);

// Clear asks nothing (#92): the relay keeps the cleared board for one undo (0eac4a1), and the toast offers it
// for 3 s. U works on it as long as nothing new is drawn first; the toast only makes that visible.
const toast = document.getElementById('toast');
const TOAST_MS = 3000;
let toastTimer = 0;
function showToast(on) {
  clearTimeout(toastTimer);
  toast.hidden = !on;
  hint.hidden = on;
  if (on) toastTimer = setTimeout(() => showToast(false), TOAST_MS);
}
const undo = () => { showToast(false); post({ type: 'undo' }); };
// Step-through reveal (#111): Reveal next (N), Previous step (P), Reveal all (Shift+N). Applied here at once and posted;
// the relay stores it and every phone and stage follows. The usual flow: draw, step back with P, then forward with N.
function stepReveal(action) {
  const r = B.revealStep(reveal, strokes, action);
  flashNote(r.note);
  if (!r.changed) return;
  reveal = r.upto;
  post({ type: 'reveal', upto: reveal, by: 'tutor' });
}
function clearBoard() {
  const had = strokes.length > 0 || landmarks.length > 0;
  post({ type: 'clear' });
  showToast(had);
}
// Buttons act on click but never take focus from a mouse, so Space or Enter later cannot press Clear again.
// Tab still reaches them. A click first saves a name box that is open, as clicking the board does.
const buttons = [[toolDraw, () => setPlacing(false)], [toolMark, () => setPlacing(!placing)],
  [document.getElementById('undo'), undo], [document.getElementById('clear'), clearBoard], [document.getElementById('undoClear'), undo],
  [document.getElementById('revealNext'), () => stepReveal('next')], [document.getElementById('revealPrev'), () => stepReveal('prev')],
  [document.getElementById('revealAll'), () => stepReveal('all')]];
for (const [btn, act] of buttons) {
  btn.addEventListener('mousedown', (e) => e.preventDefault());
  btn.addEventListener('click', () => { closeName(true); act(); });
}
addEventListener('keydown', (e) => {
  if (e.key === 'Shift') { setStraight(true); return; }
  if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || pending) return;
  const k = e.key.toLowerCase();
  if (k === 'u') undo();
  else if (k === 'c') clearBoard();
  else if (k === 'l') setPlacing(!placing);
  else if (k === 's') toggleStartNear();
  else if (k === 'n') stepReveal(e.shiftKey ? 'all' : 'next');
  else if (k === 'p') stepReveal('prev');
  else if (k === 'd' || k === 'escape') setPlacing(false);
});
addEventListener('keyup', (e) => { if (e.key === 'Shift') setStraight(false); });
addEventListener('blur', () => setStraight(false));

// The stepper (#111): pips for the tutor's strokes (teal = the student can feel it), the meter line, and the hiding hint.
const meter = document.getElementById('meter'), revealPips = document.getElementById('revealPips'), revealText = document.getElementById('revealText');
const PIPS_MAX = 12; // more strokes than this read as one bar
const stepBtn = { revealPrev: document.getElementById('revealPrev'), revealNext: document.getElementById('revealNext'),
  revealAll: document.getElementById('revealAll') };
let pipsKey = '';
function showReveal(rv) {
  const text = B.revealMeter(rv.shown, rv.total);
  if (text !== revealText.textContent) revealText.textContent = text;
  const key = rv.shown + '/' + rv.total;
  if (key !== pipsKey) {
    pipsKey = key;
    meter.classList.toggle('hiding', rv.hiding);
    if (rv.total > PIPS_MAX) {
      const track = document.createElement('i'), fill = document.createElement('b');
      track.className = 'track';
      fill.style.width = (100 * rv.shown / rv.total).toFixed(1) + '%';
      track.append(fill);
      revealPips.replaceChildren(track);
    } else {
      revealPips.replaceChildren(...Array.from({ length: rv.total }, (_, i) => {
        const pip = document.createElement('i');
        if (i < rv.shown) pip.className = 'on';
        return pip;
      }));
    }
  }
  if (rv.hiding !== hiding || rv.total !== steps) { hiding = rv.hiding; steps = rv.total; renderHint(); }
  const stuck = { revealPrev: !rv.total || rv.shown <= 0, revealNext: rv.shown >= rv.total, revealAll: rv.shown >= rv.total };
  for (const id in stuck) if (stepBtn[id].getAttribute('aria-disabled') !== String(stuck[id])) stepBtn[id].setAttribute('aria-disabled', String(stuck[id]));
}
