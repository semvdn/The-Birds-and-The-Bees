// --- GLOBAL ANIMATION CONSTANTS ---
export const MIN_TREES = 4;
export const MAX_TREES = 6;
export const GLOBAL_WIND_STRENGTH = 2.0;
export const SHRUB_WIND_MULTIPLIER = 2.0;
export const WEED_WIND_MULTIPLIER = 4.0;
export const MAX_BEES = 150;
export const MAX_BIRDS = 20;
export const MIN_HOME_SEPARATION = 40; // Minimum pixels between nests/hives on the same tree

// --- PRESET DEFINITIONS ---
export const PASTEL_FLOWER_COLORS = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'];

export const TREE_PRESETS = [
    {
        type: 'leafy', name: 'classic',
        rules: {
            'X': [
                'F+[[XL]-XL]-F[-FXL]+XL',
                'F[+F[L]X][-F[L]X]FXL',
                'F[+XL]F[-XL][X]L'
            ],
            'F': 'FF'
        },
        iterations: 5, angle: 25, initialThickness: 8, barkColor: '#5a3a29', leafColor: '#2a9d8f', leafShape: 'classic'
    },
    {
        type: 'leafy', name: 'upward',
        rules: {
            'X': [
                'F[+XL]F[-XL]+X',
                'FF[+X[L]][-X[L]]',
                'F[+X[L]][-X[L]]+FXL'
            ],
            'F': 'FF'
        },
        iterations: 5, angle: 22, initialThickness: 10, barkColor: '#6f4533', leafColor: '#e76f51', leafShape: 'maple'
    },
    {
        type: 'leafy', name: 'weeping',
        rules: {
            'X': [
                'F[--XL]F[++XL]FXL',
                'F[--F[L]X]F[++F[L]X]FX',
                'F[---XL][++XL]FXL'
            ],
            'F': 'FF'
        },
        iterations: 5, angle: 18, initialThickness: 7, barkColor: '#8a7e6c', leafColor: '#93a35a', leafShape: 'willow'
    },
    {
        type: 'leafy', name: 'broadleaf',
        rules: {
            'X': [
                'F[+XL][-XL]F[+XL]X',
                'FF[-[XL]+[XL]]F[+X[L]]',
                'F[+F[-XL]][-F[+XL]]FXL'
            ],
            'F': 'FF'
        },
        iterations: 5, angle: 30, initialThickness: 9, barkColor: '#7a6e60', leafColor: '#4f7553', leafShape: 'broad'
    }
];

export const SHRUB_PRESETS = [
    { type: 'leafy', rules: { 'X': 'F-[[XL]+XL]+F[+FXL]-XL', 'F': 'FF' }, iterations: 4, angle: 30, initialThickness: 4, barkColor: '#4c956c', leafColor: '#fefee3', leafShape: 'oval' },
    { type: 'leafy', rules: { 'X': 'F[+XL][-XL]FXL', 'F': 'FF' }, iterations: 4, angle: 25, initialThickness: 3, barkColor: '#5fa8d3', leafColor: '#f2f2f2', leafShape: 'willow' },
    { type: 'flower', nectar: 10, nectarRegen: 0.01, flowerShape: 'petal', rules: { 'X': 'F[XO][F-XO]XO', 'F': 'FF' }, iterations: 4, angle: 28, initialThickness: 3, barkColor: '#6a994e' },
    { type: 'flower', nectar: 15, nectarRegen: 0.015, flowerShape: 'bell', rules: { 'X': 'F[+FXO][-F-X]FX', 'F': 'FF' }, iterations: 4, angle: 25, initialThickness: 3, barkColor: '#7b8c74' }
];

export const WEED_PRESETS = [
    { type: 'weed', rules: { 'X': 'F[+X]F[-X]+X', 'F': 'FF' }, iterations: 4, angle: 20, initialThickness: 2, barkColor: '#6a994e' },
    { type: 'weed', rules: { 'X': 'F[+X][-X]FX', 'F': 'FF' }, iterations: 4, angle: 25.7, initialThickness: 2, barkColor: '#4c956c' },
    { type: 'weed', rules: { 'X': 'F-[[X]+X]+F[+FX]-X', 'F': 'FF' }, iterations: 3, angle: 22, initialThickness: 1.5, barkColor: '#588157' },
    { type: 'weed', rules: { 'X': 'F[-F[+X]]F[+F[-X]]X', 'F': 'F' }, iterations: 5, angle: 15, initialThickness: 1, barkColor: '#73a942' }
];

// --- BOID SIMULATION CONSTANTS ---
export const HIVE_SETTINGS = {
    NECTAR_FOR_NEW_BEE: 10
};

export const NEST_SETTINGS = {
    BEES_FOR_NEW_BIRD: 2
};

export const BIRD_SETTINGS = {
    maxSpeed: 3,
    visualRange: 150,
    separationDistance: 25,
    separationFactor: 0.05,
    alignmentFactor: 0.05,
    cohesionFactor: 0.005,
    turnFactor: 0.2,
    huntFactor: 0.002,
    killRange: 5
};

export const BEE_SETTINGS = {
    maxSpeed: 2.5,
    visualRange: 70,
    separationDistance: 20,
    separationFactor: 0.05,
    alignmentFactor: 0.03,
    cohesionFactor: 0.002,
    turnFactor: 0.3,
    evadeFactor: 0.01,
    nectarCapacity: 5
};