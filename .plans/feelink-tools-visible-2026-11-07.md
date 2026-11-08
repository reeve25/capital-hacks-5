<!-- Reeve, Sat Nov 7, 19:43 PT, pasted into the lead session verbatim. Tempers the 18:55 human-led note's minimalism for the
     tutor's tools: the stage is part of the presentation (slides, screenshots, GIFs), so real capabilities must be visible,
     grouped by tutor action. Human-led framing, honest tools and the board as hero stand. Task: #141. -->

Important tutor-UI direction update:

Because the judges and audience will mostly experience FeelInk through slides, screenshots, and GIFs, the tutor interface itself needs to visibly communicate capability.

The recent direction became too minimal. It hides too much of what the tutor can actually do, so the product can look underpowered or incomplete even when features exist.

I want the tutor-facing UI to make the tutor's available tools and workflow more visible and understandable.

## Key principle

**The interface is both a working tool and part of the presentation.**

So the tutor's capabilities should be clearly visible, well-grouped, and easy to read in a screenshot or GIF.

However, do **not** add fake breadth or generic categories just to make the product look richer.

If a tool is shown, it should correspond to a real implemented or clearly intended capability that fits the current product.

## What I want

### 1. Make tutor tools more visible
The sidebar should more clearly show the different tools available to the teacher.

Visible shortcuts are good and should stay or improve.

A viewer should quickly understand:
- what the tutor can create
- what the tutor can edit
- what the tutor can reveal or present progressively
- what session information the tutor can see

### 2. Group by function, not fake subject areas
Avoid artificial category labels like "Graphs," "Navigation," or "Science" unless those are real modes with real behavior.

Instead, organize around tutor actions.

Suggested direction:
- **Create** — draw, label/landmark, start point, other real annotation tools
- **Edit** — undo, clear, rename/move if real
- **Teach / Present** — reveal next, previous, reveal all, step controls
- **Session** — connection state, student activity, last spoken landmark, other real live feedback

You do not have to use these exact labels if stronger ones emerge.

### 3. Keep the interface honest
Do not turn the sidebar into a catalog of hypothetical future features.

Do not add controls that aren't actually implemented or clearly support the current demo.

The goal is not "more buttons." The goal is to make the current capabilities legible, believable, and product-like.

### 4. Make switching feel easy
The available tools should look easy to switch between.

The tutor workflow should feel active and intentional, not buried.

The interface should communicate that this is a purpose-built teaching tool, not just a drawing page.

### 5. Preserve the classroom/in-person framing
Keep the product centered on live, human-led teaching.

Do not reintroduce UI patterns that make this feel like a remote-learning dashboard or a text-based tutoring system.

### 6. Keep the board central
The canvas remains the hero.

The visible tools should support the board, not compete with it.

### 7. Design for screenshot/GIF readability
The interface should read clearly and quickly in a recorded demo:
- tools should be understandable at a glance
- grouped sections should make sense visually
- shortcuts should be legible but secondary
- the available teaching capabilities should be obvious

### 8. Practical constraint
Use real existing functionality wherever possible. Reorganize, relabel, and surface capabilities more clearly before inventing new ones.

If adding a small missing affordance meaningfully improves the tutor workflow and fits current scope, that's okay. But don't derail the build.

Please rethink the left/sidebar tool architecture with this in mind and improve the overall composition so the tutor's capabilities are both truly useful and clearly visible to an audience.
