> Historical: Nov 6 ideation material, superseded when FeelInk was chosen (Nov 6, about 21:35). Research preserved as written; current state is in STATUS.md.

**Two independent candidates.** Both are untested bets with concrete demos and substantial prior art to disclose. I read the specified project material and searched products, papers and hackathon projects; I did not consult the other vendor’s current list or edit files.

**Labels:** **Read** means supported by a linked source. **Reasoned** means my proposal, inference or estimate—including every build-time estimate and pass bar below. **Measured:** nothing.

---

**1. FeelInk — Health + Accessibility**

**2. The problem and who has it**

**[Read]** A blind student or colleague can hear the words in a discussion while missing the drawing that carries the explanation. Ordinary screen readers struggle to convey a diagram’s positions, connections and shapes. Accessible artboard research specifically identifies these spatial relationships as a problem. [A11yBoard paper](https://faculty.washington.edu/wobbrock/pubs/uist-22.01.pdf)

**[Reasoned]** Picture someone in a tutoring session: the tutor draws a shape, changes it and points at the missing piece. The student needs a description of each change before participating. A tactile version prepared afterward misses the live conversation.

The proposed fix: **a drawing you can feel arriving on an ordinary phone—and edit back.**

**3. What the product is and how someone uses it**

**[Reasoned]** A shared drawing canvas on a laptop, paired with a native Android app on the Pixel. The phone uses its existing vibration motor; nothing is attached or modified.

1. The tutor opens a room and draws on the laptop.
2. The student joins that room on the phone.
3. The student slides one fingertip across the glass. Crossing a drawn line produces a crisp vibration; moving away becomes quiet.
4. Corners, endpoints and intersections receive distinct, restrained cues. The renderer adjusts for finger speed so quickly crossing a thin line does not disappear between updates.
5. The student holds on an endpoint to select it, then draws or moves a connection. Their change appears immediately on the tutor’s canvas.

Start with sparse line drawings: geometry, simple routes and small diagrams. **The Sunday product should make those usable through touch without spoken descriptions.** Arbitrary photographs would broaden the problem before the central interaction works.

**4. Exactly what the judge sees and does**

**[Reasoned]**

- The projected laptop canvas begins empty.
- Reeve closes his eyes and places a finger on the Pixel.
- A judge draws an unfamiliar, simple shape on the laptop: perhaps a square with one side missing.
- Reeve explores the phone, identifies the gap and closes it. The room watches his actual finger path and the resulting stroke.
- The judge changes the drawing while his finger is resting on a previously empty location. The phone immediately responds to the new line.
- The judge can then take the phone and try with eyes closed.

**The one-second moment:** someone draws a line under another person’s fingertip, and that person feels it immediately through plain glass.

**[Reasoned]** Recognizing the complete shape will take exploration. I would not promise that the judge understands an entire diagram in one second. The instantaneous part is the new sensory connection; the stronger demonstration is completing the unseen drawing.

**5. What is genuinely novel to build, and why this team could attempt it now**

**[Read]** Feeling graphics through touchscreen vibration is established research. Creating and manipulating accessible artboards is also established. Those cannot honestly be claimed as inventions here. [Vibrotactile exploration research](https://shape.stanford.edu/research/modelTouchscreen/modelTouchscreen.pdf), [A11yBoard](https://faculty.washington.edu/wobbrock/pubs/uist-22.01.pdf)

**[Reasoned]** The proposed contribution is a **silent, bidirectional drawing interaction**: live strokes become usable tactile boundaries, and the person feeling them edits the same underlying drawing directly.

The difficult work would be yours:

- Rendering lines reliably across different finger speeds.
- Making endpoints and crossings distinguishable without overwhelming vibration.
- Separating exploration from editing.
- Preserving finger position when the other person changes the drawing.
- Making the loop responsive enough to feel connected to the finger.

**[Reasoned]** This is plausible for two people because the initial canvas supplies exact geometry. No vision model, training dataset or cloud inference is needed inside the tactile loop. Reeve owns the renderer and interaction; Nathan can build the paired canvas, room connection and demonstration controls with agents.

**[Reasoned]** Originality remains a real concern: “accessible whiteboard with vibration” is too small a claim. It needs to demonstrate **drawing together through touch**, convincingly enough that the distinction is apparent during use.

**6. Fastest kill test tonight**

**[Reasoned — estimated 60–90 minutes, proposed thresholds]**

Build only a Pixel screen containing invisible lines and local vibration feedback. Skip networking and image understanding.

- Give the person holding it a short introduction using one visible example.
- Present five unfamiliar simple shapes in random order with the screen hidden from them.
- Have them identify each shape and locate a deliberately missing connection.
- Then add or erase a line while their finger is already exploring.

**Pass bar:** at least four of five shapes identified within about twenty seconds each, with the missing connection located reliably; live changes must be immediately perceptible.

**Kill it** if the result is mainly “I feel some buzzing,” if the person repeatedly loses the line, or if spoken guidance is necessary to finish.

This directly tests the stage interaction. It does not establish usefulness for blind people.

**7. Rivals actually read**

- **[Read — close research rival] [A11yBoard, UIST 2022](https://faculty.washington.edu/wobbrock/pubs/uist-22.01.pdf):** mirrors a desktop artboard onto a phone or tablet for spatial exploration and supports creating and manipulating objects. Its described interaction relies on speech, audio tones and keyboard commands. FeelInk’s proposed distinction is silent tactile exploration and direct co-drawing. **This is a substantial rival, not background to wave away.**

- **[Read — established mechanism] [Computational Modeling of Non-Visual Vibrotactile Touchscreen Exploration, CHI 2025](https://shape.stanford.edu/research/modelTouchscreen/modelTouchscreen.pdf):** discusses ordinary touchscreen vibration for graphics and models triangle exploration. It also explains the limitation: a smooth screen does not directly convey a line’s orientation, so the user must move a finger to discover it. This supports the kill test and limits the claim.

- **[Read — PRIZE RIVAL: Haptic Movies, HackGT 2016](https://devpost.com/software/haptic-movies):** won **“Most innovative use of TanvasTouch in a digital experience.”** It mapped image/video regions to tactile sensations using Tanvas hardware. That overlaps the broad “touch digital pictures” pitch. FeelInk would use the Pixel’s ordinary vibration motor and focus on live, editable line drawings; it would not reproduce Tanvas’s surface-texture effects.

- **[Read — hackathon rival] [PathFinder](https://devpost.com/software/pathfinder-osp2rn):** converts shared diagrams into structured descriptions for blind and low-vision teammates. No prize is displayed on the page I read. It supplies textual understanding; it does not describe feeling and editing the drawing through phone vibration.

**8. Toughest judge question—and the honest answer**

**“Did you invent anything beyond putting existing haptics into a whiteboard?”**

**[Reasoned]** “The sensing principle and accessible artboards already exist. Our contribution is the interaction that lets two people draw together through touch on ordinary hardware. We demonstrate that with an unfamiliar drawing, live changes and an edit made without seeing it. If that requires narration or memorized examples, we have not delivered the contribution.”

**[Reasoned]** A second hard question is whether vibration replaces a tactile display. The honest answer is narrower: it may provide useful access to simple drawings through active exploration. It does not produce raised lines, Braille or simultaneous multi-finger touch.

---

**1. Unredact Live — Open Tech**

**2. The problem and who has it**

**[Read]** Pixelation can leave enough information to reconstruct obscured text. Video creates another opportunity: movement can cause successive frames to preserve different information about the same hidden image. Both attacks have published precedents. [Bishop Fox’s Unredacter](https://github.com/bishopfox/unredacter), [UCSB video reconstruction paper](https://sites.cs.ucsb.edu/~vigna/publications/2011_WOOT_Pixelization.pdf)

**[Reasoned]** The user is a creator, support engineer or researcher sharing a recording. They cover a private value with mosaic blocks, play it back, see nothing readable and assume it is hidden.

The proposed product lets them **watch their own “hidden” information become readable, then produce an output that actually removes those pixels.**

**3. What the product is and how someone uses it**

**[Reasoned]** A Windows application with two concrete functions: reconstruct supported pixelated content from video, and replace selected sensitive regions with opaque, flattened masks.

1. The person opens a recording or shares a window into the application.
2. They select an already-pixelated region.
3. The application accumulates evidence across frames and attempts reconstruction.
4. Where evidence is sufficient, it displays the recovered image or candidate characters.
5. The person selects proper masking and exports—or shares—the sanitized output.

**[Reasoned]** The hackathon scope should be explicit: a known mosaic operation, a known font and short numeric strings moving across the mosaic grid. Broad support for arbitrary redactions would be an unsupported promise.

**4. Exactly what the judge sees and does**

**[Reasoned]**

- A judge enters a fresh, fake six-digit code into the source window.
- The window displays that code only through coarse mosaic blocks and begins moving the text slightly.
- A separate reconstruction process receives **only the resulting video pixels**. It has no keyboard events, page contents or original code.
- The illegible blocks resolve into the judge’s code on the main display.
- The judge changes the code and repeats.
- Proper masking is enabled. The same movement continues, but the output contains only an opaque rectangle.

**The one-second moment:** apparently destroyed information becomes readable.

**[Reasoned]** The reveal should appear within roughly a second once enough frames have accumulated. Initial accumulation may take longer; measure and disclose it rather than turning the product name into a latency claim.

**[Reasoned]** The fix appears immediately too: proper masking removes the information from subsequent output frames. Previously exposed frames remain exposed.

**5. What is genuinely novel to build, and why this team could attempt it now**

**[Read]** Neither text unpixelation nor reconstruction from pixelated video is new. Unredacter already performs candidate rendering and comparison, while the UCSB work explicitly reconstructs pixelated video. [Unredacter](https://github.com/bishopfox/unredacter), [video reconstruction paper](https://sites.cs.ucsb.edu/~vigna/publications/2011_WOOT_Pixelization.pdf)

**[Reasoned]** The proposed original engineering is an interactive implementation that:

- Combines temporal observations as the hidden content moves.
- Separates insufficient evidence from an actual reconstruction.
- Operates through a strictly isolated pixel-only input.
- Lets an unfamiliar judge supply the secret and change it live.
- Repairs the delivered video and runs the same reconstruction attempt against that output.

**[Reasoned]** The narrow setup makes tonight’s attempt plausible. A fixed font, numeric alphabet and known mosaic transform avoid general scene recognition. The core can use image measurements, candidate rendering and an incremental solver rather than a generative model guessing plausible text.

Reeve owns reconstruction and isolation. Nathan owns capture, the independent source window and the visible before/after interaction.

**[Reasoned]** This has the stronger immediate visual reveal, but the weaker originality case of these two ideas. A polished reproduction of Unredacter would not clear your stated bar. The live temporal reconstruction must be the actual feat.

**6. Fastest kill test tonight**

**[Reasoned — estimated 90 minutes, proposed thresholds]**

Before building the interface:

1. Generate fresh random numeric strings in one fixed font.
2. Render them moving beneath a fixed mosaic grid.
3. Give a separate process only those pixelated frames.
4. Attempt reconstruction using the disclosed transform and font.
5. Repeat using ordinary screen-capture compression.
6. Replace the region with a flattened solid mask and repeat.

**Pass bar:** recover at least nine of ten fresh six-digit strings exactly, within two seconds of receiving the necessary frames, without receiving the original string through another channel.

**Kill it** if it works only on one prepared example, needs readable frames accidentally leaking through, or requires manually adjusting parameters for each code.

**[Reasoned]** Also kill the hackathon direction if the only successful result is existing Unredacter running behind a new interface. That would settle feasibility while leaving your originality problem unresolved.

**7. Rivals actually read**

- **[Read — very close existing tool] [Bishop Fox Unredacter](https://github.com/bishopfox/unredacter):** reconstructs pixelated text through candidate rendering and comparison. Its documented workflow requires manually matching typography and mosaic settings. The proposed difference is incremental reconstruction from live moving frames, with judge-supplied secrets. No hackathon prize claim is made here.

- **[Read — direct research precedent] [Getting the Face Behind the Squares: Reconstructing Pixelized Video Streams, UCSB](https://sites.cs.ucsb.edu/~vigna/publications/2011_WOOT_Pixelization.pdf):** exploits differing pixel averages across moving video frames. **This means temporal reconstruction itself cannot be presented as your invention.**

- **[Read — close current tool] [unpixel](https://github.com/oioio-space/unpixel):** describes text recovery from mosaic and Gaussian blur, including automatic parameter detection and language-assisted decoding. This substantially weakens a pitch centered on “automatic unblurring.” The proposed demo would need its live temporal execution and pixel-only evidence boundary to stand out.

- **[Read — hackathon rival] [ShieldView](https://devpost.com/software/shieldview):** detects and blurs sensitive content before screen sharing through a virtual camera. No prize is displayed on the page I read. It overlaps the protective output; its page does not describe demonstrating reconstruction of the obscured information.

- **[Read — hackathon rival] [ScreenSafe](https://devpost.com/software/screensafe-g15pqx):** scans recordings, burns mosaic redactions into exported video and checks the export with its detectors. No prize is displayed on the page I read. Its own write-up distinguishes detector failure from proof that nobody can identify the content. The proposed distinction is testing actual reconstruction, rather than only re-running detection.

**8. Toughest judge question—and the honest answer**

**“Isn’t the solution just using a black rectangle—and hasn’t unpixelation existed for years?”**

**[Reasoned]** “Yes to both. Proper removal is straightforward once someone understands the failure. Our technical work is making recoverability demonstrable on fresh, live input and checking the actual delivered pixels. We are not claiming a new security principle or universal recovery. This prototype supports the disclosed font, mosaic operation and motion conditions.”

**[Reasoned]** That answer is honest, but it leaves an originality disadvantage. This candidate earns its place through the strength of the live reconstruction, not through pretending redaction is an unsolved category.

---

**My ranked lean [Reasoned]:**

1. **FeelInk.** I lean here first because the proposed ability is immediately personal: another person draws, and you feel and change the drawing through ordinary glass. Its decisive uncertainty is whether the phone produces understandable geometry quickly enough.
2. **Unredact Live.** I lean here second for the sharper visual reveal and cleaner technical measurements. Its prior art is much closer, making it harder to distinguish as a grand-prize project.

**I would spend the first hour on FeelInk’s tactile interaction.** That is a lean toward a cheap experiment, not a team decision or a claim that either idea has cleared your bar.

