# Evolutionary Mechanics Documentation

The simulation models evolution through a system of heritable traits (DNA), genetic blending, and random mutation. Natural selection is not explicitly coded but emerges as a result of the simulation's rules.

## Heritable DNA

Both birds and bees possess a "DNA" object that dictates their behavior. The templates for this DNA are defined in `presets.js` (`BIRD_DNA_TEMPLATE`, `BEE_DNA_TEMPLATE`).

-   **Evolvable Traits:** These include parameters like:
    -   `visualRange`: How far the boid can see to find mates, prey, or flockmates.
    -   `separationFactor`, `alignmentFactor`, `cohesionFactor`: The weights for the core boid flocking rules.
    -   `huntFactor` (Birds): How aggressively a bird steers towards prey.
    -   `evadeFactor` (Bees): How strongly a bee steers away from predators.
    -   `returnFactor` (Bees): How strongly a bee steers towards a hive.
-   **Genetic Range:** Each trait is defined with a `min` and `max` value, constraining its evolution within a plausible range.

## Inheritance and Reproduction

When a new boid is created, its genetics are determined by its parents in the `determineInheritance` function (`main.js`).

1.  **DNA Blending:** The offspring's value for each DNA trait is calculated by taking the **average** of its two parents' values.
2.  **Appearance Blending:** As described in the Appearance documentation, physical features like shape and color are also blended from the two parents.

## Mutation: The Engine of Change

After the parental traits are blended, mutation introduces new genetic variations into the population.

1.  **DNA "Micro" Mutation:** Each individual DNA trait has a small chance (`MUTATION_RATE`) of being slightly increased or decreased. The magnitude of this change is controlled by `MUTATION_AMOUNT`. This is the primary mechanism for gradual, incremental evolution.

2.  **Appearance Mutations (Physical Traits):**
    -   **Color Mutation:** Each color in a new bird's blended palette has a chance to have its RGB values randomly shifted, creating subtle new shades.
    -   **Shape "Micro" Mutation:** The vertices of an offspring's interpolated beak and tail shapes can be slightly "jittered," creating minor, unique variations.
    -   **Shape "Macro" Mutation:** An offspring has a small chance to be born with a completely different *base* beak or tail shape than its parents. This allows for sudden, significant evolutionary leaps, which could be highly advantageous or disadvantageous.

## Emergent Natural Selection

The simulation does not have a direct "survival of the fittest" rule. Instead, natural selection emerges from the interplay of the boids' behaviors and their environment.

-   **Example (Birds):** A bird born with a slightly higher `huntFactor` may be more successful at catching bees. It will therefore be more likely to meet the energy requirements for reproduction, passing on its superior `huntFactor` gene to its offspring. Over time, the average `huntFactor` in the population may rise.
-   **Example (Bees):** A bee that mutates a higher `evadeFactor` may be better at escaping birds. This increases its lifespan and gives it more opportunities to contribute nectar (and its DNA) to a hive's reproductive cycle.

## Visualizing Evolution

The overlay provides powerful tools for observing these mechanics in real-time. The "Trait Evolution" graphs plot the population's **mean, minimum, and maximum** values for each DNA trait over the entire course of the simulation. This allows an observer to directly see:
-   The direction of evolutionary pressure on a trait (is the average increasing or decreasing?).
-   The genetic diversity of the population (is the gap between the min and max values wide or narrow?).