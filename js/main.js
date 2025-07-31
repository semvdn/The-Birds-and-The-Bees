import {
    MIN_TREES, MAX_TREES, PASTEL_FLOWER_COLORS,
    TREE_PRESETS, SHRUB_PRESETS, WEED_PRESETS,
    BIRD_SETTINGS, BEE_SETTINGS, HIVE_SETTINGS, NEST_SETTINGS,
    MAX_BEES, MAX_BIRDS, MIN_HOME_SEPARATION, GLOBAL_WIND_STRENGTH,
    BIRD_GENES, PARENT_PRESETS
} from './presets.js';
import { setupPlantData } from './lsystem.js';
import { preRenderPlant, drawPlant } from './drawing.js';
import { Bird } from './boids/bird.js';
import { Bee } from './boids/bee.js';
import { drawBird, drawBee, drawHive, drawNest, drawHiveProgressBar } from './boids/drawing.js';

const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const beePopulationElement = document.getElementById('bee-population');
const birdPopulationElement = document.getElementById('bird-population');

let trees = [], shrubs = [], weeds = [], flowers = [];
let birds = [], bees = [];
let hives = [], nests = [];
let frame = 0;

function determineInheritance(genes1, genes2) {
    // Beak Inheritance (Dominance)
    const beak = genes1.beak.dominance >= genes2.beak.dominance ? genes1.beak : genes2.beak;

    // Tail Inheritance (Dominance)
    const tail = genes1.tail.dominance >= genes2.tail.dominance ? genes1.tail : genes2.tail;

    // Color Palette Inheritance (Co-dominance - 50/50 chance from either parent)
    const palette = Math.random() < 0.5 ? genes1.palette : genes2.palette;
    
    return { beak, tail, palette };
}


function recalculateHomePositions() {
    const allHomes = [...hives, ...nests];
    for (const home of allHomes) {
        const plant = home.tree;
        const trunkSway = Math.sin((frame / 220) + plant.x / 50) * 0.015 * GLOBAL_WIND_STRENGTH;
        let x = plant.x, y = canvas.height, angle = -90 * (Math.PI / 180) + trunkSway, length = plant.length * plant.scale;
        const stack = [];
        for(let i = 0; i < home.branchPoint.index; i++) {
            const command = plant.lindenmayerString[i];
            switch(command) {
                case 'F': x += length * Math.cos(angle); y += length * Math.sin(angle); break;
                case '+': angle += (Math.PI / 180) * plant.angle; break;
                case '-': angle -= (Math.PI / 180) * plant.angle; break;
                case '[': stack.push({ x, y, angle }); break;
                case ']': ({ x, y, angle } = stack.pop()); break;
            }
        }
        home.position.x = x; home.position.y = y;
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;
    recalculateHomePositions();

    const world = { birds, bees, flowers, hives, nests, canvas };
    const allPlants = [...trees, ...shrubs, ...weeds];
    allPlants.sort((a, b) => b.x - a.x);

    for (const plant of allPlants) {
        drawPlant(plant, ctx, canvas, frame);
        if (plant.plantType === 'tree') {
            for (const nest of nests) if (nest.tree === plant) drawNest(ctx, nest);
            for (const hive of hives) if (hive.tree === plant) drawHive(ctx, hive);
        }
    }

    for (const bird of birds) if (bird.isAlive) { bird.update(world); drawBird(ctx, bird); }
    for (const bee of bees) if (bee.isAlive) { bee.update(world); drawBee(ctx, bee); }
    
    bees = bees.filter(bee => bee.isAlive);
    birds = birds.filter(bird => bird.isAlive);
    const isOverlayVisible = !overlay.classList.contains('overlay-hidden');
    if (isOverlayVisible) updatePopulationDisplay();
    
    for (const hive of hives) {
        if (hive.nectar >= HIVE_SETTINGS.NECTAR_FOR_NEW_BEE && bees.length < MAX_BEES) {
            hive.nectar -= HIVE_SETTINGS.NECTAR_FOR_NEW_BEE;
            bees.push(new Bee(hive.position.x, hive.position.y, BEE_SETTINGS, hive));
        }
    }

    for (const nest of nests) {
        if (nest.occupants.size >= 2 && birds.length < MAX_BIRDS && !nest.hasEgg && nest.nestingCountdown <= 0) {
            nest.nestingCountdown = NEST_SETTINGS.NESTING_TIME_SECONDS * 60;
        }

        if (nest.occupants.size >= 2 && nest.nestingCountdown > 0) {
            nest.nestingCountdown--;
            if (nest.nestingCountdown <= 0) {
                nest.hasEgg = true;
                nest.hatchingCountdown = NEST_SETTINGS.HATCH_TIME_SECONDS * 60;
                
                const matingPair = Array.from(nest.occupants);
                nest.parentGenes = [matingPair[0].genes, matingPair[1].genes]; // Store genes for inheritance
                
                for (const parent of matingPair) parent.resetMating();
                nest.occupants.clear();
            }
        }

        if (nest.hasEgg) {
            nest.hatchingCountdown--;
            if (nest.hatchingCountdown <= 0) {
                const inheritedGenes = determineInheritance(nest.parentGenes[0], nest.parentGenes[1]);
                const newBird = new Bird(nest.position.x, nest.position.y, BIRD_SETTINGS, nest, inheritedGenes);
                birds.push(newBird);
                nest.hasEgg = false;
                nest.parentGenes = [];
            }
        }
    }

    const groundHeight = 30;
    ctx.fillStyle = '#4a5742'; ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
    if (isOverlayVisible) {
        for (const hive of hives) drawHiveProgressBar(ctx, hive, HIVE_SETTINGS.NECTAR_FOR_NEW_BEE);
    }
    requestAnimationFrame(animate);
}

function updatePopulationDisplay() {
    beePopulationElement.textContent = `Bee Population: ${bees.length}`;
    birdPopulationElement.textContent = `Bird Population: ${birds.length}`;
}

function getStaticBranchPosition(plant, branchPoint) {
    let x = plant.x, y = canvas.height, angle = -90 * (Math.PI / 180), length = plant.length * plant.scale;
    const stack = [];
    for(let i = 0; i < branchPoint.index; i++) {
        const command = plant.lindenmayerString[i];
        switch(command) {
            case 'F': x += length * Math.cos(angle); y += length * Math.sin(angle); break;
            case '+': angle += (Math.PI / 180) * plant.angle; break;
            case '-': angle -= (Math.PI / 180) * plant.angle; break;
            case '[': stack.push({ x, y, angle }); break;
            case ']': ({ x, y, angle } = stack.pop()); break;
        }
    }
    return { x, y };
}

function initialize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    trees = []; shrubs = []; weeds = []; flowers = [];
    birds = []; bees = []; hives = []; nests = [];
    
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

        let isHive = Math.random() > 0.5; const homesOnThisTree = [];
        for (const bp of plant.branchPoints) {
            const candidatePos = getStaticBranchPosition(plant, bp);
            let tooClose = homesOnThisTree.some(existingHome => Math.hypot(candidatePos.x - existingHome.position.x, candidatePos.y - existingHome.position.y) < MIN_HOME_SEPARATION);
            if (tooClose) continue;

            const newHome = { position: candidatePos, tree: plant, branchPoint: bp };
            if (isHive) {
                newHome.nectar = 0; hives.push(newHome);
            } else {
                newHome.occupants = new Set(); newHome.hasEgg = false; newHome.hatchingCountdown = 0; newHome.nestingCountdown = 0; newHome.parentGenes = [];
                const nestRadius = 15; newHome.radius = nestRadius; newHome.twigs = [];
                const numTwigs = 80; const brownPalette = ['#8B5A2B', '#654321', '#5C4033', '#A0522D'];
                for (let k = 0; k < numTwigs; k++) {
                    const angle1 = (10 + Math.random() * 160) * (Math.PI / 180), angle2 = angle1 + (Math.random() - 0.5) * 0.9, r1 = nestRadius * (0.8 + Math.random() * 0.4), r2 = nestRadius * (0.8 + Math.random() * 0.4);
                    const twig = { x1: Math.cos(angle1) * r1, y1: Math.sin(angle1) * r1, x2: Math.cos(angle2) * r2, y2: Math.sin(angle2) * r2, color: brownPalette[Math.floor(Math.random() * brownPalette.length)] };
                    twig.cpX = (twig.x1 + twig.x2) / 2 + (Math.random() - 0.5) * 10; twig.cpY = (twig.y1 + twig.y2) / 2 + (Math.random() - 0.5) * 5;
                    newHome.twigs.push(twig);
                }
                nests.push(newHome);
            }
            homesOnThisTree.push(newHome); isHive = !isHive;
        }
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
            plant.position = { x: plant.x, y: canvas.height - targetHeight/2 };
            plant.presetNectar = plant.nectar; flowers.push(plant);
        }
        preRenderPlant(plant, canvas); shrubs.push(plant);
    }

    const numWeeds = 40; const spacingWeeds = canvas.width / numWeeds;
    for (let i = 0; i < numWeeds; i++) {
        const preset = WEED_PRESETS[Math.floor(Math.random() * WEED_PRESETS.length)];
        const plant = setupPlantData(preset, 'weed');
        const targetHeight = canvas.height * (0.05 + Math.random() * 0.05);
        plant.scale = targetHeight / plant.unscaledHeight;
        plant.x = (i * spacingWeeds) + (spacingWeeds / 2) + (Math.random() - 0.5) * spacingWeeds;
        preRenderPlant(plant, canvas); weeds.push(plant);
    }

    if (nests.length > 0) {
        for (let i = 0; i < 10; i++) {
            const nest = nests[i % nests.length];
            const parentPreset = PARENT_PRESETS[i % PARENT_PRESETS.length];
            birds.push(new Bird(nest.position.x, nest.position.y, BIRD_SETTINGS, nest, parentPreset.genes));
        }
    }
    if (hives.length > 0) {
        for (let i = 0; i < 50; i++) {
            const hive = hives[i % hives.length];
            bees.push(new Bee(hive.position.x, hive.position.y, BEE_SETTINGS, hive));
        }
    }
}

window.addEventListener('resize', initialize);
window.addEventListener('keydown', (event) => {
    if (event.key === 'M' || event.key === 'm') {
        overlay.classList.toggle('overlay-hidden');
        if (!overlay.classList.contains('overlay-hidden')) {
            updatePopulationDisplay();
        }
    }
});
initialize();
animate();