import { Boid } from './boid.js';
import { NEST_SETTINGS } from '../presets.js';

export class Bird extends Boid {
    constructor(x, y, settings, nest, genes, dna) {
        super(x, y, { ...settings, ...dna });
        this.homeNest = nest;
        this.matingNest = null;
        this.beesCaught = 0;
        this.partner = null;
        this.state = 'HUNTING'; // HUNTING, SEEKING_MATE, GO_TO_NEST
        this.genes = genes;
        this.dna = dna;
    }

    update(world) {
        if (!super.update(world)) {
            if (this.state !== 'HUNTING') {
                this.resetMating();
            }
            return;
        }
        
        const localBoids = world.birdGrid.query(this);
        this.applyBoidRules(world, localBoids);

        switch (this.state) {
            case 'HUNTING':
                const localPrey = world.beeGrid.query(this);
                const hunt = this.hunt(localPrey);
                this.velocity.x += hunt.x * this.settings.huntFactor;
                this.velocity.y += hunt.y * this.settings.huntFactor;
                this.checkCatch(localPrey);
                if (this.beesCaught >= NEST_SETTINGS.BEES_FOR_NEW_BIRD) {
                    this.state = 'SEEKING_MATE';
                }
                break;
            
            case 'SEEKING_MATE':
                this.findPartnerAndNest(localBoids, world.nests);
                break;

            case 'GO_TO_NEST':
                // Check if the nesting attempt is still valid
                if (!this.partner || !this.partner.isAlive || !this.matingNest || this.matingNest.hasEgg) {
                    this.resetMating();
                    return;
                }
                this.goToNest();
                break;
        }
    }
    
    findPartnerAndNest(birds, nests) {
        // Find a potential partner first
        for (const other of birds) {
            if (other !== this && other.state === 'SEEKING_MATE' && !other.partner) {
                const distance = Math.hypot(this.position.x - other.position.x, this.position.y - other.position.y);
                if (distance < this.settings.visualRange) {
                    // Found a partner, now find a nest
                    let availableNest = null;
                    for (const nest of nests) {
                        if (nest.isAvailable) {
                            availableNest = nest;
                            break;
                        }
                    }
    
                    if (availableNest) {
                        // Success! Claim the nest and pair up.
                        availableNest.isAvailable = false;
    
                        this.partner = other;
                        other.partner = this;
    
                        this.matingNest = availableNest;
                        other.matingNest = availableNest;
    
                        this.state = 'GO_TO_NEST';
                        other.state = 'GO_TO_NEST';
                    }
                    return; 
                }
            }
        }
    }

    checkCatch(prey) {
        for (const p of prey) {
            if (p.isAlive) {
                const distance = Math.hypot(this.position.x - p.position.x, this.position.y - p.position.y);
                const currentSpeed = Math.hypot(this.velocity.x, this.velocity.y);
                const effectiveKillRange = this.settings.killRange + (currentSpeed * 0.5);

                if (distance < effectiveKillRange) {
                    p.die('predation');
                    this.beesCaught++;
                    this.energy = Math.min(this.settings.initialEnergy, this.energy + this.settings.energyFromBee);
                    return;
                }
            }
        }
    }

    goToNest() {
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
        // If this bird was part of a pair that claimed a nest which does NOT yet have an egg,
        // make that nest available again.
        if (this.matingNest && this.matingNest.isAvailable === false && !this.matingNest.hasEgg) {
            this.matingNest.isAvailable = true;
            this.matingNest.occupants.clear(); // Ensure any occupants are cleared out
        }
        
        const formerPartner = this.partner;
        
        // Reset this bird's state
        this.state = 'HUNTING';
        this.beesCaught = 0;
        this.matingNest = null;
        this.partner = null;
        
        // If it had a partner, tell the partner to reset as well, avoiding a recursive loop.
        if (formerPartner) {
            formerPartner.partner = null; 
            formerPartner.resetMating();
        }
    }
}