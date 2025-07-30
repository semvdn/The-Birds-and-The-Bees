import {
    MIN_TREES, MAX_TREES, PASTEL_FLOWER_COLORS,
    TREE_PRESETS, SHRUB_PRESETS, WEED_PRESETS,
    BIRD_SETTINGS, INSECT_SETTINGS
} from './presets.js';
import { setupPlantData } from './lsystem.js';
import { preRenderPlant, drawPlant } from './drawing.js';
import { Bird } from './boids/bird.js';
import { Insect } from './boids/insect.js';
import { drawBird, drawInsect } from './boids/drawing.js';

const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');

const trees = [];
const shrubs = [];
const weeds = [];
let birds = [];
let insects = [];
let frame = 0;

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    // Draw plants
    for (const tree of trees) drawPlant(tree, ctx, canvas, frame);
    for (const shrub of shrubs) drawPlant(shrub, ctx, canvas, frame);
    for (const weed of weeds) drawPlant(weed, ctx, canvas, frame);

    // Update and draw boids
    for (const bird of birds) {
        bird.update(birds, birds, insects, canvas);
        drawBird(ctx, bird);
    }
    for (const insect of insects) {
        if (insect.isAlive) {
            insect.update(insects, birds, insects, canvas);
            drawInsect(ctx, insect);
        }
    }
    
    // Filter out dead insects
    insects = insects.filter(insect => insect.isAlive);

    // Draw ground
    const groundHeight = 30;
    ctx.fillStyle = '#4a5742';
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

    requestAnimationFrame(animate);
}

function initialize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    trees.length = 0; shrubs.length = 0; weeds.length = 0;
    birds.length = 0; insects.length = 0;

    // Initialize plants
    const numTrees = MIN_TREES + Math.floor(Math.random() * (MAX_TREES - MIN_TREES + 1));
    const spacingTrees = canvas.width / numTrees;
    for (let i = 0; i < numTrees; i++) {
        const preset = TREE_PRESETS[Math.floor(Math.random() * TREE_PRESETS.length)];
        const plant = setupPlantData(preset, 'tree');
        const targetHeight = canvas.height * (0.85 + Math.random() * 0.15);
        plant.scale = targetHeight / plant.unscaledHeight;
        plant.x = (i * spacingTrees) + (spacingTrees / 2) + (Math.random() - 0.5) * (spacingTrees * 0.5);
        preRenderPlant(plant, canvas);
        trees.push(plant);
    }

    const numShrubs = 15; const spacingShrubs = canvas.width / numShrubs;
    for (let i = 0; i < numShrubs; i++) {
        const preset = SHRUB_PRESETS[Math.floor(Math.random() * SHRUB_PRESETS.length)];
        const plant = setupPlantData(preset, 'shrub');
        const targetHeight = canvas.height * (0.15 + Math.random() * 0.1);
        plant.scale = targetHeight / plant.unscaledHeight;
        plant.x = (i * spacingShrubs) + (spacingShrubs / 2) + (Math.random() - 0.5) * spacingShrubs;
        if (plant.type === 'flower') {
            plant.flowerColor = PASTEL_FLOWER_COLORS[Math.floor(Math.random() * PASTEL_FLOWER_COLORS.length)];
        }
        preRenderPlant(plant, canvas);
        shrubs.push(plant);
    }

    const numWeeds = 40; const spacingWeeds = canvas.width / numWeeds;
    for (let i = 0; i < numWeeds; i++) {
        const preset = WEED_PRESETS[Math.floor(Math.random() * WEED_PRESETS.length)];
        const plant = setupPlantData(preset, 'weed');
        const targetHeight = canvas.height * (0.05 + Math.random() * 0.05);
        plant.scale = targetHeight / plant.unscaledHeight;
        plant.x = (i * spacingWeeds) + (spacingWeeds / 2) + (Math.random() - 0.5) * spacingWeeds;
        preRenderPlant(plant, canvas);
        weeds.push(plant);
    }

    // Initialize boids
    for (let i = 0; i < 10; i++) {
        birds.push(new Bird(Math.random() * canvas.width, Math.random() * canvas.height, BIRD_SETTINGS));
    }
    for (let i = 0; i < 50; i++) {
        insects.push(new Insect(Math.random() * canvas.width, Math.random() * canvas.height, INSECT_SETTINGS));
    }
}

window.addEventListener('resize', initialize);
initialize();
animate();