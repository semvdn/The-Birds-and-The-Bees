const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const insectFlock = new Flock();
const birdFlock = new Flock();
const plants = [];

for (let i = 0; i < 150; i++) {
    insectFlock.addBoid(new Insect(Math.random() * canvas.width, Math.random() * canvas.height));
}

for (let i = 0; i < 10; i++) {
    birdFlock.addBoid(new Bird(Math.random() * canvas.width, Math.random() * canvas.height));
}

for (let i = 0; i < 5; i++) {
    plants.push(new Plant(Math.random() * canvas.width, canvas.height - 50));
}

let frameCount = 0;
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const plant of plants) {
        plant.show(ctx);
        plant.update();
    }

    insectFlock.run(ctx, canvas.width, canvas.height, [], plants);
    birdFlock.run(ctx, canvas.width, canvas.height, insectFlock.boids);

    if (frameCount % 100 === 0) {
        for (const plant of plants) {
            plant.grow();
        }
    }

    frameCount++;
    requestAnimationFrame(animate);
}

animate();