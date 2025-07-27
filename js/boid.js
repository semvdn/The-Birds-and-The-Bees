class Boid {
    constructor(x, y) {
        this.position = new Vector(x, y);
        this.velocity = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
        this.velocity.normalize();
        this.velocity.mult(Math.random() * 2 + 2);
        this.acceleration = new Vector();
        this.maxForce = 0.05;
        this.maxSpeed = 4;
        this.perceptionRadius = 50;
    }

    align(boids) {
        let steering = new Vector();
        let total = 0;
        for (let other of boids) {
            let d = this.position.dist(other.position);
            if (other !== this && d < this.perceptionRadius) {
                steering.add(other.velocity);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.normalize();
            steering.mult(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    cohesion(boids) {
        let steering = new Vector();
        let total = 0;
        for (let other of boids) {
            let d = this.position.dist(other.position);
            if (other !== this && d < this.perceptionRadius) {
                steering.add(other.position);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.sub(this.position);
            steering.normalize();
            steering.mult(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    separation(boids) {
        let steering = new Vector();
        let total = 0;
        for (let other of boids) {
            let d = this.position.dist(other.position);
            if (other !== this && d < this.perceptionRadius / 2) {
                let diff = Vector.sub(this.position, other.position);
                diff.div(d * d);
                steering.add(diff);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.normalize();
            steering.mult(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    flock(boids) {
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);
        let separation = this.separation(boids);

        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.acceleration.mult(0);
    }

    edges(width, height) {
        if (this.position.x > width) {
            this.position.x = 0;
        } else if (this.position.x < 0) {
            this.position.x = width;
        }
        if (this.position.y > height) {
            this.position.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = height;
        }
    }

    show(ctx, color = 'white') {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(Math.atan2(this.velocity.y, this.velocity.x));
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-5, -5);
        ctx.lineTo(-5, 5);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }
}

class Insect extends Boid {
    constructor(x, y) {
        super(x, y);
        this.maxForce = 0.04;
        this.maxSpeed = 3.5;
    }

    show(ctx) {
        super.show(ctx, 'green');
    }
}

class Bird extends Boid {
    constructor(x, y) {
        super(x, y);
        this.maxForce = 0.05;
        this.maxSpeed = 4;
    }

    hunt(insects) {
        let target = null;
        let closest = Infinity;
        for (let insect of insects) {
            let d = this.position.dist(insect.position);
            if (d < this.perceptionRadius && d < closest) {
                closest = d;
                target = insect;
            }
        }

        if (target !== null) {
            let steering = Vector.sub(target.position, this.position);
            steering.normalize();
            steering.mult(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce * 2); // Birds are more determined when hunting
            return steering;
        }
        return new Vector();
    }

    flock(boids, insects) {
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);
        let separation = this.separation(boids);
        let hunting = this.hunt(insects);

        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
        this.acceleration.add(hunting);
    }

    show(ctx) {
        super.show(ctx, 'red');
    }
}