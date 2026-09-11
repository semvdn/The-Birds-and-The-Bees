import {
    BIRD_DNA_TEMPLATE,
    BIRD_GENES,
    MUTATION_AMOUNT,
    MUTATION_RATE,
} from './presets.js';

export function mutate(value, min, max, random = Math.random) {
    if (random() < MUTATION_RATE) {
        const range = max - min;
        const change = (random() - 0.5) * 2 * range * MUTATION_AMOUNT;
        return Math.max(min, Math.min(max, value + change));
    }
    return value;
}

export function blendHexColors(hex1, hex2) {
    const num1 = parseInt(hex1.slice(1), 16);
    const num2 = parseInt(hex2.slice(1), 16);
    const r1 = (num1 >> 16) & 0xFF;
    const g1 = (num1 >> 8) & 0xFF;
    const b1 = num1 & 0xFF;
    const r2 = (num2 >> 16) & 0xFF;
    const g2 = (num2 >> 8) & 0xFF;
    const b2 = num2 & 0xFF;
    const avgR = Math.floor((r1 + r2) / 2);
    const avgG = Math.floor((g1 + g2) / 2);
    const avgB = Math.floor((b1 + b2) / 2);
    const newHex = ((avgR << 16) | (avgG << 8) | avgB).toString(16).padStart(6, '0');
    return `#${newHex}`;
}

export function mutateHexColor(hex, random = Math.random) {
    if (random() > MUTATION_RATE) return hex;

    const num = parseInt(hex.slice(1), 16);
    const amount = 30;
    const r = Math.max(0, Math.min(255, ((num >> 16) & 0xFF) + Math.floor((random() - 0.5) * amount)));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xFF) + Math.floor((random() - 0.5) * amount)));
    const b = Math.max(0, Math.min(255, (num & 0xFF) + Math.floor((random() - 0.5) * amount)));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function interpolateVertices(v1, v2, weight) {
    if (v1.length !== v2.length) {
        throw new Error('Cannot interpolate vertex arrays with different lengths.');
    }

    return v1.map((p1, i) => {
        const p2 = v2[i];
        return [
            (1 - weight) * p1[0] + weight * p2[0],
            (1 - weight) * p1[1] + weight * p2[1],
        ];
    });
}

export function mutateVertices(vertices, ignoreIndices = [], random = Math.random) {
    if (random() > MUTATION_RATE) return vertices.map(vertex => [...vertex]);

    const amount = 0.2;
    return vertices.map((vertex, i) => {
        if (ignoreIndices.includes(i)) return [...vertex];
        return [
            vertex[0] + (random() - 0.5) * amount,
            vertex[1] + (random() - 0.5) * amount,
        ];
    });
}

export function determineInheritance(genes1, dna1, genes2, dna2, random = Math.random) {
    const inheritedDna = {};
    for (const key of Object.keys(BIRD_DNA_TEMPLATE)) {
        const avg = (dna1[key] + dna2[key]) / 2;
        const template = BIRD_DNA_TEMPLATE[key];
        inheritedDna[key] = mutate(avg, template.min, template.max, random);
    }

    const weight = random();
    const newBodyVertices = interpolateVertices(genes1.bodyVertices, genes2.bodyVertices, weight);

    let inheritedBaseBeak = random() < 0.5 ? genes1.baseGenes.baseBeak : genes2.baseGenes.baseBeak;
    let newBeakVertices;
    if (random() < MUTATION_RATE) {
        const beakKeys = Object.keys(BIRD_GENES.BEAK_SHAPES);
        inheritedBaseBeak = BIRD_GENES.BEAK_SHAPES[beakKeys[Math.floor(random() * beakKeys.length)]];
        newBeakVertices = inheritedBaseBeak.vertices.map(vertex => [...vertex]);
    } else {
        const interpolatedBeak = interpolateVertices(genes1.beakVertices, genes2.beakVertices, weight);
        newBeakVertices = mutateVertices(interpolatedBeak, [2], random);
    }

    let inheritedBaseTail = random() < 0.5 ? genes1.baseGenes.baseTail : genes2.baseGenes.baseTail;
    let newTailVertices;
    if (random() < MUTATION_RATE) {
        const tailKeys = Object.keys(BIRD_GENES.TAIL_SHAPES);
        inheritedBaseTail = BIRD_GENES.TAIL_SHAPES[tailKeys[Math.floor(random() * tailKeys.length)]];
        newTailVertices = inheritedBaseTail.vertices(newBodyVertices);
    } else {
        // Blend the parents' actual evolved tail vertices. Rebuilding tails from base genes
        // would erase inherited micro-mutations after a single generation.
        const interpolatedTail = interpolateVertices(genes1.tailVertices, genes2.tailVertices, weight);
        newTailVertices = mutateVertices(interpolatedTail, [0, interpolatedTail.length - 1], random);
    }

    const palette1 = genes1.palette.colors;
    const palette2 = genes2.palette.colors;
    const newPaletteColors = {};
    for (const key of Object.keys(palette1)) {
        if (key === 'outline' || key === 'beak') {
            newPaletteColors[key] = palette1[key];
        } else {
            newPaletteColors[key] = mutateHexColor(blendHexColors(palette1[key], palette2[key]), random);
        }
    }

    return {
        inheritedGenes: {
            palette: { name: 'Hybrid', colors: newPaletteColors },
            bodyVertices: newBodyVertices,
            beakVertices: newBeakVertices,
            tailVertices: newTailVertices,
            baseGenes: {
                baseBeak: inheritedBaseBeak,
                baseTail: inheritedBaseTail,
            },
        },
        inheritedDna,
    };
}
