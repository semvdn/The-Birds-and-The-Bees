import { DEATH_FADE_TIME } from "../presets.js";

export function drawBirdModel(ctx, boid) {
    const { bodyVertices, beakVertices, tailVertices, palette } = boid.genes;
    let displayPalette = { ...palette.colors };
    if (boid.isAlive && boid.state === 'SEEKING_MATE') {
        displayPalette.neck_white = '#87CEFA'; // Light Sky Blue
    }
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
    for (const part in polygons) {
        const vertices = polygons[part];
        ctx.fillStyle = displayPalette[part] || displayPalette.beak;
        ctx.strokeStyle = displayPalette.outline;
        ctx.beginPath();
        ctx.moveTo(vertices[0][0], vertices[0][1]);
        for (let i = 1; i < vertices.length; i++) ctx.lineTo(vertices[i][0], vertices[i][1]);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

export function preRenderBird(boid) {
    const scale = 5;
    const width = 60, height = 40; // Estimated size to fit the bird model
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    const oCtx = offscreenCanvas.getContext('2d');

    oCtx.save();
    oCtx.translate(width / 2, height / 2);

    // Render facing right version
    oCtx.save();
    oCtx.scale(scale, -scale); // Flipped Y to match original rendering
    drawBirdModel(oCtx, boid);
    oCtx.restore();
    boid.preRenderedCanvas = offscreenCanvas;
}


export function drawBird(ctx, boid) {
    if (boid.vanished || !boid.preRenderedCanvas) return;
    
    ctx.save();
    
    if (!boid.isAlive) {
        const alpha = Math.max(0, 1.0 - (boid.deathTimer / DEATH_FADE_TIME));
        ctx.globalAlpha = alpha;
    }

    ctx.translate(boid.position.x, boid.position.y);
    
    if (!boid.isAlive && boid.deathTimer > 0) {
        ctx.rotate(Math.PI / 2);
    } else {
        const angle = Math.atan2(boid.velocity.y, boid.velocity.x);
        ctx.rotate(angle);
        const isFacingRight = Math.abs(angle) < Math.PI / 2;
        if (!isFacingRight) {
            ctx.scale(1, -1); // Flip the pre-rendered canvas vertically for left-facing
        }
    }
    
    ctx.drawImage(boid.preRenderedCanvas, -boid.preRenderedCanvas.width / 2, -boid.preRenderedCanvas.height / 2);
    ctx.restore();
}

export function preRenderBee(boid) {
    const width = 12, height = 8;
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    const oCtx = offscreenCanvas.getContext('2d');

    oCtx.translate(width / 2, height / 2);
    oCtx.fillStyle = '#FFC300';
    oCtx.beginPath();
    oCtx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
    oCtx.fill();
    oCtx.fillStyle = '#000000';
    oCtx.fillRect(-2, -3, 2, 6);
    boid.preRenderedCanvas = offscreenCanvas;
}


export function drawBee(ctx, boid) {
    if (boid.vanished || !boid.preRenderedCanvas) return;
    
    ctx.save();

    if (!boid.isAlive) {
        const alpha = Math.max(0, 1.0 - (boid.deathTimer / DEATH_FADE_TIME));
        ctx.globalAlpha = alpha;
    }

    ctx.translate(boid.position.x, boid.position.y);

    if (boid.isAlive) {
        const angle = Math.atan2(boid.velocity.y, boid.velocity.x);
        ctx.rotate(angle);
    }

    ctx.drawImage(boid.preRenderedCanvas, -boid.preRenderedCanvas.width / 2, -boid.preRenderedCanvas.height / 2);
    ctx.restore();
}


export function preRenderHive(hive) {
    const width = 35, height = 50;
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    const oCtx = offscreenCanvas.getContext('2d');
    oCtx.save();
    oCtx.translate(width / 2, height / 2);
    const mainColor = '#D4A75A', bandColor = '#A97E33', entranceColor = '#4a381c';
    const w = 15, h = 22;
    oCtx.fillStyle = mainColor;
    oCtx.beginPath(); oCtx.ellipse(0, -h * 0.3, w, h * 0.7, 0, 0, Math.PI * 2); oCtx.fill();
    oCtx.beginPath(); oCtx.ellipse(0, h * 0.15, w * 1.2, h * 0.8, 0, 0, Math.PI * 2); oCtx.fill();
    oCtx.beginPath(); oCtx.ellipse(0, h * 0.5, w * 0.9, h * 0.6, 0, 0, Math.PI * 2); oCtx.fill();
    oCtx.strokeStyle = bandColor; oCtx.lineWidth = 2;
    oCtx.beginPath(); oCtx.moveTo(-w * 0.9, -h * 0.05); oCtx.quadraticCurveTo(0, 0, w * 0.9, -h * 0.05); oCtx.stroke();
    oCtx.beginPath(); oCtx.moveTo(-w * 1.1, h * 0.3); oCtx.quadraticCurveTo(0, h * 0.45, w * 1.1, h * 0.3); oCtx.stroke();
    oCtx.beginPath(); oCtx.moveTo(-w * 0.7, h * 0.6); oCtx.quadraticCurveTo(0, h * 0.75, w * 0.7, h * 0.6); oCtx.stroke();
    oCtx.fillStyle = entranceColor; oCtx.beginPath(); oCtx.arc(0, 12, 4, 0, Math.PI * 2); oCtx.fill();
    oCtx.restore();
    hive.preRenderedCanvas = offscreenCanvas;
}
export function preRenderNest(nest) {
    const size = nest.radius * 3;
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    const oCtx = offscreenCanvas.getContext('2d');
    oCtx.save();
    oCtx.translate(size / 2, size / 2);
    oCtx.lineWidth = 1.5;
    for (const twig of nest.twigs) {
        oCtx.strokeStyle = twig.color;
        oCtx.beginPath();
        oCtx.moveTo(twig.x1, twig.y1);
        oCtx.quadraticCurveTo(twig.cpX, twig.cpY, twig.x2, twig.y2);
        oCtx.stroke();
    }
    oCtx.restore();
    nest.preRenderedCanvas = offscreenCanvas;
}
export function drawHive(ctx, hive) {
    if (!hive.preRenderedCanvas) return;
    ctx.save();
    ctx.translate(hive.position.x, hive.position.y);
    ctx.drawImage(hive.preRenderedCanvas, -hive.preRenderedCanvas.width / 2, -hive.preRenderedCanvas.height / 2);
    ctx.restore();
}
export function drawHiveProgressBar(ctx, hive, nectarGoal) {
    const barWidth = 30, barHeight = 5, barX = hive.position.x - (barWidth / 2), barY = hive.position.y - 40;
    ctx.fillStyle = '#555555'; ctx.fillRect(barX, barY, barWidth, barHeight);
    const progress = hive.nectar / nectarGoal;
    const progressBarWidth = barWidth * Math.min(1, progress);
    ctx.fillStyle = '#00FF00'; ctx.fillRect(barX, barY, progressBarWidth, barHeight);
}
export function drawNest(ctx, nest) {
    if (!nest.preRenderedCanvas) return;
    ctx.save();
    ctx.translate(nest.position.x, nest.position.y);
    ctx.translate(0, -nest.radius * 1.5);
    ctx.drawImage(nest.preRenderedCanvas, -nest.preRenderedCanvas.width / 2, -nest.preRenderedCanvas.height / 2);
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