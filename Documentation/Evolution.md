# Evolutionary Mechanics Documentation

The simulation models evolution through two distinct systems: sexual reproduction for birds and a hive-based collective inheritance for bees. Both systems involve heritable traits (DNA), genetic blending, and random mutation. Natural selection is not explicitly coded but emerges as a result of the simulation's rules.

## Heritable DNA

Both birds and bees possess a "DNA" object that dictates their behavior. The templates for this DNA are defined in [`js/presets.js`](../js/presets.js) (`BIRD_DNA_TEMPLATE`, `BEE_DNA_TEMPLATE`).

-   **Evolvable Traits:** These include parameters like:
    -   `visualRange`: How far the boid can see to find mates, prey, or flockmates.
    -   `separationDistance`: The distance a boid tries to maintain from its flockmates.
    -   `separationFactor`, `alignmentFactor`, `cohesionFactor`: The weights for the core boid flocking rules.
    -   `turnFactor`: How quickly a boid can change direction.
    -   `huntFactor` (Birds): How aggressively a bird steers towards prey.
    -   `evadeFactor` (Bees): How strongly a bee steers away from predators.
    -   `returnFactor` (Bees): How strongly a bee steers towards its hive.
-   **Genetic Range:** Each trait is defined with a `min` and `max` value, constraining its evolution within a plausible range.
-   **World Scaling:** It is important to note that the values for distance-based traits (`visualRange`, `separationDistance`) defined in the presets are *base values*. During the simulation, these are multiplied by a global `worldScale` factor to ensure that behavior is proportional to the screen size.

## Inheritance and Reproduction

The simulation uses two different models for reproduction.

### Bird Reproduction (Sexual)

When a new bird is created from two parents in a nest, its genetics are determined by the [`determineInheritance`](../js/main.js:143) function in [`js/main.js`](../js/main.js).

1.  **DNA Blending & Mutation:** The offspring's value for each DNA trait is calculated by taking the **average** of its two parents' values, and then applying a potential mutation to that average.
2.  **Appearance Blending:** As described in the [Appearance documentation](./Appearance.md), physical features like shape and color are also blended from the two parents, with their own specific mutation rules.

### Bee Reproduction (Asexual, Hive-based)

Bees reproduce asexually. When a hive has accumulated enough nectar, it produces new bees. The genetics of these new bees are determined by a collective "gene pool" from all the bees that have contributed nectar to that specific hive.

1.  **DNA Pooling:** When a bee delivers nectar, its DNA is added to the hive's `dnaPool`.
2.  **Averaging:** When new bees are created, the hive **averages** the DNA from all contributors in the pool to create a new base DNA.
3.  **Mutation:** This averaged DNA is then mutated for each new bee, creating slight variations. This process is handled within the [`handleBeeReproduction`](../js/main.js:291) function in [`js/main.js`](../js/main.js).

This collective inheritance means that successful foragers (those who contribute the most nectar) have the greatest influence on the next generation's genetics.

## Mutation: The Engine of Change

After parental or hive traits are blended, mutation introduces new genetic variations. This process is handled by the [`mutate`](../js/main.js:96) function.

1.  **DNA "Micro" Mutation:** Each individual DNA trait has a small chance ([`MUTATION_RATE`](../js/presets.js:19)) of being slightly increased or decreased. The magnitude of this change is controlled by [`MUTATION_AMOUNT`](../js/presets.js:20). This is the primary mechanism for gradual, incremental evolution in both species.

2.  **Appearance Mutations (Birds Only):**
    -   **Color Mutation:** Each color in a new bird's blended palette has a chance to have its RGB values randomly shifted, creating subtle new shades.
    -   **Shape "Micro" Mutation:** The vertices of an offspring's interpolated beak and tail shapes can be slightly "jittered," creating minor, unique variations.
    -   **Shape "Macro" Mutation:** An offspring has a small chance to be born with a completely different *base* beak or tail shape than its parents. This allows for sudden, significant evolutionary leaps.

## Emergent Natural Selection

The simulation does not have a direct "survival of the fittest" rule. Instead, natural selection emerges from the interplay of the boids' behaviors and their environment.

-   **Example (Birds):** A bird born with a slightly higher `huntFactor` may be more successful at catching bees. It will therefore be more likely to meet the energy requirements for reproduction, passing on its superior `huntFactor` gene to its offspring. Over time, the average `huntFactor` in the population may rise.
-   **Example (Bees):** A bee that mutates a higher `evadeFactor` may be better at escaping birds. This increases its lifespan and gives it more opportunities to contribute nectar (and its DNA) to a hive's reproductive cycle, influencing the hive's collective gene pool.

## Visualizing Evolution

The overlay provides powerful tools for observing these mechanics in real-time. The "Trait Evolution" graphs plot the population's **mean, minimum, and maximum** values for each DNA trait over the entire course of the simulation. This allows an observer to directly see:
-   The direction of evolutionary pressure on a trait (is the average increasing or decreasing?).
-   The genetic diversity of the population (is the gap between the min and max values wide or narrow?).