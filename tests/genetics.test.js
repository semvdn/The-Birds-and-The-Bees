import test from 'node:test';
import assert from 'node:assert/strict';

import { BIRD_DNA_TEMPLATE, BIRD_GENES } from '../js/presets.js';
import { determineInheritance, interpolateVertices } from '../js/genetics.js';

function initialDna() {
    return Object.fromEntries(
        Object.entries(BIRD_DNA_TEMPLATE).map(([key, definition]) => [key, definition.initial]),
    );
}

function makeGenes(tailVertices) {
    const bodyVertices = BIRD_GENES.BODY_SHAPES.STANDARD.vertices.map(vertex => [...vertex]);
    return {
        palette: BIRD_GENES.PALETTES.CLASSIC,
        bodyVertices,
        beakVertices: BIRD_GENES.BEAK_SHAPES.PROBING.vertices.map(vertex => [...vertex]),
        tailVertices: tailVertices.map(vertex => [...vertex]),
        baseGenes: {
            baseBeak: BIRD_GENES.BEAK_SHAPES.PROBING,
            baseTail: BIRD_GENES.TAIL_SHAPES.FORKED,
        },
    };
}

test('offspring inherit evolved tail vertices instead of rebuilding the base tail', () => {
    const parent1Tail = [[-4, 0.7], [-8, 2], [-7, 0], [-8, -2], [-4.5, -0.3]];
    const parent2Tail = [[-4, 0.7], [-10, 4], [-9, 0], [-10, -4], [-4.5, -0.3]];
    const parent1 = makeGenes(parent1Tail);
    const parent2 = makeGenes(parent2Tail);

    // 0.5 keeps every mutation check above the 5% threshold and also gives
    // an exact 50/50 interpolation weight.
    const { inheritedGenes } = determineInheritance(
        parent1,
        initialDna(),
        parent2,
        initialDna(),
        () => 0.5,
    );

    assert.deepEqual(inheritedGenes.tailVertices, [
        [-4, 0.7],
        [-9, 3],
        [-8, 0],
        [-9, -3],
        [-4.5, -0.3],
    ]);
});

test('vertex interpolation rejects incompatible shapes', () => {
    assert.throws(
        () => interpolateVertices([[0, 0]], [[0, 0], [1, 1]], 0.5),
        /different lengths/,
    );
});
