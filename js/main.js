const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const insectFlock = new Flock();
const birdFlock = new Flock();

for (let i = 0; i < 150; i++) {
    insectFlock.addBoid(new Insect(Math.random() * canvas.width, Math.random() * canvas.height));
}

for (let i = 0; i < 10; i++) {
    birdFlock.addBoid(new Bird(Math.random() * canvas.width, Math.random() * canvas.height));
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    insectFlock.run(ctx, canvas.width, canvas.height);
    birdFlock.run(ctx, canvas.width, canvas.height, insectFlock.boids);
    requestAnimationFrame(animate);
}

animate();