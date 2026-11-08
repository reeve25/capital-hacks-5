// FeelInk final pitch deck in the organizers' template style, Capital Hacks 5.0, Sun Nov 8 2026.
// Same copy as build.js (the dark draft) re-cut into the template's slide order and look: white, Poppins, left-aligned,
// section label top-left, FeelInk green 043927 and the template's teal. Slide size 10 x 5.625 in, the Google Slides
// size, so File > Import slides does not rescale. Speaker notes carry the timed script (.tmp/pitch-script-2026-11-08.md).
// Teal is 15AAA6, sampled from the template's title-slide block (it is an image there, so the XML has no colour for it).
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const REPO = path.resolve(__dirname, "../..");
const OUT = path.join(REPO, "recordings/out");
const asset = (name) => {
  const p = path.join(OUT, name);
  if (!fs.existsSync(p)) throw new Error("missing asset " + p);
  return p;
};

const INK = "121212", SLATE = "64748B", GREEN = "043927", TEAL = "15AAA6", AMBER = "FFB020";
const RULE = "E2E8F0", FILL = "F3F3F3", TINT = "E7F5F4", WHITE = "FFFFFF";
// Exactly the names the template's XML uses, so Google Slides maps them to its Poppins weights.
const SEMI = "Poppins SemiBold", LIGHT = "Poppins Light";
const W = 10, M = 0.45, CW = W - 2 * M;

const pres = new pptxgen();
pres.defineLayout({ name: "G16x9", width: 10, height: 5.625 });
pres.layout = "G16x9";
pres.author = "Reeveson Masilamani";
pres.title = "FeelInk: feel the lesson as it is drawn";
pres.defineSlideMaster({ title: "WHITE", background: { color: WHITE } });

// Every text box: no inner margin, top-aligned, explicit line spacing (Poppins is wider and taller than the
// fonts PowerPoint substitutes for it, so boxes keep slack).
function text(s, t, o) {
  s.addText(t, Object.assign({ fontFace: LIGHT, fontSize: 11, color: INK, margin: 0, isTextBox: true, valign: "top", lineSpacingMultiple: 1.05 }, o));
}
function label(s, t) {
  text(s, t, { x: M, y: 0.3, w: 6, h: 0.25, fontFace: SEMI, fontSize: 9.5, color: SLATE });
}
function heading(s, t, lines = 1) {
  text(s, t, { x: M, y: 0.58, w: CW, h: lines === 1 ? 0.55 : 1.05, fontFace: SEMI, fontSize: 26, lineSpacingMultiple: 0.95 });
}
function caption(s, t, x, y, w, h) {
  text(s, t, { x, y, w, h, fontSize: 9, color: SLATE });
}
function card(s, x, y, w, h, fill = WHITE) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill }, line: fill === WHITE ? { color: RULE, width: 0.75 } : { type: "none" } });
}
function bar(s, x, y, h, color = TEAL) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.05, h, fill: { color }, line: { type: "none" } });
}
function image16x9(s, p, x, y, w) {
  const h = w * 9 / 16;
  s.addImage({ path: p, x, y, w, h });
  return h;
}
// Numbered teal disc; dark-green numeral keeps 4.5:1 contrast on the teal.
function stepDisc(s, n, x, y, d = 0.34) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: TEAL }, line: { type: "none" } });
  text(s, String(n), { x, y, w: d, h: d, fontFace: SEMI, fontSize: 11, color: GREEN, align: "center", valign: "middle", lineSpacingMultiple: 1 });
}
const run = (t, o = {}) => ({ text: t, options: o });

// ---------------------------------------------------------------- 1 Title (9 s)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  text(s, "Capital Hacks 5.0 Fall 2026", { x: M, y: 0.3, w: 4, h: 0.25, fontFace: SEMI, fontSize: 9.5, color: SLATE });
  text(s, "FeelInk", { x: M, y: 0.95, w: 3.9, h: 0.95, fontFace: SEMI, fontSize: 46, color: GREEN, lineSpacingMultiple: 1 });
  text(s, "Feel the lesson as it is drawn.", { x: M, y: 1.92, w: 4.0, h: 0.4, fontFace: SEMI, fontSize: 16 });
  text(s, "A sighted tutor draws on a laptop. A blind student feels the drawing as vibration on an ordinary Android phone and hears the labels.",
    { x: M, y: 2.5, w: 3.75, h: 1.05, fontSize: 11.5, lineSpacingMultiple: 1.15 });
  text(s, "Health + Accessibility Tech track", { x: M, y: 4.58, w: 4, h: 0.25, fontFace: SEMI, fontSize: 10, color: GREEN });
  text(s, "Reeve Masilamani (UC Davis) and Nathan Jeevamani", { x: M, y: 4.88, w: 5.2, h: 0.25, fontSize: 10 });
  const iw = 4.9, ix = W - M - iw, iy = 0.98;
  const ih = image16x9(s, asset("sim-route-lesson-still-5-library.png"), ix, iy, iw);
  caption(s, "Desktop simulation of the current build: scripted tutor and finger, no phone. An earlier build ran on a real Pixel 8.", ix, iy + ih + 0.08, iw, 0.42);
  // The template's teal block: a half-round bleeding off the right edge, with a white arrow circle at its centre.
  const bh = 0.9, by = 4.45, bx = W - bh;
  s.addShape(pres.shapes.OVAL, { x: bx, y: by, w: bh, h: bh, fill: { color: TEAL }, line: { type: "none" } });
  s.addShape(pres.shapes.RECTANGLE, { x: bx + bh / 2, y: by, w: W - bx - bh / 2, h: bh, fill: { color: TEAL }, line: { type: "none" } });
  const cx = bx + bh / 2, cy = by + bh / 2, r = 0.17;
  s.addShape(pres.shapes.OVAL, { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r, fill: { type: "none" }, line: { color: WHITE, width: 1.25 } });
  s.addShape(pres.shapes.LINE, { x: cx - 0.085, y: cy, w: 0.17, h: 0, line: { color: WHITE, width: 1.25, endArrowType: "arrow" } });
  s.addNotes("9 s. Say: \"FeelInk lets a blind student feel what a tutor is drawing, live, on a phone they already own. We're Reeve and Nathan.\"\n\nDo not say anything about the image being device footage. It is the composite still at the end of the simulated route lesson (recordings/out/sim-route-lesson-still-5-library.png), labelled as a desktop simulation on the image itself; keep that label if the image is cropped.\n\nDeck target 3:30-3:40 in rehearsal (Reeve, Nov 8); the per-slide seconds in these notes total 3:35, from the timed pitch script.");
}

// ---------------------------------------------------------------- 2 Starting Point (12 s)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  label(s, "STARTING POINT");
  const b = { bullet: { indent: 18 }, paraSpaceAfter: 14 };
  text(s, [
    run("FeelInk", Object.assign({ fontFace: SEMI, color: GREEN }, b)),
    run(" is solving the problem of diagrams and routes drawn mid-lesson reaching blind students late or never,", { breakLine: true }),
    run("for blind and low-vision students and the tutors who teach them one to one.", Object.assign({ breakLine: true }, b)),
    run("Our solution is a tutor whiteboard the student feels live, as vibration and spoken landmarks, on an ordinary Android phone.", b),
  ], { x: M + 0.1, y: 1.5, w: 7.7, h: 3.4, fontSize: 17, lineSpacingMultiple: 1.2, paraSpaceAfter: 14 });
  s.addNotes("12 s. Say: \"A drawing made mid-lesson reaches a blind student late or never. Our fix: a tutor's whiteboard the student feels live, as vibration and spoken landmarks, on an ordinary Android phone.\"\n\nThe bullets are the team's own Starting Point text from the live deck.");
}

// ---------------------------------------------------------------- 3 Problem Space (21 s)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  label(s, "PROBLEM SPACE");
  heading(s, "A drawing made mid-lesson reaches a blind student late, or never", 2);
  const beats = [
    "A teacher sketches a route, a graph or a circuit on the board. Sighted students see it at once.",
    "The blind student gets a verbal description, a tactile sheet later, or nothing. When the drawing changes, they wait again.",
    "The dedicated fix is a refreshable tactile display. One unit costs $15,500, so most classrooms will never see one.",
  ];
  beats.forEach((t, i) => {
    const y = 1.72 + i * 0.8;
    stepDisc(s, i + 1, M, y);
    text(s, t, { x: M + 0.52, y: y - 0.02, w: 4.85, h: 0.66, fontSize: 11 });
  });
  text(s, [run("Who: ", { fontFace: SEMI, color: GREEN }), run("blind and low-vision students, and the tutors who teach them one to one.")],
    { x: M, y: 4.25, w: 5.35, h: 0.6, fontSize: 11.5 });
  // Stats column
  const cx = 6.2, cw = W - M - cx, ty = 1.72;
  card(s, cx, ty, cw, 3.35, FILL);
  const ix = cx + 0.25, iw = cw - 0.5;
  text(s, "$15,500", { x: ix, y: ty + 0.12, w: iw, h: 0.62, fontFace: SEMI, fontSize: 30, color: GREEN, lineSpacingMultiple: 1 });
  s.addShape(pres.shapes.RECTANGLE, { x: ix, y: ty + 0.74, w: 0.55, h: 0.05, fill: { color: AMBER }, line: { type: "none" } });
  text(s, "APH Monarch, the refreshable tactile display built for this job (aph.org, read Nov 7).", { x: ix, y: ty + 0.88, w: iw, h: 0.5, fontSize: 9, color: SLATE });
  text(s, "73,505", { x: ix, y: ty + 1.42, w: iw, h: 0.42, fontFace: SEMI, fontSize: 19, lineSpacingMultiple: 1 });
  text(s, "US students registered with APH (FY2025 report)", { x: ix, y: ty + 1.84, w: iw, h: 0.44, fontSize: 9, color: SLATE });
  text(s, "2.2 billion", { x: ix, y: ty + 2.32, w: iw, h: 0.42, fontFace: SEMI, fontSize: 19, lineSpacingMultiple: 1 });
  text(s, "people worldwide with a vision impairment (WHO, 2026), context only", { x: ix, y: ty + 2.74, w: iw, h: 0.5, fontSize: 9, color: SLATE });
  s.addNotes("21 s. Say: \"A teacher sketches a route on the board and every sighted student sees it at once. The blind student gets a description, a tactile sheet days later, or nothing; when the drawing changes, they wait again. The dedicated fix, a refreshable tactile display, costs fifteen and a half thousand dollars.\"\n\nWho, what their day looks like now, why the gap exists (cost and preparation time). No product yet.\n\nNever say \"2.2 billion blind people\": the WHO figure is vision impairment of any kind. No APH braille-literacy percentages. Sources: aph.org (Monarch price, fetched Sat 13:20), APH FY2025 report, WHO 2026.");
}

// ---------------------------------------------------------------- 4 Solution (19 s)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  label(s, "SOLUTION");
  heading(s, "A tutor's whiteboard the student feels, on a phone they already own", 2);
  const iw = 5.35, ix = M, iy = 1.7;
  const ih = image16x9(s, asset("sim-route-lesson-still-0-establishing.png"), ix, iy, iw);
  caption(s, "The tutor's screen, desktop simulation of the current build with the regions named for this slide. Nothing to buy: a web page on the laptop, Chrome on an ordinary Android phone, one small Python relay between them, today over a USB cable.",
    ix, iy + ih + 0.08, iw, 0.62);
  const head = (t, c = GREEN) => run(t, { fontFace: SEMI, fontSize: 11, color: c, breakLine: true });
  const body = (t, last) => run(t, { fontSize: 10, breakLine: !last, paraSpaceAfter: last ? 0 : 7 });
  text(s, [
    head("Lines"), body("Live haptic feedback for following routes, graphs and drawings: the whole phone buzzes while one finger is on ink, fainter toward the edge."),
    head("Corners and ends"), body("Their own short cues."),
    head("Labels"), body("Spoken landmarks and destinations, “Start: Classroom”, with a triple pulse to mark the spot."),
    head("Human-led"), body("An in-person lesson. The tutor talks, watches the student's finger live and reveals the drawing step by step. The software is the tactile workspace.", true),
  ], { x: 6.15, y: iy, w: W - M - 6.15, h: 3.55 });
  s.addNotes("19 s. Say: \"The tutor draws on a laptop. The student explores the same drawing on their own phone: lines buzz under one finger, corners cue, labels speak their names. The tutor sees where the finger is and talks them through it, like any lesson. The teaching stays human.\"\n\nPoint at the three regions on the image: tools left, the board (what the student feels) centre, the session panel (the tutor's view of the student) right. The image is a desktop simulation; the label on it says so.");
}

// ---------------------------------------------------------------- 5 Value Proposition (16 s)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  label(s, "VALUE PROPOSITION");
  heading(s, "What each person gets");
  const rows = [
    ["For the student", "The drawing is under your finger the moment it is drawn, on the phone you already carry. Lines buzz, labels speak their names, and you explore at your own pace."],
    ["For the tutor", "You see the student's finger live, what the phone last said and how much of the drawing has been covered, and you reveal the next part when they are ready. You keep teaching."],
    ["For the school", "Nothing to buy: a web page on the laptop, Chrome on an Android phone, one small relay (today over a USB cable). The same workspace carries routes, graphs, geometry and circuits."],
  ];
  rows.forEach(([h, b], i) => {
    const y = 1.38 + i * 1.22;
    bar(s, M, y + 0.03, 0.98);
    text(s, h, { x: M + 0.2, y, w: 4.8, h: 0.28, fontFace: SEMI, fontSize: 11.5, color: GREEN });
    text(s, b, { x: M + 0.2, y: y + 0.3, w: 4.8, h: 0.78, fontSize: 10.5 });
  });
  const iw = 3.85, ix = W - M - iw, iy = 1.38;
  const ih = image16x9(s, asset("sim-route-lesson-still-2-next.png"), ix, iy, iw);
  caption(s, "Step 3 of the simulated lesson: the finger waits at the corner, the tutor clicks Next, the next leg appears and the phone says “Line and label added.”", ix, iy + ih + 0.08, iw, 0.62);
  caption(s, "Board 56 × 120 mm on the phone, mapped by calculation from the screen's specs, not measured.", ix, iy + ih + 0.8, iw, 0.45);
  s.addNotes("16 s. Say: \"Student: the drawing is under your finger the moment it is drawn. Tutor: you see the finger live and reveal the next part when they're ready. School: nothing to buy or install; the same workspace carries graphs, geometry and circuits.\"\n\nThe image is step 3 of the desktop simulation; the label on it says so. The board size on the phone is calculated from the screen's specs, not measured.");
}

// ---------------------------------------------------------------- 6 Competitive Landscape (12 s)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  label(s, "COMPETITIVE LANDSCAPE");
  heading(s, "Where FeelInk fits among today's options");
  const hd = (t) => ({ text: t, options: { fontFace: SEMI, fontSize: 9, color: SLATE, fill: { color: WHITE }, border: [{ type: "none" }, { type: "none" }, { pt: 1, color: INK }, { type: "none" }] } });
  const rule = [{ type: "none" }, { type: "none" }, { pt: 0.75, color: RULE }, { type: "none" }];
  const cell = (t, first) => ({ text: t, options: { fontFace: first ? SEMI : LIGHT, fontSize: 10, color: INK, border: rule } });
  const hi = (t) => ({ text: t, options: { fontFace: SEMI, fontSize: 10, color: GREEN, fill: { color: TINT }, border: [{ pt: 1.5, color: TEAL }, { type: "none" }, { pt: 1.5, color: TEAL }, { type: "none" }] } });
  const rows = [
    ["Refreshable tactile display (APH Monarch)", "Digital tactile files, on demand", "$15,500 per unit\n(aph.org, read Nov 7)", "A field of raised pins; braille and graphics, high fidelity"],
    ["Tactile graphics on paper (swell or embossed)", "Prepared ahead, hours to days", "Low per sheet; needs an embosser or swell machine and preparation time", "Raised lines and braille labels"],
    ["Verbal description", "Live", "Free", "Words; no spatial layout"],
  ];
  const fee = ["FeelInk", "Live, as the tutor draws", "A phone the student owns and a laptop; nothing to install", "One vibrating point plus spoken labels, with the tutor in the loop; far lower fidelity than raised pins"];
  const table = [
    ["Approach", "When the student gets it", "Cost to the classroom", "What it gives"].map(hd),
    ...rows.map((r) => r.map((t, j) => cell(t, j === 0))),
    fee.map(hi),
  ];
  s.addTable(table, { x: M, y: 1.3, w: CW, colW: [2.1, 1.9, 2.45, 2.65], fontFace: LIGHT, valign: "top", margin: [0.08, 0.1, 0.08, 0.1], lineSpacingMultiple: 1.05 });
  caption(s, "We found no other live tutor-to-phone co-drawing (Devpost galleries and the literature, read Nov 6-7). FeelInk supplements tactile graphics, braille and O&M; it does not replace them.", M, 4.5, CW, 0.45);
  s.addNotes("12 s. Say: \"Tactile displays cost fifteen thousand; paper graphics take days; words carry no layout. FeelInk is live, on a phone they own, and far lower fidelity: a supplement, not a replacement.\"\n\nIf asked: we found no other live tutor-to-phone co-drawing in the Devpost galleries and the literature we read Nov 6-7. Say \"we found none\", never \"none exists\".");
}

// ---------------------------------------------------------------- 7 How it works: demonstration (30 s)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  label(s, "HOW IT WORKS");
  text(s, [run("Demonstration: ", { fontFace: SEMI, fontSize: 26 }), run("desktop simulation of the current build", { fontSize: 16 })],
    { x: M, y: 0.58, w: CW, h: 0.55, lineSpacingMultiple: 0.95 });
  const gy = 1.22, gh = 4.0, gw = gh * 16 / 9;
  s.addImage({ path: asset("sim-route-lesson-pitch.gif"), x: M, y: gy, w: gw, h: gh });
  const cx = M + gw + 0.22;
  caption(s, "Scripted tutor and finger on the laptop; no phone, vibration and speech stubbed. Left: the tutor's laptop. Right: what the phone does. The earlier build (tag demo-2) passed a real Pixel 8 check on Saturday evening; this build has not been on the phone yet, so nothing on this slide is device footage. The amber ring is a vibration the script requested, not measured motor output.",
    cx, gy, W - M - cx, gh);
  s.addNotes("30 s. Say: \"Left, the tutor's laptop; right, the student's phone, dark on purpose. A desktop simulation of the current build: scripted finger, buzz and speech stubbed. The finger has stopped at the corner. The tutor clicks Next; the next leg appears and the phone announces it. Now the tutor draws a new leg live, names it Library, and the student follows it there. Teal is covered ink; the amber ring is a buzz the phone asked for.\"\n\nTiming: the clip is 20.6 s and loops. Start talking as it starts; the \"Next\" click is at about 3 s, the live-drawn Library leg from about 9 s. Let it loop under the last sentence.\n\nColours on the board: teal is ink the finger has passed over, grey is drawn but not yet passed over, dashed is hidden by the tutor until Next, the amber ring is a buzz the phone asked for.\n\nNever call it a user, a learner, route discovery or device footage. The amber ring is a request, not proof the motor ran. It is a desktop simulation (scripted finger, buzz and speech stubbed), labelled on both panels. The detailed annotated version is the backup in recordings/out-detailed-0131/. GIFs freeze if the deck is exported to PDF.");
}

// ---------------------------------------------------------------- 8 How it works: built and measured (22 s)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  label(s, "HOW IT WORKS");
  heading(s, "What we built and measured on the phone");
  const cards = [
    ["0 of 132", "Chrome on our Pixel 8 ignores vibrate(0)", "The standard stop never cancelled a buzz; a 2 s buzz “stopped” this way ran 2091 ms. FeelInk stops with a 1 ms buzz instead: the same buzz ended at 311 ms when stopped at 300 ms. Measured with adb dumpsys on the Pixel 8."],
    ["4–5 ms", "Relay to phone, median", "151 of 151 stroke updates reached the phone; 192 of 192 finger samples came back to the stage, median 14 ms; board mapping error 0.03–0.04 mm. Measured on an earlier build, Saturday, over USB."],
    ["No amplitude", "So strength is rhythm", "The Web Vibration API has no intensity. A line is one 5 s hold re-armed at 4.5 s; three sparser pulse patterns fade it toward the edge. Buzzes over 1 s follow the phone's media vibration setting: 51% at 1, 100% at 3. Measured."],
    ["A label is a state", "Not a one-off cue", "Near a label the hold stops, 400 ms of silence while the name starts, three long pulses, then a soft heartbeat while the finger rests. Built; labels were spoken on the Pixel in the demo-2 check."],
  ];
  const gap = 0.16, cw = (CW - gap) / 2, ch = 1.72, y0 = 1.28;
  cards.forEach(([big, head, body], i) => {
    const x = M + (i % 2) * (cw + gap), y = y0 + Math.floor(i / 2) * (ch + gap);
    card(s, x, y, cw, ch);
    text(s, big, { x: x + 0.2, y: y + 0.13, w: cw - 0.4, h: 0.36, fontFace: SEMI, fontSize: 17, color: GREEN, lineSpacingMultiple: 1 });
    text(s, head, { x: x + 0.2, y: y + 0.5, w: cw - 0.4, h: 0.24, fontFace: SEMI, fontSize: 10 });
    text(s, body, { x: x + 0.2, y: y + 0.77, w: cw - 0.4, h: ch - 0.85, fontSize: 9.5 });
  });
  caption(s, "Measured = on the Pixel 8 or by a command. Built = in the code, not measured on the phone. Full list in the README.", M, y0 + 2 * ch + gap + 0.1, CW, 0.25);
  s.addNotes("22 s. Say: \"Nobody we found does live co-drawing to an unmodified phone, and a phone motor took real measurement. Chrome on Android ignores the standard stop, so we stop a buzz with a one-millisecond buzz. The vibration API has no strength, so strength is rhythm. A label is a state: spoken name, triple pulse, heartbeat.\"\n\nBackup numbers if asked: 0 of 132 vibrate(0) stops worked, a 2 s buzz ran 2091 ms; relay to phone median 4-5 ms (151 of 151 strokes), finger back median 14 ms (192 of 192); mapping error 0.03-0.04 mm; all measured on one Pixel 8 on an earlier build. Engineering detail kept off the slide for space: strokes simplified at 2 mm, corners at 40° over 5 mm, reveal ordered by arrival, one relay per port (built).\n\nThe innovation claim, honest version: position-triggered haptics on a stock phone plus a live, tutor-paced reveal. Say \"the whole phone vibrates; FeelInk decides when from where the finger is.\"");
}

// ---------------------------------------------------------------- 9 Validation (30 s)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  label(s, "VALIDATION");
  heading(s, "Validation: exactly what happened");
  text(s, "One critical written response; no target-user trial.", { x: M, y: 1.12, w: CW, h: 0.3, fontFace: SEMI, fontSize: 12, color: GREEN });
  const rows = [
    ["Device and engineering", "Measured on one Pixel 8 (previous slide). The earlier build, tag demo-2, passed a real-Pixel re-check Saturday 20:33: Connect, route trace, labels spoken, step reveal. A team check, no user.", 0.5],
    ["Prototype usability", "One eyes-closed run by a sighted teammate on an earlier build: 4 of 5 shapes named, median 49.9 s per shape. It does not validate the current build, route learning or any educational effect.", 0.5],
    ["Target-user feedback", "One written reply from a blind student with tactile-graph experience, by email, logged anonymously. Their verdict: this approach won't work in practice. A single vibrating point on flat glass gives no spatial context once the finger slips off; TalkBack intercepts one-finger gestures; motor latency and fingertip numbness turn the lesson into chasing a buzz. They suggested audio sonification or low-cost raised-line boards.", 1.15],
    ["Not yet", "No blind user has tried FeelInk. No footage of this build on a phone: the clips are desktop simulations. Evidence that it helps students learn: none. It is a hypothesis to test.", 0.5],
  ];
  let y = 1.6;
  rows.forEach(([head, body, h], i) => {
    bar(s, M, y, h, i === 3 ? AMBER : TEAL);
    text(s, head, { x: M + 0.2, y, w: 2.05, h, fontFace: SEMI, fontSize: 10.5, color: GREEN });
    text(s, body, { x: M + 2.35, y, w: CW - 2.35, h, fontSize: 10 });
    y += h + 0.18;
  });
  s.addNotes("30 s. Say: \"Exactly what happened: the engineering is measured on one Pixel 8, and Saturday's build passed a hands-on device check. One eyes-closed run by a sighted teammate named four of five shapes; it says nothing about learning. We asked the people it is for, and the one written answer was no: a single vibrating point gives no spatial context, TalkBack intercepts the gesture, latency means chasing a buzz. No blind student has tried it yet.\"\n\nHard rules: the respondent's name and organisation stay off the slide and out of the talk (anonymity promised). Never say \"users\" in the plural. Never pair the covered percentage with learning.\n\nReeve and Nathan own the rest of the validation evidence (Reddit replies, comments that changed the design, other people reached): they log it in USERS.md and add the lines here. Anonymous, counts and dates, never \"users\" in the plural beyond what happened.");
}

// ---------------------------------------------------------------- 10 Validation: limitations (15 s)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  label(s, "VALIDATION");
  heading(s, "Limitations, and what the critique changes");
  const cols = [
    ["In the design, not yet tried by a student", TEAL, [
      "The tutor sees the finger live and talks, so “which way do I search” is answered by a person, not the phone.",
      "Off the ink, the phone taps on a cadence that quickens toward the nearest line (built; not yet felt on a phone).",
      "A fade band gives a weaker signal beside the line before it goes silent.",
      "Labels are spoken, so the student is never only chasing a buzz.",
    ]],
    ["Not answered", AMBER, [
      "TalkBack untested; the Android sources suggest one-finger exploring may never reach the page with it on.",
      "USB only. Venue Wi-Fi and a phone hotspot both failed; no classroom network path is shown.",
      "One phone, one laptop. iPhone is impossible: Safari has no Vibration API.",
      "Far lower fidelity than a tactile display: one fingertip, no raised dots, no braille.",
      "No evidence of learning.",
    ]],
  ];
  const gap = 0.2, cw = (CW - gap) / 2, cy = 1.3, ch = 3.2;
  cols.forEach(([head, color, items], i) => {
    const x = M + i * (cw + gap);
    card(s, x, cy, cw, ch);
    s.addShape(pres.shapes.RECTANGLE, { x, y: cy, w: cw, h: 0.06, fill: { color }, line: { type: "none" } });
    text(s, head, { x: x + 0.22, y: cy + 0.2, w: cw - 0.44, h: 0.3, fontFace: SEMI, fontSize: 12, color: GREEN });
    text(s, items.map((t, j) => run(t, { bullet: { indent: 12 }, breakLine: j < items.length - 1, paraSpaceAfter: 5 })),
      { x: x + 0.22, y: cy + 0.58, w: cw - 0.44, h: ch - 0.7, fontSize: 10 });
  });
  text(s, "Half the critique shaped the design; none of it has been tried with a blind student yet. The other half is open, and we say so.", { x: M, y: 4.72, w: CW, h: 0.35, fontSize: 12, italic: true, color: GREEN });
  s.addNotes("15 s. Say: \"Half of that critique is why the tutor is in the loop: a person answers 'which way do I search', and labels speak. The other half is open: TalkBack, USB only, one phone, no evidence of learning.\"\n\nNever claim TalkBack works, Wi-Fi works, any phone beyond the one Pixel 8, or that anything after tag demo-2 was felt on the phone.");
}

// ---------------------------------------------------------------- 11 Impact & Benefit (21 s)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  label(s, "IMPACT & BENEFIT");
  heading(s, "Impact, and what's next");
  text(s, "Every blind student with an Android phone could get the diagram the moment it is drawn.", { x: M, y: 1.12, w: CW, h: 0.32, fontFace: SEMI, fontSize: 12.5, color: GREEN });
  const cards = [
    ["Cost", "A phone the student already owns, against a $15,500 display. A supplement to tactile graphics, braille and O&M, not a replacement."],
    ["Reach", "The same lines, labels and reveal steps carry graphs, geometry and circuits. A one-click coordinate plane is the first preset."],
    ["How it was built", "Two people in one weekend, with AI-assisted development: Claude Code and Codex agents implemented under our direction, each change tested in the browser; the two tagged demo builds were checked on a Pixel 8 by hand, later builds on the desktop only."],
  ];
  const gap = 0.16, cw = (CW - 2 * gap) / 3, cy = 1.62, ch = 2.0;
  cards.forEach(([h, b], i) => {
    const x = M + i * (cw + gap);
    card(s, x, cy, cw, ch);
    text(s, h, { x: x + 0.2, y: cy + 0.15, w: cw - 0.4, h: 0.28, fontFace: SEMI, fontSize: 11.5, color: GREEN });
    text(s, b, { x: x + 0.2, y: cy + 0.47, w: cw - 0.4, h: ch - 0.55, fontSize: 9.5 });
  });
  const ny = cy + ch + 0.25;
  text(s, "Next, in order", { x: M, y: ny, w: 4.6, h: 0.28, fontFace: SEMI, fontSize: 11.5, color: GREEN });
  const next = [
    "Put it in front of blind students and teachers, with consent, before building more.",
    "TalkBack on a real device.",
    "A classroom network path: phone and laptop on shared Wi-Fi.",
  ];
  text(s, next.map((t, j) => run(t, { bullet: { type: "number", indent: 14 }, breakLine: j < next.length - 1, paraSpaceAfter: 3 })),
    { x: M, y: ny + 0.32, w: 4.75, h: 1.0, fontSize: 10 });
  const qx = 5.55;
  bar(s, qx, ny + 0.04, 1.1);
  text(s, "If the students say yes, a classroom with a laptop and an Android phone needs no new hardware to try it. If they say no, we will have learned that for the price of a weekend.",
    { x: qx + 0.2, y: ny, w: W - M - qx - 0.2, h: 1.2, fontSize: 11, italic: true, color: GREEN, lineSpacingMultiple: 1.1 });
  s.addNotes("21 s. Say: \"Every blind student with an Android phone could get the diagram the moment it is drawn. Next: blind students and their teachers try it, with consent, before we build more; then TalkBack and a classroom network. If they say yes, it costs nothing to roll out; if no, we learned that for a weekend.\"\n\nIf over time, cut the last sentence.\n\nReeve, Nov 8: sonification stays in notes or Q&A, not on the slide; the Next list leads with target-user testing, TalkBack and a reliable classroom setup.");
}

// ---------------------------------------------------------------- 12 Team (8 s)
{
  const s = pres.addSlide({ masterName: "WHITE" });
  label(s, "TEAM");
  heading(s, "Team and disclosure");
  const people = [
    ["Reeve Masilamani", "UC Davis. Product, device and engineering."],
    ["Nathan Jeevamani", "Presentation and design; the Pixel 8 used for every device check is his."],
  ];
  const gap = 0.2, pw = (CW - gap) / 2;
  people.forEach(([n, r], i) => {
    const x = M + i * (pw + gap);
    bar(s, x, 1.3, 0.78);
    text(s, n, { x: x + 0.2, y: 1.28, w: pw - 0.3, h: 0.36, fontFace: SEMI, fontSize: 15, color: GREEN, lineSpacingMultiple: 1 });
    text(s, r, { x: x + 0.2, y: 1.66, w: pw - 0.3, h: 0.45, fontSize: 10 });
  });
  const dy = 2.42;
  card(s, M, dy, CW, 2.45, FILL);
  text(s, "Disclosure, as the organisers ask", { x: M + 0.25, y: dy + 0.17, w: CW - 0.5, h: 0.28, fontFace: SEMI, fontSize: 11.5, color: GREEN });
  const disc = [
    "AI tools: Claude Code (Anthropic) agents and Codex (OpenAI) reviews did implementation under our direction; we specified, tested in the browser and checked the tagged demo builds on the Pixel by hand.",
    "Open source: impeccable design skill (Paul Bakaus, Apache 2.0); Atkinson Hyperlegible typeface (Braille Institute, via Google Fonts); Poppins (Google Fonts, the template's face); FFmpeg to compose the clips; pptxgenjs to build the deck. The app itself is Python standard library and plain browser APIs, no frameworks.",
    "Hardware: owned gear only, an unmodified Pixel 8 and a laptop. No physical build.",
    "Repo created at the event on Friday Nov 6. The demonstration clips are desktop simulations and are labelled as such.",
  ];
  text(s, disc.map((t, j) => run(t, { bullet: { indent: 12 }, breakLine: j < disc.length - 1, paraSpaceAfter: 5 })),
    { x: M + 0.25, y: dy + 0.55, w: CW - 0.5, h: 1.78, fontSize: 10 });
  s.addNotes("8 s. Say: \"Reeve and Nathan. Built with Claude Code and Codex under our direction; open-source pieces are on the slide. Thank you.\"\n\nReeve: UC Davis (Sacramento State is the venue). Nathan: name only, no affiliation on the slide. Check the contribution lines with Nathan. If any code was carried over from earlier work, it has to be disclosed here (organiser rule).");
}

(async () => {
  const outFile = path.join(OUT, "FeelInk-deck-template-2026-11-08.pptx");
  await pres.writeFile({ fileName: outFile });
  // Drop the ZIP's directory entries: Google Drive / Slides import has failed on files that carry them.
  // Also keep only the first <a:pPr> of each paragraph: pptxgenjs writes one per run when a paragraph mixes
  // fonts ("Who: ..."), which the schema does not allow.
  const { execFileSync } = require("child_process");
  execFileSync("python", ["-c", `
import sys, zipfile, shutil, os, re
PPR = re.compile(r'<a:pPr\\b[^>]*/>|<a:pPr\\b[^>]*>.*?</a:pPr>', re.S)
def one_ppr(m):
    seen = []
    def keep(n):
        seen.append(1)
        return n.group(0) if len(seen) == 1 else ""
    return PPR.sub(keep, m.group(0))
src = sys.argv[1]; tmp = src + ".tmp"; dropped = 0
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    names = [i for i in zin.infolist() if not i.filename.endswith("/")]
    # [Content_Types].xml first, as Office expects
    names.sort(key=lambda i: (i.filename != "[Content_Types].xml", i.filename))
    for i in names:
        data = zin.read(i.filename)
        if re.match(r"ppt/slides/slide\\d+\\.xml$", i.filename):
            xml = data.decode("utf-8")
            fixed = re.sub(r"<a:p>.*?</a:p>", one_ppr, xml, flags=re.S)
            dropped += xml.count("<a:pPr") - fixed.count("<a:pPr")
            data = fixed.encode("utf-8")
        zout.writestr(i, data)
os.replace(tmp, src)
print("zip entries:", len(names), "; extra pPr dropped:", dropped)
`, outFile], { stdio: "inherit" });
  const st = fs.statSync(outFile);
  console.log("wrote", outFile, (st.size / 1e6).toFixed(2), "MB");
})();
