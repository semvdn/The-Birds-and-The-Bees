class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    mult(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    div(s) {
        this.x /= s;
        this.y /= s;
        return this;
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const len = this.mag();
        if (len !== 0) this.mult(1 / len);
        return this;
    }

    limit(max) {
        const magSq = this.x * this.x + this.y * this.y;
        if (magSq > max * max) {
            this.div(Math.sqrt(magSq)).mult(max);
        }
        return this;
    }

    static sub(v1, v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }

    dist(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static add(v1, v2) {
        return new Vector(v1.x + v2.x, v1.y + v2.y);
    }

    copy() {
        return new Vector(this.x, this.y);
    }

    rotate(angle) {
        const x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
        const y = this.x * Math.sin(angle) + this.y * Math.cos(angle);
        this.x = x;
        this.y = y;
        return this;
    }
}