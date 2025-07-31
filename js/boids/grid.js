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
     * Queries the grid to find all boids within a certain range of a given boid.
     * It checks the boid's cell and all immediately adjacent cells.
     * @param {Boid} boid The boid to find neighbors for.
     * @returns {Boid[]} An array of nearby boids.
     */
    query(boid) {
        const nearby = [];
        const boidCol = Math.floor(boid.position.x / this.cellSize);
        const boidRow = Math.floor(boid.position.y / this.cellSize);

        for (let row = boidRow - 1; row <= boidRow + 1; row++) {
            for (let col = boidCol - 1; col <= boidCol + 1; col++) {
                if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
                    const index = col + row * this.cols;
                    nearby.push(...this.cells[index]);
                }
            }
        }
        return nearby;
    }
}