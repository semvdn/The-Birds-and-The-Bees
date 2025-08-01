import { Boid } from './boid.js';
import { NEST_SETTINGS, MAX_BIRDS } from '../presets.js';

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
        this.wanderAngle = Math.random() * 2 * Math.PI;
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
                this.velocity.x += hunt.x * this.dna.huntFactor;
                this.velocity.y += hunt.y * this.dna.huntFactor;
                
                this.checkCatch(localPrey);

                // --- Proactive Wander Behavior ---
                const isHunting = Math.hypot(hunt.x, hunt.y) > 0.1;
                // Check for flockmates (any other living bird nearby, not including itself)
                const hasFlockmates = localBoids.some(b => b !== this && b.isAlive);

                // If not actively hunting and all alone, wander to find food or friends.
                if (!isHunting && !hasFlockmates) {
                    this.wander();
                }
                
                if (this.beesCaught >= NEST_SETTINGS.BEES_FOR_NEW_BIRD) {
                    this.state = 'SEEKING_MATE';
                }
                break;
            
            case 'SEEKING_MATE':
                if (world.birds.length >= MAX_BIRDS) {
                    this.state = 'HUNTING';
                    this.beesCaught = 0;
                    return;
                }

                this.findPartnerAndNest(localBoids, world.nests);
                break;

            case 'GO_TO_NEST':
                if (!this.partner || !this.partner.isAlive || !this.matingNest || this.matingNest.hasEgg) {
                    this.resetMating();
                    return;
                }
                this.goToNest();
                break;
        }
    }
    
    wander() {
        // Adjust the wander angle slightly for the next frame
        this.wanderAngle += (Math.random() - 0.5) * 0.4; 
        
        // Create a steering force from the wander angle
        const steer = {
            x: Math.cos(this.wanderAngle) * 0.1,
            y: Math.sin(this.wanderAngle) * 0.1
        };
        
        // Apply the force to the bird's velocity
        this.velocity.x += steer.x;
        this.velocity.y += steer.y;
    }

    findPartnerAndNest(birds, nests) {
        for (const other of birds) {
            if (other !== this && other.state === 'SEEKING_MATE' && !other.partner) {
                const distance = Math.hypot(this.position.x - other.position.x, this.position.y - other.position.y);
                if (distance < this.dna.visualRange) {
                    let availableNest = null;
                    for (const nest of nests) {
                        if (nest.isAvailable) {
                            availableNest = nest;
                            break;
                        }
                    }
    
                    if (availableNest) {
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
                this.velocity.x += cohesion.x * this.dna.cohesionFactor; this.velocity.y += cohesion.y * this.dna.cohesionFactor;
            }
        }
    }

    hunt(prey) {
        const steering = { x: 0, y: 0 };
        let closestDistance = Infinity, closestPrey = null;

        for (const p of prey) {
            if (p.isAlive) {
                const distance = Math.hypot(this.position.x - p.position.x, this.position.y - p.position.y);
                if (distance < closestDistance && distance < this.dna.visualRange) {
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
        if (this.matingNest && this.matingNest.isAvailable === false && !this.matingNest.hasEgg) {
            this.matingNest.isAvailable = true;
            this.matingNest.occupants.clear();
        }
        
        const formerPartner = this.partner;
        
        this.state = 'HUNTING';
        this.beesCaught = 0;
        this.matingNest = null;
        this.partner = null;
        
        if (formerPartner) {
            formerPartner.partner = null; 
            formerPartner.resetMating();
        }
    }
}