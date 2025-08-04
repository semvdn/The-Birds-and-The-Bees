# Plant Generation Documentation

The diverse and organic flora in the simulation is generated procedurally using a combination of Lindenmayer Systems (L-Systems) and a pre-rendering technique for performance.

## Core Technology: L-Systems

An L-System is a string rewriting system used to model the growth processes of plants. It works by starting with a simple string (an "axiom") and iteratively applying a set of rules to expand the string into a complex sequence of commands.

### Generation Process ([`js/lsystem.js`](js/lsystem.js))

1.  **Axiom:** The process begins with a simple axiom, typically `'X'`.
2.  **Rules:** A set of rules defined in [`js/presets.js`](js/presets.js) determines how each character in the string transforms. For example:
    -   `'F': 'FF'` (A branch segment grows twice as long).
    -   `'X'`: Can be an array of outcomes, e.g., `['F+[[XL]-XL]-F[-FXL]+XL', 'F[+F[L]X][-F[L]X]FXL']`.
3.  **Iteration:** The rules are applied to the string for a set number of iterations. Each iteration makes the plant more complex.
4.  **Stochasticity:** As seen in the `'X'` rule example above, some rules in [`js/presets.js`](js/presets.js) are defined as an array of possible outcomes. When the L-System is generated, one of these outcomes is chosen randomly, ensuring that no two plants of the same "species" are identical.

### Interpreting the L-System String ([`js/drawing.js`](js/drawing.js))

The final, complex string is interpreted as a series of drawing commands, much like a LOGO turtle program:

-   `F`: Move forward while drawing a branch segment.
-   `+`: Turn right by a pre-defined angle.
-   `-`: Turn left by a pre-defined angle.
-   `[`: Pushes the current canvas transform and line width onto a stack. This is used to create branches. In [`js/lsystem.js`](js/lsystem.js), the `findBranchPoints` function specifically identifies the first few `[` characters on the main trunk of trees as potential locations for nests or hives.
-   `]`: Pops a state from the stack, restoring the previous position, angle, and line width. This allows the drawing to return to a branch point and continue.
-   `L`: Draws a leaf, using a pre-defined shape and color from the plant's preset.
-   `O`: Draws a flower. The position of each flower is stored in the plant's `petalPoints` array, registering it as a nectar source for bees.

## Plant Variety

The simulation contains three main types of plants, each with multiple "species" defined in [`js/presets.js`](js/presets.js).

-   **Trees (`TREE_PRESETS`):** The largest plants. They are the only type that can support nests and hives.
-   **Shrubs (`SHRUB_PRESETS`):** Medium-sized plants. These can be purely decorative (`leafy`) or can produce flowers (`flower`) that serve as nectar sources.
-   **Weeds (`WEED_PRESETS`):** Small, simple plants that add to the ground clutter and visual density of the forest floor.

Each preset contains unique L-System rules, iteration counts, angles, colors, and leaf/flower shapes, resulting in a wide variety of plant life.

## Performance Optimization: Pre-Rendering

Recalculating and drawing the complex L-System for every plant on every frame would be extremely slow. To solve this, the simulation uses a pre-rendering technique:

1.  During the initial setup, the `preRenderPlant` function in [`js/drawing.js`](js/drawing.js) draws each plant's full structure *once* onto a hidden, off-screen canvas.
2.  This canvas image is then cached within the plant's object.
3.  In the main `animate` loop, the simulation simply draws this cached image to the screen. This is vastly more performant.

## Dynamic Elements

Although the plant structures are pre-rendered, they are not entirely static. The main animation loop passes a global `windStrength` value to the `drawPlant` function in [`js/drawing.js`](js/drawing.js). Inside this function, the wind's effect is scaled by type-specific multipliers (`SHRUB_WIND_MULTIPLIER`, `WEED_WIND_MULTIPLIER` from [`js/presets.js`](js/presets.js)) to apply a gentle, swaying `rotate` transformation to each plant's cached image, bringing the forest to life.
