# Planning and Architecture for the Dynamic Plant Ecosystem

This document outlines the plan for integrating a dynamic plant ecosystem into the existing Boids simulation.

## 1. Existing Architecture Summary

The current architecture is composed of four main JavaScript files:

*   **`vector.js`**: Provides a `Vector` class for 2D vector math, used for position, velocity, and acceleration.
*   **`boid.js`**: Defines the base `Boid` class with flocking behaviors (alignment, cohesion, separation) and `Insect` and `Bird` subclasses. Birds have a `hunt` method targeting insects.
*   **`flock.js`**: Manages a collection of boids within a `Flock` class. The `run` method updates and renders each boid in the flock.
*   **`main.js`**: Initializes the canvas, creates `Flock` instances for insects and birds, and runs the main animation loop (`animate`).

The animation loop in `main.js` calls the `run` method of each flock, which in turn updates and renders each boid.

## 2. Proposed New Classes

To implement the dynamic plant ecosystem, we will introduce the following new classes:

### `Plant`

*   **Description:** Represents a single plant or tree. It will be the root of the fractal structure.
*   **Properties:**
    *   `position`: A `Vector` object representing the base of the plant on the canvas.
    *   `branches`: An array of `Branch` objects.
    *   `maxGenerations`: The maximum depth of the fractal branching.
*   **Methods:**
    *   `constructor(x, y)`: Initializes the plant at a specific position and generates the initial branches.
    *   `grow()`: A method to regenerate leaves after they have been consumed.
    *   `show(ctx)`: Renders the entire plant by calling the `show` method of its branches.

### `Branch`

*   **Description:** Represents a branch of a plant. Each branch can have sub-branches, creating a fractal pattern.
*   **Properties:**
    *   `start`: A `Vector` object for the starting point of the branch.
    *   `end`: A `Vector` object for the ending point of the branch.
    *   `generation`: The depth of the branch in the fractal structure.
    *   `children`: An array of child `Branch` objects.
    *   `leaf`: A `Leaf` object if the branch is at the tip.
*   **Methods:**
    *   `constructor(start, end, generation)`: Initializes the branch.
    *   `show(ctx)`: Draws the branch on the canvas.
    *   `createChildren(maxGenerations)`: Creates sub-branches if the current generation is less than the maximum.

### `Leaf`

*   **Description:** Represents a leaf at the tip of a branch, which serves as a food source.
*   **Properties:**
    *   `position`: A `Vector` object for the center of the leaf.
    *   `size`: The size of the leaf.
    *   `color`: The color of the leaf.
    *   `isEaten`: A boolean to track if the leaf has been consumed.
*   **Methods:**
    *   `constructor(position)`: Initializes the leaf.
    *   `show(ctx)`: Draws the leaf on the canvas.
    *   `regrow()`: Resets the `isEaten` status.

## 3. Class Interactions

The new classes will interact with the existing classes as follows:

```mermaid
graph TD
    subgraph Simulation
        main_js[main.js] -- creates --> insectFlock[insectFlock: Flock]
        main_js -- creates --> birdFlock[birdFlock: Flock]
        main_js -- creates --> plantEcosystem[plantEcosystem: Plant[]]
    end

    subgraph Boids
        insectFlock -- contains --> Insect
        birdFlock -- contains --> Bird
        Bird -- hunts --> Insect
    end

    subgraph Plants
        plantEcosystem -- contains --> Plant
        Plant -- has --> Branch
        Branch -- has --> Leaf
    end

    Insect -- eats --> Leaf
```

*   **`main.js`**: Will be responsible for creating and managing an array of `Plant` objects.
*   **`Insect`**: The `Insect` class will be modified to seek out `Leaf` objects as a food source. This will require a new "seek" behavior to be added to the `Insect` class.
*   **`Flock`**: The `run` method for the `insectFlock` will need to be updated to pass the array of plants to the insects so they can find leaves to eat.

## 4. Rendering Integration

The rendering of the plants will be handled within the existing `animate` loop in `main.js`.

1.  An array of `Plant` objects will be created in `main.js`.
2.  In the `animate` function, after clearing the canvas, we will iterate through the plants array and call the `show(ctx)` method for each plant. This will happen before rendering the flocks to ensure plants are drawn in the background.

## 5. Food Consumption and Regrowth

*   **Consumption:**
    1.  The `Insect` class will have a new method, `seekFood(plants)`, which will find the nearest `Leaf` that is not eaten.
    2.  This will be implemented as a new steering behavior, similar to `hunt` in the `Bird` class.
    3.  When an insect is close enough to a leaf, it will "eat" it, setting the `isEaten` flag on the `Leaf` to `true`.
*   **Regrowth:**
    1.  The `Plant` class will have a `grow()` method.
    2.  This method will be called periodically (e.g., using `setInterval` or by checking frame counts in the `animate` loop).
    3.  The `grow()` method will iterate through its branches and leaves, and for any leaf where `isEaten` is `true`, it will call the `regrow()` method on the leaf, which will reset the flag and make it visible again.

This plan provides a clear path for integrating the dynamic plant ecosystem into the Boids simulation without major refactoring of the existing code.