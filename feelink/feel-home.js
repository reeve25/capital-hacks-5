// FeelInk phone, the home screen and start-up, loaded last: the link status sentence, Connect and the /dev buttons,
// Advanced settings, the /dev toggle, then the first connect and config. It calls into feel-live.js.

// /dev is this page with the development and validation tools shown (practice, blind test, buzz check, initials);
// /feel and / are the student's. Decided for #90: one file, so the test mode cannot drift from the live page.
const DEV = location.pathname === '/dev';

const store = {
  get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};

// The link to the laptop's relay, in words: connecting (first try), waiting (never connected yet, retrying), on, or
// lost (was on, now retrying). The page never gives up, so there is no final "disconnected": waiting and lost are it.
// One table for the screen and the voice, so they always agree: off the link, the phone says the status sentence.
// In Live a change is spoken once, on the change itself: EventSource fires onerror on every failed retry.
const LINK = {
  connecting: { text: 'Connecting to the laptop…', sub: '' },
  waiting: { text: 'Waiting for the laptop', sub: 'Ask your tutor to start FeelInk on their laptop. This phone connects by itself.' },
  on: { text: 'Connected to the laptop', sub: 'Tap Connect to tutor to feel the drawing.' },
  lost: { text: 'Reconnecting to the laptop', sub: 'The connection dropped. Keep this page open. It reconnects by itself.' },
};
const linkLine = (s) => LINK[s].text.replace(/…$/, '') + '.';
const WELCOME = 'Connected to your tutor. Touch the screen to explore.';
let link = 'connecting', welcomed = false, leftLive = false; // leftLive: home after Back, worded as a return
function showLink() {
  $('net').textContent = LINK[link].text;
  $('netsub').textContent = link === 'on' && leftLive ? 'You left the drawing. Tap Connect to tutor to go back.' : LINK[link].sub;
  $('conn').dataset.state = link;
}
function setLink(next) {
  const was = link;
  link = next;
  showLink();
  if (mode !== 'live' || was === next) return;
  if (next === 'on') { say(welcomed ? 'Connected again.' : WELCOME, 'status'); welcomed = true; }
  else say(linkLine(next), 'status');
}

// Setup
// A new key, so the narrower core starts at its default instead of the old line width.
// Reeve and Nathan, Nov 7 15:00, after the blind run at 14 mm: a strong core of 1-5 mm reads best, 14 mm never will.
// Stored values from the old 2-14 range are clamped into the slider, which then reports the clamped value.
$('width').value = Math.min(5, Math.max(1, +store.get('fi.core', '4')));
$('who').value = store.get('fi.who', '');
const showWidth = () => {
  $('wval').textContent = $('width').value; $('fval').textContent = fadeMm();
  $('width').setAttribute('aria-valuetext', `${$('width').value} millimetres`);
};
showWidth();
$('width').oninput = () => { showWidth(); store.set('fi.core', $('width').value); sendConfig(); };
$('who').oninput = () => store.set('fi.who', $('who').value);
// /dev opens with the tools shown and the settings open, since testers tune them; /feel keeps both out of the way.
$('dev').hidden = !DEV;
if (DEV) { $('advanced').open = true; document.title = 'FeelInk dev'; }
if (!canVibrate) $('warn').textContent = "This browser can't vibrate, so you won't feel the drawing. Open this page in Chrome on an Android phone.";
const enterFullscreen = () => { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); };
$('buzz').onclick = () => { if (canVibrate) navigator.vibrate(300); };
$('practice').onclick = () => { enterFullscreen(); startPractice(); };
$('test').onclick = () => { enterFullscreen(); startTest(); };
$('live').onclick = () => { enterFullscreen(); startLive(); };
$('right').onclick = () => mark(true);
$('wrong').onclick = () => mark(false);
$('again').onclick = goHome;
showLink();
connect();
sendConfig();
layout();
