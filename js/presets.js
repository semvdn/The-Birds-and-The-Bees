// --- GLOBAL ANIMATION CONSTANTS ---
export const MIN_TREES = 4;
export const MAX_TREES = 6;
export const GLOBAL_WIND_STRENGTH = 2.0;
export const SHRUB_WIND_MULTIPLIER = 2.0;
export const WEED_WIND_MULTIPLIER = 4.0;
export const MAX_BEES = 120;
export const MAX_BIRDS = 30;
export const MIN_HOME_SEPARATION = 40; // Minimum pixels between nests/hives on the same tree
export const GROUND_HEIGHT = 30; // Define ground height for physics and drawing
export const MIN_FLOWERS = 7; // Minimum number of flower-producing shrubs
export const BEE_MAX_LIFETIME_SECONDS = 60; // A bee can live for up to a minute
export const BIRD_MAX_LIFETIME_SECONDS = 120; // A bird can live for up to 3 minutes
export const GRAVITY = 0.1; // Downward force on dead boids
export const DEATH_FADE_TIME = 120; // 2 seconds to fade out on the ground

// --- EVOLUTIONARY CONSTANTS ---
export const MUTATION_RATE = 0.05; // 15% chance for each gene to mutate
export const MUTATION_AMOUNT = 0.05; // Mutate by up to 5% of the value's range

// --- BEE BEHAVIOR CONSTANTS ---
export const BEE_POPULATION_THRESHOLD = 60; // Below this, bees use simple "closest hive" logic
export const HIVE_DANGER_RADIUS = 150; // Radius around a hive to check for birds
export const HIVE_DANGER_WEIGHT = 5.0; // How much each bird reduces a hive's score

// --- PRESET DEFINITIONS ---
export const PASTEL_FLOWER_COLORS = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'];

export const TREE_PRESETS = [
    { type: 'leafy', name: 'classic', rules: { 'X': ['F+[[XL]-XL]-F[-FXL]+XL', 'F[+F[L]X][-F[L]X]FXL', 'F[+XL]F[-XL][X]L'], 'F': 'FF' }, iterations: 5, angle: 25, initialThickness: 8, barkColor: '#5a3a29', leafColor: '#2a9d8f', leafShape: 'classic' },
    { type: 'leafy', name: 'upward', rules: { 'X': ['F[+XL]F[-XL]+X', 'FF[+X[L]][-X[L]]', 'F[+X[L]][-X[L]]+FXL'], 'F': 'FF' }, iterations: 5, angle: 22, initialThickness: 10, barkColor: '#6f4533', leafColor: '#e76f51', leafShape: 'maple' },
    { type: 'leafy', name: 'weeping', rules: { 'X': ['F[--XL]F[++XL]FXL', 'F[--F[L]X]F[++F[L]X]FX', 'F[---XL][++XL]FXL'], 'F': 'FF' }, iterations: 5, angle: 18, initialThickness: 7, barkColor: '#8a7e6c', leafColor: '#93a35a', leafShape: 'willow' },
    { type: 'leafy', name: 'broadleaf', rules: { 'X': ['F[+XL][-XL]F[+XL]X', 'FF[-[XL]+[XL]]F[+X[L]]', 'F[+F[-XL]][-F[+XL]]FXL'], 'F': 'FF' }, iterations: 5, angle: 30, initialThickness: 9, barkColor: '#7a6e60', leafColor: '#4f7553', leafShape: 'broad' }
];

export const SHRUB_PRESETS = [
    { type: 'leafy', rules: { 'X': 'F-[[XL]+XL]+F[+FXL]-XL', 'F': 'FF' }, iterations: 4, angle: 30, initialThickness: 4, barkColor: '#4c956c', leafColor: '#fefee3', leafShape: 'oval' },
    { type: 'leafy', rules: { 'X': 'F[+XL][-XL]FXL', 'F': 'FF' }, iterations: 4, angle: 25, initialThickness: 3, barkColor: '#5fa8d3', leafColor: '#f2f2f2', leafShape: 'willow' },
    { type: 'flower', nectar: 20, nectarRegen: 2.0, flowerShape: 'petal', rules: { 'X': 'F[XO][F-XO]XO', 'F': 'FF' }, iterations: 4, angle: 28, initialThickness: 3, barkColor: '#6a994e' },
    { type: 'flower', nectar: 25, nectarRegen: 2.5, flowerShape: 'bell', rules: { 'X': 'F[+FXO][-F-X]FX', 'F': 'FF' }, iterations: 4, angle: 25, initialThickness: 3, barkColor: '#7b8c74' }
];

export const WEED_PRESETS = [
    { type: 'weed', rules: { 'X': 'F[+X]F[-X]+X', 'F': 'FF' }, iterations: 4, angle: 20, initialThickness: 2, barkColor: '#6a994e' },
    { type: 'weed', rules: { 'X': 'F[+X][-X]FX', 'F': 'FF' }, iterations: 4, angle: 25.7, initialThickness: 2, barkColor: '#4c956c' },
    { type: 'weed', rules: { 'X': 'F-[[X]+X]+F[+FX]-X', 'F': 'FF' }, iterations: 3, angle: 22, initialThickness: 1.5, barkColor: '#588157' },
    { type: 'weed', rules: { 'X': 'F[-F[+X]]F[+F[-X]]X', 'F': 'F' }, iterations: 5, angle: 15, initialThickness: 1, barkColor: '#73a942' }
];

// --- BOID SIMULATION CONSTANTS ---
export const HIVE_SETTINGS = { NECTAR_FOR_NEW_BEE: 2 };
export const NEST_SETTINGS = { BEES_FOR_NEW_BIRD: 5, HATCH_TIME_SECONDS: 5, NESTING_TIME_SECONDS: 3 };

// --- BASE SETTINGS (NON-HERITABLE) ---
export const BIRD_SETTINGS = { 
    maxSpeed: 1.75, 
    killRange: 5,
    maxLifetime: BIRD_MAX_LIFETIME_SECONDS * 60, // in frames
    initialEnergy: 200,
    energyFromBee: 150, // Energy gained per bee caught
    energyDepletionRate: 0.04, // Energy lost per frame
};
export const BEE_SETTINGS = { 
    maxSpeed: 1.65, 
    nectarCapacity: 2,
    gatherTime: 30, // Time in frames to gather nectar from a flower
    maxLifetime: BEE_MAX_LIFETIME_SECONDS * 60, // in frames
    initialEnergy: 100,
    energyFromNectar: 50, // Energy gained per gathering action
    energyDepletionRate: 0.01, // Energy lost per frame
};

// --- HERITABLE BIRD PARAMETERS ---
export const BIRD_DNA_TEMPLATE = {
    visualRange:        { initial: 150, min: 100, max: 200 },
    separationDistance: { initial: 40,  min: 20,  max: 60  },
    separationFactor:   { initial: 0.05,min: 0.01,max: 0.1 },
    alignmentFactor:    { initial: 0.05,min: 0.01,max: 0.1 },
    cohesionFactor:     { initial: 0.005,min: 0.001,max:0.01},
    turnFactor:         { initial: 0.2, min: 0.1, max: 0.4 },
    huntFactor:         { initial: 0.002,min: 0.001,max:0.005}
};

// --- HERITABLE BEE PARAMETERS ---
export const BEE_DNA_TEMPLATE = {
    visualRange:        { initial: 70,  min: 50,  max: 120 },
    separationDistance: { initial: 20,  min: 10,  max: 40  },
    separationFactor:   { initial: 0.05,min: 0.01,max: 0.1 },
    alignmentFactor:    { initial: 0.03,min: 0.01,max: 0.08},
    cohesionFactor:     { initial: 0.002,min: 0.0005,max:0.005},
    turnFactor:         { initial: 0.3, min: 0.1, max: 0.5 },
    evadeFactor:        { initial: 0.01,min: 0.005,max:0.03 },
    returnFactor:       { initial: 0.006, min: 0.001, max: 0.02 }
};


// --- BIRD GENETIC PRESETS (REWORKED FOR INTERPOLATION) ---
export const BIRD_GENES = {
    BODY_SHAPES: {
        STANDARD: { name: 'STANDARD', vertices: [ [0,0], [0,0.5], [0,-0.5], [-1,2.5], [-3,1.5], [-4,0.7], [0,0], [-4.5,-0.3], [-3,-2.5], [-1,-1.5], [-2,-0.25], [-1.5,0.5] ]},
        CRACKER:  { name: 'CRACKER',  vertices: [ [0,0], [0,1.0], [0,-1.0], [-1,2.5], [-3,1.5], [-4,0.7], [0,0], [-4.5,-0.3], [-3,-2.5], [-1,-1.5], [-2,-0.25], [-1.5,1.0] ]}
    },
    BEAK_SHAPES: {
        PROBING:    { name: 'PROBING',    body: 'STANDARD', vertices: [ [4,0], [0,0.5], [0,0], [0,-0.5] ] },
        GENERALIST: { name: 'GENERALIST', body: 'STANDARD', vertices: [ [2,0], [0,0.5], [0,0], [0,-0.5] ] },
        CRACKER:    { name: 'CRACKER',    body: 'CRACKER',  vertices: [ [2.5,0], [0,1.0], [0,0], [0,-1.0] ] }
    },
    TAIL_SHAPES: {
        FORKED:  { name: 'FORKED',  vertices: (v) => [ v[5], [-6,1.2], [-5.5,0], [-6,-0.8], v[7] ] },
        STUBBY:  { name: 'STUBBY',  vertices: (v) => [ v[5], [-5,0.8], [-5.5,0], [-5,-0.8], v[7] ] },
        NOTCHED: { name: 'NOTCHED', vertices: (v) => [ v[5], [-6,0.5], [-5.5,0], [-6,-0.5], v[7] ] }
    },
    PALETTES: {
        CLASSIC: { name: 'CLASSIC', colors: { "beak": "#2F2F2F", "head_crest": "#0096FF", "head_face": "#72A0C1", "neck_white": "#FFFFFF", "wing_top": "#0077BE", "wing_bottom": "#005B96", "tail": "#004777", "belly_top": "#FFB347", "belly_bottom": "#FFD700", "outline": "black" }},
        VIOLET:  { name: 'VIOLET',  colors: { "beak": "#2F2F2F", "head_crest": "#8A2BE2", "head_face": "#9370DB", "neck_white": "#E6E6FA", "wing_top": "#7B68EE", "wing_bottom": "#483D8B", "tail": "#6A0DAD", "belly_top": "#BA55D3", "belly_bottom": "#C71585", "outline": "black" }},
        EARTHY:  { name: 'EARTHY',  colors: { "beak": "#B5A642", "head_crest": "#696969", "head_face": "#808080", "neck_white": "#F5F5DC", "wing_top": "#556B2F", "wing_bottom": "#6B8E23", "tail": "#36454F", "belly_top": "#C2B280", "belly_bottom": "#D2B48C", "outline": "black" }},
    }
};

export const PARENT_PRESETS = [
    { name: "Kingfisher", genes: { baseBeak: BIRD_GENES.BEAK_SHAPES.PROBING, baseTail: BIRD_GENES.TAIL_SHAPES.FORKED, palette: BIRD_GENES.PALETTES.CLASSIC }},
    { name: "Ground Finch", genes: { baseBeak: BIRD_GENES.BEAK_SHAPES.CRACKER, baseTail: BIRD_GENES.TAIL_SHAPES.STUBBY, palette: BIRD_GENES.PALETTES.EARTHY }},
    { name: "Starling", genes: { baseBeak: BIRD_GENES.BEAK_SHAPES.GENERALIST, baseTail: BIRD_GENES.TAIL_SHAPES.NOTCHED, palette: BIRD_GENES.PALETTES.VIOLET }}
];