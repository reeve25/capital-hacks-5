// Renders explainer.html to PNG frames with headless Chrome over the DevTools protocol.
// Usage: node render.mjs <html path> <boundaries csv> <total seconds> <fps> <out dir>
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const [html, bounds, totalS, fpsS, outDir] = process.argv.slice(2);
const total = parseFloat(totalS), fps = parseInt(fpsS, 10);
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
import { resolve } from 'node:path'; const profile = resolve(outDir, '_profile');
mkdirSync(outDir, { recursive: true });
rmSync(profile, { recursive: true, force: true });

const port = 9333;
const proc = spawn(chrome, [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--window-size=1280,720', '--hide-scrollbars', '--force-device-scale-factor=1',
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 150; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (targets.length) break; } catch {}
  await sleep(200);
}
if (!targets?.length) { proc.kill(); throw new Error('chrome did not start'); }
const page = targets.find((t) => t.type === 'page') ?? targets[0];
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });

let id = 0; const pending = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
const url = pathToFileURL(html).href + `?b=${bounds}`;
await send('Page.navigate', { url });
await sleep(800);
await send('Runtime.evaluate', { expression: 'document.fonts.ready.then(()=>1)', awaitPromise: true });

const n = Math.ceil(total * fps);
for (let f = 0; f < n; f++) {
  const t = f / fps;
  await send('Runtime.evaluate', { expression: `render(${t})` });
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${outDir}/f_${String(f).padStart(5, '0')}.png`, Buffer.from(shot.result.data, 'base64'));
  if (f % 100 === 0) console.log(`frame ${f}/${n}`);
}
console.log(`done ${n} frames`);
ws.close(); proc.kill();
