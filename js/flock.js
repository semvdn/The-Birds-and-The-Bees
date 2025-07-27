class Flock {
    constructor() {
        this.boids = [];
    }

    addBoid(boid) {
        this.boids.push(boid);
    }

    run(ctx, width, height, insects = []) {
        for (let i = this.boids.length - 1; i >= 0; i--) {
            const boid = this.boids[i];
            boid.edges(width, height);

            if (boid instanceof Bird) {
                boid.flock(this.boids, insects);
            } else {
                boid.flock(this.boids);
            }

            boid.update();
            boid.show(ctx);

            if (boid instanceof Bird) {
                for (let j = insects.length - 1; j >= 0; j--) {
                    if (boid.position.dist(insects[j].position) < 10) {
                        insects.splice(j, 1);
                    }
                }
            }
        }
    }
}