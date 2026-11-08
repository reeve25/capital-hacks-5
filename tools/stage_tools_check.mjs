// Drive every stage tutor tool (#141) through headless Chrome over CDP against a TEST relay, checking the real state
// after each step: Draw, Label, Start point (buttons and D/L/S/Escape), rename, Undo/U, Clear/C and its in-place toast,
// Previous/Next/Reveal all and P/N/Shift+N, keyboard focus, and that the board's view never moves. Posts its own test
// route (Classroom start -> Library) first, so it clears that relay's board. Never point it at the live relay (8765).
// Run from the repo root:
//   python -I -u feelink/server.py 8766
//   chrome --headless=new --remote-debugging-port=9333 --user-data-dir=<a scratch dir> --window-size=1600,1000 about:blank
//   node tools/stage_tools_check.mjs 8766      -> one PASS/FAIL line per step, exit 0 when all pass with no console errors
const port = process.argv[2];
if (!port || port === '8765') throw new Error('usage: node tools/stage_tools_check.mjs <test relay port, never 8765>');
const postEv = async (body) => (await fetch(`http://127.0.0.1:${port}/event`, { method: 'POST', body: JSON.stringify(body) })).text();
const routePts = [...Array.from({ length: 26 }, (_, i) => ({ x: 10, y: 20 + 2 * i })), ...Array.from({ length: 17 }, (_, i) => ({ x: 12 + 2 * i, y: 70 })),
  ...Array.from({ length: 15 }, (_, i) => ({ x: 45, y: 72 + 2 * i }))];
for (const ev of [{ type: 'clear' }, { type: 'stroke', id: 'route1', by: 'tutor', pts: routePts },
  { type: 'landmark', id: 'm-class', x: 10, y: 20, name: 'Classroom', by: 'tutor', start: true },
  { type: 'landmark', id: 'm-lib', x: 45, y: 100, name: 'Library', by: 'tutor' }]) {
  if ((await postEv(ev)) !== 'ok') throw new Error('relay refused ' + ev.type);
}
const tabs = await (await fetch('http://127.0.0.1:9333/json')).json();
const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl);
let id = 0;
const errors = [], results = [];
const send = (method, params = {}) => new Promise((res) => {
  const my = ++id;
  const on = (ev) => { const m = JSON.parse(ev.data); if (m.id === my) { ws.removeEventListener('message', on); res(m); } };
  ws.addEventListener('message', on); ws.send(JSON.stringify({ id: my, method, params }));
});
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text + ' ' + (m.params.exceptionDetails.exception?.description || '').slice(0, 200));
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push(m.params.entry.text.slice(0, 200));
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true }); if (r.result?.exceptionDetails) throw new Error(expr + ': ' + JSON.stringify(r.result.exceptionDetails).slice(0, 300)); return r.result.result.value; };
const state = () => ev(`({ tool, data: document.body.dataset.tool, pressed: Object.fromEntries(Object.entries(tools).map(([k, b]) => [k, b.getAttribute('aria-pressed')])),
  readout: readout.textContent, marks: landmarks.map((l) => l.name + (l.start ? '*' : '')).join(','), strokes: strokes.length, reveal,
  toast: !toast.hidden, editRow: !editRow.hidden, namebox: nameWrap.style.display === 'block', nameStart: nameStart.checked, nameVal: nameBox.value,
  meter: revealText.textContent, note: stepNote.textContent, focus: document.activeElement && document.activeElement.id,
  dis: ['revealPrev', 'revealNext', 'revealAll'].map((i) => document.getElementById(i).getAttribute('aria-disabled')).join(',') })`);
const check = (name, ok, got) => { results.push([ok ? 'PASS' : 'FAIL', name, ok ? '' : JSON.stringify(got)]); };
const key = async (k, code, mods = 0, text) => {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code, modifiers: mods, text: text ?? (k.length === 1 ? k : undefined), windowsVirtualKeyCode: k.length === 1 ? k.toUpperCase().charCodeAt(0) : undefined });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, modifiers: mods, windowsVirtualKeyCode: k.length === 1 ? k.toUpperCase().charCodeAt(0) : undefined });
  await sleep(250);
};
const shiftKey = async (type) => { await send('Input.dispatchKeyEvent', { type, key: 'Shift', code: 'ShiftLeft', modifiers: type === 'keyDown' ? 8 : 0, windowsVirtualKeyCode: 16 }); };
const mouse = async (type, x, y, mods = 0) => send('Input.dispatchMouseEvent', { type, x, y, button: type === 'mouseMoved' ? 'none' : 'left', buttons: type === 'mousePressed' || (type === 'mouseMoved' && mouse.down) ? 1 : 0, clickCount: 1, modifiers: mods });
const click = async (x, y) => { await mouse('mouseMoved', x, y); await mouse('mousePressed', x, y); await mouse('mouseReleased', x, y); await sleep(300); };
const center = async (sel) => ev(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);
const clickEl = async (sel) => { const [x, y] = await center(sel); await click(x, y); };
const px = async (mx, my) => ev(`[view.x + ${mx} * view.scale, view.y + ${my} * view.scale]`);

ws.addEventListener('open', async () => {
  try {
    await send('Runtime.enable'); await send('Log.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: `http://127.0.0.1:${port}/stage` });
    await sleep(2500);
    const view0 = await ev('JSON.stringify(view)');
    let s = await state();
    check('starts on Draw', s.tool === 'draw' && s.pressed.draw === 'true' && s.pressed.label === 'false' && s.pressed.start === 'false' && /Drag on the board/.test(s.readout), s);
    check('route loaded', s.marks === 'Classroom*,Library' && s.strokes === 1, s);

    await clickEl('#toolMark'); s = await state();
    check('Label button arms Label', s.tool === 'label' && s.data === 'label' && s.pressed.label === 'true' && /add a label/.test(s.readout), s);
    await clickEl('#toolMark'); s = await state();
    check('Label button again back to Draw', s.tool === 'draw', s);
    await key('l', 'KeyL'); s = await state();
    check('L arms Label', s.tool === 'label', s);
    await key('l', 'KeyL'); s = await state();
    check('L again back to Draw', s.tool === 'draw', s);
    await key('l', 'KeyL'); await key('d', 'KeyD'); s = await state();
    check('D back to Draw', s.tool === 'draw', s);
    await key('l', 'KeyL'); await key('Escape', 'Escape', 0, ''); s = await state();
    check('Escape back to Draw', s.tool === 'draw', s);

    // Start point tool: a click on Library moves the start there.
    await clickEl('#toolStart'); s = await state();
    check('Start point button arms Start', s.tool === 'start' && s.data === 'start' && s.pressed.start === 'true' && /make it the start/.test(s.readout), s);
    await key('l', 'KeyL'); s = await state();
    check('L from Start arms Label', s.tool === 'label', s);
    await clickEl('#toolStart'); await clickEl('#toolStart'); s = await state();
    check('Start point button again back to Draw', s.tool === 'draw', s);
    await clickEl('#toolStart');
    let [x, y] = await px(45, 100); await click(x + 6, y - 4); s = await state();
    check('Start click on Library makes it the start, back to Draw', s.marks === 'Classroom,Library*' && s.tool === 'draw' && !s.namebox, s);
    // S key unchanged: over Classroom toggles it on (and Library off).
    [x, y] = await px(10, 20); await mouse('mouseMoved', x, y); await key('s', 'KeyS'); s = await state();
    check('S over Classroom makes it the start', s.marks === 'Classroom*,Library', s);
    // S over bare paper does nothing.
    [x, y] = await px(30, 50); await mouse('mouseMoved', x, y); await key('s', 'KeyS'); s = await state();
    check('S over bare paper changes nothing', s.marks === 'Classroom*,Library' && s.tool === 'draw', s);
    // Start point on bare paper: name box with Start ticked, Enter saves a new start point.
    await clickEl('#toolStart'); [x, y] = await px(40, 40); await click(x, y); s = await state();
    check('Start click on bare paper opens the name box ticked', s.namebox && s.nameStart && s.nameVal === '' && s.tool === 'draw', s);
    await send('Input.insertText', { text: 'Gym' }); await key('Enter', 'Enter', 0, '\r'); s = await state();
    check('Enter saves Gym as the start', s.marks === 'Classroom,Library,Gym*' && !s.namebox, s);
    // Label tool on a label: rename box with its name; Escape cancels.
    await clickEl('#toolMark'); [x, y] = await px(45, 100); await click(x, y); s = await state();
    check('Label click on Library opens rename', s.namebox && s.nameVal === 'Library' && !s.nameStart, s);
    await key('Escape', 'Escape', 0, ''); s = await state();
    check('Escape closes the name box unchanged', !s.namebox && s.marks === 'Classroom,Library,Gym*', s);
    // Label tool on bare paper: a new label.
    await key('l', 'KeyL'); [x, y] = await px(30, 110); await click(x, y);
    await send('Input.insertText', { text: 'Office' }); await key('Enter', 'Enter', 0, '\r'); s = await state();
    check('Label adds Office', s.marks === 'Classroom,Library,Gym*,Office' && s.tool === 'draw', s);
    // Undo button and U take the last two back.
    await clickEl('#undo'); await sleep(300); s = await state();
    check('Undo button removes Office', s.marks === 'Classroom,Library,Gym*', s);
    await key('u', 'KeyU'); await sleep(300); s = await state();
    check('U removes Gym (start returns to none)', s.marks.startsWith('Classroom') && !s.marks.includes('Gym'), s);

    // Draw: a drag adds a stroke; Shift lights the readout's key.
    [x, y] = await px(40, 30); const [x2, y2] = await px(48, 60);
    await mouse('mouseMoved', x, y); await mouse('mousePressed', x, y); mouse.down = true;
    for (let i = 1; i <= 8; i++) await mouse('mouseMoved', x + (x2 - x) * i / 8, y + (y2 - y) * i / 8);
    await mouse('mouseReleased', x2, y2); mouse.down = false; await sleep(400); s = await state();
    check('drag draws a stroke', s.strokes === 2, s);
    await shiftKey('keyDown'); await sleep(100);
    const lit = await ev(`readout.classList.contains('on')`);
    await shiftKey('keyUp'); await sleep(100);
    const unlit = await ev(`!readout.classList.contains('on')`);
    check('Shift lights the readout key and releases', lit && unlit, { lit, unlit });

    // Present: P, N, Shift+N, and the buttons.
    s = await state();
    check('all shown: Next and Reveal all disabled', s.dis === 'false,true,true' && /All 2 lines shown/.test(s.meter), s);
    await key('p', 'KeyP'); s = await state();
    check('P hides the last line', s.reveal === 1 && /Shown 1 of 2/.test(s.meter) && /hidden/.test(s.note) && s.dis === 'false,false,false', s);
    await clickEl('#revealPrev'); s = await state();
    check('Previous button hides another', s.reveal === 0 && s.dis === 'true,false,false', s);
    await clickEl('#revealPrev'); s = await state();
    check('Previous at none flashes a note', /Everything is hidden/.test(s.note), s);
    await key('n', 'KeyN'); s = await state();
    check('N reveals one', s.reveal === 1, s);
    await clickEl('#revealNext'); s = await state();
    check('Next button reveals the rest', s.reveal == null && /All 2 lines/.test(s.meter), s);
    await key('p', 'KeyP'); await key('p', 'KeyP');
    await shiftKey('keyDown'); await key('N', 'KeyN', 8, 'N'); await shiftKey('keyUp'); s = await state();
    check('Shift+N reveals all', s.reveal == null, s);
    await key('p', 'KeyP'); await clickEl('#revealAll'); s = await state();
    check('Reveal all button', s.reveal == null, s);

    // Edit: Clear swaps in the toast at the same place; its Undo and U restore.
    const rowBox = await ev(`JSON.stringify(editRow.getBoundingClientRect())`);
    await clickEl('#clear'); s = await state();
    const toastBox = await ev(`JSON.stringify(toast.getBoundingClientRect())`);
    const presentTop = await ev(`document.getElementById('presentTitle').getBoundingClientRect().top`);
    check('Clear empties the board and shows the toast in the Edit row', s.strokes === 0 && s.marks === '' && s.toast && !s.editRow, s);
    const rb = JSON.parse(rowBox), tb = JSON.parse(toastBox);
    check('toast sits exactly where the Edit row was', Math.abs(rb.y - tb.y) < 1 && Math.abs(rb.height - tb.height) < 1, { rb, tb, presentTop });
    await clickEl('#undoClear'); await sleep(300); s = await state();
    check('toast Undo restores the board', s.strokes === 2 && s.marks.startsWith('Classroom') && !s.toast && s.editRow, s);
    await key('c', 'KeyC'); s = await state();
    check('C clears with the toast', s.strokes === 0 && s.toast, s);
    await key('u', 'KeyU'); await sleep(300); s = await state();
    check('U restores after C', s.strokes === 2 && !s.toast && s.editRow, s);
    await key('c', 'KeyC'); await sleep(3400); s = await state();
    check('toast leaves after 3 s, Edit row back', !s.toast && s.editRow, s);
    await key('u', 'KeyU'); await sleep(300);

    // Keyboard focus: Tab reaches the tiles, Enter on Clear moves focus into the toast and back.
    // From a fresh load: after clicks, Chrome starts sequential focus at the last click, not at the top.
    await send('Page.navigate', { url: `http://127.0.0.1:${port}/stage` }); await sleep(2000);
    await key('Tab', 'Tab', 0, ''); s = await state();
    check('Tab reaches Draw first', s.focus === 'toolDraw', s);
    await ev(`clearBtn.focus()`); await key('Enter', 'Enter', 0, '\r'); s = await state();
    check('Enter on Clear: focus moves to the toast Undo', s.toast && s.focus === 'undoClear', s);
    await key('Enter', 'Enter', 0, '\r'); await sleep(300); s = await state();
    check('Enter on toast Undo: board back, focus back on Clear', !s.toast && s.focus === 'clear' && s.strokes === 2, s);
    check('board view unchanged by all of it', (await ev('JSON.stringify(view)')) === view0, view0);

    // A change the relay did not take (review, Nov 8): the board says so, pauses, and puts the relay's state back, so the
    // tutor never keeps a step the phone did not get. The next POST is made to fail once, then P (one reveal post).
    const paused = () => ev(`({ on: !pausedEl.hidden, title: pausedTitle.textContent, status: statusText.textContent, inert: leftBody.inert, reveal })`);
    await key('N', 'KeyN', 8); await sleep(300); // everything shown, so the relay's reveal is null
    await ev(`(() => { const real = window.fetch; window.fetch = (u, o) => { if (o && o.method === 'POST') { window.fetch = real; return Promise.reject(new TypeError('test: relay unreachable')); } return real(u, o); }; })()`);
    await key('p', 'KeyP'); let p = await paused();
    check('unsent change: board says so, tools inert', p.on && /did not reach the phone/.test(p.title) && p.status === 'Not sent to the phone' && p.inert, p);
    check('unsent change: relay state back on the board', p.reveal === null, p);
    await key('p', 'KeyP'); p = await paused();
    check('unsent change: keys take nothing while paused', p.reveal === null, p);
    await sleep(3000); p = await paused();
    check('unsent change: notice leaves after 3 s', !p.on && !p.inert, p);
    await key('p', 'KeyP'); await sleep(300); p = await paused();
    check('after the notice a step posts again', p.reveal === 1 && !p.on, p);
    await key('N', 'KeyN', 8); await sleep(300);
    // The relay out of reach: an offline notice over the paper, tools inert, keys ignored; back when it reconnects.
    await ev('es.close()'); await sleep(300); p = await paused();
    check('relay unreachable: "Studio offline" over the board, tools inert', p.on && p.title === 'Studio offline' && p.inert, p);
    await key('p', 'KeyP'); p = await paused();
    check('relay unreachable: P changes nothing', p.reveal === null, p);
    await ev('connect()'); await sleep(800); p = await paused();
    check('relay back: notice gone, tools live', !p.on && !p.inert && p.status !== 'Studio offline', p);
  } catch (e) { results.push(['FAIL', 'script error', String(e).slice(0, 300)]); }
  for (const r of results) console.log(r.join('  '));
  const fails = results.filter((r) => r[0] === 'FAIL').length;
  console.log(`${results.length - fails}/${results.length} passed; console errors: ${errors.length ? errors.join(' | ') : 'none'}`);
  ws.close(); process.exit(fails || errors.length ? 1 : 0);
});
setTimeout(() => { console.log('timeout'); process.exit(3); }, 90000);
