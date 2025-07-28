class Flock {
    constructor() {
        this.boids = [];
    }

    addBoid(boid) {
        this.boids.push(boid);
    }

    run(ctx, width, height, others = [], plants = []) {
        for (let i = this.boids.length - 1; i >= 0; i--) {
            const boid = this.boids[i];
            boid.edges(width, height);

            if (boid instanceof Bird) {
                boid.flock(this.boids, others);
            } else if (boid instanceof Insect) {
                const seek = boid.seekFood(plants);
                boid.acceleration.add(seek);
                boid.flock(this.boids);
            } else {
                boid.flock(this.boids);
            }

            boid.update();
            boid.show(ctx);

            if (boid instanceof Bird) {
                for (let j = others.length - 1; j >= 0; j--) {
                    if (boid.position.dist(others[j].position) < 10) {
                        others.splice(j, 1);
                    }
                }
            }
        }
    }
}