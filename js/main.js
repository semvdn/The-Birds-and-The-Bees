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
    for (const hive of hives) drawHive(ctx, hive);
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
    
    // Bee Reproduction
    for (const hive of hives) {
        if (hive.nectar >= HIVE_SETTINGS.NECTAR_FOR_NEW_BEE && bees.length < MAX_BEES) {
            hive.nectar -= HIVE_SETTINGS.NECTAR_FOR_NEW_BEE;
            bees.push(new Bee(hive.position.x, hive.position.y, BEE_SETTINGS, hive));
        }
    }

    // Bird Reproduction
    for (const nest of nests) {
        if (nest.occupants.size >= 2 && birds.length < MAX_BIRDS) {
            const matingPair = Array.from(nest.occupants);
            
            // Spawn a new bird at the nest
            const newBird = new Bird(nest.position.x, nest.position.y, BIRD_SETTINGS, nest);
            birds.push(newBird);
            
            // Reset the parents so they can hunt again
            for (const parent of matingPair) {
                parent.resetMating();
            }
            
            // Clear the nest for the next couple
            nest.occupants.clear();
        }
    }


    // Draw ground
    const groundHeight = 30;
    ctx.fillStyle = '#4a5742';
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

    requestAnimationFrame(animate);
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
initialize();
animate();