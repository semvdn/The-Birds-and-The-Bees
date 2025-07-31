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
        this.lastVisitedFlower = null; // Remember the last flower for the waggle dance
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
        // If the bee has no target, try to get one from the hive's shared knowledge
        if (!this.targetFlower && this.hive.knownFlowerLocations.length > 0) {
            // Pick a random known location to avoid all bees swarming the same flower
            const knownFlower = this.hive.knownFlowerLocations[Math.floor(Math.random() * this.hive.knownFlowerLocations.length)];
            // Check if the known flower still exists and has nectar
            if (knownFlower && knownFlower.nectar >= 1) {
                this.targetFlower = knownFlower;
            }
        }
        
        // If there's still no target, or the target is empty, search locally
        if (!this.targetFlower || this.targetFlower.nectar < 1) {
            this.targetFlower = this.findBestFlower(flowers);
        }

        if (this.targetFlower) {
            const dist = Math.hypot(this.position.x - this.targetFlower.position.x, this.position.y - this.targetFlower.position.y);
            if (dist < 5) { // Arrived at flower
                this.state = 'GATHERING_NECTAR';
                this.gatheringCountdown = this.settings.gatherTime;
                this.velocity = { x: 0, y: 0 }; 
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

    gatherNectar() {
        this.gatheringCountdown--;
        if (this.gatheringCountdown <= 0) {
            const nectarToTake = Math.min(
                this.targetFlower.nectar,
                this.settings.nectarCapacity - this.nectar
            );

            this.nectar += nectarToTake;
            this.targetFlower.nectar -= nectarToTake;
            this.lastVisitedFlower = this.targetFlower; // Remember this flower
            this.targetFlower = null; 

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
            
            // **Waggle Dance**: Share the location of the last visited flower
            if (this.lastVisitedFlower && this.lastVisitedFlower.nectar > 0) {
                // Add to hive's knowledge if not already there
                if (!this.hive.knownFlowerLocations.includes(this.lastVisitedFlower)) {
                    this.hive.knownFlowerLocations.push(this.lastVisitedFlower);
                    // Limit the size of the known locations to avoid old data
                    if (this.hive.knownFlowerLocations.length > 5) {
                        this.hive.knownFlowerLocations.shift(); // Remove the oldest entry
                    }
                }
            }
            this.lastVisitedFlower = null;

            this.state = 'SEEKING_FLOWER';
        } else {
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