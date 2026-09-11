export class Grid {
    constructor(width, height, cellSize) {
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.cells = Array(this.cols * this.rows).fill(null).map(() => []);
    }

    /**
     * Clears all boids from the grid for the next frame.
     */
    clear() {
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i].length = 0; // More efficient than creating a new array
        }
    }

    /**
     * Inserts a boid into the correct grid cell based on its position.
     * @param {Boid} boid The boid to insert.
     */
    insert(boid) {
        const col = Math.floor(boid.position.x / this.cellSize);
        const row = Math.floor(boid.position.y / this.cellSize);

        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
            const index = col + row * this.cols;
            this.cells[index].push(boid);
        }
    }

    /**
     * Returns candidates from every grid cell intersecting the requested radius.
     * Callers still perform exact distance checks; this method only guarantees
     * that no in-range agent is omitted because it lives more than one cell away.
     * @param {{position: {x: number, y: number}}} boid Entity at the query origin.
     * @param {number} radius Maximum interaction radius in pixels.
     * @returns {object[]} Candidate entities from the covered cells.
     */
    query(boid, radius = this.cellSize) {
        const nearby = [];
        const boidCol = Math.floor(boid.position.x / this.cellSize);
        const boidRow = Math.floor(boid.position.y / this.cellSize);
        const cellRadius = Math.max(1, Math.ceil(radius / this.cellSize));

        for (let row = boidRow - cellRadius; row <= boidRow + cellRadius; row++) {
            for (let col = boidCol - cellRadius; col <= boidCol + cellRadius; col++) {
                if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
                    const index = col + row * this.cols;
                    nearby.push(...this.cells[index]);
                }
            }
        }
        return nearby;
    }
}
