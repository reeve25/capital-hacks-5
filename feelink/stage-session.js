// FeelInk stage, right panel (the student's session): the link status header and the paper guide, three live lines on
// the student (their finger, the point their phone last spoke, what they have felt) and the folded "Spoken on their
// phone" history. stage-relay.js calls in. The typed cue tool is gone (Reeve, 19:35: the tutor talks; no typed
// instructions read aloud); the relay and phone still carry 'instruction' events, so the history can show one.

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
  // "Drawing updated." (a reveal step) or "Drawing changed." gets the finger's caption too, so a silent take shows the
  // student was told. It comes when the phone reports the line spoken, so after the words, never before them.
  else if (s.kind === 'status' && /^Drawing (updated|changed)\.$/.test(s.text)) caption = { name: s.text.slice(0, -1), t0: performance.now() };
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
const spokeSub = document.getElementById('spokeSub'), feltBars = document.getElementById('feltBars');
const pausedEl = document.getElementById('paused'), pausedTitle = document.getElementById('pausedTitle');
const pausedText = document.getElementById('pausedText'), leftBody = document.querySelector('.panel.left .panel-body');
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
  // One line, no sub-line (#138): where the finger is against the ink is the board's to show. A short lift holds the line.
  const t = B.touchState({ live, ever: Number.isFinite(lastPhoneAt), down: finger.down, stillMs: now - finger.movedAt,
    liftMs: Number.isFinite(finger.upAt) ? now - finger.upAt : Infinity });
  setRow(rows.touch, t.state, t.text, t.state + '|' + t.text);

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
  const text = B.feltLine(shares, rv.hiding);
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

// Status in words, and the guide: it sits on the paper only while nothing is drawn and no phone is live, so the
// board is bare in every take. Both touch the DOM only when something changed.
const statusEl = document.getElementById('status'), statusText = document.getElementById('statusText'), statusSub = document.getElementById('statusSub');
let statusKey = '';
function showStatus(now) {
  const link = B.phoneLink(now - lastPhoneAt, phoneLeft);
  const phoneLive = link === 'connected';
  // The reconnect that fetches the relay's state after an unsent change is not an outage; it takes milliseconds.
  const unsent = resyncing ? 'reloading' : now - unsentAt < UNSENT_MS ? 'reloaded' : '';
  const relayUp = (tutorOnline && es.readyState === 1) || (resyncing && now - unsentAt < 1000);
  const s = everOnline ? B.connectionStatus(relayUp, link, finger.down, unsent)
    : { tone: 'wait', text: 'Connecting…', sub: '' };
  const key = s.tone + '|' + s.text + '|' + s.sub;
  if (key !== statusKey) {
    statusKey = key;
    statusEl.dataset.tone = s.tone;
    statusText.textContent = s.text;
    statusSub.textContent = s.sub;
    // Out of reach or a change not taken: the board says it over the paper and the tools take nothing until the
    // relay's state is back, so what the tutor sees is always what the phone has.
    const paused = everOnline && (!relayUp || !!unsent);
    document.body.classList.toggle('paused', paused);
    leftBody.inert = paused;
    pausedEl.hidden = !paused;
    if (paused) {
      pausedTitle.textContent = relayUp ? 'A change did not reach the phone' : 'Studio offline';
      pausedText.textContent = relayUp ? 'The board was reloaded and now shows exactly what the phone has.'
        : 'Changes are paused until it reconnects, so the board always matches the phone.';
    }
  }
  const busy = !synced || phoneLive || strokes.length > 0 || landmarks.length > 0;
  if (document.body.classList.contains('board-busy') !== busy) document.body.classList.toggle('board-busy', busy);
}
