# How blind people learn graphs, shapes and directions, and whether FeelInk helps (Sat Nov 7 2026)

Research for the deck and for the design, run from Nathan's laptop about 17:00-17:50 PT. Question asked: how do blind people learn things like graphing and directions today, and would our product even help?

**Labels.** **Read** = I read the source page or paper text. **Snippet** = seen only in a search summary, not opened. **Reasoned** = my inference. Numbers in a slide must come from a Read row, worded as the row says.

## 1. Bottom line

- **Yes, there is a real gap FeelInk sits in, and it is the live moment.** Every account of a blind student in a mainstream class says the same thing: pre-made tactile graphics work, but anything drawn during the lesson reaches the student late or not at all. A Nashville TVI who recreates the teacher's figures with pushpins and pipe cleaners said "we are always one or two steps behind the teacher" (Read, Vanderbilt 2012). A university physics team said board drawings need "a teaching assistant to create real-time raised-line drawings" on a drawing board, and that production of embossed material "can take weeks or even months" (Read, arXiv 1710.08977).
- **The closest things that exist today are a finger traced on the student's palm and a $15,500 tablet.** O&M instructors teach routes by tracing them on the learner's upturned palm while talking (Snippet, three sources). APH's Wing It app lets a teacher draw on a phone and the student feels "dots appear" on a Monarch (Read, APH blog). FeelInk is the palm-tracing idea on a phone the student already owns. That is a fair one-line positioning.
- **The research says vibration-on-a-touchscreen works for simple graphics, and is slow.** Blind participants matched embossed paper on bar graphs, letters and shapes with a vibro-audio tablet after about 30 minutes of practice, but learning time was significantly longer in every experiment (Read, Giudice 2012, n = 3 blind + 12 blindfolded). A larger study found blind users recognise a basic shape in 1 min 22 s on average at 74% correct, with a whole-device motor and one finger (Read, Tekli 2018, n = 13 blind + 16 blindfolded). Vibration-only on a phone transmitted little information for shapes in one study (Snippet, Lin and Rugama 2016).
- **So the honest claim is: FeelInk helps with the live, simple, "what did the teacher just draw" case, not with reading a full graph.** Simple shapes, a line and its slope, one route with two turns, a point on axes. Not a labelled bar chart, not a map with ten streets. Research and practitioners both say tactile graphics must be simple and scaled up; FeelInk's 56 x 120 mm board on one fingertip is at the low end of that.
- **Nothing here replaces a blind user trying it.** USERS.md is still empty. Everything below is other people's users.

## 2. How blind students learn graphs and shapes today

### 2.1 Reading a picture is a taught skill, part to whole
- Blind readers build a picture "part to whole"; sighted readers take in the whole first. Teachers are told to make a student get "an overview of the entire graph before observing the specific details" (Snippet, Perkins).
- TSBVI, quoted in a Paths to Literacy handout: "Numerous studies have shown that blind students have poor haptic skills, especially related to tactile discrimination, spatial orientation, systematic searching, and tracking and tracing." The fix is practice: real object first (hold a pear), then a model, then the raised outline (Read, Paths to Literacy "Tactile Graphics: Defining, Learning, and Creating").
- Systematic search patterns are taught explicitly: vertical sweeps to cover area fast, or horizontal or circular, so nothing is missed (Read, same handout).
- BANA recommends introducing tactile graphics "early in the process of learning braille", with 3D models (Read, same handout).
- Only a fraction of students read braille or tactile graphics fluently. The 2010-2020 systematic review notes tactile graphics "require training and braille literacy, which limits how many BLV people can use them" (Read, ar5iv 2102.01273). Design implication for FeelInk: no braille is a limit for labels, but also means no braille prerequisite.
- A 2025 study of 11 blind and low-vision tactile readers found they want encodings "designed explicitly for BLV people", not visual charts adapted (Read, arXiv 2508.14289 abstract).

### 2.2 The classroom workflow for graphing (what a TVI actually does)
- **No tech:** APH Graphic Aid for Mathematics, a cork board with a gridded rubber mat. "Two perpendicular rubber bands, held down by thumbtacks, can create the x- and y-axes." Pushpins are points, rubber bands are lines. To shade an inequality the student puts a hand on the shaded side; for a system, one hand per inequality, "where the two hands overlap ... is the solution." The teacher checks each graph by hand as the student finishes (Read, Paths to Literacy, "Teaching a blind student how to graph on a coordinate plane").
- **Low tech:** Wikki Stix and High Dots on braille graph paper for work to hand in. The TVI says it "can be quite expensive, however, and is very time consuming" and tests artistic ability more than understanding (Read, same page).
- **Raised-line drawing boards:** APH Draftsman, TactileDoodle (new, APH), inTACT Sketchpad, Sensational Blackboard ($49 at NFB, Snippet). A rubber pad, a film or plain paper, a stylus; the line comes up raised where you draw. TactileDoodle is pitched exactly for the live moment: a teacher clips in a sheet and draws "a quick graphic during a lesson", and the product manager says it "allows students to be creators of their own graphics" (Read, APH blog). Physics instructors call these "inherently low resolution", best for "quick, approximate sketches" (Read, arXiv 1710.08977).
- **High tech:** Orion TI-84 talking graphing calculator; Desmos with audio trace, where pitch follows the curve left to right (Snippet, Desmos/Smarter Balanced). The TVI insists students "graph extensively by hand" before using a calculator (Read, Paths to Literacy).
- **Embossers and swell paper** for anything prepared in advance; a Tiger embosser is "$5,000 to $15,000" (Read, IntechOpen chapter). Butler et al. found 76% of vision-impaired Australian university students had used tactile graphics outside university "but only 26% were provided with" them at university (Read, Butler et al. 2016, n = 71).
- **Monarch + Wing It** (APH/HumanWare, $15,500 for the display): teacher draws on an iPhone, dots rise on the 10-line pin display as the drawing is made. Named uses: campus maps, building layouts, O&M, "live football play diagrams". APH says it is "not a replacement for traditional tactile graphics, but a way to meet needs as they arise" (Read, APH "Helping students soar with Wing It"). HumanWare reports teachers using Monarch for a year cut lesson prep time by about 30% (Read, vendor page, no method given).

### 2.3 The live-lesson gap, in the sources' own words
- Vanderbilt 2012, Hillsboro High School: TVI Ann Smith recreates the teacher's shapes "using pins and pipe cleaners on a bulletin board with raised graphing lines." Smith: "Because this takes a certain amount of time, we are always one or two steps behind the teacher." Student Kira: "The biggest obstacle was getting the correct mental images. However, once you get the knack, it gets fairly easy," and "It would really help to have something like this because it makes us equal to everyone else" (about a vibrating tablet app) (Read).
- Physics (arXiv 1710.08977): a blind student in a mainstream class "should have access to one or more persons who act as an in-class assistant", who may "describe figures drawn on a chalkboard." "Everything written on the board also needs to be conveyed orally." Tactile printouts "can be prepared in advance of lecture"; otherwise a drawing board for real-time sketches (Read).
- Perkins for classroom teachers: "Blind students are not able to view what is on the whiteboard and screen readers will not read this format." Advice is to send materials and tactile diagrams ahead and plan with the TVI "well in advance" (Snippet).
- The general adaptation guide for lectures is verbal: "Whenever writing on the board, say aloud exactly what you are writing," "Explain drawings, diagrams, and visual cues," "Don't rely on pointing" (Read, teachingvisuallyimpaired.com). Verbal description is the default fallback, and the IntechOpen review says auditory and verbal approaches "don't directly convey spatial relations or kinesthetic feedback" and are distracting in a quiet classroom (Read).
- Consequence (Read, Butler et al. 2016): 84% of vision-impaired students "often (41%) or sometimes (43%) skipped over graphical material"; 44% of blind respondents had "definitely avoided an area or career" over graphics access; vision-impaired participation in STEM was 11% against 24% for the general population. One respondent: "Group work is just really horrible, stressful and publicly humiliating with a vision impairment." Australian higher-ed sample, so cite it as that.

## 3. How blind people learn directions and routes

- **Orientation and mobility (O&M) is its own profession** with its own specialists, separate from the TVI. Teaching sequence in the sources: body concepts and left/right, then the clock face ("12 o'clock directly ahead, 3 o'clock to the right"), then cardinal directions with mnemonics and games ("Simon says turn North") (Snippet, FamilyConnect, a11y glossary, CA school district page).
- **Palm drawing / palm tracing.** The instructor "holds the learner's palm face up and traces the route with a finger while giving spoken directions"; the learner feels turn directions, relative distances and the route's shape before walking it (Read, a11y-paradise glossary, low-reliability secondary source). A 2023 Springer article analyses video of O&M lessons where "occasioned maps" are drawn on the student's palm, fingers up, wrist down (Snippet). A Malaysian field study saw an instructor fall back to "palm tracing" or "back tracing" when a student struggled, and reported the instructors' main problem was "the lack of teaching aids to describe a new environment" (Snippet, ERIC EJ1114545). This is the closest existing practice to FeelInk: a moving touch plus a voice, in real time, drawn by a sighted person.
- **Tactile maps work.** Ten mostly early-blind adults and ten sighted controls learned a 20 x 30 cm tactile city map by tracing streets with the index finger; the blind group built a cognitive map "equally well" and acquired survey knowledge like the sighted group, with no significant difference on any measure. Learning was self-paced and took 17 to 50 minutes (Read, Scientific Reports 2022, PMC9262941). Other work finds route-style maps are read faster than full orientation maps, and early-blind people can have less accurate metric estimates (Snippet).
- **Why haptics is slow:** touch gives "a few landmarks at once", so the picture is assembled serially; this pushes toward egocentric, route-style strategies (Snippet, PMC9268803). Reviews disagree on whether the resulting spatial representations are weaker than visual ones; one review says blind people's spatial capacities "are not diminished" (Snippet, Morash et al.).
- **Onset matters.** Tekli 2018 found people blind since birth were about 18% more accurate and 31 seconds faster at vibration shapes than people blinded later, who "tend to rely on their mental visualization of the shapes rather than fully focusing on their tactile perception" (Read). The 2025 grating study found visually impaired participants far more accurate than sighted at phone-vibration stripe detection, 99.15% vs 84.5% (Read, arXiv 2511.10026 abstract, n = 6 VI + 10 sighted). Practical point: a sighted judge or teammate feeling FeelInk is a worse reader than the actual user would be.

## 4. What research says about vibration graphics on a phone or tablet

| Study | Who | Setup | Result | Label |
|---|---|---|---|---|
| Giudice, Palani, Brenner, Kramer, ASSETS 2012 | 3 congenitally blind + 12 blindfolded sighted | 7-inch Android tablet, vibration 250 Hz on lines, pulsing at vertices, audio labels; lines 8.9 mm wide, 8.9 mm minimum gap | Bar graphs: no accuracy difference vs embossed. Letters: blind 100% both modes; sighted 89% tablet vs 100% paper. Shape orientation: ~77% (blind) / ~83% (sighted) tablet vs ~88% / ~86% paper, not significant. **Learning time significantly longer on the tablet in all three experiments** (p < 0.001, p < 0.01, p < 0.001). About 30 min total practice. Users struggled with slanted and curved lines and with moving laterally. All blind participants said they would adopt it. | Read |
| Tekli, Issa, Chbeir, IJHCS 2018 ("EVIAC") | 6 blind since birth, 7 blind after birth, 16 blindfolded | Tablet, whole-device vibration, one finger, 6 basic lines and 4 shapes | 74.22% correct overall; **1 min 22 s average per shape**. Blind since birth 75.8%, blind after birth 61.6%, blindfolded 85.3%. Horizontal and vertical lines easy (>75%), backslash, zigzag and curves hard (missed by at least half). Testers re-trace paths repeatedly to regain a lost line. Authors: "a major problem with vibrating touch-screen technology is that the vibration feedback involves the entire device." | Read |
| Gorlewicz et al., EuroHaptics 2016 | 56 blindfolded | Vibratory touchscreen, basic 2D shapes | Shapes reliably identified "within 90 seconds" using haptics alone | Snippet |
| Gorlewicz et al., JSET 2014 and 2012 field test | 2 blind high-school students, teachers | Android tablet, grids and points, vibration + tone | Qualitative: positive feedback; "amazing how quickly they caught on" (Gorlewicz) | Read (news page), Snippet (paper) |
| Lin and Rugama, Ergonomics 2016 | 32 blindfolded students | Smartphone default vibration only, 4 experiments | Two-point discrimination 98.8% at 3.2 mm; line thickness ~78%; authors conclude information transmitted "may be quite low, especially for shape judgments" | Snippet, abstract not opened (403) |
| Palani et al. 2018 | 46 blind or VI | Vibrotactile line perception | 1 mm minimum detectable line, 4 mm gap between parallel lines | Snippet |
| Grating study, arXiv 2511.10026, 2025 | 6 VI + 10 sighted | Phone vibration synced to stripes under a swipe | VI 99.15% vs sighted 84.5% detection; VI peak sensitivity near braille dot spacing | Read (abstract) |
| Systematic review 2010-2020, ar5iv 2102.01273 | 200-odd papers | All touch-based graphics tech | Tactile paper "often preferred and explored more quickly" than touchscreens with audio and vibration; "difficult to understand detailed geometry with touchscreen"; almost all studies single-session, lab, 148 lab vs 47 in situ; collaborative or live drawing with sighted people **not addressed at all** | Read |

Takeaways for us (Reasoned from the table):
- Accuracy on simple shapes is reachable; time is the cost. Expect a minute, not twenty seconds, for a cold user on a new shape. The #33 pass bar should be set with that in mind.
- Giudice used 8.9 mm lines and 8.9 mm gaps, found by psychophysics "most conducive to line tracing"; our default is a 6 mm core plus 6 mm fade. Palani's 4 mm gap is the floor. Our 46 mm test shapes on a 56 mm board are generous; a real graph with several lines would not be.
- Vertex pulsing in Giudice, and the CHI 2025 finding that readers dwell at vertices, both back our corner cue.
- Every successful system paired vibration with audio (labels, tones at points, speech). Vibration-only is where the negative result (Lin) sits. "Touch-to-hear" on the roadmap is not a nice-to-have, it is what the literature says makes this work.
- Slanted and curved lines are the weak spot for everyone. A demo of a square or a route with right-angle turns plays to the medium's strength; a sine wave does not.
- Nobody has studied live co-drawing between a sighted person and a blind reader on a phone. That is the open ground, and also why we have no benchmark for it.

## 5. Would FeelInk help? Fit against real practice

Where it matches what people already do:
- **It is palm drawing without the palm.** O&M instructors already trace routes on a hand while talking. FeelInk lets the drawer be across the room or across a video call, and lets the student re-trace the route alone afterwards. Nobody we found has built this on a phone.
- **It is Wing It without the $15,500.** Same shape of workflow (sighted person draws on a phone, blind person feels it appear live). One fingertip of buzz instead of 3,840 pins, so far lower fidelity, but zero hardware.
- **It attacks the exact complaint:** "one or two steps behind the teacher." A tutor drawing the triangle as they say "triangle" closes that gap for simple figures.
- **No braille prerequisite,** unlike every tactile-graphic workflow. Also no labels, see below.
- **Remote tutoring has no good answer today.** Sources on remote tutoring for blind students fall back to data tables, Desmos sessions and verbal description; nothing conveys a tutor's live sketch (Snippet, several).

Where it does not match, and judges who know the field will ask:
- **Resolution and size.** Practitioners say tactile graphics must be simple and scaled up; a phone screen is "a low resolution output mode" (Read, IntechOpen). One finger on a 56 mm board cannot carry a labelled bar chart.
- **Speed.** A minute per shape in the literature. A teacher cannot pause a class for that; a one-to-one tutor can.
- **No labels or audio yet.** Every effective system in the table had audio. Without "touch-to-hear" a point on a graph has no coordinates.
- **Whole-device vibration and no amplitude.** Both Tekli and the W3C API notes say this is the core limit. Our pulse-rhythm fade is a workaround, not felt yet.
- **Student can't draw back.** TVIs and the NFB stress students creating their own graphics (TactileDoodle, inTACT, Graphic Aid). FeelInk is one-way today; "draw-it-back" on the roadmap addresses it.
- **A $49 drawing board already solves the in-person live case,** permanently and with higher resolution. FeelInk's edge over it is distance (remote tutor, teacher at the front, parent on a call), re-tracing a stroke that is animated in time, and no supplies. Say that out loud rather than let a judge say it.
- **Android only.** Students in US schools are often issued iPads; no iPhone or iPad path exists.

Verdict (Reasoned): FeelInk plausibly helps a blind student in one specific moment, a sighted helper sketching something simple live, especially at a distance. It does not replace tactile graphics, a drawing board, Desmos or a Monarch, and should not be pitched as doing so. Whether a blind student finds it useful rather than merely intelligible is unknown until one tries it.

## 6. What this changes for the deck and the build

Deck (safe wordings, all from Read rows unless marked):
- Problem slide: the Ann Smith quote, "we are always one or two steps behind the teacher" (Vanderbilt 2012), and the physics line that embossed materials "can take weeks or even months."
- User slide: "84% of vision-impaired university students skipped graphical material often or sometimes; 44% of blind students had avoided a field over it" (Butler et al. 2016, Australia, n = 71).
- Prior art slide: "O&M instructors trace routes on a student's palm. A $15,500 display does it with pins. We do it on the phone in your pocket." Label palm tracing as a described practice (Snippet).
- Evidence slide: "Blind participants matched embossed paper on bar graphs and letters with a vibrating tablet after 30 minutes of practice, but were slower" (Giudice 2012, n = 3 blind). Keep n = 3 in the footnote.
- Honest limits: one finger, simple shapes, about a minute per shape in studies, no labels yet, Android only.
- Do not claim: that blind users prefer vibration (they preferred paper in most comparisons), that it works for graphs with several lines, that any blind student has tried FeelInk.

Build and test:
- Set the #33 blind-run pass bar knowing the literature's cold-user time is 60-90 s per shape; a 20 s bar would fail systems that the research calls effective.
- Test shapes with right angles first; add one curve or diagonal as the stretch case, since that is the known weak spot.
- Consider widening the core toward 8-9 mm for the demo, matching Giudice's tested width, before tuning by feel.
- Add a one-tap "overview" (buzz the whole shape's bounding box or a quick auto-trace) because teachers train "whole first, then detail."
- "Touch-to-hear" and "draw-it-back" are the two roadmap items the literature singles out. Pick touch-to-hear first if either gets built.
- For a user conversation (issue #3): a TVI or O&M specialist is a better first contact than a random blind adult, because the live-lesson gap is their daily problem. Ask them what they do today when a teacher sketches something, and whether they would hand a student a buzzing phone for it.

## 7. Sources

Read in full or in the relevant section:
- Giudice, Palani, Brenner, Kramer, "Learning non-visual graphical information using a touch-based vibro-audio interface," ASSETS 2012. https://umaine.edu/vemi/wp-content/uploads/sites/220/2016/08/Giudice-etal2012-vibro-audio-interface-ASSETS12.pdf
- Tekli, Issa, Chbeir, "Evaluating touch-screen vibration modality for blind users to access simple shapes and graphics," IJHCS 2018. https://soe.lau.edu.lb/files/Tekli_Journal_1.pdf
- Holt et al., "Making Physics Courses Accessible for Blind Students," arXiv 1710.08977. https://arxiv.org/pdf/1710.08977
- Butler, Holloway, Marriott, Goncu, "Understanding the graphical challenges faced by vision-impaired students in Australian universities," HERD 2016. https://www.cu.edu/doc/understanding-graphical-challenges.pdf
- Butler et al., "Technology Developments in Touch-Based Accessible Graphics: A Systematic Review of Research 2010-2020," CHI 2021. https://ar5iv.arxiv.org/html/2102.01273
- Gorlewicz, Tennison, Palani, Giudice, "The Graphical Access Challenge for People with Visual Impairments," IntechOpen 2018. https://www.intechopen.com/chapters/64669
- Vanderbilt Research News, "Haptic tablet," Mar 5 2012 (Ann Smith, Kira, Quinn quotes). https://www.vanderbilt.edu/research/2012/03/05/haptic-tablet/
- Paths to Literacy, "Teaching a blind student how to graph on a coordinate plane." https://www.pathstoliteracy.org/teaching-a-blind-student-how-to-graph-on-a-coordinate-plane-no-tech-low-tech-and-high-tech-tools/
- Paths to Literacy / seewritehear, "Tactile Graphics: Defining, Learning, and Creating" (TSBVI and BANA quotes). https://www.pathstoliteracy.org/wp-content/uploads/2022/06/Tactile_Graphics.pdf
- teachingvisuallyimpaired.com, "Lectures & Instruction Adaptations." https://www.teachingvisuallyimpaired.com/lectures--instruction.html
- APH, "Generate tactile graphics on the fly with TactileDoodle." https://www.aph.org/blog/generate-tactile-graphics-on-the-fly-with-tactiledoodle/
- APH, "Helping students soar with Wing It." https://www.aph.org/blog/helping-students-soar-with-wing-it/
- HumanWare Monarch education page. https://www.humanware.com/microsite/monarch/education.php
- Scientific Reports 2022, "Cognitive map formation through tactile map navigation in visually impaired and sighted persons." https://pmc.ncbi.nlm.nih.gov/articles/PMC9262941/
- arXiv 2511.10026 abstract, "Grating haptic perception through touchscreen: Sighted vs. Visually Impaired." https://arxiv.org/abs/2511.10026
- arXiv 2508.14289 abstract, "They Aren't Built For Me." https://arxiv.org/abs/2508.14289
- a11y-paradise glossary, "Palm Drawing" (secondary, low reliability). https://a11y-paradise.onrender.com/glossary/69bb268d27c5f59999495020

Snippet only (search summaries; open before quoting a number):
- Lin and Rugama, "Graphical message transmission using the monotonic vibration function of a smart phone," Ergonomics 59(2) 2016, PMID 26099504 (publisher and PubMed returned 403 / cookie wall).
- Gorlewicz et al., "Toward Non-visual Graphics Representations on Vibratory Touchscreens," EuroHaptics 2016 (Springer wall).
- Gorlewicz, Burgner, Withrow, Webster, JSET 2014 abstract.
- Palani et al. 2018 line-width figures.
- Springer 2023, Human Studies, conversation analysis of palm maps in O&M lessons, doi 10.1007/s10746-023-09676-4.
- ERIC EJ1114545, Malaysian O&M instructor field study (palm tracing, back tracing, lack of teaching aids).
- Perkins, "Graphing for Blind Students Tutorial" and "Tips for Classroom Teachers" (403).
- Perkins, "Tips and strategies to make geometry accessible" (403).
- NFB catalog, Sensational Blackboard $49; Braille Bookstore $54.95.
- FamilyConnect O&M pages (login wall), a11y glossary "Clock Technique", Chico school district O&M page.
- Desmos / Smarter Balanced audio trace pages.
- AFB Access and Engagement 2019-20: 48% of public-school TVIs had all materials needed for blind academic students.
- Morash et al. review of haptic spatial abilities; PMC9268803 on serial haptic exploration.

Not found: any study of live co-drawing between a sighted person and a blind reader on a phone; any US figure for how often tactile graphics arrive on time; the Perkins "part to whole" page text (403); a blind adult's first-person view of vibration graphics beyond Kira and Quinn.

Local copies of the four PDFs' extracted text are in Nathan's session scratchpad `pdftext/` folder (session-specific, may vanish).
