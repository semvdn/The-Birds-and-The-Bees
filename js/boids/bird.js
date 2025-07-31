import { Boid } from './boid.js';
import { NEST_SETTINGS } from '../presets.js';

export class Bird extends Boid {
    constructor(x, y, settings, nest, genes, dna) {
        super(x, y, { ...settings, ...dna });
        this.homeNest = nest;
        this.matingNest = null;
        this.beesCaught = 0;
        this.partner = null;
        this.state = 'HUNTING';
        this.genes = genes;
        this.dna = dna;
    }

    update(world) {
        super.update({ ...world, boids: world.birds });

        switch (this.state) {
            case 'HUNTING':
                const localPrey = world.beeGrid.query(this);
                
                // 1. Steer towards the best target
                const hunt = this.hunt(localPrey);
                this.velocity.x += hunt.x * this.settings.huntFactor;
                this.velocity.y += hunt.y * this.settings.huntFactor;

                // 2. Check for a catch against any nearby prey
                this.checkCatch(localPrey);

                if (this.beesCaught >= NEST_SETTINGS.BEES_FOR_NEW_BIRD) {
                    this.state = 'SEEKING_MATE';
                }
                break;
            
            case 'SEEKING_MATE':
                const localMates = world.birdGrid.query(this);
                this.findPartner(localMates);
                this.velocity.x += (Math.random() - 0.5) * 0.1;
                this.velocity.y += (Math.random() - 0.5) * 0.1;
                break;

            case 'PAIRED':
                this.state = 'GO_TO_NEST';
                break;

            case 'GO_TO_NEST':
                this.goToNest();
                break;
        }
    }

    /**
     * A robust check to see if a bee has been caught.
     * This iterates through all nearby prey and uses an expanded hitbox based on velocity
     * to prevent "tunneling" where a fast bird passes through a bee between frames.
     * @param {Bee[]} prey - An array of nearby bees to check against.
     */
    checkCatch(prey) {
        for (const p of prey) {
            if (p.isAlive) {
                const distance = Math.hypot(this.position.x - p.position.x, this.position.y - p.position.y);
                
                // Calculate an effective kill range that projects slightly forward based on speed.
                // This prevents the bird from passing through the bee in a single frame.
                const currentSpeed = Math.hypot(this.velocity.x, this.velocity.y);
                const effectiveKillRange = this.settings.killRange + (currentSpeed * 0.5); // The 0.5 is a tuning factor

                if (distance < effectiveKillRange) {
                    p.isAlive = false;
                    this.beesCaught++;
                    // A bird can only catch one bee per frame, so we exit after a successful catch.
                    return;
                }
            }
        }
    }

    findPartner(birds) {
        for (const other of birds) {
            if (other !== this && !other.partner && other.state === 'SEEKING_MATE') {
                const distance = Math.hypot(this.position.x - other.position.x, this.position.y - other.position.y);
                if (distance < this.settings.visualRange) {
                    this.partner = other; other.partner = this;
                    this.state = 'PAIRED'; other.state = 'PAIRED';
                    if (!this.homeNest.hasEgg) {
                        this.matingNest = this.homeNest; other.matingNest = this.homeNest;
                    } else if (!other.homeNest.hasEgg) {
                        this.matingNest = other.homeNest; other.matingNest = other.homeNest;
                    } else {
                        this.resetMating(); other.resetMating();
                    }
                    break;
                }
            }
        }
    }

    goToNest() {
        if (!this.matingNest) { this.resetMating(); return; }
        if (this.matingNest.hasEgg) { this.resetMating(); return; }

        const dist = Math.hypot(this.position.x - this.matingNest.position.x, this.position.y - this.matingNest.position.y);
        if (dist < 15) {
            this.matingNest.occupants.add(this);
        } else {
            const steer = { x: this.matingNest.position.x - this.position.x, y: this.matingNest.position.y - this.position.y };
            this.velocity.x += steer.x * 0.005; this.velocity.y += steer.y * 0.005;
            if (this.partner) {
                const cohesion = { x: this.partner.position.x - this.position.x, y: this.partner.position.y - this.position.y };
                this.velocity.x += cohesion.x * this.settings.cohesionFactor; this.velocity.y += cohesion.y * this.settings.cohesionFactor;
            }
        }
    }

    /**
     * Calculates a steering vector towards the closest prey.
     * This method is now only responsible for movement, not for catching.
     * @param {Bee[]} prey - An array of nearby bees.
     * @returns {object} A steering vector {x, y}.
     */
    hunt(prey) {
        const steering = { x: 0, y: 0 };
        let closestDistance = Infinity, closestPrey = null;

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
            steering.x = closestPrey.position.x - this.position.x;
            steering.y = closestPrey.position.y - this.position.y;
        }

        return steering;
    }

    resetMating() {
        if (this.partner) {
            this.partner.state = 'HUNTING'; this.partner.beesCaught = 0;
            this.partner.partner = null; this.partner.matingNest = null;
        }
        this.state = 'HUNTING'; this.beesCaught = 0;
        this.partner = null; this.matingNest = null;
    }
}