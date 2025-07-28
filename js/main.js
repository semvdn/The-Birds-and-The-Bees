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

const MAX_PLANTS = 10;
const MAX_ATTEMPTS = 50;

function isColliding(plant, otherPlants) {
    const box1 = plant.getBoundingBox();
    for (const other of otherPlants) {
        const box2 = other.getBoundingBox();
        if (box1.x < box2.x + box2.width &&
            box1.x + box1.width > box2.x &&
            box1.y < box2.y + box2.height &&
            box1.y + box1.height > box2.y) {
            return true;
        }
    }
    return false;
}

for (let i = 0; i < MAX_PLANTS; i++) {
    let attempts = 0;
    while (attempts < MAX_ATTEMPTS) {
        const x = Math.random() * canvas.width;
        const y = canvas.height - 50;
        const newPlant = new Plant(x, y);
        if (!isColliding(newPlant, plants)) {
            plants.push(newPlant);
            break;
        }
        attempts++;
    }
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