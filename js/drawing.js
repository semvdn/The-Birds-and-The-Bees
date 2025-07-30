import { SHRUB_WIND_MULTIPLIER, WEED_WIND_MULTIPLIER, GLOBAL_WIND_STRENGTH } from './presets.js';

function drawStaticLeaf(oCtx, plant) {
    oCtx.fillStyle = plant.leafColor + 'aa';
    oCtx.beginPath();
    switch (plant.leafShape) {
        case 'classic': oCtx.moveTo(0, 0); oCtx.quadraticCurveTo(5, -5, 0, -15); oCtx.quadraticCurveTo(-5, -5, 0, 0); break;
        case 'maple': oCtx.moveTo(0, 0); oCtx.lineTo(2, -4); oCtx.lineTo(6, -4); oCtx.lineTo(4, -6); oCtx.lineTo(5, -10); oCtx.lineTo(0, -8); oCtx.lineTo(-5, -10); oCtx.lineTo(-4, -6); oCtx.lineTo(-6, -4); oCtx.lineTo(-2, -4); break;
        case 'willow': oCtx.scale(0.6, 1); oCtx.arc(0, -10, 5, 0, Math.PI * 2); oCtx.setTransform(oCtx.getTransform()); break;
        case 'broad': oCtx.moveTo(0, 0); oCtx.quadraticCurveTo(8, -8, 0, -20); oCtx.quadraticCurveTo(-8, -8, 0, 0); break;
        case 'oval': default: oCtx.arc(0, -5, 5, 0, Math.PI * 2); break;
    }
    oCtx.fill();
}

function drawStaticFlower(oCtx, plant) {
    oCtx.fillStyle = plant.flowerColor; oCtx.strokeStyle = 'rgba(0,0,0,0.1)'; oCtx.lineWidth = 0.5;
    switch (plant.flowerShape) {
        case 'bell': oCtx.beginPath(); oCtx.arc(0, 0, 4, 0, Math.PI); oCtx.lineTo(-4, 0); oCtx.lineTo(0, -6); oCtx.lineTo(4, 0); oCtx.fill(); oCtx.stroke(); break;
        case 'starburst': oCtx.beginPath(); for (let i = 0; i < 8; i++) { const angle = (Math.PI / 4) * i; const len = i % 2 === 0 ? 6 : 3; oCtx.moveTo(0, 0); oCtx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len); } oCtx.stroke(); break;
        case 'petal': default: for (let i = 0; i < 5; i++) { oCtx.beginPath(); oCtx.arc(0, -4, 2.5, 0, Math.PI * 2); oCtx.fill(); oCtx.stroke(); oCtx.rotate((Math.PI * 2) / 5); } break;
    }
}

export function preRenderPlant(plant, canvas) {
    const offscreenCanvas = document.createElement('canvas');
    const oCtx = offscreenCanvas.getContext('2d');
    const renderSize = plant.plantType === 'tree' ? canvas.height * 2 : canvas.height * 1.5;
    offscreenCanvas.width = renderSize;
    offscreenCanvas.height = renderSize;

    oCtx.save();
    oCtx.translate(renderSize / 2, renderSize);
    oCtx.scale(plant.scale, plant.scale);
    oCtx.lineCap = 'round';
    oCtx.lineWidth = plant.initialThickness;

    let barkColorIndex = 0;
    for (const command of plant.lindenmayerString) {
        switch (command) {
            case 'F':
                oCtx.strokeStyle = plant.barkColors[barkColorIndex++];
                oCtx.beginPath(); oCtx.moveTo(0, 0); oCtx.lineTo(0, -plant.length); oCtx.stroke();
                oCtx.translate(0, -plant.length);
                oCtx.lineWidth *= 0.98;
                break;
            case 'L': drawStaticLeaf(oCtx, plant); break;
            case 'O': drawStaticFlower(oCtx, plant); break;
            case '+': oCtx.rotate((Math.PI / 180) * plant.angle); break;
            case '-': oCtx.rotate(-(Math.PI / 180) * plant.angle); break;
            case '[': plant.stack.push({ transform: oCtx.getTransform(), lineWidth: oCtx.lineWidth }); oCtx.lineWidth *= 0.7; break;
            case ']': const state = plant.stack.pop(); oCtx.setTransform(state.transform); oCtx.lineWidth = state.lineWidth; break;
        }
    }
    oCtx.restore();
    plant.preRenderedCanvas = offscreenCanvas;
    plant.renderHeight = renderSize;
}

export function drawPlant(plant, ctx, canvas, frame) {
    ctx.save();
    let windMultiplier = 1.0;
    if (plant.plantType === 'shrub') windMultiplier = SHRUB_WIND_MULTIPLIER;
    if (plant.plantType === 'weed') windMultiplier = WEED_WIND_MULTIPLIER;
    const windStrength = GLOBAL_WIND_STRENGTH * windMultiplier;
    const trunkSway = Math.sin((frame / 220) + plant.x / 50) * 0.015 * windStrength;
    
    ctx.translate(plant.x, canvas.height);
    ctx.rotate(trunkSway);
    
    ctx.drawImage(plant.preRenderedCanvas, -plant.renderHeight / 2, -plant.renderHeight);
    ctx.restore();
}