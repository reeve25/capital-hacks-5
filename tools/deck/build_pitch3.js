// FeelInk 3-minute pitch deck, Capital Hacks 5.0, Sun Nov 8 2026 (rebuild after the 12-slide deck was rejected;
// revised 08:00 for Reeve's validation framing and the advisor's corrections).
// Seven slides, one takeaway each, large type, the footage as the centrepiece. 10 x 5.625 in (the Google Slides
// size, so File > Import slides keeps the geometry). Dark slides (title, demo, close) use 0D161E, the footage's own
// background, so the composite still and the GIF sit on the slide without a visible frame. White content slides keep
// the organizers' template look: Poppins, teal 15AAA6, FeelInk green 043927. Speaker notes = .tmp/pitch-script-3min-2026-11-08.md.
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const REPO = path.resolve(__dirname, "../..");
const FINAL = path.join(REPO, "recordings/out/final");
const asset = (name) => {
  const p = path.join(FINAL, name);
  if (!fs.existsSync(p)) throw new Error("missing asset " + p);
  return p;
};

const INK = "121212", SLATE = "64748B", GREEN = "043927", TEAL = "15AAA6", AMBER = "FFB020";
const DARK = "0D161E", PANEL = "16222E", WHITE = "FFFFFF", RULE = "E2E8F0", FILL = "F4F6F8", MIST = "B8C4D0";
const SEMI = "Poppins SemiBold", LIGHT = "Poppins Light";
const W = 10, H = 5.625, M = 0.5, CW = W - 2 * M;

const pres = new pptxgen();
pres.defineLayout({ name: "G16x9", width: W, height: H });
pres.layout = "G16x9";
pres.author = "Reeve Masilamani";
pres.title = "FeelInk: feel the lesson as it is drawn";
pres.defineSlideMaster({ title: "WHITE", background: { color: WHITE } });
pres.defineSlideMaster({ title: "DARK", background: { color: DARK } });

function text(s, t, o) {
  s.addText(t, Object.assign({ fontFace: LIGHT, fontSize: 14, color: INK, margin: 0, isTextBox: true, valign: "top", lineSpacingMultiple: 1.08 }, o));
}
function kicker(s, t, color = SLATE) {
  text(s, t, { x: M, y: 0.38, w: 6, h: 0.3, fontFace: SEMI, fontSize: 11, color, charSpacing: 2 });
}
function heading(s, t, o = {}) {
  text(s, t, Object.assign({ x: M, y: 0.7, w: CW, h: 1.1, fontFace: SEMI, fontSize: 26, color: INK, lineSpacingMultiple: 1.02 }, o));
}
function card(s, x, y, w, h, fill = WHITE, line = RULE) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: line ? { color: line, width: 0.75 } : { type: "none" } });
}
// The product's own marker: an amber ring (a buzz the phone asked for). The deck's one repeated motif.
function ring(s, cx, cy, d = 0.26, color = AMBER, inner = WHITE) {
  s.addShape(pres.shapes.OVAL, { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color }, line: { type: "none" } });
  s.addShape(pres.shapes.OVAL, { x: cx - d / 4, y: cy - d / 4, w: d / 2, h: d / 2, fill: { color: inner }, line: { type: "none" } });
}
function stat(s, big, small, x, y, w, color = GREEN, inkColor = INK) {
  text(s, big, { x, y, w, h: 0.52, fontFace: SEMI, fontSize: 30, color, lineSpacingMultiple: 1 });
  text(s, small, { x, y: y + 0.56, w, h: 0.9, fontSize: 12, color: inkColor, lineSpacingMultiple: 1.1 });
}
const run = (t, o = {}) => ({ text: t, options: o });
function notes(s, t) { s.addNotes(t); }

// ------------------------------------------------------------------ 1 Title (dark)
{
  const s = pres.addSlide({ masterName: "DARK" });
  text(s, "CAPITAL HACKS 5.0  ·  HEALTH + ACCESSIBILITY", { x: M, y: 0.42, w: 5, h: 0.3, fontFace: SEMI, fontSize: 10.5, color: MIST, charSpacing: 2 });
  text(s, "FeelInk", { x: M, y: 1.35, w: 4.4, h: 1.0, fontFace: SEMI, fontSize: 58, color: WHITE, lineSpacingMultiple: 1 });
  text(s, "Feel the lesson as it is drawn.", { x: M, y: 2.42, w: 4.4, h: 0.5, fontFace: SEMI, fontSize: 21, color: TEAL });
  text(s, "A sighted tutor draws on a laptop. A blind student feels the drawing as vibration on an ordinary Android phone, and hears the labels.",
    { x: M, y: 3.05, w: 4.05, h: 1.1, fontSize: 14.5, color: MIST, lineSpacingMultiple: 1.2 });
  text(s, "Reeve Masilamani, UC Davis  ·  Nathan Jeevamani", { x: M, y: 4.85, w: 5, h: 0.3, fontFace: SEMI, fontSize: 11.5, color: WHITE });
  const iw = 5.25, ix = W - iw - 0.02, ih = iw * 9 / 16, iy = 1.15;
  s.addImage({ path: asset("sim-route-lesson-still-5-library.png"), x: ix, y: iy, w: iw, h: ih });
  text(s, "Desktop simulation: scripted finger, simulated buzz and speech.", { x: ix + 0.1, y: iy + ih + 0.1, w: iw - 0.2, h: 0.3, fontSize: 11.5, color: MIST, align: "center" });
  notes(s, "NATHAN, about 10 s.\nSay: \"FeelInk lets a blind student feel what a tutor is drawing, live, on a phone they already own. We're Nathan and Reeve.\"\n\nThe image is the composite still at the end of the desktop simulation (labelled on both panels and in the caption). Do not call it device footage.\n\nWhole deck: 7 slides, 3-minute limit, target about 2:40. Script and timing model: .tmp/pitch-script-3min-2026-11-08.md.");
}

// ------------------------------------------------------------------ 2 Problem (white)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  kicker(s, "THE PROBLEM");
  heading(s, "A diagram drawn in class is hard to share with a blind student while it is still changing.", { w: 8.6 });
  const moments = [
    ["Now", "Sighted classmates see the sketch take shape as the teacher draws."],
    ["Described", "A spoken description has to carry the shape, the turns and where things sit."],
    ["Prepared", "Tactile graphics work well but take preparation; a changing sketch is hard to keep up with."],
  ];
  const cy = 2.2, ch = 2.35, cw = 2.15, gap = 0.18;
  moments.forEach(([k, v], i) => {
    const x = M + i * (cw + gap);
    card(s, x, cy, cw, ch, FILL, null);
    ring(s, x + 0.4, cy + 0.42, 0.3, i === 0 ? TEAL : AMBER, FILL);
    text(s, k, { x: x + 0.25, y: cy + 0.72, w: cw - 0.4, h: 0.35, fontFace: SEMI, fontSize: 17, color: GREEN });
    text(s, v, { x: x + 0.25, y: cy + 1.12, w: cw - 0.45, h: 1.15, fontSize: 12.5, lineSpacingMultiple: 1.16 });
  });
  const sx = M + 3 * (cw + gap) + 0.07, sw = W - M - sx;
  text(s, "$15,500", { x: sx, y: cy + 0.2, w: sw, h: 0.65, fontFace: SEMI, fontSize: 33, color: GREEN, lineSpacingMultiple: 1 });
  text(s, "A refreshable tactile display (APH Monarch) does this live, at that list price.",
    { x: sx, y: cy + 0.95, w: sw, h: 1.4, fontSize: 12.5, color: INK, lineSpacingMultiple: 1.18 });
  text(s, [run("Who: ", { fontFace: SEMI }), run("a blind student, and the teacher or tutor sitting beside them.")], { x: M, y: 4.8, w: CW, h: 0.35, fontSize: 15, color: INK });
  notes(s, "NATHAN, about 22 s.\nSay: \"A teacher sketches a route and the sighted students watch it take shape. For a blind student the sketch has to be described, or prepared ahead as a tactile graphic, and a drawing that changes mid-lesson is hard to keep up with. A refreshable tactile display does this live, at fifteen and a half thousand dollars.\"\n\nNo absolutes about existing methods: descriptions and tactile graphics work, they are slow for a changing sketch. Never say \"2.2 billion blind people\" (the WHO figure is any vision impairment). Price source: aph.org, read Sat Nov 7.");
}

// ------------------------------------------------------------------ 3 Demonstration (dark)
{
  const s = pres.addSlide({ masterName: "DARK" });
  text(s, "The tutor sees the finger stop, reveals the next leg, then redraws the route mid-lesson.",
    { x: M, y: 0.32, w: CW, h: 0.75, fontFace: SEMI, fontSize: 18, color: WHITE, lineSpacingMultiple: 1.05 });
  const gh = 3.98, gw = gh * 16 / 9, gx = (W - gw) / 2, gy = 1.12;
  s.addImage({ path: asset("sim-route-lesson-pitch.gif"), x: gx, y: gy, w: gw, h: gh });
  text(s, "Desktop simulation: scripted finger, vibration and speech stubbed. Saturday's build passed this flow by hand on a Pixel 8.",
    { x: M, y: 5.2, w: CW, h: 0.35, fontSize: 10.5, color: MIST, align: "center" });
  notes(s, "REEVE (handoff), about 40 s: 12 s intro spoken, then about 10 s watching the clip WITHOUT talking, then about 18 s narration. The clip is 20.6 s and loops; within a loop Next is clicked at about 3 s and the Library leg is drawn from about 9 s.\nSay: \"Here is a lesson. Left, the tutor's laptop; right, the student's phone, dark on purpose. A desktop simulation: scripted finger, buzz and speech stubbed.\" [stop talking; let the room watch the finger stop at the corner and the tutor click Next, about 10 s] \"The finger stopped at the corner and the tutor saw it. Next reveals the following leg and the phone announces it. Now the tutor draws a new leg live, names it Library, and the student follows the buzz there. The tutor teaches; the phone becomes the drawing.\"\n\nColours: teal is ink the finger has covered, grey is drawn but not covered, dashed is hidden until Next, the amber ring is a buzz the phone asked for (a request, not proof the motor ran). Never: user, learner, device footage.");
}

// ------------------------------------------------------------------ 4 How it works (white)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  kicker(s, "HOW IT WORKS");
  heading(s, "A stock phone can only buzz as a whole. FeelInk decides when, from where the finger is.", { h: 1.05 });
  const py = 1.9, ph = 1.0, pw = 2.75, pg = 0.375;
  const nodes = [
    ["Tutor's laptop", "Draws, labels, reveals in steps. Sees the finger live."],
    ["Relay", "Python, on the laptop. 4–5 ms to the phone."],
    ["Student's phone", "Chrome, no app to install. Buzz and spoken labels."],
  ];
  nodes.forEach(([k, v], i) => {
    const x = M + i * (pw + pg);
    card(s, x, py, pw, ph, i === 1 ? WHITE : FILL, i === 1 ? RULE : null);
    text(s, k, { x: x + 0.22, y: py + 0.16, w: pw - 0.4, h: 0.32, fontFace: SEMI, fontSize: 15, color: GREEN });
    text(s, v, { x: x + 0.22, y: py + 0.5, w: pw - 0.4, h: 0.48, fontSize: 12, lineSpacingMultiple: 1.1 });
    if (i < 2) {
      const ax = x + pw + 0.06;
      s.addShape(pres.shapes.LINE, { x: ax, y: py + ph / 2, w: pg - 0.12, h: 0, line: { color: TEAL, width: 2, endArrowType: "triangle" } });
    }
  });
  // Three measured facts, each stated by what it enables.
  const ty = 3.08, tw = (CW - 2 * 0.3) / 3;
  stat(s, "1 ms buzz", "ends a buzz, because Chrome ignores the standard stop. So a line can end where the ink ends.", M, ty, tw);
  stat(s, "1 level", "of strength in the Vibration API, so rhythm carries meaning: a hold means on the line, sparse pulses near it, a triple pulse a label.", M + tw + 0.3, ty, tw);
  stat(s, "14 ms", "from finger to the tutor's screen, so the tutor sees exploration stall and can act on it live.", M + 2 * (tw + 0.3), ty, tw);
  text(s, [run("New here: ", { fontFace: SEMI, color: GREEN }), run("drawn live and revealed at the tutor's pace in stock Chrome, with the student's finger shown back to the tutor. Vibration diagrams on tablets were studied earlier (Giudice et al., ASSETS 2012).")],
    { x: M, y: 4.68, w: CW, h: 0.45, fontSize: 11.5, color: INK, lineSpacingMultiple: 1.1 });
  text(s, "Measured on one Pixel 8 over USB, Sat afternoon, early build (192 of 192 finger samples, 151 of 151 strokes delivered). Last hands-on Pixel check: tag demo-2, Sat 20:33. Everything since: desktop only.",
    { x: M, y: 5.2, w: CW, h: 0.35, fontSize: 9.5, color: "475569" });
  notes(s, "REEVE, about 27 s.\nSay: \"FeelInk decides when the phone buzzes, from where the finger is. A one-millisecond buzz ends a buzz, so a line ends where the ink ends. One strength level, so rhythm carries meaning: a hold means on the line, sparse pulses mean near it, a triple pulse means a label. The finger reaches the tutor in fourteen milliseconds, fast enough to see exploration stall.\"\n\nBackup numbers if asked: 0 of 132 Chrome buzzes were ever cancelled by vibrate(0); a 2 s buzz ran 2091 ms; a 1 ms buzz ended it at 311 ms when called at 300 ms; relay to phone median 4-5 ms (151 of 151 strokes); finger back median 14 ms (192 of 192); board mapping error 0.03-0.04 mm; first buzz of a touch 93-196 ms after the request, cause unknown. All on one Pixel 8, Sat afternoon, early build. Strokes simplified at 2 mm; corners at 40 degrees over 5 mm; reveal ordered by arrival.");
}

// ------------------------------------------------------------------ 5 Tested, learned, changed (white)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  kicker(s, "WHAT WE KNOW");
  heading(s, "What we tested, learned and changed.", { h: 0.6 });
  const cy = 1.4, ch = 3.4, cw = (CW - 2 * 0.22) / 3;
  const cols = [
    ["Tested", TEAL, FILL, [
      [run("Pixel 8, Saturday, by hand: connect, trace, hear labels, reveal in steps (tag demo-2).")],
      [run("Delivery measured on the phone: 151 of 151 strokes, 192 of 192 finger samples.")],
      [run("Preliminary: "), run("one eyes-closed run, sighted teammate, older build, 4 of 5 shapes. Not a user test.", { color: SLATE })],
    ]],
    ["Learned", AMBER, WHITE, [
      [run("A blind student with tactile-graph experience raised three concerns: direction off the line, TalkBack, latency.")],
      [run("A state council of the blind's president forwarded our question to members and asked about iOS.")],
    ]],
    ["Changed", GREEN, FILL, [
      [run("Guide-back taps off the line, "), run("in response to the first concern. Built; not felt on a phone yet.", { color: SLATE })],
      [run("Labels speak and the tutor talks; a buzz is never the only signal.")],
      [run("Still open: "), run("TalkBack, first buzz 93–196 ms late, iOS (no Vibration API in Safari).", { color: SLATE })],
    ]],
  ];
  cols.forEach(([title, color, fill, items], c) => {
    const x = M + c * (cw + 0.22);
    card(s, x, cy, cw, ch, fill, fill === WHITE ? RULE : null);
    text(s, title, { x: x + 0.25, y: cy + 0.2, w: cw - 0.4, h: 0.35, fontFace: SEMI, fontSize: 16, color: GREEN });
    let y = cy + 0.65;
    items.forEach((runs) => {
      ring(s, x + 0.36, y + 0.1, 0.2, color, fill);
      const chars = runs.map((r) => r.text).join("").length;
      const h = Math.ceil(chars / 26) * 0.19 + 0.06;
      s.addText(runs, { x: x + 0.58, y, w: cw - 0.8, h, fontFace: LIGHT, fontSize: 11.5, color: INK, margin: 0, isTextBox: true, valign: "top", lineSpacingMultiple: 1.1 });
      y += h + 0.08;
    });
  });
  text(s, "No blind student has tried FeelInk yet. Whether it helps anyone learn is the hypothesis to test.",
    { x: M, y: 4.98, w: CW, h: 0.4, fontFace: SEMI, fontSize: 13.5, color: INK });
  notes(s, "REEVE, about 32 s.\nSay: \"Tested: Saturday's build passed a hands-on check on one Pixel 8; every stroke and finger sample arrived. The eyes-closed run is preliminary, not a user test. Learned: a blind student with tactile-graph experience raised three concerns, direction off the line, TalkBack, and latency; a state council of the blind forwarded our question to its members and asked about iOS. Changed: guide-back taps off the line, built in response, not yet felt on a phone. No blind student has tried FeelInk yet.\"\n\nHard rules: respondents' names and organisations stay out (anonymity promised to the first; no consent asked of the second). Both are written replies to Reeve's outreach email (Sat 17:47 and Sun 05:46 PST), logged in USERS.md. Encouragement and a forwarded question are not a trial. Never \"users\" in the plural. Guide-back taps answer a concern; they do not prove recovery works.");
}

// ------------------------------------------------------------------ 6 Why it matters (dark)
{
  const s = pres.addSlide({ masterName: "DARK" });
  text(s, "WHY IT MATTERS", { x: M, y: 0.38, w: 4, h: 0.3, fontFace: SEMI, fontSize: 10.5, color: MIST, charSpacing: 2 });
  text(s, "The ambition: a live diagram a blind student can explore on Android hardware they already have, if device and user testing bear it out.",
    { x: M, y: 0.72, w: CW, h: 1.35, fontFace: SEMI, fontSize: 24, color: WHITE, lineSpacingMultiple: 1.02 });
  const ly = 2.35;
  text(s, "$15,500", { x: M, y: ly, w: 2.4, h: 0.62, fontFace: SEMI, fontSize: 30, color: MIST, lineSpacingMultiple: 1 });
  text(s, "a refreshable tactile display", { x: M, y: ly + 0.66, w: 2.4, h: 0.3, fontSize: 12.5, color: MIST });
  text(s, "An Android phone", { x: M, y: ly + 1.15, w: 4.1, h: 0.5, fontFace: SEMI, fontSize: 22, color: TEAL, lineSpacingMultiple: 1 });
  text(s, "with Chrome, plus the tutor's laptop and, today, one USB cable. Tested on one Pixel 8 so far. A supplement to tactile graphics and braille, never a replacement.",
    { x: M, y: ly + 1.7, w: 3.9, h: 1.0, fontSize: 12.5, color: MIST, lineSpacingMultiple: 1.18 });
  const nx = 4.9, nw = W - M - nx;
  card(s, nx, ly - 0.1, nw, 2.85, PANEL, null);
  text(s, "Next, in order", { x: nx + 0.3, y: ly + 0.1, w: 3, h: 0.35, fontFace: SEMI, fontSize: 15, color: WHITE });
  const next = [
    "Blind students and their teachers try it, with consent, before we build more.",
    "TalkBack on a real device, and phones beyond one Pixel 8.",
    "A classroom network instead of the cable.",
  ];
  next.forEach((t, i) => {
    const y = ly + 0.62 + i * 0.7;
    s.addShape(pres.shapes.OVAL, { x: nx + 0.3, y: y + 0.02, w: 0.34, h: 0.34, fill: { color: AMBER }, line: { type: "none" } });
    text(s, String(i + 1), { x: nx + 0.3, y: y + 0.02, w: 0.34, h: 0.34, fontFace: SEMI, fontSize: 12, color: DARK, align: "center", valign: "middle", lineSpacingMultiple: 1 });
    text(s, t, { x: nx + 0.78, y, w: nw - 1.05, h: 0.62, fontSize: 13.5, color: WHITE, lineSpacingMultiple: 1.12 });
  });
  notes(s, "NATHAN (handoff), about 18 s.\nSay: \"The ambition: a live diagram a blind student can explore on Android hardware they already have, if device and user testing bear it out. Next: blind students and their teachers try it, with consent, before we build more. FeelInk: feel the lesson as it is drawn.\"\n\nNever \"every Android phone\" or \"nothing to buy\": one Pixel 8 tested; the relay runs on the tutor's laptop and today the phone connects over USB. iOS came up in feedback: Safari has no Vibration API, so it is a question, not a plan.");
}

// ------------------------------------------------------------------ 7 Team and disclosure (white)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  kicker(s, "TEAM");
  text(s, "Thank you", { x: M, y: 0.68, w: 6, h: 0.7, fontFace: SEMI, fontSize: 34, color: GREEN, lineSpacingMultiple: 1 });
  text(s, "FeelInk: feel the lesson as it is drawn.", { x: M, y: 1.35, w: 7, h: 0.35, fontFace: SEMI, fontSize: 16, color: TEAL });
  text(s, [run("Reeve Masilamani", { fontFace: SEMI }), run(", UC Davis. Product, device and engineering.")], { x: M, y: 1.9, w: 4.3, h: 0.6, fontSize: 14, lineSpacingMultiple: 1.15 });
  text(s, [run("Nathan Jeevamani", { fontFace: SEMI }), run(". Presentation and design; the Pixel 8 used for every device check is his.")], { x: 5.2, y: 1.9, w: 4.3, h: 0.6, fontSize: 14, lineSpacingMultiple: 1.15 });
  card(s, M, 2.75, CW, 2.4, FILL, null);
  text(s, "Disclosure", { x: M + 0.3, y: 2.93, w: 3, h: 0.3, fontFace: SEMI, fontSize: 14, color: GREEN });
  const disc = [
    [run("AI tools: ", { fontFace: SEMI }), run("Claude Code (Anthropic) agents and Codex (OpenAI) reviews implemented under our direction; we set the product, tested in the browser and checked the tagged builds on the Pixel by hand.")],
    [run("Open source: ", { fontFace: SEMI }), run("Python standard library (relay), plain browser APIs, FFmpeg, pptxgenjs, Poppins and Atkinson Hyperlegible (Google Fonts), the impeccable (Apache 2.0) and jmo-skills (MIT) agent skills.")],
    [run("Hardware and footage: ", { fontFace: SEMI }), run("owned gear only, one unmodified Pixel 8 and a laptop. The clips are desktop simulations and are labelled as such. Repo started at the event on Friday Nov 6.")],
  ];
  disc.forEach((runs, i) => {
    s.addText(runs, { x: M + 0.3, y: 3.3 + i * 0.58, w: CW - 0.6, h: 0.56, fontFace: LIGHT, fontSize: 11.5, color: INK, margin: 0, isTextBox: true, valign: "top", lineSpacingMultiple: 1.1 });
  });
  notes(s, "NATHAN, about 6 s.\nSay: \"Built with Claude Code and Codex under our direction; the open source is on the slide. Thank you.\"\n\nReeve: UC Davis (Sacramento State is the venue). Nathan: name only, no affiliation. Any code carried over from earlier work would have to be disclosed here (organiser rule); none was.");
}

const out = path.join(REPO, "recordings/out/FeelInk-deck-3min-2026-11-08.pptx");
pres.writeFile({ fileName: out }).then((f) => console.log("wrote", f));
