// "Guide back to the line" in the real /feel page: headless Chrome over CDP against its own TEST relay on a free port
// (never 8765, the live one). navigator.vibrate is stubbed to record every call with its time, one straight stroke is
// posted through the relay, and touches are injected: on the line (the hold), 12 mm off and still for 3 s (guide taps
// at guideInterval's cadence, none in the first 600 ms), 9 mm off (faster), 30 mm off (silent), back on the line (the
// hold, no taps), a lift while guiding, then the setting turned off in Advanced settings and kept over a reload.
// Prints the tap times and one PASS/FAIL line per check; exit 0 when all pass with no page errors.
// Emulated only: a desktop Chrome with a stubbed vibrate, no phone and no motor.
// Run from the repo root (Python, Chrome and Node 22+; CHROME=<path> if Chrome is elsewhere):
//   node tools/feel_guide_check.mjs [--shot <png>]   (--shot saves the home screen with Advanced settings open)
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { guideInterval } = createRequire(import.meta.url)('../feelink/tactile.js');
const shotAt = process.argv.indexOf('--shot');
const shot = shotAt > 0 ? process.argv[shotAt + 1] : null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => {
  const s = createServer();
  s.on('error', rej);
  s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => res(port)); });
});
let port = await freePort();
while (port === 8765) port = await freePort();
const base = `http://127.0.0.1:${port}`;

// The phone's defaults: core 4 mm (half 2) and a 6 mm fade, so the band's outer edge is 8 mm from the line.
const EDGE = 2 + 6, LINE_X = 10, Y = 60;
const expect = (d) => guideInterval(d, { edge: EDGE });

const procs = [];
const profile = mkdtempSync(join(tmpdir(), 'feel-guide-'));
let ws = null, sseAbort = null;
async function cleanup() {
  try { sseAbort?.abort(); } catch {}
  try { ws?.close(); } catch {}
  for (const p of procs) try { p.kill(); } catch {}
  for (let i = 0; i < 10; i++) { try { rmSync(profile, { recursive: true, force: true }); break; } catch { await sleep(300); } }
}

const results = [], errors = [];
const check = (name, ok, got) => results.push([ok ? 'PASS' : 'FAIL', name, ok ? '' : JSON.stringify(got)]);

try {
  // The test relay, serving this checkout's pages.
  const relay = spawn(process.env.PYTHON || 'python', ['-I', '-u', 'feelink/server.py', String(port)], { cwd: root, stdio: ['ignore', 'ignore', 'pipe'] });
  procs.push(relay);
  let up = false;
  for (let i = 0; i < 50 && !up; i++) { try { up = (await fetch(`${base}/feel`)).ok; } catch { await sleep(200); } }
  if (!up) throw new Error('test relay did not start on port ' + port);
  const postEv = async (body) => (await fetch(`${base}/event`, { method: 'POST', body: JSON.stringify(body) })).text();

  // What the stage would receive: every haptic report the page posts, read off the relay's own event stream.
  const sse = [];
  sseAbort = new AbortController();
  fetch(`${base}/events`, { signal: sseAbort.signal }).then(async (r) => {
    const dec = new TextDecoder();
    let buf = '';
    for await (const chunk of r.body) {
      buf += dec.decode(chunk, { stream: true });
      let i;
      while ((i = buf.indexOf('\n\n')) >= 0) {
        const block = buf.slice(0, i);
        buf = buf.slice(i + 2);
        for (const line of block.split('\n')) if (line.startsWith('data: ')) try { sse.push(JSON.parse(line.slice(6))); } catch {}
      }
    }
  }).catch(() => {});

  for (const ev of [{ type: 'clear' }, { type: 'stroke', id: 'guide-line', by: 'tutor', pts: [{ x: LINE_X, y: 20 }, { x: LINE_X, y: 100 }] }]) {
    if ((await postEv(ev)) !== 'ok') throw new Error('relay refused ' + ev.type);
  }

  const chrome = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => p && existsSync(p));
  if (!chrome) throw new Error('Chrome not found; set CHROME=<path to chrome>');
  const dport = await freePort();
  const browser = spawn(chrome, ['--headless=new', `--remote-debugging-port=${dport}`, `--user-data-dir=${profile}`, '--no-first-run',
    '--no-default-browser-check', '--disable-gpu', '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
    '--window-size=412,915', 'about:blank'], { stdio: ['ignore', 'ignore', 'ignore'] });
  procs.push(browser);
  let page = null;
  for (let i = 0; i < 75 && !page; i++) {
    try { page = (await (await fetch(`http://127.0.0.1:${dport}/json`)).json()).find((t) => t.type === 'page'); } catch {}
    if (!page) await sleep(200);
  }
  if (!page) throw new Error('Chrome did not start');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || '').slice(0, 200));
    // The page has no favicon, so Chrome's own request for one 404s; that is not the page's error.
    const entry = msg.method === 'Log.entryAdded' && msg.params.entry;
    if (entry && entry.level === 'error' && !/\/favicon\.ico$/.test(entry.url || '')) errors.push(`${entry.text} ${entry.url || ''}`.slice(0, 200));
  };
  const send = (method, params = {}) => new Promise((res) => { const my = ++id; pending.set(my, res); ws.send(JSON.stringify({ id: my, method, params })); });
  const ev = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error(expr + ': ' + JSON.stringify(r.result.exceptionDetails).slice(0, 300));
    return r.result.result.value;
  };
  const now = () => ev('performance.now()');

  await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
  // A Pixel 8's viewport. The stub replaces the motor: every call is kept with the page's own clock.
  await send('Emulation.setDeviceMetricsOverride', { width: 412, height: 915, deviceScaleFactor: 2.625, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__vib = [];
    Object.defineProperty(Navigator.prototype, 'vibrate', { configurable: true,
      value(p) { window.__vib.push({ t: performance.now(), p: Array.isArray(p) ? p.slice() : p }); return true; } });` });
  const load = async () => {
    await send('Page.navigate', { url: `${base}/feel` });
    for (let i = 0; i < 50; i++) { await sleep(200); try { if (await ev('typeof link !== "undefined" && link === "on"')) return; } catch {} }
    throw new Error('the page never connected to the test relay');
  };
  await load();

  // Touches, in board millimetres through the page's own mapping.
  const px = (x, y) => ev(`toPx({ x: ${x}, y: ${y} })`);
  const touch = async (type, x, y) => {
    const pts = type === 'touchEnd' ? [] : [await px(x, y)].map(([cx, cy]) => ({ x: cx, y: cy, id: 1, radiusX: 2, radiusY: 2, force: 1 }));
    await send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  };
  let fx = null;
  const glide = async (to, stepMm = 1) => {
    const n = Math.max(1, Math.round(Math.abs(to - fx) / stepMm));
    for (let i = 1; i <= n; i++) { await touch('touchMove', fx + (to - fx) * i / n, Y); await sleep(16); }
    fx = to;
  };
  const jump = async (to) => { await touch('touchMove', to, Y); fx = to; };
  const tapEl = async (sel) => {
    const [x, y] = await ev(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);
    await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 2 }] });
    await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(400);
  };
  const vib = () => ev('window.__vib');
  const taps = (list, from = -Infinity, to = Infinity) => list.filter((v) => v.p === 15 && v.t >= from && v.t < to);
  const holds = (list, from = -Infinity) => list.filter((v) => v.p === 5000 && v.t >= from);

  if (shot) {
    await ev(`$('advanced').open = true; $('guide').scrollIntoView({ block: 'center' }); 1`);
    await sleep(500);
    writeFileSync(shot, Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).result.data, 'base64'));
    await ev(`$('advanced').open = false; scrollTo(0, 0); 1`);
  }
  check('the setting is on by default', await ev(`$('guide').checked && guideOn`), await ev(`[$('guide').checked, guideOn]`));

  await tapEl('#live');
  check('Connect opens Live', (await ev('mode')) === 'live', await ev('mode'));

  // 1. On the line: the hold.
  const t0 = await now();
  fx = LINE_X;
  await touch('touchStart', LINE_X, Y);
  await sleep(500);
  check('on the line: the hold plays', holds(await vib(), t0).length >= 1, (await vib()).slice(-3));

  // 2. Drift to 12 mm off and stay still for 3 s.
  const tLeave = await now();
  await glide(LINE_X + 12);
  let v = await vib();
  const stop = v.find((x) => x.t >= tLeave && x.p === 1);
  if (!stop) throw new Error('no stop buzz when the finger left the fade band');
  const tOff = stop.t; // the move that left the band: the off clock starts here
  await sleep(Math.max(0, tOff + 3000 - (await now())));
  const t12end = await now();

  // 3. 9 mm off: faster.
  await glide(LINE_X + 9);
  const t9 = await now();
  await sleep(1500);
  const t9end = await now();

  // 4. 30 mm off in one jump: silent.
  await jump(LINE_X + 30);
  const t30 = await now();
  await sleep(1500);
  const t30end = await now();

  // 5. Back to the line: taps on the way in are allowed, then none, and the hold again.
  await glide(LINE_X, 2);
  const tBack = await now();
  await sleep(1000);
  v = await vib();

  const rows = [];
  const all = taps(v, tOff);
  all.forEach((x, i) => {
    const phase = x.t < t12end ? '12 mm' : x.t < t9end ? '9 mm' : x.t < t30end ? '30 mm' : 'back';
    const d = { '12 mm': 12, '9 mm': 9, '30 mm': 30 }[phase];
    rows.push([i + 1, Math.round(x.t - tOff), i ? Math.round(x.t - all[i - 1].t) : '', phase, d != null ? (expect(d) ?? 'silent') : '']);
  });
  console.log(`edge ${EDGE} mm; expected gap: 12 mm ${expect(12)} ms, 9 mm ${expect(9)} ms, 30 mm ${expect(30) ?? 'silent'}`);
  console.log('tap  ms since off  gap ms  finger  expected gap');
  for (const r of rows) console.log(`${String(r[0]).padStart(3)}  ${String(r[1]).padStart(12)}  ${String(r[2]).padStart(6)}  ${r[3].padEnd(6)}  ${r[4]}`);

  const p12 = taps(v, tOff, t12end), gaps12 = p12.slice(1).map((x, i) => x.t - p12[i].t);
  check('12 mm: no tap in the first 600 ms off the line', taps(v, tOff, tOff + 600).length === 0, taps(v, tOff, tOff + 600));
  check('12 mm: the first tap comes at 600 ms', p12.length > 0 && p12[0].t - tOff >= 597 && p12[0].t - tOff <= 680, p12[0] && p12[0].t - tOff);
  check(`12 mm: taps keep coming while the finger is still (5 or more in 3 s)`, p12.length >= 5, p12.length);
  check(`12 mm: every gap is ${expect(12)} ms (-3/+40)`, gaps12.length >= 4 && gaps12.every((g) => g >= expect(12) - 3 && g <= expect(12) + 40), gaps12.map(Math.round));
  const p9 = taps(v, t9, t9end), gaps9 = p9.slice(1).map((x, i) => x.t - p9[i].t);
  check(`9 mm: faster, every gap ${expect(9)} ms (-3/+40)`, gaps9.length >= 3 && gaps9.every((g) => g >= expect(9) - 3 && g <= expect(9) + 40), gaps9.map(Math.round));
  check('30 mm: silent', taps(v, t30, t30end).length === 0, taps(v, t30, t30end));
  check('back on the line: no tap after arriving', taps(v, tBack).length === 0, taps(v, tBack));
  check('back on the line: the hold resumes', holds(v, t30end).length >= 1, v.filter((x) => x.t >= t30end).slice(0, 5));
  check('guide taps never cut another buzz: each follows a stop, a tick or a tap, never a hold, fade or cue', all.every((x) => {
    const before = v.filter((y) => y.t < x.t).pop();
    return before && (before.p === 1 || before.p === 15 || before.p === 25);
  }), all.map((x) => v.filter((y) => y.t < x.t).pop()));

  // 6. A lift while guiding stops it.
  await glide(LINE_X + 12);
  await sleep(1000);
  const tLift = await now();
  await touch('touchEnd');
  await sleep(1200);
  v = await vib();
  check('lift: taps had started, then none after the lift', taps(v, tLift - 1000, tLift).length >= 1 && taps(v, tLift).length === 0,
    { before: taps(v, tLift - 1000, tLift).length, after: taps(v, tLift).length });

  // 7. What the stage receives: every guide tap reported as a haptic event, like every other buzz.
  await sleep(500);
  const reported = sse.filter((e) => e.type === 'haptic' && e.kind === 'guide');
  const pageTaps = taps(v).length;
  check(`each tap reaches the relay as {type:'haptic', kind:'guide'} (${reported.length} of ${pageTaps})`,
    pageTaps > 0 && reported.length === pageTaps && reported.every((e) => e.level === 0 && e.ok === true && JSON.stringify(e.pattern) === '[15]'), reported.slice(0, 2));

  // 8. Back, then the setting off in Advanced settings: no taps, and it stays off over a reload.
  await ev('history.back(); 1');
  await sleep(600);
  check('Back returns to the menu', (await ev('mode')) === 'home', await ev('mode'));
  await ev(`$('advanced').open = true; $('guide').scrollIntoView({ block: 'center' }); 1`);
  await sleep(300);
  await tapEl('#guide');
  check('tapping the setting turns it off and keeps it', (await ev(`[$('guide').checked, guideOn, localStorage.getItem('fi.guide')]`)).join() === 'false,false,off',
    await ev(`[$('guide').checked, guideOn, localStorage.getItem('fi.guide')]`));
  await ev(`$('advanced').open = false; scrollTo(0, 0); 1`);
  await sleep(300);
  await tapEl('#live');
  const tOffSet = await now();
  fx = LINE_X;
  await touch('touchStart', LINE_X, Y);
  await sleep(300);
  await glide(LINE_X + 12);
  await sleep(1500);
  await touch('touchEnd');
  v = await vib();
  check('setting off: no taps off the line', (await ev('mode')) === 'live' && taps(v, tOffSet).length === 0 && holds(v, tOffSet).length >= 1,
    { mode: await ev('mode'), taps: taps(v, tOffSet).length, holds: holds(v, tOffSet).length });
  await load();
  check('setting off survives a reload', (await ev(`[$('guide').checked, guideOn].join()`)) === 'false,false', await ev(`[$('guide').checked, guideOn]`));

  check('no page errors', errors.length === 0, errors);
} catch (e) {
  results.push(['FAIL', 'run', String(e && e.stack || e).slice(0, 400)]);
} finally {
  await cleanup();
}
for (const [s, name, got] of results) console.log(`${s} ${name}${got ? ' -> ' + got : ''}`);
const failed = results.filter((r) => r[0] === 'FAIL').length;
console.log(failed ? `feel_guide_check: ${failed} of ${results.length} failed` : `feel_guide_check: ${results.length} of ${results.length} pass (Emulated, headless Chrome)`);
process.exit(failed ? 1 : 0);
