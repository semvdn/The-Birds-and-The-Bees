export function drawBirdModel(ctx, boid) {
    // The bird's genes now contain the final vertex arrays, ready for drawing.
    const { bodyVertices, beakVertices, tailVertices, palette } = boid.genes;
    
    // Create a mutable copy of the palette for display modifications
    let displayPalette = { ...palette.colors };
    if (boid.state === 'SEEKING_MATE') {
        // Change a visible color to indicate readiness to mate
        displayPalette.neck_white = '#87CEFA'; // Light Sky Blue
    }

    // Define the polygons using the pre-calculated vertex data
    const polygons = {
        head_crest:   [bodyVertices[1], bodyVertices[3], bodyVertices[4], bodyVertices[11]],
        head_face:    [bodyVertices[1], bodyVertices[11], bodyVertices[2]],
        neck_white:   [bodyVertices[2], bodyVertices[11], bodyVertices[10], bodyVertices[9]],
        wing_top:     [bodyVertices[4], bodyVertices[5], bodyVertices[10], bodyVertices[11]],
        wing_bottom:  [bodyVertices[5], bodyVertices[7], bodyVertices[10]],
        belly_top:    [bodyVertices[2], bodyVertices[9], bodyVertices[8], bodyVertices[10]],
        belly_bottom: [bodyVertices[7], bodyVertices[8], bodyVertices[10]],
        beak:         beakVertices,
        tail:         tailVertices,
    };
    
    ctx.lineWidth = 0.1;
    // Render each part of the bird
    for (const part in polygons) {
        const vertices = polygons[part];
        ctx.fillStyle = displayPalette[part] || displayPalette.beak; // Use part's color, fallback for tail
        ctx.strokeStyle = displayPalette.outline;
        
        ctx.beginPath();
        ctx.moveTo(vertices[0][0], vertices[0][1]);
        for (let i = 1; i < vertices.length; i++) {
            ctx.lineTo(vertices[i][0], vertices[i][1]);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

export function drawBird(ctx, boid) {
    if (!boid.isAlive) return;
    ctx.save();
    ctx.translate(boid.position.x, boid.position.y);
    const angle = Math.atan2(boid.velocity.y, boid.velocity.x);
    ctx.rotate(angle);
    ctx.scale(5, 5); // Make birds a bit larger for visibility
    drawBirdModel(ctx, boid);
    ctx.restore();
}

export function drawBee(ctx, boid) {
    if (!boid.isAlive) return;
    ctx.save();
    ctx.translate(boid.position.x, boid.position.y);
    const angle = Math.atan2(boid.velocity.y, boid.velocity.x);
    ctx.rotate(angle);
    ctx.fillStyle = '#FFC300'; ctx.beginPath(); ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000000'; ctx.fillRect(-2, -3, 2, 6);
    ctx.restore();
}

export function drawHive(ctx, hive) {
    ctx.save();
    ctx.translate(hive.position.x, hive.position.y);
    const mainColor = '#D4A75A', bandColor = '#A97E33', entranceColor = '#4a381c';
    const width = 15, height = 22;
    ctx.fillStyle = mainColor;
    ctx.beginPath(); ctx.ellipse(0, -height * 0.3, width, height * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, height * 0.15, width * 1.2, height * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, height * 0.5, width * 0.9, height * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = bandColor; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-width * 0.9, -height * 0.05); ctx.quadraticCurveTo(0, 0, width * 0.9, -height * 0.05); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-width * 1.1, height * 0.3); ctx.quadraticCurveTo(0, height * 0.45, width * 1.1, height * 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-width * 0.7, height * 0.6); ctx.quadraticCurveTo(0, height * 0.75, width * 0.7, height * 0.6); ctx.stroke();
    ctx.fillStyle = entranceColor; ctx.beginPath(); ctx.arc(0, 12, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

export function drawHiveProgressBar(ctx, hive, nectarForNewBee) {
    const barWidth = 30, barHeight = 5, barX = hive.position.x - (barWidth / 2), barY = hive.position.y - 40;
    ctx.fillStyle = '#555555'; ctx.fillRect(barX, barY, barWidth, barHeight);
    const progress = hive.nectar / nectarForNewBee;
    const progressBarWidth = barWidth * Math.min(1, progress);
    ctx.fillStyle = '#00FF00'; ctx.fillRect(barX, barY, progressBarWidth, barHeight);
}

export function drawNest(ctx, nest) {
    ctx.save();
    ctx.translate(nest.position.x, nest.position.y);
    ctx.translate(0, -nest.radius * 2.0);
    ctx.lineWidth = 1.5;
    for (const twig of nest.twigs) {
        ctx.strokeStyle = twig.color; ctx.beginPath();
        ctx.moveTo(twig.x1, twig.y1);
        ctx.quadraticCurveTo(twig.cpX, twig.cpY, twig.x2, twig.y2);
        ctx.stroke();
    }
    if (nest.hasEgg && nest.hatchingCountdown > 0) {
        drawEgg(ctx, nest);
    }
    ctx.restore();
}

function drawEgg(ctx, nest) {
    ctx.save();
    ctx.translate(0, -nest.radius * 0.1);
    ctx.fillStyle = '#F0E68C'; ctx.beginPath();
    ctx.ellipse(0, 0, nest.radius * 0.6, nest.radius * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}