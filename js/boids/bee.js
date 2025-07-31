import { Boid } from './boid.js';

export class Bee extends Boid {
    constructor(x, y, settings, hive, dna) {
        super(x, y, { ...settings, ...dna });
        this.hive = hive;
        this.dna = dna;
        this.state = 'SEEKING_FLOWER'; // SEEKING_FLOWER, GATHERING_NECTAR, RETURN_TO_HIVE
        this.nectar = 0;
        this.targetFlower = null;
        this.gatheringCountdown = 0;
    }

    update(world) {
        super.update({ ...world, boids: world.bees });

        const localPredators = world.birdGrid.query(this);
        const evade = this.evade(localPredators);
        this.velocity.x += evade.x * this.settings.evadeFactor;
        this.velocity.y += evade.y * this.settings.evadeFactor;

        switch (this.state) {
            case 'SEEKING_FLOWER':
                this.seekFlower(world.flowers);
                break;
            case 'GATHERING_NECTAR':
                this.gatherNectar();
                break;
            case 'RETURN_TO_HIVE':
                this.returnToHive();
                break;
        }
    }

    findBestFlower(flowers) {
        let bestFlower = null;
        let bestScore = -1;

        for (const flower of flowers) {
            if (flower.nectar >= 1) {
                const dist = Math.hypot(this.position.x - flower.position.x, this.position.y - flower.position.y);
                if (dist < this.settings.visualRange) {
                    // Score is nectar amount divided by distance squared (to heavily prioritize closer flowers)
                    const score = flower.nectar / (dist * dist + 1);
                    if (score > bestScore) {
                        bestScore = score;
                        bestFlower = flower;
                    }
                }
            }
        }
        return bestFlower;
    }

    seekFlower(flowers) {
        // Find a new target if the current one is gone or empty
        if (!this.targetFlower || this.targetFlower.nectar < 1) {
            this.targetFlower = this.findBestFlower(flowers);
        }

        if (this.targetFlower) {
            const dist = Math.hypot(this.position.x - this.targetFlower.position.x, this.position.y - this.targetFlower.position.y);
            if (dist < 5) { // Arrived at flower
                this.state = 'GATHERING_NECTAR';
                this.gatheringCountdown = this.settings.gatherTime;
                this.velocity = { x: 0, y: 0 }; // Stop moving while gathering
            } else {
                // Steer towards the target flower
                const steer = {
                    x: this.targetFlower.position.x - this.position.x,
                    y: this.targetFlower.position.y - this.position.y
                };
                this.velocity.x += steer.x * 0.001;
                this.velocity.y += steer.y * 0.001;
            }
        }
    }

    gatherNectar() {
        this.gatheringCountdown--;
        if (this.gatheringCountdown <= 0) {
            // Collect a bulk amount of nectar
            const nectarToTake = Math.min(
                this.targetFlower.nectar, // what the flower has
                this.settings.nectarCapacity - this.nectar // how much space the bee has
            );

            this.nectar += nectarToTake;
            this.targetFlower.nectar -= nectarToTake;
            this.targetFlower = null; // Forget this flower

            // Decide what to do next
            if (this.nectar >= this.settings.nectarCapacity) {
                this.state = 'RETURN_TO_HIVE';
            } else {
                this.state = 'SEEKING_FLOWER';
            }
        }
    }

    returnToHive() {
        const dist = Math.hypot(this.position.x - this.hive.position.x, this.position.y - this.hive.position.y);
        if (dist < 10) { // Arrived at hive
            this.hive.nectar += this.nectar;
            this.hive.contributorCount++;
            for (const key in this.dna) {
                this.hive.dnaPool[key] += this.dna[key];
            }
            this.nectar = 0;
            this.state = 'SEEKING_FLOWER';
        } else {
            // Use the stronger returnFactor for a more urgent return
            const steer = {
                x: this.hive.position.x - this.position.x,
                y: this.hive.position.y - this.position.y
            };
            this.velocity.x += steer.x * this.settings.returnFactor;
            this.velocity.y += steer.y * this.settings.returnFactor;
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