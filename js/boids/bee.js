import { Boid } from './boid.js';

export class Bee extends Boid {
    constructor(x, y, settings, hive, dna) {
        super(x, y, { ...settings, ...dna });
        this.hive = hive; // The hive this bee was born in.
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
                this.seekFlower(world.flowers, world.hives);
                break;
            case 'GATHERING_NECTAR':
                this.gatherNectar();
                break;
            case 'RETURN_TO_HIVE':
                this.returnToHive(world.hives);
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

    findBestKnownFlower(hives) {
        let closestHive = null;
        let minDistance = Infinity;

        // First, find the hive closest to the bee to get information from.
        for (const hive of hives) {
            const dist = Math.hypot(this.position.x - hive.position.x, this.position.y - hive.position.y);
            if (dist < minDistance) {
                minDistance = dist;
                closestHive = hive;
            }
        }
        
        if (!closestHive) return null;

        let bestFlower = null;
        let bestScore = -1;

        // Now, search for the best flower known by that closest hive.
        for (const flower of closestHive.knownFlowerLocations) {
            if (flower === this.lastVisitedFlower) continue;
            if (flower.beesOnFlower >= 10) continue;
            if (!flower.vanished && flower.petalPoints.some(p => p.nectar >= 1)) {
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

    seekFlower(flowers, hives) {
        if (this.targetFlower && (this.targetFlower.vanished || !this.targetFlower.petalPoints.some(p => p.nectar >= 1))) {
            this.targetFlower = null;
            if (this.targetPetal) {
                this.targetPetal.occupied = false;
                this.targetPetal = null;
            }
        }

        if (!this.targetFlower) {
            const bestLocalFlower = this.findBestFlower(flowers);
            if (bestLocalFlower) {
                this.targetFlower = bestLocalFlower;
            } else {
                const bestKnownFlower = this.findBestKnownFlower(hives);
                if (bestKnownFlower) {
                    this.targetFlower = bestKnownFlower;
                }
            }
        }

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

                desired.x = (desired.x / dist) * magnitude;
                desired.y = (desired.y / dist) * magnitude;

                const steer = {
                    x: desired.x - this.velocity.x,
                    y: desired.y - this.velocity.y
                };

                const steerMagnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
                if (steerMagnitude > this.settings.maxForce) {
                    steer.x = (steer.x / steerMagnitude) * this.settings.maxForce;
                    steer.y = (steer.y / steerMagnitude) * this.settings.maxForce;
                }

                this.velocity.x += steer.x;
                this.velocity.y += steer.y;
            }
        }
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

    returnToHive(hives) {
        let closestHive = null;
        let minDistance = Infinity;

        // Find the closest hive to return to.
        for (const hive of hives) {
            const dist = Math.hypot(this.position.x - hive.position.x, this.position.y - hive.position.y);
            if (dist < minDistance) {
                minDistance = dist;
                closestHive = hive;
            }
        }

        if (!closestHive) {
            this.state = 'SEEKING_FLOWER'; // Fallback if no hives exist
            return;
        }

        // Check if we have arrived at the closest hive.
        if (minDistance < 10) {
            closestHive.nectar += this.nectar;
            closestHive.contributorCount++;
            for (const key in this.dna) {
                closestHive.dnaPool[key] += this.dna[key];
            }
            this.nectar = 0;
            
            // Share knowledge of the last visited flower with this hive.
            if (this.lastVisitedFlower && this.lastVisitedFlower.nectar > 0) {
                if (!closestHive.knownFlowerLocations.includes(this.lastVisitedFlower)) {
                    closestHive.knownFlowerLocations.push(this.lastVisitedFlower);
                    if (closestHive.knownFlowerLocations.length > 20) {
                        closestHive.knownFlowerLocations.shift();
                    }
                }
            }
            this.lastVisitedFlower = null;
            this.state = 'SEEKING_FLOWER';

        } else {
            // Steer towards the closest hive.
            const steer = {
                x: closestHive.position.x - this.position.x,
                y: closestHive.position.y - this.position.y
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