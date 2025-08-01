import { Boid } from './boid.js';

export class Bee extends Boid {
    constructor(x, y, settings, hive, dna) {
        super(x, y, { ...settings, ...dna });
        this.hive = hive;
        this.dna = dna;
        this.state = 'SEEKING_FLOWER'; // SEEKING_FLOWER, GATHERING_NECTAR, RETURN_TO_HIVE
        this.nectar = 0;
        this.targetFlower = null;
        this.targetPetal = null;
        this.gatheringCountdown = 0;
        this.lastVisitedFlower = null;
        this.wanderAngle = Math.random() * 2 * Math.PI;
    }

    update(world) {
        // Run universal life/death/fall checks. If not active, stop.
        if (!super.update(world)) {
            if (this.targetPetal) {
                this.targetPetal.occupied = false;
                this.targetFlower.beesOnFlower--;
                this.targetPetal = null;
            }
            return;
        }

        // Apply standard boid movement rules (flocking, etc.)
        const localBoids = world.beeGrid.query(this);
        this.applyBoidRules(world, localBoids);

        // Apply bee-specific behaviors
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
            if (flower === this.lastVisitedFlower) continue;
            if (flower.beesOnFlower >= 10) continue;
            if (flower.petalPoints.some(p => p.nectar >= 1)) {
                const dist = Math.hypot(this.position.x - flower.position.x, this.position.y - flower.position.y);
                if (dist < this.settings.visualRange) {
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
        const steer = {
            x: Math.cos(this.wanderAngle),
            y: Math.sin(this.wanderAngle)
        };
        this.velocity.x += steer.x * 0.1;
        this.velocity.y += steer.y * 0.1;
    }

    findBestKnownFlower() {
        let bestFlower = null;
        let bestScore = -1;

        for (const flower of this.hive.knownFlowerLocations) {
            if (flower === this.lastVisitedFlower) continue;
            if (flower.beesOnFlower >= 10) continue;
            if (!flower.vanished && flower.petalPoints.some(p => p.nectar >= 1)) {
                const dist = Math.hypot(this.position.x - flower.position.x, this.position.y - flower.position.y);
                // We don't check visual range for known flowers
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
        // 1a. If the bee has a targetFlower, first check if it has vanished or run out of nectar.
        if (this.targetFlower && (this.targetFlower.vanished || !this.targetFlower.petalPoints.some(p => p.nectar >= 1))) {
            this.targetFlower = null;
            if (this.targetPetal) {
                this.targetPetal.occupied = false;
                this.targetPetal = null;
            }
        }

        // 1b. If the bee does not have a targetFlower:
        if (!this.targetFlower) {
            // i. First, call this.findBestFlower(flowers) to search for a flower in the immediate vicinity.
            const bestLocalFlower = this.findBestFlower(flowers);
            if (bestLocalFlower) {
                this.targetFlower = bestLocalFlower;
            } else {
                // ii. If no flower is found nearby, call your new this.findBestKnownFlower() method.
                const bestKnownFlower = this.findBestKnownFlower();
                if (bestKnownFlower) {
                    this.targetFlower = bestKnownFlower;
                }
            }
        }

        // 1c. If the bee has a valid targetFlower (either pre-existing or newly found), execute the existing logic to move towards it.
        if (this.targetFlower) {
            if (!this.targetPetal) {
                let foundPetal = false;
                for (const petal of this.targetFlower.petalPoints) {
                    if (!petal.occupied && petal.nectar >= 1) {
                        this.targetPetal = petal;
                        this.targetPetal.occupied = true;
                        this.targetFlower.beesOnFlower++;
                        foundPetal = true;
                        break;
                    }
                }
                if (!foundPetal) {
                    this.targetFlower = null;
                    this.targetPetal = null;
                    this.wander();
                    return;
                }
            }

            const desired = {
                x: this.targetPetal.x - this.position.x,
                y: this.targetPetal.y - this.position.y
            };
            const dist = Math.sqrt(desired.x * desired.x + desired.y * desired.y);

            if (dist < 2) {
                this.state = 'GATHERING_NECTAR';
                this.gatheringCountdown = this.settings.gatherTime;
                this.velocity = { x: 0, y: 0 };
            } else {
                let magnitude = this.settings.maxSpeed;
                if (dist < 50) {
                    magnitude = (dist / 50) * this.settings.maxSpeed;
                }

                // Normalize desired
                desired.x = (desired.x / dist) * magnitude;
                desired.y = (desired.y / dist) * magnitude;

                const steer = {
                    x: desired.x - this.velocity.x,
                    y: desired.y - this.velocity.y
                };

                // Limit steer force
                const steerMagnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
                if (steerMagnitude > this.settings.maxForce) {
                    steer.x = (steer.x / steerMagnitude) * this.settings.maxForce;
                    steer.y = (steer.y / steerMagnitude) * this.settings.maxForce;
                }

                this.velocity.x += steer.x;
                this.velocity.y += steer.y;
            }
        }
        // 1d. If, after all checks, the bee still has no targetFlower, call the new this.wander() method to begin exploring.
        else {
            this.wander();
        }
    }

    gatherNectar() {
        if (!this.targetPetal || this.targetPetal.nectar <= 0) {
            if (this.targetPetal) {
                this.targetPetal.occupied = false;
                this.targetFlower.beesOnFlower--;
            }
            this.targetPetal = null;
            this.targetFlower = null;
            this.state = 'SEEKING_FLOWER';
            return;
        }

        this.gatheringCountdown--;

        const nectarToTake = Math.min(
            this.targetPetal.nectar,
            (this.settings.nectarCapacity - this.nectar),
            0.05 // Max nectar per frame
        );

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

            if (this.nectar >= this.settings.nectarCapacity) {
                this.state = 'RETURN_TO_HIVE';
            } else {
                this.state = 'SEEKING_FLOWER';
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
            
            if (this.lastVisitedFlower && this.lastVisitedFlower.nectar > 0) {
                if (!this.hive.knownFlowerLocations.includes(this.lastVisitedFlower)) {
                    this.hive.knownFlowerLocations.push(this.lastVisitedFlower);
                    if (this.hive.knownFlowerLocations.length > 20) {
                        this.hive.knownFlowerLocations.shift();
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