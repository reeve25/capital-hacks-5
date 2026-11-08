// FeelInk 3-minute pitch deck, Capital Hacks 5.0, Sun Nov 8 2026 (rebuild after the 12-slide deck was rejected;
// revised 08:00 for Reeve's validation framing and the advisor's corrections; presentation pass ~08:10: one takeaway
// per slide, bigger footage, no footnotes, every Say line defined once and reused verbatim in the notes).
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
  text(s, small, { x, y: y + 0.58, w, h: 0.75, fontSize: 12.5, color: inkColor, lineSpacingMultiple: 1.1 });
}
function arrow(s, x, y, w, color = TEAL) {
  s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color, width: 2, endArrowType: "triangle" } });
}
// Show one region [x, y, w, h] (pixels) of an image [width, height] at height dh inches; returns the shown width.
// pptxgenjs writes this as a srcRect crop, so the source still stays untouched.
function crop(s, file, [iw, ih], [px, py, pw, ph], x, y, dh) {
  const k = dh / ph;
  s.addImage({ path: file, x, y, w: iw * k, h: ih * k, sizing: { type: "crop", x: px * k, y: py * k, w: pw * k, h: ph * k } });
  return pw * k;
}
const run = (t, o = {}) => ({ text: t, options: o });
// Speaker notes: who, then the Say line exactly as in the script, then the rules for that slide.
function notes(s, who, say, rest) { s.addNotes(`${who}\nSay: "${say}"\n\n${rest}`); }

// ------------------------------------------------------------------ 1 Title (dark)
{
  const s = pres.addSlide({ masterName: "DARK" });
  // Hero: the tutor's board and the student's phone, cropped from the last simulation still so both read at slide
  // size. The still's middle step panel and its small in-frame tags drop out; the caption under the pair carries the label.
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
  text(s, "Desktop simulation: scripted finger, buzz and speech.", { x: bx - 0.4, y: capY, w: px + pw - bx + 0.4, h: 0.3, fontSize: 11.5, color: MIST, align: "right" });

  text(s, "CAPITAL HACKS 5.0  ·  HEALTH + ACCESSIBILITY", { x: M, y: 0.42, w: 5, h: 0.3, fontFace: SEMI, fontSize: 11, color: MIST, charSpacing: 2 });
  text(s, "FeelInk", { x: M, y: 1.52, w: 4.4, h: 1.0, fontFace: SEMI, fontSize: 60, color: WHITE, lineSpacingMultiple: 1 });
  text(s, "Feel the lesson as it is drawn.", { x: M, y: 2.6, w: bx - M - 0.2, h: 0.45, fontFace: SEMI, fontSize: 20, color: TEAL });
  text(s, "A sighted tutor draws on a laptop. A blind or low-vision student feels it as vibration on an Android phone and hears its labels.",
    { x: M, y: 3.22, w: bx - M - 0.45, h: 1.2, fontSize: 14, color: MIST, lineSpacingMultiple: 1.2 });
  text(s, "Reeve Masilamani, UC Davis  ·  Nathan Jeevamani", { x: M, y: capY, w: 4.5, h: 0.3, fontFace: SEMI, fontSize: 12, color: WHITE });
  const say = "FeelInk lets blind and low-vision students feel what a tutor is drawing, live, as vibration on an Android phone. We're Nathan and Reeve.";
  notes(s, "NATHAN, about 10 s.", say, "The images are the tutor's board and the student's phone from the end of the desktop simulation; the caption says so. Never call it device footage.\n\nWhole deck: 7 slides, 3-minute limit. Script and timing model: .tmp/pitch-script-3min-2026-11-08.md.");
}

// ------------------------------------------------------------------ 2 Problem (white)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  kicker(s, "THE PROBLEM");
  heading(s, "A sketch that changes mid-lesson is hard to share with a blind or low-vision student.", { w: 8.9, h: 0.95 });
  text(s, [run("Who: ", { fontFace: SEMI, color: GREEN }), run("blind and low-vision students, and the teacher or tutor beside them.")], { x: M, y: 1.78, w: CW, h: 0.35, fontSize: 15 });
  const cy = 2.45, ch = 2.55, gap = 0.25, cw = (CW - 2 * gap) / 3, tx = 0.3, tw = cw - 0.55, by = cy + 1.32;
  const ways = [
    ["Described aloud", "Works, but words must carry the shape and where things sit."],
    ["Tactile graphics", "Work well, but take time to prepare, which is slow for a changing sketch."],
  ];
  ways.forEach(([k, v], i) => {
    const x = M + i * (cw + gap);
    card(s, x, cy, cw, ch, FILL, null);
    ring(s, x + tx + 0.15, cy + 0.47, 0.3, AMBER, FILL);
    text(s, k, { x: x + tx, y: cy + 0.82, w: tw, h: 0.38, fontFace: SEMI, fontSize: 17, color: GREEN });
    text(s, v, { x: x + tx, y: by, w: tw, h: 1.1, fontSize: 13, lineSpacingMultiple: 1.15 });
  });
  // The live option, set apart: the deck's one price, and the only place it appears.
  const x3 = M + 2 * (cw + gap);
  card(s, x3, cy, cw, ch, GREEN, null);
  text(s, "$15,500", { x: x3 + tx, y: cy + 0.38, w: tw, h: 0.8, fontFace: SEMI, fontSize: 36, color: WHITE, lineSpacingMultiple: 1 });
  text(s, "A refreshable tactile display that shows it live (APH Monarch list price).", { x: x3 + tx, y: by, w: tw, h: 1.1, fontSize: 13, color: WHITE, lineSpacingMultiple: 1.15 });
  const say = "Sighted students watch the teacher's sketch take shape. A blind or low-vision student gets it described, or prepared ahead as a tactile graphic. Both work, but they lag a sketch that changes mid-lesson. A refreshable tactile display shows it live, for fifteen and a half thousand dollars.";
  notes(s, "NATHAN, about 21 s.", say, "No absolutes about existing methods: descriptions and tactile graphics work, they are slow for a changing sketch. Never say \"2.2 billion blind people\" (the WHO figure is any vision impairment). Price source: aph.org, read Sat Nov 7. This is the deck's only $15,500.");
}

// ------------------------------------------------------------------ 3 Demonstration (dark)
{
  const s = pres.addSlide({ masterName: "DARK" });
  text(s, "The tutor sees the finger stop, reveals the next leg, draws a new one.",
    { x: M, y: 0.3, w: CW, h: 0.42, fontFace: SEMI, fontSize: 18, color: WHITE, lineSpacingMultiple: 1 });
  const gh = 4.05, gw = gh * 16 / 9, gx = (W - gw) / 2, gy = 0.84;  // leaves room for a two-line caption
  s.addImage({ path: asset("sim-route-lesson-pitch.gif"), x: gx, y: gy, w: gw, h: gh });
  text(s, "Desktop simulation: scripted finger, buzz and speech stubbed. Connect, trace, labels and step reveal passed by hand on a Pixel 8 on Saturday.",
    { x: M, y: gy + gh + 0.12, w: CW, h: 0.45, fontSize: 11.5, color: MIST, align: "center" });
  const say = "A lesson: the tutor's laptop left, the student's phone right, dark on purpose. A desktop simulation: scripted finger, buzz and speech stubbed. [stop talking for about 10 s: the finger stops at the corner, the tutor clicks Next] The finger stopped at the corner, and the tutor saw it. Next reveals the following leg, and the phone announces it. Then the tutor draws a new leg live and names it Library; the finger follows. The tutor teaches; the phone becomes the drawing.";
  notes(s, "REEVE (handoff), about 37 s: the intro, then about 10 s watching the clip WITHOUT talking, then the narration. The clip is 20.6 s and loops; within a loop Next is clicked at about 3 s and the Library leg is drawn from about 9 s.", say,
    "Colours: teal is ink the finger has covered, grey is drawn but not covered, dashed is hidden until Next, the amber ring is a buzz the phone asked for (a request, not proof the motor ran). Never: user, learner, device footage. The Pixel 8 check (tag demo-2, Sat 20:33) was a separate, hands-on run of Saturday's build.");
}

// ------------------------------------------------------------------ 4 How it works (white)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  kicker(s, "HOW IT WORKS");
  heading(s, "A stock phone can only buzz as a whole. FeelInk decides when, from where the finger is.", { h: 1.0 });
  const py = 1.86, ph = 0.98, pw = 2.75, pg = 0.375;
  const nodes = [
    ["Tutor's laptop", "Draws, labels, reveals in steps. Sees the finger live."],
    ["Relay", "Python, on the laptop.\n4–5 ms to the phone."],
    ["Student's phone", "Chrome, no app to install. Buzz and spoken labels."],
  ];
  nodes.forEach(([k, v], i) => {
    const x = M + i * (pw + pg);
    card(s, x, py, pw, ph, i === 1 ? WHITE : FILL, i === 1 ? RULE : null);
    text(s, k, { x: x + 0.22, y: py + 0.15, w: pw - 0.4, h: 0.32, fontFace: SEMI, fontSize: 15, color: GREEN });
    text(s, v, { x: x + 0.22, y: py + 0.5, w: pw - 0.4, h: 0.45, fontSize: 12.5, lineSpacingMultiple: 1.1 });
    if (i < 2) arrow(s, x + pw + 0.06, py + ph / 2, pg - 0.12);
  });
  // Three facts, each stated by what it enables. Backup numbers live in the notes.
  const ty = 3.1, tw = (CW - 2 * 0.3) / 3;
  stat(s, "1 ms buzz", "ends a buzz, because Chrome ignores the standard stop. So a line ends where the ink ends.", M, ty, tw);
  stat(s, "1 level", "of strength, so rhythm carries meaning: a hold on the line, pulses near it, a triple on a label.", M + tw + 0.3, ty, tw);
  stat(s, "14 ms", "from finger to the tutor's screen on a Pixel 8, so the tutor sees exploration stall.", M + 2 * (tw + 0.3), ty, tw);
  s.addShape(pres.shapes.LINE, { x: M, y: 4.58, w: CW, h: 0, line: { color: RULE, width: 0.75 } });
  text(s, [run("New here: ", { fontFace: SEMI, color: GREEN }), run("a drawing made live and revealed at the tutor's pace, felt in stock Chrome, with the finger shown back to the tutor. Prior work: vibration diagrams on tablets (Giudice et al., ASSETS 2012).")],
    { x: M, y: 4.7, w: CW, h: 0.5, fontSize: 12, color: INK, lineSpacingMultiple: 1.12 });
  const say = "FeelInk decides when the phone buzzes, from where the finger is. A one-millisecond buzz ends a buzz, so a line ends where the ink ends. One strength level, so rhythm carries meaning: a hold on the line, pulses near it, a triple on a label. The finger reaches the tutor in fourteen milliseconds, fast enough to see exploration stall.";
  notes(s, "REEVE, about 26 s.", say, "Backup numbers if asked: 0 of 132 Chrome buzzes were ever cancelled by vibrate(0); a 2 s buzz ran 2091 ms; a 1 ms buzz ended it at 311 ms when called at 300 ms; relay to phone median 4-5 ms (151 of 151 strokes); finger back median 14 ms (192 of 192); board mapping error 0.03-0.04 mm; first buzz of a touch 93-196 ms after the request, cause unknown. All on one Pixel 8 over USB, Sat afternoon, early build; last hands-on Pixel check tag demo-2, Sat 20:33; everything since is desktop only. Strokes simplified at 2 mm; corners at 40 degrees over 5 mm; reveal ordered by arrival.");
}

// ------------------------------------------------------------------ 5 Tested, learned, changed (white)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  kicker(s, "VALIDATION");
  heading(s, "What we tested, learned and changed.", { h: 0.55 });
  // Each row: a label with the ring, then items as [bold lead, rest]. Row heights follow the text.
  // Items are [bold lead, rest, lines on the render]; the line counts were read off the PowerPoint renders.
  const rows = [
    ["Tested", "", [
      ["Pixel 8, by hand: ", "connect, trace, spoken labels, reveal in steps (Saturday).", 1],
      ["Delivery: ", "151 of 151 strokes to the phone, 192 of 192 finger samples back.", 1],
      ["Early internal test: ", "4 of 5 shapes identified with eyes closed.", 1],
      // Confirmed by Reeve, Sun Nov 8 (USERS.md row 3): perceived potential from an informal tryout, not a result.
      // Never name her or the relation; "has a vision impairment" only; keep it out of Learned (written replies).
      ["Informal tryout: ", "a teammate's relative with a vision impairment explored a route and said it could help her learn routes before a visit.", 2],
    ]],
    ["Learned", "two written replies", [
      ["A blind student ", "with tactile-graph experience raised concerns: direction off the line, TalkBack, latency.", 2],
      ["The president of a state council of the blind ", "forwarded our question to members and asked about iOS.", 2],
    ]],
    ["Changed", "", [
      ["Guide-back taps ", "toward the line: built in response, not yet felt on a phone.", 1],
      ["Still open: ", "TalkBack, the 93–196 ms first-buzz delay, and iOS.", 1],
    ]],
  ];
  const PT = 12, LH = 0.21, IX = M + 2.15, IW = W - M - 0.2 - IX, PAD = 0.11, IG = 0.075, RG = 0.08;
  let y = 1.3;
  rows.forEach(([label, sub, items]) => {
    const hs = items.map(([, , n]) => n * LH);
    const rh = PAD * 2 + hs.reduce((t, h) => t + h, 0) + IG * (items.length - 1);
    card(s, M, y, CW, rh, FILL, null);
    ring(s, M + 0.36, y + PAD + 0.13, 0.24, AMBER, FILL);
    text(s, label, { x: M + 0.6, y: y + PAD - 0.03, w: 1.4, h: 0.34, fontFace: SEMI, fontSize: 16, color: GREEN });
    if (sub) text(s, sub, { x: M + 0.6, y: y + PAD + 0.32, w: 1.4, h: 0.5, fontSize: 11, color: SLATE, lineSpacingMultiple: 1.05 });
    let iy = y + PAD;
    items.forEach(([a, b], i) => {
      // No empty lead run: pptxgenjs would write two <a:pPr> in one paragraph, which PowerPoint refuses to open.
      text(s, (a ? [run(a, { fontFace: SEMI })] : []).concat(run(b)), { x: IX, y: iy, w: IW, h: hs[i] + 0.02, fontSize: PT, lineSpacingMultiple: 1.07 });
      iy += hs[i] + IG;
    });
    y += rh + RG;
  });
  text(s, "Still needed: a study with blind and low-vision students and their teachers.",
    { x: M, y: y + 0.04, w: CW, h: 0.35, fontFace: SEMI, fontSize: 13, color: INK });
  const say = "Tested: on a Pixel 8 on Saturday, our hands-on check passed and every stroke and finger sample arrived. Early internal test: four of five shapes identified with eyes closed. A teammate's relative, who has a vision impairment, explored a route and said it could help her learn routes before a visit. Perceived potential, not a measured result. Learned: a blind student raised concerns about direction, TalkBack and latency; a state council of the blind forwarded our question and asked about iOS. Changed: guide-back taps, built in response. Still needed: a study with students and teachers.";
  notes(s, "REEVE, about 40 s.", say, "Scope: one informal tryout and no study with blind or low-vision students and their teachers yet. Do not say \"no blind student has tried it\" as an absolute.\nInformal tryout: in person, informal; device, build and date not recorded; reported by Reeve Sun Nov 8; logged in USERS.md. A relative of a teammate who has a vision impairment (not \"low vision\", not \"blind\"); never name her or the relation. She tried route exploration and said she could see it helping her memorize routes and build familiarity before visiting somewhere: perceived potential, not demonstrated route learning; no obstacle detection, safe navigation or navigating with FeelInk. Distinct from the eyes-closed shape test.\nEyes-closed test: a sighted teammate, older build (14 mm core), 4 of 5 shapes, median 49.9 s per shape; it does not validate the current build.\nWritten replies (Learned): anonymous; names and organisations stay out (anonymity promised to the first; no consent asked of the second). Sat 17:47 and Sun 05:46 PST replies to Reeve's outreach email, logged in USERS.md. A forwarded question is not a trial. Never \"users\" in the plural. Guide-back taps answer a concern; they do not prove recovery works.");
}

// ------------------------------------------------------------------ 6 Why it matters (dark)
{
  const s = pres.addSlide({ masterName: "DARK" });
  text(s, "WHY IT MATTERS", { x: M, y: 0.38, w: 4, h: 0.3, fontFace: SEMI, fontSize: 11, color: MIST, charSpacing: 2 });
  text(s, "Live diagrams for blind and low-vision students, on an ordinary Android phone.",
    { x: M, y: 0.72, w: 8.6, h: 1.05, fontFace: SEMI, fontSize: 28, color: WHITE, lineSpacingMultiple: 1.02 });
  text(s, "The ambition, if device and user testing bear it out.", { x: M, y: 1.86, w: CW, h: 0.4, fontFace: SEMI, fontSize: 16, color: TEAL });
  const ly = 2.7, lh = 2.3;
  text(s, "TODAY", { x: M, y: ly + 0.18, w: 3, h: 0.3, fontFace: SEMI, fontSize: 11, color: MIST, charSpacing: 2 });
  text(s, "One Pixel 8 in Chrome, the tutor's laptop and a USB cable.", { x: M, y: ly + 0.55, w: 3.7, h: 0.8, fontFace: SEMI, fontSize: 17, color: WHITE, lineSpacingMultiple: 1.1 });
  text(s, "A supplement to tactile graphics and braille, never a replacement.", { x: M, y: ly + 1.45, w: 3.7, h: 0.6, fontSize: 13, color: MIST, lineSpacingMultiple: 1.15 });
  const nx = 4.55, nw = W - M - nx;
  card(s, nx, ly, nw, lh, PANEL, null);
  text(s, "Next, in order", { x: nx + 0.3, y: ly + 0.18, w: 3, h: 0.35, fontFace: SEMI, fontSize: 15, color: WHITE });
  const next = [
    ["Sessions with blind and low-vision students and their teachers, with consent.", 2],
    ["TalkBack checks and more Android phones.", 1],
    ["A classroom network, not a USB cable.", 1],
  ];
  let ny = ly + 0.7;
  next.forEach(([t, n]) => {
    ring(s, nx + 0.45, ny + 0.14, 0.24, AMBER, PANEL);
    text(s, t, { x: nx + 0.75, y: ny, w: nw - 1.0, h: n * 0.25 + 0.04, fontSize: 13, color: WHITE, lineSpacingMultiple: 1.1 });
    ny += n * 0.25 + 0.2;
  });
  const say = "The ambition: live diagrams for blind and low-vision students on an ordinary Android phone, if device and user testing bear it out. Next: sessions with students and their teachers, with consent; TalkBack and more phones; then a classroom network. FeelInk: feel the lesson as it is drawn.";
  notes(s, "NATHAN (handoff), about 19 s.", say, "Never \"every Android phone\", \"nothing to buy\" or \"zero setup\": one Pixel 8 tested; the relay runs on the tutor's laptop and today the phone connects over USB. A supplement, never equivalent to a tactile display. iOS came up in feedback: Safari has no Vibration API, so it is a question, not a plan.");
}

// ------------------------------------------------------------------ 7 Team and disclosure (white)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  kicker(s, "TEAM");
  text(s, "Thank you", { x: M, y: 0.66, w: 6, h: 0.8, fontFace: SEMI, fontSize: 40, color: GREEN, lineSpacingMultiple: 1 });
  text(s, "FeelInk: feel the lesson as it is drawn.", { x: M, y: 1.48, w: 7, h: 0.4, fontFace: SEMI, fontSize: 18, color: TEAL });
  text(s, [run("Reeve Masilamani", { fontFace: SEMI }), run(", UC Davis. Product, device and engineering.")], { x: M, y: 2.2, w: 4.3, h: 0.6, fontSize: 14, lineSpacingMultiple: 1.15 });
  text(s, [run("Nathan Jeevamani", { fontFace: SEMI }), run(". Presentation and design; his Pixel 8 ran every device check.")], { x: 5.2, y: 2.2, w: 4.3, h: 0.6, fontSize: 14, lineSpacingMultiple: 1.15 });
  const dy = 3.22;
  card(s, M, dy, CW, H - 0.42 - dy, FILL, null);
  text(s, "DISCLOSURE", { x: M + 0.3, y: dy + 0.2, w: 3, h: 0.28, fontFace: SEMI, fontSize: 11, color: SLATE, charSpacing: 2 });
  const disc = [
    [run("AI tools: ", { fontFace: SEMI }), run("Claude Code (Anthropic) agents and Codex (OpenAI) reviews implemented under our direction; we set the product, tested in the browser and checked the tagged builds on the Pixel by hand.")],
    [run("Open source: ", { fontFace: SEMI }), run("Python standard library (relay), plain browser APIs, FFmpeg, pptxgenjs, Poppins and Atkinson Hyperlegible (Google Fonts), the impeccable (Apache 2.0) and jmo-skills (MIT) agent skills.")],
    [run("Hardware and footage: ", { fontFace: SEMI }), run("owned gear only, one unmodified Pixel 8 and a laptop. The clips are desktop simulations and are labelled as such. Repo started at the event on Friday Nov 6.")],
  ];
  disc.forEach((runs, i) => {
    text(s, runs, { x: M + 0.3, y: dy + 0.56 + i * 0.47, w: CW - 0.6, h: 0.45, fontSize: 11, color: INK, lineSpacingMultiple: 1.08 });
  });
  const say = "Built with Claude Code and Codex under our direction; the open source is on the slide. Thank you.";
  notes(s, "NATHAN, about 6 s.", say, "Reeve: UC Davis (Sacramento State is the venue). Nathan: name only, no affiliation. Any code carried over from earlier work would have to be disclosed here (organiser rule); none was.");
}

const out = path.join(REPO, "recordings/out/FeelInk-deck-3min-2026-11-08.pptx");
pres.writeFile({ fileName: out }).then((f) => console.log("wrote", f));
