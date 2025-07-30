export function drawBird(ctx, boid) {
    const angle = Math.atan2(boid.velocity.y, boid.velocity.x);
    ctx.save();
    ctx.translate(boid.position.x, boid.position.y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-5, -5);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    ctx.fill();
    ctx.restore();
}

export function drawInsect(ctx, boid) {
    if (!boid.isAlive) return;
    ctx.save();
    ctx.translate(boid.position.x, boid.position.y);
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 100, 100, 0.9)';
    ctx.fill();
    ctx.restore();
}