// Evaluate one JS expression in the Pixel's localhost:8765 Chrome tab over DevTools (adb forward tcp:9222), optionally after a reload.
// Usage: node tools/pixel_tab.mjs "<expression>" [reload]   -- only ever touches localhost:8765 tabs (Nathan's phone).
const expr = process.argv[2] ?? "location.href";
const doReload = process.argv[3] === "reload";
setTimeout(() => { console.log("timeout"); process.exit(3); }, 12000);
const tabs = await (await fetch("http://127.0.0.1:9222/json")).json();
const tab = tabs.find((t) => t.url.startsWith("http://localhost:8765"));
if (!tab) { console.log("no localhost:8765 tab; tabs:", tabs.length); process.exit(2); }
console.log("tab", tab.id, tab.url);
const ws = new WebSocket(tab.webSocketDebuggerUrl);
let id = 0;
const send = (method, params = {}) => new Promise((res) => {
  const my = ++id;
  const on = (ev) => { const m = JSON.parse(ev.data); if (m.id === my) { ws.removeEventListener("message", on); res(m); } };
  ws.addEventListener("message", on);
  ws.send(JSON.stringify({ id: my, method, params }));
});
ws.addEventListener("open", async () => {
  if (doReload) { await send("Page.reload", { ignoreCache: true }); await new Promise((r) => setTimeout(r, 2500)); console.log("reloaded"); }
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
  console.log("result:", JSON.stringify(r.result?.result?.value ?? r.result ?? r.error));
  ws.close(); process.exit(0);
});
