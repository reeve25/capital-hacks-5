DECISION: tutor UI redesign brief, "FeelInk Studio" (Reeve, 18:10). Also: footage consent, Nathan at Reeve's keyboard: "yes fine" (Nathan's hand on his Pixel may appear in takes; Reeve agrees too). Reeve's brief follows in full, in his words.

"I want a substantial improvement to the tutor-facing UI. This is a product design and UX concern, not just a request for a few more cosmetic tweaks.

Looking at the current /stage screenshot, it still feels like a polished engineering test page rather than a professional, purpose-built educational tool. It's mostly a tall drawing canvas, four buttons, one instruction field, and a small event log, with a lot of unused space and weak visual hierarchy.

I want FeelInk to feel like a distinctive, thoughtfully engineered product specifically designed for tutors teaching blind students through interactive touch.

Design direction: FeelInk Studio, an interactive spatial teaching workspace.

Think professional creative software with the usability of a specialized teaching tool. It should feel modern, intentional, visually distinctive, and impressive enough to appear in our hackathon pitch, but not overcrowded or gimmicky.

Please do a genuine UX/design pass rather than simply adjusting colors, border radii, fonts, and spacing.

1. Rethink the workspace composition
Keep three functional areas: Left: creating and editing spatial content. Center: the live drawing and student exploration canvas, clearly the focal point. Right: the active teaching session, instructions, and student feedback.
Use desktop space more intentionally. The current layout feels narrow and surrounded by unused space. Establish stronger alignment, proportions, grouping, and hierarchy.
Preserve the correct phone aspect ratio and coordinate mapping. Don't distort the board just to fill the screen.

2. Make the educational purpose obvious
The UI should communicate that a tutor is conducting a spatial-learning lesson, not just drawing. Consider a small active lesson area with a title, objective/instruction, and current student activity.
The tutor should understand the flow: Create or modify the diagram -> explain it -> student explores -> tutor observes -> tutor guides or changes the diagram.
Avoid a complicated lesson management system, login system, or database. Use lightweight session state and existing functionality where possible.

3. Visually emphasize the core innovation
The defining feature is that the student explores the drawing through physical touch and vibration on another device. That needs to be much more obvious visually.
Improve how the stage communicates: where the student's finger currently is; which parts of the drawing they've explored; when an actual haptic event occurs; which landmark was encountered and spoken; whether the student is connected, idle, exploring, or reconnecting.
The existing event feedback should feel integrated into the product, not like a developer debug legend.
Only show states supported by actual device events. Don't fake live activity, measurements, or comprehension.

4. Make the tools feel purpose-built
Organize drawing and teaching controls into clear groups rather than an undifferentiated stack of buttons. Keep Draw, Landmark, Undo, Clear, Shift straight-line drawing, and the existing functional interactions.
Consider small, reusable spatial teaching affordances such as Start/End markers or a clear current instruction, building on existing functionality.
The interface should support routes today and future educational diagrams such as circuits, maps, flowcharts, and physics without becoming route-specific.
Do not invent a large set of new tools that aren't implemented.

5. Build a distinctive visual system
Give FeelInk a recognizable design identity beyond generic dark UI. A possible direction is deep ink/navy for the workspace, warm paper for the drawing canvas, teal for discovered/explored information, and restrained amber for active haptic feedback.
Use deliberate typography, hierarchy, iconography, panel structure, interaction states, and subtle animations. Animations should communicate state changes or exploration, not exist merely as decoration.
Aim for the polish of a serious creative/educational application rather than a generic dashboard or hackathon landing page. Keep contrast, focus states, button targets, and keyboard usability strong.

6. Make the important states feel complete
The interface should look intentional when: no student is connected; a student is connected but not touching the board; a student is actively exploring; the tutor is entering an instruction or naming a landmark; the connection drops and recovers.
The current screenshot feels especially empty when there is minimal activity. Use meaningful session information, helpful contextual states, and better composition rather than filler.

7. Preserve engineering correctness
Do not rewrite the haptic engine, relay protocol, board coordinate mapping, or working interactions just to achieve a visual redesign. Keep the recording workflow and existing tests working. Do not conflict with any active agent ownership or worktree. A visual redesign that breaks the live Pixel interaction is worse than the existing interface.

8. Approach and execution
First, inspect the current stage implementation and screenshot, identify the major design weaknesses, and develop one coherent redesign direction. I don't need several generic alternatives or a long aesthetic brainstorming exercise. Make strong design decisions and justify them briefly.
Then implement the highest-impact improvements safely within the existing architecture and ownership structure. Focus on a coherent product, not adding as many features as possible.
If recording is still pending, preserve a known-good version and don't allow the redesign to jeopardize the verified demo. Make changes incrementally with smoke tests.

Success criteria:
- Within five seconds, someone can tell this is a specialized interactive teaching product.
- The drawing canvas remains the clear centerpiece.
- The tutor can understand what the student is doing.
- The relationship between drawing, exploration, haptics, and instruction is visually apparent.
- The workspace feels professionally designed even when idle.
- The controls are functional, not decorative.
- The real Pixel interaction and recording pipeline still work.

The goal is for someone looking at the interface to think, 'This is a thoughtfully designed accessibility education product,' not 'This is a drawing demo with some buttons.'

Please use your UI/design skills and independent judgment to achieve that result, while respecting our existing engineering and recording priorities."

