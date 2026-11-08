# Human-led, software-assisted: product-direction correction for the tutor UI (Reeve, Sat Nov 7, 18:55 PT)

Reeve's words, pasted into the lead session. Supersedes any reading of the Studio brief that makes typed instructions central.

Important product-direction correction for the tutor UI:

The interface is drifting toward a remote-learning or software-mediated experience, and I do **not** want that.

**FeelInk should be designed first as an in-person classroom / tutoring tool, not as a virtual-learning dashboard.**

The default mental model should be:
- a tutor or teacher is actively speaking to the blind student
- the student is exploring the board by touch
- the software provides the tactile/spatial workspace and supporting feedback
- the human relationship is primary
- the software assists the lesson; it does not replace the lesson

Because of that, I do **not** want typed instructions to be treated as a central part of the product.

The current "Instruction" field feels wrong / inhumane as a primary interaction. A real tutor would normally just talk to the student directly. The product should not imply that teaching happens mainly through typed text that the phone reads aloud.

### Design principle
**Human-led, software-assisted.**

FeelInk is not a chat app, lesson portal, or text-driven tutoring workflow.

It is a tactile teaching workspace for live instruction.

### What the software should primarily do
1. Let the tutor create spatial content (routes, diagrams, landmarks, start points, reveal steps).
2. Let the student explore that content through touch/haptics.
3. Let the tutor understand what the student is doing.
4. Provide lightweight supportive audio/haptic cues where software adds real value.

### What the software should NOT do
- simulate normal teacher speech through a big typed instruction workflow
- feel like remote e-learning software
- add panels or labels that describe a lesson instead of helping run one
- over-explain everything in UI text

### Direction for the current UI
- Remove or strongly demote the typed instruction composer.
- If kept at all, it should be a secondary optional "phone cue" or "spoken cue" tool, mainly for special cases (remote use, replay, fallback), not a core part of the default tutoring flow.
- The right side should feel more like a live student session panel than a message panel.
- The main board should feel like the shared lesson object.
- The left tools should feel like teacher tools for shaping the lesson.

### Design against this primary scenario
A teacher is physically with a blind student and says something like:
"Start at the classroom. Follow the path down, then turn right toward the library."

The software's role is to support that interaction:
- the teacher draws the route
- the student explores it
- the teacher sees the student's exploration
- landmarks and tactile states are supported clearly
- the product feels specialized and purposeful

Not every useful feature needs to stay visible all the time. Use stronger product judgment and remove elements that make this feel like generic software instead of a thoughtfully designed teaching tool.

Please reinterpret the current stage UI through this lens and make the interface feel like a real classroom/tutoring product.
