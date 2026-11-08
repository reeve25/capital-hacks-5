#!/usr/bin/env node
// Counts the pointer, touch and click events that /feel receives for N seconds, so the TalkBack session (#91)
// records what the page got rather than what we expected it to get.
//
//   node tools/talkback_probe.mjs [seconds]     real run (default 20 s): the Pixel's Chrome through
//                                               `adb forward tcp:9222 localabstract:chrome_devtools_remote`
//   node tools/talkback_probe.mjs --selftest    offline check of the counting code, no browser
//   --devtools http://127.0.0.1:PORT --origin http://localhost:PORT
//                                               a local Chromium instead (testing only; loopback hosts only)
//
// Read-only on the page: passive capture listeners on window that cannot cancel anything, removed at the end.
// It attaches only to a tab whose URL is on the origin (http://localhost:8765 by default) and never prints
// another tab's URL. Node 22, no dependencies (global fetch and WebSocket).

const TYPES = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel',
  'touchstart', 'touchmove', 'touchend', 'touchcancel', 'click'];
const KEY = '__talkbackProbe';

// Runs inside the page, so it is stringified and must not use anything from this module's scope.
function install(win, key, types) {
  if (win[key]) win[key].remove(); // a second probe replaces the first instead of double counting
  const s = { counts: {}, pointerTypes: {}, maxDown: 0, maxTouches: 0, hoverMoves: 0, centreDowns: 0,
    centreClicks: 0, untrusted: 0, firstDown: null, start: Date.now() };
  types.forEach((t) => { s.counts[t] = 0; });
  const ids = new Set(), down = new Set();
  // An accessibility click is synthesised at the element's centre (Blink simulated_event_util.cc); the canvas
  // fills the viewport, so its centre is the viewport's.
  const atCentre = (e) => Math.abs(e.clientX - win.innerWidth / 2) <= 2 && Math.abs(e.clientY - win.innerHeight / 2) <= 2;
  const on = (e) => {
    s.counts[e.type]++;
    if (!e.isTrusted) s.untrusted++;
    if (e.type.startsWith('pointer')) {
      const type = e.pointerType || '?';
      s.pointerTypes[type] = (s.pointerTypes[type] || 0) + 1;
      ids.add(type + ':' + e.pointerId);
      if (e.type === 'pointerdown') {
        down.add(e.pointerId);
        if (atCentre(e)) s.centreDowns++;
        if (!s.firstDown) s.firstDown = { type, x: Math.round(e.clientX), y: Math.round(e.clientY) };
      } else if (e.type === 'pointerup' || e.type === 'pointercancel') down.delete(e.pointerId);
      else if (e.buttons === 0) s.hoverMoves++;
      s.maxDown = Math.max(s.maxDown, down.size);
    } else if (e.type.startsWith('touch')) {
      s.maxTouches = Math.max(s.maxTouches, e.touches ? e.touches.length : 0);
    } else if (atCentre(e)) s.centreClicks++;
  };
  const opts = { capture: true, passive: true };
  types.forEach((t) => win.addEventListener(t, on, opts));
  win[key] = {
    read: () => ({ ...s, counts: { ...s.counts }, pointerTypes: { ...s.pointerTypes }, ids: ids.size, ms: Date.now() - s.start,
      viewport: [win.innerWidth, win.innerHeight] }),
    remove: () => { types.forEach((t) => win.removeEventListener(t, on, opts)); delete win[key]; },
  };
  return true;
}

function table(r, label) {
  const lines = [`${label}, ${(r.ms / 1000).toFixed(1)} s, viewport ${r.viewport.join('x')}, page mode ${r.mode ?? '?'}`];
  for (const t of TYPES) lines.push(`  ${t.padEnd(14)}${String(r.counts[t]).padStart(6)}`);
  const kinds = Object.entries(r.pointerTypes).map(([k, n]) => `${k} ${n}`).join(', ') || 'none';
  lines.push(`  pointers: ${r.ids} distinct, max ${r.maxDown} down at once; pointer events by type: ${kinds}`);
  lines.push(`  touches: max ${r.maxTouches} in one touch event`);
  lines.push(`  hover pointermoves (no button): ${r.hoverMoves}`);
  lines.push(`  at the exact page centre: ${r.centreDowns} pointerdown, ${r.centreClicks} click (a TalkBack double-tap lands there)`);
  if (r.firstDown) lines.push(`  first pointerdown: ${r.firstDown.type} at ${r.firstDown.x},${r.firstDown.y}`);
  if (r.untrusted) lines.push(`  untrusted (script-made) events: ${r.untrusted}`);
  return lines.join('\n');
}

function loopback(raw, name) {
  let u;
  try { u = new URL(raw); } catch { throw new Error(`${name} is not a URL: ${raw}`); }
  if (u.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(u.hostname) || !u.port) {
    throw new Error(`${name} must be http://localhost:PORT or http://127.0.0.1:PORT`);
  }
  return `${u.protocol}//${u.host}`;
}

function parse(argv) {
  const a = { seconds: 20, devtools: 'http://127.0.0.1:9222', origin: 'http://localhost:8765', selftest: false };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === '--selftest') a.selftest = true;
    else if (v === '--devtools') a.devtools = argv[++i];
    else if (v === '--origin') a.origin = argv[++i];
    else if (/^\d+(\.\d+)?$/.test(v)) a.seconds = Number(v);
    else throw new Error(`unknown argument: ${v}`);
  }
  if (!(a.seconds > 0 && a.seconds <= 600)) throw new Error('seconds must be between 0 and 600');
  a.devtools = loopback(a.devtools, '--devtools');
  a.origin = loopback(a.origin, '--origin');
  return a;
}

// The only tab we may touch: on the origin, preferring /feel when several are open.
function pickTab(list, origin) {
  const ours = list.filter((t) => t.type === 'page' && (t.url === origin || t.url.startsWith(origin + '/')));
  const feel = ours.filter((t) => new URL(t.url).pathname.startsWith('/feel'));
  const pick = ours.length > 1 ? feel : ours;
  if (pick.length === 1) return pick[0];
  const why = ours.length ? `${ours.length} tabs on ${origin}: ${ours.map((t) => t.url).join(', ')}` : `no tab on ${origin}`;
  throw new Error(`need exactly one /feel tab, found ${why} (${list.length - ours.length} other tabs not shown)`);
}

function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let next = 1;
  const waiting = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    const w = waiting.get(msg.id);
    if (!w) return;
    waiting.delete(msg.id);
    if (msg.error) w.reject(new Error(msg.error.message)); else w.resolve(msg.result);
  };
  const failAll = (err) => { for (const w of waiting.values()) w.reject(err); waiting.clear(); };
  ws.onclose = () => failAll(new Error('DevTools connection closed'));
  const opened = new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error(`cannot open ${wsUrl}`));
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = next++;
    const timer = setTimeout(() => { waiting.delete(id); reject(new Error(`${method} timed out`)); }, 5000);
    waiting.set(id, { resolve: (v) => { clearTimeout(timer); resolve(v); }, reject: (e) => { clearTimeout(timer); reject(e); } });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true });
    if (r.exceptionDetails) throw new Error(`page threw: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`);
    return r.result.value;
  };
  return { opened, evaluate, close: () => ws.close() };
}

async function run(a) {
  const res = await fetch(`${a.devtools}/json`).catch(() => null);
  if (!res || !res.ok) throw new Error(`no DevTools at ${a.devtools}/json: is adb forward tcp:9222 in place?`);
  const tab = pickTab(await res.json(), a.origin);
  const wsUrl = tab.webSocketDebuggerUrl || `ws://${new URL(a.devtools).host}/devtools/page/${tab.id}`;
  const page = cdp(wsUrl);
  await page.opened;
  // Page state, read in the page's global scope: feel.html keeps `mode` as a top-level let.
  const mode = "(typeof mode === 'string' ? mode : null)";
  await page.evaluate(`(${install})(window, ${JSON.stringify(KEY)}, ${JSON.stringify(TYPES)})`);
  let removed = false;
  const remove = async () => {
    if (removed) return;
    removed = true;
    await page.evaluate(`window[${JSON.stringify(KEY)}] ? (window[${JSON.stringify(KEY)}].remove(), true) : false`).catch(() => {});
  };
  process.once('SIGINT', async () => { await remove(); page.close(); process.exit(130); });
  console.error(`Listening ${a.seconds} s on ${tab.url}. Touch the phone now.`);
  await new Promise((r) => setTimeout(r, a.seconds * 1000));
  const result = await page.evaluate(`window[${JSON.stringify(KEY)}] ? { ...window[${JSON.stringify(KEY)}].read(), mode: ${mode} } : null`);
  await remove();
  page.close();
  if (!result) throw new Error('the probe was gone at the end: the page reloaded or navigated, so these counts are lost');
  console.log(table(result, new URL(tab.url).host + new URL(tab.url).pathname));
}

// Feeds a scripted stream through the same install() in Node and checks the counts and the clean-up.
function selftest() {
  const assert = (ok, what) => { if (!ok) throw new Error(`selftest: ${what}`); };
  const win = new EventTarget();
  win.innerWidth = 400; win.innerHeight = 800;
  const fire = (type, props) => win.dispatchEvent(Object.assign(new Event(type), props));
  const ptr = (type, id, x, y, extra = {}) => fire(type, { pointerId: id, pointerType: 'touch', clientX: x, clientY: y, buttons: type === 'pointerup' ? 0 : 1, ...extra });
  install(win, KEY, TYPES);
  // One finger: down, 5 moves, up, with its touch events.
  ptr('pointerdown', 7, 10, 10); fire('touchstart', { touches: [1] });
  for (let i = 0; i < 5; i++) { ptr('pointermove', 7, 10 + i, 10); fire('touchmove', { touches: [1] }); }
  ptr('pointerup', 7, 15, 10); fire('touchend', { touches: [] });
  // Two fingers down together, 3 moves each, one cancelled.
  ptr('pointerdown', 8, 50, 50); ptr('pointerdown', 9, 60, 50); fire('touchstart', { touches: [1, 2] });
  for (let i = 0; i < 3; i++) { ptr('pointermove', 8, 50, 50 + i); ptr('pointermove', 9, 60, 50 + i); }
  ptr('pointerup', 8, 50, 52); ptr('pointercancel', 9, 60, 52); fire('touchcancel', { touches: [] });
  // A hover move, then an accessibility-style click at the centre: mouse pointer, no touch events.
  ptr('pointermove', 1, 30, 30, { pointerType: 'mouse', buttons: 0 });
  ptr('pointerdown', 1, 200, 400, { pointerType: 'mouse' }); ptr('pointerup', 1, 200, 400, { pointerType: 'mouse' });
  fire('click', { clientX: 200, clientY: 400 });
  const r = win[KEY].read();
  const want = { pointerdown: 4, pointermove: 12, pointerup: 3, pointercancel: 1, touchstart: 2, touchmove: 5, touchend: 1, touchcancel: 1, click: 1 };
  for (const [t, n] of Object.entries(want)) assert(r.counts[t] === n, `${t} ${r.counts[t]} != ${n}`);
  assert(r.ids === 4, `ids ${r.ids}`);
  assert(r.maxDown === 2, `maxDown ${r.maxDown}`);
  assert(r.maxTouches === 2, `maxTouches ${r.maxTouches}`);
  assert(r.hoverMoves === 1, `hoverMoves ${r.hoverMoves}`);
  assert(r.centreDowns === 1 && r.centreClicks === 1, `centre ${r.centreDowns}/${r.centreClicks}`);
  assert(r.pointerTypes.touch === 17 && r.pointerTypes.mouse === 3, `types ${JSON.stringify(r.pointerTypes)}`);
  assert(r.firstDown.type === 'touch' && r.firstDown.x === 10, 'firstDown');
  assert(r.untrusted === 30, `untrusted ${r.untrusted}`); // script-made here; real touches are trusted
  assert(table({ ...r, mode: 'live' }, 'selftest').includes('max 2 down at once'), 'table');
  // A second install replaces the first; remove() leaves nothing listening.
  install(win, KEY, TYPES);
  ptr('pointerdown', 3, 0, 0);
  assert(win[KEY].read().counts.pointerdown === 1, 'reinstall double counts');
  win[KEY].remove();
  assert(!(KEY in win), 'key left behind');
  // Tab picking: only our origin, /feel preferred, nothing else.
  const tabs = [{ type: 'page', url: 'https://mail.example/inbox' }, { type: 'page', url: 'http://localhost:87650/feel' },
    { type: 'page', url: 'http://localhost:8765/draw' }, { type: 'page', url: 'http://localhost:8765/feel' }];
  assert(pickTab(tabs, 'http://localhost:8765').url === 'http://localhost:8765/feel', 'pickTab /feel');
  let msg = '';
  try { pickTab(tabs.slice(0, 2), 'http://localhost:8765'); } catch (e) { msg = e.message; }
  assert(msg.includes('no tab') && !msg.includes('mail.example'), 'pickTab leaks or accepts a foreign tab');
  assert(parse(['5']).seconds === 5 && parse([]).origin === 'http://localhost:8765', 'parse defaults');
  let refused = false;
  try { parse(['--origin', 'http://192.168.1.5:8765']); } catch { refused = true; }
  assert(refused, 'non-loopback origin accepted');
  console.log('talkback_probe selftest: ok');
}

try {
  const a = parse(process.argv.slice(2));
  if (a.selftest) selftest(); else await run(a);
} catch (e) {
  console.error(`talkback_probe: ${e.message}`);
  process.exit(1);
}
