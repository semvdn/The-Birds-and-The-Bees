import { Boid } from './boid.js';
import { NEST_SETTINGS } from '../presets.js';

export class Bird extends Boid {
    constructor(x, y, settings, nest, genes) {
        super(x, y, settings);
        this.homeNest = nest;
        this.matingNest = null;
        this.beesCaught = 0;
        this.partner = null;
        this.state = 'HUNTING';
        this.genes = genes; // Holds final vertex data and color palette
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

    hunt(prey) {
        const steering = { x: 0, y: 0 };
        let closestDistance = Infinity, closestPrey = null;
        for (const p of prey) {
            if (p.isAlive) {
                const distance = Math.hypot(this.position.x - p.position.x, this.position.y - p.position.y);
                if (distance < closestDistance && distance < this.settings.visualRange) {
                    closestDistance = distance; closestPrey = p;
                }
            }
        }
        if (closestPrey) {
            if (closestDistance < this.settings.killRange) {
                closestPrey.isAlive = false; this.beesCaught++;
            } else {
                steering.x = closestPrey.position.x - this.position.x;
                steering.y = closestPrey.position.y - this.position.y;
            }
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