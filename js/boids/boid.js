export class Boid {
    constructor(x, y, settings) {
        this.position = { x, y };
        this.velocity = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.settings = settings;
        this.isAlive = true;
        this.age = 0;
        this.energy = this.settings.initialEnergy;
    }

    update(world) {
        if (!this.isAlive) return;

        // --- Aging and Energy Depletion ---
        this.age++;
        this.energy -= this.settings.energyDepletionRate;
        if (this.age > this.settings.maxLifetime || this.energy <= 0) {
            this.isAlive = false;
            return; // Cease updates for this boid
        }

        const boidGrid = world.boids === world.birds ? world.birdGrid : world.beeGrid;
        const localBoids = boidGrid.query(this);

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

        // --- Horizontal Wrap-Around ---
        if (this.position.x > canvas.width) {
            this.position.x = 0;
        } else if (this.position.x < 0) {
            this.position.x = canvas.width;
        }

        // --- Vertical Boundaries ---
        // Top boundary repulsion
        if (this.position.y < margin) {
            this.velocity.y += this.settings.turnFactor;
        }

        // Ground boundary repulsion
        const groundLevel = canvas.height - groundHeight;
        const groundMargin = 70; // A larger margin for the ground to feel more significant
        if (this.position.y > groundLevel - groundMargin) {
            // Apply a stronger turning force as the boid gets closer to the ground
            const distanceToRepelZone = this.position.y - (groundLevel - groundMargin);
            const repulsionStrength = (distanceToRepelZone / groundMargin) * this.settings.turnFactor * 2.5;
            this.velocity.y -= repulsionStrength;
        }

        // Hard clamp for the ground as a fail-safe, in case a boid has too much velocity
        if (this.position.y >= groundLevel) {
            this.position.y = groundLevel;
            this.velocity.y *= -0.5; // Bounce with energy loss
        }
    }
}