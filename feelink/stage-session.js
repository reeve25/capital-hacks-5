// FeelInk stage, right panel (the student's session): the link status header and the paper guide, three live lines on
// the student (their finger, the point their phone last spoke, what they have felt), the folded "Spoken on their phone"
// history, and the instruction box with its Sent/Spoken states. stage-relay.js calls in.

// "Spoken on their phone" (#92, #107): lines the phone reports it spoke (#90), never inferred from a haptic, plus the
// tutor's instructions, which show "Sent" until the phone reports saying them. board.js HeardLog merges repeats. The
// history is folded by default (human-led note, Nov 7): the tutor is talking to the student, not reading a feed.
const heardList = document.getElementById('heardList'), said = document.getElementById('said'), saidCount = document.getElementById('saidCount');
const clock = (ms) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
// The phone reports finishing a line; that it was spoken is all the stage knows, not that the student took it in.
const STATE_TEXT = { sent: 'Sent, not spoken yet', heard: 'Spoken', replaced: 'Replaced before it was spoken' };
const svgNS = 'http://www.w3.org/2000/svg';
const GLYPH = { // 16 px marks for the history: a spoken point, a speech bubble, the phone
  landmark: '<circle cx="8" cy="8" r="5.2" fill="#2bb3a3"/><circle cx="8" cy="8" r="1.8" fill="#0a1119"/>',
  instruction: '<path d="M2.5 3.5h11v7H7l-3 2.5v-2.5H2.5z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
  status: '<rect x="4.5" y="1.5" width="7" height="13" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M7 12h2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' };
function glyph(kind) {
  const g = document.createElementNS(svgNS, 'svg');
  g.setAttribute('viewBox', '0 0 16 16');
  g.setAttribute('aria-hidden', 'true');
  g.innerHTML = GLYPH[kind] || GLYPH.status;
  return g;
}
const log = new B.HeardLog();
function heardItem(x) {
  const li = document.createElement('li');
  li.className = 'k-' + x.kind + ' is-' + x.state; // k-: 'status' is the header's class
  const say = document.createElement('span');
  say.className = 'say-line';
  say.textContent = x.kind === 'status' ? x.text : '“' + x.text + '”';
  const meta = document.createElement('span');
  meta.className = 'meta';
  if (x.kind === 'instruction') {
    const badge = document.createElement('b');
    badge.className = 'badge';
    badge.textContent = STATE_TEXT[x.state] + (x.n > 1 ? ' ×' + x.n : '');
    meta.append(badge);
  } else if (x.n > 1) {
    const n = document.createElement('b');
    n.className = 'count';
    n.textContent = '×' + x.n;
    meta.append(n);
  }
  const time = document.createElement('time');
  time.dateTime = new Date(x.at).toISOString();
  time.textContent = clock(x.at);
  meta.append(time);
  li.append(glyph(x.kind), say, meta);
  return li;
}
function renderHeard() {
  said.hidden = !log.items.length;
  saidCount.textContent = log.items.length;
  heardList.replaceChildren(...log.items.map(heardItem));
}
function onSpoken(ev) {
  const s = reports.spoken(ev);
  if (!s) return;
  if (s.kind === 'landmark') markFound(B.markName(s.text));
  // Timed when it was said: arrival less the time the report waited on the phone, if it says.
  log.heard(s, Date.now() - (Number(ev.age) > 0 ? Number(ev.age) : 0));
  renderHeard();
}
function onInstruction(ins) {
  if (log.sent(ins, Date.now())) renderHeard();
}
said.querySelector('summary').addEventListener('mousedown', (e) => e.preventDefault());

// The three live lines (human-led note, Nov 7). Each says only what the stage knows: the finger from the phone's own
// reports (board.js touchState), the point from a spoken report, the felt lines from the teal on the board. Each line
// touches the DOM only when its words change; the "ago" ticks once a second at most.
const rows = {};
for (const k of ['touch', 'spoke', 'felt']) rows[k] = { el: document.getElementById(k + 'Row'), text: document.getElementById(k + 'Text'), key: '' };
const touchSub = document.getElementById('touchSub'), spokeSub = document.getElementById('spokeSub'), feltBars = document.getElementById('feltBars');
const BARS_MAX = 12; // more lines than this read as one bar, as the reveal pips do
function setRow(row, state, text, key, extra) {
  if (key === row.key) return false;
  row.key = key;
  row.el.dataset.state = state;
  if (row.text.textContent !== text) row.text.textContent = text;
  if (extra) extra();
  return true;
}
let spokeAt = '';
function showSession(now, rv) {
  const live = B.phoneLink(now - lastPhoneAt, phoneLeft) === 'connected';
  const shownMarks = landmarks.filter((_, i) => rv.mark[i]);
  const on = live && finger.down && finger.last ? B.landmarkAt(shownMarks, finger.last) : null;
  const inked = strokes.some((st, i) => rv.stroke[i] && st.pts.length);
  const t = B.touchState({ live, ever: Number.isFinite(lastPhoneAt), down: finger.down, stillMs: now - finger.movedAt,
    level: finger.level, top: phoneTop, at: on ? B.cleanName(on.name) : '', inked });
  setRow(rows.touch, t.state, t.text, t.state + '|' + t.text + '|' + t.sub, () => { touchSub.textContent = t.sub; });

  const mark = log.items.find((x) => x.kind === 'landmark');
  if (mark) {
    const sub = 'Spoken ' + B.ago(Date.now() - mark.at);
    const fresh = setRow(rows.spoke, 'on', '“' + mark.text + '”', mark.text + '|' + mark.at + '|' + sub, () => { spokeSub.textContent = sub; });
    // A newly spoken point slides in once; the "ago" ticking does not.
    if (fresh && spokeAt !== mark.text + '|' + mark.n && !REDUCE) {
      rows.spoke.el.classList.remove('enter');
      void rows.spoke.el.offsetWidth;
      rows.spoke.el.classList.add('enter');
    }
    spokeAt = mark.text + '|' + mark.n;
  } else setRow(rows.spoke, 'none', 'No point spoken yet', 'none', () => { spokeSub.textContent = ''; });

  // The felt share of each shown line the tutor drew, as the board draws it in teal.
  const shares = [];
  strokes.forEach((st, i) => {
    if (!B.isStep(st) || !rv.stroke[i] || !st.pts.length) return;
    const s = inkState(st);
    let n = 0;
    for (const f of s.felt) if (f) n++;
    shares.push(s.samples.length ? n / s.samples.length : 0);
  });
  const text = B.feltLine(shares);
  const pct = shares.length > BARS_MAX ? [shares.reduce((a, b) => a + b, 0) / shares.length] : shares;
  const widths = pct.map((f) => Math.round(f * 100));
  setRow(rows.felt, shares.some((f) => f > 0) ? 'on' : 'none', text, text + '|' + widths.join(','), () => {
    feltBars.replaceChildren(...widths.map((w) => {
      const bar = document.createElement('i'), fill = document.createElement('span');
      if (pct.length === 1 && shares.length > 1) bar.className = 'track';
      fill.style.width = w + '%';
      bar.append(fill);
      return bar;
    }));
  });
}

// Instructions (#107): Enter posts {type:'instruction', id, text, by}. The relay keeps the latest and the phone says
// it aloud; the log shows it Sent until the phone reports saying it. Keys typed here are text, not board shortcuts.
const tell = document.getElementById('tell'), tellText = document.getElementById('tellText');
tell.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = B.cleanInstruction(tellText.value);
  if (!text) return;
  const ins = { type: 'instruction', id: 'say-' + Date.now(), text, by: 'tutor' };
  onInstruction(ins);
  post(ins);
  tellText.value = '';
});
tellText.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Escape') tellText.blur(); });
document.getElementById('tellSend').addEventListener('mousedown', (e) => e.preventDefault());

// Status in words, and the guide: it sits on the paper only while nothing is drawn and no phone is live, so the
// board is bare in every take. Both touch the DOM only when something changed.
const statusEl = document.getElementById('status'), statusText = document.getElementById('statusText'), statusSub = document.getElementById('statusSub');
let statusKey = '';
function showStatus(now) {
  const link = B.phoneLink(now - lastPhoneAt, phoneLeft);
  const phoneLive = link === 'connected';
  const s = everOnline ? B.connectionStatus(tutorOnline && es.readyState === 1, link, finger.down)
    : { tone: 'wait', text: 'Connecting…', sub: '' };
  const key = s.tone + '|' + s.text + '|' + s.sub;
  if (key !== statusKey) {
    statusKey = key;
    statusEl.dataset.tone = s.tone;
    statusText.textContent = s.text;
    statusSub.textContent = s.sub;
  }
  const busy = !synced || phoneLive || strokes.length > 0 || landmarks.length > 0;
  if (document.body.classList.contains('board-busy') !== busy) document.body.classList.toggle('board-busy', busy);
}
