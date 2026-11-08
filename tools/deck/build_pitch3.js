// FeelInk 3-minute pitch deck, Capital Hacks 5.0, Sun Nov 8 2026. Final-review build (manager's version, ~09:50):
// one presenter, seven slides, the competitive landscape on slide 6 ("Where it fits"), validation split into device
// and people, stats that mean something, and the evidence scope stated once (slide 5) instead of hedged everywhere.
// Review inputs: .tmp/final-review/agent-{A,B,C,D}-*.md. 10 x 5.625 in (the Google Slides size, so File > Import slides
// keeps the geometry). Dark slides (title, demo, fit) use 0D161E, the footage's own background. White content slides keep
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
const SEMI = "Poppins SemiBold", LIGHT = "Poppins";  // Regular, not Light: Light at 12-13 pt is thin on a projector (design review)
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
  text(s, small, { x, y: y + 0.56, w, h: 1.1, fontSize: 12.5, color: inkColor, lineSpacingMultiple: 1.1 });
}
function arrow(s, x, y, w, color = TEAL) {
  s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color, width: 2, endArrowType: "triangle" } });
}
// Show one region [x, y, w, h] (pixels) of an image [width, height] at height dh inches; returns the shown width.
function crop(s, file, [iw, ih], [px, py, pw, ph], x, y, dh) {
  const k = dh / ph;
  s.addImage({ path: file, x, y, w: iw * k, h: ih * k, sizing: { type: "crop", x: px * k, y: py * k, w: pw * k, h: ph * k } });
  return pw * k;
}
const run = (t, o = {}) => ({ text: t, options: o });
// Speaker notes: timing, then the Say line exactly as in the script, then the rules and sources for that slide.
const SAY = [];
function notes(s, who, say, rest) { SAY.push(say); s.addNotes(`${who}\nSay: "${say}"\n\n${rest}`); }

// ------------------------------------------------------------------ 1 Title (dark)
{
  const s = pres.addSlide({ masterName: "DARK" });
  const still = asset("sim-route-lesson-still-5-library.png"), SIZE = [1920, 1080];
  const BOARD = [104, 76, 472, 922], PHONE = [1362, 72, 436, 878];
  const ih = 3.6, iy = 1.14, gap = 0.62;
  const pw = PHONE[2] * ih / PHONE[3], bw = BOARD[2] * ih / BOARD[3];
  const px = W - M - pw, bx = px - gap - bw;
  crop(s, still, SIZE, BOARD, bx, iy, ih);
  crop(s, still, SIZE, PHONE, px, iy, ih);
  text(s, "Tutor's laptop", { x: bx - 0.2, y: iy - 0.38, w: bw + 0.4, h: 0.3, fontFace: SEMI, fontSize: 12, color: WHITE, align: "center" });
  text(s, "Student's phone", { x: px - 0.2, y: iy - 0.38, w: pw + 0.4, h: 0.3, fontFace: SEMI, fontSize: 12, color: WHITE, align: "center" });
  arrow(s, bx + bw + 0.12, iy + ih / 2, gap - 0.24);
  const capY = iy + ih + 0.17;
  // One small, honest tag: the hero images are simulation stills (the in-frame tags fall outside the crop).
  text(s, "DESKTOP SIMULATION", { x: px + pw - 3, y: capY, w: 3, h: 0.3, fontFace: SEMI, fontSize: 10, color: AMBER, charSpacing: 2, align: "right" });

  text(s, "CAPITAL HACKS 5.0  ·  HEALTH + ACCESSIBILITY", { x: M, y: 0.42, w: 5, h: 0.3, fontFace: SEMI, fontSize: 11, color: MIST, charSpacing: 2 });
  text(s, "FeelInk", { x: M, y: 1.52, w: 4.4, h: 1.0, fontFace: SEMI, fontSize: 60, color: WHITE, lineSpacingMultiple: 1 });
  text(s, "Feel the lesson as it is drawn.", { x: M, y: 2.6, w: bx - M - 0.2, h: 0.45, fontFace: SEMI, fontSize: 20, color: TEAL });
  text(s, "A sighted tutor draws on a laptop. A blind or low-vision student feels it as vibration on an ordinary Android phone and hears its labels.",
    { x: M, y: 3.22, w: bx - M - 0.45, h: 1.2, fontSize: 14, color: MIST, lineSpacingMultiple: 1.2 });
  text(s, "Reeve Masilamani  ·  Nathan Jeevamani", { x: M, y: capY, w: 4.5, h: 0.3, fontFace: SEMI, fontSize: 12, color: WHITE });
  const say = "FeelInk lets a blind or low-vision student feel what a tutor is drawing, live, as vibration on an ordinary Android phone. We're Nathan and Reeve.";
  notes(s, "About 10 s.", say, "The images are the tutor's board and the student's phone from the end of the desktop simulation (scripted tutor and finger, buzz and speech simulated); the amber tag says so. Never call it device footage.\n\nWhole deck: 7 slides, 3-minute limit, one presenter (organizers' recommendation), teammate joins for Q&A. Script, timing and Q&A: .tmp/pitch-script-3min-2026-11-08.md.");
}

// ------------------------------------------------------------------ 2 Problem (white)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  kicker(s, "THE PROBLEM");
  heading(s, "A sketch that changes mid-lesson is hard to share with a blind or low-vision student.", { w: 8.9, h: 0.95 });
  text(s, [run("Who: ", { fontFace: SEMI, color: GREEN }), run("blind and low-vision students, and the tutors who teach them one to one.")], { x: M, y: 1.78, w: CW, h: 0.35, fontSize: 15 });
  const cy = 2.45, ch = 2.55, gap = 0.25, cw = (CW - 2 * gap) / 3, tx = 0.3, tw = cw - 0.55, by = cy + 1.32;
  const ways = [
    ["Described aloud", "Works, but words must carry the shape and where things sit."],
    ["Tactile graphics", "Work well, but are prepared ahead, so a sketch that changes has to wait."],
  ];
  ways.forEach(([k, v], i) => {
    const x = M + i * (cw + gap);
    card(s, x, cy, cw, ch, FILL, null);
    ring(s, x + tx + 0.15, cy + 0.47, 0.3, AMBER, FILL);
    text(s, k, { x: x + tx, y: cy + 0.82, w: tw, h: 0.38, fontFace: SEMI, fontSize: 17, color: GREEN });
    text(s, v, { x: x + tx, y: by, w: tw, h: 1.1, fontSize: 13.5, lineSpacingMultiple: 1.15 });
  });
  // The user's own words: a teacher of the visually impaired on the live moment (Vanderbilt Research News, Mar 5 2012; read Sat Nov 7).
  const x3 = M + 2 * (cw + gap);
  card(s, x3, cy, cw, ch, GREEN, null);
  text(s, "“We are always one or two steps behind the teacher.”", { x: x3 + tx, y: cy + 0.28, w: tw, h: 1.15, fontFace: SEMI, fontSize: 16, color: WHITE, lineSpacingMultiple: 1.08 });
  text(s, "A teacher of the visually impaired who rebuilds the board's figures with pins and pipe cleaners. Vanderbilt, 2012.", { x: x3 + tx, y: cy + 1.5, w: tw, h: 0.95, fontSize: 11.5, color: WHITE, lineSpacingMultiple: 1.12 });
  const say = "Sighted students watch the sketch take shape. A blind or low-vision student gets it described, or prepared ahead as a tactile graphic. Both lag a sketch that changes mid-lesson. One teacher of the visually impaired put it this way: we are always one or two steps behind the teacher.";
  notes(s, "About 20 s.", say, "No absolutes about existing methods: descriptions and tactile graphics work, they are slow for a changing sketch. Never say \"2.2 billion blind people\" (the WHO figure is any vision impairment).\nQuote source (read): Vanderbilt Research News, \"Haptic tablet\", Mar 5 2012, TVI Ann Smith at Hillsboro High School, who recreates the teacher's shapes with pins and pipe cleaners on a raised-grid bulletin board: \"Because this takes a certain amount of time, we are always one or two steps behind the teacher.\" https://www.vanderbilt.edu/research/2012/03/05/haptic-tablet/ (notes in research/blind-learning-2026-11-07.md).\nPrices and the competitive picture live on slide 6, not here.");
}

// ------------------------------------------------------------------ 3 Demonstration (dark)
{
  const s = pres.addSlide({ masterName: "DARK" });
  text(s, "Tutor sees the finger stop, reveals the next leg, draws a new one.",
    { x: M, y: 0.33, w: 7.1, h: 0.4, fontFace: SEMI, fontSize: 15.5, color: WHITE, lineSpacingMultiple: 1 });
  text(s, "DESKTOP SIMULATION", { x: 7.55, y: 0.37, w: 1.95, h: 0.3, fontFace: SEMI, fontSize: 10, color: AMBER, charSpacing: 2, align: "right" });
  const gh = 4.12, gw = gh * 16 / 9, gx = (W - gw) / 2, gy = 0.86;
  s.addImage({ path: asset("sim-route-lesson-pitch.gif"), x: gx, y: gy, w: gw, h: gh });
  // What the student feels, since the room cannot: the legend replaces the old two-line caveat caption.
  text(s, [run("On a line: ", { fontFace: SEMI, color: WHITE }), run("a steady hum   "), run("Beside it: ", { fontFace: SEMI, color: WHITE }), run("pulses   "), run("At a label: ", { fontFace: SEMI, color: WHITE }), run("a triple pulse and the spoken name")],
    { x: M, y: gy + gh + 0.1, w: CW, h: 0.32, fontSize: 12.5, color: MIST, align: "center" });
  const say = "A lesson, in a desktop simulation: tutor's laptop left, student's phone right. [stop talking for about 10 s and let the room read the legend and watch] The finger stops at the corner; the tutor sees it and reveals the next leg. Then the tutor draws a new leg live and names it Library. The tutor keeps teaching; the drawing reaches the student as it is made.";
  notes(s, "About 32 s: one sentence, then about 10 s watching WITHOUT talking, then the narration. The clip is 20.6 s and loops; the middle panel shows STEP 1 OF 3 (Next click, about 3 s in), STEP 2 (Library leg drawn live, from about 8 s), STEP 3. Narrate the corner line as STEP 1 shows and the Library line as STEP 2 shows; if the loop is elsewhere, say the lines anyway, they hold for any frame.", say,
    "Simulation facts (say only if asked): the tutor and the finger are scripted, the buzz and the speech are simulated; this is Sunday's build, which has not been on a phone. Saturday's build (tag demo-2) passed a hands-on Pixel 8 check at 20:33: connect, trace, a spoken label, hide and show a line. Colours: teal is ink the finger has covered, grey is drawn but not covered, dashed is hidden until Next, the amber ring is a buzz the phone asked for. Never: user, learner, device footage, \"the phone becomes the drawing\".");
}

// ------------------------------------------------------------------ 4 How it works (white)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  kicker(s, "HOW IT WORKS");
  heading(s, "A stock phone can only buzz as a whole. FeelInk decides when, from where the finger is.", { h: 1.0 });
  const py = 1.86, ph = 0.98, pw = 2.75, pg = 0.375;
  const nodes = [
    ["Tutor's laptop", "Draws, labels, reveals in steps. Sees the finger live."],
    ["Relay", "One Python file on the tutor's laptop."],
    ["Student's phone", "A Chrome page, no install. Buzz and spoken labels."],
  ];
  nodes.forEach(([k, v], i) => {
    const x = M + i * (pw + pg);
    card(s, x, py, pw, ph, i === 1 ? WHITE : FILL, i === 1 ? RULE : null);
    text(s, k, { x: x + 0.22, y: py + 0.15, w: pw - 0.4, h: 0.32, fontFace: SEMI, fontSize: 15, color: GREEN });
    text(s, v, { x: x + 0.22, y: py + 0.5, w: pw - 0.4, h: 0.45, fontSize: 12.5, lineSpacingMultiple: 1.1 });
    if (i < 2) arrow(s, x + pw + 0.06, py + ph / 2, pg - 0.12);
  });
  // Three findings, each stated by what it enables. Provenance and backup numbers live in the notes.
  const ty = 3.04, tw = (CW - 2 * 0.3) / 3;
  stat(s, "11 ms", "to stop a buzz. Chrome on our Pixel 8 ignores the standard stop; a 1 ms buzz ends it, so the line stops where the ink ends.", M, ty, tw);
  stat(s, "Rhythm", "stands in for strength. The web API has no amplitude, so: a hold on the line, pulses beside it, a triple at a label.", M + tw + 0.3, ty, tw);
  stat(s, "14 ms", "from the phone's touch event to the tutor's page, over USB. The phone stays dark, so the tutor watches the finger here.", M + 2 * (tw + 0.3), ty, tw);
  s.addShape(pres.shapes.LINE, { x: M, y: 4.8, w: CW, h: 0, line: { color: RULE, width: 0.75 } });
  text(s, [run("What FeelInk adds: ", { fontFace: SEMI, color: GREEN }), run("live strokes, step reveal and spoken labels on a stock phone in Chrome, with the student's finger shown back to the tutor.")],
    { x: M, y: 4.9, w: CW, h: 0.5, fontSize: 12.5, color: INK, lineSpacingMultiple: 1.1 });
  const say = "A one-millisecond buzz ends a buzz, so the line stops where the ink ends. There is no strength control, so rhythm carries meaning: a hold on the line, pulses beside it, a triple at a label. And the finger reaches the tutor's screen in fourteen milliseconds, so the tutor watches the exploration, not the hand.";
  notes(s, "About 27 s.", say, "Provenance, all on one Pixel 8 over USB, Saturday, earlier builds; everything since tag demo-2 is desktop-only. 11 ms: a 2 s buzz \"stopped\" with vibrate(0) ran 2091 ms; replaced by vibrate(1) at 300 ms it ended at 311 ms. dumpsys logged 132 Chrome vibrations and none was ever cancelled, including the ones the page tried to stop with vibrate(0). 14 ms: median from the phone page's touch event to the tutor page's receipt (192 of 192 injected touch samples at about 10 Hz, scripted stage; p90 18 ms); not finger-to-screen, which adds input and render time. Relay to phone median 4-5 ms (151 of 151 stroke updates from 3 shapes). Touch-down buzz delay: 192-197 ms found Saturday afternoon, cut to 3-10 ms by a one-line touchstart fix that shipped in demo-1 and demo-2 (the shipped build was not re-measured). Long buzzes follow the phone's Media vibration setting (51% at 1, 100% at 3), so the demo phone stays at 3. Strokes simplified at 2 mm; corners at 40 degrees over 5 mm; reveal ordered by arrival.\n\"As far as we found\" = web, papers and a 54,000-project Devpost scan; live drawing to pin displays exists (APH Wing It, Dot Canvas), vibration diagrams on tablets since 2012 (Giudice et al.). Never \"first\" or \"only\".");
}

// ------------------------------------------------------------------ 5 Validation (white)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  kicker(s, "VALIDATION");
  heading(s, "It runs on a phone. Next: does it help students?", { h: 0.55, fontSize: 25 });
  // Rows: [label, sub-label, items]; items are [bold lead, rest]. Render lines are estimated from the length (about 88
  // characters per line at 12.5 pt across 6.65 in) and checked on the renders.
  const rows = [
    ["Device", "", [
      ["Pixel 8, by hand: ", "connect, trace, spoken labels, step reveal (Saturday's build)."],
    ]],
    ["People", "informal", [
      ["Eyes closed: ", "a sighted teammate on an older build identified 4 of 5 shapes."],
      ["A teammate's relative ", "with a vision impairment explored a route and said it could help her learn routes before a visit."],
    ]],
    ["Feedback", "two written replies", [
      ["A blind student ", "who reads tactile graphics doubted it would work: no direction off the line, TalkBack, latency, numbness."],
      ["A state council of the blind ", "forwarded our question to members and asked about iOS."],
    ]],
    ["Changed", "", [
      ["Guide-back taps ", "that quicken toward the line: built in response, desktop-only so far."],
      ["Still open: ", "TalkBack, iOS, Wi-Fi instead of USB."],
    ]],
  ];
  const PT = 12.5, LH = 0.215, IX = M + 2.15, IW = W - M - 0.2 - IX, PAD = 0.1, IG = 0.07, RG = 0.08;
  let y = 1.4;
  rows.forEach(([label, sub, items]) => {
    const hs = items.map(([a, b]) => Math.max(1, Math.ceil((a + b).length / 74)) * LH);
    const rh = PAD * 2 + hs.reduce((t, h) => t + h, 0) + IG * (items.length - 1);
    card(s, M, y, CW, rh, FILL, null);
    ring(s, M + 0.36, y + PAD + 0.13, 0.24, AMBER, FILL);
    text(s, label, { x: M + 0.6, y: y + PAD - 0.03, w: 1.5, h: 0.34, fontFace: SEMI, fontSize: 16, color: GREEN });
    if (sub) text(s, sub, { x: M + 0.6, y: y + PAD + 0.3, w: 1.5, h: 0.3, fontSize: 11, color: SLATE, lineSpacingMultiple: 1.05 });
    let iy = y + PAD;
    items.forEach(([a, b], i) => {
      // No empty lead run: pptxgenjs would write two <a:pPr> in one paragraph, which PowerPoint refuses to open.
      text(s, (a ? [run(a, { fontFace: SEMI })] : []).concat(run(b)), { x: IX, y: iy, w: IW, h: hs[i] + 0.02, fontSize: PT, lineSpacingMultiple: 1.07 });
      iy += hs[i] + IG;
    });
    y += rh + RG;
  });
  const say = "It passed our hands-on Pixel check: connect, trace, spoken labels, step reveal. A teammate's relative with a vision impairment explored a route and said it could help her learn routes before a visit. A blind student who reads tactile graphics doubted it would work: direction off the line, TalkBack, latency. We built guide-back taps in response. The real test is next: sessions with students and their teachers.";
  notes(s, "About 35 s. This is the one place the evidence scope is stated; do not repeat it on other slides.", say, "Device: tag demo-2, Reeve, Sat 20:33 (connect, route trace with \"Start: Classroom\" spoken, P hid the route, N restored it). Sunday's build (the clip) has desktop checks only: 61 stage steps, 19 guide checks, 92 unit tests.\nEyes-closed test: Reeve (sighted, knew the 11-shape set), Sat 14:49-14:54, older 14 mm build, 4 of 5 shapes, median 49.9 s per shape; a 10-trial warm-up before the stop fix scored 1 of 10. It does not validate the current build or any educational effect.\nInformal tryout: a relative of a teammate who has a vision impairment (not \"low vision\", not \"blind\"); never her name or the relation; device, build and date not recorded; logged in USERS.md with permission for an anonymous paraphrase. Perceived potential, never demonstrated route learning, obstacle detection or navigation.\nWritten replies (anonymous; names and organisations stay out): Sat 17:47 the blind student (their verdict: the approach won't work in practice; a single vibrating point on flat glass gives no spatial context off the line, TalkBack intercepts single-finger gestures, motor latency and fingertip numbness; suggested sonification or raised-line boards); Sun 05:46 the president of a state council of the blind forwarded our question to members and asked about iOS. A forwarded question is not a trial. Never \"users\" in the plural.\nGuide-back taps (commit Sat 23:26, after the reply): a tap cadence that quickens as the finger nears the nearest line; they signal distance, not direction; 19 of 19 desktop checks; not yet felt on a phone.\nStill open: TalkBack untested (Android sources suggest one-finger exploring never reaches the page with it on); iOS Safari has no Vibration API; venue Wi-Fi and a hotspot failed so the path is USB; the touch-down buzz delay was fixed to 3-10 ms in a Pixel test and shipped, not re-measured.");
}

// ------------------------------------------------------------------ 6 Where it fits (dark): the competitive landscape and the bet
{
  const s = pres.addSlide({ masterName: "DARK" });
  text(s, "COMPETITIVE LANDSCAPE", { x: M, y: 0.38, w: 4, h: 0.3, fontFace: SEMI, fontSize: 11, color: MIST, charSpacing: 2 });
  text(s, "Good tools exist for the live sketch. Each leaves something open.",
    { x: M, y: 0.7, w: 9, h: 0.95, fontFace: SEMI, fontSize: 26, color: WHITE, lineSpacingMultiple: 1.02 });
  const cy = 1.72, ch = 2.22, gap = 0.25, cw = (CW - 2 * gap) / 3, tx = 0.25, tw = cw - 0.5;
  const options = [
    ["Raised-line board", "under $300", "Instant raised lines, sharper than any buzz.", "silent, and a change means a new sheet."],
    ["Refreshable pin display", "$8,500–$15,500", "Live drawing, with braille: Dot Pad; APH Monarch with Wing It.", "cost and availability."],
    ["Vibration on a tablet", "research, 2012 on", "Simple shapes under one finger, accuracy near paper, slowly.", "prepared diagrams, not a tutor drawing live."],
  ];
  options.forEach(([k, price, gives, open], i) => {
    const x = M + i * (cw + gap);
    card(s, x, cy, cw, ch, PANEL, null);
    text(s, k, { x: x + tx, y: cy + 0.16, w: tw, h: 0.3, fontFace: SEMI, fontSize: 13.5, color: WHITE });
    text(s, price, { x: x + tx, y: cy + 0.47, w: tw, h: 0.36, fontFace: SEMI, fontSize: 18, color: AMBER, lineSpacingMultiple: 1 });
    text(s, gives, { x: x + tx, y: cy + 0.9, w: tw, h: 0.66, fontSize: 12, color: MIST, lineSpacingMultiple: 1.12 });
    text(s, [run("Leaves open: ", { fontFace: SEMI, color: WHITE }), run(open)], { x: x + tx, y: cy + 1.56, w: tw, h: 0.62, fontSize: 12, color: WHITE, lineSpacingMultiple: 1.12 });
  });
  // The bet, set apart in the product's teal.
  const by = cy + ch + 0.16, bh = 1.0;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: by, w: CW, h: bh, rectRadius: 0.08, fill: { color: PANEL }, line: { color: TEAL, width: 1.5 } });
  ring(s, M + 0.4, by + 0.34, 0.3, AMBER, PANEL);
  text(s, "FeelInk's bet", { x: M + 0.72, y: by + 0.14, w: 2.3, h: 0.35, fontFace: SEMI, fontSize: 16, color: TEAL });
  text(s, "A drawing that changes at the tutor's pace, speaks its labels and shows the tutor the student's finger, on an ordinary Android phone. Lower fidelity than pins or paper; it works alongside them.",
    { x: M + 3.0, y: by + 0.1, w: CW - 3.2, h: bh - 0.14, fontSize: 12.5, color: WHITE, lineSpacingMultiple: 1.12 });
  text(s, [run("Next: ", { fontFace: SEMI, color: WHITE }), run("sessions with blind and low-vision students and their teachers  ·  TalkBack  ·  more phones  ·  Wi-Fi")],
    { x: M, y: by + bh + 0.1, w: CW, h: 0.3, fontSize: 11.5, color: MIST });
  const say = "A raised-line board gives sharper lines for under three hundred dollars, but it is silent, and a change means a new sheet. Pin displays draw live, with braille, from eight and a half thousand dollars. Our bet is the space between: a drawing that changes at the tutor's pace, speaks its labels and shows the tutor the finger, on an ordinary Android phone.";
  notes(s, "About 25 s.", say, "Sources, read Sun Nov 8 2026 unless marked (details in .tmp/final-review/agent-A-competitive.md).\nRaised-line boards: APH DRAFTSMAN $263 (aph.org/product/draftsman-tactile-drawing-board), APH TactileDoodle $130.49 (\"images raise instantly\"), Sensational Blackboard $54.95 (braillebookstore.com); the inTACT Sketchpad can erase with a $150 eraser (search summary only).\nPin displays with live drawing: Dot Pad $8,515 (California Dept of Education CSB list; Dot's own page says $10,000-12,000) with Dot Canvas, \"displayed in real-time on the Dot Pad\" (manual); APH Monarch $15,500 list (aph.org/product/monarch; Federal Quota eligible; NFB-member promo $12,900 to Dec 31 2026) with Wing It, lines \"appear instantly as they are drawn\" (aph.org/product/wing-it, iOS only). \"Most students never get one\": APH's FY2025 report says the Monarch reached more than 1,350 individuals against 73,505 students registered with APH.\nResearch: Giudice et al., ASSETS 2012 (vibro-audio tablet: accuracy matched embossed paper on bar graphs and letters, learning significantly slower, n = 3 blind + 12 blindfolded); Hahn, Mueller and Gorlewicz, JVIB 2019 (22 visually impaired students, embossed 6% more accurate, not significant); Tekli et al. 2018 (about 1 min 22 s per shape, 74%). Live sighted-to-blind drawing has precedent on force-feedback and pin devices (McSig CHI 2008, Tangram 2014).\nWhat FeelInk adds (ranked by defensibility): nothing to buy; changes mid-lesson without a new sheet; spoken labels without braille; the tutor sees the finger and covered ink. Supplement, never a replacement; Android Chrome only (iOS Safari has no Vibration API); one Pixel 8 tested; USB today. Never \"first\", \"only\" or \"no competitors\": say \"we found no system with all of these\".");
}

// ------------------------------------------------------------------ 7 Close: team and disclosure (white)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  kicker(s, "TEAM");
  text(s, "Thank you", { x: M, y: 0.66, w: 6, h: 0.8, fontFace: SEMI, fontSize: 40, color: GREEN, lineSpacingMultiple: 1 });
  text(s, "FeelInk: feel the lesson as it is drawn.", { x: M, y: 1.48, w: 7, h: 0.4, fontFace: SEMI, fontSize: 18, color: GREEN });
  text(s, [run("Reeve Masilamani", { fontFace: SEMI }), run(", UC Davis. Product, device and engineering.")], { x: M, y: 2.2, w: 4.3, h: 0.6, fontSize: 14, lineSpacingMultiple: 1.15 });
  text(s, [run("Nathan Jeevamani", { fontFace: SEMI }), run(". Presentation and design; his Pixel 8 ran every device check.")], { x: 5.2, y: 2.2, w: 4.3, h: 0.6, fontSize: 14, lineSpacingMultiple: 1.15 });
  const dy = 3.1;
  card(s, M, dy, CW, H - 0.4 - dy, FILL, null);
  text(s, "DISCLOSURE", { x: M + 0.3, y: dy + 0.18, w: 3, h: 0.28, fontFace: SEMI, fontSize: 11, color: SLATE, charSpacing: 2 });
  const disc = [
    [run("AI tools: ", { fontFace: SEMI }), run("Claude Code (Anthropic) agents wrote the code, ran the phone measurements and drafted this deck; Codex (OpenAI) reviewed. We set direction, made the calls and hand-checked tagged builds on the Pixel.")],
    [run("Open source: ", { fontFace: SEMI }), run("Python standard library (relay), plain browser APIs, FFmpeg, pptxgenjs, Poppins and Atkinson Hyperlegible (Google Fonts), the impeccable (Apache 2.0) and jmo-skills (MIT) agent skills.")],
    [run("Hardware: ", { fontFace: SEMI }), run("owned gear only, one unmodified Pixel 8 and a laptop. Repo started at the event on Friday Nov 6.")],
  ];
  disc.forEach((runs, i) => {
    text(s, runs, { x: M + 0.3, y: dy + 0.5 + i * 0.56, w: CW - 0.6, h: 0.54, fontSize: 11, color: INK, lineSpacingMultiple: 1.08 });
  });
  const say = "Built with Claude Code and Codex under our direction; details on the slide. That teacher is always a step behind. FeelInk is our bet that the student doesn't have to be. Thank you.";
  notes(s, "About 12 s. This slide stays up during Q&A.", say, "Reeve: UC Davis (Sacramento State is the venue). Nathan: name only, no affiliation. Prior work: no product code carried over; the first commit imported our pre-event research notes and helper scripts, none of it FeelInk code (organiser rule: disclose carried-over work).");
}

const out = path.join(REPO, "recordings/out/FeelInk-deck-final-review-2026-11-08.pptx");
pres.writeFile({ fileName: out }).then((f) => {
  const counts = SAY.map((t) => t.replace(/\[[^\]]*\]/g, "").trim().split(/\s+/).length);
  const total = counts.reduce((a, b) => a + b, 0);
  console.log("wrote", f);
  console.log("spoken words per slide", counts.join(" / "), "total", total,
    "| speech", (total / 150 * 60).toFixed(0) + "-" + (total / 140 * 60).toFixed(0), "s | +10 s watching +6 s changes");
});
