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
    ctx.fillStyle = boid.state === 'MATING' ? '#3333ff' : 'rgba(50, 50, 50, 0.8)';
    ctx.fill();
    ctx.restore();
}

export function drawBee(ctx, boid) {
    if (!boid.isAlive) return;
    ctx.save();
    ctx.translate(boid.position.x, boid.position.y);
    const angle = Math.atan2(boid.velocity.y, boid.velocity.x);
    ctx.rotate(angle);
    // Body
    ctx.fillStyle = '#FFC300'; // Yellow
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Stripe
    ctx.fillStyle = '#000000'; // Black
    ctx.fillRect(-2, -3, 2, 6);
    ctx.restore();
}

export function drawHive(ctx, hive) {
    ctx.save();
    ctx.translate(hive.position.x, hive.position.y);

    const mainColor = '#D4A75A';
    const bandColor = '#A97E33';
    const entranceColor = '#4a381c';

    const width = 15;
    const height = 22;

    // Draw the main lobes of the hive by stacking ellipses
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.ellipse(0, -height * 0.3, width, height * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, height * 0.15, width * 1.2, height * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, height * 0.5, width * 0.9, height * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw convex and concave lines to suggest bands
    ctx.strokeStyle = bandColor;
    ctx.lineWidth = 2;

    // Top concave line
    ctx.beginPath();
    ctx.moveTo(-width * 0.9, -height * 0.05);
    ctx.quadraticCurveTo(0, 0, width * 0.9, -height * 0.05);
    ctx.stroke();

    // Bottom concave line
    ctx.beginPath();
    ctx.moveTo(-width * 1.1, height * 0.3);
    ctx.quadraticCurveTo(0, height * 0.45, width * 1.1, height * 0.3);
    ctx.stroke();
    
    // Bottom convex line for base
    ctx.beginPath();
    ctx.moveTo(-width * 0.7, height * 0.6);
    ctx.quadraticCurveTo(0, height * 0.75, width * 0.7, height * 0.6);
    ctx.stroke();

    // Entrance
    ctx.fillStyle = entranceColor;
    ctx.beginPath();
    ctx.arc(0, 12, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

export function drawNest(ctx, nest) {
    ctx.save();
    ctx.translate(nest.position.x, nest.position.y);
    // Translate UPWARDS to tuck the nest into the branch.
    // A larger negative value moves it higher on the screen.
    ctx.translate(0, -nest.radius * 2.0);
    ctx.lineWidth = 1.5;

    // Use pre-calculated twig data to prevent jittering and create a woven look
    for (const twig of nest.twigs) {
        ctx.strokeStyle = twig.color;
        ctx.beginPath();
        ctx.moveTo(twig.x1, twig.y1);
        ctx.quadraticCurveTo(twig.cpX, twig.cpY, twig.x2, twig.y2);
        ctx.stroke();
    }
    ctx.restore();
}