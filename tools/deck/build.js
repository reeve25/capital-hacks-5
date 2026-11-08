// FeelInk pitch deck draft, Capital Hacks 5.0, Sun Nov 8 2026. Built from .plans/feelink-deck-2026-11-07.md,
// .tmp/critic-2026-11-08.md section 4 and STATUS.md "Next" 1, with the desktop-simulation assets in recordings/out/.
// Dark theme matching the recording composition (bg 0E1620, teal 2BB3A3, amber FFB020). Calibri (Carlito in Google
// Slides) so widths survive import. All colours hex, so a Google Slides import keeps them.
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const REPO = path.resolve(__dirname, "../..");
const OUT = path.join(REPO, "recordings/out");
const HERE = __dirname;
const asset = (name) => {
  const p = path.join(OUT, name);
  if (!fs.existsSync(p)) throw new Error("missing asset " + p);
  return p;
};
const firstExisting = (...names) => {
  for (const n of names) { const p = path.join(OUT, n); if (fs.existsSync(p)) return p; }
  throw new Error("none of " + names.join(", "));
};

const BG = "0E1620", CARD = "17212E", RULE = "26313D", TEXT = "E8EDF2", MUTED = "96A6B5", TEAL = "2BB3A3", AMBER = "FFB020", WHITE = "FFFFFF";
const FONT = "Calibri";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pres.author = "Reeveson Masilamani";
pres.title = "FeelInk: feel the lesson as it is drawn";
pres.defineSlideMaster({
  title: "DARK",
  background: { color: BG },
  objects: [
    { text: { text: "FeelInk \u00B7 Capital Hacks 5.0", options: { x: 0.6, y: 7.02, w: 6, h: 0.3, fontSize: 10, color: MUTED, fontFace: FONT, margin: 0 } } },
  ],
  slideNumber: { x: 12.2, y: 7.02, w: 0.55, h: 0.3, fontSize: 10, color: MUTED, fontFace: FONT, align: "right" },
});
pres.defineSlideMaster({ title: "DARK_PLAIN", background: { color: BG } });

const W = 13.333;
function title(slide, text) {
  slide.addText(text, { x: 0.6, y: 0.38, w: 12.1, h: 0.8, fontSize: 30, bold: true, color: TEXT, fontFace: FONT, isTextBox: true, margin: 0, valign: "top" });
}
function card(slide, x, y, w, h) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: CARD }, line: { color: RULE, width: 0.75 }, rectRadius: 0.08 });
}
function caption(slide, text, x, y, w, h = 0.6) {
  slide.addText(text, { x, y, w, h, fontSize: 11.5, color: MUTED, fontFace: FONT, isTextBox: true, margin: 0, valign: "top" });
}
function runs(parts) {
  // parts: [{t, size, color, bold, italic, br}]
  return parts.map((p, i) => ({
    text: p.t,
    options: { fontSize: p.size, color: p.color || TEXT, bold: !!p.bold, italic: !!p.italic, breakLine: p.br !== false && i < parts.length - 1, fontFace: FONT, paraSpaceAfter: p.after || 0 },
  }));
}
function image16x9(slide, p, x, y, w) {
  const h = w * 9 / 16;
  slide.addImage({ path: p, x, y, w, h });
  return h;
}
function label(slide, text, x, y, w, color = MUTED) {
  slide.addText(text, { x, y, w, h: 0.3, fontSize: 11, bold: true, color, fontFace: FONT, isTextBox: true, margin: 0, charSpacing: 1 });
}

// ---------------------------------------------------------------- 1 Title (10 s)
{
  const s = pres.addSlide({ masterName: "DARK_PLAIN" });
  s.addText("FeelInk", { x: 0.7, y: 1.75, w: 5.4, h: 1.3, fontSize: 72, bold: true, color: WHITE, fontFace: FONT, isTextBox: true, margin: 0 });
  s.addText("Feel the lesson as it is drawn.", { x: 0.7, y: 3.1, w: 5.6, h: 0.6, fontSize: 26, color: TEAL, fontFace: FONT, isTextBox: true, margin: 0 });
  s.addText(runs([
    { t: "A sighted tutor draws on a laptop. A blind student feels the drawing as vibration on an ordinary Android phone and hears the labels.", size: 15, color: TEXT, after: 10 },
    { t: "Health + Accessibility track \u00B7 Capital Hacks 5.0, Nov 6\u20138, 2026", size: 13, color: MUTED },
    { t: "Reeveson Masilamani and Nathan Jeevamani", size: 13, color: MUTED },
  ]), { x: 0.7, y: 3.95, w: 5.5, h: 2.2, fontFace: FONT, isTextBox: true, margin: 0, valign: "top" });
  const w = 6.4, x = W - 0.6 - w, y = 1.35;
  const h = image16x9(s, asset("sim-route-lesson-still-5-library.png"), x, y, w);
  caption(s, "Desktop simulation of the current build: scripted tutor and finger, no phone. An earlier build ran on a real Pixel 8.", x, y + h + 0.12, w, 0.5);
  s.addNotes("10 s (deck target 3:30–3:40 in rehearsal, Reeve Nov 8; per-slide seconds below total 3:35). \"FeelInk lets a blind student feel what a tutor is drawing, live, on a phone they already own.\"\n\nSlide image: composite still at the end of the simulated route lesson (recordings/out/sim-route-lesson-still-5-library.png). It is labelled as a desktop simulation on the image itself; keep that label if the image is cropped.");
}

// ---------------------------------------------------------------- 2 Problem (35 s)
{
  const s = pres.addSlide({ masterName: "DARK" });
  title(s, "A drawing made mid-lesson reaches a blind student late, or never");
  const beats = [
    "A teacher sketches a route, a graph or a circuit on the board. Sighted students see it at once.",
    "The blind student gets a verbal description, a tactile sheet later, or nothing. When the drawing changes, they wait again.",
    "The dedicated fix is a refreshable tactile display. One unit costs $15,500, so most classrooms will never see one.",
  ];
  beats.forEach((b, i) => {
    const y = 1.45 + i * 1.55;
    card(s, 0.6, y, 7.3, 1.3);
    s.addShape(pres.shapes.OVAL, { x: 0.85, y: y + 0.4, w: 0.5, h: 0.5, fill: { color: TEAL }, line: { color: TEAL, width: 0 } });
    s.addText(String(i + 1), { x: 0.85, y: y + 0.4, w: 0.5, h: 0.5, fontSize: 16, bold: true, color: BG, fontFace: FONT, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    s.addText(b, { x: 1.6, y: y + 0.15, w: 6.1, h: 1.0, fontSize: 16, color: TEXT, fontFace: FONT, isTextBox: true, margin: 0, valign: "middle" });
  });
  s.addText("Who: blind and low-vision students, and the tutors who teach them one to one.", { x: 0.6, y: 6.2, w: 7.3, h: 0.5, fontSize: 15, color: TEAL, fontFace: FONT, isTextBox: true, margin: 0, italic: true });
  // Stats column
  card(s, 8.3, 1.45, 4.45, 4.95);
  s.addText("$15,500", { x: 8.55, y: 1.6, w: 4.0, h: 1.1, fontSize: 60, bold: true, color: AMBER, fontFace: FONT, isTextBox: true, margin: 0 });
  s.addText("APH Monarch, the refreshable tactile display built for this job (aph.org, read Nov 7).", { x: 8.55, y: 2.7, w: 4.0, h: 0.7, fontSize: 13, color: MUTED, fontFace: FONT, isTextBox: true, margin: 0 });
  s.addText("73,505", { x: 8.55, y: 3.6, w: 4.0, h: 0.6, fontSize: 32, bold: true, color: TEXT, fontFace: FONT, isTextBox: true, margin: 0 });
  s.addText("US students registered with APH (FY2025 report)", { x: 8.55, y: 4.2, w: 4.0, h: 0.4, fontSize: 13, color: MUTED, fontFace: FONT, isTextBox: true, margin: 0 });
  s.addText("2.2 billion", { x: 8.55, y: 4.75, w: 4.0, h: 0.6, fontSize: 32, bold: true, color: TEXT, fontFace: FONT, isTextBox: true, margin: 0 });
  s.addText("people worldwide with a vision impairment (WHO, 2026), context only", { x: 8.55, y: 5.35, w: 4.0, h: 0.6, fontSize: 13, color: MUTED, fontFace: FONT, isTextBox: true, margin: 0 });
  s.addNotes("30 s. Who, what their day looks like now, why the gap exists (cost and preparation time). No product yet.\n\n\"A teacher sketches a route on the board and every sighted student sees it. The blind student in that room gets a description, or a tactile sheet days later, or nothing, and when the drawing changes they wait again. The dedicated fix exists: a refreshable tactile display. It costs fifteen and a half thousand dollars.\"\n\nNever say \"2.2 billion blind people\": the WHO figure is vision impairment of any kind. No APH braille-literacy percentages. Sources: aph.org (Monarch price, fetched Sat 13:20), APH FY2025 report, WHO 2026.");
}

// ---------------------------------------------------------------- 3 What FeelInk is (25 s)
{
  const s = pres.addSlide({ masterName: "DARK" });
  title(s, "A tutor's whiteboard the student feels, on a phone they already own");
  const iw = 8.3, ix = 0.6, iy = 1.4;
  const ih = image16x9(s, asset("sim-route-lesson-still-0-establishing.png"), ix, iy, iw);
  caption(s, "The tutor's screen, desktop simulation of the current build with the regions named for this slide. Nothing to install and nothing to buy: a web page on the laptop, Chrome on an ordinary Android phone, one small Python relay between them.", ix, iy + ih + 0.12, iw, 0.7);
  const cx = 9.2, cw = 3.55;
  s.addText(runs([
    { t: "Lines", size: 17, color: TEAL, bold: true },
    { t: "Vibration under one finger. The whole phone buzzes while the finger is on ink, fainter toward the edge.", size: 13.5, after: 12 },
    { t: "Corners and ends", size: 17, color: TEAL, bold: true },
    { t: "Their own short cues.", size: 13.5, after: 12 },
    { t: "Labels", size: 17, color: TEAL, bold: true },
    { t: "Spoken by name, \u201CStart: Classroom\u201D, with a triple pulse to mark the spot.", size: 13.5, after: 12 },
    { t: "Human-led", size: 17, color: AMBER, bold: true },
    { t: "An in-person lesson. The tutor talks, watches the student's finger live and reveals the drawing step by step. The software is the tactile workspace.", size: 13.5 },
  ]), { x: cx, y: 1.4, w: cw, h: 5.3, fontFace: FONT, isTextBox: true, margin: 0, valign: "top" });
  s.addNotes("25 s. \"The tutor draws. The student explores. The tutor sees where the finger is and talks them through it, like any lesson.\"\n\nPoint at the three regions on the image: tools left, the board (what the student feels) centre, the session panel (the tutor's view of the student) right. The image is a desktop simulation; the label on it says so.");
}

// ---------------------------------------------------------------- 4 How a lesson goes (20 s)
{
  const s = pres.addSlide({ masterName: "DARK" });
  title(s, "How a lesson goes");
  const steps = [
    ["TUTOR", "Draws freehand or Shift-straight lines, places labels and a start point."],
    ["STUDENT", "Taps Connect. The screen goes black and the whole board maps onto it at true scale."],
    ["STUDENT", "Slides one finger. Lines buzz, corners cue, labels speak."],
    ["TUTOR", "Talks, as in any lesson, and watches the finger, the last label heard and the covered share."],
    ["TUTOR", "Reveals one stroke at a time. Hidden strokes stay silent; the phone says what changed: \u201CLine added.\u201D"],
    ["STUDENT", "Explores at their own pace. Android Back leaves the drawing."],
  ];
  const cw = 2.35, ch = 2.15, gap = 0.17, x0 = 0.6;
  steps.forEach(([who, text], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = x0 + col * (cw + gap), y = 1.45 + row * (ch + 0.2);
    card(s, x, y, cw, ch);
    s.addText(String(i + 1), { x: x + 0.18, y: y + 0.12, w: 0.5, h: 0.5, fontSize: 26, bold: true, color: AMBER, fontFace: FONT, isTextBox: true, margin: 0 });
    s.addText(who, { x: x + 0.7, y: y + 0.22, w: cw - 0.85, h: 0.3, fontSize: 11, bold: true, color: who === "TUTOR" ? TEAL : "B48CFF", fontFace: FONT, isTextBox: true, margin: 0, charSpacing: 1 });
    s.addText(text, { x: x + 0.18, y: y + 0.7, w: cw - 0.36, h: ch - 0.85, fontSize: 13, color: TEXT, fontFace: FONT, isTextBox: true, margin: 0, valign: "top" });
  });
  const ix = 8.4, iw = 4.35, iy = 1.5;
  const ih = image16x9(s, asset("sim-route-lesson-still-2-next.png"), ix, iy, iw);
  caption(s, "Step 3 of the simulated lesson: the finger waits at the corner, the tutor clicks Next, the next leg appears and the phone says \u201CLine and label added.\u201D", ix, iy + ih + 0.12, iw, 0.8);
  caption(s, "Board 56 \u00D7 120 mm on the phone, mapped by calculation from the screen's specs, not measured.", ix, iy + ih + 1.0, iw, 0.6);
  s.addNotes("20 s. Say the steps in the tutor's and the student's voice, one short sentence each. \"I draw the route and name the rooms. You connect, and the board is under your finger at real size. You trace; it buzzes on the line and names each room. I watch your finger and reveal the next leg when you are ready.\"");
}

// ---------------------------------------------------------------- 5 Demonstration (30 s)
{
  const s = pres.addSlide({ masterName: "DARK_PLAIN" });
  title(s, "Demonstration: desktop simulation of the current build");
  const gif = firstExisting("sim-route-lesson-pitch.gif", "sim-route-lesson.gif");
  const gh = 5.5, gw = gh * 16 / 9, gx = (W - gw) / 2, gy = 1.15;
  s.addImage({ path: gif, x: gx, y: gy, w: gw, h: gh });
  caption(s, "Scripted tutor and finger on the laptop; no phone, vibration and speech stubbed. Left: the tutor's laptop. Right: what the phone does. The earlier build (tag demo-2) passed a real Pixel 8 check on Saturday evening; this build has not been on the phone yet, so nothing on this slide is device footage.", 0.6, 6.78, 12.1, 0.6);
  s.addNotes("30 s. Say almost nothing: name what the judge is looking at, then let it play. \"Left, the tutor's laptop. Right, the student's phone, screen dark on purpose. The student's finger has stopped at the corner. The tutor clicks Next, the next leg appears and the phone announces it. Now the tutor draws a new leg live while the student waits, names it Library, and the student follows it there.\"\n\nColours on the board: teal is ink the finger has passed over, grey is drawn but not yet passed over, dashed is hidden by the tutor until Next, the amber ring is a buzz the phone asked for. Say this out loud rather than reading a key.\n\nHonesty: this is a desktop simulation (scripted finger, buzz and speech stubbed), labelled on both panels. Never call it a user, a learner or route discovery. The clip loops; the detailed annotated version is the backup in recordings/out-detailed-0131/. GIFs freeze if the deck is exported to PDF.");
}

// ---------------------------------------------------------------- 6 The tutor's side (15 s)
{
  const s = pres.addSlide({ masterName: "DARK" });
  title(s, "The tutor sees the student's finger live and paces the reveal");
  const iw = 7.7, ix = 0.6, iy = 1.4;
  const ih = image16x9(s, asset("sim-route-lesson-still-4-tutor-draws.png"), ix, iy, iw);
  caption(s, "Step 4 of the simulated lesson: the student waits at Office while the tutor draws the Library leg live; the phone says \u201CLine added\u201D, then \u201CLabel added\u201D.", ix, iy + ih + 0.12, iw, 0.6);
  // Session panel at 2x (fixed still-6 if present, else a crop of the establishing still)
  const sp = asset("sim-route-lesson-still-6-session-panel.png");
  const sx = 8.75, sw = 3.95, sy = 1.4;
  s.addImage({ path: sp, x: sx, y: sy, w: sw, h: 3.4, sizing: { type: "contain", w: sw, h: 3.4 } });
  label(s, "SESSION PANEL: THE TUTOR'S VIEW", sx, sy + 3.5, sw);
  const GREY = "8A96A3";
  const key = [
    ["bar", TEAL, "Teal: ink the finger has passed over (\u201CCovered\u201D is coverage, a progress cue, not understanding)."],
    ["bar", GREY, "Grey: drawn, not yet passed over."],
    ["dash", GREY, "Dashed: hidden by the tutor until Next."],
    ["ring", AMBER, "Amber ring: the phone asked for a buzz. A request, not proof the motor ran."],
  ];
  key.forEach(([kind, c, t], i) => {
    const y = sy + 3.9 + i * 0.5;
    if (kind === "bar") {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: sx, y: y + 0.1, w: 0.36, h: 0.09, fill: { color: c }, line: { color: c, width: 0 }, rectRadius: 0.04 });
    } else if (kind === "dash") {
      for (let k = 0; k < 3; k++) s.addShape(pres.shapes.RECTANGLE, { x: sx + k * 0.13, y: y + 0.1, w: 0.08, h: 0.09, fill: { color: c }, line: { color: c, width: 0 } });
    } else {
      s.addShape(pres.shapes.OVAL, { x: sx + 0.07, y: y + 0.03, w: 0.22, h: 0.22, fill: { type: "none" }, line: { color: c, width: 2 } });
    }
    s.addText(t, { x: sx + 0.5, y, w: sw - 0.5, h: 0.48, fontSize: 11.5, color: TEXT, fontFace: FONT, isTextBox: true, margin: 0, valign: "top" });
  });
  s.addNotes("15 s. \"The tutor's screen is the lesson plan. They see the finger live, what the phone last said and how much of the drawing has been covered, and they decide when the next part appears. That is what makes this teaching, not a tactile picture viewer.\"\n\nDesktop simulation; both images carry the label. The session panel still is the panel at twice its on-screen size.");
}

// ---------------------------------------------------------------- 7 What we built and measured (30 s)
{
  const s = pres.addSlide({ masterName: "DARK" });
  title(s, "What we built, and what we measured on the phone");
  const cards = [
    ["0 of 132", "Chrome on Android ignores vibrate(0)", "The standard stop never cancelled a buzz; a 2 s buzz \u201Cstopped\u201D this way ran 2091 ms. FeelInk stops with a 1 ms buzz instead: the same buzz ended at 311 ms when stopped at 300 ms. Measured with adb dumpsys on the Pixel 8."],
    ["4\u20135 ms", "Relay to phone, median", "151 of 151 stroke updates reached the phone; 192 of 192 finger samples came back to the stage, median 14 ms; board mapping error 0.03\u20130.04 mm. Measured on an earlier build, Saturday, over USB."],
    ["No amplitude", "So strength is rhythm", "The Web Vibration API has no intensity. A line is one 5 s hold re-armed at 4.5 s; three sparser pulse patterns fade it toward the edge. Buzzes over 1 s follow the phone's media vibration setting: 51% at 1, 100% at 3. Measured."],
    ["A label is a state", "Not a one-off cue", "Near a label the hold stops, 400 ms of silence while the name starts, three long pulses, then a soft heartbeat while the finger rests. Strokes simplified at 2 mm, corners at 40\u00B0 over 5 mm, reveal ordered by arrival, one relay per port. Built; labels were spoken on the Pixel in the demo-2 check."],
  ];
  const cw = 5.95, ch = 2.45;
  cards.forEach(([big, head, body], i) => {
    const x = 0.6 + (i % 2) * (cw + 0.23), y = 1.4 + Math.floor(i / 2) * (ch + 0.2);
    card(s, x, y, cw, ch);
    s.addText(big, { x: x + 0.25, y: y + 0.15, w: cw - 0.5, h: 0.7, fontSize: 34, bold: true, color: AMBER, fontFace: FONT, isTextBox: true, margin: 0 });
    s.addText(head, { x: x + 0.25, y: y + 0.85, w: cw - 0.5, h: 0.35, fontSize: 15, bold: true, color: TEAL, fontFace: FONT, isTextBox: true, margin: 0 });
    s.addText(body, { x: x + 0.25, y: y + 1.22, w: cw - 0.5, h: ch - 1.3, fontSize: 12.5, color: TEXT, fontFace: FONT, isTextBox: true, margin: 0, valign: "top" });
  });
  caption(s, "Measured = on the Pixel 8 or by a command. Built = in the code, not measured on the phone. Full list in the README.", 0.6, 6.72, 12.1, 0.3);
  s.addNotes("25 s. \"Nobody we found does live co-drawing to an unmodified phone. Getting a phone motor to behave took real measurement. Chrome on Android ignores the standard stop call, so we stop a buzz with a one-millisecond buzz. The vibration API has no strength, so strength is rhythm. A label is a state with a spoken name, a triple pulse and a heartbeat, not a blip.\"\n\nThe innovation claim, honest version: position-triggered haptics on a stock phone plus a live, tutor-paced reveal. Say \"the whole phone vibrates; FeelInk decides when from where the finger is.\"");
}

// ---------------------------------------------------------------- 8 Validation (30 s)
{
  const s = pres.addSlide({ masterName: "DARK" });
  title(s, "Validation: exactly what happened");
  const rows = [
    ["Device and engineering", "Measured on one Pixel 8 (previous slide). The earlier build, tag demo-2, passed a real-Pixel re-check Saturday 20:33: Connect, route trace, labels spoken, step reveal. A team check, no user."],
    ["Prototype usability", "One eyes-closed run by a sighted teammate on an earlier build: 4 of 5 shapes named, median 49.9 s per shape. It does not validate the current build, route learning or any educational effect."],
    ["Target-user feedback", "One written reply from a blind student with tactile-graph experience, by email, logged anonymously. Their verdict: this approach won't work in practice. A single vibrating point on flat glass gives no spatial context once the finger slips off; TalkBack intercepts one-finger gestures; motor latency and fingertip numbness turn the lesson into chasing a buzz. They suggested audio sonification or low-cost raised-line boards."],
    ["Not yet", "No blind user has tried FeelInk. No footage of this build on a phone: the clips are desktop simulations. Evidence that it helps students learn: none. It is a hypothesis to test."],
  ];
  const hs = [1.05, 1.05, 1.5, 1.05];
  let y = 1.4;
  rows.forEach(([head, text], i) => {
    const h = hs[i];
    card(s, 0.6, y, 12.1, h);
    s.addText(head, { x: 0.85, y: y + 0.15, w: 2.6, h: h - 0.3, fontSize: 15, bold: true, color: i === 3 ? AMBER : TEAL, fontFace: FONT, isTextBox: true, margin: 0, valign: "top" });
    s.addText(text, { x: 3.55, y: y + 0.15, w: 8.9, h: h - 0.3, fontSize: 13.5, color: TEXT, fontFace: FONT, isTextBox: true, margin: 0, valign: "top" });
    y += h + 0.15;
  });
  s.addNotes("30 s. \"We asked the people it is for, and the first answer was no. Here is why, and here is what in the design already answers part of it and what does not.\" Then the next slide.\n\nHard rules: the respondent's name and organisation stay off the slide and out of the talk (anonymity promised). Never say \"users\" in the plural. Never pair the covered percentage with learning.\n\nReeve and Nathan own the rest of the validation evidence (Reddit replies, comments that changed the design, other people reached): they log it in USERS.md and add the lines here. Anonymous, counts and dates, never \"users\" in the plural beyond what happened.");
}

// ---------------------------------------------------------------- 9 Limitations (15 s)
{
  const s = pres.addSlide({ masterName: "DARK" });
  title(s, "Limitations, and what the critique changes");
  const cols = [
    ["Already in the design", TEAL, [
      "The tutor sees the finger live and talks, so \u201Cwhich way do I search\u201D is answered by a person, not the phone.",
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
  cols.forEach(([head, color, items], i) => {
    const x = 0.6 + i * 6.15, w = 5.95;
    card(s, x, 1.4, w, 4.3);
    s.addText(head, { x: x + 0.25, y: 1.55, w: w - 0.5, h: 0.4, fontSize: 18, bold: true, color, fontFace: FONT, isTextBox: true, margin: 0 });
    s.addText(items.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < items.length - 1, paraSpaceAfter: 10 } })),
      { x: x + 0.25, y: 2.05, w: w - 0.5, h: 3.55, fontSize: 15, color: TEXT, fontFace: FONT, isTextBox: true, margin: 0, valign: "top" });
  });
  s.addText("Half the critique is why the tutor is in the loop. The other half is open, and we say so.", { x: 0.6, y: 5.95, w: 12.1, h: 0.4, fontSize: 15, italic: true, color: TEAL, fontFace: FONT, isTextBox: true, margin: 0 });
  s.addNotes("15 s. \"Half the critique is why the tutor is in the loop. The other half is open, and we say so.\" Do not claim TalkBack works, Wi-Fi works, or any device beyond the one Pixel 8.");
}

// ---------------------------------------------------------------- 10 Impact and next (15 s)
{
  const s = pres.addSlide({ masterName: "DARK" });
  title(s, "Impact, and what's next");
  const cards = [
    ["Cost", "A phone the student already owns, against a $15,500 display. A supplement to tactile graphics, braille and O&M, not a replacement."],
    ["Reach", "The same lines, labels and reveal steps carry graphs, geometry and circuits. A one-click coordinate plane is the first preset."],
    ["How it was built", "Two people in one weekend, with AI-assisted development: Claude Code and Codex agents implemented under our direction, each change tested in the browser and the demo builds checked on the phone by hand."],
  ];
  const cw = 3.9;
  cards.forEach(([head, body], i) => {
    const x = 0.6 + i * (cw + 0.2);
    card(s, x, 1.4, cw, 2.3);
    s.addText(head, { x: x + 0.25, y: 1.55, w: cw - 0.5, h: 0.4, fontSize: 18, bold: true, color: TEAL, fontFace: FONT, isTextBox: true, margin: 0 });
    s.addText(body, { x: x + 0.25, y: 2.0, w: cw - 0.5, h: 1.6, fontSize: 13.5, color: TEXT, fontFace: FONT, isTextBox: true, margin: 0, valign: "top" });
  });
  s.addText("Next, in order", { x: 0.6, y: 3.95, w: 6, h: 0.4, fontSize: 18, bold: true, color: AMBER, fontFace: FONT, isTextBox: true, margin: 0 });
  const next = [
    "Put it in front of blind students and teachers, with consent, before building more.",
    "TalkBack on a real device.",
    "A classroom network path: phone and laptop on shared Wi-Fi.",
  ];
  s.addText(next.map((t, j) => ({ text: t, options: { bullet: { type: "number" }, breakLine: j < next.length - 1, paraSpaceAfter: 6 } })),
    { x: 0.6, y: 4.4, w: 12.1, h: 1.5, fontSize: 15, color: TEXT, fontFace: FONT, isTextBox: true, margin: 0, valign: "top" });
  s.addText("If the students say yes, it costs nothing to put in every classroom with an Android phone. If they say no, we will have learned that for the price of a weekend.", { x: 0.6, y: 6.1, w: 12.1, h: 0.7, fontSize: 14, italic: true, color: TEAL, fontFace: FONT, isTextBox: true, margin: 0 });
  s.addNotes("10 s. \"If the students say yes, it costs nothing to put in every classroom with an Android phone. If they say no, we will have learned that for the price of a weekend.\"\n\nReeve, Nov 8: sonification stays in notes or Q&A, not on the slide; the Next list leads with target-user testing, TalkBack and a reliable classroom setup. Competitive landscape, in a sentence if asked: refreshable tactile displays ($15,500), static tactile graphics prepared ahead, audio description; we found no live tutor-to-phone co-drawing.");
}

// ---------------------------------------------------------------- 11 Team and disclosure (5 s)
{
  const s = pres.addSlide({ masterName: "DARK" });
  title(s, "Team and disclosure");
  const people = [["Reeveson Masilamani", "Product, device and engineering"], ["Nathan Jeevamani", "Presentation and design"]];
  people.forEach(([n, r], i) => {
    const x = 0.6 + i * 4.0;
    card(s, x, 1.4, 3.8, 1.5);
    s.addText(n, { x: x + 0.25, y: 1.55, w: 3.3, h: 0.5, fontSize: 18, bold: true, color: TEXT, fontFace: FONT, isTextBox: true, margin: 0 });
    s.addText(r, { x: x + 0.25, y: 2.1, w: 3.3, h: 0.6, fontSize: 13.5, color: MUTED, fontFace: FONT, isTextBox: true, margin: 0 });
  });
  card(s, 0.6, 3.2, 12.1, 2.7);
  s.addText("Disclosure, as the organisers ask", { x: 0.85, y: 3.35, w: 11.6, h: 0.4, fontSize: 16, bold: true, color: TEAL, fontFace: FONT, isTextBox: true, margin: 0 });
  const disc = [
    "AI tools: Claude Code (Anthropic) agents and Codex (OpenAI) reviews did implementation under our direction; we specified, tested and checked the phone by hand.",
    "Open source: impeccable design skill (Paul Bakaus, Apache 2.0); Atkinson Hyperlegible typeface (Braille Institute, via Google Fonts); FFmpeg to compose the clips. The app itself is Python standard library and plain browser APIs, no frameworks.",
    "Hardware: owned gear only, an unmodified Pixel 8 and a laptop. No physical build.",
    "Repo created at the event on Friday Nov 6. The demonstration clips are desktop simulations and are labelled as such.",
  ];
  s.addText(disc.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < disc.length - 1, paraSpaceAfter: 6 } })),
    { x: 0.85, y: 3.8, w: 11.6, h: 2.4, fontSize: 13, color: TEXT, fontFace: FONT, isTextBox: true, margin: 0, valign: "top" });
  s.addNotes("5 s. One breath: names, then \"built with Claude Code and Codex under our direction, open-source pieces on the slide.\"\n\nReeve, Nov 8: names and actual contributions are enough, schools optional. Check the contribution lines with Nathan. The live Google deck's Team slide still has the template placeholders (\"Barista-turned CEO\", \"Another unrelated skill\"), fix them before any export. If any code was carried over from earlier work, it has to be disclosed here (organiser rule).");
}

(async () => {
  const outFile = path.join(OUT, "FeelInk-deck-draft-2026-11-08.pptx");
  await pres.writeFile({ fileName: outFile });
  // Drop the ZIP's directory entries: Google Drive / Slides import has failed on files that carry them.
  const { execFileSync } = require("child_process");
  execFileSync("python", ["-c", `
import sys, zipfile, shutil, os
src = sys.argv[1]; tmp = src + ".tmp"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    names = [i for i in zin.infolist() if not i.filename.endswith("/")]
    # [Content_Types].xml first, as Office expects
    names.sort(key=lambda i: (i.filename != "[Content_Types].xml", i.filename))
    for i in names:
        zout.writestr(i, zin.read(i.filename))
os.replace(tmp, src)
print("zip entries:", len(names))
`, outFile], { stdio: "inherit" });
  const st = fs.statSync(outFile);
  console.log("wrote", outFile, (st.size / 1e6).toFixed(2), "MB");
})();
