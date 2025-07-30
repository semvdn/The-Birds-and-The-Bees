import { Boid } from './boid.js';

export class Bird extends Boid {
    constructor(x, y, settings) {
        super(x, y, settings);
    }

    update(boids, predators, prey, canvas) {
        super.update(boids, predators, prey, canvas);

        const hunt = this.hunt(prey);
        this.velocity.x += hunt.x * this.settings.huntFactor;
        this.velocity.y += hunt.y * this.settings.huntFactor;
    }

    hunt(prey) {
        const steering = { x: 0, y: 0 };
        let closestDistance = Infinity;
        let closestPrey = null;

        for (const p of prey) {
            if (p.isAlive) {
                const distance = Math.hypot(this.position.x - p.position.x, this.position.y - p.position.y);
                if (distance < closestDistance && distance < this.settings.visualRange) {
                    closestDistance = distance;
                    closestPrey = p;
                }
            }
        }

        if (closestPrey) {
            if (closestDistance < this.settings.killRange) {
                closestPrey.isAlive = false; 
            } else {
                steering.x = closestPrey.position.x - this.position.x;
                steering.y = closestPrey.position.y - this.position.y;
            }
        }
        return steering;
    }
}