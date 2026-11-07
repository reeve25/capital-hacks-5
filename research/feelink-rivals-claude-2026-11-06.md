# FeelInk: second-vendor rival and research check (Claude), Nov 6, 2026, about 21:45 PT

FeelInk came from Codex (`codex-one-second-round-2026-11-06.md`), so this is its different-vendor check. Nothing here shows it works on the Pixel; that's the kill test in `feelink/`.

Labels: **Read** = I read the passage in the PDF or page. **Snippet** = search summary only. **Tagline** = corpus name and tagline only, which has missed rivals before. **Reasoned** = my inference.

## Closest product
- **APH Monarch with Wing It.** A refreshable tactile display, listed at $15,500 on APH's page (Snippet), other sellers $17,995 and a $12,900 promotion. Wing It is an iOS app described as collaborative, with a teacher creating tactile graphics for the Monarch (Snippet). I did not confirm that strokes appear live as they are drawn. So the use case exists and the product costs about $15,000. FeelInk's claim would be a similar interaction on a phone people own, with far less fidelity: one fingertip, no raised dots, no Braille (Reasoned).

## Research
- **Giudice et al., ASSETS 2012** (Read): Samsung 7-inch tablet, vibration plus audio cues, lines 8.9 mm wide based on earlier tracing work. Letter recognition: blind participants without error (3 people), sighted about 89%, against 100% for hardcopy braille. Learning was significantly slower on the tablet than on hardcopy. I did not extract seconds per shape, so **no sourced time supports the 20-second pass bar**.
- **CHI 2025 model of vibrotactile exploration** (Read, excerpts): says vibrotactile touchscreens have been particularly effective for simple graphics, with higher accuracy and preference than audio-only. Participants spent most of their time at vertices, which is why the renderer gives corners their own cue.
- **Palani et al. 2018** (Snippet): 46 blind or visually impaired participants; minimum 1 mm to detect a line, 4 mm gap between parallel lines.
- **Gorlewicz et al. slides** (Snippet): shape identification above 78%, pentagon 47%; phone screens gave comparable accuracy and were quicker to explore.
- **Smartphone vibration-only study, Ergonomics** (Snippet): 32 blindfolded students; its authors conclude that information transmitted may be quite low, especially for shapes. This is the strongest evidence against.
- **TouchOver map** (Read, as described in Giudice): blindfolded sighted users understood a road network on a smartphone through vibration and audio labels.
- **A11yBoard, UIST 2022** (Read, text search): no mention of vibration or haptics found in the 4 pages. It does mention visually highlighting selection for collaboration with sighted users.
- **Older prototypes** (Snippet): Vanderbilt tablet math app with sketching, 2012; Newcastle BuzzShape poster, 2017.

## Hackathons
- Corpus scan for vibration or haptics with blind users or screens: 17 hits, 4 winner labels. Those I saw were navigation or obstacle devices (ClearVision, Ankh, Walkie Talkie, HorizonX, Wander, I.R.I.S), not feeling drawings (Tagline).
- Nearby, different: TouchSpace (Cal Hacks 13.0, Claude for Public Benefit prize) and Dots (LA Hacks 2026, track prizes) make tactile maps (Read, opening of the pages only). Haptic Movies (HackGT 2016 prize) and PathFinder (no prize listed) confirmed as Codex described (Read, opening of the pages only).
- One web search found no app with a teacher drawing live and a student feeling it through phone vibration (Snippet).

## Read so far
Under the loosened rival rule it is **flagged, not a near-clone**: the mechanism is well-studied research, and live co-drawing on an ordinary phone looks open at hackathons. No project page was read in full, and absence from a scan isn't proof. The main risk isn't a rival. It's speed: every source points to accuracy being reachable and exploration being slow.
