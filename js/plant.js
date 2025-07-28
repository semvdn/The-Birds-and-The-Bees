class Leaf {
    constructor(position) {
        this.position = position;
        this.size = 0;
        this.maxSize = Math.random() * 5 + 5;
        this.color = `hsl(${Math.random() * 60 + 90}, 100%, 50%)`;
        this.isEaten = false;
    }

    show(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        if (!this.isEaten && this.size < this.maxSize) {
            this.size += 0.05;
            if (this.size > this.maxSize) {
                this.size = this.maxSize;
            }
        }
    }

    eat() {
        this.isEaten = true;
        this.size = 0;
    }

    regrow() {
        this.isEaten = false;
    }
}

class Branch {
    constructor(start, end, generation) {
        this.start = start;
        this.end = end;
        this.generation = generation;
        this.children = [];
        this.leaf = null;
    }

    show(ctx) {
        ctx.strokeStyle = '#5c4033';
        ctx.lineWidth = Math.max(1, 10 - this.generation * 1.5);
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.stroke();

        for (const child of this.children) {
            child.show(ctx);
        }

        if (this.leaf) {
            this.leaf.show(ctx);
        }
    }

    createChildren(maxGenerations) {
        if (this.generation < maxGenerations) {
            const dir = Vector.sub(this.end, this.start);
            const angle = Math.PI / 4 + (Math.random() - 0.5) * (Math.PI / 4);
            const length = 0.67 * (Math.random() * 0.5 + 0.5);

            const dir1 = dir.copy().rotate(angle).mult(length);
            const newEnd1 = Vector.add(this.end, dir1);
            this.children.push(new Branch(this.end, newEnd1, this.generation + 1));

            const dir2 = dir.copy().rotate(-angle).mult(length);
            const newEnd2 = Vector.add(this.end, dir2);
            this.children.push(new Branch(this.end, newEnd2, this.generation + 1));

            for (const child of this.children) {
                child.createChildren(maxGenerations);
            }
        } else {
            this.leaf = new Leaf(this.end);
        }
    }
}

class Plant {
    constructor(x, y) {
        this.position = new Vector(x, y);
        this.branches = [];
        this.maxGenerations = 5 + Math.floor(Math.random() * 3);
        const start = new Vector(x, y);
        const end = new Vector(x, y - (Math.random() * 80 + 80));
        const root = new Branch(start, end, 0);
        root.createChildren(this.maxGenerations);
        this.branches.push(root);
    }

    show(ctx) {
        for (const branch of this.branches) {
            branch.show(ctx);
        }
    }

    update() {
        for (const branch of this.branches) {
            this.updateBranch(branch);
        }
    }

    updateBranch(branch) {
        if (branch.leaf) {
            branch.leaf.update();
        }
        for (const child of branch.children) {
            this.updateBranch(child);
        }
    }

    grow() {
        for (const branch of this.branches) {
            this.regrowBranch(branch);
        }
    }

    regrowBranch(branch) {
        if (branch.leaf && branch.leaf.isEaten) {
            branch.leaf.regrow();
        }
        for (const child of branch.children) {
            this.regrowBranch(child);
        }
    }
}