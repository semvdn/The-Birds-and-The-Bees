import { GRAVITY, DEATH_FADE_TIME } from '../presets.js';

export class Boid {
    constructor(x, y, settings) {
        this.position = { x, y };
        this.velocity = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.settings = settings;
        this.isAlive = true;
        this.age = 0;
        this.energy = this.settings.initialEnergy;
        this.vanished = false; // A flag for permanent removal
        this.deathTimer = 0; // Timer for the fade-out animation
    }

    /**
     * The main update loop for a boid. It manages lifecycle events.
     * @param {object} world - The simulation world object.
     * @returns {boolean} - Returns true if the boid is alive and active, false otherwise.
     */
    update(world) {
        if (this.vanished) return false;

        // --- Lifecycle Management ---
        if (this.isAlive) {
            this.age++;
            this.energy -= this.settings.energyDepletionRate;
            if (this.age > this.settings.maxLifetime || this.energy <= 0) {
                this.die('natural'); // Dies from old age or starvation
            }
        }

        // If dead, the boid is no longer active but may still be animating (falling).
        if (!this.isAlive) {
            this.fall(world);
            return false;
        }

        return true; // Boid is alive and should perform its regular behaviors.
    }

    /**
     * Handles the boid's death, with different outcomes based on the cause.
     * @param {string} cause - The cause of death ('natural', 'predation').
     */
    die(cause = 'natural') {
        this.isAlive = false;
        if (cause === 'predation') {
            this.vanished = true; // Disappears immediately if eaten.
        } else {
            this.velocity.y = Math.min(0, this.velocity.y); // Ensures it doesn't jump up upon death.
        }
    }

    /**
     * Manages the physics of falling and the fade-out animation after death.
     * @param {object} world - The simulation world object.
     */
    fall(world) {
        const groundLevel = world.canvas.height - world.groundHeight;

        // Apply gravity until it hits the ground.
        if (this.position.y < groundLevel - 1) {
             this.velocity.y += GRAVITY;
             this.velocity.x *= 0.99; // Simulate air resistance.
        } else {
             // Once on the ground, stop moving and start the fade-out timer.
             this.position.y = groundLevel;
             this.velocity = {x: 0, y: 0};
             this.deathTimer++;
             if (this.deathTimer > DEATH_FADE_TIME) {
                 this.vanished = true; // Mark for permanent removal after fading.
             }
        }
        
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    /**
     * Applies the standard boid flocking rules (separation, alignment, cohesion).
     * This is called by subclasses for living boids.
     * @param {object} world - The simulation world object.
     * @param {Boid[]} localBoids - An array of nearby boids.
     */
    applyBoidRules(world, localBoids) {
        const sep = { x: 0, y: 0 };
        const ali = { x: 0, y: 0 };
        const coh = { x: 0, y: 0 };
        let sepCount = 0, aliCount = 0, cohCount = 0;

        for (const other of localBoids) {
            if (other === this || !other.isAlive) continue;
            const distance = Math.hypot(this.position.x - other.position.x, this.position.y - other.position.y);
            if (distance > 0 && distance < this.settings.visualRange) {
                coh.x += other.position.x;
                coh.y += other.position.y;
                cohCount++;
                ali.x += other.velocity.x;
                ali.y += other.velocity.y;
                aliCount++;
                if (distance < this.settings.separationDistance) {
                    const diffX = (this.position.x - other.position.x) / distance;
                    const diffY = (this.position.y - other.position.y) / distance;
                    sep.x += diffX;
                    sep.y += diffY;
                    sepCount++;
                }
            }
        }

        if (sepCount > 0) {
            sep.x /= sepCount;
            sep.y /= sepCount;
            this.velocity.x += sep.x * this.settings.separationFactor;
            this.velocity.y += sep.y * this.settings.separationFactor;
        }

        if (aliCount > 0) {
            ali.x /= aliCount;
            ali.y /= aliCount;
            const speed = Math.hypot(ali.x, ali.y);
            if (speed > 0) {
                this.velocity.x += ((ali.x / speed) * this.settings.maxSpeed - this.velocity.x) * this.settings.alignmentFactor;
                this.velocity.y += ((ali.y / speed) * this.settings.maxSpeed - this.velocity.y) * this.settings.alignmentFactor;
            }
        }

        if (cohCount > 0) {
            coh.x /= cohCount;
            coh.y /= cohCount;
            const steerX = coh.x - this.position.x;
            const steerY = coh.y - this.position.y;
            const speed = Math.hypot(steerX, steerY);
            if (speed > 0) {
                this.velocity.x += (steerX / speed * this.settings.maxSpeed - this.velocity.x) * this.settings.cohesionFactor;
                this.velocity.y += (steerY / speed * this.settings.maxSpeed - this.velocity.y) * this.settings.cohesionFactor;
            }
        }
        
        this.limitSpeed();
        this.avoidEdges(world);

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    limitSpeed() {
        const speed = Math.hypot(this.velocity.x, this.velocity.y);
        if (speed > this.settings.maxSpeed) {
            const ratio = this.settings.maxSpeed / speed;
            this.velocity.x *= ratio;
            this.velocity.y *= ratio;
        }
    }

    avoidEdges(world) {
        const { canvas, groundHeight } = world;
        const margin = 50; // Top margin

        if (this.position.x > canvas.width) this.position.x = 0;
        else if (this.position.x < 0) this.position.x = canvas.width;

        if (this.position.y < margin) this.velocity.y += this.settings.turnFactor;
        
        const groundLevel = canvas.height - groundHeight;
        const groundMargin = 70;
        if (this.position.y > groundLevel - groundMargin) {
            const distanceToRepelZone = this.position.y - (groundLevel - groundMargin);
            const repulsionStrength = (distanceToRepelZone / groundMargin) * this.settings.turnFactor * 2.5;
            this.velocity.y -= repulsionStrength;
        }

        if (this.position.y >= groundLevel) {
            this.position.y = groundLevel;
            this.velocity.y *= -0.5;
        }
    }
}