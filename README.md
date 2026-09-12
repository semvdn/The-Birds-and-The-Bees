# The Birds and the Bees

https://github.com/user-attachments/assets/569e8df0-070e-4829-a4e1-db264eacd99b

**The Birds and the Bees** is a browser-based artificial-life simulation in which evolving bird predators and bee prey interact inside a procedurally generated L-system forest. Local flocking rules, resource competition, predation, reproduction, mutation, and heritable appearance combine to produce population-level behavior without a scripted global controller.

**[Open the live simulation](https://semvdn.github.io/The-Birds-and-The-Bees/)**

## What is being simulated?

- **Boid dynamics:** birds and bees use separation, alignment, and cohesion, with evolvable behavioral parameters.
- **Predator-prey pressure:** birds hunt bees for the energy required to reproduce; bees evolve evasive behavior and account for predator pressure when choosing a hive.
- **Resource-driven reproduction:** bees gather nectar from flowers and contribute both resources and DNA to hive-level reproduction. Birds must successfully hunt, find a mate, claim a nest, and hatch an egg.
- **Heritable variation:** behavioral DNA is blended and mutated between generations. Bird body geometry and color are also inherited, interpolated, and mutated.
- **Procedural ecology:** trees, shrubs, weeds, flowers, nest sites, and hive sites are generated from stochastic L-systems.
- **Live observability:** population and trait-history panels expose the dynamics while the simulation is running.

## Controls

- **`M`** — toggle population and trait statistics.
- **`P`** — toggle performance and simulation settings.
- **Touch devices** — use the hamburger menu to open either panel.

The settings panel can change population caps, target render FPS, wind strength, and bird/bee speed multipliers. Settings are persisted in local storage.

## Run locally

The project has no build step. Install the development dependency and start the local static server through npm:

```bash
npm install
npm run dev
```

Then open `http://localhost:8000` in a modern browser. The `dev` script serves the repository directly with `http-server`; GitHub Pages likewise serves the source without a bundling step.

## Tests

The regression suite uses Node's built-in test runner:

```bash
npm test
```

Node 20 or newer is recommended. GitHub Actions runs the same suite on pushes to `main` and on pull requests.

## Documentation

- [`Boids.md`](Documentation/Boids.md) — flocking, agent state machines, predation, and reproduction.
- [`Evolution.md`](Documentation/Evolution.md) — behavioral inheritance, mutation, and selection pressure.
- [`Appearance.md`](Documentation/Appearance.md) — heritable bird geometry and color.
- [`Plants.md`](Documentation/Plants.md) — stochastic L-systems and plant pre-rendering.

## Repository layout

```text
js/
  boids/        agent behavior, spatial grid, and rendering
  genetics.js  inheritance and mutation logic
  main.js       world lifecycle, reproduction, UI, and statistics
Documentation/  mechanism-focused project notes
tests/          deterministic regression tests
```

## License

MIT. See [`LICENSE`](LICENSE).
