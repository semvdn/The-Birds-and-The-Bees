import {
    MIN_TREES, MAX_TREES, PASTEL_FLOWER_COLORS,
    TREE_PRESETS, SHRUB_PRESETS, WEED_PRESETS,
    BIRD_SETTINGS, BEE_SETTINGS, HIVE_SETTINGS, NEST_SETTINGS,
    MAX_BEES, MAX_BIRDS, MIN_HOME_SEPARATION, GLOBAL_WIND_STRENGTH, MIN_FLOWERS,
    BIRD_GENES, PARENT_PRESETS, MUTATION_RATE, MUTATION_AMOUNT,
    BIRD_DNA_TEMPLATE, BEE_DNA_TEMPLATE, GROUND_HEIGHT,
    BEE_POPULATION_THRESHOLD, HIVE_DANGER_RADIUS, HIVE_DANGER_WEIGHT
} from './presets.js';
import { setupPlantData } from './lsystem.js';
import { preRenderPlant, drawPlant } from './drawing.js';
import { Bird } from './boids/bird.js';
import { Bee } from './boids/bee.js';
import { 
    drawBird, drawBee, drawHive, drawNest, drawHiveProgressBar, 
    preRenderHive, preRenderNest 
} from './boids/drawing.js';
import { Grid } from './boids/grid.js';

const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const beePopulationElement = document.getElementById('bee-population');
const birdPopulationElement = document.getElementById('bird-population');

const populationGraphDetails = document.querySelector('#population-graph').closest('details');
const beeViolinDetails = document.querySelector('#bee-violin-plot').closest('details');
const birdViolinDetails = document.querySelector('#bird-violin-plot').closest('details');

let trees = [], shrubs = [], weeds = [], flowers = [];
let birds = [], bees = [];
let hives = [], nests = [];
let frame = 0;
let birdGrid, beeGrid;
let isOverlayVisible = false;

// --- Data for Graphs ---
let populationHistory = { time: [], bees: [], birds: [] };
let traitHistory = {};


function initializeTraitHistory() {
    traitHistory = { time: [], birds: {}, bees: {} };
    Object.keys(BIRD_DNA_TEMPLATE).forEach(trait => {
        traitHistory.birds[trait] = { mean: [], min: [], max: [] };
    });
    Object.keys(BEE_DNA_TEMPLATE).forEach(trait => {
        traitHistory.bees[trait] = { mean: [], min: [], max: [] };
    });
}

function mutate(value, min, max) {
    if (Math.random() < MUTATION_RATE) {
        const range = max - min;
        const change = (Math.random() - 0.5) * 2 * range * MUTATION_AMOUNT;
        return Math.max(min, Math.min(max, value + change));
    }
    return value;
}

function blendHexColors(hex1, hex2) {
    const num1 = parseInt(hex1.slice(1), 16), num2 = parseInt(hex2.slice(1), 16);
    const r1 = (num1 >> 16) & 0xFF, g1 = (num1 >> 8) & 0xFF, b1 = num1 & 0xFF;
    const r2 = (num2 >> 16) & 0xFF, g2 = (num2 >> 8) & 0xFF, b2 = num2 & 0xFF;
    const avgR = Math.floor((r1 + r2) / 2), avgG = Math.floor((g1 + g2) / 2), avgB = Math.floor((b1 + b2) / 2);
    const newHex = ((avgR << 16) | (avgG << 8) | avgB).toString(16).padStart(6, '0');
    return `#${newHex}`;
}

function mutateHexColor(hex) {
    if (Math.random() > MUTATION_RATE) return hex;
    let num = parseInt(hex.slice(1), 16);
    let r = (num >> 16) & 0xFF, g = (num >> 8) & 0xFF, b = num & 0xFF;
    const amount = 30;
    r = Math.max(0, Math.min(255, r + Math.floor((Math.random() - 0.5) * amount)));
    g = Math.max(0, Math.min(255, g + Math.floor((Math.random() - 0.5) * amount)));
    b = Math.max(0, Math.min(255, b + Math.floor((Math.random() - 0.5) * amount)));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function interpolateVertices(v1, v2, weight) {
    return v1.map((p1, i) => {
        const p2 = v2[i];
        const newX = (1 - weight) * p1[0] + weight * p2[0];
        const newY = (1 - weight) * p1[1] + weight * p2[1];
        return [newX, newY];
    });
}

function mutateVertices(vertices, ignoreIndices = []) {
    if (Math.random() > MUTATION_RATE) return vertices;
    const amount = 0.2;
    return vertices.map((v, i) => {
        if (ignoreIndices.includes(i)) return v;
        return [ v[0] + (Math.random() - 0.5) * amount, v[1] + (Math.random() - 0.5) * amount ];
    });
}

function determineInheritance(genes1, dna1, genes2, dna2) {
    const inheritedDna = {};
    for (const key in dna1) {
        const avg = (dna1[key] + dna2[key]) / 2;
        const template = BIRD_DNA_TEMPLATE[key];
        inheritedDna[key] = mutate(avg, template.min, template.max);
    }
    const weight = Math.random();
    const newBodyVertices = interpolateVertices(genes1.bodyVertices, genes2.bodyVertices, weight);
    let inheritedBaseBeak = Math.random() < 0.5 ? genes1.baseGenes.baseBeak : genes2.baseGenes.baseBeak;
    let newBeakVertices;
    if (Math.random() < MUTATION_RATE) {
        const beakKeys = Object.keys(BIRD_GENES.BEAK_SHAPES);
        inheritedBaseBeak = BIRD_GENES.BEAK_SHAPES[beakKeys[Math.floor(Math.random() * beakKeys.length)]];
        newBeakVertices = inheritedBaseBeak.vertices;
    } else {
        const interpolatedBeak = interpolateVertices(genes1.beakVertices, genes2.beakVertices, weight);
        newBeakVertices = mutateVertices(interpolatedBeak, [2]);
    }
    let inheritedBaseTail = Math.random() < 0.5 ? genes1.baseGenes.baseTail : genes2.baseGenes.baseTail;
    let newTailVertices;
    if (Math.random() < MUTATION_RATE) {
        const tailKeys = Object.keys(BIRD_GENES.TAIL_SHAPES);
        inheritedBaseTail = BIRD_GENES.TAIL_SHAPES[tailKeys[Math.floor(Math.random() * tailKeys.length)]];
        newTailVertices = inheritedBaseTail.vertices(newBodyVertices);
    } else {
        const tail1 = genes1.baseGenes.baseTail.vertices(newBodyVertices);
        const tail2 = genes2.baseGenes.baseTail.vertices(newBodyVertices);
        const interpolatedTail = interpolateVertices(tail1, tail2, weight);
        newTailVertices = mutateVertices(interpolatedTail, [0, interpolatedTail.length - 1]);
    }
    const palette1 = genes1.palette.colors, palette2 = genes2.palette.colors;
    const newPaletteColors = {};
    for (const key in palette1) {
        if (key === 'outline' || key === 'beak') { newPaletteColors[key] = palette1[key]; } 
        else {
            const blendedColor = blendHexColors(palette1[key], palette2[key]);
            newPaletteColors[key] = mutateHexColor(blendedColor);
        }
    }
    const newPalette = { name: "Hybrid", colors: newPaletteColors };
    const inheritedGenes = {
        palette: newPalette, bodyVertices: newBodyVertices, beakVertices: newBeakVertices,
        tailVertices: newTailVertices, baseGenes: { baseBeak: inheritedBaseBeak, baseTail: inheritedBaseTail, }
    };
    return { inheritedGenes, inheritedDna };
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

    if (frame % 120 === 0) {
        const currentTime = frame / 60;
        
        populationHistory.time.push(currentTime);
        populationHistory.bees.push(bees.length);
        populationHistory.birds.push(birds.length);
        if (populationHistory.time.length > 100) {
            populationHistory.time.shift();
            populationHistory.bees.shift();
            populationHistory.birds.shift();
        }

        traitHistory.time.push(currentTime);
        Object.keys(BIRD_DNA_TEMPLATE).forEach(trait => {
            const values = birds.filter(b => b.isAlive).map(b => b.dna[trait]);
            if (values.length > 0) {
                traitHistory.birds[trait].mean.push(values.reduce((a, b) => a + b, 0) / values.length);
                traitHistory.birds[trait].min.push(Math.min(...values));
                traitHistory.birds[trait].max.push(Math.max(...values));
            } else {
                traitHistory.birds[trait].mean.push(null);
                traitHistory.birds[trait].min.push(null);
                traitHistory.birds[trait].max.push(null);
            }
        });
        Object.keys(BEE_DNA_TEMPLATE).forEach(trait => {
            const values = bees.filter(b => b.isAlive).map(b => b.dna[trait]);
            if (values.length > 0) {
                traitHistory.bees[trait].mean.push(values.reduce((a, b) => a + b, 0) / values.length);
                traitHistory.bees[trait].min.push(Math.min(...values));
                traitHistory.bees[trait].max.push(Math.max(...values));
            } else {
                traitHistory.bees[trait].mean.push(null);
                traitHistory.bees[trait].min.push(null);
                traitHistory.bees[trait].max.push(null);
            }
        });
    }

    birdGrid.clear();
    for (const bird of birds) if (bird.isAlive) birdGrid.insert(bird);
    beeGrid.clear();
    for (const bee of bees) if (bee.isAlive) beeGrid.insert(bee);
    recalculateHomePositions();
    const world = { birds, bees, flowers, hives, nests, canvas, birdGrid, beeGrid, groundHeight: GROUND_HEIGHT };
    for (const flower of flowers) {
        for (const petal of flower.petalPoints) {
            petal.nectar = Math.min(1, petal.nectar + 0.0005);
        }
    }
    const allPlants = [...trees, ...shrubs, ...weeds];
    allPlants.sort((a, b) => b.x - a.x);
    for (const plant of allPlants) {
        drawPlant(plant, ctx, canvas, frame);
        if (plant.plantType === 'tree') {
            for (const nest of nests) if (nest.tree === plant) drawNest(ctx, nest);
            for (const hive of hives) if (hive.tree === plant) drawHive(ctx, hive);
        }
    }
    for (const bird of birds) { bird.update(world); drawBird(ctx, bird); }
    for (const bee of bees) { bee.update(world); drawBee(ctx, bee); }
    
    bees = bees.filter(bee => !bee.vanished);
    birds = birds.filter(bird => !bird.vanished);

    if (birds.length < 2 || bees.length < 2) {
        frame = 0;
        initialize();
        requestAnimationFrame(animate); 
        return; 
    }

    for (const hive of hives) {
        const costForTwoBees = HIVE_SETTINGS.NECTAR_FOR_NEW_BEE * 2;
        if (hive.nectar >= costForTwoBees && bees.length < MAX_BEES - 1) {
            hive.nectar -= costForTwoBees;
            const baseBeeDna = {};
            if (hive.contributorCount > 0) {
                for (const key in BEE_DNA_TEMPLATE) { baseBeeDna[key] = hive.dnaPool[key] / hive.contributorCount; }
            } else { 
                for (const key in BEE_DNA_TEMPLATE) { baseBeeDna[key] = BEE_DNA_TEMPLATE[key].initial; }
            }
            const bee1Dna = {};
            for (const key in baseBeeDna) {
                const template = BEE_DNA_TEMPLATE[key];
                bee1Dna[key] = mutate(baseBeeDna[key], template.min, template.max);
            }
            bees.push(new Bee(hive.position.x + (Math.random()-0.5)*5, hive.position.y + (Math.random()-0.5)*5, BEE_SETTINGS, hive, bee1Dna));
            const bee2Dna = {};
            for (const key in baseBeeDna) {
                const template = BEE_DNA_TEMPLATE[key];
                bee2Dna[key] = mutate(baseBeeDna[key], template.min, template.max);
            }
            bees.push(new Bee(hive.position.x + (Math.random()-0.5)*5, hive.position.y + (Math.random()-0.5)*5, BEE_SETTINGS, hive, bee2Dna));
            hive.contributorCount = 0;
            for (const key in hive.dnaPool) { hive.dnaPool[key] = 0; }
        }
    }
    for (const nest of nests) {
        if (nest.occupants.size >= 2 && nest.isAvailable === false && !nest.hasEgg && nest.nestingCountdown <= 0) {
            nest.nestingCountdown = NEST_SETTINGS.NESTING_TIME_SECONDS * 60;
        }
        if (nest.occupants.size >= 2 && nest.nestingCountdown > 0) {
            nest.nestingCountdown--;
            if (nest.nestingCountdown <= 0) {
                nest.hasEgg = true;
                nest.hatchingCountdown = NEST_SETTINGS.HATCH_TIME_SECONDS * 60;
                const matingPair = Array.from(nest.occupants);
                nest.parentGenes = [matingPair[0].genes, matingPair[1].genes];
                nest.parentDna = [matingPair[0].dna, matingPair[1].dna];
                for (const parent of matingPair) parent.resetMating();
                nest.occupants.clear();
            }
        }
        if (nest.hasEgg) {
            nest.hatchingCountdown--;
            if (nest.hatchingCountdown <= 0) {
                const { inheritedGenes, inheritedDna } = determineInheritance(
                    nest.parentGenes[0], nest.parentDna[0], nest.parentGenes[1], nest.parentDna[1]
                );
                const newBird = new Bird(nest.position.x, nest.position.y, BIRD_SETTINGS, nest, inheritedGenes, inheritedDna);
                birds.push(newBird);
                nest.hasEgg = false; 
                nest.isAvailable = true;
                nest.parentGenes = []; 
                nest.parentDna = [];
            }
        }
    }
    ctx.fillStyle = '#4a5742'; 
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
    if (isOverlayVisible) {
        updateOverlay();
        for (const hive of hives) drawHiveProgressBar(ctx, hive, HIVE_SETTINGS.NECTAR_FOR_NEW_BEE * 2);
    }
    requestAnimationFrame(animate);
}

function updateOverlay() {
    beePopulationElement.textContent = `Bee Population: ${bees.length}`;
    birdPopulationElement.textContent = `Bird Population: ${birds.length}`;
    if (frame % 120 === 0) {
        if (populationGraphDetails.open) { drawPopulationGraph(); }
        if (beeViolinDetails.open) { drawTraitEvolutionGraphs('bee-violin-plot', traitHistory.bees, BEE_DNA_TEMPLATE, 'Bee'); }
        if (birdViolinDetails.open) { drawTraitEvolutionGraphs('bird-violin-plot', traitHistory.birds, BIRD_DNA_TEMPLATE, 'Bird'); }
    }
}

function drawPopulationGraph() {
    const graphDiv = document.getElementById('population-graph');
    const beeTrace = { x: populationHistory.time, y: populationHistory.bees, mode: 'lines', name: 'Bees', line: { color: '#FFC300' } };
    const birdTrace = { x: populationHistory.time, y: populationHistory.birds, mode: 'lines', name: 'Birds', line: { color: '#87CEFA' } };
    const layout = {
        title: 'Population Over Time', xaxis: { title: 'Time (s)', gridcolor: '#444' }, yaxis: { title: 'Population', gridcolor: '#444' },
        margin: { t: 30, l: 40, r: 20, b: 30 }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0.2)',
        font: { color: 'white' }, legend: { x: 0.1, y: 0.9 }
    };
    if (graphDiv._fullView) { Plotly.react(graphDiv, [beeTrace, birdTrace], layout); }
    else { Plotly.newPlot(graphDiv, [beeTrace, birdTrace], layout, {responsive: true}); }
}

function drawTraitEvolutionGraphs(elementId, history, template, titlePrefix) {
    const graphDiv = document.getElementById(elementId);
    const traits = Object.keys(template);
    if (traitHistory.time.length < 2) {
        if (graphDiv._fullView) { Plotly.purge(graphDiv); }
        graphDiv.innerHTML = `<p style="padding: 10px;">Not enough data for ${titlePrefix.toLowerCase()} trait plots.</p>`;
        return;
    }
    const plotData = [];
    const layout = {
        title: `${titlePrefix} Trait Evolution Over Time`,
        height: traits.length * 160,
        margin: { t: 40, l: 60, r: 20, b: 20 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0.2)',
        font: { color: 'white' },
        showlegend: false,
        grid: { rows: traits.length, columns: 1, pattern: 'independent' }
    };

    traits.forEach((trait, i) => {
        const { mean, min, max } = history[trait];
        const time = traitHistory.time;
        const color = titlePrefix === 'Bee' ? '#FFC300' : '#87CEFA';
        
        plotData.push({ x: time, y: max, mode: 'lines', line: {width: 0}, showlegend: false, xaxis: `x${i+1}`, yaxis: `y${i+1}` });
        plotData.push({ x: time, y: min, mode: 'lines', line: {width: 0}, fill: 'tonexty', fillcolor: 'rgba(255,255,255,0.1)', showlegend: false, xaxis: `x${i+1}`, yaxis: `y${i+1}` });
        plotData.push({ x: time, y: mean, mode: 'lines', line: {color: color}, name: trait, xaxis: `x${i+1}`, yaxis: `y${i+1}` });

        layout[`yaxis${i+1}`] = {
            title: trait,
            autorange: true,
            gridcolor: '#444'
        };
        layout[`xaxis${i+1}`] = { 
            showticklabels: i === traits.length - 1,
            range: [0, time[time.length - 1]] 
        };
    });

    if (graphDiv._fullView) { Plotly.react(graphDiv, plotData, layout); }
    else { Plotly.newPlot(graphDiv, plotData, layout, {responsive: true}); }
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
    
    const cellSize = 100;
    birdGrid = new Grid(canvas.width, canvas.height, cellSize);
    beeGrid = new Grid(canvas.width, canvas.height, cellSize);
    
    // --- Clear all plotting history for a fresh start ---
    initializeTraitHistory();
    populationHistory = { time: [], bees: [], birds: [] };

    let generationAttempts = 0;
    const maxAttempts = 50;

    while (generationAttempts < maxAttempts) {
        trees = []; 
        hives = []; 
        nests = [];
        let allPotentialHomes = [];

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

            let firstBranchY = Infinity;
            if (plant.branchPoints.length > 0) {
                firstBranchY = getStaticBranchPosition(plant, plant.branchPoints[0]).y;
            }

            let validBranchPointsOnTree = [];
            for (const bp of plant.branchPoints) {
                const candidatePos = getStaticBranchPosition(plant, bp);
                if (Math.abs(candidatePos.y - firstBranchY) > 1.0) {
                    if (!validBranchPointsOnTree.some(p => Math.hypot(p.position.x - candidatePos.x, p.position.y - candidatePos.y) < MIN_HOME_SEPARATION)) {
                        const homeInfo = { position: candidatePos, tree: plant, branchPoint: bp };
                        validBranchPointsOnTree.push(homeInfo);
                    }
                }
            }
            allPotentialHomes.push(...validBranchPointsOnTree);
        }

        if (allPotentialHomes.length > 0) {
            for (let i = allPotentialHomes.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allPotentialHomes[i], allPotentialHomes[j]] = [allPotentialHomes[j], allPotentialHomes[i]];
            }

            const numHives = Math.ceil(allPotentialHomes.length / 2);

            for (let i = 0; i < allPotentialHomes.length; i++) {
                const homeInfo = allPotentialHomes[i];
                if (i < numHives) {
                    const newHive = { ...homeInfo, nectar: 0, dnaPool: {}, contributorCount: 0, knownFlowerLocations: [], beesEnRoute: 0 };
                    for (const key in BEE_DNA_TEMPLATE) newHive.dnaPool[key] = 0;
                    hives.push(newHive);
                    preRenderHive(newHive);
                } else {
                    const newNest = { ...homeInfo, occupants: new Set(), hasEgg: false, hatchingCountdown: 0, nestingCountdown: 0, parentGenes: [], parentDna: [], isAvailable: true };
                    const nestRadius = 15; newNest.radius = nestRadius; newNest.twigs = [];
                    const numTwigs = 80; const brownPalette = ['#8B5A2B', '#654321', '#5C4033', '#A0522D'];
                    for (let k = 0; k < numTwigs; k++) {
                        const angle1 = (10 + Math.random() * 160) * (Math.PI / 180), angle2 = angle1 + (Math.random() - 0.5) * 0.9, r1 = nestRadius * (0.8 + Math.random() * 0.4), r2 = nestRadius * (0.8 + Math.random() * 0.4);
                        const twig = { x1: Math.cos(angle1) * r1, y1: Math.sin(angle1) * r1, x2: Math.cos(angle2) * r2, y2: Math.sin(angle2) * r2, color: brownPalette[Math.floor(Math.random() * brownPalette.length)] };
                        twig.cpX = (twig.x1 + twig.x2) / 2 + (Math.random() - 0.5) * 10; twig.cpY = (twig.y1 + twig.y2) / 2 + (Math.random() - 0.5) * 5;
                        newNest.twigs.push(twig);
                    }
                    nests.push(newNest);
                    preRenderNest(newNest);
                }
            }
        }

        if (hives.length >= 2 && nests.length >= 2) {
            break; 
        }
        
        generationAttempts++;
    }

    if (generationAttempts >= maxAttempts) {
        console.warn(`Failed to generate a world with at least 2 nests and 2 hives after ${maxAttempts} attempts. The simulation may be unbalanced.`);
    }

    shrubs = []; weeds = []; flowers = [];
    birds = []; bees = [];

    const flowerPresets = SHRUB_PRESETS.filter(p => p.type === 'flower');
    const numShrubs = 15; const spacingShrubs = canvas.width / numShrubs;
    for (let i = 0; i < numShrubs; i++) {
        let preset = (i < MIN_FLOWERS && flowerPresets.length > 0) ? flowerPresets[Math.floor(Math.random() * flowerPresets.length)] : SHRUB_PRESETS[Math.floor(Math.random() * SHRUB_PRESETS.length)];
        const plant = setupPlantData(preset, 'shrub');
        const targetHeight = canvas.height * (0.15 + Math.random() * 0.1);
        plant.scale = targetHeight / plant.unscaledHeight;
        plant.x = (i * spacingShrubs) + (spacingShrubs / 2) + (Math.random() - 0.5) * spacingShrubs;
        if (plant.type === 'flower') {
            plant.flowerColor = PASTEL_FLOWER_COLORS[Math.floor(Math.random() * PASTEL_FLOWER_COLORS.length)];
            plant.position = { x: plant.x, y: canvas.height - targetHeight/2 };
            plant.presetNectar = plant.nectar; flowers.push(plant);
        }
        preRenderPlant(plant, canvas);
        if (plant.type === 'flower') {
            for (const point of plant.petalPoints) {
                point.x = point.x + plant.x - plant.renderHeight / 2;
                point.y = point.y + canvas.height - plant.renderHeight;
            }
        }
        shrubs.push(plant);
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
        const initialBirdDna = {};
        for (const key in BIRD_DNA_TEMPLATE) initialBirdDna[key] = BIRD_DNA_TEMPLATE[key].initial;
        for (let i = 0; i < 10; i++) {
            const nest = nests[i % nests.length];
            const parentPreset = PARENT_PRESETS[i % PARENT_PRESETS.length];
            const bodyVertices = BIRD_GENES.BODY_SHAPES[parentPreset.genes.baseBeak.body].vertices;
            const birdGenes = {
                palette: parentPreset.genes.palette, bodyVertices: bodyVertices,
                beakVertices: parentPreset.genes.baseBeak.vertices,
                tailVertices: parentPreset.genes.baseTail.vertices(bodyVertices),
                baseGenes: parentPreset.genes
            };
            birds.push(new Bird(nest.position.x, nest.position.y, BIRD_SETTINGS, nest, birdGenes, initialBirdDna));
        }
    }
    if (hives.length > 0) {
        const initialBeeDna = {};
        for (const key in BEE_DNA_TEMPLATE) initialBeeDna[key] = BEE_DNA_TEMPLATE[key].initial;
        for (let i = 0; i < 50; i++) {
            const hive = hives[i % hives.length];
            bees.push(new Bee(hive.position.x, hive.position.y, BEE_SETTINGS, hive, initialBeeDna));
        }
    }
}


window.addEventListener('resize', initialize);
window.addEventListener('keydown', (event) => {
    if (event.key === 'M' || event.key === 'm') {
        isOverlayVisible = !isOverlayVisible;
        overlay.classList.toggle('overlay-hidden', !isOverlayVisible);
        if (!isOverlayVisible) {
            Plotly.purge('population-graph');
            Plotly.purge('bee-violin-plot');
            Plotly.purge('bird-violin-plot');
        } else {
            if (populationGraphDetails.open) drawPopulationGraph();
            if (beeViolinDetails.open) drawTraitEvolutionGraphs('bee-violin-plot', traitHistory.bees, BEE_DNA_TEMPLATE, 'Bee');
            if (birdViolinDetails.open) drawTraitEvolutionGraphs('bird-violin-plot', traitHistory.birds, BIRD_DNA_TEMPLATE, 'Bird');
        }
    }
});

populationGraphDetails.addEventListener('toggle', (event) => { if (event.target.open) { drawPopulationGraph(); } });
beeViolinDetails.addEventListener('toggle', (event) => { if (event.target.open) { drawTraitEvolutionGraphs('bee-violin-plot', traitHistory.bees, BEE_DNA_TEMPLATE, 'Bee'); } });
birdViolinDetails.addEventListener('toggle', (event) => { if (event.target.open) { drawTraitEvolutionGraphs('bird-violin-plot', traitHistory.birds, BIRD_DNA_TEMPLATE, 'Bird'); } });

initialize();
animate();