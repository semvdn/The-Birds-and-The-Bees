export class Boid {
    constructor(x, y, settings) {
        this.position = { x, y };
        this.velocity = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.settings = settings;
        this.isAlive = true;
    }

    update(world) {
        if (!this.isAlive) return;

        // Use the appropriate spatial grid to get a small list of local neighbors
        const boidGrid = world.boids === world.birds ? world.birdGrid : world.beeGrid;
        const localBoids = boidGrid.query(this);

        const sep = { x: 0, y: 0 };
        const ali = { x: 0, y: 0 };
        const coh = { x: 0, y: 0 };
        let sepCount = 0, aliCount = 0, cohCount = 0;

        // --- Consolidated Steering Calculation ---
        // Iterate once through local boids to calculate all forces.
        for (const other of localBoids) {
            if (other === this || !other.isAlive) continue;

            const distance = Math.hypot(this.position.x - other.position.x, this.position.y - other.position.y);

            // All three steering behaviors are based on visual range
            if (distance > 0 && distance < this.settings.visualRange) {
                // Cohesion: Steer towards the center of mass of neighbors
                coh.x += other.position.x;
                coh.y += other.position.y;
                cohCount++;

                // Alignment: Steer in the same direction as neighbors
                ali.x += other.velocity.x;
                ali.y += other.velocity.y;
                aliCount++;

                // Separation: Steer away from very close neighbors
                if (distance < this.settings.separationDistance) {
                    const diffX = (this.position.x - other.position.x) / distance; // Normalize
                    const diffY = (this.position.y - other.position.y) / distance; // Normalize
                    sep.x += diffX;
                    sep.y += diffY;
                    sepCount++;
                }
            }
        }

        // Apply separation force
        if (sepCount > 0) {
            sep.x /= sepCount;
            sep.y /= sepCount;
            this.velocity.x += sep.x * this.settings.separationFactor;
            this.velocity.y += sep.y * this.settings.separationFactor;
        }

        // Apply alignment force
        if (aliCount > 0) {
            ali.x /= aliCount;
            ali.y /= aliCount;
            const speed = Math.hypot(ali.x, ali.y);
            if (speed > 0) {
                this.velocity.x += ((ali.x / speed) * this.settings.maxSpeed - this.velocity.x) * this.settings.alignmentFactor;
                this.velocity.y += ((ali.y / speed) * this.settings.maxSpeed - this.velocity.y) * this.settings.alignmentFactor;
            }
        }

        // Apply cohesion force
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
        this.avoidEdges(world.canvas);

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

    avoidEdges(canvas) {
        const margin = 50;
        if (this.position.x < margin) this.velocity.x += this.settings.turnFactor;
        if (this.position.x > canvas.width - margin) this.velocity.x -= this.settings.turnFactor;
        if (this.position.y < margin) this.velocity.y += this.settings.turnFactor;
        if (this.position.y > canvas.height - margin) this.velocity.y -= this.settings.turnFactor;
    }
}