# Boid Predator-Prey Simulation Documentation

This is a dynamic 2D ecosystem simulation featuring procedurally generated plants, evolving birds (predators), and bees (prey). The simulation demonstrates concepts of artificial life, including flocking behavior, predator-prey dynamics, resource gathering, and genetic evolution.

For more detailed information on specific mechanics, see the other documentation files:
-   [`Appearance.md`](Documentation/Appearance.md)
-   [`Boids.md`](Documentation/Boids.md)
-   [`Evolution.md`](Documentation/Evolution.md)
-   [`Plants.md`](Documentation/Plants.md)

## Features

-   **Procedural Forest:** The environment is populated with unique trees, shrubs, and weeds generated using Lindenmayer Systems (L-Systems), a mathematical method for modeling plant growth. Each plant is unique due to stochastic rule application.
-   **Boids Simulation:** Both birds and bees use the "boids" algorithm to simulate intelligent group movement (flocking and swarming) based on three simple rules: separation, alignment, and cohesion. The strength of these behaviors is controlled by evolvable genes.
-   **Predator-Prey Dynamics:** Birds actively hunt bees to gather energy for reproduction. Bees have an evolving "evade" behavior to escape, and their hive-selection logic includes risk assessment based on nearby predators.
-   **Resource & Reproduction Cycles:**
    -   Bees collect nectar from procedurally generated flowers and return it to hives. Hives with enough nectar produce new bees based on the collective DNA of the contributors.
    -   Birds must hunt a specific number of bees to gain enough energy to reproduce. Successful birds find a mate and a free nest to lay an egg, which eventually hatches into a new bird.
-   **Evolutionary Mechanics:** Birds and bees have a set of heritable traits (DNA) that control their behavior (e.g., `visualRange`, `huntFactor`, `evadeFactor`). These traits are blended during reproduction (sexual for birds, collective for bees) and are subject to random mutation, allowing the populations to evolve over time.
-   **Genetic Appearance:** Bird appearance (body shape, beak shape, tail shape, and color palette) is genetically determined. Offspring inherit a blend of their parents' features through vertex and color interpolation, which are also subject to micro and macro mutations.
-   **Interactive Overlay:** An in-simulation overlay provides real-time statistics on population counts and detailed graphs visualizing the distribution and evolution of every heritable trait for both species.
-   **Dynamic World:** The simulation features wind that sways plants, a balanced world-generation system to ensure a viable starting ecosystem, and an auto-restart feature if a species goes extinct.

## How to Run

The simulation is deployed on GitHub Pages and can be accessed here:
-   **[Live Simulation](https://semvdn.github.io/The-Birds-and-The-Bees/)**

There is nothing to install. Simply open the link in a modern web browser (like Chrome, Firefox, or Edge).

## How to Interact

The simulation can be interacted with using the following controls:

-   **Press `M`:** Toggles the main statistics overlay, which shows population counts and trait distributions.
-   **Press `P`:** Toggles the performance settings overlay, which gives users acces to settigns to improve performance and adjust simulation parameters.
-   **On mobile:** A hamburger menu provides access to the statistics and performance overlays.

## File Structure

-   [`index.html`](index.html): The main HTML file that sets up the canvas and loads all the necessary scripts.
-   [`style.css`](style.css): Contains basic styling for the main page and canvas.
-   [`css/overlay.css`](css/overlay.css): All styling for the interactive statistics overlay.
-   [`js/main.js`](js/main.js): The core simulation controller. It manages the main animation loop, world generation, boid interactions, and reproduction cycles.
-   [`js/presets.js`](js/presets.js): A centralized configuration file for all simulation parameters, including boid behaviors, L-System rules, colors, and evolutionary settings.
-   [`js/lsystem.js`](js/lsystem.js): Implements the L-System generator, which procedurally creates the rule-based structures for plants.
-   [`js/drawing.js`](js/drawing.js): Contains the functions responsible for rendering the procedurally generated plants on the canvas.
-   [`js/favicon.js`](js/favicon.js): Generates a dynamic, procedurally drawn favicon that reflects the current state of the simulation.
-   [`js/boids/boid.js`](js/boids/boid.js): The base `Boid` class, which includes shared logic for all moving agents, such as flocking behaviors (separation, alignment, cohesion), movement, and basic life-cycle management.
-   [`js/boids/bird.js`](js/boids/bird.js): The `Bird` class, which extends `Boid`. It defines predator-specific logic, including hunting bees, seeking a mate, and nesting.
-   [`js/boids/bee.js`](js/boids/bee.js): The `Bee` class, which extends `Boid`. It defines prey-specific logic, including evading predators, collecting nectar from flowers, and returning it to a hive.
-   [`js/boids/drawing.js`](js/boids/drawing.js): Contains the functions for drawing all boids (birds and bees) as well as their nests and hives.
-   [`js/boids/grid.js`](js/boids/grid.js): Implements a spatial grid for efficient neighbor detection, which is crucial for optimizing the performance of the boid flocking algorithm.
