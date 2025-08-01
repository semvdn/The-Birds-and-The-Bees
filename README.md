# Boid Predator-Prey Simulation Documentation

This is a dynamic 2D ecosystem simulation featuring procedurally generated plants, evolving birds (predators), and bees (prey). The simulation demonstrates concepts of artificial life, including flocking behavior, predator-prey dynamics, resource gathering, and genetic evolution.

For more detailed information on specific mechanics, see the other documentation files:
-   [`Appearance.md`](Documentation/Appearance.md:1)
-   [`Boids.md`](Documentation/Boids.md:1)
-   [`Evolution.md`](Documentation/Evolution.md:1)
-   [`Plants.md`](Documentation/Plants.md:1)

## Features

-   **Procedural Forest:** The environment is populated with unique trees, shrubs, and weeds generated using Lindenmayer Systems (L-Systems), a mathematical method for modeling plant growth.
-   **Boids Simulation:** Both birds and bees use the "boids" algorithm to simulate intelligent group movement (flocking and swarming) based on three simple rules: separation, alignment, and cohesion.
-   **Predator-Prey Dynamics:** Birds actively hunt bees to gather energy for reproduction. Bees have an evolving "evade" behavior to escape.
-   **Resource & Reproduction Cycles:**
    -   Bees collect nectar from procedurally generated flowers and return it to hives. Hives with enough nectar produce new bees.
    -   Birds must hunt bees to gain energy. Successful birds find a mate and a free nest to lay an egg, which eventually hatches into a new bird.
-   **Evolutionary Mechanics:** Birds and bees have a set of heritable traits (DNA) that control their behavior (e.g., `visualRange`, `huntFactor`, `evadeFactor`). These traits are blended during reproduction and are subject to random mutation, allowing the populations to evolve over time.
-   **Genetic Appearance:** Bird appearance (body shape, beak shape, tail shape, and color palette) is genetically determined. Offspring inherit a blend of their parents' features, which are also subject to mutation.
-   **Interactive Overlay:** An in-simulation overlay provides real-time statistics on population counts and detailed graphs visualizing the distribution of every heritable trait for both species.
-   **Dynamic World:** The simulation features wind that sways plants, a balanced world-generation system to ensure a viable starting ecosystem, and an auto-restart feature if a species goes extinct.

## How to Run

This is a browser-based application with no dependencies. To run it, simply open the `index.html` file in a modern web browser (like Chrome, Firefox, or Edge).

## How to Interact

The primary interaction is with the statistics overlay:

-   **Press the 'M' key:** Toggles the visibility of the overlay.

The overlay contains several collapsible sections:
-   **Population Stats:** A live count of the bird and bee populations.
-   **Population Over Time:** A graph showing how the populations change over time.
-   **Bee Trait Distribution:** A set of violin plots showing the distribution of each evolvable bee trait across the current population.
-   **Bird Trait Distribution:** The same set of violin plots for the bird population.

## File Structure

-   [`index.html`](../index.html): The main HTML file that sets up the canvas and loads all the necessary scripts.
-   [`style.css`](../style.css): Contains basic styling for the main page and canvas.
-   [`css/overlay.css`](../css/overlay.css): All styling for the interactive statistics overlay.
-   [`js/main.js`](../js/main.js): The core simulation controller. It manages the main animation loop, world generation, boid interactions, and reproduction cycles.
-   [`js/presets.js`](../js/presets.js): A centralized configuration file for all simulation parameters, including boid behaviors, L-System rules, colors, and evolutionary settings.
-   [`js/lsystem.js`](../js/lsystem.js): Implements the L-System generator, which procedurally creates the rule-based structures for plants.
-   [`js/drawing.js`](../js/drawing.js): Contains the functions responsible for rendering the procedurally generated plants on the canvas.
-   [`js/boids/boid.js`](../js/boids/boid.js): The base `Boid` class, which includes shared logic for all moving agents, such as flocking behaviors (separation, alignment, cohesion), movement, and basic life-cycle management.
-   [`js/boids/bird.js`](../js/boids/bird.js): The `Bird` class, which extends `Boid`. It defines predator-specific logic, including hunting bees, seeking a mate, and nesting.
-   [`js/boids/bee.js`](../js/boids/bee.js): The `Bee` class, which extends `Boid`. It defines prey-specific logic, including evading predators, collecting nectar from flowers, and returning it to a hive.
-   [`js/boids/drawing.js`](../js/boids/drawing.js): Contains the functions for drawing all boids (birds and bees) as well as their nests and hives.
-   [`js/boids/grid.js`](../js/boids/grid.js): Implements a spatial grid for efficient neighbor detection, which is crucial for optimizing the performance of the boid flocking algorithm.
