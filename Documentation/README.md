# Boid Predator-Prey Simulation Documentation

This is a dynamic 2D ecosystem simulation featuring procedurally generated plants, evolving birds (predators), and bees (prey). The simulation demonstrates concepts of artificial life, including flocking behavior, predator-prey dynamics, resource gathering, and genetic evolution.

## Features

-   **Procedural Forest:** The environment is populated with unique trees, shrubs, and weeds generated using Lindenmayer Systems (L-Systems), a mathematical method for modeling plant growth.
-   **Boids Simulation:** Both birds and bees use the "boids" algorithm to simulate intelligent group movement (flocking and swarming) based on three simple rules: separation, alignment, and cohesion.
-   **Predator-Prey Dynamics:** Birds actively hunt bees to gather energy for reproduction. Bees have an evolving "evade" behavior to escape.
-   **Resource & Reproduction Cycles:**
    -   Bees collect nectar from procedurally generated flowers and return it to hives. Hives with enough nectar produce new bees.
    -   Birds must hunt bees to gain energy. Successful birds find a mate and a free nest to lay an egg, which eventually hatches into a new bird.
-   **Evolutionary Mechanics:** Birds and bees have a set of heritable traits (DNA) that control their behavior (e.g., `visualRange`, `huntFactor`, `evadeFactor`). These traits are blended during reproduction and are subject to random mutation, allowing the populations to evolve over time.
-   **Genetic Appearance:** Bird appearance (body shape, beak shape, tail shape, and color palette) is genetically determined. Offspring inherit a blend of their parents' features, which are also subject to mutation.
-   **Interactive Overlay:** An in-simulation overlay provides real-time statistics on population counts and detailed graphs visualizing the evolution of every heritable trait for both species over time.
-   **Dynamic World:** The simulation features wind that sways plants, a balanced world-generation system to ensure a viable starting ecosystem, and an auto-restart feature if a species goes extinct.

## How to Run

This is a browser-based application with no dependencies. To run it, simply open the `index.html` file in a modern web browser (like Chrome, Firefox, or Edge).

## How to Interact

The primary interaction is with the statistics overlay:

-   **Press the 'M' key:** Toggles the visibility of the overlay.

The overlay contains several collapsible sections:
-   **Population Stats:** A live count of the bird and bee populations.
-   **Population Over Time:** A graph showing how the populations change over time.
-   **Bee Trait Evolution:** A set of graphs showing the mean, min, and max values of each evolvable bee trait over time.
-   **Bird Trait Evolution:** The same set of graphs for the bird population.

## File Structure

-   `index.html`: The main entry point for the application.
-   `style.css`: Basic styling for the canvas.
-   `css/overlay.css`: Styling for the statistics overlay.
-   `js/main.js`: The core simulation controller. It handles initialization, the main animation loop, reproduction logic, and calls to other modules.
-   `js/presets.js`: A configuration file containing all the core constants for the simulation, including L-System rules, boid settings, and evolutionary parameters.
-   `js/lsystem.js`: Handles the generation of L-System strings that define plant structures.
-   `js/drawing.js`: Contains functions for drawing plants onto the canvas.
-   `js/boids/boid.js`: The base class for all "boids," containing shared logic for movement, flocking, and life cycles.
-   `js/boids/bird.js`: The class defining bird-specific logic, such as hunting and nesting.
-   `js/boids/bee.js`: The class defining bee-specific logic, such as nectar gathering and hive selection.
-   `js/boids/drawing.js`: Contains functions for drawing the boids, nests, and hives.
-   `js/boids/grid.js`: Implements a spatial grid to optimize finding nearby boids, significantly improving performance.

