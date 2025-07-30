import { Boid } from './boid.js';
import { NEST_SETTINGS } from '../presets.js';

export class Bird extends Boid {
    constructor(x, y, settings, nest) {
        super(x, y, settings);
        this.homeNest = nest; // The bird's original nest
        this.matingNest = null; // The nest the pair agrees to go to
        this.beesCaught = 0;
        this.partner = null;
        this.state = 'HUNTING'; // HUNTING, SEEKING_MATE, PAIRED, GO_TO_NEST
    }

    update(world) {
        super.update({ ...world, boids: world.birds });

        switch (this.state) {
            case 'HUNTING':
                const hunt = this.hunt(world.bees);
                this.velocity.x += hunt.x * this.settings.huntFactor;
                this.velocity.y += hunt.y * this.settings.huntFactor;
                if (this.beesCaught >= NEST_SETTINGS.BEES_FOR_NEW_BIRD) {
                    this.state = 'SEEKING_MATE';
                }
                break;
            
            case 'SEEKING_MATE':
                this.findPartner(world.birds);
                // Wander a bit while seeking
                this.velocity.x += (Math.random() - 0.5) * 0.1;
                this.velocity.y += (Math.random() - 0.5) * 0.1;
                break;

            case 'PAIRED':
                // The pair has been formed, now they need to go to the nest.
                // This state is set by the findPartner method.
                this.state = 'GO_TO_NEST';
                break;

            case 'GO_TO_NEST':
                this.goToNest();
                break;
        }
    }

    findPartner(birds) {
        for (const other of birds) {
            // Find another un-partnered bird that is also seeking a mate
            if (other !== this && !other.partner && other.state === 'SEEKING_MATE') {
                const distance = Math.hypot(this.position.x - other.position.x, this.position.y - other.position.y);
                if (distance < this.settings.visualRange) {
                    // Pair up!
                    this.partner = other;
                    other.partner = this;
                    this.state = 'PAIRED';
                    other.state = 'PAIRED';

                    // They agree to go to one of their nests
                    this.matingNest = this.homeNest;
                    other.matingNest = this.homeNest;
                    break; 
                }
            }
        }
    }

    goToNest() {
        if (!this.matingNest) { // Failsafe in case a nest is missing
            this.resetMating();
            return;
        }

        const dist = Math.hypot(this.position.x - this.matingNest.position.x, this.position.y - this.matingNest.position.y);
        if (dist < 15) { // Arrived at nest
            this.matingNest.occupants.add(this);
        } else {
            // Steer towards the agreed-upon nest
            const steer = {
                x: this.matingNest.position.x - this.position.x,
                y: this.matingNest.position.y - this.position.y
            };
            this.velocity.x += steer.x * 0.005;
            this.velocity.y += steer.y * 0.005;

            // Also apply slight cohesion to stay with partner
            if (this.partner) {
                const cohesion = { x: this.partner.position.x - this.position.x, y: this.partner.position.y - this.position.y };
                this.velocity.x += cohesion.x * this.settings.cohesionFactor;
                this.velocity.y += cohesion.y * this.settings.cohesionFactor;
            }
        }
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
                this.beesCaught++;
            } else {
                steering.x = closestPrey.position.x - this.position.x;
                steering.y = closestPrey.position.y - this.position.y;
            }
        }
        return steering;
    }

    resetMating() {
        this.state = 'HUNTING';
        this.beesCaught = 0;
        this.partner = null;
        this.matingNest = null;
    }
}