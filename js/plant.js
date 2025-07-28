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
        ctx.lineWidth = Math.max(1, 10 - this.generation * 3);
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
}

class LSystem {
    constructor(axiom, rules, iterations) {
        this.axiom = axiom;
        this.rules = rules;
        this.iterations = iterations;
        this.sentence = '';
    }

    generate() {
        this.sentence = this.axiom;
        for (let i = 0; i < this.iterations; i++) {
            let nextSentence = '';
            for (const char of this.sentence) {
                let replaced = false;
                if (this.rules[char]) {
                    const rule = this.rules[char];
                    if (Array.isArray(rule)) { // Stochastic rules
                        let r = Math.random();
                        let cumulativeProb = 0;
                        for (const r_ of rule) {
                            cumulativeProb += r_.prob;
                            if (r < cumulativeProb) {
                                nextSentence += r_.replacement;
                                replaced = true;
                                break;
                            }
                        }
                    } else { // Deterministic rule
                        nextSentence += rule;
                        replaced = true;
                    }
                }
                if (!replaced) {
                    nextSentence += char;
                }
            }
            this.sentence = nextSentence;
        }
        return this.sentence;
    }
}

class Plant {
    constructor(x, y) {
        this.position = new Vector(x, y);
        this.branches = [];
        this.maxGenerations = 4 + Math.floor(Math.random() * 2);

        const rules = {
            'X': [
                { prob: 0.4, replacement: 'F[+X][-X]F[+X]-X' },
                { prob: 0.4, replacement: 'F[-X][+X]F[-X]+X' },
                { prob: 0.2, replacement: 'F[+X][-X][+X]FX' }
            ],
            'F': 'FF'
        };

        const lsystem = new LSystem('X', rules, this.maxGenerations);
        const lindenmayerString = lsystem.generate();
        this.interpretLSystem(lindenmayerString, x, y);
    }

    interpretLSystem(lindenmayerString, x, y) {
        const stack = [];
        let currentPos = new Vector(x, y);
        let currentDir = new Vector(0, -1);
        let currentGen = 0;

        const initialLength = 20;

        for (const char of lindenmayerString) {
            switch (char) {
                case 'F':
                    const len = initialLength / (currentGen * 0.5 + 1);
                    const newPos = Vector.add(currentPos, currentDir.copy().mult(len));
                    const branch = new Branch(currentPos, newPos, currentGen);
                    
                    let parent = null;
                    if (stack.length > 0) {
                        const parentState = stack[stack.length - 1];
                        if(parentState.branch) {
                            parent = parentState.branch;
                        } else {
                             // Find the branch that ends where the current one starts
                            const findParent = (b) => {
                                if (b.end.equals(currentPos)) return b;
                                for(const child of b.children) {
                                    const found = findParent(child);
                                    if(found) return found;
                                }
                                return null;
                            }
                            for(const rootBranch of this.branches) {
                                parent = findParent(rootBranch);
                                if(parent) break;
                            }
                        }
                    }

                    if (parent) {
                        parent.children.push(branch);
                    } else {
                        this.branches.push(branch);
                    }
                    
                    currentPos = newPos;
                    
                    // Simplified leaf logic: add leaf at max generation
                    if (currentGen >= this.maxGenerations -1) {
                        branch.leaf = new Leaf(currentPos);
                    }
                    break;
                case '+':
                    currentDir.rotate(Math.PI / 6 + (Math.random() - 0.5) * (Math.PI / 8));
                    break;
                case '-':
                    currentDir.rotate(-Math.PI / 6 - (Math.random() - 0.5) * (Math.PI / 8));
                    break;
                case '[':
                    stack.push({ position: currentPos.copy(), direction: currentDir.copy(), generation: currentGen, branch: this.branches[this.branches.length-1] });
                    currentGen++;
                    break;
                case ']':
                    const state = stack.pop();
                    currentPos = state.position;
                    currentDir = state.direction;
                    currentGen = state.generation;
                    break;
                case 'L':
                     // This is now handled at the end of 'F' branches
                    break;
            }
        }
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

    getBoundingBox() {
        if (this.branches.length === 0) {
            return { x: this.position.x, y: this.position.y, width: 0, height: 0 };
        }

        const bounds = {
            minX: this.position.x,
            maxX: this.position.x,
            minY: this.position.y,
            maxY: this.position.y
        };

        for (const branch of this.branches) {
            this._calculateBounds(branch, bounds);
        }

        return {
            x: bounds.minX,
            y: bounds.minY,
            width: bounds.maxX - bounds.minX,
            height: bounds.maxY - bounds.minY
        };
    }

    _calculateBounds(branch, bounds) {
        bounds.minX = Math.min(bounds.minX, branch.start.x, branch.end.x);
        bounds.maxX = Math.max(bounds.maxX, branch.start.x, branch.end.x);
        bounds.minY = Math.min(bounds.minY, branch.start.y, branch.end.y);
        bounds.maxY = Math.max(bounds.maxY, branch.start.y, branch.end.y);

        if (branch.leaf) {
            bounds.minX = Math.min(bounds.minX, branch.leaf.position.x - branch.leaf.size);
            bounds.maxX = Math.max(bounds.maxX, branch.leaf.position.x + branch.leaf.size);
            bounds.minY = Math.min(bounds.minY, branch.leaf.position.y - branch.leaf.size);
            bounds.maxY = Math.max(bounds.maxY, branch.leaf.position.y + branch.leaf.size);
        }

        for (const child of branch.children) {
            this._calculateBounds(child, bounds);
        }
    }
}