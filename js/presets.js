// --- GLOBAL ANIMATION CONSTANTS ---
export const MIN_TREES = 4;
export const MAX_TREES = 6;
export const GLOBAL_WIND_STRENGTH = 2.0;
export const SHRUB_WIND_MULTIPLIER = 2.0;
export const WEED_WIND_MULTIPLIER = 4.0;

// --- PRESET DEFINITIONS ---
export const PASTEL_FLOWER_COLORS = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'];

export const TREE_PRESETS = [
    {
        type: 'leafy', name: 'classic',
        rules: {
            'X': [ // Significantly different structural variations
                'F+[[XL]-XL]-F[-FXL]+XL',  // Original complex
                'F[+F[L]X][-F[L]X]FXL',    // Forking structure
                'F[+XL]F[-XL][X]L'         // Strong trunk with a top tuft
            ],
            'F': 'FF'
        },
        iterations: 5, angle: 25, initialThickness: 8, barkColor: '#5a3a29', leafColor: '#2a9d8f', leafShape: 'classic'
    },
    {
        type: 'leafy', name: 'upward',
        rules: {
            'X': [
                'F[+XL]F[-XL]+X',         // Original upward
                'FF[+X[L]][-X[L]]',       // Taller, pine-like
                'F[+X[L]][-X[L]]+FXL'      // Bushier at the tips
            ],
            'F': 'FF'
        },
        iterations: 5, angle: 22, initialThickness: 10, barkColor: '#6f4533', leafColor: '#e76f51', leafShape: 'maple'
    },
    {
        type: 'leafy', name: 'weeping',
        rules: {
            'X': [
                'F[--XL]F[++XL]FXL',       // Original weeping
                'F[--F[L]X]F[++F[L]X]FX',  // More pronounced droop
                'F[---XL][++XL]FXL'        // Asymmetric weeping
            ],
            'F': 'FF'
        },
        iterations: 5, angle: 18, initialThickness: 7, barkColor: '#8a7e6c', leafColor: '#93a35a', leafShape: 'willow'
    },
    {
        type: 'leafy', name: 'broadleaf',
        rules: {
            'X': [
                'F[+XL][-XL]F[+XL]X',     // Original wide
                'FF[-[XL]+[XL]]F[+X[L]]', // Stronger trunk, wide crown
                'F[+F[-XL]][-F[+XL]]FXL'   // Gnarled, wide branches
            ],
            'F': 'FF'
        },
        iterations: 5, angle: 30, initialThickness: 9, barkColor: '#7a6e60', leafColor: '#4f7553', leafShape: 'broad'
    }
];

export const SHRUB_PRESETS = [
    { type: 'leafy', rules: { 'X': 'F-[[XL]+XL]+F[+FXL]-XL', 'F': 'FF' }, iterations: 4, angle: 30, initialThickness: 4, barkColor: '#4c956c', leafColor: '#fefee3', leafShape: 'oval' },
    { type: 'leafy', rules: { 'X': 'F[+XL][-XL]FXL', 'F': 'FF' }, iterations: 4, angle: 25, initialThickness: 3, barkColor: '#5fa8d3', leafColor: '#f2f2f2', leafShape: 'willow' },
    { type: 'flower', flowerShape: 'petal', rules: { 'X': 'F[+F-XO][-F+XO]XO', 'F': 'FF' }, iterations: 4, angle: 28, initialThickness: 5, barkColor: '#6a994e' },
    { type: 'flower', flowerShape: 'bell', rules: { 'X': 'F[+FXO][-F-X]FX', 'F': 'FF' }, iterations: 5, angle: 25, initialThickness: 3, barkColor: '#7b8c74' }
];

export const WEED_PRESETS = [
    { type: 'weed', rules: { 'X': 'F[+X]F[-X]+X', 'F': 'FF' }, iterations: 4, angle: 20, initialThickness: 2, barkColor: '#6a994e' },
    { type: 'weed', rules: { 'X': 'F[+X][-X]FX', 'F': 'FF' }, iterations: 4, angle: 25.7, initialThickness: 2, barkColor: '#4c956c' },
    { type: 'weed', rules: { 'X': 'F-[[X]+X]+F[+FX]-X', 'F': 'FF' }, iterations: 3, angle: 22, initialThickness: 1.5, barkColor: '#588157' },
    { type: 'weed', rules: { 'X': 'F[-F[+X]]F[+F[-X]]X', 'F': 'F' }, iterations: 5, angle: 15, initialThickness: 1, barkColor: '#73a942' }
];

// --- BOID SIMULATION CONSTANTS ---
export const BIRD_SETTINGS = {
    maxSpeed: 3,
    visualRange: 75,
    separationDistance: 20,
    separationFactor: 0.05,
    alignmentFactor: 0.05,
    cohesionFactor: 0.005,
    turnFactor: 0.2,
    huntFactor: 0.001,
    killRange: 5
};

export const INSECT_SETTINGS = {
    maxSpeed: 2,
    visualRange: 50,
    separationDistance: 15,
    separationFactor: 0.05,
    alignmentFactor: 0.03,
    cohesionFactor: 0.002,
    turnFactor: 0.3,
    evadeFactor: 0.02
};