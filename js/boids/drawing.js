import { BIRD_GENES } from '../presets.js';

function drawBirdModel(ctx, boid) {
    const genes = boid.genes;

    // --- FIX 1: Robust Palette Lookup ---
    // Instead of assuming the entire 'colors' object is passed correctly, we re-lookup the palette
    // from the master list using the palette's name. This prevents silent errors.
    const paletteObject = BIRD_GENES.PALETTES[genes.palette.name];
    if (!paletteObject) {
        console.error("Could not find palette for name:", genes.palette.name);
        return; // Don't draw the bird if its palette is missing
    }
    let palette = { ...paletteObject.colors };

    // Modify palette for specific states, e.g., seeking a mate
    if (boid.state === 'SEEKING_MATE') {
        palette.neck_white = '#87CEFA'; // Light sky blue to show readiness to mate
    }

    // Get the vertex data based on the bird's genes
    const bodyShape = BIRD_GENES.BODY_SHAPES[genes.beak.body];
    const v_body = bodyShape.vertices;
    const v_beak = genes.beak.vertices(v_body);
    const v_tail = genes.tail.vertices(v_body);

    // Body Polygon Definitions (indices refer to v_body)
    const polygons = {
        head_crest:   new Path2D(), wing_top:     new Path2D(),
        head_face:    new Path2D(), wing_bottom:  new Path2D(),
        neck_white:   new Path2D(), belly_top:    new Path2D(),
        tail:         new Path2D(), belly_bottom: new Path2D(),
        beak:         new Path2D(),
    };

    // Construct polygon paths from vertices
    polygons.head_crest.moveTo(v_body[1][0], v_body[1][1]); polygons.head_crest.lineTo(v_body[3][0], v_body[3][1]); polygons.head_crest.lineTo(v_body[4][0], v_body[4][1]); polygons.head_crest.lineTo(v_body[11][0], v_body[11][1]); polygons.head_crest.closePath();
    polygons.head_face.moveTo(v_body[1][0], v_body[1][1]); polygons.head_face.lineTo(v_body[11][0], v_body[11][1]); polygons.head_face.lineTo(v_body[2][0], v_body[2][1]); polygons.head_face.closePath();
    polygons.neck_white.moveTo(v_body[2][0], v_body[2][1]); polygons.neck_white.lineTo(v_body[11][0], v_body[11][1]); polygons.neck_white.lineTo(v_body[10][0], v_body[10][1]); polygons.neck_white.lineTo(v_body[9][0], v_body[9][1]); polygons.neck_white.closePath();
    polygons.wing_top.moveTo(v_body[4][0], v_body[4][1]); polygons.wing_top.lineTo(v_body[5][0], v_body[5][1]); polygons.wing_top.lineTo(v_body[10][0], v_body[10][1]); polygons.wing_top.lineTo(v_body[11][0], v_body[11][1]); polygons.wing_top.closePath();
    polygons.wing_bottom.moveTo(v_body[5][0], v_body[5][1]); polygons.wing_bottom.lineTo(v_body[7][0], v_body[7][1]); polygons.wing_bottom.lineTo(v_body[10][0], v_body[10][1]); polygons.wing_bottom.closePath();
    polygons.belly_top.moveTo(v_body[2][0], v_body[2][1]); polygons.belly_top.lineTo(v_body[9][0], v_body[9][1]); polygons.belly_top.lineTo(v_body[8][0], v_body[8][1]); polygons.belly_top.lineTo(v_body[10][0], v_body[10][1]); polygons.belly_top.closePath();
    polygons.belly_bottom.moveTo(v_body[7][0], v_body[7][1]); polygons.belly_bottom.lineTo(v_body[8][0], v_body[8][1]); polygons.belly_bottom.lineTo(v_body[10][0], v_body[10][1]); polygons.belly_bottom.closePath();
    
    // Beak and Tail are constructed from their own vertex sets
    polygons.beak.moveTo(v_beak[0][0], v_beak[0][1]); for (let i = 1; i < v_beak.length; i++) polygons.beak.lineTo(v_beak[i][0], v_beak[i][1]); polygons.beak.closePath();
    polygons.tail.moveTo(v_tail[0][0], v_tail[0][1]); for (let i = 1; i < v_tail.length; i++) polygons.tail.lineTo(v_tail[i][0], v_tail[i][1]); polygons.tail.closePath();
    
    // Render the polygons with their correct colors
    ctx.lineWidth = 0.1;
    ctx.strokeStyle = palette.outline;

    for (const part in polygons) {
        // --- FIX 2: Explicit Color Assignment ---
        // We explicitly look up the color for each part. If a color is missing from the palette
        // for some reason, we'll fall back to the beak color, and finally to black.
        const color = palette[part];
        ctx.fillStyle = color || palette.beak || '#000000';
        
        ctx.fill(polygons[part]);
        ctx.stroke(polygons[part]);
    }
}


export function drawBird(ctx, boid) {
    if (!boid.isAlive) return;
    ctx.save();
    ctx.translate(boid.position.x, boid.position.y);
    const angle = Math.atan2(boid.velocity.y, boid.velocity.x);
    ctx.rotate(angle);
    
    // --- FIX 3: Increased Bird Size ---
    ctx.scale(4, 4); // Birds are now larger and more visible
    
    drawBirdModel(ctx, boid);

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