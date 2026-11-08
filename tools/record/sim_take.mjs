// Desktop simulation of the route lesson, for the deck until real Pixel footage replaces it. Starts its own TEST relay on
// a free port (never 8765) and its own headless Chrome, loads the real /stage (1920x1080) and /feel (Pixel 8 size, 412x915
// at 2.625), plays a scripted tutor (mouse, with a drawn cursor) and an emulated student finger (touch events), records
// both pages, and composes them with compose.py as a real take would be, tagged "Desktop simulation" in the picture.
// Emulated, never device evidence: the phone page's navigator.vibrate and speechSynthesis are stubbed and logged (speech
// "ends" after a length-based delay, so the stage's spoken reports are emulated too). On the phone panel this script draws
// the fingertip, rings for the vibration the page asked for (ring strength = how much of the last 120 ms was buzzing),
// and a caption for what the page asked to say, over the page's real screen, which stays dark for the student.
// The lesson: the finger starts 22 mm off the line and is guided onto it, finds "Start: Classroom", traces step 1; the
// tutor reveals step 2 (Next), the student reaches Office; the tutor then draws the last leg live and labels Library, and
// the student follows it there.
// Run from the repo root (Python, Chrome, Node 22+, ffmpeg; CHROME=<path> if Chrome is elsewhere):
//   node tools/record/sim_take.mjs [--name sim-route-lesson]
// Raw clips go to recordings/raw/, the composed MP4 and GIF (and the whole stage window as NAME-stage) to recordings/out/.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const NAME = arg('--name', 'sim-route-lesson');
const LABEL = 'Desktop simulation';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => {
  const s = createServer();
  s.on('error', rej);
  s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => res(port)); });
});

// Board millimetres (56 x 120). The route: Classroom down the hall to a corner, across to Office; the last leg to Library
// is drawn live by the tutor.
const CLASS = { x: 12, y: 18 }, CORNER = { x: 12, y: 60 }, OFFICE = { x: 42, y: 60 }, LIB = { x: 30, y: 104 };
const LEG = [OFFICE, { x: 42, y: 82 }, { x: 30, y: 82 }, LIB];
const line = (a, b, step = 1) => {
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / step));
  return Array.from({ length: n + 1 }, (_, i) => ({ x: +(a.x + (b.x - a.x) * i / n).toFixed(2), y: +(a.y + (b.y - a.y) * i / n).toFixed(2) }));
};
const path = (...p) => p.slice(1).flatMap((b, i) => line(p[i], b).slice(i ? 1 : 0));

// The emulated phone: stubs first (before the page's own scripts), then the overlay once the body exists.
const PHONE_SIM = `(() => {
  const sim = window.__sim = { said: [], buzz: [], touch: null, down: false, up: -1e9 };
  navigator.vibrate = (p) => { sim.buzz.push({ t: performance.now(), p: [].concat(p) }); return true; };
  let cur = null, timer = null;
  speechSynthesis.speak = (u) => {
    const s = { t: performance.now(), text: u.text, ms: 450 + 65 * u.text.length };
    sim.said.push(s); cur = { u, s };
    timer = setTimeout(() => { cur = null; u.onend && u.onend(); }, s.ms);
  };
  speechSynthesis.cancel = () => { clearTimeout(timer); if (cur) { cur.s.cut = performance.now(); const u = cur.u; cur = null; u.onerror && u.onerror({ error: 'interrupted' }); } };
  const at = (e) => { const t = e.touches[0]; if (t) { sim.touch = { x: t.clientX, y: t.clientY }; sim.down = true; } else if (sim.down) { sim.down = false; sim.up = performance.now(); } };
  for (const k of ['touchstart', 'touchmove', 'touchend']) addEventListener(k, at, { capture: true, passive: true });
  const duty = (now) => { // share of the last 120 ms inside an "on" step of the latest pattern then playing
    let on = 0;
    for (let q = now - 120; q <= now; q += 4) {
      let c = null;
      for (let i = sim.buzz.length - 1; i >= 0; i--) if (sim.buzz[i].t <= q) { c = sim.buzz[i]; break; }
      if (!c) continue;
      let d = q - c.t;
      for (let i = 0; i < c.p.length; i++) { if (d < c.p[i]) { if (i % 2 === 0 && c.p[i] > 1) on++; break; } d -= c.p[i]; }
    }
    return on / 31;
  };
  const wrap = (ctx, text, w) => { const out = []; let l = ''; for (const word of text.split(' ')) { const t = l ? l + ' ' + word : word; if (ctx.measureText(t).width > w && l) { out.push(l); l = word; } else l = t; } out.push(l); return out; };
  addEventListener('DOMContentLoaded', () => {
    const c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483647';
    document.body.append(c);
    const ctx = c.getContext('2d'), dpr = devicePixelRatio, R = 30;
    const frame = (now) => {
      const W = innerWidth, H = innerHeight;
      if (c.width !== W * dpr) { c.width = W * dpr; c.height = H * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = '#2c3a49'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(1, 1, W - 2, H - 2, 18); ctx.stroke(); // the screen's edge
      const k = sim.down ? 1 : Math.max(0, 1 - (now - sim.up) / 250); // a lifted fingertip fades out
      if (sim.touch && k > 0) {
        const { x, y } = sim.touch, d = duty(now);
        if (d > 0.02) for (const [r, a] of [[R + 8, 1], [R + 18, 0.5]]) {
          ctx.strokeStyle = 'rgba(255,176,32,' + (a * Math.min(1, 0.25 + d)).toFixed(3) + ')';
          ctx.lineWidth = 3 + 3 * d;
          ctx.beginPath(); ctx.arc(x, y, r + 2 * d * Math.sin(now / 18), 0, Math.PI * 2); ctx.stroke();
        }
        ctx.globalAlpha = k;
        ctx.fillStyle = 'rgba(232,237,242,0.20)'; ctx.strokeStyle = 'rgba(232,237,242,0.85)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      const s = [...sim.said].reverse().find((s) => !s.cut && now < s.t + s.ms + 300);
      if (s) {
        // Big enough to read in the slide GIF, where this 412 px screen shows about 240 px wide.
        ctx.font = "700 25px 'Atkinson Hyperlegible', system-ui, sans-serif";
        const lines = wrap(ctx, '\u201c' + s.text + '\u201d', W - 24 - 68), lh = 32, h = 28 + lines.length * lh;
        const y0 = H - 24 - h;
        ctx.fillStyle = '#172230'; ctx.strokeStyle = '#2c3a49'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(12, y0, W - 24, h, 16); ctx.fill(); ctx.stroke();
        ctx.save(); // a speaker: box, cone, two waves
        ctx.translate(28, y0 + 14 + lh / 2); ctx.scale(1.4, 1.4);
        ctx.fillStyle = ctx.strokeStyle = '#2bb3a3'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(5, -4); ctx.lineTo(11, -9); ctx.lineTo(11, 9); ctx.lineTo(5, 4); ctx.lineTo(0, 4); ctx.closePath(); ctx.fill();
        for (const r of [6, 11]) { ctx.beginPath(); ctx.arc(11, 0, r, -0.8, 0.8); ctx.stroke(); }
        ctx.restore();
        ctx.fillStyle = '#e8edf2'; ctx.textBaseline = 'middle';
        lines.forEach((l, i) => ctx.fillText(l, 12 + 64, y0 + 14 + lh / 2 + i * lh));
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
})();`;
// The tutor's pointer, which a headless screenshot never shows: an arrow that follows the mouse, a ring on each press.
const STAGE_SIM = `addEventListener('DOMContentLoaded', () => {
  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.style.cssText = 'position:fixed;left:0;top:0;width:36px;height:36px;pointer-events:none;z-index:2147483647;transform:translate(-100px,-100px)';
  svg.innerHTML = '<path d="M3 2l15 11.5-6.6.9 3.9 7.6-2.9 1.5-3.9-7.7L3 20.6z" fill="#0e1620" stroke="#ffffff" stroke-width="1.6" stroke-linejoin="round"/>';
  document.body.append(svg);
  const ring = (x, y) => {
    const r = document.createElement('div');
    r.style.cssText = 'position:fixed;width:36px;height:36px;margin:-18px 0 0 -18px;border-radius:50%;border:3px solid #ffb020;pointer-events:none;z-index:2147483646;left:' + x + 'px;top:' + y + 'px;transition:transform 380ms ease-out,opacity 380ms ease-out';
    document.body.append(r);
    requestAnimationFrame(() => { r.style.transform = 'scale(1.8)'; r.style.opacity = '0'; });
    setTimeout(() => r.remove(), 450);
  };
  addEventListener('mousemove', (e) => { svg.style.transform = 'translate(' + (e.clientX - 3) + 'px,' + (e.clientY - 2) + 'px)'; }, true);
  addEventListener('mousedown', (e) => ring(e.clientX, e.clientY), true);
});`;

const procs = [];
const work = mkdtempSync(join(tmpdir(), 'feelink-sim-'));
let bws = null;
async function cleanup() {
  try { bws?.close(); } catch {}
  for (const p of procs) try { p.kill(); } catch {}
  for (let i = 0; i < 10; i++) { try { rmSync(work, { recursive: true, force: true }); break; } catch { await sleep(300); } }
}

try {
  let port = await freePort();
  while (port === 8765) port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  procs.push(spawn(process.env.PYTHON || 'python', ['-I', '-u', 'feelink/server.py', String(port)], { cwd: root, stdio: 'ignore' }));
  let up = false;
  for (let i = 0; i < 50 && !up; i++) { try { up = (await fetch(`${base}/feel`)).ok; } catch { await sleep(200); } }
  if (!up) throw new Error('test relay did not start on port ' + port);
  const post = async (body) => { if ((await (await fetch(`${base}/event`, { method: 'POST', body: JSON.stringify(body) })).text()) !== 'ok') throw new Error('relay refused ' + body.type); };

  const chrome = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => p && existsSync(p));
  if (!chrome) throw new Error('Chrome not found; set CHROME=<path to chrome>');
  const dport = await freePort();
  procs.push(spawn(chrome, ['--headless=new', `--remote-debugging-port=${dport}`, `--user-data-dir=${join(work, 'profile')}`, '--no-first-run',
    '--no-default-browser-check', '--hide-scrollbars', '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows', '--window-size=1920,1080', 'about:blank'], { stdio: 'ignore' }));
  let wsUrl = null;
  for (let i = 0; i < 75 && !wsUrl; i++) { try { wsUrl = (await (await fetch(`http://127.0.0.1:${dport}/json/version`)).json()).webSocketDebuggerUrl; } catch { await sleep(200); } }
  if (!wsUrl) throw new Error('Chrome did not start');
  bws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { bws.onopen = res; bws.onerror = rej; });
  let id = 0;
  const pending = new Map(), errors = [], frames = { stage: [], phone: [] }, sessions = {};
  const send = (method, params = {}, sessionId) => new Promise((res) => { const my = ++id; pending.set(my, res); bws.send(JSON.stringify({ id: my, method, params, sessionId })); });
  bws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); return; }
    const who = Object.keys(sessions).find((k) => sessions[k] === msg.sessionId);
    if (msg.method === 'Page.screencastFrame' && who) {
      const n = frames[who].length + 1, file = `f${String(n).padStart(6, '0')}.jpg`;
      writeFileSync(join(work, who, file), Buffer.from(msg.params.data, 'base64'));
      frames[who].push({ file, t: msg.params.metadata.timestamp });
      send('Page.screencastFrameAck', { sessionId: msg.params.sessionId }, msg.sessionId);
    }
    if (msg.method === 'Runtime.exceptionThrown') errors.push(`${who}: ` + msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || '').slice(0, 200));
    const entry = msg.method === 'Log.entryAdded' && msg.params.entry;
    if (entry && entry.level === 'error' && !/\/favicon\.ico$/.test(entry.url || '')) errors.push(`${who}: ${entry.text}`.slice(0, 200));
  };
  async function open(name, metrics, script) {
    mkdirSync(join(work, name));
    const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
    const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
    sessions[name] = sessionId;
    const s = (method, params) => send(method, params, sessionId);
    for (const m of ['Runtime.enable', 'Log.enable', 'Page.enable']) await s(m);
    await s('Emulation.setFocusEmulationEnabled', { enabled: true });
    await s('Emulation.setDeviceMetricsOverride', metrics);
    if (metrics.mobile) await s('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await s('Page.addScriptToEvaluateOnNewDocument', { source: script });
    const ev = async (expression) => {
      const r = await s('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (r.result?.exceptionDetails) throw new Error(`${name}: ${expression.slice(0, 60)}: ` + JSON.stringify(r.result.exceptionDetails).slice(0, 300));
      return r.result.result.value;
    };
    return { s, ev };
  }
  const stage = await open('stage', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false }, STAGE_SIM);
  const phone = await open('phone', { width: 412, height: 915, deviceScaleFactor: 2.625, mobile: true }, PHONE_SIM);

  // The lesson as the tutor prepared it: step 1 shown, step 2 hidden until Next.
  for (const ev of [{ type: 'clear' },
    { type: 'stroke', id: 'hall', by: 'tutor', pts: path(CLASS, CORNER) }, { type: 'landmark', id: 'm-class', ...CLASS, name: 'Classroom', by: 'tutor', start: true },
    { type: 'stroke', id: 'cross', by: 'tutor', pts: path(CORNER, OFFICE) }, { type: 'landmark', id: 'm-office', ...OFFICE, name: 'Office', by: 'tutor' },
    { type: 'reveal', upto: 1 }]) await post(ev);
  await stage.s('Page.navigate', { url: `${base}/stage` });
  await phone.s('Page.navigate', { url: `${base}/feel` });
  await sleep(2500);

  // Input, timed by the wall clock rather than by sleeps: every CDP call slows down while both pages are recorded, and a
  // finger or pointer that waited on them would crawl. Board positions come from each page's own mapping, read once.
  const walk = async (pts, speed, fn) => { // along a polyline at `speed` (its units per second), fn(point, ms, a, b) ~60 Hz
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    const total = cum[cum.length - 1], start = performance.now();
    for (let i = 0; ;) {
      const ms = performance.now() - start, d = Math.min(total, ms / 1000 * speed);
      while (i < pts.length - 2 && cum[i + 1] < d) i++;
      const k = cum[i + 1] > cum[i] ? (d - cum[i]) / (cum[i + 1] - cum[i]) : 1;
      await fn({ x: pts[i].x + (pts[i + 1].x - pts[i].x) * k, y: pts[i].y + (pts[i + 1].y - pts[i].y) * k }, ms, pts[i], pts[i + 1]);
      if (d >= total) return;
      await sleep(14);
    }
  };
  const view = await stage.ev('({ x: view.x, y: view.y, s: view.scale })');
  const onStage = (p) => [view.x + p.x * view.s, view.y + p.y * view.s];
  let mouseAt = [1100, 700], mouseButtons = 0;
  const mouse = (type, x, y) => stage.s('Input.dispatchMouseEvent', { type, x, y, button: type === 'mouseMoved' ? 'none' : 'left', buttons: mouseButtons, clickCount: 1 });
  const glideMouse = async ([x, y], ms = 600) => {
    const [x0, y0] = mouseAt, start = performance.now();
    for (;;) {
      const k = Math.min(1, (performance.now() - start) / ms), e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      mouseAt = [x0 + (x - x0) * e, y0 + (y - y0) * e];
      await mouse('mouseMoved', ...mouseAt);
      if (k >= 1) return;
      await sleep(14);
    }
  };
  const press = async () => { mouseButtons = 1; await mouse('mousePressed', ...mouseAt); };
  const release = async () => { mouseButtons = 0; await mouse('mouseReleased', ...mouseAt); };
  const click = async () => { await sleep(150); await press(); await sleep(90); await release(); };
  const clickEl = async (sel) => {
    await glideMouse(await stage.ev(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`), 700);
    await click(); await sleep(250);
  };
  const key = async (k, code, vk, text) => {
    await stage.s('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code, windowsVirtualKeyCode: vk, text });
    await stage.s('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, windowsVirtualKeyCode: vk });
  };
  let fingerDown = false, toPhone = null;
  const touch = (type, pts) => phone.s('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y]) => ({ x, y, radiusX: 9, radiusY: 9, force: 0.5 })) });
  // The student's finger, with a slight sideways wobble so it reads as a hand, not a plotter.
  const trace = (pts, mmPerS = 25, wobble = 0.4) => walk(pts, mmPerS, async (p, ms, a, b) => {
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1, w = wobble * Math.sin(ms / 180);
    await touch(fingerDown ? 'touchMove' : 'touchStart', [toPhone({ x: p.x - (b.y - a.y) / len * w, y: p.y + (b.x - a.x) / len * w })]);
    fingerDown = true;
  });
  const lift = async () => { await touch('touchEnd', []); fingerDown = false; };

  // Record. Both pages' frames carry wall-clock times, so the two clips start and end together.
  const t0 = Date.now() / 1000;
  await stage.s('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 2 });
  await phone.s('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: 600, maxHeight: 1334, everyNthFrame: 2 });
  await glideMouse([1250, 640], 400);
  await sleep(600);
  // The student taps Connect; the screen goes dark and says so.
  const [cx, cy] = await phone.ev(`(() => { const r = document.getElementById('live').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);
  await touch('touchStart', [[cx, cy]]); await sleep(140); await lift();
  const [ppm, ox, oy] = await phone.ev('[pxPerMm, originX, originY]');
  toPhone = (p) => [ox + p.x * ppm, oy + p.y * ppm];
  await sleep(2000);
  // Finding the start: down 22 mm off the hall line (silent), guided onto it by quickening taps, then up it to Classroom.
  await trace(path({ x: 34, y: 42 }, { x: 24, y: 37 }, { x: 17, y: 35 }), 9, 0);
  await trace(path({ x: 17, y: 35 }, { x: 12, y: 34 }), 8, 0);
  await sleep(300);
  await trace(path({ x: 12, y: 34 }, CLASS), 20);
  await sleep(1600);
  await trace(path(CLASS, CORNER));
  await sleep(800);
  // The tutor reveals step 2.
  await clickEl('#revealNext');
  await sleep(1700);
  await trace(path(CORNER, OFFICE));
  await sleep(1200);
  // Mid-lesson change: the tutor draws the last leg from Office while the student waits there, then labels Library.
  await glideMouse(onStage(LEG[0]), 700);
  await press();
  await walk(path(...LEG), 45, async (p) => { mouseAt = onStage(p); await mouse('mouseMoved', ...mouseAt); });
  await release();
  await sleep(400);
  await clickEl('#toolMark');
  await glideMouse(onStage(LIB), 600);
  await click(); await sleep(400);
  for (const ch of 'Library') { await stage.s('Input.insertText', { text: ch }); await sleep(110); }
  await sleep(200);
  await key('Enter', 'Enter', 13, '\r');
  await glideMouse([1330, 860], 500);
  await sleep(2700); // the student sets off once the phone has said the drawing changed (1.5 s settle, then the words)
  await trace(path(...LEG));
  await sleep(2000);
  const t1 = Date.now() / 1000;
  await stage.s('Page.stopScreencast');
  await phone.s('Page.stopScreencast');
  await sleep(300);

  const said = await phone.ev('__sim.said.map((s) => s.text)');
  const buzzes = await phone.ev('__sim.buzz.length');
  const board = await stage.ev(`({ strokes: strokes.length, marks: landmarks.map((l) => l.name + (l.start ? '*' : '')).join(','), reveal })`);
  const boardMid = await stage.ev('view.x + BOARD.w * view.scale / 2');
  await lift();
  console.log(`take: ${(t1 - t0).toFixed(1)} s, frames stage ${frames.stage.length}, phone ${frames.phone.length}`);
  console.log('phone said (stubbed speech):', JSON.stringify(said));
  console.log('vibrate() calls (stubbed):', buzzes, '| stage board:', JSON.stringify(board));
  if (errors.length) throw new Error('page errors: ' + errors.join(' | '));
  const want = ['Start: Classroom', 'Drawing updated.', 'Office', 'Drawing changed.', 'Library'];
  if (want.some((w) => !said.includes(w)) || board.marks !== 'Classroom*,Office,Library' || board.strokes !== 3) throw new Error('the lesson did not play as scripted');

  // Frames -> constant 30 fps clips (compose.py frames), then the composed take and the whole stage window.
  const stamp = new Date().toLocaleDateString('en-CA').replaceAll('-', '');
  const raw = join(root, 'recordings', 'raw');
  mkdirSync(raw, { recursive: true });
  const py = (args) => { const r = spawnSync(process.env.PYTHON || 'python', ['tools/record/compose.py', ...args], { cwd: root, stdio: 'inherit' }); if (r.status !== 0) throw new Error('compose.py ' + args[0] + ' failed'); };
  const clips = {};
  for (const who of ['stage', 'phone']) {
    const fs = frames[who];
    if (!fs.length) throw new Error('no frames from ' + who);
    let list = 'ffconcat version 1.0\n';
    fs.forEach((f, i) => { list += `file '${f.file}'\nduration ${(((i + 1 < fs.length ? fs[i + 1].t : t1) - (i ? f.t : t0))).toFixed(4)}\n`; });
    list += `file '${fs[fs.length - 1].file}'\n`;
    writeFileSync(join(work, who, 'frames.txt'), list);
    clips[who] = join(raw, `${stamp}-${NAME}-${who}.mp4`);
    py(['frames', join(work, who, 'frames.txt'), clips[who]]);
  }
  // The stage panel: a 960 x 1080 window centred on the board, read off the page (compose's auto crop would also take in
  // the white text of the tool and session panels).
  const crop = `960:1080:${Math.round(boardMid - 480)}:0`;
  const dur = (t1 - t0).toFixed(2);
  py(['compose', '--stage', clips.stage, '--phone', clips.phone, '--stage-start', '0', '--phone-start', '0', '--dur', dur,
    '--stage-crop', crop, '--label', LABEL, '--name', NAME]);
  py(['single', clips.stage, '--label', LABEL, '--name', NAME + '-stage']);
} catch (e) {
  console.error('sim_take:', e.message || e);
  process.exitCode = 1;
} finally {
  await cleanup();
}
