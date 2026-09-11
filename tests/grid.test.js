import test from 'node:test';
import assert from 'node:assert/strict';

import { Grid } from '../js/boids/grid.js';

test('query covers every cell intersecting the requested radius', () => {
    const grid = new Grid(500, 300, 100);
    const origin = { position: { x: 50, y: 50 } };
    const twoCellsAway = { position: { x: 250, y: 50 } };

    grid.insert(origin);
    grid.insert(twoCellsAway);

    assert.ok(grid.query(origin, 200).includes(twoCellsAway));
    assert.ok(!grid.query(origin, 100).includes(twoCellsAway));
});

test('query remains bounded at world edges', () => {
    const grid = new Grid(300, 300, 100);
    const origin = { position: { x: 5, y: 5 } };
    const candidate = { position: { x: 205, y: 205 } };

    grid.insert(origin);
    grid.insert(candidate);

    assert.ok(grid.query(origin, 300).includes(candidate));
});
