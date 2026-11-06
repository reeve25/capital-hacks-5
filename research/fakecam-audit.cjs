// Audit infrastructure only: no product, real camera, microphone or user profile.
// Run: node research/fakecam-audit.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(
  process.env.LOCALAPPDATA, 'npm-cache/_npx/705bc6b22212b352/node_modules/playwright-core'));

async function main() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'silent voice audit '));
  const fixture = path.join(directory, 'two tones.y4m');
  const parts = [Buffer.from('YUV4MPEG2 W64 H48 F10:1 Ip A1:1 C420jpeg\n')];
  for (let index = 0; index < 20; index++) {
    parts.push(Buffer.from('FRAME\n'), Buffer.alloc(64 * 48, index < 10 ? 40 : 200),
      Buffer.alloc(64 * 48 / 2, 128));
  }
  fs.writeFileSync(fixture, Buffer.concat(parts));
  const server = http.createServer((_, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end('<!doctype html><title>Audit fixture only</title>');
  });
  let browser;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({
      executablePath: process.env.AUDIT_CHROMIUM || path.join(process.env.LOCALAPPDATA,
        'ms-playwright/chromium-1248/chrome-win64/chrome.exe'),
      headless: true,
      args: ['--use-fake-device-for-media-stream',
        `--use-file-for-fake-video-capture=${fixture.replaceAll('\\', '/')}`]
    });
    const context = await browser.newContext();
    await context.grantPermissions(['camera'], { origin });
    const page = await context.newPage();
    await page.goto(origin);
    const result = await page.evaluate(async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const video = document.createElement('video');
      video.muted = true;
      video.srcObject = stream;
      await video.play();
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 48;
      const context = canvas.getContext('2d');
      const samples = [];
      const started = performance.now();
      while (performance.now() - started < 2500) {
        await new Promise(resolve => setTimeout(resolve, 100));
        context.drawImage(video, 0, 0, 64, 48);
        samples.push(context.getImageData(32, 24, 1, 1).data[0]);
      }
      const settings = stream.getVideoTracks()[0].getSettings();
      const audioTracks = stream.getAudioTracks().length;
      stream.getTracks().forEach(track => track.stop());
      return { settings, audioTracks, samples };
    });
    assert.equal(result.audioTracks, 0);
    assert.equal(result.settings.width, 64);
    assert.equal(result.settings.height, 48);
    assert.ok(Math.min(...result.samples) < 70, 'dark fixture frames missing');
    assert.ok(Math.max(...result.samples) > 180, 'light fixture frames missing');
    console.log(JSON.stringify({ passed: true, platform: process.platform,
      playwright: require(path.join(path.dirname(require.resolve(process.env.PLAYWRIGHT_MODULE ||
        path.join(process.env.LOCALAPPDATA, 'npm-cache/_npx/705bc6b22212b352/node_modules/playwright-core'))),
        'package.json')).version,
      chromium: browser.version(), fixturePathContainsSpaces: fixture.includes(' '),
      dimensions: [result.settings.width, result.settings.height],
      samples: result.samples.length, redRange: [Math.min(...result.samples), Math.max(...result.samples)],
      audioTracks: result.audioTracks }));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
    fs.unlinkSync(fixture);
    fs.rmdirSync(directory);
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
