import { Boid } from './boid.js';

export class Bee extends Boid {
    constructor(x, y, settings, hive, dna) {
        super(x, y, { ...settings, ...dna });
        this.hive = hive;
        this.dna = dna;
        this.state = 'SEEKING_FLOWER';
        this.nectar = 0;
        this.targetFlower = null;
    }

    update(world) {
        // Pass the world and a specific list of boids (all bees) to the parent update method
        super.update({ ...world, boids: world.bees });

        // Use the bird grid to find local predators to evade
        const localPredators = world.birdGrid.query(this);
        const evade = this.evade(localPredators);
        this.velocity.x += evade.x * this.settings.evadeFactor;
        this.velocity.y += evade.y * this.settings.evadeFactor;

        if (this.state === 'SEEKING_FLOWER') {
            this.seekFlower(world.flowers);
            if (this.nectar >= this.settings.nectarCapacity) {
                this.state = 'RETURN_TO_HIVE';
                this.targetFlower = null;
            }
        } else if (this.state === 'RETURN_TO_HIVE') {
            this.returnToHive();
        }
    }

    findClosest(entities) {
        let closest = null;
        let closestDist = Infinity;
        for (const entity of entities) {
            const dist = Math.hypot(this.position.x - entity.position.x, this.position.y - entity.position.y);
            if (dist < closestDist && dist < this.settings.visualRange) {
                closest = entity;
                closestDist = dist;
            }
        }
        return { closest, closestDist };
    }

    seekFlower(flowers) {
        if (!this.targetFlower || this.targetFlower.nectar < 1) {
            const validFlowers = flowers.filter(f => f.nectar >= 1);
            const { closest } = this.findClosest(validFlowers);
            this.targetFlower = closest;
        }

        if (this.targetFlower) {
            const dist = Math.hypot(this.position.x - this.targetFlower.position.x, this.position.y - this.targetFlower.position.y);
            if (dist < 5) {
                this.nectar++;
                this.targetFlower.nectar--;
            } else {
                const steer = {
                    x: this.targetFlower.position.x - this.position.x,
                    y: this.targetFlower.position.y - this.position.y
                };
                this.velocity.x += steer.x * 0.001;
                this.velocity.y += steer.y * 0.001;
            }
        }
    }

    returnToHive() {
        const dist = Math.hypot(this.position.x - this.hive.position.x, this.position.y - this.hive.position.y);
        if (dist < 10) {
            this.hive.nectar += this.nectar;
            this.hive.contributorCount++;
            for (const key in this.dna) {
                this.hive.dnaPool[key] += this.dna[key];
            }
            this.nectar = 0;
            this.state = 'SEEKING_FLOWER';
        } else {
            const steer = {
                x: this.hive.position.x - this.position.x,
                y: this.hive.position.y - this.position.y
            };
            this.velocity.x += steer.x * 0.002;
            this.velocity.y += steer.y * 0.002;
        }
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