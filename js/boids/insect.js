import { Boid } from './boid.js';

export class Insect extends Boid {
    constructor(x, y, settings) {
        super(x, y, settings);
    }

    update(boids, predators, prey, canvas) {
        super.update(boids, predators, prey, canvas);

        const evade = this.evade(predators);
        this.velocity.x += evade.x * this.settings.evadeFactor;
        this.velocity.y += evade.y * this.settings.evadeFactor;
    }

    evade(predators) {
        const steering = { x: 0, y: 0 };
        for (const predator of predators) {
            const distance = Math.hypot(this.position.x - predator.position.x, this.position.y - predator.position.y);
            if (distance < this.settings.visualRange) {
                steering.x += this.position.x - predator.position.x;
                steering.y += this.position.y - predator.position.y;
            }
        }
        return steering;
    }
}