import { Boid } from './boid.js';
import { BEE_POPULATION_THRESHOLD, HIVE_DANGER_RADIUS, HIVE_DANGER_WEIGHT } from '../presets.js';
import { preRenderBee } from '../boids/drawing.js';

export class Bee extends Boid {
    constructor(x, y, settings, hive, dna) {
        super(x, y, { ...settings, ...dna });
        this.hive = hive; // The bee's birth hive
        this.dna = dna;
        this.state = 'SEEKING_FLOWER'; // SEEKING_FLOWER, GATHERING_NECTAR, RETURN_TO_HIVE
        this.nectar = 0;
        this.targetFlower = null;
        this.targetPetal = null;
        this.gatheringCountdown = 0;
        this.lastVisitedFlower = null;
        this.wanderAngle = Math.random() * 2 * Math.PI;
        this.targetHive = null; // The hive this bee is currently returning to

        preRenderBee(this); // Pre-render the bee sprite on creation
    }

    update(world) {
        // Run universal life/death/fall checks. If not active, stop.
        if (!super.update(world)) {
            // If the bee dies while en route to a hive, it should free up its "spot".
            if (this.targetHive) {
                this.targetHive.beesEnRoute--;
                this.targetHive = null;
            }
            if (this.targetPetal) {
                this.targetPetal.occupied = false;
                this.targetFlower.beesOnFlower--;
                this.targetPetal = null;
            }
            return;
        }

        const localBoids = world.beeGrid.query(this);
        this.applyBoidRules(world, localBoids);

        const localPredators = world.birdGrid.query(this);
        const evade = this.evade(localPredators);
        this.velocity.x += evade.x * this.dna.evadeFactor;
        this.velocity.y += evade.y * this.dna.evadeFactor;

        switch (this.state) {
            case 'SEEKING_FLOWER':
                this.seekFlower(world.flowers);
                break;
            case 'GATHERING_NECTAR':
                this.gatherNectar();
                break;
            case 'RETURN_TO_HIVE':
                this.returnToHive(world);
                break;
        }
    }

    findBestFlower(flowers) {
        let bestFlower = null;
        let bestScore = -1;
        for (const flower of flowers) {
            if (flower === this.lastVisitedFlower || flower.beesOnFlower >= 10) continue;
            if (flower.petalPoints.some(p => p.nectar >= 1)) {
                const dist = Math.hypot(this.position.x - flower.position.x, this.position.y - flower.position.y);
                if (dist < this.dna.visualRange) {
                    const score = flower.petalPoints.reduce((acc, p) => acc + p.nectar, 0) / (dist * dist + 1);
                    if (score > bestScore) {
                        bestScore = score;
                        bestFlower = flower;
                    }
                }
            }
        }
        return bestFlower;
    }

    wander() {
        this.wanderAngle += (Math.random() - 0.5) * 0.5;
        this.velocity.x += Math.cos(this.wanderAngle) * 0.1;
        this.velocity.y += Math.sin(this.wanderAngle) * 0.1;
    }

    findBestKnownFlower() {
        let bestFlower = null;
        let bestScore = -1;
        for (const flower of this.hive.knownFlowerLocations) {
            if (flower === this.lastVisitedFlower || flower.beesOnFlower >= 10 || flower.vanished) continue;
            if (flower.petalPoints.some(p => p.nectar >= 1)) {
                const dist = Math.hypot(this.position.x - flower.position.x, this.position.y - flower.position.y);
                const score = flower.petalPoints.reduce((acc, p) => acc + p.nectar, 0) / (dist * dist + 1);
                if (score > bestScore) {
                    bestScore = score;
                    bestFlower = flower;
                }
            }
        }
        return bestFlower;
    }

    seekFlower(flowers) {
        if (this.targetFlower && (this.targetFlower.vanished || !this.targetFlower.petalPoints.some(p => p.nectar >= 1))) {
            this.targetFlower = null;
            if (this.targetPetal) {
                this.targetPetal.occupied = false;
                this.targetPetal = null;
            }
        }

        if (!this.targetFlower) {
            const bestLocalFlower = this.findBestFlower(flowers);
            if (bestLocalFlower) { this.targetFlower = bestLocalFlower; }
            else {
                const bestKnownFlower = this.findBestKnownFlower();
                if (bestKnownFlower) { this.targetFlower = bestKnownFlower; }
            }
        }

        if (this.targetFlower) {
            if (!this.targetPetal) {
                const availablePetal = this.targetFlower.petalPoints.find(p => !p.occupied && p.nectar >= 1);
                if (availablePetal) {
                    this.targetPetal = availablePetal;
                    this.targetPetal.occupied = true;
                    this.targetFlower.beesOnFlower++;
                } else {
                    this.targetFlower = null; this.wander(); return;
                }
            }
            const desired = { x: this.targetPetal.x - this.position.x, y: this.targetPetal.y - this.position.y };
            const dist = Math.hypot(desired.x, desired.y);
            if (dist < 2) {
                this.state = 'GATHERING_NECTAR';
                this.gatheringCountdown = this.settings.gatherTime;
                this.velocity = { x: 0, y: 0 };
            } else {
                let magnitude = this.settings.maxSpeed;
                if (dist < 50) { magnitude = (dist / 50) * this.settings.maxSpeed; }
                desired.x = (desired.x / dist) * magnitude;
                desired.y = (desired.y / dist) * magnitude;
                const steer = { x: desired.x - this.velocity.x, y: desired.y - this.velocity.y };
                const steerMagnitude = Math.hypot(steer.x, steer.y);
                if (steerMagnitude > this.settings.maxForce) {
                    steer.x = (steer.x / steerMagnitude) * this.settings.maxForce;
                    steer.y = (steer.y / steerMagnitude) * this.settings.maxForce;
                }
                this.velocity.x += steer.x;
                this.velocity.y += steer.y;
            }
        } else {
            this.wander();
        }
    }

    gatherNectar() {
        if (!this.targetPetal || this.targetPetal.nectar <= 0) {
            if (this.targetPetal) {
                this.targetPetal.occupied = false;
                this.targetFlower.beesOnFlower--;
            }
            this.targetPetal = null; this.targetFlower = null;
            this.state = 'SEEKING_FLOWER'; return;
        }
        this.gatheringCountdown--;
        const nectarToTake = Math.min(this.targetPetal.nectar, (this.settings.nectarCapacity - this.nectar), 0.05);
        this.nectar += nectarToTake;
        this.targetPetal.nectar -= nectarToTake;
        this.energy = Math.min(this.settings.initialEnergy, this.energy + this.settings.energyFromNectar);
        if (this.gatheringCountdown <= 0 || this.nectar >= this.settings.nectarCapacity || this.targetPetal.nectar <= 0) {
            this.lastVisitedFlower = this.targetFlower;
            if (this.targetPetal) {
                this.targetPetal.occupied = false;
                this.targetFlower.beesOnFlower--;
                this.targetPetal = null;
            }
            this.targetFlower = null;
            this.state = this.nectar >= this.settings.nectarCapacity ? 'RETURN_TO_HIVE' : 'SEEKING_FLOWER';
        }
    }

    returnToHive(world) {
        if (!this.targetHive) {
            // --- HIVE SELECTION LOGIC ---
            let bestHive = null;
            // If population is low, use simple "closest hive" logic for efficiency
            if (world.bees.length < BEE_POPULATION_THRESHOLD) {
                let minDistance = Infinity;
                for (const hive of world.hives) {
                    const distance = Math.hypot(this.position.x - hive.position.x, this.position.y - hive.position.y);
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestHive = hive;
                    }
                }
            } else {
                // If population is healthy, use a score-based system
                let maxScore = -Infinity;
                for (const hive of world.hives) {
                    const distance = Math.hypot(this.position.x - hive.position.x, this.position.y - hive.position.y);
                    
                    // Count birds near the hive to determine danger level
                    let danger = 0;
                    for (const bird of world.birds) {
                        if (bird.isAlive) {
                            const birdDist = Math.hypot(hive.position.x - bird.position.x, hive.position.y - bird.position.y);
                            if (birdDist < HIVE_DANGER_RADIUS) {
                                danger++;
                            }
                        }
                    }

                    // Score = (1 / distance) * (1 / occupancy) * (1 / danger)
                    // We add 1 to denominators to avoid division by zero
                    const score = (1 / (distance + 1)) * (1 / (1 + hive.beesEnRoute)) * (1 / (1 + danger * HIVE_DANGER_WEIGHT));

                    if (score > maxScore) {
                        maxScore = score;
                        bestHive = hive;
                    }
                }
            }
            this.targetHive = bestHive;
            if (this.targetHive) {
                this.targetHive.beesEnRoute++;
            }
        }
        
        if (!this.targetHive) {
            this.state = 'SEEKING_FLOWER';
            return;
        }

        const dist = Math.hypot(this.position.x - this.targetHive.position.x, this.position.y - this.targetHive.position.y);
        if (dist < 10) {
            this.targetHive.nectar += this.nectar;
            this.targetHive.contributorCount++;
            for (const key in this.dna) {
                this.targetHive.dnaPool[key] += this.dna[key];
            }
            this.nectar = 0;
            if (this.lastVisitedFlower && !this.targetHive.knownFlowerLocations.includes(this.lastVisitedFlower)) {
                this.targetHive.knownFlowerLocations.push(this.lastVisitedFlower);
                if (this.targetHive.knownFlowerLocations.length > 20) {
                    this.targetHive.knownFlowerLocations.shift();
                }
            }
            this.targetHive.beesEnRoute--;
            this.targetHive = null;
            this.lastVisitedFlower = null;
            this.state = 'SEEKING_FLOWER';
        } else {
            const steer = { x: this.targetHive.position.x - this.position.x, y: this.targetHive.position.y - this.position.y };
            this.velocity.x += steer.x * this.dna.returnFactor;
            this.velocity.y += steer.y * this.dna.returnFactor;
        }
    }

    evade(predators) {
        const steering = { x: 0, y: 0 };
        for (const predator of predators) {
            const distance = Math.hypot(this.position.x - predator.position.x, this.position.y - predator.position.y);
            if (distance < this.dna.visualRange) {
                steering.x += this.position.x - predator.position.x;
                steering.y += this.position.y - predator.position.y;
            }
        }
        return steering;
    }
}