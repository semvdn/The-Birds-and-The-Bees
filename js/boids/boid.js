export class Boid {
    constructor(x, y, settings) {
        this.position = { x, y };
        this.velocity = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.settings = settings;
        this.isAlive = true;
    }

    update(world) {
        if (!this.isAlive) return;

        const separation = this.separation(world.boids);
        const alignment = this.alignment(world.boids);
        const cohesion = this.cohesion(world.boids);

        this.velocity.x += separation.x * this.settings.separationFactor;
        this.velocity.y += separation.y * this.settings.separationFactor;
        this.velocity.x += alignment.x * this.settings.alignmentFactor;
        this.velocity.y += alignment.y * this.settings.alignmentFactor;
        this.velocity.x += cohesion.x * this.settings.cohesionFactor;
        this.velocity.y += cohesion.y * this.settings.cohesionFactor;

        this.limitSpeed();
        this.avoidEdges(world.canvas);

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    limitSpeed() {
        const speed = Math.hypot(this.velocity.x, this.velocity.y);
        if (speed > this.settings.maxSpeed) {
            this.velocity.x = (this.velocity.x / speed) * this.settings.maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * this.settings.maxSpeed;
        }
    }

    avoidEdges(canvas) {
        const margin = 50;
        if (this.position.x < margin) this.velocity.x += this.settings.turnFactor;
        if (this.position.x > canvas.width - margin) this.velocity.x -= this.settings.turnFactor;
        if (this.position.y < margin) this.velocity.y += this.settings.turnFactor;
        if (this.position.y > canvas.height - margin) this.velocity.y -= this.settings.turnFactor;
    }

    separation(boids) {
        const steering = { x: 0, y: 0 };
        let total = 0;
        for (const other of boids) {
            if (other !== this && other.isAlive) {
                const distance = Math.hypot(this.position.x - other.position.x, this.position.y - other.position.y);
                if (distance > 0 && distance < this.settings.separationDistance) {
                    let diffX = (this.position.x - other.position.x) / distance;
                    let diffY = (this.position.y - other.position.y) / distance;
                    steering.x += diffX;
                    steering.y += diffY;
                    total++;
                }
            }
        }
        if (total > 0) {
            steering.x /= total;
            steering.y /= total;
        }
        return steering;
    }

    alignment(boids) {
        const steering = { x: 0, y: 0 };
        let total = 0;
        for (const other of boids) {
            if (other !== this && other.isAlive) {
                const distance = Math.hypot(this.position.x - other.position.x, this.position.y - other.position.y);
                if (distance < this.settings.visualRange) {
                    steering.x += other.velocity.x;
                    steering.y += other.velocity.y;
                    total++;
                }
            }
        }
        if (total > 0) {
            steering.x /= total;
            steering.y /= total;
            const speed = Math.hypot(steering.x, steering.y);
            if (speed > 0) {
                steering.x = (steering.x / speed) * this.settings.maxSpeed;
                steering.y = (steering.y / speed) * this.settings.maxSpeed;
            }
        }
        return steering;
    }

    cohesion(boids) {
        const steering = { x: 0, y: 0 };
        let total = 0;
        for (const other of boids) {
            if (other !== this && other.isAlive) {
                const distance = Math.hypot(this.position.x - other.position.x, this.position.y - other.position.y);
                if (distance < this.settings.visualRange) {
                    steering.x += other.position.x;
                    steering.y += other.position.y;
                    total++;
                }
            }
        }
        if (total > 0) {
            steering.x /= total;
            steering.y /= total;
            steering.x -= this.position.x;
            steering.y -= this.position.y;
            const speed = Math.hypot(steering.x, steering.y);
            if (speed > 0) {
                steering.x = (steering.x / speed) * this.settings.maxSpeed;
                steering.y = (steering.y / speed) * this.settings.maxSpeed;
            }
        }
        return steering;
    }
}