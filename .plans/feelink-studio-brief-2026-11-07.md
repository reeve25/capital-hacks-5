<!-- Reeve, Sat Nov 7 18:15, team log: the FULL FeelInk Studio brief, verbatim. Supersedes and expands his 18:10 brief. The stage design agent builds to this. -->

DECISION: FeelInk Studio, FULL brief (Reeve, 18:15). This supersedes and expands the 18:10 Studio brief. Hand it to the stage design agent verbatim as its task prompt; it grants the agent design authority within the engineering and ownership limits stated inside. Reeve's words follow unchanged.

---

# FeelInk Studio — Expert Product Design and UX Reassessment

I want you to take genuine ownership of the tutor-facing product experience and substantially improve it.

The current interface works, but it still feels like an engineering prototype rather than a thoughtfully designed, professional application. The solution is not necessarily more panels, more labels, more buttons, or more decoration.

**Approach this as an experienced product designer, interaction designer, and frontend engineer designing a real tool from first principles.**

I want better product judgment, not just better CSS.

## 1. Understand the actual experience before designing

Start by examining the existing application, implementation, screenshots, and current capabilities.

Then reason through how someone would actually use FeelInk.

Our product allows a tutor to create spatial information on a computer while a blind student explores that information through touch and haptic feedback on an Android phone.

The educational interaction matters more than the drawing technology itself.

Think through realistic situations:

- A tutor wants to explain a route through a school.
- A student is struggling to understand where a path turns.
- The tutor wants to add a landmark while the student is exploring.
- The tutor needs to understand what the student has or hasn't explored.
- The student loses the path and needs guidance.
- The tutor wants to explain a simple electrical circuit or flowchart instead of a route.
- The student disconnects halfway through an explanation.
- The tutor needs to change the diagram without confusing the student.

For each situation, consider what information and controls the tutor actually needs, what should happen automatically, and what would create unnecessary friction.

Consider what it would feel like to use this while actively talking to another person. The tutor should be focused on teaching, not managing software.

Don't design around imaginary product features or information we don't actually have.

## 2. Exercise independent design judgment

You have substantial creative freedom.

Do not assume that our current layout, terminology, or feature organization is correct simply because it already exists.

Equally, do not redesign something that already works just for the sake of change.

Challenge assumptions about:
- Whether the interface needs three columns at all.
- Whether a traditional toolbar is the best interaction.
- Which controls need to be permanently visible.
- Whether a lesson title or objective meaningfully helps, or merely occupies space.
- Whether a text-to-speech instruction field should dominate the interface when the tutor can already speak directly to the student.
- How much device status and technical feedback tutors actually need.
- How to represent the student's exploration without visually overwhelming the drawing.
- Which information should appear contextually instead of permanently.
- What should happen when the board is empty, connected, being explored, or disconnected.

**Avoid generic AI-generated dashboard design.**

I do not want a collection of cards with arbitrary headings such as "Student Activity," "Learning Progress," "Current Session," or "Latest Event" unless there's a clear, specific reason for their existence.

Don't add fake metrics, decorative analytics, meaningless status badges, generic educational illustrations, or redundant descriptions of obvious actions.

Every interface element should earn its space.

Write microcopy as a product designer would: precise, natural, minimal, and relevant to the user's immediate task.

An excellent interface often communicates through structure, interaction, positioning, and feedback rather than explaining everything with text.

## 3. Learn from excellent software, not generic templates

You're authorized and encouraged to inspect relevant design references, patterns, frontend implementations, and open-source projects where they would help.

Look for useful lessons from high-quality creative tools, collaborative whiteboards, diagram editors, drawing applications, and specialized educational software.

Examples worth considering include Figma, FigJam, Excalidraw, tldraw, Desmos, and other well-designed interactive workspaces.

Don't copy their appearances blindly. Identify why specific interactions work.

Think about:
- Tool discoverability and selection.
- Contextual controls.
- Direct manipulation.
- Workspace composition.
- Editing feedback.
- State visibility.
- Keyboard and pointer interactions.
- Progressive disclosure.
- Collaboration awareness.
- Empty states.
- Error recovery.
- Responsive behavior.
- Visual and interaction consistency.

Look for design patterns that actually fit FeelInk's use case.

You may use installed UI/design skills, inspect their references, and discover additional useful open-source resources, components, libraries, or design systems.

You may download or install useful tools, skills, or dependencies if they offer a concrete advantage. Inspect sources and licenses, evaluate compatibility and maintenance cost, and follow our existing security and repository rules. Do not run untrusted installation scripts blindly.

Prefer a small number of excellent choices over adding dependencies for their own sake.

Use research and references to inform actual design decisions, not to produce a long literature review or delay implementation.

## 4. Create a coherent product experience

FeelInk should feel like specialized software designed for an interaction that ordinary drawing tools don't support.

The visual design should reinforce its purpose.

Consider how the relationship between the tutor, drawing, student's touch, haptic feedback, and spoken information can become immediately understandable.

The central canvas should remain the primary working surface, but its exact presentation and surrounding controls are yours to rethink.

The product should feel distinctive without becoming gimmicky.

Pay attention to:
- Information hierarchy and visual balance.
- Typography and iconography.
- Spacing, proportion, density, and alignment.
- Color semantics.
- Interaction states.
- Subtle, purposeful motion.
- Tool affordances.
- Deliberate use of desktop screen space.
- Consistency between different parts of the experience.

Don't interpret "professional" as meaning more complex, more colorful, or more futuristic.

A restrained interface with exceptional interaction design is better than a sophisticated-looking interface full of unnecessary elements.

The design should have an identifiable personality and feel carefully crafted, not assembled from familiar AI-generated dashboard patterns.

## 5. Design around the teaching workflow

The underlying workflow is:

The tutor creates or modifies spatial information.

The student explores it through touch and sound.

The tutor observes enough to understand what is happening and provides guidance.

The diagram evolves as the explanation progresses.

The student demonstrates understanding through interaction or conversation.

Think carefully about how the software facilitates this sequence.

In particular, explore how to make the live connection between the student's physical exploration and the tutor's drawing feel central to the product.

The tutor should be able to perceive meaningful interaction without interpreting a stream of debug events.

Distinguish between information the system actually knows and information it cannot infer.

For example, we may know where a finger is touching and that the phone reported completing speech playback. We cannot automatically conclude that the student understood the diagram or even consciously heard the instruction.

Present those distinctions clearly, without excessive technical terminology.

Consider route learning as our first demonstration, but ensure the general interaction could also support spatial diagrams in mathematics, science, geography, and computer science.

Avoid building a route-specific interface that limits the broader product.

## 6. Make the important states feel intentional

Design the experience for actual usage, not just a perfect screenshot.

Consider:
- Opening the workspace with no drawing.
- Waiting for a student to connect.
- Drawing while the student is connected.
- Seeing the student actively explore.
- Adding and editing landmarks.
- Delivering an instruction.
- Recovering from connection failure.
- Updating a diagram during exploration.
- Finishing an explanation and clearing or starting another.

A professional product should behave coherently in each state.

You don't need to expose every state through a large dedicated panel.

Prefer contextual and proportionate feedback.

## 7. Preserve the real engineering

The existing functionality is valuable.

Do not casually disrupt:
- Drawing and editing.
- Coordinate accuracy and phone mapping.
- Haptic feedback.
- Landmark events and speech.
- Live finger telemetry.
- Connection and reconnection handling.
- Undo and Clear.
- Keyboard controls.
- Existing tests and recording functionality.

Reorganize presentation and interaction where beneficial, but avoid unnecessary backend changes or large architectural rewrites.

Keep actual working controls, not decorative representations of features.

Do not interfere with active worktrees or other agents' file ownership.

Sunday's presentation and recorded demonstration remain critical. Preserve a known-good version, respect the current priorities, and don't jeopardize the demo for visual changes.

## 8. Work like a strong designer-engineer

I don't want a lengthy theoretical proposal followed by a handful of cosmetic tweaks.

Use a disciplined, practical design process:

**Understand:** Inspect the working product and its existing constraints. Identify what is genuinely awkward, incomplete, confusing, or visually weak.

**Reason:** Establish a clear interaction model and design direction based on real tutor needs. Challenge unnecessary features and terminology.

**Explore:** Inspect relevant design references and available skills or tools. Identify patterns worth adapting and reject ones that don't fit.

**Design:** Make coherent decisions about layout, hierarchy, controls, interaction, and visual language. Consider the entire experience rather than isolated components.

**Build:** Implement the meaningful improvements, not just superficial polish. Use existing architecture wherever possible.

**Critique:** Render and inspect the actual interface at the target desktop viewport. Evaluate it as an external product designer would. Identify awkward layouts, generic elements, friction, and inconsistencies. Fix them.

**Verify:** Confirm interactions still function, run the relevant tests, and perform real-device smoke tests when available.

Be ambitious in quality but disciplined in scope.

You don't need my approval for normal design and implementation decisions within this direction.

Make thoughtful decisions independently and explain consequential tradeoffs briefly.

## 9. How to judge your own work

Don't judge success purely by visual attractiveness.

Ask:

- Would a tutor understand how to begin using this without extensive training?
- Is the primary teaching workflow naturally supported?
- Is the drawing and student interaction the obvious center of attention?
- Does every major control have a clear purpose?
- Can the tutor react naturally while speaking with the student?
- Is the information presented actually useful rather than decorative?
- Does the interface adapt intelligently to the current task?
- Does the design feel distinctive and intentionally composed?
- Does it communicate the product's unique purpose within a few seconds?
- Would this feel like credible, professional software if it weren't a hackathon project?

Most importantly:

**If a feature, label, or panel doesn't genuinely improve the experience, remove it—even if it makes the interface look more populated.**

## 10. Deliverable and autonomy

I want one strong, coherent direction, not several generic mockups.

Use your expertise, available skills, relevant references, and informed engineering judgment to produce the best practical version of FeelInk Studio.

You may introduce thoughtful interaction improvements when they clearly strengthen the product, but avoid broad unrelated features, invented functionality, or speculative engineering.

Coordinate with the existing lead and agent ownership structure.

If time or integration constraints prevent a full redesign, prioritize the highest-impact improvements and report what was deliberately deferred.

At completion, give me:
1. The major UX/product problems you identified.
2. The design decisions you made and why.
3. What you actually changed and verified.
4. Any meaningful limitations or deferred improvements.

**The standard is not "a nicer-looking hackathon project."**

The standard is a thoughtful, usable, distinctive product experience designed by someone who understands the actual work its users are trying to accomplish.

I want you to think critically, challenge weak design decisions—including ours—and make this feel like genuinely excellent software.

