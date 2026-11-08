// FeelInk stage, right panel (the student's side): the link status header and the paper guide, the "Spoken on their
// phone" feed with its Earlier fold, and the instruction box with its Sent/Spoken states. stage-relay.js calls in.

// "Student heard" (#92, #107): lines the phone reports it spoke (#90), never inferred from a haptic, plus the tutor's
// instructions, which show "Sent" until the phone reports saying them. board.js HeardLog merges repeats.
const heardList = document.getElementById('heardList'), heardEmpty = document.getElementById('heardEmpty');
const earlier = document.getElementById('earlier'), earlierList = document.getElementById('earlierList'), earlierCount = document.getElementById('earlierCount');
const clock = (ms) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
// The phone reports finishing a line; that it was spoken is all the stage knows, not that the student took it in.
const STATE_TEXT = { sent: 'Sent, not spoken yet', heard: 'Spoken', replaced: 'Replaced before it was spoken' };
const svgNS = 'http://www.w3.org/2000/svg';
const GLYPH = { // 16 px marks for the feed: a felt point, a speech bubble, the phone
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
let latestKey = '';
function heardItem(x, latest) {
  const li = document.createElement('li');
  li.className = 'k-' + x.kind + ' is-' + x.state + (latest ? ' latest' : ''); // k-: 'status' is the header's class
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
const RECENT = 3; // lines shown in full under the newest one; the rest fold under Earlier
function renderHeard() {
  const first = log.latest, recent = log.earlier.slice(0, RECENT), rest = log.earlier.slice(RECENT);
  heardEmpty.hidden = !!first;
  const key = first ? [first.kind, first.key, first.at, first.state].join('|') : '';
  const li = first ? heardItem(first, true) : null;
  if (li && key !== latestKey && !REDUCE) li.classList.add('enter');
  latestKey = key;
  heardList.replaceChildren(...(li ? [li] : []), ...recent.map((x) => heardItem(x, false)));
  earlier.hidden = !rest.length;
  earlierCount.textContent = rest.length;
  earlierList.replaceChildren(...rest.map((x) => heardItem(x, false)));
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
earlier.querySelector('summary').addEventListener('mousedown', (e) => e.preventDefault());

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
