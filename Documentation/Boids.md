# Bird and Bee Behavior Documentation

The birds and bees in the simulation are autonomous agents, often called "boids," whose complex group behavior emerges from a few simple, local rules.

## The Boid Superclass ([`js/boids/boid.js`](js/boids/boid.js))

Both `Bird` and `Bee` classes inherit from a base `Boid` class, which contains shared logic.

### Core Flocking Rules

At the heart of the boid simulation are three rules that dictate movement based on nearby flockmates (the "local neighborhood"). These are applied in the `applyBoidRules` function.

1.  **Separation:** Steer to avoid crowding local flockmates.
2.  **Alignment:** Steer towards the average direction of local flockmates.
3.  **Cohesion:** Steer towards the average position (center of mass) of local flockmates.

The strength of these steering forces is controlled by heritable DNA traits, allowing the boids' flocking behavior to evolve.

### Life Cycle

The base `Boid` class manages the agent's life cycle:
-   **Age & Energy:** Each boid tracks its `age` and `energy`. Energy depletes over time.
-   **Death:** A boid dies if its `age` exceeds its `maxLifetime` or its `energy` drops to zero. To prevent synchronized die-offs, each boid is created with a slightly randomized `maxLifetime`.
-   **Falling:** When a boid dies from natural causes, it stops its behavior and falls to the ground, where it will eventually fade away. If killed by a predator, it vanishes instantly.

## Bee Behavior ([`js/boids/bee.js`](js/boids/bee.js))

Bees are the prey and pollinators of the ecosystem. Their behavior is governed by a state machine.

-   **States:**
    1.  `SEEKING_FLOWER`: The bee searches for a flower with nectar. This includes visually scanning for nearby flowers and checking its birth hive's memory of known flower locations. If it can't find a flower, it will `wander()` to explore new areas.
    2.  `GATHERING_NECTAR`: Once at a flower, the bee enters a countdown state to collect nectar.
    3.  `RETURN_TO_HIVE`: With a full load of nectar, the bee returns to a hive to deposit its resources.

-   **Hive Selection Intelligence:** The `returnToHive` logic is dynamic:
    -   **Low Population:** If the total bee population is below the `BEE_POPULATION_THRESHOLD`, bees return to the *closest* hive. This ensures reproductive efficiency when the colony is small.
    -   **High Population:** When the population is healthy, bees use a "Hive Score" to choose their destination. This score prioritizes hives that are **closer**, have **fewer bees currently en route**, and are **less threatened by nearby birds**. This behavior encourages bees to spread out, balancing risk and efficiency.

-   **Reproduction ([`js/main.js`](js/main.js)):** When a hive accumulates enough nectar, it creates two new bees. The offspring's DNA is based on the averaged DNA of all bees that contributed nectar, plus a chance of mutation.

## Bird Behavior ([`js/boids/bird.js`](js/boids/bird.js))

Birds are the predators of the ecosystem. Their behavior is also state-driven.

-   **States:**
    1.  `HUNTING`: The bird actively seeks out and chases the nearest bee within its visual range. If no prey is in sight, it will still apply flocking rules, effectively following its flockmates to search for food.
    2.  `SEEKING_MATE`: After catching enough bees (`BEES_FOR_NEW_BIRD`), the bird attempts to reproduce.
    3.  `GO_TO_NEST`: Once paired with a mate and having claimed a nest, the bird travels to the nest to lay an egg.

-   **Reproduction and Nesting:** The bird reproduction cycle is a multi-step process:
    1.  A bird first checks if the world population is below the `MAX_BIRDS` limit. If not, it returns to hunting, incurring a "cost" by resetting its `beesCaught` counter.
    2.  If there is space, it searches for a potential partner that is also in the `SEEKING_MATE` state.
    3.  Once a partner is found, the pair searches for an available nest.
    4.  When a pair finds and claims a nest, they set `isAvailable` to `false`.
    5.  Both birds fly to the nest. When both have arrived, they begin a nesting countdown.
    6.  An egg is laid, which starts a hatching countdown.
    7.  When the egg hatches, a new bird is born, and the nest becomes available again (`isAvailable = true`).
