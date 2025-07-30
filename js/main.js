import {
    MIN_TREES, MAX_TREES, PASTEL_FLOWER_COLORS,
    TREE_PRESETS, SHRUB_PRESETS, WEED_PRESETS,
    BIRD_SETTINGS, BEE_SETTINGS, HIVE_SETTINGS, NEST_SETTINGS,
    MAX_BEES, MAX_BIRDS, MIN_HOME_SEPARATION, GLOBAL_WIND_STRENGTH
} from './presets.js';
import { setupPlantData } from './lsystem.js';
import { preRenderPlant, drawPlant } from './drawing.js';
import { Bird } from './boids/bird.js';
import { Bee } from './boids/bee.js';
import { drawBird, drawBee, drawHive, drawNest } from './boids/drawing.js';

const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const beePopulationElement = document.getElementById('bee-population');
const birdPopulationElement = document.getElementById('bird-population');

let trees = [], shrubs = [], weeds = [], flowers = [];
let birds = [], bees = [];
let hives = [], nests = [];
let frame = 0;

function recalculateHomePositions() {
    const allHomes = [...hives, ...nests];
    for (const home of allHomes) {
        const plant = home.tree;
        const trunkSway = Math.sin((frame / 220) + plant.x / 50) * 0.015 * GLOBAL_WIND_STRENGTH;

        let x = plant.x;
        let y = canvas.height;
        let angle = -90 * (Math.PI / 180) + trunkSway;
        let length = plant.length * plant.scale;
        
        const stack = [];

        for(let i = 0; i < home.branchPoint.index; i++) {
            const command = plant.lindenmayerString[i];
            switch(command) {
                case 'F': 
                    x += length * Math.cos(angle); 
                    y += length * Math.sin(angle); 
                    break;
                case '+': angle += (Math.PI / 180) * plant.angle; break;
                case '-': angle -= (Math.PI / 180) * plant.angle; break;
                case '[': stack.push({ x, y, angle }); break;
                case ']': ({ x, y, angle } = stack.pop()); break;
            }
        }
        home.position.x = x;
        home.position.y = y;
    }
}


function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    recalculateHomePositions();

    const world = { birds, bees, flowers, hives, nests, canvas };

    // Update and draw plants
    for (const tree of trees) drawPlant(tree, ctx, canvas, frame);
    for (const shrub of shrubs) {
        if (shrub.type === 'flower' && shrub.nectar < shrub.presetNectar) {
            shrub.nectar += shrub.nectarRegen;
        }
        drawPlant(shrub, ctx, canvas, frame);
    }
    for (const weed of weeds) drawPlant(weed, ctx, canvas, frame);

    // Draw nests and hives
    const isOverlayVisible = !overlay.classList.contains('overlay-hidden');
    for (const hive of hives) drawHive(ctx, hive, isOverlayVisible, HIVE_SETTINGS.NECTAR_FOR_NEW_BEE);
    for (const nest of nests) drawNest(ctx, nest);

    // Update and draw boids
    for (const bird of birds) {
        if (bird.isAlive) {
            // Change color if bird is ready to mate
            const originalFill = ctx.fillStyle;
            if (bird.state === 'SEEKING_MATE') {
                ctx.fillStyle = '#3333ff'; // Blue when seeking
            }
            bird.update(world);
            drawBird(ctx, bird);
            ctx.fillStyle = originalFill;
        }
    }
    for (const bee of bees) {
        if (bee.isAlive) {
            bee.update(world);
            drawBee(ctx, bee);
        }
    }
    
    // Filter out dead boids
    bees = bees.filter(bee => bee.isAlive);
    birds = birds.filter(bird => bird.isAlive);

    // Update population display if overlay is visible
    if (!overlay.classList.contains('overlay-hidden')) {
        updatePopulationDisplay();
    }
    
    // Bee Reproduction
    for (const hive of hives) {
        if (hive.nectar >= HIVE_SETTINGS.NECTAR_FOR_NEW_BEE && bees.length < MAX_BEES) {
            hive.nectar -= HIVE_SETTINGS.NECTAR_FOR_NEW_BEE;
            bees.push(new Bee(hive.position.x, hive.position.y, BEE_SETTINGS, hive));
        }
    }

    // Bird Reproduction
    for (const nest of nests) {
        if (nest.occupants.size >= 2 && birds.length < MAX_BIRDS && !nest.hasEgg && nest.nestingCountdown <= 0) {
            // Start nesting countdown
            nest.nestingCountdown = NEST_SETTINGS.NESTING_TIME_SECONDS * 1000;
            console.log(`Nest at (${nest.position.x}, ${nest.position.y}) has two birds. Starting nesting countdown: ${nest.nestingCountdown / 1000} seconds.`);
        }

        if (nest.occupants.size >= 2 && nest.nestingCountdown > 0) {
            nest.nestingCountdown -= (1000 / 60); // Decrement nesting countdown
            if (nest.nestingCountdown <= 0) {
                // Lay egg
                nest.hasEgg = true;
                nest.hatchingCountdown = NEST_SETTINGS.HATCH_TIME_SECONDS * 1000;
                console.log(`Nest at (${nest.position.x}, ${nest.position.y}) now has an egg. Hatching in ${nest.hatchingCountdown / 1000} seconds.`);

                // Reset parents and clear nest occupants after egg is laid
                const matingPair = Array.from(nest.occupants);
                for (const parent of matingPair) {
                    parent.resetMating();
                }
                nest.occupants.clear();
            }
        }

        // Handle egg hatching
        if (nest.hasEgg) {
            nest.hatchingCountdown -= (1000 / 60); // Assuming 60 FPS, decrement by time per frame
            if (nest.hatchingCountdown <= 0) {
                // Spawn a new bird at the nest
                const newBird = new Bird(nest.position.x, nest.position.y, BIRD_SETTINGS, nest);
                birds.push(newBird);
                console.log(`Bird hatched at nest (${nest.position.x}, ${nest.position.y})!`);

                // Reset nest state
                nest.hasEgg = false;
                nest.hatchingCountdown = 0;
            }
        }
    }


    // Draw ground
    const groundHeight = 30;
    ctx.fillStyle = '#4a5742';
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

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

        let isHive = Math.random() > 0.5;
        const homesOnThisTree = [];
        for (const bp of plant.branchPoints) {
            const candidatePos = getStaticBranchPosition(plant, bp);

            let tooClose = false;
            for(const existingHome of homesOnThisTree) {
                const dist = Math.hypot(candidatePos.x - existingHome.position.x, candidatePos.y - existingHome.position.y);
                if (dist < MIN_HOME_SEPARATION) {
                    tooClose = true;
                    break;
                }
            }
            if (tooClose) continue;

            const newHome = { position: candidatePos, tree: plant, branchPoint: bp };
            
            if (isHive) {
                newHome.nectar = 0;
                hives.push(newHome);
            } else {
                newHome.occupants = new Set();
                newHome.hasEgg = false; // Initialize nest without an egg
                newHome.hatchingCountdown = 0; // Initialize countdown
                newHome.nestingCountdown = 0; // Initialize nesting countdown
                const nestRadius = 15;
                newHome.radius = nestRadius; // Add radius property for drawing offset
                newHome.twigs = [];
                const numTwigs = 80;
                const brownPalette = ['#8B5A2B', '#654321', '#5C4033', '#A0522D'];

                for (let k = 0; k < numTwigs; k++) {
                    const angle1 = (10 + Math.random() * 160) * (Math.PI / 180);
                    const angle2 = angle1 + (Math.random() - 0.5) * 0.9;
                    const r1 = nestRadius * (0.8 + Math.random() * 0.4);
                    const r2 = nestRadius * (0.8 + Math.random() * 0.4);

                    const twig = {
                        x1: Math.cos(angle1) * r1,
                        y1: Math.sin(angle1) * r1,
                        x2: Math.cos(angle2) * r2,
                        y2: Math.sin(angle2) * r2,
                        color: brownPalette[Math.floor(Math.random() * brownPalette.length)]
                    };
                    
                    twig.cpX = (twig.x1 + twig.x2) / 2 + (Math.random() - 0.5) * 10;
                    twig.cpY = (twig.y1 + twig.y2) / 2 + (Math.random() - 0.5) * 5;
                    newHome.twigs.push(twig);
                }
                nests.push(newHome);
            }
            homesOnThisTree.push(newHome);
            isHive = !isHive;
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
            plant.presetNectar = plant.nectar;
            flowers.push(plant);
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

    if (nests.length > 0) {
        for (let i = 0; i < 10; i++) {
            const nest = nests[i % nests.length];
            birds.push(new Bird(nest.position.x, nest.position.y, BIRD_SETTINGS, nest));
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
            updatePopulationDisplay(); // Update immediately when shown
        }
    }
});
initialize();
animate();